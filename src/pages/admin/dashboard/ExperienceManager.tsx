import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-extrabold text-beige-50 bg-matcha-900 rounded-full hover:bg-matcha-800 transition shadow-xs cursor-pointer"
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
              className="p-6 rounded-3xl border border-beige-300 bg-beige-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-extrabold text-matcha-950">
                    {exp.position}
                  </h3>
                  {exp.is_current && (
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-matcha-100 text-matcha-900 font-mono">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-matcha-800">
                  {exp.company} • {exp.employment_type} ({exp.location})
                </p>
                <p className="text-xs text-matcha-600 font-mono font-medium">
                  {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(exp)}
                  className="p-2.5 text-matcha-700 hover:text-matcha-950 rounded-2xl hover:bg-beige-200 cursor-pointer transition"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(exp.id)}
                  className="p-2.5 text-matcha-700 hover:text-red-700 rounded-2xl hover:bg-beige-200 cursor-pointer transition"
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Company Name</label>
              <input
                type="text"
                {...register('company')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
              {errors.company && <p className="text-xs text-red-600 font-medium">{errors.company.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Position Title</label>
              <input
                type="text"
                {...register('position')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
              {errors.position && <p className="text-xs text-red-600 font-medium">{errors.position.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Employment Type</label>
              <select
                {...register('employment_type')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Start Date</label>
              <input
                type="text"
                placeholder="2023-04"
                {...register('start_date')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">End Date</label>
              <input
                type="text"
                placeholder="2024-05"
                {...register('end_date')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="is_current_check"
              {...register('is_current')}
              className="w-4 h-4 rounded text-matcha-900 focus:ring-matcha-500"
            />
            <label htmlFor="is_current_check" className="font-bold text-xs text-matcha-950 cursor-pointer">
              I currently work in this role
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Location</label>
            <input
              type="text"
              {...register('location')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Short Description</label>
            <textarea
              rows={2}
              {...register('description')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
          </div>

          {/* Key Responsibilities */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Key Responsibilities</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={respInput}
                onChange={(e) => setRespInput(e.target.value)}
                placeholder="Add responsibility item..."
                className="flex-1 px-4 py-2.5 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 font-medium"
              />
              <button
                type="button"
                onClick={handleAddResp}
                className="px-5 py-2.5 bg-matcha-900 text-beige-50 rounded-full text-xs font-bold hover:bg-matcha-800 cursor-pointer"
              >
                Add Item
              </button>
            </div>
            <ul className="space-y-1.5 pt-2">
              {watchResps.map((resp, i) => (
                <li key={i} className="flex items-center justify-between text-xs p-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 font-medium">
                  <span>• {resp}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'responsibilities',
                        watchResps.filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-red-600 font-extrabold ml-2 cursor-pointer"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
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
