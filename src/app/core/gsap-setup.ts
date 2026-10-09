import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/** Registers GSAP plugins once and sets project-wide easing defaults. */
export function setupGsap(): void {
  if (registered) return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.9 });
  // Ignore the mobile URL-bar show/hide resize so triggers don't jump mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Debounced refresh, called after @defer blocks inject content that changes layout. */
let refreshTimer: ReturnType<typeof setTimeout> | undefined;
export function refreshScrollTriggers(): void {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100);
}

export { gsap, ScrollTrigger };
