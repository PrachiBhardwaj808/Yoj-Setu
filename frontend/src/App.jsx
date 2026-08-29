import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import PhoneVerificationPage from './pages/auth/PhoneVerificationPage';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import SchemesListPage from "@/pages/schemes/SchemesListPage"
import SchemeDetailPage from "@/pages/schemes/SchemeDetailPage"

// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — the routing configuration for Yojsetu
// ─────────────────────────────────────────────────────────────────────────────

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
        path: 'verify-phone',  // matches '/verify-phone'
        element: <PhoneVerificationPage />,
      },
      {
        path: 'register',      // matches '/register'
        element: <RegisterPage />,
      },
      {
        path: 'login',         // matches '/login'
        element: <LoginPage />,
      },
      {
        path: 'schemes',
        element: <SchemesListPage />,
      },
      {
        path: 'schemes/:id',
        element: <SchemeDetailPage />,
      },
      {
        path: '*',             // catch-all route for 404
        element: <NotFoundPage />,
      },
    ],
  },
]);

// ── Root component ───────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}

