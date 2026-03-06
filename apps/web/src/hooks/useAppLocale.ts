'use client';

import { getTranslations, resolveAppLocale } from '@groupfit/shared';
import type { Locale } from '@groupfit/shared';

/**
 * Returns the app locale (from user profile/JWT only; never from device/browser)
 * and the translations for that locale.
 */
export function useAppLocale(profileLocale?: string | null): {
  locale: Locale;
  t: ReturnType<typeof getTranslations>;
} {
  const locale = resolveAppLocale(profileLocale);
  const t = getTranslations(locale);
  return { locale, t };
}
