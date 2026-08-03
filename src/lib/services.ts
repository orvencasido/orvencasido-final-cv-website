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
} from '../types';
import {
  initialProfile,
  initialSocialLinks,
  initialSkills,
  initialBlogs,
  initialProjects,
  initialExperiences,
  initialCertifications,
  initialEducation,
  initialContactMessages,
  initialSiteSettings,
} from './mockData';

// Helper to interact with LocalStorage for persistence in mock mode
function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`orven_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`orven_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

/* ==========================================================================
   PROFILE SERVICES
   ========================================================================== */
export async function getProfile(): Promise<Profile> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('profiles').select('*').single();
    if (!error && data) return data as Profile;
  }
  return getStorageItem<Profile>('profile', initialProfile);
}

export async function updateProfile(profileData: Partial<Profile>): Promise<Profile> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...profileData, updated_at: new Date().toISOString() })
      .eq('id', profileData.id || 'prof_1')
      .select()
      .single();
    if (!error && data) return data as Profile;
  }

  const current = getStorageItem<Profile>('profile', initialProfile);
  const updated: Profile = {
    ...current,
    ...profileData,
    updated_at: new Date().toISOString(),
  };
  setStorageItem('profile', updated);
  return updated;
}

/* ==========================================================================
   BLOG SERVICES
   ========================================================================== */
export async function getBlogs(): Promise<Blog[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('published_at', { ascending: false });
    if (!error && data) return data as Blog[];
  }
  return getStorageItem<Blog[]>('blogs', initialBlogs);
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

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('blogs').insert(newBlog).select().single();
    if (!error && data) return data as Blog;
  }

  const current = getStorageItem<Blog[]>('blogs', initialBlogs);
  const updated = [newBlog, ...current];
  setStorageItem('blogs', updated);
  return newBlog;
}

export async function updateBlog(id: string, blogData: Partial<Blog>): Promise<Blog> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('blogs')
      .update({ ...blogData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as Blog;
  }

  const current = getStorageItem<Blog[]>('blogs', initialBlogs);
  let updatedBlog: Blog | null = null;
  const updated = current.map((item) => {
    if (item.id === id) {
      updatedBlog = { ...item, ...blogData, updated_at: new Date().toISOString() };
      return updatedBlog;
    }
    return item;
  });

  setStorageItem('blogs', updated);
  if (!updatedBlog) throw new Error('Blog not found');
  return updatedBlog;
}

export async function deleteBlog(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (!error) return true;
  }

  const current = getStorageItem<Blog[]>('blogs', initialBlogs);
  const updated = current.filter((item) => item.id !== id);
  setStorageItem('blogs', updated);
  return true;
}

/* ==========================================================================
   PROJECT SERVICES
   ========================================================================== */
export async function getProjects(): Promise<Project[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) return data as Project[];
  }
  return getStorageItem<Project[]>('projects', initialProjects);
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

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('projects').insert(newProject).select().single();
    if (!error && data) return data as Project;
  }

  const current = getStorageItem<Project[]>('projects', initialProjects);
  const updated = [newProject, ...current];
  setStorageItem('projects', updated);
  return newProject;
}

export async function updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...projectData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as Project;
  }

  const current = getStorageItem<Project[]>('projects', initialProjects);
  let updatedProject: Project | null = null;
  const updated = current.map((item) => {
    if (item.id === id) {
      updatedProject = { ...item, ...projectData, updated_at: new Date().toISOString() };
      return updatedProject;
    }
    return item;
  });

  setStorageItem('projects', updated);
  if (!updatedProject) throw new Error('Project not found');
  return updatedProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) return true;
  }

  const current = getStorageItem<Project[]>('projects', initialProjects);
  const updated = current.filter((item) => item.id !== id);
  setStorageItem('projects', updated);
  return true;
}

/* ==========================================================================
   EXPERIENCE SERVICES
   ========================================================================== */
export async function getExperiences(): Promise<Experience[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) return data as Experience[];
  }
  return getStorageItem<Experience[]>('experiences', initialExperiences);
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

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('experiences').insert(newExp).select().single();
    if (!error && data) return data as Experience;
  }

  const current = getStorageItem<Experience[]>('experiences', initialExperiences);
  const updated = [newExp, ...current];
  setStorageItem('experiences', updated);
  return newExp;
}

