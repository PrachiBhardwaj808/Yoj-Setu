import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

// ─── Outline Icons ────────────────────────────────────────────────────────────

function LogoMark({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect width="32" height="32" rx="8" fill="#0F1B3D" />
      <path d="M9 16L14 21L23 10" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23" cy="10" r="2.5" fill="#2563EB" />
    </svg>
  );
}

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

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, markOnboardingComplete } = useAuth();
  const { profile, updateProfile, saveStep, onboardingStep, completionPercent } = useProfile();

  const [step, setStep] = useState(onboardingStep || 1); // 1-6: Form, 7: Review, 8: Success
  const [formData, setFormData] = useState(profile);
  const [age, setAge] = useState('');

  // Hydrate user info from Auth
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  // Calculate age automatically from Date of Birth
  useEffect(() => {
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      let computedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        computedAge--;
      }
      if (computedAge >= 0 && computedAge < 120) {
        setAge(computedAge);
        setFormData(prev => ({ ...prev, age: computedAge }));
      }
    }
  }, [formData.date_of_birth]);

  const handleChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    if (field === 'state' && STATE_DISTRICTS[val]) {
      updated.district = STATE_DISTRICTS[val][0];
    }
    setFormData(updated);
    updateProfile(updated);
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    const nextStep = Math.min(8, step + 1);
    setStep(nextStep);
    saveStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    const prevStep = Math.max(1, step - 1);
    setStep(prevStep);
    saveStep(prevStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveLater = () => {
    updateProfile(formData);
    saveStep(step);
    navigate('/dashboard');
  };

  const handleCompleteProfile = () => {
    updateProfile(formData);
    markOnboardingComplete();
    setStep(8); // Success state
  };

  const districtsForState = STATE_DISTRICTS[formData.state] || ['Select District'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark className="w-7 h-7" />
          <span className="font-semibold text-lg text-[#0F1B3D] tracking-tight">Yojsetu</span>
        </Link>

        {step <= 6 && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#64748B] font-medium hidden sm:inline-block">
              Step {step} of 6
            </span>
            <button
              onClick={handleSaveLater}
              className="text-xs font-medium text-[#64748B] hover:text-[#0F1B3D] bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Save & Continue Later
            </button>
          </div>
        )}
      </header>

      {/* Progress Bar */}
      {step <= 6 && (
        <div className="w-full bg-[#E2E8F0] h-1">
          <div
            className="bg-[#2563EB] h-1 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      )}

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        
        {/* ─── STEP 1: PERSONAL INFORMATION ─── */}
        {step === 1 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">About you</h1>
              <p className="text-sm text-[#64748B]">A few basic details help us find relevant schemes.</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                  {age !== '' && (
                    <span className="inline-block text-xs font-medium text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md mt-1.5 border border-blue-100">
                      Age: {age}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Mobile Number</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.phone}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] cursor-not-allowed"
                  />
                  <span className="text-[11px] text-[#16A34A] mt-1 inline-block">✓ Verified mobile number</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">
                    Email Address <span className="text-[#64748B] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
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
                  Continue →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 2: LOCATION ─── */}
        {step === 2 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">Where do you live?</h1>
              <p className="text-sm text-[#64748B]">Some schemes depend on your state, district or rural/urban location.</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">State</label>
                  <select
                    value={formData.state || Object.keys(STATE_DISTRICTS)[0]}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    {Object.keys(STATE_DISTRICTS).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">District</label>
                  <select
                    value={formData.district || districtsForState[0]}
                    onChange={(e) => handleChange('district', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    {districtsForState.map(dst => (
                      <option key={dst} value={dst}>{dst}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Block / Taluk</label>
                  <input
                    type="text"
                    placeholder="Enter block or taluk"
                    value={formData.block}
                    onChange={(e) => handleChange('block', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Village / City</label>
                  <input
                    type="text"
                    placeholder="Enter village or city"
                    value={formData.village_city}
                    onChange={(e) => handleChange('village_city', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6-digit PIN Code"
                    value={formData.pin_code}
                    onChange={(e) => handleChange('pin_code', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Residence Type</label>
                  <div className="flex bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => handleChange('rural_urban', 'Rural')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                        formData.rural_urban === 'Rural' ? 'bg-white text-[#0F1B3D] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      Rural
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('rural_urban', 'Urban')}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                        formData.rural_urban === 'Urban' ? 'bg-white text-[#0F1B3D] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      Urban
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
                  ← Back
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 3: OCCUPATION & INCOME ─── */}
        {step === 3 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">What do you do?</h1>
              <p className="text-sm text-[#64748B]">Occupation and income ranges help filter economic welfare criteria.</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1.5">Occupation</label>
                <select
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="">Select Occupation</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Agricultural worker">Agricultural worker</option>
                  <option value="Daily wage worker">Daily wage worker</option>
                  <option value="Salaried employee">Salaried employee</option>
                  <option value="Self-employed">Self-employed</option>
                  <option value="Business owner">Business owner</option>
                  <option value="Student">Student</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Retired">Retired</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Conditional Farmer Questions */}
              {formData.occupation === 'Farmer' && (
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#0F1B3D] mb-1">Land Ownership</label>
                    <select
                      value={formData.land_ownership}
                      onChange={(e) => handleChange('land_ownership', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs"
                    >
                      <option value="">Select Ownership</option>
                      <option value="Own land">Own land</option>
                      <option value="Lease land">Lease land</option>
                      <option value="No land">No land</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#0F1B3D] mb-1">Approximate Land Holding</label>
                    <select
                      value={formData.land_holding}
                      onChange={(e) => handleChange('land_holding', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs"
                    >
                      <option value="">Select Area</option>
                      <option value="Below 1 acre">Below 1 acre</option>
                      <option value="1–2 acres">1–2 acres</option>
                      <option value="2–5 acres">2–5 acres</option>
                      <option value="5+ acres">5+ acres</option>
                      <option value="Not applicable">Not applicable</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Conditional Personal Income */}
              {['Salaried employee', 'Self-employed', 'Business owner'].includes(formData.occupation) && (
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Annual Personal Income</label>
                  <select
                    value={formData.annual_personal_income}
                    onChange={(e) => handleChange('annual_personal_income', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Select Personal Income Range</option>
                    <option value="Below ₹1 lakh">Below ₹1 lakh</option>
                    <option value="₹1–2.5 lakh">₹1–2.5 lakh</option>
                    <option value="₹2.5–5 lakh">₹2.5–5 lakh</option>
                    <option value="₹5–8 lakh">₹5–8 lakh</option>
                    <option value="₹8–10 lakh">₹8–10 lakh</option>
                    <option value="Above ₹10 lakh">Above ₹10 lakh</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              )}

              {/* Household Income (Everyone) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#111827]">Annual Household Income</label>
                  <span className="text-[11px] text-[#64748B]">An approximate range is enough.</span>
                </div>
                <select
                  value={formData.annual_household_income}
                  onChange={(e) => handleChange('annual_household_income', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="">Select Household Income Range</option>
                  <option value="Below ₹1 lakh">Below ₹1 lakh</option>
                  <option value="₹1–2.5 lakh">₹1–2.5 lakh</option>
                  <option value="₹2.5–5 lakh">₹2.5–5 lakh</option>
                  <option value="₹5–8 lakh">₹5–8 lakh</option>
                  <option value="₹8–10 lakh">₹8–10 lakh</option>
                  <option value="Above ₹10 lakh">Above ₹10 lakh</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 4: SOCIAL & ELIGIBILITY INFORMATION ─── */}
        {step === 4 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">A few more details</h1>
              <p className="text-sm text-[#64748B]">Some schemes are designed for specific communities or circumstances.</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1.5">Social Category</label>
                <select
                  value={formData.social_category}
                  onChange={(e) => handleChange('social_category', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Disability Status</label>
                  <select
                    value={formData.disability_status}
                    onChange={(e) => handleChange('disability_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {formData.disability_status === 'Yes' && (
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1.5">Disability Percentage</label>
                    <input
                      type="text"
                      placeholder="e.g. 40%"
                      value={formData.disability_percentage}
                      onChange={(e) => handleChange('disability_percentage', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">BPL / Ration Card Holder</label>
                  <select
                    value={formData.bpl_status}
                    onChange={(e) => handleChange('bpl_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Not sure">Not sure</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Minority Community</label>
                  <select
                    value={formData.minority_status}
                    onChange={(e) => handleChange('minority_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 5: FAMILY & HOUSEHOLD ─── */}
        {step === 5 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">About your household</h1>
              <p className="text-sm text-[#64748B]">Family composition helps match housing, health and welfare schemes.</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Marital Status</label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => handleChange('marital_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Family Members Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.family_size}
                    onChange={(e) => handleChange('family_size', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Number of Children</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.children_count}
                    onChange={(e) => handleChange('children_count', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Children Below 5 Years</label>
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
                  <label className="block text-xs font-medium text-[#111827] mb-1">Senior Citizen (60+)</label>
                  <select
                    value={formData.senior_citizen_in_household}
                    onChange={(e) => handleChange('senior_citizen_in_household', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">Person with Disability</label>
                  <select
                    value={formData.disability_in_household}
                    onChange={(e) => handleChange('disability_in_household', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">Pregnant Woman</label>
                  <select
                    value={formData.pregnant_woman_in_household}
                    onChange={(e) => handleChange('pregnant_woman_in_household', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Housing Status</label>
                  <select
                    value={formData.housing_status}
                    onChange={(e) => handleChange('housing_status', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Select Status</option>
                    <option value="Own house">Own house</option>
                    <option value="Rented">Rented</option>
                    <option value="Government housing">Government housing</option>
                    <option value="Homeless">Homeless</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Cooking Fuel</label>
                  <select
                    value={formData.cooking_fuel}
                    onChange={(e) => handleChange('cooking_fuel', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="LPG">LPG</option>
                    <option value="Electric">Electric</option>
                    <option value="Biomass/Wood">Biomass/Wood</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP 6: DOCUMENTS & PREFERENCES ─── */}
        {step === 6 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">Help us prepare for applications</h1>
              <p className="text-sm text-[#64748B]">You can check available documents now or add them later.</p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div className="space-y-3 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <p className="text-xs font-semibold text-[#0F1B3D]">Which documents do you currently have?</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-[#111827] mb-1">Aadhaar Card</label>
                    <select
                      value={formData.has_aadhaar}
                      onChange={(e) => handleChange('has_aadhaar', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#111827] mb-1">Bank Account</label>
                    <select
                      value={formData.has_bank_account}
                      onChange={(e) => handleChange('has_bank_account', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#111827] mb-1">Ration Card</label>
                    <select
                      value={formData.has_ration_card}
                      onChange={(e) => handleChange('has_ration_card', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#111827] mb-1">Income Certificate</label>
                    <select
                      value={formData.has_income_certificate}
                      onChange={(e) => handleChange('has_income_certificate', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Not sure">Not sure</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Preferred Language</label>
                  <select
                    value={formData.preferred_language}
                    onChange={(e) => handleChange('preferred_language', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    {INDIAN_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1.5">Notification Channel</label>
                  <select
                    value={formData.notification_preferences}
                    onChange={(e) => handleChange('notification_preferences', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="SMS & Email">SMS & Email</option>
                    <option value="SMS Only">SMS Only</option>
                    <option value="Email Only">Email Only</option>
                    <option value="In-app Only">In-app Only</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Review Profile →
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
                <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">Review your profile</h1>
                <p className="text-sm text-[#64748B]">Verify your details before completing setup.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#64748B] block">Completion</span>
                <span className="text-sm font-semibold text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  {completionPercent}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* Personal */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">1. Personal</h4>
                  <p className="text-xs text-[#64748B]">
                    {formData.full_name || 'N/A'} · Age: {formData.age || 'N/A'} · {formData.gender || 'N/A'} · {formData.phone}
                  </p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              {/* Location */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">2. Location</h4>
                  <p className="text-xs text-[#64748B]">
                    {formData.district || 'N/A'}, {formData.state || 'N/A'} · {formData.rural_urban || 'Rural'}
                  </p>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              {/* Work & Income */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">3. Work & Income</h4>
                  <p className="text-xs text-[#64748B]">
                    Occupation: {formData.occupation || 'Farmer'} · Household Income: {formData.annual_household_income || 'Below ₹2.5L'}
                  </p>
                </div>
                <button onClick={() => setStep(3)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              {/* Social & Eligibility */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">4. Eligibility Profile</h4>
                  <p className="text-xs text-[#64748B]">
                    Category: {formData.social_category || 'General'} · Disability: {formData.disability_status || 'No'} · BPL Card: {formData.bpl_status || 'No'}
                  </p>
                </div>
                <button onClick={() => setStep(4)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              {/* Household */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">5. Household</h4>
                  <p className="text-xs text-[#64748B]">
                    Marital: {formData.marital_status || 'Married'} · Family Members: {formData.family_size || 4} · Children: {formData.children_count || 2}
                  </p>
                </div>
                <button onClick={() => setStep(5)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              {/* Documents & Preferences */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#0F1B3D]">6. Preferences</h4>
                  <p className="text-xs text-[#64748B]">
                    Language: {formData.preferred_language || 'English'} · Channel: {formData.notification_preferences || 'SMS & Email'}
                  </p>
                </div>
                <button onClick={() => setStep(6)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
                  <EditIcon className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={handleCompleteProfile}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-8 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Complete Profile →
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
              <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">You're all set.</h1>
              <p className="text-sm text-[#64748B] max-w-sm mx-auto">
                We'll use your profile to find government schemes that may be relevant to you.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm px-8 py-3.5 rounded-xl transition-all shadow-xs cursor-pointer w-full"
              >
                See my recommendations →
              </button>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
