'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'customer_default_location';

export type DefaultLocation = {
  id: string;
  label: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type ContextValue = {
  defaultLocation: DefaultLocation | null;
  setDefaultLocation: (loc: DefaultLocation | null) => void;
  clearDefaultLocation: () => void;
  isLoading: boolean;
};

const DefaultLocationContext = createContext<ContextValue | null>(null);

function getStored(): DefaultLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DefaultLocation;
    if (parsed && typeof parsed.id === 'string' && typeof parsed.label === 'string') return parsed;
  } catch {
    // ignore
  }
  return null;
}

export function DefaultLocationProvider({ children }: { children: React.ReactNode }) {
  const [defaultLocation, setDefaultLocationState] = useState<DefaultLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDefaultLocationState(getStored());
    setIsLoading(false);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setDefaultLocationState(getStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setDefaultLocation = useCallback((loc: DefaultLocation | null) => {
    if (loc) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      setDefaultLocationState(loc);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setDefaultLocationState(null);
    }
  }, []);

  const clearDefaultLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setDefaultLocationState(null);
  }, []);

  const value: ContextValue = {
    defaultLocation,
    setDefaultLocation,
    clearDefaultLocation,
    isLoading,
  };

  return (
    <DefaultLocationContext.Provider value={value}>{children}</DefaultLocationContext.Provider>
  );
}

export function useDefaultLocation(): ContextValue {
  const ctx = useContext(DefaultLocationContext);
  if (!ctx) throw new Error('useDefaultLocation must be used within DefaultLocationProvider');
  return ctx;
}
