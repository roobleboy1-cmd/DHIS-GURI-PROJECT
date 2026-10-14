import React, { useState, useEffect } from 'react';
import { HardHat, Plus, Search, Filter, Phone, Mail, UserCheck } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import SelectField from '../components/forms/SelectField';
import { formatCurrency } from '../utils/helpers';

const Workers = () => {
  const { user } = useAuth();
  const isEngineer = user?.role === 'engineer';
  const isAdmin = user?.role === 'admin';

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [searchSkill, setSearchSkill] = useState('');
  const [availability, setAvailability] = useState('');

  // Register Worker Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    skill: 'Mason',
    experience_years: '',
    daily_rate: '',
  });

  const fetchWorkers = (page = 1) => {
    setLoading(true);
    const endpoint = isEngineer ? '/workers/my-workers' : '/workers';
    const params = {
      page,
      limit: 10,
      ...(searchSkill && { skill: searchSkill }),
      ...(availability && { availability }),
    };

    api.get(endpoint, { params })
      .then((res) => {
        setWorkers(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        console.error('Failed to load workers:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWorkers(1);
  }, [availability]);

  const handleRegisterWorker = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/workers', {
        ...formData,
        experience_years: Number(formData.experience_years) || 0,
        daily_rate: Number(formData.daily_rate) || 0,
      });
      setModalOpen(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        skill: 'Mason',
        experience_years: '',
        daily_rate: '',
      });
      fetchWorkers(1);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Worker Name',
      key: 'full_name',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatar_url ? (
            <img
              src={row.avatar_url}
              alt={row.full_name}
              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
              {row.full_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-slate-800">{row.full_name}</p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Primary Trade',
      key: 'skill',
      render: (row) => (
        <span className="font-semibold text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
          {row.skill || 'General Construction'}
        </span>
      ),
    },
    {
      header: 'Experience',
      key: 'experience_years',
      render: (row) => <span>{row.experience_years || 0} Years</span>,
    },
    {
      header: 'Daily Rate',
      key: 'daily_rate',
      render: (row) => <span className="font-semibold text-slate-800">{formatCurrency(row.daily_rate)}</span>,
    },
    {
      header: 'Availability',
      key: 'availability_status',
      render: (row) => <StatusBadge status={row.availability_status || 'available'} />,
    },
    {
      header: 'Contact',
      key: 'phone',
      render: (row) => <span className="text-xs text-slate-500">{row.phone || 'N/A'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Construction Field Crew</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isEngineer
              ? 'Roster of verified builders, carpenters, and masons registered under your engineering firm.'
              : 'Registered construction tradesmen available for project site deployment.'}
          </p>
        </div>

        {isEngineer && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Register New Tradesman
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            placeholder="Filter by trade (e.g. Mason, Electrician, Plumber)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="busy">Assigned (Busy)</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <button
          onClick={() => fetchWorkers(1)}
          className="px-4 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      <DataTable
        columns={columns}
        data={workers}
        loading={loading}
        emptyMessage="No construction tradesmen registered matching this filter"
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit || 10}
        onPageChange={(p) => fetchWorkers(p)}
      />

      {/* Register Worker Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Tradesman into Engineering Roster"
      >
        <form onSubmit={handleRegisterWorker} className="space-y-4">
          <InputField
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="e.g. Abdirahman Shire"
            required
          />

          <InputField
            label="Email Address (Login ID)"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="worker@company.com"
            required
          />

          <InputField
            label="Direct Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+252 61 XXXXXXX"
          />

          <SelectField
            label="Primary Construction Trade"
            value={formData.skill}
            onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
            options={[
              { value: 'Mason', label: 'Mason / Concrete Specialist' },
              { value: 'Carpenter', label: 'Structural Carpenter / Formwork' },
              { value: 'Electrician', label: 'Site Electrician' },
              { value: 'Plumber', label: 'Plumbing & Drainage' },
              { value: 'Steel Fixer', label: 'Rebar Steel Fixer' },
              { value: 'Painter', label: 'Finishing Painter & Plasterer' },
            ]}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Experience (Years)"
              type="number"
              value={formData.experience_years}
              onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              placeholder="e.g. 5"
            />
            <InputField
              label="Standard Daily Rate (USD)"
              type="number"
              value={formData.daily_rate}
              onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
              placeholder="e.g. 25"
            />
          </div>

          <InputField
            label="Initial Account Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Default: Worker@123"
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#123c69] hover:bg-[#1a4f8a] disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Worker'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Workers;
