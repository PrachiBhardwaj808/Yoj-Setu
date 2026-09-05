/**
 * ProtectedRoute.jsx
 *
 * Two-layer guard:
 *  1. Not authenticated → /login
 *  2. Authenticated but onboarding not complete → /onboarding
 *     (skip this guard if the route itself is /onboarding)
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/common/StateComponents';

export default function ProtectedRoute({ children, requireOnboarding = true }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // While hydrating from localStorage, show a spinner
  if (loading) return <LoadingState message="Verifying session…" />;

  // Layer 1 — must be authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Layer 2 — must have completed onboarding (unless we're on the onboarding page itself)
  if (requireOnboarding && !user?.onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
