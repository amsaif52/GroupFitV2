/** User roles across the platform */
export const ROLES = {
  ADMIN: 'admin',
  TRAINER: 'trainer',
  CUSTOMER: 'customer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** API route prefixes per division */
export const API_PREFIXES = {
  CUSTOMER: '/customer',
  TRAINER: '/trainer',
  ADMIN: '/admin',
} as const;

/** Supported locales. App language must never be derived from device/browser (navigator.language, etc.); use profile locale or DEFAULT_LOCALE only. */
export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

/** Default locale when user has not set one. Device default must not overwrite app language. */
export const DEFAULT_LOCALE: Locale = 'en';

/** App identifiers */
export const APP_NAMES = {
  WEB: 'web',
  CUSTOMER_APP: 'customer-app',
  TRAINER_APP: 'trainer-app',
} as const;
