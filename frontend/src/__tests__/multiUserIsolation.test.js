import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidUserId,
  getProfileStorageKey,
  getApplicationsStorageKey,
  getCurrentUserId,
  getCurrentUser,
  USER_KEY,
  TOKEN_KEY,
  LEGACY_STORAGE_KEYS,
} from '../utils/storage.js';
import { EMPTY_PROFILE } from '../utils/profileUtils.js';
import { getProfile, updateProfile } from '../services/profileService.js';
import {
  getApplications,
  createApplication,
  getApplicationById,
  updateApplicationStatus,
} from '../services/applicationService.js';
import api from '../services/api.js';
import { mockSchemes } from '../data/mockSchemes.js';

api.defaults.adapter = async (config) => ({
  data: mockSchemes,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
  request: {},
});

function setupMockStorage() {
  const store = new Map();
  const mockStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (i) => Array.from(store.keys())[i] ?? null,
  };

  globalThis.localStorage = mockStorage;
  globalThis.window = {
    dispatchEvent: () => true,
    localStorage: mockStorage,
  };

  return store;
}

test('Test A: Profile Isolation - Separate profiles for User A and User B', async () => {
  const store = setupMockStorage();

  // 1. Create and authenticate User A (101)
  const userA = { id: 101, full_name: 'Aarav Sharma', role: 'citizen' };
  localStorage.setItem(USER_KEY, JSON.stringify(userA));
  localStorage.setItem(TOKEN_KEY, 'token_user_a');

  // 2. Save unique profile for User A
  const profileAData = {
    full_name: 'Aarav Sharma',
    state: 'Punjab',
    district: 'Ludhiana',
    occupation: 'Farmer',
    annual_household_income: '250000',
    social_category: 'General',
  };
  const savedA = await updateProfile(profileAData, 101);
  assert.equal(savedA.full_name, 'Aarav Sharma');
  assert.equal(savedA.state, 'Punjab');

  // Verify storage key for User A
  const keyA = getProfileStorageKey(101);
  assert.equal(keyA, 'yojsetu_profile_101');
  assert.ok(store.has('yojsetu_profile_101'));

  // 3. Authenticate User B (102)
  const userB = { id: 102, full_name: 'Priya Patel', role: 'citizen' };
  localStorage.setItem(USER_KEY, JSON.stringify(userB));
  localStorage.setItem(TOKEN_KEY, 'token_user_b');

  // 4. Verify User B receives EMPTY_PROFILE initially
  const profileB = await getProfile(102);
  assert.equal(profileB.full_name, '');
  assert.equal(profileB.state, '');
  assert.equal(profileB.district, '');

  // 5. Save different profile for User B
  const profileBData = {
    full_name: 'Priya Patel',
    state: 'Gujarat',
    district: 'Ahmedabad',
    occupation: 'Student',
    annual_household_income: '80000',
    social_category: 'OBC',
  };
  await updateProfile(profileBData, 102);
  assert.ok(store.has('yojsetu_profile_102'));

  // 6. Verify both profiles remain completely independent
  const fetchedA = await getProfile(101);
  const fetchedB = await getProfile(102);

  assert.equal(fetchedA.full_name, 'Aarav Sharma');
  assert.equal(fetchedA.state, 'Punjab');
  assert.equal(fetchedA.occupation, 'Farmer');

  assert.equal(fetchedB.full_name, 'Priya Patel');
  assert.equal(fetchedB.state, 'Gujarat');
  assert.equal(fetchedB.occupation, 'Student');
});

test('Test B: Application Isolation - User A cannot see User B applications', async () => {
  const store = setupMockStorage();

  // 1. Authenticate User A (101) and add applications
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 101, full_name: 'Aarav' }));
  const appA1 = await createApplication('SCH-PM-KISAN-001', 101);
  const appA2 = await createApplication('SCH-AYUSHMAN-002', 101);
  const duplicate = await createApplication('SCH-PM-KISAN-001', 101);
  assert.equal(duplicate.id, appA1.id, 'Tracking the same scheme should not create duplicates');
  await assert.rejects(createApplication('not-in-catalogue', 101), /not in the current catalogue/);

  const appsA = await getApplications(101);
  assert.equal(appsA.length, 2);
  assert.ok(store.has('yojsetu_user_applications_101'));

  // 2. Authenticate User B (102)
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 102, full_name: 'Priya' }));

  // Verify User B receives empty applications list
  const appsBInitial = await getApplications(102);
  assert.equal(appsBInitial.length, 0);

  // 3. Save a different application for User B
  const appB1 = await createApplication('SCH-SURYA-GHAR-003', 102);
  const appsB = await getApplications(102);
  assert.equal(appsB.length, 1);
  assert.equal(appsB[0].schemeName, 'PM Surya Ghar: Muft Bijli Yojana');
  assert.ok(store.has('yojsetu_user_applications_102'));
  await updateApplicationStatus(appB1.id, 'applied_by_user', 102);
  assert.equal((await getApplications(102))[0].status, 'applied_by_user');
  assert.equal((await getApplications(101))[0].status, 'planning');
  await assert.rejects(
    updateApplicationStatus(appA1.id, 'applied_by_user', 102),
    /not found for this user/
  );

  // 4. Verify cross-user access is impossible
  const appsAFresh = await getApplications(101);
  assert.equal(appsAFresh.length, 2);
  assert.ok(!appsAFresh.some((a) => a.id === appB1.id));
  assert.ok(!appsB.some((a) => a.id === appA1.id));
  assert.ok(!appsB.some((a) => a.id === appA2.id));

  // User B cannot find User A's application by ID
  const crossAccess = await getApplicationById(appA1.id, 102);
  assert.equal(crossAccess, null);
});

