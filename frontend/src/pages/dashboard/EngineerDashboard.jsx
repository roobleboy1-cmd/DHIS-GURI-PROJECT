import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  HardHat,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  PlusCircle,
  FileCheck2
} from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const EngineerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <LoadingSpinner message="Loading engineering workspace..." />;

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load engineering metrics: {error}</span>
      </div>
    );
  }

  const projectColumns = [
    {
      header: 'Project Title',
      key: 'title',
      render: (row) => <span className="font-bold text-slate-800">{row.title}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Progress',
      key: 'progress_percentage',
      render: (row) => (
        <div className="w-32 space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600">
            <span>{row.progress_percentage || 0}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${row.progress_percentage || 0}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="text-xs font-bold text-[#123c69] hover:text-orange-600 inline-flex items-center gap-1"
        >
          View Workspace <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Lead Engineer Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervise assigned structural projects, site worker rosters, and milestone certifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/workers"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-[#123c69] border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <HardHat className="w-4 h-4 text-orange-500" />
            Manage Workers
          </Link>
          <Link
            to="/requests"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#123c69] text-white hover:bg-[#1a4f8a] transition-colors"
          >
            <ClipboardList className="w-4 h-4 text-orange-300" />
            Client Proposals
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Projects"
          value={data?.projects?.total || 0}
          icon={FolderKanban}
          color="blue"
          subtitle="Sites under supervision"
        />
        <StatCard
          title="Registered Workers"
          value={data?.workers?.total || 0}
          icon={HardHat}
          color="orange"
          subtitle="In your work crew"
        />
        <StatCard
          title="Pending Inquiries"
          value={data?.pending_requests || 0}
          icon={ClipboardList}
          color="purple"
          subtitle="Requests awaiting action"
        />
        <StatCard
          title="Recent Audits"
          value={data?.recent_progress?.length || 0}
          icon={TrendingUp}
          color="green"
          subtitle="Progress logs logged"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Projects Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Assigned Construction Sites</h3>
            <Link to="/projects" className="text-xs font-bold text-[#123c69] hover:underline flex items-center gap-1">
              All Sites <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DataTable
            columns={projectColumns}
            data={data?.recent_projects || []}
            emptyMessage="You have no active projects currently assigned"
          />
        </div>

        {/* Recent Progress Logs Feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Latest Site Updates</h3>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            {data?.recent_progress && data.recent_progress.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {data.recent_progress.map((prog) => (
                  <div key={prog.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{prog.title}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(prog.created_at)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{prog.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Project: {prog.project_title || 'Site'}</span>
                      <span className="font-semibold text-primary">{prog.progress_percentage}% Milestone</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No progress milestones reported recently.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
