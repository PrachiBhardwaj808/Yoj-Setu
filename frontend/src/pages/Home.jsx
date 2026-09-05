import { useState } from 'react';

// ─── Icon Components ─────────────────────────────────────────────────────────

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-2-8 2v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SCHEME_CATEGORIES = ['All Schemes', 'Housing', 'Health', 'Agriculture', 'Education', 'Women', 'Employment'];

const SCHEMES = [
  {
    id: 1,
    category: 'Housing',
    emoji: '🏠',
    name: 'PM Awas Yojana',
    ministry: 'Ministry of Housing & Urban Affairs',
    benefit: '₹2,50,000',
    period: 'One-time',
    tag: 'Housing Benefit',
    tagColor: 'bg-blue-100 text-blue-700',
    eligible: true,
    applicants: '2.4 Cr applicants',
  },
  {
    id: 2,
    category: 'Health',
    emoji: '🏥',
    name: 'Ayushman Bharat PM-JAY',
    ministry: 'Ministry of Health & Family Welfare',
    benefit: '₹5,00,000',
    period: 'per year',
    tag: 'Health Insurance',
    tagColor: 'bg-green-100 text-green-700',
    eligible: true,
    applicants: '5.5 Cr beneficiaries',
  },
  {
    id: 3,
    category: 'Agriculture',
    emoji: '🌾',
    name: 'PM Kisan Samman Nidhi',
    ministry: 'Ministry of Agriculture',
    benefit: '₹6,000',
    period: 'per year',
    tag: 'Direct Transfer',
    tagColor: 'bg-yellow-100 text-yellow-700',
    eligible: false,
    applicants: '11.8 Cr farmers',
  },
  {
    id: 4,
    category: 'Housing',
    emoji: '☀️',
    name: 'PM Surya Ghar Muft Bijli',
    ministry: 'Ministry of New & Renewable Energy',
    benefit: 'Up to ₹78,000',
    period: 'subsidy',
    tag: 'Solar Subsidy',
    tagColor: 'bg-orange-100 text-orange-700',
    eligible: true,
    applicants: '1.3 Cr enrolled',
  },
  {
    id: 5,
    category: 'Education',
    emoji: '📚',
    name: 'PM Vidya Lakshmi',
    ministry: 'Ministry of Education',
    benefit: '₹7.5 Lakh',
    period: 'loan subsidy',
    tag: 'Education Loan',
    tagColor: 'bg-purple-100 text-purple-700',
    eligible: true,
    applicants: '82 Lakh students',
  },
  {
    id: 6,
    category: 'Women',
    emoji: '👩',
    name: 'PM Matru Vandana Yojana',
    ministry: 'Ministry of Women & Child Development',
    benefit: '₹5,000',
    period: 'per pregnancy',
    tag: 'Maternity Benefit',
    tagColor: 'bg-pink-100 text-pink-700',
    eligible: false,
    applicants: '2.9 Cr beneficiaries',
  },
  {
    id: 7,
    category: 'Employment',
    emoji: '💼',
    name: 'PM Kaushal Vikas Yojana',
    ministry: 'Ministry of Skill Development',
    benefit: '₹8,000',
    period: 'training stipend',
    tag: 'Skill Training',
    tagColor: 'bg-teal-100 text-teal-700',
    eligible: true,
    applicants: '1.5 Cr trained',
  },
  {
    id: 8,
    category: 'Agriculture',
    emoji: '🚰',
    name: 'PM Fasal Bima Yojana',
    ministry: 'Ministry of Agriculture',
    benefit: '₹2 Lakh',
    period: 'insurance cover',
    tag: 'Crop Insurance',
    tagColor: 'bg-lime-100 text-lime-700',
    eligible: false,
    applicants: '5.8 Cr farmers',
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Harpreet Singh',
    role: 'Beneficiary, Punjab',
    avatar: '👨‍🌾',
    stars: 5,
    text: 'Yojsetu ne mujhe PM Kisan aur PM Awas dono scheme ke liye eligible bataya. Pehle mujhe kuch pata hi nahi tha. Ab mera ghar ban raha hai.',
    schemeApplied: 'PM Awas Yojana',
    amount: '₹2,50,000 received',
  },
  {
    id: 2,
    name: 'Anita Devi',
    role: 'Beneficiary, Rajasthan',
    avatar: '👩‍🏫',
    stars: 5,
    text: 'Hamara beta beemaar tha aur hospital ka bill bahut bada tha. Yojsetu ne Ayushman Bharat mein help ki. Ab poora treatment free mein hua.',
    schemeApplied: 'Ayushman Bharat PM-JAY',
    amount: '₹4.8 Lakh treatment covered',
  },
  {
    id: 3,
    name: 'Ramesh Kumar',
    role: 'Farmer, Maharashtra',
    avatar: '👨‍🌾',
    stars: 4,
    text: 'Solar panel lagwana bahut mahanga lagta tha. Yojsetu ne PM Surya Ghar subsidy ke baare mein bataya. Ab bijli ka bill zero hai.',
    schemeApplied: 'PM Surya Ghar Muft Bijli',
    amount: '₹78,000 subsidy availed',
  },
];

