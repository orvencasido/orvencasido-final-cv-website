import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getCached, setCached, invalidateCache, CacheKeys } from './cache';
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
import {
  initialProfile,
  initialSkills,
  initialProjects,
  initialExperiences,
  initialCertifications,
  initialEducation,
  initialBlogs,
  initialSiteSettings,
  initialSocialLinks,
  initialContactMessages,
} from './mockData';

export const defaultPublicNavItems: PublicNavItem[] = [
  'home',
  'blogs',
  'projects',
  'experience',
  'certifications',
  'education',
  'contact',
];

export const StorageFallbackKeys = {
  PROFILE: 'portfolio_profile',
  PROJECTS: 'portfolio_projects',
  BLOGS: 'portfolio_blogs',
  SKILLS: 'portfolio_skills',
  EXPERIENCES: 'portfolio_experiences',
  CERTIFICATIONS: 'portfolio_certifications',
  EDUCATION: 'portfolio_education',
  SITE_SETTINGS: 'portfolio_site_settings',
  SOCIAL_LINKS: 'portfolio_social_links',
  CONTACT_MESSAGES: 'portfolio_contact_messages',
} as const;

export function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Gracefully handle storage quota or private-browsing restrictions
  }
}

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
    floating_video_enabled:
      typeof settings.floating_video_enabled === 'boolean' ? settings.floating_video_enabled : true,
    floating_video_url: settings.floating_video_url ?? '',
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
  const cached = getCached<Profile>(CacheKeys.PROFILE);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').single();
      if (!error && data) {
        const profile = data as Profile;
        setCached(CacheKeys.PROFILE, profile);
        setLocalItem(StorageFallbackKeys.PROFILE, profile);
        return profile;
      }
    } catch {
      // Gracefully fall through to local fallback
    }
  }

  const fallback = getLocalItem<Profile>(StorageFallbackKeys.PROFILE, initialProfile);
  setCached(CacheKeys.PROFILE, fallback);
  return fallback;
}

export async function updateProfile(profileData: Partial<Profile>): Promise<Profile> {
  const payload = { ...profileData, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { data, error } = await client
        .from('profiles')
        .update(payload)
        .eq('id', profileData.id || 'prof_1')
        .select()
        .single();
      if (!error && data) {
        const updated = data as Profile;
        setLocalItem(StorageFallbackKeys.PROFILE, updated);
        invalidateCache(CacheKeys.PROFILE);
        return updated;
      }
    } catch {
      // Fallback to local storage update
    }
  }

  const existing = getLocalItem<Profile>(StorageFallbackKeys.PROFILE, initialProfile);
  const updated: Profile = {
    ...existing,
    ...payload,
    id: existing.id || profileData.id || 'prof_1',
  } as Profile;
  setLocalItem(StorageFallbackKeys.PROFILE, updated);
  invalidateCache(CacheKeys.PROFILE);
  return updated;
}

/* ==========================================================================
   BLOG SERVICES
   ========================================================================== */
export async function getBlogs(): Promise<Blog[]> {
  const cached = getCached<Blog[]>(CacheKeys.BLOGS);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('published_at', { ascending: false });
      if (!error && data) {
        const blogs = data as Blog[];
        setCached(CacheKeys.BLOGS, blogs);
        setLocalItem(StorageFallbackKeys.BLOGS, blogs);
        return blogs;
      }
    } catch {
      // Gracefully fall through to local fallback
    }
  }

  const fallback = getLocalItem<Blog[]>(StorageFallbackKeys.BLOGS, initialBlogs);
  setCached(CacheKeys.BLOGS, fallback);
  return fallback;
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const cacheKey = CacheKeys.blogDetail(slug);
  const cached = getCached<Blog>(cacheKey);
  if (cached) return cached;

  const blogs = await getBlogs();
  const found = blogs.find((b) => b.slug === slug) || null;
  if (found) setCached(cacheKey, found);
  return found;
}

