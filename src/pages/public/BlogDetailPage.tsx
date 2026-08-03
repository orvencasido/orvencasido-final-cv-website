import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react';
import { getBlogBySlug } from '../../lib/services';
import { Blog } from '../../types';
import { LoadingSkeleton, EmptyState } from '../../components/ui/CommonUI';
import { useToast } from '../../components/ui/Toast';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      try {
        const data = await getBlogBySlug(slug);
        setBlog(data);
      } catch (err) {
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Article Not Found"
          description="The requested blog post could not be located or has been moved."
          action={
            <Link
              to="/blogs"
              className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl"
            >
              Back to all blogs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/blogs')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Articles
      </button>

      {/* Header */}
      <header className="space-y-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono uppercase font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> {blog.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {blog.published_at}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {blog.reading_time}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </header>

      {/* Cover Image if available */}
      {blog.cover_image_url && (
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-100 dark:bg-zinc-800">
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Body */}
      <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
        {blog.content}
      </div>

      {/* Author Footer Bio */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Written by</p>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{blog.author}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Senior DevOps & Software Engineer</p>
        </div>

        <Link
          to="/contact"
          className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition"
        >
          Get in Touch
        </Link>
      </div>
    </article>
  );
};
