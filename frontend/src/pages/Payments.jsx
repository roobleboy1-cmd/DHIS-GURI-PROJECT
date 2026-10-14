import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, AlertCircle, Info, CheckCircle2, Search, Filter } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import SelectField from '../components/forms/SelectField';
import TextAreaField from '../components/forms/TextAreaField';
import { formatCurrency, formatDate } from '../utils/helpers';

const Payments = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  // Record Payment Modal (Admin)
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projectsList, setProjectsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [formData, setFormData] = useState({
    project_id: '',
    client_id: '',
    amount: '',
    payment_method: 'Bank Transfer',
    reference_number: '',
    description: '',
  });

  const fetchPayments = (page = 1) => {
    setLoading(true);
    const endpoint = isClient ? '/payments/my-payments' : '/payments';
    const params = {
      page,
      limit: 10,
      ...(statusFilter && { status: statusFilter }),
    };

    api.get(endpoint, { params })
      .then((res) => {
        setPayments(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        console.error('Failed to load payments:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayments(1);
  }, [statusFilter]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/projects').then((res) => setProjectsList(res.data?.data || [])).catch(() => {});
      api.get('/users?role=client').then((res) => setClientsList(res.data?.data || [])).catch(() => {});
    }
  }, [isAdmin]);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/payments', {
        ...formData,
        project_id: Number(formData.project_id),
        client_id: Number(formData.client_id),
        amount: Number(formData.amount),
      });
      setModalOpen(false);
      setFormData({
        project_id: '',
        client_id: '',
        amount: '',
        payment_method: 'Bank Transfer',
        reference_number: '',
        description: '',
      });
      fetchPayments(1);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (paymentId, status) => {
    try {
      await api.patch(`/payments/${paymentId}/status`, { status });
      fetchPayments(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      header: 'Reference & Project',
      key: 'reference_number',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-xs font-mono">{row.reference_number || `PAY-#${row.id}`}</p>
          <p className="text-[11px] text-slate-400">{row.project_title || `Project #${row.project_id}`}</p>
        </div>
      ),
    },
    ...(!isClient ? [{
      header: 'Client',
      key: 'client_name',
      render: (row) => <span className="text-xs font-semibold text-slate-700">{row.client_name || 'Client'}</span>
    }] : []),
    {
      header: 'Amount',
      key: 'amount',
      render: (row) => <span className="font-black text-slate-800 text-xs">{formatCurrency(row.amount)}</span>,
    },
    {
      header: 'Payment Method',
      key: 'payment_method',
      render: (row) => <span className="text-xs text-slate-600">{row.payment_method || 'Manual Record'}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Paid Date',
      key: 'paid_at',
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.paid_at ? formatDate(row.paid_at) : 'Pending'}
        </span>
      ),
    },
    ...(isAdmin ? [{
      header: 'Admin Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status !== 'completed' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'completed')}
              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Mark Paid
            </button>
          )}
          {row.status === 'pending' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'failed')}
              className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100"
            >
              Reject
            </button>
          )}
        </div>
      )
    }] : [])
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Construction Payment Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Accounting ledger of staged construction disbursements and escrow milestones.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Record Payment Transaction
          </button>
        )}
      </div>

      {/* Honest Gateway Notice */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Automated Payment Gateway Integration Notice</p>
          <p className="text-amber-800 leading-relaxed">
            Real-time automated payment gateways (e.g., Stripe, Zaad/EVC Plus merchant API) are intentionally not configured on this local environment. All transactions shown below represent audited ledger entries and verified bank deposit vouchers recorded by project management.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="">All Transactions</option>
            <option value="completed">Completed / Settled</option>
            <option value="pending">Pending Verification</option>
            <option value="failed">Failed / Disputed</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        emptyMessage="No payment transactions logged in this ledger"
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit || 10}
        onPageChange={(p) => fetchPayments(p)}
      />

      {/* Admin Record Payment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Client Payment Transaction"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Project *</label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              required
            >
              <option value="">Select Project</option>
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Payer (Client) *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
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

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Amount (USD)"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 15000"
              required
            />
            <SelectField
              label="Settlement Method"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              options={[
                { value: 'Bank Transfer', label: 'Direct Bank Wire (IBS / Salaam)' },
                { value: 'Cashier Deposit', label: 'Cashier Deposit Voucher' },
                { value: 'Mobile Money', label: 'EVC Plus / Zaad Manual' },
                { value: 'Check', label: 'Certified Bank Draft' },
              ]}
              required
            />
          </div>

          <InputField
            label="Deposit Reference / Voucher ID"
            value={formData.reference_number}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            placeholder="e.g. WIRE-881924"
            required
          />

          <TextAreaField
            label="Payment Milestone Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. First stage foundation excavation installment..."
            rows={2}
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
              {submitting ? 'Recording...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
