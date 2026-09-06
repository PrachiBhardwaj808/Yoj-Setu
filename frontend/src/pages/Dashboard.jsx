import { useState } from 'react';
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

function BellIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

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

// ─── Data Definitions ────────────────────────────────────────────────────────

const RECOMMENDED_SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM Kisan Samman Nidhi',
    category: 'Agriculture',
    description: 'Direct annual income support of ₹6,000 for small and marginal landholding farmers.',
    matchReason: 'Matches your occupation (Farmer) and landholding criteria.',
    benefit: 'Up to ₹6,000/year',
    icon: SproutIcon
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat (PM-JAY)',
    category: 'Health',
    description: 'Health insurance cover of ₹5 Lakhs per family per year for hospitalization care.',
    matchReason: 'Matches your annual household income range (< ₹2.5 Lakhs).',
    benefit: '₹5 Lakhs health cover',
    icon: HeartPulseIcon
  },
  {
    id: 'pm-surya-ghar',
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    category: 'Housing & Solar',
    description: 'Subsidized rooftop solar system providing up to 300 units free electricity per month.',
    matchReason: 'Matches your housing status and electricity connection details.',
    benefit: 'Up to ₹78,000 subsidy',
    icon: SunIcon
  },
  {
    id: 'post-matric-scholarship',
    name: 'Post-Matric Scholarship Scheme',
    category: 'Education',
    description: 'Financial assistance for higher secondary and university education.',
    matchReason: 'Matches household demographic profile.',
    benefit: '100% tuition coverage',
    icon: GradHatIcon
  }
];

