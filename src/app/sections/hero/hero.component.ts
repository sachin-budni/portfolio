import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';
import { gsap, refreshScrollTriggers } from '../../core/gsap-setup';
import { MotionService } from '../../core/motion.service';
import { PROFILE } from '../../data/portfolio.data';
import { downloadResume } from '../../shared/download';

/**
 * Hero copy. The 3D world itself is the fixed <app-world-scene> rendered by App
 * behind every section; this component handles the text in 3D:
 *
 *  - Depth layers: each block sits on its own Z plane (--z), inside a
 *    `preserve-3d` container that tilts with the mouse, so badge, name, role
 *    and buttons parallax against each other like a hologram.
 *  - Intro: name letters fly in from random points deep in space, spinning,
 *    and settle into place in random order.
 *  - Hover: each letter springs up individually (CSS, see .hero-char).
 *  - Scroll-out: the whole block tips backward and sinks into the screen.
 */
@Component({
  selector: 'app-hero',
  template: `
    <section id="home" class="relative flex min-h-[100svh] items-center overflow-hidden px-6 pt-28 pb-20">
      <!-- Static-tier fallback glow; on other tiers the fixed WebGL world shows through. -->
      @if (motion.tier() === 'static') {
        <div class="hero-fallback pointer-events-none absolute inset-0" aria-hidden="true"></div>
      }

      <!-- Perspective origin sits over the left-aligned copy so depth layers grow toward the right, not off-screen. -->
      <div class="hero-content relative z-10 mx-auto w-full max-w-7xl [perspective:1400px] [perspective-origin:15%_50%]">
        <div class="hero-tilt [transform-style:preserve-3d]">
          <div class="hero-layer" style="--z: 50px">
            <div class="hero-badge mb-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-accent-soft">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
              </span>
              <span class="text-[10px] font-black uppercase tracking-wider">{{ profile.tagline }}</span>
            </div>
          </div>

          <!-- Name split into per-character spans; aria-label keeps it readable for screen readers. -->
          <div class="hero-layer" style="--z: 100px">
            <h1 class="text-3d mb-4 text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-9xl" [attr.aria-label]="profile.name">
              @for (word of nameWords; track $index) {
                <span class="inline-block whitespace-nowrap" aria-hidden="true">
                  @for (ch of word; track $index) {
                    <span class="hero-char">{{ ch }}</span>
                  }
                </span>
                {{ ' ' }}
              }
            </h1>
          </div>

          <div class="hero-layer" style="--z: 70px">
            <p class="hero-role gradient-text mb-8 text-lg font-black uppercase tracking-[0.3em] sm:text-2xl">{{ profile.role }}</p>
          </div>

          <div class="hero-layer" style="--z: 30px">
            <h2 class="hero-fade mb-6 max-w-3xl text-2xl font-bold leading-snug text-slate-200 sm:text-4xl">
              Building Enterprise <span class="gradient-text italic">Angular</span> Architectures
            </h2>
            <p class="hero-fade mb-10 max-w-xl text-lg leading-relaxed text-slate-400 md:text-xl">
              Senior professional with
              <span class="border-b-2 border-accent/50 font-bold text-white">{{ profile.yearsOfExp }} years of expertise</span>.
              I specialize in high-performance Single Page Applications across global domains.
            </p>
          </div>

          <div class="hero-layer" style="--z: 80px">
            <div class="hero-fade flex flex-wrap gap-4">
              <a href="#projects" class="btn-glow btn-3d group flex items-center gap-3 rounded-2xl bg-accent px-8 py-4 font-bold text-white">
                View Case Studies
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
              </a>
              <button type="button" (click)="download()" class="btn-3d group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-bold text-slate-200 transition-colors hover:border-accent/60 hover:bg-accent/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-y-0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download Resume
              </button>
            </div>
          </div>
        </div>
      </div>

      <a href="#about" class="hero-fade absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-slate-500 hover:text-white" aria-label="Scroll to About">
        <span class="scroll-cue block h-10 w-6 rounded-full border-2 border-current"></span>
      </a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  readonly profile = PROFILE;
  readonly nameWords = PROFILE.name.split(' ').map((w) => w.split(''));
  readonly motion = inject(MotionService);
  readonly download = downloadResume;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    let ctx: gsap.Context | undefined;
    let onPointer: ((e: PointerEvent) => void) | undefined;

    afterNextRender(() =>
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          this.intro();
          onPointer = this.mouseTilt(host);
        }, host);
        refreshScrollTriggers();
      }),
    );
    inject(DestroyRef).onDestroy(() => {
      if (onPointer) window.removeEventListener('pointermove', onPointer);
      ctx?.revert();
    });
  }

  /**
   * Page-load intro. Steps overlap (negative offsets like '-=0.9') so it reads
   * as one continuous motion rather than a queue.
   */
  private intro(): void {
    if (this.motion.tier() === 'static') {
      gsap.from('.hero-content, .hero-fade', { opacity: 0, duration: 0.6 });
      return;
    }
    const rand = gsap.utils.random;

    const tl = gsap.timeline({ delay: 0.25 });
    tl.from('.hero-badge', { y: -80, rotateX: 90, opacity: 0, transformPerspective: 600, duration: 1, ease: 'back.out(2)' })
      .from(
        '.hero-char',
        {
          // Each letter starts at its own random point far behind the screen,
          // spun on all axes, then lands in a random order.
          x: () => rand(-500, 500),
          y: () => rand(-300, 300),
          z: () => rand(-1500, -600),
          rotateX: () => rand(-180, 180),
          rotateY: () => rand(-180, 180),
          rotateZ: () => rand(-90, 90),
          opacity: 0,
          transformPerspective: 700,
          duration: 1.5,
          ease: 'expo.out',
          stagger: { each: 0.04, from: 'random' },
          clearProps: 'transform', // hand control back to the CSS hover spring
        },
        '-=0.6',
      )
      .from(
        '.hero-role',
        { opacity: 0, letterSpacing: '1.4em', rotateX: -90, transformPerspective: 600, duration: 1.4, ease: 'expo.out' },
        '-=1.1',
      )
      .from(
        '.hero-fade',
        { y: 100, z: -400, rotateX: -50, opacity: 0, transformPerspective: 900, stagger: 0.12, duration: 1.3, ease: 'expo.out' },
        '-=1',
      );

    // Scroll-out: the block tips backward from its bottom edge and sinks into depth.
    gsap.to('.hero-content', {
      rotateX: 40,
      z: -600,
      yPercent: -10,
      opacity: 0,
      transformPerspective: 1200,
      transformOrigin: '50% 100%',
      ease: 'none',
      scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 0.5 },
    });
  }

  /**
   * Hologram tilt: the preserve-3d container rotates toward the pointer; because
   * each layer sits at a different Z, nearer layers swing further (parallax).
   * quickTo reuses one tween per property, so this is cheap on every pointermove.
   */
  private mouseTilt(host: HTMLElement): ((e: PointerEvent) => void) | undefined {
    if (!this.motion.hoverEffects()) return undefined;
    const el = host.querySelector('.hero-tilt');
    if (!el) return undefined;
    const rotY = gsap.quickTo(el, 'rotationY', { duration: 1, ease: 'power3' });
    const rotX = gsap.quickTo(el, 'rotationX', { duration: 1, ease: 'power3' });
    const onPointer = (e: PointerEvent) => {
      rotY((e.clientX / innerWidth - 0.5) * 24);
      rotX(-(e.clientY / innerHeight - 0.5) * 16);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    return onPointer;
  }
}
