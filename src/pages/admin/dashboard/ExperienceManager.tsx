import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, Briefcase, Calendar, MapPin } from 'lucide-react';
import { experienceSchema, ExperienceFormData } from '../../../lib/schemas';
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../../../lib/services';
import { Experience } from '../../../types';
import { SectionHeader, LoadingSkeleton, EmptyState } from '../../../components/ui/CommonUI';
import { Modal, ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export const ExperienceManager: React.FC = () => {
  const { showToast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [respInput, setRespInput] = useState('');
  const [achieveInput, setAchieveInput] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      responsibilities: [],
      achievements: [],
      technologies: [],
      is_current: false,
      employment_type: 'Full-time',
    },
  });

  const watchResps = watch('responsibilities') || [];
  const watchAchs = watch('achievements') || [];

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getExperiences();
      setExperiences(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingExp(null);
    reset({
      company: '',
      position: '',
      employment_type: 'Full-time',
      location: '',
      start_date: '',
      end_date: null,
      is_current: true,
      description: '',
      responsibilities: [],
      achievements: [],
      technologies: [],
      sort_order: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Experience) => {
    setEditingExp(exp);
    reset({
      company: exp.company,
      position: exp.position,
      employment_type: exp.employment_type,
      location: exp.location,
      start_date: exp.start_date,
      end_date: exp.end_date,
      is_current: exp.is_current,
      description: exp.description,
      responsibilities: exp.responsibilities || [],
      achievements: exp.achievements || [],
      technologies: exp.technologies || [],
      sort_order: exp.sort_order,
    });
    setIsModalOpen(true);
  };

  const handleAddResp = () => {
    if (respInput.trim()) {
      setValue('responsibilities', [...watchResps, respInput.trim()]);
      setRespInput('');
    }
  };

  const handleAddAchieve = () => {
    if (achieveInput.trim()) {
      setValue('achievements', [...watchAchs, achieveInput.trim()]);
      setAchieveInput('');
    }
  };

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      if (editingExp) {
        await updateExperience(editingExp.id, data);
        showToast('Experience updated!', 'success');
      } else {
        await createExperience(data);
        showToast('New experience added!', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error saving experience', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteExperience(deletingId);
      showToast('Experience deleted', 'success');
      setDeletingId(null);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Experience Management"
        description="Add, edit, or reorder your employment history and key platform accomplishments."
        action={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        }
      />

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : experiences.length === 0 ? (
        <EmptyState title="No experience records" />
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {exp.position}
                  </h3>
                  {exp.is_current && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {exp.company} • {exp.employment_type} ({exp.location})
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(exp)}
                  className="p-2 text-zinc-500 hover:text-sky-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(exp.id)}
                  className="p-2 text-zinc-500 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Experience Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExp ? 'Edit Experience' : 'Add Experience'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Company Name</label>
              <input
                type="text"
                {...register('company')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
              {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Position Title</label>
              <input
                type="text"
                {...register('position')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
              {errors.position && <p className="text-xs text-red-500">{errors.position.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Employment Type</label>
              <select
                {...register('employment_type')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Start Date</label>
              <input
                type="text"
                placeholder="2023-04"
                {...register('start_date')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">End Date</label>
              <input
                type="text"
                placeholder="2024-05"
                {...register('end_date')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current_check"
              {...register('is_current')}
              className="rounded"
            />
            <label htmlFor="is_current_check" className="font-medium text-zinc-700 dark:text-zinc-300">
              I currently work in this role
            </label>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Location</label>
            <input
              type="text"
              {...register('location')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Short Description</label>
            <textarea
              rows={2}
              {...register('description')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          {/* Key Responsibilities */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Key Responsibilities</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={respInput}
                onChange={(e) => setRespInput(e.target.value)}
                placeholder="Add responsibility item..."
                className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddResp}
                className="px-3 py-1.5 bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 rounded-xl text-xs font-semibold"
              >
                Add Item
              </button>
            </div>
            <ul className="space-y-1 pt-1">
              {watchResps.map((resp, i) => (
                <li key={i} className="flex items-center justify-between text-xs p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <span>• {resp}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'responsibilities',
                        watchResps.filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-red-500 font-bold ml-2"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
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
              Save Experience
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Experience Record"
        message="Are you sure you want to delete this position record?"
      />
    </div>
  );
};
