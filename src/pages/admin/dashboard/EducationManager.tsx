import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { educationSchema, EducationFormData } from '../../../lib/schemas';
import {
  getEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} from '../../../lib/services';
import { Education } from '../../../types';
import { SectionHeader, LoadingSkeleton, EmptyState } from '../../../components/ui/CommonUI';
import { Modal, ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export const EducationManager: React.FC = () => {
  const { showToast } = useToast();
  const [eduList, setEduList] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      coursework: [],
      awards: [],
      activities: [],
      sort_order: 1,
    },
  });

  const loadEdu = async () => {
    setLoading(true);
    try {
      const data = await getEducation();
      setEduList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEdu();
  }, []);

  const openCreateModal = () => {
    setEditingEdu(null);
    reset({
      school: '',
      degree: 'Bachelor of Science',
      field_of_study: 'Computer Science',
      location: 'San Francisco, CA',
      start_date: '2019',
      end_date: '2023',
      gpa: '3.8/4.0',
      description: '',
      coursework: ['Distributed Systems', 'Cloud Architectures', 'Operating Systems'],
      awards: ['Dean\'s Honor List'],
      activities: ['ACM Chapter Officer'],
      sort_order: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (edu: Education) => {
    setEditingEdu(edu);
    reset({
      school: edu.school,
      degree: edu.degree,
      field_of_study: edu.field_of_study,
      location: edu.location,
      start_date: edu.start_date,
      end_date: edu.end_date,
      gpa: edu.gpa,
      description: edu.description,
      coursework: edu.coursework || [],
      awards: edu.awards || [],
      activities: edu.activities || [],
      sort_order: edu.sort_order,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: EducationFormData) => {
    try {
      if (editingEdu) {
        await updateEducation(editingEdu.id, data);
        showToast('Education updated!', 'success');
      } else {
        await createEducation(data);
        showToast('Education record added!', 'success');
      }
      setIsModalOpen(false);
      loadEdu();
    } catch (err) {
      console.error(err);
      showToast('Error saving education record', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteEducation(deletingId);
      showToast('Education record deleted', 'success');
      setDeletingId(null);
      loadEdu();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Education Management"
        description="Manage university degrees, honors, and coursework history."
        action={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Education
          </button>
        }
      />

      {loading ? (
        <LoadingSkeleton count={2} />
      ) : eduList.length === 0 ? (
        <EmptyState title="No education records" />
      ) : (
        <div className="space-y-4">
          {eduList.map((edu) => (
            <div
              key={edu.id}
              className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-500" /> {edu.degree} in {edu.field_of_study}
                </h3>
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {edu.school} • {edu.location}
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  {edu.start_date} — {edu.end_date} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(edu)}
                  className="p-2 text-zinc-500 hover:text-sky-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(edu.id)}
                  className="p-2 text-zinc-500 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEdu ? 'Edit Education' : 'Add Education'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">University / Institution</label>
            <input
              type="text"
              {...register('school')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
            {errors.school && <p className="text-xs text-red-500">{errors.school.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Degree</label>
              <input
                type="text"
                {...register('degree')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Field of Study</label>
              <input
                type="text"
                {...register('field_of_study')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Start Date</label>
              <input
                type="text"
                placeholder="2019"
                {...register('start_date')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">End Date</label>
              <input
                type="text"
                placeholder="2023"
                {...register('end_date')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">GPA (Optional)</label>
              <input
                type="text"
                placeholder="3.8/4.0"
                {...register('gpa')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
            </div>
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
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
            <textarea
              rows={2}
              {...register('description')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
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
              Save Education
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Education Record"
        message="Are you sure you want to delete this education entry?"
      />
    </div>
  );
};
