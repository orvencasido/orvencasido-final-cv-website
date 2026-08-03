import {
  Profile,
  SocialLink,
  Skill,
  Blog,
  Project,
  Experience,
  Certification,
  Education,
  ContactMessage,
  SiteSettings,
} from '../types';

export const initialProfile: Profile = {
  id: 'prof_1',
  full_name: 'Orven Casido',
  professional_title: 'Senior DevOps & Full-Stack Engineer',
  introduction:
    'Architecting resilient cloud infrastructures, CI/CD automation pipelines, and high-performance web applications with modern technology stacks.',
  biography:
    'Passionate engineer with over 6 years of experience building scalable microservices, automated Kubernetes clusters, continuous integration systems, and modern frontend platforms. Focused on performance, developer ergonomics, and infrastructure reliability.',
  profile_image_url:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
  resume_url: '/resume.pdf',
  email: 'orvencasidop@gmail.com',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA / Remote',
  availability_status: 'available',
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date().toISOString(),
};

export const initialSocialLinks: SocialLink[] = [
  {
    id: 'soc_1',
    platform: 'GitHub',
    label: 'github.com/orvencasido',
    url: 'https://github.com',
    icon: 'Github',
    sort_order: 1,
    is_visible: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'soc_2',
    platform: 'LinkedIn',
    label: 'linkedin.com/in/orvencasido',
    url: 'https://linkedin.com',
    icon: 'Linkedin',
    sort_order: 2,
    is_visible: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'soc_3',
    platform: 'Gmail',
    label: 'orvencasidop@gmail.com',
    url: 'mailto:orvencasidop@gmail.com',
    icon: 'Mail',
    sort_order: 3,
    is_visible: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialSkills: Skill[] = [
  { id: 'sk_1', name: 'Kubernetes', category: 'DevOps & Cloud', proficiency: 95, icon: 'kubernetes', sort_order: 1, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_2', name: 'Docker', category: 'DevOps & Cloud', proficiency: 95, icon: 'docker', sort_order: 2, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_3', name: 'Linux', category: 'DevOps & Cloud', proficiency: 92, icon: 'linux', sort_order: 3, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_4', name: 'Git', category: 'DevOps & Cloud', proficiency: 95, icon: 'git', sort_order: 4, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_5', name: 'AWS', category: 'DevOps & Cloud', proficiency: 92, icon: 'amazonaws', sort_order: 5, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_6', name: 'Azure', category: 'DevOps & Cloud', proficiency: 88, icon: 'azure', sort_order: 6, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_7', name: 'Bash', category: 'DevOps & Cloud', proficiency: 90, icon: 'gnubash', sort_order: 7, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_8', name: 'Python', category: 'Backend & APIs', proficiency: 90, icon: 'python', sort_order: 8, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_9', name: 'Helm', category: 'DevOps & Cloud', proficiency: 90, icon: 'helm', sort_order: 9, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_10', name: 'Terraform', category: 'DevOps & Cloud', proficiency: 92, icon: 'terraform', sort_order: 10, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_11', name: 'Ansible', category: 'DevOps & Cloud', proficiency: 85, icon: 'ansible', sort_order: 11, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_12', name: 'ArgoCD', category: 'DevOps & Cloud', proficiency: 88, icon: 'argocd', sort_order: 12, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_13', name: 'GitHub', category: 'Tools & Methods', proficiency: 95, icon: 'github', sort_order: 13, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_14', name: 'Jenkins', category: 'DevOps & Cloud', proficiency: 88, icon: 'jenkins', sort_order: 14, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_15', name: 'Bitbucket', category: 'Tools & Methods', proficiency: 85, icon: 'bitbucket', sort_order: 15, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_16', name: 'Jira', category: 'Tools & Methods', proficiency: 90, icon: 'jira', sort_order: 16, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_17', name: 'Confluence', category: 'Tools & Methods', proficiency: 88, icon: 'confluence', sort_order: 17, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_18', name: 'Prometheus', category: 'DevOps & Cloud', proficiency: 90, icon: 'prometheus', sort_order: 18, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_19', name: 'Grafana', category: 'DevOps & Cloud', proficiency: 90, icon: 'grafana', sort_order: 19, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_20', name: 'OpenAI', category: 'Tools & Methods', proficiency: 90, icon: 'openai', sort_order: 20, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_21', name: 'React', category: 'Frontend', proficiency: 92, icon: 'react', sort_order: 21, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_22', name: 'Node.js', category: 'Backend & APIs', proficiency: 92, icon: 'nodedotjs', sort_order: 22, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk_23', name: 'Nginx', category: 'DevOps & Cloud', proficiency: 90, icon: 'nginx', sort_order: 23, is_visible: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const initialBlogs: Blog[] = [
  {
    id: 'blog_1',
    title: 'Building Zero-Downtime Deployment Pipelines with Kubernetes and ArgoCD',
    slug: 'zero-downtime-kubernetes-argocd',
    summary:
      'A comprehensive blueprint for setting up GitOps workflows that eliminate service interruptions during high-concurrency production deployments.',
    content: `
# Building Zero-Downtime Deployment Pipelines with Kubernetes and ArgoCD

Modern cloud-native engineering demands continuous delivery pipelines that run without interrupting active user traffic. In this deep dive, we explore how GitOps principles implemented via **ArgoCD** and **Kubernetes rolling updates** guarantee 99.99% availability.

## Why GitOps?

GitOps treats your infrastructure declaratively. By enforcing Git repositories as the single source of truth, teams gain:
1. Auditable change tracking.
2. Instant rollbacks to known stable commits.
3. Automated synchronization between cluster states and code repositories.

## Readiness and Liveness Probes

To achieve seamless traffic shifting, properly configured HTTP probes are non-negotiable:

\`\`\`yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
\`\`\`

## Rollout Strategy

Using Argo Rollouts with Canary strategy allows progressive traffic delivery (10% -> 25% -> 50% -> 100%) validated by automated Prometheus metrics.
    `,
    cover_image_url:
      'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=1200',
    author: 'Orven Casido',
    tags: ['Kubernetes', 'DevOps', 'GitOps', 'CI/CD'],
    reading_time: '6 min read',
    status: 'published',
    is_featured: true,
    published_at: '2026-03-15',
    created_at: '2026-03-15T00:00:00.000Z',
    updated_at: '2026-03-15T00:00:00.000Z',
  },
  {
    id: 'blog_2',
    title: 'Supabase Row Level Security (RLS) Best Practices for Multi-Tenant Apps',
    slug: 'supabase-rls-best-practices-multi-tenant',
    summary:
      'How to enforce bulletproof database security and isolated data schemas in Postgres using Supabase RLS policies and JWT claims.',
    content: `
# Supabase Row Level Security (RLS) Best Practices

Securing tenant data at the database layer ensures that even if application API boundaries fail, raw data leakage remains impossible.

## Enabling RLS

Always enable RLS immediately after creating a table:

\`\`\`sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
\`\`\`

## Writing Granular Policies

\`\`\`sql
CREATE POLICY "Users can manage their own projects"
ON projects
FOR ALL
USING (auth.uid() = user_id);
\`\`\`

This guarantees that queries returning rows filter at the PostgreSQL engine level automatically.
    `,
    cover_image_url:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
    author: 'Orven Casido',
    tags: ['Supabase', 'Postgres', 'Security', 'Backend'],
    reading_time: '4 min read',
    status: 'published',
    is_featured: true,
    published_at: '2026-02-10',
    created_at: '2026-02-10T00:00:00.000Z',
    updated_at: '2026-02-10T00:00:00.000Z',
  },
  {
    id: 'blog_3',
    title: 'Optimizing Next.js App Router Performance & Server Components',
    slug: 'optimizing-nextjs-app-router-performance',
    summary:
      'Patterns for reducing JavaScript bundle sizes, leveraging streaming SSR with Suspense, and optimizing dynamic data fetching.',
    content: `
# Optimizing Next.js App Router Performance

React Server Components (RSC) fundamentally shift how web applications render and ship assets to client devices.

## Rules of Thumb
- Keep state local to interactive client nodes.
- Pass promises into Suspense boundaries for non-blocking page loads.
- Cache database queries with React cache() or Next.js fetch tags.
    `,
    cover_image_url:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    author: 'Orven Casido',
    tags: ['Next.js', 'React', 'TypeScript', 'Performance'],
    reading_time: '5 min read',
    status: 'published',
    is_featured: false,
    published_at: '2026-01-20',
    created_at: '2026-01-20T00:00:00.000Z',
    updated_at: '2026-01-20T00:00:00.000Z',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'proj_1',
    title: 'CloudPulse - Multi-Cloud Observability Dashboard',
    slug: 'cloudpulse-observability-dashboard',
    short_description:
      'Real-time infrastructure monitoring platform unifying telemetry metrics across GCP, AWS, and Kubernetes workloads.',
    full_description:
      'CloudPulse provides real-time telemetry, automated anomaly alerts, and centralized log aggregation for enterprise microservice architectures. Built with Go microservices, React, and Prometheus backends.',
    cover_image_url:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    technologies: ['Go', 'TypeScript', 'Kubernetes', 'Prometheus', 'Grafana', 'Tailwind CSS'],
    github_url: 'https://github.com/orvencasido/cloudpulse',
    live_url: 'https://cloudpulse-demo.com',
    status: 'completed',
    completion_date: '2026-02',
    is_featured: true,
    sort_order: 1,
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj_2',
    title: 'InfraFlow - Infrastructure-as-Code Automation Platform',
    slug: 'infraflow-iac-automation',
    short_description:
      'Self-service portal for developers to safely provision Terraform environments with policy-as-code validation.',
    full_description:
      'InfraFlow eliminates cloud provision bottlenecks by giving developers self-service access to pre-approved Terraform blueprints while enforcing security guardrails with Open Policy Agent (OPA).',
    cover_image_url:
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=1200',
    technologies: ['Next.js', 'Terraform', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'AWS'],
    github_url: 'https://github.com/orvencasido/infraflow',
    live_url: 'https://infraflow.io',
    status: 'completed',
    completion_date: '2025-11',
    is_featured: true,
    sort_order: 2,
    created_at: new Date('2025-11-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj_3',
    title: 'DevNexus - Minimalist CMS & Developer Portfolio Engine',
    slug: 'devnexus-minimalist-cms',
    short_description:
      'Ultra-fast headless portfolio engine integrated with Supabase, clean admin management, and custom themes.',
    full_description:
      'A modern developer portfolio and content management system equipped with dynamic blog post scheduling, project tag filters, certification tracking, and passwordless admin management.',
    cover_image_url:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Zod', 'Vite'],
    github_url: 'https://github.com/orvencasido/devnexus',
    live_url: 'https://devnexus.dev',
    status: 'maintained',
    completion_date: '2026-03',
    is_featured: true,
    sort_order: 3,
    created_at: new Date('2026-03-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialExperiences: Experience[] = [
  {
    id: 'exp_1',
    company: 'Nexus Cloud Technologies',
    position: 'Lead DevOps Engineer',
    employment_type: 'Full-time',
    location: 'San Francisco, CA (Hybrid)',
    start_date: '2023-04',
    end_date: null,
    is_current: true,
    description:
      'Architected cloud deployment pipelines and container orchestration for multi-region SaaS applications.',
    responsibilities: [
      'Led migration from monolithic VMs to automated EKS Kubernetes clusters, reducing infrastructure costs by 32%.',
      'Implemented GitOps workflows using ArgoCD and GitHub Actions for over 40 microservices.',
      'Designed automated disaster recovery plans with cross-region database replication.',
    ],
    achievements: [
      'Reduced deployment lead time from 4 hours to 12 minutes.',
      'Achieved 99.99% system uptime across high-traffic enterprise applications.',
    ],
    technologies: ['AWS', 'Kubernetes', 'Terraform', 'ArgoCD', 'Prometheus', 'Go'],
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp_2',
    company: 'Apex Systems Inc.',
    position: 'Senior Infrastructure & Full-Stack Developer',
    employment_type: 'Full-time',
    location: 'Remote',
    start_date: '2021-02',
    end_date: '2023-03',
    is_current: false,
    description:
      'Built developer tooling platforms, internal dashboards, and serverless infrastructure on Google Cloud Platform.',
    responsibilities: [
      'Developed high-throughput REST and GraphQL APIs in Node.js and TypeScript.',
      'Constructed IaC modules in Terraform for automated GCP Cloud Run and Firestore provisioning.',
      'Mentored junior engineers on containerization best practices and security compliance.',
    ],
    achievements: [
      'Automated tenant provisioning, cutting onboarding effort from 2 days to 5 minutes.',
    ],
    technologies: ['GCP', 'TypeScript', 'Node.js', 'React', 'Docker', 'PostgreSQL'],
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp_3',
    company: 'Vanguard Software Solutions',
    position: 'Software Engineer',
    employment_type: 'Full-time',
    location: 'San Jose, CA',
    start_date: '2019-06',
    end_date: '2021-01',
    is_current: false,
    description:
      'Contributed to core web services and CI testing pipelines for financial technology solutions.',
    responsibilities: [
      'Developed responsive frontend interfaces in React and Tailwind CSS.',
      'Maintained automated unit and end-to-end integration testing suites.',
    ],
    achievements: [
      'Maintained 95%+ code coverage across critical user payment workflows.',
    ],
    technologies: ['React', 'JavaScript', 'Python', 'Docker', 'Jest'],
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialCertifications: Certification[] = [
  {
    id: 'cert_1',
    name: 'AWS Certified Solutions Architect – Professional',
    issuing_organization: 'Amazon Web Services',
    issue_date: '2024-05',
    expiration_date: '2027-05',
    credential_id: 'AWS-SAP-89421',
    credential_url: 'https://aws.amazon.com/verification',
    certificate_image_url:
      'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800',
    description:
      'Demonstrates advanced technical expertise in designing distributed systems on AWS.',
    skills: ['Cloud Architecture', 'AWS', 'Security', 'Cost Optimization', 'High Availability'],
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cert_2',
    name: 'Certified Kubernetes Administrator (CKA)',
    issuing_organization: 'Linux Foundation / CNCF',
    issue_date: '2023-11',
    expiration_date: '2026-11',
    credential_id: 'LF-CKA-77312',
    credential_url: 'https://www.cncf.io/certification/cka/',
    certificate_image_url:
      'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=800',
    description:
      'Validates ability to perform administration, networking, security, and troubleshooting on production Kubernetes clusters.',
    skills: ['Kubernetes', 'Container Security', 'Cluster Networking', 'ETCD Administration'],
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cert_3',
    name: 'HashiCorp Certified: Terraform Associate',
    issuing_organization: 'HashiCorp',
    issue_date: '2023-02',
    expiration_date: '2025-02',
    credential_id: 'HC-TA-10492',
    credential_url: 'https://www.credly.com',
    certificate_image_url:
      'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=800',
    description:
      'Certifies fundamental IaC concepts, HCL syntax, Terraform Cloud, and state management.',
    skills: ['Terraform', 'Infrastructure as Code', 'HCL', 'State Management'],
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialEducation: Education[] = [
  {
    id: 'edu_1',
    school: 'University of California, Berkeley',
    degree: 'Bachelor of Science',
    field_of_study: 'Computer Science & Engineering',
    location: 'Berkeley, CA',
    start_date: '2015-08',
    end_date: '2019-05',
    description:
      'Focused on operating systems, distributed computing, database engineering, and software design patterns.',
    awards: ['Dean’s Honor List (4 semesters)', 'Cum Laude Graduate'],
    activities: ['ACM Student Chapter Officer', 'Hacks for Good Organizer'],
    coursework: [
      'Operating Systems & Kernel Engineering',
      'Distributed Systems Architecture',
      'Database Management Systems',
      'Computer Networks & Protocols',
      'Algorithms & Data Structures',
    ],
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialContactMessages: ContactMessage[] = [
  {
    id: 'msg_1',
    name: 'Sarah Lin',
    email: 'sarah.lin@techrecruiters.com',
    subject: 'Senior Infrastructure Role Opportunity',
    message:
      'Hi Orven, I reviewed your open-source projects and Kubernetes articles. We are currently looking for a Lead DevOps Architect to head our platform team at TechCorp. Would love to connect!',
    status: 'unread',
    is_read: false,
    created_at: new Date('2026-07-28T14:32:00').toISOString(),
    updated_at: new Date('2026-07-28T14:32:00').toISOString(),
  },
  {
    id: 'msg_2',
    name: 'Marcus Vance',
    email: 'marcus@cloudconsulting.io',
    subject: 'Terraform & Kubernetes Consulting Project',
    message:
      'Hey Orven, we need a 6-week contract expert to review our Terraform IaC state files and optimize our GCP GKE cluster setups. Are you open for contract work right now?',
    status: 'read',
    is_read: true,
    created_at: new Date('2026-07-20T09:15:00').toISOString(),
    updated_at: new Date('2026-07-21T10:00:00').toISOString(),
  },
];

export const initialSiteSettings: SiteSettings = {
  id: 'settings_1',
  website_title: 'Orven Casido | Personal Portfolio & DevOps Engineer',
  website_description:
    'Official portfolio, resume, and technical articles by Orven Casido, Senior DevOps & Full-Stack Engineer.',
  logo_initials: 'OC',
  favicon_url: '/favicon.ico',
  seo_keywords:
    'Orven Casido, DevOps Engineer, Cloud Architect, Kubernetes, Terraform, Next.js, React, Supabase, TypeScript',
  footer_text: '© 2026 Orven Casido. Built with Next.js, Tailwind CSS, & Supabase Architecture.',
  contact_email: 'orvencasidop@gmail.com',
  resume_download_url: '/resume.pdf',
  theme_preference: 'system',
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date().toISOString(),
};
