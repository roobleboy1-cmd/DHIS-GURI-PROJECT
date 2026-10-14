import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Compass, Building2, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/helpers';

const DesignDetails = () => {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/designs/${id}`)
      .then((res) => {
        setDesign(res.data?.data);
      })
      .catch((err) => {
        console.error('Error fetching design details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Fetching blueprint document..." />;
  }

  if (!design) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Blueprint Not Found</h2>
        <Link to="/designs" className="text-xs font-bold text-primary underline">
          Return to Blueprint Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        to="/designs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Blueprint Catalog
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="h-80 sm:h-96 bg-slate-100 relative flex items-center justify-center">
          {design.image_url ? (
            <img
              src={design.image_url}
              alt={design.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          ) : (
            <div className="text-center text-primary space-y-2">
              <Compass className="w-16 h-16 mx-auto text-orange-500 stroke-1" />
              <span className="text-xs font-bold block">CAD Drawing Specimen</span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-[#123c69] mb-2 border border-blue-100">
                {design.design_type || 'Architectural'}
              </span>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">{design.title}</h1>
              {design.house_title && (
                <p className="text-xs text-slate-400 mt-1">
                  Attached Model: <span className="font-semibold text-slate-700">{design.house_title}</span>
                </p>
              )}
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block">Estimated Execution</span>
              <span className="text-2xl font-black text-[#123c69]">
                {formatCurrency(design.estimated_cost)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Architectural Narrative</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {design.description || 'Full CAD engineering blueprint with floor layout specifications.'}
            </p>
          </div>

          {design.house_id && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Related House Catalog Model:</span>
              <Link
                to={`/houses/${design.house_id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123c69] hover:underline"
              >
                <Building2 className="w-4 h-4 text-orange-500" />
                View Related House Specs
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignDetails;
