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
      <SectionHeader
        title="Admin Overview"
        description="Monitor portfolio metrics, publish new content, manage project showcases, and read contact messages."
      />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="p-6 rounded-3xl border border-beige-300 bg-beige-50 space-y-4 shadow-xs">
          <div className="flex items-center justify-between text-matcha-700">
            <span className="text-xs font-extrabold uppercase tracking-wider">Total Articles</span>
            <div className="p-2.5 rounded-2xl bg-matcha-100 text-matcha-900">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-matcha-950">{blogs.length}</span>
            <span className="text-xs font-semibold text-matcha-700">{publishedBlogsCount} published</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-3xl border border-beige-300 bg-beige-50 space-y-4 shadow-xs">
          <div className="flex items-center justify-between text-matcha-700">
            <span className="text-xs font-extrabold uppercase tracking-wider">Projects</span>
            <div className="p-2.5 rounded-2xl bg-matcha-100 text-matcha-900">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-matcha-950">{projects.length}</span>
            <span className="text-xs font-semibold text-matcha-700">
              {projects.filter((p) => p.is_featured).length} featured
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-3xl border border-beige-300 bg-beige-50 space-y-4 shadow-xs">
          <div className="flex items-center justify-between text-matcha-700">
            <span className="text-xs font-extrabold uppercase tracking-wider">Messages</span>
            <div className="p-2.5 rounded-2xl bg-matcha-100 text-matcha-900">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-matcha-950">{messages.length}</span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                unreadMessagesCount > 0
                  ? 'bg-matcha-900 text-beige-50'
                  : 'text-matcha-700'
              }`}
            >
              {unreadMessagesCount} unread
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-3xl border border-beige-300 bg-beige-50 space-y-4 shadow-xs">
          <div className="flex items-center justify-between text-matcha-700">
            <span className="text-xs font-extrabold uppercase tracking-wider">Certifications</span>
            <div className="p-2.5 rounded-2xl bg-matcha-100 text-matcha-900">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-matcha-950">{certs.length}</span>
            <span className="text-xs text-matcha-800 font-bold">Active credentials</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-6 shadow-xs">
        <h2 className="text-xs font-extrabold text-matcha-950 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-matcha-600" /> Quick CMS Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/orven/dashboard/blogs"
            className="p-4 rounded-2xl border border-beige-300 hover:border-matcha-400 bg-beige-100 text-xs font-bold text-matcha-950 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-matcha-700" /> New Blog Post
          </Link>
          <Link
            to="/orven/dashboard/projects"
            className="p-4 rounded-2xl border border-beige-300 hover:border-matcha-400 bg-beige-100 text-xs font-bold text-matcha-950 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-matcha-700" /> New Project
          </Link>
          <Link
            to="/orven/dashboard/home"
            className="p-4 rounded-2xl border border-beige-300 hover:border-matcha-400 bg-beige-100 text-xs font-bold text-matcha-950 flex items-center gap-2 transition"
          >
            <Eye className="w-4 h-4 text-matcha-700" /> Edit Profile
          </Link>
          <Link
            to="/orven/dashboard/messages"
            className="p-4 rounded-2xl border border-beige-300 hover:border-matcha-400 bg-beige-100 text-xs font-bold text-matcha-950 flex items-center gap-2 transition"
          >
            <Mail className="w-4 h-4 text-matcha-700" /> View Messages
          </Link>
        </div>
      </div>

      {/* Recent Contact Submissions */}
      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-beige-200 pb-4">
          <h2 className="text-lg font-extrabold text-matcha-950 flex items-center gap-2">
            <Mail className="w-5 h-5 text-matcha-600" /> Recent Inbox Submissions
          </h2>
          <Link
            to="/orven/dashboard/messages"
            className="text-xs font-bold text-matcha-800 hover:text-matcha-950 flex items-center gap-1.5"
          >
            Manage inbox <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {messages.length === 0 ? (
          <p className="text-xs text-matcha-700 font-medium py-4">No contact form messages submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.slice(0, 3).map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-2xl border border-beige-200 bg-beige-100 flex items-center justify-between text-xs gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-matcha-950 truncate">
                      {msg.name}
                    </span>
                    <span className="text-[10px] text-matcha-600 font-medium">({msg.email})</span>
                  </div>
                  <p className="text-matcha-800 font-medium truncate">
                    {msg.subject}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
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
