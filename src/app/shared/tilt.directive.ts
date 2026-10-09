import { Directive, DestroyRef, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap } from '../core/gsap-setup';
import { MotionService } from '../core/motion.service';

/**
 * 3D tilt + glare on hover.
 *
 * How it works:
 *  1. On pointermove we convert the cursor position into -0.5..0.5 offsets
 *     relative to the card centre.
 *  2. Those offsets map to rotateX/rotateY (max `tiltMax` degrees) and to the
 *     glare position; values are written as CSS custom properties
 *     (--rx, --ry, --gx, --gy) inside a single requestAnimationFrame, so we do
 *     at most one style write per frame regardless of event frequency.
 *  3. The `.tilt-card` CSS (styles.css) consumes those vars with
 *     `perspective` + `transform-style: preserve-3d`; children with
 *     `.tilt-layer` are pushed forward with translateZ for the depth effect.
 *  4. On pointerleave GSAP springs the vars back to 0 with an elastic ease.
 *
 * Disabled entirely on touch / low-power / reduced-motion (MotionService.hoverEffects).
 */
@Directive({ selector: '[appTilt]', host: { class: 'tilt-card' } })
export class TiltDirective {
  readonly tiltMax = input(10);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private frame = 0;
  private rect?: DOMRect;
  // Proxy object GSAP tweens on leave; written to CSS vars in onUpdate.
  private readonly state = { rx: 0, ry: 0, gx: 50, gy: 50 };

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!this.motion.hoverEffects()) return;
      // Listeners are attached outside Angular so pointermove never triggers change detection.
      zone.runOutsideAngular(() => {
        this.el.addEventListener('pointerenter', this.onEnter);
        this.el.addEventListener('pointermove', this.onMove);
        this.el.addEventListener('pointerleave', this.onLeave);
      });
      destroyRef.onDestroy(() => {
        this.el.removeEventListener('pointerenter', this.onEnter);
        this.el.removeEventListener('pointermove', this.onMove);
        this.el.removeEventListener('pointerleave', this.onLeave);
        cancelAnimationFrame(this.frame);
        gsap.killTweensOf(this.state);
      });
    });
  }

  private readonly onEnter = () => {
    // Measure once per hover rather than on every move (getBoundingClientRect forces layout).
    this.rect = this.el.getBoundingClientRect();
    gsap.killTweensOf(this.state);
    this.el.classList.add('is-tilting');
  };

  private readonly onMove = (e: PointerEvent) => {
    if (!this.rect) return;
    const px = (e.clientX - this.rect.left) / this.rect.width - 0.5;
    const py = (e.clientY - this.rect.top) / this.rect.height - 0.5;
    const max = this.tiltMax();
    // Moving the cursor down should tip the top edge away → negative rotateX.
    this.state.rx = -py * max * 2;
    this.state.ry = px * max * 2;
    this.state.gx = (px + 0.5) * 100;
    this.state.gy = (py + 0.5) * 100;

    if (!this.frame) {
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        this.apply();
      });
    }
  };

  private readonly onLeave = () => {
    this.el.classList.remove('is-tilting');
    gsap.to(this.state, {
      rx: 0,
      ry: 0,
      gx: 50,
      gy: 50,
      duration: 1.2,
      ease: 'elastic.out(1, 0.45)',
      onUpdate: () => this.apply(),
    });
  };

  private apply(): void {
    const s = this.el.style;
    s.setProperty('--rx', `${this.state.rx.toFixed(2)}deg`);
    s.setProperty('--ry', `${this.state.ry.toFixed(2)}deg`);
    s.setProperty('--gx', `${this.state.gx.toFixed(1)}%`);
    s.setProperty('--gy', `${this.state.gy.toFixed(1)}%`);
  }
}
