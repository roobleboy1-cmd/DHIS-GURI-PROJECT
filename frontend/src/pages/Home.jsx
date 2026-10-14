import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  HardHat,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingUp,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Home = () => {
  const [featuredHouses, setFeaturedHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/houses/featured')
      .then((res) => {
        setFeaturedHouses(res.data?.data || []);
      })
      .catch((err) => {
        console.error('Error fetching featured houses:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0d2d4f] via-[#123c69] to-[#1a4f8a] text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-orange-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Construction & Project Management</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Build Your Dream Home with{' '}
                <span className="text-orange-400">Total Transparency</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-200 max-w-xl font-normal leading-relaxed">
                GURI DHIS connects aspiring homeowners with certified structural engineers and verified construction contractors. Track site progress, verify blueprint documents, and control budgets from foundation to handover.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/houses"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2"
                >
                  Browse House Catalog
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-all"
                >
                  Register as Client or Engineer
                </Link>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/10 text-center sm:text-left">
                <div>
                  <h4 className="text-2xl font-black text-white">100%</h4>
                  <p className="text-xs text-slate-300">Verified Engineers</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white">Real-Time</h4>
                  <p className="text-xs text-slate-300">Progress Audits</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white">Direct</h4>
                  <p className="text-xs text-slate-300">Blueprint Blueprints</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-white shadow-md">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Villa Al-Hikmah Project</h4>
                      <p className="text-xs text-orange-200">Phase 3: Roofing & Casting</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    On Schedule
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Overall Progress</span>
                    <span className="font-bold text-white">72% Completed</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-orange-400 h-2.5 rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <span className="text-slate-300 block text-[10px]">Assigned Engineer</span>
                    <span className="font-semibold text-white">Eng. Ahmed Farhan</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <span className="text-slate-300 block text-[10px]">Verified Workers</span>
                    <span className="font-semibold text-white">14 Masons & Carpenters</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Features</span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Comprehensive Construction Governance
          </h2>
          <p className="text-sm text-slate-500">
            Streamlining every phase of residential development with verified tracking, role security, and milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#123c69] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Licensed Engineers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every engineer profile is reviewed with license credentials, portfolio history, and ratings from completed projects.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Architectural Catalog</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Browse pre-designed architectural plans, interior layouts, structural specifications, and cost estimations.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Milestone Timelines</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive live milestone photo updates, percent-complete calculations, and stage sign-offs as construction progresses.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <HardHat className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Worker Management</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Engineers register and assign certified masons, electricians, and plumbers directly onto authorized project sites.
            </p>
          </div>
        </div>
      </section>

      {/* Featured House Listings */}
      <section className="bg-slate-100/70 py-16 sm:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Featured Homes</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                Popular Turnkey House Projects
              </h2>
            </div>
            <Link
              to="/houses"
              className="text-xs font-bold text-[#123c69] hover:text-orange-600 flex items-center gap-1 transition-colors"
            >
              View Full Catalog ({featuredHouses.length || 'All'})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading catalog..." />
          ) : featuredHouses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-500">No featured house listings currently published.</p>
              <Link to="/houses" className="inline-block mt-3 text-xs font-semibold text-primary underline">
                Browse all available models
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredHouses.slice(0, 3).map((house) => (
                <div
                  key={house.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col group"
                >
                  <div className="h-48 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                    {house.image_url ? (
                      <img
                        src={house.image_url}
                        alt={house.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#123c69]/10 flex flex-col items-center justify-center text-primary">
                        <Building2 className="w-12 h-12 stroke-1" />
                        <span className="text-xs font-medium mt-1">GURI DHIS Model</span>
                      </div>
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold bg-[#123c69] text-white shadow-xs">
                      {formatCurrency(house.price)}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span>{house.location || 'Somalia'}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-primary transition-colors">
                        {house.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {house.description || 'Modern residential construction with standard structural reinforcement.'}
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
                      View Specs & Plans
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Simple Process</span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">How GURI DHIS Works</h2>
          <p className="text-xs text-slate-500">From blueprint selection to key handover in 4 organized stages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-black text-lg flex items-center justify-center mx-auto shadow-xs">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Select House Design</h4>
            <p className="text-xs text-slate-500">Pick from pre-engineered models or submit custom spatial requirements.</p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#123c69] font-black text-lg flex items-center justify-center mx-auto shadow-xs">
              2
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Submit Request</h4>
            <p className="text-xs text-slate-500">Specify your plot location, preferred budget, and assign a certified lead engineer.</p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-black text-lg flex items-center justify-center mx-auto shadow-xs">
              3
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Track Progress</h4>
            <p className="text-xs text-slate-500">Watch weekly photographic updates, verified worker rosters, and structural reports.</p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 font-black text-lg flex items-center justify-center mx-auto shadow-xs">
              4
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Transparent Milestones</h4>
            <p className="text-xs text-slate-500">Review staged records and leave certified engineer reviews upon final completion.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
