import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  ArrowLeft,
  Download,
  Trash2,
  FileCheck,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import SelectField from '../components/forms/SelectField';
import TextAreaField from '../components/forms/TextAreaField';
import { formatDate } from '../utils/helpers';

const ProjectDocuments = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const canUpload = user?.role === 'engineer' || user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    document_type: 'Blueprint',
    file_url: '',
    description: '',
    is_public: true,
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/project-documents/project/${id}`)
    ])
      .then(([projRes, docRes]) => {
        setProject(projRes.data?.data);
        setDocuments(docRes.data?.data || []);
      })
      .catch((err) => {
        console.error('Failed to load project documents:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/project-documents/project/${id}`, formData);
      setModalOpen(false);
      setFormData({
        title: '',
        document_type: 'Blueprint',
        file_url: '',
        description: '',
        is_public: true,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Permanently remove this document entry?')) return;
    try {
      await api.delete(`/project-documents/${docId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      header: 'Document Name & Category',
      key: 'title',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.file_url && (row.file_url.includes('images.unsplash.com') || row.file_url.match(/\.(jpg|jpeg|png|webp)/i)) ? (
            <img
              src={row.file_url}
              alt={row.title}
              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#123c69] flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-800 text-xs">{row.title}</p>
            <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
              {row.document_type || 'General'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      key: 'description',
      render: (row) => (
        <p className="text-xs text-slate-500 max-w-xs truncate">{row.description || 'No description'}</p>
      ),
    },
    {
      header: 'Uploaded By',
      key: 'uploaded_by_name',
      render: (row) => <span className="text-xs text-slate-600 font-medium">{row.uploaded_by_name || 'Staff'}</span>,
    },
    {
      header: 'Access Scope',
      key: 'is_public',
      render: (row) => (
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          row.is_public ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {row.is_public ? 'Public to Client' : 'Internal Staff'}
        </span>
      ),
    },
    {
      header: 'Date Added',
      key: 'created_at',
      render: (row) => formatDate(row.created_at),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.file_url ? (
            <a
              href={row.file_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-primary hover:bg-blue-50 transition-colors"
              title="Open document file"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="text-[10px] text-slate-400">Record only</span>
          )}

          {canUpload && (
            <button
              onClick={() => handleDeleteDocument(row.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading architectural documentation..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Site Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Site Documentation & Plans — {project?.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Architectural CAD sets, municipal building permits, and soil inspection reports.
          </p>
        </div>

        {canUpload && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Upload Document Record
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={documents}
        loading={false}
        emptyMessage="No blueprints or architectural documents registered for this site."
      />

      {/* Upload Document Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Project Document Record"
      >
        <form onSubmit={handleUploadDocument} className="space-y-4">
          <InputField
            label="Document Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Municipal Building Permit #B-9021"
            required
          />

          <SelectField
            label="Document Type"
            value={formData.document_type}
            onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
            options={[
              { value: 'Blueprint', label: 'Architectural Blueprint / CAD' },
              { value: 'Structural Drawing', label: 'Structural Reinforcement Details' },
              { value: 'Permit', label: 'Municipal Building Permit' },
              { value: 'Soil Test', label: 'Geotechnical Soil Test' },
              { value: 'Contract', label: 'Construction Agreement / BoQ' },
              { value: 'Inspection', label: 'Site Inspection Certificate' },
            ]}
            required
          />

          <InputField
            label="Document File URL (PDF or Drive link)"
            value={formData.file_url}
            onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
            placeholder="https://..."
          />

          <TextAreaField
            label="Summary & Notes"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Summary of document approvals..."
            rows={3}
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              id="is_public"
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="rounded border-slate-300 text-primary"
            />
            <label htmlFor="is_public" className="text-xs font-semibold text-slate-700">
              Make viewable to Client in their portal
            </label>
          </div>

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
              {submitting ? 'Saving...' : 'Add Document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDocuments;
