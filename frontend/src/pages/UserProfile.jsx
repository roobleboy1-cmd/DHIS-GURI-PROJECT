import React, { useState, useEffect } from 'react';
import { User, Lock, ShieldCheck, HardHat, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/forms/InputField';
import TextAreaField from '../components/forms/TextAreaField';
import SelectField from '../components/forms/SelectField';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ImageUpload from '../components/common/ImageUpload';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Engineer Profile Form
  const [engineerData, setEngineerData] = useState({
    license_number: '',
    specialization: '',
    experience_years: '',
    bio: '',
    company_name: '',
  });
  const [savingEngineer, setSavingEngineer] = useState(false);

  // Worker Profile Form
  const [workerData, setWorkerData] = useState({
    availability_status: 'available',
  });
  const [savingWorker, setSavingWorker] = useState(false);

  // Password Form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fetchProfile = () => {
    setLoading(true);
    api.get('/auth/profile')
      .then((res) => {
        const p = res.data?.data;
        setProfile(p);
        setFormData({
          full_name: p.full_name || '',
          phone: p.phone || '',
          avatar_url: p.avatar_url || '',
        });

        if (p.engineer_profile) {
          setEngineerData({
            license_number: p.engineer_profile.license_number || '',
            specialization: p.engineer_profile.specialization || '',
            experience_years: p.engineer_profile.experience_years || '',
            bio: p.engineer_profile.bio || '',
            company_name: p.engineer_profile.company_name || '',
          });
        }

        if (p.worker_profile) {
          setWorkerData({
            availability_status: p.worker_profile.availability_status || 'available',
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await api.put('/auth/profile', formData);
      updateUser(res.data?.data);
      setProfileSuccess('Profile details saved successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateEngineer = async (e) => {
    e.preventDefault();
    setSavingEngineer(true);
    try {
      await api.put('/engineers/profile', {
        ...engineerData,
        experience_years: Number(engineerData.experience_years) || 0,
      });
      alert('Engineering credentials updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSavingEngineer(false);
    }
  };

  const handleUpdateWorkerAvailability = async (e) => {
    e.preventDefault();
    setSavingWorker(true);
    try {
      await api.patch('/workers/availability', workerData);
      alert('Field availability updated.');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSavingWorker(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordSuccess('Password successfully changed.');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading user account credentials..." />;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Account Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your credentials, role privileges, and security authentication.
        </p>
      </div>

      {/* General Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-slate-200 shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#123c69] text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-slate-800">{profile?.full_name}</h3>
            <p className="text-xs text-slate-400">{profile?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-200">
              {profile?.role} Privileges
            </span>
          </div>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{profileSuccess}</span>
          </div>
        )}
        {profileError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              icon={User}
              required
            />
            <InputField
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+252 61 XXXXXXX"
              icon={Phone}
            />
          </div>

          <ImageUpload
            label="Sawirka Profile-ka (Cloudinary Upload)"
            value={formData.avatar_url}
            onChange={(url) => setFormData({ ...formData, avatar_url: url })}
            folder="guridhis/avatars"
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#123c69] hover:bg-[#1a4f8a] transition-all shadow-md disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Engineer Additional Profile Form */}
      {profile?.role === 'engineer' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">Licensed Engineer Portfolio Details</h3>
            <p className="text-xs text-slate-400">Information displayed on your public engineering profile.</p>
          </div>

          <form onSubmit={handleUpdateEngineer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Engineering License Number"
                value={engineerData.license_number}
                onChange={(e) => setEngineerData({ ...engineerData, license_number: e.target.value })}
                placeholder="e.g. SOM-ENG-88219"
              />
              <InputField
                label="Primary Specialization"
                value={engineerData.specialization}
                onChange={(e) => setEngineerData({ ...engineerData, specialization: e.target.value })}
                placeholder="e.g. Reinforced Structural Concrete"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Years of Field Experience"
                type="number"
                value={engineerData.experience_years}
                onChange={(e) => setEngineerData({ ...engineerData, experience_years: e.target.value })}
                placeholder="e.g. 10"
              />
              <InputField
                label="Registered Construction Firm"
                value={engineerData.company_name}
                onChange={(e) => setEngineerData({ ...engineerData, company_name: e.target.value })}
                placeholder="e.g. Al-Buraaq Builders Ltd"
              />
            </div>

            <TextAreaField
              label="Professional Bio & Qualifications"
              value={engineerData.bio}
              onChange={(e) => setEngineerData({ ...engineerData, bio: e.target.value })}
              placeholder="Outline your engineering degree, past major works, and safety principles..."
              rows={4}
            />

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingEngineer}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-md disabled:opacity-50"
              >
                {savingEngineer ? 'Saving...' : 'Update Engineering Credentials'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Worker Availability Section */}
      {profile?.role === 'worker' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">Site Availability Status</h3>
            <p className="text-xs text-slate-400">Let engineers know when you are open for site deployment.</p>
          </div>

          <form onSubmit={handleUpdateWorkerAvailability} className="flex items-center gap-3">
            <select
              value={workerData.availability_status}
              onChange={(e) => setWorkerData({ ...workerData, availability_status: e.target.value })}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
            >
              <option value="available">🟢 Available for New Project Deployment</option>
              <option value="busy">🟡 Currently Deployed on Active Site (Busy)</option>
              <option value="unavailable">🔴 On Leave / Unavailable</option>
            </select>

            <button
              type="submit"
              disabled={savingWorker}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#123c69] hover:bg-[#1a4f8a] text-white disabled:opacity-50"
            >
              {savingWorker ? 'Saving...' : 'Update Status'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800">Security Credentials</h3>
          <p className="text-xs text-slate-400">Update your access passphrase.</p>
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{passwordSuccess}</span>
          </div>
        )}
        {passwordError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <InputField
            label="Current Password"
            type="password"
            value={passwordData.current_password}
            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
            placeholder="••••••••"
            icon={Lock}
            required
          />

          <InputField
            label="New Password"
            type="password"
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
            placeholder="Min. 6 characters"
            icon={Lock}
            required
          />

          <InputField
            label="Confirm New Password"
            type="password"
            value={passwordData.confirm_password}
            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
            placeholder="Repeat new password"
            icon={Lock}
            required
          />

          <button
            type="submit"
            disabled={savingPassword}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all shadow-xs disabled:opacity-50"
          >
            {savingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
