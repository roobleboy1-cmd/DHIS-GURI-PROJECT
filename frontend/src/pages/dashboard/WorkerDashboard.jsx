import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  HardHat,
  Bell,
  Building2,
  ArrowRight,
  AlertCircle,
  FileCheck2,
  Activity,
} from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import ProjectProgressBarChart from '../../components/dashboard/ProjectProgressBarChart';
import { useLanguage } from '../../context/LanguageContext';

const WorkerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, isSomali } = useLanguage();

  useEffect(() => {
    api.get('/dashboard/worker')
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

  if (loading) return <LoadingSpinner message={isSomali ? "Soo dejinaya goobta shaqada..." : "Loading worker station..."} />;

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-300 flex items-center gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">
          {isSomali ? `Khalad: ${error}` : `Failed to load worker metrics: ${error}`}
        </span>
      </div>
    );
  }

  const assignmentColumns = [
    {
      header: isSomali ? 'Magaca Mashruuca' : 'Project Name',
      key: 'title',
      render: (row) => <span className="font-bold text-slate-800 dark:text-white text-sm">{row.title}</span>,
    },
    {
      header: isSomali ? 'Doorka Shaqada' : 'Assigned Trade Role',
      key: 'assignment_role',
      render: (row) => (
        <span className="capitalize px-3 py-1 rounded-full text-xs font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/80 dark:border-orange-900 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          {row.assignment_role || (isSomali ? 'Khabiir Goobta' : 'Field Specialist')}
        </span>
      ),
    },
    {
      header: isSomali ? 'Xaaladda' : 'Project Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: isSomali ? 'Horumarka Guud' : 'Overall Progress',
      key: 'progress_percentage',
      render: (row) => {
        const pct = Math.min(100, Math.max(0, Number(row.progress_percentage) || 0));
        return (
          <div className="w-32 space-y-1">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-700 p-0.5">
              <div
                className="bg-gradient-to-r from-orange-500 to-[#123C69] h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: isSomali ? 'Goobta' : 'Action',
      key: 'action',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="text-xs font-bold text-[#123C69] dark:text-orange-400 hover:text-orange-600 inline-flex items-center gap-1 transition-colors group"
        >
          <span>{isSomali ? 'Eeg Goobta' : 'View Site'}</span>
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
            ? "Eeg howlaha goobaha dhismaha ee laguu xilsaaray, talooyinka injineerrada, iyo ogeysiisyada badqabka shaqada."
            : "Review your field site assignments, daily engineering briefings, certified trade milestones, and work safety notices."
        }
        actions={
          <Link
            to="/notifications"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-colors shadow-xs"
          >
            <Bell className="w-4 h-4 text-orange-300" />
            <span>{isSomali ? 'Ogeysiisyada Goobta' : 'Site Notifications'}</span>
          </Link>
        }
      />

      {/* 2. Key Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={isSomali ? "Shaqooyinka Ii Socda" : "Active Assignments"}
          value={data?.active_assignments || 0}
          icon={HardHat}
          color="orange"
          subtitle={isSomali ? "Goobaha aad hadda ka shaqeyso" : "Sites currently active"}
        />
        <StatCard
          title={isSomali ? "Wadarta Goobaha" : "Lifetime Sites"}
          value={data?.total_assignments || 0}
          icon={FolderKanban}
          color="blue"
          subtitle={isSomali ? "Dhammaan mashaariicda aad ka qeyb qaadatay" : "Total projects engaged"}
        />
        <StatCard
          title={isSomali ? "Ogeysiisyada Cusub" : "Unread Alerts"}
          value={data?.unread_notifications || 0}
          icon={Bell}
          color="purple"
          subtitle={isSomali ? "Farriimaha injineerka" : "Engineering updates"}
        />
        <StatCard
          title={isSomali ? "Goobaha Shaqada" : "Active Workspaces"}
          value={data?.active_projects?.length || 0}
          icon={Building2}
          color="green"
          subtitle={isSomali ? "Mashaariicda socota" : "Sites under supervision"}
        />
      </div>

      {/* 3. Progress Velocity Bar Chart */}
      <div>
        <ProjectProgressBarChart
          projects={data?.active_projects || []}
          title={isSomali ? "Horumarka Goobaha Aad Ka Shaqeyso" : "Assigned Site Progress Tracker"}
          subtitle={isSomali ? "Heerka dhameystirka mashaariicda laguu qoray" : "Stage completion rates for projects you are assigned to"}
        />
      </div>

      {/* 4. Active Assignments & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Assignments Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <FileCheck2 className="w-4.5 h-4.5 text-[#123C69] dark:text-orange-400" />
                {isSomali ? 'Goobaha Dhismaha ee La Ii Xilsaaray' : 'Assigned Construction Sites'}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {isSomali ? 'Mashaariicda shaqada tooska ah iyo heerka la joogo' : 'Active field structures and timelines'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
            <DataTable
              columns={assignmentColumns}
              data={data?.active_projects || []}
              emptyMessage={isSomali ? "Ma jiraan goobo dhismo oo xilligan laguu xilsaaray." : "You have no active project site assignments at this moment."}
            />
          </div>
        </div>

        {/* Recent Site Milestones Feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-orange-500" />
              {isSomali ? 'Heerarka Horumarka Goobta' : 'Recent Site Milestones'}
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
            {data?.recent_progress && data.recent_progress.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_progress.map((prog) => (
                  <div key={prog.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5 group">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#123C69] dark:group-hover:text-orange-400 transition-colors">
                      {prog.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {prog.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-50 dark:border-slate-800">
                      <span className="font-medium truncate max-w-[140px]">{prog.project_title}</span>
                      <span className="font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-100 dark:border-orange-900">
                        {prog.progress_percentage}% {isSomali ? 'Marxalad' : 'Stage'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                {isSomali ? 'Ma jiraan horumar cusub oo la diiwaangeliyay dhowaan.' : 'No site updates logged recently.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
