---
name: supabase-ops
description: Manages Supabase backend schema, migrations, and edge functions.
---

# Supabase Management Protocol

1. **Schema Management**:
   - The primary declarative schema is in `supabase/schema.sql`.
   - Ensure Row Level Security (RLS) is enabled on all tables:
     `ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;`
   - Maintain public read policies for published portfolio records and authenticated-only write policies.
   - Synchronize all database columns with `src/types/index.ts`.

2. **Deploying Edge Functions**:
   ```bash
   npx supabase functions deploy admin-login
   npx supabase functions deploy resume-download
   ```

3. **Storage Buckets**:
   - `portfolio-images`: Public bucket for avatar, blog covers, project images, and cert badges.
   - `portfolio-files`: Private bucket for resume PDFs (accessed via signed URLs through the rate-limited `resume-download` Edge Function).
