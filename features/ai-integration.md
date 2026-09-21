# AI Integration & Local n8n Automation Architecture Plan

**Project**: Orven Casido — Portfolio & CMS  
**Branch**: `ai-integration`  
**Author**: Antigravity Pair Programmer & Orven Casido  
**Status**: Planning & Architecture Phase  

---

## 1. Executive Summary & Feasibility

### Is this possible?
**Yes, 100% viable, battle-tested, and secure.**

By running **n8n locally on your laptop** exposed via a **Cloudflare Tunnel (`cloudflared`)**, you achieve:
1. **No Open Ports / No Static IP Needed**: Cloudflare Tunnel establishes an outbound-only HTTPS connection from your laptop to Cloudflare's edge network, exposing your local n8n instance to your production/local Admin CMS without exposing your router or IP address.
2. **Persistent Chat History & Session Management**: Store full chat sessions and message threads in Supabase (`ai_chat_sessions` and `ai_chat_messages`). You can start fresh conversations at any time, browse past sessions, review actions taken, and delete any previous histories on demand.
3. **Native Tool Calling / Agentic Capabilities**: n8n's **AI Agent** node uses Google Gemini (`gemini-1.5-flash`, `gemini-1.5-pro`, or `gemini-2.0-flash`) with dynamic function/tool calling directly connected to Supabase tables.
4. **Context-Aware Automations**: The AI queries existing context (profile, experiences, projects, skills, certifications, blogs) and executes modifications (add/update/delete) based on conversational instructions from your admin dashboard.

---

## 2. High-Level Architecture Blueprint

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Admin CMS (`/orven`)                                  │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  Page: `/orven/dashboard/ai` (AI Assistant)                             │   │
│   │  ├── Sidebar: [New Chat] + Past Sessions List + [Delete / Clear All]    │   │
│   │  ├── Chat Stream: User & Assistant bubbles + Tool Action Audit Badges   │   │
│   │  ├── Tunnel Status Indicator: 🟢 Connected via Cloudflare / 🔴 Offline  │   │
│   │  └── Quick Prompts: Resume changes, skill suggestions, bio rewrite      │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         │ HTTPS POST (Tunnel URL + Admin Secret)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Cloudflare Edge & Zero-Trust Ingress                       │
│                     `https://n8n.yourdomain.com` or Quick Tunnel                │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ Secure Ingress (cloudflared daemon)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                 Local Laptop Environment (n8n + cloudflared)                    │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  Webhook Node (`/webhook/orven-ai-assistant`)                           │   │
│   │  - Validates `x-admin-token` or Supabase JWT                            │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  n8n AI Agent Node (Tools Agent)                                        │   │
│   │  ├── Model: Google Gemini Chat Model (via Google AI Studio)             │   │
│   │  ├── Memory: Session-Scoped Buffer / PostgreSQL Memory (by sessionId)   │   │
│   │  └── System Prompt: Senior DevOps & Full-Stack Portfolio Architect      │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
│                                        │ Calls Database Tools Dynamically       │
│         ┌──────────────────────────────┴──────────────────────────────┐         │
│         ▼                                                             ▼         │
│  ┌───────────────────────────┐                         ┌──────────────────────┐ │
│  │ Read Tools                │                         │ Write Tools          │ │
│  │ - fetch_full_context      │                         │ - manage_experience  │ │
│  │ - get_experiences         │                         │ - manage_projects    │ │
│  │ - get_skills              │                         │ - manage_skills      │ │
│  │ - get_profile             │                         │ - update_profile     │ │
│  └─────────────┬─────────────┘                         └──────────┬───────────┘ │
└────────────────┼──────────────────────────────────────────────────┼─────────────┘
                 │ Direct PostgreSQL or Supabase REST Client        │
                 ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Supabase Cloud Database                               │
│  Portfolio Data: [profiles] [experiences] [projects] [skills] [certifications]  │
│  Chat History:   [ai_chat_sessions] [ai_chat_messages]                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Chat History & Session Management Specification

### A. Database Schema for Chat Histories
We add two dedicated tables to Supabase with Row Level Security enabled (Admin Authenticated only):

