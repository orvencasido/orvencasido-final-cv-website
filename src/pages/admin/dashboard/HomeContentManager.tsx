import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, User, Globe, Shield, RefreshCw, Cpu, ArrowRight } from 'lucide-react';
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
      <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Manage Tech Stack Icons
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add, edit, or re-order tech icons with hover effects and tooltips on the home page.
            </p>
          </div>
        </div>
        <Link
          to="/orven/dashboard/tech-stack"
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
        >
          Manage Tech Icons <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <User className="w-4 h-4 text-emerald-500" /> Basic Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                {...register('full_name')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
              {errors.full_name && (
                <p className="text-xs text-red-500">{errors.full_name.message}</p>
              )}
            </div>

            {/* Professional Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Professional Title
              </label>
              <input
                type="text"
                {...register('professional_title')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
              {errors.professional_title && (
                <p className="text-xs text-red-500">{errors.professional_title.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Availability Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Availability Status
              </label>
              <select
                {...register('availability_status')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="available">Available for opportunities</option>
                <option value="open_to_offers">Open to offers</option>
                <option value="busy">Busy / On Contract</option>
                <option value="unavailable">Currently unavailable</option>
              </select>
            </div>

            <div className="space-y-1.5">
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
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Hero Introduction
            </label>
            <textarea
              rows={2}
              {...register('introduction')}
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
            />
            {errors.introduction && (
              <p className="text-xs text-red-500">{errors.introduction.message}</p>
            )}
          </div>

        </div>

        {/* Contact & Links */}
        <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Globe className="w-4 h-4 text-sky-500" /> Contact & Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Phone
              </label>
              <input
                type="text"
                {...register('phone')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
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
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
};
