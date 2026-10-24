import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  HardHat,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  FileCheck2,
  Activity,
  Calendar,
} from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import ProjectStatusDonutChart from '../../components/dashboard/ProjectStatusDonutChart';
import ProjectProgressBarChart from '../../components/dashboard/ProjectProgressBarChart';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../utils/helpers';

const EngineerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, isSomali } = useLanguage();

  useEffect(() => {
    api.get('/dashboard/engineer')
      .then((res) => {
        setData(res.data?.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner message={isSomali ? "Soo dejinaya goobta shaqada injineerka..." : "Loading engineering workspace..."} />;

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-300 flex items-center gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">
          {isSomali ? `Khalad: ${error}` : `Failed to load engineering metrics: ${error}`}
        </span>
      </div>
    );
  }

  const projectColumns = [
    {
      header: isSomali ? 'Magaca Mashruuca' : 'Project Title',
      key: 'title',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-white text-sm block">{row.title}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {isSomali ? 'La bilaabay:' : 'Created'} {formatDate(row.created_at)}
          </span>
        </div>
      ),
    },
    {
      header: isSomali ? 'Xaaladda' : 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: isSomali ? 'Horumarka Goobta' : 'Site Progress',
      key: 'progress_percentage',
      render: (row) => {
        const pct = Math.min(100, Math.max(0, Number(row.progress_percentage) || 0));
        return (
          <div className="w-32 space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>{pct}%</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                {isSomali ? 'La Ansixiyay' : 'Certified'}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-700 p-0.5">
              <div
                className="bg-gradient-to-r from-[#123C69] to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: isSomali ? 'Tallaabo' : 'Action',
      key: 'action',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="text-xs font-bold text-[#123C69] dark:text-orange-400 hover:text-orange-600 inline-flex items-center gap-1 transition-colors group"
        >
          <span>{isSomali ? 'Fur Goobta' : 'Open Workspace'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Welcome Banner */}
      <WelcomeBanner
        subtitle={
          isSomali
            ? "Kormeerka naqshadaha dhismaha, marxaladaha goobaha dhismaha, shaqaalaha, iyo fasaxyada farsamada."
            : "Oversee structural drawings, field construction milestones, site worker rosters, and technical permits."
        }
        actions={
          <>
            <Link
              to="/workers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-colors shadow-xs"
            >
              <HardHat className="w-4 h-4 text-orange-300" />
              <span>{isSomali ? 'Shaqaalaha Goobta' : 'Manage Crew'}</span>
            </Link>
            <Link
              to="/requests"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
            >
              <ClipboardList className="w-4 h-4" />
              <span>{isSomali ? 'Codsiyada Cusub' : 'Site Inquiries'}</span>
            </Link>
          </>
        }
      />

      {/* 2. Key Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={isSomali ? "Mashruucyada La Ii Xilsaaray" : "Assigned Projects"}
          value={data?.projects?.total || 0}
          icon={FolderKanban}
          color="blue"
          subtitle={isSomali ? "Goobaha aad kormeerka ku hayso" : "Sites under engineering supervision"}
        />
        <StatCard
          title={isSomali ? "Shaqaalaha Goobta" : "Site Tradespeople"}
          value={data?.workers?.total || 0}
          icon={HardHat}
          color="orange"
          subtitle={isSomali ? "Khabiirada ku diiwaangashan kooxdaada" : "Specialists in your roster"}
        />
        <StatCard
          title={isSomali ? "Codsiyada Sugaya" : "Pending Inquiries"}
          value={data?.pending_requests || 0}
          icon={ClipboardList}
          color="purple"
          subtitle={isSomali ? "Sugaya kormeerka injineernimada" : "Awaiting engineering review"}
        />
        <StatCard
          title={isSomali ? "Horumarka La Ansixiyay" : "Certified Milestones"}
          value={data?.recent_progress?.length || 0}
          icon={TrendingUp}
          color="green"
          subtitle={isSomali ? "Warbixinnada horumarka goobaha" : "On-site progress updates"}
        />
      </div>

      {/* 3. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col">
          <ProjectStatusDonutChart
            data={data?.projects?.by_status || []}
            title={isSomali ? "Xaaladda Mashaariicda Injineerka" : "Site Status Breakdown"}
            subtitle={isSomali ? "Marxaladaha dhismaha ee la kormeero" : "Phases of supervised construction"}
          />
        </div>
        <div className="lg:col-span-7 flex flex-col">
          <ProjectProgressBarChart
            projects={data?.recent_projects || []}
            title={isSomali ? "Xawaaraha Horumarka Dhismaha" : "Site Progress Velocity"}
            subtitle={isSomali ? "Boqolleyda dhameystirka mashaariicdaada" : "Current completion rates of assigned structures"}
          />
        </div>
      </div>

      {/* 4. Active Projects & Recent Progress Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Projects Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <FileCheck2 className="w-4.5 h-4.5 text-[#123C69] dark:text-orange-400" />
                {isSomali ? 'Goobaha Dhismaha ee La Ii Xilsaaray' : 'Assigned Construction Sites'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {isSomali ? 'Dhismaha tooska ah iyo waqtiga la filayo' : 'Active field structures and timelines'}
              </p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-bold text-[#123C69] dark:text-orange-400 hover:text-orange-600 transition-colors inline-flex items-center gap-1"
            >
              {isSomali ? 'Dhammaan Mashaariicda' : 'All Projects'} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <DataTable
              columns={projectColumns}
              data={data?.recent_projects || []}
              emptyMessage={isSomali ? "Ma jiraan mashaariic xilligan laguu xilsaaray." : "You have no active projects currently assigned."}
            />
          </div>
        </div>

        {/* Real-time Activity Logs Feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-orange-500" />
              {isSomali ? 'Warbixinnadii Ugu Dambeeyay' : 'Latest Site Updates'}
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
            {data?.recent_progress && data.recent_progress.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_progress.map((prog) => (
                  <div key={prog.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5 group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#123C69] dark:group-hover:text-orange-400 transition-colors truncate">
                        {prog.title}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                        {formatDate(prog.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {prog.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-50 dark:border-slate-800">
                      <span className="font-medium truncate max-w-[140px]">
                        {isSomali ? 'Goobta:' : 'Site:'} {prog.project_title || (isSomali ? 'Guud' : 'General')}
                      </span>
                      <span className="font-extrabold text-[#123C69] dark:text-sky-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900">
                        {prog.progress_percentage}% {isSomali ? 'Horumar' : 'Milestone'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                {isSomali ? 'Ma jiraan warbixinno dhowaan la soo gudbiyay.' : 'No progress milestones reported recently.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
