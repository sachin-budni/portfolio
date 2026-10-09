import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  AdditiveBlending,
  AmbientLight,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Raycaster,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Vector2,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { gsap } from '../core/gsap-setup';
import { SkillCategory } from '../data/portfolio.data';
import { ThreeStage, createGlowTexture } from './three-base';

interface Label {
  sprite: Sprite;
  isTech: boolean;
  baseScale: Vector2;
  angle: number;
}

interface Tile {
  root: Group;
  box: Mesh;
  labels: Label[];
}

// Elliptical ring: wide in X so tiles spread across the section, shallow in Z so
// combined with the ring's X tilt, back tiles sit higher instead of behind front ones.
const RING_X = 4.4;
const RING_Z = 3;

/**
 * Skills as floating 3D tiles.
 *
 * Layout: one rounded glass tile per skill category travels round an elliptical
 * carousel orbit. Tiles keep their icon facing the
 * viewer, bobs on its own sine phase, and is orbited by sprite labels for the
 * individual technologies.
 *
 * Interaction: hovering a tile (raycast) scales it up and emits its index so
 * the matching DOM card can highlight. The All/Tech filter shrinks non-tech
 * labels away with a GSAP tween.
 */
@Component({
  selector: 'app-skills-orbit',
  template: `<canvas #canvas class="block h-full w-full" aria-hidden="true"></canvas>`,
  host: { class: 'block relative h-[380px] md:h-[480px]' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsOrbitComponent {
  readonly categories = input.required<SkillCategory[]>();
  readonly filter = input<'all' | 'tech'>('all');
  readonly hovered = output<number>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private tiles: Tile[] = [];

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const cleanup = this.zone.runOutsideAngular(() => this.build());
      destroyRef.onDestroy(cleanup);
    });

    // Re-run whenever the filter signal changes.
    effect(() => {
      const techOnly = this.filter() === 'tech';
      this.zone.runOutsideAngular(() => this.applyFilter(techOnly));
    });
  }

  private applyFilter(techOnly: boolean): void {
    for (const tile of this.tiles) {
      for (const label of tile.labels) {
        const show = !techOnly || label.isTech;
        gsap.to(label.sprite.scale, {
          x: show ? label.baseScale.x : 0,
          y: show ? label.baseScale.y : 0,
          duration: 0.6,
          ease: show ? 'back.out(2)' : 'power2.in',
        });
      }
    }
  }

  private build(): () => void {
    const ring = new Group();
    const raycaster = new Raycaster();
    const pointer = new Vector2(10, 10); // off-screen until the first move
    const tilt = { x: 0, y: 0 };
    let pointerDirty = false;
    let hoveredIdx = -1;
    let spin = 0; // carousel angle; tiles are placed on the ellipse from this each frame

    const stage = new ThreeStage({
      canvas: this.canvas().nativeElement,
      container: this.host,
      maxDpr: 2,
      cameraZ: 9,
      fov: 45,
      onFrame: (t, dt) => {
        const k = 1 - Math.pow(0.92, dt * 60);
        // Carousel spin, paused while the user is inspecting a tile.
        if (hoveredIdx < 0) spin += dt * 0.25;
        // Slight tilt of the whole ring towards the pointer.
        ring.rotation.x += (tilt.y * 0.15 + 0.38 - ring.rotation.x) * k; // base tilt lifts back tiles above front ones

        // Raycast only when the pointer actually moved (cheap idle frames).
        if (pointerDirty) {
          pointerDirty = false;
          raycaster.setFromCamera(pointer, stage.camera);
          const hit = raycaster.intersectObjects(this.tiles.map((x) => x.box), false)[0];
          const idx = hit ? this.tiles.findIndex((x) => x.box === hit.object) : -1;
          if (idx !== hoveredIdx) {
            hoveredIdx = idx;
            this.host.style.cursor = idx >= 0 ? 'pointer' : '';
            // Re-enter Angular only for this rare event so the DOM card can react.
            this.zone.run(() => this.hovered.emit(idx));
          }
        }

        this.tiles.forEach((tile, i) => {
          const { root, labels } = tile;
          // Counter-rotate so the icon face always looks at the camera, plus a gentle wobble.
          const a = spin + (i / this.tiles.length) * Math.PI * 2;
          root.position.x = Math.sin(a) * RING_X;
          root.position.z = Math.cos(a) * RING_Z;
          root.rotation.y = Math.sin(t * 0.6 + i) * 0.35; // face the viewer, with a gentle wobble
          root.position.y = Math.sin(t * 0.9 + i * 1.7) * 0.25; // float/bob
          const target = i === hoveredIdx ? 1.25 : 1;
          root.scale.setScalar(root.scale.x + (target - root.scale.x) * k);

          // Labels orbit the tile on a tilted ellipse.
          labels.forEach((label, j) => {
            const a = label.angle + t * 0.5;
            label.sprite.position.set(Math.cos(a) * 1.55, Math.sin(a * 1.3 + j) * 0.5 - 0.15, Math.sin(a) * 0.9);
          });
        });
      },
    });

    // Lighting: a key light plus ambient; tile colour comes mostly from emissive glow.
    const key = new DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 4, 6);
    stage.scene.add(new AmbientLight(0xffffff, 0.35), key, ring);

    const boxGeo = new RoundedBoxGeometry(1.7, 1.7, 0.32, 4, 0.22);
    const faceGeo = new PlaneGeometry(1.05, 1.05);

    this.tiles = this.categories().map((cat, i) => {
      const angle = (i / this.categories().length) * Math.PI * 2;
      const root = new Group();
      root.position.set(Math.sin(angle) * RING_X, 0, Math.cos(angle) * RING_Z);

      const box = new Mesh(
        boxGeo,
        new MeshStandardMaterial({
          color: 0x14142a,
          emissive: new Color(cat.color),
          emissiveIntensity: 0.25,
          metalness: 0.5,
          roughness: 0.3,
        }),
      );

      // Icon face — texture filled asynchronously once the SVG is rasterised.
      const faceMat = new MeshBasicMaterial({ transparent: true, opacity: 0 });
      const face = new Mesh(faceGeo, faceMat);
      face.position.z = 0.17;
      loadIconTexture(cat.icon, cat.color).then((tex) => {
        faceMat.map = tex;
        faceMat.needsUpdate = true;
        gsap.to(faceMat, { opacity: 1, duration: 0.6 });
      });

      // Coloured additive halo behind each tile.
      const glow = new Sprite(
        new SpriteMaterial({
          map: createGlowTexture(cat.color),
          blending: AdditiveBlending,
          transparent: true,
          depthWrite: false,
          opacity: 0.5,
        }),
      );
      glow.scale.setScalar(4);
      glow.position.z = -0.3;

      const labels: Label[] = cat.skills.map((skill, j) => {
        const { texture, aspect } = createLabelTexture(skill.name, cat.color);
        const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
        const baseScale = new Vector2(0.32 * aspect, 0.32);
        sprite.scale.set(baseScale.x, baseScale.y, 1);
        root.add(sprite);
        return { sprite, isTech: skill.isTech, baseScale, angle: (j / cat.skills.length) * Math.PI * 2 };
      });

      root.add(glow, box, face);
      ring.add(root);
      return { root, box, labels };
    });

    // Apply the initial filter state without animating from zero.
    if (this.filter() === 'tech') this.applyFilter(true);

    const onMove = (e: PointerEvent) => {
      const r = this.host.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      tilt.x = pointer.x;
      tilt.y = pointer.y;
      pointerDirty = true;
    };
    const onLeave = () => {
      pointer.set(10, 10);
      tilt.x = tilt.y = 0;
      pointerDirty = true;
    };
    this.host.addEventListener('pointermove', onMove);
    this.host.addEventListener('pointerleave', onLeave);

    return () => {
      this.host.removeEventListener('pointermove', onMove);
      this.host.removeEventListener('pointerleave', onLeave);
      for (const tile of this.tiles) for (const l of tile.labels) gsap.killTweensOf(l.sprite.scale);
      this.tiles = [];
      stage.dispose();
    };
  }
}

/**
 * The icons in /public use stroke="currentColor", which renders black as an image.
 * Fetch the markup, recolour it white, rasterise it onto a canvas with a coloured
 * glow (canvas shadowBlur), and return that as a texture.
 */
async function loadIconTexture(file: string, color: string): Promise<CanvasTexture> {
  const svg = (await (await fetch(file)).text()).replace(/currentColor/g, '#ffffff');
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.drawImage(img, 32, 32, size - 64, size - 64);
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Pill-shaped text label rendered to a canvas (sprites always face the camera). */
function createLabelTexture(text: string, color: string): { texture: CanvasTexture; aspect: number } {
  const font = '600 40px Inter, system-ui, sans-serif';
  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = font;
  const padX = 28;
  const w = Math.ceil(measure.measureText(text).width) + padX * 2;
  const h = 72;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(12, 12, 24, 0.85)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, (h - 4) / 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = font;
  ctx.fillStyle = '#e2e8f0';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, padX, h / 2 + 2);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return { texture, aspect: w / h };
}
