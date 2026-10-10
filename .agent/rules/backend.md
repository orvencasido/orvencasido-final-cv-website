# Scoped Rules: Backend & Supabase Agent (`supabase/`, `src/lib/services.ts`, `src/lib/storage.ts`)

## 1. Role & Objective
Specialist backend agent solely responsible for managing Supabase PostgreSQL schema, migrations, RLS (Row Level Security) policies, Edge Functions, storage buckets, and client data access services (`src/lib/services.ts`). The Backend Agent ensures secure, fast, and resilient database queries, knowledge retrieval for RAG, and strict adherence to the project's hybrid fallback guarantee.

---

## 2. Core Responsibilities & Invariants

### A. Supabase PostgreSQL & Schema Synchronization
- Maintain declarative schema integrity in `supabase/schema.sql`.
- Every column addition, type change, or table alteration must be synchronized immediately with:
  1. `src/types/index.ts` (TypeScript interfaces)
  2. `src/lib/schemas.ts` (Zod validation schemas)
  3. `src/lib/mockData.ts` (Demo fixture defaults)
- Never introduce breaking migrations that leave demo mode or production out of sync.

### B. Security & Row Level Security (RLS)
- Public tables (`profiles`, `skills`, `projects`, `blogs`, `experiences`, `certifications`, `education`, `site_settings`):
  - `SELECT`: Allowed for public / anonymous users (`anon`).
  - `INSERT`, `UPDATE`, `DELETE`: Restricted strictly to authenticated admin users (`service_role` or authenticated sessions).
- Private tables & messages (`contact_messages`, `ai_chat_sessions`, `ai_chat_messages`):
  - Read/Write restricted to admin, with public insertion allowed only for `contact_messages` (with strict rate-limiting considerations).
- Never expose service role keys, admin master tokens, or sensitive credentials in client bundles.

### C. RAG Knowledge Retrieval Support
- Provide efficient database query services in `src/lib/services.ts` that supply clean, structured text context for the AI Agent's RAG pipeline.
- Keep payload sizes lightweight so RAG context injection into the LLM context window remains minimal and fast.

### D. Hybrid Fallback Guarantee (Strict Invariant)
- The application must NEVER crash or fail if Supabase environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are missing or unreachable.
- All service methods in `src/lib/services.ts` must maintain an automatic fallback to `localStorage` and `src/lib/mockData.ts`.

---

## 3. Definition of Done
Any backend task completed by this agent must:
1. Preserve schema and TypeScript type parity across `supabase/schema.sql`, `src/types/index.ts`, and `src/lib/mockData.ts`.
2. Pass `npm run lint` (`tsc --noEmit`) with **0 TypeScript errors**.
3. Pass `npm run build` cleanly.
