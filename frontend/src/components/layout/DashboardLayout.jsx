import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Floating Menu Button (No top navbar) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-30 lg:hidden p-2.5 rounded-xl bg-[#0b1e33] text-white shadow-xl border border-white/10 hover:bg-[#123c69] active:scale-95 transition-all"
        aria-label="Open navigation sidebar"
        title="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
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
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 h-screen sticky top-0 border-r border-slate-900/10">
        <Sidebar />
      </div>

      {/* Main Content Area - Starts directly to the right of the persistent sidebar */}
      <main className="flex-1 min-w-0 bg-slate-50 min-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