test('Test C: Account Switching - User A -> Logout -> User B -> Logout -> User A', async () => {
  setupMockStorage();

  // Step 1: User A logs in and saves data
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 101, full_name: 'User A' }));
  localStorage.setItem(TOKEN_KEY, 'token_a');
  await updateProfile({ full_name: 'User A', state: 'Maharashtra' }, 101);
  await createApplication('SCH-PM-KISAN-001', 101);

  // Step 2: Logout User A
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  assert.equal(getCurrentUserId(), null);
  const unauthProfile = await getProfile();
  assert.equal(unauthProfile.full_name, '');
  const unauthApps = await getApplications();
  assert.equal(unauthApps.length, 0);

  // Step 3: User B logs in
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 102, full_name: 'User B' }));
  localStorage.setItem(TOKEN_KEY, 'token_b');
  assert.equal(getCurrentUserId(), 102);

  // User B sees no data from User A
  const profileB = await getProfile(102);
  assert.equal(profileB.full_name, '');
  const appsB = await getApplications(102);
  assert.equal(appsB.length, 0);

  // User B creates their own data
  await updateProfile({ full_name: 'User B', state: 'Delhi' }, 102);
  await createApplication('SCH-AYUSHMAN-002', 102);

  // Step 4: Logout User B
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  assert.equal(getCurrentUserId(), null);

  // Step 5: User A logs back in
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 101, full_name: 'User A' }));
  localStorage.setItem(TOKEN_KEY, 'token_a');
  assert.equal(getCurrentUserId(), 101);

  // User A sees their original profile and applications restored
  const restoredProfileA = await getProfile(101);
  assert.equal(restoredProfileA.full_name, 'User A');
  assert.equal(restoredProfileA.state, 'Maharashtra');

  const restoredAppsA = await getApplications(101);
  assert.equal(restoredAppsA.length, 1);
  assert.equal(restoredAppsA[0].schemeName, 'PM Kisan Samman Nidhi');
});

test('Test D: Logout - Clears active session while preserving saved user data', async () => {
  const store = setupMockStorage();

  // Authenticate User 101 and populate data
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 101, full_name: 'Citizen 101' }));
  localStorage.setItem(TOKEN_KEY, 'token_101');
  await updateProfile({ full_name: 'Citizen 101', state: 'Kerala' }, 101);
  await createApplication('SCH-PM-KISAN-001', 101);

  assert.ok(store.has('yojsetu_profile_101'));
  assert.ok(store.has('yojsetu_user_applications_101'));

  // Simulate logout
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);

  // Active state is cleared
  assert.equal(getCurrentUserId(), null);
  assert.equal(getCurrentUser(), null);

  // Persisted user data remains intact in storage
  assert.ok(store.has('yojsetu_profile_101'), 'User profile storage must be preserved on logout');
  assert.ok(store.has('yojsetu_user_applications_101'), 'User application storage must be preserved on logout');

  const parsedProfile = JSON.parse(store.get('yojsetu_profile_101'));
  assert.equal(parsedProfile.profile.full_name, 'Citizen 101');
  assert.equal(parsedProfile.profile.state, 'Kerala');
});

