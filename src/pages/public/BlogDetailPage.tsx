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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-8 animate-in fade-in duration-200">
        <ShimmerBlock className="w-32 h-6 rounded-full mb-6" />
        <div className="space-y-4">
          <div className="flex gap-2">
            <ShimmerBlock className="w-20 h-6 rounded-full" />
            <ShimmerBlock className="w-24 h-6 rounded-full" />
          </div>
          <ShimmerBlock className="w-3/4 h-12 rounded-xl" />
          <ShimmerBlock className="w-1/2 h-5 rounded-lg" />
        </div>
        <ShimmerBlock className="w-full aspect-video rounded-2xl sm:rounded-3xl" />
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-20 animate-in fade-in duration-300">
        <SEOHead title="Article Not Found | Orven Casido" noindex={true} />
        <EmptyState
          title="Article Not Found"
          description="The requested blog post could not be located or has been moved."
          action={
            <Link
              to="/blogs"
              className="px-6 py-3 min-h-[44px] inline-flex items-center text-sm font-bold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 transition"
            >
              Back to all blogs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12 animate-in fade-in duration-300">
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
        className="inline-flex items-center gap-2 text-sm font-bold text-matcha-700 hover:text-matcha-950 transition cursor-pointer min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Articles
      </button>

      {/* Article Header */}
      <header className="space-y-5 sm:space-y-6 border-b border-beige-200 pb-6 sm:pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-matcha-100 text-matcha-900 border border-matcha-200"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-matcha-950 leading-tight break-words">
          {blog.title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-matcha-600 font-mono font-medium pt-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-matcha-600" /> {blog.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-matcha-600" /> {blog.published_at}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-matcha-600" /> {blog.reading_time}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full bg-beige-50 border border-beige-200 text-matcha-900 hover:border-matcha-300 hover:bg-beige-100/60 active:scale-95 transition cursor-pointer font-sans font-semibold text-xs shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-matcha-700" /> Share Post
          </button>
        </div>
      </header>

      {/* Cover Image if available */}
      {blog.cover_image_url && (
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-beige-200 aspect-video bg-beige-200 shadow-md">
          <img
            src={blog.cover_image_url}
            alt={`${blog.title} - Technical article by Orven Casido`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Body */}
      <div className="prose max-w-none text-matcha-900 leading-relaxed text-sm sm:text-base md:text-lg space-y-6 whitespace-pre-line font-normal break-words [overflow-wrap:anywhere]">
        {blog.content}
      </div>

      {/* Author Footer Bio */}
      <div className="pt-8 sm:pt-10 border-t border-beige-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-matcha-600 uppercase tracking-wider">Written by</p>
          <p className="text-lg font-bold text-matcha-950">{blog.author}</p>
          <p className="text-sm text-matcha-700">Software & Cloud Platform Engineer</p>
        </div>

        <Link
          to="/contact"
          className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 transition shadow-xs min-h-[44px] flex items-center justify-center text-center"
        >
          Get in Touch
        </Link>
      </div>
    </article>
  );
};
