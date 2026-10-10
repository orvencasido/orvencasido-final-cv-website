---
name: supabase-ops
description: Manages Supabase backend schema, migrations, database queries via npx supabase, and edge functions for project razkqzmzqdjbhjwyagnt.
---

# Supabase Management & Database Querying Protocol

## Project Reference
- **Project Reference**: `razkqzmzqdjbhjwyagnt`
- **Project Name**: `orvencasido-final-cv-website`
- Always supply `--project-ref razkqzmzqdjbhjwyagnt` when running Supabase CLI commands.

---

## 1. Querying the Database Directly (`npx supabase db query`)

The Backend Agent can query and inspect the live Supabase PostgreSQL database directly using `npx supabase db query`:

### A. Run an Inline SQL Query
```bash
npx supabase db query --linked --project-ref razkqzmzqdjbhjwyagnt "SELECT id, full_name, email, availability_status FROM public.profiles;"
```

### B. Inspect Tables and Schemas
```bash
# Check existing public tables
npx supabase db query --linked --project-ref razkqzmzqdjbhjwyagnt "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

# Check active RLS policies
npx supabase db query --linked --project-ref razkqzmzqdjbhjwyagnt "SELECT schemaname, tablename, policyname, permissive, roles, cmd FROM pg_policies WHERE schemaname = 'public';"

# Check Storage Buckets
npx supabase db query --linked --project-ref razkqzmzqdjbhjwyagnt "SELECT id, name, public, file_size_limit FROM storage.buckets;"
```

### C. Execute SQL Scripts or Schema Migrations
```bash
npx supabase db query --linked --project-ref razkqzmzqdjbhjwyagnt -f supabase/schema.sql
```

---

## 2. Managing Edge Functions & Secrets

```bash
# List all deployed Edge Functions
npx supabase functions list --project-ref razkqzmzqdjbhjwyagnt

# Deploy Edge Functions
npx supabase functions deploy portfolio-chat --project-ref razkqzmzqdjbhjwyagnt
npx supabase functions deploy admin-login --project-ref razkqzmzqdjbhjwyagnt
npx supabase functions deploy resume-download --project-ref razkqzmzqdjbhjwyagnt

# List & Set Secrets
npx supabase secrets list --project-ref razkqzmzqdjbhjwyagnt
npx supabase secrets set GEMINI_API_KEY="AIzaSy..." --project-ref razkqzmzqdjbhjwyagnt
```

---

## 3. Storage Buckets
- `portfolio-images`: Public bucket for avatar, blog covers, project screenshots.
- `portfolio-files`: Private bucket for resume PDFs (accessed via rate-limited `resume-download` Edge Function).
- `ai-models`: Public bucket for model weights and configuration assets.

---

## 4. Hard Invariants
1. **Schema & Type Parity**: Every database column change in `supabase/schema.sql` MUST be synchronized immediately with `src/types/index.ts`, `src/lib/schemas.ts`, and `src/lib/mockData.ts`.
2. **Hybrid Fallback Guarantee**: The application must never fail if Supabase is offline; `src/lib/services.ts` must maintain complete fallback to `localStorage`.
