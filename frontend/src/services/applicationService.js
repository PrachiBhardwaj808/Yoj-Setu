/**
 * applicationService.js
 * Mock application management.
 * FUTURE: Replace with real API calls to /applications/*
 */
import { mockApplications } from '@/data/mockApplications';

let _applications = [...mockApplications];

export async function getApplications() {
  await new Promise(r => setTimeout(r, 600));
  return _applications;
}

export async function getApplicationById(id) {
  await new Promise(r => setTimeout(r, 400));
  return _applications.find(a => a.id === id) ?? null;
}

export async function createApplication(schemeId, schemeName, benefitAmount) {
  await new Promise(r => setTimeout(r, 500));
  const newApp = {
    id: `app_${Date.now()}`,
    schemeId,
    schemeName,
    category: 'General',
    status: 'submitted',
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    referenceNo: `REF-${Date.now()}`,
    benefitAmount,
    notes: 'Application submitted successfully.',
  };
  _applications = [newApp, ..._applications];
  return newApp;
}
