export const CANONICAL_SITE_URL = 'https://www.orvencasido.site';

export interface PageSEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  noindex?: boolean;
}

export const DEFAULT_SEO: PageSEOMetadata = {
  title: 'Orven Casido | Senior DevOps & Cloud Engineer',
  description:
    'Official portfolio of Orven Casido, Senior DevOps & Cloud Engineer specializing in Kubernetes, CI/CD automation, Cloud Architecture (AWS/Azure), Docker, IaC (Terraform), and DevSecOps.',
  keywords: [
    'Orven Casido',
    'DevOps Engineer',
    'Cloud Engineer',
    'Kubernetes',
    'CI/CD Pipelines',
    'Docker',
    'Terraform',
    'Infrastructure as Code',
    'AWS',
    'Microsoft Azure',
    'DevSecOps',
    'Platform Engineering',
    'Linux System Architect',
  ],
  canonicalPath: '/',
  ogType: 'website',
  ogImage: `${CANONICAL_SITE_URL}/orbs-icon.png`,
};

export const PAGE_SEO_CONFIG: Record<string, PageSEOMetadata> = {
  home: {
    ...DEFAULT_SEO,
    canonicalPath: '/',
  },
  projects: {
    title: 'Shipped Projects & Cloud Systems | Orven Casido',
    description:
      'Explore cloud infrastructure, DevOps automations, GitOps pipelines, and full-stack software systems architected and deployed by Orven Casido.',
    keywords: [
      'DevOps Projects',
      'Kubernetes Deployments',
      'GitOps Case Studies',
      'Terraform IaC Projects',
      'Cloud Architecture',
      'Orven Casido Projects',
    ],
    canonicalPath: '/projects',
    ogType: 'website',
  },
  blogs: {
    title: 'Engineering Articles & DevOps Insights | Orven Casido',
    description:
      'Technical writing, deep dives, and practical tutorials on DevOps, cloud migration, container orchestration, CI/CD best practices, and infrastructure automation.',
    keywords: [
      'DevOps Blog',
      'Kubernetes Tutorials',
      'CI/CD Best Practices',
      'Cloud Engineering Articles',
      'Tech Insights',
      'Orven Casido Blog',
    ],
    canonicalPath: '/blogs',
    ogType: 'website',
  },
  experience: {
    title: 'Professional Experience & Career Journey | Orven Casido',
    description:
      'Career timeline, DevOps engineering milestones, key achievements, and technical responsibilities held by Orven Casido across high-impact production environments.',
    keywords: [
      'DevOps Career',
      'Work Experience',
      'Cloud Engineer Roles',
      'System Architecture Achievements',
      'Orven Casido Resume',
    ],
    canonicalPath: '/experience',
    ogType: 'profile',
  },
  certifications: {
    title: 'Cloud & DevOps Certifications | Orven Casido',
    description:
      'Verified certifications, credentials, and continuous learning achievements in Cloud Computing, DevOps methodologies, and Infrastructure Security.',
    keywords: [
      'Cloud Certifications',
      'DevOps Credentials',
      'Kubernetes Certifications',
      'AWS Azure Credentials',
      'Orven Casido Certifications',
    ],
    canonicalPath: '/certifications',
    ogType: 'website',
  },
  education: {
    title: 'Education & Technical Background | Orven Casido',
    description:
      'Academic history, technical coursework, computer engineering studies, and university honors for Orven Casido.',
    keywords: [
      'Education',
      'Computer Engineering',
      'Academic Milestones',
      'Technical Training',
      'Orven Casido Education',
    ],
    canonicalPath: '/education',
    ogType: 'profile',
  },
  contact: {
    title: 'Contact Orven Casido | Senior DevOps & Cloud Engineer',
    description:
      'Get in touch with Orven Casido for senior DevOps engineering opportunities, cloud architecture consulting, or platform engineering collaborations.',
    keywords: [
      'Contact DevOps Engineer',
      'Hire Cloud Architect',
      'DevOps Consulting',
      'Orven Casido Contact',
    ],
    canonicalPath: '/contact',
    ogType: 'website',
  },
  admin: {
    title: 'Admin CMS | Orven Casido',
    description: 'Administrative Content Management System portal.',
    canonicalPath: '/orven',
    noindex: true,
  },
  notFound: {
    title: '404 - Page Not Found | Orven Casido',
    description: 'The requested page could not be located on this website.',
    canonicalPath: '/404',
    noindex: true,
  },
};
