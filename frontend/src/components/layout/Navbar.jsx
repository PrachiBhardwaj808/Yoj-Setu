import { Link, NavLink } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Navbar.jsx — top navigation bar, rendered on every page via AppLayout
//
// Uses React Router's <NavLink> instead of plain <a> tags.
// <NavLink> is special: it automatically adds an "active" class (or lets you
// apply styles) when its `to` path matches the current URL. This is how
// the active nav link gets highlighted without any extra JavaScript.
//
// <Link> (for the logo) is the basic React Router link — no active styling.
// Both prevent full page reloads (they use the browser's History API instead).
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ── Brand / Logo ── */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          aria-label="Yojsetu home"
        >
          {/* Colour-block icon — orange (Tiranga saffron) + blue (Tiranga navy) */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-blue-800 flex items-center justify-center shadow">
            <span className="text-white font-bold text-sm select-none">Y</span>
          </div>
          <span className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors duration-200">
            Yoj<span className="text-orange-500">setu</span>
          </span>
        </Link>

        {/* ── Nav links ── */}
        <ul className="flex items-center gap-1 list-none m-0 p-0">
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/schemes"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              Schemes
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              Login
            </NavLink>
          </li>
          <li>
            {/* Register is styled as a filled button to make it stand out (primary CTA) */}
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 shadow-sm ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow'
                }`
              }
            >
              Register
            </NavLink>
          </li>
        </ul>

      </nav>
    </header>
  );
}
