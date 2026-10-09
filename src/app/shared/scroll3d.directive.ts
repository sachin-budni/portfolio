import { Directive, DestroyRef, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap } from '../core/gsap-setup';
import { MotionService } from '../core/motion.service';

export type Scroll3dMode = 'tilt' | 'swing' | 'rise' | 'depth';

/**
 * Continuous, scroll-*scrubbed* 3D motion: unlike appReveal (which plays once), the
 * element's rotation is tied to its scroll position, so it keeps moving in 3D for as
 * long as it is on screen and reverses when you scroll back.
 *
 *  - tilt:  rotateX +22° → −22° while crossing the viewport (a "page turning" feel)
 *  - swing: rotateY −20° → +20° (the element pivots like it's on a turntable)
 *  - rise:  starts tipped 60° back and 350px deep, stands upright by 35% from the top
 *  - depth: pushed 500px back and shrunk, comes forward to rest at the viewport centre
 *
 * `scrub: 0.6` adds 0.6s of smoothing so wheel steps become fluid motion.
 *
 * Measuring: ScrollTrigger reads positions from getBoundingClientRect, which
 * includes transforms. 'rise' and 'depth' start heavily transformed (the box is
 * hundreds of px off its layout position), so for those modes the *parent*
 * element is the trigger. Wrap the element in an untransformed container and
 * put any appReveal on that wrapper, not on the transformed element itself.
 * Disabled on the 'static' tier (reduced motion).
 */
@Directive({ selector: '[appScroll3d]' })
export class Scroll3dDirective {
  readonly appScroll3d = input<Scroll3dMode | ''>('tilt');
  /** Multiplier on the default angles/depths. */
  readonly scroll3dAmount = input(1);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    const zone = inject(NgZone);
    let ctx: gsap.Context | undefined;

    afterNextRender(() =>
      zone.runOutsideAngular(() => {
        if (motion.tier() === 'static') return;
        const a = this.scroll3dAmount();
        const base = { transformPerspective: 1100, ease: 'none' };
        const across = { trigger: host, start: 'top bottom', end: 'bottom top', scrub: 0.6 };
        const layout = host.parentElement ?? host; // untransformed box, see note above

        ctx = gsap.context(() => {
          switch (this.appScroll3d() || 'tilt') {
            case 'tilt':
              gsap.fromTo(host, { ...base, rotateX: 22 * a }, { rotateX: -22 * a, ease: 'none', scrollTrigger: across });
              break;
            case 'swing':
              gsap.fromTo(host, { ...base, rotateY: -20 * a }, { rotateY: 20 * a, ease: 'none', scrollTrigger: across });
              break;
            case 'rise':
              gsap.fromTo(
                host,
                { ...base, rotateX: 60 * a, z: -350 * a, transformOrigin: '50% 100%' },
                { rotateX: 0, z: 0, ease: 'none', scrollTrigger: { trigger: layout, start: 'top bottom', end: 'top 35%', scrub: 0.6 } },
              );
              break;
            case 'depth':
              gsap.fromTo(
                host,
                { ...base, z: -500 * a, scale: 0.85 },
                { z: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: layout, start: 'top bottom', end: 'center center', scrub: 0.6 } },
              );
              break;
          }
        }, host);
      }),
    );
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
