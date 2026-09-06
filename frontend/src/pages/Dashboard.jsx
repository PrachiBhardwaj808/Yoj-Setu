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

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark className="w-7 h-7" />
          <span className="font-semibold text-lg text-[#0F1B3D] tracking-tight">Yojsetu</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-[#0F1B3D] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg hidden sm:inline-block">
            {user?.full_name || 'Citizen'} ({user?.phone})
          </span>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 border border-red-100 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="max-w-[1240px] mx-auto w-full px-6 py-10 space-y-8 flex-1">
        
        {/* Welcome Banner */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-[#16A34A] border border-emerald-100 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              Account Active · Verified
            </div>
            <h1 className="text-2xl font-semibold text-[#0F1B3D]">
              Welcome back, {user?.full_name || 'Citizen'}
            </h1>
            <p className="text-sm text-[#64748B]">
              You have 3 matched scheme recommendations available for your profile.
            </p>
          </div>

          <Link
            to="/schemes"
            className="bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-xs shrink-0"
          >
            Explore 500+ Schemes →
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recommended Schemes */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-[#0F1B3D]">Recommended for You</h2>
            
            <div className="space-y-3">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 hover:border-blue-300 transition-colors shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">Agriculture</span>
                  <h3 className="text-base font-semibold text-[#0F1B3D] mt-1.5">PM Kisan Samman Nidhi</h3>
                  <p className="text-xs text-[#64748B] mt-1">Direct income support of ₹6,000 annually for farming households.</p>
                </div>
                <button onClick={() => navigate('/schemes')} className="text-xs font-medium text-[#2563EB] hover:underline shrink-0 ml-4">
                  Apply →
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 hover:border-blue-300 transition-colors shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">Health</span>
                  <h3 className="text-base font-semibold text-[#0F1B3D] mt-1.5">Ayushman Bharat (PM-JAY)</h3>
                  <p className="text-xs text-[#64748B] mt-1">Health cover of ₹5 Lakhs per family per year for secondary care.</p>
                </div>
                <button onClick={() => navigate('/schemes')} className="text-xs font-medium text-[#2563EB] hover:underline shrink-0 ml-4">
                  Apply →
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 hover:border-blue-300 transition-colors shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md">Housing</span>
                  <h3 className="text-base font-semibold text-[#0F1B3D] mt-1.5">PM Surya Ghar: Muft Bijli Yojana</h3>
                  <p className="text-xs text-[#64748B] mt-1">Subsidized rooftop solar power up to 300 units free electricity.</p>
                </div>
                <button onClick={() => navigate('/schemes')} className="text-xs font-medium text-[#2563EB] hover:underline shrink-0 ml-4">
                  Apply →
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#0F1B3D]">Account Summary</h2>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-xs text-[#64748B]">Registered Phone</span>
                <p className="text-sm font-semibold text-[#0F1B3D]">{user?.phone || 'Not verified'}</p>
              </div>

              <div className="space-y-1 pt-3 border-t border-[#E2E8F0]">
                <span className="text-xs text-[#64748B]">Registered Email</span>
                <p className="text-sm font-semibold text-[#0F1B3D]">{user?.email || 'None provided'}</p>
              </div>

              <div className="space-y-1 pt-3 border-t border-[#E2E8F0]">
                <span className="text-xs text-[#64748B]">Account Role</span>
                <p className="text-sm font-semibold text-[#0F1B3D] capitalize">{user?.role || 'Citizen'}</p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                <Link
                  to="/applications"
                  className="block w-full text-center bg-[#F8FAFC] hover:bg-slate-100 text-[#0F1B3D] border border-[#E2E8F0] font-medium text-xs py-2.5 rounded-lg transition-colors"
                >
                  Track Applications
                </Link>
                <Link
                  to="/assistant"
                  className="block w-full text-center bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-medium text-xs py-2.5 rounded-lg transition-colors"
                >
                  Ask AI Assistant
                </Link>
              </div>
            </div>
          </div>

        </div>

      </main>

      <footer className="bg-white border-t border-[#E2E8F0] py-6 text-center text-xs text-[#64748B]">
        © Yojsetu. All rights reserved.
      </footer>
    </div>
  );
}
