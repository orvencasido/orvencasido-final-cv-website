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
  RefreshCw,
  ImagePlus,
  Cpu,
  Globe,
  EyeOff,
} from 'lucide-react';
import { projectSchema, ProjectFormData } from '../../../lib/schemas';
import { getProjects, createProject, updateProject, deleteProject, getSkills, updateSkills } from '../../../lib/services';
import { Project, Skill } from '../../../types';
import {
  parseTechString,
  resolveTechIconUrl,
  isLiveUrlVisible,
  isLiveUrlToggleActive,
  getCleanLiveUrl,
  formatLiveUrl,
} from '../../../lib/techIcons';
import { uploadPortfolioImage } from '../../../lib/storage';
import { SectionHeader, LoadingSkeleton, EmptyState, StatusBadge } from '../../../components/ui/CommonUI';
import { Modal, ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import { ImageUploadField } from '../../../components/admin/ImageUploadField';

export const ProjectManager: React.FC = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [techInput, setTechInput] = useState('');
  const [customTechIcon, setCustomTechIcon] = useState('');
  const [uploadingTechIcon, setUploadingTechIcon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiveVisible, setIsLiveVisible] = useState(true);

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
      completion_date: new Date().toISOString().slice(0, 7),
      sort_order: 1,
    },
  });

  const watchTechs = watch('technologies') || [];
  const watchCoverImageUrl = watch('cover_image_url') || '';

  const loadProjects = async () => {
    setLoading(true);
    try {
      const [projData, skillData] = await Promise.all([getProjects(), getSkills()]);
      setProjects(projData);
      setSkills(skillData);
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
    setTechInput('');
    setCustomTechIcon('');
    setIsLiveVisible(true);
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
      completion_date: new Date().toISOString().slice(0, 7),
      is_featured: false,
      sort_order: projects.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setTechInput('');
    setCustomTechIcon('');
    setIsLiveVisible(isLiveUrlToggleActive(proj.live_url));
    reset({
      title: proj.title,
      slug: proj.slug,
      short_description: proj.short_description,
      full_description: proj.full_description,
      cover_image_url: proj.cover_image_url || '',
      technologies: proj.technologies || [],
      github_url: proj.github_url || '',
      live_url: getCleanLiveUrl(proj.live_url),
      status: proj.status,
      completion_date: proj.completion_date,
      is_featured: proj.is_featured || false,
      sort_order: proj.sort_order ?? 0,
    });
    setIsModalOpen(true);
  };

  const handleTechIconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadingTechIcon(true);
    try {
      const uploadedUrl = await uploadPortfolioImage(file, 'misc');
      setCustomTechIcon(uploadedUrl);
      showToast('Custom tech icon uploaded.', 'success');
    } catch (err) {
      console.error('Failed to upload tech icon:', err);
      const message = err instanceof Error ? err.message : 'Icon upload failed.';
      showToast(message, 'error');
    } finally {
      setUploadingTechIcon(false);
    }
  };

  const handleAddTech = async (explicitName?: string, explicitIcon?: string) => {
    const nameToAdd = (explicitName || techInput).trim();
    const iconToAdd = explicitIcon || customTechIcon;
    if (!nameToAdd) return;

    const isCustomUrl = iconToAdd && (iconToAdd.startsWith('http') || iconToAdd.startsWith('data:'));
    const valueToStore = isCustomUrl ? `${nameToAdd}:::${iconToAdd}` : nameToAdd;

    const alreadyExists = watchTechs.some((t) => {
      const { name } = parseTechString(t);
      return name.toLowerCase() === nameToAdd.toLowerCase();
    });

    if (!alreadyExists) {
      setValue('technologies', [...watchTechs, valueToStore], { shouldValidate: true });

      if (iconToAdd && !skills.some((s) => s.name.toLowerCase() === nameToAdd.toLowerCase())) {
        try {
          const newSkill: Skill = {
            id: `sk_${Date.now()}`,
            name: nameToAdd,
            icon: iconToAdd,
            category: 'Tools & Methods',
            proficiency: 90,
            sort_order: skills.length + 1,
            is_visible: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const savedSkills = await updateSkills([...skills, newSkill]);
          setSkills(savedSkills);
        } catch (err) {
          console.error('Failed to save skill to library:', err);
        }
      }
    }

    setTechInput('');
    setCustomTechIcon('');
  };

  const handleRemoveTech = (item: string) => {
    setValue(
      'technologies',
      watchTechs.filter((t) => t !== item),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const payload: ProjectFormData = {
        ...data,
        technologies:
          techInput.trim() && !data.technologies.includes(techInput.trim())
            ? [...data.technologies, techInput.trim()]
            : data.technologies,
        cover_image_url: data.cover_image_url || '',
        github_url: data.github_url || '',
        live_url: formatLiveUrl(data.live_url || '', isLiveVisible),
        sort_order: typeof data.sort_order === 'number' ? data.sort_order : 0,
      };

      if (editingProject) {
        await updateProject(editingProject.id, payload);
        showToast('Project updated successfully!', 'success');
      } else {
        await createProject(payload);
        showToast('New project created!', 'success');
      }
      setIsModalOpen(false);
      await loadProjects();
    } catch (err: any) {
      console.error('Error saving project:', err);
      showToast('Error saving project', 'error', err?.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
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
    const nextFeatured = !proj.is_featured;
    setProjects((prev) =>
      prev.map((p) => (p.id === proj.id ? { ...p, is_featured: nextFeatured } : p))
    );
    try {
      await updateProject(proj.id, { is_featured: nextFeatured });
      showToast(
        nextFeatured ? `"${proj.title}" added to featured` : `"${proj.title}" removed from featured`,
        'success'
      );
      await loadProjects();
    } catch (err: any) {
      console.error('Failed to toggle featured status:', err);
      setProjects((prev) =>
        prev.map((p) => (p.id === proj.id ? { ...p, is_featured: proj.is_featured } : p))
      );
      showToast('Failed to update featured status', 'error', err?.message);
    }
  };

  const handleToggleLiveVisibility = async (proj: Project) => {
    const clean = getCleanLiveUrl(proj.live_url);
    if (!clean) {
      showToast('No live demo URL set for this project', 'error');
      return;
    }
    const currentlyVisible = isLiveUrlVisible(proj.live_url);
    const nextVisible = !currentlyVisible;
    const newLiveUrl = formatLiveUrl(clean, nextVisible);

    setProjects((prev) =>
      prev.map((p) => (p.id === proj.id ? { ...p, live_url: newLiveUrl } : p))
    );

    try {
      await updateProject(proj.id, { live_url: newLiveUrl });
      showToast(
        nextVisible
          ? `Live button is now visible for "${proj.title}"`
          : `Live button is now hidden for "${proj.title}"`,
        'success'
      );
      await loadProjects();
    } catch (err: any) {
      console.error('Failed to toggle live visibility:', err);
      setProjects((prev) =>
        prev.map((p) => (p.id === proj.id ? { ...p, live_url: proj.live_url } : p))
      );
      showToast('Failed to update live button visibility', 'error', err?.message);
    }
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
                      <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                        {proj.technologies.slice(0, 6).map((t) => {
                          const { name: techName, customIcon } = parseTechString(t);
                          const iconUrl = customIcon || resolveTechIconUrl(t, skills);

                          return (
                            <div
                              key={t}
                              className="relative group/tech flex items-center justify-center w-7 h-7 rounded-xl bg-beige-200/80 border border-beige-300 p-1 hover:border-matcha-400 transition"
                            >
                              {iconUrl ? (
                                <img
                                  src={iconUrl}
                                  alt={techName}
                                  className="w-4 h-4 object-contain select-none"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-[10px] font-bold font-mono text-matcha-900">
                                  {techName.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full mb-1.5 hidden group-hover/tech:flex flex-col items-center pointer-events-none z-30">
                                <span className="px-2 py-0.5 bg-matcha-950 text-beige-50 text-[10px] font-semibold rounded-md shadow-md whitespace-nowrap">
                                  {techName}
                                </span>
                                <span className="w-1 h-1 bg-matcha-950 rotate-45 -mt-0.5"></span>
                              </div>
                            </div>
                          );
                        })}
                        {proj.technologies.length > 6 && (
                          <span className="text-[10px] font-mono font-bold text-matcha-800 bg-beige-200/90 border border-beige-300 px-1.5 py-0.5 rounded-lg">
                            +{proj.technologies.length - 6}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-matcha-700 font-mono text-xs font-medium">
                      {proj.completion_date}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getCleanLiveUrl(proj.live_url) ? (
                          <button
                            type="button"
                            onClick={() => handleToggleLiveVisibility(proj)}
                            className={`p-2 rounded-xl transition cursor-pointer ${
                              isLiveUrlVisible(proj.live_url)
                                ? 'text-matcha-800 hover:bg-beige-200'
                                : 'text-stone-400 hover:text-stone-600 hover:bg-beige-200'
                            }`}
                            title={
                              isLiveUrlVisible(proj.live_url)
                                ? 'Live button is visible on public cards (click to hide)'
                                : 'Live button is hidden on public cards (click to show)'
                            }
                          >
                            {isLiveUrlVisible(proj.live_url) ? (
                              <Globe className="w-4 h-4 text-matcha-800" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-stone-400" />
                            )}
                          </button>
                        ) : null}
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
        <form
          onSubmit={handleSubmit(onSubmit, (formErrors) => {
            console.error('Project form validation errors:', formErrors);
            const firstErrorMessage = Object.values(formErrors)[0]?.message;
            showToast(
              'Please check the form for errors',
              'error',
              firstErrorMessage ? String(firstErrorMessage) : 'Please fill in all required fields.'
            );
          })}
          className="space-y-5 text-xs sm:text-sm"
        >
          <input type="hidden" {...register('sort_order', { valueAsNumber: true })} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Project Title <span className="text-red-500">*</span>
              </label>
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
                        .replace(/(^-|-$)+/g, ''),
                      { shouldValidate: true }
                    );
                  }
                }}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
              {errors.title && <p className="text-xs text-red-600 font-medium">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Slug <span className="text-red-500">*</span>
              </label>
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
              {errors.status && <p className="text-xs text-red-600 font-medium">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Completion Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 2026-03"
                {...register('completion_date')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
              {errors.completion_date && (
                <p className="text-xs text-red-600 font-medium">{errors.completion_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
              Short Summary <span className="text-red-500">* (min 10 chars)</span>
            </label>
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
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
              Full Description <span className="text-red-500">* (min 20 chars)</span>
            </label>
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
              {errors.github_url && <p className="text-xs text-red-600 font-medium">{errors.github_url.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                  Live Demo URL
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-matcha-800 hover:text-matcha-950 select-none">
                  <input
                    type="checkbox"
                    checked={isLiveVisible}
                    onChange={(e) => setIsLiveVisible(e.target.checked)}
                    className="w-4 h-4 rounded text-matcha-900 focus:ring-matcha-500"
                  />
                  <span>Show Live button</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="e.g. https://demo.example.com"
                {...register('live_url')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 text-xs font-mono font-medium"
              />
              {!isLiveVisible && (
                <p className="text-[11px] text-amber-700 font-medium">
                  Live button will be hidden on public project cards.
                </p>
              )}
              {errors.live_url && <p className="text-xs text-red-600 font-medium">{errors.live_url.message}</p>}
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

          {/* Tech stack tags with icon preview and upload option */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Technologies Used <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-matcha-600">
                Icons resolve automatically or via upload
              </span>
            </div>

            {/* Input + Preview + Upload Button + Add Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1 flex items-center">
                <div className="absolute left-3 w-6 h-6 flex items-center justify-center shrink-0 pointer-events-none">
                  {customTechIcon || techInput.trim() ? (
                    <img
                      src={customTechIcon || resolveTechIconUrl(techInput, skills)}
                      alt="preview"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                      onLoad={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'block';
                      }}
                    />
                  ) : (
                    <Cpu className="w-4 h-4 text-matcha-600/50" />
                  )}
                </div>

                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTech();
                    }
                  }}
                  placeholder="Technology name (e.g. Docker, React, Terraform)..."
                  className="w-full pl-11 pr-4 py-2.5 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium text-sm"
                />
              </div>

              {/* Upload Icon option */}
              <label
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-2xl border transition cursor-pointer select-none ${
                  customTechIcon
                    ? 'bg-matcha-100 text-matcha-950 border-matcha-300'
                    : 'bg-beige-100 text-matcha-800 border-beige-300 hover:bg-beige-200'
                }`}
                title="Upload custom icon if not available"
              >
                {uploadingTechIcon ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-matcha-700" />
                ) : (
                  <ImagePlus className="w-4 h-4 text-matcha-700" />
                )}
                <span>{uploadingTechIcon ? 'Uploading...' : customTechIcon ? 'Icon Attached' : 'Upload Icon'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleTechIconUpload}
                  disabled={uploadingTechIcon}
                  className="sr-only"
                />
              </label>

              <button
                type="button"
                onClick={() => handleAddTech()}
                className="px-5 py-2.5 bg-matcha-900 text-beige-50 rounded-2xl font-bold text-xs hover:bg-matcha-800 transition cursor-pointer shrink-0"
              >
                Add Tech
              </button>
            </div>

            {errors.technologies && (
              <p className="text-xs text-red-600 font-medium">{errors.technologies.message}</p>
            )}

            {/* Selected tech badges with icons */}
            <div className="flex flex-wrap gap-2 pt-1 min-h-8">
              {watchTechs.map((t) => {
                const { name: techName, customIcon: itemIcon } = parseTechString(t);
                const iconUrl = itemIcon || resolveTechIconUrl(t, skills);

                return (
                  <span
                    key={t}
                    className="px-3 py-1.5 rounded-full bg-beige-100 border border-beige-300 text-matcha-950 text-xs flex items-center gap-2 font-mono font-bold shadow-2xs"
                  >
                    {iconUrl && (
                      <img
                        src={iconUrl}
                        alt={techName}
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span>{techName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(t)}
                      className="hover:text-red-700 ml-1 text-matcha-600 hover:scale-110 transition cursor-pointer font-extrabold"
                      title="Remove technology"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>

            {/* Quick Suggestions from existing Tech Stack */}
            {skills.length > 0 && (
              <div className="pt-2 border-t border-beige-200">
                <span className="text-[11px] font-bold text-matcha-700 uppercase tracking-wider block mb-2">
                  Quick Add from Tech Stack Library:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {skills
                    .filter((s) => s.name && !watchTechs.some((wt) => parseTechString(wt).name.toLowerCase() === s.name.toLowerCase()))
                    .slice(0, 16)
                    .map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleAddTech(skill.name, skill.icon)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-beige-200/70 hover:bg-matcha-100 hover:border-matcha-300 border border-beige-300 text-[11px] font-medium text-matcha-900 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-matcha-600" />
                        <span>{skill.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-matcha-900 text-beige-50 rounded-full font-extrabold text-xs hover:bg-matcha-800 disabled:opacity-50 cursor-pointer shadow-xs transition"
            >
              {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {isSubmitting ? 'Saving...' : editingProject ? 'Update Project' : 'Save Project'}
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
