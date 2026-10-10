# Feature: In-Browser Universal Client-Side LLM Integration (`local-llm-integration.md`)

## 1. Overview & Objective
Enable a high-performance, universal, **100% client-side AI Chatbot ("Talk to Orbs")** that runs on **any device** accessing the portfolio website—including mobile phones (iOS Safari, Android Chrome), tablets, and laptops without WebGPU support.

By reconstructing the client-side architecture to use **WebAssembly (WASM + SIMD) with opportunistic WebGPU acceleration via `@huggingface/transformers` (Transformers.js v3)** and the ultra-compact **`HuggingFaceTB/SmolLM2-135M-Instruct`** model (~90 MB download):
- Visitors will **never encounter a "WebGPU not supported" limitation**.
- The download size drops from ~350 MB to only **~90 MB**, ensuring fast loads even on mobile 4G/5G connections.
- Model files are permanently cached in browser CacheStorage / IndexedDB.
- Orven does **not** need to keep his personal computer, server, or Docker containers running.
- **Supabase** acts strictly as the knowledge provider delivering verified portfolio data for client-side RAG.

---

## 2. Designated Agent Responsibilities & Task Allocation

### A. AI Agent (`ai_agent` / `.agent/rules/ai-agent.md`)
- Integrates `@huggingface/transformers` (Transformers.js v3).
- Locks model to `HuggingFaceTB/SmolLM2-135M-Instruct` (ONNX q4).
- Implements device device-agnostic execution: uses WebGPU if available, otherwise seamlessly runs on CPU via WebAssembly (WASM).
- Builds the client-side RAG context injection pipeline and streaming chat completion with `TextStreamer`.
- Reports real-time file download progress (0% - 100%) during the first load.

### B. Backend Agent (`backend_agent` / `.agent/rules/backend.md`)
- Supplies the lightweight RAG knowledge context via `getPortfolioRAGBundle()` in `src/lib/services.ts`.
- Guarantees 100% fallback reliability in localStorage demo mode.

### C. Frontend & Mobile UI Agent (`frontend_ui_agent` & `mobile_dev_agent`)
- Aligns the floating launcher button in `src/components/public/PortfolioAIChat.tsx`:
  - Horizontally centered with the video player button (`md:bottom-[136px] md:right-8`).
  - Label pill hidden by default, smoothly sliding into view on hover displaying **"Talk to Orbs"**.
- Adapts chat panel seamlessly for desktop floating card and mobile bottom sheet.
- Ensures zero device incompatibility banners.

### D. Quality & Verification Agent
- Validates 0 TypeScript errors via `npm run lint`.
- Validates production bundle via `npm run build`.

---

## 3. Technical Architecture & Data Flow

```
                      Visitor clicks "Talk to Orbs"
                                    │
                                    ▼
1. Universal Hardware Engine Initialization
   - Checks device capabilities (WebGPU -> WebAssembly CPU fallback)
   - First visit -> Download SmolLM2-135M (only ~90 MB ONNX q4)
   - Subsequent visits -> Instant load from browser local disk cache
                                    │
                                    ▼
2. Context Retrieval (Client-Side RAG from Supabase / Services)
   - Fetches Profile, Skills, Experience, Featured Projects, Certifications
   - Assembles concise structured prompt
                                    │
                                    ▼
3. Visitor Types Query: "What is Orven's experience with DevOps?"
                                    │
                                    ▼
4. Universal Client Inference (Visitor's Browser: GPU or WASM CPU)
   - Model runs token-by-token directly in the browser
   - Streams answer into organic Matcha & Beige message bubbles
```

---

## 4. Implementation Steps

- [ ] **Step 1: Install `@huggingface/transformers`**:
  - Install `@huggingface/transformers` dependency.
- [ ] **Step 2: AI Service Engine (`src/lib/webLlmService.ts` / `src/lib/clientLlmService.ts`)**:
  - Reconstruct service using `pipeline('text-generation', 'HuggingFaceTB/SmolLM2-135M-Instruct', { dtype: 'q4' })`.
  - Provide auto device selector: `'webgpu'` if supported, fallback to `'wasm'`.
  - Implement streaming token generation using `TextStreamer`.
  - Connect `getPortfolioRAGBundle()` to system prompt.
- [ ] **Step 3: Frontend UI Alignment (`src/components/public/PortfolioAIChat.tsx`)**:
  - Align launcher button with video player (`md:bottom-[136px] md:right-8`).
  - Hover-only pill revealing **"Talk to Orbs"**.
  - Update initialization progress bar for the ~90 MB download.
  - Remove all WebGPU restriction blocks.
- [ ] **Step 4: Quality & Verification**:
  - Run `npm run lint` (`tsc --noEmit`).
  - Run `npm run build`.
