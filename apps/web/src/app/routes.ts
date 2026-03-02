/**
 * Central route config: which paths exist and are implemented.
 * Use this to avoid linking to non-existent routes (404s).
 * Add paths here when you create the corresponding page.
 */
export const ROUTES = {
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  profile: '/profile',
  account: '/account',
  help: '/help',
  // Add below when pages exist; then use in profile/nav
  // profileEdit: '/profile/edit',
  // groups: '/groups',
  // paymentHistory: '/payment-history',
  // refer: '/refer',
  // locations: '/locations',
  // notifications: '/notifications',
  // availability: '/availability',
  // activities: '/activities',
  // activityArea: '/activity-area',
  // certificates: '/certificates',
  // bankDetails: '/bank-details',
  // reviews: '/reviews',
  // earning: '/earning',
} as const;

/** Paths that have a real page (no 404). Use for <Link href={}> only when true. */
export const IMPLEMENTED = new Set<string>([
  ROUTES.login,
  ROUTES.signup,
  ROUTES.dashboard,
  ROUTES.profile,
  ROUTES.account,
  ROUTES.help,
  '/coming-soon',
]);

/** Use for profile/nav: link to path if implemented, else to placeholder. */
export function getProfileLink(path: string): string {
  return IMPLEMENTED.has(path) ? path : '/coming-soon';
}
