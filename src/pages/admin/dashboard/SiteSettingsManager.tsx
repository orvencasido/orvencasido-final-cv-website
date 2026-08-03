import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Settings, Database } from 'lucide-react';
import { siteSettingsSchema, SiteSettingsFormData } from '../../../lib/schemas';
import { getSiteSettings, updateSiteSettings } from '../../../lib/services';
import { isSupabaseConfigured } from '../../../lib/supabaseClient';
import { SectionHeader, LoadingSkeleton } from '../../../components/ui/CommonUI';
import { useToast } from '../../../components/ui/Toast';

export const SiteSettingsManager: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
  });

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
      await updateSiteSettings(data);
      showToast('Site settings saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton count={2} />;

  return (
    <div className="space-y-8 max-w-4xl">
      <SectionHeader
        title="Website Global Settings"
        description="Configure application metadata, SEO descriptions, analytics options, and view database connection status."
      />

      {/* Supabase Status Banner */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl text-white ${
              isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Database Mode:{' '}
              {isSupabaseConfigured ? (
                <span className="text-emerald-500">Supabase Connected</span>
              ) : (
                <span className="text-amber-500">Local Repository Mode</span>
              )}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isSupabaseConfigured
                ? 'Your website is actively synchronizing data with live Supabase PostgreSQL tables.'
                : 'Running on local persistent storage repository. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable Supabase cloud DB.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-6 shadow-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Settings className="w-4 h-4 text-emerald-500" /> General SEO & Branding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Website Title
              </label>
              <input
                type="text"
                {...register('website_title')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
              {errors.website_title && (
                <p className="text-xs text-red-500">{errors.website_title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Primary Contact Email
              </label>
              <input
                type="email"
                {...register('contact_email')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Navbar Initials Logo
              </label>
              <input
                type="text"
                {...register('logo_initials')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                SEO Keywords
              </label>
              <input
                type="text"
                {...register('seo_keywords')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Website Meta Description
            </label>
            <textarea
              rows={3}
              {...register('website_description')}
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Footer Copyright Notice
              </label>
              <input
                type="text"
                {...register('footer_text')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Resume Download URL
              </label>
              <input
                type="text"
                {...register('resume_download_url')}
                className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Global Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
