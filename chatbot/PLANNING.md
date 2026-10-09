# Planning: Autonomous "AI Orven" Chatbot using Qwen 2.5 1.5B & Supabase

**Date**: 2026-10-10  
**Target Model**: Qwen 2.5 1.5B Instruct (`/home/orven/Documents/llm/qwen2.5-1.5b-instruct-q4_k_m.gguf` via Ollama)  
**Database**: Supabase (`razkqzmzqdjbhjwyagnt.supabase.co`)  
**Host Application**: Orven Casido Portfolio & CMS (`React 19 + Vite`)  

---

## 1. Feasibility: Is it possible to create a chatbot that knows you?

**Yes, 100% viable, fast, and highly reliable.**

You have:
1. **A running local Ollama instance** with Qwen 2.5 1.5B GGUF ready.
2. **A structured Supabase database** that already contains all the ground-truth facts about you.
3. **Qwen 2.5's architecture**, which supports up to 32k context tokens, instruction adherence, and fast inference (50–100+ tokens/sec on CPU/GPU).

---

## 2. What Data Does Supabase Already Have About You?

Your Supabase database contains dedicated tables that define your full professional identity:

| Supabase Table | Context Available to the Chatbot |
| :--- | :--- |
| `profiles` | Full name, professional title (DevOps Engineer), bio, email, location, availability status |
| `experiences` | Career history, companies, employment types, dates, responsibilities, tech stacks, achievements |
| `projects` | Shipped projects, architecture details, technologies, GitHub URLs, live demo URLs |
| `skills` | DevOps & Cloud, Backend, Frontend, IaC skills, and proficiencies |
| `certifications` | Cloud credentials, issuing organizations, verification links |
| `education` | University, degrees, activities, coursework |
| `blogs` | Technical articles, summaries, and tags written by you |

Whenever you edit your portfolio in the Admin CMS (`/orven`), the chatbot immediately reflects those updates without needing to re-train the model.

---

## 3. Grounding Strategy: How Qwen 2.5 Learns About You

There are two primary ways to ground the model with your data:

### Strategy A: Full Context Injection (Recommended & Simplest)
* **How it works**:
  * Orven's complete structured resume/portfolio context is approximately **1,500 – 2,500 tokens**.
  * Qwen 2.5 1.5B comfortably handles an 8k to 32k context window.
  * When a visitor starts a conversation, the backend pulls your latest profile, experiences, skills, and projects from Supabase and injects them directly into the system prompt.
* **Benefits**:
  * **Zero embedding latency**: No need for a vector database.
  * **100% accurate**: The model has the complete picture of your career and cannot hallucinate missing companies or technologies.
  * **Real-time updates**: Any changes made in the Admin CMS are reflected instantly.

### Strategy B: RAG (Retrieval-Augmented Generation)
* **When to use**: If you want the chatbot to index long-form blog articles, full code repositories, or PDF documents.
* **How it works**:
  * Text chunks are stored in Supabase with `pgvector` or in a local vector index.
  * User queries retrieve top-K relevant passages and pass only those to Qwen.

---

## 4. End-to-End System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Public Portfolio Website                        │
│                 (Floating "Chat with AI Orven" Widget)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / WebSocket (Chat Message)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Chatbot Service Layer (`chatbot/`)                 │
│                                                                        │
│   1. Fetch Orven's Knowledge Base ──► Supabase PostgreSQL              │
│      (profiles, experiences, skills, projects, certifications)         │
│                                                                        │
│   2. Build Augmented Prompt:                                           │
│      - System Persona ("You are Orven Casido's AI digital twin...")    │
│      - Ground Truth Context (from Supabase)                            │
│      - Conversation History (Last N turns)                             │
│      - Visitor's Query                                                 │
│                                                                        │
│   3. Stream Prompt to Ollama REST API (`http://localhost:11434`)       │
│      - Model: `orven-ai` (based on Qwen 2.5 1.5B)                      │
│                                                                        │
│   4. Stream Response Tokens back to UI in real-time                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Persona Design for "AI Orven"

The model will be configured via a custom **Ollama Modelfile**:

* **Role**: Digital Representative & Technical Twin of Orven Casido.
* **Tone**: Professional, friendly, confident, and articulate DevOps engineer.
* **Capabilities**:
  * Answer technical questions about your projects and stack (Kubernetes, Docker, CI/CD, Terraform, AWS, etc.).
  * Share career milestones, previous roles, and achievements.
  * Explain your current availability (e.g. open to freelance / full-time offers).
  * Direct visitors to contact you via email (`orvencasidop@gmail.com`) or view your LinkedIn / GitHub.
* **Guardrails**:
  * Never invent fake employment history or technologies not in Supabase.
  * Politely decline off-topic queries outside of Orven's work, tech stack, and portfolio.

---

## 6. Implementation Roadmap

### Phase 1: Modelfile & Knowledge Preparation
- [ ] Create an `orven-ai` Modelfile in `chatbot/Modelfile` configured for Qwen 2.5 1.5B.
- [ ] Write a context-builder script to fetch and format Supabase tables into clean Markdown/JSON context.

### Phase 2: Chatbot Server / API Backend
- [ ] Build a lightweight server in `chatbot/` (Node.js/Express or Python FastAPI):
  - `GET /health`: Check connection to Ollama and Supabase.
  - `POST /chat`: Receive visitor message, augment with Supabase context, stream from Ollama.
  - Optional: Store visitor chat logs in Supabase table for analytics/review.

### Phase 3: Public UI Integration
- [ ] Create a modern floating Chat Widget component for the portfolio website.
- [ ] Add smooth message streaming, quick suggestion buttons (e.g., *"What is your tech stack?"*, *"Tell me about your latest project"*, *"Are you available for hire?"*).

### Phase 4: Testing & Deployment
- [ ] Test inference speed, memory consumption, and factual accuracy.
- [ ] Configure local launch or tunnel script for testing.
