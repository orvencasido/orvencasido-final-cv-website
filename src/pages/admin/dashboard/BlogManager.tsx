import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Star,
} from 'lucide-react';
import { blogSchema, BlogFormData } from '../../../lib/schemas';
import { getBlogs, createBlog, updateBlog, deleteBlog } from '../../../lib/services';
import { Blog } from '../../../types';
import { SectionHeader, LoadingSkeleton, EmptyState, StatusBadge } from '../../../components/ui/CommonUI';
import { Modal, ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { ImageUploadField } from '../../../components/admin/ImageUploadField';

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
  const watchCoverImageUrl = watch('cover_image_url') || '';

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
      cover_image_url: '',
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
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-extrabold text-beige-50 bg-matcha-900 rounded-full hover:bg-matcha-800 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Blog Post
          </button>
        }
      />

      {/* Search & Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border border-beige-300 bg-beige-50 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-matcha-600" />
          <input
            type="text"
            placeholder="Search blogs by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
          />
        </div>
        <div className="text-xs text-matcha-700 font-mono font-bold">
          Showing {filteredBlogs.length} of {blogs.length} articles
        </div>
      </div>

      {/* Blog Table / Grid */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : filteredBlogs.length === 0 ? (
        <EmptyState title="No blog posts found" />
      ) : (
        <div className="border border-beige-300 rounded-3xl bg-beige-50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-beige-200/80 text-matcha-900 border-b border-beige-300 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Title & Slug</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4">Published Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-beige-100/70 transition">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-extrabold text-matcha-950 truncate">
                        {blog.title}
                      </p>
                      <p className="text-[11px] text-matcha-700 font-mono truncate">
                        /blogs/{blog.slug}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <button onClick={() => handleToggleStatus(blog)} title="Click to toggle status" className="cursor-pointer">
                        <StatusBadge status={blog.status} type="content" />
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(blog)}
                        className={`p-1.5 rounded-xl transition cursor-pointer ${
                          blog.is_featured
                            ? 'text-amber-600 hover:text-amber-700'
                            : 'text-matcha-400 hover:text-amber-600'
                        }`}
                        title="Toggle featured state"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {blog.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-matcha-100/80 text-matcha-900 font-mono font-bold"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-matcha-700 font-mono text-xs font-medium">
                      {blog.published_at}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/blogs/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-matcha-700 hover:text-matcha-950 rounded-xl hover:bg-beige-200"
                          title="Preview Post"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(blog)}
                          className="p-2 text-matcha-700 hover:text-matcha-950 rounded-xl hover:bg-beige-200 cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(blog.id)}
                          className="p-2 text-matcha-700 hover:text-red-700 rounded-xl hover:bg-beige-200 cursor-pointer"
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Title</label>
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
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
              {errors.title && <p className="text-xs text-red-600 font-medium">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">URL Slug</label>
              <input
                type="text"
                {...register('slug')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
              {errors.slug && <p className="text-xs text-red-600 font-medium">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Author</label>
              <input
                type="text"
                {...register('author')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Reading Time</label>
              <input
                type="text"
                {...register('reading_time')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Summary</label>
            <textarea
              rows={2}
              {...register('summary')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
            {errors.summary && <p className="text-xs text-red-600 font-medium">{errors.summary.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
              Content (Markdown or Plain Text)
            </label>
            <textarea
              rows={6}
              {...register('content')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
            />
            {errors.content && <p className="text-xs text-red-600 font-medium">{errors.content.message}</p>}
          </div>

          <input type="hidden" {...register('cover_image_url')} />
          <ImageUploadField
            label="Cover Image"
            folder="blogs"
            value={watchCoverImageUrl}
            onChange={(url) => setValue('cover_image_url', url, { shouldValidate: true })}
            onError={(message) => showToast('Image upload failed', 'error', message)}
          />

          {/* Tags manager */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Tags</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag and press Add..."
                className="flex-1 px-4 py-2.5 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-5 py-2.5 bg-matcha-900 text-beige-50 rounded-full font-bold text-xs hover:bg-matcha-800 cursor-pointer"
              >
                Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {watchTags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-matcha-100 text-matcha-900 text-xs flex items-center gap-1.5 font-mono font-bold"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-700 ml-1 font-extrabold cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_featured_check"
              {...register('is_featured')}
              className="w-4 h-4 rounded text-matcha-900 focus:ring-matcha-500"
            />
            <label htmlFor="is_featured_check" className="font-bold text-xs text-matcha-950 cursor-pointer">
              Mark post as featured on home page
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-beige-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 text-xs font-bold text-matcha-800 hover:text-matcha-950 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-matcha-900 text-beige-50 rounded-full font-extrabold text-xs hover:bg-matcha-800 cursor-pointer shadow-xs"
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
