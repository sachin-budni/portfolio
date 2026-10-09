import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';
import { gsap } from '../../core/gsap-setup';
import { MotionService } from '../../core/motion.service';
import { EXPERIENCE } from '../../data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';

/**
 * Scroll-driven timeline.
 *
 *  - The glowing progress line is scrubbed: its scaleY maps 1:1 to how far the
 *    viewport centre has travelled through the list, so it "draws" as you scroll
 *    (and un-draws when you scroll back up).
 *  - Each entry has its own timeline that fires as it reaches 75% of the
 *    viewport: the dot pops in with a glow pulse → the period/company slides in
 *    from its side → the card slides in from the other side → bullets stagger in.
 */
@Component({
  selector: 'app-experience',
  imports: [RevealDirective],
  template: `
    <section id="experience" class="relative px-6 py-32">
      <div class="mx-auto max-w-5xl">
        <div appReveal class="mb-24 text-center">
          <p data-reveal-child class="section-kicker">Career</p>
          <h2 data-reveal-child class="section-title">Professional Experience</h2>
        </div>

        <div class="timeline relative">
          <!-- Static track + scrubbed glowing progress on top of it. -->
          <div class="absolute bottom-0 left-4 top-0 w-0.5 bg-white/10 md:left-1/2 md:-translate-x-1/2"></div>
          <div class="timeline-progress absolute bottom-0 left-4 top-0 w-0.5 origin-top bg-gradient-to-b from-accent via-accent-2 to-accent shadow-[0_0_12px_var(--color-accent)] md:left-1/2 md:-translate-x-1/2"></div>

          <div class="space-y-20">
            @for (job of experience; track job.company; let i = $index, even = $even) {
              <div class="timeline-item relative flex flex-col gap-6 md:flex-row md:gap-0" [attr.data-side]="even ? 'left' : 'right'">
                <div class="tl-meta pl-12 md:w-1/2 md:px-12" [class]="even ? 'md:order-1 md:text-right' : 'md:order-2'">
                  <span class="mb-3 inline-block rounded bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_16px_var(--color-accent)]">
                    {{ job.period }}
                  </span>
                  @if (job.isLatest) {
                    <span class="ml-2 inline-block rounded border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">Current</span>
                  }
                  <h3 class="text-xl font-black uppercase text-white">{{ job.company }}</h3>
                  <p class="mt-1 text-xs font-bold uppercase tracking-widest text-accent-soft">{{ job.role }}</p>
                </div>

                <div class="absolute left-4 top-1.5 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center md:left-1/2">
                  <div class="tl-dot h-4 w-4 rounded-full border-4 border-ink bg-accent shadow-[0_0_0_4px_rgba(99,102,241,0.25),0_0_20px_var(--color-accent)]"></div>
                </div>

                <div class="tl-card pl-12 md:w-1/2 md:px-12" [class]="even ? 'md:order-2' : 'md:order-1'">
                  <div class="glass-card rounded-[2rem] p-8 transition-transform duration-500 hover:-translate-y-1">
                    <ul class="space-y-4">
                      @for (point of job.achievements; track point) {
                        <li class="tl-point flex items-start gap-3 text-sm leading-relaxed text-slate-400">
                          <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
                          {{ point }}
                        </li>
                      }
                    </ul>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  readonly experience = EXPERIENCE;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    const zone = inject(NgZone);
    let ctx: gsap.Context | undefined;

    afterNextRender(() =>
      zone.runOutsideAngular(() => {
        ctx = gsap.context(() => {
          const reduced = motion.tier() === 'static';

          // 1. Progress line drawn by scroll (scrub = smoothed 0.5s catch-up).
          gsap.fromTo(
            '.timeline-progress',
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 60%', scrub: reduced ? true : 0.5 },
            },
          );

          // 2. Step-by-step entries.
          const desktop = matchMedia('(min-width: 768px)').matches;
          host.querySelectorAll<HTMLElement>('.timeline-item').forEach((item) => {
            const q = gsap.utils.selector(item);
            const tl = gsap.timeline({
              scrollTrigger: { trigger: item, start: 'top 75%', once: true },
            });

            if (reduced) {
              tl.from(item, { opacity: 0, duration: 0.4 });
              return;
            }

            // Desktop entries alternate sides; on mobile everything enters from the right.
            // The meta and the card sit on opposite sides, so they converge on the line.
            const side = item.dataset['side'];
            const metaX = desktop && side === 'left' ? -60 : 60;
            const cardX = desktop && side === 'right' ? -60 : 60;
            tl.from(q('.tl-dot'), { scale: 0, duration: 0.5, ease: 'back.out(3)' })
              .from(q('.tl-meta'), { x: metaX, opacity: 0, duration: 0.7 }, '-=0.2')
              .from(q('.tl-card'), { x: cardX, y: 20, opacity: 0, duration: 0.8 }, '-=0.5')
              .from(q('.tl-point'), { x: -15, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.4')
              // A brief glow pulse on the dot once the step is "complete".
              .to(q('.tl-dot'), { scale: 1.5, repeat: 1, yoyo: true, duration: 0.25, ease: 'power1.inOut' }, '-=0.3');
          });
        }, host);
      }),
    );
    inject(DestroyRef).onDestroy(() => ctx?.revert());
  }
}
