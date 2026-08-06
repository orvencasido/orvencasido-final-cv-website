import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <footer className="bg-[#0F1D24] text-[#FAF8F5] transition-colors mt-20 border-t border-line">
      <div className="max-w-6xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-3">
        {/* Brand & Description Column */}
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#0F1D24] flex items-center justify-center border border-copper/40 shadow-xs">
              <span className="font-display font-bold text-sm tracking-wider">
                OC
              </span>
            </div>
            <span className="font-display font-semibold text-xl text-[#FAF8F5]">
              Orven Casido
            </span>
          </div>
          <p className="mt-4 text-sm text-[#FAF8F5]/60 leading-relaxed max-w-xs">
            Full-Stack · Cloud · Web Architecture. Crafting resilient web applications, robust APIs, and modern user experiences.
          </p>
        </div>

        {/* Site Links Column */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#FAF8F5]/50 mb-4 font-semibold">
            Navigation
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/projects" className="hover:text-copper transition-colors">
                Projects
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="hover:text-copper transition-colors">
                Writing & Insights
              </Link>
            </li>
            <li>
              <Link to="/experience" className="hover:text-copper transition-colors">
                Experience
              </Link>
            </li>
            <li>
              <Link to="/certifications" className="hover:text-copper transition-colors">
                Certifications
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-copper transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Links Column ("Elsewhere") */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-[#FAF8F5]/50 mb-4 font-semibold">
            Elsewhere
          </h3>
          {socialLinks.length > 0 ? (
            <ul className="space-y-3 text-sm">
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="hover:text-copper transition-colors flex items-center gap-2"
                  >
                    {link.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#FAF8F5]/50">Get in touch via the contact page.</p>
          )}
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-[#FAF8F5]/10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-[#FAF8F5]/40 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            {settings?.footer_text || `© ${new Date().getFullYear()} Orven Casido. All rights reserved.`}
          </span>
          <span>Designed & Built with Precision & Care</span>
        </div>
      </div>
    </footer>
  );
};
