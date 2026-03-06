/**
 * Static reference data for customer/trainer APIs (country, state, city, activity types).
 * Replace with DB-backed tables or external API when needed.
 */

export interface CountryItem {
  code: string;
  name: string;
  isdCode?: string;
}

export interface StateItem {
  code: string;
  name: string;
  countryCode?: string;
}

export interface CityItem {
  code: string;
  name: string;
  stateCode?: string;
}

export interface ActivityTypeItem {
  code: string;
  name: string;
}

/** Minimal list for dropdowns; expand or move to DB as needed */
export const COUNTRIES: CountryItem[] = [
  { code: 'GB', name: 'United Kingdom', isdCode: '+44' },
  { code: 'US', name: 'United States', isdCode: '+1' },
  { code: 'IN', name: 'India', isdCode: '+91' },
  { code: 'AU', name: 'Australia', isdCode: '+61' },
  { code: 'CA', name: 'Canada', isdCode: '+1' },
  { code: 'DE', name: 'Germany', isdCode: '+49' },
  { code: 'FR', name: 'France', isdCode: '+33' },
];

/** Default Stripe currency for a country (trainer/customer location). */
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'usd',
  GB: 'gbp',
  IN: 'inr',
  AU: 'aud',
  CA: 'cad',
  DE: 'eur',
  FR: 'eur',
};

/** Example states (UK); add more or load from DB */
export const STATES: StateItem[] = [
  { code: 'ENG', name: 'England', countryCode: 'GB' },
  { code: 'SCT', name: 'Scotland', countryCode: 'GB' },
  { code: 'WLS', name: 'Wales', countryCode: 'GB' },
  { code: 'NIR', name: 'Northern Ireland', countryCode: 'GB' },
];

/** Example cities; expand or load from DB */
export const CITIES: CityItem[] = [
  { code: 'LON', name: 'London', stateCode: 'ENG' },
  { code: 'MAN', name: 'Manchester', stateCode: 'ENG' },
  { code: 'BIR', name: 'Birmingham', stateCode: 'ENG' },
  { code: 'GLW', name: 'Glasgow', stateCode: 'SCT' },
  { code: 'EDI', name: 'Edinburgh', stateCode: 'SCT' },
  { code: 'CRD', name: 'Cardiff', stateCode: 'WLS' },
];

/** Activity types for sessions/activities */
export const ACTIVITY_TYPES: ActivityTypeItem[] = [
  { code: 'yoga', name: 'Yoga' },
  { code: 'boxing', name: 'Boxing' },
  { code: 'hiit', name: 'HIIT' },
  { code: 'strength', name: 'Strength' },
  { code: 'cardio', name: 'Cardio' },
  { code: 'pilates', name: 'Pilates' },
  { code: 'running', name: 'Running' },
  { code: 'cycling', name: 'Cycling' },
  { code: 'swimming', name: 'Swimming' },
  { code: 'general', name: 'General Fitness' },
];

export interface LanguageItem {
  code: string;
  name: string;
}

export interface ExperienceItem {
  code: string;
  name: string;
}

export const LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
];

export const EXPERIENCE_LEVELS: ExperienceItem[] = [
  { code: '0-1', name: '0-1 years' },
  { code: '1-3', name: '1-3 years' },
  { code: '3-5', name: '3-5 years' },
  { code: '5-10', name: '5-10 years' },
  { code: '10+', name: '10+ years' },
];

/** Cancel reasons for session cancellation (customer/trainer) */
export const CANCEL_REASONS: { id: string; name: string }[] = [
  { id: 'schedule', name: 'Schedule conflict' },
  { id: 'illness', name: 'Illness' },
  { id: 'other', name: 'Other' },
];
