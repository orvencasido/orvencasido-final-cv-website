import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Warning: Supabase URL or Anon Key missing in environment.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// In-memory cache for 5 minutes
let cachedContext: string | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getOrvenContext(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedContext && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedContext;
  }

  try {
    const [
      profileRes,
      skillsRes,
      projectsRes,
      expRes,
      certRes,
      eduRes,
      socialRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('skills').select('*').order('sort_order', { ascending: true }),
      supabase.from('projects').select('*').order('sort_order', { ascending: true }),
      supabase.from('experiences').select('*').order('sort_order', { ascending: true }),
      supabase.from('certifications').select('*').order('sort_order', { ascending: true }),
      supabase.from('education').select('*').order('sort_order', { ascending: true }),
      supabase.from('social_links').select('*').eq('is_visible', true),
    ]);

    const profile = profileRes.data || {};
    const skills = skillsRes.data || [];
    const projects = projectsRes.data || [];
    const experiences = expRes.data || [];
    const certs = certRes.data || [];
    const education = eduRes.data || [];
    const socials = socialRes.data || [];

    // Group skills by category
    const skillsByCategory: Record<string, string[]> = {};
    for (const s of skills) {
      if (!s.is_visible) continue;
      const cat = s.category || 'General';
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push(`${s.name} (${s.proficiency}% proficiency)`);
    }

    let markdown = `# GROUND-TRUTH KNOWLEDGE BASE: ORVEN CASIDO\n\n`;

    // 1. Identity & Profile
    markdown += `## 1. Professional Profile\n`;
    markdown += `- Name: ${profile.full_name || 'Orven Casido'}\n`;
    markdown += `- Professional Title: ${profile.professional_title || 'Senior DevOps & Full-Stack Engineer'}\n`;
    markdown += `- Email: ${profile.email || 'orvencasidop@gmail.com'}\n`;
    if (profile.phone) markdown += `- Phone: ${profile.phone}\n`;
    if (profile.location) markdown += `- Location: ${profile.location}\n`;
    markdown += `- Availability: ${profile.availability_status || 'available'}\n`;
    if (profile.introduction) markdown += `- Intro: ${profile.introduction}\n`;
    if (profile.biography) markdown += `- Biography: ${profile.biography}\n`;

    // Social Links
    if (socials.length > 0) {
      markdown += `\n### Online Presence & Links:\n`;
      socials.forEach((soc) => {
        markdown += `- ${soc.label || soc.platform}: ${soc.url}\n`;
      });
    }

    // 2. Skills
    markdown += `\n## 2. Technical Skills & Tooling\n`;
    for (const [cat, items] of Object.entries(skillsByCategory)) {
      markdown += `### ${cat}:\n`;
      markdown += items.map((i) => `- ${i}`).join('\n') + '\n';
    }

    // 3. Work Experience
    markdown += `\n## 3. Career & Work Experience\n`;
    experiences.forEach((exp) => {
      const dates = `${exp.start_date} to ${exp.is_current ? 'Present' : exp.end_date || 'N/A'}`;
      markdown += `### ${exp.position} at ${exp.company} (${exp.employment_type || 'Full-time'})\n`;
      markdown += `- Period: ${dates}\n`;
      if (exp.location) markdown += `- Location: ${exp.location}\n`;
      if (exp.description) markdown += `- Summary: ${exp.description}\n`;
      if (Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0) {
        markdown += `- Key Responsibilities:\n  * ` + exp.responsibilities.join('\n  * ') + '\n';
      }
      if (Array.isArray(exp.achievements) && exp.achievements.length > 0) {
        markdown += `- Achievements:\n  * ` + exp.achievements.join('\n  * ') + '\n';
      }
      if (Array.isArray(exp.technologies) && exp.technologies.length > 0) {
        markdown += `- Technologies Used: ${exp.technologies.join(', ')}\n`;
      }
      markdown += '\n';
    });

    // 4. Projects
    markdown += `## 4. Featured Projects & Architecture\n`;
    projects.forEach((proj) => {
      markdown += `### Project: ${proj.title}\n`;
      markdown += `- Status: ${proj.status}\n`;
      if (proj.short_description) markdown += `- Summary: ${proj.short_description}\n`;
      if (proj.full_description) markdown += `- Details: ${proj.full_description}\n`;
      if (Array.isArray(proj.technologies) && proj.technologies.length > 0) {
        markdown += `- Technologies: ${proj.technologies.join(', ')}\n`;
      }
      if (proj.github_url) markdown += `- GitHub: ${proj.github_url}\n`;
      if (proj.live_url) markdown += `- Live Demo: ${proj.live_url}\n`;
      markdown += '\n';
    });

    // 5. Certifications
    if (certs.length > 0) {
      markdown += `## 5. Certifications & Credentials\n`;
      certs.forEach((c) => {
        markdown += `- ${c.name} (Issued by: ${c.issuing_organization}, Date: ${c.issue_date})\n`;
        if (c.credential_url) markdown += `  Verification: ${c.credential_url}\n`;
      });
      markdown += '\n';
    }

    // 6. Education
    if (education.length > 0) {
      markdown += `## 6. Education Background\n`;
      education.forEach((edu) => {
        markdown += `- ${edu.degree} in ${edu.field_of_study} — ${edu.school} (${edu.start_date} - ${edu.end_date})\n`;
        if (edu.description) markdown += `  ${edu.description}\n`;
      });
      markdown += '\n';
    }

    cachedContext = markdown;
    lastFetchedAt = now;
    return markdown;
  } catch (err: any) {
    console.error('Error compiling Orven context from Supabase:', err);
    if (cachedContext) return cachedContext;
    return `# ORVEN CASIDO PROFILE\nSenior DevOps & Full-Stack Engineer. Email: orvencasidop@gmail.com`;
  }
}
