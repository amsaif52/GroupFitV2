import { REGION_TIMEZONES } from './regions';
import type { CountryCode, RegionCode, TimeZoneId } from './types';

/**
 * Check if the runtime supports a given IANA timezone (Intl).
 */
export function isTimeZoneValid(timeZone: TimeZoneId): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the primary IANA timezone for a country + region (e.g. CA, ON).
 * Returns undefined if the region is not in the map (add it to REGION_TIMEZONES when expanding).
 */
export function getTimezoneForRegion(
  country: CountryCode,
  region: RegionCode
): TimeZoneId | undefined {
  const byCountry = REGION_TIMEZONES[country as keyof typeof REGION_TIMEZONES];
  if (!byCountry) return undefined;
  const info = byCountry[region as keyof typeof byCountry];
  return info?.timeZone;
}

/**
 * Get timezone from a combined key "CA-ON" or "US-NY".
 */
export function getTimezoneForRegionKey(regionKey: string): TimeZoneId | undefined {
  const [country, region] = regionKey.split('-');
  if (!country || !region) return undefined;
  return getTimezoneForRegion(country, region);
}

/**
 * Format a date in a given IANA timezone.
 * Uses Intl.DateTimeFormat (works in Node 20+ and all modern browsers).
 */
export function formatInTimezone(
  date: Date,
  timeZone: TimeZoneId,
  options: Intl.DateTimeFormatOptions = {},
  locale = 'en-CA'
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    ...options,
  }).format(date);
}

/**
 * Get the current date/time interpreted in the given timezone.
 * Returns a Date whose UTC time corresponds to "now" in that zone (for display).
 * For storage/API, continue using UTC; use this for display only.
 */
export function getNowInTimezone(_timeZone: TimeZoneId): Date {
  return new Date();
}

/**
 * Format "now" in the given timezone (convenience).
 */
export function formatNowInTimezone(
  timeZone: TimeZoneId,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' },
  locale = 'en-CA'
): string {
  return formatInTimezone(new Date(), timeZone, options, locale);
}

/**
 * Format a date in a region's timezone (country + region code).
 */
export function formatInRegion(
  date: Date,
  country: CountryCode,
  region: RegionCode,
  options: Intl.DateTimeFormatOptions = {},
  locale = 'en-CA'
): string | undefined {
  const tz = getTimezoneForRegion(country, region);
  if (!tz) return undefined;
  return formatInTimezone(date, tz, options, locale);
}

/**
 * List all timezones available for a region (primary + alternates).
 */
export function getTimeZonesForRegion(country: CountryCode, region: RegionCode): TimeZoneId[] {
  const byCountry = REGION_TIMEZONES[country as keyof typeof REGION_TIMEZONES];
  if (!byCountry) return [];
  const info = byCountry[region as keyof typeof byCountry];
  if (!info) return [];
  const list = [info.timeZone];
  if (info.alternateTimeZones) list.push(...info.alternateTimeZones);
  return list;
}
