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
