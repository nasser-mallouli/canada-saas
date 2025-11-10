import { useMemo } from 'react';
import { Language, TranslationParams, Translations } from './types';
import { useLanguageContext } from './LanguageContext';

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = value[key];
  }
  
  return typeof value === 'string' ? value : undefined;
}

function interpolate(template: string, params: TranslationParams): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}

export function useTranslation() {
  const { translations, language, changeLanguage, isRTL, isLoading } = useLanguageContext();

  const t = useMemo(() => {
    return (key: string, params?: TranslationParams): string => {
      if (!translations) {
        return key; // Return key as fallback if translations not loaded
      }

      const translation = getNestedValue(translations, key);
      
      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return key; // Return key if translation not found
      }

      if (params) {
        return interpolate(translation, params);
      }

      return translation;
    };
  }, [translations]);

  return {
    t,
    language,
    changeLanguage,
    isRTL,
    isLoading,
  };
}

