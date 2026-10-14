import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  ArrowLeft,
  ClipboardList,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import TextAreaField from '../components/forms/TextAreaField';
import InputField from '../components/forms/InputField';
import { formatCurrency } from '../utils/helpers';

const HouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Request Modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestDesc, setRequestDesc] = useState('');
  const [requestBudget, setRequestBudget] = useState('');
  const [requestLocation, setRequestLocation] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/houses/${id}`)
      .then((res) => {
        setHouse(res.data?.data);
        setRequestBudget(res.data?.data?.price || '');
        setRequestLocation(res.data?.data?.location || '');
      })
      .catch((err) => {
        console.error('Error fetching house details:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    if (isAuthenticated && user?.role === 'client') {
      api.get(`/favorites/check/${id}`)
        .then((res) => {
          setIsFavorited(res.data?.data?.isFavorited || false);
        })
        .catch(() => {});
    }
  }, [id, isAuthenticated, user]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setFavLoading(true);
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${id}`);
        setIsFavorited(false);
      } else {
        await api.post('/favorites', { house_id: id });
        setIsFavorited(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update favorites.');
    } finally {
      setFavLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmittingRequest(true);
    try {
      await api.post('/requests', {
        house_id: Number(id),
        description: requestDesc || `Construction commission inquiry for ${house?.title}`,
        budget: Number(requestBudget) || Number(house?.price) || 0,
        location: requestLocation || house?.location,
      });
      setRequestSuccess(true);
      setTimeout(() => {
        setRequestModalOpen(false);
        setRequestSuccess(false);
        navigate('/requests');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching house architectural blueprint..." />;
  }

  if (!house) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">House Model Not Found</h2>
        <Link to="/houses" className="text-xs font-bold text-primary underline">
          Return to House Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Link & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/houses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </Link>

          <div className="flex items-center gap-2">
            {user?.role === 'client' && (
              <button
                onClick={handleToggleFavorite}
                disabled={favLoading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                {isFavorited ? 'Saved to Favorites' : 'Save House'}
              </button>
            )}

            <button
              onClick={() => {
                if (!isAuthenticated) navigate('/login');
                else setRequestModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md transition-all"
            >
              <ClipboardList className="w-4 h-4" /> Commission Construction
            </button>
          </div>
        </div>

        {/* Hero Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Photo Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-200 relative border border-slate-200 shadow-sm flex items-center justify-center">
              {house.image_url ? (
                <img
                  src={house.image_url}
                  alt={house.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#123c69]/10 flex flex-col items-center justify-center text-primary">
                  <Building2 className="w-16 h-16 stroke-1" />
                  <span className="text-xs font-bold mt-2">Architectural Render Blueprint</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <StatusBadge status={house.status} />
              </div>
            </div>
          </div>

          {/* Pricing & Key Metrics */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{house.location || 'Somalia'}</span>
                </div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">{house.title}</h1>
                <p className="text-3xl font-black text-[#123c69] mt-3">
                  {formatCurrency(house.price)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Estimated Turnkey Construction Estimate</p>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Bed className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="block text-xs font-bold text-slate-800">{house.bedrooms || 0}</span>
                  <span className="text-[10px] text-slate-400">Bedrooms</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Bath className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="block text-xs font-bold text-slate-800">{house.bathrooms || 0}</span>
                  <span className="text-[10px] text-slate-400">Bathrooms</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Maximize2 className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="block text-xs font-bold text-slate-800">{house.area_sqm || 0}</span>
                  <span className="text-[10px] text-slate-400">Sq. Meters</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) navigate('/login');
                    else setRequestModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#123c69] hover:bg-[#1a4f8a] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ClipboardList className="w-4 h-4 text-orange-400" />
                  Submit Construction Request
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Structural Specs & House Designs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800">Architectural Specifications & Summary</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {house.description || 'Full structural plans and engineering approvals available.'}
            </p>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">Associated Architectural Blueprints</h3>
              <span className="text-xs font-medium text-slate-400">
                {house.designs?.length || 0} Plans
              </span>
            </div>

            {house.designs && house.designs.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {house.designs.map((design) => (
                  <div key={design.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {design.image_url ? (
                        <img
                          src={design.image_url}
                          alt={design.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=300&q=80'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                          <Compass className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{design.title}</h4>
                        <p className="text-[11px] text-slate-400 capitalize">{design.design_type || 'Blueprint'}</p>
                      </div>
                    </div>
                    <Link
                      to={`/designs/${design.id}`}
                      className="text-xs font-bold text-primary hover:underline shrink-0"
                    >
                      View Plan
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No supplemental floor plans attached to this house model.
              </p>
            )}
          </div>
        </div>

      {/* Commission Request Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title={`Commission Construction for ${house.title}`}
      >
        {requestSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">Request Submitted!</h4>
            <p className="text-xs text-slate-500">Redirecting to your Construction Requests portal...</p>
          </div>
        ) : (
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit your project details to have an administrator and certified structural engineer assigned to your plot.
            </p>

            <InputField
              label="Plot / Land Location"
              value={requestLocation}
              onChange={(e) => setRequestLocation(e.target.value)}
              placeholder="e.g. Hodan District, Mogadishu"
              required
            />

            <InputField
              label="Target Budget (USD)"
              type="number"
              value={requestBudget}
              onChange={(e) => setRequestBudget(e.target.value)}
              placeholder="e.g. 55000"
              required
            />

            <TextAreaField
              label="Special Construction Requirements or Timeline"
              value={requestDesc}
              onChange={(e) => setRequestDesc(e.target.value)}
              placeholder="Notes on perimeter walls, foundation soil type, timeline..."
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRequest}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md disabled:opacity-50"
              >
                {submittingRequest ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default HouseDetails;
