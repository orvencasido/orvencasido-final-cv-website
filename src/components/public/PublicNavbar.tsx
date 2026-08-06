import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Download, Menu, X } from 'lucide-react';
import { getProfile } from '../../lib/services';
import { getRateLimitedResumeDownloadUrl } from '../../lib/storage';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const location = useLocation();

  useEffect(() => {
    async function loadResumeUrl() {
      try {
        const profile = await getProfile();
        setResumeUrl(profile.resume_url || '');
      } catch (err) {
        console.error('Failed to load resume URL:', err);
      }
    }

    loadResumeUrl();
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
    { label: 'Home', path: '/' },
    { label: 'Blogs', path: '/blogs' },
    { label: 'Projects', path: '/projects' },
    { label: 'Experience', path: '/experience' },
    { label: 'Certifications', path: '/certifications' },
    { label: 'Education', path: '/education' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-beige-100/90 backdrop-blur-md border-b border-beige-200 transition-colors">
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        {/* Logo / Name */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-matcha-950 font-extrabold tracking-tight"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center bg-matcha-900 shadow-2xs">
            <img
              src="/orbs-icon.png"
              alt="Orven Casido"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-7 w-[1px] bg-matcha-300/60 mx-1"></div>
          <div className="flex flex-col justify-center leading-none">
            <span className="font-extrabold text-lg text-matcha-950">Orven Casido</span>
            <span className="text-[9px] font-bold font-mono tracking-[0.18em] text-matcha-600/70 mt-1 uppercase">
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

        {/* Actions (Resume Download Button) */}
        <div className="flex items-center gap-4">
          {resumeUrl && (
            <button
              type="button"
              aria-label="Download resume"
              title="Download Resume"
              onClick={handleResumeDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-full bg-matcha-900 text-beige-50 hover:bg-matcha-800 transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-matcha-800 hover:text-matcha-950 rounded-xl hover:bg-beige-200 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-beige-200 bg-beige-100 px-6 py-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm font-medium rounded-xl transition ${
                  isActive
                    ? 'bg-matcha-100 text-matcha-950 font-bold'
                    : 'text-matcha-800 hover:bg-beige-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
