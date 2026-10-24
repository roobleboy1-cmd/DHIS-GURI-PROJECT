import React from 'react';

const colorStyles = {
  blue: {
    badge: 'bg-blue-50 dark:bg-blue-950/40 text-[#123C69] dark:text-sky-300 border-blue-200 dark:border-blue-800',
    iconBg: 'bg-[#123C69]/10 dark:bg-sky-500/15 text-[#123C69] dark:text-sky-400',
    accent: 'bg-[#123C69] dark:bg-sky-500',
    ring: 'hover:border-[#123C69]/40 dark:hover:border-sky-500/40',
  },
  orange: {
    badge: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400',
    accent: 'bg-orange-500',
    ring: 'hover:border-orange-500/40',
  },
  green: {
    badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    accent: 'bg-emerald-500',
    ring: 'hover:border-emerald-500/40',
  },
  purple: {
    badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    accent: 'bg-indigo-600 dark:bg-indigo-500',
    ring: 'hover:border-indigo-500/40',
  },
  amber: {
    badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
    accent: 'bg-amber-500',
    ring: 'hover:border-amber-500/40',
  },
};

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend, onClick }) => {
  const scheme = colorStyles[color] || colorStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all duration-200 ${
        scheme.ring
      } ${onClick ? 'cursor-pointer' : ''} group overflow-hidden flex flex-col justify-between`}
    >
      {/* Top micro accent line on hover */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${scheme.accent} opacity-80 group-hover:opacity-100 transition-opacity`}
      />

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {value ?? 0}
            </h3>
            {trend && (
              <span
                className={`text-[11px] font-bold inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full border ${
                  trend.positive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                <span>{trend.positive ? '↑' : '↓'}</span>
                <span>{trend.text}</span>
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${scheme.iconBg} transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon className="w-6 h-6 stroke-[1.8]" />
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-4 pt-3 border-t border-slate-100/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">{subtitle}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-[#123C69] dark:group-hover:bg-orange-500 transition-colors" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
