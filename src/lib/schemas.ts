import { z } from 'zod';

const imageSourceSchema = z.string();

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const blogSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  slug: z.string().min(3, 'Slug is required'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  cover_image_url: imageSourceSchema,
  author: z.string().min(2, 'Author name is required'),
  tags: z.array(z.string()).min(1, 'Add at least one tag'),
  reading_time: z.string().min(1, 'Reading time required (e.g. 5 min read)'),
  status: z.enum(['draft', 'published']),
  is_featured: z.boolean(),
  published_at: z.string(),
});

export type BlogFormData = z.infer<typeof blogSchema>;

export const projectSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required'),
  short_description: z.string().min(10, 'Short description is required'),
  full_description: z.string().min(20, 'Full description is required'),
  cover_image_url: imageSourceSchema,
  technologies: z.array(z.string()).min(1, 'Select or add at least one technology'),
  github_url: z.string(),
  live_url: z.string(),
  status: z.enum(['completed', 'in_progress', 'maintained', 'archived']),
  completion_date: z.string().min(1, 'Completion date is required'),
  is_featured: z.boolean(),
  sort_order: z.number(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const experienceSchema = z.object({
  company: z.string().min(2, 'Company name required'),
  position: z.string().min(2, 'Position title required'),
  employment_type: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance']),
  location: z.string().min(2, 'Location required'),
  start_date: z.string().min(1, 'Start date required'),
  end_date: z.string().nullable(),
  is_current: z.boolean(),
  description: z.string().min(10, 'Description required'),
  responsibilities: z.array(z.string()),
  achievements: z.array(z.string()),
  technologies: z.array(z.string()),
  sort_order: z.number(),
});

export type ExperienceFormData = z.infer<typeof experienceSchema>;

export const certificationSchema = z.object({
  name: z.string().min(2, 'Certification name required'),
  issuing_organization: z.string().min(2, 'Organization name required'),
  issue_date: z.string().min(1, 'Issue date required'),
  expiration_date: z.string().nullable(),
  credential_id: z.string(),
  credential_url: z.string(),
  certificate_image_url: imageSourceSchema,
  description: z.string(),
  skills: z.array(z.string()),
  sort_order: z.number(),
});

export type CertificationFormData = z.infer<typeof certificationSchema>;

export const educationSchema = z.object({
  school: z.string().min(2, 'School/University name required'),
  degree: z.string().min(2, 'Degree required'),
  field_of_study: z.string().min(2, 'Field of study required'),
  location: z.string().min(2, 'Location required'),
  start_date: z.string().min(1, 'Start date required'),
  end_date: z.string().min(1, 'End date required'),
  gpa: z.string().optional(),
  description: z.string(),
  awards: z.array(z.string()),
  activities: z.array(z.string()),
  coursework: z.array(z.string()),
  sort_order: z.number(),
});

export type EducationFormData = z.infer<typeof educationSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name required'),
  professional_title: z.string().min(2, 'Professional title required'),
  introduction: z.string().min(10, 'Introduction required'),
  profile_image_url: imageSourceSchema,
  resume_url: z.string(),
  email: z.string().email('Valid email required'),
  phone: z.string(),
  location: z.string(),
  availability_status: z.enum(['available', 'busy', 'unavailable', 'open_to_offers']),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const siteSettingsSchema = z.object({
  website_title: z.string().min(2, 'Title required'),
  website_description: z.string().min(10, 'Description required'),
  logo_initials: z.string().min(1).max(4),
  seo_keywords: z.string(),
  footer_text: z.string(),
  contact_email: z.string().email(),
  resume_download_url: z.string(),
  theme_preference: z.enum(['light', 'dark', 'system']),
});

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;
