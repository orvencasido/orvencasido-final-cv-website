import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  X,
  RotateCcw,
  Send,
  Square,
} from 'lucide-react';
import {
  streamGeminiPortfolioChat,
  type GeminiChatMessage,
} from '../../lib/geminiChatService';

const INITIAL_GREETING =
  "Hi! I'm Orbs, Orven's AI Assistant powered by Gemini 1.5 Flash. Ask me about Orven's tech stack, DevOps projects, work experience, or certifications!";

const STARTER_PROMPTS = [
  "What is Orven's tech stack?",
  "Tell me about his DevOps experience",
  "What are his featured projects?",
  "How do I contact Orven?",
];

/**
 * Lightweight inline text formatter supporting bold, inline code, and links.
 */
function formatInlineText(text: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+)/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-matcha-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-sm bg-beige-200/80 font-mono text-xs text-matcha-950 border border-beige-300/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-matcha-700 hover:text-matcha-950 underline underline-offset-2 font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }

    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-matcha-700 hover:text-matcha-950 underline underline-offset-2 break-all"
        >
          {part}
        </a>
      );
    }

    return part;
  });
}

/**
 * Lightweight markdown block parser for assistant responses.
 */
function FormattedMessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === 'ul') {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-1 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-1 pl-1">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInlineText(item)}
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  const flushCodeBlock = () => {
    if (!inCodeBlock) return;
    elements.push(
      <pre
        key={`code-${elements.length}`}
        className="p-2.5 my-2 rounded-xl bg-matcha-950 text-beige-100 font-mono text-xs overflow-x-auto border border-matcha-800"
      >
        <code>{codeBlockLines.join('\n')}</code>
      </pre>
    );
    inCodeBlock = false;
    codeBlockLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    const numMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numMatch[1]);
      continue;
    }

    flushList();

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${elements.length}`} className="font-bold text-sm mt-2 mb-1 text-matcha-950">
          {formatInlineText(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${elements.length}`} className="font-bold text-base mt-2.5 mb-1 text-matcha-950">
          {formatInlineText(trimmed.replace(/^##\s+/, ''))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${elements.length}`} className="font-bold text-lg mt-3 mb-1 text-matcha-950">
          {formatInlineText(trimmed.replace(/^#\s+/, ''))}
        </h2>
      );
    } else {
      elements.push(
        <p key={`p-${elements.length}`} className="leading-relaxed my-1">
          {formatInlineText(trimmed)}
        </p>
      );
    }
  }

  flushList();
  flushCodeBlock();

  return <div className="space-y-1">{elements}</div>;
}

export const PortfolioAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GeminiChatMessage[]>([
    {
      role: 'assistant',
      content: INITIAL_GREETING,
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keyboard shortcut: close with Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input immediately when modal opens (instant ready experience)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleClearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessages([
      {
        role: 'assistant',
        content: INITIAL_GREETING,
      },
    ]);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt ?? input).trim();
    if (!query || isStreaming) return;

    setInput('');

    const nextMessages: GeminiChatMessage[] = [
      ...messages,
      { role: 'user', content: query },
    ];

    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await streamGeminiPortfolioChat({
        messages: nextMessages,
        onDelta: (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: updated[lastIdx].content + chunk,
              };
            }
            return updated;
          });
        },
        onFinish: () => {
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        onError: (err) => {
          if (err.name !== 'AbortError') {
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content:
                    updated[lastIdx].content ||
                    "I encountered an issue connecting to the AI assistant. Please try asking again in a moment.",
                };
              }
              return updated;
            });
          }
          setIsStreaming(false);
          abortControllerRef.current = null;
        },
        signal: abortController.signal,
      });
    } catch {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  return (
    <>
      {/* 1. Floating AI Trigger Button */}
      {/* Positioned directly above FloatingPhonePlayer on desktop (bottom-[136px] right-8) and cleanly on mobile (bottom-6 right-6) */}
      <div
        className={`fixed bottom-6 right-6 md:bottom-[136px] md:right-8 z-40 flex items-center select-none transition-all duration-200 ${
          isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        <div className="relative flex items-center group">
          {/* Subtle "Talk to Orbs" Pill Tooltip (Hidden by default, smooth slide & fade on hover) */}
          <div className="hidden sm:flex items-center gap-1.5 mr-3 px-3 py-1 rounded-full bg-beige-50/95 border border-beige-200 text-matcha-950 text-xs font-semibold shadow-md pointer-events-none opacity-0 translate-x-2 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0">
            <Sparkles className="w-3 h-3 text-matcha-600 animate-pulse" />
            <span>Talk to Orbs</span>
          </div>

          {/* Organic Circular Launcher Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Talk to Orbs - AI Assistant"
            className="relative w-14 h-14 rounded-full bg-linear-to-br from-matcha-800 to-matcha-950 border-2 border-matcha-400/50 shadow-xl shadow-matcha-950/30 flex items-center justify-center text-beige-50 transition-transform duration-150 group-hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-matcha-500 focus:ring-offset-2"
          >
            {/* Glowing Aura Ring */}
            <div className="absolute inset-0 rounded-full bg-matcha-500/30 blur-md group-hover:bg-matcha-400/40 animate-pulse pointer-events-none" />

            <Bot className="w-6 h-6 text-matcha-200 transition-transform group-hover:rotate-6 relative z-10" />

            {/* Live Status Indicator Dot (Online / Ready) */}
            <span className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-matcha-950 z-20 bg-emerald-500" />
          </button>
        </div>
      </div>

      {/* 2. Mobile Backdrop (Screen < 640px) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 sm:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 3. Windowed Modal Card (Desktop) / Bottom Sheet (Mobile) */}
      <div
        className={`fixed z-50 bg-beige-50 border border-beige-200 flex flex-col shadow-2xl transition-all duration-300 ease-out overflow-hidden
          /* Mobile (< 640px): Bottom Sheet */
          inset-x-0 bottom-0 w-full h-[85vh] max-h-[85vh] rounded-t-3xl border-b-0
          /* Desktop (sm+): Windowed Floating Card */
          sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[550px] sm:rounded-3xl sm:border-b
          ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-8 sm:translate-y-4 opacity-0 pointer-events-none'}
        `}
      >
        {/* Mobile Drag Indicator Bar */}
        <div
          className="w-12 h-1.5 bg-beige-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden cursor-pointer"
          onClick={() => setIsOpen(false)}
          title="Close chat"
        />

        {/* Header */}
        <div className="px-4 py-3 border-b border-beige-200/90 bg-beige-50/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-matcha-900 flex items-center justify-center text-beige-50 shadow-xs shrink-0">
              <Bot className="w-5 h-5 text-matcha-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-matcha-950 leading-tight">
                Orven's AI Assistant
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium text-matcha-700/80">
                  Orbs • Gemini 1.5 Flash
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearChat}
              className="p-2 rounded-xl text-matcha-700 hover:text-matcha-950 hover:bg-beige-200/80 transition cursor-pointer"
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-matcha-700 hover:text-matcha-950 hover:bg-beige-200/80 transition cursor-pointer"
              title="Close chat"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, index) => {
            const isAssistant = msg.role === 'assistant';
            const isLastMessage = index === messages.length - 1;
            const isStreamingThis = isAssistant && isLastMessage && isStreaming;

            return (
              <div
                key={index}
                className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] text-sm ${
                    isAssistant
                      ? 'bg-beige-100/90 text-matcha-900 border border-beige-200/80 rounded-2xl rounded-tl-sm p-3.5'
                      : 'bg-matcha-900 text-beige-50 rounded-2xl rounded-tr-sm p-3.5 shadow-xs'
                  }`}
                >
                  {isAssistant ? (
                    <div>
                      {msg.content ? (
                        <FormattedMessageContent content={msg.content} />
                      ) : (
                        <div className="flex items-center gap-1.5 text-matcha-700/70 text-xs">
                          <span className="inline-block w-2 h-2 rounded-full bg-matcha-600 animate-pulse" />
                          <span>Thinking...</span>
                        </div>
                      )}

                      {/* Real-time Streaming Cursor */}
                      {isStreamingThis && msg.content && (
                        <span className="inline-block w-2 h-2 ml-1 rounded-full bg-matcha-700 animate-pulse align-middle" />
                      )}
                    </div>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Starter Prompt Chips (shown on fresh conversation) */}
          {messages.length === 1 && !isStreaming && (
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-semibold text-matcha-700/80 px-1">
                Suggested prompts:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isStreaming}
                    className="text-xs px-3 py-1.5 rounded-full bg-beige-100 hover:bg-matcha-100 text-matcha-900 border border-beige-200 hover:border-matcha-300 transition-all text-left flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-matcha-600 shrink-0" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-beige-50 border-t border-beige-200/80 shrink-0 pb-6 sm:pb-3"
        >
          <div className="relative flex items-end gap-2 bg-beige-100/90 border border-beige-300/80 rounded-2xl p-1.5 focus-within:border-matcha-600 focus-within:ring-1 focus-within:ring-matcha-600 transition">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about Orven's work..."
              disabled={isStreaming}
              rows={1}
              className="flex-1 bg-transparent px-2.5 py-1.5 text-sm text-matcha-950 placeholder:text-matcha-600/50 resize-none focus:outline-none max-h-24 disabled:opacity-50"
            />

            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                className="w-8 h-8 rounded-xl bg-matcha-800 hover:bg-matcha-900 text-beige-50 flex items-center justify-center transition cursor-pointer shrink-0"
                title="Stop generation"
                aria-label="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="w-8 h-8 rounded-xl bg-matcha-900 hover:bg-matcha-800 disabled:bg-beige-300 disabled:text-beige-400 text-beige-50 flex items-center justify-center transition cursor-pointer disabled:cursor-not-allowed shrink-0"
                title="Send message"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-matcha-600/60">
            <span>Powered by Gemini 1.5 Flash</span>
            <span>Enter to send</span>
          </div>
        </form>
      </div>
    </>
  );
};
