import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AIChatSession, AIChatMessage, AIAction } from '../types';

const LOCAL_SESSIONS_KEY = 'orven_ai_chat_sessions';
const LOCAL_MESSAGES_KEY = 'orven_ai_chat_messages';

export const getN8NConfig = () => {
  const env = (import.meta as any).env || {};
  const webhookUrl = (env.VITE_N8N_WEBHOOK_URL || '').trim();
  const adminSecret = (env.VITE_N8N_ADMIN_SECRET || '').trim();
  return {
    webhookUrl,
    adminSecret,
    isConfigured: Boolean(webhookUrl),
  };
};

/* ==========================================================================
   LOCAL STORAGE FALLBACK HELPERS
   ========================================================================== */
function getLocalSessions(): AIChatSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalSessions(sessions: AIChatSession[]) {
  try {
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to write local sessions:', e);
  }
}

function getLocalMessages(sessionId: string): AIChatMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    const all: AIChatMessage[] = raw ? JSON.parse(raw) : [];
    return all.filter((m) => m.session_id === sessionId);
  } catch {
    return [];
  }
}

function saveLocalMessage(msg: AIChatMessage) {
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    const all: AIChatMessage[] = raw ? JSON.parse(raw) : [];
    all.push(msg);
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to write local message:', e);
  }
}

function deleteLocalSession(sessionId: string) {
  const sessions = getLocalSessions().filter((s) => s.id !== sessionId);
  setLocalSessions(sessions);
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    if (raw) {
      const all: AIChatMessage[] = JSON.parse(raw);
      const filtered = all.filter((m) => m.session_id !== sessionId);
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('Failed to clean local messages:', e);
  }
}

function clearAllLocalSessions() {
  localStorage.removeItem(LOCAL_SESSIONS_KEY);
  localStorage.removeItem(LOCAL_MESSAGES_KEY);
}

/* ==========================================================================
   SESSION & MESSAGE SERVICES (Supabase with Local Fallback)
   ========================================================================== */
export async function getChatSessions(): Promise<AIChatSession[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        return data as AIChatSession[];
      }
      console.warn('Supabase ai_chat_sessions error, falling back to local:', error?.message);
    } catch (err) {
      console.warn('Failed to query Supabase sessions:', err);
    }
  }
  return getLocalSessions().sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export async function createChatSession(customId?: string, title = 'New Conversation'): Promise<AIChatSession> {
  const now = new Date().toISOString();
  const id = customId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newSession: AIChatSession = {
    id,
    title,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .insert(newSession)
        .select()
        .single();

      if (!error && data) {
        return data as AIChatSession;
      }
      console.warn('Failed to insert session into Supabase, saving local:', error?.message);
    } catch (err) {
      console.warn('Supabase session insert threw exception:', err);
    }
  }

  const local = getLocalSessions();
  local.unshift(newSession);
  setLocalSessions(local);
  return newSession;
}

export async function updateChatSessionTitle(sessionId: string, title: string): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('ai_chat_sessions')
        .update({ title, updated_at: now })
        .eq('id', sessionId);

      if (!error) return;
    } catch (err) {
      console.warn('Failed to update session title in Supabase:', err);
    }
  }

  const local = getLocalSessions();
  const index = local.findIndex((s) => s.id === sessionId);
  if (index >= 0) {
    local[index].title = title;
    local[index].updated_at = now;
    setLocalSessions(local);
  }
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('ai_chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (!error) {
        deleteLocalSession(sessionId);
        return;
      }
    } catch (err) {
      console.warn('Failed to delete session from Supabase:', err);
    }
  }
  deleteLocalSession(sessionId);
}

export async function clearAllChatSessions(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('ai_chat_sessions')
        .delete()
        .neq('id', '');

      if (!error) {
        clearAllLocalSessions();
        return;
      }
    } catch (err) {
      console.warn('Failed to clear sessions from Supabase:', err);
    }
  }
  clearAllLocalSessions();
}

export async function getChatMessages(sessionId: string): Promise<AIChatMessage[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as AIChatMessage[];
      }
    } catch (err) {
      console.warn('Failed to query messages from Supabase:', err);
    }
  }
  return getLocalMessages(sessionId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function saveChatMessage(
  sessionId: string,
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    actions?: AIAction[];
  }
): Promise<AIChatMessage> {
  const now = new Date().toISOString();
  const fullMessage: AIChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    session_id: sessionId,
    role: message.role,
    content: message.content,
    actions: message.actions || [],
    created_at: now,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .insert(fullMessage)
        .select()
        .single();

      if (!error && data) {
        // Also update the session's updated_at timestamp
        await supabase
          .from('ai_chat_sessions')
          .update({ updated_at: now })
          .eq('id', sessionId);

        return data as AIChatMessage;
      }
      console.warn('Supabase message insert error, saving local:', error?.message);
    } catch (err) {
      console.warn('Supabase message insert threw exception:', err);
    }
  }

  saveLocalMessage(fullMessage);
  // Update session local timestamp
  const localSessions = getLocalSessions();
  const sIdx = localSessions.findIndex((s) => s.id === sessionId);
  if (sIdx >= 0) {
    localSessions[sIdx].updated_at = now;
    setLocalSessions(localSessions);
  }
  return fullMessage;
}

/* ==========================================================================
   N8N & TUNNEL INVOCATION
   ========================================================================== */
export interface N8NResponse {
  reply: string;
  actions?: AIAction[];
  sessionId?: string;
  timestamp?: string;
}

export async function sendMessageToN8N(
  sessionId: string,
  userMessage: string
): Promise<N8NResponse> {
  const { webhookUrl, adminSecret, isConfigured } = getN8NConfig();

  if (!isConfigured) {
    throw new Error(
      'n8n Webhook URL is not configured. Please set VITE_N8N_WEBHOOK_URL in your .env file.'
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (adminSecret) {
    headers['x-admin-token'] = adminSecret;
  }

  const payload = {
    sessionId,
    message: userMessage,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed with n8n. Please verify VITE_N8N_ADMIN_SECRET matches your workflow secret.');
      }
      throw new Error(`n8n responded with status ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();

    // Standardize n8n response format
    const reply = data.reply || data.output || data.message || (typeof data === 'string' ? data : JSON.stringify(data));
    const actions: AIAction[] = Array.isArray(data.actions) ? data.actions : [];

    return {
      reply,
      actions,
      sessionId: data.sessionId || sessionId,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Unable to connect to n8n. Ensure your Docker container is running and Cloudflare Tunnel (cloudflared) is active.'
      );
    }
    throw err;
  }
}

export async function checkTunnelHealth(): Promise<{
  status: 'connected' | 'offline' | 'unconfigured';
  message: string;
}> {
  const { webhookUrl, isConfigured } = getN8NConfig();

  if (!isConfigured) {
    return {
      status: 'unconfigured',
      message: 'Tunnel not configured. Add VITE_N8N_WEBHOOK_URL in .env.',
    };
  }

  try {
    // Attempt an OPTIONS or HEAD or lightweight test
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(webhookUrl, {
      method: 'OPTIONS',
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeout);

    if (res && (res.status < 500 || res.status === 405 || res.status === 401)) {
      return {
        status: 'connected',
        message: 'Connected via Cloudflare Tunnel to local n8n.',
      };
    }

    return {
      status: 'offline',
      message: 'Tunnel or local n8n is currently unreachable.',
    };
  } catch {
    return {
      status: 'offline',
      message: 'Tunnel or local n8n is currently unreachable.',
    };
  }
}
