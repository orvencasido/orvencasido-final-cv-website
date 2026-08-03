# Project Current Status & Supabase Migration Readiness

## 1. Project Overview

**App Title**: Orven Casido — Senior DevOps & Full-Stack Engineer Portfolio
**Stack**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v7, React Hook Form, Zod, Supabase

This application is a full-featured personal developer portfolio and content management system (CMS) tailored for Orven Casido. It contains both a public-facing presentation site and a secure admin management portal (`/orven`).

---

## 2. Current Functional Status

All public and administrative features are fully developed, compiled, and verified without syntax or build errors.

### Public Features
- **Header & Navigation**: Clean top navigation bar with active route indicators and Dark/Light theme toggle.
- **Home Page**: Hero section showcasing Orven Casido's profile, core technology stack, featured projects, latest writing, and primary contact trigger.
- **Blogs Page**: Clean article listing with full-width keyword search bar.
- **Projects Page**: Interactive showcase of DevOps, Cloud, and Full-Stack projects with a full-width search bar across titles, descriptions, and technology tags.
- **Experience & Education Pages**: Timeline displays highlighting career milestones, roles, and academic achievements.
- **Certifications Page**: Grid layout of cloud and software certifications.
- **Contact Page**: Functional contact form for direct inquiries.
- **Footer**: Refined footer containing copyright notice and direct social/communication links: **LinkedIn**, **GitHub**, and **Gmail** (`orvencasidop@gmail.com`).

### Admin Management Portal (`/orven`)
- **Login Screen**: Streamlined, secure admin sign-in form with email/password validation.
- **Dashboard Modules**:
  - **Overview**: System stats and quick metrics.
  - **Blog Manager**: Full CRUD (Create, Read, Update, Delete) for technical writing and markdown articles.
  - **Project Manager**: Full CRUD for cloud & software portfolio entries.
  - **Tech Stack Manager**: Management of skill badges, categories, and icon configurations.
  - **Experience & Education Managers**: Career timeline and education entry administration.
  - **Certifications Manager**: Management of credentials and certification URLs.
  - **Messages Inbox**: Review and status tracking for incoming contact form inquiries.
  - **Site Settings**: Profile metadata, bio, avatar, and contact email controls.

---

## 3. Supabase Migration Readiness

### Migration Status: **Implemented**

The application has a **hybrid data service layer** (`src/lib/services.ts`). It operates in Mock/LocalStorage mode when credentials are absent and switches to live Supabase mode when environment credentials are provided.

The backend SQL now lives in [`supabase/schema.sql`](supabase/schema.sql). Run that file in a Supabase project's SQL Editor to create:
- CMS tables matching `src/types/index.ts`
- updated-at triggers
- Row Level Security policies
- public image Storage and private resume file Storage
- private resume file delivery through a rate-limited Edge Function
- admin login attempts through a rate-limited Edge Function
- authenticated-admin write policies

### Key Architecture Components
1. **Supabase Client (`src/lib/supabaseClient.ts`)**:
   - Detects `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` dynamically.
   - Exports `isSupabaseConfigured` flag and initialized `supabase` client instance.
2. **Unified Service API Layer (`src/lib/services.ts`)**:
   - All data operations (`getBlogs()`, `createProject()`, `updateProfile()`, etc.) check `isSupabaseConfigured`.
   - If `true`, calls execute real PostgreSQL queries against your Supabase tables.
   - If `false`, calls read/write from `localStorage` with only minimal identity/settings placeholders and empty CMS collections.
3. **Data Type Parity (`src/types/index.ts`)**:
   - All TypeScript interfaces match the Supabase schema in `supabase/schema.sql`.
4. **Storage Uploads (`src/lib/storage.ts`)**:
   - Admin image uploads use Supabase Storage bucket `portfolio-images`.
   - Supported admin uploads: profile images, blog cover images, project cover images, and certification images.
   - Local demo mode converts selected files to data URLs so the UI can still be tested without Supabase.
5. **Resume Download Edge Function (`supabase/functions/resume-download`)**:
   - Resume PDFs are stored in the private `portfolio-files` bucket.
   - The public header calls the Edge Function for a short-lived signed URL.
   - Downloads are limited to 20 per requester/IP per 24-hour window.
6. **Admin Login Edge Function (`supabase/functions/admin-login`)**:
   - Supabase-mode admin login is proxied through an Edge Function.
   - Failed login attempts are limited to 20 per requester/IP per 24-hour window.

---

## 4. Required Supabase Database Schema

The SQL is maintained in [`supabase/schema.sql`](supabase/schema.sql). Do not use the older inline schema shape; the live database must match `src/types/index.ts`.

---

## 5. How to Activate Supabase

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2. **Execute Table Schema**: Copy and run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor.
3. **Deploy Edge Function**:
   ```bash
   supabase functions deploy admin-login
   supabase functions deploy resume-download
   ```
4. **Configure Environment Variables**:
   Add your project credentials to `.env` or your hosting provider's environment configuration:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
5. **Deploy / Restart App**: Once the environment variables are detected, the app automatically connects to live Supabase database tables for all query and mutation operations. No code changes are required!
