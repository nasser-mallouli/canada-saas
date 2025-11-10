import { Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'ar'];

export const RTL_LANGUAGES: Language[] = ['ar'];

export function isRTL(language: Language): boolean {
  return RTL_LANGUAGES.includes(language);
}

export function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  
  if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
    return browserLang as Language;
  }
  
  return 'en';
}

export function getStoredLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('app_language');
  if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
    return stored as Language;
  }
  
  return null;
}

export function storeLanguage(language: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('app_language', language);
}

export function getLanguageName(language: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    fr: 'Français',
    ar: 'العربية',
  };
  return names[language];
}

export function getLanguageFlag(language: Language): string {
  const flags: Record<Language, string> = {
    en: '🇬🇧',
    fr: '🇫🇷',
    ar: '🇸🇦',
  };
  return flags[language];
}

