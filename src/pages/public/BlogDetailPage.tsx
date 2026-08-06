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
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20">
        <EmptyState
          title="Article Not Found"
          description="The requested blog post could not be located or has been moved."
          action={
            <Link
              to="/blogs"
              className="px-5 py-2.5 text-xs font-semibold bg-[#111F24] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#111F24] rounded-full hover:bg-copper transition-colors"
            >
              Back to all blogs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/blogs')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-copper transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Articles
      </button>

      {/* Header */}
      <header className="space-y-5 border-b border-line pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-3 py-1 rounded-full bg-paper text-muted border border-line"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink leading-snug">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-copper" /> {blog.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-copper" /> {blog.published_at}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-copper" /> {blog.reading_time}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line hover:border-copper hover:text-copper transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </header>

      {/* Cover Image if available */}
      {blog.cover_image_url && (
        <div className="rounded-3xl overflow-hidden border border-line aspect-video bg-card shadow-sm">
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Body */}
      <div className="prose max-w-none text-muted leading-relaxed text-base space-y-4 whitespace-pre-line">
        {blog.content}
      </div>

      {/* Author Footer Bio */}
      <div className="pt-8 border-t border-line flex items-center justify-between">
        <div className="space-y-1">
          <p className="eyebrow">Written by</p>
          <p className="font-display text-lg font-semibold text-ink">{blog.author}</p>
          <p className="text-xs text-muted">Full-Stack Engineer & Systems Architect</p>
        </div>

        <Link
          to="/contact"
          className="px-5 py-2.5 text-xs font-semibold bg-[#111F24] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#111F24] rounded-full hover:bg-copper transition-colors"
        >
          Get in Touch
        </Link>
      </div>
    </article>
  );
};
