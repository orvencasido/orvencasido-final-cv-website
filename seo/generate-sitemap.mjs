import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

const DOMAIN = 'https://www.orvencasido.site';

const STATIC_ROUTES = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: 'projects', changefreq: 'weekly', priority: '0.9' },
  { path: 'blogs', changefreq: 'weekly', priority: '0.8' },
  { path: 'experience', changefreq: 'monthly', priority: '0.8' },
  { path: 'certifications', changefreq: 'monthly', priority: '0.8' },
  { path: 'education', changefreq: 'monthly', priority: '0.7' },
  { path: 'contact', changefreq: 'yearly', priority: '0.7' },
];

async function generateSitemap() {
  console.log('Generating sitemap for:', DOMAIN);
  const now = new Date().toISOString().split('T')[0];

  const urls = [];

  // 1. Static Routes
  for (const route of STATIC_ROUTES) {
    const loc = route.path ? `${DOMAIN}/${route.path}` : `${DOMAIN}/`;
    urls.push({
      loc,
      lastmod: now,
      changefreq: route.changefreq,
      priority: route.priority,
    });
  }

  // 2. Fetch Dynamic Routes from Supabase if configured
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Fetch published blogs
      const { data: blogs } = await supabase
        .from('blogs')
        .select('slug, updated_at, status')
        .eq('status', 'published');

      if (blogs && blogs.length > 0) {
        for (const blog of blogs) {
          if (blog.slug) {
            urls.push({
              loc: `${DOMAIN}/blogs/${encodeURIComponent(blog.slug)}`,
              lastmod: blog.updated_at ? blog.updated_at.split('T')[0] : now,
              changefreq: 'monthly',
              priority: '0.7',
            });
          }
        }
      }

      // Fetch projects
      const { data: projects } = await supabase
        .from('projects')
        .select('slug, updated_at');

      if (projects && projects.length > 0) {
        for (const project of projects) {
          if (project.slug) {
            urls.push({
              loc: `${DOMAIN}/projects/${encodeURIComponent(project.slug)}`,
              lastmod: project.updated_at ? project.updated_at.split('T')[0] : now,
              changefreq: 'monthly',
              priority: '0.7',
            });
          }
        }
      }
    } catch (err) {
      console.warn('Could not query dynamic routes from Supabase, continuing with static routes:', err.message);
    }
  }

  // Build XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  // Output to both public/ and seo/ directories
  const publicDest = path.join(projectRoot, 'public', 'sitemap.xml');
  const seoDest = path.join(projectRoot, 'seo', 'sitemap.xml');

  fs.writeFileSync(publicDest, xml, 'utf-8');
  fs.writeFileSync(seoDest, xml, 'utf-8');

  console.log(`Successfully generated sitemap with ${urls.length} URLs.`);
}

generateSitemap();
