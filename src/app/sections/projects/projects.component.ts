import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROJECTS } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { TiltDirective } from '../../shared/tilt.directive';

/**
 * Project cards with 3D tilt + depth.
 *
 * The reveal (rotate-in on scroll) lives on a wrapper and the tilt on the inner
 * card, so the GSAP entrance transform and the hover tilt transform never
 * compete for the same element's `transform`.
 *
 * Depth: `.tilt-layer` children are pushed 40px towards the viewer and
 * `.tilt-layer-deep` 70px, so while the card rotates they parallax against
 * the card surface (see styles.css).
 */
@Component({
  selector: 'app-projects',
  imports: [RevealDirective, TiltDirective],
  template: `
    <section id="projects" class="relative px-6 py-32">
      <div class="mx-auto max-w-7xl">
        <div appReveal class="mb-20">
          <p data-reveal-child class="section-kicker">Selected Work</p>
          <h2 data-reveal-child class="section-title">Projects &amp; Case Studies</h2>
        </div>

        <div appReveal="rotate" [revealStagger]="0.15" class="perspective grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          @for (p of projects; track p.title; let i = $index) {
            <div data-reveal-child [class.lg:col-span-2]="i === 0">
              <article appTilt class="glass-card group relative h-full overflow-hidden rounded-[2rem] p-8">
                <div class="tilt-glare"></div>
                <!-- Big faint index number sitting "behind" the content for depth. -->
                <span class="pointer-events-none absolute -right-2 -top-6 text-[8rem] font-black leading-none text-white/[0.03]">
                  {{ (i + 1).toString().padStart(2, '0') }}
                </span>

                <div class="tilt-layer relative">
                  <div class="mb-6 flex items-center justify-between gap-4">
                    <span class="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent-soft">{{ p.domain }}</span>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">{{ p.company }}</span>
                  </div>
                  <h3 class="mb-4 text-2xl font-black text-white transition-colors group-hover:text-accent-soft">{{ p.title }}</h3>
                  <p class="mb-8 leading-relaxed text-slate-400">{{ p.description }}</p>
                </div>

                <div class="tilt-layer-deep relative">
                  <div class="mb-6 flex flex-wrap gap-2">
                    @for (t of p.tech; track t) {
                      <span class="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">{{ t }}</span>
                    }
                  </div>
                  <p class="flex items-center gap-2 text-sm font-bold text-emerald-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/></svg>
                    {{ p.impact }}
                  </p>
                </div>
              </article>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  readonly projects = PROJECTS;
}
