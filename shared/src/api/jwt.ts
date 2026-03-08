/**
 * Decode a JWT payload without verifying (for UI display only).
 * The API verifies the token when you send it.
 */
export interface JwtPayloadDecoded {
  sub: string;
  email?: string;
  role?: string;
  locale?: string;
  name?: string;
  trainerId?: string;
  exp?: number;
  iat?: number;
}

export function decodeJwtPayload(token: string): JwtPayloadDecoded | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JwtPayloadDecoded;
  } catch {
    return null;
  }
}