const STATS = [
  { icon: <ShieldIcon />, value: '500+', label: 'Verified Schemes', color: 'text-blue-600' },
  { icon: <LanguageIcon />, value: '12', label: 'Indian Languages', color: 'text-indigo-600' },
  { icon: <MapPinIcon />, value: '28', label: 'States Covered', color: 'text-violet-600' },
  { icon: <UsersIcon />, value: '2 Cr+', label: 'Citizens Helped', color: 'text-sky-600' },
];

const HOW_STEPS = [
  {
    num: '01',
    title: 'Complete Your Profile',
    desc: 'Tell us your family details, income, caste, location, and occupation. Takes less than 3 minutes.',
    icon: '👤',
    points: ['No documents needed upfront', 'Multi-language support', 'Voice input available'],
  },
  {
    num: '02',
    title: 'AI Eligibility Matching',
    desc: 'Our AI instantly matches your profile against 500+ Central and State government schemes.',
    icon: '🤖',
    points: ['Real-time matching', 'Ranked by benefit amount', 'Explained in simple language'],
  },
  {
    num: '03',
    title: 'One-Click DigiLocker Apply',
    desc: 'Apply directly using your Aadhaar-linked DigiLocker documents without visiting any office.',
    icon: '📱',
    points: ['Track application status', 'SMS & WhatsApp alerts', 'Grievance support'],
  },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#0f1c3f] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow">
              Y
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Yojsetu</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['About', 'Schemes', 'Track Application', 'Help'].map(link => (
              <a
                key={link}
                href="#"
                className="text-blue-200 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Auth + language */}
          <div className="hidden md:flex items-center gap-3">
            <button className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm font-medium border border-blue-400/30 rounded-lg px-3 py-1.5 hover:border-blue-300/50 transition-all">
              <LanguageIcon />
              <span>हिंदी</span>
            </button>
            <button className="text-white border border-white/20 rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-white/10 transition-all">
              Login
            </button>
            <button className="bg-blue-500 hover:bg-blue-400 text-white rounded-lg px-4 py-1.5 text-sm font-semibold transition-all shadow">
              Register
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0f1c3f] border-t border-white/10 px-4 py-4 space-y-3">
          {['About', 'Schemes', 'Track Application', 'Help'].map(link => (
            <a key={link} href="#" className="block text-blue-200 hover:text-white text-sm font-medium py-1">
              {link}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 text-white border border-white/20 rounded-lg py-2 text-sm font-medium">Login</button>
            <button className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm font-semibold">Register</button>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="pt-16 bg-gradient-to-br from-[#e8f0fe] via-[#f0f4ff] to-[#eef2ff] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-8">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-blue-100 text-sm font-medium text-blue-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Powered by Government of India Data • UMANG Integrated
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-gray-900 leading-tight">
                Find Government Schemes<br />
                You're{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Truly Eligible For
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Yojsetu uses AI to match your family, occupation, and location with over{' '}
                <strong>500+ State and Central schemes</strong> — eliminating confusion and paperwork forever.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                id="hero-check-eligibility-btn"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <ShieldIcon />
                Check My Eligibility (Free)
                <ArrowRightIcon />
              </button>
              <button
                id="hero-language-btn"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
              >
                <MicIcon />
                Speak in Your Language
              </button>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              {[
                'No login required to explore',
                '100% free — no hidden charges',
                'Aadhaar not required to browse',
              ].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard card */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Decorative blobs */}
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-indigo-200/40 rounded-full blur-3xl" />

            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Card header */}
              <div className="bg-[#0f1c3f] px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold text-lg">
                    R
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Rahul Sharma</p>
                    <p className="text-blue-300 text-xs">Farmer • Uttar Pradesh</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  Active
                </div>
              </div>

              {/* Eligibility status */}
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Eligibility Summary</p>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600">Profile completeness</span>
                  <span className="text-sm font-bold text-blue-600">87%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[87%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="flex-1 bg-green-50 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-extrabold text-green-600">14</p>
                    <p className="text-xs text-gray-500">Eligible</p>
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-extrabold text-blue-600">₹11.5L</p>
                    <p className="text-xs text-gray-500">Total Benefits</p>
                  </div>
                  <div className="flex-1 bg-orange-50 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-extrabold text-orange-500">3</p>
                    <p className="text-xs text-gray-500">Applied</p>
                  </div>
                </div>
              </div>

              {/* Scheme matches */}
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Top Matches</p>
                <div className="space-y-2.5">
                  {[
                    { name: 'PM Kisan Samman Nidhi', amount: '₹6,000/yr', icon: '🌾', status: 'Applied' },
                    { name: 'Ayushman Bharat PM-JAY', amount: '₹5,00,000/yr', icon: '🏥', status: 'Eligible' },
                    { name: 'PM Surya Ghar Muft Bijli', amount: 'Up to ₹78,000', icon: '☀️', status: 'New' },
                  ].map(s => (
                    <div key={s.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                      <span className="text-xl">{s.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.amount}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        s.status === 'Applied' ? 'bg-blue-100 text-blue-700'
                        : s.status === 'New' ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                      }`}>{s.status}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all">
                  See All 14 Schemes →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-white border-t border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {STATS.map(s => (
              <div key={s.label} className="flex items-center gap-4 px-6 py-5">
                <div className={`${s.color} bg-blue-50 rounded-xl p-2.5`}>{s.icon}</div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Schemes Section ──────────────────────────────────────────────────────────

function SchemesSection() {
  const [activeCategory, setActiveCategory] = useState('All Schemes');

  const filtered = activeCategory === 'All Schemes'
    ? SCHEMES
    : SCHEMES.filter(s => s.category === activeCategory);

  return (
    <section id="schemes" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            Directly From Government Sources
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Explore Verified Benefits & Subsidies
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Updated daily from official databases — search, filter, and find exactly what your family qualifies for.
          </p>
        </div>

        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search scheme name, benefit, or keyword…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm text-gray-600 text-sm font-medium px-5 py-3 rounded-xl hover:border-blue-300 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SCHEME_CATEGORIES.map(cat => (
            <button
              key={cat}
              id={`scheme-category-${cat.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Scheme cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map(scheme => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{scheme.emoji}</span>
                  {scheme.eligible && (
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                      You may qualify
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">{scheme.name}</h3>
                <p className="text-xs text-gray-400 mb-4 leading-snug">{scheme.ministry}</p>

                <div className="mb-1">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${scheme.tagColor}`}>
                    {scheme.tag}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-extrabold text-gray-900">{scheme.benefit}</p>
                  <p className="text-xs text-gray-400">{scheme.period}</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">{scheme.applicants}</p>
              </div>

              <div className="px-5 pb-5 flex gap-2">
                <button
                  id={`apply-btn-${scheme.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  1-Click Apply
                </button>
                <button
                  id={`details-btn-${scheme.id}`}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold py-2.5 rounded-xl border border-gray-200 transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold border-2 border-blue-200 hover:border-blue-400 px-8 py-3 rounded-xl transition-all">
            View All 500+ Schemes
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            Simple 3-Step Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            How Yojsetu Works for Every Citizen
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Eliminating middlemen, confusion, and multiple office visits — all from your smartphone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 to-blue-300" />

          {HOW_STEPS.map((step, i) => (
            <div key={i} className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              {/* Step number */}
              <div className="absolute -top-4 left-8 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-extrabold shadow-lg">
                {i + 1}
              </div>

              <div className="text-5xl mb-5 mt-2">{step.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{step.desc}</p>

              <ul className="space-y-2">
                {step.points.map(p => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-3 h-3 text-blue-600" />
                    </div>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 bg-blue-50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-100">
          <div>
            <p className="text-sm text-blue-600 font-semibold mb-1">Need help completing your application?</p>
            <p className="text-gray-700 text-lg font-bold">
              Talk to our AI Sathi — available in 12 languages, 24/7
            </p>
          </div>
          <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-xl shadow transition-all whitespace-nowrap">
            <MicIcon />
            Start Voice Guidance
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── AI Sathi Section ─────────────────────────────────────────────────────────

function AISathiSection() {
  return (
    <section className="py-20 bg-[#0f1c3f] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 text-blue-300 text-sm font-semibold mb-6">
              🤖 AI-Powered Voice Assistant
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
              Meet{' '}
              <span className="text-blue-400">'Yojsetu AI Sathi'</span>
              {' '}—{' '}The Voice Assistant for Bharat
            </h2>
            <p className="text-blue-200 text-lg mb-8 leading-relaxed">
              As an AI model citizen, you do not need to struggle with complex administrative jargon or fill lengthy keyboards.
              AI performs tasks end-to-end and delivers AI-long solutions naturally.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: <GlobeIcon />, title: 'Multi-language Support', desc: '12 Indian languages including Hindi, Tamil, Telugu, Bengali & more' },
                { icon: <ChatIcon />, title: 'Always Available', desc: '24/7 assistance via voice, text, or WhatsApp — no app needed' },
                { icon: <ZapIcon />, title: 'Instant Answers', desc: 'Get scheme details, eligibility, and application steps in seconds' },
                { icon: <MicIcon />, title: 'Voice First Design', desc: 'Designed for users who prefer speaking over typing — truly inclusive' },
              ].map(f => (
                <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <div className="text-blue-400 mb-2">{f.icon}</div>
                  <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
                  <p className="text-blue-300/70 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-7 py-3 rounded-xl shadow-lg transition-all">
                <MicIcon />
                Try Voice Guidance
              </button>
              <button className="inline-flex items-center gap-2 text-blue-300 hover:text-white border border-blue-500/40 hover:border-blue-400 px-7 py-3 rounded-xl transition-all font-semibold">
                See how it works →
              </button>
            </div>
          </div>

          {/* Right — Chat UI mockup */}
          <div className="relative">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">🤖</div>
                <div>
                  <p className="text-white font-semibold text-sm">Yojsetu AI Sathi</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs">Online • Responds instantly</span>
                  </div>
                </div>
                <div className="ml-auto flex gap-1">
                  {['हिंदी', 'தமிழ்', 'বাংলা'].map(l => (
                    <span key={l} className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded">{l}</span>
                  ))}
                </div>
              </div>

              {/* Chat messages */}
              <div className="space-y-3 mb-4">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm flex-shrink-0">🤖</div>
                  <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-white text-sm">Namaste! Main Yojsetu AI Sathi hoon. Aap kaunsi scheme ke baare mein jaanna chahte hain?</p>
                    <p className="text-white/40 text-xs mt-1">Just now</p>
                  </div>
                </div>

                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm flex-shrink-0">👤</div>
                  <div className="bg-blue-600 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                    <p className="text-white text-sm">Mujhe kisan yojana ke baare mein batao</p>
                    <p className="text-blue-200/70 text-xs mt-1">Just now</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm flex-shrink-0">🤖</div>
                  <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-white text-sm">PM Kisan Samman Nidhi mein aapko ₹6,000 per year milte hain — seedha aapke bank account mein! Kya aap eligible check karein?</p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-xs bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg transition">
                        Haan, check karein ✓
                      </button>
                      <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition">
                        Aur schemes dekho
                      </button>
                    </div>
                    <p className="text-white/40 text-xs mt-1">Just now</p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type or speak your question…"
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
                <button className="bg-blue-500 hover:bg-blue-400 text-white rounded-xl px-4 py-2.5 transition-colors">
                  <MicIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Impact Numbers ───────────────────────────────────────────────────────────

function ImpactSection() {
  const numbers = [
    { value: '₹420Cr+', label: 'Benefits Facilitated', sublabel: 'Across Schemes' },
    { value: '12', label: 'Regional Languages', sublabel: 'Supported' },
    { value: '98.4%', label: 'Application Success', sublabel: 'Rate' },
    { value: '28', label: 'States & UTs', sublabel: 'Active Coverage' },
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-widest">Real Impact, Real Numbers</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {numbers.map(n => (
            <div key={n.value} className="text-center group">
              <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text mb-1 group-hover:scale-105 transition-transform duration-300">
                {n.value}
              </div>
              <p className="text-gray-900 font-semibold text-lg">{n.label}</p>
              <p className="text-gray-400 text-sm">{n.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">Real Stories</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Stories of Dignity and Direct Access
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Citizens across India who found schemes they never knew they qualified for.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.id}
              className={`bg-white rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                i === active
                  ? 'border-blue-300 shadow-lg shadow-blue-100'
                  : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
              }`}
              onClick={() => setActive(i)}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => <StarIcon key={j} />)}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 text-sm leading-relaxed mb-5 italic">
                "{t.text}"
              </blockquote>

              {/* Scheme badge */}
              <div className="bg-blue-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-0.5">Scheme applied via Yojsetu</p>
                <p className="text-blue-700 font-semibold text-sm">{t.schemeApplied}</p>
                <p className="text-green-600 font-bold text-sm">{t.amount}</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`transition-all duration-300 rounded-full ${
                i === active ? 'w-8 h-2.5 bg-blue-600' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Rights Banner ────────────────────────────────────────────────────────────

function RightsBanner() {
  return (
    <section className="bg-gradient-to-r from-[#0f1c3f] to-[#1a3060] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <p className="text-blue-300 text-sm font-semibold mb-1 uppercase tracking-wide">
              Your Rights Under Protection of India (DPDP) Act 2023
            </p>
            <p className="text-2xl font-extrabold">
              Your Data Belongs to You.
            </p>
            <p className="text-blue-200 mt-1 text-sm max-w-xl">
              Yojsetu never sells your personal data. All information is encrypted, stored securely,
              and used only to match you with government schemes. You can delete your profile anytime.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 bg-white text-blue-900 font-semibold px-7 py-3 rounded-xl hover:bg-blue-50 transition whitespace-nowrap shadow-lg">
            Read Our Privacy Policy →
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const links = {
    Platform: ['Home', 'About Us', 'Contact', 'Blog'],
    'Scheme Types': ['Housing', 'Health', 'Agriculture', 'Education', 'Women & Child'],
    Resources: ['Articles', 'State Portals', 'FAQ', 'Grievance Portal'],
    Legal: ['Privacy Policy', 'Terms of Use', 'Data Rights', 'Accessibility'],
  };

  return (
    <footer className="bg-[#0b1528] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-lg">Y</div>
              <span className="text-white font-bold text-xl">Yojsetu</span>
            </div>
            <p className="text-blue-200/70 text-sm leading-relaxed mb-6">
              Empowering every Indian citizen with access to government benefits they rightfully deserve —
              in their own language, on their own device.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-blue-200">
                <span>📞</span>
                <span className="font-semibold text-white text-lg">1800-111-200</span>
              </div>
              <p className="text-blue-200/70 text-xs">Toll free • Mon–Sat 9AM–6PM</p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-blue-200/70 hover:text-white text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-blue-200/50 text-xs">
          <p>© 2026 Yojsetu. All rights reserved. Not an official Government of India portal.</p>
          <div className="flex gap-1 items-center">
            <span>Made with</span>
            <span className="text-red-400">♥</span>
            <span>for 140 Crore Indians</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <SchemesSection />
        <HowItWorksSection />
        <AISathiSection />
        <ImpactSection />
        <TestimonialsSection />
        <RightsBanner />
      </main>
      <Footer />
    </div>
  );
}
