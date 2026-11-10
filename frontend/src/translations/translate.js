import { DEFAULT_LANGUAGE, TRANSLATIONS } from './index.js';

export function translate(key, language, fallback = '', params = null) {
  if (!key) return '';

  const localized = TRANSLATIONS[language]?.[key];
  const english = TRANSLATIONS[DEFAULT_LANGUAGE]?.[key];
  let text = typeof localized === 'string'
    ? localized
    : typeof english === 'string'
      ? english
      : typeof fallback === 'string' && fallback
        ? fallback
        : key;

  if (params && typeof params === 'object') {
    text = text.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (placeholder, name) =>
      Object.hasOwn(params, name) ? String(params[name] ?? '') : placeholder
    );
  }

  return text;
}
