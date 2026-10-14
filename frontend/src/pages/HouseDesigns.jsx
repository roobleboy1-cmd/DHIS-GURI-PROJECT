import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Search, Filter, Plus, ArrowRight, Building2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import SelectField from '../components/forms/SelectField';
import TextAreaField from '../components/forms/TextAreaField';
import ImageUpload from '../components/common/ImageUpload';
import { formatCurrency } from '../utils/helpers';

const HouseDesigns = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [search, setSearch] = useState('');
  const [designType, setDesignType] = useState('');

  // Admin Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    design_type: 'architectural',
    image_url: '',
    file_url: '',
    estimated_cost: '',
  });

  const fetchDesigns = (page = 1) => {
    setLoading(true);
    const params = {
      page,
      limit: 9,
      ...(search && { search }),
      ...(designType && { design_type: designType }),
    };

    api.get('/designs', { params })
      .then((res) => {
        setDesigns(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        console.error('Failed to load designs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDesigns(1);
  }, [designType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDesigns(1);
  };

  const handleCreateDesign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/designs', {
        ...formData,
        estimated_cost: Number(formData.estimated_cost) || 0,
      });
      setModalOpen(false);
      setFormData({
        title: '',
        description: '',
        design_type: 'architectural',
        image_url: '',
        file_url: '',
        estimated_cost: '',
      });
      fetchDesigns(1);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Architectural Plans & Blueprints</h1>
            <p className="text-xs text-slate-500 mt-1">
              Engineered spatial drawings, MEP elevations, and 3D architectural plans.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white shadow-md transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Blueprint Plan
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plans by title or style..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <select
                value={designType}
                onChange={(e) => setDesignType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="">All Blueprint Types</option>
                <option value="architectural">Architectural</option>
                <option value="structural">Structural Engineering</option>
                <option value="interior">Interior Layout</option>
                <option value="mep">MEP Plumbing & Electrical</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shrink-0 shadow-xs"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* Design Cards Grid */}
        {loading ? (
          <LoadingSpinner message="Loading architectural drawings..." />
        ) : designs.length === 0 ? (
          <EmptyState
            title="No architectural plans found"
            description="Try selecting a different blueprint category or query."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <div
                key={design.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {design.image_url ? (
                    <img
                      src={design.image_url}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#123c69]/10 flex flex-col items-center justify-center text-primary">
                      <Compass className="w-12 h-12 stroke-1 text-orange-500" />
                      <span className="text-xs font-semibold mt-1">GURI DHIS CAD Drawing</span>
                    </div>
                  )}

                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#123c69] text-white">
                    {formatCurrency(design.estimated_cost)}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-[#123c69] mb-2 border border-blue-100">
                      {design.design_type || 'Architectural'}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-primary transition-colors line-clamp-1">
                      {design.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {design.description || 'Structural drawing with dimensional elevations.'}
                    </p>
                  </div>

                  <Link
                    to={`/designs/${design.id}`}
                    className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-slate-100 hover:bg-[#123c69] hover:text-white text-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    View Full Plan <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit || 9}
          onPageChange={(p) => fetchDesigns(p)}
        />

      {/* Admin Add Design Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Blueprint Plan"
      >
        <form onSubmit={handleCreateDesign} className="space-y-4">
          <InputField
            label="Blueprint Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Modern Ground Floor Structural Layout"
            required
          />

          <SelectField
            label="Plan Category"
            value={formData.design_type}
            onChange={(e) => setFormData({ ...formData, design_type: e.target.value })}
            options={[
              { value: 'architectural', label: 'Architectural Floor Plan' },
              { value: 'structural', label: 'Structural Reinforcement' },
              { value: 'interior', label: 'Interior Fitout' },
              { value: 'mep', label: 'Mechanical, Electrical & Plumbing (MEP)' },
            ]}
            required
          />

          <InputField
            label="Estimated Execution Cost (USD)"
            type="number"
            value={formData.estimated_cost}
            onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
            placeholder="e.g. 45000"
          />

          <ImageUpload
            label="Sawirka Naqshadda (Cloudinary Upload)"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            folder="guridhis/designs"
          />

          <TextAreaField
            label="Engineering Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide architectural notes, load bearing walls..."
            rows={3}
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
              {submitting ? 'Saving...' : 'Add Blueprint'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HouseDesigns;
