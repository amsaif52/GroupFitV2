/**
 * Country codes (ISO 3166-1 alpha-2). Extend when adding new regions.
 */
export type CountryCode = 'CA' | 'US' | string;

/**
 * Region code: province (Canada) or state (US). ISO 3166-2 style without country prefix.
 * Extend when adding new regions.
 */
export type RegionCode = string;

/**
 * IANA timezone identifier (e.g. America/Toronto). Use these for all formatting.
 */
export type TimeZoneId = string;

/**
 * Combined region key: "CA-ON", "US-NY". Used for a single lookup across countries.
 */
export type RegionKey = `${string}-${string}`;

export interface RegionTimeZoneInfo {
  /** Primary IANA timezone for this region */
  timeZone: TimeZoneId;
  /** If the region spans multiple zones (e.g. Florida), others are listed here */
  alternateTimeZones?: TimeZoneId[];
  /** Optional display label for the region */
  label?: string;
}

/** Map of country code -> region code -> timezone info */
export type RegionTimeZoneMap = Record<CountryCode, Record<RegionCode, RegionTimeZoneInfo>>;
