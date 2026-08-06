import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Github, Mail, Facebook, Instagram } from 'lucide-react';
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

  const defaultSocials = [
    { label: 'LinkedIn', url: 'https://linkedin.com/in/orven-casido-39bb58319', icon: Linkedin },
    { label: 'GitHub', url: 'https://github.com/orvencasido', icon: Github },
    { label: 'Gmail', url: 'mailto:orvencasidop@gmail.com', icon: Mail },
    { label: 'Facebook', url: 'https://www.facebook.com/orven.casido/', icon: Facebook },
    { label: 'Instagram', url: 'https://www.instagram.com/orvencasido/', icon: Instagram },
  ];

  const siteLinks = [
    { label: 'Home', path: '/' },
    { label: 'Blogs', path: '/blogs' },
    { label: 'Projects', path: '/projects' },
    { label: 'Experience', path: '/experience' },
    { label: 'Certifications', path: '/certifications' },
    { label: 'Education', path: '/education' },
    { label: 'Contact', path: '/contact' },
  ];

  const getSocialIcon = (platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes('linkedin')) return Linkedin;
    if (lower.includes('github')) return Github;
    if (lower.includes('gmail') || lower.includes('mail') || lower.includes('email')) return Mail;
    if (lower.includes('facebook')) return Facebook;
    if (lower.includes('instagram')) return Instagram;
    return undefined;
  };

  const displayedSocials = socialLinks.length > 0
    ? socialLinks.map((link) => ({
      label: link.platform,
      url: link.url,
      icon: getSocialIcon(link.platform),
    }))
    : defaultSocials;

  return (
    <footer className="bg-matcha-900 text-beige-100 pt-16 pb-12 px-6 md:px-10 border-t border-matcha-800 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center bg-matcha-950 border border-matcha-700">
                <img
                  src="/orbs-icon.png"
                  alt="Orven Casido"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-xl text-beige-50 tracking-tight">
                Orven Casido
              </span>
            </Link>
            <p className="text-sm text-matcha-200 leading-relaxed font-normal max-w-sm">
              AI · Cloud · DevOps. Engineering secure, scalable, and high-impact web platforms and cloud systems.
            </p>
          </div>

          {/* Column 2: SITE Navigation */}
          <div className="md:col-span-3 lg:col-span-3 space-y-3">
            <h5 className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase text-matcha-300">
              SITE
            </h5>
            <ul className="space-y-2 text-sm font-medium">
              {siteLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-matcha-200 hover:text-beige-50 transition-colors inline-block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: ELSEWHERE Social Links */}
          <div className="md:col-span-3 lg:col-span-4 space-y-3">
            <h5 className="text-[10px] font-bold font-mono tracking-[0.2em] uppercase text-matcha-300">
              ELSEWHERE
            </h5>
            <ul className="space-y-2.5 text-sm font-medium">
              {displayedSocials.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <li key={idx}>
                    <a
                      href={item.url}
                      target={item.url.startsWith('mailto:') ? undefined : '_blank'}
                      rel={item.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      className="text-matcha-200 hover:text-beige-50 transition-colors inline-flex items-center gap-2.5 py-0.5"
                    >
                      {IconComponent && <IconComponent className="w-4 h-4 text-matcha-300 shrink-0" />}
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar Copyright */}
        <div className="pt-8 border-t border-matcha-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-matcha-300 font-medium">
          <p>
            {settings?.footer_text || `© ${new Date().getFullYear()} Orven Casido. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};
