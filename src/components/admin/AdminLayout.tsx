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
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../public/ThemeToggle';
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 transition-all duration-300 relative ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link to="/orven/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold text-sm shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-sm tracking-tight truncate">
                Admin CMS
              </span>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
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
                className={`flex items-center gap-3 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
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
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          {!collapsed && (
            <div className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-xs">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {user?.email}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                Authenticated Admin
              </p>
            </div>
          )}

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumbs */}
            <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <span>Admin</span>
              <span>/</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition"
            >
              View Site <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition ${
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition mt-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}

        {/* Nested Dashboard Route Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
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
