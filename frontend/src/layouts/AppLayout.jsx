/**
 * AppLayout.jsx
 *
 * Authenticated application shell.
 * Desktop:  fixed left sidebar (64px collapsed / 240px expanded) + main content area
 * Mobile:   full top header + fixed bottom navigation bar
 *
 * All navigation uses React Router <Link> — no href="#".
 */
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { mockNotifications } from '@/data/mockNotifications';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard',     label: 'Dashboard',     icon: HomeIcon },
  { to: '/schemes',       label: 'Schemes',       icon: GridIcon },
  { to: '/eligibility',   label: 'Eligibility',   icon: TargetIcon },
  { to: '/applications',  label: 'Applications',  icon: FileIcon },
  { to: '/assistant',     label: 'AI Sathi',      icon: BotIcon },
  { to: '/notifications', label: 'Notifications', icon: BellIcon },
  { to: '/profile',       label: 'Profile',       icon: UserIcon },
];

// ─── SVG icons ────────────────────────────────────────────────────────────────
function HomeIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function GridIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function TargetIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
function FileIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function BotIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
}
function BellIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function UserIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function LogoutIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function MenuIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function ChevronLeftIcon({ cls }) {
  return <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>;
}

// ─── Sidebar (desktop) ────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { completionPercent } = useProfile();
  const navigate = useNavigate();
  const unread = mockNotifications.filter(n => !n.read).length;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const iconCls = 'w-5 h-5 flex-shrink-0';

  return (
    <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-[#0f1c3f] text-white z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo row */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-white/10">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 font-bold text-sm">Y</div>
            <span className="font-extrabold text-sm tracking-widest truncate">YOJSETU</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mx-auto font-bold text-sm">Y</div>
        )}
        <button
          onClick={onToggle}
          className={`text-white/50 hover:text-white transition-colors p-1 rounded ${collapsed ? 'mx-auto mt-1' : ''}`}
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
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-200/70 hover:bg-white/10 hover:text-white'
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
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Profile + logout */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {!collapsed && (
          <div className="px-2 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-blue-200/60">Profile</span>
              <span className="text-xs font-bold text-blue-400">{completionPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        )}
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user?.name?.[0] ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-[10px] text-blue-200/50 truncate">{user?.phone}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm"
          aria-label="Logout"
        >
          <LogoutIcon cls={iconCls} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile header ─────────────────────────────────────────────────────────────
function MobileHeader({ onMenuOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unread = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-[#0f1c3f] text-white h-14 flex items-center justify-between px-4 shadow-lg">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-xs">Y</div>
        <span className="font-extrabold text-sm tracking-widest">YOJSETU</span>
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/notifications" className="relative text-white/70 hover:text-white transition-colors">
          <BellIcon cls="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </Link>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-white/70 hover:text-red-400 transition-colors"
          aria-label="Logout"
        >
          <LogoutIcon cls="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
function BottomNav() {
  const unread = mockNotifications.filter(n => !n.read).length;
  const BOTTOM_ITEMS = NAV_ITEMS.slice(0, 5); // show first 5

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 shadow-xl">
      <div className="flex items-center justify-around h-16">
        {BOTTOM_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-0 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
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
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

// ─── AppLayout root ───────────────────────────────────────────────────────────
export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 'lg:pl-16' : 'lg:pl-60';

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Desktop sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

      {/* Mobile header */}
      <MobileHeader />

      {/* Main content */}
      <main className={`${sidebarWidth} pt-14 lg:pt-0 pb-16 lg:pb-0 transition-all duration-300 min-h-screen`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
