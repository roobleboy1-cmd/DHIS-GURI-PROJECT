import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, LayoutDashboard, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 shadow-inner">
        <Building2 className="w-10 h-10" />
      </div>

      <h1 className="text-6xl font-black text-[#123c69] tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
        The architectural plan, project workspace, or dashboard page you are looking for does not exist or has been relocated.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#123c69] hover:bg-[#1a4f8a] transition-all shadow-md"
        >
          <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
        </Link>
        <Link
          to="/houses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
        >
          Browse Houses
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
