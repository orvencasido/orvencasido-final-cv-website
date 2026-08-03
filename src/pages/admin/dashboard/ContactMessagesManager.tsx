import React, { useEffect, useState } from 'react';
import { Mail, Check, Trash2, Eye, Filter, Reply, CheckCircle2 } from 'lucide-react';
import {
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../../../lib/services';
import { ContactMessage } from '../../../types';
import { SectionHeader, LoadingSkeleton, EmptyState, StatusBadge } from '../../../components/ui/CommonUI';
import { Modal, ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export const ContactMessagesManager: React.FC = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleOpenMessage = async (msg: ContactMessage) => {
    setActiveMessage(msg);
    if (msg.status === 'unread') {
      await updateContactMessageStatus(msg.id, 'read');
      loadMessages();
    }
  };

  const handleUpdateStatus = async (id: string, status: 'unread' | 'read' | 'resolved') => {
    try {
      await updateContactMessageStatus(id, status);
      showToast(`Message status updated to ${status}`, 'success');
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage({ ...activeMessage, status });
      }
      loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteContactMessage(deletingId);
      showToast('Message deleted', 'success');
      if (activeMessage?.id === deletingId) {
        setActiveMessage(null);
      }
      setDeletingId(null);
      loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMessages = messages.filter((m) =>
    statusFilter === 'all' ? true : m.status === statusFilter
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Contact Messages Inbox"
        description="Review inbound messages submitted through your public contact form."
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
        {['all', 'unread', 'read', 'resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-xl transition shrink-0 ${
              statusFilter === st
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            {st} ({st === 'all' ? messages.length : messages.filter((m) => m.status === st).length})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : filteredMessages.length === 0 ? (
        <EmptyState title="No messages in this filter" />
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleOpenMessage(msg)}
              className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                msg.status === 'unread'
                  ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 font-medium'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50'
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {msg.name}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">({msg.email})</span>
                  <StatusBadge status={msg.status} type="message" />
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {msg.subject}
                </p>
                <p className="text-xs text-zinc-500 line-clamp-1">{msg.message}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-xs font-mono text-zinc-400">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenMessage(msg)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="View Message"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(msg.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Reader Modal */}
      <Modal
        isOpen={Boolean(activeMessage)}
        onClose={() => setActiveMessage(null)}
        title="Message Details"
        maxWidth="lg"
      >
        {activeMessage && (
          <div className="space-y-6 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {activeMessage.name}
                  </h3>
                  <a
                    href={`mailto:${activeMessage.email}`}
                    className="text-xs text-indigo-600 dark:text-indigo-400 underline font-mono"
                  >
                    {activeMessage.email}
                  </a>
                </div>
                <StatusBadge status={activeMessage.status} type="message" />
              </div>

              <div className="text-xs text-zinc-500 font-mono">
                Received: {new Date(activeMessage.created_at).toLocaleString()}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-400 uppercase">Subject</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                {activeMessage.subject}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-400 uppercase">Body</p>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                {activeMessage.message}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                {activeMessage.status !== 'resolved' ? (
                  <button
                    onClick={() => handleUpdateStatus(activeMessage.id, 'resolved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(activeMessage.id, 'read')}
                    className="px-3 py-1.5 rounded-xl bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-semibold text-xs"
                  >
                    Reopen
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(
                    activeMessage.subject
                  )}`}
                  className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-semibold text-xs flex items-center gap-1.5"
                >
                  <Reply className="w-3.5 h-3.5" /> Reply Email
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message from inbox?"
      />
    </div>
  );
};
