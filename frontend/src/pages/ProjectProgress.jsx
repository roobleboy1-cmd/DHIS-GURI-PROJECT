import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  TrendingUp,
  Plus,
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import TextAreaField from '../components/forms/TextAreaField';
import ImageUpload from '../components/common/ImageUpload';
import { formatDate } from '../utils/helpers';

const ProjectProgress = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const canAddProgress = user?.role === 'engineer' || user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Progress Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    progress_percentage: '',
    image_url: '',
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/project-progress/project/${id}`)
    ])
      .then(([projRes, progRes]) => {
        setProject(projRes.data?.data);
        setProgressList(progRes.data?.data || []);
      })
      .catch((err) => {
        console.error('Failed to load project progress:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddProgress = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/project-progress/project/${id}`, {
        ...formData,
        progress_percentage: Number(formData.progress_percentage) || 0,
      });
      setModalOpen(false);
      setFormData({ title: '', description: '', progress_percentage: '', image_url: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProgress = async (progId) => {
    if (!confirm('Delete this progress audit log?')) return;
    try {
      await api.delete(`/project-progress/${progId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading site milestone logs..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Site Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Milestone Progress Logs — {project?.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified photographic milestone timeline and stage completion logs.
          </p>
        </div>

        {canAddProgress && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Log Site Milestone
          </button>
        )}
      </div>

      {/* Progress Timeline List */}
      {progressList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <EmptyState
            title="No progress milestones logged yet"
            description="The supervising engineer will log photographic updates as construction phases complete."
          />
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-8 py-2">
          {progressList.map((prog, index) => (
            <div key={prog.id} className="relative pl-6 sm:pl-8 group">
              {/* Dot badge on line */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-xs" />

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-800">{prog.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {prog.progress_percentage}% Milestone
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Logged by {prog.updated_by_name || 'Supervising Engineer'} on {formatDate(prog.created_at, true)}
                    </p>
                  </div>

                  {canAddProgress && (
                    <button
                      onClick={() => handleDeleteProgress(prog.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors self-end sm:self-auto"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {prog.description}
                </p>

                {prog.image_url && (
                  <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 max-h-72">
                    <img
                      src={prog.image_url}
                      alt={prog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Progress Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Construction Site Milestone"
      >
        <form onSubmit={handleAddProgress} className="space-y-4">
          <InputField
            label="Milestone Phase Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Foundation Concrete Curing Complete"
            required
          />

          <InputField
            label="Overall Project Progress Stage (%)"
            type="number"
            min="0"
            max="100"
            value={formData.progress_percentage}
            onChange={(e) => setFormData({ ...formData, progress_percentage: e.target.value })}
            placeholder="e.g. 35"
            required
          />

          <TextAreaField
            label="Engineering Observation & Site Notes"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Notes on slump test, rebar binding inspection, weather conditions..."
            rows={4}
            required
          />

          <ImageUpload
            label="Sawirka Goobta Dhismaha (Cloudinary Upload)"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            folder="guridhis/milestones"
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
              {submitting ? 'Recording...' : 'Publish Milestone'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectProgress;
