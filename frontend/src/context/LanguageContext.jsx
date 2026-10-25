import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  TRANSLATIONS,
  resolveLanguage,
  isSupportedLanguage,
} from '../translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'yojsetu_language';
const PROFILE_STORAGE_KEY = 'yojsetu_profile';

/**
 * Safely retrieves initial language preference from localStorage or profile preference.
 */
function getInitialLanguage() {
  try {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

    // 1. Check direct language storage key
    const saved = localStorage.getItem(STORAGE_KEY);
    const resolvedSaved = resolveLanguage(saved);
    if (resolvedSaved) return resolvedSaved.code;

    // 2. Check profile storage for preferred_language
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      const profileLang = parsed?.profile?.preferred_language;
      const resolvedProfileLang = resolveLanguage(profileLang);
      if (resolvedProfileLang) return resolvedProfileLang.code;
    }

    // 3. Fallback to default
    return DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  // Synchronize document lang attribute whenever language changes
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    } catch {
      // Ignore in non-browser environments
    }
  }, [language]);

  /**
   * Set global language with validation and persistence.
   * Accepts code ('hi'), English name ('Hindi'), or native name ('हिन्दी').
   */
  const setLanguage = useCallback((input) => {
    const resolved = resolveLanguage(input);

    if (!resolved) {
      console.warn(`[LanguageContext] Unsupported language "${input}". Falling back to "${DEFAULT_LANGUAGE}".`);
      return false;
    }

    setLanguageState(resolved.code);

    try {
      // 1. Persist direct preference
      localStorage.setItem(STORAGE_KEY, resolved.code);

      // 2. Sync with profile preferred_language if profile exists
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed?.profile) {
          parsed.profile.preferred_language = resolved.name;
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(parsed));
        }
      }
    } catch {
      // Safe fallback if storage fails
    }

    return true;
  }, []);

  /**
   * Current language object with full metadata (code, name, nativeName).
   */
  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  /**
   * Translate a key with automatic fallback to English and then to the provided fallback text.
   */
  const t = useCallback(
    (key, fallback = '') => {
      if (!key) return '';

      // Direct match in current language
      const localizedDict = TRANSLATIONS[language];
      if (localizedDict && typeof localizedDict[key] === 'string') {
        return localizedDict[key];
      }

      // Fallback to English dictionary
      const defaultDict = TRANSLATIONS[DEFAULT_LANGUAGE];
      if (defaultDict && typeof defaultDict[key] === 'string') {
        return defaultDict[key];
      }

      // Ultimate fallback
      return fallback || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      currentLanguage,
      setLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      defaultLanguage: DEFAULT_LANGUAGE,
      t,
      isSupportedLanguage,
    }),
    [language, currentLanguage, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
