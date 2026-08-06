import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-24 space-y-8">
      <div className="w-20 h-20 rounded-3xl bg-matcha-100 flex items-center justify-center text-matcha-950 font-mono text-2xl font-extrabold shadow-2xs">
        404
      </div>
      <div className="space-y-3 max-w-md">
        <h1 className="text-3xl font-extrabold text-matcha-950">Page Not Found</h1>
        <p className="text-base text-matcha-700 leading-relaxed font-normal">
          The requested path does not exist or has been relocated.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-extrabold text-beige-50 bg-matcha-900 rounded-full hover:bg-matcha-800 transition shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
};
