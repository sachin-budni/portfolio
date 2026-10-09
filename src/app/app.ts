import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { setupGsap } from './core/gsap-setup';
import { MotionService } from './core/motion.service';
import { AboutComponent } from './sections/about/about.component';
import { ContactComponent } from './sections/contact/contact.component';
import { ExperienceComponent } from './sections/experience/experience.component';
import { HeroComponent } from './sections/hero/hero.component';
import { NavComponent } from './sections/nav/nav.component';
import { ProjectsComponent } from './sections/projects/projects.component';
import { SkillsComponent } from './sections/skills/skills.component';
import { CursorGlowComponent } from './shared/cursor-glow.component';
import { WorldSceneComponent } from './three/world-scene.component';

// Register ScrollTrigger before any section constructs its animations.
setupGsap();

@Component({
  selector: 'app-root',
  imports: [
    NavComponent,
    HeroComponent,
    AboutComponent,
    ExperienceComponent,
    SkillsComponent,
    ProjectsComponent,
    ContactComponent,
    WorldSceneComponent,
    CursorGlowComponent,
  ],
  template: `
    <!--
      Fixed full-page WebGL world behind everything. three.js is a separate lazy
      chunk: @defer fetches it once the browser is idle, after the text intro has
      started. The static tier (reduced motion / no WebGL) never loads it.
    -->
    @if (worldTier(); as t) {
      @defer (on idle) {
        <app-world-scene [tier]="t" />
      }
    }
    @if (motion.hoverEffects()) {
      <app-cursor-glow />
    }

    <div class="relative z-10 overflow-x-clip">
      <app-nav />
      <main>
        <app-hero />
        <app-about />
        <app-experience />
        <app-skills />
        <app-projects />
      </main>
      <app-contact />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly motion = inject(MotionService);
  /** null on the static tier → no WebGL at all. */
  readonly worldTier = computed(() => {
    const t = this.motion.tier();
    return t === 'static' ? null : t;
  });
}
