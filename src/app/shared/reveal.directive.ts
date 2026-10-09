import { Directive, DestroyRef, ElementRef, NgZone, afterNextRender, inject, input } from '@angular/core';
import { gsap } from '../core/gsap-setup';
import { MotionService } from '../core/motion.service';

export type RevealVariant = 'fade-up' | 'slide-left' | 'slide-right' | 'rotate' | 'scale' | 'flip';

/**
 * Starting state for each variant; GSAP tweens *from* these to the element's
 * natural state. Every variant moves through real 3D space: `transformPerspective`
 * gives each element its own perspective, so no parent setup is needed, and
 * negative `z` starts it deep "inside" the screen.
 */
const FROM: Record<RevealVariant, gsap.TweenVars> = {
  // Rises out of the floor, tipping up from its bottom edge.
  'fade-up': { y: 140, z: -250, rotateX: -55, transformOrigin: '50% 100%' },
  // Swing in from the side, like a door, from deep in the screen.
  'slide-left': { x: -260, z: -400, rotateY: 55, transformOrigin: '0% 50%' },
  'slide-right': { x: 260, z: -400, rotateY: -55, transformOrigin: '100% 50%' },
  // A full quarter-turn from far away.
  rotate: { z: -700, rotateY: -95, rotateX: 25, transformOrigin: '0% 50%' },
  // Rockets in from the depths, twisting.
  scale: { scale: 0.3, z: -600, rotateZ: -18, rotateX: 30 },
  // Card flip down from its top hinge.
  flip: { rotateX: -120, z: -150, transformOrigin: '50% 0%' },
};

/**
 * Scroll-triggered 3D entrance animation.
 *
 * Usage:  <div appReveal="slide-left" [revealDelay]="0.2">
 *         Children marked with `data-reveal-child` animate in sequence (staggered)
 *         instead of the host animating as one block. The host is then left
 *         untouched, so it can safely carry [appScroll3d] as well.
 *
 * Plays once when the element's top crosses 88% of the viewport.
 * Under reduced motion it becomes a short opacity fade with no movement.
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  readonly appReveal = input<RevealVariant | ''>('fade-up');
  readonly revealDelay = input(0);
  readonly revealStagger = input(0.14);

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
        ...(reduced ? {} : { ...FROM[variant], transformPerspective: 1000 }),
        duration: reduced ? 0.4 : 1.4,
        ease: 'expo.out', // fast start, long soft landing: reads as heavy 3D momentum
        delay: this.revealDelay(),
        stagger: reduced ? 0 : this.revealStagger(),
        // Clear transforms afterwards so CSS hover effects (e.g. tilt) aren't fighting inline styles.
        clearProps: 'transform,transformOrigin',
        scrollTrigger: {
          trigger: this.host,
          start: 'top 88%',
          once: true,
        },
      });
    }, this.host);
  }
}
