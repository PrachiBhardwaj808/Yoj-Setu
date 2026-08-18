import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// ─────────────────────────────────────────────────────────────────────────────
// AppLayout.jsx — the page shell that wraps every route
//
// HOW IT WORKS WITH REACT ROUTER:
//   In App.jsx we configure routes like this (simplified):
//
//     { path: '/', element: <AppLayout />, children: [
//         { index: true,      element: <LandingPage /> },
//         { path: 'register', element: <PhoneVerificationPage /> },
//     ]}
//
//   When the browser is at '/', React Router renders:
//     <AppLayout>         ← our shell
//       <LandingPage />   ← fills the <Outlet /> slot
//     </AppLayout>
//
//   When the browser is at '/register', React Router renders:
//     <AppLayout>                   ← same shell, same Navbar, same Footer
//       <PhoneVerificationPage />   ← fills the <Outlet /> slot
//     </AppLayout>
//
//   <Outlet /> is the magic slot — it renders whichever child route is active.
//   We write Navbar and Footer exactly once. Every page gets them automatically.
//
// THE FLEX COLUMN TRICK:
//   min-h-screen on the outer div + flex-col makes the footer stick to the
//   bottom even when a page has very little content. The <main> has flex-1,
//   which tells it to grow and fill any leftover vertical space.
// ─────────────────────────────────────────────────────────────────────────────

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* flex-1 makes <main> grow to fill remaining height → footer stays at bottom */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
