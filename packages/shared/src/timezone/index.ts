/**
 * Timezone utilities for Canadian provinces and US states.
 * Uses IANA timezone names (e.g. America/Toronto) so expanding to other
 * countries is straightforward: add entries to REGION_TIMEZONES in regions.ts
 * and use the same formatInTimezone / getTimezoneForRegion APIs.
 */
export * from './types';
export * from './regions';
export * from './format';
