/**
 * applicationService.js
 *
 * Client application management service with multi-user isolation.
 * Persists applications to user-specific storage keys (yojsetu_user_applications_{userId}).
 * Never accesses global or other users' application storage.
 */
import api from './api.js';
import {
  getApplicationsStorageKey,
  getCurrentUserId,
  getStorage,
  APPLICATIONS_UPDATED_EVENT
} from '../utils/storage.js';

export { APPLICATIONS_UPDATED_EVENT };

function getStoredApplications(userId) {
  const activeUserId = userId ?? getCurrentUserId();
  if (!activeUserId) return [];

  const storageKey = getApplicationsStorageKey(activeUserId);
  if (!storageKey) return [];

  const storage = getStorage();
  if (!storage) return [];

  try {
    const saved = storage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[applicationService] Failed to parse applications for user ${activeUserId}:`, err);
  }

  return [];
}

function persistApplications(apps, userId) {
  const activeUserId = userId ?? getCurrentUserId();
  if (!activeUserId) return;

  const storageKey = getApplicationsStorageKey(activeUserId);
  if (!storageKey) return;

  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(storageKey, JSON.stringify(apps));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(APPLICATIONS_UPDATED_EVENT, {
        detail: { userId: activeUserId }
      }));
    }
  } catch (err) {
    console.warn(`[applicationService] Failed to persist applications for user ${activeUserId}:`, err);
  }
}

export async function getApplications(userId) {
  const activeUserId = userId ?? getCurrentUserId();
  if (!activeUserId) {
    return [];
  }

  // 1. Attempt backend API fetch
  try {
    const response = await api.get('/applications');
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch {
    // Expected before persistent backend applications table is mounted
  }

  // 2. Read from user-specific isolated storage key
  return getStoredApplications(activeUserId);
}

export async function getApplicationById(id, userId) {
  const activeUserId = userId ?? getCurrentUserId();
  if (!activeUserId) return null;

  try {
    const response = await api.get(`/applications/${id}`);
    if (response.data) return response.data;
  } catch {
    // Fall back to local user storage
  }

  const apps = getStoredApplications(activeUserId);
  return apps.find((a) => a.id === id) ?? null;
}

export async function createApplication(schemeId, schemeName, benefitAmount, userId) {
  const activeUserId = userId ?? getCurrentUserId();
  if (!activeUserId) {
    throw new Error('Cannot create application: No authenticated user session.');
  }

  const storageKey = getApplicationsStorageKey(activeUserId);
  if (!storageKey) {
    throw new Error(`Cannot create application: Invalid user ID "${activeUserId}".`);
  }

  const newApp = {
    id: `app_${Date.now()}`,
    userId: activeUserId,
    schemeId,
    schemeName,
    category: 'General',
    status: 'submitted',
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    referenceNo: `YOJ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    benefitAmount: benefitAmount || 'Standard Grant / Subsidy',
    notes: 'Application submitted successfully. Verification in progress.',
  };

  try {
    const response = await api.post('/applications', newApp);
    if (response.data) return response.data;
  } catch {
    // Save locally under user-specific storage key
    const current = getStoredApplications(activeUserId);
    const updated = [newApp, ...current];
    persistApplications(updated, activeUserId);
  }

  return newApp;
}

export async function clearUserApplications(userId) {
  const activeUserId = userId ?? getCurrentUserId();
  if (!activeUserId) return;

  const storageKey = getApplicationsStorageKey(activeUserId);
  if (!storageKey) return;

  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(storageKey);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(APPLICATIONS_UPDATED_EVENT, {
          detail: { userId: activeUserId }
        }));
      }
    } catch (err) {
      console.warn(`[applicationService] Failed to clear applications for user ${activeUserId}:`, err);
    }
  }
}
