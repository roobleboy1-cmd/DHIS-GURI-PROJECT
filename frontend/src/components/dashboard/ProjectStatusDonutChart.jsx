import React, { useState } from 'react';
import { PieChart, FolderKanban } from 'lucide-react';

const STATUS_CONFIG = {
  in_progress: {
    label: 'In Progress',
    color: '#123C69',
    bgColor: 'bg-[#123C69]',
    textColor: 'text-[#123C69]',
  },
  completed: {
    label: 'Completed',
    color: '#10B981',
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
  },
  pending: {
    label: 'Pending Approval',
    color: '#F97316',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-600',
  },
  planning: {
    label: 'Planning Phase',
    color: '#3B82F6',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
  },
  on_hold: {
    label: 'On Hold',
    color: '#64748B',
    bgColor: 'bg-slate-500',
    textColor: 'text-slate-600',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#EF4444',
    bgColor: 'bg-rose-500',
    textColor: 'text-rose-600',
  },
};

const ProjectStatusDonutChart = ({ data = [], title = 'Project Status Breakdown', subtitle = 'Distribution of active & archived projects' }) => {
  const [activeSegment, setActiveSegment] = useState(null);

  // Normalize data entries
  const normalizedData = (data || []).map((item) => {
    const key = (item.status || 'unknown').toLowerCase();
    const config = STATUS_CONFIG[key] || {
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      color: '#94A3B8',
      bgColor: 'bg-slate-400',
      textColor: 'text-slate-500',
    };
    return {
      status: key,
      label: config.label,
      color: config.color,
      bgColor: config.bgColor,
      textColor: config.textColor,
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
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#123C69]" />
            {title}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {total} Total
        </span>
      </div>

      {total === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
          <FolderKanban className="w-10 h-10 stroke-1 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-500">No project status records</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Projects will populate here as construction begins</p>
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
                stroke="#F1F5F9"
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
              <span className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                {highlightedItem ? highlightedItem.count : total}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 max-w-[80px] truncate">
                {highlightedItem ? highlightedItem.label : 'Projects'}
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
                    ? 'bg-slate-50 border-slate-200/90 shadow-2xs'
                    : 'border-transparent hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-700 truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-slate-800">{item.count}</span>
                  <span className="text-[10px] font-medium text-slate-400 w-9 text-right">
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
