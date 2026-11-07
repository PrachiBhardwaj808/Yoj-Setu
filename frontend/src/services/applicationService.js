/**
 * Application tracking is a local, user-scoped record. It does not submit
 * applications to government portals or receive government status updates.
 */
import { getAllSchemes } from './schemeService.js';
import {
  APPLICATIONS_UPDATED_EVENT,
  getApplicationsStorageKey,
  getCurrentUserId,
  getStorage,
  isValidUserId,
} from '../utils/storage.js';
import { findSchemeByReference } from '../utils/schemeUtils.js';

export { APPLICATIONS_UPDATED_EVENT };

export const TRACKING_STATUSES = Object.freeze(['planning', 'applied_by_user']);

function activeUser(userId) {
  const resolvedId = userId ?? getCurrentUserId();
  if (!isValidUserId(resolvedId)) {
    throw new Error('Application tracking requires an authenticated user.');
  }
  return resolvedId;
}

function readStoredApplications(userId) {
  const storage = getStorage();
  const key = getApplicationsStorageKey(userId);
  if (!storage || !key) throw new Error('Application tracking storage is unavailable.');

  const raw = storage.getItem(key);
  if (!raw) return [];
  const records = JSON.parse(raw);
  if (!Array.isArray(records)) {
    throw new Error(`Invalid application list stored for user ${userId}.`);
  }

  return records.filter((record) =>
    record &&
    typeof record === 'object' &&
    (record.userId === undefined || String(record.userId) === String(userId))
  );
}

function writeStoredApplications(records, userId) {
  const storage = getStorage();
  const key = getApplicationsStorageKey(userId);
  if (!storage || !key) {
    throw new Error('Application tracking storage is unavailable.');
  }

  storage.setItem(key, JSON.stringify(records));
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(APPLICATIONS_UPDATED_EVENT, {
      detail: { userId },
    }));
  }
}

async function getCanonicalScheme(reference) {
  if (reference === null || reference === undefined || String(reference).trim() === '') {
    throw new Error('A valid scheme reference is required to track an application.');
  }
  const schemes = await getAllSchemes();
  const scheme = findSchemeByReference(reference, schemes);
  if (!scheme?.external_scheme_id || !scheme.name) {
    throw new Error(`Scheme "${reference}" is not in the current catalogue.`);
  }
  return scheme;
}

export async function getApplications(userId) {
  const ownerId = userId ?? getCurrentUserId();
  if (!isValidUserId(ownerId)) return [];
  const schemes = await getAllSchemes();
  return readStoredApplications(ownerId)
    .map((application) => {
      const scheme = findSchemeByReference(
        application.external_scheme_id || application.schemeId,
        schemes
      );
      if (!scheme) return null;

      return {
        ...application,
        userId: ownerId,
        schemeId: scheme.external_scheme_id,
        external_scheme_id: scheme.external_scheme_id,
        schemeName: scheme.name,
        category: scheme.category || 'General',
        benefitAmount: scheme.benefitAmount || scheme.benefits || '',
        status: TRACKING_STATUSES.includes(application.status) ? application.status : 'unverified',
        trackingType: 'local',
      };
    })
    .filter(Boolean);
}

export async function getApplicationById(id, userId) {
  const ownerId = userId ?? getCurrentUserId();
  if (!isValidUserId(ownerId)) return null;
  const applications = await getApplications(ownerId);
  return applications.find((application) => String(application.id) === String(id)) ?? null;
}

export async function createApplication(schemeReference, userId) {
  const ownerId = activeUser(userId);
  const scheme = await getCanonicalScheme(schemeReference);
  const records = readStoredApplications(ownerId);
  const existing = records.find((record) =>
    record.external_scheme_id === scheme.external_scheme_id ||
    record.schemeId === scheme.external_scheme_id
  );
  if (existing) {
    return {
      ...existing,
      schemeId: scheme.external_scheme_id,
      external_scheme_id: scheme.external_scheme_id,
      schemeName: scheme.name,
      category: scheme.category || 'General',
      benefitAmount: scheme.benefitAmount || scheme.benefits || '',
      status: TRACKING_STATUSES.includes(existing.status) ? existing.status : 'unverified',
      trackingType: 'local',
    };
  }

  const now = new Date().toISOString();
  const application = {
    id: `local_${globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`,
    userId: ownerId,
    schemeId: scheme.external_scheme_id,
    external_scheme_id: scheme.external_scheme_id,
    schemeName: scheme.name,
    category: scheme.category || 'General',
    benefitAmount: scheme.benefitAmount || scheme.benefits || '',
    status: 'planning',
    trackingType: 'local',
    trackedAt: now,
    updatedAt: now,
  };

  writeStoredApplications([application, ...records], ownerId);
  return application;
}

export async function updateApplicationStatus(id, status, userId) {
  const ownerId = activeUser(userId);
  if (!TRACKING_STATUSES.includes(status)) {
    throw new Error(`Unsupported local tracking status "${status}".`);
  }

  const records = readStoredApplications(ownerId);
  const index = records.findIndex((record) => String(record.id) === String(id));
  if (index < 0) {
    throw new Error('The tracked application was not found for this user.');
  }

  const updated = {
    ...records[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  records[index] = updated;
  writeStoredApplications(records, ownerId);
  return updated;
}

export function clearUserApplications(userId) {
  const ownerId = activeUser(userId);
  const storage = getStorage();
  const key = getApplicationsStorageKey(ownerId);
  if (!storage || !key) throw new Error('Application tracking storage is unavailable.');

  storage.removeItem(key);
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(APPLICATIONS_UPDATED_EVENT, {
      detail: { userId: ownerId },
    }));
  }
}
