import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, Award, ExternalLink } from 'lucide-react';
import { certificationSchema, CertificationFormData } from '../../../lib/schemas';
import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
} from '../../../lib/services';
import { Certification } from '../../../types';
import { SectionHeader, LoadingSkeleton, EmptyState } from '../../../components/ui/CommonUI';
import { Modal, ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

export const CertificationManager: React.FC = () => {
  const { showToast } = useToast();
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      skills: [],
      sort_order: 1,
    },
  });

  const loadCerts = async () => {
    setLoading(true);
    try {
      const data = await getCertifications();
      setCerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCerts();
  }, []);

  const openCreateModal = () => {
    setEditingCert(null);
    reset({
      name: '',
      issuing_organization: 'Amazon Web Services',
      issue_date: '2024-01',
      expiration_date: '2027-01',
      credential_id: '',
      credential_url: 'https://aws.amazon.com',
      certificate_image_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800',
      description: '',
      skills: ['AWS', 'Cloud Security'],
      sort_order: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cert: Certification) => {
    setEditingCert(cert);
    reset({
      name: cert.name,
      issuing_organization: cert.issuing_organization,
      issue_date: cert.issue_date,
      expiration_date: cert.expiration_date,
      credential_id: cert.credential_id,
      credential_url: cert.credential_url,
      certificate_image_url: cert.certificate_image_url,
      description: cert.description,
      skills: cert.skills || [],
      sort_order: cert.sort_order,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CertificationFormData) => {
    try {
      if (editingCert) {
        await updateCertification(editingCert.id, data);
        showToast('Certification updated!', 'success');
      } else {
        await createCertification(data);
        showToast('New certification added!', 'success');
      }
      setIsModalOpen(false);
      loadCerts();
    } catch (err) {
      console.error(err);
      showToast('Failed to save certification', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCertification(deletingId);
      showToast('Certification removed', 'success');
      setDeletingId(null);
      loadCerts();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Certification Management"
        description="Manage official vendor badges, accreditation links, and expiration schedules."
        action={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Certification
          </button>
        }
      />

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : certs.length === 0 ? (
        <EmptyState title="No certifications" />
      ) : (
        <div className="space-y-4">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> {cert.name}
                </h3>
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {cert.issuing_organization} | ID: {cert.credential_id || 'N/A'}
                </p>
                <p className="text-xs text-zinc-500 font-mono">
                  Issued: {cert.issue_date} {cert.expiration_date ? `| Expires: ${cert.expiration_date}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => openEditModal(cert)}
                  className="p-2 text-zinc-500 hover:text-sky-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(cert.id)}
                  className="p-2 text-zinc-500 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCert ? 'Edit Certification' : 'Add Certification'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Certification Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-700 dark:text-zinc-300">Issuing Organization</label>
            <input
              type="text"
              {...register('issuing_organization')}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            />
            {errors.issuing_organization && (
              <p className="text-xs text-red-500">{errors.issuing_organization.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Issue Date</label>
              <input
                type="text"
                placeholder="2024-05"
                {...register('issue_date')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Expiration Date</label>
              <input
                type="text"
                placeholder="2027-05"
                {...register('expiration_date')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Credential ID</label>
              <input
                type="text"
                {...register('credential_id')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 dark:text-zinc-300">Verification URL</label>
              <input
                type="text"
                {...register('credential_url')}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs"
              />
            </div>
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
              Save Certification
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Certification"
        message="Are you sure you want to delete this certification record?"
      />
    </div>
  );
};
