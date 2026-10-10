import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, User, Globe, RefreshCw, Eye } from 'lucide-react';
import { profileSchema, ProfileFormData } from '../../../lib/schemas';
import { getProfile, updateProfile, getSiteSettings, updateSiteSettings } from '../../../lib/services';
import { Profile } from '../../../types';
import { SectionHeader, LoadingSkeleton } from '../../../components/ui/CommonUI';
import { useToast } from '../../../components/ui/Toast';
import { ImageUploadField } from '../../../components/admin/ImageUploadField';
import { FileUploadField } from '../../../components/admin/FileUploadField';

export const HomeContentManager: React.FC = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showFeaturedProjects, setShowFeaturedProjects] = useState(true);
  const [showFeaturedBlogs, setShowFeaturedBlogs] = useState(true);
  const [showContactCta, setShowContactCta] = useState(true);
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
        const [data, settings] = await Promise.all([getProfile(), getSiteSettings()]);
        setProfile(data);
        setShowFeaturedProjects(settings.show_featured_projects !== false);
        setShowFeaturedBlogs(settings.show_featured_blogs !== false);
        setShowContactCta(settings.show_contact_cta !== false);
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
      const [updated] = await Promise.all([
        updateProfile({
          ...data,
          id: profile?.id || 'prof_1',
        }),
        updateSiteSettings({
          show_featured_projects: showFeaturedProjects,
          show_featured_blogs: showFeaturedBlogs,
          show_contact_cta: showContactCta,
        }),
      ]);
      setProfile(updated);
      showToast('Home content and section visibility saved successfully!', 'success');
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      const message = err instanceof Error ? err.message : 'Failed to update home content.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-8">
      <SectionHeader title="Home & Profile Management" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="p-6 sm:p-8 rounded-3xl border border-beige-200 bg-beige-50 space-y-6 shadow-2xs">
          <h2 className="text-base sm:text-lg font-bold text-matcha-950 flex items-center gap-2 border-b border-beige-200 pb-4">
            <User className="w-5 h-5 text-matcha-600" /> Basic Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-matcha-900">
                Full Name
              </label>
              <input
                type="text"
                {...register('full_name')}
                className="w-full px-4 py-3 text-sm bg-beige-100/70 border border-beige-200 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium transition"
              />
              {errors.full_name && (
                <p className="text-xs text-red-600 font-medium">{errors.full_name.message}</p>
              )}
            </div>

            {/* Professional Title */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-matcha-900">
                Professional Title
              </label>
              <input
                type="text"
                {...register('professional_title')}
                className="w-full px-4 py-3 text-sm bg-beige-100/70 border border-beige-200 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium transition"
              />
              {errors.professional_title && (
                <p className="text-xs text-red-600 font-medium">{errors.professional_title.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Availability Status */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-matcha-900">
                Availability Status
              </label>
              <select
                {...register('availability_status')}
                className="w-full px-4 py-3 text-sm bg-beige-100/70 border border-beige-200 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium transition"
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
            <label className="text-xs font-semibold text-matcha-900">
              Hero Introduction
            </label>
            <textarea
              rows={3}
              {...register('introduction')}
              className="w-full px-4 py-3 text-sm bg-beige-100/70 border border-beige-200 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 resize-none font-medium transition"
            />
            {errors.introduction && (
              <p className="text-xs text-red-600 font-medium">{errors.introduction.message}</p>
            )}
          </div>
        </div>

        {/* Contact & Links */}
        <div className="p-6 sm:p-8 rounded-3xl border border-beige-200 bg-beige-50 space-y-6 shadow-2xs">
          <h2 className="text-base sm:text-lg font-bold text-matcha-950 flex items-center gap-2 border-b border-beige-200 pb-4">
            <Globe className="w-5 h-5 text-matcha-600" /> Contact & Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-matcha-900">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 text-sm bg-beige-100/70 border border-beige-200 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-matcha-900">
                Phone
              </label>
              <input
                type="text"
                {...register('phone')}
                className="w-full px-4 py-3 text-sm bg-beige-100/70 border border-beige-200 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-matcha-900">
                Location
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-4 py-3 text-sm bg-beige-100/70 border border-beige-200 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium transition"
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

        {/* Homepage Sections Visibility */}
        <div className="p-6 sm:p-8 rounded-3xl border border-beige-200 bg-beige-50 space-y-6 shadow-2xs">
          <div className="border-b border-beige-200 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-matcha-950 flex items-center gap-2">
              <Eye className="w-5 h-5 text-matcha-600" /> Homepage Sections Visibility
            </h2>
            <p className="text-xs text-matcha-700 font-normal mt-1">
              Configure visible content sections on the public home page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Highlighted Projects Toggle */}
            <div
              onClick={() => setShowFeaturedProjects(!showFeaturedProjects)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                showFeaturedProjects
                  ? 'border-matcha-300 bg-matcha-50/70 shadow-2xs'
                  : 'border-beige-200 bg-beige-100/50'
              }`}
            >
              <div className="space-y-1">
                <span className="block text-sm font-bold text-matcha-950">
                  Shipped Projects
                </span>
                <span className="block text-xs font-normal text-matcha-700">
                  Featured projects showcase section
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showFeaturedProjects}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFeaturedProjects(!showFeaturedProjects);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showFeaturedProjects ? 'bg-matcha-800' : 'bg-beige-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showFeaturedProjects ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Highlighted Blogs Toggle */}
            <div
              onClick={() => setShowFeaturedBlogs(!showFeaturedBlogs)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                showFeaturedBlogs
                  ? 'border-matcha-300 bg-matcha-50/70 shadow-2xs'
                  : 'border-beige-200 bg-beige-100/50'
              }`}
            >
              <div className="space-y-1">
                <span className="block text-sm font-bold text-matcha-950">
                  Latest Articles
                </span>
                <span className="block text-xs font-normal text-matcha-700">
                  Engineering highlights and articles
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showFeaturedBlogs}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFeaturedBlogs(!showFeaturedBlogs);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showFeaturedBlogs ? 'bg-matcha-800' : 'bg-beige-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showFeaturedBlogs ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Contact Redirection CTA Toggle */}
            <div
              onClick={() => setShowContactCta(!showContactCta)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                showContactCta
                  ? 'border-matcha-300 bg-matcha-50/70 shadow-2xs'
                  : 'border-beige-200 bg-beige-100/50'
              }`}
            >
              <div className="space-y-1">
                <span className="block text-sm font-bold text-matcha-950">
                  Contact CTA Banner
                </span>
                <span className="block text-xs font-normal text-matcha-700">
                  Collaboration invitation banner
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showContactCta}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContactCta(!showContactCta);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showContactCta ? 'bg-matcha-800' : 'bg-beige-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showContactCta ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 text-sm font-bold text-beige-50 bg-matcha-900 hover:bg-matcha-800 rounded-full shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Home & Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
};
