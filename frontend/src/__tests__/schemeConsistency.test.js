import test from 'node:test';
import assert from 'node:assert/strict';
import api from '../services/api.js';
import { getAllSchemes, getSchemeById } from '../services/schemeService.js';
import { mockSchemes } from '../data/mockSchemes.js';
import {
  filterSchemes,
  findSchemeByReference,
  findSchemeForApplication,
  getSchemeRouteId,
  normalizeScheme,
  normalizeSchemes,
} from '../utils/schemeUtils.js';

globalThis.localStorage = {
  getItem: () => null,
  removeItem: () => {},
};

const expectedSchemes = [
  ['SCH-PM-KISAN-001', 'PM Kisan Samman Nidhi'],
  ['SCH-AYUSHMAN-002', 'Ayushman Bharat (PM-JAY)'],
  ['SCH-SURYA-GHAR-003', 'PM Surya Ghar: Muft Bijli Yojana'],
  ['SCH-POST-MATRIC-004', 'Post-Matric Scholarship Scheme'],
  ['SCH-MGNREGA-005', 'MGNREGA Rural Employment Guarantee'],
  ['SCH-PMAY-006', 'PM Awas Yojana (PMAY-Urban/Rural)'],
];

function response(config, data, status = 200) {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    headers: {},
    config,
    request: {},
  };
}

function withAdapter(adapter, run) {
  const originalAdapter = api.defaults.adapter;
  api.defaults.adapter = adapter;
  return Promise.resolve()
    .then(run)
    .finally(() => {
      api.defaults.adapter = originalAdapter;
    });
}

test('A: Canonical external IDs map to the verified scheme names', () => {
  assert.deepEqual(
    mockSchemes.map((scheme) => [scheme.external_scheme_id, scheme.name]),
    expectedSchemes
  );
  assert.deepEqual(
    mockSchemes.map(getSchemeRouteId),
    expectedSchemes.map(([id]) => id)
  );
});

test('B: Backend and fallback records normalize to the same frontend shape', () => {
  const backend = normalizeScheme({
    id: 42,
    external_scheme_id: 'SCH-PM-KISAN-001',
    name: 'PM Kisan Samman Nidhi',
    benefits: '₹6,000 / year direct transfer',
    category: 'Agriculture',
    rules: [{ field_name: 'age', field_value: '18', raw_condition_text: 'Age 18 or above' }],
    documents: [{ document_name: 'Aadhaar Card', is_mandatory: true }],
    application_url: 'https://pmkisan.gov.in',
  });
  const fallback = findSchemeByReference('SCH-PM-KISAN-001', mockSchemes);

  assert.equal(backend.id, 42, 'The backend primary ID must be preserved');
  assert.equal(backend.scheme_id, 42);
  assert.equal(backend.name, fallback.name);
  assert.equal(backend.title, fallback.title);
  assert.equal(backend.benefits, fallback.benefits);
  assert.equal(backend.benefitAmount, backend.benefits);
  assert.equal(backend.external_scheme_id, fallback.external_scheme_id);
  assert.equal(backend.rules[0].raw_condition_text, 'Age 18 or above');
  assert.equal(backend.documents[0].document_name, 'Aadhaar Card');
  assert.equal(backend.application_url, 'https://pmkisan.gov.in');
  assert.equal(normalizeScheme({ name: 'No ID' }), null);
});

test('C: Duplicate backend IDs cannot map conflicting schemes', () => {
  assert.throws(
    () => normalizeSchemes([
      { id: 9, external_scheme_id: 'SCH-A', name: 'Scheme A' },
      { id: 9, external_scheme_id: 'SCH-B', name: 'Scheme B' },
    ]),
    /Duplicate scheme ID "9"/
  );
});

test('D: Homepage catalogue references resolve to the main catalogue', () => {
  for (const scheme of mockSchemes) {
    const routeId = getSchemeRouteId(scheme);
    assert.ok(routeId);
    assert.equal(findSchemeByReference(routeId, mockSchemes), scheme);
  }
});

test('E: External detail routes resolve to actual backend IDs; unknown IDs are not found', async () => {
  const backendScheme = {
    id: 47,
    external_scheme_id: 'SCH-AYUSHMAN-002',
    name: 'Ayushman Bharat (PM-JAY)',
    benefits: '₹5 Lakhs health cover / year',
    category: 'Health',
    rules: [],
    documents: [],
  };

  await withAdapter(async (config) => {
    if (config.url === '/schemes') {
      return response(config, [backendScheme]);
    }
    if (config.url === '/schemes/47') {
      return response(config, { ...backendScheme, rules: [{ raw_condition_text: 'Verified rule' }] });
    }
    if (config.url === '/schemes/999') {
      return Promise.reject({ response: { status: 404 }, config });
    }
    throw new Error(`Unexpected request: ${config.url}`);
  }, async () => {
    const scheme = await getSchemeById('SCH-AYUSHMAN-002');
    assert.equal(scheme.id, 47);
    assert.equal(scheme.name, 'Ayushman Bharat (PM-JAY)');
    assert.equal(scheme.rules[0].raw_condition_text, 'Verified rule');
    assert.equal(await getSchemeById('999'), undefined);
  });
});

test('F: Application references resolve to the correct canonical schemes', () => {
  const application = {
    id: 'local_application_1',
    external_scheme_id: 'SCH-SURYA-GHAR-003',
    schemeName: 'PM Surya Ghar: Muft Bijli Yojana',
    status: 'planning',
    trackingType: 'local',
  };
  const scheme = findSchemeForApplication(application, mockSchemes);
  assert.ok(scheme, `Missing catalogue scheme for application ${application.id}`);
  assert.equal(scheme.name, application.schemeName);
  assert.equal(getSchemeRouteId(scheme), application.external_scheme_id);

  assert.equal(findSchemeForApplication({ schemeName: 'Unknown' }, mockSchemes), null);
});

test('G: API outages use the matching fallback identity, never an unrelated numeric ID', async () => {
  await withAdapter(async (config) => response(config, []), async () => {
    assert.deepEqual(await getAllSchemes(), [], 'A valid empty API catalogue must not be replaced with mocks');
  });

  await withAdapter(async (config) => {
    throw new Error(`offline: ${config.url}`);
  }, async () => {
    const catalogue = await getAllSchemes();
    assert.deepEqual(catalogue.map(getSchemeRouteId), expectedSchemes.map(([id]) => id));

    const fallback = await getSchemeById('SCH-SURYA-GHAR-003');
    assert.equal(fallback.name, 'PM Surya Ghar: Muft Bijli Yojana');
    assert.equal(await getSchemeById('pm-surya-ghar'), undefined);
    assert.equal(await getSchemeById('3'), undefined);
  });
});

test('H: Search, category filters, and application detail routes retain catalogue identity', () => {
  const solar = filterSchemes(mockSchemes, 'rooftop', 'All');
  assert.equal(solar.length, 1);
  assert.equal(solar[0].external_scheme_id, 'SCH-SURYA-GHAR-003');

  const housing = filterSchemes(mockSchemes, '', 'Housing');
  assert.deepEqual(housing.map((scheme) => scheme.external_scheme_id), [
    'SCH-PMAY-006',
  ]);

  const application = { external_scheme_id: 'SCH-AYUSHMAN-002' };
  const appScheme = findSchemeForApplication(application, mockSchemes);
  assert.equal(getSchemeRouteId(appScheme), application.external_scheme_id);
});
