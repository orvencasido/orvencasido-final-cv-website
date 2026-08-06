import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, User, Globe, RefreshCw, Cpu, ArrowRight } from 'lucide-react';
import { profileSchema, ProfileFormData } from '../../../lib/schemas';
import { getProfile, updateProfile } from '../../../lib/services';
import { Profile } from '../../../types';
import { SectionHeader, LoadingSkeleton } from '../../../components/ui/CommonUI';
import { useToast } from '../../../components/ui/Toast';
import { ImageUploadField } from '../../../components/admin/ImageUploadField';
import { FileUploadField } from '../../../components/admin/FileUploadField';

export const HomeContentManager: React.FC = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const watchProfileImageUrl = watch('profile_image_url') || '';
  const watchResumeUrl = watch('resume_url') || '';

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProfile();
        setProfile(data);
        reset({
          full_name: data.full_name,
          professional_title: data.professional_title,
          introduction: data.introduction,
          profile_image_url: data.profile_image_url,
          resume_url: data.resume_url,
          email: data.email,
          phone: data.phone,
          location: data.location,
          availability_status: data.availability_status,
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const updated = await updateProfile({
        ...data,
        id: profile?.id || 'prof_1',
      });
      setProfile(updated);
      showToast('Profile content updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-8 max-w-4xl">
      <SectionHeader
        title="Home & Profile Management"
        description="Update your personal bio, job title, availability status, resume link, and social profiles live."
      />

      {/* Tech Stack Banner */}
      <div className="p-6 rounded-3xl bg-beige-50 border border-beige-300 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-matcha-100 text-matcha-900">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-matcha-950">
              Manage Tech Stack Icons
            </h4>
            <p className="text-xs text-matcha-700 font-medium">
              Add, edit, or re-order tech icons with hover effects and tooltips on the home page.
            </p>
          </div>
        </div>
        <Link
          to="/orven/dashboard/tech-stack"
          className="px-5 py-2.5 bg-matcha-900 text-beige-50 hover:bg-matcha-800 text-xs font-bold rounded-full transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          Manage Tech Icons <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-6 shadow-xs">
          <h2 className="text-lg font-extrabold text-matcha-950 flex items-center gap-2 border-b border-beige-200 pb-4">
            <User className="w-5 h-5 text-matcha-600" /> Basic Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Full Name
              </label>
              <input
                type="text"
                {...register('full_name')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
              {errors.full_name && (
                <p className="text-xs text-red-600 font-medium">{errors.full_name.message}</p>
              )}
            </div>

            {/* Professional Title */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Professional Title
              </label>
              <input
                type="text"
                {...register('professional_title')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
              {errors.professional_title && (
                <p className="text-xs text-red-600 font-medium">{errors.professional_title.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Availability Status */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Availability Status
              </label>
              <select
                {...register('availability_status')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              >
                <option value="available">Available for opportunities</option>
                <option value="open_to_offers">Open to offers</option>
                <option value="busy">Busy / On Contract</option>
                <option value="unavailable">Currently unavailable</option>
              </select>
            </div>

            <div className="space-y-2">
              <input type="hidden" {...register('profile_image_url')} />
              <ImageUploadField
                label="Profile Image"
                folder="profiles"
                value={watchProfileImageUrl}
                onChange={(url) => setValue('profile_image_url', url, { shouldValidate: true })}
                onError={(message) => showToast('Image upload failed', 'error', message)}
              />
            </div>
          </div>

          {/* Short Introduction */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
              Hero Introduction
            </label>
            <textarea
              rows={3}
              {...register('introduction')}
              className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 resize-none font-medium"
            />
            {errors.introduction && (
              <p className="text-xs text-red-600 font-medium">{errors.introduction.message}</p>
            )}
          </div>
        </div>

        {/* Contact & Links */}
        <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-6 shadow-xs">
          <h2 className="text-lg font-extrabold text-matcha-950 flex items-center gap-2 border-b border-beige-200 pb-4">
            <Globe className="w-5 h-5 text-matcha-600" /> Contact & Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Phone
              </label>
              <input
                type="text"
                {...register('phone')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <input type="hidden" {...register('resume_url')} />
            <FileUploadField
              label="Resume PDF"
              folder="resumes"
              value={watchResumeUrl}
              onChange={(url) => setValue('resume_url', url, { shouldValidate: true })}
              onError={(message) => showToast('Resume upload failed', 'error', message)}
            />
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 text-sm font-extrabold text-beige-50 bg-matcha-900 hover:bg-matcha-800 rounded-full shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
};
