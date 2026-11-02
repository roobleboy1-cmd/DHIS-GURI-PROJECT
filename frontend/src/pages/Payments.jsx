import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Search, 
  Filter, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight,
  Smartphone,
  Building,
  Check,
  X
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
import SelectField from '../components/forms/SelectField';
import TextAreaField from '../components/forms/TextAreaField';
import { formatCurrency, formatDate } from '../utils/helpers';

const Payments = () => {
  const { user } = useAuth();
  const { t, isSomali } = useLanguage();
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');

  // Payment Modal (Client & Admin)
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projectsList, setProjectsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [formData, setFormData] = useState({
    project_id: '',
    client_id: '',
    amount: '',
    payment_method: 'EVC Plus',
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
    // Load projects list for dropdown
    api.get('/projects', { params: { limit: 50 } })
      .then((res) => {
        const list = res.data?.data || [];
        setProjectsList(list);
        if (list.length > 0 && !formData.project_id) {
          setFormData((prev) => ({ ...prev, project_id: list[0].id }));
        }
      })
      .catch(() => {});

    if (isAdmin) {
      api.get('/users?role=client').then((res) => setClientsList(res.data?.data || [])).catch(() => {});
    }
  }, [isAdmin]);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!formData.project_id || !formData.amount) {
      alert(isSomali ? 'Fadlan dooro mashruuc iyo lacagta la bixinayo.' : 'Please select a project and enter the amount.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        project_id: Number(formData.project_id),
        amount: Number(formData.amount),
        payment_method: formData.payment_method,
        reference_number: formData.reference_number || `TXN-${Date.now().toString().slice(-6)}`,
        description: formData.description,
      };

      if (isAdmin && formData.client_id) {
        payload.client_id = Number(formData.client_id);
      }

      await api.post('/payments', payload);
      setModalOpen(false);
      setFormData({
        project_id: projectsList[0]?.id || '',
        client_id: '',
        amount: '',
        payment_method: 'EVC Plus',
        reference_number: '',
        description: '',
      });
      fetchPayments(1);
      alert(isSomali ? 'Lacag-bixinta si guul leh ayaa loo diiwaangeliyay!' : 'Payment logged successfully!');
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
      header: isSomali ? 'Mashruuca & Tixraaca' : 'Project & Reference',
      key: 'reference_number',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100 text-xs font-mono">{row.reference_number || `PAY-#${row.id}`}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {row.project_title || `Project #${row.project_id}`}
          </p>
        </div>
      ),
    },
    ...(!isClient ? [{
      header: isSomali ? 'Macaamiilka' : 'Client',
      key: 'client_name',
      render: (row) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{row.client_name || 'Client'}</span>
    }] : []),
    {
      header: isSomali ? 'Lacagta (USD)' : 'Amount (USD)',
      key: 'amount',
      render: (row) => <span className="font-black text-slate-900 dark:text-white text-xs">{formatCurrency(row.amount)}</span>,
    },
    {
      header: isSomali ? 'Habka Lacag-bixinta' : 'Payment Method',
      key: 'payment_method',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {row.payment_method?.includes('EVC') || row.payment_method?.includes('ZAAD') || row.payment_method?.includes('Sahal') ? (
            <Smartphone className="w-3 h-3 text-orange-500" />
          ) : (
            <Building className="w-3 h-3 text-sky-500" />
          )}
          {row.payment_method || 'Bank Transfer'}
        </span>
      ),
    },
    {
      header: isSomali ? 'Xaaladda' : 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: isSomali ? 'Taariikhda' : 'Date',
      key: 'paid_at',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.paid_at ? formatDate(row.paid_at) : (row.created_at ? formatDate(row.created_at) : 'Pending')}
        </span>
      ),
    },
    ...(isAdmin ? [{
      header: isSomali ? 'Maamulka' : 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status !== 'completed' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'completed')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-3 h-3" />
              {isSomali ? 'Xaqiiji' : 'Approve'}
            </button>
          )}
          {row.status === 'pending' && (
            <button
              onClick={() => handleUpdateStatus(row.id, 'failed')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors border border-rose-200 dark:border-rose-800"
            >
              <X className="w-3 h-3" />
              {isSomali ? 'Diid' : 'Reject'}
            </button>
          )}
        </div>
      )
    }] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-500" />
            {isSomali ? 'Diiwaanka Lacag-bixinta Dhismaha' : 'Construction Payment Records'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSomali 
              ? 'Diiwaanka rasmiga ah ee lacag-bixinta heerarka dhismaha, deebaajiga iyo xisaabaadka.' 
              : 'Official accounting ledger of staged construction disbursements, deposits, and escrow milestones.'}
          </p>
        </div>

        {/* Action Button: Client or Admin */}
        {(isAdmin || isClient) && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20 transition-all self-start sm:self-auto hover:scale-102"
          >
            <Plus className="w-4 h-4" /> 
            {isClient 
              ? (isSomali ? 'Bixi Lacagta Mashruuca' : 'Make Project Payment') 
              : (isSomali ? 'Diiwaangeli Lacag-bixin' : 'Record Payment Transaction')}
          </button>
        )}
      </div>

      {/* Somali Payment Notice */}
      <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950 dark:text-amber-100">
            {isSomali ? 'Ogeysiis Ku Saabsan Habka Lacag-Bixinta Soomaaliya' : 'Somalia Local Payment Methods & Security'}
          </p>
          <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            {isSomali 
              ? 'Nidaamku wuxuu si toos ah u taageeraa adeegyada lacag-bixinta maxalliga ah ee EVC Plus (*712*...), ZAAD Service (*880*...), Sahal (*789*...), iyo xawaaladaha tooska ah ee Bankiga (Salaam Somali Bank, IBS Bank). Lacag-bixin kasta oo aad gudbiso waxay si toos ah u gaareysaa Injineerka iyo Maamulka si loo xaqiijiyo.'
              : 'Direct integration support for Somali mobile money services (EVC Plus, ZAAD, Sahal) and verified commercial banking (Salaam Somali Bank, IBS). All submitted payment transactions notify the assigned engineer and management for immediate verification.'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isSomali ? 'Xaaladda:' : 'Status:'}
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="">{isSomali ? 'Dhammaan Lacag-bixinnada' : 'All Transactions'}</option>
            <option value="completed">{isSomali ? 'La Xaqiijiyay (Completed)' : 'Completed / Settled'}</option>
            <option value="pending">{isSomali ? 'Sugaya Xaqiijin (Pending)' : 'Pending Verification'}</option>
            <option value="failed">{isSomali ? 'La Diiday / Khalad (Failed)' : 'Failed / Disputed'}</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {isSomali ? `Wadarta: ${pagination.total || payments.length}` : `Total: ${pagination.total || payments.length}`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
          emptyMessage={isSomali ? 'Ma jiraan diiwaanno lacag-bixineed oo la helay' : 'No payment transactions logged in this ledger'}
        />
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit || 10}
        onPageChange={(p) => fetchPayments(p)}
      />

      {/* Payment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          isClient
            ? (isSomali ? 'Gudbi Lacag-bixinta Mashruuca' : 'Submit Project Payment')
            : (isSomali ? 'Diiwaangeli Lacag-bixin Cusub' : 'Record Client Payment Transaction')
        }
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          {/* Project Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {isSomali ? 'Mashruuca Dhismaha *' : 'Construction Project *'}
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">{isSomali ? '-- Dooro Mashruuca --' : '-- Select Project --'}</option>
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.location || 'Site'}) - {p.status}
                </option>
              ))}
            </select>
          </div>

          {/* Admin only: Select Client */}
          {isAdmin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {isSomali ? 'Macmiilka Bixinaya *' : 'Payer (Client) *'}
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
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
          )}

          {/* Amount & Method */}
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label={isSomali ? 'Lacagta (USD) *' : 'Amount (USD) *'}
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 15000"
              required
            />
            <SelectField
              label={isSomali ? 'Habka Lacag-bixinta *' : 'Payment Method *'}
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              options={[
                { value: 'EVC Plus', label: 'EVC Plus (Hormuud)' },
                { value: 'ZAAD Service', label: 'ZAAD Service (Telesom)' },
                { value: 'Sahal', label: 'Sahal (Golis)' },
                { value: 'Salaam Somali Bank', label: 'Salaam Somali Bank Wire' },
                { value: 'IBS Bank', label: 'IBS Bank Transfer' },
                { value: 'Bank Transfer', label: 'Other Direct Bank Wire' },
                { value: 'Cashier Deposit', label: 'Cashier Deposit Voucher' },
              ]}
              required
            />
          </div>

          {/* Reference / Voucher number */}
          <InputField
            label={isSomali ? 'Tixraaca Lacag-bixinta / Numberka SMS-ka *' : 'Reference / Mobile Transaction ID *'}
            value={formData.reference_number}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            placeholder={isSomali ? 'Tusaale: TXN-92817 ama EVC-615xxxxxx' : 'e.g. EVC-991204 or WIRE-881924'}
            required
          />

          {/* Description */}
          <TextAreaField
            label={isSomali ? 'Faahfaahin ku Saabsan Marxaladda Dhismaha' : 'Milestone Description & Notes'}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={isSomali ? 'Tusaale: Bixinta wajiga aasaaska ama dhameystirka dhismaha...' : 'e.g. Phase 2 foundation completion payment...'}
            rows={2}
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 shadow-md shadow-orange-500/20 transition-all"
            >
              {submitting 
                ? (isSomali ? 'Waa la dirayaa...' : 'Submitting...') 
                : (isClient ? (isSomali ? 'Gudbi Lacagta' : 'Submit Payment') : (isSomali ? 'Keydi Diiwaanka' : 'Save Transaction'))}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;