import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';
import { gsap, refreshScrollTriggers } from '../../core/gsap-setup';
import { MotionService } from '../../core/motion.service';
import { PROFILE } from '../../data/portfolio.data';
import { HeroSceneComponent } from '../../three/hero-scene.component';
import { downloadResume } from '../../shared/download';

@Component({
  selector: 'app-hero',
  imports: [HeroSceneComponent],
  template: `
    <section id="home" class="relative flex min-h-[100svh] items-center overflow-hidden px-6 pt-28 pb-20">
      <!--
        3D background. three.js lives in a separate lazy chunk: @defer only fetches it
        once the browser is idle (after first paint + the text intro has started).
        Static tier (reduced motion / no WebGL) never loads it and keeps the CSS glow.
      -->
      <div class="hero-fallback pointer-events-none absolute inset-0" aria-hidden="true"></div>
      @if (sceneTier(); as t) {
        @defer (on idle) {
          <app-hero-scene [tier]="t" />
        }
      }
      <!-- Vignette so text stays readable over bright particles. -->
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-ink)_85%)]"></div>

      <div class="hero-content relative z-10 mx-auto w-full max-w-7xl">
        <div class="hero-badge mb-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-accent-soft">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
          </span>
          <span class="text-[10px] font-black uppercase tracking-wider">{{ profile.tagline }}</span>
        </div>

        <!-- Name split into per-character spans for the staggered 3D intro.
             aria-label keeps the full name readable for screen readers. -->
        <h1 class="perspective mb-4 text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl" [attr.aria-label]="profile.name">
          @for (word of nameWords; track $index) {
            <span class="inline-block whitespace-nowrap overflow-hidden pb-2 align-bottom" aria-hidden="true">
              @for (ch of word; track $index) {
                <span class="hero-char inline-block">{{ ch }}</span>
              }
            </span>
            {{ ' ' }}
          }
        </h1>

        <p class="hero-role gradient-text mb-8 text-lg font-black uppercase tracking-[0.3em] sm:text-2xl">{{ profile.role }}</p>

        <h2 class="hero-fade mb-6 max-w-3xl text-2xl font-bold leading-snug text-slate-200 sm:text-4xl">
          Building Enterprise <span class="gradient-text italic">Angular</span> Architectures
        </h2>

        <p class="hero-fade mb-10 max-w-xl text-lg leading-relaxed text-slate-400 md:text-xl">
          Senior professional with
          <span class="border-b-2 border-accent/50 font-bold text-white">{{ profile.yearsOfExp }} years of expertise</span>.
          I specialize in high-performance Single Page Applications across global domains.
        </p>

        <div class="hero-fade flex flex-wrap gap-4">
          <a href="#projects" class="btn-glow group flex items-center gap-3 rounded-2xl bg-accent px-8 py-4 font-bold text-white">
            View Case Studies
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
          </a>
          <button type="button" (click)="download()" class="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-bold text-slate-200 backdrop-blur transition-colors hover:border-accent/60 hover:bg-accent/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-y-0.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download Resume
          </button>
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
  private readonly motion = inject(MotionService);

  /** null on the static tier → template skips the 3D scene entirely. */
  readonly sceneTier = computed(() => {
    const t = this.motion.tier();
    return t === 'static' ? null : t;
  });

  readonly download = downloadResume;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    let ctx: gsap.Context | undefined;

    afterNextRender(() =>
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => this.intro(), host);
        refreshScrollTriggers();
      }),
    );
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }

  /**
   * Page-load intro timeline. Each step overlaps the previous one (negative
   * position offsets like '-=0.5') so it reads as one continuous motion:
   *   badge drops in → name letters flip up from below one by one →
   *   role letter-spacing tightens → headline/copy/buttons rise in.
   */
  private intro(): void {
    if (this.motion.tier() === 'static') {
      // Reduced motion: a single quick fade, no movement.
      gsap.from('.hero-content, .hero-fade', { opacity: 0, duration: 0.6 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.3 });
    tl.from('.hero-badge', { y: -20, opacity: 0, duration: 0.6 })
      .from(
        '.hero-char',
        {
          yPercent: 110, // start below the overflow-hidden word mask
          rotateX: -90, // flip up around the X axis (parent h1 has perspective)
          opacity: 0,
          stagger: 0.035,
          duration: 1,
          ease: 'back.out(1.7)',
        },
        '-=0.3',
      )
      .from('.hero-role', { opacity: 0, letterSpacing: '0.8em', duration: 1.2, ease: 'expo.out' }, '-=0.7')
      .from('.hero-fade', { y: 40, opacity: 0, stagger: 0.12, duration: 0.9 }, '-=0.8');

    // Scroll-out parallax: content drifts up and fades as the hero leaves.
    gsap.to('.hero-content', {
      yPercent: -15,
      opacity: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}
