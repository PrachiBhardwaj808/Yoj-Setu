import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'yojsetu_token';
const USER_KEY = 'yojsetu_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate auth state on mount
  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setToken(savedToken);
        try {
          setUser(JSON.parse(savedUser));
          // Verify token validity with backend asynchronously
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        } catch (err) {
          // Token expired or invalid
          console.warn("Session expired:", err);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const saveSession = (access_token, user_data) => {
    setToken(access_token);
    setUser(user_data);
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user_data));
  };

  const login = useCallback(async (identifier, password) => {
    try {
      const data = await authService.loginUser({ identifier, password });
      saveSession(data.access_token, data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to sign in. Please check your credentials.';
      throw new Error(message);
    }
  }, []);

  const loginWithOTP = useCallback(async (phone, otp) => {
    try {
      const data = await authService.verifyLoginOTP(phone, otp);
      saveSession(data.access_token, data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.detail || 'Invalid or expired OTP. Please try again.';
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (registrationData) => {
    try {
      const data = await authService.registerUser(registrationData);
      saveSession(data.access_token, data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to complete registration.';
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const markOnboardingComplete = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, onboardingComplete: true };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      return freshUser;
    } catch (err) {
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
