import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import PhoneVerificationPage from './pages/auth/PhoneVerificationPage';

// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — the routing configuration for Yojsetu
//
// HOW createBrowserRouter WORKS:
//   We give it a tree of route objects. Each object says:
//     { path: '/some-url', element: <WhatToRender /> }
//
//   "children" makes nested routes. Here, AppLayout is the parent of all
//   pages — it provides the Navbar + Footer shell. The child route's element
//   appears in AppLayout's <Outlet /> slot.
//
// ROUTE ANATOMY:
//   { path: '/',        element: <AppLayout />, children: [
//       { index: true,      element: <LandingPage /> },          → GET /
//       { path: 'register', element: <PhoneVerificationPage /> }, → GET /register
//       { path: 'login',    element: <LoginPlaceholder /> },      → GET /login (stub)
//       { path: 'schemes',  element: <SchemesPlaceholder /> },    → GET /schemes (stub)
//   ]}
//
//   'index: true' means "this child matches the parent's path exactly".
//   So '/' → LandingPage (not '/index' or anything else).
//
// WHY NOT <BrowserRouter> (the old way)?
//   createBrowserRouter is the recommended v6.4+ approach. It supports
//   data loading (loaders/actions) which we'll likely want later.
//   RouterProvider is how you mount it.
// ─────────────────────────────────────────────────────────────────────────────

// ── Placeholder elements for routes not yet built ────────────────────────────
// These prevent 404-style blank screens when someone navigates to /login or /schemes.
// Replace each with the real page component when it's built.

function LoginPlaceholder() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-5xl mb-4">🔑</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Login</h1>
      <p className="text-slate-500 text-sm">Login form — coming soon (separate task).</p>
    </div>
  );
}

function SchemesPlaceholder() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-5xl mb-4">📋</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Browse Schemes</h1>
      <p className="text-slate-500 text-sm">Scheme directory — coming soon (separate task).</p>
    </div>
  );
}

// ── Route tree ───────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    // AppLayout is the parent route. Its element renders on every child path.
    // The <Outlet /> inside AppLayout is where each child's element appears.
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,           // matches exactly '/'
        element: <LandingPage />,
      },
      {
        path: 'register',      // matches '/register'
        element: <PhoneVerificationPage />,
      },
      {
        path: 'login',         // matches '/login'
        element: <LoginPlaceholder />,
      },
      {
        path: 'schemes',       // matches '/schemes'
        element: <SchemesPlaceholder />,
      },
    ],
  },
]);

// ── Root component ───────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
