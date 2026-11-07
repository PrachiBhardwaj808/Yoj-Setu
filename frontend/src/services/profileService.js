/**
 * profileService.js
 *
 * Citizen profile management service with multi-user isolation.
 * Persists profile data under user-specific storage keys (yojsetu_profile_{userId})
 * and synchronizes with ProfileContext.
 * Never accesses global or other users' storage keys.
 */
import { EMPTY_PROFILE } from '../utils/profileUtils.js';
import {
  getProfileStorageKey,
  getCurrentUserId,
  getStorage,
  PROFILE_UPDATED_EVENT,
  isValidUserId
} from '../utils/storage.js';

export { EMPTY_PROFILE, PROFILE_UPDATED_EVENT };

export const getProfile = async (userId) => {
  const activeUserId = userId ?? getCurrentUserId();
  if (!isValidUserId(activeUserId)) {
    return { ...EMPTY_PROFILE };
  }

  const storageKey = getProfileStorageKey(activeUserId);
  if (!storageKey) {
    return { ...EMPTY_PROFILE };
  }

  const storage = getStorage();
  if (!storage) throw new Error('Profile storage is unavailable.');

  const saved = storage.getItem(storageKey);
  if (!saved) return { ...EMPTY_PROFILE };
  const parsed = JSON.parse(saved);
  return parsed?.profile ? { ...EMPTY_PROFILE, ...parsed.profile } : { ...EMPTY_PROFILE };
};

export const updateProfile = async (updatedData, userId) => {
  const activeUserId = userId ?? getCurrentUserId();
  if (!isValidUserId(activeUserId)) {
    throw new Error('Cannot update profile: No authenticated user session.');
  }

  const storageKey = getProfileStorageKey(activeUserId);
  if (!storageKey) {
    throw new Error(`Cannot update profile: Invalid user ID "${activeUserId}".`);
  }

  const current = await getProfile(activeUserId);
  const updated = { ...current, ...updatedData };

  const storage = getStorage();
  if (!storage) throw new Error('Profile storage is unavailable.');
  const saved = storage.getItem(storageKey);
  const step = saved ? JSON.parse(saved).step ?? 1 : 1;
  storage.setItem(storageKey, JSON.stringify({ profile: updated, step }));

  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, {
      detail: { userId: activeUserId, profile: updated, step }
    }));
  }

  return updated;
};

export const saveProfile = updateProfile;

export const clearProfile = async (userId) => {
  const activeUserId = userId ?? getCurrentUserId();
  if (!isValidUserId(activeUserId)) return { ...EMPTY_PROFILE };

  const storageKey = getProfileStorageKey(activeUserId);
  if (!storageKey) return { ...EMPTY_PROFILE };

  const storage = getStorage();
  if (!storage) throw new Error('Profile storage is unavailable.');
  storage.removeItem(storageKey);
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, {
      detail: { userId: activeUserId, profile: null, step: 1 }
    }));
  }

  return { ...EMPTY_PROFILE };
};
