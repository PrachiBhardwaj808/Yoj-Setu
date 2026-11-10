import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Profile() {
  const { user } = useAuth();
  const { profile, updateProfile, completionPercent } = useProfile();
  const { currentLanguage, setLanguage, supportedLanguages, t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize edit form whenever profile or active user switches
  useEffect(() => {
    setEditForm({ ...profile });
    setIsEditing(false);
  }, [user?.id, profile]);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(editForm);
    if (editForm.preferred_language) {
      setLanguage(editForm.preferred_language);
    }
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
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1B3D] tracking-tight">
            {t('profile.title', 'Citizen Profile')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('profile.subtitle', 'Manage your personal credentials, socioeconomic profile, and scheme eligibility parameters.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/onboarding"
            className="px-4 py-2 border border-gray-200 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors text-[#0F1B3D]"
          >
            {t('profile.openOnboarding', 'Open Onboarding Wizard ↗')}
          </Link>
          <button
            onClick={() => {
              if (!isEditing) setEditForm({ ...profile, preferred_language: currentLanguage.name });
              setIsEditing(!isEditing);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isEditing ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? t('profile.cancelEditing', 'Cancel Editing') : t('profile.editProfile', 'Edit Profile')}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
          <span>✓</span> {t('profile.saveSuccess', 'Profile attributes updated successfully. Scheme recommendations will automatically reflect these updates.')}
        </div>
      )}

      {/* Completion Meter Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {completionPercent}%
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#0F1B3D]">{t('profile.completeness', 'Profile Completeness')}</h2>
            <p className="text-xs text-gray-500">
              {completionPercent >= 80
                ? t('profile.confidentMatch', 'Your profile is thorough. You are matched with high confidence.')
                : t('profile.completeForRecommendations', 'Complete more fields to unlock personalized state and central schemes.')}
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
          <h2 className="text-base font-bold text-[#0F1B3D] border-b pb-3">{t('profile.editAttributes', 'Edit key profile attributes')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">{t('profile.state', 'State / Territory')}</label>
              <input
                type="text"
                value={editForm.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
                placeholder={t('profile.statePlaceholder', 'e.g. Punjab, Maharashtra')}
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">{t('profile.district', 'District')}</label>
              <input
                type="text"
                value={editForm.district || ''}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
                placeholder={t('profile.districtPlaceholder', 'District name')}
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">{t('profile.occupation', 'Occupation')}</label>
              <input
                type="text"
                value={editForm.occupation || ''}
                onChange={(e) => handleChange('occupation', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
                placeholder={t('profile.occupationPlaceholder', 'e.g. Farmer, Student, Artisan')}
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">{t('profile.householdIncome', 'Household Income')}</label>
              <input
                type="text"
                value={editForm.annual_household_income || ''}
                onChange={(e) => handleChange('annual_household_income', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2"
                placeholder={t('profile.incomePlaceholder', 'e.g. 150000, 1.5 lakh, or ₹2.5–5 lakh')}
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">{t('profile.socialCategory', 'Social Category')}</label>
              <select
                value={editForm.social_category || 'General'}
                onChange={(e) => handleChange('social_category', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              >
                <option value="General">{t('profile.generalCategory', 'General')}</option>
                <option value="OBC">{t('profile.obcCategory', 'OBC')}</option>
                <option value="SC">{t('profile.scCategory', 'SC')}</option>
                <option value="ST">{t('profile.stCategory', 'ST')}</option>
                <option value="EWS">{t('profile.ewsCategory', 'EWS')}</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">{t('profile.areaType', 'Area Type')}</label>
              <select
                value={editForm.rural_urban || 'Rural'}
                onChange={(e) => handleChange('rural_urban', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              >
                <option value="Rural">{t('profile.rural', 'Rural')}</option>
                <option value="Urban">{t('profile.urban', 'Urban')}</option>
                <option value="Semi-Urban">{t('profile.semiUrban', 'Semi-Urban')}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-gray-700 block mb-1">{t('profile.preferredLanguage', 'Preferred Language')}</label>
              <select
                value={editForm.preferred_language || currentLanguage.name}
                onChange={(e) => handleChange('preferred_language', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white"
              >
                {supportedLanguages.map(l => (
                  <option key={l.code} value={l.name}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-medium hover:bg-gray-50 cursor-pointer"
            >
              {t('profile.cancelEditing', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
            >
              {t('profile.saveChanges', 'Save Changes')}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-[#0F1B3D] uppercase tracking-wider text-xs border-b pb-2">
              {t('profile.accountCredentials', 'Account Credentials')}
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{t('profile.fullName', 'Full Name')}</span>
                <span className="font-semibold text-[#0F1B3D]">{displayName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{t('profile.phone', 'Phone Number')}</span>
                <span className="font-semibold text-[#0F1B3D] flex items-center gap-1.5">
                  {displayPhone}
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">✓ {t('profile.verified', 'Verified')}</span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{t('profile.email', 'Email Address')}</span>
                <span className="font-medium text-gray-700">{displayEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{t('profile.portalRole', 'Portal Role')}</span>
                <span className="font-medium text-blue-600 capitalize">{user?.role || t('profile.citizen', 'Citizen')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">{t('profile.preferredLanguage', 'Preferred Language')}</span>
                <span className="font-semibold text-[#0F1B3D] flex items-center gap-1.5">
                  <span aria-hidden="true">🌐</span> {currentLanguage.nativeName} ({currentLanguage.name})
                </span>
              </div>
            </div>
          </div>

          {/* Socioeconomic Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-[#0F1B3D] uppercase tracking-wider text-xs border-b pb-2">
              {t('profile.eligibilityLocation', 'Eligibility & Location Details')}
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{t('profile.state', 'State / Territory')}</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.state || t('profile.notSpecified', 'Not specified')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{t('profile.district', 'District')}</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.district || t('profile.notSpecified', 'Not specified')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{t('profile.occupation', 'Occupation')}</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.occupation || t('profile.notSpecified', 'Not specified')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{t('profile.householdIncome', 'Household Income')}</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.annual_household_income || t('profile.notSpecified', 'Not specified')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{t('profile.socialCategory', 'Social Category')}</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.social_category || t('profile.generalCategory', 'General')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">{t('profile.areaType', 'Area Type')}</span>
                <span className="font-semibold text-[#0F1B3D]">{profile.rural_urban || t('profile.rural', 'Rural')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
