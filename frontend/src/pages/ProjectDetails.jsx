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
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  DollarSign
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import SelectField from '../components/forms/SelectField';
import TextAreaField from '../components/forms/TextAreaField';
import { formatCurrency, formatDate } from '../utils/helpers';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isSomali } = useLanguage();
  const isAdminOrEngineer = user?.role === 'admin' || user?.role === 'engineer';
  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';

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

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'EVC Plus',
    reference_number: '',
    description: '',
  });

  const fetchProject = () => {
    setLoading(true);
    api.get(`/projects/${id}`)
      .then((res) => {
        const p = res.data?.data;
        setProject(p);
        setSelectedStatus(p?.status || 'planning');
        setProgressPercent(p?.progress_percentage || 0);
        if (p?.budget) {
          setPaymentForm((prev) => ({
            ...prev,
            amount: p.budget,
            description: isSomali ? `Lacag-bixinta mashruuca ${p.title}` : `Payment for ${p.title}`
          }));
        }
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
      alert(isSomali ? 'Xaaladda mashruuca si guul leh ayaa loo cusbooneysiiyay!' : 'Project status updated.');
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
      alert(isSomali ? 'Shaqaalaha si guul leh ayaa loogu daray goobta!' : 'Worker assigned to site.');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmittingWorker(false);
    }
  };

  const handleRemoveWorker = async (workerId) => {
    if (!confirm(isSomali ? 'Ma hubtaa inaad shaqaalahan ka saarayso goobta dhismaha?' : 'Remove worker assignment from this site?')) return;
    try {
      await api.delete(`/projects/${id}/workers/${workerId}`);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    setSubmittingPayment(true);
    try {
      await api.post('/payments', {
        project_id: Number(id),
        client_id: project.client_id,
        amount: Number(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        reference_number: paymentForm.reference_number || `TX-${Date.now().toString().slice(-6)}`,
        description: paymentForm.description,
      });
      setPaymentModalOpen(false);
      fetchProject();
      alert(isSomali ? 'Lacag-bixintaadu si guul leh ayaa loo xareeyay! Maamulka iyo Injineerka ayaa helay farriinta.' : 'Payment successfully recorded and notifications sent!');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) return <LoadingSpinner message={isSomali ? "Soo dejinaya faahfaahinta mashruuca dhismaha..." : "Loading site construction workspace..."} />;

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {isSomali ? 'Lama helin mashruucan' : 'Project Not Found'}
        </h2>
        <Link to="/projects" className="text-xs font-bold text-orange-500 underline">
          {isSomali ? 'Ku noqo Mashaariicda' : 'Return to Projects'}
        </Link>
      </div>
    );
  }

  const isCompleted = project.status === 'completed' || project.progress_percentage >= 100;

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> {isSomali ? 'Ku noqo Mashaariicda' : 'Back to Project List'}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isSomali ? 'Goobta Dhismaha:' : 'Location:'} <span className="font-semibold text-slate-700 dark:text-slate-300">{project.location || 'Mogadishu'}</span>
          </p>
        </div>

        {/* Quick Tabs to Progress & Documents & Payment Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Make Payment Button */}
          {(isClient || isAdmin) && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:scale-[1.02]"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isSomali ? 'Bixi Lacagta Mashruuca' : 'Make Payment'}</span>
            </button>
          )}

          <Link
            to={`/projects/${project.id}/progress`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-[#123c69] dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span>{isSomali ? 'Horumarka & Sawirrada Goobta' : 'Milestone Progress Logs'}</span>
          </Link>

          <Link
            to={`/projects/${project.id}/documents`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#123c69] text-white hover:bg-[#1a4f8a] transition-colors shadow-md"
          >
            <FileText className="w-4 h-4 text-orange-300" />
            <span>{isSomali ? 'Dukumentiyada & Qorshayaasha' : 'Site Documents'}</span>
          </Link>
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                {isSomali ? '🎉 Hambalyo! Dhismaha Gurigan Waa La Dhameystiray (100%)!' : '🎉 Congratulations! This Construction Project is 100% Completed!'}
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {isSomali
                  ? 'Dhammaan shaqadii dhismaha goobta si buuxda ayaa loo fuliyay. Waxaad hadda sameyn kartaa lacag-bixinta kama dambaysta ah.'
                  : 'All physical site milestones are completed and verified by the structural engineer.'}
              </p>
            </div>
          </div>
          {(isClient || isAdmin) && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-emerald-800 hover:bg-emerald-50 shadow-md transition-all shrink-0"
            >
              {isSomali ? 'Bixi Lacagta Kama Dambaysta ah' : 'Make Final Disbursement'}
            </button>
          )}
        </div>
      )}

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isSomali ? 'Horumarka Dhismaha' : 'Completion'}
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#123c69] dark:text-orange-400">{project.progress_percentage || 0}%</h3>
            <span className="text-xs font-medium text-slate-500">
              {isCompleted ? (isSomali ? 'Waa Dhameystiran' : 'Finished') : (isSomali ? 'Wuu Socdaa' : 'In Progress')}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                isCompleted ? 'bg-emerald-500' : 'bg-orange-500'
              }`}
              style={{ width: `${project.progress_percentage || 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isSomali ? 'Miisaaniyadda' : 'Budget'}
          </span>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(project.budget)}</h3>
          <p className="text-[11px] text-slate-400">{isSomali ? 'Kharashka Dhismaha' : 'Approved Construction Fund'}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isSomali ? 'Jadwalka Shaqada' : 'Timeline'}
          </span>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{formatDate(project.start_date)}</h3>
          <p className="text-[11px] text-slate-400">
            {isSomali ? 'ilaa' : 'to'} {formatDate(project.actual_end_date || project.estimated_end_date)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isSomali ? 'Shaqaalaha Goobta' : 'Field Crew'}
          </span>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">{project.workers?.length || 0}</h3>
          <p className="text-[11px] text-slate-400">{isSomali ? 'Khabiirada ku qoran goobta' : 'Assigned Tradesmen'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scope & Status Management & Payments */}
        <div className="lg:col-span-7 space-y-6">
          {/* Project Narrative */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {isSomali ? 'Qorshaha Dhismaha & Faahfaahinta Farsamo' : 'Project Scope & Engineering Specifications'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {project.description || 'Turnkey residential construction project in Somalia.'}
            </p>
          </div>

          {/* Engineer/Admin Status Control Box */}
          {isAdminOrEngineer && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {isSomali ? 'Cusbooneysii Xaaladda & Boqolleyda Horumarka' : 'Update Project Status & Progress Percentage'}
              </h3>
              <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-white"
                >
                  <option value="planning">{isSomali ? 'Qorsheyn' : 'Planning'}</option>
                  <option value="in_progress">{isSomali ? 'Wuu Socdaa' : 'In Progress'}</option>
                  <option value="paused">{isSomali ? 'La Joojiyay' : 'Paused'}</option>
                  <option value="completed">{isSomali ? 'Dhameystiran' : 'Completed'}</option>
                  <option value="cancelled">{isSomali ? 'La Kansalay' : 'Cancelled'}</option>
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(e.target.value)}
                  placeholder="Progress %"
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                />

                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? (isSomali ? 'Keydinaya...' : 'Saving...') : (isSomali ? 'Keydi Xaaladda' : 'Update Status')}
                </button>
              </form>
            </div>
          )}

          {/* Stakeholders Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {isSomali ? 'Dhinacyada Mashruuca (Macmiilka & Injineerka)' : 'Project Stakeholders'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-start gap-3">
                {project.client_avatar ? (
                  <img
                    src={project.client_avatar}
                    alt={project.client_name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#123c69]/10 text-[#123c69] dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {project.client_name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                )}
                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isSomali ? 'Milkiilaha Guriga' : 'Property Owner'}
                  </span>
                  <p className="font-bold text-slate-800 dark:text-white truncate">{project.client_name || 'N/A'}</p>
                  <p className="text-slate-500 dark:text-slate-400 truncate">{project.client_email}</p>
                  <p className="text-slate-500 dark:text-slate-400 truncate">{project.client_phone || 'No phone logged'}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-start gap-3">
                {project.engineer_avatar ? (
                  <img
                    src={project.engineer_avatar}
                    alt={project.engineer_name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {project.engineer_name?.charAt(0).toUpperCase() || 'E'}
                  </div>
                )}
                <div className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isSomali ? 'Injineerka Kormeerka' : 'Lead Structural Engineer'}
                  </span>
                  <p className="font-bold text-orange-600 dark:text-orange-400 truncate">{project.engineer_name || 'Unassigned'}</p>
                  <p className="text-slate-500 dark:text-slate-400 truncate">{project.engineer_email}</p>
                  <p className="text-slate-500 dark:text-slate-400 truncate">{project.engineer_phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Payments History Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>{isSomali ? 'Lacag-bixinnada Mashruuca' : 'Project Payments & Disbursements'}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isSomali ? 'Taariikhda lacag-bixinta goobta dhismaha' : 'Staged disbursement ledger for this site'}
                </p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSomali ? 'Bixi Lacag' : 'Add Payment'}</span>
              </button>
            </div>

            {project.payments && project.payments.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {project.payments.map((py) => (
                  <div key={py.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{formatCurrency(py.amount)}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {py.payment_method} • {py.reference_number || `TX-#${py.id}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={py.status} />
                      <span className="text-[10px] text-slate-400">{formatDate(py.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                {isSomali ? 'Weli wax lacag-bixin ah lagama xareyn mashruucan.' : 'No payment records logged for this project yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Worker Crew Roster & Recent Progress Milestones */}
        <div className="lg:col-span-5 space-y-6">
          {/* Worker Crew Roster */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {isSomali ? 'Shaqaalaha Goobta Ka Howlgala' : 'Field Worker Crew'}
                </h3>
                <p className="text-[11px] text-slate-400">{isSomali ? 'Khabiirada ku qoran dhismaha' : 'Tradesmen deployed on this site'}</p>
              </div>
              {isAdminOrEngineer && (
                <button
                  onClick={() => setWorkerModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> {isSomali ? 'Ku dar Shaqaale' : 'Assign Worker'}
                </button>
              )}
            </div>

            {project.workers && project.workers.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {project.workers.map((w) => (
                  <div key={w.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {w.worker_avatar ? (
                        <img
                          src={w.worker_avatar}
                          alt={w.worker_name}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#123c69] dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {w.worker_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{w.worker_name}</p>
                        <p className="text-[10px] text-slate-400">{w.role || w.skill || 'Tradesman'}</p>
                      </div>
                    </div>

                    {isAdminOrEngineer && (
                      <button
                        onClick={() => handleRemoveWorker(w.worker_id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title={isSomali ? 'Ka saar goobta' : 'Remove assignment'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                {isSomali ? 'Weli shaqaale laguma xilsaarin goobtan.' : 'No tradesmen deployed to this site yet.'}
              </div>
            )}
          </div>

          {/* Recent Milestones Diary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {isSomali ? 'Heerarkii Ugu Dambeeyay ee Goobta' : 'Recent Site Milestones'}
                </h3>
                <p className="text-[11px] text-slate-400">{isSomali ? 'Horumarkii ugu dambeeyay ee la diiwaangeliyay' : 'Latest milestone updates'}</p>
              </div>
              <Link
                to={`/projects/${project.id}/progress`}
                className="text-xs font-bold text-orange-500 hover:underline"
              >
                {isSomali ? 'Dhammaan' : 'View All'}
              </Link>
            </div>

            {project.recent_progress && project.recent_progress.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {project.recent_progress.slice(0, 4).map((prog) => (
                  <div key={prog.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-white">{prog.title}</span>
                      <span className="font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md text-[10px]">
                        {prog.progress_percentage}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{prog.description}</p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">{formatDate(prog.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                {isSomali ? 'Weli wax horumar ah lagama diiwaangelin goobtan.' : 'No site milestones logged yet.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Worker Modal */}
      <Modal
        isOpen={workerModalOpen}
        onClose={() => setWorkerModalOpen(false)}
        title={isSomali ? 'Ku Dar Shaqaale Goobta Dhismaha' : 'Assign Field Worker to Site'}
      >
        <form onSubmit={handleAssignWorker} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isSomali ? 'Dooro Shaqaalaha' : 'Select Tradesman'}
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
              required
            >
              <option value="">{isSomali ? '-- Dooro Shaqaale Diyaar ah --' : 'Choose worker from registered pool'}</option>
              {allWorkers.map((w) => (
                <option key={w.user_id || w.id} value={w.user_id || w.id}>
                  🔨 {w.full_name} ({w.skill || 'Worker'})
                </option>
              ))}
            </select>
          </div>

          <InputField
            label={isSomali ? 'Doorka Gaarka ah ee Goobta' : 'Specific Assignment Role on this Site'}
            value={workerRole}
            onChange={(e) => setWorkerRole(e.target.value)}
            placeholder="e.g. Mason / Carpenter / Electrician"
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setWorkerModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isSomali ? 'Jooji' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submittingWorker}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md disabled:opacity-50"
            >
              {submittingWorker ? (isSomali ? 'Ku daraya...' : 'Assigning...') : (isSomali ? 'Ku Dar Goobta' : 'Assign to Site')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Make Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={isSomali ? `Bixi Lacagta Mashruuca: ${project.title}` : `Make Payment for ${project.title}`}
      >
        <form onSubmit={handleMakePayment} className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              {isSomali
                ? 'Waxaad lacagta ku bixin kartaa adeegyada lacag-bixinta mobaylka Soomaaliya (EVC Plus, ZAAD, Sahal) ama xawaaladaha bangiyada.'
                : 'Supports Somalia mobile money (EVC Plus, ZAAD, Sahal) and verified wire transfers.'}
            </span>
          </div>

          <InputField
            label={isSomali ? 'Cadadka Lacagta (USD)' : 'Payment Amount (USD)'}
            type="number"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            placeholder="e.g. 5000"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isSomali ? 'Habka Lacag-bixinta' : 'Payment Method'}
            </label>
            <select
              value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
              className="w-full px-3 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
            >
              <option value="EVC Plus">📱 Hormuud EVC Plus</option>
              <option value="ZAAD Service">📱 Telesom ZAAD Service</option>
              <option value="Sahal Service">📱 Golis Sahal Service</option>
              <option value="Salaam Somali Bank">🏦 Salaam Somali Bank</option>
              <option value="Dahabshiil Bank">🏦 Dahabshiil Bank</option>
              <option value="Premier Bank">🏦 Premier Bank Wire Transfer</option>
              <option value="Cash / Manual">💵 Cash at Office</option>
            </select>
          </div>

          <InputField
            label={isSomali ? 'Tixraaca / EVC Transaction ID' : 'Transaction Reference / Receipt ID'}
            value={paymentForm.reference_number}
            onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
            placeholder="e.g. EVC-9843217 or Wire Ref"
            required
          />

          <TextAreaField
            label={isSomali ? 'Faahfaahin / Qoraal Dheeraad ah' : 'Disbursement Notes'}
            value={paymentForm.description}
            onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
            placeholder={isSomali ? "Qor marxaladda lacagtani ku saabsan tahay (tusaale: Lacag-bixinta kama dambaysta ah ee dhameystirka)..." : "Notes on milestone or installment..."}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isSomali ? 'Jooji' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submittingPayment}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{submittingPayment ? (isSomali ? 'Xareynaya...' : 'Processing...') : (isSomali ? 'Xaree Lacag-bixinta' : 'Submit Payment')}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
