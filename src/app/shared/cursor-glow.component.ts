import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';
import { gsap } from '../core/gsap-setup';

/**
 * A large soft spotlight that trails the cursor behind the content, lighting up
 * the particle world and glass cards as you move. gsap.quickTo reuses a single
 * tween per axis, so 100+ pointer events/second cost almost nothing.
 * Only rendered on the 'full' tier (the parent checks MotionService.hoverEffects).
 */
@Component({
  selector: 'app-cursor-glow',
  template: '',
  host: { class: 'cursor-glow', 'aria-hidden': 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursorGlowComponent {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    let onMove: ((e: PointerEvent) => void) | undefined;

    afterNextRender(() =>
      zone.runOutsideAngular(() => {
        gsap.set(el, { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 3 });
        const toX = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' });
        const toY = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' });
        onMove = (e) => {
          toX(e.clientX);
          toY(e.clientY);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
      }),
    );
    inject(DestroyRef).onDestroy(() => {
      if (onMove) window.removeEventListener('pointermove', onMove);
      gsap.killTweensOf(el);
    });
  }
}
