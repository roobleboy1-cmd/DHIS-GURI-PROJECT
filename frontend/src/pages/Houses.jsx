import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Plus,
  Heart,
  Search,
  Filter
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import SelectField from '../components/forms/SelectField';
import TextAreaField from '../components/forms/TextAreaField';
import StatusBadge from '../components/common/StatusBadge';
import ImageUpload from '../components/common/ImageUpload';
import { formatCurrency } from '../utils/helpers';

const Houses = () => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  // Add House Modal (Admin)
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',
    price: '',
    image_url: '',
    status: 'available',
    featured: false,
  });

  const fetchHouses = (page = 1) => {
    setLoading(true);
    const params = {
      page,
      limit: 9,
      ...(search && { search }),
      ...(location && { location }),
      ...(status && { status }),
      ...(bedrooms && { bedrooms }),
    };

    api.get('/houses', { params })
      .then((res) => {
        setHouses(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch houses:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHouses(1);
  }, [location, status, bedrooms]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHouses(1);
  };

  const handleCreateHouse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/houses', {
        ...formData,
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        area_sqm: Number(formData.area_sqm) || 0,
        price: Number(formData.price) || 0,
      });
      setModalOpen(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        area_sqm: '',
        price: '',
        image_url: '',
        status: 'available',
        featured: false,
      });
      fetchHouses(1);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Turnkey House Catalog</h1>
            <p className="text-xs text-slate-500 mt-1">
              Engineered architectural houses ready for turnkey ground construction.
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white shadow-md transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add House Model
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models or descriptions..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">All Locations</option>
              <option value="Mogadishu">Mogadishu</option>
              <option value="Hargeisa">Hargeisa</option>
              <option value="Garowe">Garowe</option>
              <option value="Kismayo">Kismayo</option>
            </select>

            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">Any Bedrooms</option>
              <option value="2">2+ Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-xs"
            >
              Apply Filter
            </button>
          </form>
        </div>

        {/* Listing Grid */}
        {loading ? (
          <LoadingSpinner message="Searching house models..." />
        ) : houses.length === 0 ? (
          <EmptyState
            title="No house models found"
            description="Try modifying your search keywords or location criteria."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((house) => (
              <div
                key={house.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="h-52 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {house.image_url ? (
                    <img
                      src={house.image_url}
                      alt={house.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#123c69]/10 flex flex-col items-center justify-center text-primary">
                      <Building2 className="w-12 h-12 stroke-1" />
                      <span className="text-xs font-medium mt-1">GURI DHIS Standard</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <StatusBadge status={house.status} />
                  </div>

                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black bg-[#123c69] text-white shadow-md">
                    {formatCurrency(house.price)}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      <span>{house.location || 'Somalia'}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-primary transition-colors line-clamp-1">
                      {house.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {house.description || 'Turnkey engineered residence.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4 text-slate-400" /> {house.bedrooms || 0} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4 text-slate-400" /> {house.bathrooms || 0} Baths
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-4 h-4 text-slate-400" /> {house.area_sqm || 0} m²
                    </span>
                  </div>

                  <Link
                    to={`/houses/${house.id}`}
                    className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-slate-100 hover:bg-[#123c69] hover:text-white text-slate-700 transition-colors"
                  >
                    View Architectural Specifications
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit || 9}
          onPageChange={(p) => fetchHouses(p)}
        />

      {/* Admin Add House Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New House Catalog Model"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateHouse} className="space-y-4">
          <InputField
            label="House Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Modern Villa Deluxe 4-Bedroom"
            required
          />

          <TextAreaField
            label="Description & Specifications"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe foundation requirements, structural steel standards, finishes..."
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Location / Region"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Mogadishu"
              required
            />
            <InputField
              label="Estimated Turnkey Cost (USD)"
              name="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. 65000"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <InputField
              label="Bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              placeholder="3"
            />
            <InputField
              label="Bathrooms"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              placeholder="2"
            />
            <InputField
              label="Area (m²)"
              name="area_sqm"
              type="number"
              value={formData.area_sqm}
              onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
              placeholder="180"
            />
          </div>

          <ImageUpload
            label="Sawirka Guriga (Cloudinary Upload)"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            folder="guridhis/houses"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              id="featured"
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-slate-300 text-primary"
            />
            <label htmlFor="featured" className="text-xs font-semibold text-slate-700">
              Display in Featured Showcase on Homepage
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
              {submitting ? 'Creating...' : 'Save House Model'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Houses;
