/**
 * applicationService.js
 *
 * Client application management service.
 * In Phase 1, persists applications to localStorage with initial mock seeds.
 * In Phase 2, this synchronizes with backend persistent applications APIs.
 */
import api from './api';
import { mockApplications } from '@/data/mockApplications';

const STORAGE_KEY = 'yojsetu_user_applications';

function getStoredApplications() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[applicationService] Failed to parse local applications cache:', err);
  }
  return [...mockApplications];
}

function persistApplications(apps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (err) {
    console.warn('[applicationService] Failed to persist applications:', err);
  }
}

export async function getApplications() {
  // Attempt backend API if available
  try {
    const response = await api.get('/applications');
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch {
    // Expected in Phase 1 before persistent backend table is mounted in Phase 2
  }

  return getStoredApplications();
}

export async function getApplicationById(id) {
  try {
    const response = await api.get(`/applications/${id}`);
    if (response.data) return response.data;
  } catch {
    // Fall back to local storage
  }

  const apps = getStoredApplications();
  return apps.find(a => a.id === id) ?? null;
}

export async function createApplication(schemeId, schemeName, benefitAmount) {
  const newApp = {
    id: `app_${Date.now()}`,
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
    // Save locally
    const current = getStoredApplications();
    const updated = [newApp, ...current];
    persistApplications(updated);
  }

  return newApp;
}
