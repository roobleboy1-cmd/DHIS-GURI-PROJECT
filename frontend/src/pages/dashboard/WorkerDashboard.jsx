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

const WorkerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <LoadingSpinner message="Loading worker station..." />;

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">Failed to load worker metrics: {error}</span>
      </div>
    );
  }

  const assignmentColumns = [
    {
      header: 'Project Name',
      key: 'title',
      render: (row) => <span className="font-bold text-slate-800 text-sm">{row.title}</span>,
    },
    {
      header: 'Assigned Trade Role',
      key: 'assignment_role',
      render: (row) => (
        <span className="capitalize px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200/80 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          {row.assignment_role || 'Field Specialist'}
        </span>
      ),
    },
    {
      header: 'Project Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Overall Progress',
      key: 'progress_percentage',
      render: (row) => {
        const pct = Math.min(100, Math.max(0, Number(row.progress_percentage) || 0));
        return (
          <div className="w-32 space-y-1">
            <div className="text-[11px] font-bold text-slate-700">
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50 p-0.5">
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
      header: 'Action',
      key: 'action',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="text-xs font-bold text-[#123C69] hover:text-orange-600 inline-flex items-center gap-1 transition-colors group"
        >
          <span>View Site</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Welcome Banner */}
      <WelcomeBanner
        subtitle="Review your field site assignments, daily engineering briefings, certified trade milestones, and work safety notices."
        actions={
          <Link
            to="/notifications"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-colors shadow-xs"
          >
            <Bell className="w-4 h-4 text-orange-300" />
            <span>Site Notifications</span>
          </Link>
        }
      />

      {/* 2. Key Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Assignments"
          value={data?.active_assignments || 0}
          icon={HardHat}
          color="orange"
          subtitle="Sites currently active"
        />
        <StatCard
          title="Lifetime Sites"
          value={data?.total_assignments || 0}
          icon={FolderKanban}
          color="blue"
          subtitle="Total projects engaged"
        />
        <StatCard
          title="Unread Alerts"
          value={data?.unread_notifications || 0}
          icon={Bell}
          color="purple"
          subtitle="Engineering updates"
        />
        <StatCard
          title="Active Workspaces"
          value={data?.active_projects?.length || 0}
          icon={Building2}
          color="green"
          subtitle="Sites under supervision"
        />
      </div>

      {/* 3. Progress Velocity Bar Chart */}
      <div>
        <ProjectProgressBarChart
          projects={data?.active_projects || []}
          title="Assigned Site Progress Tracker"
          subtitle="Stage completion rates for projects you are assigned to"
        />
      </div>

      {/* 4. Active Assignments & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Assignments Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <FileCheck2 className="w-4.5 h-4.5 text-[#123C69]" />
                Assigned Construction Sites
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Active field structures and timelines</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <DataTable
              columns={assignmentColumns}
              data={data?.active_projects || []}
              emptyMessage="You have no active project site assignments at this moment."
            />
          </div>
        </div>

        {/* Recent Site Milestones Feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-orange-500" />
              Recent Site Milestones
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {data?.recent_progress && data.recent_progress.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {data.recent_progress.map((prog) => (
                  <div key={prog.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5 group">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#123C69] transition-colors">
                      {prog.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {prog.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                      <span className="font-medium truncate max-w-[140px]">{prog.project_title}</span>
                      <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                        {prog.progress_percentage}% Stage
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No site updates logged recently.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
