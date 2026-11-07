/**
 * Integration layer for Digital India Bhashini.
 * Without configured credentials, source text is returned unchanged.
 */
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../translations/index.js';

export async function translateText(text, targetLang = DEFAULT_LANGUAGE, sourceLang = 'en') {
  if (!text || targetLang === sourceLang) return text;

  const apiKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BHASHINI_API_KEY;
  const userId = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BHASHINI_USER_ID;
  if (!apiKey || !userId) return text;

  try {
    const response = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
        userID: userId,
      },
      body: JSON.stringify({
        pipelineTasks: [{
          taskType: 'translation',
          config: {
            language: {
              sourceLanguage: sourceLang,
              targetLanguage: targetLang,
            },
          },
        }],
        inputData: {
          input: [{ source: text }],
        },
      }),
    });

    if (!response.ok) {
      console.warn(`Bhashini translation request failed with HTTP ${response.status}.`);
      return text;
    }

    const data = await response.json();
    return data?.pipelineResponse?.[0]?.output?.[0]?.target || text;
  } catch (error) {
    console.warn('Bhashini translation is unavailable:', error);
    return text;
  }
}

export function isBhashiniSupported(langCode) {
  return SUPPORTED_LANGUAGES.some((language) =>
    language.code === langCode || language.bhashiniCode === langCode
  );
}
