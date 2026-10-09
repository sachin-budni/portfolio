import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject, signal } from '@angular/core';
import { ScrollTrigger, gsap } from '../../core/gsap-setup';
import { MotionService } from '../../core/motion.service';
import { PROFILE } from '../../data/portfolio.data';

/**
 * Fixed glass nav.
 *  - Slides down on load.
 *  - Hides on scroll-down / reappears on scroll-up (ScrollTrigger direction).
 *  - A thin gradient bar at the top shows overall page scroll progress (scrubbed).
 */
@Component({
  selector: 'app-nav',
  template: `
    <nav class="nav fixed inset-x-0 top-0 z-50 glass border-b border-white/5">
      <div class="scroll-progress absolute left-0 top-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-accent to-accent-2"></div>
      <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="#home" class="group flex items-center gap-3" aria-label="Back to top">
          <div class="glow flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-xl font-bold text-white transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
            {{ profile.initials }}
          </div>
          <div class="hidden sm:block">
            <p class="text-lg font-bold uppercase leading-none text-white">{{ profile.name }}</p>
            <p class="text-[10px] font-bold tracking-[0.2em] text-accent-soft uppercase">{{ profile.role }}</p>
          </div>
        </a>

        <div class="flex items-center gap-8">
          <div class="hidden gap-8 text-sm font-bold text-slate-400 md:flex">
            @for (link of links; track link.href) {
              <a [href]="link.href" class="nav-link relative transition-colors hover:text-white">{{ link.label }}</a>
            }
          </div>
          <a [href]="'mailto:' + profile.email" class="btn-glow flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white">
            Hire Me
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
          </a>
          <button type="button" class="md:hidden text-slate-300" (click)="menuOpen.set(!menuOpen())" [attr.aria-expanded]="menuOpen()" aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </div>
      @if (menuOpen()) {
        <div class="flex flex-col gap-1 border-t border-white/5 px-6 pb-4 md:hidden">
          @for (link of links; track link.href) {
            <a [href]="link.href" (click)="menuOpen.set(false)" class="py-2 text-sm font-bold text-slate-300 hover:text-white">{{ link.label }}</a>
          }
        </div>
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavComponent {
  readonly profile = PROFILE;
  readonly menuOpen = signal(false);
  readonly links = [
    { href: '#about', label: 'About' },
    { href: '#experience', label: 'Experience' },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#contact', label: 'Contact' },
  ];

  constructor() {
    const motion = inject(MotionService);
    const zone = inject(NgZone);
    const host = inject(ElementRef).nativeElement as HTMLElement;
    let ctx: gsap.Context | undefined;

    afterNextRender(() =>
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          const reduced = motion.tier() === 'static';
          gsap.from('.nav', { yPercent: reduced ? 0 : -100, opacity: 0, duration: 0.8, delay: 0.1 });

          // Page progress bar, tied 1:1 to scroll position.
          gsap.to('.scroll-progress', {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
          });

          if (!reduced) {
            // Hide when scrolling down past the hero, reveal when scrolling up.
            const hide = gsap.to('.nav', { yPercent: -100, paused: true, duration: 0.35, ease: 'power2.out' });
            ScrollTrigger.create({
              start: 'top -120',
              end: 'max',
              onUpdate: (self) => (self.direction === 1 && !this.menuOpen() ? hide.play() : hide.reverse()),
            });
          }
        }, host); // scope selectors to this component
      }),
    );
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
