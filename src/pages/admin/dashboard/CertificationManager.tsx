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
import { ImageUploadField } from '../../../components/admin/ImageUploadField';

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      skills: [],
      sort_order: 1,
    },
  });

  const watchCertificateImageUrl = watch('certificate_image_url') || '';

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
      certificate_image_url: '',
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
            className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-extrabold text-beige-50 bg-matcha-900 rounded-full hover:bg-matcha-800 transition shadow-xs cursor-pointer"
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
              className="p-6 rounded-3xl border border-beige-300 bg-beige-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-matcha-950 flex items-center gap-2">
                  <Award className="w-4 h-4 text-matcha-600" /> {cert.name}
                </h3>
                <p className="text-xs font-bold text-matcha-800">
                  {cert.issuing_organization} | ID: {cert.credential_id || 'N/A'}
                </p>
                <p className="text-xs text-matcha-600 font-mono font-medium">
                  Issued: {cert.issue_date} {cert.expiration_date ? `| Expires: ${cert.expiration_date}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 text-matcha-700 hover:text-matcha-950 rounded-2xl hover:bg-beige-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => openEditModal(cert)}
                  className="p-2.5 text-matcha-700 hover:text-matcha-950 rounded-2xl hover:bg-beige-200 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(cert.id)}
                  className="p-2.5 text-matcha-700 hover:text-red-700 rounded-2xl hover:bg-beige-200 cursor-pointer"
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs sm:text-sm">
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Certification Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
            {errors.name && <p className="text-xs text-red-600 font-medium">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Issuing Organization</label>
            <input
              type="text"
              {...register('issuing_organization')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
            {errors.issuing_organization && (
              <p className="text-xs text-red-600 font-medium">{errors.issuing_organization.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Issue Date</label>
              <input
                type="text"
                placeholder="2024-05"
                {...register('issue_date')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Expiration Date</label>
              <input
                type="text"
                placeholder="2027-05"
                {...register('expiration_date')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Credential ID</label>
              <input
                type="text"
                {...register('credential_id')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Verification URL</label>
              <input
                type="text"
                {...register('credential_url')}
                className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">Description</label>
            <textarea
              rows={2}
              {...register('description')}
              className="w-full px-4 py-3 bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
            />
          </div>

          <input type="hidden" {...register('certificate_image_url')} />
          <ImageUploadField
            label="Certificate Image"
            folder="certifications"
            value={watchCertificateImageUrl}
            onChange={(url) => setValue('certificate_image_url', url, { shouldValidate: true })}
            onError={(message) => showToast('Image upload failed', 'error', message)}
          />

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
