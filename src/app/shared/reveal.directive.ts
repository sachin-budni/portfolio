import { Directive, DestroyRef, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap } from '../core/gsap-setup';
import { MotionService } from '../core/motion.service';

export type RevealVariant = 'fade-up' | 'slide-left' | 'slide-right' | 'rotate' | 'scale';

/** Starting state for each variant; GSAP tweens *from* these to the element's natural state. */
const FROM: Record<RevealVariant, gsap.TweenVars> = {
  'fade-up': { y: 60 },
  'slide-left': { x: -80 },
  'slide-right': { x: 80 },
  // rotateY needs a perspective on the parent (see `.perspective` in styles.css) to read as 3D.
  rotate: { rotateY: -35, rotateX: 10, z: -120, transformOrigin: '50% 50% -100px' },
  scale: { scale: 0.85 },
};

/**
 * Scroll-triggered entrance animation.
 *
 * Usage:  <div appReveal="slide-left" [revealDelay]="0.2">
 *         Children marked with `data-reveal-child` animate in sequence (staggered)
 *         instead of the host animating as one block.
 *
 * The animation plays once when the element's top crosses 85% of the viewport.
 * Under reduced motion it becomes a short opacity fade with no movement.
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  readonly appReveal = input<RevealVariant | ''>('fade-up');
  readonly revealDelay = input(0);
  readonly revealStagger = input(0.12);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(MotionService);
  private ctx?: gsap.Context;

  constructor() {
    const zone = inject(NgZone);
    afterNextRender(() => zone.runOutsideAngular(() => this.init()));
    inject(DestroyRef).onDestroy(() => this.ctx?.revert());
  }

  private init(): void {
    const children = this.host.querySelectorAll<HTMLElement>('[data-reveal-child]');
    const targets = children.length ? Array.from(children) : [this.host];
    const reduced = this.motion.tier() === 'static';
    const variant = this.appReveal() || 'fade-up';

    // gsap.context scopes every tween/trigger so a single revert() cleans them all up.
    this.ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        ...(reduced ? {} : FROM[variant]),
        duration: reduced ? 0.4 : 1,
        delay: this.revealDelay(),
        stagger: reduced ? 0 : this.revealStagger(),
        // Clear transforms afterwards so CSS hover effects (e.g. tilt) aren't fighting inline styles.
        clearProps: 'transform',
        scrollTrigger: {
          trigger: this.host,
          start: 'top 85%',
          once: true,
        },
      });
    }, this.host);
  }
}
