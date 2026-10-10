import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  FolderGit2,
  Mail,
  Award,
  ArrowRight,
  Plus,
  Eye,
  Sparkles,
} from 'lucide-react';
import { getBlogs, getProjects, getContactMessages, getCertifications } from '../../../lib/services';
import { Blog, Project, ContactMessage, Certification } from '../../../types';
import { SectionHeader, LoadingSkeleton, StatusBadge } from '../../../components/ui/CommonUI';

export const DashboardOverview: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [blogData, projData, msgData, certData] = await Promise.all([
          getBlogs(),
          getProjects(),
          getContactMessages(),
          getCertifications(),
        ]);
        setBlogs(blogData);
        setProjects(projData);
        setMessages(msgData);
        setCerts(certData);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <LoadingSkeleton count={3} />;

  const unreadMessagesCount = messages.filter((m) => m.status === 'unread').length;
  const publishedBlogsCount = blogs.filter((b) => b.status === 'published').length;

  return (
    <div className="space-y-8">
      <SectionHeader title="Admin Overview" />

      {/* Metrics Cards Grid (2-column on mobile, 4-column on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Metric 1 */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 hover:border-matcha-300 transition-colors shadow-2xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between text-matcha-700">
            <span className="text-xs font-semibold text-matcha-800 truncate">Articles</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-matcha-100 text-matcha-900 shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-matcha-950">{blogs.length}</span>
            <span className="text-[11px] sm:text-xs font-medium text-matcha-700 truncate">{publishedBlogsCount} published</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 hover:border-matcha-300 transition-colors shadow-2xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between text-matcha-700">
            <span className="text-xs font-semibold text-matcha-800 truncate">Projects</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-matcha-100 text-matcha-900 shrink-0">
              <FolderGit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-matcha-950">{projects.length}</span>
            <span className="text-[11px] sm:text-xs font-medium text-matcha-700 truncate">
              {projects.filter((p) => p.is_featured).length} featured
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 hover:border-matcha-300 transition-colors shadow-2xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between text-matcha-700">
            <span className="text-xs font-semibold text-matcha-800 truncate">Messages</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-matcha-100 text-matcha-900 shrink-0">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-matcha-950">{messages.length}</span>
            <span
              className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full inline-block self-start sm:self-auto ${
                unreadMessagesCount > 0
                  ? 'bg-matcha-900 text-beige-50'
                  : 'text-matcha-700 bg-matcha-50'
              }`}
            >
              {unreadMessagesCount} unread
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 hover:border-matcha-300 transition-colors shadow-2xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between text-matcha-700">
            <span className="text-xs font-semibold text-matcha-800 truncate">Certifications</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-matcha-100 text-matcha-900 shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-matcha-950">{certs.length}</span>
            <span className="text-[11px] sm:text-xs text-matcha-700 font-medium truncate">Credentials</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 shadow-2xs space-y-4 sm:space-y-5">
        <h2 className="text-sm font-bold text-matcha-950 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-matcha-600" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/orven/dashboard/blogs"
            className="p-3.5 sm:p-4 min-h-[48px] rounded-xl sm:rounded-2xl border border-beige-200 hover:border-matcha-400 bg-beige-100/70 hover:bg-beige-100 text-xs font-semibold text-matcha-950 flex items-center gap-2 sm:gap-2.5 transition shadow-2xs"
          >
            <Plus className="w-4 h-4 text-matcha-700 shrink-0" />
            <span className="truncate">New Blog Post</span>
          </Link>
          <Link
            to="/orven/dashboard/projects"
            className="p-3.5 sm:p-4 min-h-[48px] rounded-xl sm:rounded-2xl border border-beige-200 hover:border-matcha-400 bg-beige-100/70 hover:bg-beige-100 text-xs font-semibold text-matcha-950 flex items-center gap-2 sm:gap-2.5 transition shadow-2xs"
          >
            <Plus className="w-4 h-4 text-matcha-700 shrink-0" />
            <span className="truncate">New Project</span>
          </Link>
          <Link
            to="/orven/dashboard/home"
            className="p-3.5 sm:p-4 min-h-[48px] rounded-xl sm:rounded-2xl border border-beige-200 hover:border-matcha-400 bg-beige-100/70 hover:bg-beige-100 text-xs font-semibold text-matcha-950 flex items-center gap-2 sm:gap-2.5 transition shadow-2xs"
          >
            <Eye className="w-4 h-4 text-matcha-700 shrink-0" />
            <span className="truncate">Edit Profile</span>
          </Link>
          <Link
            to="/orven/dashboard/messages"
            className="p-3.5 sm:p-4 min-h-[48px] rounded-xl sm:rounded-2xl border border-beige-200 hover:border-matcha-400 bg-beige-100/70 hover:bg-beige-100 text-xs font-semibold text-matcha-950 flex items-center gap-2 sm:gap-2.5 transition shadow-2xs"
          >
            <Mail className="w-4 h-4 text-matcha-700 shrink-0" />
            <span className="truncate">View Messages</span>
          </Link>
        </div>
      </div>

      {/* Recent Contact Submissions */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 shadow-2xs space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-beige-200 pb-4">
          <h2 className="text-base sm:text-lg font-bold text-matcha-950 flex items-center gap-2">
            <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-matcha-600 shrink-0" /> Recent Inbox Submissions
          </h2>
          <Link
            to="/orven/dashboard/messages"
            className="text-xs font-semibold text-matcha-800 hover:text-matcha-950 inline-flex items-center gap-1.5 min-h-[36px]"
          >
            Manage inbox <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {messages.length === 0 ? (
          <p className="text-xs text-matcha-700 font-medium py-4">No contact form messages submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.slice(0, 3).map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-beige-200 bg-beige-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2.5 sm:gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-extrabold text-matcha-950 truncate">
                      {msg.name}
                    </span>
                    <span className="text-[10px] text-matcha-600 font-medium truncate">({msg.email})</span>
                  </div>
                  <p className="text-matcha-800 font-medium truncate">
                    {msg.subject}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-beige-200/60">
                  <StatusBadge status={msg.status} type="message" />
                  <span className="text-[10px] text-matcha-600 font-mono font-medium">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
