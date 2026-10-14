import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  ClipboardList,
  CreditCard,
  Building2,
  ArrowRight,
  AlertCircle,
  PlusCircle,
  MapPin
} from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/helpers';

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard/client')
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

  if (loading) return <LoadingSpinner message="Loading client portal..." />;

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load your project data: {error}</span>
      </div>
    );
  }

  const projectColumns = [
    {
      header: 'Project Title',
      key: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.title}</p>
          <p className="text-[11px] text-slate-400">Lead: {row.engineer_name || 'Assigned Engineer'}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Site Progress',
      key: 'progress_percentage',
      render: (row) => (
        <div className="w-32 space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600">
            <span>{row.progress_percentage || 0}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${row.progress_percentage || 0}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Last Update',
      key: 'updated_at',
      render: (row) => formatDate(row.updated_at),
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="text-xs font-bold text-[#123c69] hover:text-orange-600 inline-flex items-center gap-1"
        >
          Track Site <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  const totalPayments = data?.payments?.by_status?.reduce(
    (sum, p) => sum + Number(p.total_amount || 0),
    0
  ) || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Property Owner Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your home construction phases, review certified progress logs, and check payments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/houses"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-[#123c69] border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Building2 className="w-4 h-4 text-orange-500" />
            Explore Designs
          </Link>
          <Link
            to="/requests"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#123c69] text-white hover:bg-[#1a4f8a] transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-orange-300" />
            New Construction Request
          </Link>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Projects"
          value={data?.projects?.total || 0}
          icon={FolderKanban}
          color="blue"
          subtitle="Sites under construction"
        />
        <StatCard
          title="My Requests"
          value={data?.requests?.total || 0}
          icon={ClipboardList}
          color="orange"
          subtitle="Proposals submitted"
        />
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(totalPayments)}
          icon={CreditCard}
          color="green"
          subtitle="Logged payment records"
        />
        <StatCard
          title="Milestones"
          value={data?.recent_projects?.length || 0}
          icon={Building2}
          color="purple"
          subtitle="Active builds"
        />
      </div>

      {/* Projects in Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">My Construction Projects</h3>
          <Link to="/projects" className="text-xs font-bold text-[#123c69] hover:underline flex items-center gap-1">
            All Projects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DataTable
          columns={projectColumns}
          data={data?.recent_projects || []}
          emptyMessage="You have not commissioned any construction projects yet."
        />
      </div>

      {/* Quick Action Prompt if no active projects */}
      {(!data?.recent_projects || data.recent_projects.length === 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl border border-blue-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-[#123c69]">Ready to start building your residence?</h4>
            <p className="text-xs text-slate-500">
              Browse our catalog of modern floor plans or connect with an engineer to begin site planning.
            </p>
          </div>
          <Link
            to="/houses"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shrink-0"
          >
            Explore House Designs
          </Link>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
