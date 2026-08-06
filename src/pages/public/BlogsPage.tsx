import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { getBlogs } from '../../lib/services';
import { Blog } from '../../types';
import { EmptyState, LoadingSkeleton } from '../../components/ui/CommonUI';

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
      <div className="max-w-6xl mx-auto px-6 py-16">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      {/* Header */}
      <div>
        <p className="eyebrow mb-3">Writing</p>
        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink">
          Technical Writing & Insights
        </h1>
        <p className="mt-4 text-base text-muted max-w-2xl leading-relaxed">
          Articles on web architecture, full-stack development, database optimization, and modern developer tools.
        </p>
      </div>

      {/* Featured Blog Highlight Banner (if no active filter) */}
      {featuredBlog && !searchQuery && (
        <div className="p-8 rounded-3xl bg-[#0F1D24] text-[#FAF8F5] border border-line shadow-md space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-copper">
            <Tag className="w-3.5 h-3.5" /> Featured Article
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">
            <Link to={`/blogs/${featuredBlog.slug}`} className="hover:text-copper transition-colors">
              {featuredBlog.title}
            </Link>
          </h2>
          <p className="text-sm text-[#FAF8F5]/70 leading-relaxed max-w-3xl">
            {featuredBlog.summary}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#FAF8F5]/10 text-xs text-[#FAF8F5]/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-copper" /> {featuredBlog.published_at}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-copper" /> {featuredBlog.reading_time}
              </span>
            </div>
            <Link
              to={`/blogs/${featuredBlog.slug}`}
              className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-copper transition-colors"
            >
              Read full post <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="pt-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-subtle" />
          <input
            type="text"
            placeholder="Search articles by keyword, title, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm bg-card border border-line rounded-full focus:outline-none focus:border-copper transition-colors text-ink placeholder:text-muted-subtle"
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
              onClick={() => setSearchQuery('')}
              className="px-5 py-2.5 text-xs font-semibold bg-[#111F24] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#111F24] rounded-full hover:bg-copper transition-colors"
            >
              Clear Search
            </button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-8">
          {filteredBlogs.map((blog) => (
            <article
              key={blog.id}
              className="group block bg-card border border-line rounded-3xl p-7 hover:border-copper/40 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-muted-subtle mb-3 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-copper" /> {blog.published_at}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-copper" /> {blog.reading_time}
                    </span>
                  </div>
                  <span>By {blog.author}</span>
                </div>

                <h2 className="font-display text-xl font-semibold text-ink group-hover:text-copper transition-colors">
                  <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                </h2>

                <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3">
                  {blog.summary}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-line flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-paper text-muted border border-line"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/blogs/${blog.slug}`}
                  className="text-xs font-semibold text-copper hover:underline flex items-center gap-1"
                >
                  Read &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
