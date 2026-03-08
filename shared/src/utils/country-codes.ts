export interface CountryCode {
  code: string;
  dial: string;
  name: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'US', dial: '+1', name: 'United States' },
  { code: 'IN', dial: '+91', name: 'India' },
  { code: 'AE', dial: '+971', name: 'UAE' },
  { code: 'GB', dial: '+44', name: 'United Kingdom' },
  { code: 'CA', dial: '+1', name: 'Canada' },
  { code: 'AU', dial: '+61', name: 'Australia' },
  { code: 'DE', dial: '+49', name: 'Germany' },
  { code: 'FR', dial: '+33', name: 'France' },
  { code: 'PK', dial: '+92', name: 'Pakistan' },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia' },
  { code: 'EG', dial: '+20', name: 'Egypt' },
  { code: 'NG', dial: '+234', name: 'Nigeria' },
  { code: 'ZA', dial: '+27', name: 'South Africa' },
  { code: 'BR', dial: '+55', name: 'Brazil' },
  { code: 'MX', dial: '+52', name: 'Mexico' },
  { code: 'SG', dial: '+65', name: 'Singapore' },
  { code: 'MY', dial: '+60', name: 'Malaysia' },
  { code: 'PH', dial: '+63', name: 'Philippines' },
  { code: 'JP', dial: '+81', name: 'Japan' },
  { code: 'CN', dial: '+86', name: 'China' },
  { code: 'KR', dial: '+82', name: 'South Korea' },
];
