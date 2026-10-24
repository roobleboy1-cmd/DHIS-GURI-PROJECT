import React, { useState } from 'react';
import { PieChart, FolderKanban } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ProjectStatusDonutChart = ({
  data = [],
  title,
  subtitle
}) => {
  const [activeSegment, setActiveSegment] = useState(null);
  const { t, isSomali } = useLanguage();

  const chartTitle = title || t('chart_project_status', 'Project Status Breakdown');
  const chartSub = subtitle || t('chart_project_status_sub', 'Distribution of active & archived projects');

  const getStatusConfig = (key) => {
    switch (key) {
      case 'in_progress':
        return {
          label: isSomali ? 'Wuu Socdaa' : 'In Progress',
          color: '#123C69',
        };
      case 'completed':
        return {
          label: isSomali ? 'Dhameystirmay' : 'Completed',
          color: '#10B981',
        };
      case 'pending':
        return {
          label: isSomali ? 'Wuu Sugayaa' : 'Pending Approval',
          color: '#F97316',
        };
      case 'planning':
        return {
          label: isSomali ? 'Marxalad Qorsheyn' : 'Planning Phase',
          color: '#3B82F6',
        };
      case 'on_hold':
        return {
          label: isSomali ? 'La Haliyay' : 'On Hold',
          color: '#64748B',
        };
      case 'cancelled':
        return {
          label: isSomali ? 'La Kansalay' : 'Cancelled',
          color: '#EF4444',
        };
      default:
        return {
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          color: '#94A3B8',
        };
    }
  };

  // Normalize data entries
  const normalizedData = (data || []).map((item) => {
    const key = (item.status || 'unknown').toLowerCase();
    const config = getStatusConfig(key);
    return {
      status: key,
      label: config.label,
      color: config.color,
      count: Number(item.count) || 0,
    };
  }).filter((item) => item.count > 0);

  const total = normalizedData.reduce((sum, item) => sum + item.count, 0);

  // SVG Geometry calculation for donut
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = normalizedData.map((item) => {
    const percent = total > 0 ? (item.count / total) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;

    return {
      ...item,
      percent: Math.round(percent),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const highlightedItem = activeSegment !== null ? segments[activeSegment] : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between transition-all">
      {/* Chart Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#123C69] dark:text-orange-400" />
            {chartTitle}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{chartSub}</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {total} {isSomali ? 'Wadarta' : 'Total'}
        </span>
      </div>

      {total === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
          <FolderKanban className="w-10 h-10 stroke-1 text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isSomali ? 'Ma jiraan xog mashruuc' : 'No project status records'}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {isSomali ? 'Mashruucyada ayaa halkan ka muuqan doona markii shaqadu bilaabato' : 'Projects will populate here as construction begins'}
          </p>
        </div>
      ) : (
        <div className="pt-5 flex flex-col sm:flex-row items-center gap-6 justify-between">
          {/* Donut SVG */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90 transition-all duration-300"
            >
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                strokeWidth={strokeWidth}
              />
              {/* Data segments */}
              {segments.map((seg, idx) => (
                <circle
                  key={seg.status}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={activeSegment === idx ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setActiveSegment(idx)}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              ))}
            </svg>

            {/* Center metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                {highlightedItem ? highlightedItem.count : total}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1 max-w-[80px] truncate">
                {highlightedItem ? highlightedItem.label : (isSomali ? 'Mashruuc' : 'Projects')}
              </span>
              {highlightedItem && (
                <span className="text-[10px] font-bold text-orange-500">
                  {highlightedItem.percent}%
                </span>
              )}
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="flex-1 w-full space-y-2.5">
            {segments.map((item, idx) => (
              <div
                key={item.status}
                onMouseEnter={() => setActiveSegment(idx)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs border ${
                  activeSegment === idx
                    ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700 shadow-2xs'
                    : 'border-transparent hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-slate-800 dark:text-white">{item.count}</span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 w-9 text-right">
                    {item.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusDonutChart;
