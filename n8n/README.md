# Setup Guide: Dockerized n8n + Native Cloudflare Tunnel on Ubuntu

This guide walks you through running **n8n in Docker** and exposing it on Ubuntu using **native `cloudflared`**.

---

## 1. Architecture Overview

```
               Internet / Cloudflare Zero Trust Edge
                                │
                                ▼
 ┌── Ubuntu Host ───────────────┼────────────────────────────────────┐
 │                              │ HTTPS Ingress                      │
 │                              ▼                                    │
 │                    ┌───────────────────┐                          │
 │                    │    cloudflared    │ (native Ubuntu package)  │
 │                    └─────────┬─────────┘                          │
 │                              │ forwards to http://localhost:5678  │
 │                              ▼                                    │
 │        ┌──────────────────────────────────────────────┐           │
 │        │  Docker Container (orven_n8n)               │           │
 │        │  - n8n Automation Engine                     │           │
 │        │  - Port 5678:5678 (127.0.0.1)                │           │
 │        └─────────────────────┬────────────────────────┘           │
 │                              │                                    │
 └──────────────────────────────┼────────────────────────────────────┘
                                │ Calls Tools / SQL
                                ▼
                    Supabase Cloud Database
```

---

## 2. Step 1: Run n8n in Docker

In this directory (`n8n`), run:

```bash
docker compose up -d
```

Verify that the n8n container is running:
```bash
docker compose ps
```

You can access the n8n web interface at:
👉 **`http://localhost:5678`**

On your first visit, create your local owner account.

---

## 3. Step 2: Install `cloudflared` on Ubuntu

Choose either Method A (quick `.deb` install) or Method B (official repository):

### Method A: Install via Official `.deb` Package (Fastest)

```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
rm -f cloudflared.deb
```

Verify the installation:
```bash
cloudflared --version
```

---

## 4. Step 3: Expose n8n with `cloudflared`

You can use either a **Quick Ephemeral Tunnel** (instant for testing) or a **Named Custom Domain Tunnel** (permanent).

### Option A: Quick Ephemeral Tunnel (Zero Configuration)
Run this command in your Ubuntu terminal:
```bash
cloudflared tunnel --url http://localhost:5678
```

You will see output containing your temporary public address:
```text
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://unique-subdomain.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

Your webhook endpoint is:
`https://unique-subdomain.trycloudflare.com/webhook/orven-ai-assistant`

---

### Option B: Permanent Named Tunnel (Custom Domain)

1. Authenticate `cloudflared` with your Cloudflare account:
   ```bash
   cloudflared tunnel login
   ```
   *(Opens a browser to authorize your Cloudflare domain zone)*

2. Create a named tunnel:
   ```bash
   cloudflared tunnel create n8n-orven
   ```
   *Take note of the `<TUNNEL_UUID>` output by the command.*

3. Route your desired subdomain to the tunnel:
   ```bash
   cloudflared tunnel route dns n8n-orven n8n.yourdomain.com
   ```

4. Create the config file `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: <TUNNEL_UUID>
   credentials-file: /home/orven/.cloudflared/<TUNNEL_UUID>.json

   ingress:
     - hostname: n8n.yourdomain.com
       service: http://localhost:5678
     - service: http_status:404
   ```

5. Test running the tunnel:
   ```bash
   cloudflared tunnel run n8n-orven
   ```

6. *(Optional)* Install as an Ubuntu systemd background service so it auto-starts on boot:
   ```bash
   sudo cloudflared service install
   sudo systemctl enable --now cloudflared
   ```

Your permanent webhook endpoint will be:
`https://n8n.yourdomain.com/webhook/orven-ai-assistant`

---

## 5. Step 4: Configure Google Gemini Credentials in n8n

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a free API Key.
2. In n8n (`http://localhost:5678`):
   - Go to **Credentials** -> **Add Credential**.
   - Search for **Google PaLM and Gemini PaLM API**.
   - Paste your API key and set the credential name to `Google AI Studio API Key`.
   - Click **Save**.

---

## 6. Step 5: Import & Activate the Workflow

1. In n8n, click **Workflows** in the sidebar.
2. Click the **`...`** (top right) -> **Import from File...**.
3. Select [`workflow.json`](./workflow.json).
4. Verify that the **Google Gemini Model** node is attached to your `Google AI Studio API Key` credential.
5. In the top-right corner of the workflow canvas, switch the toggle to **Active**.

---

## 7. Step 6: Connect to Portfolio Admin CMS

In the root of your portfolio project, add or update the variables in your [`.env`](../.env) file:

```env
# Tunnel URL from Step 3 + /webhook/orven-ai-assistant
VITE_N8N_WEBHOOK_URL="https://your-tunnel-url.trycloudflare.com/webhook/orven-ai-assistant"

# Secret matching ORVEN_ADMIN_SECRET in docker-compose.yml
VITE_N8N_ADMIN_SECRET="secret-admin-token-12345"
```

Restart your dev server:
```bash
npm run dev
```

Visit:
👉 **`http://localhost:3000/orven/dashboard/ai`**

The status indicator in the top right will show **Tunnel Active 🟢**, ready for you to manage your portfolio through conversational AI!
