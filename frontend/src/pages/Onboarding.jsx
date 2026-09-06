import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LogoMark({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect width="32" height="32" rx="8" fill="#0F1B3D" />
      <path d="M9 16L14 21L23 10" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23" cy="10" r="2.5" fill="#2563EB" />
    </svg>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, markOnboardingComplete } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    dob: '',
    gender: 'Male',
    state: 'Maharashtra',
    district: '',
    area: 'Rural',
    occupation: 'Farmer',
    income: '< ₹2.5 Lakhs',
    socialCategory: 'General',
    disability: 'No',
    maritalStatus: 'Married',
    familySize: '4',
    housingStatus: 'Own House',
  });

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleFinish = (e) => {
    e.preventDefault();
    markOnboardingComplete();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark className="w-7 h-7" />
          <span className="font-semibold text-lg text-[#0F1B3D] tracking-tight">Yojsetu</span>
        </Link>
        <span className="text-xs font-medium text-[#64748B] bg-[#F8FAFC] px-3 py-1 rounded-full border border-[#E2E8F0]">
          Profile Setup (Step {step} of 2)
        </span>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-8 space-y-6">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-[#0F1B3D] tracking-tight">
              Welcome, {user?.full_name || 'Citizen'}!
            </h1>
            <p className="text-sm text-[#64748B]">
              Tell us a few details to unlock 500+ personalized scheme recommendations.
            </p>
          </div>

          <form onSubmit={handleFinish} className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#0F1B3D] pb-2 border-b border-[#E2E8F0]">
                  1. Location & Demographics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    >
                      <option>Maharashtra</option>
                      <option>Uttar Pradesh</option>
                      <option>Rajasthan</option>
                      <option>Kerala</option>
                      <option>Punjab</option>
                      <option>Bihar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">District / City</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune / Jaipur"
                      value={formData.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">Area Type</label>
                    <select
                      value={formData.area}
                      onChange={(e) => handleChange('area', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    >
                      <option>Rural</option>
                      <option>Urban</option>
                      <option>Semi-Urban</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm py-3 rounded-xl transition-all shadow-xs cursor-pointer mt-4"
                >
                  Continue to Occupation & Income →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#0F1B3D] pb-2 border-b border-[#E2E8F0]">
                  2. Occupation & Socio-Economic Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">Occupation</label>
                    <select
                      value={formData.occupation}
                      onChange={(e) => handleChange('occupation', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    >
                      <option>Farmer</option>
                      <option>Self-Employed / Business</option>
                      <option>Salaried Worker</option>
                      <option>Daily Wage Laborer</option>
                      <option>Student</option>
                      <option>Homemaker</option>
                      <option>Unemployed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">Annual Household Income</label>
                    <select
                      value={formData.income}
                      onChange={(e) => handleChange('income', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    >
                      <option>&lt; ₹2.5 Lakhs</option>
                      <option>₹2.5 Lakhs - ₹5 Lakhs</option>
                      <option>₹5 Lakhs - ₹8 Lakhs</option>
                      <option>&gt; ₹8 Lakhs</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">Social Category</label>
                    <select
                      value={formData.socialCategory}
                      onChange={(e) => handleChange('socialCategory', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    >
                      <option>General</option>
                      <option>OBC</option>
                      <option>SC</option>
                      <option>ST</option>
                      <option>EWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#111827] mb-1">Housing Status</label>
                    <select
                      value={formData.housingStatus}
                      onChange={(e) => handleChange('housingStatus', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#2563EB]"
                    >
                      <option>Own House</option>
                      <option>Rented House</option>
                      <option>Kutcha House</option>
                      <option>Homeless</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-white border border-[#E2E8F0] text-[#0F1B3D] font-medium text-sm py-3 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm py-3 rounded-xl shadow-xs cursor-pointer"
                  >
                    Complete Profile & View Dashboard →
                  </button>
                </div>
              </div>
            )}

          </form>

        </div>
      </div>

    </div>
  );
}
