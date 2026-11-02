import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  UserCheck,
  AlertCircle,
  HardHat,
  ArrowRight,
  FolderKanban,
  Building2,
  ShieldCheck,
  Sparkles
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

const ConstructionRequests = () => {
  const { user } = useAuth();
  const { t, isSomali } = useLanguage();
  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';
  const isEngineer = user?.role === 'engineer';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  // Create Request Modal (Client)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [housesList, setHousesList] = useState([]);
  const [engineersList, setEngineersList] = useState([]);
  const [createForm, setCreateForm] = useState({
    house_id: '',
    engineer_id: '',
    description: '',
    budget: '',
    location: '',
  });

  // Manage Request Modal (Admin / Engineer)
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignedEngineerId, setAssignedEngineerId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [manageSubmitting, setManageSubmitting] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchRequests = (page = 1) => {
    setLoading(true);
    const endpoint = isClient ? '/requests/my-requests' : '/requests';
    const params = {
      page,
      limit: 10,
      ...(statusFilter && { status: statusFilter }),
    };

    api.get(endpoint, { params })
      .then((res) => {
        setRequests(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        console.error('Failed to load construction requests:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests(1);
  }, [statusFilter]);

  useEffect(() => {
    // Load engineers and houses for dropdown selectors
    api.get('/engineers').then((res) => setEngineersList(res.data?.data || [])).catch(() => {});
    api.get('/houses').then((res) => setHousesList(res.data?.data || [])).catch(() => {});
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      await api.post('/requests', {
        house_id: createForm.house_id ? Number(createForm.house_id) : null,
        engineer_id: createForm.engineer_id ? Number(createForm.engineer_id) : null,
        description: createForm.description,
        budget: Number(createForm.budget) || 0,
        location: createForm.location,
      });
      setCreateModalOpen(false);
      setCreateForm({ house_id: '', engineer_id: '', description: '', budget: '', location: '' });
      fetchRequests(1);
      alert(isSomali ? 'Codsigaagii si guul leh ayaa loo diray! Injineerka iyo maamulka ayaa helay.' : 'Request submitted successfully! Engineer and Admin notified.');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Direct 1-Click Accept for Engineer or Admin
  const handleQuickAccept = async (request) => {
    if (!window.confirm(isSomali ? 'Ma xaqiijinaysaa inaad aqbashay codsigan oo aad si toos ah u bilaabayso dhismaha mashruuca?' : 'Confirm acceptance to charter and start this construction project?')) {
      return;
    }

    setAcceptingId(request.id);
    try {
      await api.patch(`/requests/${request.id}/status`, {
        status: 'approved',
        admin_notes: isSomali ? 'Codsigan waxaa aqbalay Injineerka/Maamulka, howshuna si toos ah ayay u bilaabatay.' : 'Accepted and chartered into active project.'
      });
      fetchRequests(pagination.page);
      alert(isSomali ? 'Hambalyo! Mashruucii dhismaha si toos ah ayuu u bilaabmay, macmiilkiina waa lala socodsiiyay.' : 'Project successfully started! Client notified.');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setManageSubmitting(true);
    try {
      await api.patch(`/requests/${selectedRequest.id}/status`, {
        status: newStatus,
        admin_notes: adminNotes,
        engineer_id: assignedEngineerId ? Number(assignedEngineerId) : undefined
      });
      setManageModalOpen(false);
      setSelectedRequest(null);
      fetchRequests(pagination.page);
      alert(isSomali ? 'Go\'aanka si guul leh ayaa loo keydiyay.' : 'Status successfully updated.');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setManageSubmitting(false);
    }
  };

  const columns = [
    {
      header: isSomali ? 'Faahfaahinta & Naqshadda' : 'Project Description',
      key: 'description',
      render: (row) => (
        <div className="max-w-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-white line-clamp-1 text-xs">
            {row.house_title ? `🏡 ${row.house_title}` : row.description || 'Residential Construction Inquiry'}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {isSomali ? 'Goobta:' : 'Plot:'} <span className="font-semibold text-slate-600 dark:text-slate-300">{row.location || 'Location Not Specified'}</span>
          </p>
        </div>
      ),
    },
    ...(!isClient ? [{
      header: isSomali ? 'Macmiilka' : 'Client',
      key: 'client_name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-white text-xs">{row.client_name || 'Client'}</p>
          <p className="text-[10px] text-slate-400 font-mono">{row.client_phone || row.client_email}</p>
        </div>
      )
    }] : []),
    {
      header: isSomali ? 'Miisaaniyadda' : 'Target Budget',
      key: 'budget',
      render: (row) => <span className="font-black text-slate-800 dark:text-white text-xs">{formatCurrency(row.budget)}</span>,
    },
    {
      header: isSomali ? 'Injineerka Masuulka ah' : 'Assigned Engineer',
      key: 'engineer_name',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
          <HardHat className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="truncate max-w-[130px]">{row.engineer_name || (isSomali ? 'Sugaya Xilsaarid' : 'Pending Assignment')}</span>
        </div>
      ),
    },
    {
      header: isSomali ? 'Xaaladda' : 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: isSomali ? 'Taariikhda' : 'Submitted',
      key: 'created_at',
      render: (row) => <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(row.created_at)}</span>,
    },
    {
      header: isSomali ? 'Tallaabo / Goobta' : 'Action / Project',
      key: 'action',
      render: (row) => {
        // If request is approved and has project, show "View Project" link
        if (row.project_id) {
          return (
            <Link
              to={`/projects/${row.project_id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>{isSomali ? 'Eeg Mashruuca' : 'View Project'}</span>
            </Link>
          );
        }

        // For Engineer: If pending/reviewed, show "Accept & Start Build"
        if (isEngineer && (row.status === 'pending' || row.status === 'reviewed')) {
          const isAccepting = acceptingId === row.id;
          return (
            <button
              onClick={() => handleQuickAccept(row)}
              disabled={isAccepting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAccepting ? (isSomali ? 'Bilaabaya...' : 'Starting...') : (isSomali ? 'Aqbal & Bilow Howsha' : 'Accept & Start Build')}</span>
            </button>
          );
        }

        // For Admin: Manage modal button
        if (isAdmin) {
          return (
            <button
              onClick={() => {
                setSelectedRequest(row);
                setNewStatus(row.status);
                setAdminNotes(row.admin_notes || '');
                setAssignedEngineerId(row.engineer_id || '');
                setManageModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-bold bg-[#123c69] text-white rounded-xl hover:bg-[#1a4f8a] transition-colors"
            >
              {isSomali ? 'Maamul' : 'Manage'}
            </button>
          );
        }

        return <span className="text-xs text-slate-400 italic">{isSomali ? 'Dib u eegis' : 'In Review'}</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-orange-500" />
            <span>{isSomali ? 'Codsiyada & Soo Jeedinta Dhismaha' : 'Construction Proposals & Requests'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isClient
              ? (isSomali ? 'La soco marxaladda codsiyadaada, injineerka laguu xilsaaray, iyo bilowga tooska ah ee dhismaha.' : 'Track review stages, engineer assignments, and project commencement for your home builds.')
              : (isSomali ? 'Dib u eeg codsiyada macaamiisha, u xilsaar injineerro, aqbal howsha si mashruucu u bilowdo toos.' : 'Review client construction requests, assign lead engineers, and approve to launch projects.')}
          </p>
        </div>

        {isClient && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-all self-start sm:self-auto hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>{isSomali ? 'Gudbi Codsi Dhisme Cusub' : 'New Commission Request'}</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isSomali ? 'Kala shaandhee Xaaladda:' : 'Filter Status:'}
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
          >
            <option value="">{isSomali ? 'Dhammaan Codsiyada' : 'All Proposals'}</option>
            <option value="pending">{isSomali ? 'Sugaya Dib u eegis' : 'Pending Review'}</option>
            <option value="reviewed">{isSomali ? 'Injineer loo xilsaaray' : 'Reviewed'}</option>
            <option value="approved">{isSomali ? 'La Ansixiyay & Bilaabmay' : 'Approved'}</option>
            <option value="rejected">{isSomali ? 'La Diiday' : 'Rejected'}</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        emptyMessage={isSomali ? 'Ma jiraan codsiyo dhisme oo la helay xilligan' : 'No construction proposals registered matching this filter'}
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit || 10}
        onPageChange={(p) => fetchRequests(p)}
      />

      {/* Client Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={isSomali ? 'Gudbi Codsi Dhismaha Guri Cusub' : 'Commission New Residential Build Proposal'}
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          {/* House Selector (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isSomali ? 'Dooro Naqshadda Guriga (Haddii aad ka heshay buugga)' : 'Choose House Model (Optional)'}
            </label>
            <select
              value={createForm.house_id}
              onChange={(e) => {
                const hid = e.target.value;
                const h = housesList.find((item) => String(item.id) === hid);
                setCreateForm({
                  ...createForm,
                  house_id: hid,
                  budget: h?.price || createForm.budget,
                  location: h?.location || createForm.location
                });
              }}
              className="w-full px-3 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
            >
              <option value="">{isSomali ? '-- Naqshad Gaar ah oo Aan Diyaarsanayn --' : '-- Custom Build (No Catalog Model) --'}</option>
              {housesList.map((h) => (
                <option key={h.id} value={h.id}>
                  🏡 {h.title} ({formatCurrency(h.price)})
                </option>
              ))}
            </select>
          </div>

          {/* Engineer Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-orange-500" />
              <span>{isSomali ? 'Dooro Injineerka Dhismaha (Lead Engineer)' : 'Assign Supervising Engineer'}</span>
            </label>
            <select
              value={createForm.engineer_id}
              onChange={(e) => setCreateForm({ ...createForm, engineer_id: e.target.value })}
              className="w-full px-3 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
            >
              <option value="">{isSomali ? '-- Maamulka Ha ii Doorto Injineer Diyaar ah --' : '-- Let Admin Assign Best Engineer --'}</option>
              {engineersList.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  👷 {eng.full_name} ({eng.specialization || 'Civil & Structural'} - {eng.experience_years || 5}+ yrs)
                </option>
              ))}
            </select>
          </div>

          <InputField
            label={isSomali ? 'Goobta Dhulka (Degmada & Magaalada)' : 'Plot Location & District'}
            value={createForm.location}
            onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
            placeholder="e.g. Wadajir, Mogadishu"
            required
          />

          <InputField
            label={isSomali ? 'Miisaaniyadda La Qiyaasay (USD)' : 'Estimated Total Construction Budget (USD)'}
            type="number"
            value={createForm.budget}
            onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
            placeholder="e.g. 50000"
            required
          />

          <TextAreaField
            label={isSomali ? 'Faahfaahinta & Shuruudaha Dhismaha' : 'Project Description & Spatial Goals'}
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            placeholder={isSomali ? "Tilmaan tirada dabaqyada, qolalka, nooca dhismaha, iyo waqtiga la rabo in la bilaabo..." : "Specify single or multi-story requirements, rooms, timeline..."}
            rows={4}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isSomali ? 'Jooji' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={createSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md disabled:opacity-50"
            >
              {createSubmitting ? (isSomali ? 'Gudbinaya...' : 'Submitting...') : (isSomali ? 'Gudbi Codsiga & U Dir Injineerka' : 'Submit Proposal')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Manage Modal */}
      <Modal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        title={isSomali ? `Maamul Codsiga Dhismaha #${selectedRequest?.id}` : `Manage Construction Request #${selectedRequest?.id}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <SelectField
            label={isSomali ? 'Xaaladda Codsiga' : 'Workflow Status'}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'pending', label: isSomali ? 'Sugaya Dib u eegis' : 'Pending Review' },
              { value: 'reviewed', label: isSomali ? 'Injineer ayaa loo xilsaaray' : 'Reviewed by Engineering Office' },
              { value: 'approved', label: isSomali ? 'Waa La Aqbalay (Toos u Bilow Mashruuca)' : 'Approved (Launch Active Project)' },
              { value: 'rejected', label: isSomali ? 'La Diiday' : 'Rejected' },
              { value: 'cancelled', label: isSomali ? 'La Kansalay' : 'Cancelled' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isSomali ? 'U Xilsaar Injineerka Masuulka ah' : 'Assign Lead Structural Engineer'}
            </label>
            <select
              value={assignedEngineerId}
              onChange={(e) => setAssignedEngineerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
            >
              <option value="">{isSomali ? '-- Dooro Injineerka --' : 'Select Lead Engineer'}</option>
              {engineersList.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.full_name} ({eng.specialization || 'Engineer'})
                </option>
              ))}
            </select>
          </div>

          <TextAreaField
            label={isSomali ? 'Qoraalka & Talooyinka Farsamo ee Maamulka' : 'Administrative & Engineering Notes'}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder={isSomali ? "Qoraal ku saabsan kormeerka dhulka, aasaaska, ama jadwalka shaqada..." : "Notes on plot inspection, foundation recommendations..."}
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setManageModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isSomali ? 'Jooji' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={manageSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#123c69] hover:bg-[#1a4f8a] disabled:opacity-50"
            >
              {manageSubmitting ? (isSomali ? 'Keydinaya...' : 'Saving...') : (isSomali ? 'Keydi Go\'aanka & Bilow' : 'Save Decision')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConstructionRequests;