test('Test E: Refresh / Session Restoration - Resolves user ID before loading data', async () => {
  const store = setupMockStorage();

  // Populate persistent storage with pre-existing session and profile
  store.set(USER_KEY, JSON.stringify({ id: 101, full_name: 'Restored User' }));
  store.set(TOKEN_KEY, 'valid_token_101');
  store.set(
    'yojsetu_profile_101',
    JSON.stringify({
      profile: { ...EMPTY_PROFILE, full_name: 'Restored User', state: 'Rajasthan' },
      step: 4,
    })
  );
  store.set(
    'yojsetu_user_applications_101',
    JSON.stringify([{
      id: 'app_restored',
      userId: 101,
      external_scheme_id: 'SCH-SURYA-GHAR-003',
      status: 'planning',
      trackedAt: '2025-01-01T00:00:00.000Z',
    }])
  );

  // On page refresh, user ID is resolved synchronously from storage
  const resolvedId = getCurrentUserId();
  assert.equal(resolvedId, 101);

  // User-scoped keys are determined immediately
  const profileKey = getProfileStorageKey(resolvedId);
  const appsKey = getApplicationsStorageKey(resolvedId);
  assert.equal(profileKey, 'yojsetu_profile_101');
  assert.equal(appsKey, 'yojsetu_user_applications_101');

  // Profile and applications load correctly with no cross-user state
  const profile = await getProfile(resolvedId);
  assert.equal(profile.full_name, 'Restored User');
  assert.equal(profile.state, 'Rajasthan');

  const apps = await getApplications(resolvedId);
  assert.equal(apps.length, 1);
  assert.equal(apps[0].schemeName, 'PM Surya Ghar: Muft Bijli Yojana');
});

test('Test F: Legacy Storage - Legacy keys are isolated and never assigned to logged-in users', async () => {
  const store = setupMockStorage();

  // Populate old global storage keys with unowned legacy data
  store.set(
    LEGACY_STORAGE_KEYS.PROFILE,
    JSON.stringify({
      profile: { full_name: 'Unowned Legacy Citizen', state: 'Legacy State' },
      step: 2,
    })
  );
  store.set(
    LEGACY_STORAGE_KEYS.APPLICATIONS,
    JSON.stringify([{ id: 'legacy_app_999', schemeName: 'Old Legacy Scheme' }])
  );

  // User A logs in
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 101, full_name: 'User A' }));
  localStorage.setItem(TOKEN_KEY, 'token_a');

  // Verify User A NEVER inherits legacy profile or application data
  const profileA = await getProfile(101);
  assert.notEqual(profileA.full_name, 'Unowned Legacy Citizen');
  assert.equal(profileA.full_name, '');

  const appsA = await getApplications(101);
  assert.equal(appsA.length, 0);

  // User B logs in
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 102, full_name: 'User B' }));
  localStorage.setItem(TOKEN_KEY, 'token_b');

  // Verify User B also NEVER inherits legacy data
  const profileB = await getProfile(102);
  assert.notEqual(profileB.full_name, 'Unowned Legacy Citizen');
  assert.equal(profileB.full_name, '');

  const appsB = await getApplications(102);
  assert.equal(appsB.length, 0);

  // Verify legacy data was NOT deleted and remains preserved in isolation
  assert.ok(store.has(LEGACY_STORAGE_KEYS.PROFILE));
  assert.ok(store.has(LEGACY_STORAGE_KEYS.APPLICATIONS));
});

test('Test G: Invalid Identity - Rejects invalid user IDs and never falls back to global key', async () => {
  setupMockStorage();

  const invalidIdentities = [
    null,
    undefined,
    '',
    '   ',
    'null',
    'undefined',
    'NaN',
    NaN,
    0,
    -1,
    Infinity,
    -Infinity,
    false,
    true,
    {},
    [],
  ];

  for (const invalid of invalidIdentities) {
    assert.equal(isValidUserId(invalid), false, `Expected isValidUserId(${invalid}) to be false`);
    assert.equal(getProfileStorageKey(invalid), null, `Expected getProfileStorageKey(${invalid}) to be null`);
    assert.equal(getApplicationsStorageKey(invalid), null, `Expected getApplicationsStorageKey(${invalid}) to be null`);
  }

  // Profile lookup with invalid identity returns EMPTY_PROFILE safely
  const profileNull = await getProfile(null);
  assert.equal(profileNull.full_name, '');

  const profileUndefined = await getProfile(undefined);
  assert.equal(profileUndefined.full_name, '');

  // Applications lookup with invalid identity returns empty list
  const appsNull = await getApplications(null);
  assert.deepEqual(appsNull, []);

  // Update profile with invalid identity throws without polluting storage
  await assert.rejects(
    async () => {
      await updateProfile({ full_name: 'Hacker' }, null);
    },
    /Cannot update profile/
  );

  // Create application with invalid identity throws without polluting storage
  await assert.rejects(
    async () => {
      await createApplication('SCH-PM-KISAN-001', null);
    },
    /Application tracking requires an authenticated user/
  );
});
