import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  Calendar, 
  User, 
  HardHat, 
  Building2,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { t, isSomali } = useLanguage();
  const isAdmin = user?.role === 'admin';
  const isEngineer = user?.role === 'engineer';
  const isClient = user?.role === 'client';

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
      alert(isSomali ? 'Mashruuca si guul leh ayaa loo furay!' : 'Project site chartered successfully!');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: isSomali ? 'Magaca Mashruuca & Goobta' : 'Project Name & Location',
      key: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-white text-sm hover:text-orange-600 transition-colors">
            <Link to={`/projects/${row.id}`}>{row.title}</Link>
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
            <span>{row.location || (isSomali ? 'Goobta Lama Cayimin' : 'Site Location Not Specified')}</span>
          </div>
        </div>
      ),
    },
    {
      header: isSomali ? 'Macmiilka & Injineerka' : 'Client & Engineer',
      key: 'stakeholders',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="text-slate-700 dark:text-slate-300">
            {isSomali ? 'Macmiilka:' : 'Client:'} <span className="font-semibold text-slate-900 dark:text-white">{row.client_name || 'N/A'}</span>
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {isSomali ? 'Injineerka:' : 'Engineer:'} <span className="font-semibold text-orange-600 dark:text-orange-400">{row.engineer_name || (isSomali ? 'Lama xilsaarin' : 'Unassigned')}</span>
          </p>
        </div>
      ),
    },
    {
      header: isSomali ? 'Miisaaniyadda' : 'Budget',
      key: 'budget',
      render: (row) => <span className="font-bold text-xs text-slate-900 dark:text-white">{formatCurrency(row.budget)}</span>,
    },
    {
      header: isSomali ? 'Xaaladda' : 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: isSomali ? 'Horumarka Dhismaha' : 'Site Progress',
      key: 'progress_percentage',
      render: (row) => {
        const pct = row.progress_percentage || 0;
        return (
          <div className="w-32 space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>{pct}%</span>
              {pct >= 100 && <span className="text-[10px] text-emerald-600 font-extrabold">{isSomali ? 'Dhameystiran' : 'Done'}</span>}
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  pct >= 100 
                    ? 'bg-emerald-500' 
                    : pct >= 50 
                    ? 'bg-orange-500' 
                    : 'bg-[#123c69] dark:bg-sky-500'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: isSomali ? 'Taariikhda Dhameystirka' : 'Target Date',
      key: 'estimated_end_date',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.estimated_end_date ? formatDate(row.estimated_end_date) : (isSomali ? 'Lama cayimin' : 'Not set')}
        </span>
      ),
    },
    {
      header: isSomali ? 'Shaqada' : 'Action',
      key: 'action',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#123c69] dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white border border-sky-100 dark:border-sky-800 transition-all"
        >
          {isSomali ? 'Eeg Goobta' : 'Open Site'} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-orange-500" />
            {isSomali ? 'Goobaha Dhismaha ee Socda' : 'Active Construction Projects'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSomali 
              ? 'Mashaariicda dhismaha ee rasmiga ah oo ay kormeerayaan injineerrada shahaadada haysta.'
              : 'Structural build sites under active construction management and engineering supervision.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white shadow-md transition-all self-start sm:self-auto hover:scale-102"
          >
            <Plus className="w-4 h-4" /> 
            {isSomali ? 'Fur Mashruuc Cusub' : 'Charter New Project Site'}
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isSomali ? 'Ka raadi magaca mashruuca ama degmada...' : 'Search projects by title or district...'}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="">{isSomali ? 'Dhammaan Heerarka' : 'All Project Stages'}</option>
          <option value="planning">{isSomali ? 'Qorsheyn (Planning)' : 'Planning'}</option>
          <option value="in_progress">{isSomali ? 'Shaqadu Way Socotaa (Active)' : 'In Progress (Active)'}</option>
          <option value="paused">{isSomali ? 'Waa La Hakiyay (Paused)' : 'Paused'}</option>
          <option value="completed">{isSomali ? 'Waa La Dhameystiray (Completed)' : 'Completed & Handed Over'}</option>
        </select>

        <button
          onClick={() => fetchProjects(1)}
          className="px-4 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-xs"
        >
          {isSomali ? 'Kala Shaandhee' : 'Filter'}
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <DataTable
          columns={columns}
          data={projects}
          loading={loading}
          emptyMessage={isSomali ? 'Ma jiraan mashaariic dhisme oo la helay' : 'No construction projects recorded matching this filter'}
        />
      </div>

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
        title={isSomali ? 'Fur Mashruuc Dhisme oo Cusub' : 'Charter New Construction Site Project'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <InputField
            label={isSomali ? 'Magaca Mashruuca *' : 'Project Title *'}
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            placeholder={isSomali ? 'Tusaale: Dhismaha Villa Hilaac' : 'e.g. Villa Hilaac Residential Build'}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label={isSomali ? 'Goobta / Degmada *' : 'Site Location *'}
              value={createForm.location}
              onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
              placeholder={isSomali ? 'Tusaale: Hodan, Muqdisho' : 'e.g. Hodan, Mogadishu'}
              required
            />
            <InputField
              label={isSomali ? 'Miisaaniyadda (USD) *' : 'Approved Budget (USD) *'}
              type="number"
              value={createForm.budget}
              onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
              placeholder="e.g. 75000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {isSomali ? 'Milkiilaha Guriga (Client) *' : 'Project Owner (Client) *'}
              </label>
              <select
                value={createForm.client_id}
                onChange={(e) => setCreateForm({ ...createForm, client_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">{isSomali ? '-- Dooro Macmiilka --' : '-- Select Client --'}</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {isSomali ? 'Injineerka Kormeerka *' : 'Lead Engineer *'}
              </label>
              <select
                value={createForm.engineer_id}
                onChange={(e) => setCreateForm({ ...createForm, engineer_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">{isSomali ? '-- Dooro Injineerka --' : '-- Select Engineer --'}</option>
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
              label={isSomali ? 'Taariikhda Bilaabidda' : 'Groundbreaking Date'}
              type="date"
              value={createForm.start_date}
              onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
            />
            <InputField
              label={isSomali ? 'Taariikhda Dhameystirka' : 'Target Completion Date'}
              type="date"
              value={createForm.estimated_end_date}
              onChange={(e) => setCreateForm({ ...createForm, estimated_end_date: e.target.value })}
            />
          </div>

          <TextAreaField
            label={isSomali ? 'Faahfaahinta Dhismaha & Qeexitaanka Farsamada' : 'Project Scope & Engineering Specifications'}
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            placeholder={isSomali ? 'Faahfaahinta naqshadda, agabka dhismaha, iyo shuruudaha...' : 'Charter details, structural specifications, material standards...'}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isSomali ? 'Jooji' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#123c69] hover:bg-[#1a4f8a] disabled:opacity-50 transition-all shadow-md"
            >
              {submitting ? (isSomali ? 'Waa la furayaa...' : 'Chartering...') : (isSomali ? 'Fur Mashruuca' : 'Charter Project')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
