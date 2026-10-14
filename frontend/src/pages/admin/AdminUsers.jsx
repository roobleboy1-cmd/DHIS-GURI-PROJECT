import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, UserX, UserCheck, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/helpers';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = (page = 1) => {
    setLoading(true);
    const params = {
      page,
      limit: 10,
      ...(search && { search }),
      ...(roleFilter && { role: roleFilter }),
    };

    api.get('/users', { params })
      .then((res) => {
        setUsers(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter]);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}/status`, { is_active: !currentStatus });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      header: 'User Name & Email',
      key: 'full_name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#123c69] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {row.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs">{row.full_name}</p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      key: 'role',
      render: (row) => (
        <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#123c69] border border-blue-100">
          {row.role}
        </span>
      ),
    },
    {
      header: 'Phone Contact',
      key: 'phone',
      render: (row) => <span className="text-xs text-slate-600">{row.phone || 'N/A'}</span>,
    },
    {
      header: 'Account Status',
      key: 'is_active',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.is_active
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${row.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          {row.is_active ? 'Active' : 'Suspended'}
        </span>
      ),
    },
    {
      header: 'Registered Date',
      key: 'created_at',
      render: (row) => formatDate(row.created_at),
    },
    {
      header: 'Governance',
      key: 'actions',
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row.id, row.is_active)}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
            row.is_active
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          {row.is_active ? 'Deactivate' : 'Reactivate'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">System User Directory & Access Control</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, activate, and revoke platform access permissions across clients, engineers, and workers.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="">All Platform Roles</option>
          <option value="client">Clients</option>
          <option value="engineer">Engineers</option>
          <option value="worker">Tradesmen (Workers)</option>
          <option value="admin">Administrators</option>
        </select>

        <button
          onClick={() => fetchUsers(1)}
          className="px-4 py-2 text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white rounded-lg transition-colors"
        >
          Filter
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No platform accounts registered matching this filter"
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit || 10}
        onPageChange={(p) => fetchUsers(p)}
      />
    </div>
  );
};

export default AdminUsers;
