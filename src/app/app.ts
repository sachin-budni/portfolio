import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Experience {
  company: string;
  role: string;
  period: string;
  isLatest?: boolean;
  achievements: string[];
}

interface Skill {
  name: string;
  level: string;
  isTech: boolean;
}

interface SkillCategory {
  title: string;
  icon: string;
  colorClass: string;
  skills: Skill[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden">
      
      <!-- Navigation -->
      <nav class="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 animate-slide-down">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div class="flex items-center gap-2 group cursor-pointer">
            <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-indigo-200">SB</div>
            <div class="hidden sm:block">
              <h1 class="font-bold text-lg leading-none uppercase transition-colors group-hover:text-indigo-600">Sachin Budni</h1>
              <p class="text-[10px] text-indigo-600 font-bold tracking-[0.2em]">FRONT-END ARCHITECT</p>
            </div>
          </div>
          <div class="flex items-center gap-8">
            <div class="hidden md:flex gap-8 text-sm font-bold text-gray-500">
              <a href="#about" class="hover:text-indigo-600 transition-colors relative group/link">
                About
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover/link:w-full"></span>
              </a>
              <a href="#experience" class="hover:text-indigo-600 transition-colors relative group/link">
                Experience
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover/link:w-full"></span>
              </a>
              <a href="#skills" class="hover:text-indigo-600 transition-colors relative group/link">
                Skills
                <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover/link:w-full"></span>
              </a>
            </div>
            <a href="mailto:sachinbudnibnt@gmail.com" 
               class="btn-primary bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 group">
              Hire Me
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section id="about" class="pt-40 pb-24 px-6 relative group/hero">
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div class="space-y-8 animate-fade-in-up">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 transition-all hover:pl-5">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span class="text-[10px] font-black uppercase tracking-wider">Strategic Front-End Engineering</span>
            </div>
            
            <h1 class="text-6xl md:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 overflow-hidden">
              <span class="block transition-transform duration-700 group-hover/hero:-translate-y-2">Building Enterprise</span>
              <span class="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent transition-transform duration-700 delay-75 group-hover/hero:translate-x-4 italic">Angular</span>
              <span class="block transition-transform duration-700 delay-150 group-hover/hero:translate-y-2">Architectures</span>
            </h1>
            
            <p class="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed">
              Senior professional with <span class="text-slate-900 font-bold border-b-2 border-indigo-200">{{yearsOfExp()}} years of expertise</span>. I specialize in high-performance Single Page Applications across global domains.
            </p>
            
            <div class="flex flex-wrap gap-4 pt-4">
              <button class="btn-primary bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 group/btn overflow-hidden flex items-center gap-3">
                <span class="relative z-10">View Case Studies</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="relative z-10 group-hover/btn:translate-x-1 transition-transform"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                <div class="absolute inset-0 bg-indigo-600 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-out"></div>
              </button>
              <button class="btn-secondary border-2 border-gray-200 bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold hover:pl-12 transition-all flex items-center gap-3 group/resume" (click)="downloadResume()">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover/resume:scale-110 transition-transform"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download Resume
              </button>
            </div>

            <div class="grid grid-cols-3 gap-8 pt-12 border-t border-gray-100">
              @for (stat of stats(); track stat.label) {
                <div class="hover:scale-105 transition-transform duration-300 cursor-default hover:text-indigo-600">
                  <h3 class="text-4xl font-black">{{stat.value}}</h3>
                  <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{{stat.label}}</p>
                </div>
              }
            </div>
          </div>

          <div class="relative animate-float group/card">
            <div class="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 border border-indigo-50 relative z-10 overflow-hidden transition-all duration-700 hover:shadow-indigo-300/40 hover:-translate-y-2">
              
              <div class="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-indigo-50/20 to-transparent -translate-x-full group-hover/card:animate-shimmer transition-transform duration-1000"></div>
              
              <div class="flex justify-between items-center mb-10 relative z-20 transition-transform group-hover/card:-translate-y-1">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                  <span class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Tech Summary</span>
                </div>
                <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 animate-pulse-slow">2025 PROFIT</span>
              </div>
              
              <div class="space-y-8 relative z-20">
                @for (skill of coreTech(); track skill.name; let i = $index) {
                  <div class="space-y-3 group/bar">
                    <div class="flex justify-between items-end transition-all duration-500 group-hover/card:translate-x-3">
                      <span class="text-xs font-black uppercase text-slate-700 group-hover/bar:text-indigo-600 transition-colors">{{skill.name}}</span>
                      <span class="text-sm font-bold text-indigo-600 animate-counter">{{skill.percentage}}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
                      <div class="h-full bg-indigo-600 rounded-full animate-grow-stagger shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                           [style.width.%]="skill.percentage"
                           [style.animation-delay]="(i * 200) + 500 + 'ms'"></div>
                      <div class="absolute inset-0 bg-white/40 -translate-x-full group-hover/card:animate-slide-infinite opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                }
              </div>

              <div class="mt-12 p-6 bg-slate-900 rounded-[1.5rem] text-white transform transition-all duration-700 translate-y-4 group-hover/card:translate-y-0 relative overflow-hidden group/note">
                <div class="relative z-10 transition-transform duration-500 group-hover/note:translate-y-[-2px]">
                  <p class="text-[10px] uppercase font-bold text-indigo-400 mb-2 tracking-widest transition-transform group-hover/note:translate-x-1">Architect Note</p>
                  <p class="text-sm text-slate-300 leading-relaxed italic group-hover/note:text-white transition-colors">
                    "Specialized in state management and API performance optimization, reducing response times for high-traffic enterprise solutions."
                  </p>
                </div>
                <div class="absolute inset-0 bg-indigo-600/5 translate-y-full group-hover/note:translate-y-0 transition-transform duration-700"></div>
                <div class="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 blur-2xl rounded-full"></div>
              </div>
            </div>
            <div class="absolute -top-12 -right-12 w-64 h-64 bg-indigo-100/60 rounded-full blur-[80px] -z-10 animate-pulse"></div>
            <div class="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-100/40 rounded-full blur-[60px] -z-10 animate-pulse-slow"></div>
          </div>
        </div>
      </section>

      <!-- Professional Experience -->
      <section id="experience" class="py-32 bg-white relative">
        <div class="max-w-4xl mx-auto px-6">
          <div class="text-center mb-24 animate-fade-in">
            <h2 class="text-4xl md:text-5xl font-black mb-4 tracking-tight uppercase">Professional Experience</h2>
            <div class="w-12 h-1 bg-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div class="relative">
            <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-100 md:-translate-x-1/2"></div>

            <div class="space-y-20">
              @for (job of experience(); track job.company; let i = $index) {
                <div class="relative flex flex-col md:flex-row gap-8 md:gap-0 animate-fade-in-up group/item" 
                     [style.animation-delay]="(i * 100) + 'ms'">
                  
                  <div class="md:w-1/2 px-12 transition-all duration-500" 
                       [class]="(i % 2 === 0 ? 'md:text-right md:order-1 group-hover/item:-translate-x-4' : 'md:order-2 group-hover/item:translate-x-4')">
                    <span class="inline-block px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded mb-3 shadow-md transition-all hover:scale-110">
                      {{job.period}}
                    </span>
                    <h3 class="text-xl font-black text-slate-900 uppercase transition-colors group-hover/item:text-indigo-600">{{job.company}}</h3>
                    <p class="text-indigo-600 font-bold uppercase text-xs tracking-widest mt-1">{{job.role}}</p>
                  </div>

                  <div class="absolute left-4 md:left-1/2 top-1.5 w-8 h-8 -translate-x-1/2 flex items-center justify-center z-10">
                    <div class="w-4 h-4 rounded-full border-4 border-white shadow-md bg-indigo-600 transition-all duration-500 group-hover/item:scale-[2] group-hover/item:shadow-indigo-200"></div>
                  </div>

                  <div class="md:w-1/2 px-12" [class.md:order-2]="i % 2 === 0" [class.md:order-1]="i % 2 !== 0">
                    <div class="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:-translate-y-2 group/card">
                      <ul class="space-y-4">
                        @for (point of job.achievements; track point) {
                          <li class="flex items-start gap-3 text-sm text-gray-500 leading-relaxed group-hover/card:text-gray-700 transition-all group-hover/card:translate-x-1">
                            <div class="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 group-hover/card:bg-indigo-600 group-hover/card:scale-125 transition-all"></div>
                            {{point}}
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

      <!-- Skills Matrix -->
      <section id="skills" class="py-32 px-6 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <div class="animate-fade-in">
              <h2 class="text-4xl font-black tracking-tight uppercase mb-2">Technical Proficiency</h2>
              <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Specialized Tech Stack</p>
            </div>
            
            <!-- All and Tech Filter Buttons -->
            <div class="flex p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
              <button (click)="filter.set('all')"
                [class]="'px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ' + 
                (filter() === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-z-10' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50')">
                All
              </button>
              <button (click)="filter.set('tech')"
                [class]="'px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ' + 
                (filter() === 'tech' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-z-10' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50')">
                Tech
              </button>
            </div>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            @for (cat of filteredSkills(); track cat.title; let i = $index) {
              <div class="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group animate-fade-in-up"
                   [style.animation-delay]="(i * 150) + 'ms'">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:bg-indigo-600 group-hover:scale-110 group-hover:rotate-6 shadow-md"
                     [class]="cat.colorClass">
                   <div class="w-7 h-7 transition-colors duration-500 group-hover:text-white">
                    <span
                      class="block w-full h-full bg-current icon-mask"
                      [style.--icon-url]="'url(/' + cat.icon + ')'"
                      aria-hidden="true"></span>
                   </div>
                </div>
                <h3 class="font-black text-lg mb-8 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{{cat.title}}</h3>
                <div class="space-y-6">
                  @for (skill of cat.skills; track skill.name) {
                    <div class="space-y-2 group/skill">
                      <div class="flex justify-between text-[10px] font-black uppercase transition-all group-hover/skill:translate-x-2">
                        <span class="text-slate-400 group-hover:text-slate-900 transition-colors">{{skill.name}}</span>
                        <span class="text-indigo-500">{{skill.level}}</span>
                      </div>
                      <div class="h-1 w-full bg-gray-50 rounded-full overflow-hidden relative">
                        <div class="h-full bg-indigo-500 rounded-full group-hover:bg-indigo-700 transition-all duration-700 group-hover:shadow-[0_0_8px_rgba(79,70,229,0.4)]" 
                             [style.width]="skill.level === 'Expert' ? '100%' : '85%'"></div>
                        <div class="absolute inset-0 bg-white/30 -translate-x-full group-hover:animate-slide-infinite opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Footer CTA -->
      <footer class="py-32 px-6 bg-slate-950 text-white relative overflow-hidden group/footer">
        <div class="max-w-7xl mx-auto relative z-10">
          <div class="grid lg:grid-cols-2 gap-20 items-center">
            <div class="animate-fade-in-up">
              <h2 class="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[1.1] mb-12 overflow-hidden">
                <span class="block transition-transform duration-700 group-hover/footer:-translate-x-4">Ready to collaborate on</span>
                <span class="block text-indigo-500 transition-transform duration-700 delay-100 group-hover/footer:translate-x-4">strategic UI projects?</span>
              </h2>
              <div class="space-y-8">
                <a href="mailto:sachinbudnibnt@gmail.com" class="group flex items-center gap-6 w-fit cursor-pointer">
                  <div class="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-indigo-600 group-hover:rotate-12 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500 group-hover:text-white transition-colors"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div class="transition-all group-hover:translate-x-4">
                    <p class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Email Me</p>
                    <p class="text-lg font-bold group-hover:text-indigo-400 transition-colors">sachinbudnibnt&#64;gmail.com</p>
                  </div>
                </a>
                <a href="tel:+918951024495" class="group flex items-center gap-6 w-fit cursor-pointer">
                  <div class="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-indigo-600 group-hover:rotate-12 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500 group-hover:text-white transition-colors"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.79.65 2.64a2 2 0 0 1-.45 2.11L8 9.94a16 16 0 0 0 6.06 6.06l1.47-1.26a2 2 0 0 1 2.11-.45c.85.31 1.74.53 2.64.65A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div class="transition-all group-hover:translate-x-4">
                    <p class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Contact Me</p>
                    <p class="text-lg font-bold group-hover:text-indigo-400 transition-colors">+91 8951024495</p>
                  </div>
                </a>
              </div>
            </div>

            <div class="flex justify-center lg:justify-end animate-fade-in-up">
              <div class="w-full max-w-sm bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-12 rounded-[3.5rem] text-center shadow-2xl transition-all duration-700 hover:shadow-indigo-500/10 hover:border-slate-700 hover:-translate-y-2 group/footer-card">
                <div class="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-8 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-indigo-500/20 transition-all duration-500 group-hover/footer-card:scale-110 group-hover/footer-card:rotate-6">SB</div>
                <h3 class="text-3xl font-black mb-2 uppercase">Sachin Budni</h3>
                <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">Bangalore, India</p>
                
                <!-- Download Resume & View Portfolio Buttons -->
                <div class="space-y-4">
                  <button (click)="downloadResume()" class="btn-primary w-full bg-white text-slate-950 px-0 transition-all hover:tracking-[0.2em] flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    DOWNLOAD RESUME
                  </button>
                  <button class="btn-secondary w-full bg-slate-800 text-slate-400 border-none px-0 transition-all hover:tracking-[0.2em] flex items-center justify-center gap-3 group/port">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover/port:rotate-45 transition-transform"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    VIEW PORTFOLIO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  `,
  styleUrls: [`./app.css`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  yearsOfExp = signal(7);
  filter = signal<'all' | 'tech'>('all');

  stats = signal([
    { label: 'Years of Exp.', value: '07' },
    { label: 'Projects Delivered', value: '15+' },
    { label: 'Key Domains', value: '05' },
  ]);

  coreTech = signal([
    { name: 'Angular Architecture (v4-v18)', percentage: 95 },
    { name: 'RxJS & Reactive Patterns', percentage: 92 },
    { name: 'NgRx State Management', percentage: 88 },
    { name: 'Performance Optimization', percentage: 90 },
  ]);

  experience = signal<Experience[]>([
    {
      company: 'Tata Medical & Diagnostics',
      role: 'Sr. Software Developer',
      period: 'May 2025 - Present',
      isLatest: true,
      achievements: [
        'Architecting high-scale Angular 15 healthcare platforms with complex data flows.',
        'Implementing enterprise state management using NgRx and custom RxJS streams.',
        'Driving technical requirement analysis and mentorship for front-end teams.'
      ]
    },
    {
      company: 'BOP Consultant Private',
      role: 'Sr. Software Developer',
      period: 'Feb 2025 - April 2026',
      achievements: [
        'Architecting high-scale Angular 15 healthcare platforms with complex data flows.',
        'Implementing enterprise state management using NgRx and custom RxJS streams.',
        'Driving technical requirement analysis and mentorship for front-end teams.'
      ]
    },
    {
      company: 'R Systems International',
      role: 'Sr. Software Developer',
      period: "May 2024 - Jan 2025",
      achievements: [
        'Delivered real estate SPA with high-performance dynamic filtering & CRUD ops.',
        'Reduced load times by 30% through strategic lazy loading and caching.',
        'Collaborated with stakeholders to translate business needs into technical designs.'
      ]
    },
    {
      company: 'LTIMindtree Private Limited',
      role: 'Sr. Software Developer',
      period: "Aug 2022 - May 2024",
      achievements: [
        'Built BFSI retailer management modules with robust Reactive Forms.',
        'Enhanced scalability by implementing modular NgRx architecture.',
        'Led Agile ceremonies and performed architecture reviews for critical modules.'
      ]
    },
    {
      company: 'IQGateway Private Limited',
      role: 'Sr. Software Developer',
      period: 'Jan 2020 - Aug 2022',
      achievements: [
        'Delivered Healthcare and Job Portal apps using Angular 12.',
        'Designed high-fidelity, responsive UIs with Material UI and Bootstrap.',
        'Maintained complex state consistency across large-scale job portal modules.'
      ]
    },
    {
      company: 'BizRuntime IT Services Private Limited',
      role: 'Software Developer',
      period: 'Jan 2018 - Aug 2019',
      achievements: [
        'Developed SaaS-based Angular 4/6 SPA applications for Oil and Gas industry clients.',
        'Implemented chat, channel, and hashtag modules with dynamic rendering.',
        'Coordinated with global clients using Slack, Skype, and Redmine for project management and progress tracking.'
      ]
    }
  ]);

  skillCategories = signal<SkillCategory[]>([
    {
      title: 'Frameworks',
      // icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>',
      icon: 'frameworks.svg',
      colorClass: 'bg-indigo-50 text-indigo-600',
      skills: [
        { name: 'Angular (v4-v18)', level: 'Expert', isTech: true },
        { name: 'TypeScript', level: 'Expert', isTech: true },
        { name: 'JavaScript (ES6+)', level: 'Expert', isTech: true }
      ]
    },
    {
      title: 'Visual Engineering',
      // icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="m15 5 3 3"/></svg>',
      icon: 'visual-engineering.svg',
      colorClass: 'bg-purple-50 text-purple-600',
      skills: [
        { name: 'SCSS / CSS3', level: 'Expert', isTech: true },
        { name: 'Material UI / Tailwind', level: 'Advanced', isTech: true },
        { name: 'Responsive Design', level: 'Expert', isTech: false }
      ]
    },
    {
      title: 'State & Data',
      // icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
      icon: 'state-data.svg',
      colorClass: 'bg-blue-50 text-blue-600',
      skills: [
        { name: 'NgRx / RxJS', level: 'Expert', isTech: true },
        { name: 'REST API Integration', level: 'Expert', isTech: true },
        { name: 'Performance Tuning', level: 'Advanced', isTech: true }
      ]
    },
    {
      title: 'Strategy',
      // icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="M12 3v2"/><path d="M21 12h-2"/><path d="M12 21v-2"/><path d="M3 12h2"/></svg>',
      icon: 'strategy.svg',
      colorClass: 'bg-emerald-50 text-emerald-600',
      skills: [
        { name: 'Agile / Scrum', level: 'Expert', isTech: false },
        { name: 'Requirement Analysis', level: 'Expert', isTech: false },
        { name: 'Mentoring', level: 'Advanced', isTech: false }
      ]
    }
  ]);

  filteredSkills = computed(() => {
    const currentFilter = this.filter();
    if (currentFilter === 'all') return this.skillCategories();

    return this.skillCategories().map(cat => ({
      ...cat,
      skills: cat.skills.filter(s => s.isTech)
    })).filter(cat => cat.skills.length > 0);
  });
  downloadResume() {
    const link = document.createElement('a');
    link.href = 'Professional_resume.pdf';
    link.download = 'Professional_resume.pdf';
    link.click();
  }
}
