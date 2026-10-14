import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  HardHat,
  Bell,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

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
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load worker metrics: {error}</span>
      </div>
    );
  }

  const assignmentColumns = [
    {
      header: 'Project Name',
      key: 'title',
      render: (row) => <span className="font-bold text-slate-800">{row.title}</span>,
    },
    {
      header: 'Assigned Role',
      key: 'assignment_role',
      render: (row) => (
        <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          {row.assignment_role || 'Field Worker'}
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
      render: (row) => (
        <div className="w-28 space-y-1">
          <div className="text-[11px] font-semibold text-slate-600">
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
          View Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">On-Site Worker Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your assigned construction sites, safety briefings, and milestone targets.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active Assignments"
          value={data?.active_assignments || 0}
          icon={HardHat}
          color="orange"
          subtitle="Sites currently active"
        />
        <StatCard
          title="Total Lifetime Sites"
          value={data?.total_assignments || 0}
          icon={FolderKanban}
          color="blue"
          subtitle="Past & present projects"
        />
        <StatCard
          title="Unread Alerts"
          value={data?.unread_notifications || 0}
          icon={Bell}
          color="purple"
          subtitle="Notifications from engineers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Assignments Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Assigned Construction Sites</h3>
          </div>

          <DataTable
            columns={assignmentColumns}
            data={data?.active_projects || []}
            emptyMessage="You have no active project site assignments at this moment."
          />
        </div>

        {/* Recent Site Updates */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-base font-bold text-slate-800">Recent Site Milestones</h3>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            {data?.recent_progress && data.recent_progress.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {data.recent_progress.map((prog) => (
                  <div key={prog.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <p className="text-xs font-bold text-slate-800">{prog.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{prog.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{prog.project_title}</span>
                      <span className="font-bold text-orange-600">{prog.progress_percentage}% Stage</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
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
