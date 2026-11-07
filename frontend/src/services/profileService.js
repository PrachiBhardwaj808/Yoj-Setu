/**
 * profileService.js
 *
 * Citizen profile management service.
 * Consolidates profile data ownership by synchronizing with ProfileContext's
 * persistent localStorage key ('yojsetu_profile') and backend API endpoints.
 * Field schema strictly follows ProfileContext's EMPTY_PROFILE (snake_case).
 */
import api from './api';
import { EMPTY_PROFILE, PROFILE_UPDATED_EVENT } from '../context/ProfileContext';

const STORAGE_KEY = 'yojsetu_profile';

export const getProfile = async () => {
  // 1. Attempt backend API fetch
  try {
    const res = await api.get('/profile');
    if (res.data) return res.data;
  } catch {
    // Backend profile endpoint may not be mounted yet; fall back to local storage
  }

  // 2. Read from single source of truth storage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.profile ? { ...EMPTY_PROFILE, ...parsed.profile } : { ...EMPTY_PROFILE };
      }
    }
  } catch (err) {
    console.warn('[profileService] Failed to parse local profile:', err);
  }

  return { ...EMPTY_PROFILE };
};

export const updateProfile = async (updatedData) => {
  const current = await getProfile();
  const updated = { ...current, ...updatedData };

  // 1. Attempt backend update
  try {
    await api.put('/profile', updated);
  } catch {
    // Backend profile endpoint may not be mounted yet
  }

  // 2. Persist to single source of truth storage
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const step = saved ? (JSON.parse(saved).step ?? 1) : 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: updated, step }));
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: { profile: updated, step } }));
    }
  } catch (err) {
    console.warn('[profileService] Failed to persist profile locally:', err);
  }

  return updated;
};

export const saveProfile = updateProfile;

export const clearProfile = async () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: null }));
    }
  } catch (err) {
    console.warn('[profileService] Failed to clear local profile:', err);
  }
  return { ...EMPTY_PROFILE };
};
