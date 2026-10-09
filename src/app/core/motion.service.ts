import { Injectable, computed, signal } from '@angular/core';

/**
 * Animation quality tiers:
 *  - 'full'   desktop with a fine pointer and decent hardware → every 3D/scroll effect.
 *  - 'lite'   phones/tablets/low-power devices → fewer particles, no mouse parallax,
 *             CSS 3D instead of WebGL for skills, no hover tilt.
 *  - 'static' prefers-reduced-motion or no WebGL → no canvases, opacity-only fades.
 */
export type MotionTier = 'full' | 'lite' | 'static';

/** Shared palette so CSS tokens and WebGL materials stay in sync. */
export const PALETTE = {
  bg: 0x07070c,
  accent: 0x6366f1,
  accent2: 0xa855f7,
  accentHex: '#6366f1',
  accent2Hex: '#a855f7',
};

@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly reducedMq = matchMedia('(prefers-reduced-motion: reduce)');
  private readonly coarseMq = matchMedia('(pointer: coarse)');
  private readonly narrowMq = matchMedia('(max-width: 767px)');

  readonly reducedMotion = signal(this.reducedMq.matches);
  readonly coarsePointer = signal(this.coarseMq.matches);
  readonly narrow = signal(this.narrowMq.matches);
  readonly webgl = signal(detectWebGL());
  readonly lowPower = signal(detectLowPower());

  readonly tier = computed<MotionTier>(() => {
    if (this.reducedMotion() || !this.webgl()) return 'static';
    if (this.coarsePointer() || this.narrow() || this.lowPower()) return 'lite';
    return 'full';
  });

  /** Hover-driven effects (tilt, parallax) only make sense with a mouse. */
  readonly hoverEffects = computed(() => this.tier() === 'full');

  constructor() {
    // React live to OS setting changes, rotation and window resizes.
    this.reducedMq.addEventListener('change', (e) => this.reducedMotion.set(e.matches));
    this.coarseMq.addEventListener('change', (e) => this.coarsePointer.set(e.matches));
    this.narrowMq.addEventListener('change', (e) => this.narrow.set(e.matches));
  }
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function detectLowPower(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  return cores <= 4 || memory <= 4 || !!nav.connection?.saveData;
}