export async function updateExperience(id: string, expData: Partial<Experience>): Promise<Experience> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('experiences')
      .update({ ...expData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as Experience;
  }

  const current = getStorageItem<Experience[]>('experiences', initialExperiences);
  let updatedExp: Experience | null = null;
  const updated = current.map((item) => {
    if (item.id === id) {
      updatedExp = { ...item, ...expData, updated_at: new Date().toISOString() };
      return updatedExp;
    }
    return item;
  });

  setStorageItem('experiences', updated);
  if (!updatedExp) throw new Error('Experience entry not found');
  return updatedExp;
}

export async function deleteExperience(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (!error) return true;
  }

  const current = getStorageItem<Experience[]>('experiences', initialExperiences);
  const updated = current.filter((item) => item.id !== id);
  setStorageItem('experiences', updated);
  return true;
}

/* ==========================================================================
   CERTIFICATION SERVICES
   ========================================================================== */
export async function getCertifications(): Promise<Certification[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) return data as Certification[];
  }
  return getStorageItem<Certification[]>('certifications', initialCertifications);
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

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('certifications').insert(newCert).select().single();
    if (!error && data) return data as Certification;
  }

  const current = getStorageItem<Certification[]>('certifications', initialCertifications);
  const updated = [newCert, ...current];
  setStorageItem('certifications', updated);
  return newCert;
}

export async function updateCertification(id: string, certData: Partial<Certification>): Promise<Certification> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('certifications')
      .update({ ...certData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as Certification;
  }

  const current = getStorageItem<Certification[]>('certifications', initialCertifications);
  let updatedCert: Certification | null = null;
  const updated = current.map((item) => {
    if (item.id === id) {
      updatedCert = { ...item, ...certData, updated_at: new Date().toISOString() };
      return updatedCert;
    }
    return item;
  });

  setStorageItem('certifications', updated);
  if (!updatedCert) throw new Error('Certification not found');
  return updatedCert;
}

export async function deleteCertification(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (!error) return true;
  }

  const current = getStorageItem<Certification[]>('certifications', initialCertifications);
  const updated = current.filter((item) => item.id !== id);
  setStorageItem('certifications', updated);
  return true;
}

/* ==========================================================================
   EDUCATION SERVICES
   ========================================================================== */
export async function getEducation(): Promise<Education[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) return data as Education[];
  }
  return getStorageItem<Education[]>('education', initialEducation);
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

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('education').insert(newEdu).select().single();
    if (!error && data) return data as Education;
  }

  const current = getStorageItem<Education[]>('education', initialEducation);
  const updated = [newEdu, ...current];
  setStorageItem('education', updated);
  return newEdu;
}

export async function updateEducation(id: string, eduData: Partial<Education>): Promise<Education> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('education')
      .update({ ...eduData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as Education;
  }

  const current = getStorageItem<Education[]>('education', initialEducation);
  let updatedEdu: Education | null = null;
  const updated = current.map((item) => {
    if (item.id === id) {
      updatedEdu = { ...item, ...eduData, updated_at: new Date().toISOString() };
      return updatedEdu;
    }
    return item;
  });

  setStorageItem('education', updated);
  if (!updatedEdu) throw new Error('Education record not found');
  return updatedEdu;
}

export async function deleteEducation(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (!error) return true;
  }

  const current = getStorageItem<Education[]>('education', initialEducation);
  const updated = current.filter((item) => item.id !== id);
  setStorageItem('education', updated);
  return true;
}

/* ==========================================================================
   CONTACT MESSAGE SERVICES
   ========================================================================== */
