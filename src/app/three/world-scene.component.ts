import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  OctahedronGeometry,
  PointLight,
  Points,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
} from 'three';
import { ScrollTrigger, gsap } from '../core/gsap-setup';
import { PALETTE } from '../core/motion.service';
import { ThreeStage, createGlowTexture } from './three-base';

/** Section ids in page order; section i (1-based) morphs the particles into shape i. */
const SECTIONS = ['about', 'experience', 'skills', 'projects', 'contact'];

/*
  Morphing particle shader.

  Every particle stores SIX target positions — one per page section:
    0 position  sphere shell  (hero)
    1 aS1       double helix  (about)
    2 aS2       warp tunnel   (experience) — streams towards the camera
    3 aS3       torus knot    (skills)
    4 aS4       wave grid     (projects)
    5 aS5       spiral galaxy (contact)

  `uShape` is a float in [0, 5] driven by scroll. Its integer part picks the
  "from" shape and the fractional part is the morph amount to the next one.
  Two tricks make the morph feel explosive rather than a plain cross-fade:
    - per-particle stagger: each particle starts its trip at a different time (aRand);
    - mid-flight burst: particles are pushed outward by sin(m·π), so the swarm
      blows apart and re-forms into the next shape.
  All of it runs on the GPU — the CPU only updates a handful of uniforms per frame.
*/
const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uShape;
  uniform float uOpacity;
  attribute vec3 aS1;
  attribute vec3 aS2;
  attribute vec3 aS3;
  attribute vec3 aS4;
  attribute vec3 aS5;
  attribute float aScale;
  attribute float aPhase;
  attribute float aRand;
  varying float vDepth;
  varying float vAlpha;

  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
  vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }

  // Each shape also has its own idle motion so no section ever looks static.
  vec3 shape(float i) {
    if (i < 0.5) return position;
    if (i < 1.5) return rotY(aS1, uTime * 0.35);                         // helix spins
    if (i < 2.5) {                                                        // tunnel streams at the camera (warp speed)
      vec3 p = aS2;
      p.z = mod(p.z + 24.0 + uTime * 6.0, 34.0) - 24.0;
      return p;
    }
    if (i < 3.5) return rotX(rotY(aS3, uTime * 0.25), 0.4);               // knot tumbles
    if (i < 4.5) {                                                        // grid ripples
      vec3 p = aS4;
      p.y += sin(p.x * 0.45 + uTime * 1.3) * 0.8 + cos(p.z * 0.4 + uTime) * 0.8;
      return p;
    }
    // galaxy: differential rotation, inner arms orbit faster
    return rotX(rotY(aS5, uTime * 0.35 / (1.0 + length(aS5.xz) * 0.15)), 0.55);
  }

  void main() {
    float base = floor(uShape);
    float f = uShape - base;
    float m = smoothstep(0.0, 1.0, clamp(f * 1.6 - aRand * 0.6, 0.0, 1.0));
    vec3 p = mix(shape(base), shape(min(base + 1.0, 5.0)), m);

    // Explosive mid-morph burst.
    p += normalize(p + 0.0001) * sin(m * 3.14159) * (2.5 + aRand * 4.0);

    // Per-particle shimmer.
    p.x += cos(uTime * 0.3 + aPhase) * 0.15;
    p.y += sin(uTime * 0.4 + aPhase) * 0.2;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Size attenuation, capped so tunnel particles rushing past the lens don't become huge quads.
    gl_PointSize = min(uSize * aScale * uPixelRatio / max(-mv.z, 0.1), 48.0 * uPixelRatio);
    vDepth = clamp((-mv.z - 3.0) / 18.0, 0.0, 1.0);
    // Fade particles that are about to hit the lens.
    vAlpha = uOpacity * smoothstep(0.3, 2.0, -mv.z);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vDepth;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    vec3 col = mix(uColorA, uColorB, vDepth);
    // Hot white centre on near particles for a sparkle.
    col = mix(col, vec3(1.0), smoothstep(0.15, 0.0, d) * (1.0 - vDepth) * 0.6);
    gl_FragColor = vec4(col, a * vAlpha * (1.0 - vDepth * 0.6));
  }
