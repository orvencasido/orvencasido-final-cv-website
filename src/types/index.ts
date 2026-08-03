export type AvailabilityStatus = 'available' | 'busy' | 'unavailable' | 'open_to_offers';

export interface Profile {
  id: string;
  full_name: string;
  professional_title: string;
  introduction: string;
  biography: string;
  profile_image_url: string;
  resume_url: string;
  email: string;
  phone: string;
  location: string;
  availability_status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'DevOps & Cloud' | 'Backend & APIs' | 'Frontend' | 'Databases & IaC' | 'Tools & Methods';
  proficiency: number; // 1 to 100
  icon?: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export type ContentStatus = 'draft' | 'published';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image_url?: string;
  author: string;
  tags: string[];
  reading_time: string;
  status: ContentStatus;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'completed' | 'in_progress' | 'maintained' | 'archived';

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  cover_image_url?: string;
  technologies: string[];
  github_url: string;
  live_url: string;
  status: ProjectStatus;
  completion_date: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  location: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string | null;
  credential_id: string;
  credential_url: string;
  certificate_image_url: string;
  description: string;
  skills: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field_of_study: string;
  location: string;
  start_date: string;
  end_date: string;
  gpa?: string;
  description: string;
  awards: string[];
  activities: string[];
  coursework: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type MessageStatus = 'unread' | 'read' | 'resolved';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  website_title: string;
  website_description: string;
  logo_initials: string;
  favicon_url: string;
  seo_keywords: string;
  footer_text: string;
  contact_email: string;
  resume_download_url: string;
  theme_preference: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}
