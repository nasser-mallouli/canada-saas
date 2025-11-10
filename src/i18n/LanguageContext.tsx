import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, Translations } from './types';
import { isRTL, detectBrowserLanguage, getStoredLanguage, storeLanguage } from './utils';

interface LanguageContextType {
  language: Language;
  translations: Translations | null;
  isLoading: boolean;
  changeLanguage: (lang: Language) => Promise<void>;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    return getStoredLanguage() || detectBrowserLanguage();
  });
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTranslations = useCallback(async (lang: Language) => {
    setIsLoading(true);
    try {
      // Dynamic import for code splitting
      const translationModule = await import(`./translations/${lang}.json`);
      setTranslations(translationModule.default);
      storeLanguage(lang);
      
      // Update HTML lang and dir attributes
      document.documentElement.lang = lang;
      document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English if translation file fails to load
      if (lang !== 'en') {
        const fallback = await import('./translations/en.json');
        setTranslations(fallback.default);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  const changeLanguage = useCallback(async (lang: Language) => {
    if (lang === language) return;
    setLanguage(lang);
    await loadTranslations(lang);
  }, [language, loadTranslations]);

  const value: LanguageContextType = {
    language,
    translations,
    isLoading,
    changeLanguage,
    isRTL: isRTL(language),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}

