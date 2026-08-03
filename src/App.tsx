import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

// Layouts
import { PublicLayout } from './components/public/PublicLayout';
import { AdminLayout } from './components/admin/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { BlogsPage } from './pages/public/BlogsPage';
import { BlogDetailPage } from './pages/public/BlogDetailPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { ExperiencePage } from './pages/public/ExperiencePage';
import { CertificationsPage } from './pages/public/CertificationsPage';
import { EducationPage } from './pages/public/EducationPage';
import { ContactPage } from './pages/public/ContactPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { DashboardOverview } from './pages/admin/dashboard/DashboardOverview';
import { HomeContentManager } from './pages/admin/dashboard/HomeContentManager';
import { TechStackManager } from './pages/admin/dashboard/TechStackManager';
import { BlogManager } from './pages/admin/dashboard/BlogManager';
import { ProjectManager } from './pages/admin/dashboard/ProjectManager';
import { ExperienceManager } from './pages/admin/dashboard/ExperienceManager';
import { CertificationManager } from './pages/admin/dashboard/CertificationManager';
import { EducationManager } from './pages/admin/dashboard/EducationManager';
import { ContactMessagesManager } from './pages/admin/dashboard/ContactMessagesManager';
import { SiteSettingsManager } from './pages/admin/dashboard/SiteSettingsManager';
import { AdminProfileManager } from './pages/admin/dashboard/AdminProfileManager';

const RouteTitle: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = location.pathname.startsWith('/orven')
      ? 'Orven Casido | CMS'
      : 'Orven Casido | Resume';
  }, [location.pathname]);

  return null;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <RouteTitle />
            <Routes>
              {/* Public Portfolio Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="blogs" element={<BlogsPage />} />
                <Route path="blogs/:slug" element={<BlogDetailPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:slug" element={<ProjectDetailPage />} />
                <Route path="experience" element={<ExperiencePage />} />
                <Route path="certifications" element={<CertificationsPage />} />
                <Route path="education" element={<EducationPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Secret Admin Authentication Route */}
              <Route path="/orven" element={<AdminLoginPage />} />

              {/* Protected Admin Dashboard Routes */}
              <Route path="/orven/dashboard" element={<AdminLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="home" element={<HomeContentManager />} />
                <Route path="tech-stack" element={<TechStackManager />} />
                <Route path="blogs" element={<BlogManager />} />
                <Route path="projects" element={<ProjectManager />} />
                <Route path="experience" element={<ExperienceManager />} />
                <Route path="certifications" element={<CertificationManager />} />
                <Route path="education" element={<EducationManager />} />
                <Route path="messages" element={<ContactMessagesManager />} />
                <Route path="settings" element={<SiteSettingsManager />} />
                <Route path="profile" element={<AdminProfileManager />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
