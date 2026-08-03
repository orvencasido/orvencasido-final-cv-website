import React, { useEffect, useState } from 'react';
import { getSiteSettings, getSocialLinks } from '../../lib/services';
import { SiteSettings, SocialLink } from '../../types';

export const PublicFooter: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    async function loadFooterData() {
      try {
        const [siteSettings, links] = await Promise.all([getSiteSettings(), getSocialLinks()]);
        setSettings(siteSettings);
        setSocialLinks(links.filter((link) => link.is_visible));
      } catch (err) {
        console.error('Failed to load footer data:', err);
      }
    }

    loadFooterData();
  }, []);

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-8 text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <div>
          {settings?.footer_text || `(c) ${new Date().getFullYear()} Orven Casido. All rights reserved.`}
        </div>

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};
