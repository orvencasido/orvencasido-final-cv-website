import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Download, Menu, X } from 'lucide-react';
import { defaultPublicNavItems, getProfile, getSiteSettings } from '../../lib/services';
import { getRateLimitedResumeDownloadUrl } from '../../lib/storage';
import { PublicNavItem } from '../../types';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [visibleNavItems, setVisibleNavItems] = useState<PublicNavItem[]>(defaultPublicNavItems);
  const location = useLocation();

  useEffect(() => {
    async function loadNavbarData() {
      try {
        const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);
        setResumeUrl(profile.resume_url || '');
        setVisibleNavItems(settings.visible_nav_items || defaultPublicNavItems);
      } catch (err) {
        console.error('Failed to load navbar data:', err);
      }
    }

    loadNavbarData();
  }, []);

  const handleResumeDownload = async () => {
    try {
      const downloadUrl = await getRateLimitedResumeDownloadUrl(resumeUrl);
      window.location.assign(downloadUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Resume download failed.';
      alert(message);
    }
  };

  const navItems = [
    { id: 'home' as const, label: 'Home', path: '/' },
    { id: 'blogs' as const, label: 'Blogs', path: '/blogs' },
    { id: 'projects' as const, label: 'Projects', path: '/projects' },
    { id: 'experience' as const, label: 'Experience', path: '/experience' },
    { id: 'certifications' as const, label: 'Certifications', path: '/certifications' },
    { id: 'education' as const, label: 'Education', path: '/education' },
    { id: 'contact' as const, label: 'Contact', path: '/contact' },
  ].filter((item) => item.id === 'home' || visibleNavItems.includes(item.id));

  return (
    <header className="sticky top-0 z-40 bg-beige-100/90 backdrop-blur-md border-b border-beige-200 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo / Name */}
        <Link
          to="/"
          className="group flex items-center gap-2 sm:gap-2.5 text-matcha-950 font-extrabold tracking-tight min-h-[44px]"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center bg-matcha-900 shadow-2xs">
            <img
              src="/orbs-icon.png"
              alt="Orven Casido"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-6 sm:h-7 w-[1px] bg-matcha-300/60 mx-0.5 sm:mx-1"></div>
          <div className="flex flex-col justify-center leading-none">
            <span className="font-extrabold text-base sm:text-lg text-matcha-950">Orven Casido</span>
            <span className="text-[8px] sm:text-[9px] font-bold font-mono tracking-[0.16em] sm:tracking-[0.18em] text-matcha-600/70 mt-1 uppercase">
              AI · CLOUD · DEVOPS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-matcha-100 text-matcha-950 font-semibold shadow-xs'
                    : 'text-matcha-700 hover:text-matcha-950 hover:bg-beige-200/60'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Actions (Resume Download Button & Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-4">
          {resumeUrl && (
            <button
              type="button"
              aria-label="Download resume"
              title="Download Resume"
              onClick={handleResumeDownload}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-matcha-900 text-beige-50 hover:bg-matcha-800 transition-all shadow-sm cursor-pointer min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}

          {/* Mobile Menu Toggle (44x44px accessible touch target) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] p-2.5 text-matcha-800 hover:text-matcha-950 rounded-xl hover:bg-beige-200 transition cursor-pointer flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-beige-200 bg-beige-100/95 backdrop-blur-md px-4 sm:px-6 py-4 space-y-1.5 animate-in slide-in-from-top-2 duration-200 shadow-md">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `min-h-[44px] flex items-center px-4 py-3 text-sm font-medium rounded-xl transition ${
                  isActive
                    ? 'bg-matcha-100 text-matcha-950 font-bold border-l-2 border-matcha-600'
                    : 'text-matcha-800 hover:bg-beige-200 active:bg-beige-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {resumeUrl && (
            <div className="pt-2 border-t border-beige-200 mt-2">
              <button
                type="button"
                aria-label="Download resume"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleResumeDownload();
                }}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-xl bg-matcha-900 text-beige-50 hover:bg-matcha-800 active:scale-[0.99] transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
