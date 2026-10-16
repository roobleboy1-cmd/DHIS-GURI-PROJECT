import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight, ExternalLink } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const ProjectProgressBarChart = ({
  projects = [],
  title = 'Active Construction Progress',
  subtitle = 'Ground milestone completion across sites',
}) => {
  const displayProjects = (projects || []).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-500" />
            {title}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <Link
          to="/projects"
          className="text-xs font-bold text-[#123C69] hover:text-orange-600 transition-colors inline-flex items-center gap-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {displayProjects.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
          <BarChart3 className="w-10 h-10 stroke-1 text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-500">No project progress data</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Assigned projects will chart progress here</p>
        </div>
      ) : (
        <div className="pt-4 space-y-4">
          {/* Milestone Axis Grid Marks */}
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 border-b border-slate-100 pb-1.5">
            <span>0% Start</span>
            <span className="hidden sm:inline">25% Foundation</span>
            <span>50% Structure</span>
            <span className="hidden sm:inline">75% Finishing</span>
            <span>100% Handover</span>
          </div>

          {/* Project Bars */}
          <div className="space-y-3.5">
            {displayProjects.map((proj) => {
              const progress = Math.min(100, Math.max(0, Number(proj.progress_percentage) || 0));
              const isHigh = progress >= 70;
              const isMid = progress >= 35 && progress < 70;

              return (
                <div key={proj.id} className="group p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex items-center gap-2">
                      <Link
                        to={`/projects/${proj.id}`}
                        className="text-xs font-bold text-slate-800 hover:text-[#123C69] truncate flex items-center gap-1 group-hover:text-primary transition-colors"
                      >
                        {proj.title}
                        <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      {proj.status && <StatusBadge status={proj.status} />}
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 shrink-0">
                      {progress}%
                    </span>
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isHigh
                          ? 'bg-gradient-to-r from-[#123C69] via-emerald-600 to-emerald-500'
                          : isMid
                          ? 'bg-gradient-to-r from-[#123C69] to-orange-500'
                          : 'bg-gradient-to-r from-orange-400 to-orange-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="truncate">
                      {proj.client_name ? `Client: ${proj.client_name}` : proj.engineer_name ? `Eng: ${proj.engineer_name}` : 'Construction Site'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {progress >= 100 ? 'Completed' : progress >= 50 ? 'Advanced Phase' : 'Early Phase'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectProgressBarChart;
