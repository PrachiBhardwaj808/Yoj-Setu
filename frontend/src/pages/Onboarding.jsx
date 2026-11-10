import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile, calculateProfileCompletion } from '../context/ProfileContext';
import { getCompletedOnboardingSections } from '../utils/profileUtils';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { completeOnboardingFlow } from '../utils/onboardingCompletion';

// ─── Outline Icons ────────────────────────────────────────────────────────────


function CheckCircleIcon({ className = "w-12 h-12" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="#16A34A" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function EditIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

// ─── State & District Mapping ─────────────────────────────────────────────────

const STATE_DISTRICTS = {
  Maharashtra: ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur'],
  'Uttar Pradesh': ['Lucknow', 'Varanasi', 'Kanpur', 'Agra', 'Gorakhpur', 'Prayagraj'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  Kerala: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Mohali'],
  Bihar: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi']
};

const INDIAN_LANGUAGES = [
  'English', 'हिन्दी', 'ਪੰਜਾਬੀ', 'বাংলা', 'मराठी',
  'தமிழ்', 'తెలుగు', 'ગુજરાતી', 'ಕನ್ನಡ', 'മലയാളം'
];

const ONBOARDING_VALUE_KEYS = {
  Male: 'onboarding.male',
  Female: 'onboarding.female',
  Other: 'onboarding.other',
  'Prefer not to say': 'onboarding.preferNotToSay',
  Rural: 'onboarding.rural',
  Urban: 'onboarding.urban',
  Farmer: 'onboarding.farmer',
  'Agricultural worker': 'onboarding.agriculturalWorker',
  'Daily wage worker': 'onboarding.dailyWageWorker',
  'Salaried employee': 'onboarding.salariedEmployee',
  'Self-employed': 'onboarding.selfEmployed',
  'Business owner': 'onboarding.businessOwner',
  Student: 'onboarding.student',
  Homemaker: 'onboarding.homemaker',
  Unemployed: 'onboarding.unemployed',
  Retired: 'onboarding.retired',
  General: 'onboarding.generalCategory',
  OBC: 'onboarding.obcCategory',
  SC: 'onboarding.scCategory',
  ST: 'onboarding.stCategory',
  Yes: 'onboarding.yes',
  No: 'onboarding.no',
  'Not sure': 'onboarding.notSure',
  Single: 'onboarding.single',
  Married: 'onboarding.married',
  Widowed: 'onboarding.widowed',
  Divorced: 'onboarding.divorced',
  'Own house': 'onboarding.ownHouse',
  Rented: 'onboarding.rented',
  'Government housing': 'onboarding.governmentHousing',
  Homeless: 'onboarding.homeless',
  LPG: 'onboarding.lpg',
  Electric: 'onboarding.electric',
  'Biomass/Wood': 'onboarding.biomassWood',
  'Below 1 acre': 'onboarding.belowOneAcre',
  '1–2 acres': 'onboarding.oneToTwoAcres',
  '2–5 acres': 'onboarding.twoToFiveAcres',
  '5+ acres': 'onboarding.fivePlusAcres',
  'Not applicable': 'onboarding.notApplicable',
  'Below ₹1 lakh': 'onboarding.incomeBelowOneLakh',
  '₹1–2.5 lakh': 'onboarding.incomeOneToTwoPointFiveLakh',
  '₹2.5–5 lakh': 'onboarding.incomeTwoPointFiveToFiveLakh',
  '₹5–8 lakh': 'onboarding.incomeFiveToEightLakh',
  '₹8–10 lakh': 'onboarding.incomeEightToTenLakh',
  'Above ₹10 lakh': 'onboarding.incomeAboveTenLakh',
  'SMS & Email': 'onboarding.smsAndEmail',
  'SMS Only': 'onboarding.smsOnly',
  'Email Only': 'onboarding.emailOnly',
  'In-app Only': 'onboarding.inAppOnly',
};

export default function Onboarding() {
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? '/yojsetu-logo-dark.png' : '/yojsetu-logo-light.png';
  const navigate = useNavigate();
  const { user, markOnboardingComplete } = useAuth();
  const { profile, saveProgress, onboardingStep } = useProfile();
  const { setLanguage, t } = useLanguage();
  const isOnboardingComplete = Boolean(user?.onboardingComplete || user?.onboarding_complete);

  const [step, setStep] = useState(() => isOnboardingComplete ? 8 : onboardingStep || 1);
  const [formData, setFormData] = useState(profile);
  const [age, setAge] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);
  const saveInProgress = useRef(false);

  // Synchronize onboarding form data and step when user or profile changes
  useEffect(() => {
    setStep(isOnboardingComplete ? 8 : onboardingStep || 1);
    setAge('');
    setFormData({
      ...profile,
      full_name: profile.full_name || user?.full_name || '',
      phone: profile.phone || user?.phone || '',
      email: profile.email || user?.email || '',
    });
  }, [user?.id, user?.full_name, user?.phone, user?.email, profile, onboardingStep, isOnboardingComplete]);

  // Calculate age automatically from Date of Birth
  useEffect(() => {
    if (!formData.date_of_birth) {
      setAge('');
      setFormData((previous) => previous.age ? { ...previous, age: '' } : previous);
      return;
    }

    const birthDate = new Date(`${formData.date_of_birth}T00:00:00`);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }

    if (Number.isFinite(computedAge) && computedAge >= 0 && computedAge < 120) {
      setAge(computedAge);
      setFormData((previous) => previous.age === computedAge
        ? previous
        : { ...previous, age: computedAge });
    } else {
      setAge('');
      setFormData((previous) => previous.age ? { ...previous, age: '' } : previous);
    }
  }, [formData.date_of_birth, user?.id]);

  const handleChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    if (field === 'state') {
      updated.district = '';
    }
    setFormData(updated);
  };

  const persistProgress = async (targetStep, successMessageKey) => {
    if (saveInProgress.current) return false;
    saveInProgress.current = true;
    setIsSaving(true);
    setSaveFeedback(null);
    try {
      await saveProgress(formData, targetStep);
      setSaveFeedback({ type: 'success', messageKey: successMessageKey });
      return true;
    } catch (error) {
      console.error('Unable to save onboarding progress:', error);
      setSaveFeedback({
        type: 'error',
        messageKey: 'onboarding.saveError',
      });
      return false;
    } finally {
      saveInProgress.current = false;
      setIsSaving(false);
    }
  };

  const handleNext = async (e) => {
    if (e) e.preventDefault();
    const nextStep = Math.min(7, step + 1);
    const didSave = await persistProgress(
      nextStep,
      'onboarding.progressSaved'
    );
    if (!didSave) return;
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = async () => {
    const prevStep = Math.max(1, step - 1);
    const didSave = await persistProgress(
      prevStep,
      'onboarding.progressSaved'
    );
    if (!didSave) return;
    setStep(prevStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveLater = async () => {
    await persistProgress(
      step,
      'onboarding.saveLaterSuccess'
    );
  };

  const handleCompleteProfile = async () => {
    try {
      await completeOnboardingFlow({
        saveProgress: () => persistProgress(7, 'onboarding.profileSaveSuccess'),
        markOnboardingComplete,
        onComplete: () => {
          setSaveFeedback(null);
          setStep(8);
        },
      });
    } catch (error) {
      console.error('Unable to complete onboarding:', error);
      setSaveFeedback({
        type: 'error',
        messageKey: 'onboarding.completeError',
      });
    }
  };

  const districtsForState = STATE_DISTRICTS[formData.state] || ['Select District'];
  const completedSections = getCompletedOnboardingSections(formData);
  const completedSectionCount = completedSections.filter(Boolean).length;
  const completionPercent = calculateProfileCompletion(formData);
  const displayProfileValue = (value) => {
    if (!value) return t('onboarding.notProvided', 'Not provided');
    const key = ONBOARDING_VALUE_KEYS[value];
    return key ? t(key, value) : value;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-900 border-b border-[#E2E8F0] dark:border-gray-800 px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5" aria-label={t('home.accessibilityLogo', 'YojSetu Home')}>
          <img
            src={logoSrc}
            alt="YojSetu Logo"
            className="h-12 md:h-14 w-auto object-contain hover:opacity-95 transition-opacity"
          />
        </Link>

        {step <= 6 && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#64748B] font-medium hidden sm:inline-block">
              {t('onboarding.stepProgress', 'Step {step} of 6 · {count} sections complete', {
                step,
                count: completedSectionCount,
              })}
            </span>
            <button
              type="button"
              onClick={handleSaveLater}
              disabled={isSaving}
              aria-busy={isSaving}
              className="text-xs font-medium text-[#64748B] hover:text-[#0F1B3D] disabled:opacity-60 bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:cursor-wait"
            >
              {isSaving
                ? t('onboarding.saving', 'Saving...')
                : t('onboarding.saveLater', 'Save & Continue Later')}
            </button>
          </div>
        )}
      </header>

      {/* Progress Bar */}
      {step <= 6 && (
        <div className="w-full bg-[#E2E8F0] h-1">
          <div
            className="bg-[#2563EB] h-1 transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
            role="progressbar"
            aria-label={t('onboarding.profileCompletion', 'Profile completion')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={completionPercent}
          />
        </div>
      )}

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        {saveFeedback && (
          <div
            role={saveFeedback.type === 'error' ? 'alert' : 'status'}
            aria-live={saveFeedback.type === 'error' ? 'assertive' : 'polite'}
            className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
              saveFeedback.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {t(saveFeedback.messageKey)}
          </div>
        )}
        
        {/* ─── STEP 1: PERSONAL INFORMATION ─── */}
        {step === 1 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">{t('onboarding.personalTitle', 'About you')}</h1>
              <p className="text-sm text-[#64748B]">{t('onboarding.personalDescription', 'A few basic details help us find relevant schemes.')}</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.fullName', 'Full Name')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('onboarding.fullNamePlaceholder', 'Enter your full name')}
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.dateOfBirth', 'Date of Birth')}</label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                  {age !== '' && (
                    <span className="inline-block text-xs font-medium text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md mt-1.5 border border-blue-100">
                      {t('onboarding.age', 'Age: {age}', { age })}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.gender', 'Gender')}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectGender', 'Select Gender')}</option>
                    <option value="Male">{t('onboarding.male', 'Male')}</option>
                    <option value="Female">{t('onboarding.female', 'Female')}</option>
                    <option value="Other">{t('onboarding.other', 'Other')}</option>
                    <option value="Prefer not to say">{t('onboarding.preferNotToSay', 'Prefer not to say')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.mobileNumber', 'Mobile Number')}</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.phone}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] cursor-not-allowed"
                  />
                  <span className="text-[11px] text-[#16A34A] mt-1 inline-block">✓ {t('onboarding.verifiedMobile', 'Verified mobile number')}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">
                    {t('onboarding.emailAddress', 'Email Address')} <span className="text-[#64748B] font-normal">{t('onboarding.optional', '(Optional)')}</span>
                  </label>
                  <input
                    type="email"
                    placeholder={t('onboarding.emailPlaceholder', 'name@example.com')}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {t('common.continue', 'Continue →')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 2: LOCATION ─── */}
        {step === 2 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">{t('onboarding.locationTitle', 'Where do you live?')}</h1>
              <p className="text-sm text-[#64748B]">{t('onboarding.locationDescription', 'Some schemes depend on your state, district or rural/urban location.')}</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.state', 'State')}</label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectState', 'Select State')}</option>
                    {Object.keys(STATE_DISTRICTS).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.district', 'District')}</label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    disabled={!formData.state}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectDistrict', 'Select District')}</option>
                    {formData.state && districtsForState.map(dst => (
                      <option key={dst} value={dst}>{dst}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.blockTaluk', 'Block / Taluk')}</label>
                  <input
                    type="text"
                    placeholder={t('onboarding.blockPlaceholder', 'Enter block or taluk')}
                    value={formData.block}
                    onChange={(e) => handleChange('block', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.villageCity', 'Village / City')}</label>
                  <input
                    type="text"
                    placeholder={t('onboarding.villagePlaceholder', 'Enter village or city')}
                    value={formData.village_city}
                    onChange={(e) => handleChange('village_city', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.pinCode', 'PIN Code')}</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder={t('onboarding.pinPlaceholder', '6-digit PIN Code')}
                    value={formData.pin_code}
                    onChange={(e) => handleChange('pin_code', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.residenceType', 'Residence Type')}</label>
                  <div className="flex bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => handleChange('rural_urban', 'Rural')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                        formData.rural_urban === 'Rural' ? 'bg-white text-[#0F1B3D] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      {t('onboarding.rural', 'Rural')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('rural_urban', 'Urban')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                        formData.rural_urban === 'Urban' ? 'bg-white text-[#0F1B3D] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      {t('onboarding.urban', 'Urban')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('common.back', '← Back')}
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {t('common.continue', 'Continue →')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 3: OCCUPATION & INCOME ─── */}
        {step === 3 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">{t('onboarding.workTitle', 'What do you do?')}</h1>
              <p className="text-sm text-[#64748B]">{t('onboarding.workDescription', 'Occupation and income ranges help filter economic welfare criteria.')}</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.occupation', 'Occupation')}</label>
                <select
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="">{t('onboarding.selectOccupation', 'Select Occupation')}</option>
                  <option value="Farmer">{t('onboarding.farmer', 'Farmer')}</option>
                  <option value="Agricultural worker">{t('onboarding.agriculturalWorker', 'Agricultural worker')}</option>
                  <option value="Daily wage worker">{t('onboarding.dailyWageWorker', 'Daily wage worker')}</option>
                  <option value="Salaried employee">{t('onboarding.salariedEmployee', 'Salaried employee')}</option>
                  <option value="Self-employed">{t('onboarding.selfEmployed', 'Self-employed')}</option>
                  <option value="Business owner">{t('onboarding.businessOwner', 'Business owner')}</option>
                  <option value="Student">{t('onboarding.student', 'Student')}</option>
                  <option value="Homemaker">{t('onboarding.homemaker', 'Homemaker')}</option>
                  <option value="Unemployed">{t('onboarding.unemployed', 'Unemployed')}</option>
                  <option value="Retired">{t('onboarding.retired', 'Retired')}</option>
                  <option value="Other">{t('onboarding.other', 'Other')}</option>
                </select>
              </div>

              {/* Conditional Farmer Questions */}
              {formData.occupation === 'Farmer' && (
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0F1B3D] mb-1">{t('onboarding.landOwnership', 'Land Ownership')}</label>
                    <select
                      value={formData.land_ownership}
                      onChange={(e) => handleChange('land_ownership', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs"
                    >
                      <option value="">{t('onboarding.selectOwnership', 'Select Ownership')}</option>
                      <option value="Own land">{t('onboarding.ownLand', 'Own land')}</option>
                      <option value="Lease land">{t('onboarding.leaseLand', 'Lease land')}</option>
                      <option value="No land">{t('onboarding.noLand', 'No land')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#0F1B3D] mb-1">{t('onboarding.landHolding', 'Approximate Land Holding')}</label>
                    <select
                      value={formData.land_holding}
                      onChange={(e) => handleChange('land_holding', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs"
                    >
                      <option value="">{t('onboarding.selectArea', 'Select Area')}</option>
                      <option value="Below 1 acre">{t('onboarding.belowOneAcre', 'Below 1 acre')}</option>
                      <option value="1–2 acres">{t('onboarding.oneToTwoAcres', '1–2 acres')}</option>
                      <option value="2–5 acres">{t('onboarding.twoToFiveAcres', '2–5 acres')}</option>
                      <option value="5+ acres">{t('onboarding.fivePlusAcres', '5+ acres')}</option>
                      <option value="Not applicable">{t('onboarding.notApplicable', 'Not applicable')}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Conditional Personal Income */}
              {['Salaried employee', 'Self-employed', 'Business owner'].includes(formData.occupation) && (
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.personalIncome', 'Annual Personal Income')}</label>
                  <select
                    value={formData.annual_personal_income}
                    onChange={(e) => handleChange('annual_personal_income', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectPersonalIncome', 'Select Personal Income Range')}</option>
                    <option value="Below ₹1 lakh">{t('onboarding.incomeBelowOneLakh', 'Below ₹1 lakh')}</option>
                    <option value="₹1–2.5 lakh">{t('onboarding.incomeOneToTwoPointFiveLakh', '₹1–2.5 lakh')}</option>
                    <option value="₹2.5–5 lakh">{t('onboarding.incomeTwoPointFiveToFiveLakh', '₹2.5–5 lakh')}</option>
                    <option value="₹5–8 lakh">{t('onboarding.incomeFiveToEightLakh', '₹5–8 lakh')}</option>
                    <option value="₹8–10 lakh">{t('onboarding.incomeEightToTenLakh', '₹8–10 lakh')}</option>
                    <option value="Above ₹10 lakh">{t('onboarding.incomeAboveTenLakh', 'Above ₹10 lakh')}</option>
                    <option value="Prefer not to say">{t('onboarding.preferNotToSay', 'Prefer not to say')}</option>
                  </select>
                </div>
              )}

              {/* Household Income (Everyone) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#111827]">{t('onboarding.householdIncome', 'Annual Household Income')}</label>
                  <span className="text-[11px] text-[#64748B]">{t('onboarding.incomeApproximation', 'An approximate range is enough.')}</span>
                </div>
                <select
                  value={formData.annual_household_income}
                  onChange={(e) => handleChange('annual_household_income', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="">{t('onboarding.selectHouseholdIncome', 'Select Household Income Range')}</option>
                  <option value="Below ₹1 lakh">{t('onboarding.incomeBelowOneLakh', 'Below ₹1 lakh')}</option>
                  <option value="₹1–2.5 lakh">{t('onboarding.incomeOneToTwoPointFiveLakh', '₹1–2.5 lakh')}</option>
                  <option value="₹2.5–5 lakh">{t('onboarding.incomeTwoPointFiveToFiveLakh', '₹2.5–5 lakh')}</option>
                  <option value="₹5–8 lakh">{t('onboarding.incomeFiveToEightLakh', '₹5–8 lakh')}</option>
                  <option value="₹8–10 lakh">{t('onboarding.incomeEightToTenLakh', '₹8–10 lakh')}</option>
                  <option value="Above ₹10 lakh">{t('onboarding.incomeAboveTenLakh', 'Above ₹10 lakh')}</option>
                  <option value="Prefer not to say">{t('onboarding.preferNotToSay', 'Prefer not to say')}</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('common.back', '← Back')}
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {t('common.continue', 'Continue →')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 4: SOCIAL & ELIGIBILITY INFORMATION ─── */}
        {step === 4 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">{t('onboarding.eligibilityTitle', 'A few more details')}</h1>
              <p className="text-sm text-[#64748B]">{t('onboarding.eligibilityDescription', 'Some schemes are designed for specific communities or circumstances.')}</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.socialCategory', 'Social Category')}</label>
                <select
                  value={formData.social_category}
                  onChange={(e) => handleChange('social_category', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="">{t('onboarding.selectCategory', 'Select Category')}</option>
                  <option value="General">{t('onboarding.generalCategory', 'General')}</option>
                  <option value="OBC">{t('onboarding.obcCategory', 'OBC')}</option>
                  <option value="SC">{t('onboarding.scCategory', 'SC')}</option>
                  <option value="ST">{t('onboarding.stCategory', 'ST')}</option>
                  <option value="Other">{t('onboarding.other', 'Other')}</option>
                  <option value="Prefer not to say">{t('onboarding.preferNotToSay', 'Prefer not to say')}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.disabilityStatus', 'Disability Status')}</label>
                  <select
                    value={formData.disability_status}
                    onChange={(e) => handleChange('disability_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectStatus', 'Select status')}</option>
                    <option value="No">{t('onboarding.no', 'No')}</option>
                    <option value="Yes">{t('onboarding.yes', 'Yes')}</option>
                    <option value="Prefer not to say">{t('onboarding.preferNotToSay', 'Prefer not to say')}</option>
                  </select>
                </div>

                {formData.disability_status === 'Yes' && (
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.disabilityPercentage', 'Disability Percentage')}</label>
                    <input
                      type="text"
                      placeholder={t('onboarding.disabilityPlaceholder', 'e.g. 40%')}
                      value={formData.disability_percentage}
                      onChange={(e) => handleChange('disability_percentage', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.bplRationCardHolder', 'BPL / Ration Card Holder')}</label>
                  <select
                    value={formData.bpl_status}
                    onChange={(e) => handleChange('bpl_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectStatus', 'Select status')}</option>
                    <option value="No">{t('onboarding.no', 'No')}</option>
                    <option value="Yes">{t('onboarding.yes', 'Yes')}</option>
                    <option value="Not sure">{t('onboarding.notSure', 'Not sure')}</option>
                    <option value="Prefer not to say">{t('onboarding.preferNotToSay', 'Prefer not to say')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.minorityCommunity', 'Minority Community')}</label>
                  <select
                    value={formData.minority_status}
                    onChange={(e) => handleChange('minority_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectStatus', 'Select status')}</option>
                    <option value="No">{t('onboarding.no', 'No')}</option>
                    <option value="Yes">{t('onboarding.yes', 'Yes')}</option>
                    <option value="Prefer not to say">{t('onboarding.preferNotToSay', 'Prefer not to say')}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('common.back', '← Back')}
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {t('common.continue', 'Continue →')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 5: FAMILY & HOUSEHOLD ─── */}
        {step === 5 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">{t('onboarding.householdTitle', 'About your household')}</h1>
              <p className="text-sm text-[#64748B]">{t('onboarding.householdDescription', 'Family composition helps match housing, health and welfare schemes.')}</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.maritalStatus', 'Marital Status')}</label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => handleChange('marital_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectMaritalStatus', 'Select Status')}</option>
                    <option value="Single">{t('onboarding.single', 'Single')}</option>
                    <option value="Married">{t('onboarding.married', 'Married')}</option>
                    <option value="Widowed">{t('onboarding.widowed', 'Widowed')}</option>
                    <option value="Divorced">{t('onboarding.divorced', 'Divorced')}</option>
                    <option value="Prefer not to say">{t('onboarding.preferNotToSay', 'Prefer not to say')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.familyMembersCount', 'Family Members Count')}</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.family_size}
                    required
                    onChange={(e) => handleChange('family_size', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.numberOfChildren', 'Number of Children')}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.children_count}
                    required
                    onChange={(e) => handleChange('children_count', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.childrenBelowFive', 'Children Below 5 Years')}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.children_below_5}
                    onChange={(e) => handleChange('children_below_5', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">{t('onboarding.seniorCitizen', 'Senior Citizen (60+)')}</label>
                  <select
                    value={formData.senior_citizen_in_household}
                    onChange={(e) => handleChange('senior_citizen_in_household', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                  >
                    <option value="No">{t('onboarding.no', 'No')}</option>
                    <option value="Yes">{t('onboarding.yes', 'Yes')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">{t('onboarding.personWithDisability', 'Person with Disability')}</label>
                  <select
                    value={formData.disability_in_household}
                    onChange={(e) => handleChange('disability_in_household', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                  >
                    <option value="No">{t('onboarding.no', 'No')}</option>
                    <option value="Yes">{t('onboarding.yes', 'Yes')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">{t('onboarding.pregnantWoman', 'Pregnant Woman')}</label>
                  <select
                    value={formData.pregnant_woman_in_household}
                    onChange={(e) => handleChange('pregnant_woman_in_household', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                  >
                    <option value="No">{t('onboarding.no', 'No')}</option>
                    <option value="Yes">{t('onboarding.yes', 'Yes')}</option>
                    <option value="Prefer not to say">{t('onboarding.preferNotToSay', 'Prefer not to say')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.housingStatus', 'Housing Status')}</label>
                  <select
                    value={formData.housing_status}
                    onChange={(e) => handleChange('housing_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectHousingStatus', 'Select Status')}</option>
                    <option value="Own house">{t('onboarding.ownHouse', 'Own house')}</option>
                    <option value="Rented">{t('onboarding.rented', 'Rented')}</option>
                    <option value="Government housing">{t('onboarding.governmentHousing', 'Government housing')}</option>
                    <option value="Homeless">{t('onboarding.homeless', 'Homeless')}</option>
                    <option value="Other">{t('onboarding.other', 'Other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.cookingFuel', 'Cooking Fuel')}</label>
                  <select
                    value={formData.cooking_fuel}
                    onChange={(e) => handleChange('cooking_fuel', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="LPG">{t('onboarding.lpg', 'LPG')}</option>
                    <option value="Electric">{t('onboarding.electric', 'Electric')}</option>
                    <option value="Biomass/Wood">{t('onboarding.biomassWood', 'Biomass/Wood')}</option>
                    <option value="Other">{t('onboarding.other', 'Other')}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('common.back', '← Back')}
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {t('common.continue', 'Continue →')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 6: DOCUMENTS & PREFERENCES ─── */}
        {step === 6 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">{t('onboarding.documentsTitle', 'Help us prepare for applications')}</h1>
              <p className="text-sm text-[#64748B]">{t('onboarding.documentsDescription', 'You can check available documents now or add them later.')}</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div className="space-y-3 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <p className="text-xs font-semibold text-[#0F1B3D]">{t('onboarding.documentsYouHave', 'Which documents do you currently have?')}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-[#111827] mb-1">{t('onboarding.aadhaarCard', 'Aadhaar Card')}</label>
                    <select
                      value={formData.has_aadhaar}
                      onChange={(e) => handleChange('has_aadhaar', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="">{t('onboarding.selectStatus', 'Select status')}</option>
                      <option value="Yes">{t('onboarding.yes', 'Yes')}</option>
                      <option value="No">{t('onboarding.no', 'No')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#111827] mb-1">{t('onboarding.bankAccount', 'Bank Account')}</label>
                    <select
                      value={formData.has_bank_account}
                      onChange={(e) => handleChange('has_bank_account', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="">{t('onboarding.selectStatus', 'Select status')}</option>
                      <option value="Yes">{t('onboarding.yes', 'Yes')}</option>
                      <option value="No">{t('onboarding.no', 'No')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#111827] mb-1">{t('onboarding.rationCard', 'Ration Card')}</label>
                    <select
                      value={formData.has_ration_card}
                      onChange={(e) => handleChange('has_ration_card', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="">{t('onboarding.selectStatus', 'Select status')}</option>
                      <option value="Yes">{t('onboarding.yes', 'Yes')}</option>
                      <option value="No">{t('onboarding.no', 'No')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#111827] mb-1">{t('onboarding.incomeCertificate', 'Income Certificate')}</label>
                    <select
                      value={formData.has_income_certificate}
                      onChange={(e) => handleChange('has_income_certificate', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="Yes">{t('onboarding.yes', 'Yes')}</option>
                      <option value="No">{t('onboarding.no', 'No')}</option>
                      <option value="Not sure">{t('onboarding.notSure', 'Not sure')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.preferredLanguage', 'Preferred Language')}</label>
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => {
                      handleChange('preferred_language', e.target.value);
                      setLanguage(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectLanguage', 'Select language')}</option>
                    {INDIAN_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">{t('onboarding.notificationChannel', 'Notification Channel')}</label>
                  <select
                    value={formData.notification_preferences}
                    onChange={(e) => handleChange('notification_preferences', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">{t('onboarding.selectChannel', 'Select channel')}</option>
                    <option value="SMS & Email">{t('onboarding.smsAndEmail', 'SMS & Email')}</option>
                    <option value="SMS Only">{t('onboarding.smsOnly', 'SMS Only')}</option>
                    <option value="Email Only">{t('onboarding.emailOnly', 'Email Only')}</option>
                    <option value="In-app Only">{t('onboarding.inAppOnly', 'In-app Only')}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  {t('common.back', '← Back')}
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {t('common.reviewProfile', 'Review Profile →')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 7: PROFILE REVIEW ─── */}
        {step === 7 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div>
                <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">{t('onboarding.reviewTitle', 'Review your profile')}</h1>
                  <p className="text-sm text-[#64748B]">{t('onboarding.reviewDescription', 'Verify your details before completing setup.')}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#64748B] block">{t('onboarding.completion', 'Completion')}</span>
                <span className="text-sm font-semibold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  {completionPercent}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* Personal */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">{t('onboarding.reviewPersonal', '1. Personal')}</h4>
                  <p className="text-xs text-[#64748B]">
                    {displayProfileValue(formData.full_name)} · {t('onboarding.age', 'Age: {age}', { age: formData.age || 'N/A' })} · {displayProfileValue(formData.gender)} · {formData.phone}
                  </p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> {t('onboarding.edit', 'Edit')}
                </button>
              </div>

              {/* Location */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">{t('onboarding.reviewLocation', '2. Location')}</h4>
                  <p className="text-xs text-[#64748B]">
                    {displayProfileValue(formData.district)}, {displayProfileValue(formData.state)} · {displayProfileValue(formData.rural_urban)}
                  </p>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> {t('onboarding.edit', 'Edit')}
                </button>
              </div>

              {/* Work & Income */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">{t('onboarding.reviewWorkIncome', '3. Work & Income')}</h4>
                  <p className="text-xs text-[#64748B]">
                    {t('onboarding.occupationSummary', 'Occupation:')} {displayProfileValue(formData.occupation)} · {t('onboarding.householdIncomeSummary', 'Household Income:')} {displayProfileValue(formData.annual_household_income)}
                  </p>
                </div>
                <button onClick={() => setStep(3)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> {t('onboarding.edit', 'Edit')}
                </button>
              </div>

              {/* Social & Eligibility */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">{t('onboarding.reviewEligibility', '4. Eligibility Profile')}</h4>
                  <p className="text-xs text-[#64748B]">
                    {t('onboarding.categorySummary', 'Category:')} {displayProfileValue(formData.social_category)} · {t('onboarding.disabilitySummary', 'Disability:')} {displayProfileValue(formData.disability_status)} · {t('onboarding.bplCardSummary', 'BPL Card:')} {displayProfileValue(formData.bpl_status)}
                  </p>
                </div>
                <button onClick={() => setStep(4)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> {t('onboarding.edit', 'Edit')}
                </button>
              </div>

              {/* Household */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">{t('onboarding.reviewHousehold', '5. Household')}</h4>
                  <p className="text-xs text-[#64748B]">
                    {t('onboarding.maritalSummary', 'Marital:')} {displayProfileValue(formData.marital_status)} · {t('onboarding.familyMembersSummary', 'Family Members:')} {displayProfileValue(formData.family_size)} · {t('onboarding.childrenSummary', 'Children:')} {displayProfileValue(formData.children_count)}
                  </p>
                </div>
                <button onClick={() => setStep(5)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> {t('onboarding.edit', 'Edit')}
                </button>
              </div>

              {/* Documents & Preferences */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">{t('onboarding.reviewPreferences', '6. Preferences')}</h4>
                  <p className="text-xs text-[#64748B]">
                    {t('onboarding.languageSummary', 'Language:')} {displayProfileValue(formData.preferred_language)} · {t('onboarding.channelSummary', 'Channel:')} {displayProfileValue(formData.notification_preferences)}
                  </p>
                </div>
                <button onClick={() => setStep(6)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> {t('onboarding.edit', 'Edit')}
                </button>
              </div>

            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                {t('common.back', '← Back')}
              </button>
              <button
                onClick={handleCompleteProfile}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-8 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {t('common.completeProfile', 'Complete Profile →')}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 8: PROFILE SUCCESS STATE ─── */}
        {step === 8 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center space-y-6 shadow-xs max-w-lg mx-auto my-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 mx-auto">
              <CheckCircleIcon className="w-10 h-10 text-[#16A34A]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">{t('onboarding.successTitle', "You're all set.")}</h1>
              <p className="text-sm text-[#64748B] max-w-sm mx-auto">
                {t('onboarding.successDescription', "We'll use your profile to find government schemes that may be relevant to you.")}
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-8 py-3.5 rounded-xl transition-all shadow-xs cursor-pointer w-full"
              >
                {t('onboarding.seeRecommendations', 'See my recommendations →')}
              </button>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
