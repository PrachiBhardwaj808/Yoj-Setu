/**
 * profileService.js
 *
 * Citizen profile management service with multi-user isolation.
 * Persists profile data under user-specific storage keys (yojsetu_profile_{userId})
 * and synchronizes with ProfileContext.
 * Never accesses global or other users' storage keys.
 */
import { EMPTY_PROFILE } from '../utils/profileUtils.js';
import api from './api.js';
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

  // Attempt backend retrieval if authenticated
  try {
    const storage = getStorage();
    const token = storage?.getItem?.('yojsetu_token');
    if (token) {
      const response = await api.get('/profile/me');
      if (
        response?.data &&
        !Array.isArray(response.data) &&
        typeof response.data === 'object' &&
        (response.data.full_name !== undefined || response.data.state !== undefined)
      ) {
        const backendProfile = { ...EMPTY_PROFILE, ...response.data };
        const storageKey = getProfileStorageKey(activeUserId);
        if (storage && storageKey) {
          const saved = storage.getItem(storageKey);
          const step = saved ? JSON.parse(saved).step ?? 1 : 1;
          storage.setItem(storageKey, JSON.stringify({ profile: backendProfile, step }));
        }
        return backendProfile;
      }
    }
  } catch (err) {
    // Offline / fallback to local cache
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

  const current = await getProfile(activeUserId);
  const updated = { ...current, ...updatedData };
  await saveProfileProgress(updated, undefined, activeUserId);
  return updated;
};

export const saveProfileProgress = async (updatedData, step, userId) => {
  const activeUserId = userId ?? getCurrentUserId();
  if (!isValidUserId(activeUserId)) {
    throw new Error('Cannot save onboarding progress: No authenticated user session.');
  }

  const storageKey = getProfileStorageKey(activeUserId);
  if (!storageKey) {
    throw new Error(`Cannot save onboarding progress: Invalid user ID "${activeUserId}".`);
  }

  const storage = getStorage();
  if (!storage) throw new Error('Profile storage is unavailable.');

  const saved = storage.getItem(storageKey);
  let savedData = {};
  if (saved) {
    savedData = JSON.parse(saved);
    if (!savedData || typeof savedData !== 'object' || Array.isArray(savedData)) {
      throw new Error(`Cannot save onboarding progress: Invalid saved data for user "${activeUserId}".`);
    }
    if (savedData.profile !== undefined &&
      (!savedData.profile || typeof savedData.profile !== 'object' || Array.isArray(savedData.profile))) {
      throw new Error(`Cannot save onboarding progress: Invalid saved profile for user "${activeUserId}".`);
    }
  }

  const savedStep = savedData.step ?? 1;
  const resolvedStep = step === undefined ? savedStep : step;
  if (!Number.isInteger(resolvedStep) || resolvedStep < 1 || resolvedStep > 7) {
    throw new Error(`Cannot save onboarding progress: Invalid step "${resolvedStep}".`);
  }

  const profile = {
    ...EMPTY_PROFILE,
    ...(savedData.profile || {}),
    ...updatedData,
  };
  storage.setItem(storageKey, JSON.stringify({ profile, step: resolvedStep }));

  // Synchronize to backend database
  try {
    const token = storage?.getItem?.('yojsetu_token');
    if (token) {
      await api.put('/profile/me', profile);
    }
  } catch (err) {
    // Persistent backend sync will retry on next session
  }

  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, {
      detail: { userId: activeUserId, profile, step: resolvedStep }
    }));
  }

  return { profile, step: resolvedStep };
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
