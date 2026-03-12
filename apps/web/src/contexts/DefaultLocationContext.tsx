'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { customerApi } from '@/lib/api';

const SELECTED_LOCATION_STORAGE_KEY = 'groupfit_selected_location_id';

export type DefaultLocation = {
  id: string;
  label: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type ContextValue = {
  /** All customer locations (for dropdown). */
  locations: DefaultLocation[];
  /** Currently selected location (used across screens). */
  selectedLocation: DefaultLocation | null;
  setSelectedLocation: (loc: DefaultLocation | null) => void;
  setSelectedLocationById: (id: string | null) => void;
  /** @deprecated Use selectedLocation. Kept for backward compatibility. */
  defaultLocation: DefaultLocation | null;
  setDefaultLocation: (loc: DefaultLocation | null) => void;
  clearDefaultLocation: () => void;
  isLoading: boolean;
  refetchDefaultLocation: () => void;
  refetchLocations: () => void;
};

const DefaultLocationContext = createContext<ContextValue | null>(null);

function entryToLocation(entry: {
  id: string;
  label: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}): DefaultLocation {
  return {
    id: entry.id,
    label: entry.label,
    address: entry.address ?? null,
    latitude: entry.latitude ?? null,
    longitude: entry.longitude ?? null,
  };
}

export function DefaultLocationProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocationsState] = useState<DefaultLocation[]>([]);
  const [selectedLocation, setSelectedLocationState] = useState<DefaultLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchLocations = useCallback(() => {
    customerApi
      .customerServiceList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        const list = (data?.customerServiceList ?? data?.list) as
          | {
              id: string;
              label: string;
              address?: string;
              latitude?: number;
              longitude?: number;
              isDefault?: boolean;
            }[]
          | undefined;
        const locs = Array.isArray(list) ? list.map(entryToLocation) : [];
        setLocationsState(locs);

        const defaultEntry = Array.isArray(list) ? list.find((r) => r.isDefault) : undefined;
        const storedId =
          typeof window !== 'undefined'
            ? localStorage.getItem(SELECTED_LOCATION_STORAGE_KEY)
            : null;

        let next: DefaultLocation | null = null;
        if (storedId && locs.some((l) => l.id === storedId)) {
          next = locs.find((l) => l.id === storedId) ?? null;
        } else if (defaultEntry) {
          next = entryToLocation(defaultEntry);
        } else if (locs.length > 0) {
          next = locs[0];
        }
        setSelectedLocationState(next);
        if (typeof window !== 'undefined' && next) {
          localStorage.setItem(SELECTED_LOCATION_STORAGE_KEY, next.id);
        }
      })
      .catch(() => {
        setLocationsState([]);
        setSelectedLocationState(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const refetchDefaultLocation = refetchLocations;

  useEffect(() => {
    refetchLocations();
  }, [refetchLocations]);

  const setSelectedLocation = useCallback((loc: DefaultLocation | null) => {
    setSelectedLocationState(loc);
    if (typeof window !== 'undefined') {
      if (loc) localStorage.setItem(SELECTED_LOCATION_STORAGE_KEY, loc.id);
      else localStorage.removeItem(SELECTED_LOCATION_STORAGE_KEY);
    }
  }, []);

  const setSelectedLocationById = useCallback(
    (id: string | null) => {
      if (!id) {
        setSelectedLocationState(null);
        if (typeof window !== 'undefined') localStorage.removeItem(SELECTED_LOCATION_STORAGE_KEY);
        return;
      }
      const loc = locations.find((l) => l.id === id) ?? null;
      setSelectedLocation(loc);
    },
    [locations, setSelectedLocation]
  );

  const clearDefaultLocation = useCallback(() => {
    setSelectedLocationState(null);
    if (typeof window !== 'undefined') localStorage.removeItem(SELECTED_LOCATION_STORAGE_KEY);
  }, []);

  const value: ContextValue = {
    locations,
    selectedLocation,
    setSelectedLocation,
    setSelectedLocationById,
    defaultLocation: selectedLocation,
    setDefaultLocation: setSelectedLocation,
    clearDefaultLocation,
    isLoading,
    refetchDefaultLocation: refetchLocations,
    refetchLocations,
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
