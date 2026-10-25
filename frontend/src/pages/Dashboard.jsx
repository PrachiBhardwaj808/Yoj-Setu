import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { getEligibilityResults } from '../services/eligibilityService';

// ─── Outline Icons ────────────────────────────────────────────────────────────


function SearchIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function TargetIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function BotIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v4M8 16h0M16 16h0" />
    </svg>
  );
}

function FileTextIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function MicIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function SproutIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V10M12 10C12 6.5 9 4 5 4C5 8 7.5 11 12 10ZM12 10C12 6.5 15 4 19 4C19 8 16.5 11 12 10Z" />
    </svg>
  );
}

function HeartPulseIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function SunIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636" />
    </svg>
  );
}

function GradHatIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WarningIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

// Map categories to icons
const CATEGORY_ICONS = {
  Agriculture: SproutIcon,
  Health: HeartPulseIcon,
  Healthcare: HeartPulseIcon,
  Education: GradHatIcon,
  Housing: SunIcon,
  'Solar Energy': SunIcon,
};

const CATEGORIES = ['All', 'Agriculture', 'Education', 'Health', 'Housing', 'Financial Support'];

const CATEGORY_KEYS = {
  All: 'dashboard.all',
  Agriculture: 'dashboard.agriculture',
  Education: 'dashboard.education',
  Health: 'dashboard.health',
  Housing: 'dashboard.housing',
  'Financial Support': 'dashboard.financialSupport',
};

