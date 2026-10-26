import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS } from '../translations/index.js';
import { calculateSafetyQuizScore, SAFETY_QUIZ_QUESTIONS } from '../data/safetyCentreData.js';

test('Safety Centre quiz has six stable questions and correct answer indexes', () => {
  assert.equal(SAFETY_QUIZ_QUESTIONS.length, 6);
  assert.equal(new Set(SAFETY_QUIZ_QUESTIONS.map(({ id }) => id)).size, 6);
  assert.deepEqual(
    SAFETY_QUIZ_QUESTIONS.map(({ correctAnswer }) => correctAnswer),
    [1, 2, 2, 1, 2, 2]
  );
});

test('Safety Centre English and Hindi dictionaries cover every quiz string', () => {
  for (const language of ['en', 'hi']) {
    const dictionary = TRANSLATIONS[language];
    for (const question of SAFETY_QUIZ_QUESTIONS) {
      assert.ok(dictionary[question.questionKey], `${language} missing ${question.questionKey}`);
      assert.ok(dictionary[question.explanationKey], `${language} missing ${question.explanationKey}`);
      for (let option = 1; option <= 4; option += 1) {
        const key = `${question.optionPrefix}${option}`;
        assert.ok(dictionary[key], `${language} missing ${key}`);
      }
    }
  }
});

test('Safety Centre translations have matching English and Hindi keys', () => {
  const englishKeys = Object.keys(TRANSLATIONS.en).filter((key) => key.startsWith('safetyCentre.'));
  const hindiKeys = Object.keys(TRANSLATIONS.hi).filter((key) => key.startsWith('safetyCentre.'));
  assert.deepEqual(new Set(hindiKeys), new Set(englishKeys));
  assert.ok(TRANSLATIONS.en['nav.safetyCentre']);
  assert.ok(TRANSLATIONS.hi['nav.safetyCentre']);
});

test('Safety Centre score is calculated from stored answers only', () => {
  const answers = Object.fromEntries(SAFETY_QUIZ_QUESTIONS.map(({ id, correctAnswer }) => [id, correctAnswer]));
  assert.equal(calculateSafetyQuizScore(answers), 6);
  assert.equal(calculateSafetyQuizScore({ ...answers, 'otp-request': 1 }), 5);
  assert.equal(calculateSafetyQuizScore({}), 0);
});
