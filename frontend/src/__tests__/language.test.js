import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  TRANSLATIONS,
  resolveLanguage,
  isSupportedLanguage,
} from '../translations/index.js';
import { getStoredLanguagePreference, saveLanguagePreference } from '../translations/languagePreferences.js';
import { translate } from '../translations/translate.js';
import { DOCUMENT_DEFINITIONS } from '../data/documentCatalog.js';

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
    'onboarding.progressSaved',
  ];

  for (const lang of SUPPORTED_LANGUAGES) {
    const dict = TRANSLATIONS[lang.code];
    assert.ok(dict, `Dictionary for language '${lang.code}' (${lang.name}) must be defined`);
    assert.deepEqual(
      Object.keys(dict).sort(),
      Object.keys(TRANSLATIONS.en).sort(),
      `Dictionary keys must be consistent in '${lang.code}'`
    );

    for (const key of requiredCategories) {
      assert.ok(
        dict[key] && dict[key].trim().length > 0,
        `Key '${key}' must be defined and non-empty in '${lang.code}' dictionary`
      );
    }

    for (const key of Object.keys(TRANSLATIONS.en)) {
      const placeholders = (value) => [...value.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)]
        .map((match) => match[1])
        .sort();
      assert.deepEqual(
        placeholders(dict[key]),
        placeholders(TRANSLATIONS.en[key]),
        `Interpolation placeholders must match for '${key}' in '${lang.code}'`
      );
    }
  }
});

test('Document catalog titles and descriptions are translated in all supported languages', () => {
  assert.equal(DOCUMENT_DEFINITIONS.length, 7);

  for (const document of DOCUMENT_DEFINITIONS) {
    assert.ok(document.requiredBy.length > 0, `${document.key} must retain its scheme requirements`);
    for (const { code, name } of SUPPORTED_LANGUAGES) {
      const dictionary = TRANSLATIONS[code];
      assert.ok(dictionary[document.titleKey]?.trim(), `Missing ${document.titleKey} in ${name}`);
      assert.ok(dictionary[document.descriptionKey]?.trim(), `Missing ${document.descriptionKey} in ${name}`);
      if (code !== DEFAULT_LANGUAGE) {
        assert.notEqual(
          dictionary[document.descriptionKey],
          TRANSLATIONS.en[document.descriptionKey],
          `${document.descriptionKey} should not fall back to English in ${name}`
        );
      }
    }
  }

  for (const { code, name } of SUPPORTED_LANGUAGES) {
    assert.ok(TRANSLATIONS[code]['documents.digilockerGuidanceTitle']?.trim(), `Missing DigiLocker title in ${name}`);
    assert.ok(TRANSLATIONS[code]['documents.digilockerGuidance']?.trim(), `Missing DigiLocker guidance in ${name}`);
  }
});

test('All statically referenced UI translation keys exist in every language', () => {
  const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const sourceFiles = [];
  const collectSourceFiles = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        collectSourceFiles(filePath);
      } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
        sourceFiles.push(filePath);
      }
    }
  };
  collectSourceFiles(sourceRoot);

  const referencedKeys = new Set();
  for (const filePath of sourceFiles) {
    const source = readFileSync(filePath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const match of source.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)) {
      referencedKeys.add(match[1]);
    }
  }

  assert.ok(referencedKeys.size > 0, 'UI should reference translation keys');
  const missingKeys = [];
  for (const key of referencedKeys) {
    for (const { code, name } of SUPPORTED_LANGUAGES) {
      if (!TRANSLATIONS[code][key]) missingKeys.push(`${key} (${name})`);
    }
  }
  assert.deepEqual(missingKeys, [], 'Every static UI translation reference must exist in every language');
});

test('Translation fallback, language switching, and interpolation', () => {
  assert.equal(translate('unknown.key', 'hi', 'Fallback text'), 'Fallback text');
  assert.equal(translate('unknown.key', 'hi'), 'unknown.key');
  assert.equal(translate('nav.dashboard', 'en'), 'Dashboard');
  assert.equal(translate('nav.dashboard', 'hi'), 'डैशबोर्ड');
  assert.equal(translate('auth.resendOtpIn', 'en', '', { sec: 45 }), 'Resend OTP in 45s');
  assert.equal(translate('dashboard.match', 'en', '', { score: 95 }), '95% Match');
  assert.equal(translate('dashboard.moreDocs', 'en', '', { count: 3 }), '+3 more');
  assert.equal(
    translate('safetyCentre.questionProgress', 'pa', '', { current: 2, total: 6 }).includes('{'),
    false
  );
  assert.equal(
    translate('onboarding.stepProgress', 'hi', '', { step: 2, count: 1 }).includes('{'),
    false
  );
});

test('Language preference persists by code, English name, and native name', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  assert.equal(saveLanguagePreference(storage, 'বাংলা'), true);
  assert.equal(getStoredLanguagePreference(storage), 'bn');
  assert.equal(saveLanguagePreference(storage, 'Marathi'), true);
  assert.equal(getStoredLanguagePreference(storage), 'mr');
  assert.equal(saveLanguagePreference(storage, 'xx'), false);
  assert.equal(getStoredLanguagePreference(storage), 'mr');
});
