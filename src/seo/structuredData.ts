import { CANONICAL_SITE_URL } from './seoConfig';
import { isLiveUrlVisible, getCleanLiveUrl } from '../lib/techIcons';

export interface PersonData {
  name?: string;
  jobTitle?: string;
  email?: string;
  location?: string;
  image?: string;
  socialLinks?: string[];
}

export function getPersonSchema(data?: PersonData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${CANONICAL_SITE_URL}/#person`,
    name: data?.name || 'Orven Casido',
    jobTitle: data?.jobTitle || 'Senior DevOps & Cloud Engineer',
    url: CANONICAL_SITE_URL,
    image: data?.image || `${CANONICAL_SITE_URL}/orbs-icon.png`,
    email: data?.email ? `mailto:${data.email}` : 'mailto:orvencasidop@gmail.com',
    address: data?.location ? { '@type': 'PostalAddress', addressLocality: data.location } : undefined,
    sameAs: data?.socialLinks && data.socialLinks.length > 0
      ? data.socialLinks
      : [
          'https://linkedin.com/in/orvencasido',
          'https://github.com/orvencasido',
        ],
    knowsAbout: [
      'DevOps Engineering',
      'Cloud Architecture',
      'Kubernetes',
      'CI/CD Automation',
      'Docker',
      'Infrastructure as Code (IaC)',
      'Terraform',
      'Amazon Web Services (AWS)',
      'Microsoft Azure',
      'DevSecOps',
      'Linux System Administration',
      'ArgoCD & GitOps',
      'Site Reliability Engineering (SRE)',
    ],
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${CANONICAL_SITE_URL}/#website`,
    url: CANONICAL_SITE_URL,
    name: 'Orven Casido | Senior DevOps & Cloud Engineer',
    description:
      'Official developer portfolio and technical publication site of Orven Casido, Senior DevOps & Cloud Engineer.',
    inLanguage: 'en-US',
    publisher: {
      '@id': `${CANONICAL_SITE_URL}/#person`,
    },
  };
}

export function getProfilePageSchema(data?: PersonData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${CANONICAL_SITE_URL}/#profilepage`,
    url: CANONICAL_SITE_URL,
    name: 'Orven Casido - Portfolio & Career Overview',
    isPartOf: {
      '@id': `${CANONICAL_SITE_URL}/#website`,
    },
    mainEntity: getPersonSchema(data),
  };
}

export function getBlogPostingSchema(blog: {
  title: string;
  summary: string;
  slug: string;
  author: string;
  published_at: string;
  updated_at?: string;
  cover_image_url?: string;
  tags?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${CANONICAL_SITE_URL}/blogs/${blog.slug}#article`,
    headline: blog.title,
    description: blog.summary,
    image: blog.cover_image_url || `${CANONICAL_SITE_URL}/orbs-icon.png`,
    datePublished: blog.published_at,
    dateModified: blog.updated_at || blog.published_at,
    author: {
      '@type': 'Person',
      name: blog.author || 'Orven Casido',
      url: CANONICAL_SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Orven Casido',
      url: CANONICAL_SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${CANONICAL_SITE_URL}/blogs/${blog.slug}`,
    },
    keywords: blog.tags && blog.tags.length > 0 ? blog.tags.join(', ') : undefined,
    inLanguage: 'en-US',
  };
}

export function getProjectSchema(project: {
  title: string;
  short_description: string;
  slug: string;
  cover_image_url?: string;
  technologies?: string[];
  github_url?: string;
  live_url?: string;
  completion_date?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    '@id': `${CANONICAL_SITE_URL}/projects/${project.slug}#software`,
    name: project.title,
    description: project.short_description,
    image: project.cover_image_url || `${CANONICAL_SITE_URL}/orbs-icon.png`,
    codeRepository: project.github_url || undefined,
    targetProduct: isLiveUrlVisible(project.live_url)
      ? {
          '@type': 'SoftwareApplication',
          url: getCleanLiveUrl(project.live_url),
          name: project.title,
        }
      : undefined,
    programmingLanguage: project.technologies || [],
    author: {
      '@type': 'Person',
      name: 'Orven Casido',
      url: CANONICAL_SITE_URL,
    },
  };
}
