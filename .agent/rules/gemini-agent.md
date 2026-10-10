# Scoped Rules: Gemini AI Agent (`supabase/functions/portfolio-chat/`, `src/lib/geminiChatService.ts`)

## 1. Role & Objective
Specialist agent dedicated to serverless Google Gemini 1.5 Flash integration, Supabase Edge Function orchestration (`portfolio-chat`), streaming Server-Sent Events (SSE), and database-grounded RAG context management. The Gemini AI Agent ensures sub-second response times, 0 MB client download overhead, and robust API key security without requiring any local host machine or personal computer to remain online.

---

## 2. Core Responsibilities & Standards

### A. Edge Function Architecture (`supabase/functions/portfolio-chat/`)
- Implements a Deno TypeScript Edge Function supporting CORS preflight (`OPTIONS`) and streaming `POST` requests.
- Retrieves `GEMINI_API_KEY` securely from `Deno.env.get('GEMINI_API_KEY')`.
- Integrates Google's `@google/genai` SDK or direct Gemini REST streaming endpoint (`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse`).
- Ingests structured RAG context directly from Supabase database tables (`profiles`, `skills`, `experiences`, `projects`, `certifications`).
- Implements basic rate limiting to prevent abuse and stay well within Gemini's free tier limits (15 RPM / 1,500 RPD).

### B. Client Service Layer (`src/lib/geminiChatService.ts`)
- Replaces heavy in-browser transformers with a lightweight SSE fetch stream consumer.
- Provides seamless drop-in API for UI components:
  - `streamGeminiPortfolioChat(params: { messages, onDelta, onFinish, onError, signal })`
- Guarantees instant chat readiness (no download progress bars needed).

### C. Design Token & UI Fidelity
- Works with `frontend_ui_agent` to ensure floating widget "Talk to Orbs" maintains:
  - Placement: Aligned directly above the video player button (`md:bottom-[136px] md:right-8`).
  - Hover pill revealing "Talk to Orbs".
  - Clean Matcha Green & Warm Beige tokens (`--color-matcha-*`, `--color-beige-*`, `Plus Jakarta Sans`).
  - Real-time streaming markdown parsing.

---

## 3. Definition of Done
Any feature completed by this agent must:
1. Deliver instant < 300ms time-to-first-token streaming via Gemini 1.5 Flash.
2. Require 0 MB model download on the client device.
3. Keep the API key secure inside Supabase Secrets.
4. Pass `npm run lint` (`tsc --noEmit`) with **0 errors**.
5. Pass `npm run build` cleanly.
