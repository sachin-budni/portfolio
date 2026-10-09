import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';
import { gsap } from '../../core/gsap-setup';
import { MotionService } from '../../core/motion.service';
import { CORE_TECH, PROFILE, STATS, Stat } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { Scroll3dDirective } from '../../shared/scroll3d.directive';
import { TiltDirective } from '../../shared/tilt.directive';

/**
 * About: stats with count-up numbers, the "Tech Summary" card with progress
 * bars that fill when scrolled into view, and the architect note.
 */
@Component({
  selector: 'app-about',
  imports: [RevealDirective, Scroll3dDirective, TiltDirective],
  template: `
    <section id="about" class="relative px-6 py-32">
      <div class="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div appReveal="slide-left" appScroll3d="tilt" [scroll3dAmount]="0.5">
          <p data-reveal-child class="section-kicker">About</p>
          <h2 data-reveal-child class="section-title mb-8">Engineering front-ends that <span class="gradient-text">scale</span></h2>
          <p data-reveal-child class="mb-12 max-w-xl text-lg leading-relaxed text-slate-400">
            Senior professional with <span class="font-bold text-white">{{ profile.yearsOfExp }} years of expertise</span>
            building high-performance Single Page Applications across healthcare, real estate, BFSI, HR tech and energy.
          </p>

          <div data-reveal-child class="grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
            @for (stat of stats; track stat.label) {
              <div class="group cursor-default">
                <p class="text-4xl font-black text-white transition-colors group-hover:text-accent-soft">
                  <span class="stat-num" [attr.data-target]="stat.value" [attr.data-pad]="stat.pad ?? 0">{{ format(stat) }}</span>{{ stat.suffix }}
                </p>
                <p class="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{{ stat.label }}</p>
              </div>
            }
          </div>
        </div>

        <div appReveal="rotate" class="perspective">
          <!-- Scroll-scrubbed turntable swing; the tilt card inside adds hover tilt on top. -->
          <div appScroll3d="swing" class="[transform-style:preserve-3d]">
          <div appTilt [tiltMax]="12" class="glass-card relative overflow-hidden rounded-[2.5rem] p-10">
            <div class="tilt-glare"></div>
            <div class="tilt-layer mb-10 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-3 w-3 animate-pulse rounded-full bg-accent motion-reduce:animate-none"></div>
                <span class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Tech Summary</span>
              </div>
              <span class="rounded border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] font-black text-accent-soft">2025 PROFIT</span>
            </div>

            <div class="tilt-layer space-y-8">
              @for (skill of coreTech; track skill.name) {
                <div class="space-y-3">
                  <div class="flex items-end justify-between">
                    <span class="text-xs font-black uppercase text-slate-300">{{ skill.name }}</span>
                    <span class="text-sm font-bold text-accent-soft">{{ skill.percentage }}%</span>
                  </div>
                  <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div class="bar-fill h-full origin-left rounded-full bg-gradient-to-r from-accent to-accent-2 shadow-[0_0_12px_var(--color-accent)]"
                         [style.width.%]="skill.percentage"></div>
                  </div>
                </div>
              }
            </div>

            <div class="tilt-layer-deep mt-12 rounded-[1.5rem] border border-white/5 bg-black/40 p-6">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent-soft">Architect Note</p>
              <p class="text-sm italic leading-relaxed text-slate-300">"{{ profile.architectNote }}"</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  readonly profile = PROFILE;
  readonly stats = STATS;
  readonly coreTech = CORE_TECH;

  format(stat: Stat): string {
    return String(stat.value).padStart(stat.pad ?? 0, '0');
  }

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    const zone = inject(NgZone);
    let ctx: gsap.Context | undefined;

    afterNextRender(() =>
      zone.runOutsideAngular(() => {
        // Reduced motion: numbers and bars are already rendered at their final values.
        if (motion.tier() === 'static') return;

        ctx = gsap.context(() => {
          // Progress bars: scaleX 0 → 1 (transform-only, so no layout thrash), staggered.
          gsap.from('.bar-fill', {
            scaleX: 0,
            duration: 1.4,
            ease: 'expo.out',
            stagger: 0.15,
            scrollTrigger: { trigger: '.bar-fill', start: 'top 90%', once: true },
          });

          // Counters: tween a plain object and write the rounded value into the span.
          host.querySelectorAll<HTMLElement>('.stat-num').forEach((el) => {
            const target = Number(el.dataset['target']);
            const pad = Number(el.dataset['pad']);
            const counter = { v: 0 };
            el.textContent = '0'.padStart(pad, '0');
            gsap.to(counter, {
              v: target,
              duration: 1.8,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 90%', once: true },
              onUpdate: () => (el.textContent = String(Math.round(counter.v)).padStart(pad, '0')),
            });
          });
        }, host);
      }),
    );
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
