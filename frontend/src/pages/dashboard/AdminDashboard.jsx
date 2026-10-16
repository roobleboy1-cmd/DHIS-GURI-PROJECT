import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  FolderKanban,
  ClipboardList,
  ArrowRight,
  AlertCircle,
  Plus,
  Compass,
  FileCheck2,
} from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import ProjectStatusDonutChart from '../../components/dashboard/ProjectStatusDonutChart';
import ProjectProgressBarChart from '../../components/dashboard/ProjectProgressBarChart';
import UserRoleDistributionChart from '../../components/dashboard/UserRoleDistributionChart';
import { formatDate } from '../../utils/helpers';

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

  if (loading) return <LoadingSpinner message="Loading executive dashboard..." />;

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">Failed to load admin metrics: {error}</span>
      </div>
    );
  }

  const columns = [
    {
      header: 'Project Title',
      key: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-sm">{row.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Client: {row.client_name || 'Individual Owner'}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Engineer',
      key: 'engineer_name',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 text-xs">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          {row.engineer_name || 'Pending Lead'}
        </span>
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
      render: (row) => {
        const pct = Math.min(100, Math.max(0, Number(row.progress_percentage) || 0));
        return (
          <div className="w-32 space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-700">
              <span>{pct}%</span>
              <span className="text-[10px] text-slate-400 font-normal">Completed</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50 p-0.5">
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
      header: 'Initiated Date',
      key: 'created_at',
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span>,
    },
    {
      header: 'Workspace',
      key: 'action',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="text-xs font-bold text-[#123C69] hover:text-orange-600 inline-flex items-center gap-1 transition-colors group"
        >
          <span>Open Site</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Executive Welcome Banner */}
      <WelcomeBanner
        subtitle="Complete high-level oversight across construction sites, architectural floor plans, workforce rosters, and project requests."
        actions={
          <>
            <Link
              to="/houses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-colors shadow-xs"
            >
              <Compass className="w-4 h-4 text-orange-300" />
              <span>Catalog Designs</span>
            </Link>
            <Link
              to="/requests"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Review Requests</span>
            </Link>
          </>
        }
      />

      {/* 2. Primary Metric Summary Cards (No Payment / Financial Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Projects"
          value={data?.projects?.total || 0}
          icon={FolderKanban}
          color="blue"
          subtitle="Supervised construction sites"
        />
        <StatCard
          title="House Models"
          value={data?.houses?.total || 0}
          icon={Building2}
          color="purple"
          subtitle="Catalog designs in portfolio"
        />
        <StatCard
          title="Total Workforce"
          value={data?.users?.total || 0}
          icon={Users}
          color="green"
          subtitle="Engineers, specialists & clients"
        />
        <StatCard
          title="Client Proposals"
          value={data?.requests?.total || 0}
          icon={ClipboardList}
          color="orange"
          subtitle="New construction inquiries"
        />
      </div>

      {/* 3. Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Status Donut */}
        <div className="lg:col-span-5 flex flex-col">
          <ProjectStatusDonutChart
            data={data?.projects?.by_status || []}
            title="Project Pipeline Distribution"
            subtitle="Current operational phases of all projects"
          />
        </div>

        {/* User Role Distribution */}
        <div className="lg:col-span-7 flex flex-col">
          <UserRoleDistributionChart
            roles={data?.users?.by_role || []}
            totalUsers={data?.users?.total || 0}
          />
        </div>
      </div>

      {/* 4. Project Progress Milestones */}
      <div>
        <ProjectProgressBarChart
          projects={data?.recent_projects || []}
          title="Active Site Progress Tracker"
          subtitle="Live milestone progress across current projects"
        />
      </div>

      {/* 5. Recent Projects Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-4.5 h-4.5 text-[#123C69]" />
              Recent Construction Sites
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Most recently initiated building projects</p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-bold text-[#123C69] hover:text-orange-600 transition-colors inline-flex items-center gap-1"
          >
            Browse All Projects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <DataTable
            columns={columns}
            data={data?.recent_projects || []}
            emptyMessage="No construction projects recorded yet."
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
