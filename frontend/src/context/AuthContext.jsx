import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import { USER_KEY, TOKEN_KEY, getStorage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storage = getStorage();
    if (!storage) return null;
    try {
      const savedUser = storage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const storage = getStorage();
    if (!storage) return null;
    try {
      return storage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Hydrate auth state on mount and verify session
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storage = getStorage();
      if (!storage) {
        if (isMounted) setLoading(false);
        return;
      }

      const savedToken = storage.getItem(TOKEN_KEY);
      const savedUser = storage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        try {
          // Verify token validity with backend asynchronously
          const freshUser = await authService.getCurrentUser();
          if (isMounted) {
            setUser(freshUser);
            storage.setItem(USER_KEY, JSON.stringify(freshUser));
          }
        } catch (err) {
          // Token expired or invalid
          console.warn("Session expired or invalid:", err);
          if (isMounted) {
            storage.removeItem(TOKEN_KEY);
            storage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } else {
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      }

      if (isMounted) setLoading(false);
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveSession = useCallback((access_token, user_data) => {
    const storage = getStorage();
    setToken(access_token);
    setUser(user_data);
    if (storage) {
      storage.setItem(TOKEN_KEY, access_token);
      storage.setItem(USER_KEY, JSON.stringify(user_data));
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    try {
      const data = await authService.loginUser({ identifier, password });
      saveSession(data.access_token, data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to sign in. Please check your credentials.';
      throw new Error(message);
    }
  }, [saveSession]);

  const loginWithOTP = useCallback(async (phone, otp) => {
    try {
      const data = await authService.verifyLoginOTP(phone, otp);
      saveSession(data.access_token, data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.detail || 'Invalid or expired OTP. Please try again.';
      throw new Error(message);
    }
  }, [saveSession]);

  const register = useCallback(async (registrationData) => {
    try {
      const data = await authService.registerUser(registrationData);
      saveSession(data.access_token, data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to complete registration.';
      throw new Error(message);
    }
  }, [saveSession]);

  const logout = useCallback(() => {
    const storage = getStorage();
    setToken(null);
    setUser(null);
    if (storage) {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
    }
  }, []);

  const markOnboardingComplete = useCallback(() => {
    const storage = getStorage();
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, onboardingComplete: true };
      if (storage) {
        storage.setItem(USER_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const storage = getStorage();
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      if (storage) {
        storage.setItem(USER_KEY, JSON.stringify(freshUser));
      }
      return freshUser;
    } catch {
      return null;
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    loginWithOTP,
    register,
    logout,
    markOnboardingComplete,
    refreshUser,
    requestRegisterOTP: authService.requestRegisterOTP,
    verifyRegisterOTP: authService.verifyRegisterOTP,
    requestLoginOTP: authService.requestLoginOTP,
    requestForgotPasswordOTP: authService.requestForgotPasswordOTP,
    verifyForgotPasswordOTP: authService.verifyForgotPasswordOTP,
    resetPassword: authService.resetPassword,
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
