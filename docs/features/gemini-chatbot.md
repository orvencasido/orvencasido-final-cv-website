# Feature: Serverless Google Gemini 1.5 Flash Chatbot ("Talk to Orbs") (`gemini-chatbot.md`)

## 1. Overview & Objective
Replace heavy in-browser local model downloads (~90 MB – 174 MB) with a blazing-fast, **Serverless Google Gemini 1.5 Flash** integration.

This gives visitors **instant responses (< 300 ms time-to-first-token)** with **0 MB model download**, while keeping costs at **$0.00** using Google Gemini's generous permanent free tier (15 requests/minute, 1,500 requests/day).

Orven does **not** need to keep his personal computer, Docker containers, or local n8n tunnels running. Everything runs serverlessly through a dedicated Supabase Edge Function (`portfolio-chat`).

---

## 2. Designated Agent Responsibilities & Task Allocation

### A. Gemini AI Specialist Agent (`gemini_ai_agent` / `.agent/rules/gemini-agent.md`)
- Leads the implementation of the serverless Gemini pipeline.
- Builds the `portfolio-chat` Supabase Edge Function (`supabase/functions/portfolio-chat/index.ts`).
- Manages secure access to `GEMINI_API_KEY` stored in Supabase secrets.
- Implements Server-Sent Events (SSE) streaming for real-time token delivery.
- Builds the client service `src/lib/geminiChatService.ts` to consume the streaming response.

### B. Backend & Supabase Agent (`backend_agent` / `.agent/rules/backend.md`)
- Coordinates Supabase Edge Function deployment (`npx supabase functions deploy portfolio-chat`).
- Ensures Supabase RAG knowledge retrieval supplies verified profile, skills, experiences, projects, and certifications into the Edge Function system prompt.
- Protects API keys from client exposure.

### C. Frontend & Mobile UI Agent (`frontend_ui_agent` & `mobile_dev_agent`)
- Updates `src/components/public/PortfolioAIChat.tsx`:
  - Removes the 90 MB download progress bar and initialization wait time. Chat is ready instantly!
  - Updates status pill in header to: `"Orbs • Powered by Gemini 1.5 Flash"`.
  - Maintains exact button placement: directly above the video player button (`md:bottom-[136px] md:right-8`).
  - Keeps hover-only pill: `"Talk to Orbs"`.
  - Retains organic Matcha Green & Warm Beige message bubbles and starter prompt chips.

### D. Quality & Verification Agent
- Validates 0 TypeScript errors via `npm run lint`.
- Validates production bundle via `npm run build`.

---

## 3. Technical Architecture & Data Flow

```
                      Visitor clicks "Talk to Orbs"
                                    │
                                    ▼
                      Chat is INSTANTLY Ready (0 MB Download!)
                                    │
                                    ▼
            Visitor types: "What is Orven's DevOps experience?"
                                    │
                                    ▼
       Sends POST request to Supabase Edge Function:
       https://<project-ref>.supabase.co/functions/v1/portfolio-chat
                                    │
                                    ▼
       Edge Function fetches verified RAG context from Supabase DB:
       - Profiles, Skills, Experiences, Featured Projects, Certifications
                                    │
                                    ▼
       Edge Function calls Google Gemini 1.5 Flash Streaming API:
       - Uses secret GEMINI_API_KEY from Deno.env
       - Applies anti-hallucination guardrails
                                    │
                                    ▼
       Streams Server-Sent Events (SSE) tokens back to the browser:
       - Response starts appearing in < 300 ms!
       - Visitor sees live token streaming in modern Matcha chat bubbles
```

---

## 4. Implementation Steps & Milestones

- [ ] **Milestone 1: Supabase Edge Function (`portfolio-chat`)**:
  - Create `supabase/functions/portfolio-chat/index.ts`.
  - Read `GEMINI_API_KEY` from Supabase secrets (`Deno.env.get('GEMINI_API_KEY')`).
  - Integrate Supabase database query to fetch current portfolio facts (RAG).
  - Call Gemini 1.5 Flash streaming endpoint (`v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse`).
  - Deploy Edge Function to Supabase: `npx supabase functions deploy portfolio-chat`.

- [ ] **Milestone 2: Client Service Layer (`src/lib/geminiChatService.ts`)**:
  - Implement `streamGeminiPortfolioChat(params)`.
  - Use `fetch()` with `ReadableStream` to process SSE chunks in real time.
  - Implement graceful error handling with fallback messages.

- [x] **Milestone 3: UI Streamlining (`src/components/public/PortfolioAIChat.tsx`)**:
  - Connect UI directly to `streamGeminiPortfolioChat`.
  - Remove initial model download progress bar (chat opens immediately).
  - Update header badge to `"Orbs • Gemini 1.5 Flash"`.
  - Verify placement (`md:bottom-[136px] md:right-8`) and hover pill (`"Talk to Orbs"`).

- [x] **Milestone 4: Quality & Verification**:
  - Run `npm run lint` (`tsc --noEmit`) to verify 0 errors.
  - Run `npm run build` to verify clean build.
