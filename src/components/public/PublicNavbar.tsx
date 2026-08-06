import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Download, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
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
    <header className="sticky top-0 z-40 bg-[#F4F1EA]/90 dark:bg-[#090F12]/90 backdrop-blur-md border-b border-line transition-colors">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Lockup (Initial Circle SVG Badge + Serif Title) */}
        <Link aria-label="Orven Casido: home" to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#0F1D24] dark:bg-[#FAF8F5] flex items-center justify-center border border-copper/30 shadow-xs transition-transform group-hover:scale-105">
            <span className="font-display font-bold text-sm tracking-wider text-[#FAF8F5] dark:text-[#0F1D24]">
              OC
            </span>
          </div>
          <div className="hidden sm:flex flex-col justify-center leading-tight">
            <span className="font-display font-semibold tracking-tight text-ink text-base">
              Orven Casido
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Full-Stack · Cloud · Web
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive
                    ? 'text-copper font-semibold'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-copper rounded-full"></span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {resumeUrl && (
            <button
              type="button"
              aria-label="Download resume"
              title="Download Resume"
              onClick={handleResumeDownload}
              className="p-2 text-muted hover:text-copper rounded-full hover:bg-card border border-line transition-all"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <ThemeToggle />

          <Link
            to="/contact"
            className="hidden sm:inline-flex text-xs font-semibold px-5 py-2.5 rounded-full bg-[#111F24] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#111F24] hover:bg-copper dark:hover:bg-copper dark:hover:text-white transition-colors"
          >
            Let's talk
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-muted hover:text-ink rounded-full border border-line transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-line bg-card px-6 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm font-medium rounded-full transition ${
                  isActive
                    ? 'bg-copper text-white font-semibold'
                    : 'text-muted hover:text-ink hover:bg-paper'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-line">
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center text-xs font-semibold px-5 py-3 rounded-full bg-[#111F24] dark:bg-[#FAF8F5] text-[#FAF8F5] dark:text-[#111F24]"
            >
              Let's talk
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
