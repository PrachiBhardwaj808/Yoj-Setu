/**
 * AuthContext.jsx
 *
 * Exposes: user, isAuthenticated, loading, login(), logout()
 * Persists auth state to localStorage under key 'yojsetu_auth'.
 *
 * MOCK ONLY — replace login() body with:
 *   const data = await authService.loginUser({ phone, password });
 *   setUser(data.user);
 * when the FastAPI backend is ready.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'yojsetu_auth';

// ─── Mock credentials ───────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 'usr_001', name: 'Rahul Sharma', phone: '9876543210', password: 'pass123', email: 'rahul@example.com', role: 'citizen', onboardingComplete: false },
  { id: 'usr_002', name: 'Admin User',   phone: '9999999999', password: 'admin123', email: 'admin@yojsetu.in', role: 'admin',   onboardingComplete: true  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while hydrating from localStorage

  // Hydrate from localStorage on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * login(phone, password) → resolves with user object on success,
   *                          throws Error with message on failure.
   *
   * MOCK: Replace with real API call when backend is ready.
   */
  const login = useCallback(async (phone, password) => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    const found = MOCK_USERS.find(u => u.phone === phone && u.password === password);
    if (!found) throw new Error('Incorrect mobile number or password. Please try again.');

    const { password: _, ...safeUser } = found; // never store password
    setUser(safeUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    return safeUser;
  }, []);

  /**
   * logout() — clears auth state and localStorage.
   * Does NOT clear profile data (user may want to resume later).
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * markOnboardingComplete() — called after user finishes onboarding wizard.
   * Updates both state and localStorage without requiring a full re-login.
   */
  const markOnboardingComplete = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, onboardingComplete: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    markOnboardingComplete,
    setUser, // escape hatch for mock registration
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
