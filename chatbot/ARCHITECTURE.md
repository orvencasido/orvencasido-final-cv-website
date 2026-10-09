# Hybrid Architecture: 24/7 Supabase Backend & Local Qwen 2.5 LLM via Cloudflare Tunnel

**Project**: Orven Casido — Portfolio & CMS  
**Component**: Autonomous "AI Orven" Visitor Chatbot  
**Target Model**: Qwen 2.5 1.5B Instruct (`orven-ai` via Ollama)  
**Database**: Supabase PostgreSQL  
**Tunnel Ingress**: Cloudflare Tunnel (`cloudflared`)  

---

## 1. Core Concept: "The Brain" vs "The Hands & Eyes"

A local LLM by itself is simply a neural network weights file (`qwen2.5-1.5b-instruct-q4_k_m.gguf`). It has **no internet card, no database credentials, and no inherent way to know when you update your resume or portfolio**.

The backend serves as the **bridge with hands and eyes**:

* **The Backend (Supabase / `server.ts`)** = **"The Hands & Eyes"**
  * Receives the visitor's question from the website.
  * Queries your live Supabase database tables (`profiles`, `experiences`, `skills`, `projects`, `certifications`).
  * Assembles the ground-truth facts and injects them alongside the visitor's question.
  * Forwards the complete bundle to the local LLM.
* **The Local Model (`orven-ai` on Ollama)** = **"The Brain"**
  * Comprehends the ground-truth facts.
  * Formulates a coherent, articulate answer in Orven's voice.
  * Streams tokens back to the visitor.

---

## 2. Architecture Comparison: Local Dev vs. Live Cloud

### A. Local Development Setup (Currently Active)

When developing locally on your laptop:

```
┌───────────────────────────────────────┐
│     Website Frontend (React 19)       │
│        http://localhost:3000          │
└──────────────────┬────────────────────┘
                   │ POST /api/chat
                   ▼
┌───────────────────────────────────────┐
│      Chatbot Server (server.ts)       │
│        http://localhost:3001          │
│                                       │
│  1. Pulls live data from Supabase     │
│  2. Assembles grounded prompt         │
└──────────────────┬────────────────────┘
                   │ POST /api/chat (HTTP)
                   ▼
┌───────────────────────────────────────┐
│       Local Ollama Engine             │
│        http://localhost:11434         │
│                                       │
│  Model: orven-ai (Qwen 2.5 1.5B)      │
└───────────────────────────────────────┘
```

---

### B. Live Production Deployment Setup (Cloud + Tunnel)

When the website is deployed publicly on your custom domain:

```
┌────────────────────────────────────────────────────────┐
│               Public Portfolio Visitor                 │
│             https://www.orvencasido.site               │
└───────────────────────────┬────────────────────────────┘
                            │ 1. POST /functions/v1/chatbot
                            ▼
┌────────────────────────────────────────────────────────┐
│          Supabase Edge Function (Lives 24/7)           │
│             "The Front-Facing Gateway"                 │
│                                                        │
│  • Reads Supabase PostgreSQL directly (0ms DB latency) │
│  • Enforces IP rate-limiting (e.g., 20 msgs/hr per IP) │
│  • Bundles: [Orven's Supabase Data] + [User Query]     │
│  • Attaches secret header: x-tunnel-secret             │
└───────────────────────────┬────────────────────────────┘
                            │ 2. HTTPS POST via Cloudflare Edge
                            ▼
┌────────────────────────────────────────────────────────┐
│           Cloudflare Zero Trust Ingress                │
│             https://llm.orvencasido.site               │
└───────────────────────────┬────────────────────────────┘
                            │ 3. Outbound tunnel connection
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Your Local Ubuntu Laptop               │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │ cloudflared daemon (systemd service)           │   │
│   │ Forwards to: http://localhost:3001             │   │
│   └───────────────────────┬────────────────────────┘   │
│                           │ Validates x-tunnel-secret  │
│                           ▼                            │
│   ┌────────────────────────────────────────────────┐   │
│   │ Chatbot Service / Ollama                       │   │
│   │ Model: orven-ai (Qwen 2.5 1.5B)                │   │
│   │ Computes answer & streams tokens back          │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## 3. The Detailed Request-Response Lifecycle

```
Visitor                          Supabase Edge Fn                Local Laptop (Ollama)
   │                                    │                                  │
   │─── 1. "What is your stack?" ──────►│                                  │
   │                                    │── 2. Query Supabase tables:      │
   │                                    │      (profiles, skills, exp...)  │
   │                                    │                                  │
   │                                    │── 3. Assemble Grounded Prompt ──►│
   │                                    │      (Context + Question)        │
   │                                    │                                  │
   │                                    │◄── 4. Stream Tokens (SSE) ───────│
   │◄── 5. Stream Tokens to UI ─────────│                                  │
