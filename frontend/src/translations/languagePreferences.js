import { resolveLanguage } from './index.js';

export const LANGUAGE_STORAGE_KEY = 'yojsetu_language';

export function getStoredLanguagePreference(storage) {
  if (!storage) return null;
  return resolveLanguage(storage.getItem(LANGUAGE_STORAGE_KEY))?.code ?? null;
}

export function saveLanguagePreference(storage, input) {
  const resolved = resolveLanguage(input);
  if (!storage || !resolved) return false;
  storage.setItem(LANGUAGE_STORAGE_KEY, resolved.code);
  return true;
}
