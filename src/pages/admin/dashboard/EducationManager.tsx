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
      degree: '',
      field_of_study: '',
      location: '',
      start_date: '',
      end_date: '',
      gpa: '',
      description: '',
      coursework: [],
      awards: [],
      activities: [],
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
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-extrabold text-beige-50 bg-matcha-900 rounded-full hover:bg-matcha-800 transition shadow-xs cursor-pointer"
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
              className="p-6 rounded-3xl border border-beige-300 bg-beige-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-matcha-950 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-matcha-600" /> {edu.degree} in {edu.field_of_study}
                </h3>
                <p className="text-xs font-bold text-matcha-800">
                  {edu.school} • {edu.location}
                </p>
                <p className="text-xs text-matcha-600 font-mono font-medium">
                  {edu.start_date} — {edu.end_date} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(edu)}
                  className="p-2.5 text-matcha-700 hover:text-matcha-950 rounded-2xl hover:bg-beige-200 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(edu.id)}
                  className="p-2.5 text-matcha-700 hover:text-red-700 rounded-2xl hover:bg-beige-200 cursor-pointer"
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs sm:text-sm">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">University / Institution</label>
            <input
              type="text"
              {...register('school')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
            {errors.school && <p className="text-xs text-red-600 font-medium">{errors.school.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Degree</label>
              <input
                type="text"
                {...register('degree')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Field of Study</label>
              <input
                type="text"
                {...register('field_of_study')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Start Date</label>
              <input
                type="text"
                placeholder="2019"
                {...register('start_date')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">End Date</label>
              <input
                type="text"
                placeholder="2023"
                {...register('end_date')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">GPA (Optional)</label>
              <input
                type="text"
                placeholder="3.8/4.0"
                {...register('gpa')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
            </div>
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
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Description</label>
            <textarea
              rows={2}
              {...register('description')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
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