```sql
-- 1. AI Chat Sessions Table
create table if not exists public.ai_chat_sessions (
  id text primary key,
  title text not null default 'New Conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. AI Chat Messages Table
create table if not exists public.ai_chat_messages (
  id text primary key,
  session_id text not null references public.ai_chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  actions jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexing for rapid session loading
create index if not exists idx_ai_chat_messages_session on public.ai_chat_messages(session_id, created_at asc);

-- RLS: Authenticated Admin Only
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;

create policy "Authenticated admins can manage chat sessions"
on public.ai_chat_sessions for all
using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Authenticated admins can manage chat messages"
on public.ai_chat_messages for all
using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

### B. Chat History Capabilities in the Admin UI
1. **Fresh Session Trigger (`+ New Chat`)**:
   - Clears the active chat thread from the viewport.
   - Generates a new `session_id` (e.g. `session_1742000000`).
   - The first user message automatically generates a concise conversation title (e.g., *"Update Kubernetes Experience"*).
2. **Session Drawer / Sidebar**:
   - Displays all historical chat sessions grouped chronologically (*Today*, *Yesterday*, *Previous 7 Days*, *Older*).
   - Clicking any past session instantly restores the message thread, context, and tool audit cards.
3. **Granular Deletion & History Management**:
   - **Delete Single Session**: Hovering over any session reveals a delete (`Trash2`) icon with an inline confirmation modal. Cascades and deletes all messages in that session.
   - **Clear All History**: A secondary action button in the session list to purge all previous chat histories.
4. **Session Persistence**:
   - Because sessions and messages are saved in Supabase, your conversation history persists across page reloads, browser restarts, and across devices.

---

## 4. Cloudflare Tunneling (`cloudflared`) Setup

Using **Cloudflare Tunnel**, you expose your local n8n instance safely to the web without port-forwarding or exposing your IP address.

### Option A: Named Tunnel with Custom Domain (Recommended for Permanent Setup)
1. Install `cloudflared` on Linux/macOS:
   ```bash
   # On Ubuntu/Debian Linux:
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared.deb
   ```
2. Login to Cloudflare:
   ```bash
   cloudflared tunnel login
   ```
3. Create the Tunnel:
   ```bash
   cloudflared tunnel create n8n-orven
   ```
4. Configure DNS route:
   ```bash
   cloudflared tunnel route dns n8n-orven n8n.yourdomain.com
   ```
5. Create `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: <TUNNEL-UUID>
   credentials-file: /home/orven/.cloudflared/<TUNNEL-UUID>.json

   ingress:
     - hostname: n8n.yourdomain.com
       service: http://localhost:5678
     - service: http_status:404
   ```
6. Run as a background service:
   ```bash
   cloudflared tunnel run n8n-orven
   # Or install as systemd service:
   # sudo cloudflared service install
   ```

### Option B: Quick Ephemeral Tunnel (Zero-config for instant testing)
```bash
cloudflared tunnel --url http://localhost:5678
```
Cloudflare will give you a temporary URL like:
`https://random-subdomain.trycloudflare.com`
You can paste this URL into your CMS [`.env`](file:///home/orven/Documents/orvencasido-final-cv-website/.env) as `VITE_N8N_WEBHOOK_URL`.

---

## 5. Security & Ingress Protection

To guarantee that only **your** Admin CMS can trigger the local n8n AI Agent:
1. **Shared Secret Header**:
   - The React Admin client sends a custom header with every request:
     `x-admin-token: <RANDOM_SECRET_KEY>`
   - The n8n Webhook node or subsequent Code node verifies this secret before invoking the LLM or touching the database.
2. **Supabase JWT Verification (Optional High Security)**:
   - Pass the admin's Supabase session access token in the `Authorization: Bearer <TOKEN>` header.
   - n8n validates the token against Supabase Auth endpoint before processing.

---

## 6. Detailed n8n Workflow Design

### Workflow Nodes Layout:
1. **Webhook Node**:
   - **Path**: `webhook/orven-ai-assistant`
   - **Method**: `POST`
   - **Payload**:
     ```json
     {
       "sessionId": "session_123456",
       "message": "Add a new experience at Google as Staff DevOps Engineer from Jan 2025 to Present",
       "userId": "prof_1"
     }
     ```
2. **Auth Verification Node (Code Node)**:
   - Checks `req.headers['x-admin-token'] === $env.ORVEN_ADMIN_SECRET`.
   - Halts and returns 401 if unauthorized.
3. **AI Agent Node (Tools Agent)**:
   - **Model**: `Chat Google Generative AI` (Google Gemini 1.5/2.0 Flash/Pro).
   - **Chat Memory**: `Postgres Chat Memory` or `Window Buffer Memory` keyed to `{{ $json.sessionId }}`.
   - **System Instructions**:
     > "You are Orven Casido's Personal Portfolio & Resume AI Assistant. You have real-time read and write tools to manage his portfolio database on Supabase. Before modifying or deleting records, query existing context first. When executing changes, confirm the exact items created, updated, or removed."
4. **Agent Tools (Sub-nodes)**:
   - 🔍 `get_full_context`: Reads current profile, experiences, projects, skills, and certifications from Supabase.
   - ✍️ `manage_experience`: Adds, edits, or deletes timeline items in `experiences`.
   - ✍️ `manage_project`: Adds, edits, or deletes showcase items in `projects`.
   - ✍️ `manage_skill`: Adds, modifies proficiency, or deletes badges in `skills`.
   - ✍️ `manage_profile`: Updates title, bio, location, or availability status in `profiles`.
5. **Database Logging (Supabase Node)**:
   - Inserts the user message and AI response into `ai_chat_messages` linked to `sessionId`.
6. **Respond to Webhook Node**:
   - Returns structured JSON to the React Admin interface:
     ```json
     {
       "sessionId": "session_123456",
       "reply": "Successfully added your Staff DevOps Engineer position at Google.",
       "actions": [
         {
           "type": "CREATE",
           "table": "experiences",
           "recordId": "exp_1742000000",
           "summary": "Staff DevOps Engineer at Google"
         }
       ],
       "timestamp": "2026-09-18T16:35:00Z"
     }
     ```

---

## 7. Frontend UI Specification (`/orven/dashboard/ai`)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AI Assistant                                                              🟢 Tunnel Active    │
│  Manage your portfolio content, resume items, and skills with conversational AI               │
├──────────────────────────┬─────────────────────────────────────────────────────────────────────┤
│  [+ New Chat]            │  🤖 AI Assistant                                                    │
│                          │  Hello Orven! I have loaded your current portfolio context.         │
│  TODAY                   │  What would you like to update or query today?                     │
│  • Update K8s Experience │                                                                     │
│  • Add Terraform Skill   │  👤 You                                                             │
│                          │  Please add a new experience: Senior Cloud Architect at AWS.        │
│  PREVIOUS 7 DAYS         │                                                                     │
│  • Review DevOps Certs   │  🤖 AI Assistant                                                    │
│  • Polish Biography      │  Done! I've added the new position to your career timeline.        │
│                          │  ┌───────────────────────────────────────────────────────────────┐  │
│  ──────────────────────  │  │ ✅ Created: Senior Cloud Architect at AWS                     │  │
│  [🗑️ Clear All History]  │  │ ID: exp_1742000000 · Status: Saved to Supabase                │  │
│                          │  └───────────────────────────────────────────────────────────────┘  │
│                          │                                                                     │
│                          ├─────────────────────────────────────────────────────────────────────┤
│                          │  [ Ask anything or command: "Add project...", "Update bio..." ] [➤] │
└──────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```

### Key UI Capabilities:
* **Two-Panel Layout**: Left collapsible sidebar for session history and management; right panel for the live conversational thread.
* **Inline Action Badges**: Visual confirmation boxes indicating which database table was touched, the action type (Create/Update/Delete), and a link to view that item in its respective manager.
* **Auto-Refetch Hooks**: When an action occurs, trigger a global event or query invalidation so if you switch to the "Experience" or "Projects" tab, the newly modified item is already there without refreshing the browser.
* **Quick Prompt Suggestions**: Clickable pills below the input box to trigger frequent operations with one tap.

---

## 8. Phased Implementation Roadmap

### Phase 1: Database & Cloudflare Tunnel Preparation
- [ ] Run the SQL migration to create `ai_chat_sessions` and `ai_chat_messages` in Supabase.
- [ ] Set up `cloudflared` on laptop pointing to `http://localhost:5678`.
- [ ] Record Tunnel URL in `.env` (`VITE_N8N_WEBHOOK_URL`).

### Phase 2: n8n Workflow & Tool Assembly
- [ ] Create workflow with Webhook trigger and security validation.
- [ ] Connect Google Gemini Chat Model with `GEMINI_API_KEY`.
- [ ] Configure Supabase Tools for CRUD on `experiences`, `projects`, `skills`, and `profiles`.
- [ ] Test tool execution in n8n UI.

### Phase 3: React Admin CMS UI Implementation
- [ ] Create [`src/pages/admin/dashboard/AIAssistantPage.tsx`](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/admin/dashboard/AIAssistantPage.tsx) with session history sidebar, chat feed, and input bar.
- [ ] Add route to [`src/App.tsx`](file:///home/orven/Documents/orvencasido-final-cv-website/src/App.tsx) and sidebar link in [`src/components/admin/AdminLayout.tsx`](file:///home/orven/Documents/orvencasido-final-cv-website/src/components/admin/AdminLayout.tsx).
- [ ] Implement session CRUD services in [`src/lib/aiChatService.ts`](file:///home/orven/Documents/orvencasido-final-cv-website/src/lib/aiChatService.ts) (create session, list sessions, delete session, clear all).
- [ ] Add health-check ping to display live Cloudflare Tunnel connectivity status.

### Phase 4: End-to-End Verification
- [ ] Verify starting a fresh chat vs continuing an existing thread.
- [ ] Verify deleting a single history vs clearing all histories.
- [ ] Verify AI updating resume context and verifying that the changes reflect immediately on public and admin pages.
