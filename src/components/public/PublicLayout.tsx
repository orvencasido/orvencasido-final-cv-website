import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { TopProgressBar } from './TopProgressBar';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-beige-100 text-matcha-900 flex flex-col font-sans transition-colors duration-200">
      <TopProgressBar />
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
