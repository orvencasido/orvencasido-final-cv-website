# Scoped Rules: Database & Backend (supabase/)
- All schema definitions are declared declaratively in `supabase/schema.sql`.
- When adding or changing database columns or tables:
  - Keep `src/types/index.ts` strictly synchronized.
  - Keep `src/lib/schemas.ts` and `src/lib/mockData.ts` updated with default fixtures.
  - Enable Row Level Security (RLS) and define granular policies (public read for published records, authenticated-admin for mutations).
- Keep rate-limiting logic intact in Supabase Edge Functions (`admin-login`, `resume-download`).