export async function createBlog(blog: Omit<Blog, 'id' | 'created_at' | 'updated_at'>): Promise<Blog> {
  const newBlog: Blog = {
    ...blog,
    id: `blog_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { data, error } = await client.from('blogs').insert(newBlog).select().single();
      if (!error && data) {
        const created = data as Blog;
        const current = getLocalItem<Blog[]>(StorageFallbackKeys.BLOGS, initialBlogs);
        setLocalItem(StorageFallbackKeys.BLOGS, [created, ...current]);
        invalidateCache('cache:blog');
        return created;
      }
    } catch {
      // Fallback to local
    }
  }

  const current = getLocalItem<Blog[]>(StorageFallbackKeys.BLOGS, initialBlogs);
  const updated = [newBlog, ...current];
  setLocalItem(StorageFallbackKeys.BLOGS, updated);
  invalidateCache('cache:blog');
  return newBlog;
}

export async function updateBlog(id: string, blogData: Partial<Blog>): Promise<Blog> {
  const payload = { ...blogData, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { data, error } = await client
        .from('blogs')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const updated = data as Blog;
        const current = getLocalItem<Blog[]>(StorageFallbackKeys.BLOGS, initialBlogs);
        setLocalItem(
          StorageFallbackKeys.BLOGS,
          current.map((b) => (b.id === id ? updated : b))
        );
        invalidateCache('cache:blog');
        return updated;
      }
    } catch {
      // Fallback to local
    }
  }

  const current = getLocalItem<Blog[]>(StorageFallbackKeys.BLOGS, initialBlogs);
  let updatedBlog: Blog | null = null;
  const updated = current.map((b) => {
    if (b.id === id) {
      updatedBlog = { ...b, ...payload } as Blog;
      return updatedBlog;
    }
    return b;
  });

  if (!updatedBlog) {
    throw new Error(`Blog with id ${id} not found.`);
  }

  setLocalItem(StorageFallbackKeys.BLOGS, updated);
  invalidateCache('cache:blog');
  return updatedBlog;
}

export async function deleteBlog(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { error } = await client.from('blogs').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch {
      // Fallback to local
    }
  }

  const current = getLocalItem<Blog[]>(StorageFallbackKeys.BLOGS, initialBlogs);
  setLocalItem(
    StorageFallbackKeys.BLOGS,
    current.filter((b) => b.id !== id)
  );
  invalidateCache('cache:blog');
  return true;
}

/* ==========================================================================
   PROJECT SERVICES
   ========================================================================== */
export async function getProjects(): Promise<Project[]> {
  const cached = getCached<Project[]>(CacheKeys.PROJECTS);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        const projects = data as Project[];
        setCached(CacheKeys.PROJECTS, projects);
        setLocalItem(StorageFallbackKeys.PROJECTS, projects);
        return projects;
      }
    } catch {
      // Gracefully fall through to local fallback
    }
  }

  const fallback = getLocalItem<Project[]>(StorageFallbackKeys.PROJECTS, initialProjects);
  setCached(CacheKeys.PROJECTS, fallback);
  return fallback;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const cacheKey = CacheKeys.projectDetail(slug);
  const cached = getCached<Project>(cacheKey);
  if (cached) return cached;

  const projects = await getProjects();
  const found = projects.find((p) => p.slug === slug) || null;
  if (found) setCached(cacheKey, found);
  return found;
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
  const newProject: Project = {
    ...project,
    id: `proj_${Date.now()}`,
    cover_image_url: project.cover_image_url || '',
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    github_url: project.github_url || '',
    live_url: project.live_url || '',
    sort_order: typeof project.sort_order === 'number' ? project.sort_order : 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { data, error } = await client.from('projects').insert(newProject).select().single();
      if (!error && data) {
        const created = data as Project;
        const current = getLocalItem<Project[]>(StorageFallbackKeys.PROJECTS, initialProjects);
        setLocalItem(StorageFallbackKeys.PROJECTS, [...current, created]);
        invalidateCache(CacheKeys.PROJECTS);
        invalidateCache('cache:project');
        return created;
      }
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Project[]>(StorageFallbackKeys.PROJECTS, initialProjects);
  setLocalItem(StorageFallbackKeys.PROJECTS, [...current, newProject]);
  invalidateCache(CacheKeys.PROJECTS);
  invalidateCache('cache:project');
  return newProject;
}

export async function updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
  const payload: Record<string, unknown> = {
    ...projectData,
    updated_at: new Date().toISOString(),
  };
  if (projectData.cover_image_url !== undefined) payload.cover_image_url = projectData.cover_image_url || '';
  if (projectData.github_url !== undefined) payload.github_url = projectData.github_url || '';
  if (projectData.live_url !== undefined) payload.live_url = projectData.live_url || '';

  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { data, error } = await client
        .from('projects')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const updated = data as Project;
        const current = getLocalItem<Project[]>(StorageFallbackKeys.PROJECTS, initialProjects);
        setLocalItem(
          StorageFallbackKeys.PROJECTS,
          current.map((p) => (p.id === id ? updated : p))
        );
        invalidateCache(CacheKeys.PROJECTS);
        invalidateCache('cache:project');
        return updated;
      }
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Project[]>(StorageFallbackKeys.PROJECTS, initialProjects);
  let updatedProject: Project | null = null;
  const updated = current.map((p) => {
    if (p.id === id) {
      updatedProject = { ...p, ...payload } as Project;
      return updatedProject;
    }
    return p;
  });

  if (!updatedProject) {
    throw new Error(`Project with id ${id} not found.`);
  }

  setLocalItem(StorageFallbackKeys.PROJECTS, updated);
  invalidateCache(CacheKeys.PROJECTS);
  invalidateCache('cache:project');
  return updatedProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { error } = await client.from('projects').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Project[]>(StorageFallbackKeys.PROJECTS, initialProjects);
  setLocalItem(
    StorageFallbackKeys.PROJECTS,
    current.filter((p) => p.id !== id)
  );
  invalidateCache(CacheKeys.PROJECTS);
  invalidateCache('cache:project');
  return true;
}

/* ==========================================================================
   EXPERIENCE SERVICES
   ========================================================================== */
export async function getExperiences(): Promise<Experience[]> {
  const cached = getCached<Experience[]>(CacheKeys.EXPERIENCES);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        const experiences = data as Experience[];
        setCached(CacheKeys.EXPERIENCES, experiences);
        setLocalItem(StorageFallbackKeys.EXPERIENCES, experiences);
        return experiences;
      }
    } catch {
      // Gracefully fall through to local fallback
    }
  }

  const fallback = getLocalItem<Experience[]>(StorageFallbackKeys.EXPERIENCES, initialExperiences);
  setCached(CacheKeys.EXPERIENCES, fallback);
  return fallback;
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
    try {
      const client = requireSupabase();
      const { data, error } = await client.from('experiences').insert(newExp).select().single();
      if (!error && data) {
        const created = data as Experience;
        const current = getLocalItem<Experience[]>(StorageFallbackKeys.EXPERIENCES, initialExperiences);
        setLocalItem(StorageFallbackKeys.EXPERIENCES, [...current, created]);
        invalidateCache(CacheKeys.EXPERIENCES);
        return created;
      }
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Experience[]>(StorageFallbackKeys.EXPERIENCES, initialExperiences);
  setLocalItem(StorageFallbackKeys.EXPERIENCES, [...current, newExp]);
  invalidateCache(CacheKeys.EXPERIENCES);
  return newExp;
}

export async function updateExperience(id: string, expData: Partial<Experience>): Promise<Experience> {
  const payload = { ...expData, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { data, error } = await client
        .from('experiences')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const updated = data as Experience;
        const current = getLocalItem<Experience[]>(StorageFallbackKeys.EXPERIENCES, initialExperiences);
        setLocalItem(
          StorageFallbackKeys.EXPERIENCES,
          current.map((e) => (e.id === id ? updated : e))
        );
        invalidateCache(CacheKeys.EXPERIENCES);
        return updated;
      }
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Experience[]>(StorageFallbackKeys.EXPERIENCES, initialExperiences);
  let updatedExp: Experience | null = null;
  const updated = current.map((e) => {
    if (e.id === id) {
      updatedExp = { ...e, ...payload } as Experience;
      return updatedExp;
    }
    return e;
  });

  if (!updatedExp) {
    throw new Error(`Experience with id ${id} not found.`);
  }

  setLocalItem(StorageFallbackKeys.EXPERIENCES, updated);
  invalidateCache(CacheKeys.EXPERIENCES);
  return updatedExp;
}

export async function deleteExperience(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { error } = await client.from('experiences').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Experience[]>(StorageFallbackKeys.EXPERIENCES, initialExperiences);
  setLocalItem(
    StorageFallbackKeys.EXPERIENCES,
    current.filter((e) => e.id !== id)
  );
  invalidateCache(CacheKeys.EXPERIENCES);
  return true;
}

/* ==========================================================================
   CERTIFICATION SERVICES
   ========================================================================== */
export async function getCertifications(): Promise<Certification[]> {
  const cached = getCached<Certification[]>(CacheKeys.CERTIFICATIONS);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        const certs = data as Certification[];
        setCached(CacheKeys.CERTIFICATIONS, certs);
        setLocalItem(StorageFallbackKeys.CERTIFICATIONS, certs);
        return certs;
      }
    } catch {
      // Gracefully fall through to local fallback
    }
  }

  const fallback = getLocalItem<Certification[]>(StorageFallbackKeys.CERTIFICATIONS, initialCertifications);
  setCached(CacheKeys.CERTIFICATIONS, fallback);
  return fallback;
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
    try {
      const client = requireSupabase();
      const { data, error } = await client.from('certifications').insert(newCert).select().single();
      if (!error && data) {
        const created = data as Certification;
        const current = getLocalItem<Certification[]>(StorageFallbackKeys.CERTIFICATIONS, initialCertifications);
        setLocalItem(StorageFallbackKeys.CERTIFICATIONS, [...current, created]);
        invalidateCache(CacheKeys.CERTIFICATIONS);
        return created;
      }
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Certification[]>(StorageFallbackKeys.CERTIFICATIONS, initialCertifications);
  setLocalItem(StorageFallbackKeys.CERTIFICATIONS, [...current, newCert]);
  invalidateCache(CacheKeys.CERTIFICATIONS);
  return newCert;
}

export async function updateCertification(id: string, certData: Partial<Certification>): Promise<Certification> {
  const payload = { ...certData, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { data, error } = await client
        .from('certifications')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const updated = data as Certification;
        const current = getLocalItem<Certification[]>(StorageFallbackKeys.CERTIFICATIONS, initialCertifications);
        setLocalItem(
          StorageFallbackKeys.CERTIFICATIONS,
          current.map((c) => (c.id === id ? updated : c))
        );
        invalidateCache(CacheKeys.CERTIFICATIONS);
        return updated;
      }
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Certification[]>(StorageFallbackKeys.CERTIFICATIONS, initialCertifications);
  let updatedCert: Certification | null = null;
  const updated = current.map((c) => {
    if (c.id === id) {
      updatedCert = { ...c, ...payload } as Certification;
      return updatedCert;
    }
    return c;
  });

  if (!updatedCert) {
    throw new Error(`Certification with id ${id} not found.`);
  }

  setLocalItem(StorageFallbackKeys.CERTIFICATIONS, updated);
  invalidateCache(CacheKeys.CERTIFICATIONS);
  return updatedCert;
}

export async function deleteCertification(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { error } = await client.from('certifications').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Certification[]>(StorageFallbackKeys.CERTIFICATIONS, initialCertifications);
  setLocalItem(
    StorageFallbackKeys.CERTIFICATIONS,
    current.filter((c) => c.id !== id)
  );
  invalidateCache(CacheKeys.CERTIFICATIONS);
  return true;
}

/* ==========================================================================
   EDUCATION SERVICES
   ========================================================================== */
export async function getEducation(): Promise<Education[]> {
  const cached = getCached<Education[]>(CacheKeys.EDUCATION);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        const edu = data as Education[];
        setCached(CacheKeys.EDUCATION, edu);
        setLocalItem(StorageFallbackKeys.EDUCATION, edu);
        return edu;
      }
    } catch {
      // Gracefully fall through to local fallback
    }
  }

  const fallback = getLocalItem<Education[]>(StorageFallbackKeys.EDUCATION, initialEducation);
  setCached(CacheKeys.EDUCATION, fallback);
  return fallback;
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
    try {
      const client = requireSupabase();
      const { data, error } = await client.from('education').insert(newEdu).select().single();
      if (!error && data) {
        const created = data as Education;
        const current = getLocalItem<Education[]>(StorageFallbackKeys.EDUCATION, initialEducation);
        setLocalItem(StorageFallbackKeys.EDUCATION, [...current, created]);
        invalidateCache(CacheKeys.EDUCATION);
        return created;
      }
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Education[]>(StorageFallbackKeys.EDUCATION, initialEducation);
  setLocalItem(StorageFallbackKeys.EDUCATION, [...current, newEdu]);
  invalidateCache(CacheKeys.EDUCATION);
  return newEdu;
}

export async function updateEducation(id: string, eduData: Partial<Education>): Promise<Education> {
  const payload = { ...eduData, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { data, error } = await client
        .from('education')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const updated = data as Education;
        const current = getLocalItem<Education[]>(StorageFallbackKeys.EDUCATION, initialEducation);
        setLocalItem(
          StorageFallbackKeys.EDUCATION,
          current.map((e) => (e.id === id ? updated : e))
        );
        invalidateCache(CacheKeys.EDUCATION);
        return updated;
      }
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Education[]>(StorageFallbackKeys.EDUCATION, initialEducation);
  let updatedEdu: Education | null = null;
  const updated = current.map((e) => {
    if (e.id === id) {
      updatedEdu = { ...e, ...payload } as Education;
      return updatedEdu;
    }
    return e;
  });

  if (!updatedEdu) {
    throw new Error(`Education with id ${id} not found.`);
  }

  setLocalItem(StorageFallbackKeys.EDUCATION, updated);
  invalidateCache(CacheKeys.EDUCATION);
  return updatedEdu;
}

export async function deleteEducation(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { error } = await client.from('education').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<Education[]>(StorageFallbackKeys.EDUCATION, initialEducation);
  setLocalItem(
    StorageFallbackKeys.EDUCATION,
    current.filter((e) => e.id !== id)
  );
  invalidateCache(CacheKeys.EDUCATION);
  return true;
}

/* ==========================================================================
   CONTACT MESSAGE SERVICES
   ========================================================================== */
export async function getContactMessages(): Promise<ContactMessage[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        const msgs = data as ContactMessage[];
        setLocalItem(StorageFallbackKeys.CONTACT_MESSAGES, msgs);
        return msgs;
      }
    } catch {
      // Fallback
    }
  }

  return getLocalItem<ContactMessage[]>(StorageFallbackKeys.CONTACT_MESSAGES, initialContactMessages);
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
    try {
      const client = requireSupabase();
      const { data, error } = await client.from('contact_messages').insert(newMsg).select().single();
      if (!error && data) {
        const created = data as ContactMessage;
        const current = getLocalItem<ContactMessage[]>(StorageFallbackKeys.CONTACT_MESSAGES, initialContactMessages);
        setLocalItem(StorageFallbackKeys.CONTACT_MESSAGES, [created, ...current]);
        return created;
      }
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<ContactMessage[]>(StorageFallbackKeys.CONTACT_MESSAGES, initialContactMessages);
  setLocalItem(StorageFallbackKeys.CONTACT_MESSAGES, [newMsg, ...current]);
  return newMsg;
}

export async function updateContactMessageStatus(
  id: string,
  status: ContactMessage['status'],
  isRead: boolean = true
): Promise<ContactMessage> {
  const payload = { status, is_read: isRead, updated_at: new Date().toISOString() };

  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { data, error } = await client
        .from('contact_messages')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        const updated = data as ContactMessage;
        const current = getLocalItem<ContactMessage[]>(StorageFallbackKeys.CONTACT_MESSAGES, initialContactMessages);
        setLocalItem(
          StorageFallbackKeys.CONTACT_MESSAGES,
          current.map((m) => (m.id === id ? updated : m))
        );
        return updated;
      }
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<ContactMessage[]>(StorageFallbackKeys.CONTACT_MESSAGES, initialContactMessages);
  let updatedMsg: ContactMessage | null = null;
  const updated = current.map((m) => {
    if (m.id === id) {
      updatedMsg = { ...m, ...payload } as ContactMessage;
      return updatedMsg;
    }
    return m;
  });

  if (!updatedMsg) {
    throw new Error(`Contact message with id ${id} not found.`);
  }

  setLocalItem(StorageFallbackKeys.CONTACT_MESSAGES, updated);
  return updatedMsg;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { error } = await client.from('contact_messages').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } catch {
      // Fallback
    }
  }

  const current = getLocalItem<ContactMessage[]>(StorageFallbackKeys.CONTACT_MESSAGES, initialContactMessages);
  setLocalItem(
    StorageFallbackKeys.CONTACT_MESSAGES,
    current.filter((m) => m.id !== id)
  );
  return true;
}

/* ==========================================================================
   SITE SETTINGS SERVICES
   ========================================================================= */
export async function getSiteSettings(): Promise<SiteSettings> {
  const cached = getCached<SiteSettings>(CacheKeys.SITE_SETTINGS);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').single();
      if (!error && data) {
        const normalized = normalizeSiteSettings(data as SiteSettings);
        setCached(CacheKeys.SITE_SETTINGS, normalized);
        setLocalItem(StorageFallbackKeys.SITE_SETTINGS, normalized);
        return normalized;
      }
    } catch {
      // Fallback
    }
  }

  const fallback = normalizeSiteSettings(
    getLocalItem<SiteSettings>(StorageFallbackKeys.SITE_SETTINGS, initialSiteSettings)
  );
  setCached(CacheKeys.SITE_SETTINGS, fallback);
  return fallback;
}

export async function updateSiteSettings(settingsData: Partial<SiteSettings>): Promise<SiteSettings> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  for (const [key, value] of Object.entries(settingsData)) {
    if (value !== undefined) {
      updatePayload[key] = value;
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const client = requireSupabase();
      const { data, error } = await client
        .from('site_settings')
        .update(updatePayload)
        .eq('id', settingsData.id || 'settings_1')
        .select()
        .single();
      if (!error && data) {
        const normalized = normalizeSiteSettings(data as SiteSettings);
        invalidateCache(CacheKeys.SITE_SETTINGS);
        setLocalItem(StorageFallbackKeys.SITE_SETTINGS, normalized);
        return normalized;
      }
    } catch {
      // Fallback
    }
  }

  const existing = getLocalItem<SiteSettings>(StorageFallbackKeys.SITE_SETTINGS, initialSiteSettings);
  const updated = normalizeSiteSettings({
    ...existing,
    ...updatePayload,
    id: existing.id || settingsData.id || 'settings_1',
  } as SiteSettings);
  invalidateCache(CacheKeys.SITE_SETTINGS);
  setLocalItem(StorageFallbackKeys.SITE_SETTINGS, updated);
  return updated;
}

/* ==========================================================================
   SKILLS SERVICES
   ========================================================================== */
export async function getSkills(): Promise<Skill[]> {
  const cached = getCached<Skill[]>(CacheKeys.SKILLS);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        const skills = data as Skill[];
        setCached(CacheKeys.SKILLS, skills);
        setLocalItem(StorageFallbackKeys.SKILLS, skills);
        return skills;
      }
    } catch {
      // Fallback
    }
  }

  const fallback = getLocalItem<Skill[]>(StorageFallbackKeys.SKILLS, initialSkills);
  setCached(CacheKeys.SKILLS, fallback);
  return fallback;
}

export async function updateSkills(skills: Skill[]): Promise<Skill[]> {
  if (isSupabaseConfigured && supabase) {
    try {
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

      invalidateCache(CacheKeys.SKILLS);
      setLocalItem(StorageFallbackKeys.SKILLS, skills);
      return skills;
    } catch {
      // Fallback
    }
  }

  setLocalItem(StorageFallbackKeys.SKILLS, skills);
  invalidateCache(CacheKeys.SKILLS);
  return skills;
}

/* ==========================================================================
   SOCIAL LINKS SERVICES
   ========================================================================== */
export async function getSocialLinks(): Promise<SocialLink[]> {
  const cached = getCached<SocialLink[]>(CacheKeys.SOCIAL_LINKS);
  if (cached) return cached;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) {
        const links = data as SocialLink[];
        setCached(CacheKeys.SOCIAL_LINKS, links);
        setLocalItem(StorageFallbackKeys.SOCIAL_LINKS, links);
        return links;
      }
    } catch {
      // Fallback
    }
  }

  const fallback = getLocalItem<SocialLink[]>(StorageFallbackKeys.SOCIAL_LINKS, initialSocialLinks);
  setCached(CacheKeys.SOCIAL_LINKS, fallback);
  return fallback;
}

export async function updateSocialLinks(links: SocialLink[]): Promise<SocialLink[]> {
  if (isSupabaseConfigured && supabase) {
    try {
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

      invalidateCache(CacheKeys.SOCIAL_LINKS);
      setLocalItem(StorageFallbackKeys.SOCIAL_LINKS, links);
      return links;
    } catch {
      // Fallback
    }
  }

  setLocalItem(StorageFallbackKeys.SOCIAL_LINKS, links);
  invalidateCache(CacheKeys.SOCIAL_LINKS);
  return links;
}

/* ==========================================================================
   RAG KNOWLEDGE RETRIEVAL SERVICES
   ========================================================================== */
export interface PortfolioRAGData {
  profile: Profile;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  certifications: Certification[];
  education: Education[];
}

/**
 * Formats consolidated portfolio records into a concise, token-efficient system context prompt
 * designed for client-side local LLM injection (e.g. Qwen2.5-0.5B via WebLLM).
 *
 * Keeps output compact (< 1,200 tokens) while maintaining high structural precision.
 */
export function formatPortfolioRAGBundle(data: PortfolioRAGData): string {
  const { profile, skills, experiences, projects, certifications, education } = data;

  const lines: string[] = [];

  // Header / System Context
  lines.push('=== VERIFIED PORTFOLIO KNOWLEDGE BASE (ORVEN CASIDO) ===');
  lines.push(
    "You are Orven Casido's official AI Portfolio Assistant. Use the verified facts below to answer questions accurately. If asked about something not covered in this context, politely state that the information is not available."
  );
  lines.push('');

  // 1. Candidate Overview & Profile
  lines.push('## CANDIDATE OVERVIEW');
  lines.push(`- Full Name: ${profile.full_name || 'Orven Casido'}`);
  lines.push(`- Professional Title: ${profile.professional_title || 'DevOps Engineer'}`);
  lines.push(`- Availability: ${profile.availability_status || 'available'}`);
  if (profile.email) lines.push(`- Email: ${profile.email}`);
  if (profile.location) lines.push(`- Location: ${profile.location}`);
  if (profile.phone) lines.push(`- Phone: ${profile.phone}`);
  if (profile.introduction) lines.push(`- Introduction: ${profile.introduction.trim()}`);
  if (profile.biography) lines.push(`- Biography: ${profile.biography.trim()}`);
  lines.push('');

  // 2. Technical Skills (categorized)
  lines.push('## TECHNICAL SKILLS');
  const visibleSkills = (skills || []).filter((s) => s.is_visible !== false);
  if (visibleSkills.length > 0) {
    const defaultCategories = [
      'DevOps & Cloud',
      'Databases & IaC',
      'Backend & APIs',
      'Frontend',
      'Tools & Methods',
    ] as const;
    const categorizedMap: Record<string, string[]> = {};

    for (const skill of visibleSkills) {
      const cat = skill.category || 'Other';
      if (!categorizedMap[cat]) categorizedMap[cat] = [];
      categorizedMap[cat].push(`${skill.name} (${skill.proficiency}%)`);
    }

    for (const cat of defaultCategories) {
      if (categorizedMap[cat] && categorizedMap[cat].length > 0) {
        lines.push(`- ${cat}: ${categorizedMap[cat].join(', ')}`);
      }
    }

    // Include any categories outside default set
    for (const [cat, list] of Object.entries(categorizedMap)) {
      if (!defaultCategories.includes(cat as any) && list.length > 0) {
        lines.push(`- ${cat}: ${list.join(', ')}`);
      }
    }
  } else {
    lines.push('- No specific skills listed.');
  }
  lines.push('');

  // 3. Work Experience Timeline
  lines.push('## PROFESSIONAL WORK EXPERIENCE');
  const validExperiences = (experiences || []).filter((e) => e.company && e.position);
  if (validExperiences.length > 0) {
    for (const exp of validExperiences) {
      const duration = `${exp.start_date || 'N/A'} - ${exp.is_current ? 'Present' : exp.end_date || 'N/A'}`;
      lines.push(`### ${exp.position} at ${exp.company}`);
      lines.push(`- Employment Type: ${exp.employment_type || 'Full-time'}`);
      lines.push(`- Duration: ${duration}`);
      if (exp.location) lines.push(`- Location: ${exp.location}`);
      if (exp.description) lines.push(`- Summary: ${exp.description.trim()}`);

      const highlights = [
        ...(Array.isArray(exp.achievements) ? exp.achievements : []),
        ...(Array.isArray(exp.responsibilities) ? exp.responsibilities : []),
      ].filter((h) => typeof h === 'string' && h.trim().length > 0);

      if (highlights.length > 0) {
        lines.push('- Key Highlights & Responsibilities:');
        for (const item of highlights.slice(0, 4)) {
          lines.push(`  • ${item.trim()}`);
        }
      }

      if (Array.isArray(exp.technologies) && exp.technologies.length > 0) {
        lines.push(`- Technologies: ${exp.technologies.join(', ')}`);
      }
      lines.push('');
    }
  } else {
    lines.push('- No work experiences recorded.');
    lines.push('');
  }

  // 4. Projects (Featured & Regular)
  lines.push('## PROJECTS');
  const validProjects = (projects || []).filter((p) => p.title);
  if (validProjects.length > 0) {
    const sortedProjects = [...validProjects].sort((a, b) => {
      if (a.is_featured === b.is_featured) {
        return (a.sort_order || 0) - (b.sort_order || 0);
      }
      return a.is_featured ? -1 : 1;
    });

    for (const proj of sortedProjects) {
      const tag = proj.is_featured ? '[Featured Project]' : '[Project]';
      lines.push(`### ${tag} ${proj.title}`);
      if (proj.short_description) lines.push(`- Overview: ${proj.short_description.trim()}`);

      if (Array.isArray(proj.technologies) && proj.technologies.length > 0) {
        const cleanTech = proj.technologies.map((t) => t.split(':::')[0].trim()).filter(Boolean);
        if (cleanTech.length > 0) {
          lines.push(`- Tech Stack: ${cleanTech.join(', ')}`);
        }
      }

      if (proj.github_url && !proj.github_url.includes('test') && proj.github_url.trim()) {
        lines.push(`- GitHub: ${proj.github_url.trim()}`);
      }
      if (
        proj.live_url &&
        !proj.live_url.includes('#hidden#') &&
        !proj.live_url.includes('test') &&
        proj.live_url.trim()
      ) {
        lines.push(`- Live Demo: ${proj.live_url.trim()}`);
      }
      lines.push('');
    }
  } else {
    lines.push('- No projects recorded.');
    lines.push('');
  }

  // 5. Certifications & Credentials
  lines.push('## CERTIFICATIONS & CREDENTIALS');
  const validCerts = (certifications || []).filter((c) => c.name);
  if (validCerts.length > 0) {
    for (const cert of validCerts) {
      const datePart = cert.issue_date ? ` [Issued: ${cert.issue_date}]` : '';
      const orgPart = cert.issuing_organization ? ` - Issued by ${cert.issuing_organization}` : '';
      const skillsPart =
        Array.isArray(cert.skills) && cert.skills.length > 0 ? ` (Skills: ${cert.skills.join(', ')})` : '';
      lines.push(`- ${cert.name}${orgPart}${datePart}${skillsPart}`);
    }
  } else {
    lines.push('- No certifications recorded.');
  }
  lines.push('');

  // 6. Education
  lines.push('## EDUCATION');
  const validEdu = (education || []).filter((e) => e.school);
  if (validEdu.length > 0) {
    for (const edu of validEdu) {
      const dates = edu.start_date || edu.end_date ? ` (${edu.start_date || ''} - ${edu.end_date || ''})` : '';
      lines.push(`- ${edu.degree || 'Degree'} in ${edu.field_of_study || 'Studies'} - ${edu.school}${dates}`);
      if (edu.location) lines.push(`  Location: ${edu.location}`);
      if (Array.isArray(edu.coursework) && edu.coursework.length > 0) {
        lines.push(`  Coursework: ${edu.coursework.join(', ')}`);
      }
    }
  } else {
    lines.push('- No education history recorded.');
  }
  lines.push('');

  lines.push('=== END OF PORTFOLIO KNOWLEDGE BASE ===');

  return lines.join('\n');
}

