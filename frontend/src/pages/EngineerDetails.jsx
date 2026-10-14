import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  MessageSquare
} from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/helpers';

const EngineerDetails = () => {
  const { id } = useParams();
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Fetching engineer credentials..." />;
  }

  if (!engineer) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Engineer Profile Not Found</h2>
        <Link to="/engineers" className="text-xs font-bold text-primary underline">
          Return to Engineer Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
        <Link
          to="/engineers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Engineers Directory
        </Link>

        {/* Engineer Profile Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              {engineer.avatar_url ? (
                <img
                  src={engineer.avatar_url}
                  alt={engineer.full_name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg shrink-0 border-2 border-slate-200"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#123c69] text-white flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
                  {engineer.full_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-800">{engineer.full_name}</h1>
                  {engineer.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-orange-600">
                  {engineer.specialization || 'Civil & Structural Engineer'}
                </p>
                <p className="text-xs text-slate-400">
                  {engineer.company_name || 'Licensed Construction Consultant'}
                </p>
                {engineer.license_number && (
                  <p className="text-[11px] font-mono text-slate-500 pt-1">
                    License ID: <span className="font-semibold text-slate-700">{engineer.license_number}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
              <div className="flex items-center gap-1.5 text-amber-500 font-black text-xl">
                <Star className="w-6 h-6 fill-amber-400" />
                <span>{Number(engineer.rating || 0).toFixed(1)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Based on {engineer.total_reviews || 0} reviews</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 text-center">
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="block text-base font-black text-slate-800">{engineer.experience_years || 0} Years</span>
              <span className="text-xs text-slate-400">Industry Practice</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="block text-base font-black text-slate-800">{engineer.total_projects || 0}</span>
              <span className="text-xs text-slate-400">Commissioned Sites</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="block text-base font-black text-slate-800">Mogadishu</span>
              <span className="text-xs text-slate-400">Operational Region</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="block text-base font-black text-slate-800">Active</span>
              <span className="text-xs text-slate-400">Availability Status</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h3 className="text-sm font-bold text-slate-800">Professional Bio & Experience</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {engineer.bio || 'Structural engineering professional specializing in reinforced concrete structures, load assessment, geotechnical site verification, and building code compliance.'}
            </p>
          </div>
        </div>

        {/* Client Reviews Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Client Reviews & Project Endorsements</h3>
            <span className="text-xs font-semibold text-slate-400">{engineer.reviews?.length || 0} Total</span>
          </div>

          {engineer.reviews && engineer.reviews.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {engineer.reviews.map((rev) => (
                <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{rev.reviewer_name}</h4>
                      <p className="text-[10px] text-slate-400">{formatDate(rev.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No client reviews logged yet for this engineer profile.
            </div>
          )}
        </div>
    </div>
  );
};

export default EngineerDetails;
