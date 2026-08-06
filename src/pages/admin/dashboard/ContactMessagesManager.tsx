import React, { useEffect, useState } from 'react';
import { Trash2, Eye, Filter, Reply, CheckCircle2 } from 'lucide-react';
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
      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-beige-300">
        <Filter className="w-4 h-4 text-matcha-700 shrink-0" />
        {['all', 'unread', 'read', 'resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 text-xs font-extrabold capitalize rounded-full transition shrink-0 cursor-pointer ${
              statusFilter === st
                ? 'bg-matcha-900 text-beige-50 shadow-xs'
                : 'bg-beige-200 text-matcha-900 hover:bg-beige-300'
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
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleOpenMessage(msg)}
              className={`p-6 rounded-3xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                msg.status === 'unread'
                  ? 'border-matcha-400 bg-matcha-100/50 font-medium'
                  : 'border-beige-300 bg-beige-50'
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-matcha-950 truncate">
                    {msg.name}
                  </span>
                  <span className="text-xs text-matcha-700 font-mono">({msg.email})</span>
                  <StatusBadge status={msg.status} type="message" />
                </div>
                <p className="text-xs font-extrabold text-matcha-900 truncate">
                  {msg.subject}
                </p>
                <p className="text-xs text-matcha-700 font-medium line-clamp-1">{msg.message}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <span className="text-xs font-mono text-matcha-600 font-medium">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenMessage(msg)}
                    className="p-2.5 text-matcha-700 hover:text-matcha-950 rounded-2xl hover:bg-beige-200 cursor-pointer"
                    title="View Message"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(msg.id)}
                    className="p-2.5 text-matcha-700 hover:text-red-700 rounded-2xl hover:bg-beige-200 cursor-pointer"
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
            <div className="p-6 rounded-3xl bg-beige-100 border border-beige-300 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-extrabold text-matcha-950">
                    {activeMessage.name}
                  </h3>
                  <a
                    href={`mailto:${activeMessage.email}`}
                    className="text-xs text-matcha-800 font-bold underline font-mono"
                  >
                    {activeMessage.email}
                  </a>
                </div>
                <StatusBadge status={activeMessage.status} type="message" />
              </div>

              <div className="text-xs text-matcha-600 font-mono font-medium">
                Received: {new Date(activeMessage.created_at).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Subject</p>
              <p className="font-extrabold text-matcha-950 text-sm">
                {activeMessage.subject}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Body</p>
              <div className="p-5 rounded-2xl bg-beige-100 border border-beige-300 text-matcha-950 leading-relaxed whitespace-pre-wrap font-medium">
                {activeMessage.message}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-beige-200">
              <div className="flex items-center gap-2">
                {activeMessage.status !== 'resolved' ? (
                  <button
                    onClick={() => handleUpdateStatus(activeMessage.id, 'resolved')}
                    className="px-5 py-2.5 rounded-full bg-matcha-100 text-matcha-900 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(activeMessage.id, 'read')}
                    className="px-5 py-2.5 rounded-full bg-beige-200 text-matcha-950 font-bold text-xs cursor-pointer"
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
                  className="px-6 py-2.5 bg-matcha-900 text-beige-50 rounded-full font-extrabold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Reply className="w-4 h-4" /> Reply Email
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
