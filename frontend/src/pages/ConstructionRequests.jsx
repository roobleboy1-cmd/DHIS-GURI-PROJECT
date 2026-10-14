import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Filter, CheckCircle2, XCircle, UserCheck, AlertCircle } from 'lucide-react';
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

const ConstructionRequests = () => {
  const { user } = useAuth();
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
  const [createForm, setCreateForm] = useState({
    description: '',
    budget: '',
    location: '',
  });

  // Manage Request Modal (Admin)
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [engineersList, setEngineersList] = useState([]);
  const [assignedEngineerId, setAssignedEngineerId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [manageSubmitting, setManageSubmitting] = useState(false);

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
    if (isAdmin) {
      api.get('/engineers')
        .then((res) => {
          setEngineersList(res.data?.data || []);
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      await api.post('/requests', {
        ...createForm,
        budget: Number(createForm.budget) || 0,
      });
      setCreateModalOpen(false);
      setCreateForm({ description: '', budget: '', location: '' });
      fetchRequests(1);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setManageSubmitting(true);
    try {
      if (newStatus) {
        await api.patch(`/requests/${selectedRequest.id}/status`, {
          status: newStatus,
          admin_notes: adminNotes,
        });
      }
      if (assignedEngineerId) {
        await api.patch(`/requests/${selectedRequest.id}/assign-engineer`, {
          engineer_id: Number(assignedEngineerId),
        });
      }
      setManageModalOpen(false);
      setSelectedRequest(null);
      fetchRequests(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setManageSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Project Description',
      key: 'description',
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-bold text-slate-800 line-clamp-1">{row.description || 'Residential Construction Inquiry'}</p>
          <p className="text-[11px] text-slate-400">Plot: {row.location || 'Location Not Specified'}</p>
        </div>
      ),
    },
    ...(!isClient ? [{
      header: 'Client',
      key: 'client_name',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800 text-xs">{row.client_name || 'Client'}</p>
          <p className="text-[10px] text-slate-400">{row.client_email}</p>
        </div>
      )
    }] : []),
    {
      header: 'Target Budget',
      key: 'budget',
      render: (row) => <span className="font-semibold text-slate-800 text-xs">{formatCurrency(row.budget)}</span>,
    },
    {
      header: 'Assigned Engineer',
      key: 'engineer_name',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">{row.engineer_name || 'Pending Assignment'}</span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Submitted',
      key: 'created_at',
      render: (row) => formatDate(row.created_at),
    },
    ...(isAdmin ? [{
      header: 'Action',
      key: 'action',
      render: (row) => (
        <button
          onClick={() => {
            setSelectedRequest(row);
            setNewStatus(row.status);
            setAdminNotes(row.admin_notes || '');
            setAssignedEngineerId(row.engineer_id || '');
            setManageModalOpen(true);
          }}
          className="px-3 py-1 text-xs font-bold bg-[#123c69] text-white rounded-lg hover:bg-[#1a4f8a] transition-colors"
        >
          Manage
        </button>
      )
    }] : [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Construction Proposals & Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            {isClient
              ? 'Track review stages, engineer assignments, and budget approvals for your home proposals.'
              : 'Review client construction requests, assign lead engineers, and issue formal project approvals.'}
          </p>
        </div>

        {isClient && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> New Commission Request
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="">All Proposals</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        emptyMessage="No construction proposals registered matching this filter"
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
        title="Commission New Residential Build Proposal"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <InputField
            label="Plot Location & District"
            value={createForm.location}
            onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
            placeholder="e.g. Wadajir, Mogadishu"
            required
          />

          <InputField
            label="Estimated Total Construction Budget (USD)"
            type="number"
            value={createForm.budget}
            onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
            placeholder="e.g. 50000"
            required
          />

          <TextAreaField
            label="Project Description & Spatial Goals"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            placeholder="Specify single or multi-story requirements, rooms, timeline..."
            rows={4}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md disabled:opacity-50"
            >
              {createSubmitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Manage Modal */}
      <Modal
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        title={`Manage Construction Request #${selectedRequest?.id}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <SelectField
            label="Workflow Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'pending', label: 'Pending Review' },
              { value: 'reviewed', label: 'Reviewed by Engineering Office' },
              { value: 'approved', label: 'Approved (Ready to Charter Project)' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Assign Lead Structural Engineer</label>
            <select
              value={assignedEngineerId}
              onChange={(e) => setAssignedEngineerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
            >
              <option value="">Select Lead Engineer</option>
              {engineersList.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.full_name} ({eng.specialization || 'Engineer'})
                </option>
              ))}
            </select>
          </div>

          <TextAreaField
            label="Administrative & Engineering Notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Notes on plot inspection, foundation recommendations..."
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setManageModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={manageSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#123c69] hover:bg-[#1a4f8a] disabled:opacity-50"
            >
              {manageSubmitting ? 'Updating...' : 'Save Decision'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConstructionRequests;
