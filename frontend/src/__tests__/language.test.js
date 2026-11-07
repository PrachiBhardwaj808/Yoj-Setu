import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  TRANSLATIONS,
  resolveLanguage,
  isSupportedLanguage,
} from '../translations/index.js';

import { translateText, isBhashiniSupported } from '../services/bhashiniService.js';
import { sendMessage, getSuggestedQuestions } from '../services/chatService.js';
import api from '../services/api.js';
import { mockSchemes } from '../data/mockSchemes.js';

globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

api.defaults.adapter = async (config) => ({
  data: mockSchemes,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
  request: {},
});

test('Language Definitions - Default and Supported Languages', () => {
  assert.equal(DEFAULT_LANGUAGE, 'en');
  assert.equal(SUPPORTED_LANGUAGES.length, 10);

  const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
  const expectedCodes = ['en', 'hi', 'pa', 'bn', 'mr', 'ta', 'te', 'gu', 'kn', 'ml'];
  assert.deepEqual(codes, expectedCodes);

  for (const lang of SUPPORTED_LANGUAGES) {
    assert.ok(lang.code, 'Language must have a code');
    assert.ok(lang.name, 'Language must have an English name');
    assert.ok(lang.nativeName, 'Language must have a native script name');
    assert.ok(lang.bhashiniCode, 'Language must have a Bhashini identifier');
  }
});

test('resolveLanguage - Resolves by code, name, and native name', () => {
  // By code
  assert.equal(resolveLanguage('en')?.name, 'English');
  assert.equal(resolveLanguage('hi')?.name, 'Hindi');
  assert.equal(resolveLanguage('pa')?.name, 'Punjabi');
  assert.equal(resolveLanguage('HI')?.code, 'hi'); // Case-insensitive

  // By English name
  assert.equal(resolveLanguage('Hindi')?.code, 'hi');
  assert.equal(resolveLanguage('english')?.code, 'en');
  assert.equal(resolveLanguage('Bengali')?.code, 'bn');

  // By native script name
  assert.equal(resolveLanguage('हिन्दी')?.code, 'hi');
  assert.equal(resolveLanguage('বাংলা')?.code, 'bn');
  assert.equal(resolveLanguage('ਪੰਜਾਬੀ')?.code, 'pa');

  // Unsupported or invalid inputs
  assert.equal(resolveLanguage('fr'), null);
  assert.equal(resolveLanguage('German'), null);
  assert.equal(resolveLanguage(''), null);
  assert.equal(resolveLanguage(null), null);
  assert.equal(resolveLanguage(undefined), null);
});

test('isSupportedLanguage - Correct boolean validation', () => {
  assert.equal(isSupportedLanguage('hi'), true);
  assert.equal(isSupportedLanguage('Hindi'), true);
  assert.equal(isSupportedLanguage('हिन्दी'), true);
  assert.equal(isSupportedLanguage('spanish'), false);
  assert.equal(isSupportedLanguage('xyz'), false);
  assert.equal(isSupportedLanguage(''), false);
});

test('Translations Dictionary - Core UI strings and fallback logic', () => {
  assert.ok(TRANSLATIONS.en, 'English dictionary must exist');
  assert.ok(TRANSLATIONS.hi, 'Hindi dictionary must exist');

  // Core navigation keys
  assert.equal(TRANSLATIONS.en['nav.dashboard'], 'Dashboard');
  assert.equal(TRANSLATIONS.hi['nav.dashboard'], 'डैशबोर्ड');
  assert.equal(TRANSLATIONS.en['nav.schemes'], 'Schemes');
  assert.equal(TRANSLATIONS.hi['nav.schemes'], 'योजनाएं');

  // Core dashboard keys
  assert.equal(TRANSLATIONS.en['dashboard.greetingMorning'], 'Good morning');
  assert.equal(TRANSLATIONS.hi['dashboard.greetingMorning'], 'शुभ प्रभात');

  // Core profile keys
  assert.equal(TRANSLATIONS.en['profile.title'], 'Citizen Profile');
  assert.equal(TRANSLATIONS.hi['profile.title'], 'नागरिक प्रोफ़ाइल');

  // Core assistant keys
  assert.equal(TRANSLATIONS.en['assistant.title'], 'Yojsetu Scheme Sathi');
  assert.equal(TRANSLATIONS.hi['assistant.title'], 'योजसेतु योजना साथी');
});

test('Bhashini Service - Supported codes and translation fallbacks', async () => {
  assert.equal(isBhashiniSupported('hi'), true);
  assert.equal(isBhashiniSupported('bn'), true);
  assert.equal(isBhashiniSupported('unknown'), false);

  // Identity translation when target equals source
  const same = await translateText('Hello', 'en', 'en');
  assert.equal(same, 'Hello');

  // Empty string handling
  const empty = await translateText('', 'hi', 'en');
  assert.equal(empty, '');

  // Without Bhashini credentials, translations are returned unchanged.
  const kisanEn =
    'The catalogue lists PM Kisan Samman Nidhi with ₹6,000 / year direct transfer. See the scheme details for eligibility and required documents.';
  const translatedKisan = await translateText(kisanEn, 'hi', 'en');
  assert.equal(translatedKisan, kisanEn);
});

