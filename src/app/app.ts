import { ChangeDetectionStrategy, Component } from '@angular/core';
import { setupGsap } from './core/gsap-setup';
import { AboutComponent } from './sections/about/about.component';
import { ContactComponent } from './sections/contact/contact.component';
import { ExperienceComponent } from './sections/experience/experience.component';
import { HeroComponent } from './sections/hero/hero.component';
import { NavComponent } from './sections/nav/nav.component';
import { ProjectsComponent } from './sections/projects/projects.component';
import { SkillsComponent } from './sections/skills/skills.component';

// Register ScrollTrigger before any section constructs its animations.
setupGsap();

@Component({
  selector: 'app-root',
  imports: [NavComponent, HeroComponent, AboutComponent, ExperienceComponent, SkillsComponent, ProjectsComponent, ContactComponent],
  template: `
    <div class="relative overflow-x-clip">
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
export class App {}
