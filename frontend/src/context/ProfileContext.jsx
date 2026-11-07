import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { EMPTY_PROFILE, calculateProfileCompletion } from '../utils/profileUtils';
import {
  getProfileStorageKey,
  getStorage,
  PROFILE_UPDATED_EVENT,
  isValidUserId
} from '../utils/storage';

export { EMPTY_PROFILE, calculateProfileCompletion, PROFILE_UPDATED_EVENT };

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [profile, setProfile] = useState(() => {
    if (!isValidUserId(userId)) return { ...EMPTY_PROFILE };
    const storageKey = getProfileStorageKey(userId);
    const storage = getStorage();
    if (storage && storageKey) {
      try {
        const saved = storage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.profile ? { ...EMPTY_PROFILE, ...parsed.profile } : { ...EMPTY_PROFILE };
        }
      } catch (err) {
        console.warn(`[ProfileContext] Failed to load initial profile for user ${userId}:`, err);
      }
    }
    return { ...EMPTY_PROFILE };
  });

  const [onboardingStep, setOnboardingStep] = useState(() => {
    if (!isValidUserId(userId)) return 1;
    const storageKey = getProfileStorageKey(userId);
    const storage = getStorage();
    if (storage && storageKey) {
      try {
        const saved = storage.getItem(storageKey);
        if (saved) {
          return JSON.parse(saved).step ?? 1;
        }
      } catch {
        return 1;
      }
    }
    return 1;
  });

  const profileRef = useRef(profile);
  const stepRef = useRef(onboardingStep);
  const userIdRef = useRef(userId);

  // Keep refs synchronized with active state
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    stepRef.current = onboardingStep;
  }, [onboardingStep]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const loadProfileForUser = useCallback((targetUserId) => {
    if (!isValidUserId(targetUserId)) {
      setProfile({ ...EMPTY_PROFILE });
      setOnboardingStep(1);
      profileRef.current = { ...EMPTY_PROFILE };
      stepRef.current = 1;
      return;
    }

    const storageKey = getProfileStorageKey(targetUserId);
    const storage = getStorage();
    if (storage && storageKey) {
      try {
        const saved = storage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          const loadedProfile = parsed.profile ? { ...EMPTY_PROFILE, ...parsed.profile } : { ...EMPTY_PROFILE };
          const loadedStep = parsed.step ?? 1;
          setProfile(loadedProfile);
          setOnboardingStep(loadedStep);
          profileRef.current = loadedProfile;
          stepRef.current = loadedStep;
          return;
        }
      } catch (err) {
        console.warn(`[ProfileContext] Error parsing profile for user ${targetUserId}:`, err);
      }
    }

    setProfile({ ...EMPTY_PROFILE });
    setOnboardingStep(1);
    profileRef.current = { ...EMPTY_PROFILE };
    stepRef.current = 1;
  }, []);

  // Hydrate whenever active authenticated user changes (login, logout, account switch, refresh)
  useEffect(() => {
    loadProfileForUser(userId);
  }, [userId, loadProfileForUser]);

  // Synchronize across cross-tab storage events and same-tab custom events
  useEffect(() => {
    const activeKey = getProfileStorageKey(userId);

    // Cross-tab synchronization (native browser storage event)
    const handleStorage = (e) => {
      if (activeKey && (!e.key || e.key === activeKey)) {
        loadProfileForUser(userId);
      }
    };

    // Same-tab synchronization (custom event dispatched by profileService)
    const handleSameTabUpdate = (e) => {
      if (userId && e.detail?.userId === userId) {
        if (e.detail?.profile) {
          const updated = { ...EMPTY_PROFILE, ...e.detail.profile };
          const step = e.detail.step ?? stepRef.current;
          setProfile(updated);
          setOnboardingStep(step);
          profileRef.current = updated;
          stepRef.current = step;
        } else {
          loadProfileForUser(userId);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
      window.addEventListener(PROFILE_UPDATED_EVENT, handleSameTabUpdate);
      return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(PROFILE_UPDATED_EVENT, handleSameTabUpdate);
      };
    }
  }, [userId, loadProfileForUser]);

  const persist = useCallback((updatedProfile, step) => {
    const activeUserId = userIdRef.current;
    if (!isValidUserId(activeUserId)) {
      return;
    }

    const storageKey = getProfileStorageKey(activeUserId);
    if (!storageKey) return;

    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(storageKey, JSON.stringify({ profile: updatedProfile, step }));
      } catch (err) {
        console.warn(`[ProfileContext] Failed to persist profile for user ${activeUserId}:`, err);
      }
    }
  }, []);

  const updateProfile = useCallback((changes) => {
    setProfile(prev => {
      const updated = { ...prev, ...changes };
      profileRef.current = updated;
      persist(updated, stepRef.current);
      return updated;
    });
  }, [persist]);

  const saveStep = useCallback((step) => {
    setOnboardingStep(step);
    stepRef.current = step;
    persist(profileRef.current, step);
  }, [persist]);

  const clearProfile = useCallback(() => {
    const activeUserId = userIdRef.current;
    setProfile({ ...EMPTY_PROFILE });
    setOnboardingStep(1);
    profileRef.current = { ...EMPTY_PROFILE };
    stepRef.current = 1;

    if (isValidUserId(activeUserId)) {
      const storageKey = getProfileStorageKey(activeUserId);
      const storage = getStorage();
      if (storage && storageKey) {
        try {
          storage.removeItem(storageKey);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Calculate completion percentage based on answered fields
  const completionPercent = calculateProfileCompletion(profile);

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
