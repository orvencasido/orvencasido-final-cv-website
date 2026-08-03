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
  ExternalLink,
  Github,
} from 'lucide-react';
import { projectSchema, ProjectFormData } from '../../../lib/schemas';
import { getProjects, createProject, updateProject, deleteProject } from '../../../lib/services';
import { Project } from '../../../types';
import { SectionHeader, LoadingSkeleton, EmptyState, StatusBadge } from '../../../components/ui/CommonUI';
import { Modal, ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

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
      cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      github_url: 'https://github.com',
      live_url: 'https://demo.dev',
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
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Project
          </button>
        }
      />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects by title or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div className="text-xs text-zinc-500 font-mono">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
      </div>

      {/* Projects Table */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : filteredProjects.length === 0 ? (
        <EmptyState title="No projects found" />
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-medium">
                <tr>
                  <th className="px-4 py-3">Project Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Technologies</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {proj.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        /projects/{proj.slug}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={proj.status} type="project" />
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleFeatured(proj)}
                        className={`p-1 rounded-lg transition ${
                          proj.is_featured
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
                        {proj.technologies.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                      {proj.completion_date}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/projects/${proj.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-1.5 text-zinc-400 hover:text-sky-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(proj.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Project Title</label>
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
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Slug</label>
              <input
                type="text"
                {...register('slug')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Project Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="maintained">Actively Maintained</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Completion Date</label>
              <input
                type="text"
                placeholder="e.g. 2026-03"
                {...register('completion_date')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Short Summary</label>
            <textarea
              rows={2}
              {...register('short_description')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
            {errors.short_description && (
              <p className="text-xs text-red-500">{errors.short_description.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Full Description</label>
            <textarea
              rows={4}
              {...register('full_description')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
            />
            {errors.full_description && (
              <p className="text-xs text-red-500">{errors.full_description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">GitHub Repository URL</label>
              <input
                type="text"
                {...register('github_url')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Live Demo URL</label>
              <input
                type="text"
                {...register('live_url')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Cover Image URL</label>
            <input
              type="text"
              {...register('cover_image_url')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
            />
          </div>

          {/* Tech stack tags */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Technologies Used</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add technology (e.g. Kubernetes)..."
                className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3 py-1.5 bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 rounded-xl font-semibold text-xs"
              >
                Add Tech
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {watchTechs.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs flex items-center gap-1 font-mono"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(t)}
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
              id="is_featured_proj"
              {...register('is_featured')}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            <label htmlFor="is_featured_proj" className="font-medium text-zinc-700 dark:text-zinc-300">
              Feature this project on home page
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-semibold shadow-sm"
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
