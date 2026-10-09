export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const getChatbotApiUrl = () => {
  const env = (import.meta as any).env || {};
  return (env.VITE_CHATBOT_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
};

export async function checkChatbotHealth(): Promise<{
  online: boolean;
  model?: string;
  ollamaOnline?: boolean;
}> {
  const baseUrl = getChatbotApiUrl();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      return {
        online: data.status === 'ok',
        model: data.model,
        ollamaOnline: data.ollamaOnline,
      };
    }
    return { online: false };
  } catch {
    return { online: false };
  }
}

export async function streamChatMessage({
  messages,
  onChunk,
  onDone,
  onError,
}: {
  messages: { role: 'user' | 'assistant'; content: string }[];
  onChunk: (chunkText: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}) {
  const baseUrl = getChatbotApiUrl();

  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, stream: true }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Server returned ${response.status}: ${errText}`);
    }

    if (!response.body) {
      throw new Error('No streaming body returned');
    }

    const reader = response.body.getReader();
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
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const payloadStr = trimmed.replace(/^data:\s*/, '').trim();
        if (payloadStr === '[DONE]') {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(payloadStr);
          if (parsed.content) {
            onChunk(parsed.content);
          }
          if (parsed.error) {
            onError(new Error(parsed.error));
            return;
          }
        } catch {
          // If plain text token
          onChunk(payloadStr);
        }
      }
    }

    onDone();
  } catch (err: any) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
