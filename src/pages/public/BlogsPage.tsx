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
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-20 space-y-12">
      <SectionHeader
        title="Im Not Good at Words"
        description="Things I've learned and want to share with the world. Whether it's a new technology, a lesson from a project, or a challenge I overcame, I hope you'll learn something alongside me."
      />

      {/* Featured Blog Highlight Banner */}
      {featuredBlog && !searchQuery && (
        <div className="p-8 sm:p-12 rounded-3xl border border-matcha-800 bg-matcha-900 text-beige-50 shadow-xl space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-matcha-300">
            <Tag className="w-4 h-4" /> Featured Article
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-beige-50">
            <Link to={`/blogs/${featuredBlog.slug}`} className="hover:text-matcha-200 transition-colors">
              {featuredBlog.title}
            </Link>
          </h2>
          <p className="text-sm sm:text-lg text-matcha-200 leading-relaxed font-normal max-w-3xl">
            {featuredBlog.summary}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-matcha-800 text-xs font-medium text-matcha-300">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {featuredBlog.published_at}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {featuredBlog.reading_time}
              </span>
            </div>
            <Link
              to={`/blogs/${featuredBlog.slug}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 font-bold text-xs bg-beige-50 text-matcha-950 rounded-full hover:bg-beige-200 transition shadow-xs"
            >
              Read full post <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="py-2">
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-matcha-600" />
          <input
            type="text"
            placeholder="Search articles by title, topic, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 text-base bg-beige-50 border border-beige-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-matcha-500 transition shadow-2xs placeholder:text-matcha-700/60"
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
              className="px-6 py-3 text-sm font-bold bg-matcha-900 text-beige-50 rounded-full hover:bg-matcha-800 transition cursor-pointer"
            >
              Clear Search
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          {filteredBlogs.map((blog) => (
            <article
              key={blog.id}
              className="p-8 rounded-3xl border border-beige-300 bg-beige-50 hover:border-matcha-400 hover:shadow-md transition-all space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-matcha-600 font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {blog.published_at}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {blog.reading_time}
                  </span>
                </div>
                <span>Written by {blog.author}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-matcha-950 hover:text-matcha-700 transition">
                <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
              </h2>

              <p className="text-sm sm:text-base text-matcha-800 leading-relaxed font-normal">
                {blog.summary}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-beige-200">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-semibold px-3.5 py-1 rounded-full bg-matcha-100 text-matcha-950 border border-matcha-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/blogs/${blog.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-extrabold text-matcha-900 hover:text-matcha-700"
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
