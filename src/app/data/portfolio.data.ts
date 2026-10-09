// All portfolio content lives here so sections stay purely presentational.
// Edit this file to update copy without touching any animation code.

export interface Stat {
  label: string;
  /** Numeric value the counter animates to. */
  value: number;
  /** Zero-pad to this many digits (e.g. 7 → "07"). */
  pad?: number;
  suffix?: string;
}

export interface CoreTech {
  name: string;
  percentage: number;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  isLatest?: boolean;
  achievements: string[];
}

export interface Skill {
  name: string;
  level: string;
  isTech: boolean;
}

export interface SkillCategory {
  title: string;
  /** File name inside /public, used both as a CSS mask and as a WebGL texture. */
  icon: string;
  /** Per-category glow colour (hex) used by the 3D tile and the DOM card. */
  color: string;
  skills: Skill[];
}

export interface Project {
  title: string;
  domain: string;
  description: string;
  tech: string[];
  impact: string;
  company: string;
}

export const PROFILE = {
  name: 'Sachin Budni',
  initials: 'SB',
  role: 'Front-End Architect',
  tagline: 'Strategic Front-End Engineering',
  yearsOfExp: 7,
  location: 'Bangalore, India',
  email: 'sachinbudnibnt@gmail.com',
  phone: '+91 8951024495',
  phoneHref: 'tel:+918951024495',
  resume: 'Professional_resume.pdf',
  architectNote:
    'Specialized in state management and API performance optimization, reducing response times for high-traffic enterprise solutions.',
};

export const STATS: Stat[] = [
  { label: 'Years of Exp.', value: 7, pad: 2 },
  { label: 'Projects Delivered', value: 15, suffix: '+' },
  { label: 'Key Domains', value: 5, pad: 2 },
];

export const CORE_TECH: CoreTech[] = [
  { name: 'Angular Architecture (v4-v18)', percentage: 95 },
  { name: 'RxJS & Reactive Patterns', percentage: 92 },
  { name: 'NgRx State Management', percentage: 88 },
  { name: 'Performance Optimization', percentage: 90 },
];

