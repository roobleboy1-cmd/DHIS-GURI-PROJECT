import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Building2, Bell, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';
import api from '../../api/axios';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuth();
  const { t, isSomali } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications/unread-count')
        .then((res) => {
          setUnreadCount(res.data?.data?.unread_count || res.data?.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 h-screen sticky top-0 border-r border-slate-200/80 dark:border-slate-800/80 z-20">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header Bar with Language, Theme, Notifications & User Badge */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left: Mobile Toggle & Breadcrumb / App identity */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
                  {t('constructionERP', 'Construction ERP')}
                </span>
                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
                <span className="text-xs font-extrabold text-[#123c69] dark:text-orange-400 capitalize">
                  {user?.role ? t(user.role, user.role) : t('guest', 'Guest')}
                </span>
              </div>
            </div>

            {/* Right: Controls (Language, Theme, Notifications, User) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher */}
              <LanguageToggle />

              {/* Theme Switcher (Dark / Light) */}
              <ThemeToggle />

              {/* Notifications Link */}
              {isAuthenticated && (
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
                  title={t('nav_notifications', 'Notifications')}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Avatar & Logout */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || 'User'}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-orange-500/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-xs">
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="hidden md:block text-left pr-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                        {user?.full_name?.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                        {t(user?.role, user?.role)}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title={t('logout', 'Sign Out')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-all"
                >
                  {t('sign_in_btn', 'Sign In')}
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