const RECENT_NOTIFICATIONS = [
  { id: 1, title: 'New scheme matches your profile', time: '2 hours ago', text: 'PM Surya Ghar scheme has been added to your recommendations.' },
  { id: 2, title: 'Profile updated successfully', time: 'Yesterday', text: 'Your location and household details were saved.' },
  { id: 3, title: 'Application status update', time: '3 days ago', text: 'Your Ayushman Bharat verification is currently under review.' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, completionPercent } = useProfile();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSchemeModal, setSelectedSchemeModal] = useState(null);

  const userName = profile?.full_name || user?.full_name || 'Rahul';
  const firstName = userName.split(' ')[0];

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans">
      
      {/* ─── DASHBOARD TOP NAVIGATION BAR ────────────────────────────────────── */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        
        {/* Left: Logo + Desktop Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark className="w-7 h-7" />
            <span className="font-semibold text-lg text-[#0F1B3D] tracking-tight">Yojsetu</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-[#2563EB]">
              Dashboard
            </Link>
            <Link to="/schemes" className="text-sm font-medium text-[#64748B] hover:text-[#111827] transition-colors">
              Schemes
            </Link>
            <Link to="/onboarding" className="text-sm font-medium text-[#64748B] hover:text-[#111827] transition-colors">
              Eligibility
            </Link>
            <Link to="/applications" className="text-sm font-medium text-[#64748B] hover:text-[#111827] transition-colors">
              Applications
            </Link>
            <Link to="/assistant" className="text-sm font-medium text-[#64748B] hover:text-[#111827] transition-colors">
              Assistant
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          
          <Link to="/notifications" className="relative p-2 text-[#64748B] hover:text-[#111827] transition-colors">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#2563EB] rounded-full"></span>
          </Link>

          <div className="flex items-center gap-3 pl-3 border-l border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-full bg-[#0F1B3D] text-white flex items-center justify-center text-xs font-semibold">
              {firstName[0]}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[#0F1B3D] leading-none">{userName}</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{profile?.state || 'Maharashtra'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-[#64748B] hover:text-red-600 ml-2 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* ─── MAIN DASHBOARD CONTENT ──────────────────────────────────────────── */}
      <main className="max-w-[1240px] mx-auto w-full px-6 py-10 space-y-8 flex-1">
        
        {/* Dashboard Greeting Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-[#64748B]">
            Here are some government schemes that may be relevant to you.
          </p>
        </div>

        {/* Profile Completion Banner (Shown if completion < 100%) */}
        {completionPercent < 100 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-[#0F1B3D]">Complete your profile</h3>
                <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {completionPercent}% completed
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Add a few more details to improve accuracy of your scheme recommendations.
              </p>
              <div className="w-full max-w-md bg-[#F8FAFC] border border-[#E2E8F0] h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
              </div>
            </div>

            <button
              onClick={() => navigate('/onboarding')}
              className="bg-white border border-[#E2E8F0] hover:border-gray-300 text-[#0F1B3D] font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            >
              Complete profile
            </button>
          </div>
        )}

        {/* Main Recommendation Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0F1B3D] tracking-tight">Recommended for you</h2>
            <Link to="/schemes" className="text-xs font-medium text-[#2563EB] hover:underline">
              View all schemes →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RECOMMENDED_SCHEMES.map(scheme => {
              const IconComp = scheme.icon;
              return (
                <div
                  key={scheme.id}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col justify-between hover:border-blue-300 transition-all shadow-xs group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1B3D] group-hover:text-[#2563EB] group-hover:bg-blue-50 transition-colors flex items-center justify-center">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                        {scheme.benefit}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-[#0F1B3D] group-hover:text-[#2563EB] transition-colors">
                      {scheme.name}
                    </h3>
                    
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                      {scheme.description}
                    </p>

                    <div className="mt-4 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0"></span>
                      <span>{scheme.matchReason}</span>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-xs text-[#64748B]">Category: {scheme.category}</span>
                    <button
                      onClick={() => setSelectedSchemeModal(scheme)}
                      className="text-xs font-medium text-[#2563EB] hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View scheme</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Column Section: Eligibility Summary + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Eligibility Summary */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-semibold text-[#0F1B3D]">Your eligibility</h3>
              <span className="text-xs text-[#64748B]">Potential matches based on your profile</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="text-2xl font-bold text-[#0F1B3D]">12</span>
                <p className="text-xs text-[#64748B] mt-1">Potential matches</p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-2xl font-bold text-[#16A34A]">4</span>
                <p className="text-xs text-[#16A34A] font-medium mt-1">High confidence</p>
              </div>

              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="text-2xl font-bold text-[#2563EB]">8</span>
                <p className="text-xs text-[#64748B] mt-1">More to explore</p>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] pt-2">
              Eligibility criteria are matched dynamically with central and state schemes. Recommendations are potential matches based on submitted profile data.
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
                <span className="text-xs font-semibold text-[#0F1B3D] mt-3 group-hover:text-[#2563EB]">Find schemes</span>
              </Link>

              <Link
                to="/onboarding"
                className="p-3.5 bg-[#F8FAFC] hover:bg-blue-50 border border-[#E2E8F0] hover:border-blue-200 rounded-xl flex flex-col justify-between transition-colors group"
              >
                <TargetIcon className="w-5 h-5 text-[#0F1B3D] group-hover:text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#0F1B3D] mt-3 group-hover:text-[#2563EB]">Check eligibility</span>
              </Link>

              <Link
                to="/assistant"
                className="p-3.5 bg-[#F8FAFC] hover:bg-blue-50 border border-[#E2E8F0] hover:border-blue-200 rounded-xl flex flex-col justify-between transition-colors group"
              >
                <BotIcon className="w-5 h-5 text-[#0F1B3D] group-hover:text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#0F1B3D] mt-3 group-hover:text-[#2563EB]">Ask Yojsetu</span>
              </Link>

              <Link
                to="/applications"
                className="p-3.5 bg-[#F8FAFC] hover:bg-blue-50 border border-[#E2E8F0] hover:border-blue-200 rounded-xl flex flex-col justify-between transition-colors group"
              >
                <FileTextIcon className="w-5 h-5 text-[#0F1B3D] group-hover:text-[#2563EB]" />
                <span className="text-xs font-semibold text-[#0F1B3D] mt-3 group-hover:text-[#2563EB]">Track applications</span>
              </Link>

            </div>
          </div>

        </div>

        {/* 2-Column Section: Applications Overview + Recent Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Applications Overview */}
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
                <p className="text-sm font-semibold text-[#0F1B3D]">No applications submitted yet</p>
                <p className="text-xs text-[#64748B]">Start by exploring schemes that match your profile.</p>
              </div>
              <Link
                to="/schemes"
                className="inline-block bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs mt-2"
              >
                Explore schemes
              </Link>
            </div>
          </div>

          {/* Recent Updates */}
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
              <h4 className="text-sm font-semibold text-white">Need help finding or applying for a scheme?</h4>
              <p className="text-xs text-slate-300">Ask Yojsetu in your preferred language via voice or text.</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/assistant')}
            className="bg-[#2563EB] hover:bg-blue-600 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <MicIcon className="w-4 h-4" />
            <span>Ask Yojsetu</span>
          </button>
        </div>

      </main>

      {/* ─── SCHEME DETAILS MODAL ────────────────────────────────────────────── */}
      {selectedSchemeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-lg relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-semibold text-[#0F1B3D]">{selectedSchemeModal.name}</h3>
              <button
                onClick={() => setSelectedSchemeModal(null)}
                className="text-[#64748B] hover:text-[#111827] text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 inline-block">
                Benefit: {selectedSchemeModal.benefit}
              </span>
              <p className="text-xs text-[#64748B] leading-relaxed">{selectedSchemeModal.description}</p>
              
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                <span className="font-semibold text-[#0F1B3D] block">Why this matches your profile:</span>
                <p className="text-[#64748B]">{selectedSchemeModal.matchReason}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedSchemeModal(null)}
                className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F1B3D] hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedSchemeModal(null);
                  navigate(`/schemes/${selectedSchemeModal.id}`);
                }}
                className="px-5 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-medium hover:bg-blue-700 cursor-pointer"
              >
                Apply / View Details →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6 text-center text-xs text-[#64748B] mt-auto">
        © Yojsetu. All rights reserved.
      </footer>

    </div>
  );
}
