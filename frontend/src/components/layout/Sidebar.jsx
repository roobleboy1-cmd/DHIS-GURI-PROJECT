import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Compass,
  HardHat,
  ClipboardList,
  FolderKanban,
  CreditCard,
  BarChart3,
  Bell,
  Heart,
  Star,
  UserCog,
  LogOut,
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  Hammer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role || 'guest';
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count if user is logged in
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications/unread-count')
        .then((res) => {
          setUnreadCount(res.data?.data?.unread_count || res.data?.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const handleItemClick = () => {
    if (onClose) onClose();
  };

  // Role Menus
  const adminMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Houses', path: '/houses', icon: Building2 },
    { name: 'House Designs', path: '/designs', icon: Compass },
    { name: 'Engineers', path: '/engineers', icon: ShieldCheck },
    { name: 'Workers', path: '/workers', icon: HardHat },
    { name: 'Construction Requests', path: '/requests', icon: ClipboardList },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Reviews', path: '/reviews', icon: Star },
    { name: 'Users Management', path: '/admin/users', icon: Users },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Profile & Settings', path: '/profile', icon: UserCog },
  ];

  const engineerMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Workers', path: '/workers', icon: HardHat },
    { name: 'Construction Requests', path: '/requests', icon: ClipboardList },
    { name: 'House Designs', path: '/designs', icon: Compass },
    { name: 'Reviews', path: '/reviews', icon: Star },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Profile & Settings', path: '/profile', icon: UserCog },
  ];

  const clientMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Houses', path: '/houses', icon: Building2 },
    { name: 'House Designs', path: '/designs', icon: Compass },
    { name: 'Engineers', path: '/engineers', icon: ShieldCheck },
    { name: 'Construction Requests', path: '/requests', icon: ClipboardList },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Favorites', path: '/favorites', icon: Heart },
    { name: 'Reviews', path: '/reviews', icon: Star },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Profile & Settings', path: '/profile', icon: UserCog },
  ];

  const workerMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Projects', path: '/projects', icon: FolderKanban },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Profile & Settings', path: '/profile', icon: UserCog },
  ];

  const guestMenu = [
    { name: 'Houses', path: '/houses', icon: Building2 },
    { name: 'House Designs', path: '/designs', icon: Compass },
    { name: 'Engineers', path: '/engineers', icon: ShieldCheck },
    { name: 'Sign In', path: '/login', icon: LogIn },
    { name: 'Register', path: '/register', icon: UserPlus },
  ];

  const menuItems = !isAuthenticated
    ? guestMenu
    : role === 'admin'
    ? adminMenu
    : role === 'engineer'
    ? engineerMenu
    : role === 'worker'
    ? workerMenu
    : clientMenu;

  return (
    <aside className="w-64 bg-[#0b1e33] text-slate-100 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <Link
          to={isAuthenticated ? '/dashboard' : '/houses'}
          onClick={handleItemClick}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-wider text-white">GURI DHIS</span>
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-orange-400 block -mt-0.5">
              Construction ERP
            </span>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Tag */}
      {isAuthenticated && (
        <div className="px-4 py-2.5 bg-black/20 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace</span>
          <span
            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
              role === 'admin'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : role === 'engineer'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : role === 'worker'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
            }`}
          >
            {role}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={handleItemClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/25 translate-x-0.5'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">{item.name}</span>
              {item.badge > 0 && (
                <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      {isAuthenticated ? (
        <div className="p-3 border-t border-white/10 bg-black/20 shrink-0 space-y-2.5">
          <div className="flex items-center gap-2.5 px-1.5 py-1">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || 'User'}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/20 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white/10 shrink-0">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{user?.email || role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all hover:text-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <div className="p-3 border-t border-white/10 bg-black/20 shrink-0 space-y-2">
          <Link
            to="/login"
            onClick={handleItemClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Portal</span>
          </Link>
          <Link
            to="/register"
            onClick={handleItemClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </Link>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
