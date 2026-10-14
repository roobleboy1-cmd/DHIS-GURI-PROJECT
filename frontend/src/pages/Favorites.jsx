import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Building2, MapPin, Bed, Bath, Maximize2, Trash2, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatCurrency } from '../utils/helpers';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = () => {
    setLoading(true);
    api.get('/favorites/my-favorites')
      .then((res) => {
        setFavorites(res.data?.data || []);
      })
      .catch((err) => {
        console.error('Failed to load favorites:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (houseId) => {
    try {
      await api.delete(`/favorites/${houseId}`);
      setFavorites(favorites.filter((f) => f.id !== houseId));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Loading saved house models..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Saved House Models</h1>
        <p className="text-xs text-slate-500 mt-1">
          Architectural models bookmarked for future construction proposals.
        </p>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved houses yet"
          description="Browse our house catalog and tap the heart icon on any model to bookmark it."
          actionLabel="Explore Catalog"
          onAction={() => window.location.href = '/houses'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((house) => (
            <div
              key={house.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {house.image_url ? (
                    <img
                      src={house.image_url}
                      alt={house.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#123c69]/10 flex flex-col items-center justify-center text-primary">
                      <Building2 className="w-12 h-12 stroke-1" />
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveFavorite(house.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-500 hover:bg-white shadow-sm transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-black bg-[#123c69] text-white">
                    {formatCurrency(house.price)}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>{house.location || 'Somalia'}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base line-clamp-1">{house.title}</h3>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/houses/${house.id}`}
                  className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-[#123c69] text-white hover:bg-[#1a4f8a] transition-colors flex items-center justify-center gap-1.5"
                >
                  View Blueprint Specs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
