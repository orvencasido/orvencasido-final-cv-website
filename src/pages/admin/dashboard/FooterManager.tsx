import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Edit2,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  defaultPublicNavItems,
  getSiteSettings,
  getSocialLinks,
  updateSiteSettings,
  updateSocialLinks,
} from '../../../lib/services';
import { PublicNavItem, SiteSettings, SocialLink } from '../../../types';
import { SectionHeader, LoadingSkeleton, EmptyState } from '../../../components/ui/CommonUI';
import { ConfirmModal } from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';

const nowIso = () => new Date().toISOString();

const navVisibilityOptions: Array<{ id: PublicNavItem; label: string; path: string; locked?: boolean }> = [
  { id: 'home', label: 'Home', path: '/', locked: true },
  { id: 'blogs', label: 'Blogs', path: '/blogs' },
  { id: 'projects', label: 'Projects', path: '/projects' },
  { id: 'experience', label: 'Experience', path: '/experience' },
  { id: 'certifications', label: 'Certifications', path: '/certifications' },
  { id: 'education', label: 'Education', path: '/education' },
  { id: 'contact', label: 'Contact', path: '/contact' },
];

const createEmptyLink = (sortOrder: number): SocialLink => ({
  id: `soc_${Date.now()}`,
  platform: '',
  label: '',
  url: '',
  icon: '',
  sort_order: sortOrder,
  is_visible: true,
  created_at: nowIso(),
  updated_at: nowIso(),
});

