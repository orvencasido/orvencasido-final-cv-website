import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react';
import { getBlogBySlug } from '../../lib/services';
import { Blog } from '../../types';
import { ShimmerBlock } from '../../components/ui/ShimmerSkeleton';
import { EmptyState } from '../../components/ui/CommonUI';
import { useToast } from '../../components/ui/Toast';
import { SEOHead } from '../../seo/SEOHead';
import { getBlogPostingSchema } from '../../seo/structuredData';

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
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-8 animate-in fade-in duration-200">
        <ShimmerBlock className="w-32 h-6 rounded-full mb-6" />
        <div className="space-y-4">
          <div className="flex gap-2">
            <ShimmerBlock className="w-20 h-6 rounded-full" />
            <ShimmerBlock className="w-24 h-6 rounded-full" />
          </div>
          <ShimmerBlock className="w-3/4 h-12 rounded-xl" />
          <ShimmerBlock className="w-1/2 h-5 rounded-lg" />
        </div>
        <ShimmerBlock className="w-full aspect-video rounded-3xl" />
        <div className="space-y-3 pt-6">
          <ShimmerBlock className="w-full h-4 rounded-md" />
          <ShimmerBlock className="w-full h-4 rounded-md" />
          <ShimmerBlock className="w-5/6 h-4 rounded-md" />
          <ShimmerBlock className="w-2/3 h-4 rounded-md" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-20 animate-in fade-in duration-300">
        <SEOHead title="Article Not Found | Orven Casido" noindex={true} />
        <EmptyState
          title="Article Not Found"
          description="The requested blog post could not be located or has been moved."
          action={
            <Link
              to="/blogs"
              className="px-6 py-3 text-sm font-bold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 transition"
            >
              Back to all blogs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-12 animate-in fade-in duration-300">
      <SEOHead
        title={`${blog.title} | Orven Casido`}
        description={blog.summary}
        canonicalPath={`/blogs/${blog.slug}`}
        ogImage={blog.cover_image_url}
        ogType="article"
        keywords={blog.tags}
        jsonLd={getBlogPostingSchema(blog)}
      />
      {/* Back button */}
      <button
        onClick={() => navigate('/blogs')}
        className="inline-flex items-center gap-2 text-sm font-bold text-matcha-700 hover:text-matcha-950 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Articles
      </button>

      {/* Article Header */}
      <header className="space-y-6 border-b border-beige-300 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-matcha-100 text-matcha-950 border border-matcha-200"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-matcha-950 leading-tight">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-6 text-xs text-matcha-600 font-mono font-medium pt-2">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {blog.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {blog.published_at}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {blog.reading_time}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-beige-50 border border-beige-300 text-matcha-900 hover:bg-beige-200 transition cursor-pointer font-sans font-bold"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </header>

      {/* Cover Image if available */}
      {blog.cover_image_url && (
        <div className="rounded-3xl overflow-hidden border border-beige-300 aspect-video bg-beige-200 shadow-md">
          <img
            src={blog.cover_image_url}
            alt={`${blog.title} - Technical article by Orven Casido`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Body */}
      <div className="prose max-w-none text-matcha-900 leading-relaxed text-base sm:text-lg space-y-6 whitespace-pre-line font-normal">
        {blog.content}
      </div>

      {/* Author Footer Bio */}
      <div className="pt-10 border-t border-beige-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs font-extrabold text-matcha-700 uppercase tracking-widest">Written by</p>
          <p className="text-lg font-extrabold text-matcha-950">{blog.author}</p>
          <p className="text-sm text-matcha-700">Software & Cloud Platform Engineer</p>
        </div>

        <Link
          to="/contact"
          className="px-8 py-3.5 text-sm font-extrabold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 transition shadow-xs"
        >
          Get in Touch
        </Link>
      </div>
    </article>
  );
};