```

1. **Visitor submits inquiry**: Types a question in the floating chatbot on the website.
2. **Edge Function receives request**: Checks client rate-limiting to prevent spam.
3. **Internal database query**: Reads your `profiles`, `skills`, `experiences`, and `projects` tables directly inside Supabase with microsecond internal latency.
4. **Context Injection**: Pre-pends the fresh database content into the system prompt.
5. **Tunnel transmission**: Posts the payload securely down the Cloudflare Tunnel to your local machine.
6. **Local LLM reasoning**: Qwen 2.5 1.5B generates the answer based strictly on your real data.
7. **Streaming back**: Chunks flow up through the tunnel, through the Edge Function, directly into the visitor's chat bubble in real-time.

---

## 4. Why This Architecture Excels

| Benefit | Explanation |
| :--- | :--- |
| **$0 Cloud GPU Costs** | You run the 1.1GB Qwen 2.5 GGUF model completely on your own hardware for free. |
| **Instant Updates** | When you edit projects, skills, or bios in the Admin CMS (`/orven`), the next question answered already includes the updated information—**no retraining or fine-tuning required**. |
| **Security & Privacy** | Cloudflare Tunnel is **outbound-only**. Your home IP address, Wi-Fi router, and local ports are never exposed to the public internet. |
| **DDoS & Abuse Protection** | The 24/7 Supabase Edge Function blocks abusive IPs before they ever touch your laptop's tunnel. |

---

## 5. Security & Ingress Verification

To ensure that random internet scanners cannot bombard your laptop's tunnel directly:

1. **Shared Secret Verification**:
   The Supabase Edge Function includes a secret header:
   ```http
   x-tunnel-secret: your_long_random_secret_here
   ```
2. **Local Gatekeeper**:
   The local service checks `req.headers['x-tunnel-secret'] === process.env.TUNNEL_SECRET`. If mismatched or missing, it rejects with `401 Unauthorized` without waking up Ollama.

---

## 6. Offline Fallback Handling

Because the local model runs on your laptop:
* If your laptop is asleep, closed, or offline, the Edge Function or frontend client detects an unreachable tunnel.
* The frontend chat widget displays a clean fallback message:
  > *"AI Orven is currently resting offline. Feel free to reach Orven directly at orvencasidop@gmail.com!"*

---

## 7. Future Deployment Checklist (When Ready)

When you are ready to take this live:

1. **Add DNS Route in `cloudflared`**:
   ```bash
   cloudflared tunnel route dns n8n-orven llm.yourdomain.com
   ```
   *(Route the traffic to `http://localhost:3001` in your `~/.cloudflared/config.yml`)*
2. **Deploy the Supabase Edge Function**:
   ```bash
   supabase functions deploy chatbot
   ```
3. **Configure Environment Secrets**:
   Set `TUNNEL_URL` and `TUNNEL_SECRET` in Supabase Secrets.
4. **Point Frontend Widget**:
   Update `VITE_CHATBOT_API_URL` to point to your live Supabase Edge Function endpoint.
