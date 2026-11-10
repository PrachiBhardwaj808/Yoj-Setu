import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_PROFILE,
  calculateProfileCompletion,
  getCompletedOnboardingSections,
} from '../utils/profileUtils.js';
import { getProfile, saveProfileProgress } from '../services/profileService.js';
import { getProfileStorageKey } from '../utils/storage.js';

function installStorage() {
  const records = new Map();
  const storage = {
    getItem: (key) => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, String(value)),
    removeItem: (key) => records.delete(key),
  };
  globalThis.localStorage = storage;
  globalThis.window = {
    localStorage: storage,
    dispatchEvent: () => true,
  };
  return records;
}

function completeProfile() {
  return {
    ...EMPTY_PROFILE,
    full_name: 'Fictional Test Citizen',
    date_of_birth: '1990-05-15',
    age: 36,
    gender: 'Prefer not to say',
    phone: '9000000001',
    state: 'Rajasthan',
    district: 'Jaipur',
    rural_urban: 'Urban',
    occupation: 'Agricultural worker',
    annual_household_income: '₹1–2.5 lakh',
    social_category: 'Prefer not to say',
    disability_status: 'No',
    bpl_status: 'Not sure',
    minority_status: 'No',
    marital_status: 'Prefer not to say',
    family_size: '1',
    children_count: '0',
    housing_status: 'Rented',
    has_aadhaar: 'Yes',
    has_bank_account: 'No',
    has_ration_card: 'Not sure',
    has_income_certificate: 'No',
    preferred_language: 'English',
    notification_preferences: 'In-app Only',
  };
}

test('Onboarding progress starts empty and partial sections are not complete', () => {
  assert.equal(calculateProfileCompletion(EMPTY_PROFILE), 0);
  assert.deepEqual(getCompletedOnboardingSections(EMPTY_PROFILE), Array(6).fill(false));

  const partialProfile = {
    ...EMPTY_PROFILE,
    full_name: 'Fictional Test Citizen',
    state: 'Rajasthan',
    occupation: 'Farmer',
    social_category: 'OBC',
    family_size: '3',
    has_aadhaar: 'Yes',
  };
  assert.deepEqual(getCompletedOnboardingSections(partialProfile), Array(6).fill(false));
  assert.ok(calculateProfileCompletion(partialProfile) > 0);
  assert.ok(calculateProfileCompletion(partialProfile) < 100);
});

test('Completed onboarding sections and profile percentage use answered fields', () => {
  const profile = completeProfile();
  assert.deepEqual(getCompletedOnboardingSections(profile), Array(6).fill(true));
  assert.equal(calculateProfileCompletion(profile), 100);

  const farmerWithMissingLandHolding = {
    ...profile,
    occupation: 'Farmer',
    land_ownership: 'Own land',
    land_holding: '',
  };
  assert.equal(getCompletedOnboardingSections(farmerWithMissingLandHolding)[2], false);

  const disabilityDetailsMissing = {
    ...profile,
    disability_status: 'Yes',
    disability_percentage: '',
  };
  assert.equal(getCompletedOnboardingSections(disabilityDetailsMissing)[3], false);
});

test('Save Later persistence saves latest values and step under the active user key', async () => {
  const records = installStorage();
  const firstSave = {
    ...EMPTY_PROFILE,
    full_name: 'Fictional Test Citizen',
    state: 'Rajasthan',
  };

  await saveProfileProgress(firstSave, 2, 101);
  const latestValues = { ...firstSave, district: 'Jaipur', block: 'Test Block' };
  await saveProfileProgress(latestValues, 2, 101);

  const key = getProfileStorageKey(101);
  const saved = JSON.parse(records.get(key));
  assert.equal(saved.profile.district, 'Jaipur');
  assert.equal(saved.profile.block, 'Test Block');
  assert.equal(saved.step, 2);
  assert.equal(saved.onboardingComplete, undefined);
  assert.equal((await getProfile(101)).block, 'Test Block');
  assert.equal(records.has(getProfileStorageKey(102)), false);
});

test('Onboarding progress survives user switching without cross-account data', async () => {
  const records = installStorage();
  await saveProfileProgress({ ...EMPTY_PROFILE, full_name: 'Fictional User A' }, 3, 101);
  await saveProfileProgress({ ...EMPTY_PROFILE, full_name: 'Fictional User B' }, 2, 102);

  assert.equal((await getProfile(101)).full_name, 'Fictional User A');
  assert.equal((await getProfile(102)).full_name, 'Fictional User B');
  assert.equal(JSON.parse(records.get(getProfileStorageKey(101))).step, 3);
  assert.equal(JSON.parse(records.get(getProfileStorageKey(102))).step, 2);
});

test('Missing session and malformed saved data fail safely without shared-key writes', async () => {
  const records = installStorage();
  await assert.rejects(saveProfileProgress({ full_name: 'No session' }, 1, null), /No authenticated user session/);
  assert.equal(records.size, 0);

  const key = getProfileStorageKey(101);
  records.set(key, '{malformed');
  await assert.rejects(saveProfileProgress({ full_name: 'Overwrite attempt' }, 2, 101));
  assert.equal(records.get(key), '{malformed');
  assert.equal(getProfileStorageKey(null), null);
});
