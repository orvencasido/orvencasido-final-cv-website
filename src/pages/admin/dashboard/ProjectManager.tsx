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
import { projectSchema, ProjectFormData } from '../../../lib/schemas';
import { getProjects, createProject, updateProject, deleteProject } from '../../../lib/services';
import { Project } from '../../../types';
import { SectionHeader, LoadingSkeleton, EmptyState, StatusBadge } from '../../../components/ui/CommonUI';
import { Modal, ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { ImageUploadField } from '../../../components/admin/ImageUploadField';

export const ProjectManager: React.FC = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [techInput, setTechInput] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      technologies: [],
      status: 'completed',
      is_featured: false,
      completion_date: '2026-03',
      sort_order: 1,
    },
  });

  const watchTechs = watch('technologies') || [];
  const watchCoverImageUrl = watch('cover_image_url') || '';

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    reset({
      title: '',
      slug: '',
      short_description: '',
      full_description: '',
      cover_image_url: '',
      technologies: [],
      github_url: '',
      live_url: '',
      status: 'completed',
      completion_date: '2026-03',
      is_featured: false,
      sort_order: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    reset({
      title: proj.title,
      slug: proj.slug,
      short_description: proj.short_description,
      full_description: proj.full_description,
      cover_image_url: proj.cover_image_url,
      technologies: proj.technologies,
      github_url: proj.github_url,
      live_url: proj.live_url,
      status: proj.status,
      completion_date: proj.completion_date,
      is_featured: proj.is_featured,
      sort_order: proj.sort_order,
    });
    setIsModalOpen(true);
  };

  const handleAddTech = () => {
    if (techInput.trim() && !watchTechs.includes(techInput.trim())) {
      setValue('technologies', [...watchTechs, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (item: string) => {
    setValue(
      'technologies',
      watchTechs.filter((t) => t !== item)
    );
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
        showToast('Project updated successfully!', 'success');
      } else {
        await createProject(data);
        showToast('New project created!', 'success');
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (err) {
      console.error('Error saving project:', err);
      showToast('Error saving project', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteProject(deletingId);
      showToast('Project removed', 'success');
      setDeletingId(null);
      loadProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      showToast('Failed to delete project', 'error');
    }
  };

  const handleToggleFeatured = async (proj: Project) => {
    await updateProject(proj.id, { is_featured: !proj.is_featured });
    showToast('Featured project status updated', 'info');
    loadProjects();
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Project Management"
        description="Add, edit, or feature cloud applications, IaC systems, and software repositories."
        action={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-extrabold text-beige-50 bg-matcha-900 rounded-full hover:bg-matcha-800 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Project
          </button>
        }
      />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border border-beige-300 bg-beige-50 shadow-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-matcha-600" />
          <input
            type="text"
            placeholder="Search projects by title or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
          />
        </div>
        <div className="text-xs text-matcha-700 font-mono font-bold">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      </div>

      {/* Projects Table */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : filteredProjects.length === 0 ? (
        <EmptyState title="No projects found" />
      ) : (
        <div className="border border-beige-300 rounded-3xl bg-beige-50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-beige-200/80 text-matcha-900 border-b border-beige-300 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Project Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4">Technologies</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-beige-100/70 transition">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-extrabold text-matcha-950 truncate">
                        {proj.title}
                      </p>
                      <p className="text-[11px] text-matcha-700 font-mono truncate">
                        /projects/{proj.slug}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={proj.status} type="project" />
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(proj)}
                        className={`p-1.5 rounded-xl transition cursor-pointer ${
                          proj.is_featured
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
                        {proj.technologies.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-matcha-100/80 text-matcha-900 font-mono font-bold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-matcha-700 font-mono text-xs font-medium">
                      {proj.completion_date}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/projects/${proj.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-matcha-700 hover:text-matcha-950 rounded-xl hover:bg-beige-200"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-2 text-matcha-700 hover:text-matcha-950 rounded-xl hover:bg-beige-200 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(proj.id)}
                          className="p-2 text-matcha-700 hover:text-red-700 rounded-xl hover:bg-beige-200 cursor-pointer"
                          title="Delete"
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

      {/* Edit / Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Project Title</label>
              <input
                type="text"
                {...register('title')}
                onChange={(e) => {
                  register('title').onChange(e);
                  if (!editingProject) {
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
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Slug</label>
              <input
                type="text"
                {...register('slug')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
              {errors.slug && <p className="text-xs text-red-600 font-medium">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Project Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              >
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="maintained">Actively Maintained</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Completion Date</label>
              <input
                type="text"
                placeholder="e.g. 2026-03"
                {...register('completion_date')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Short Summary</label>
            <textarea
              rows={2}
              {...register('short_description')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
            {errors.short_description && (
              <p className="text-xs text-red-600 font-medium">{errors.short_description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Full Description</label>
            <textarea
              rows={4}
              {...register('full_description')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
            />
            {errors.full_description && (
              <p className="text-xs text-red-600 font-medium">{errors.full_description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">GitHub Repository URL</label>
              <input
                type="text"
                {...register('github_url')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 text-xs font-mono font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Live Demo URL</label>
              <input
                type="text"
                {...register('live_url')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 text-xs font-mono font-medium"
              />
            </div>
          </div>

          <input type="hidden" {...register('cover_image_url')} />
          <ImageUploadField
            label="Cover Image"
            folder="projects"
            value={watchCoverImageUrl}
            onChange={(url) => setValue('cover_image_url', url, { shouldValidate: true })}
            onError={(message) => showToast('Image upload failed', 'error', message)}
          />

          {/* Tech stack tags */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Technologies Used</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add technology (e.g. Kubernetes)..."
                className="flex-1 px-4 py-2.5 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-5 py-2.5 bg-matcha-900 text-beige-50 rounded-full font-bold text-xs hover:bg-matcha-800 cursor-pointer"
              >
                Add Tech
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {watchTechs.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-matcha-100 text-matcha-900 text-xs flex items-center gap-1.5 font-mono font-bold"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(t)}
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
              id="is_featured_proj"
              {...register('is_featured')}
              className="w-4 h-4 rounded text-matcha-900 focus:ring-matcha-500"
            />
            <label htmlFor="is_featured_proj" className="font-bold text-xs text-matcha-950 cursor-pointer">
              Feature this project on home page
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-beige-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-xs font-bold text-matcha-800 hover:text-matcha-950 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-matcha-900 text-beige-50 rounded-full font-extrabold text-xs hover:bg-matcha-800 cursor-pointer shadow-xs"
            >
              Save Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project?"
      />
    </div>
  );
};
