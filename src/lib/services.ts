import { supabase, isSupabaseConfigured } from './supabaseClient';
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
  PublicNavItem,
} from '../types';

export const defaultPublicNavItems: PublicNavItem[] = [
  'home',
  'blogs',
  'projects',
  'experience',
  'certifications',
  'education',
  'contact',
];

function normalizeSiteSettings(settings: SiteSettings): SiteSettings {
  return {
    ...settings,
    visible_nav_items:
      Array.isArray(settings.visible_nav_items) && settings.visible_nav_items.length > 0
        ? settings.visible_nav_items
        : defaultPublicNavItems,
    show_featured_projects:
      typeof settings.show_featured_projects === 'boolean' ? settings.show_featured_projects : true,
    show_featured_blogs:
      typeof settings.show_featured_blogs === 'boolean' ? settings.show_featured_blogs : true,
    show_contact_cta:
      typeof settings.show_contact_cta === 'boolean' ? settings.show_contact_cta : true,
  };
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return supabase;
}

/* ==========================================================================
   PROFILE SERVICES
   ========================================================================== */
export async function getProfile(): Promise<Profile> {
  const client = requireSupabase();
  const { data, error } = await client.from('profiles').select('*').single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function updateProfile(profileData: Partial<Profile>): Promise<Profile> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', profileData.id || 'prof_1')
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

/* ==========================================================================
   BLOG SERVICES
   ========================================================================== */
export async function getBlogs(): Promise<Blog[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('blogs')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as Blog[];
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const blogs = await getBlogs();
  return blogs.find((b) => b.slug === slug) || null;
}

export async function createBlog(blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>): Promise<Blog> {
  const newBlog: Blog = {
    ...blog,
    id: `blog_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const client = requireSupabase();
  const { data, error } = await client.from('blogs').insert(newBlog).select().single();
  if (error) throw new Error(error.message);
  return data as Blog;
}

export async function updateBlog(id: string, blogData: Partial<Blog>): Promise<Blog> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('blogs')
    .update({ ...blogData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Blog;
}

export async function deleteBlog(id: string): Promise<boolean> {
  const client = requireSupabase();
  const { error } = await client.from('blogs').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

/* ==========================================================================
   PROJECT SERVICES
   ========================================================================== */
export async function getProjects(): Promise<Project[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug) || null;
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const newProject: Project = {
    ...project,
    id: `proj_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const client = requireSupabase();
  const { data, error } = await client.from('projects').insert(newProject).select().single();
  if (error) throw new Error(error.message);
  return data as Project;
}

export async function updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('projects')
    .update({ ...projectData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Project;
}

export async function deleteProject(id: string): Promise<boolean> {
  const client = requireSupabase();
  const { error } = await client.from('projects').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

/* ==========================================================================
   EXPERIENCE SERVICES
   ========================================================================== */
export async function getExperiences(): Promise<Experience[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('experiences')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Experience[];
}

export async function createExperience(
  exp: Omit<Experience, 'id' | 'created_at' | 'updated_at'>
): Promise<Experience> {
  const newExp: Experience = {
    ...exp,
    id: `exp_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const client = requireSupabase();
  const { data, error } = await client.from('experiences').insert(newExp).select().single();
  if (error) throw new Error(error.message);
  return data as Experience;
}

export async function updateExperience(id: string, expData: Partial<Experience>): Promise<Experience> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('experiences')
    .update({ ...expData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Experience;
}

export async function deleteExperience(id: string): Promise<boolean> {
  const client = requireSupabase();
  const { error } = await client.from('experiences').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

/* ==========================================================================
   CERTIFICATION SERVICES
   ========================================================================== */
export async function getCertifications(): Promise<Certification[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('certifications')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Certification[];
}

export async function createCertification(
  cert: Omit<Certification, 'id' | 'created_at' | 'updated_at'>
): Promise<Certification> {
  const newCert: Certification = {
    ...cert,
    id: `cert_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const client = requireSupabase();
  const { data, error } = await client.from('certifications').insert(newCert).select().single();
  if (error) throw new Error(error.message);
  return data as Certification;
}

export async function updateCertification(id: string, certData: Partial<Certification>): Promise<Certification> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('certifications')
    .update({ ...certData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Certification;
}

export async function deleteCertification(id: string): Promise<boolean> {
  const client = requireSupabase();
  const { error } = await client.from('certifications').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

/* ==========================================================================
   EDUCATION SERVICES
   ========================================================================== */
export async function getEducation(): Promise<Education[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('education')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Education[];
}

export async function createEducation(
  edu: Omit<Education, 'id' | 'created_at' | 'updated_at'>
): Promise<Education> {
  const newEdu: Education = {
    ...edu,
    id: `edu_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const client = requireSupabase();
  const { data, error } = await client.from('education').insert(newEdu).select().single();
  if (error) throw new Error(error.message);
  return data as Education;
}

export async function updateEducation(id: string, eduData: Partial<Education>): Promise<Education> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('education')
    .update({ ...eduData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Education;
}

export async function deleteEducation(id: string): Promise<boolean> {
  const client = requireSupabase();
  const { error } = await client.from('education').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

/* ==========================================================================
   CONTACT MESSAGE SERVICES
   ========================================================================== */
export async function getContactMessages(): Promise<ContactMessage[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as ContactMessage[];
}

export async function createContactMessage(
  msg: Omit<ContactMessage, 'id' | 'status' | 'is_read' | 'created_at' | 'updated_at'>
): Promise<ContactMessage> {
  const newMsg: ContactMessage = {
    ...msg,
    id: `msg_${Date.now()}`,
    status: 'unread',
    is_read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const client = requireSupabase();
  const { data, error } = await client.from('contact_messages').insert(newMsg).select().single();
  if (error) throw new Error(error.message);
  return data as ContactMessage;
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessage['status'],
  isRead: boolean = true
): Promise<ContactMessage> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('contact_messages')
    .update({ status, is_read: isRead, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ContactMessage;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const client = requireSupabase();
  const { error } = await client.from('contact_messages').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

/* ==========================================================================
   SITE SETTINGS SERVICES
   ========================================================================== */
export async function getSiteSettings(): Promise<SiteSettings> {
  const client = requireSupabase();
  const { data, error } = await client.from('site_settings').select('*').single();
  if (error) throw new Error(error.message);
  return normalizeSiteSettings(data as SiteSettings);
}

export async function updateSiteSettings(settingsData: Partial<SiteSettings>): Promise<SiteSettings> {
  const client = requireSupabase();
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  for (const [key, value] of Object.entries(settingsData)) {
    if (value !== undefined) {
      updatePayload[key] = value;
    }
  }

  const { data, error } = await client
    .from('site_settings')
    .update(updatePayload)
    .eq('id', settingsData.id || 'settings_1')
    .select()
    .single();
  if (error) throw new Error(error.message);
  return normalizeSiteSettings(data as SiteSettings);
}

/* ==========================================================================
   SKILLS SERVICES
   ========================================================================== */
export async function getSkills(): Promise<Skill[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Skill[];
}

export async function updateSkills(skills: Skill[]): Promise<Skill[]> {
  const client = requireSupabase();
  const { data: existing, error: readError } = await client.from('skills').select('id');
  if (readError) throw new Error(readError.message);

  const existingIds = (existing || []).map((item) => item.id);
  const nextIds = skills.map((skill) => skill.id);
  const staleIds = existingIds.filter((id) => !nextIds.includes(id));

  if (skills.length > 0) {
    const { error: upsertError } = await client.from('skills').upsert(skills).select();
    if (upsertError) throw new Error(upsertError.message);
  }

  await Promise.all(
    staleIds.map(async (id) => {
      const { error } = await client.from('skills').delete().eq('id', id);
      if (error) throw new Error(error.message);
    })
  );

  return skills;
}

/* ==========================================================================
   SOCIAL LINKS SERVICES
   ========================================================================== */
export async function getSocialLinks(): Promise<SocialLink[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('social_links')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data as SocialLink[];
}

export async function updateSocialLinks(links: SocialLink[]): Promise<SocialLink[]> {
  const client = requireSupabase();
  const { data: existing, error: readError } = await client.from('social_links').select('id');
  if (readError) throw new Error(readError.message);

  const existingIds = (existing || []).map((item) => item.id);
  const nextIds = links.map((link) => link.id);
  const staleIds = existingIds.filter((id) => !nextIds.includes(id));

  if (links.length > 0) {
    const { error: upsertError } = await client.from('social_links').upsert(links).select();
    if (upsertError) throw new Error(upsertError.message);
  }

  await Promise.all(
    staleIds.map(async (id) => {
      const { error } = await client.from('social_links').delete().eq('id', id);
      if (error) throw new Error(error.message);
    })
  );

  return links;
}