test('Chat Service - Multilingual questions and responses', async () => {
  // English questions
  const enQuestions = getSuggestedQuestions('en');
  assert.ok(enQuestions.length > 0);
  assert.equal(enQuestions[0], 'What farming schemes am I eligible for?');

  // Hindi questions
  const hiQuestions = getSuggestedQuestions('hi');
  assert.ok(hiQuestions.length > 0);
  assert.equal(hiQuestions[0], 'मैं किन कृषि योजनाओं के लिए पात्र हूँ?');

  // Bengali questions
  const bnQuestions = getSuggestedQuestions('bn');
  assert.ok(bnQuestions.length > 0);
  assert.equal(bnQuestions[0], 'আমি কোন কোন কৃষি প্রকল্পের জন্য যোগ্য?');

  // Fallback for unsupported language code
  const fallbackQuestions = getSuggestedQuestions('xyz');
  assert.deepEqual(fallbackQuestions, enQuestions);

  // Send message in English
  const resEn = await sendMessage('Tell me about kisan subsidy', 'en');
  assert.ok(resEn.includes('PM Kisan Samman Nidhi'));
  assert.ok(resEn.includes('₹6,000 / year direct transfer'));
  assert.ok(!resEn.includes('under 2 hectares'));

  // Send message in Hindi
  const resHi = await sendMessage('किसान योजना', 'hi');
  assert.ok(
    resHi.includes('PM Kisan Samman Nidhi') || resHi.includes('पीएम किसान सम्मान निधि'),
    'Catalogue responses should retain the matched scheme name'
  );

  const employmentReply = await sendMessage('How does MGNREGA support rural employment?', 'en');
  assert.ok(employmentReply.includes('100 days of wage employment'));

  const unsupportedReply = await sendMessage('Tell me about a business loan', 'en');
  assert.ok(unsupportedReply.includes('could not find a matching scheme'));

  const eligibilityReply = await sendMessage('Am I eligible for PM Kisan?', 'en');
  assert.ok(eligibilityReply.includes('cannot determine or confirm personal eligibility'));
  assert.ok(eligibilityReply.includes('PM Kisan Samman Nidhi'));

  const trackingReply = await sendMessage('How do I track my application status?', 'en');
  assert.ok(trackingReply.includes('self-reported'));
  assert.ok(trackingReply.includes('does not submit an application'));

  assert.equal(await sendMessage('  ', 'en'), 'Enter a question about a scheme in the catalogue.');
});

test('Translations Dictionary - All 10 Supported Languages have full key sets', () => {
  const requiredCategories = [
    'nav.dashboard',
    'nav.schemes',
    'nav.applications',
    'nav.documents',
    'nav.profile',
    'home.heroTitle',
    'home.checkEligibility',
    'home.ctaButton',
    'auth.loginTitle',
    'auth.registerTitle',
    'auth.tabPassword',
    'auth.tabOtp',
    'dashboard.recommendedSchemes',
    'dashboard.completeProfile',
    'schemes.catalogTitle',
    'applications.title',
    'documents.title',
    'profile.title',
    'assistant.title',
    'common.loading',
    'common.tryAgain',
    'common.notFoundTitle',
  ];

  for (const lang of SUPPORTED_LANGUAGES) {
    const dict = TRANSLATIONS[lang.code];
    assert.ok(dict, `Dictionary for language '${lang.code}' (${lang.name}) must be defined`);

    for (const key of requiredCategories) {
      assert.ok(
        dict[key] && dict[key].trim().length > 0,
        `Key '${key}' must be defined and non-empty in '${lang.code}' dictionary`
      );
    }
  }
});

test('Parameter Interpolation - Correctly replaces placeholders', () => {
  const interpolate = (template, params) => {
    if (!params || typeof params !== 'object') return template;
    return Object.entries(params).reduce((acc, [k, v]) => {
      return acc.replaceAll(`{${k}}`, String(v ?? ''));
    }, template);
  };

  const templateSec = TRANSLATIONS.en['auth.resendOtpIn'];
  assert.equal(interpolate(templateSec, { sec: 45 }), 'Resend OTP in 45s');

  const templateMatch = TRANSLATIONS.en['dashboard.match'];
  assert.equal(interpolate(templateMatch, { score: 95 }), '95% Match');

  const templateDocs = TRANSLATIONS.en['dashboard.moreDocs'];
  assert.equal(interpolate(templateDocs, { count: 3 }), '+3 more');
});