export const EXPERIENCE: Experience[] = [
  {
    company: 'Tata Medical & Diagnostics',
    role: 'Sr. Software Developer',
    period: 'May 2025 - Present',
    isLatest: true,
    achievements: [
      'Architecting high-scale Angular 15 healthcare platforms with complex data flows.',
      'Implementing enterprise state management using NgRx and custom RxJS streams.',
      'Driving technical requirement analysis and mentorship for front-end teams.',
    ],
  },
  {
    company: 'BOP Consultant Private',
    role: 'Sr. Software Developer',
    period: 'Feb 2025 - April 2026',
    achievements: [
      'Architecting high-scale Angular 15 healthcare platforms with complex data flows.',
      'Implementing enterprise state management using NgRx and custom RxJS streams.',
      'Driving technical requirement analysis and mentorship for front-end teams.',
    ],
  },
  {
    company: 'R Systems International',
    role: 'Sr. Software Developer',
    period: 'May 2024 - Jan 2025',
    achievements: [
      'Delivered real estate SPA with high-performance dynamic filtering & CRUD ops.',
      'Reduced load times by 30% through strategic lazy loading and caching.',
      'Collaborated with stakeholders to translate business needs into technical designs.',
    ],
  },
  {
    company: 'LTIMindtree Private Limited',
    role: 'Sr. Software Developer',
    period: 'Aug 2022 - May 2024',
    achievements: [
      'Built BFSI retailer management modules with robust Reactive Forms.',
      'Enhanced scalability by implementing modular NgRx architecture.',
      'Led Agile ceremonies and performed architecture reviews for critical modules.',
    ],
  },
  {
    company: 'IQGateway Private Limited',
    role: 'Sr. Software Developer',
    period: 'Jan 2020 - Aug 2022',
    achievements: [
      'Delivered Healthcare and Job Portal apps using Angular 12.',
      'Designed high-fidelity, responsive UIs with Material UI and Bootstrap.',
      'Maintained complex state consistency across large-scale job portal modules.',
    ],
  },
  {
    company: 'BizRuntime IT Services Private Limited',
    role: 'Software Developer',
    period: 'Jan 2018 - Aug 2019',
    achievements: [
      'Developed SaaS-based Angular 4/6 SPA applications for Oil and Gas industry clients.',
      'Implemented chat, channel, and hashtag modules with dynamic rendering.',
      'Coordinated with global clients using Slack, Skype, and Redmine for project management and progress tracking.',
    ],
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Frameworks',
    icon: 'frameworks.svg',
    color: '#6366f1',
    skills: [
      { name: 'Angular (v4-v18)', level: 'Expert', isTech: true },
      { name: 'TypeScript', level: 'Expert', isTech: true },
      { name: 'JavaScript (ES6+)', level: 'Expert', isTech: true },
    ],
  },
  {
    title: 'Visual Engineering',
    icon: 'visual-engineering.svg',
    color: '#a855f7',
    skills: [
      { name: 'SCSS / CSS3', level: 'Expert', isTech: true },
      { name: 'Material UI / Tailwind', level: 'Advanced', isTech: true },
      { name: 'Responsive Design', level: 'Expert', isTech: false },
    ],
  },
  {
    title: 'State & Data',
    icon: 'state-data.svg',
    color: '#3b82f6',
    skills: [
      { name: 'NgRx / RxJS', level: 'Expert', isTech: true },
      { name: 'REST API Integration', level: 'Expert', isTech: true },
      { name: 'Performance Tuning', level: 'Advanced', isTech: true },
    ],
  },
  {
    title: 'Strategy',
    icon: 'strategy.svg',
    color: '#10b981',
    skills: [
      { name: 'Agile / Scrum', level: 'Expert', isTech: false },
      { name: 'Requirement Analysis', level: 'Expert', isTech: false },
      { name: 'Mentoring', level: 'Advanced', isTech: false },
    ],
  },
];

// Derived from the experience above — replace with real case studies/links as needed.
export const PROJECTS: Project[] = [
  {
    title: 'Enterprise Healthcare Platform',
    domain: 'Healthcare',
    company: 'Tata Medical & Diagnostics',
    description:
      'High-scale diagnostics platform with complex patient and report data flows, built on a modular Angular architecture.',
    tech: ['Angular 15', 'NgRx', 'RxJS', 'TypeScript'],
    impact: 'Enterprise-wide state model',
  },
  {
    title: 'Real Estate SPA',
    domain: 'Real Estate',
    company: 'R Systems International',
    description:
      'Property discovery app with high-performance dynamic filtering and full CRUD management for listings.',
    tech: ['Angular', 'RxJS', 'Lazy Loading', 'Caching'],
    impact: '30% faster load times',
  },
  {
    title: 'BFSI Retailer Management',
    domain: 'Banking & Finance',
    company: 'LTIMindtree',
    description:
      'Retailer onboarding and management modules with robust, validated Reactive Forms and a modular NgRx store.',
    tech: ['Angular', 'Reactive Forms', 'NgRx', 'Agile'],
    impact: 'Scalable modular architecture',
  },
  {
    title: 'Job Portal & Healthcare Apps',
    domain: 'HR Tech · Healthcare',
    company: 'IQGateway',
    description:
      'Responsive, high-fidelity job portal and healthcare apps keeping complex state consistent across large modules.',
    tech: ['Angular 12', 'Material UI', 'Bootstrap'],
    impact: 'Large-scale state consistency',
  },
  {
    title: 'Oil & Gas SaaS Collaboration',
    domain: 'Energy · SaaS',
    company: 'BizRuntime IT Services',
    description:
      'SaaS SPA for oil and gas clients featuring chat, channels and hashtag modules with dynamic rendering.',
    tech: ['Angular 4/6', 'TypeScript', 'Real-time UI'],
    impact: 'Global client delivery',
  },
];
