import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 font-mono text-xl font-bold">
        404
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">Page Not Found</h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          The requested path does not exist or has been relocated.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
};
