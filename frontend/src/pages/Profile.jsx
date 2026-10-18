import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';

export default function Profile() {
  const { user } = useAuth();
  const { profile, updateProfile, completionPercent } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(editForm);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChange = (key, val) => {
    setEditForm(prev => ({ ...prev, [key]: val }));
  };

  const displayName = user?.full_name || profile.full_name || 'Citizen';
  const displayPhone = user?.phone || profile.phone || '—';
  const displayEmail = user?.email || profile.email || '—';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1B3D] tracking-tight">Citizen Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal credentials, socioeconomic profile, and scheme eligibility parameters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/onboarding"
            className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors text-[#0F1B3D]"
          >
            Open Onboarding Wizard ↗
          </Link>
          <button
            onClick={() => {
              if (!isEditing) setEditForm({ ...profile });
              setIsEditing(!isEditing);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isEditing ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
          <span>✓</span> Profile attributes updated successfully. Scheme recommendations will automatically reflect these updates.
        </div>
      )}

      {/* Completion Meter Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {completionPercent}%
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#0F1B3D]">Profile Completeness</h2>
            <p className="text-xs text-gray-500">
              {completionPercent >= 80
                ? 'Your profile is thorough. You are matched with high confidence.'
                : 'Complete more fields to unlock personalized state & central schemes.'}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-[#0F1B3D] border-b pb-3">Edit Key Profile Attributes</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">State</label>
              <input
                type="text"
                value={editForm.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
                placeholder="e.g. Punjab, Maharashtra"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">District</label>
              <input
                type="text"
                value={editForm.district || ''}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
                placeholder="District name"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Occupation</label>
              <input
                type="text"
                value={editForm.occupation || ''}
                onChange={(e) => handleChange('occupation', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
                placeholder="e.g. Farmer, Student, Artisan"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Annual Household Income</label>
              <select
                value={editForm.annual_household_income || ''}
                onChange={(e) => handleChange('annual_household_income', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
              >
                <option value="">Select Range</option>
                <option value="Below ₹1 Lakh">Below ₹1 Lakh</option>
                <option value="₹1–2.5 Lakhs">₹1–2.5 Lakhs</option>
                <option value="₹2.5–5 Lakhs">₹2.5–5 Lakhs</option>
                <option value="₹5–8 Lakhs">₹5–8 Lakhs</option>
                <option value="Above ₹8 Lakhs">Above ₹8 Lakhs</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Social Category</label>
              <select
                value={editForm.social_category || 'General'}
                onChange={(e) => handleChange('social_category', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Area Type</label>
              <select
                value={editForm.rural_urban || 'Rural'}
                onChange={(e) => handleChange('rural_urban', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
              >
                <option value="Rural">Rural</option>
                <option value="Urban">Urban</option>
                <option value="Semi-Urban">Semi-Urban</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-[#0F1B3D] uppercase tracking-wider text-xs border-b pb-2">
              Account Credentials
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Full Name</span>
                <span className="font-semibold text-[#0F1B3D]">{displayName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Phone Number</span>
                <span className="font-semibold text-[#0F1B3D] flex items-center gap-1.5">
                  {displayPhone}
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">✓ Verified</span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Email Address</span>
                <span className="font-medium text-gray-700">{displayEmail}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Portal Role</span>
                <span className="font-medium text-blue-600 capitalize">{user?.role || 'Citizen'}</span>
              </div>
            </div>
          </div>

          {/* Socioeconomic Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-[#0F1B3D] uppercase tracking-wider text-xs border-b pb-2">
              Eligibility & Location Details
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">State / Territory</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.state || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">District</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.district || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Occupation</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.occupation || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Household Income</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.annual_household_income || 'Not specified'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Social Category</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.social_category || 'General'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Area Type</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.rural_urban || 'Rural'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
