import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSelector({ compact = false, align = 'left', className = '' }) {
  const { language, currentLanguage, setLanguage, supportedLanguages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-xl transition-all cursor-pointer ${
          compact
            ? 'p-2 text-gray-600 dark:text-blue-200/70 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
            : 'w-full px-2.5 py-2 text-sm text-gray-700 dark:text-blue-100/90 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl'
        }`}
        aria-label={t('nav.selectLanguage', 'Select Language')}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-base flex-shrink-0" aria-hidden="true">
          🌐
        </span>

        {!compact && (
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="font-medium text-xs truncate">
              {currentLanguage.nativeName} ({currentLanguage.name})
            </span>
            <svg
              className={`w-3.5 h-3.5 ml-1 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 w-56 rounded-2xl bg-white dark:bg-[#0f1c3f] border border-gray-200 dark:border-white/10 shadow-xl py-1.5 focus:outline-none max-h-72 overflow-y-auto ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 uppercase tracking-wider">
            {t('nav.selectLanguage', 'Select Language')}
          </div>

          <div className="py-1">
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                  role="menuitem"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{lang.nativeName}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-400">{lang.name}</span>
                  </div>

                  {isSelected && (
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
