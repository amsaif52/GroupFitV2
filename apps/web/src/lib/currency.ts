/**
 * Currency formatting for the app. Default is Canada (CAD).
 * Use countryCode from user profile when available for locale-aware display.
 */

const CURRENCY_SYMBOL: Record<string, string> = {
  CA: 'CA$',
  US: '$',
  GB: '£',
  AU: 'A$',
  IN: '₹',
  DE: '€',
  FR: '€',
};

const DEFAULT_COUNTRY = 'CA';

function getSymbol(countryCode?: string | null): string {
  const code = (countryCode ?? DEFAULT_COUNTRY).toUpperCase();
  return CURRENCY_SYMBOL[code] ?? 'CA$';
}

/**
 * Format an amount in cents as currency. Defaults to Canadian dollars (CA$).
 * @param cents Amount in cents (e.g. 1999 = CA$19.99)
 * @param countryCode Optional ISO country code (e.g. 'CA', 'US') for symbol; defaults to 'CA'
 */
export function formatPriceCents(
  cents: number | null | undefined,
  countryCode?: string | null
): string {
  if (cents == null || cents < 0) return 'Price varies';
  const symbol = getSymbol(countryCode);
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

/**
 * Format a zero amount (e.g. for fallback when no earning data). Defaults to CA$.
 */
export function formatZero(countryCode?: string | null): string {
  return formatPriceCents(0, countryCode);
}