`;

/**
 * One fixed, full-viewport WebGL world behind the whole page.
 *
 *  - Particles morph shape per section as you scroll (see shader notes above).
 *  - Hero: a glowing faceted core with orbiting rings. As you scroll it flies
 *    *towards and through* the camera, then fades out.
 *  - Floating crystal shards (InstancedMesh = a single draw call) drift at
 *    different depths, move with scroll at speeds set by their depth, and
 *    scatter away from the mouse cursor.
 *  - The camera eases toward the pointer for strong parallax.
 *
 * 'lite' tier: fewer particles, no shards, no pointer input (auto-sway instead).
 */
@Component({
  selector: 'app-world-scene',
  template: `<canvas #canvas class="block h-full w-full" aria-hidden="true"></canvas>`,
  host: { class: 'pointer-events-none fixed inset-0 z-0 block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldSceneComponent {
  readonly tier = input<'full' | 'lite'>('full');

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const cleanup = zone.runOutsideAngular(() => this.build());
      destroyRef.onDestroy(cleanup);
    });
  }

  private build(): () => void {
    const lite = this.tier() === 'lite';
    const count = lite ? 1800 : 5000;
    const shardCount = lite ? 0 : 70;

    const mouse = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    // Per-section morph progress (0..1 each); their sum is the target shape index.
    const sectionProgress = SECTIONS.map(() => 0);
    let shape = 0;

    const world = new Group(); // particles
    const core = new Group(); // hero centrepiece
    const shards = new Group();

    const stage = new ThreeStage({
      canvas: this.canvas().nativeElement,
      container: this.host,
      maxDpr: lite ? 1.25 : 1.75,
      minDpr: 0.5, // full-screen additive glow is fill-rate bound; drop resolution before frames
      cameraZ: 9,
      onFrame: (t, dt) => {
        const k = 1 - Math.pow(0.94, dt * 60);
        if (lite) {
          mouse.x = Math.sin(t * 0.25) * 0.6;
          mouse.y = Math.cos(t * 0.2) * 0.4;
        }
        eased.x += (mouse.x - eased.x) * k;
        eased.y += (mouse.y - eased.y) * k;

        // Inertia on the morph: shape glides toward the scroll-driven target.
        const target = sectionProgress.reduce((a, b) => a + b, 0);
        shape += (target - shape) * (1 - Math.pow(0.93, dt * 60));

        uniforms.uTime.value = t;
        uniforms.uShape.value = shape;
        uniforms.uPixelRatio.value = stage.pixelRatio;
        // Full brightness in the hero, dimmed behind text-heavy sections.
        uniforms.uOpacity.value = 1 - Math.min(shape, 1) * 0.4;

        world.rotation.y = Math.sin(t * 0.05) * 0.3 + eased.x * 0.5;
        world.rotation.x = eased.y * 0.25;

        // --- Core: spins, pulses, then flies through the camera on scroll ---
        const out = Math.min(shape, 1); // 0 in hero → 1 once About is reached
        const wide = stage.camera.aspect > 1.2;
        core.visible = out < 0.98;
        core.position.x = (wide ? 3.4 : 0) * (1 - out);
        core.position.y = wide ? 0 : 1.6;
        core.position.z = (wide ? 0 : -3) + out * out * 11; // ease-in toward (and past) the lens
        core.rotation.x = t * 0.25 + eased.y * 0.6;
        core.rotation.y = t * 0.35 + eased.x * 0.9;
        core.scale.setScalar(1 + Math.sin(t * 1.6) * 0.05 + out * 0.6);
        for (const m of coreMaterials) m.opacity = (m.userData['baseOpacity'] as number) * (1 - out);
        ringA.rotation.set(t * 0.6, t * 0.4, 0);
        ringB.rotation.set(-t * 0.5, 0, t * 0.7);
        ringC.rotation.set(Math.PI / 2 + Math.sin(t) * 0.3, t * 0.9, 0);

        // --- Shards: drift, scroll parallax, mouse repulsion ---
        if (shardCount) {
          const halfH = Math.tan((stage.camera.fov * Math.PI) / 360) * stage.camera.position.z;
          const mx = mouse.x * halfH * stage.camera.aspect;
          const my = -mouse.y * halfH;
          const scroll = window.scrollY;
          for (let i = 0; i < shardCount; i++) {
            const s = shardData[i];
            // Nearer shards (higher z) move faster with scroll → depth parallax. Wrap vertically.
            let y = s.y + scroll * 0.004 * (1 + (s.z + 10) * 0.12) + Math.sin(t * s.speed + s.phase) * 0.4;
            y = ((((y + 9) % 18) + 18) % 18) - 9;
            const x = s.x + Math.cos(t * s.speed * 0.7 + s.phase) * 0.4;
            // Repel: push away from the cursor inside a 3.5 unit radius, smoothed.
            const dx = x - mx;
            const dy = y - my;
            const dist = Math.hypot(dx, dy) || 1;
            const push = Math.max(0, 3.5 - dist) / 3.5;
            s.ox += ((dx / dist) * push * 3 - s.ox) * k;
            s.oy += ((dy / dist) * push * 3 - s.oy) * k;
            s.rot += dt * s.speed * (1 + push * 6); // spin faster when disturbed
            dummy.position.set(x + s.ox, y + s.oy, s.z);
            dummy.rotation.set(s.rot, s.rot * 0.7, 0);
            dummy.scale.setScalar(s.size);
            dummy.updateMatrix();
            shardMesh.setMatrixAt(i, dummy.matrix);
          }
          shardMesh.instanceMatrix.needsUpdate = true;
        }

        // Camera parallax, exaggerated.
        stage.camera.position.x = eased.x * 1.6;
        stage.camera.position.y = -eased.y * 1.0;
        stage.camera.lookAt(0, 0, -2);
      },
    });

    // ---------------------------------------------------------------- particles
    const shapes = buildShapes(count);
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(shapes[0], 3));
    for (let s = 1; s <= 5; s++) geo.setAttribute(`aS${s}`, new BufferAttribute(shapes[s], 3));
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    const rands = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      scales[i] = 0.4 + Math.random() * 1.1;
      phases[i] = Math.random() * Math.PI * 2;
      rands[i] = Math.random();
    }
    geo.setAttribute('aScale', new BufferAttribute(scales, 1));
    geo.setAttribute('aPhase', new BufferAttribute(phases, 1));
    geo.setAttribute('aRand', new BufferAttribute(rands, 1));

    const uniforms = {
      uTime: { value: 0 },
      uShape: { value: 0 },
      uOpacity: { value: 1 },
      uSize: { value: lite ? 80 : 70 },
      uPixelRatio: { value: stage.pixelRatio },
      uColorA: { value: new Color(PALETTE.accent) },
      uColorB: { value: new Color(PALETTE.accent2) },
    };
    const particles = new Points(
      geo,
      new ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
    // Shapes extend far beyond the bounding sphere computed from `position`.
    particles.frustumCulled = false;
    world.add(particles);

    // -------------------------------------------------------------------- core
    const coreMaterials: Material[] = [];
    const track = <T extends Material>(m: T, opacity: number): T => {
      m.transparent = true;
      m.opacity = opacity;
      m.userData['baseOpacity'] = opacity;
      coreMaterials.push(m);
      return m;
    };
    const solid = new Mesh(
      new IcosahedronGeometry(1.5, 0),
      track(
        new MeshStandardMaterial({
          color: 0x1a1a3a,
          emissive: PALETTE.accent,
          emissiveIntensity: 0.15,
          metalness: 0.7,
          roughness: 0.2,
          flatShading: true,
        }),
        1,
      ),
    );
    const wire = new Mesh(new IcosahedronGeometry(2.1, 1), track(new MeshBasicMaterial({ color: PALETTE.accent2, wireframe: true }), 0.4));
    const halo = new Sprite(
      track(new SpriteMaterial({ map: createGlowTexture(PALETTE.accentHex), blending: AdditiveBlending, depthWrite: false }), 0.6),
    );
    halo.scale.setScalar(7);
    // Three glowing gyroscope rings spinning on different axes.
    const ringMat = (color: number, o: number) =>
      track(new MeshBasicMaterial({ color, blending: AdditiveBlending, depthWrite: false }), o);
    const ringA = new Mesh(new TorusGeometry(2.9, 0.025, 8, 160), ringMat(PALETTE.accent, 0.9));
    const ringB = new Mesh(new TorusGeometry(3.4, 0.018, 8, 160), ringMat(PALETTE.accent2, 0.7));
    const ringC = new Mesh(new TorusGeometry(3.9, 0.012, 8, 160), ringMat(0xffffff, 0.35));
    core.add(halo, solid, wire, ringA, ringB, ringC);

    // ------------------------------------------------------------------ shards
    const dummy = new Object3D();
    const shardMesh = new InstancedMesh(
      new OctahedronGeometry(0.22, 0),
      new MeshStandardMaterial({
        color: 0x6d6df0,
        emissive: PALETTE.accent2,
        emissiveIntensity: 0.12, // low so the lights can pick out each facet
        // Low metalness: without an environment map, metal has nothing to reflect and looks flat.
        metalness: 0.25,
        roughness: 0.35,
        flatShading: true,
      }),
      Math.max(shardCount, 1),
    );
    shardMesh.count = shardCount;
    shardMesh.frustumCulled = false;
    const shardData = Array.from({ length: shardCount }, () => ({
      x: (Math.random() - 0.5) * 26,
      y: (Math.random() - 0.5) * 18,
      z: -10 + Math.random() * 13,
      size: 0.5 + Math.random() * 1.8,
      speed: 0.3 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI,
      ox: 0,
      oy: 0,
    }));
    shards.add(shardMesh);

    const lightA = new PointLight(PALETTE.accent, 140, 30);
    lightA.position.set(6, 3, 5);
    const lightB = new PointLight(PALETTE.accent2, 110, 30);
    lightB.position.set(-6, -3, 4);
    // Directional key light (no falloff) so shards anywhere on screen get bright/dark facets.
    const key = new DirectionalLight(0xe0e0ff, 1.6);
    key.position.set(-3, 5, 6);
    stage.scene.add(world, core, shards, lightA, lightB, key, new AmbientLight(0xffffff, 0.15));

    // -------------------------------------------------------------- scroll/input
    // Each section contributes 0→1 as its top travels from 90% to 35% of the viewport.
    const triggers = SECTIONS.map((id, i) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const set = (self: ScrollTrigger) => (sectionProgress[i] = self.progress);
      return ScrollTrigger.create({ trigger: el, start: 'top 90%', end: 'top 35%', onUpdate: set, onRefresh: set });
    });

    const onPointer = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!lite) window.addEventListener('pointermove', onPointer, { passive: true });

    // The world "materialises" instead of popping in once shaders are compiled.
    const canvasEl = this.canvas().nativeElement;
    gsap.fromTo(canvasEl, { opacity: 0 }, { opacity: 1, duration: 2, ease: 'power2.inOut', delay: 0.1 });

    return () => {
      gsap.killTweensOf(canvasEl);
      window.removeEventListener('pointermove', onPointer);
      triggers.forEach((st) => st?.kill());
      stage.dispose();
    };
  }
}

