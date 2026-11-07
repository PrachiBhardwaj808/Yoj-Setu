/**
 * storage.js
 *
 * Centralized, multi-user storage key management and validation utility.
 * Guarantees strict user isolation:
 * - Validates user IDs before generating storage keys.
 * - Never returns global storage keys for authenticated users.
 * - Never allows undefined, null, or invalid user IDs to create shared keys.
 * - Legacy storage keys ('yojsetu_profile', 'yojsetu_user_applications') remain isolated.
 */

export const USER_KEY = 'yojsetu_user';
export const TOKEN_KEY = 'yojsetu_token';

export const LEGACY_STORAGE_KEYS = Object.freeze({
  PROFILE: 'yojsetu_profile',
  APPLICATIONS: 'yojsetu_user_applications',
});

export const PROFILE_UPDATED_EVENT = 'yojsetu:profile-updated';
export const APPLICATIONS_UPDATED_EVENT = 'yojsetu:applications-updated';

/**
 * Validates a user ID.
 * Accepts positive integers and non-empty strings.
 * Rejects null, undefined, empty strings, NaN, Infinity, booleans, and reserved strings.
 */
export function isValidUserId(userId) {
  if (userId === null || userId === undefined) return false;

  if (typeof userId === 'number') {
    return !Number.isNaN(userId) && Number.isFinite(userId) && userId > 0;
  }

  if (typeof userId === 'string') {
    const trimmed = userId.trim();
    if (!trimmed) return false;
    if (trimmed === 'null' || trimmed === 'undefined' || trimmed === 'NaN' || trimmed === '[object Object]') {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Generates the user-scoped profile storage key.
 * Format: yojsetu_profile_{userId}
 * Returns null if userId is invalid. Never falls back to a global key.
 */
export function getProfileStorageKey(userId) {
  if (!isValidUserId(userId)) {
    return null;
  }
  return `yojsetu_profile_${String(userId).trim()}`;
}

/**
 * Generates the user-scoped applications storage key.
 * Format: yojsetu_user_applications_{userId}
 * Returns null if userId is invalid. Never falls back to a global key.
 */
export function getApplicationsStorageKey(userId) {
  if (!isValidUserId(userId)) {
    return null;
  }
  return `yojsetu_user_applications_${String(userId).trim()}`;
}

/**
 * Safely resolves the storage provider across browser and Node test environments.
 */
export function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return null;
}

/**
 * Reads and returns the current authenticated user ID from active session storage.
 * Returns null if no valid authenticated user is found.
 */
export function getCurrentUserId() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const saved = storage.getItem(USER_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed && isValidUserId(parsed.id)) {
      return parsed.id;
    }
  } catch (err) {
    console.warn('[storage] Failed to parse current user from storage:', err);
  }
  return null;
}

/**
 * Reads and returns the current authenticated user object from active session storage.
 */
export function getCurrentUser() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const saved = storage.getItem(USER_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (err) {
    console.warn('[storage] Failed to parse user session:', err);
  }
  return null;
}

