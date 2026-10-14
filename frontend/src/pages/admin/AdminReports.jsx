import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, FolderKanban, Building2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin')
      .then((res) => {
        setData(res.data?.data);
      })
      .catch((err) => {
        console.error('Failed to load reports:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner message="Synthesizing platform metrics..." />;

  const totalPaymentsAmount = data?.payments?.by_status?.reduce(
    (acc, curr) => acc + Number(curr.total_amount || 0),
    0
  ) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Platform Analytics & Financial Reports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Audited project distribution, cashflow settlement volume, and operational metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Cash Inflow"
          value={formatCurrency(totalPaymentsAmount)}
          icon={DollarSign}
          color="green"
          subtitle="All logged disbursements"
        />
        <StatCard
          title="Turnkey Sites"
          value={data?.projects?.total || 0}
          icon={FolderKanban}
          color="blue"
          subtitle="Managed projects"
        />
        <StatCard
          title="Catalog Inventory"
          value={data?.houses?.total || 0}
          icon={Building2}
          color="purple"
          subtitle="House designs published"
        />
        <StatCard
          title="Registered Stakeholders"
          value={data?.users?.total || 0}
          icon={Users}
          color="orange"
          subtitle="Verified users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Distribution Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Project Stage Breakdown</h3>
            <span className="text-xs font-semibold text-slate-400">Total: {data?.projects?.total || 0}</span>
          </div>

          <div className="space-y-3">
            {data?.projects?.by_status && data.projects.by_status.length > 0 ? (
              data.projects.by_status.map((item) => {
                const percent = data.projects.total > 0
                  ? Math.round((item.count / data.projects.total) * 100)
                  : 0;
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="capitalize text-slate-700">{item.status.replace('_', ' ')}</span>
                      <span className="text-slate-500">{item.count} Sites ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#123c69] h-2 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No projects recorded.</p>
            )}
          </div>
        </div>

        {/* Payments Settlement Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Payment Settlements by State</h3>
            <span className="text-xs font-semibold text-emerald-600 font-mono">
              {formatCurrency(totalPaymentsAmount)}
            </span>
          </div>

          <div className="space-y-4">
            {data?.payments?.by_status && data.payments.by_status.length > 0 ? (
              data.payments.by_status.map((item) => (
                <div key={item.status} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 capitalize">{item.status}</h4>
                    <p className="text-[10px] text-slate-400">{item.count} recorded transactions</p>
                  </div>
                  <span className="text-sm font-black text-slate-800 font-mono">
                    {formatCurrency(item.total_amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No payment entries registered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
