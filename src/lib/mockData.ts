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

const now = new Date().toISOString();

export const initialProfile: Profile = {
  id: 'prof_1',
  full_name: 'Orven Casido',
  professional_title: 'DevOps Engineer',
  introduction: 'Welcome to my tech journey.',
  profile_image_url: '',
  resume_url: '',
  email: 'orvencasidop@gmail.com',
  phone: '',
  location: '',
  availability_status: 'available',
  created_at: now,
  updated_at: now,
};

export const initialSocialLinks: SocialLink[] = [];

export const initialSkills: Skill[] = [];

export const initialBlogs: Blog[] = [];

export const initialProjects: Project[] = [];

export const initialExperiences: Experience[] = [];

export const initialCertifications: Certification[] = [];

export const initialEducation: Education[] = [];

export const initialContactMessages: ContactMessage[] = [];

export const initialSiteSettings: SiteSettings = {
  id: 'settings_1',
  website_title: 'Orven Casido | Portfolio',
  website_description: 'Official portfolio, resume, and technical writing by Orven Casido.',
  logo_initials: 'OC',
  favicon_url: '/orbs-icon.png',
  seo_keywords: 'Orven Casido, DevOps Engineer, Portfolio',
  footer_text: '(c) 2026 Orven Casido. All rights reserved.',
  contact_email: 'orvencasidop@gmail.com',
  resume_download_url: '',
  theme_preference: 'system',
  created_at: now,
  updated_at: now,
};
