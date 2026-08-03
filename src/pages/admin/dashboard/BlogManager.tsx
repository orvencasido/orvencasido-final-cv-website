import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Tag,
  Star,
  Check,
} from 'lucide-react';
import { blogSchema, BlogFormData } from '../../../lib/schemas';
import { getBlogs, createBlog, updateBlog, deleteBlog } from '../../../lib/services';
import { Blog } from '../../../types';
import { SectionHeader, LoadingSkeleton, EmptyState, StatusBadge } from '../../../components/ui/CommonUI';
import { Modal, ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export const BlogManager: React.FC = () => {
  const { showToast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      tags: [],
      status: 'published',
      is_featured: false,
      author: 'Orven Casido',
      reading_time: '5 min read',
      published_at: new Date().toISOString().split('T')[0],
    },
  });

  const watchTags = watch('tags') || [];

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const openCreateModal = () => {
    setEditingBlog(null);
    reset({
      title: '',
      slug: '',
      summary: '',
      content: '',
      cover_image_url: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=1200',
      author: 'Orven Casido',
      tags: ['DevOps', 'Cloud'],
      reading_time: '5 min read',
      status: 'published',
      is_featured: false,
      published_at: new Date().toISOString().split('T')[0],
    });
    setIsEditModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    reset({
      title: blog.title,
      slug: blog.slug,
      summary: blog.summary,
      content: blog.content,
      cover_image_url: blog.cover_image_url,
      author: blog.author,
      tags: blog.tags,
      reading_time: blog.reading_time,
      status: blog.status,
      is_featured: blog.is_featured,
      published_at: blog.published_at,
    });
    setIsEditModalOpen(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !watchTags.includes(tagInput.trim())) {
      setValue('tags', [...watchTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchTags.filter((t) => t !== tagToRemove)
    );
  };

  const onSubmit = async (data: BlogFormData) => {
    try {
      if (editingBlog) {
        await updateBlog(editingBlog.id, data);
        showToast('Blog post updated successfully!', 'success');
      } else {
        await createBlog(data);
        showToast('New blog post created!', 'success');
      }
      setIsEditModalOpen(false);
      loadBlogs();
    } catch (err) {
      console.error('Error saving blog:', err);
      showToast('Error saving blog post', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteBlog(deletingId);
      showToast('Blog post deleted', 'success');
      setDeletingId(null);
      loadBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      showToast('Failed to delete blog', 'error');
    }
  };

  const handleToggleStatus = async (blog: Blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    await updateBlog(blog.id, { status: newStatus });
    showToast(`Blog status set to ${newStatus}`, 'info');
    loadBlogs();
  };

  const handleToggleFeatured = async (blog: Blog) => {
    await updateBlog(blog.id, { is_featured: !blog.is_featured });
    showToast(`Blog featured state updated`, 'info');
    loadBlogs();
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Blog Post Management"
        description="Write, publish, feature, or manage technical blog articles across your personal platform."
        action={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Blog Post
          </button>
        }
      />

      {/* Search & Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search blogs by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div className="text-xs text-zinc-500 font-mono">
          Showing {filteredBlogs.length} of {blogs.length} articles
        </div>
      </div>

      {/* Blog Table / Grid */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : filteredBlogs.length === 0 ? (
        <EmptyState title="No blog posts found" />
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-medium">
                <tr>
                  <th className="px-4 py-3">Title & Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Published Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {blog.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        /blogs/{blog.slug}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleStatus(blog)} title="Click to toggle status">
                        <StatusBadge status={blog.status} type="content" />
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleFeatured(blog)}
                        className={`p-1 rounded-lg transition ${
                          blog.is_featured
                            ? 'text-amber-500 hover:text-amber-600'
                            : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-400'
                        }`}
                        title="Toggle featured state"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {blog.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                      {blog.published_at}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/blogs/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Preview Post"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(blog)}
                          className="p-1.5 text-zinc-400 hover:text-sky-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Edit Post"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(blog.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Title</label>
              <input
                type="text"
                {...register('title')}
                onChange={(e) => {
                  register('title').onChange(e);
                  if (!editingBlog) {
                    setValue(
                      'slug',
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '')
                    );
                  }
                }}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">URL Slug</label>
              <input
                type="text"
                {...register('slug')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Author</label>
              <input
                type="text"
                {...register('author')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Reading Time</label>
              <input
                type="text"
                {...register('reading_time')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Summary</label>
            <textarea
              rows={2}
              {...register('summary')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
            {errors.summary && <p className="text-xs text-red-500">{errors.summary.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">
              Content (Markdown or Plain Text)
            </label>
            <textarea
              rows={6}
              {...register('content')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
            />
            {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Cover Image URL</label>
            <input
              type="text"
              {...register('cover_image_url')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
            />
          </div>

          {/* Tags manager */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Tags</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag and press Add..."
                className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 rounded-xl font-semibold text-xs"
              >
                Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {watchTags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs flex items-center gap-1 font-mono"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-500 ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_featured_check"
              {...register('is_featured')}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            <label htmlFor="is_featured_check" className="font-medium text-zinc-700 dark:text-zinc-300">
              Mark post as featured on home page
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-semibold shadow-sm"
            >
              Save Blog Post
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
      />
    </div>
  );
};
