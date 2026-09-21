# Remaining Steps: AI Assistant & n8n Integration

This document outlines the remaining steps to connect your live **n8n** automation instance to your **Admin CMS (`/orven/dashboard/ai`)** using **Google Gemini** and your public Cloudflare Tunnel.

---

## Current Status & What is Already Done ✅

* [x] **Dockerized n8n**: Running locally on `127.0.0.1:5678` (`orven_n8n` container).
* [x] **Cloudflare Tunnel (`cloudflared`)**: Running as an Ubuntu systemd service.
* [x] **Public Domain**: `https://n8n.orvencasido.site` is live and reachable via Cloudflare.
* [x] **React Admin CMS UI**: Fully developed at `/orven/dashboard/ai` with chat history sidebar, auto-scroll, suggestion pills, and action audit cards.
* [x] **Service Layer**: [`src/lib/aiChatService.ts`](src/lib/aiChatService.ts) handles session persistence, health checks, and secure webhook calls.
* [x] **Workflow Template**: Pre-built export available at [`n8n/workflow.json`](n8n/workflow.json).

---

## Remaining Action Items

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 1. Run Supabase SQL Migration (Create ai_chat_sessions & messages)       │
├───────────────────────────────────────────────────────────────────────────┤
│ 2. Get Free Gemini API Key from Google AI Studio                          │
├───────────────────────────────────────────────────────────────────────────┤
│ 3. Add Gemini Credential into n8n                                         │
├───────────────────────────────────────────────────────────────────────────┤
│ 4. Import & Activate Workflow in n8n                                      │
├───────────────────────────────────────────────────────────────────────────┤
│ 5. Set Environment Variables in `.env` & Restart Vite                     │
├───────────────────────────────────────────────────────────────────────────┤
│ 6. End-to-End Test from Admin CMS (/orven/dashboard/ai)                  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### Step 1: Run Supabase SQL Migration

If you haven't run the new AI tables yet in your Supabase project:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) -> Select your project (`razkqzmzqdjbhjwyagnt`).
2. Navigate to **SQL Editor** -> **New query**.
3. Paste and run this SQL snippet:

```sql
-- 1. Create AI Chat Sessions Table
create table if not exists public.ai_chat_sessions (
  id text primary key,
  title text not null default 'New Conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create AI Chat Messages Table
create table if not exists public.ai_chat_messages (
  id text primary key,
  session_id text not null references public.ai_chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  actions jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. Fast indexing for message lookups
create index if not exists idx_ai_chat_messages_session on public.ai_chat_messages(session_id, created_at asc);

-- 4. Enable Row Level Security (Admin Authenticated Only)
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;

create policy "Authenticated admins can manage chat sessions" on public.ai_chat_sessions
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated admins can manage chat messages" on public.ai_chat_messages
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

---

### Step 2: Get a Free Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Create API key** -> Select or create a Google Cloud project.
4. Copy your API Key (e.g. `AIzaSy...`).

---

### Step 3: Add Gemini Credential into n8n

1. Access your n8n dashboard in your browser:
   * Local URL: **`http://localhost:5678`**
   * Or public tunnel: **`https://n8n.orvencasido.site`**
2. In the left navigation menu, click **Credentials**.
3. Click **Add Credential** (top-right button).
4. Search for: **`Google PaLM and Gemini PaLM API`**.
5. Fill in the fields:
   * **Credential Name**: `Google AI Studio API Key`
   * **API Key**: Paste your Google AI Studio API key from Step 2.
6. Click **Save**.

---

### Step 4: Import & Activate the n8n Workflow

1. In n8n, click **Workflows** in the left sidebar.
2. Click the **`...`** (menu icon top-right) and choose **Import from File...**.
3. Select the file:
   `n8n/workflow.json` (located in `/home/orven/Documents/orvencasido-final-cv-website/n8n/workflow.json`).
4. Click into the **Google Gemini Model** node:
   * Ensure **Credential for Google PaLM and Gemini PaLM API** is set to `Google AI Studio API Key`.
5. Check the **Webhook Trigger** node:
   * Path should be: `orven-ai-assistant`
   * HTTP Method: `POST`
6. **Activate the workflow**:
   * Switch the toggle in the top-right corner from **Inactive** to **Active**.
   * Click **Save** (`Ctrl + S`).

---

### Step 5: Test the Webhook API Directly

Run this command in your Ubuntu terminal to verify that your n8n webhook responds securely:

```bash
curl -X POST https://n8n.orvencasido.site/webhook/orven-ai-assistant \
  -H "Content-Type: application/json" \
  -H "x-admin-token: secret-admin-token-12345" \
  -d '{"sessionId": "test_1", "message": "Hello from terminal test"}'
```

You should receive a JSON response:
```json
{
  "sessionId": "test_1",
  "reply": "...",
  "actions": [],
  "timestamp": "..."
}
```

---

### Step 6: Update Portfolio CMS Environment Variables

Open the [`.env`](.env) file in your project root and add the following two lines:

```env
# Public Cloudflare Tunnel webhook URL to your n8n workflow
VITE_N8N_WEBHOOK_URL="https://n8n.orvencasido.site/webhook/orven-ai-assistant"

# Secret key configured in n8n and docker-compose.yml
VITE_N8N_ADMIN_SECRET="secret-admin-token-12345"
```

Restart your Vite dev server:
```bash
npm run dev
```

---

### Step 7: Open and Use the AI Assistant

1. Go to your local CMS Admin:
   👉 **`http://localhost:3000/orven/dashboard/ai`**
2. Notice the status indicator in the top right:
   * **🟢 Tunnel Active**
3. Try sending commands:
   * *"Review my skills and recommend high-demand DevOps tools."*
   * *"Add a new experience as Senior DevOps Engineer at Google from Jan 2025 to Present."*
   * *"Draft a project showcase for Multi-Cloud Kubernetes GitOps."*

The assistant will reply in real-time, execute operations, and persist full chat history to your Supabase database!
