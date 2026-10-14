import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon, Loader2, Cloud } from 'lucide-react';
import api from '../../api/axios';

const ImageUpload = ({ value, onChange, label = 'House Photo (Cloudinary / Local)', folder = 'guridhis/houses' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Fadlan dooro sawir (JPEG, PNG, WebP).');
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setError('Cabbirka sawirku waa inuu ka yaraadaa 10MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const res = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = res.data?.data?.url;
      const uploadProvider = res.data?.data?.provider || 'server';
      setProvider(uploadProvider);

      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.response?.data?.message || 'Sawirka lama gelin karin. Fadlan hubi xiriirka.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setProvider('');
    setError('');
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label}
        </label>
        {provider === 'cloudinary' && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Cloud className="w-3 h-3 text-emerald-600" /> Cloudinary
          </span>
        )}
      </div>

      {value ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-xs font-bold text-slate-800 transition-all flex items-center gap-1 shadow-md"
            >
              <Upload className="w-3.5 h-3.5" /> Baddal Sawirka
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-all flex items-center gap-1 shadow-md"
            >
              <X className="w-3.5 h-3.5" /> Tirtir
            </button>
          </div>
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white truncate max-w-[80%]">
            {value}
          </span>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            uploading
              ? 'bg-slate-50 border-slate-300 cursor-not-allowed'
              : 'border-slate-300 hover:border-[#123c69] hover:bg-slate-50/80 bg-white'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#123c69]" />
              <p className="text-xs font-semibold text-slate-700">Sawirka Cloudinary ayaa loo dirayaa...</p>
              <span className="text-[10px] text-slate-400">Fadlan sug daqiiqad</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-[#123c69]">Guji halkan si aad u soo galiso sawir</span> ama soo jiid
              </div>
              <p className="text-[10px] text-slate-400">PNG, JPG, WebP ilaa 10MB (Cloudinary Storage)</p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Fallback Direct URL input for convenience */}
      <div className="pt-1">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ama qor URL-ka sawirka tooska ah (tusaale: https://...)"
          className="w-full px-3 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:border-[#123c69]"
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
