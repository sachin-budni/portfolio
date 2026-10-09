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
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  Points,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  AmbientLight,
} from 'three';
import { PALETTE } from '../core/motion.service';
import { ScrollTrigger } from '../core/gsap-setup';
import { ThreeStage, createGlowTexture } from './three-base';

// Particles are displaced in the vertex shader (GPU), so the CPU never touches
// the position buffer after upload — this is what keeps thousands of points at 60 FPS.
const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aScale;
  attribute float aPhase;
  varying float vDepth;

  void main() {
    vec3 p = position;
    // Each particle drifts on its own phase-shifted sine path.
    p.x += cos(uTime * 0.30 + aPhase) * 0.18;
    p.y += sin(uTime * 0.40 + aPhase) * 0.28;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // Size attenuation: farther particles render smaller.
    gl_PointSize = uSize * aScale * uPixelRatio / -mv.z;
    vDepth = clamp((-mv.z - 3.0) / 14.0, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vDepth;

  void main() {
    // Round, soft-edged point: distance from the sprite centre → alpha falloff.
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    // Near particles are indigo, far ones shift to violet and fade.
    vec3 col = mix(uColorA, uColorB, vDepth);
    gl_FragColor = vec4(col, a * (1.0 - vDepth * 0.65));
  }
`;

/**
 * Hero background: a drifting particle nebula around a glowing wireframe
 * icosahedron. On 'full' tier the whole scene eases towards the mouse
 * (parallax); on 'lite' it auto-drifts. Scrolling past the hero pushes the
 * core back and fades it so the transition into the next section feels deep.
 *
 * Loaded via @defer, so three.js is only downloaded when this is needed.
 */
@Component({
  selector: 'app-hero-scene',
  template: `<canvas #canvas class="block h-full w-full" aria-hidden="true"></canvas>`,
  host: { class: 'block absolute inset-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSceneComponent {
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
    const count = lite ? 1200 : 4000;

    // Mouse target (-1..1) and the eased value we actually render with.
    const mouse = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    let scroll = 0;

    const group = new Group();
    const core = new Group();

    const stage = new ThreeStage({
      canvas: this.canvas().nativeElement,
      container: this.host,
      maxDpr: lite ? 1.25 : 2,
      cameraZ: 9,
      onFrame: (t, dt) => {
        // Frame-rate-independent lerp: ~5% per frame at 60 FPS.
        const k = 1 - Math.pow(0.95, dt * 60);
        if (lite) {
          // No pointer on touch devices → gentle autonomous sway.
          mouse.x = Math.sin(t * 0.25) * 0.5;
          mouse.y = Math.cos(t * 0.2) * 0.3;
        }
        eased.x += (mouse.x - eased.x) * k;
        eased.y += (mouse.y - eased.y) * k;

        uniforms.uTime.value = t;
        uniforms.uPixelRatio.value = stage.pixelRatio; // follows adaptive DPR changes
        group.rotation.y = t * 0.03 + eased.x * 0.35;
        group.rotation.x = eased.y * 0.2;

        // Self-spin plus a share of the mouse parallax so it still reacts to the pointer.
        core.rotation.x = t * 0.15 + eased.y * 0.3;
        core.rotation.y = t * 0.2 + eased.x * 0.5;
        // Composition: on wide screens the core sits right of the left-aligned text;
        // on portrait screens it's centred but pushed back so it doesn't fight the copy.
        const wide = stage.camera.aspect > 1.2;
        core.position.x = wide ? 3.2 : 0;
        core.position.y = wide ? 0 : 1.5;
        // Scroll: push the core away and shrink it as the hero leaves the screen.
        core.position.z = (wide ? 0 : -3) - scroll * 4;
        core.scale.setScalar(1 + Math.sin(t * 1.2) * 0.03 - scroll * 0.3);

        stage.camera.position.x = eased.x * 0.8;
        stage.camera.position.y = -eased.y * 0.5;
        stage.camera.lookAt(0, 0, 0);
      },
    });

    // --- Particle field -----------------------------------------------------
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Random point in a thick spherical shell (radius 3–14) so the centre stays clear for the core.
      const r = 3 + Math.pow(Math.random(), 0.7) * 11;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6; // flatten vertically
      positions[i * 3 + 2] = r * Math.cos(phi);
      scales[i] = 0.4 + Math.random();
      phases[i] = Math.random() * Math.PI * 2;
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new BufferAttribute(scales, 1));
    geo.setAttribute('aPhase', new BufferAttribute(phases, 1));

    const uniforms = {
      uTime: { value: 0 },
      uSize: { value: lite ? 70 : 60 },
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
        depthWrite: false, // overlapping additive points shouldn't occlude each other
        blending: AdditiveBlending, // overlapping points add up → natural glow
      }),
    );
    group.add(particles);

    // --- Glowing core -------------------------------------------------------
    const solid = new Mesh(
      new IcosahedronGeometry(1.5, 0),
      new MeshStandardMaterial({
        color: 0x1a1a3a,
        emissive: PALETTE.accent,
        emissiveIntensity: 0.12, // low so the point lights can shade each facet
        metalness: 0.6,
        roughness: 0.25,
        flatShading: true,
      }),
    );
    const wire = new Mesh(
      new IcosahedronGeometry(2.1, 1),
      new MeshBasicMaterial({ color: PALETTE.accent2, wireframe: true, transparent: true, opacity: 0.35 }),
    );
    // Additive radial sprite behind the core = soft bloom without a post-processing pass.
    const halo = new Sprite(
      new SpriteMaterial({
        map: createGlowTexture(PALETTE.accentHex),
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.55,
      }),
    );
    halo.scale.setScalar(9);
    core.add(halo, solid, wire);
    // The core is NOT a child of the rotating particle group, so its screen offset
    // (set per frame below) stays put instead of orbiting with the particles.

    // Coloured point lights give the faceted core indigo/violet rim highlights.
    const lightA = new PointLight(PALETTE.accent, 120, 25);
    lightA.position.set(6, 3, 4);
    const lightB = new PointLight(PALETTE.accent2, 90, 25);
    lightB.position.set(-4, -2, 3);
    stage.scene.add(group, core, lightA, lightB, new AmbientLight(0xffffff, 0.15));

    // --- Input --------------------------------------------------------------
    const onPointer = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!lite) window.addEventListener('pointermove', onPointer, { passive: true });

    // Scroll progress of the hero (0 at top → 1 when it has scrolled away), fed to onFrame.
    const st = ScrollTrigger.create({
      trigger: this.host,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => (scroll = self.progress),
    });

    return () => {
      window.removeEventListener('pointermove', onPointer);
      st.kill();
      stage.dispose();
    };
  }
}
