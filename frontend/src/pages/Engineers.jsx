import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Star, Award, Building2, Search, ArrowRight, UserCheck } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

const Engineers = () => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');

  const fetchEngineers = (page = 1) => {
    setLoading(true);
    const params = {
      page,
      limit: 9,
      ...(search && { search }),
      ...(specialization && { specialization }),
    };

    api.get('/engineers', { params })
      .then((res) => {
        setEngineers(res.data?.data || []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => {
        console.error('Failed to load engineers:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEngineers(1);
  }, [specialization]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEngineers(1);
  };

  return (
    <div className="space-y-8">
      <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Certified Structural Engineers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Licensed construction engineers and contractors vetted for residential project management.
          </p>
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
                placeholder="Search engineers by name or company..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="">All Disciplines</option>
                <option value="Structural Engineering">Structural Engineering</option>
                <option value="Civil Architecture">Civil Architecture</option>
                <option value="Project Supervision">Project Supervision</option>
                <option value="Geotechnical">Geotechnical & Foundation</option>
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

        {/* Engineer Cards Grid */}
        {loading ? (
          <LoadingSpinner message="Searching verified engineers..." />
        ) : engineers.length === 0 ? (
          <EmptyState
            title="No engineers found"
            description="Try searching with different terms or check back shortly."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineers.map((eng) => (
              <div
                key={eng.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {eng.avatar_url ? (
                      <img
                        src={eng.avatar_url}
                        alt={eng.full_name}
                        className="w-14 h-14 rounded-2xl object-cover shadow-md shrink-0 border border-slate-200"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#123c69] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                        {eng.full_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-800 text-base truncate">{eng.full_name}</h3>
                        {eng.is_verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" title="Verified Engineer" />
                        )}
                      </div>
                      <p className="text-xs text-orange-600 font-semibold truncate">
                        {eng.specialization || 'Civil & Structural Engineer'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {eng.company_name || 'Independent Licensed Consultant'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {eng.bio || 'Experienced engineering lead overseeing concrete framing, site safety, and architectural standards.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="block font-bold text-slate-800">{eng.experience_years || 0} yrs</span>
                      <span className="text-[10px] text-slate-400">Experience</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="block font-bold text-slate-800 flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {Number(eng.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400">Rating</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="block font-bold text-slate-800">{eng.total_reviews || 0}</span>
                      <span className="text-[10px] text-slate-400">Reviews</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/engineers/${eng.id}`}
                  className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-slate-100 hover:bg-[#123c69] hover:text-white text-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  View Profile & Portfolio <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit || 9}
          onPageChange={(p) => fetchEngineers(p)}
        />
    </div>
  );
};

export default Engineers;
