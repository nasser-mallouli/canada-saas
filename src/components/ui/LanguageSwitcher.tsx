import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { Language, getLanguageName, getLanguageFlag, SUPPORTED_LANGUAGES } from '../../i18n/utils';

export function LanguageSwitcher() {
  const { language, changeLanguage, isRTL } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = async (lang: Language) => {
    if (lang !== language) {
      await changeLanguage(lang);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isOpen
            ? 'bg-primary-100 text-primary-700'
            : 'text-secondary-700 hover:bg-secondary-100'
        }`}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">
          {getLanguageFlag(language)}
        </span>
        <span className="text-sm font-medium sm:hidden">
          {language.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            isRTL ? 'left-0' : 'right-0'
          } mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50 animate-slide-down`}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                language === lang
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-secondary-700 hover:bg-secondary-50'
              }`}
            >
              <span className="text-lg">{getLanguageFlag(lang)}</span>
              <span className="flex-1 text-left">{getLanguageName(lang)}</span>
              {language === lang && (
                <Check className="w-4 h-4 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

