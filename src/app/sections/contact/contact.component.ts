import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROFILE } from '../../data/portfolio.data';
import { downloadResume } from '../../shared/download';
import { RevealDirective } from '../../shared/reveal.directive';
import { TiltDirective } from '../../shared/tilt.directive';

/** Contact / footer CTA — same content as before, with scroll reveals and a tilting profile card. */
@Component({
  selector: 'app-contact',
  imports: [RevealDirective, TiltDirective],
  template: `
    <footer id="contact" class="relative overflow-hidden px-6 py-32">
      <!-- Soft accent glows anchored to the footer. -->
      <div class="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-accent/20 blur-[120px]"></div>
      <div class="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent-2/15 blur-[120px]"></div>

      <div class="relative z-10 mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-2">
        <div appReveal="slide-left">
          <h2 class="mb-12 text-5xl font-black uppercase leading-[1.1] tracking-tight text-white md:text-7xl">
            <span data-reveal-child class="block">Ready to collaborate on</span>
            <span data-reveal-child class="gradient-text block">strategic UI projects?</span>
          </h2>
          <div class="space-y-8">
            @for (c of contacts; track c.href) {
              <a data-reveal-child [href]="c.href" class="group flex w-fit items-center gap-6">
                <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-accent-soft transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-accent group-hover:text-white group-hover:shadow-[0_0_30px_var(--color-accent)]">
                  @if (c.kind === 'email') {
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.79.65 2.64a2 2 0 0 1-.45 2.11L8 9.94a16 16 0 0 0 6.06 6.06l1.47-1.26a2 2 0 0 1 2.11-.45c.85.31 1.74.53 2.64.65A2 2 0 0 1 22 16.92z"/></svg>
                  }
                </div>
                <div class="transition-transform group-hover:translate-x-3">
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">{{ c.label }}</p>
                  <p class="text-lg font-bold text-white transition-colors group-hover:text-accent-soft">{{ c.value }}</p>
                </div>
              </a>
            }
          </div>
        </div>

        <div appReveal="scale" class="perspective flex justify-center lg:justify-end">
          <div appTilt class="glass-card relative w-full max-w-sm overflow-hidden rounded-[3.5rem] p-12 text-center">
            <div class="tilt-glare"></div>
            <div class="tilt-layer-deep glow mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-3xl font-black text-white">
              {{ profile.initials }}
            </div>
            <div class="tilt-layer">
              <h3 class="mb-2 text-3xl font-black uppercase text-white">{{ profile.name }}</h3>
              <p class="mb-10 text-xs font-bold uppercase tracking-widest text-slate-500">{{ profile.location }}</p>
              <div class="space-y-4">
                <button type="button" (click)="download()" class="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 font-bold text-ink transition-all hover:tracking-[0.2em]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  DOWNLOAD RESUME
                </button>
                <a href="#projects" class="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white/5 py-4 font-bold text-slate-300 transition-all hover:bg-white/10 hover:tracking-[0.2em]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:rotate-45"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                  VIEW PORTFOLIO
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  readonly profile = PROFILE;
  readonly download = downloadResume;
  readonly contacts = [
    { kind: 'email', label: 'Email Me', value: PROFILE.email, href: `mailto:${PROFILE.email}` },
    { kind: 'phone', label: 'Contact Me', value: PROFILE.phone, href: PROFILE.phoneHref },
  ];
}
