import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ─── SVG Outline Icons ────────────────────────────────────────────────────────

function LogoMark({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect width="32" height="32" rx="8" fill="#0F1B3D" />
      <path d="M9 16L14 21L23 10" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23" cy="10" r="2.5" fill="#2563EB" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
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

function ShieldCheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-2-8 2v7c0 6 8 10 8 10z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SparklesIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M7.757 16.243l-2.121 2.121m12.728 0l-2.121-2.121M7.757 7.757L5.636 5.636" />
    </svg>
  );
}

function GlobeIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" />
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

function UserIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

function FileTextIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

function HomeIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function BriefcaseIcon({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.75">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function MenuIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ─── Data Definitions ────────────────────────────────────────────────────────

const SCHEME_CATEGORIES = ['All', 'Agriculture', 'Health', 'Education', 'Housing', 'Employment'];

const SCHEMES_DATA = [
  {
    id: 'pm-kisan',
    name: 'PM Kisan Samman Nidhi',
    category: 'Agriculture',
    description: 'Direct income support of ₹6,000 annually for small and marginal landholding farmers.',
    benefit: '₹6,000 / year',
    icon: SproutIcon
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat (PM-JAY)',
    category: 'Health',
    description: 'Health insurance cover of ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.',
    benefit: '₹5 Lakhs health cover',
    icon: HeartPulseIcon
  },
  {
    id: 'pm-surya-ghar',
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    category: 'Housing',
    description: 'Subsidy up to ₹78,000 for installing rooftop solar panels to provide up to 300 units free electricity.',
    benefit: 'Up to ₹78,000 subsidy',
    icon: SunIcon
  },
  {
    id: 'pm-pmegp',
    name: 'PMEGP Employment Scheme',
    category: 'Employment',
    description: 'Credit-linked subsidy scheme generating micro-enterprise employment in rural and urban areas.',
    benefit: 'Up to 35% subsidy',
    icon: BriefcaseIcon
  },
  {
    id: 'pm-awaya-yojana',
    name: 'PM Awas Yojana (Urban & Rural)',
    category: 'Housing',
    description: 'Financial assistance for pucca house construction with basic amenities for eligible households.',
    benefit: 'Up to ₹2.5 Lakhs assistance',
    icon: HomeIcon
  },
  {
    id: 'post-matric-scholarship',
    name: 'Post-Matric Scholarship Scheme',
    category: 'Education',
    description: 'Financial assistance for students pursuing higher secondary and university education post Class 10.',
    benefit: '100% tuition coverage',
    icon: GradHatIcon
  }
];

const LANGUAGES = [
  'English',
  'हिन्दी',
  'ਪੰਜਾਬੀ',
  'বাংলা',
  'मराठी',
  'தமிழ்',
  'తెలుగు',
  'ગુજરાતી',
  '<ctrl42><ctrl42>ಕನ್ನಡ',
  'മലയാളം'
];

const TESTIMONIALS = [
  {
    quote: "Yojsetu helped me find PM Kisan benefits in 5 minutes. The eligibility check was clear and completely straightforward.",
    name: "Ramesh Kumar",
    location: "Farmer, Uttar Pradesh"
  },
  {
    quote: "Finding health coverage for my aging parents was stressful until I checked Yojsetu. Ayushman Bharat card steps were crystal clear.",
    name: "Priya Sharma",
    location: "Homemaker, Jaipur"
  },
  {
    quote: "As a student, discovering post-matric scholarship options took just two clicks. Truly empowering and simple tool.",
    name: "Arjun Nair",
    location: "Student, Kochi"
  }
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const filteredSchemes = selectedCategory === 'All'
    ? SCHEMES_DATA
    : SCHEMES_DATA.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-blue-100 selection:text-[#2563EB]">
      
      {/* ─── NAVBAR ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-6 h-16 md:h-18 flex items-center justify-between">
          
          {/* Left: Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <LogoMark className="w-7 h-7 text-[#0F1B3D]" />
            <span className="font-semibold text-lg md:text-xl text-[#0F1B3D] tracking-tight group-hover:text-[#2563EB] transition-colors">
              Yojsetu
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-[#64748B] hover:text-[#111827] transition-colors">
              About
            </a>
            <a href="#schemes" className="text-sm font-medium text-[#64748B] hover:text-[#111827] transition-colors">
              Schemes
            </a>
            <Link to="/applications" className="text-sm font-medium text-[#64748B] hover:text-[#111827] transition-colors">
              Track Application
            </Link>
            <a href="#how-it-works" className="text-sm font-medium text-[#64748B] hover:text-[#111827] transition-colors">
              Help
            </a>
          </nav>

          {/* Right Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#111827] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <GlobeIcon className="w-3.5 h-3.5" />
                <span>{selectedLanguage}</span>
                <ChevronDownIcon className="w-3 h-3 text-[#64748B]" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 z-50">
                  {LANGUAGES.slice(0, 5).map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedLanguage === lang ? 'bg-blue-50 text-[#2563EB]' : 'text-[#111827] hover:bg-slate-50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login */}
            <Link
              to="/login"
              className="text-sm font-medium text-[#0F1B3D] hover:text-[#2563EB] px-3 py-2 transition-colors"
            >
              Login
            </Link>

            {/* Register CTA */}
            <Link
              to="/register"
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              Register
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#0F1B3D] hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-white px-6 py-4 space-y-3">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#111827] py-1.5"
            >
              About
            </a>
            <a
              href="#schemes"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#111827] py-1.5"
            >
              Schemes
            </a>
            <Link
              to="/applications"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#111827] py-1.5"
            >
              Track Application
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#111827] py-1.5"
            >
              Help
            </a>
            
            <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-medium text-[#0F1B3D] py-2 border border-[#E2E8F0] rounded-xl"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-medium text-white bg-[#2563EB] py-2.5 rounded-xl"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </header>


      {/* ─── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="max-w-[1240px] mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: Clean Messaging & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-[#2563EB] px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              <span>Government schemes, made simple.</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-[56px] leading-[1.15] font-semibold text-[#0F1B3D] tracking-tight">
              Find the schemes <br className="hidden sm:inline" />
              <span className="text-[#2563EB]">you qualify for.</span>
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-[#64748B] font-regular leading-relaxed max-w-xl">
              Tell us about yourself. Yojsetu helps you discover government benefits relevant to you.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => navigate('/schemes')}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-base px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Check eligibility</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <a
                href="#schemes"
                className="bg-white border border-[#E2E8F0] hover:border-gray-300 text-[#0F1B3D] font-medium text-base px-6 py-3.5 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                Explore schemes
              </a>
            </div>

            {/* Subtle Subtext */}
            <p className="text-xs text-[#64748B] flex items-center gap-2 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              <span>Free to use · No Aadhaar required to explore</span>
            </p>
          </div>

          {/* RIGHT COLUMN: Single Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <h3 className="text-sm font-semibold text-[#0F1B3D]">
                  Your recommendations
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-[#16A34A] border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                  Matched for you
                </span>
              </div>

              {/* 3 Scheme Rows */}
              <div className="mt-4 space-y-3">
                
                {/* Row 1 */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                      <SproutIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F1B3D]">PM Kisan</p>
                      <p className="text-xs text-[#64748B]">Direct income support</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0F1B3D] bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                    ₹6,000/year
                  </span>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                      <HeartPulseIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F1B3D]">Ayushman Bharat</p>
                      <p className="text-xs text-[#64748B]">Secondary & tertiary care</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0F1B3D] bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                    Health coverage
                  </span>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                      <SunIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F1B3D]">PM Surya Ghar</p>
                      <p className="text-xs text-[#64748B]">Free rooftop solar electricity</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0F1B3D] bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                    Solar subsidy
                  </span>
                </div>

              </div>

              {/* Matching Footer Hint */}
              <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                <span>Based on profile filters</span>
                <span className="font-medium text-[#2563EB] hover:underline cursor-pointer" onClick={() => navigate('/schemes')}>
                  View all 500+ →
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* ─── TRUST STRIP ───────────────────────────────────────────────────── */}
      <div className="border-y border-[#E2E8F0] bg-white py-6">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1B3D] flex items-center justify-center shrink-0">
                <FileTextIcon className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-medium text-[#111827]">
                500+ schemes
              </span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1B3D] flex items-center justify-center shrink-0">
                <SparklesIcon className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-medium text-[#111827]">
                Personalized recommendations
              </span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1B3D] flex items-center justify-center shrink-0">
                <GlobeIcon className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-medium text-[#111827]">
                Available in Indian languages
              </span>
            </div>

          </div>
        </div>
      </div>


      {/* ─── SCHEME DISCOVERY SECTION ──────────────────────────────────────── */}
      <section id="schemes" className="max-w-[1240px] mx-auto px-6 py-20 md:py-24 w-full">
        
        {/* Section Header */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] tracking-tight">
            Explore government schemes
          </h2>
          <p className="text-base text-[#64748B]">
            Find benefits across health, education, farming, housing and more.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 scrollbar-none">
          {SCHEME_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0F1B3D] text-white shadow-sm'
                  : 'bg-white text-[#64748B] hover:text-[#111827] border border-[#E2E8F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scheme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredSchemes.map(scheme => {
            const IconComponent = scheme.icon;
            return (
              <div
                key={scheme.id}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between hover:border-blue-300 transition-all shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F1B3D] group-hover:text-[#2563EB] group-hover:bg-blue-50 transition-colors flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-md">
                      {scheme.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#0F1B3D] group-hover:text-[#2563EB] transition-colors">
                    {scheme.name}
                  </h3>

                  <p className="text-sm text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
                    {scheme.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F1B3D]">
                    {scheme.benefit}
                  </span>

                  <button
                    onClick={() => navigate(`/schemes/${scheme.id}`)}
                    className="text-sm font-medium text-[#2563EB] hover:text-blue-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View scheme</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </section>


      {/* ─── HOW IT WORKS SECTION ──────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white border-y border-[#E2E8F0] py-20 md:py-24">
        <div className="max-w-[1240px] mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] tracking-tight">
              Simple from start to finish
            </h2>
            <p className="text-base text-[#64748B] mt-2">
              Discovering and applying for benefits requires only three clear steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1 mb-6">
                  01
                </span>
                <h3 className="text-lg font-semibold text-[#0F1B3D]">
                  Tell us about yourself
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed mt-2">
                  Answer a few simple questions regarding age, occupation, location, and income in under 2 minutes.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                No Aadhaar or personal ID required to explore
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1 mb-6">
                  02
                </span>
                <h3 className="text-lg font-semibold text-[#0F1B3D]">
                  Discover eligible schemes
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed mt-2">
                  Our matching engine instantly analyzes 500+ central and state schemes tailored to your exact profile.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                Clear breakdown of benefits & requirements
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1 mb-6">
                  03
                </span>
                <h3 className="text-lg font-semibold text-[#0F1B3D]">
                  Apply with confidence
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed mt-2">
                  Get document checklists and direct access to official application portals without middlemen.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                Step-by-step guidance & status tracking
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ─── AI ASSISTANT SECTION ──────────────────────────────────────────── */}
      <section id="assistant" className="max-w-[1240px] mx-auto px-6 py-20 md:py-24 w-full">
        
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] tracking-tight">
            Need help finding the right scheme?
          </h2>
          <p className="text-base text-[#64748B] mt-2">
            Ask Yojsetu in your language.
          </p>
        </div>

        {/* Minimal Chat Interface Preview */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm mt-10">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0F1B3D] text-white flex items-center justify-center text-xs font-bold">
                Y
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F1B3D]">Yojsetu Assistant</p>
                <p className="text-[11px] text-[#64748B]">Multilingual Civic Guide</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A] bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              Online
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-6">
            
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-[#F8FAFC] text-[#111827] border border-[#E2E8F0] px-4 py-3 rounded-2xl rounded-tr-xs text-sm max-w-md">
                Which schemes can help my family?
              </div>
            </div>

            {/* Yojsetu message */}
            <div className="flex justify-start">
              <div className="bg-[#0F1B3D] text-white px-4 py-3 rounded-2xl rounded-tl-xs text-sm max-w-md space-y-1.5 leading-relaxed">
                <p>Based on your profile, here are 3 schemes you may be eligible for:</p>
                <ul className="text-xs text-slate-300 space-y-1 pt-1 list-disc list-inside">
                  <li>PM Kisan Samman Nidhi</li>
                  <li>Ayushman Bharat Health Cover</li>
                  <li>PM Surya Ghar Solar Subsidy</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Input Bar Preview */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2">
            <input
              type="text"
              readOnly
              value="Type your question in Hindi, English, Punjabi..."
              className="bg-transparent text-sm text-[#64748B] px-3 w-full focus:outline-none cursor-pointer"
              onClick={() => navigate('/assistant')}
            />
            <button
              onClick={() => navigate('/assistant')}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-lg transition-colors cursor-pointer shrink-0"
              title="Voice Input"
            >
              <MicIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-all cursor-pointer shrink-0"
            >
              Ask
            </button>
          </div>

        </div>

      </section>


      {/* ─── LANGUAGE SECTION ──────────────────────────────────────────────── */}
      <section id="languages" className="bg-white border-y border-[#E2E8F0] py-16 md:py-20">
        <div className="max-w-[1240px] mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] tracking-tight">
              Your language. Your benefits.
            </h2>
            <p className="text-base text-[#64748B] mt-2">
              Explore Yojsetu in the language you're most comfortable with.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-[#0F1B3D] text-white shadow-sm'
                    : 'bg-white text-[#111827] border border-[#E2E8F0] hover:border-[#2563EB]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

        </div>
      </section>


      {/* ─── CITIZEN STORIES ───────────────────────────────────────────────── */}
      <section id="about" className="max-w-[1240px] mx-auto px-6 py-20 md:py-24 w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] tracking-tight">
            Built for citizens
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between shadow-sm"
            >
              <p className="text-sm text-[#111827] leading-relaxed italic">
                "{t.quote}"
              </p>
              
              <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                <p className="text-sm font-semibold text-[#0F1B3D]">{t.name}</p>
                <p className="text-xs text-[#64748B]">{t.location}</p>
              </div>
            </div>
          ))}
        </div>

      </section>


      {/* ─── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="max-w-[1240px] mx-auto px-6 pb-20 md:pb-24 w-full">
        <div className="bg-[#0F1B3D] text-white rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-sm relative overflow-hidden">
          
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
              Ready to find your benefits?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Check your eligibility in a few simple steps.
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate('/schemes')}
                className="bg-[#2563EB] hover:bg-blue-600 text-white font-medium text-base px-8 py-3.5 rounded-xl transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Check my eligibility</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>


      {/* ─── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-[#E2E8F0] mt-auto">
        <div className="max-w-[1240px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            
            {/* Left Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <LogoMark className="w-6 h-6" />
                <span className="font-semibold text-lg text-[#0F1B3D] tracking-tight">
                  Yojsetu
                </span>
              </Link>
              <p className="text-sm text-[#64748B] mt-2 max-w-xs">
                Making government benefits easier to discover.
              </p>
            </div>

            {/* Nav Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#64748B]">
              <a href="#about" className="hover:text-[#111827] transition-colors">About</a>
              <a href="#schemes" className="hover:text-[#111827] transition-colors">Schemes</a>
              <Link to="/applications" className="hover:text-[#111827] transition-colors">Track Application</Link>
              <a href="#how-it-works" className="hover:text-[#111827] transition-colors">Help</a>
              <span className="text-[#E2E8F0]">|</span>
              <span className="hover:text-[#111827] cursor-pointer">Privacy</span>
              <span className="hover:text-[#111827] cursor-pointer">Terms</span>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <p>© Yojsetu. All rights reserved.</p>
            <p>Made for Indian Citizens</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
