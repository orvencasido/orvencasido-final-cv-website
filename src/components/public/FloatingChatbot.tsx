import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  ChevronDown,
  AlertCircle,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { streamChatMessage, checkChatbotHealth, ChatMessage } from '../../lib/chatbotService';

const SUGGESTIONS = [
  'What is your DevOps & Cloud background?',
  'What projects have you built?',
  'What is your core tech stack?',
  'Are you open for hire or freelance work?',
];

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check backend health on mount
  useEffect(() => {
    checkChatbotHealth().then((res) => {
      setIsHealthy(res.online);
    });
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming, isOpen]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const assistantMsgId = `ast_${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setIsStreaming(true);

    const historyForApi = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamChatMessage({
      messages: historyForApi,
      onChunk: (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m
          )
        );
      },
      onDone: () => {
        setIsStreaming(false);
        if (!isOpen) setHasUnread(true);
      },
      onError: (err) => {
        setIsStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: `⚠️ ${err.message || 'Unable to connect to local AI assistant.'}\n\nYou can also reach Orven directly at orvencasidop@gmail.com!`,
                }
              : m
          )
        );
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (isStreaming) return;
    setMessages([]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none">
      {/* 1. Chat Window Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with AI Orven"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-96 md:w-[420px] h-[540px] max-h-[80vh] bg-beige-50 border border-beige-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-matcha-900 text-beige-50 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-matcha-800 border border-matcha-700 flex items-center justify-center text-beige-100 shadow-2xs">
                <Bot className="w-5 h-5" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-matcha-900 ${
                    isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  title={isHealthy ? 'Local LLM Connected' : 'Connecting to local LLM...'}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm leading-tight text-beige-50">
                    AI Orven
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-matcha-800/80 text-matcha-200 font-mono">
                    Qwen 2.5
                  </span>
                </div>
                <p className="text-[11px] text-beige-200/80 leading-tight">
                  Portfolio Representative & DevOps Twin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-beige-200">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  disabled={isStreaming}
                  className="p-1.5 rounded-lg hover:bg-matcha-800 hover:text-beige-50 transition-colors disabled:opacity-40"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-matcha-800 hover:text-beige-50 transition-colors"
                title="Minimize chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-beige-100/60">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center px-4 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-matcha-900 text-beige-50 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-6 h-6 text-matcha-300" />
                </div>
                <div>
                  <h4 className="font-extrabold text-matcha-950 text-sm mb-1">
                    Hi! I'm Orven's AI Representative.
                  </h4>
                  <p className="text-xs text-matcha-800/80 leading-relaxed max-w-xs">
                    Ask me about Orven's cloud architecture, Kubernetes experience, projects, or
                    availability.
                  </p>
                </div>

                {/* Prompt Suggestions */}
                <div className="w-full space-y-1.5 text-left pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-matcha-800/60 text-center">
                    Suggested Questions
                  </p>
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-beige-50 border border-beige-300 hover:border-matcha-700 hover:bg-beige-200/80 text-matcha-950 transition-all text-left shadow-2xs"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 max-w-[88%] ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs ${
                        isUser
                          ? 'bg-matcha-900 text-beige-50'
                          : 'bg-beige-50 text-matcha-900 border border-beige-300'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs break-words leading-relaxed ${
                        isUser
                          ? 'bg-matcha-900 text-beige-50 font-medium rounded-tr-xs'
                          : 'bg-beige-50 text-matcha-950 border border-beige-300 rounded-tl-xs'
                      }`}
                    >
                      {m.content ? (
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      ) : (
                        <div className="flex items-center gap-1.5 py-1 text-matcha-700 font-semibold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-matcha-600 animate-ping" />
                          <span>AI Orven is thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-beige-50 border-t border-beige-300 shrink-0">
            <div className="flex items-end gap-1.5 bg-beige-100 border border-beige-300 focus-within:border-matcha-800 rounded-2xl p-1.5 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Orven's work, tech stack, or experience..."
                rows={1}
                disabled={isStreaming}
                className="flex-1 max-h-24 resize-none bg-transparent px-2.5 py-1 text-xs text-matcha-950 placeholder:text-matcha-800/50 outline-none leading-relaxed"
                style={{ minHeight: '32px' }}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isStreaming}
                className="w-8 h-8 rounded-xl bg-matcha-900 hover:bg-matcha-950 text-beige-50 disabled:opacity-30 flex items-center justify-center shrink-0 transition-all shadow-xs active:scale-95"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-1.5 px-1 flex items-center justify-between text-[10px] text-matcha-800/60 font-medium">
              <span>Grounding: Live Supabase Data</span>
              <a
                href="mailto:orvencasidop@gmail.com"
                className="hover:text-matcha-950 underline flex items-center gap-0.5"
              >
                Email Orven
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Circular Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-14 h-14 rounded-full bg-matcha-900 hover:bg-matcha-950 text-beige-50 shadow-xl border-2 border-beige-50 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-2xl"
        title={isOpen ? 'Close Chat' : 'Chat with AI Orven'}
        aria-label="Toggle AI Chatbot"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-beige-50" />
        ) : (
          <div className="relative">
            <Bot className="w-7 h-7 text-beige-50" />
            {/* Sparkle badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-matcha-900 animate-pulse" />
          </div>
        )}

        {/* Hover Pill Tooltip */}
        {!isOpen && (
          <div className="absolute right-16 px-3 py-1.5 rounded-xl bg-matcha-900 text-beige-50 text-xs font-bold whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center gap-1.5 border border-matcha-700">
            <Sparkles className="w-3.5 h-3.5 text-matcha-300" />
            <span>Chat with AI Orven</span>
          </div>
        )}
      </button>
    </div>
  );
};