export const FooterManager: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [footerText, setFooterText] = useState('');
  const [visibleNavItems, setVisibleNavItems] = useState<PublicNavItem[]>(defaultPublicNavItems);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [draftLink, setDraftLink] = useState<SocialLink>(() => createEmptyLink(1));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadFooterData() {
      try {
        const [siteSettings, socialLinks] = await Promise.all([getSiteSettings(), getSocialLinks()]);
        setSettings(siteSettings);
        setFooterText(siteSettings.footer_text || '');
        setVisibleNavItems(siteSettings.visible_nav_items?.length ? siteSettings.visible_nav_items : defaultPublicNavItems);
        setLinks(socialLinks.sort((a, b) => a.sort_order - b.sort_order));
      } catch (err) {
        console.error('Failed to load footer data:', err);
        showToast('Failed to load footer data', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadFooterData();
  }, [showToast]);

  const resetDraft = () => {
    setEditingId(null);
    setDraftLink(createEmptyLink(links.length + 1));
  };

  const updateDraftField = <K extends keyof SocialLink>(key: K, value: SocialLink[K]) => {
    setDraftLink((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const normalizeLinks = (items: SocialLink[]) =>
    items.map((link, index) => ({
      ...link,
      sort_order: index + 1,
      updated_at: nowIso(),
    }));

  const handleSubmitLink = (event: React.FormEvent) => {
    event.preventDefault();

    const platform = draftLink.platform.trim();
    const label = draftLink.label.trim() || platform;
    const url = draftLink.url.trim();
    const icon = draftLink.icon.trim() || platform.toLowerCase();

    if (!platform || !url) {
      showToast('Platform and URL are required', 'error');
      return;
    }

    const nextLink: SocialLink = {
      ...draftLink,
      platform,
      label,
      url,
      icon,
      updated_at: nowIso(),
    };

    if (editingId) {
      setLinks((current) =>
        normalizeLinks(current.map((link) => (link.id === editingId ? nextLink : link)))
      );
      showToast('Footer link updated. Save changes to publish it.', 'info');
    } else {
      setLinks((current) => normalizeLinks([...current, nextLink]));
      showToast('Footer link added. Save changes to publish it.', 'info');
    }

    setEditingId(null);
    setDraftLink(createEmptyLink(links.length + 2));
  };

  const startEdit = (link: SocialLink) => {
    setEditingId(link.id);
    setDraftLink(link);
  };

  const toggleVisibility = (id: string) => {
    setLinks((current) =>
      current.map((link) =>
        link.id === id ? { ...link, is_visible: !link.is_visible, updated_at: nowIso() } : link
      )
    );
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === links.length - 1)) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const nextLinks = [...links];
    const [moved] = nextLinks.splice(index, 1);
    nextLinks.splice(targetIndex, 0, moved);
    setLinks(normalizeLinks(nextLinks));
  };

  const handleToggleNavItem = (itemId: PublicNavItem) => {
    if (itemId === 'home') return;

    const nextItems = visibleNavItems.includes(itemId)
      ? visibleNavItems.filter((id) => id !== itemId)
      : [...visibleNavItems, itemId];

    setVisibleNavItems(Array.from(new Set(['home' as PublicNavItem, ...nextItems])));
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    setLinks((current) => normalizeLinks(current.filter((link) => link.id !== deletingId)));
    if (editingId === deletingId) resetDraft();
    setDeletingId(null);
    showToast('Footer link removed. Save changes to publish it.', 'info');
  };

  const handleSaveFooter = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateSiteSettings({
          id: settings?.id || 'settings_1',
          footer_text: footerText,
          visible_nav_items: Array.from(new Set(['home' as PublicNavItem, ...visibleNavItems])),
        }),
        updateSocialLinks(normalizeLinks(links)),
      ]);
      showToast('Footer settings saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save footer settings:', err);
      const message = err instanceof Error ? err.message : 'Failed to save footer settings.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Footer Management"
        description="Control the public footer copyright text, social links, ordering, and visibility."
      />

      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 space-y-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-beige-200 pb-4">
          <Save className="w-5 h-5 text-matcha-600" />
          <h2 className="text-lg font-extrabold text-matcha-950">Footer Copy</h2>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
            Copyright / Footer Text
          </label>
          <input
            type="text"
            value={footerText}
            onChange={(event) => setFooterText(event.target.value)}
            className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
          />
        </div>
      </div>

      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 shadow-xs space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-beige-200 pb-4">
          <h2 className="text-lg font-extrabold text-matcha-950 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-matcha-600" />
            {editingId ? 'Edit Social Link' : 'Add Social Link'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center gap-1 text-xs font-bold text-matcha-700 hover:text-matcha-950 cursor-pointer"
            >
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmitLink} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Platform
              </label>
              <input
                type="text"
                placeholder="LinkedIn"
                value={draftLink.platform}
                onChange={(event) => updateDraftField('platform', event.target.value)}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Label
              </label>
              <input
                type="text"
                placeholder="LinkedIn"
                value={draftLink.label}
                onChange={(event) => updateDraftField('label', event.target.value)}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-medium"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                URL
              </label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/..."
                value={draftLink.url}
                onChange={(event) => updateDraftField('url', event.target.value)}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div className="space-y-2 w-full sm:max-w-xs">
              <label className="text-xs font-extrabold uppercase tracking-wider text-matcha-900">
                Icon Keyword
              </label>
              <input
                type="text"
                placeholder="mail, github, linkedin"
                value={draftLink.icon}
                onChange={(event) => updateDraftField('icon', event.target.value)}
                className="w-full px-4 py-3 text-sm bg-beige-100 border border-beige-300 rounded-2xl text-matcha-950 focus:outline-none focus:ring-2 focus:ring-matcha-500 font-mono font-medium"
              />
            </div>

            <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-bold text-matcha-900">
              <input
                type="checkbox"
                checked={draftLink.is_visible}
                onChange={(event) => updateDraftField('is_visible', event.target.checked)}
                className="w-4 h-4 rounded text-matcha-900 focus:ring-matcha-500"
              />
              Show in public footer
            </label>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-matcha-900 text-beige-50 text-xs font-extrabold rounded-full hover:bg-matcha-800 transition shadow-xs cursor-pointer"
            >
              {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Update Link' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>

      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 shadow-xs space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-beige-200 pb-4">
          <h3 className="text-lg font-extrabold text-matcha-950">
            Footer Social Links ({links.length})
          </h3>
          <p className="text-xs text-matcha-700 font-medium">Order here matches the public footer.</p>
        </div>

        {links.length === 0 ? (
          <EmptyState title="No footer social links" description="Add a link above, then save the footer." />
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => (
              <div
                key={link.id}
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  link.is_visible
                    ? 'border-beige-300 bg-beige-100'
                    : 'border-beige-300 bg-beige-200/70 opacity-70'
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-matcha-600">#{index + 1}</span>
                    <h4 className="text-sm font-extrabold text-matcha-950 truncate">
                      {link.label || link.platform}
                    </h4>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-matcha-100 text-matcha-900">
                      {link.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-matcha-700 truncate">{link.url}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveLink(index, 'up')}
                    disabled={index === 0}
                    className="p-2 text-matcha-700 hover:text-matcha-950 disabled:opacity-20 rounded-xl hover:bg-beige-200 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLink(index, 'down')}
                    disabled={index === links.length - 1}
                    className="p-2 text-matcha-700 hover:text-matcha-950 disabled:opacity-20 rounded-xl hover:bg-beige-200 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(link.id)}
                    className="p-2 text-matcha-700 hover:text-matcha-950 rounded-xl hover:bg-beige-200 cursor-pointer"
                    title={link.is_visible ? 'Hide from footer' : 'Show in footer'}
                  >
                    {link.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(link)}
                    className="p-2 text-matcha-700 hover:text-matcha-950 rounded-xl hover:bg-beige-200 cursor-pointer"
                    title="Edit link"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(link.id)}
                    className="p-2 text-matcha-700 hover:text-red-700 rounded-xl hover:bg-beige-200 cursor-pointer"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-beige-200 pb-4">
          <Eye className="w-5 h-5 text-matcha-600" />
          <h2 className="text-lg font-extrabold text-matcha-950">Footer Navigation Links</h2>
        </div>

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
          These links use the same visibility setting as the public header, so hiding a page removes it from both areas.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveFooter}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-extrabold text-beige-50 bg-matcha-900 hover:bg-matcha-800 rounded-full shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving Footer...' : 'Save Footer Changes'}
        </button>
      </div>

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Delete Footer Link"
        message="Are you sure you want to remove this social link from the footer?"
      />
    </div>
  );
};