const RECENT_NOTIFICATIONS = [
  { id: 1, title: 'AI Scheme Engine evaluated profile', time: 'Just now', text: 'Matched 5+ verified central and state schemes with deterministic rules.' },
  { id: 2, title: 'DigiLocker Integration Ready', time: '1 hour ago', text: 'Document provider initialized in Mock Development Mode.' },
  { id: 3, title: 'Profile details saved', time: 'Yesterday', text: 'Your location and demographic profile were normalized.' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, completionPercent } = useProfile();
  const { t } = useLanguage();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSchemeModal, setSelectedSchemeModal] = useState(null);

  const userName = profile?.full_name || user?.full_name || 'Rahul';
  const firstName = userName.split(' ')[0];

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t('dashboard.greetingMorning', 'Good morning')
    : hour < 17
    ? t('dashboard.greetingAfternoon', 'Good afternoon')
    : t('dashboard.greetingEvening', 'Good evening');

  useEffect(() => {
    let isMounted = true;
    async function loadRecommendations() {
      setLoading(true);
      try {
        const results = await getEligibilityResults(profile || {});
        if (isMounted) {
          setRecommendations(results || []);
        }
      } catch (err) {
        console.error('Failed to load scheme recommendations:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRecommendations();
    return () => { isMounted = false; };
  }, [profile]);

  const filteredRecommendations = selectedCategory === 'All'
    ? recommendations
    : recommendations.filter(r => (r.category || '').toLowerCase().includes(selectedCategory.toLowerCase()));

  const eligibleCount = recommendations.filter(r => r.status === 'ELIGIBLE').length;
  const reviewCount = recommendations.filter(r => r.status === 'INSUFFICIENT_INFORMATION').length;

  return (
    <div className="space-y-8 pb-10 font-sans">
      {/* Dashboard Greeting Header */}
      <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-[#64748B]">
            {t('dashboard.subtitle', 'Here are your AI-discovered government schemes matched deterministically with your profile.')}
          </p>
        </div>

        {/* Profile Completion Banner */}
        {completionPercent < 100 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-[#0F1B3D]">
                  {t('dashboard.completeProfile', 'Complete your profile')}
                </h3>
                <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {completionPercent}% {t('dashboard.completed', 'completed')}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                {t('dashboard.completeProfileDesc', 'Add details like landholding and family income to unlock 100% accurate eligibility matching.')}
              </p>
              <div className="w-full max-w-md bg-[#F8FAFC] border border-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
              </div>
            </div>

            <button
              onClick={() => navigate('/onboarding')}
              className="bg-white border border-[#E2E8F0] hover:border-gray-300 text-[#0F1B3D] font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            >
              {t('dashboard.completeProfileBtn', 'Complete profile')}
            </button>
          </div>
        )}

        {/* ─── MAIN RECOMMENDATION SECTION ───────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#0F1B3D] tracking-tight">
                {t('dashboard.recommendedSchemes', 'Recommended Schemes For You')}
              </h2>
              <p className="text-xs text-[#64748B]">
                {t('dashboard.ruleEngineDesc', 'Evaluated by deterministic rule engine & ranked by AI Recommendation Agent')}
              </p>
            </div>
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#0F1B3D] text-white border-[#0F1B3D]'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-gray-300'
                  }`}
                >
                  {t(CATEGORY_KEYS[cat] || cat, cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Scheme Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 h-64 animate-pulse space-y-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div className="h-5 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-12 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center space-y-3">
              <SearchIcon className="w-8 h-8 text-[#64748B] mx-auto" />
              <p className="text-sm font-semibold text-[#0F1B3D]">No schemes match this filter</p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-medium text-[#2563EB] hover:underline"
              >
                Reset category filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRecommendations.map((scheme, idx) => {
                const IconComp = CATEGORY_ICONS[scheme.category] || TargetIcon;
                const isEligible = scheme.status === 'ELIGIBLE';
                const isNeedsReview = scheme.status === 'INSUFFICIENT_INFORMATION';

                return (
                  <div
                    key={scheme.scheme_id || scheme.external_scheme_id || idx}
                    className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col justify-between hover:border-blue-300 transition-all shadow-xs group relative overflow-hidden"
                  >
                    {/* Status accent top bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${isEligible ? 'bg-emerald-500' : isNeedsReview ? 'bg-amber-500' : 'bg-rose-500'}`} />

                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1B3D] group-hover:text-[#2563EB] group-hover:bg-blue-50 transition-colors flex items-center justify-center">
                          <IconComp className="w-5 h-5" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                            isEligible
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isNeedsReview
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {scheme.match_score || 90}% Match
                          </span>
                          <span className="text-xs font-medium text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                            {scheme.benefit}
                          </span>
                        </div>
                      </div>

                      {/* Scheme Title & Description */}
                      <h3 className="text-base font-semibold text-[#0F1B3D] group-hover:text-[#2563EB] transition-colors">
                        {scheme.scheme_name}
                      </h3>
                      
                      <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed line-clamp-2">
                        {scheme.reason || scheme.description}
                      </p>

                      {/* Why You Qualify Grounded Box */}
                      <div className="mt-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#0F1B3D] flex items-center gap-1.5">
                            {isEligible ? (
                              <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <WarningIcon className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            Why you qualify:
                          </span>
                          <span className="text-[10px] text-[#64748B]">State: {scheme.state || 'All India'}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] leading-normal">
                          {scheme.reason}
                        </p>
                      </div>

                      {/* Document Readiness Pill Row */}
                      {scheme.documents && scheme.documents.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 overflow-x-auto text-[11px]">
                          <span className="text-[#64748B] font-medium shrink-0">Docs:</span>
                          {scheme.documents.slice(0, 3).map((d, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded-full border text-[10px] shrink-0 ${
                                d.is_available
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {d.is_available ? '✓' : '⚠'} {d.name}
                            </span>
                          ))}
                          {scheme.documents.length > 3 && (
                            <span className="text-[10px] text-[#64748B]">+{scheme.documents.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Card Row */}
                    <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-xs text-[#64748B]">
                        Govt: <strong className="text-[#0F1B3D]">{scheme.government_level || 'Central'}</strong>
                      </span>
                      <button
                        onClick={() => setSelectedSchemeModal(scheme)}
                        className="text-xs font-medium text-[#2563EB] hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View scheme details</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2-Column Section: Eligibility Summary + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Deterministic Engine Summary */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-semibold text-[#0F1B3D]">Deterministic Eligibility Summary</h3>
              <span className="text-xs text-[#64748B]">Calculated by rule engine</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="text-2xl font-bold text-[#0F1B3D]">{recommendations.length}</span>
                <p className="text-xs text-[#64748B] mt-1">Total Evaluated</p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-2xl font-bold text-[#16A34A]">{eligibleCount}</span>
                <p className="text-xs text-[#16A34A] font-medium mt-1">Eligible Schemes</p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="text-2xl font-bold text-amber-600">{reviewCount}</span>
                <p className="text-xs text-amber-700 font-medium mt-1">Needs Information</p>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] pt-2 border-t border-[#E2E8F0]">
              🔒 <strong>AI Principle Enforced:</strong> Rule evaluations are 100% deterministic code based on official scheme attributes. The AI agent only formats and ranks grounded explanations.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-semibold text-[#0F1B3D]">Quick actions</h3>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/schemes"
                className="p-3.5 bg-[#F8FAFC] hover:bg-blue-50 border border-[#E2E8F0] hover:border-blue-200 rounded-xl flex flex-col justify-between transition-colors group"
              >
                <SearchIcon className="w-5 h-5 text-[#0F1B3D] group-hover:text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#0F1B3D] mt-3 group-hover:text-[#2563EB]">Discover all schemes</span>
              </Link>

              <Link
                to="/onboarding"
                className="p-3.5 bg-[#F8FAFC] hover:bg-blue-50 border border-[#E2E8F0] hover:border-blue-200 rounded-xl flex flex-col justify-between transition-colors group"
              >
                <TargetIcon className="w-5 h-5 text-[#0F1B3D] group-hover:text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#0F1B3D] mt-3 group-hover:text-[#2563EB]">Update profile</span>
              </Link>

              <Link
                to="/assistant"
                className="p-3.5 bg-[#F8FAFC] hover:bg-blue-50 border border-[#E2E8F0] hover:border-blue-200 rounded-xl flex flex-col justify-between transition-colors group"
              >
                <BotIcon className="w-5 h-5 text-[#0F1B3D] group-hover:text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#0F1B3D] mt-3 group-hover:text-[#2563EB]">Ask AI Assistant</span>
              </Link>

              <Link
                to="/applications"
                className="p-3.5 bg-[#F8FAFC] hover:bg-blue-50 border border-[#E2E8F0] hover:border-blue-200 rounded-xl flex flex-col justify-between transition-colors group"
              >
                <FileTextIcon className="w-5 h-5 text-[#0F1B3D] group-hover:text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#0F1B3D] mt-3 group-hover:text-[#2563EB]">My Applications</span>
              </Link>
            </div>
          </div>

        </div>

        {/* 2-Column Section: Applications Overview + Recent Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-semibold text-[#0F1B3D]">Your applications</h3>
              <Link to="/applications" className="text-xs font-medium text-[#2563EB] hover:underline">
                View status →
              </Link>
            </div>

            <div className="p-8 text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3">
              <FileTextIcon className="w-8 h-8 text-[#64748B] mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#0F1B3D]">No active applications yet</p>
                <p className="text-xs text-[#64748B]">Select an eligible scheme above to start auto-fill & document verification.</p>
              </div>
              <Link
                to="/schemes"
                className="inline-block bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs mt-2"
              >
                Explore schemes
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-semibold text-[#0F1B3D]">Recent updates</h3>
              <Link to="/notifications" className="text-xs font-medium text-[#2563EB] hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {RECENT_NOTIFICATIONS.map(n => (
                <div key={n.id} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#0F1B3D]">{n.title}</p>
                    <span className="text-[10px] text-[#64748B]">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Persistent AI Assistant Callout */}
        <div className="bg-[#0F1B3D] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <BotIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Have questions about eligibility or required documents?</h4>
              <p className="text-xs text-slate-300">Yojsetu AI Assistant can explain rules and guide document uploads.</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/assistant')}
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <MicIcon className="w-4 h-4" />
            <span>Ask Yojsetu AI</span>
          </button>
        </div>

      {/* ─── RICH SCHEME DETAILS MODAL ────────────────────────────────────────── */}
      {selectedSchemeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-lg relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base font-semibold text-[#0F1B3D]">{selectedSchemeModal.scheme_name}</h3>
                <span className="text-xs text-[#64748B]">{selectedSchemeModal.department || 'Government Department'}</span>
              </div>
              <button
                onClick={() => setSelectedSchemeModal(null)}
                className="text-[#64748B] hover:text-[#111827] text-lg font-bold cursor-pointer p-1"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-[#2563EB] font-semibold uppercase tracking-wider block">Benefit</span>
                  <span className="text-sm font-bold text-[#0F1B3D]">{selectedSchemeModal.benefit}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block">Match Score</span>
                  <span className="text-sm font-bold text-emerald-700">{selectedSchemeModal.match_score}% Match</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                <span className="font-semibold text-[#0F1B3D] block">Why you qualify:</span>
                <p className="text-[#64748B] leading-relaxed">{selectedSchemeModal.reason}</p>
              </div>

              {/* Passed & Evaluated Rules */}
              {selectedSchemeModal.passed_conditions && selectedSchemeModal.passed_conditions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#0F1B3D] block">Passed Conditions:</span>
                  <div className="space-y-1.5">
                    {selectedSchemeModal.passed_conditions.map((cond, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-emerald-50/60 border border-emerald-100 rounded-lg">
                        <span className="text-emerald-900 font-medium">✓ {cond.description}</span>
                        <span className="text-[11px] text-emerald-700 font-mono">Your profile: {String(cond.user_value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Readiness Checklist */}
              {selectedSchemeModal.documents && selectedSchemeModal.documents.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#0F1B3D] block">Required Documents:</span>
                  <div className="space-y-1.5">
                    {selectedSchemeModal.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                        <span className="text-[#0F1B3D]">{doc.name} {doc.is_mandatory && <span className="text-red-500">*</span>}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          doc.is_available
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.is_available ? '✓ Ready' : '⚠ Action Required'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
              {selectedSchemeModal.source_url && (
                <a
                  href={selectedSchemeModal.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#64748B] hover:text-[#0F1B3D] underline"
                >
                  Official Source Portal ↗
                </a>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setSelectedSchemeModal(null)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F1B3D] hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedSchemeModal(null);
                    navigate(`/schemes/${selectedSchemeModal.scheme_id || selectedSchemeModal.external_scheme_id}`);
                  }}
                  className="px-5 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Apply Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
