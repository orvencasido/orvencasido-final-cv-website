import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { TopProgressBar } from './TopProgressBar';
import { FloatingPhonePlayer } from './FloatingPhonePlayer';
import { PortfolioAIChat } from './PortfolioAIChat';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-beige-100 text-matcha-900 flex flex-col font-sans transition-colors duration-200 overflow-x-hidden">
      <TopProgressBar />
      <PublicNavbar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
      <PublicFooter />
      <FloatingPhonePlayer />
      <PortfolioAIChat />
    </div>
  );
};

