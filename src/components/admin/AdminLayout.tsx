import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Cpu,
  FileText,
  FolderGit2,
  Briefcase,
  Award,
  GraduationCap,
  Mail,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '../ui/Modal';
import { LoadingSkeleton } from '../ui/CommonUI';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Protected route check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-beige-100 flex items-center justify-center p-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/orven', { replace: true });
    return null;
  }

  const navItems = [
    { label: 'Overview', path: '/orven/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Home Content', path: '/orven/dashboard/home', icon: Home },
    { label: 'Tech Stack & Icons', path: '/orven/dashboard/tech-stack', icon: Cpu },
    { label: 'Blogs', path: '/orven/dashboard/blogs', icon: FileText },
    { label: 'Projects', path: '/orven/dashboard/projects', icon: FolderGit2 },
    { label: 'Experience', path: '/orven/dashboard/experience', icon: Briefcase },
    { label: 'Certifications', path: '/orven/dashboard/certifications', icon: Award },
    { label: 'Education', path: '/orven/dashboard/education', icon: GraduationCap },
    { label: 'Contact Messages', path: '/orven/dashboard/messages', icon: Mail },
    { label: 'Site Settings', path: '/orven/dashboard/settings', icon: Settings },
    { label: 'Admin Profile', path: '/orven/dashboard/profile', icon: User },
  ];

  // Breadcrumbs calculation
  const currentItem = navItems.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/orven', { replace: true });
  };

  return (
    <div className="min-h-screen md:h-screen bg-beige-100 text-matcha-950 flex flex-col md:flex-row font-sans md:overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r border-beige-300 bg-beige-50 transition-all duration-300 sticky top-0 h-screen shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-beige-200">
          <Link to="/orven/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-matcha-900 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              <img
                src="/orbs-icon.png"
                alt="Orven CMS"
                className="w-full h-full object-cover"
              />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-sm tracking-tight text-matcha-950 truncate">
                Admin CMS
              </span>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-matcha-700 hover:text-matcha-950 rounded-lg hover:bg-beige-200 transition cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all ${
                  isActive
                    ? 'bg-matcha-900 text-beige-50 font-extrabold shadow-xs'
                    : 'text-matcha-800 hover:text-matcha-950 hover:bg-beige-200'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info & Logout */}
        <div className="p-3 border-t border-beige-200 space-y-2">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-beige-200/60 text-xs">
              <p className="font-bold text-matcha-950 truncate">
                {user?.email}
              </p>
              <p className="text-[10px] text-matcha-700 font-mono font-semibold">
                Authenticated Admin
              </p>
            </div>
          )}

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-beige-300 bg-beige-50/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-matcha-800 hover:bg-beige-200 rounded-xl"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumbs */}
            <div className="text-xs sm:text-sm font-medium text-matcha-700 flex items-center gap-1.5">
              <span>Admin</span>
              <span>/</span>
              <span className="font-extrabold text-matcha-950">
                {currentItem?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Live Public Site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-matcha-950 bg-beige-200 hover:bg-beige-300 border border-beige-300 rounded-full transition"
            >
              View Site <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-b border-beige-300 bg-beige-50 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-2xl transition ${
                      isActive
                        ? 'bg-matcha-900 text-beige-50 font-extrabold'
                        : 'text-matcha-800 hover:bg-beige-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <button
              onClick={() => {
                setMobileOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-700 hover:bg-red-50 rounded-2xl transition mt-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}

        {/* Nested Dashboard Route Content */}
        <main className="flex-1 overflow-y-auto bg-beige-100">
          <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Log Out of Admin CMS"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Logout Now"
      />
    </div>
  );
};
