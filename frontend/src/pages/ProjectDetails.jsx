import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Building2,
  Calendar,
  CreditCard,
  HardHat,
  TrendingUp,
  FileText,
  User,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import SelectField from '../components/forms/SelectField';
import { formatCurrency, formatDate } from '../utils/helpers';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrEngineer = user?.role === 'admin' || user?.role === 'engineer';

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status Change State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [progressPercent, setProgressPercent] = useState('');

  // Assign Worker Modal
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [submittingWorker, setSubmittingWorker] = useState(false);
  const [allWorkers, setAllWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [workerRole, setWorkerRole] = useState('Mason');

  const fetchProject = () => {
    setLoading(true);
    api.get(`/projects/${id}`)
      .then((res) => {
        setProject(res.data?.data);
        setSelectedStatus(res.data?.data?.status || 'planning');
        setProgressPercent(res.data?.data?.progress_percentage || 0);
      })
      .catch((err) => {
        console.error('Failed to load project details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (isAdminOrEngineer) {
      api.get('/workers')
        .then((res) => setAllWorkers(res.data?.data || []))
        .catch(() => {});
    }
  }, [isAdminOrEngineer]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await api.patch(`/projects/${id}/status`, {
        status: selectedStatus,
        progress_percentage: Number(progressPercent),
      });
      fetchProject();
      alert('Project status updated.');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignWorker = async (e) => {
    e.preventDefault();
    setSubmittingWorker(true);
    try {
      await api.post(`/projects/${id}/workers`, {
        worker_id: Number(selectedWorkerId),
        role: workerRole,
      });
      setWorkerModalOpen(false);
      setSelectedWorkerId('');
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmittingWorker(false);
    }
  };

  const handleRemoveWorker = async (workerId) => {
    if (!confirm('Remove worker assignment from this site?')) return;
    try {
      await api.delete(`/projects/${id}/workers/${workerId}`);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading site construction workspace..." />;

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <Link to="/projects" className="text-xs font-bold text-primary underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Project List
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Location: {project.location || 'Site Unassigned'}</p>
        </div>

        {/* Quick Tabs to Progress & Documents */}
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${project.id}/progress`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#123c69] border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <TrendingUp className="w-4 h-4 text-orange-500" />
            Milestone Progress Logs
          </Link>
          <Link
            to={`/projects/${project.id}/documents`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#123c69] text-white hover:bg-[#1a4f8a] transition-colors shadow-md"
          >
            <FileText className="w-4 h-4 text-orange-300" />
            Site Documents & Blueprints
          </Link>
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completion</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#123c69]">{project.progress_percentage || 0}%</h3>
            <span className="text-xs font-medium text-slate-500">Stage target</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${project.progress_percentage || 0}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</span>
          <h3 className="text-2xl font-black text-slate-800">{formatCurrency(project.budget)}</h3>
          <p className="text-[11px] text-slate-400">Approved Construction Fund</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timeline</span>
          <h3 className="text-sm font-bold text-slate-800">{formatDate(project.start_date)}</h3>
          <p className="text-[11px] text-slate-400">to {formatDate(project.estimated_end_date)}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Field Crew</span>
          <h3 className="text-2xl font-black text-slate-800">{project.workers?.length || 0}</h3>
          <p className="text-[11px] text-slate-400">Assigned Tradesmen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scope & Status Management */}
        <div className="lg:col-span-7 space-y-6">
          {/* Project Narrative */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Project Scope & Engineering Specifications</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {project.description || 'Turnkey residential construction project.'}
            </p>
          </div>

          {/* Engineer/Admin Status Control Box */}
          {isAdminOrEngineer && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Update Project Status & Progress Percentage</h3>
              <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(e.target.value)}
                  placeholder="Progress %"
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />

                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? 'Saving...' : 'Update Status'}
                </button>
              </form>
            </div>
          )}

          {/* Stakeholders Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Project Stakeholders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                {project.client_avatar ? (
                  <img
                    src={project.client_avatar}
                    alt={project.client_name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#123c69]/10 text-[#123c69] flex items-center justify-center font-bold text-xs shrink-0">
                    {project.client_name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                )}
                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Property Owner</span>
                  <p className="font-bold text-slate-800 truncate">{project.client_name || 'N/A'}</p>
                  <p className="text-slate-500 truncate">{project.client_email}</p>
                  <p className="text-slate-500 truncate">{project.client_phone || 'No phone logged'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                {project.engineer_avatar ? (
                  <img
                    src={project.engineer_avatar}
                    alt={project.engineer_name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {project.engineer_name?.charAt(0).toUpperCase() || 'E'}
                  </div>
                )}
                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Structural Engineer</span>
                  <p className="font-bold text-orange-600 truncate">{project.engineer_name || 'Unassigned'}</p>
                  <p className="text-slate-500 truncate">{project.engineer_email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Worker Crew Roster */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Field Worker Crew</h3>
                <p className="text-[11px] text-slate-400">Tradesmen deployed on this site</p>
              </div>
              {isAdminOrEngineer && (
                <button
                  onClick={() => setWorkerModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Assign Worker
                </button>
              )}
            </div>

            {project.workers && project.workers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {project.workers.map((w) => (
                  <div key={w.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {w.worker_avatar ? (
                        <img
                          src={w.worker_avatar}
                          alt={w.worker_name}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200 shadow-xs"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#123c69] flex items-center justify-center font-bold text-xs shrink-0">
                          {w.worker_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-800">{w.worker_name}</p>
                        <p className="text-[10px] text-slate-400">{w.role || w.skill || 'Tradesman'}</p>
                      </div>
                    </div>

                    {isAdminOrEngineer && (
                      <button
                        onClick={() => handleRemoveWorker(w.worker_id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Remove assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No tradesmen deployed to this site yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Worker Modal */}
      <Modal
        isOpen={workerModalOpen}
        onClose={() => setWorkerModalOpen(false)}
        title="Assign Field Worker to Site"
      >
        <form onSubmit={handleAssignWorker} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Select Tradesman</label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              required
            >
              <option value="">Choose worker from registered pool</option>
              {allWorkers.map((w) => (
                <option key={w.user_id || w.id} value={w.user_id || w.id}>
                  {w.full_name} ({w.skill || 'Worker'})
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Specific Assignment Role on this Site"
            value={workerRole}
            onChange={(e) => setWorkerRole(e.target.value)}
            placeholder="e.g. Lead Formwork Carpenter"
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWorkerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingWorker}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
            >
              {submittingWorker ? 'Assigning...' : 'Assign to Site'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
