import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Star,
  Award,
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  FolderKanban,
  MessageSquare,
  ClipboardList,
  CheckCircle2,
  HardHat
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import InputField from '../components/forms/InputField';
import TextAreaField from '../components/forms/TextAreaField';
import { formatDate } from '../utils/helpers';

const EngineerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t, isSomali } = useLanguage();

  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hire Modal
  const [hireModalOpen, setHireModalOpen] = useState(false);
  const [housesList, setHousesList] = useState([]);
  const [selectedHouseId, setSelectedHouseId] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    api.get(`/engineers/${id}`)
      .then((res) => {
        setEngineer(res.data?.data);
      })
      .catch((err) => {
        console.error('Error fetching engineer profile:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    api.get('/houses')
      .then((res) => {
        setHousesList(res.data?.data || []);
      })
      .catch(() => {});
  }, [id]);

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/requests', {
        house_id: selectedHouseId ? Number(selectedHouseId) : null,
        engineer_id: Number(id),
        location,
        budget: Number(budget) || 0,
        description: description || `Codsi toos ah oo loo diray Injineer ${engineer?.full_name}`,
      });
      setSuccessMsg(true);
      setTimeout(() => {
        setHireModalOpen(false);
        setSuccessMsg(false);
        navigate('/requests');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={isSomali ? "Soo dejinaya xogta injineerka..." : "Fetching engineer credentials..."} />;
  }

  if (!engineer) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {isSomali ? 'Lama helin injineerkan' : 'Engineer Profile Not Found'}
        </h2>
        <Link to="/engineers" className="text-xs font-bold text-orange-500 underline">
          {isSomali ? 'Ku noqo liiska injineerrada' : 'Return to Engineer Directory'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link
        to="/engineers"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {isSomali ? 'Ku noqo Liiska Injineerrada' : 'Back to Engineers Directory'}
      </Link>

      {/* Engineer Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {engineer.avatar_url ? (
              <img
                src={engineer.avatar_url}
                alt={engineer.full_name}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg shrink-0 border-2 border-slate-200 dark:border-slate-700"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#123c69] text-white flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
                {engineer.full_name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-800 dark:text-white">{engineer.full_name}</h1>
                {engineer.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> {isSomali ? 'La Xaqiijiyay' : 'Verified'}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {engineer.specialization || 'Civil & Structural Engineer'}
              </p>
              <p className="text-xs text-slate-400">
                {engineer.company_name || (isSomali ? 'La-taliye Dhismaha oo Shahaado Haysta' : 'Licensed Construction Consultant')}
              </p>
              {engineer.license_number && (
                <p className="text-[11px] font-mono text-slate-500 pt-1">
                  License ID: <span className="font-semibold text-slate-700 dark:text-slate-300">{engineer.license_number}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex items-center gap-1.5 text-amber-500 font-black text-xl">
              <Star className="w-6 h-6 fill-amber-400" />
              <span>{Number(engineer.rating || 0).toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-normal">({engineer.total_reviews || 0} reviews)</span>
            </div>

            {/* Hire Engineer CTA */}
            {user?.role === 'client' && (
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                  else setHireModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md transition-all hover:scale-[1.02]"
              >
                <HardHat className="w-4 h-4" />
                <span>{isSomali ? 'U Xilsaar Dhismaha Gurigaaga' : 'Hire for Construction'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="block text-base font-black text-slate-800 dark:text-white">{engineer.experience_years || 0} {isSomali ? 'Sano' : 'Years'}</span>
            <span className="text-xs text-slate-400">{isSomali ? 'Khibrad Dhismaha' : 'Industry Practice'}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="block text-base font-black text-slate-800 dark:text-white">{engineer.total_projects || 0}</span>
            <span className="text-xs text-slate-400">{isSomali ? 'Mashaariic la Fuliyay' : 'Commissioned Sites'}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="block text-base font-black text-slate-800 dark:text-white">Soomaaliya</span>
            <span className="text-xs text-slate-400">{isSomali ? 'Aagga Shaqada' : 'Operational Region'}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="block text-base font-black text-emerald-600 dark:text-emerald-400">{isSomali ? 'Diyaar' : 'Active'}</span>
            <span className="text-xs text-slate-400">{isSomali ? 'Xaaladda' : 'Availability Status'}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {isSomali ? 'Taariikhda & Khibradda Farsamo' : 'Professional Bio & Experience'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {engineer.bio || 'Structural engineering professional specializing in reinforced concrete structures, load assessment, geotechnical site verification, and building code compliance in Somalia.'}
          </p>
        </div>
      </div>

      {/* Client Reviews Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {isSomali ? 'Faallooyinka Macaamiisha & Qiimeynta' : 'Client Reviews & Project Endorsements'}
          </h3>
          <span className="text-xs font-semibold text-slate-400">{engineer.reviews?.length || 0} Total</span>
        </div>

        {engineer.reviews && engineer.reviews.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {engineer.reviews.map((rev) => (
              <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{rev.reviewer_name}</h4>
                    <p className="text-[10px] text-slate-400">{formatDate(rev.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            {isSomali ? 'Weli ma jiraan faallooyin la diiwaangeliyay.' : 'No client reviews logged yet for this engineer profile.'}
          </div>
        )}
      </div>

      {/* Hire Engineer Modal */}
      <Modal
        isOpen={hireModalOpen}
        onClose={() => setHireModalOpen(false)}
        title={isSomali ? `U Xilsaar Dhismaha: ${engineer.full_name}` : `Hire ${engineer.full_name} for Project`}
      >
        {successMsg ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-800 dark:text-white">
              {isSomali ? 'Codsigaagii Waa La Diray!' : 'Request Sent Successfully!'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isSomali
                ? `Farriin toos ah ayaa gaartay Injineer ${engineer.full_name} iyo Maamulka. Ku geynaya codsiyadaada...`
                : 'Direct notification sent to the engineer and admin. Redirecting...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleHireSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isSomali ? 'Dooro Naqshadda Guriga (Ikhtiyaari)' : 'Select House Model (Optional)'}
              </label>
              <select
                value={selectedHouseId}
                onChange={(e) => {
                  setSelectedHouseId(e.target.value);
                  const h = housesList.find((item) => String(item.id) === e.target.value);
                  if (h?.price) setBudget(h.price);
                  if (h?.location) setLocation(h.location);
                }}
                className="w-full px-3 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">{isSomali ? '-- Dooro Naqshad ka mid ah Guryaha --' : '-- Choose from Catalog Houses --'}</option>
                {housesList.map((h) => (
                  <option key={h.id} value={h.id}>
                    🏡 {h.title} ({formatCurrency(h.price)} - {h.bedrooms || 0} qol)
                  </option>
                ))}
              </select>
            </div>

            <InputField
              label={isSomali ? 'Goobta Dhulka (Magaalada & Degmada)' : 'Plot Location & City'}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Wadajir, Mogadishu"
              required
            />

            <InputField
              label={isSomali ? 'Miisaaniyadda Dhismaha (USD)' : 'Estimated Construction Budget (USD)'}
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 50000"
              required
            />

            <TextAreaField
              label={isSomali ? 'Faahfaahinta & Shuruudaha Dhismaha' : 'Project Goals & Requirements'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isSomali ? "Qor nooca dhismaha aad rabto, tirada dabaqyada, iyo qiyaasta waqtiga..." : "Specify rooms, foundation requirements, and target start date..."}
              rows={3}
              required
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setHireModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isSomali ? 'Jooji' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{submitting ? (isSomali ? 'Diraya...' : 'Sending...') : (isSomali ? 'U Dir Codsiga Injineerka' : 'Send Request to Engineer')}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default EngineerDetails;