export async function getContactMessages(): Promise<ContactMessage[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data as ContactMessage[];
  }
  return getStorageItem<ContactMessage[]>('contact_messages', initialContactMessages);
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

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('contact_messages').insert(newMsg).select().single();
    if (!error && data) return data as ContactMessage;
  }

  const current = getStorageItem<ContactMessage[]>('contact_messages', initialContactMessages);
  const updated = [newMsg, ...current];
  setStorageItem('contact_messages', updated);
  return newMsg;
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessage['status'],
  isRead: boolean = true
): Promise<ContactMessage> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status, is_read: isRead, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) return data as ContactMessage;
  }

  const current = getStorageItem<ContactMessage[]>('contact_messages', initialContactMessages);
  let updatedMsg: ContactMessage | null = null;
  const updated = current.map((item) => {
    if (item.id === id) {
      updatedMsg = { ...item, status, is_read: isRead, updated_at: new Date().toISOString() };
      return updatedMsg;
    }
    return item;
  });

  setStorageItem('contact_messages', updated);
  if (!updatedMsg) throw new Error('Message not found');
  return updatedMsg;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (!error) return true;
  }

  const current = getStorageItem<ContactMessage[]>('contact_messages', initialContactMessages);
  const updated = current.filter((item) => item.id !== id);
  setStorageItem('contact_messages', updated);
  return true;
}

/* ==========================================================================
   SITE SETTINGS SERVICES
   ========================================================================== */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('site_settings').select('*').single();
    if (!error && data) return data as SiteSettings;
  }
  return getStorageItem<SiteSettings>('site_settings', initialSiteSettings);
}

export async function updateSiteSettings(settingsData: Partial<SiteSettings>): Promise<SiteSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('site_settings')
      .update({ ...settingsData, updated_at: new Date().toISOString() })
      .eq('id', settingsData.id || 'settings_1')
      .select()
      .single();
    if (!error && data) return data as SiteSettings;
  }

  const current = getStorageItem<SiteSettings>('site_settings', initialSiteSettings);
  const updated: SiteSettings = {
    ...current,
    ...settingsData,
    updated_at: new Date().toISOString(),
  };
  setStorageItem('site_settings', updated);
  return updated;
}

/* ==========================================================================
   SKILLS SERVICES
   ========================================================================== */
export async function getSkills(): Promise<Skill[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) return data as Skill[];
  }
  return getStorageItem<Skill[]>('skills', initialSkills);
}

export async function updateSkills(skills: Skill[]): Promise<Skill[]> {
  if (isSupabaseConfigured && supabase) {
    const { data: existing, error: readError } = await supabase.from('skills').select('id');
    if (readError) throw new Error(readError.message);

    const existingIds = (existing || []).map((item) => item.id);
    const nextIds = skills.map((skill) => skill.id);
    const staleIds = existingIds.filter((id) => !nextIds.includes(id));

    if (skills.length > 0) {
      const { error: upsertError } = await supabase.from('skills').upsert(skills).select();
      if (upsertError) throw new Error(upsertError.message);
    }

    await Promise.all(
      staleIds.map(async (id) => {
        const { error } = await supabase.from('skills').delete().eq('id', id);
        if (error) throw new Error(error.message);
      })
    );
  }

  setStorageItem('skills', skills);
  return skills;
}

/* ==========================================================================
   SOCIAL LINKS SERVICES
   ========================================================================== */
export async function getSocialLinks(): Promise<SocialLink[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) return data as SocialLink[];
  }
  return getStorageItem<SocialLink[]>('social_links', initialSocialLinks);
}

export async function updateSocialLinks(links: SocialLink[]): Promise<SocialLink[]> {
  if (isSupabaseConfigured && supabase) {
    const { data: existing, error: readError } = await supabase.from('social_links').select('id');
    if (readError) throw new Error(readError.message);

    const existingIds = (existing || []).map((item) => item.id);
    const nextIds = links.map((link) => link.id);
    const staleIds = existingIds.filter((id) => !nextIds.includes(id));

    if (links.length > 0) {
      const { error: upsertError } = await supabase.from('social_links').upsert(links).select();
      if (upsertError) throw new Error(upsertError.message);
    }

    await Promise.all(
      staleIds.map(async (id) => {
        const { error } = await supabase.from('social_links').delete().eq('id', id);
        if (error) throw new Error(error.message);
      })
    );
  }

  setStorageItem('social_links', links);
  return links;
}
