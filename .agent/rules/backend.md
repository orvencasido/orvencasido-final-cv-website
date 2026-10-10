# Scoped Rules: Backend & Supabase Agent (`supabase/`, `src/lib/services.ts`, `src/lib/storage.ts`)

## 1. Project Reference & Target Configuration
- **Supabase Project Reference**: `razkqzmzqdjbhjwyagnt`
- **Project Name**: `orvencasido-final-cv-website`
- Whenever executing database queries, running migrations, inspecting schemas, or managing Edge Functions via CLI, **always explicitly specify the project reference**:
  ```bash
  --project-ref razkqzmzqdjbhjwyagnt
  ```

---

## 2. CLI Database Querying Standards (`npx supabase`)
The Backend Agent can query and manage the remote Supabase database directly using `npx supabase db query`:

### A. Executing Raw SQL Queries
```bash
npx supabase db query --linked --project-ref razkqzmzqdjbhjwyagnt "SELECT id, full_name, email FROM public.profiles LIMIT 1;"
```

### B. Executing SQL Files
```bash
npx supabase db query --linked --project-ref razkqzmzqdjbhjwyagnt -f supabase/schema.sql
```

### C. Checking Database & Project Status
```bash
npx supabase projects list
npx supabase db dump --project-ref razkqzmzqdjbhjwyagnt
```

### D. Managing Edge Functions & Secrets
```bash
npx supabase functions list --project-ref razkqzmzqdjbhjwyagnt
npx supabase functions deploy <function-name> --project-ref razkqzmzqdjbhjwyagnt
npx supabase secrets list --project-ref razkqzmzqdjbhjwyagnt
npx supabase secrets set KEY="value" --project-ref razkqzmzqdjbhjwyagnt
```

---

## 3. Core Database Invariants
1. **Schema Synchronization**:
   - Every column change or new table in `supabase/schema.sql` MUST be synchronized immediately with:
     - `src/types/index.ts` (TypeScript interfaces)
     - `src/lib/schemas.ts` (Zod schemas)
     - `src/lib/mockData.ts` (Mock fixtures)
2. **Row Level Security (RLS)**:
   - Always verify RLS is enabled: `ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;`
   - Public read access for published portfolio content; authenticated-only access for mutations.
3. **Hybrid Fallback Guarantee**:
   - The application must NEVER break if Supabase credentials are missing or unreachable. All services in `src/lib/services.ts` must maintain seamless fallback to `localStorage` and `mockData.ts`.
4. **Security & Secrets**:
   - Never commit service role keys or master secrets to git or public bundles. Always use Supabase Secrets via CLI.

---

## 4. Definition of Done
Any backend task executed by this agent must:
1. Verify database state with `npx supabase db query --linked --project-ref razkqzmzqdjbhjwyagnt`.
2. Pass `npm run lint` (`tsc --noEmit`) with **0 errors**.
3. Pass `npm run build` cleanly.
