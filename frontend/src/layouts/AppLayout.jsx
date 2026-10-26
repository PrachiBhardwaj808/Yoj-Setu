
import { useState } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useTheme } from "../context/ThemeContext";
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/common/LanguageSelector';
import { mockNotifications } from '@/data/mockNotifications';

const NAV_ITEMS = [
  { to: '/dashboard', labelKey: 'nav.dashboard', defaultLabel: 'Dashboard', icon: HomeIcon },
  { to: '/schemes', labelKey: 'nav.schemes', defaultLabel: 'Schemes', icon: GridIcon },
  { to: '/onboarding', labelKey: 'nav.eligibility', defaultLabel: 'Eligibility', icon: TargetIcon },
  { to: '/applications', labelKey: 'nav.applications', defaultLabel: 'Applications', icon: FileIcon },
  { to: '/documents', labelKey: 'nav.documents', defaultLabel: 'Documents', icon: DocIcon },
  { to: '/assistant', labelKey: 'nav.assistant', defaultLabel: 'AI Sathi', icon: BotIcon },
  { to: '/safety-centre', labelKey: 'nav.safetyCentre', defaultLabel: 'Safety Centre', icon: ShieldIcon },
  { to: '/notifications', labelKey: 'nav.notifications', defaultLabel: 'Notifications', icon: BellIcon },
  { to: '/profile', labelKey: 'nav.profile', defaultLabel: 'Profile', icon: UserIcon },
];

function HomeIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function GridIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
}
function TargetIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
}
function FileIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
}
function DocIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function BotIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>;
}
function ShieldIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>;
}
function BellIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function UserIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}
function LogoutIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
}
function MenuIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
}
function ChevronLeftIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>;
}
function Sidebar({ collapsed, onToggle }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { completionPercent } = useProfile();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const logoSrc = theme === 'dark' ? '/yojsetu-logo-dark.png' : '/yojsetu-logo-light.png';
  const unread = mockNotifications.filter(n => !n.read).length;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const iconCls = 'w-5 h-5 flex-shrink-0';
  const displayName = user?.full_name || user?.name || 'Citizen';
  const initial = (displayName || 'C')[0].toUpperCase();

  return (
    <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white dark:bg-[#0f1c3f] text-gray-900 dark:text-white z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo row */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200 dark:border-white/10">
        {!collapsed && (
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 min-w-0" aria-label="YojSetu Home">
            <img
              src={logoSrc}
              alt="YojSetu Logo"
              className="h-12 w-auto max-w-[180px] object-contain"
            />
          </Link>
        )}
        {collapsed && (
          <Link to={isAuthenticated ? "/dashboard" : "/"} aria-label="YojSetu Home" className="mx-auto">
            <img
              src={logoSrc}
              alt="YojSetu Logo"
              className="w-12 h-auto max-h-12 object-contain"
            />
          </Link>
        )}
        <button
          onClick={onToggle}
          className={`text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded ${collapsed ? 'mx-auto mt-1' : ''}`}
          aria-label="Toggle sidebar"
        >
          {collapsed
            ? <MenuIcon cls="w-4 h-4" />
            : <ChevronLeftIcon cls="w-4 h-4" />
          }
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const label = t(item.labelKey, item.defaultLabel);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-150 group relative ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-blue-200/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <div className="relative">
                <Icon cls={iconCls} />
                {item.to === '/notifications' && unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
              {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Language + Theme + Profile + Logout */}
      <div className="border-t border-gray-200 dark:border-white/10 p-3 space-y-2">
        {/* Language Selector */}
        <div className="w-full">
          <LanguageSelector compact={collapsed} />
        </div>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-gray-600 dark:text-blue-200/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-sm"
          aria-label="Toggle theme"
        >
          <span className="text-lg">{theme === "dark" ? "☀️" : "🌙"}</span>
          {!collapsed && (
            <span className="font-medium">
              {theme === "dark" ? t('nav.lightMode', 'Light Mode') : t('nav.darkMode', 'Dark Mode')}
            </span>
          )}
        </button>
        {isAuthenticated ? (
          <>
            {!collapsed && (
              <div className="px-2 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-blue-200/60">{t('nav.profileSetup', 'Profile Setup')}</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{completionPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>
            )}
            {!collapsed && (
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{displayName}</p>
                  <p className="text-[10px] text-gray-500 dark:text-blue-200/50 truncate">{user?.phone || ''}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-all text-sm cursor-pointer"
              aria-label="Logout"
            >
              <LogoutIcon cls={iconCls} />
              {!collapsed && <span className="font-medium">{t('nav.logout', 'Logout')}</span>}
            </button>
          </>
        ) : (
          <div className="pt-2 space-y-2">
            {!collapsed ? (
              <>
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-xs"
                >
                  <span>{t('nav.signIn', 'Sign In')}</span>
                </Link>
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white font-medium text-xs transition-colors"
                >
                  <span>{t('nav.register', 'Register')}</span>
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                title={t('nav.signIn', 'Sign In')}
                className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserIcon cls="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function MobileHeader() {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const logoSrc = theme === 'dark' ? '/yojsetu-logo-dark.png' : '/yojsetu-logo-light.png';
  const unread = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white dark:bg-[#0f1c3f] text-gray-900 dark:text-white h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/10 shadow-md">
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2" aria-label="YojSetu Home">
        <img
          src={logoSrc}
          alt="YojSetu Logo"
          className="h-11 w-auto max-w-[144px] object-contain"
        />
      </Link>
      <div className="flex items-center gap-2">
        <LanguageSelector compact align="right" />
        <button
          onClick={toggleTheme}
          className="p-1 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
        {isAuthenticated ? (
          <>
            <Link to="/notifications" className="relative p-1 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors">
              <BellIcon cls="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-1 text-gray-600 dark:text-white/70 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              aria-label={t('nav.logout', 'Logout')}
              title={t('nav.logout', 'Logout')}
            >
              <LogoutIcon cls="w-5 h-5" />
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('nav.signIn', 'Sign In')}
          </Link>
        )}
      </div>
    </header>
  );
}

function BottomNav() {
  const { t } = useLanguage();
  const unread = mockNotifications.filter(n => !n.read).length;
  const BOTTOM_ITEMS = [
    NAV_ITEMS[0], // Dashboard
    NAV_ITEMS[1], // Schemes
    NAV_ITEMS[3], // Applications
    NAV_ITEMS[5], // AI Sathi
    NAV_ITEMS[8], // Profile
    NAV_ITEMS[6], // Safety Centre
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[#0f1c3f] border-t border-gray-100 dark:border-white/10 shadow-xl">
      <div className="flex items-center justify-around h-16">
        {BOTTOM_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-0 ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-400'
                }`
              }
            >
              <div className="relative">
                <Icon cls="w-5 h-5" />
                {item.to === '/notifications' && unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium truncate">{t(item.labelKey, item.defaultLabel)}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 'lg:pl-16' : 'lg:pl-60';

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-gray-950">
      {/* Desktop sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

      {/* Mobile header */}
      <MobileHeader />

      {/* Main content */}
      <main className={`${sidebarWidth} pt-14 lg:pt-0 pb-16 lg:pb-0 transition-all duration-300 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children || <Outlet />}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
