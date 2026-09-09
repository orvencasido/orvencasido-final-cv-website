import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Settings, Database, Eye } from 'lucide-react';
import { siteSettingsSchema, SiteSettingsFormData } from '../../../lib/schemas';
import { getSiteSettings, updateSiteSettings } from '../../../lib/services';
import { isSupabaseConfigured } from '../../../lib/supabaseClient';
import { SectionHeader, LoadingSkeleton } from '../../../components/ui/CommonUI';
import { useToast } from '../../../components/ui/Toast';
import { PublicNavItem } from '../../../types';

const navVisibilityOptions: Array<{ id: PublicNavItem; label: string; path: string; locked?: boolean }> = [
  { id: 'home', label: 'Home', path: '/', locked: true },
  { id: 'blogs', label: 'Blogs', path: '/blogs' },
  { id: 'projects', label: 'Projects', path: '/projects' },
  { id: 'experience', label: 'Experience', path: '/experience' },
  { id: 'certifications', label: 'Certifications', path: '/certifications' },
  { id: 'education', label: 'Education', path: '/education' },
  { id: 'contact', label: 'Contact', path: '/contact' },
];

export const SiteSettingsManager: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
  });

  const visibleNavItems = watch('visible_nav_items') || [];

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSiteSettings();
        reset(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reset]);

  const onSubmit = async (data: SiteSettingsFormData) => {
    setSaving(true);
    try {
      await updateSiteSettings({
        ...data,
        visible_nav_items: Array.from(new Set(['home' as PublicNavItem, ...data.visible_nav_items])),
      });
      showToast('Site settings saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNavItem = (itemId: PublicNavItem) => {
    if (itemId === 'home') return;

    const nextItems = visibleNavItems.includes(itemId)
      ? visibleNavItems.filter((id) => id !== itemId)
      : [...visibleNavItems, itemId];

    setValue('visible_nav_items', Array.from(new Set(['home' as PublicNavItem, ...nextItems])), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  if (loading) return <LoadingSkeleton count={2} />;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Website Global Settings"
        description="Configure application metadata, SEO descriptions, analytics options, and view database connection status."
      />

      {/* Supabase Status Banner */}
      <div className="p-6 rounded-3xl border border-beige-300 bg-beige-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div
            className={`p-3 rounded-2xl text-beige-50 ${
              isSupabaseConfigured ? 'bg-matcha-900' : 'bg-amber-700'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-matcha-950 flex items-center gap-2">
              Database Mode:{' '}
              {isSupabaseConfigured ? (
                <span className="text-matcha-800">Supabase Connected</span>
              ) : (
                <span className="text-amber-800">Local Repository Mode</span>
              )}
            </h3>
            <p className="text-xs text-matcha-700 font-medium mt-0.5">
              {isSupabaseConfigured
                ? 'Your website is actively synchronizing data with live Supabase PostgreSQL tables.'
                : 'Running on local persistent storage repository. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable Supabase cloud DB.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-6 shadow-xs">
          <h2 className="text-lg font-extrabold text-matcha-950 flex items-center gap-2 border-b border-beige-200 pb-4">
            <Settings className="w-5 h-5 text-matcha-600" /> General SEO & Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Website Title
              </label>
              <input
                type="text"
                {...register('website_title')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
              {errors.website_title && (
                <p className="text-xs text-red-600 font-medium">{errors.website_title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Primary Contact Email
              </label>
              <input
                type="email"
                {...register('contact_email')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Navbar Initials Logo
              </label>
              <input
                type="text"
                {...register('logo_initials')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                SEO Keywords
              </label>
              <input
                type="text"
                {...register('seo_keywords')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
              Website Meta Description
            </label>
            <textarea
              rows={3}
              {...register('website_description')}
              className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 resize-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Footer Copyright Notice
              </label>
              <input
                type="text"
                {...register('footer_text')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Resume Download URL
              </label>
              <input
                type="text"
                {...register('resume_download_url')}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono text-xs font-medium"
              />
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-6 shadow-xs">
          <h2 className="text-lg font-extrabold text-matcha-950 flex items-center gap-2 border-b border-beige-200 pb-4">
            <Eye className="w-5 h-5 text-matcha-600" /> Public Header Visibility
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {navVisibilityOptions.map((item) => {
              const checked = item.locked || visibleNavItems.includes(item.id);

              return (
                <label
                  key={item.id}
                  className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition ${
                    checked
                      ? 'border-matcha-300 bg-matcha-100/70'
                      : 'border-beige-300 bg-beige-100'
                  } ${item.locked ? 'opacity-75' : 'cursor-pointer hover:border-matcha-400'}`}
                >
                  <span>
                    <span className="block text-sm font-extrabold text-matcha-950">{item.label}</span>
                    <span className="block text-[11px] font-mono font-semibold text-matcha-700">
                      {item.path}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={item.locked}
                    onChange={() => handleToggleNavItem(item.id)}
                    className="h-5 w-5 accent-matcha-900"
                  />
                </label>
              );
            })}
          </div>

          <p className="text-xs font-medium text-matcha-700">
            Hidden items are removed from the public header navigation. Home stays visible.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 text-sm font-extrabold text-beige-50 bg-matcha-900 hover:bg-matcha-800 rounded-full shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Global Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
