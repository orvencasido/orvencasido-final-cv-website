---
name: gemini-chat
description: Implements, configures, and maintains serverless Google Gemini 1.5 Flash streaming RAG integration via Supabase Edge Functions with zero client download overhead and zero host machine dependency.
---

# Gemini Chatbot Integration Skill

## Overview
Connects Orven Casido's public portfolio and CMS to Google Gemini 1.5 Flash (free tier) through a dedicated Supabase Edge Function (`portfolio-chat`). This architecture eliminates in-browser model download weights (0 MB download) and eliminates the need to run local home servers/Docker/tunnels.

---

## 1. Core Principles & Architecture
1. **0 MB Client Download Overhead**:
   - The browser never downloads ONNX or model weights.
   - Inference runs on Google Cloud servers via the official Gemini API (`gemini-1.5-flash`).
2. **Key Security & RLS**:
   - The `GEMINI_API_KEY` is strictly stored as a Supabase Secret in the Edge Function environment (`Deno.env.get('GEMINI_API_KEY')`).
   - Never expose API keys in client-side bundles or public GitHub repositories.
3. **Database RAG Integration**:
   - The Edge Function (or client RAG helper) injects verified portfolio facts (Profile, Skills, Experience, Featured Projects, Certifications) into the system prompt.
   - Strict anti-hallucination instructions ground the assistant ("Orbs") to speak exclusively about Orven's verified qualifications.
4. **Server-Sent Events (SSE) Streaming**:
   - Edge function streams text chunks using standard `text/event-stream` for instant < 300ms time-to-first-token.
5. **Fail-Safe & Hybrid Fallback**:
   - If Supabase or the edge function is unreachable, provide a graceful client-side fallback (or informative notice with contact link) so the UI never crashes.

---

## 2. Standard Commands & Primitives
- **Set Gemini Secret in Supabase**:
  ```bash
  npx supabase secrets set GEMINI_API_KEY="your-gemini-api-key" --project-ref razkqzmzqdjbhjwyagnt
  ```
- **Deploy Edge Function**:
  ```bash
  npx supabase functions deploy portfolio-chat --project-ref razkqzmzqdjbhjwyagnt
  ```
- **Local Testing Edge Function**:
  ```bash
  npx supabase functions serve portfolio-chat --env-file .env
  ```
