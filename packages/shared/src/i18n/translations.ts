import type { Locale } from '../utils/constants';
import { DEFAULT_LOCALE, LOCALES } from '../utils/constants';
import en from './locales/en';
import fr from './locales/fr';

type TranslationDict = typeof en;
const translations: Record<Locale, TranslationDict> = {
  en,
  fr: fr as unknown as TranslationDict,
};

/**
 * Resolve app locale from profile only. Do not use navigator.language (web) or device locale (RN);
 * the user's device default must not overwrite the app's language.
 */
export function resolveAppLocale(profileLocale?: string | null): Locale {
  const s = profileLocale?.toLowerCase().trim();
  if (s === 'fr') return 'fr';
  return DEFAULT_LOCALE;
}

export function getTranslations(locale: Locale = DEFAULT_LOCALE): typeof en {
  return translations[locale] ?? translations[DEFAULT_LOCALE];
}

export function t(locale: Locale, key: string): string {
  const dict = getTranslations(locale);
  const keys = key.split('.');
  let value: unknown = dict;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }
  return typeof value === 'string' ? value : key;
}

export { translations, LOCALES, resolveAppLocale };
export { en, fr };
