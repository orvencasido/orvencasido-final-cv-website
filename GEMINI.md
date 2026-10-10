# Agent Governance & System Invariants

## Project Overview: Orven Casido — Senior DevOps & Full-Stack Engineer Portfolio & CMS
A high-performance personal developer portfolio and administrative Content Management System (CMS) tailored for Orven Casido.
- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide Icons, React Router v7, React Hook Form, Zod, Motion
- **Design System**: Japanese Minimalist Organic aesthetic (Matcha Green & Warm Beige tokens in `src/index.css`)
- **Backend & Database**: Supabase PostgreSQL with declarative schema in `supabase/schema.sql`, plus rate-limited Edge Functions (`admin-login`, `resume-download`)
- **Hybrid Data Layer**: Seamless automatic fallback to `localStorage` demo mode when Supabase environment variables are unset
- **AI Automation**: Local Dockerized `n8n` workflow integrating Google Gemini with Cloudflare Tunnel to manage portfolio data via webhooks
- **Package Manager**: `npm`

---

## Core Subsystems
1. **Public Portfolio (`src/pages/public/`, `src/components/public/`)**:
   - High-fidelity presentation site: Hero, Featured Works, Tech Stack icons with tooltips, Articles, Experience, Education, Certifications, Contact Form.
   - Dynamic SEO metadata & JSON-LD structured data (`src/seo/`).
   - Automated XML sitemap generation (`seo/generate-sitemap.mjs`).
2. **Admin CMS Portal (`/orven`) (`src/pages/admin/`, `src/components/admin/`)**:
   - Password-authenticated dashboard with rate-limited login attempts.
   - Full CRUD across Blogs, Projects, Tech Stack, Experience, Education, Certifications, and Contact Messages.
   - Profile & Home Content manager with section visibility controls.
   - Conversational AI Assistant dashboard connected to local `n8n` via Cloudflare Tunnel.
3. **Data Service Layer (`src/lib/services.ts`)**:
   - Dual-engine: detects `isSupabaseConfigured`.
   - Real PostgreSQL queries if credentials exist; persistent `localStorage` with rich mock fixtures (`src/lib/mockData.ts`) if credentials are absent.
4. **Supabase Backend & Storage (`supabase/`)**:
   - `supabase/schema.sql`: Declarative schema matching TypeScript interfaces in `src/types/index.ts`.
   - Row Level Security (RLS) policies: public read for published content; authenticated-admin for write operations.
   - Storage Buckets: `portfolio-images` (public) and `portfolio-files` (private signed downloads).
   - Edge Functions: `admin-login` and `resume-download` with 24-hour rate limiting.

---

## Agent Task Boundaries & Responsibilities
- **Frontend & UI Agent (`src/`)**:
  - Implements React components, layouts, and Tailwind v4 styling.
  - Follows `.agent/rules/frontend.md` and design tokens in `.agent/skills/modern-ui/references/design-tokens.md`.
  - Isolates data calls in `src/lib/services.ts` and `src/lib/storage.ts`—never calls raw Supabase client directly in view components.
  - Maintains content discipline: no filler text, no mono-caps subtitles, no redundant status rows.
- **Mobile & Responsive Developer Agent (`src/`)**:
  - Optimizes all public portfolio and administrative views for compact viewports and mobile screens (down to 320px).
  - Enforces Modern UI Japanese Minimalist Organic tokens (`--color-matcha-*`, `--color-beige-*`, `Plus Jakarta Sans`) tailored to mobile ergonomics.
  - Follows `.agent/rules/mobile.md`: ensures accessible touch targets ($\ge 44$px), zero horizontal overflow, responsive bottom sheets, and fluid layout scaling.
- **Gemini AI Specialist Agent (`supabase/functions/portfolio-chat/`, `src/lib/geminiChatService.ts`)**:
  - Manages serverless Google Gemini 1.5 Flash streaming RAG integration via Supabase Edge Function (`portfolio-chat`).
  - Follows `.agent/rules/gemini-agent.md` and `.agent/skills/gemini-chat/SKILL.md`.
- **Backend & Supabase Agent (`supabase/`, `src/lib/services.ts`, `src/types/index.ts`)**:
  - Target Project Reference: `razkqzmzqdjbhjwyagnt` (`orvencasido-final-cv-website`).
  - Directly queries and manages the remote Supabase PostgreSQL database using `npx supabase db query --linked --project-ref razkqzmzqdjbhjwyagnt`.
  - Maintains `supabase/schema.sql`, Edge Functions, and storage buckets.
  - Synchronizes TypeScript interfaces in `src/types/index.ts` and mock fixtures in `src/lib/mockData.ts`.
  - Follows `.agent/rules/backend.md` and `.agent/skills/supabase-ops/SKILL.md`.
- **Quality & Verification Agent**:
  - Runs `npm run lint` (`tsc --noEmit`) to verify zero TypeScript errors.
  - Runs `npm run build` (`node seo/generate-sitemap.mjs && vite build`) to verify bundle stability.

---

## Standard Primitives & Commands
- **Development Server**: `npm run dev` (starts on port 3000)
- **Type Checking & Linting**: `npm run lint` (`tsc --noEmit`)
- **Production Build**: `npm run build` (generates sitemap and builds with Vite)
- **Sitemap Generation**: `npm run generate:sitemap`
- **Deploy Edge Functions**:
  - `npx supabase functions deploy admin-login`
  - `npx supabase functions deploy resume-download`

---

## Hard Invariants (Never Violate)
1. **Schema & Type Synchronization**: Any modification to database columns in `supabase/schema.sql` MUST be synchronized immediately with `src/types/index.ts`, `src/lib/schemas.ts`, and `src/lib/mockData.ts`.
2. **Hybrid Fallback Guarantee**: The application must NEVER fail to run or render when Supabase credentials are missing. LocalStorage demo mode must remain 100% functional.
3. **Design Token Integrity**: Strictly honor the Matcha & Beige palette (`matcha-*`, `beige-*`, `Plus Jakarta Sans`). Avoid introducing cold greys or generic styling.
4. **Content Discipline**: Remove filler copy, obvious instructional descriptions, and mono-caps kicker tags. Content on screen must name real product information.
5. **Security & Secrets**: Never hardcode admin secrets, service role keys, or Gemini API keys in client-side bundles.

---

## Definition of Done
Any completed task or feature must:
1. Pass `npm run lint` with 0 TypeScript compiler errors.
2. Pass `npm run build` cleanly.
3. Work seamlessly in both LocalStorage demo mode and live Supabase mode.
