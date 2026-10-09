import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getOrvenContext } from './context.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.CHATBOT_PORT ? parseInt(process.env.CHATBOT_PORT) : 3001;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const MODEL_NAME = process.env.ORVEN_MODEL_NAME || 'orven-ai';

// Middleware
app.use(express.json());

// CORS config
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const ollamaCheck = await fetch(`${OLLAMA_HOST}/api/tags`).catch(() => null);
    const ollamaOk = ollamaCheck ? ollamaCheck.ok : false;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      model: MODEL_NAME,
      ollamaOnline: ollamaOk,
      ollamaHost: OLLAMA_HOST,
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Refresh context endpoint (admin trigger or manual)
app.post('/api/refresh-context', async (_req: Request, res: Response) => {
  try {
    const context = await getOrvenContext(true);
    res.json({ success: true, contextLength: context.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Main Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, stream = true } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    // 1. Get real-time ground truth context from Supabase
    const context = await getOrvenContext();

    const systemPrompt = `You are "AI Orven" — the digital technical representative and portfolio assistant for Orven Casido, a DevOps & Full-Stack Engineer.

Core Directives:
1. Speak in first/third person representation of Orven Casido ("I am AI Orven, Orven's digital representative...", "Orven has experience with...").
2. Answer visitor questions clearly, articulately, and factually based on the ground truth provided below.
3. If asked about a tool, company, or credential NOT present in the knowledge base, honestly state that Orven has not listed that on his current verified record and offer his contact email (orvencasidop@gmail.com).
4. Highlight his core DevOps strengths: Kubernetes, Docker, CI/CD, Terraform, Cloud Architecture (AWS/Azure), DevSecOps, and cost optimization.
5. Keep answers concise, helpful, and invite recruiters and clients to connect.

=== VERIFIED GROUND-TRUTH KNOWLEDGE BASE ===
${context}
=== END KNOWLEDGE BASE ===`;

    // Take last 8 turns of conversation
    const recentMessages = messages.slice(-8).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || ''),
    }));

    const ollamaPayload = {
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentMessages,
      ],
      stream: stream !== false,
      options: {
        temperature: 0.3,
        top_p: 0.85,
      },
    };

    const ollamaRes = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaPayload),
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text().catch(() => '');
      return res.status(502).json({
        error: `Ollama error (${ollamaRes.status}): ${errText || ollamaRes.statusText}`,
      });
    }

    if (!stream) {
      const json: any = await ollamaRes.json();
      return res.json({
        reply: json.message?.content || '',
        done: true,
      });
    }

    // Server-Sent Events (SSE) streaming
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (!ollamaRes.body) {
      res.write(`data: ${JSON.stringify({ content: 'No response body received.' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const parsed = JSON.parse(trimmed);
          const chunk = parsed.message?.content || '';
          if (chunk) {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          }
          if (parsed.done) {
            res.write('data: [DONE]\n\n');
          }
        } catch {
          // ignore partial json
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim());
        const chunk = parsed.message?.content || '';
        if (chunk) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      } catch {}
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI Orven Chatbot server running at http://0.0.0.0:${PORT}`);
  console.log(`Connected to Ollama at ${OLLAMA_HOST} using model '${MODEL_NAME}'`);
});
