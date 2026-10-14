import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  FolderKanban,
  ClipboardList,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/helpers';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard/admin')
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

  if (loading) return <LoadingSpinner message="Loading admin intelligence..." />;

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load admin metrics: {error}</span>
      </div>
    );
  }

  const columns = [
    {
      header: 'Project Title',
      key: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.title}</p>
          <p className="text-[11px] text-slate-400">Client: {row.client_name || 'N/A'}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Engineer',
      key: 'engineer_name',
      render: (row) => <span className="font-medium text-slate-700">{row.engineer_name || 'Unassigned'}</span>,
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
      header: 'Created Date',
      key: 'created_at',
      render: (row) => formatDate(row.created_at),
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
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">System Administrator Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time oversight across users, construction catalogs, engineering requests, and cashflow.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={data?.users?.total || 0}
          icon={Users}
          color="blue"
          subtitle="Engineers, clients, workers"
        />
        <StatCard
          title="House Listings"
          value={data?.houses?.total || 0}
          icon={Building2}
          color="purple"
          subtitle="Available in catalog"
        />
        <StatCard
          title="Construction Projects"
          value={data?.projects?.total || 0}
          icon={FolderKanban}
          color="green"
          subtitle="Managed in system"
        />
        <StatCard
          title="Pending Inquiries"
          value={data?.requests?.total || 0}
          icon={ClipboardList}
          color="orange"
          subtitle="Client proposals"
        />
      </div>

      {/* Role Breakdown & Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">User Role Distribution</h3>
            <Link to="/admin/users" className="text-xs font-semibold text-primary hover:underline">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {data?.users?.by_role?.map((item) => (
              <div key={item.role} className="flex items-center justify-between text-xs">
                <span className="capitalize font-medium text-slate-600">{item.role}s</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Statuses */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Projects by Status</h3>
            <Link to="/projects" className="text-xs font-semibold text-primary hover:underline">
              All Projects
            </Link>
          </div>
          <div className="space-y-3">
            {data?.projects?.by_status?.length > 0 ? (
              data.projects.by_status.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-xs">
                  <span className="capitalize font-medium text-slate-600">{item.status.replace('_', ' ')}</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {item.count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No projects recorded yet.</p>
            )}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Payment Records</h3>
            <Link to="/payments" className="text-xs font-semibold text-primary hover:underline">
              Records
            </Link>
          </div>
          <div className="space-y-3">
            {data?.payments?.by_status?.length > 0 ? (
              data.payments.by_status.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-xs">
                  <span className="capitalize font-medium text-slate-600">{item.status}</span>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{formatCurrency(item.total_amount)}</p>
                    <p className="text-[10px] text-slate-400">({item.count} entries)</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No payment entries logged.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Recent Construction Projects</h3>
          <Link to="/projects" className="text-xs font-bold text-[#123c69] hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={data?.recent_projects || []}
          emptyMessage="No construction projects recorded yet"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
