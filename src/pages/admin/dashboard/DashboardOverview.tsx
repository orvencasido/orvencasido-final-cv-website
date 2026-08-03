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
  CheckCircle2,
  Clock,
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
      <SectionHeader
        title="Admin Overview"
        description="Monitor portfolio activity, publish new articles, manage project showcases, and read contact messages."
      />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Articles</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{blogs.length}</span>
            <span className="text-xs text-zinc-500">{publishedBlogsCount} published</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{projects.length}</span>
            <span className="text-xs text-zinc-500">
              {projects.filter((p) => p.is_featured).length} featured
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Contact Messages</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{messages.length}</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                unreadMessagesCount > 0
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                  : 'text-zinc-500'
              }`}
            >
              {unreadMessagesCount} unread
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Certifications</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{certs.length}</span>
            <span className="text-xs text-emerald-600 font-medium">Verified active</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> Quick CMS Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/orven/dashboard/blogs"
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-emerald-500" /> New Blog Post
          </Link>
          <Link
            to="/orven/dashboard/projects"
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-emerald-500" /> New Project
          </Link>
          <Link
            to="/orven/dashboard/home"
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition"
          >
            <Eye className="w-4 h-4 text-sky-500" /> Edit Profile
          </Link>
          <Link
            to="/orven/dashboard/messages"
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition"
          >
            <Mail className="w-4 h-4 text-indigo-500" /> View Messages
          </Link>
        </div>
      </div>

      {/* Recent Contact Submissions */}
      <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" /> Recent Inbox Submissions
          </h2>
          <Link
            to="/orven/dashboard/messages"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:underline flex items-center gap-1"
          >
            Manage inbox <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {messages.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4">No contact form messages submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {messages.slice(0, 3).map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between text-xs gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {msg.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">({msg.email})</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 font-medium truncate">
                    {msg.subject}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={msg.status} type="message" />
                  <span className="text-[10px] text-zinc-400 font-mono">
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
