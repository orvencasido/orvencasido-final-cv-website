import React from 'react';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-8 text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <div>
          &copy; {new Date().getFullYear()} ALEX ORVEN. ALL RIGHTS RESERVED.
        </div>

        {/* Social links */}
        <div className="flex items-center gap-6">
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            GitHub
          </a>
          <a
            href="mailto:orvencasidop@gmail.com"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Gmail
          </a>
        </div>
      </div>
    </footer>
  );
};
