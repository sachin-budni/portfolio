import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">

      <!-- Navigation -->
      <nav class="fixed top-0 w-full z-50 glass-nav border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center space-x-2">
              <div class="w-10 h-10  rounded-full shadow-lg shadow-indigo-200">
                <img src="Profile_Photo.jpg" class="rounded-full w-10 h-10 object-cover" alt="" srcset="">
              </div>
              <div class="flex flex-col">
                <span class="text-lg font-bold tracking-tight text-slate-800 leading-none">SACHIN BUDNI</span>
                <span class="text-[10px] text-indigo-600 font-bold tracking-widest uppercase">Front-End Architect</span>
              </div>
            </div>
            
            <!-- Desktop Nav -->
            <div class="hidden md:flex space-x-8 text-sm font-medium">
              <a href="#about" class="text-slate-600 hover:text-indigo-600 transition-colors">About</a>
              <a href="#experience" class="text-slate-600 hover:text-indigo-600 transition-colors">Experience</a>
              <a href="#skills" class="text-slate-600 hover:text-indigo-600 transition-colors">Skills</a>
              <a href="mailto:sachinbudnibnt@gmail.com" class="px-5 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-semibold">Hire Me</a>
            </div>

            <!-- Mobile Menu Button -->
            <div class="md:hidden">
              <button (click)="toggleMenu()" class="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                @if (!isMenuOpen()) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                }
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu -->
        @if (isMenuOpen()) {
          <div class="md:hidden bg-white border-b border-slate-200 py-6 px-4 space-y-4 animate-in slide-in-from-top duration-300 shadow-xl">
            <a href="#about" (click)="toggleMenu()" class="block px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">About</a>
            <a href="#experience" (click)="toggleMenu()" class="block px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Experience</a>
            <a href="#skills" (click)="toggleMenu()" class="block px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Skills</a>
            <a href="mailto:sachinbudnibnt@gmail.com" (click)="toggleMenu()" class="block px-4 py-3 bg-indigo-600 text-white text-center font-bold rounded-xl shadow-lg">Contact Me</a>
          </div>
        }
      </nav>

      <!-- Hero Section & Tech Summary -->
      <section id="about" class="pt-32 pb-24 px-4 overflow-hidden">
        <div class="max-w-7xl mx-auto">
          <div class="grid lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-7">
              <div class="inline-flex items-center space-x-2 py-1.5 px-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wider uppercase mb-6">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span>Available for Strategic UI Roles</span>
              </div>
              <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8">
                Building Enterprise <span class="text-indigo-600">Angular</span> Architectures
              </h1>
              <p class="text-xl text-slate-600 mb-10 max-w-2xl leading-relaxed">
                Senior Front-End professional with <span class="font-bold text-slate-900 underline decoration-indigo-500/30 decoration-4">7+ years of expertise</span>. 
                I specialize in high-performance Single Page Applications across Healthcare, BFSI, and SaaS domains using the latest Angular features (v4-v18).
              </p>
              
              <div class="flex flex-wrap gap-4 mb-12">
                <a href="#experience" class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl hover:-translate-y-1">View Career Timeline</a>
                <a href="#skills" class="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm hover:-translate-y-1">Tech Stack</a>
              </div>
              
              <div class="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 max-w-lg">
                 <div>
                    <p class="text-4xl font-black text-slate-900 leading-none">07</p>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Years of Mastery</p>
                 </div>
                 <div>
                    <p class="text-4xl font-black text-slate-900 leading-none">15+</p>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Versions Handled</p>
                 </div>
                 <div>
                    <p class="text-4xl font-black text-slate-900 leading-none">05</p>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Key Domains</p>
                 </div>
              </div>
            </div>
            
            <!-- Tech Summary Component -->
            <div class="lg:col-span-5 relative">
              <div class="absolute -inset-10 bg-indigo-500/5 rounded-full blur-3xl"></div>
              <div class="relative bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100">
                <div class="flex items-center justify-between mb-8">
                  <h3 class="text-xl font-bold text-slate-900 flex items-center">
                    <svg class="mr-3 text-indigo-600" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                    Tech Summary
                  </h3>
                  <span class="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded">2026 UPDATE</span>
                </div>
                <div class="space-y-6">
                  @for (skill of featuredSkills; track skill.name) {
                    <div class="space-y-2">
                      <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-700 font-bold">{{skill.name}}</span>
                        <span class="text-indigo-600 font-black">{{skill.level}}%</span>
                      </div>
                      <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-sm shadow-indigo-200 transition-all duration-1000" [style.width]="skill.level + '%'"></div>
                      </div>
                    </div>
                  }
                </div>
                <div class="mt-10 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p class="text-sm font-medium text-slate-600 leading-relaxed italic">
                    "Expertise in state management (NgRx/RxJS) and API performance optimization reducing response times for enterprise-grade SPAs."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Professional Experience Section -->
      <section id="experience" class="py-24 bg-slate-100/40 border-y border-slate-200">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center mb-20">
            <h2 class="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Professional Experience</h2>
            <p class="text-slate-500 font-medium">Over 7 years of engineering growth and domain expertise</p>
            <div class="w-16 h-1.5 bg-indigo-600 mx-auto rounded-full mt-6"></div>
          </div>

          <div class="relative">
            <!-- Central Line -->
            <div class="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2"></div>
            
            <div class="space-y-20 lg:space-y-0">
              @for (job of experience; track job.id; let first = $first; let last = $last) {
                <div class="relative lg:h-auto lg:py-10">
                  <div class="flex flex-col lg:flex-row items-center">
                    
                    <!-- Left Side (Content for odd, Date for even) -->
                    <div class="w-full lg:w-1/2 lg:px-12 mb-6 lg:mb-0" [class]="job.id % 2 !== 0 ? 'lg:text-right lg:order-1' : 'lg:order-2 lg:text-left'">
                      @if (job.id % 2 !== 0) {
                        <div class="inline-block px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest mb-4">
                          {{job.period}}
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">{{job.company}}</h3>
                        <p class="text-indigo-600 font-bold mb-4">{{job.role}}</p>
                        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 inline-block w-full text-left">
                          <ul class="space-y-3">
                            @for (point of job.highlights; track point) {
                              <li class="text-slate-600 text-sm flex items-start gap-3">
                                <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                <span>{{point}}</span>
                              </li>
                            }
                          </ul>
                        </div>
                      } @else {
                        <div class="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-widest mb-4">
                          {{job.period}}
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">{{job.company}}</h3>
                        <p class="text-indigo-600 font-bold mb-2">{{job.role}}</p>
                      }
                    </div>

                    <!-- Dot -->
                    <div class="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-slate-50 bg-white items-center justify-center z-10 shadow-lg">
                      <div class="w-4 h-4 rounded-full" [class]="job.id === 1 ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'"></div>
                    </div>

                    <!-- Right Side (Date for odd, Content for even) -->
                    <div class="w-full lg:w-1/2 lg:px-12" [class]="job.id % 2 !== 0 ? 'lg:order-2 lg:text-left' : 'lg:order-1 lg:text-right'">
                      @if (job.id % 2 === 0) {
                        <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 inline-block w-full text-left">
                          <ul class="space-y-3">
                            @for (point of job.highlights; track point) {
                              <li class="text-slate-600 text-sm flex items-start gap-3">
                                <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                                <span>{{point}}</span>
                              </li>
                            }
                          </ul>
                        </div>
                      } @else {
                        <div class="hidden lg:block h-20"></div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Technical Proficiency Section -->
      <section id="skills" class="py-24 px-4 relative overflow-hidden">
        <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div class="max-w-7xl mx-auto relative">
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div class="text-left">
              <h2 class="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Technical Proficiency</h2>
              <p class="text-slate-500 max-w-lg font-medium">A specialized toolkit refined over thousands of development hours and complex project cycles.</p>
            </div>
            <div class="flex items-center space-x-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
               <span class="text-xs font-bold text-slate-400 px-3">FILTER BY:</span>
               <button class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 transition-all">ALL SKILLS</button>
               <button class="px-4 py-2 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all">CORE</button>
            </div>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for (group of skillGroups; track group.title) {
              <div class="group p-8 rounded-[2rem] bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col h-full">
                <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  <img [src]="group.icon" alt="">
                </div>
                <h3 class="text-xl font-black text-slate-900 mb-6 tracking-tight uppercase">{{group.title}}</h3>
                <div class="flex flex-wrap gap-2 mt-auto">
                  @for (skill of group.skills; track skill) {
                    <span class="px-3 py-1.5 bg-slate-50 text-slate-700 text-[11px] font-bold rounded-xl border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-colors">
                      {{skill}}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
          
          <!-- Competencies Grid -->
          <div class="mt-20 grid md:grid-cols-3 gap-8">
             <div class="p-8 bg-slate-900 rounded-[2rem] text-white">
                <h4 class="text-indigo-400 font-black text-xs tracking-widest uppercase mb-4">Core Competency</h4>
                <p class="text-xl font-bold leading-snug">Front-End Architecture & SPA Development</p>
             </div>
             <div class="p-8 bg-indigo-600 rounded-[2rem] text-white">
                <h4 class="text-indigo-200 font-black text-xs tracking-widest uppercase mb-4">Core Competency</h4>
                <p class="text-xl font-bold leading-snug">NgRx State Management & RxJS Reactivity</p>
             </div>
             <div class="p-8 bg-white border border-slate-200 rounded-[2rem] text-slate-900 shadow-sm">
                <h4 class="text-indigo-600 font-black text-xs tracking-widest uppercase mb-4">Core Competency</h4>
                <p class="text-xl font-bold leading-snug">API & Performance Optimization</p>
             </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="py-24 px-4 bg-slate-950 text-white relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,70,229,0.1),transparent)] pointer-events-none"></div>
        <div class="max-w-5xl mx-auto">
          <div class="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 class="text-5xl font-black mb-8 leading-tight tracking-tight">Ready to collaborate on <span class="text-indigo-500 underline underline-offset-8 decoration-white/20">strategic</span> UI projects?</h2>
              <p class="text-slate-400 text-lg mb-12 leading-relaxed">
                Currently looking for senior roles where I can leverage my 7+ years of Angular expertise to build robust, scalable architectures.
              </p>
              
              <div class="space-y-6">
                <div class="flex items-center space-x-5 group">
                  <div class="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest">Email ID</p>
                    <p class="text-xl font-bold text-slate-100">sachinbudnibnt&#64;gmail.com</p>
                  </div>
                </div>
                <div class="flex items-center space-x-5 group">
                  <div class="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest">Direct Line</p>
                    <p class="text-xl font-bold text-slate-100">+91 8951024495</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-md">
              <div class="text-center">
                 <div class="w-20 h-20 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-3xl font-black mb-6">SB</div>
                 <h3 class="text-2xl font-bold mb-2">Sachin Budni</h3>
                 <p class="text-slate-500 mb-8 font-medium">Bangalore, India</p>
                 <div class="flex flex-col gap-4">
                    <button class="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-white/5 hover:bg-indigo-500 hover:text-white transition-all">Download Full Resume</button>
                    <a href="https://www.linkedin.com/in/sachin-budni-1b4624345/" target="_blank" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-white/5 hover:bg-white hover:text-slate-950 transition-all text-center">LinkedIn Profile</a>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-12 bg-white px-4 text-center border-t border-slate-100">
        <div class="flex flex-col items-center gap-4">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-[10px]">S</div>
            <span class="text-sm font-black text-slate-900 tracking-tighter uppercase">Portfolio 2026</span>
          </div>
          <p class="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">Designed & Built for High Performance Systems</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    @keyframes slide-in-from-top {
      from { transform: translateY(-10%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-in {
      animation: slide-in-from-top 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    :host { scroll-behavior: smooth; }
  `]
})
export class App {
  isMenuOpen = signal(false);

  featuredSkills = [
    { name: 'Angular Architecture (v4-18)', level: 98 },
    { name: 'RxJS & Reactive Patterns', level: 94 },
    { name: 'NgRx State Management', level: 92 },
    { name: 'Performance Optimization', level: 89 },
    { name: 'TypeScript & JavaScript', level: 96 }
  ];

  skillGroups = [
    {
      title: 'Frameworks',
      icon: `framework.svg`,
      skills: ['Angular v4-v18', 'NgRx', 'RxJS', 'Sass/SCSS', 'Tailwind CSS']
    },
    {
      title: 'UI & Design',
      icon: `ui_design.svg`,
      skills: ['Angular Material', 'Material UI', 'Bootstrap', 'HTML5/CSS3', 'Cross-Browser Comp.']
    },
    {
      title: 'Development',
      icon: `development.svg`,
      skills: ['TypeScript', 'ES6+', 'RESTful APIs', 'Unit Testing', 'CI/CD Pipelines']
    },
    {
      title: 'Management',
      icon: `management.svg`,
      skills: ['Git', 'Azure DevOps', 'Jira', 'Agile/Scrum', 'Stakeholder Comm.']
    }
  ];

  experience = [
    {
      id: 1,
      period: 'Feb 2025 - Present',
      company: 'BOP Consultant Private',
      role: 'Sr. Software Developer',
      highlights: [
        'Architecting Healthcare SPAs using Angular 15+',
        'Leading NgRx-based state management implementation for enterprise scalability',
        'Driving performance optimizations and mentoring junior development staff',
        'Executing complex requirement analysis and sprint planning for high-stakes projects'
      ]
    },
    {
      id: 2,
      period: 'May 2024 - Jan 2025',
      company: 'R Systems International',
      role: 'Sr. Software Developer',
      highlights: [
        'Delivered real estate platforms featuring dynamic filtering and data visualization',
        'Streamlined delivery via Azure DevOps pipelines and Git version control',
        'Reduced response times significantly through advanced API caching strategies',
        'Translated complex business requirements into high-fidelity technical deliverables'
      ]
    },
    {
      id: 3,
      period: 'Aug 2022 - May 2024',
      company: 'LTIMindtree Private Limited',
      role: 'Sr. Software Developer',
      highlights: [
        'Engineered BFSI retailer management modules using Angular 14+',
        'Implemented reactive forms for complex financial transaction workflows',
        'Utilized NgRx and RxJS to improve application maintainability and scalability',
        'Active participant in Agile ceremonies using Jira and Microsoft Teams'
      ]
    },
    {
      id: 4,
      period: 'Jan 2020 - Aug 2022',
      company: 'IQGateway Private Limited',
      role: 'Sr. Software Developer',
      highlights: [
        'Developed high-performance SPAs for Healthcare and Job Portal domains',
        'Designed responsive UI components using Material UI and Bootstrap',
        'Maintained scalable application states via robust RxJS/NgRx architectures',
        'Prioritized feature delivery through direct client communication and analysis'
      ]
    },
    {
      id: 5,
      period: 'Apr 2018 - Apr 2019',
      company: 'BizRuntime IT Services',
      role: 'Software Engineer',
      highlights: [
        'Built SaaS applications for Oil & Gas clients using Angular 4/6',
        'Developed real-time chat, channel, and hashtag modules with dynamic rendering',
        'Coordinated international project delivery using Slack, Skype, and Redmine'
      ]
    }
  ];

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
}