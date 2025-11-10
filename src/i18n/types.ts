export type Language = 'en' | 'fr' | 'ar';

export interface TranslationParams {
  [key: string]: string | number;
}

export interface Translations {
  [key: string]: string | Translations;
}

