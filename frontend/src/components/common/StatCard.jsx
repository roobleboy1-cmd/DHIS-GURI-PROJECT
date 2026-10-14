import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-primary',
      iconBg: 'bg-blue-100 text-[#123c69]',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      iconBg: 'bg-orange-100 text-orange-600',
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      iconBg: 'bg-purple-100 text-purple-600',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      iconBg: 'bg-amber-100 text-amber-600',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value ?? 0}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium flex items-center gap-1 ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span>{trend.positive ? '↑' : '↓'} {trend.text}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
