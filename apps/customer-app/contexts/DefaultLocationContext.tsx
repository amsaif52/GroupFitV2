import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  setDefaultLocation: (loc: DefaultLocation | null) => Promise<void>;
  clearDefaultLocation: () => Promise<void>;
  isLoading: boolean;
};

const DefaultLocationContext = createContext<ContextValue | null>(null);

export function DefaultLocationProvider({ children }: { children: React.ReactNode }) {
  const [defaultLocation, setDefaultLocationState] = useState<DefaultLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        try {
          const parsed = raw ? (JSON.parse(raw) as DefaultLocation) : null;
          if (parsed && typeof parsed.id === 'string' && typeof parsed.label === 'string') {
            setDefaultLocationState(parsed);
          } else {
            setDefaultLocationState(null);
          }
        } catch {
          setDefaultLocationState(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setDefaultLocation = useCallback(async (loc: DefaultLocation | null) => {
    if (loc) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      setDefaultLocationState(loc);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setDefaultLocationState(null);
    }
  }, []);

  const clearDefaultLocation = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
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
