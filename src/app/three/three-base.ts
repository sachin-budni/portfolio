import {
  Clock,
  Material,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Points,
  Scene,
  Sprite,
  Texture,
  WebGLRenderer,
} from 'three';

export interface StageOptions {
  canvas: HTMLCanvasElement;
  /** Element whose size the canvas tracks and whose visibility pauses rendering. */
  container: HTMLElement;
  /** Upper bound for devicePixelRatio; lower on 'lite' devices to save fill-rate. */
  maxDpr: number;
  fov?: number;
  cameraZ?: number;
  /** Called every rendered frame. `t` = elapsed seconds, `dt` = clamped frame delta. */
  onFrame: (t: number, dt: number) => void;
}

/**
 * Shared renderer lifecycle for every WebGL scene on the page.
 *
 * Performance rules it enforces:
 *  - DPR is clamped (retina phones would otherwise render 9× the pixels).
 *  - The loop only runs while the canvas is on screen AND the tab is visible,
 *    so off-screen scenes cost zero GPU/CPU.
 *  - Adaptive quality: FPS is sampled every 2s; if it stays below 50 the
 *    pixel ratio is stepped down (to a floor of 1) to get back to 60.
 *  - dispose() frees every geometry, material, texture and the GL context.
 *
 * Must be constructed outside Angular's zone (callers use NgZone.runOutsideAngular)
 * so requestAnimationFrame doesn't trigger change detection 60×/second.
 */
export class ThreeStage {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;

  private readonly clock = new Clock();
  private readonly resizeObs: ResizeObserver;
  private readonly visObs: IntersectionObserver;
  private frameId = 0;
  private onScreen = false;
  private dpr: number;
  // FPS sampling for adaptive DPR.
  private sampleFrames = 0;
  private sampleStart = 0;

  constructor(private readonly opts: StageOptions) {
    this.dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr);

    this.renderer = new WebGLRenderer({
      canvas: opts.canvas,
      alpha: true, // transparent so the CSS dark background/gradients show through
      antialias: this.dpr < 1.5, // MSAA is redundant on high-DPR screens
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new PerspectiveCamera(opts.fov ?? 55, 1, 0.1, 100);
    this.camera.position.z = opts.cameraZ ?? 8;

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(opts.container);
    this.resize();

    // Pause when scrolled out of view.
    this.visObs = new IntersectionObserver(([entry]) => {
      this.onScreen = entry.isIntersecting;
      this.updateLoop();
    });
    this.visObs.observe(opts.container);

    document.addEventListener('visibilitychange', this.updateLoop);
  }

  private resize(): void {
    const { clientWidth: w, clientHeight: h } = this.opts.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Keep the scene framed on portrait screens by widening the FOV.
    this.camera.fov = (this.opts.fov ?? 55) * (w < h ? 1.35 : 1);
    this.camera.updateProjectionMatrix();
  }

  private readonly updateLoop = (): void => {
    const shouldRun = this.onScreen && document.visibilityState === 'visible';
    if (shouldRun && !this.frameId) {
      this.clock.getDelta(); // discard the paused gap so animations don't jump
      this.sampleStart = performance.now();
      this.sampleFrames = 0;
      this.frameId = requestAnimationFrame(this.tick);
    } else if (!shouldRun && this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
    }
  };

  private readonly tick = (): void => {
    this.frameId = requestAnimationFrame(this.tick);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.opts.onFrame(this.clock.elapsedTime, dt);
    this.renderer.render(this.scene, this.camera);
    this.adaptQuality();
  };

  private adaptQuality(): void {
    this.sampleFrames++;
    const now = performance.now();
    const elapsed = now - this.sampleStart;
    if (elapsed < 2000) return;
    const fps = (this.sampleFrames * 1000) / elapsed;
    if (fps < 50 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25);
      this.renderer.setPixelRatio(this.dpr);
      this.resize();
    }
    this.sampleStart = now;
    this.sampleFrames = 0;
  }

  get pixelRatio(): number {
    return this.dpr;
  }

  dispose(): void {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
    this.resizeObs.disconnect();
    this.visObs.disconnect();
    document.removeEventListener('visibilitychange', this.updateLoop);
    disposeObject(this.scene);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

/** Recursively frees GPU resources held by an object tree. */
export function disposeObject(root: Object3D): void {
  root.traverse((obj) => {
    if (obj instanceof Mesh || obj instanceof Points || obj instanceof Sprite) {
      obj.geometry?.dispose();
      const mats: Material[] = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of mats) {
        // Free any texture referenced by the material (map, emissiveMap, uniforms, ...).
        for (const value of Object.values(mat)) {
          if (value instanceof Texture) value.dispose();
        }
        mat.dispose();
      }
    }
  });
}

/** Soft radial-gradient texture used for additive "glow" sprites (cheap fake bloom). */
export function createGlowTexture(color: string, size = 128): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.35, color + '66');
  g.addColorStop(1, color + '00');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new Texture(canvas);
  tex.needsUpdate = true;
  return tex;
}
