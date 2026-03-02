/**
 * Global GroupFit theme colors (aligned with newCustomer / newTrainer).
 * Use in web and RN for consistent branding.
 */
export const colors = {
  /** Dark primary (e.g. trainer login bg) */
  primaryDark: '#161639',
  /** Light primary (e.g. customer login bg, white) */
  primaryLight: '#FFFFFF',
  /** Brand red (CTA button, links) */
  secondary: '#E21B22',
  /** Logo blue */
  blue: '#000033',
  /** Grey text / secondary text */
  grey: '#777777',
  greyDark: '#57585A',
  /** Black text on light bg */
  black: '#060606',
  blackAlt: '#222222',
  /** White text on dark bg */
  white: '#FFFFFF',
  /** Placeholder */
  placeholder: 'rgba(6, 6, 6, 0.3)',
  placeholderDark: 'rgba(255, 255, 255, 0.5)',
  /** Border */
  border: 'rgba(255, 255, 255, 0.8)',
  borderLight: 'rgba(44, 44, 46, 0.4)',
  /** Error / inactive */
  error: '#EC3D3D',
  /** Success / active */
  success: '#07AF36',
} as const;

export type ThemeColors = typeof colors;
