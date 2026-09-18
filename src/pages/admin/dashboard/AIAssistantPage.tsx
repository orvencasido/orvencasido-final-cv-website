import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  HelpCircle,
  Clock,
  Terminal,
  ChevronRight,
  Database,
  Info,
} from 'lucide-react';
import {
  AIChatSession,
  AIChatMessage,
  AIAction,
} from '../../../types';
import {
  getChatSessions,
  createChatSession,
  updateChatSessionTitle,
  deleteChatSession,
  clearAllChatSessions,
  getChatMessages,
  saveChatMessage,
  sendMessageToN8N,
  checkTunnelHealth,
  getN8NConfig,
} from '../../../lib/aiChatService';
import { ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

const SUGGESTED_PROMPTS = [
  {
    title: 'Add Senior Experience',
    prompt: 'Add a new experience: Senior DevOps & Cloud Architect at Google Cloud, Jan 2024 to Present.',
  },
  {
    title: 'Suggest Cloud Skills',
    prompt: 'Review my current skills and suggest 4 high-demand DevOps & Platform Engineering skills to add.',
  },
  {
    title: 'Draft Project Showcase',
    prompt: 'Draft a new portfolio project: Automated Kubernetes Multi-Cluster GitOps with ArgoCD and Terraform.',
  },
  {
    title: 'Polish Biography',
    prompt: 'Help me polish my hero biography to highlight high-scale distributed systems and cloud cost optimization.',
  },
];

export const AIAssistantPage: React.FC = () => {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<AIChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [tunnelStatus, setTunnelStatus] = useState<'connected' | 'offline' | 'unconfigured'>('unconfigured');
  const [tunnelMsg, setTunnelMsg] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat sessions & verify tunnel status on mount
  useEffect(() => {
    loadSessions();
    verifyTunnel();
  }, []);

  // When active session changes, load messages
  useEffect(() => {
    if (currentSessionId) {
      loadSessionMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function verifyTunnel() {
    const res = await checkTunnelHealth();
    setTunnelStatus(res.status);
    setTunnelMsg(res.message);
  }

  async function loadSessions() {
    setLoadingSessions(true);
    try {
      const fetched = await getChatSessions();
      setSessions(fetched);
      if (fetched.length > 0 && !currentSessionId) {
        setCurrentSessionId(fetched[0].id);
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadSessionMessages(sessionId: string) {
    try {
      const msgs = await getChatMessages(sessionId);
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }

  const handleCreateNewSession = async () => {
    try {
      const newSession = await createChatSession();
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      textareaRef.current?.focus();
    } catch (err: any) {
      showToast('Failed to create new chat session', 'error');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
      }
      showToast('Chat session deleted', 'success');
    } catch (err) {
      showToast('Failed to delete session', 'error');
    } finally {
      setSessionToDelete(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllChatSessions();
      setSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
      showToast('All chat sessions cleared', 'success');
    } catch (err) {
      showToast('Failed to clear sessions', 'error');
    } finally {
      setShowClearModal(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText || isLoading) return;

    let targetSessionId = currentSessionId;

    // If no active session, create one first
    if (!targetSessionId) {
      const newSession = await createChatSession();
      setSessions((prev) => [newSession, ...prev]);
      targetSessionId = newSession.id;
      setCurrentSessionId(targetSessionId);
    }

    setInputValue('');
    setIsLoading(true);

    // Persist and display user message
    const userMsg = await saveChatMessage(targetSessionId, {
      role: 'user',
      content: messageText,
    });
    setMessages((prev) => [...prev, userMsg]);

    // Auto-update session title if it is the first user message
    const currentSession = sessions.find((s) => s.id === targetSessionId);
    if (currentSession && (currentSession.title === 'New Conversation' || messages.length === 0)) {
      const autoTitle = messageText.length > 36 ? messageText.substring(0, 36) + '...' : messageText;
      updateChatSessionTitle(targetSessionId, autoTitle);
      setSessions((prev) =>
        prev.map((s) => (s.id === targetSessionId ? { ...s, title: autoTitle } : s))
      );
    }

    try {
      // Dispatch payload to local n8n via Cloudflare Tunnel
      const n8nResult = await sendMessageToN8N(targetSessionId, messageText);

      // Persist and display assistant reply
      const assistantMsg = await saveChatMessage(targetSessionId, {
        role: 'assistant',
        content: n8nResult.reply,
        actions: n8nResult.actions,
      });

      setMessages((prev) => [...prev, assistantMsg]);
      verifyTunnel();
    } catch (err: any) {
      // Save diagnostic assistant error message so user can troubleshoot
      const errorReply = `⚠️ **Assistant Error**: ${err.message || 'Unknown network error'}\n\nPlease verify that your local n8n Docker container is running and exposed via \`cloudflared\`.`;
      const assistantMsg = await saveChatMessage(targetSessionId, {
        role: 'assistant',
        content: errorReply,
      });
      setMessages((prev) => [...prev, assistantMsg]);
      setTunnelStatus('offline');
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group sessions by date
  const groupSessionsByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const groups: { [key: string]: AIChatSession[] } = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    sessions.forEach((s) => {
      const date = new Date(s.updated_at || s.created_at);
      if (date >= today) {
        groups.Today.push(s);
      } else if (date >= yesterday) {
        groups.Yesterday.push(s);
      } else if (date >= sevenDaysAgo) {
        groups['Previous 7 Days'].push(s);
      } else {
        groups.Older.push(s);
      }
    });

    return groups;
  };

  const grouped = groupSessionsByDate();
  const config = getN8NConfig();

  const getTableLink = (tableName: string) => {
    switch (tableName.toLowerCase()) {
      case 'experiences':
        return '/orven/dashboard/experience';
      case 'projects':
        return '/orven/dashboard/projects';
      case 'skills':
        return '/orven/dashboard/tech-stack';
      case 'profiles':
        return '/orven/dashboard/home';
      case 'certifications':
        return '/orven/dashboard/certifications';
      case 'blogs':
        return '/orven/dashboard/blogs';
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] md:h-[calc(100vh-4.5rem)] -m-4 md:-m-8 bg-beige-100 overflow-hidden">
      {/* Top Bar / Header */}
      <div className="bg-beige-50 border-b border-beige-300 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-matcha-900 text-beige-50 flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-matcha-950 text-base md:text-lg leading-tight">
                AI Portfolio Assistant
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-matcha-100 text-matcha-900 border border-matcha-300">
                <Sparkles className="w-3 h-3 text-matcha-700" />
                Gemini + n8n
              </span>
            </div>
            <p className="text-xs text-matcha-800/80 font-medium">
              Autonomous portfolio database manager via local automation agent
            </p>
          </div>
        </div>

        {/* Status Indicator & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Tunnel Status Pill */}
          <div
            onClick={() => setShowConfigHelp(true)}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              tunnelStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : tunnelStatus === 'offline'
                ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
            title="Click for configuration status & instructions"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                tunnelStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : tunnelStatus === 'offline'
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />
            <span className="hidden sm:inline">
              {tunnelStatus === 'connected'
                ? 'Tunnel Active'
                : tunnelStatus === 'offline'
                ? 'Tunnel Offline'
                : 'Tunnel Unset'}
            </span>
            <HelpCircle className="w-3.5 h-3.5 text-inherit opacity-70" />
          </div>

          <button
            onClick={verifyTunnel}
            className="p-2 rounded-xl text-matcha-800 hover:bg-beige-200 transition-colors"
            title="Refresh connection status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Drawer (Sessions) + Right Chat Pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Session Drawer */}
        <aside className="w-64 sm:w-72 md:w-80 bg-beige-50 border-r border-beige-300 flex flex-col shrink-0">
          {/* New Chat Button */}
          <div className="p-3 border-b border-beige-200">
            <button
              onClick={handleCreateNewSession}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-matcha-900 hover:bg-matcha-950 text-beige-50 font-bold text-sm shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {loadingSessions ? (
              <div className="p-4 space-y-2">
                <div className="h-4 bg-beige-200 rounded animate-pulse w-24" />
                <div className="h-10 bg-beige-200 rounded-xl animate-pulse" />
                <div className="h-10 bg-beige-200 rounded-xl animate-pulse" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center text-matcha-800/70 text-xs">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-matcha-900" />
                <p className="font-semibold text-matcha-950 mb-1">No past sessions</p>
                <p>Start a conversation to query or manage your portfolio.</p>
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => {
                if (items.length === 0) return null;
                return (
                  <div key={category} className="space-y-1">
                    <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-matcha-800/60">
                      {category}
                    </h3>
                    <div className="space-y-0.5">
                      {items.map((sess) => {
                        const isActive = sess.id === currentSessionId;
                        return (
                          <div
                            key={sess.id}
                            onClick={() => setCurrentSessionId(sess.id)}
                            className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                              isActive
                                ? 'bg-matcha-900 text-beige-50 shadow-xs'
                                : 'text-matcha-950 hover:bg-beige-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <MessageSquare
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? 'text-beige-200' : 'text-matcha-700'
                                }`}
                              />
                              <span className="truncate">{sess.title}</span>
                            </div>

                            {/* Delete Session Icon */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSessionToDelete(sess.id);
                              }}
                              className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 transition-opacity ${
                                isActive ? 'text-beige-200' : 'text-rose-600'
                              }`}
                              title="Delete conversation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Clear All History Footer */}
          {sessions.length > 0 && (
            <div className="p-3 border-t border-beige-200 bg-beige-50">
              <button
                onClick={() => setShowClearModal(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Chat History</span>
              </button>
            </div>
          )}
        </aside>

        {/* Right Panel: Active Chat Thread */}
        <main className="flex-1 flex flex-col bg-beige-100 overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-matcha-900 text-beige-50 flex items-center justify-center mb-4 shadow-sm">
                  <Sparkles className="w-8 h-8 text-matcha-300" />
                </div>
                <h2 className="font-black text-xl md:text-2xl text-matcha-950 mb-2">
                  What portfolio change would you like to make?
                </h2>
                <p className="text-sm text-matcha-800/80 mb-6 max-w-md">
                  Your AI assistant is equipped with direct database tools to update experiences,
                  projects, skills, and portfolio descriptions.
                </p>

                {/* Suggestion Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                  {SUGGESTED_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="p-3.5 rounded-xl bg-beige-50 border border-beige-300 hover:border-matcha-700 hover:bg-beige-200/50 transition-all text-xs group"
                    >
                      <div className="font-bold text-matcha-950 mb-1 flex items-center justify-between">
                        <span>{item.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-matcha-700 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-matcha-800/80 line-clamp-2">{item.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs ${
                        isUser
                          ? 'bg-matcha-900 text-beige-50'
                          : 'bg-beige-50 text-matcha-900 border border-beige-300'
                      }`}
                    >
                      {isUser ? 'You' : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm shadow-2xs max-w-xl md:max-w-2xl break-words ${
                        isUser
                          ? 'bg-matcha-900 text-beige-50 rounded-tr-xs font-medium'
                          : 'bg-beige-50 text-matcha-950 border border-beige-300 rounded-tl-xs'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                      {/* Tool Action Audit Badges */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-matcha-200/40 space-y-2">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-matcha-800/80 flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5" />
                            <span>Database Operations Executed</span>
                          </div>
                          {msg.actions.map((action: AIAction, idx: number) => {
                            const link = getTableLink(action.table);
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>
                                    <strong className="font-bold">[{action.type}]</strong> in{' '}
                                    <code className="px-1 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-mono">
                                      {action.table}
                                    </code>
                                    : {action.summary}
                                  </span>
                                </div>
                                {link && (
                                  <a
                                    href={link}
                                    className="shrink-0 text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                                  >
                                    View
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div
                        className={`text-[10px] mt-1.5 font-sans opacity-60 ${
                          isUser ? 'text-right text-beige-200' : 'text-left text-matcha-800'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Loading / Thinking State */}
            {isLoading && (
              <div className="flex gap-3 max-w-xl mr-auto">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-beige-50 text-matcha-900 border border-beige-300 text-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-beige-50 border border-beige-300 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2 text-xs font-semibold text-matcha-900 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-matcha-700 animate-ping" />
                  <span>AI Agent querying database & reasoning...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-beige-50 border-t border-beige-300 shrink-0">
            <div className="max-w-3xl mx-auto flex items-end gap-2 bg-beige-100/90 border border-beige-300 focus-within:border-matcha-800 rounded-2xl p-2 transition-all">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask or command: 'Add AWS certification...', 'Update biography...', 'Review projects'..."
                rows={1}
                disabled={isLoading}
                className="flex-1 max-h-32 resize-none bg-transparent px-3 py-1.5 text-sm text-matcha-950 placeholder:text-matcha-800/50 outline-none focus:ring-0 leading-relaxed"
                style={{ minHeight: '38px' }}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-matcha-900 hover:bg-matcha-950 text-beige-50 disabled:opacity-40 disabled:hover:bg-matcha-900 flex items-center justify-center shrink-0 transition-all shadow-xs active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between text-[11px] text-matcha-800/70 px-1">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-beige-200 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-beige-200 font-mono text-[10px]">Shift + Enter</kbd> for newline</span>
              <span className="flex items-center gap-1 font-medium">
                <Terminal className="w-3 h-3" />
                Local n8n Agent Runner
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        title="Clear All Chat History?"
        message="This will permanently delete all conversations and message records from the database. This action cannot be undone."
        confirmText="Clear All"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearModal(false)}
      />

      {/* Delete Single Session Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(sessionToDelete)}
        title="Delete Conversation?"
        message="Are you sure you want to delete this chat session and its entire history?"
        confirmText="Delete Session"
        onConfirm={() => sessionToDelete && handleDeleteSession(sessionToDelete)}
        onCancel={() => setSessionToDelete(null)}
      />

      {/* Configuration & Tunnel Help Modal */}
      {showConfigHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-beige-50 border border-beige-300 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-beige-200">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-matcha-900" />
                <h3 className="font-extrabold text-base text-matcha-950">
                  n8n & Cloudflare Tunnel Status
                </h3>
              </div>
              <button
                onClick={() => setShowConfigHelp(false)}
                className="text-matcha-800 hover:text-matcha-950 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-matcha-950">
              <div className="p-3 rounded-xl bg-beige-200/70 border border-beige-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-matcha-900">Current Status:</span>
                  <span
                    className={`font-extrabold uppercase px-2 py-0.5 rounded text-[10px] ${
                      tunnelStatus === 'connected'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tunnelStatus === 'offline'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {tunnelStatus}
                  </span>
                </div>
                <p className="text-matcha-800">{tunnelMsg || 'Checking status...'}</p>
              </div>

              <div>
                <span className="font-bold text-matcha-900 block mb-1">Configured Webhook:</span>
                <code className="block p-2 rounded bg-beige-200 font-mono text-[11px] break-all">
                  {config.webhookUrl || 'Not configured in .env (VITE_N8N_WEBHOOK_URL)'}
                </code>
              </div>

              <div className="p-3 rounded-xl bg-matcha-100/60 border border-matcha-300 space-y-2">
                <div className="font-bold text-matcha-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-matcha-800" />
                  Quick Setup Instructions
                </div>
                <ol className="list-decimal list-inside space-y-1 text-matcha-800">
                  <li>Start n8n in Docker: <code className="bg-beige-100 px-1 py-0.5 rounded font-mono">cd n8n && docker compose up -d</code></li>
                  <li>Run cloudflared on Ubuntu: <code className="bg-beige-100 px-1 py-0.5 rounded font-mono">cloudflared tunnel --url http://localhost:5678</code></li>
                  <li>Import workflow template from <code className="bg-beige-100 px-1 py-0.5 rounded font-mono">n8n/workflow.json</code> in n8n (http://localhost:5678)</li>
                  <li>Add tunnel URL + <code className="bg-beige-100 px-1 py-0.5 rounded font-mono">/webhook/orven-ai-assistant</code> to <code className="bg-beige-100 px-1 py-0.5 rounded font-mono">.env</code></li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowConfigHelp(false)}
                className="px-4 py-2 rounded-xl bg-matcha-900 text-beige-50 font-bold text-xs hover:bg-matcha-950"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
