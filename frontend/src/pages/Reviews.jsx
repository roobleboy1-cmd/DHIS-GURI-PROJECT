import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Plus, CheckCircle2, User, Building2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import TextAreaField from '../components/forms/TextAreaField';
import SelectField from '../components/forms/SelectField';
import { formatDate } from '../utils/helpers';

const Reviews = () => {
  const { user } = useAuth();
  const isClient = user?.role === 'client';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Submit Review Modal (Client for completed project)
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [formData, setFormData] = useState({
    project_id: '',
    rating: 5,
    comment: '',
  });

  const fetchReviews = (page = 1) => {
    setLoading(true);
    api.get('/reviews', { params: { page, limit: 10 } })
      .then((res) => {
        setReviews(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        console.error('Failed to load reviews:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  useEffect(() => {
    if (isClient) {
      api.get('/projects?status=completed')
        .then((res) => {
          setCompletedProjects(res.data?.data || []);
        })
        .catch(() => {});
    }
  }, [isClient]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const selectedProj = completedProjects.find((p) => p.id === Number(formData.project_id));
    if (!selectedProj) {
      alert('Please select a completed project.');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/reviews', {
        project_id: Number(formData.project_id),
        reviewee_id: selectedProj.engineer_id,
        rating: Number(formData.rating),
        comment: formData.comment,
      });
      setModalOpen(false);
      setFormData({ project_id: '', rating: 5, comment: '' });
      fetchReviews(1);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching reviews..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Verified Engineering Reviews</h1>
          <p className="text-xs text-slate-500 mt-1">
            Certified client ratings left upon successful completion of construction handovers.
          </p>
        </div>

        {isClient && completedProjects.length > 0 && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Leave Review for Completed Project
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <EmptyState
            icon={Star}
            title="No reviews logged yet"
            description="Reviews are submitted by property owners after their project reaches 100% completion."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{rev.reviewer_name}</h4>
                    <p className="text-[11px] text-slate-400">
                      Reviewed Engineer: <span className="font-semibold text-primary">{rev.reviewee_name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-800">{rev.rating}/5</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment || 'Professional engineering supervision and reliable site execution.'}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Site: {rev.project_title || 'Residential Project'}</span>
                <span>{formatDate(rev.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit || 10}
        onPageChange={(p) => fetchReviews(p)}
      />

      {/* Client Submit Review Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Submit Engineer Project Review"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Completed Construction Project</label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              required
            >
              <option value="">Select your completed site</option>
              {completedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (Lead: {p.engineer_name})
                </option>
              ))}
            </select>
          </div>

          <SelectField
            label="Rating (1 - 5 Stars)"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            options={[
              { value: 5, label: '⭐⭐⭐⭐⭐ 5 - Exceptional Engineering & Timeline' },
              { value: 4, label: '⭐⭐⭐⭐ 4 - Very Good Execution' },
              { value: 3, label: '⭐⭐⭐ 3 - Satisfactory Performance' },
              { value: 2, label: '⭐⭐ 2 - Faced Delays / Issues' },
              { value: 1, label: '⭐ 1 - Unsatisfactory' },
            ]}
            required
          />

          <TextAreaField
            label="Detailed Feedback & Recommendation"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Share your experience regarding craftsmanship, communication, budget adherence..."
            rows={4}
            required
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
              {submitting ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reviews;
