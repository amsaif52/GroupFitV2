'use client';

import { useEffect, useState } from 'react';
import { decodeJwtPayload } from '@groupfit/shared';

const TOKEN_KEY = 'groupfit_token';
const VIEW_AS_KEY = 'groupfit_view_as';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VIEW_AS_KEY);
}

/** Which dashboard experience to show (for users who can be both customer and trainer, e.g. admin). */
export type ViewAs = 'customer' | 'trainer';

export function getStoredViewAs(): ViewAs | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(VIEW_AS_KEY);
  if (v === 'customer' || v === 'trainer') return v;
  return null;
}

export function setStoredViewAs(viewAs: ViewAs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VIEW_AS_KEY, viewAs);
}

export function clearStoredViewAs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VIEW_AS_KEY);
}

/** Decode the stored JWT to read user info (for UI only; API verifies the token). */
export function getStoredUser() {
  const token = getStoredToken();
  if (!token) return null;
  return decodeJwtPayload(token);
}

/**
 * Hook that returns stored user only after mount. Use this in client components to avoid
 * hydration mismatch: server and first client render both see user=null, then after
 * hydration we read localStorage and re-render with the real user.
 */
export function useStoredUser() {
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setUser(getStoredUser());
    setMounted(true);
  }, []);
  return { user, mounted };
}

/**
 * Hook that returns stored viewAs only after mount. Use with useStoredUser to avoid hydration mismatch.
 */
export function useStoredViewAs() {
  const [viewAs, setViewAs] = useState<ViewAs | null>(null);
  useEffect(() => {
    setViewAs(getStoredViewAs());
  }, []);
  return viewAs;
}
