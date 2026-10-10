# Scoped Rules: AI Agent (`src/lib/webLlmService.ts` / `src/lib/clientLlmService.ts`, AI Chat Components)

## 1. Role & Objective
Specialist agent dedicated to in-browser client-side artificial intelligence using **WebAssembly (WASM + SIMD) with optional WebGPU acceleration via `@huggingface/transformers` (Transformers.js v3)**.
The AI Agent ensures universal compatibility across **100% of devices and browsers** (iPhones, Android phones, tablets, laptops, Macs, PCs) without ever requiring WebGPU hardware or keeping a personal PC/server turned on.

---

## 2. Core Invariants & Defaults
1. **Universal Execution via WASM / WebGPU Auto-Detection**:
   - Primary device runtime: **WebAssembly (WASM + SIMD)** with automatic fallback.
   - If WebGPU is supported by the visitor's hardware, use WebGPU for acceleration; otherwise, seamlessly run on CPU via WebAssembly (WASM).
   - **Zero "WebGPU Not Supported" Errors**: The visitor never sees a device incompatibility blocker.
2. **Default & Only Model**:
   - Strictly locked to **`HuggingFaceTB/SmolLM2-135M-Instruct`** (quantized ONNX q4: ~90 MB download).
   - Ultra-lightweight footprint: ~90 MB total download (1/4th the size of 0.5B models), lightning-fast download on mobile networks, and cached permanently in browser cache (CacheStorage / IndexedDB).
   - **No model picker**: Do not clutter the UI with model selector dropdowns.
3. **Client-Side RAG Context Assembly**:
   - Context is injected into the system prompt using verified data from `src/lib/services.ts` (`getPortfolioRAGBundle()`).
   - Strict anti-hallucination guardrails: Instructs the model to act as Orven Casido's assistant ("Orbs") and speak strictly based on provided facts.
4. **Streaming Response Delivery**:
   - Token-by-token streaming using `TextStreamer` into the UI chat bubbles.
5. **Modern UI Design System Adherence**:
   - Streaming text, progress bars, and chat bubbles must strictly honor the **Matcha & Warm Beige** tokens (`--color-matcha-*`, `--color-beige-*`, `Plus Jakarta Sans`).
   - Progress bar: Clean percentage indicator during initial model download (`bg-matcha-900` fill, `bg-beige-200` track).
   - Clear copy: "Talk to Orbs", "Initializing in your browser...".

---

## 3. Definition of Done
Any work executed by the AI Agent must:
1. Initialize `@huggingface/transformers` pipeline (`text-generation`) with `SmolLM2-135M-Instruct`.
2. Support smooth token-by-token streaming responses on any device (including devices with zero WebGPU support).
3. Handle first-time download progress gracefully.
4. Pass `npm run lint` (`tsc --noEmit`) with **0 TypeScript errors**.
5. Pass `npm run build` cleanly.
