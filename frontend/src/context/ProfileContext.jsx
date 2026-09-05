/**
 * ProfileContext.jsx
 *
 * Manages the 19-field onboarding profile.
 * Persists to localStorage under 'yojsetu_profile'.
 *
 * FUTURE: Replace updateProfile() body with:
 *   await profileService.updateProfile(updatedData);
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProfileContext = createContext(null);

const STORAGE_KEY = 'yojsetu_profile';

export const EMPTY_PROFILE = {
  full_name: '',
  date_of_birth: '',
  gender: '',
  state: '',
  district: '',
  city: '',
  rural_urban: '',
  occupation: '',
  employment_status: '',
  annual_household_income: '',
  social_category: '',
  disability_status: '',
  disability_percentage: '',
  minority_status: '',
  marital_status: '',
  family_size: '',
  children_count: '',
  senior_citizen_in_household: '',
  pregnant_woman_in_household: '',
  housing_status: '',
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [onboardingStep, setOnboardingStep] = useState(1); // persisted step for resume

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed.profile ?? EMPTY_PROFILE);
        setOnboardingStep(parsed.step ?? 1);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = useCallback((updatedProfile, step) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: updatedProfile, step }));
  }, []);

  /** Merge partial updates into profile (single-field or full object) */
  const updateProfile = useCallback((changes) => {
    setProfile(prev => {
      const updated = { ...prev, ...changes };
      persist(updated, onboardingStep);
      return updated;
    });
  }, [onboardingStep, persist]);

  /** Save current step so user can resume */
  const saveStep = useCallback((step) => {
    setOnboardingStep(step);
    persist(profile, step);
  }, [profile, persist]);

  /** Reset profile (e.g. on logout) */
  const clearProfile = useCallback(() => {
    setProfile(EMPTY_PROFILE);
    setOnboardingStep(1);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /** Completion % based on filled fields */
  const completionPercent = Math.round(
    (Object.values(profile).filter(v => v !== '' && v !== null && v !== undefined).length /
      Object.keys(EMPTY_PROFILE).length) * 100
  );

  const value = {
    profile,
    onboardingStep,
    completionPercent,
    updateProfile,
    saveStep,
    clearProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
