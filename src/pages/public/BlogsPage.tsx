import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { getBlogs } from '../../lib/services';
import { Blog } from '../../types';
import { SectionHeader, EmptyState, LoadingSkeleton } from '../../components/ui/CommonUI';

export const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getBlogs();
        setBlogs(data.filter((b) => b.status === 'published'));
      } catch (err) {
        console.error('Failed to load blogs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter logic
  const filteredBlogs = blogs.filter((blog) => {
    return (
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const featuredBlog = blogs.find((b) => b.is_featured);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <SectionHeader
        title="Technical Writing & Insights"
        description="Articles on DevOps, cloud architecture, continuous deployment, and software engineering best practices."
      />

      {/* Featured Blog Highlight Banner (if no active filter) */}
      {featuredBlog && !searchQuery && (
        <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white dark:from-zinc-900/90 dark:to-zinc-950/90 shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
            <Tag className="w-3.5 h-3.5" /> Featured Article
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            <Link to={`/blogs/${featuredBlog.slug}`} className="hover:underline">
              {featuredBlog.title}
            </Link>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
            {featuredBlog.summary}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {featuredBlog.published_at}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {featuredBlog.reading_time}
              </span>
            </div>
            <Link
              to={`/blogs/${featuredBlog.slug}`}
              className="inline-flex items-center gap-1 font-semibold text-white hover:text-amber-300 transition"
            >
              Read full post <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Full Width Search Bar */}
      <div className="py-2 border-y border-zinc-200/80 dark:border-zinc-800/80">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search articles by keyword, title, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition shadow-xs"
          />
        </div>
      </div>

      {/* Blogs List */}
      {filteredBlogs.length === 0 ? (
        <EmptyState
          title="No articles found"
          description="Try adjusting your search query."
          action={
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold text-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 rounded-xl hover:bg-zinc-200 transition"
            >
              Clear Search
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {filteredBlogs.map((blog) => (
            <article
              key={blog.id}
              className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {blog.published_at}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {blog.reading_time}
                  </span>
                </div>
                <span>By {blog.author}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
              </h2>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {blog.summary}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="flex flex-wrap gap-1.5">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/blogs/${blog.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