/**
 * Primary RAG knowledge retrieval bundle for the in-browser local AI chatbot.
 * Consolidates Profile, Skills, Experiences, Projects, Certifications, and Education.
 *
 * Guarantees 100% resilient operation in both Supabase mode and localStorage / mock fallback mode.
 */
export async function getPortfolioRAGBundle(): Promise<string> {
  const [profile, skills, experiences, projects, certifications, education] = await Promise.all([
    getProfile().catch(() => getLocalItem<Profile>(StorageFallbackKeys.PROFILE, initialProfile)),
    getSkills().catch(() => getLocalItem<Skill[]>(StorageFallbackKeys.SKILLS, initialSkills)),
    getExperiences().catch(() => getLocalItem<Experience[]>(StorageFallbackKeys.EXPERIENCES, initialExperiences)),
    getProjects().catch(() => getLocalItem<Project[]>(StorageFallbackKeys.PROJECTS, initialProjects)),
    getCertifications().catch(() => getLocalItem<Certification[]>(StorageFallbackKeys.CERTIFICATIONS, initialCertifications)),
    getEducation().catch(() => getLocalItem<Education[]>(StorageFallbackKeys.EDUCATION, initialEducation)),
  ]);

  return formatPortfolioRAGBundle({
    profile: profile || initialProfile,
    skills: Array.isArray(skills) ? skills : initialSkills,
    experiences: Array.isArray(experiences) ? experiences : initialExperiences,
    projects: Array.isArray(projects) ? projects : initialProjects,
    certifications: Array.isArray(certifications) ? certifications : initialCertifications,
    education: Array.isArray(education) ? education : initialEducation,
  });
}

/**
 * Canonical alias for getPortfolioRAGBundle matching milestone specification.
 */
export const getPortfolioRAGContext = getPortfolioRAGBundle;
