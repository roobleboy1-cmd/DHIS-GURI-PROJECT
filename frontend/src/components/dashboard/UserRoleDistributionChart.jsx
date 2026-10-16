import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, ShieldCheck, HardHat, UserCircle } from 'lucide-react';

const ROLE_ICONS = {
  admin: ShieldCheck,
  engineer: HardHat,
  worker: HardHat,
  client: UserCircle,
};

const ROLE_COLORS = {
  admin: { bar: 'bg-[#123C69]', text: 'text-[#123C69]' },
  engineer: { bar: 'bg-sky-600', text: 'text-sky-700' },
  worker: { bar: 'bg-orange-500', text: 'text-orange-700' },
  client: { bar: 'bg-emerald-600', text: 'text-emerald-700' },
};

const UserRoleDistributionChart = ({ roles = [], totalUsers = 0 }) => {
  const maxCount = Math.max(...roles.map((r) => Number(r.count) || 0), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-[#123C69]" />
            Personnel & Role Distribution
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Active workforce & client accounts</p>
        </div>
        <Link
          to="/admin/users"
          className="text-xs font-bold text-[#123C69] hover:text-orange-600 transition-colors inline-flex items-center gap-1"
        >
          Manage <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {roles.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs">
          No user distribution records found.
        </div>
      ) : (
        <div className="pt-4 space-y-3.5">
          {roles.map((item) => {
            const roleKey = (item.role || '').toLowerCase();
            const count = Number(item.count) || 0;
            const percent = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            const barWidth = Math.max(8, Math.round((count / maxCount) * 100));
            const Icon = ROLE_ICONS[roleKey] || UserCircle;
            const color = ROLE_COLORS[roleKey] || { bar: 'bg-slate-600', text: 'text-slate-700' };

            return (
              <div key={item.role} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 capitalize flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#123C69] transition-colors" />
                    {item.role}s
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800">{count}</span>
                    <span className="text-[10px] text-slate-400 w-8 text-right">({percent}%)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/50">
                  <div
                    className={`h-full rounded-full ${color.bar} transition-all duration-500 ease-out`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserRoleDistributionChart;
