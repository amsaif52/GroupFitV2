import type { RegionTimeZoneMap } from './types';

/**
 * Region → IANA timezone mapping for Canada and US.
 * Uses primary timezone per province/state; some regions have alternates.
 * Add more countries by adding new top-level keys and re-exporting from index.
 */
export const REGION_TIMEZONES: RegionTimeZoneMap = {
  CA: {
    AB: { timeZone: 'America/Edmonton', label: 'Alberta' },
    BC: { timeZone: 'America/Vancouver', label: 'British Columbia' },
    MB: { timeZone: 'America/Winnipeg', label: 'Manitoba' },
    NB: { timeZone: 'America/Moncton', label: 'New Brunswick' },
    NL: { timeZone: 'America/St_Johns', label: 'Newfoundland and Labrador' },
    NS: { timeZone: 'America/Halifax', label: 'Nova Scotia' },
    NT: { timeZone: 'America/Yellowknife', label: 'Northwest Territories' },
    NU: { timeZone: 'America/Iqaluit', label: 'Nunavut' },
    ON: { timeZone: 'America/Toronto', label: 'Ontario' },
    PE: { timeZone: 'America/Halifax', label: 'Prince Edward Island' },
    QC: { timeZone: 'America/Toronto', label: 'Quebec' },
    SK: { timeZone: 'America/Regina', label: 'Saskatchewan' },
    YT: { timeZone: 'America/Whitehorse', label: 'Yukon' },
  },
  US: {
    AL: { timeZone: 'America/Chicago', label: 'Alabama' },
    AK: { timeZone: 'America/Anchorage', label: 'Alaska' },
    AZ: { timeZone: 'America/Phoenix', label: 'Arizona' },
    AR: { timeZone: 'America/Chicago', label: 'Arkansas' },
    CA: { timeZone: 'America/Los_Angeles', label: 'California' },
    CO: { timeZone: 'America/Denver', label: 'Colorado' },
    CT: { timeZone: 'America/New_York', label: 'Connecticut' },
    DE: { timeZone: 'America/New_York', label: 'Delaware' },
    DC: { timeZone: 'America/New_York', label: 'District of Columbia' },
    FL: { timeZone: 'America/New_York', alternateTimeZones: ['America/Chicago'], label: 'Florida' },
    GA: { timeZone: 'America/New_York', label: 'Georgia' },
    HI: { timeZone: 'Pacific/Honolulu', label: 'Hawaii' },
    ID: { timeZone: 'America/Boise', alternateTimeZones: ['America/Los_Angeles'], label: 'Idaho' },
    IL: { timeZone: 'America/Chicago', label: 'Illinois' },
    IN: { timeZone: 'America/Indiana/Indianapolis', alternateTimeZones: ['America/Chicago'], label: 'Indiana' },
    IA: { timeZone: 'America/Chicago', label: 'Iowa' },
    KS: { timeZone: 'America/Chicago', alternateTimeZones: ['America/Denver'], label: 'Kansas' },
    KY: { timeZone: 'America/Kentucky/Louisville', alternateTimeZones: ['America/Chicago'], label: 'Kentucky' },
    LA: { timeZone: 'America/Chicago', label: 'Louisiana' },
    ME: { timeZone: 'America/New_York', label: 'Maine' },
    MD: { timeZone: 'America/New_York', label: 'Maryland' },
    MA: { timeZone: 'America/New_York', label: 'Massachusetts' },
    MI: { timeZone: 'America/Detroit', alternateTimeZones: ['America/Chicago'], label: 'Michigan' },
    MN: { timeZone: 'America/Chicago', label: 'Minnesota' },
    MS: { timeZone: 'America/Chicago', label: 'Mississippi' },
    MO: { timeZone: 'America/Chicago', label: 'Missouri' },
    MT: { timeZone: 'America/Denver', label: 'Montana' },
    NE: { timeZone: 'America/Chicago', alternateTimeZones: ['America/Denver'], label: 'Nebraska' },
    NV: { timeZone: 'America/Los_Angeles', label: 'Nevada' },
    NH: { timeZone: 'America/New_York', label: 'New Hampshire' },
    NJ: { timeZone: 'America/New_York', label: 'New Jersey' },
    NM: { timeZone: 'America/Denver', label: 'New Mexico' },
    NY: { timeZone: 'America/New_York', label: 'New York' },
    NC: { timeZone: 'America/New_York', label: 'North Carolina' },
    ND: { timeZone: 'America/Chicago', alternateTimeZones: ['America/Denver'], label: 'North Dakota' },
    OH: { timeZone: 'America/New_York', label: 'Ohio' },
    OK: { timeZone: 'America/Chicago', label: 'Oklahoma' },
    OR: { timeZone: 'America/Los_Angeles', label: 'Oregon' },
    PA: { timeZone: 'America/New_York', label: 'Pennsylvania' },
    RI: { timeZone: 'America/New_York', label: 'Rhode Island' },
    SC: { timeZone: 'America/New_York', label: 'South Carolina' },
    SD: { timeZone: 'America/Chicago', alternateTimeZones: ['America/Denver'], label: 'South Dakota' },
    TN: { timeZone: 'America/Chicago', alternateTimeZones: ['America/New_York'], label: 'Tennessee' },
    TX: { timeZone: 'America/Chicago', alternateTimeZones: ['America/Denver', 'America/El_Paso'], label: 'Texas' },
    UT: { timeZone: 'America/Denver', label: 'Utah' },
    VT: { timeZone: 'America/New_York', label: 'Vermont' },
    VA: { timeZone: 'America/New_York', label: 'Virginia' },
    WA: { timeZone: 'America/Los_Angeles', label: 'Washington' },
    WV: { timeZone: 'America/New_York', label: 'West Virginia' },
    WI: { timeZone: 'America/Chicago', label: 'Wisconsin' },
    WY: { timeZone: 'America/Denver', label: 'Wyoming' },
  },
};

/** All supported Canadian province codes */
export const CA_PROVINCE_CODES = Object.keys(REGION_TIMEZONES.CA) as (keyof typeof REGION_TIMEZONES.CA)[];

/** All supported US state codes */
export const US_STATE_CODES = Object.keys(REGION_TIMEZONES.US) as (keyof typeof REGION_TIMEZONES.US)[];
