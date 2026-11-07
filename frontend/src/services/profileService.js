/**
 * profileService.js
 *
 * Citizen profile management service with multi-user isolation.
 * Persists profile data under user-specific storage keys (yojsetu_profile_{userId})
 * and synchronizes with ProfileContext and backend API endpoints.
 * Never accesses global or other users' storage keys.
 */
import api from './api.js';
import { EMPTY_PROFILE } from '../utils/profileUtils.js';
import {
  getProfileStorageKey,
  getCurrentUserId,
  getStorage,
  PROFILE_UPDATED_EVENT
} from '../utils/storage.js';

export { EMPTY_PROFILE, PROFILE_UPDATED_EVENT };

export const getProfile = async (userId) => {
  const activeUserId = userId ?? getCurrentUserId();
  if (!activeUserId) {
    return { ...EMPTY_PROFILE };
  }

  const storageKey = getProfileStorageKey(activeUserId);
  if (!storageKey) {
    return { ...EMPTY_PROFILE };
  }

  // 1. Attempt backend API fetch
  try {
    const res = await api.get('/profile');
    if (res.data) return res.data;
  } catch {
    // Backend profile endpoint may not be mounted yet; fall back to user storage
  }

  // 2. Read from user-specific isolated storage key
  const storage = getStorage();
  if (storage) {
    try {
      const saved = storage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.profile ? { ...EMPTY_PROFILE, ...parsed.profile } : { ...EMPTY_PROFILE };
      }
    } catch (err) {
      console.warn(`[profileService] Failed to parse profile for user ${activeUserId}:`, err);
    }
  }

  return { ...EMPTY_PROFILE };
};

export const updateProfile = async (updatedData, userId) => {
  const activeUserId = userId ?? getCurrentUserId();
  if (!activeUserId) {
    throw new Error('Cannot update profile: No authenticated user session.');
  }

  const storageKey = getProfileStorageKey(activeUserId);
  if (!storageKey) {
    throw new Error(`Cannot update profile: Invalid user ID "${activeUserId}".`);
  }

  const current = await getProfile(activeUserId);
  const updated = { ...current, ...updatedData };

  // 1. Attempt backend update
  try {
    await api.put('/profile', updated);
  } catch {
    // Backend profile endpoint may not be mounted yet
  }

  // 2. Persist to user-specific isolated storage key
  const storage = getStorage();
  let step = 1;
  if (storage) {
    try {
      const saved = storage.getItem(storageKey);
      if (saved) {
        step = JSON.parse(saved).step ?? 1;
      }
      storage.setItem(storageKey, JSON.stringify({ profile: updated, step }));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, {
          detail: { userId: activeUserId, profile: updated, step }
        }));
      }
    } catch (err) {
      console.warn(`[profileService] Failed to persist profile for user ${activeUserId}:`, err);
    }
  }

  return updated;
};

export const saveProfile = updateProfile;

export const clearProfile = async (userId) => {
  const activeUserId = userId ?? getCurrentUserId();
  if (!activeUserId) return { ...EMPTY_PROFILE };

  const storageKey = getProfileStorageKey(activeUserId);
  if (!storageKey) return { ...EMPTY_PROFILE };

  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(storageKey);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, {
          detail: { userId: activeUserId, profile: null, step: 1 }
        }));
      }
    } catch (err) {
      console.warn(`[profileService] Failed to clear profile for user ${activeUserId}:`, err);
    }
  }

  return { ...EMPTY_PROFILE };
};
