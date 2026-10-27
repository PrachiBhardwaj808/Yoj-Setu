import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/common/LanguageSelector';


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
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const logoSrc = theme === 'dark' ? '/yojsetu-logo-dark.png' : '/yojsetu-logo-light.png';
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredSchemes = selectedCategory === 'All'
    ? SCHEMES_DATA
    : SCHEMES_DATA.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 text-[#111827] dark:text-gray-100 flex flex-col font-sans selection:bg-blue-100 selection:text-[#2563EB]">

      {/* ─── NAVBAR ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-gray-700">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 h-16 xl:h-24 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 xl:gap-8">

          {/* Left: Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="YojSetu Home">
            <img
              src={logoSrc}
              alt="YojSetu Logo"
              className="h-12 sm:h-14 xl:h-[88px] w-auto object-contain hover:opacity-95 transition-opacity"
            />
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden xl:flex items-center justify-center gap-8 whitespace-nowrap">
            <a href="#about" className="text-lg font-medium text-[#64748B] dark:text-gray-300 hover:text-[#111827] dark:hover:text-white transition-colors">
              {t('nav.about', 'About')}
            </a>
            <a href="#schemes" className="text-lg font-medium text-[#64748B] dark:text-gray-300 hover:text-[#111827] dark:hover:text-white transition-colors">
              {t('nav.schemes', 'Schemes')}
            </a>
            <Link to="/applications" className="text-lg font-medium text-[#64748B] dark:text-gray-300 hover:text-[#111827] dark:hover:text-white transition-colors">
              {t('nav.trackApplication', 'Track Application')}
            </Link>
            <Link to="/safety-centre" className="text-lg font-medium text-[#64748B] dark:text-gray-300 hover:text-[#111827] dark:hover:text-white transition-colors">
              {t('nav.safetyCentre', 'Safety Centre')}
            </Link>
            <a href="#how-it-works" className="text-lg font-medium text-[#64748B] dark:text-gray-300 hover:text-[#111827] dark:hover:text-white transition-colors">
              {t('nav.help', 'Help')}
            </a>
          </nav>

          {/* Right Actions (Desktop) */}
          <div className="hidden xl:flex items-center justify-self-end gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-10 items-center gap-2 text-sm font-medium text-[#64748B] dark:text-gray-300 hover:text-[#2563EB] border border-[#E2E8F0] dark:border-gray-700 px-4 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span>{theme === 'dark' ? t('nav.lightMode', 'Light') : t('nav.darkMode', 'Dark')}</span>
            </button>

            {/* Language Selector */}
            <LanguageSelector align="right" />

            {/* Login */}
            <Link
              to="/login"
              className="text-base font-medium text-[#0F1B3D] dark:text-white hover:text-[#2563EB] px-2 py-2 transition-colors"
            >
              {t('nav.login', 'Login')}
            </Link>

            {/* Register CTA */}
            <Link
              to="/register"
              className="flex h-[42px] items-center bg-[#2563EB] hover:bg-blue-700 text-white text-base font-medium px-5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
            >
              {t('nav.register', 'Register')}
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="col-start-3 xl:hidden p-2 text-[#0F1B3D] dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors justify-self-end cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4 space-y-3">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#111827] dark:text-gray-100 py-1.5"
            >
              {t('nav.about', 'About')}
            </a>
            <a
              href="#schemes"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#111827] dark:text-gray-100 py-1.5"
            >
              {t('nav.schemes', 'Schemes')}
            </a>
            <Link
              to="/applications"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#111827] dark:text-gray-100 py-1.5"
            >
              {t('nav.trackApplication', 'Track Application')}
            </Link>
            <Link
              to="/safety-centre"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#111827] dark:text-gray-100 py-1.5"
            >
              {t('nav.safetyCentre', 'Safety Centre')}
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#111827] dark:text-gray-100 py-1.5"
            >
              {t('nav.help', 'Help')}
            </a>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-gray-700 flex flex-col gap-2">
              <div className="w-full">
                <LanguageSelector />
              </div>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[#0F1B3D] dark:text-gray-100 py-2 border border-[#E2E8F0] dark:border-gray-700 rounded-xl cursor-pointer"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
                <span>{theme === 'dark' ? t('nav.lightMode', 'Light Mode') : t('nav.darkMode', 'Dark Mode')}</span>
              </button>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-medium text-[#0F1B3D] dark:text-white py-2 border border-[#E2E8F0] dark:border-gray-700 rounded-xl"
              >
                {t('nav.login', 'Login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-medium text-white bg-[#2563EB] py-2.5 rounded-xl"
              >
                {t('nav.register', 'Register')}
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
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 text-[#2563EB] px-3 py-1 rounded-full text-xs md:text-sm font-medium">
              <span>{t('home.heroBadge', 'Government schemes, made simple.')}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-[56px] leading-[1.15] font-semibold text-[#0F1B3D] dark:text-white tracking-tight">
              {t('home.heroTitleLine1', 'Find the schemes')} <br className="hidden sm:inline" />
              <span className="text-[#2563EB]">{t('home.heroTitleLine2', 'you qualify for.')}</span>
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-[#64748B] dark:text-gray-300 font-regular leading-relaxed max-w-xl">
              {t('home.heroSubtitle', 'Tell us about yourself. Yojsetu helps you discover government benefits relevant to you.')}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => navigate('/schemes')}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-base px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>{t('home.checkEligibility', 'Check eligibility')}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <a
                href="#schemes"
                className="bg-white dark:bg-gray-900 border border-[#E2E8F0] dark:border-gray-700 hover:border-gray-300 text-[#0F1B3D] dark:text-white font-medium text-base px-6 py-3.5 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                {t('home.exploreSchemes', 'Explore schemes')}
              </a>
            </div>

            {/* Subtle Subtext */}
            <p className="text-xs text-[#64748B] dark:text-gray-300 flex items-center gap-2 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              <span>{t('home.heroSubtext', 'Free to use · No Aadhaar required to explore')}</span>
            </p>
          </div>

          {/* RIGHT COLUMN: Single Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-900 border border-[#E2E8F0] dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-gray-700">
                <h3 className="text-sm font-semibold text-[#0F1B3D] dark:text-white">
                  {t('home.previewTitle', 'Your recommendations')}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-[#16A34A] border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                  {t('home.matchedForYou', 'Matched for you')}
                </span>
              </div>

              {/* 3 Scheme Rows */}
              <div className="mt-4 space-y-3">

                {/* Row 1 */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#2563EB] flex items-center justify-center shrink-0">
                      <SproutIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F1B3D] dark:text-white">{t('home.previewKisanTitle', 'PM Kisan')}</p>
                      <p className="text-xs text-[#64748B] dark:text-gray-300">{t('home.previewKisanDesc', 'Direct income support')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0F1B3D] dark:text-white bg-white dark:bg-gray-900 px-2.5 py-1 rounded-md border border-[#E2E8F0] dark:border-gray-700">
                    {t('home.previewKisanBenefit', '₹6,000/year')}
                  </span>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#2563EB] flex items-center justify-center shrink-0">
                      <HeartPulseIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F1B3D] dark:text-white">{t('home.previewAyushmanTitle', 'Ayushman Bharat')}</p>
                      <p className="text-xs text-[#64748B] dark:text-gray-300">{t('home.previewAyushmanDesc', 'Secondary & tertiary care')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0F1B3D] dark:text-white bg-white dark:bg-gray-900 px-2.5 py-1 rounded-md border border-[#E2E8F0] dark:border-gray-700">
                    {t('home.previewAyushmanBenefit', 'Health coverage')}
                  </span>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#2563EB] flex items-center justify-center shrink-0">
                      <SunIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F1B3D] dark:text-white">{t('home.previewSuryaTitle', 'PM Surya Ghar')}</p>
                      <p className="text-xs text-[#64748B] dark:text-gray-300">{t('home.previewSuryaDesc', 'Free rooftop solar electricity')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0F1B3D] dark:text-white bg-white dark:bg-gray-900 px-2.5 py-1 rounded-md border border-[#E2E8F0] dark:border-gray-700">
                    {t('home.previewSuryaBenefit', 'Solar subsidy')}
                  </span>
                </div>

              </div>

              {/* Matching Footer Hint */}
              <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-gray-700 flex items-center justify-between text-xs text-[#64748B] dark:text-gray-300">
                <span>{t('home.basedOnFilters', 'Based on profile filters')}</span>
                <span className="font-medium text-[#2563EB] hover:underline cursor-pointer" onClick={() => navigate('/schemes')}>
                  {t('home.viewAllSchemes', 'View all 500+ →')}
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* ─── TRUST STRIP ───────────────────────────────────────────────────── */}
      <div className="border-y border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-gray-900 py-6">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700 text-[#0F1B3D] dark:text-white flex items-center justify-center shrink-0">
                <FileTextIcon className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-medium text-[#111827] dark:text-gray-100">
                {t('home.trustSchemes', '500+ schemes')}
              </span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700 text-[#0F1B3D] dark:text-white flex items-center justify-center shrink-0">
                <SparklesIcon className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-medium text-[#111827] dark:text-gray-100">
                {t('home.trustRecommendations', 'Personalized recommendations')}
              </span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700 text-[#0F1B3D] dark:text-white flex items-center justify-center shrink-0">
                <GlobeIcon className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-medium text-[#111827] dark:text-gray-100">
                {t('home.trustLanguages', 'Available in Indian languages')}
              </span>
            </div>

          </div>
        </div>
      </div>


      {/* ─── SCHEME DISCOVERY SECTION ──────────────────────────────────────── */}
      <section id="schemes" className="max-w-[1240px] mx-auto px-6 py-20 md:py-24 w-full">

        {/* Section Header */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] dark:text-white tracking-tight">
            {t('home.schemesSectionTitle', 'Explore government schemes')}
          </h2>
          <p className="text-base text-[#64748B] dark:text-gray-300">
            {t('home.schemesSectionSubtitle', 'Find benefits across health, education, farming, housing and more.')}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 scrollbar-none">
          {SCHEME_CATEGORIES.map(cat => {
            const catLabel = cat === 'All' ? t('dashboard.all', 'All')
              : cat === 'Agriculture' ? t('dashboard.agriculture', 'Agriculture')
              : cat === 'Health' ? t('dashboard.health', 'Health')
              : cat === 'Education' ? t('dashboard.education', 'Education')
              : cat === 'Housing' ? t('dashboard.housing', 'Housing')
              : cat === 'Employment' ? t('dashboard.employment', 'Employment')
              : cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat
                  ? 'bg-[#0F1B3D] text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-[#64748B] dark:text-gray-300 hover:text-[#111827] border border-[#E2E8F0] dark:border-gray-700'
                  }`}
              >
                {catLabel}
              </button>
            );
          })}
        </div>

        {/* Scheme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredSchemes.map(scheme => {
            const IconComponent = scheme.icon;
            return (
              <div
                key={scheme.id}
                className="bg-white dark:bg-gray-900 border border-[#E2E8F0] dark:border-gray-700 rounded-xl p-6 flex flex-col justify-between hover:border-blue-300 transition-all shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700 text-[#0F1B3D] dark:text-white group-hover:text-[#2563EB] group-hover:bg-blue-50 transition-colors flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-[#64748B] dark:text-gray-300 bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700 px-2.5 py-1 rounded-md">
                      {scheme.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#0F1B3D] dark:text-white group-hover:text-[#2563EB] transition-colors">
                    {scheme.name}
                  </h3>

                  <p className="text-sm text-[#64748B] dark:text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                    {scheme.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E2E8F0] dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F1B3D] dark:text-white">
                    {scheme.benefit}
                  </span>

                  <button
                    onClick={() => navigate(`/schemes/${scheme.id}`)}
                    className="text-sm font-medium text-[#2563EB] hover:text-blue-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{t('home.viewScheme', 'View scheme')}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </section>


      {/* ─── HOW IT WORKS SECTION ──────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white dark:bg-gray-900 border-y border-[#E2E8F0] dark:border-gray-700 py-20 md:py-24">
        <div className="max-w-[1240px] mx-auto px-6">

          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] dark:text-white tracking-tight">
              {t('home.howItWorksTitle', 'Simple from start to finish')}
            </h2>
            <p className="text-base text-[#64748B] dark:text-gray-300 mt-2">
              {t('home.howItWorksSubtitle', 'Discovering and applying for benefits requires only three clear steps.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Step 1 */}
            <div className="bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs font-semibold text-[#2563EB] bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg px-2.5 py-1 mb-6">
                  01
                </span>
                <h3 className="text-lg font-semibold text-[#0F1B3D] dark:text-white">
                  {t('home.step1Title', 'Tell us about yourself')}
                </h3>
                <p className="text-sm text-[#64748B] dark:text-gray-300 leading-relaxed mt-2">
                  {t('home.step1Desc', 'Answer a few simple questions regarding age, occupation, location, and income in under 2 minutes.')}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E2E8F0] dark:border-gray-700 text-xs text-[#64748B] dark:text-gray-300">
                {t('home.step1Note', 'No Aadhaar or personal ID required to explore')}
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs font-semibold text-[#2563EB] bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg px-2.5 py-1 mb-6">
                  02
                </span>
                <h3 className="text-lg font-semibold text-[#0F1B3D] dark:text-white">
                  {t('home.step2Title', 'Discover eligible schemes')}
                </h3>
                <p className="text-sm text-[#64748B] dark:text-gray-300 leading-relaxed mt-2">
                  {t('home.step2Desc', 'Our matching engine instantly analyzes 500+ central and state schemes tailored to your exact profile.')}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E2E8F0] dark:border-gray-700 text-xs text-[#64748B] dark:text-gray-300">
                {t('home.step2Note', 'Clear breakdown of benefits & requirements')}
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700 rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <span className="inline-block text-xs font-semibold text-[#2563EB] bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg px-2.5 py-1 mb-6">
                  03
                </span>
                <h3 className="text-lg font-semibold text-[#0F1B3D] dark:text-white">
                  {t('home.step3Title', 'Apply with confidence')}
                </h3>
                <p className="text-sm text-[#64748B] dark:text-gray-300 leading-relaxed mt-2">
                  {t('home.step3Desc', 'Get document checklists and direct access to official application portals without middlemen.')}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E2E8F0] dark:border-gray-700 text-xs text-[#64748B] dark:text-gray-300">
                {t('home.step3Note', 'Step-by-step guidance & status tracking')}
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ─── AI ASSISTANT SECTION ──────────────────────────────────────────── */}
      <section id="assistant" className="max-w-[1240px] mx-auto px-6 py-20 md:py-24 w-full">

        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] dark:text-white tracking-tight">
            {t('home.assistantTitle', 'Need help finding the right scheme?')}
          </h2>
          <p className="text-base text-[#64748B] dark:text-gray-300 mt-2">
            {t('home.assistantSubtitle', 'Ask Yojsetu in your language.')}
          </p>
        </div>

        {/* Minimal Chat Interface Preview */}
        <div className="bg-white dark:bg-gray-900 border border-[#E2E8F0] dark:border-gray-700 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm mt-10">

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-gray-700 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0F1B3D] text-white flex items-center justify-center text-xs font-bold">
                Y
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F1B3D] dark:text-white">{t('home.assistantCardTitle', 'Yojsetu Assistant')}</p>
                <p className="text-[11px] text-[#64748B] dark:text-gray-300">{t('home.assistantCardSubtitle', 'Multilingual Civic Guide')}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#16A34A] bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              {t('home.assistantOnline', 'Online')}
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-6">

            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-[#F8FAFC] dark:bg-gray-950 text-[#111827] dark:text-gray-100 border border-[#E2E8F0] dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tr-xs text-sm max-w-md">
                {t('home.assistantQueryPreview', 'Which schemes can help my family?')}
              </div>
            </div>

            {/* Yojsetu message */}
            <div className="flex justify-start">
              <div className="bg-[#0F1B3D] text-white px-4 py-3 rounded-2xl rounded-tl-xs text-sm max-w-md space-y-1.5 leading-relaxed">
                <p>{t('home.assistantReplyPreview', 'Based on your profile, here are 3 schemes you may be eligible for:')}</p>
                <ul className="text-xs text-slate-300 space-y-1 pt-1 list-disc list-inside">
                  <li>PM Kisan Samman Nidhi</li>
                  <li>Ayushman Bharat Health Cover</li>
                  <li>PM Surya Ghar Solar Subsidy</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Input Bar Preview */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-gray-950 border border-[#E2E8F0] dark:border-gray-700 rounded-xl p-2">
            <input
              type="text"
              readOnly
              value={t('home.assistantInputPlaceholder', 'Type your question in Hindi, English, Punjabi...')}
              className="bg-transparent text-sm text-[#64748B] dark:text-gray-300 px-3 w-full focus:outline-none cursor-pointer"
              onClick={() => navigate('/assistant')}
            />
            <button
              onClick={() => navigate('/assistant')}
              className="p-2.5 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-[#2563EB] rounded-lg transition-colors cursor-pointer shrink-0"
              title="Voice Input"
            >
              <MicIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-all cursor-pointer shrink-0"
            >
              {t('home.assistantAskBtn', 'Ask')}
            </button>
          </div>

        </div>

      </section>


      {/* ─── LANGUAGE SECTION ──────────────────────────────────────────────── */}
      <section id="languages" className="bg-white dark:bg-gray-900 border-y border-[#E2E8F0] dark:border-gray-700 py-16 md:py-20">
        <div className="max-w-[1240px] mx-auto px-6">

          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] dark:text-white tracking-tight">
              {t('home.languageSectionTitle', 'Your language. Your benefits.')}
            </h2>
            <p className="text-base text-[#64748B] dark:text-gray-300 mt-2">
              {t('home.languageSectionSubtitle', "Explore Yojsetu in the language you're most comfortable with.")}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            {supportedLanguages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${language === lang.code
                  ? 'bg-[#0F1B3D] dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-[#111827] dark:text-gray-100 border border-[#E2E8F0] dark:border-gray-700 hover:border-[#2563EB]'
                  }`}
              >
                <span>{lang.nativeName}</span>
                <span className="text-[11px] ml-1.5 opacity-60">({lang.name})</span>
              </button>
            ))}
          </div>

        </div>
      </section>


      {/* ─── CITIZEN STORIES ───────────────────────────────────────────────── */}
      <section id="about" className="max-w-[1240px] mx-auto px-6 py-20 md:py-24 w-full">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#0F1B3D] dark:text-white tracking-tight">
            {t('home.testimonialsTitle', 'Built for citizens')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonialItem, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 border border-[#E2E8F0] dark:border-gray-700 rounded-xl p-6 flex flex-col justify-between shadow-sm"
            >
              <p className="text-sm text-[#111827] dark:text-gray-100 leading-relaxed italic">
                "{testimonialItem.quote}"
              </p>

              <div className="mt-6 pt-4 border-t border-[#E2E8F0] dark:border-gray-700">
                <p className="text-sm font-semibold text-[#0F1B3D] dark:text-white">{testimonialItem.name}</p>
                <p className="text-xs text-[#64748B] dark:text-gray-300">{testimonialItem.location}</p>
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
              {t('home.ctaTitle', 'Ready to find your benefits?')}
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              {t('home.ctaSubtitle', 'Check your eligibility in a few simple steps.')}
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate('/schemes')}
                className="bg-[#2563EB] hover:bg-blue-600 text-white font-medium text-base px-8 py-3.5 rounded-xl transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>{t('home.ctaButton', 'Check my eligibility')}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>


      {/* ─── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-gray-900 border-t border-[#E2E8F0] dark:border-gray-700 mt-auto">
        <div className="max-w-[1240px] mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

            {/* Left Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2.5" aria-label="YojSetu Home">
                <img
                  src={logoSrc}
                  alt="YojSetu Logo"
                  className="h-12 md:h-14 w-auto object-contain hover:opacity-95 transition-opacity"
                />
              </Link>
              <p className="text-sm text-[#64748B] dark:text-gray-300 mt-2 max-w-xs">
                {t('home.footerTagline', 'Making government benefits easier to discover.')}
              </p>
            </div>

            {/* Nav Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#64748B] dark:text-gray-300">
              <a href="#about" className="hover:text-[#111827] transition-colors">{t('nav.about', 'About')}</a>
              <a href="#schemes" className="hover:text-[#111827] transition-colors">{t('nav.schemes', 'Schemes')}</a>
              <Link to="/applications" className="hover:text-[#111827] transition-colors">{t('nav.trackApplication', 'Track Application')}</Link>
              <a href="#how-it-works" className="hover:text-[#111827] transition-colors">{t('nav.help', 'Help')}</a>
              <span className="text-[#E2E8F0]">|</span>
              <span className="hover:text-[#111827] cursor-pointer">{t('home.privacy', 'Privacy')}</span>
              <span className="hover:text-[#111827] cursor-pointer">{t('home.terms', 'Terms')}</span>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-[#E2E8F0] dark:border-gray-700 flex items-center justify-between text-xs text-[#64748B] dark:text-gray-300">
            <p>{t('home.copyright', '© Yojsetu. All rights reserved.')}</p>
            <p>{t('home.madeForCitizens', 'Made for Indian Citizens')}</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
