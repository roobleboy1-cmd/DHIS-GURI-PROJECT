import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Search, Filter, ArrowRight, Calendar, User, HardHat } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import TextAreaField from '../components/forms/TextAreaField';
import SelectField from '../components/forms/SelectField';
import { formatCurrency, formatDate } from '../utils/helpers';

const Projects = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Admin Create Project Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientsList, setClientsList] = useState([]);
  const [engineersList, setEngineersList] = useState([]);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    client_id: '',
    engineer_id: '',
    start_date: '',
    estimated_end_date: '',
  });

  const fetchProjects = (page = 1) => {
    setLoading(true);
    const params = {
      page,
      limit: 10,
      ...(statusFilter && { status: statusFilter }),
      ...(search && { search }),
    };

    api.get('/projects', { params })
      .then((res) => {
        setProjects(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        console.error('Failed to load projects:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects(1);
  }, [statusFilter]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/users?role=client').then((res) => setClientsList(res.data?.data || [])).catch(() => {});
      api.get('/users?role=engineer').then((res) => setEngineersList(res.data?.data || [])).catch(() => {});
    }
  }, [isAdmin]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', {
        ...createForm,
        budget: Number(createForm.budget) || 0,
        client_id: Number(createForm.client_id),
        engineer_id: Number(createForm.engineer_id),
      });
      setModalOpen(false);
      setCreateForm({
        title: '',
        description: '',
        location: '',
        budget: '',
        client_id: '',
        engineer_id: '',
        start_date: '',
        estimated_end_date: '',
      });
      fetchProjects(1);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Project Name & Location',
      key: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-sm">{row.title}</p>
          <p className="text-[11px] text-slate-400">{row.location || 'Site Location Not Specified'}</p>
        </div>
      ),
    },
    {
      header: 'Client & Engineer',
      key: 'stakeholders',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="text-slate-700">Client: <span className="font-semibold">{row.client_name || 'N/A'}</span></p>
          <p className="text-slate-500">Engineer: <span className="font-semibold text-orange-600">{row.engineer_name || 'Unassigned'}</span></p>
        </div>
      ),
    },
    {
      header: 'Budget',
      key: 'budget',
      render: (row) => <span className="font-semibold text-xs text-slate-800">{formatCurrency(row.budget)}</span>,
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
        <div className="w-28 space-y-1">
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
      header: 'Target Date',
      key: 'estimated_end_date',
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.estimated_end_date)}</span>,
    },
    {
      header: 'Action',
      key: 'action',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="text-xs font-bold text-[#123c69] hover:text-orange-600 inline-flex items-center gap-1"
        >
          Open Site <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Active Construction Projects</h1>
          <p className="text-xs text-slate-500 mt-1">
            Structural build sites under active construction management and engineering supervision.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Charter New Project Site
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title or district..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="">All Project Stages</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress (Active)</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed & Handed Over</option>
        </select>

        <button
          onClick={() => fetchProjects(1)}
          className="px-4 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          Filter
        </button>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        loading={loading}
        emptyMessage="No construction projects recorded matching this filter"
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit || 10}
        onPageChange={(p) => fetchProjects(p)}
      />

      {/* Admin Charter Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Charter New Construction Site Project"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <InputField
            label="Project Title"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            placeholder="e.g. Villa Hilaac Residential Build"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Site Location"
              value={createForm.location}
              onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
              placeholder="e.g. Hodan, Mogadishu"
              required
            />
            <InputField
              label="Approved Budget (USD)"
              type="number"
              value={createForm.budget}
              onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
              placeholder="e.g. 75000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Project Owner (Client) *</label>
              <select
                value={createForm.client_id}
                onChange={(e) => setCreateForm({ ...createForm, client_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                required
              >
                <option value="">Select Client</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Lead Engineer *</label>
              <select
                value={createForm.engineer_id}
                onChange={(e) => setCreateForm({ ...createForm, engineer_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                required
              >
                <option value="">Select Engineer</option>
                {engineersList.map((eng) => (
                  <option key={eng.id} value={eng.id}>
                    {eng.full_name} ({eng.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Groundbreaking Date"
              type="date"
              value={createForm.start_date}
              onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
            />
            <InputField
              label="Target Completion Date"
              type="date"
              value={createForm.estimated_end_date}
              onChange={(e) => setCreateForm({ ...createForm, estimated_end_date: e.target.value })}
            />
          </div>

          <TextAreaField
            label="Project Scope & Engineering Specifications"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            placeholder="Charter details, structural specifications, material standards..."
            rows={3}
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
              {submitting ? 'Chartering...' : 'Charter Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
