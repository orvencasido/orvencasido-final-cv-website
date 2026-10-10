import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, ArrowRight, Tag, X } from 'lucide-react';
import { getBlogs } from '../../lib/services';
import { Blog } from '../../types';
import { SectionHeader, EmptyState } from '../../components/ui/CommonUI';
import { BlogListSkeleton } from '../../components/ui/ShimmerSkeleton';
import { SEOHead } from '../../seo/SEOHead';
import { PAGE_SEO_CONFIG } from '../../seo/seoConfig';

export const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    blogs.forEach((b) => (b.tags || []).forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [blogs]);

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.tags && blog.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesTag = !selectedTag || (blog.tags && blog.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const featuredBlog = blogs.find((b) => b.is_featured);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12">
        <SectionHeader
          title="Articles & Notes"
          description="Learnings, architectural breakdowns, and practical experiences from designing and deploying software."
        />
        <BlogListSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-16 md:py-20 space-y-10 sm:space-y-12 animate-in fade-in duration-300">
      <SEOHead {...PAGE_SEO_CONFIG.blogs} />

      <SectionHeader
        title="Articles & Notes"
        description="Architectural deep dives, platform engineering notes, and DevOps insights."
      />

      {/* Featured Blog Highlight Banner */}
      {featuredBlog && !searchQuery && !selectedTag && (
        <div className="p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl border border-matcha-800 bg-matcha-900 text-beige-50 shadow-xl space-y-5 sm:space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-matcha-300 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" /> Featured Article
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-beige-50 break-words leading-tight">
            <Link to={`/blogs/${featuredBlog.slug}`} className="hover:text-matcha-200 transition-colors">
              {featuredBlog.title}
            </Link>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-matcha-200 leading-relaxed font-normal max-w-3xl">
            {featuredBlog.summary}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-matcha-800 text-xs font-medium text-matcha-300">
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {featuredBlog.published_at}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {featuredBlog.reading_time}
              </span>
            </div>
            <Link
              to={`/blogs/${featuredBlog.slug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 font-bold text-xs bg-beige-50 text-matcha-950 rounded-full hover:bg-beige-200 transition shadow-xs min-h-[44px]"
            >
              Read full post <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Search Bar & Tag Filter Pills */}
      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-matcha-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles by title, topic, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 min-h-[48px] text-sm sm:text-base bg-beige-50 border border-beige-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs placeholder:text-matcha-700/60"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-matcha-600 hover:text-matcha-950 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-beige-200 transition cursor-pointer"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tag Filtering Pills (Smooth horizontal momentum scroll on mobile) */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none select-none [-webkit-overflow-scrolling:touch]">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`shrink-0 px-4 py-2 min-h-[40px] text-xs font-bold rounded-full transition-all cursor-pointer ${
                selectedTag === null
                  ? 'bg-matcha-900 text-beige-50 shadow-xs'
                  : 'bg-beige-200/80 text-matcha-900 hover:bg-beige-300'
              }`}
            >
              All Topics ({blogs.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`shrink-0 px-4 py-2 min-h-[40px] text-xs font-bold rounded-full transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-matcha-900 text-beige-50 shadow-xs'
                    : 'bg-matcha-100 text-matcha-800 border border-matcha-200 hover:bg-matcha-200/60'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Blogs List */}
      {filteredBlogs.length === 0 ? (
        <EmptyState
          title="No articles found"
          description="Try adjusting your search query or selected tag."
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag(null);
              }}
              className="px-6 py-3 min-h-[44px] text-sm font-bold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 transition cursor-pointer"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {filteredBlogs.map((blog) => (
            <article
              key={blog.id}
              className="p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-beige-200 bg-beige-50 hover:border-matcha-300 hover:shadow-md transition-all space-y-5 sm:space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs text-matcha-600 font-mono">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-matcha-600" /> {blog.published_at}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-matcha-600" /> {blog.reading_time}
                  </span>
                </div>
                <span>Written by {blog.author}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-matcha-950 hover:text-matcha-700 transition break-words">
                <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
              </h2>

              <p className="text-sm sm:text-base text-matcha-800 leading-relaxed font-normal">
                {blog.summary}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-beige-200">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {blog.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-matcha-100 text-matcha-800 border border-matcha-200 hover:bg-matcha-200/60 transition cursor-pointer"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                <Link
                  to={`/blogs/${blog.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-matcha-900 hover:text-matcha-700 min-h-[44px]"
                >
                  Read Article <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

