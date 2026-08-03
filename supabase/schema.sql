-- Orven Casido Portfolio CMS Supabase Backend
-- Run this file in the Supabase SQL Editor for a new project.
-- The schema matches src/types/index.ts and src/lib/services.ts.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id text primary key default 'prof_1',
  full_name text not null,
  professional_title text not null,
  introduction text not null,
  profile_image_url text default '',
  resume_url text default '',
  email text not null,
  phone text default '',
  location text default '',
  availability_status text not null default 'available'
    check (availability_status in ('available', 'busy', 'unavailable', 'open_to_offers')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id text primary key,
  platform text not null,
  label text not null,
  url text not null,
  icon text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id text primary key,
  name text not null,
  category text not null
    check (category in ('DevOps & Cloud', 'Backend & APIs', 'Frontend', 'Databases & IaC', 'Tools & Methods')),
  proficiency integer not null default 80 check (proficiency between 1 and 100),
  icon text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id text primary key,
  title text not null,
  slug text not null unique,
  summary text not null,
  content text not null,
  cover_image_url text default '',
  author text not null default 'Orven Casido',
  tags text[] not null default '{}',
  reading_time text not null default '5 min read',
  status text not null default 'published' check (status in ('draft', 'published')),
  is_featured boolean not null default false,
  published_at text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  title text not null,
  slug text not null unique,
  short_description text not null,
  full_description text not null,
  cover_image_url text default '',
  technologies text[] not null default '{}',
  github_url text default '',
  live_url text default '',
  status text not null default 'completed'
    check (status in ('completed', 'in_progress', 'maintained', 'archived')),
  completion_date text not null,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.experiences (
  id text primary key,
  company text not null,
  position text not null,
  employment_type text not null default 'Full-time'
    check (employment_type in ('Full-time', 'Part-time', 'Contract', 'Freelance')),
  location text not null default '',
  start_date text not null,
  end_date text,
  is_current boolean not null default false,
  description text not null default '',
  responsibilities text[] not null default '{}',
  achievements text[] not null default '{}',
  technologies text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certifications (
  id text primary key,
  name text not null,
  issuing_organization text not null,
  issue_date text not null,
  expiration_date text,
  credential_id text default '',
  credential_url text default '',
  certificate_image_url text default '',
  description text default '',
  skills text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id text primary key,
  school text not null,
  degree text not null,
  field_of_study text not null,
  location text not null default '',
  start_date text not null,
  end_date text not null,
  gpa text,
  description text default '',
  awards text[] not null default '{}',
  activities text[] not null default '{}',
  coursework text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id text primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'resolved')),
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'settings_1',
  website_title text not null,
  website_description text not null,
  logo_initials text not null default 'OC',
  favicon_url text default '/orbs-icon.png',
  seo_keywords text default '',
  footer_text text default '',
  contact_email text not null,
  resume_download_url text default '',
  theme_preference text not null default 'system' check (theme_preference in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_download_limits (
  identifier text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_login_limits (
  identifier text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.consume_resume_download_limit(
  p_identifier text,
  p_max_attempts integer default 20,
  p_window_seconds integer default 86400
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record public.resume_download_limits%rowtype;
  v_now timestamptz := now();
  v_window interval := make_interval(secs => p_window_seconds);
begin
  insert into public.resume_download_limits (identifier, count, window_start, updated_at)
  values (p_identifier, 0, v_now, v_now)
  on conflict (identifier) do nothing;

  select *
  into v_record
  from public.resume_download_limits
  where identifier = p_identifier
  for update;

  if v_record.window_start + v_window <= v_now then
    update public.resume_download_limits
    set count = 1,
        window_start = v_now,
        updated_at = v_now
    where identifier = p_identifier;

    allowed := true;
    remaining := greatest(p_max_attempts - 1, 0);
    reset_at := v_now + v_window;
    return next;
    return;
  end if;

  if v_record.count >= p_max_attempts then
    allowed := false;
    remaining := 0;
    reset_at := v_record.window_start + v_window;
    return next;
    return;
  end if;

  update public.resume_download_limits
  set count = count + 1,
      updated_at = v_now
  where identifier = p_identifier;

  allowed := true;
  remaining := greatest(p_max_attempts - v_record.count - 1, 0);
  reset_at := v_record.window_start + v_window;
  return next;
end;
$$;

grant execute on function public.consume_resume_download_limit(text, integer, integer) to anon, authenticated, service_role;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_social_links_updated_at on public.social_links;
create trigger set_social_links_updated_at before update on public.social_links
for each row execute function public.set_updated_at();

drop trigger if exists set_skills_updated_at on public.skills;
create trigger set_skills_updated_at before update on public.skills
for each row execute function public.set_updated_at();

drop trigger if exists set_blogs_updated_at on public.blogs;
create trigger set_blogs_updated_at before update on public.blogs
for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists set_experiences_updated_at on public.experiences;
create trigger set_experiences_updated_at before update on public.experiences
for each row execute function public.set_updated_at();

drop trigger if exists set_certifications_updated_at on public.certifications;
create trigger set_certifications_updated_at before update on public.certifications
for each row execute function public.set_updated_at();

drop trigger if exists set_education_updated_at on public.education;
create trigger set_education_updated_at before update on public.education
for each row execute function public.set_updated_at();

drop trigger if exists set_contact_messages_updated_at on public.contact_messages;
create trigger set_contact_messages_updated_at before update on public.contact_messages
for each row execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.social_links enable row level security;
alter table public.skills enable row level security;
alter table public.blogs enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.experiences enable row level security;
alter table public.certifications enable row level security;
alter table public.education enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.resume_download_limits enable row level security;
alter table public.admin_login_limits enable row level security;

drop policy if exists "Public can read profiles" on public.profiles;
drop policy if exists "Public can read visible social links" on public.social_links;
drop policy if exists "Public can read visible skills" on public.skills;
drop policy if exists "Public can read published blogs" on public.blogs;
drop policy if exists "Public can read projects" on public.projects;
drop policy if exists "Public can read project images" on public.project_images;
drop policy if exists "Public can read experiences" on public.experiences;
drop policy if exists "Public can read certifications" on public.certifications;
drop policy if exists "Public can read education" on public.education;
drop policy if exists "Public can read settings" on public.site_settings;
drop policy if exists "Anyone can create contact messages" on public.contact_messages;
drop policy if exists "Authenticated admins can manage profiles" on public.profiles;
drop policy if exists "Authenticated admins can manage social links" on public.social_links;
drop policy if exists "Authenticated admins can manage skills" on public.skills;
drop policy if exists "Authenticated admins can manage blogs" on public.blogs;
drop policy if exists "Authenticated admins can manage projects" on public.projects;
drop policy if exists "Authenticated admins can manage project images" on public.project_images;
drop policy if exists "Authenticated admins can manage experiences" on public.experiences;
drop policy if exists "Authenticated admins can manage certifications" on public.certifications;
drop policy if exists "Authenticated admins can manage education" on public.education;
drop policy if exists "Authenticated admins can manage contact messages" on public.contact_messages;
drop policy if exists "Authenticated admins can manage settings" on public.site_settings;
drop policy if exists "Authenticated admins can read resume limits" on public.resume_download_limits;
drop policy if exists "Authenticated admins can read admin login limits" on public.admin_login_limits;

create policy "Public can read profiles" on public.profiles for select using (true);
create policy "Public can read visible social links" on public.social_links for select using (is_visible = true or auth.role() = 'authenticated');
create policy "Public can read visible skills" on public.skills for select using (is_visible = true or auth.role() = 'authenticated');
create policy "Public can read published blogs" on public.blogs for select using (status = 'published' or auth.role() = 'authenticated');
create policy "Public can read projects" on public.projects for select using (true);
create policy "Public can read project images" on public.project_images for select using (true);
create policy "Public can read experiences" on public.experiences for select using (true);
create policy "Public can read certifications" on public.certifications for select using (true);
create policy "Public can read education" on public.education for select using (true);
create policy "Public can read settings" on public.site_settings for select using (true);
create policy "Anyone can create contact messages" on public.contact_messages for insert with check (true);

create policy "Authenticated admins can manage profiles" on public.profiles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage social links" on public.social_links for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage skills" on public.skills for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage blogs" on public.blogs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage projects" on public.projects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage project images" on public.project_images for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage experiences" on public.experiences for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage certifications" on public.certifications for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage education" on public.education for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage contact messages" on public.contact_messages for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage settings" on public.site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can read resume limits" on public.resume_download_limits for select using (auth.role() = 'authenticated');
create policy "Authenticated admins can read admin login limits" on public.admin_login_limits for select using (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-images',
  'portfolio-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-files',
  'portfolio-files',
  false,
  15728640,
  array['application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read portfolio images" on storage.objects;
drop policy if exists "Authenticated admins can upload portfolio images" on storage.objects;
drop policy if exists "Authenticated admins can update portfolio images" on storage.objects;
drop policy if exists "Authenticated admins can delete portfolio images" on storage.objects;
drop policy if exists "Public can read portfolio files" on storage.objects;
drop policy if exists "Authenticated admins can upload portfolio files" on storage.objects;
drop policy if exists "Authenticated admins can update portfolio files" on storage.objects;
drop policy if exists "Authenticated admins can delete portfolio files" on storage.objects;

create policy "Public can read portfolio images"
on storage.objects for select
using (bucket_id = 'portfolio-images');

create policy "Authenticated admins can upload portfolio images"
on storage.objects for insert
with check (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');

create policy "Authenticated admins can update portfolio images"
on storage.objects for update
using (bucket_id = 'portfolio-images' and auth.role() = 'authenticated')
with check (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');

create policy "Authenticated admins can delete portfolio images"
on storage.objects for delete
using (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');

create policy "Authenticated admins can upload portfolio files"
on storage.objects for insert
with check (bucket_id = 'portfolio-files' and auth.role() = 'authenticated');

create policy "Authenticated admins can update portfolio files"
on storage.objects for update
using (bucket_id = 'portfolio-files' and auth.role() = 'authenticated')
with check (bucket_id = 'portfolio-files' and auth.role() = 'authenticated');

create policy "Authenticated admins can delete portfolio files"
on storage.objects for delete
using (bucket_id = 'portfolio-files' and auth.role() = 'authenticated');

insert into public.profiles (
  id,
  full_name,
  professional_title,
  introduction,
  profile_image_url,
  resume_url,
  email,
  phone,
  location,
  availability_status
) values (
  'prof_1',
  'Orven Casido',
  'DevOps Engineer',
  'Welcome to my tech journey.',
  '',
  '',
  'orvencasidop@gmail.com',
  '',
  '',
  'available'
) on conflict (id) do nothing;

insert into public.site_settings (
  id,
  website_title,
  website_description,
  logo_initials,
  favicon_url,
  seo_keywords,
  footer_text,
  contact_email,
  resume_download_url,
  theme_preference
) values (
  'settings_1',
  'Orven Casido | Portfolio',
  'Official portfolio, resume, and technical writing by Orven Casido.',
  'OC',
  '/orbs-icon.png',
  'Orven Casido, DevOps Engineer, Portfolio',
  '(c) 2026 Orven Casido. Built with React, Tailwind CSS, and Supabase.',
  'orvencasidop@gmail.com',
  '',
  'system'
) on conflict (id) do nothing;

notify pgrst, 'reload schema';
