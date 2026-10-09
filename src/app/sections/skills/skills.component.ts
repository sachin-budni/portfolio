import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { refreshScrollTriggers } from '../../core/gsap-setup';
import { MotionService } from '../../core/motion.service';
import { SKILL_CATEGORIES } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { SkillsOrbitComponent } from '../../three/skills-orbit.component';

/**
 * Skills section — three rendering paths chosen by MotionService.tier():
 *  - full:   WebGL orbit of floating 3D tiles (lazy chunk via @defer on viewport).
 *  - lite:   pure-CSS 3D tiles that rotate/float with keyframes (GPU-composited, no WebGL).
 *  - static: no decorative layer, just the cards.
 * The DOM cards below are always rendered: they carry the real content for
 * screen readers and search engines, and react to the 3D hover.
 */
@Component({
  selector: 'app-skills',
  imports: [RevealDirective, SkillsOrbitComponent],
  template: `
    <section id="skills" class="relative px-6 py-32">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div appReveal>
            <p data-reveal-child class="section-kicker">Specialized Tech Stack</p>
            <h2 data-reveal-child class="section-title">Technical Proficiency</h2>
          </div>

          <div appReveal="slide-right" class="glass flex rounded-2xl border border-white/10 p-1.5" role="group" aria-label="Filter skills">
            @for (f of filters; track f.value) {
              <button type="button" (click)="filter.set(f.value)" [attr.aria-pressed]="filter() === f.value"
                class="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all"
                [class]="filter() === f.value ? 'bg-accent text-white shadow-[0_0_20px_var(--color-accent)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'">
                {{ f.label }}
              </button>
            }
          </div>
        </div>

        @switch (motion.tier()) {
          @case ('full') {
            @defer (on viewport; prefetch on idle) {
              <app-skills-orbit [categories]="categories" [filter]="filter()" (hovered)="hovered.set($event)" />
            } @placeholder {
              <div class="skills-placeholder h-[380px] md:h-[480px]"></div>
            }
          }
          @case ('lite') {
            <!-- CSS-only 3D: each tile spins on Y with preserve-3d, offset by --i. -->
            <div class="perspective mb-12 flex flex-wrap justify-center gap-6 py-6" aria-hidden="true">
              @for (cat of categories; track cat.title; let i = $index) {
                <div class="css-tile" [style.--i]="i" [style.--tile-color]="cat.color">
                  <span class="icon-mask block h-10 w-10 bg-white" [style.--icon-url]="'url(' + cat.icon + ')'"></span>
                </div>
              }
            </div>
          }
        }

        <div appReveal class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          @for (cat of filteredSkills(); track cat.title; let i = $index) {
            <div data-reveal-child
                 class="glass-card group rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2"
                 [class.is-active]="hovered() === indexOf(cat.title)"
                 [style.--tile-color]="cat.color">
              <div class="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110"
                   [style.background]="cat.color + '22'" [style.color]="cat.color">
                <span class="icon-mask block h-7 w-7 bg-current" [style.--icon-url]="'url(' + cat.icon + ')'" aria-hidden="true"></span>
              </div>
              <h3 class="mb-8 text-lg font-black uppercase tracking-tight text-white">{{ cat.title }}</h3>
              <div class="space-y-6">
                @for (skill of cat.skills; track skill.name) {
                  <div class="space-y-2">
                    <div class="flex justify-between text-[10px] font-black uppercase">
                      <span class="text-slate-400 transition-colors group-hover:text-white">{{ skill.name }}</span>
                      <span class="text-accent-soft">{{ skill.level }}</span>
                    </div>
                    <div class="h-1 w-full overflow-hidden rounded-full bg-white/5">
                      <div class="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                           [style.width]="skill.level === 'Expert' ? '100%' : '85%'"></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  readonly motion = inject(MotionService);
  readonly categories = SKILL_CATEGORIES;
  readonly filter = signal<'all' | 'tech'>('all');
  /** Index of the 3D tile under the cursor (-1 = none), used to glow the matching card. */
  readonly hovered = signal(-1);
  readonly filters = [
    { value: 'all' as const, label: 'All' },
    { value: 'tech' as const, label: 'Tech' },
  ];

  readonly filteredSkills = computed(() => {
    const cats = this.categories;
    if (this.filter() === 'all') return cats;
    return cats
      .map((cat) => ({ ...cat, skills: cat.skills.filter((s) => s.isTech) }))
      .filter((cat) => cat.skills.length > 0);
  });

  constructor() {
    // Filtering changes card heights, so ScrollTrigger positions further down the page
    // must be recalculated (debounced so the DOM has updated first).
    effect(() => {
      this.filteredSkills();
      refreshScrollTriggers();
    });
  }

  indexOf(title: string): number {
    return this.categories.findIndex((c) => c.title === title);
  }
}
