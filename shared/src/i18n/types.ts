import type { Locale } from '../utils/constants';

export type TranslationKeys = keyof typeof import('./locales/en').default;

export interface I18nConfig {
  locale: Locale;
  fallbackLocale: Locale;
}