/** Builds the six target point clouds (sphere, helix, tunnel, knot, grid, galaxy). */
function buildShapes(n: number): Float32Array[] {
  const out = Array.from({ length: 6 }, () => new Float32Array(n * 3));
  const jitter = (s: number) => (Math.random() - 0.5) * s;
  const gridSide = Math.ceil(Math.sqrt(n));

  for (let i = 0; i < n; i++) {
    const t = i / n;
    const o = i * 3;
    const set = (arr: Float32Array, x: number, y: number, z: number) => {
      arr[o] = x;
      arr[o + 1] = y;
      arr[o + 2] = z;
    };

    // 0 — thick spherical shell, flattened, centre left clear for the core.
    {
      const r = 3 + Math.pow(Math.random(), 0.7) * 11;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      set(out[0], r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.6, r * Math.cos(ph));
    }
    // 1 — double helix (DNA) with rungs: every 8th particle sits on a rung between strands.
    {
      const strand = i % 2;
      const a = t * Math.PI * 12 + strand * Math.PI;
      const y = (t - 0.5) * 16;
      if (i % 8 === 0) {
        const u = Math.random() * 2 - 1;
        set(out[1], Math.cos(a) * 2.6 * u, y, Math.sin(a) * 2.6 * u);
      } else {
        set(out[1], Math.cos(a) * 2.6 + jitter(0.5), y + jitter(0.3), Math.sin(a) * 2.6 + jitter(0.5));
      }
    }
    // 2 — tunnel along Z around the camera (radius 4.5–7), spanning z ∈ [-24, 10].
    {
      const a = Math.random() * Math.PI * 2;
      const r = 4.5 + Math.random() * 2.5;
      set(out[2], Math.cos(a) * r, Math.sin(a) * r, -24 + Math.random() * 34);
    }
    // 3 — (2,3) torus knot.
    {
      const p = t * Math.PI * 2;
      const r = Math.cos(3 * p) + 2.2;
      set(out[3], r * Math.cos(2 * p) * 2.1 + jitter(0.5), r * Math.sin(2 * p) * 2.1 + jitter(0.5), -Math.sin(3 * p) * 2.1 + jitter(0.5));
    }
    // 4 — flat grid below eye level (the shader adds the waves).
    {
      const gx = i % gridSide;
      const gz = Math.floor(i / gridSide);
      set(out[4], (gx / gridSide - 0.5) * 30, -3, (gz / gridSide) * -22 + 6);
    }
    // 5 — three-armed spiral galaxy.
    {
      const r = Math.pow(Math.random(), 0.6) * 10;
      const arm = (i % 3) * ((Math.PI * 2) / 3);
      const a = r * 0.7 + arm + jitter(0.6);
      set(out[5], Math.cos(a) * r + jitter(0.6), jitter(0.6) * (1 - r / 12), Math.sin(a) * r + jitter(0.6));
    }
  }
  return out;
}
