'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useDefaultLocation } from '@/contexts/DefaultLocationContext';
import { ROUTES } from '@/app/routes';

/**
 * Location dropdown for use in gf-home__header (blue header).
 * Renders next to the Notifications button. Shows selected location or "Add location" link.
 */
export function LocationDropdown() {
  const { locations, selectedLocation, setSelectedLocationById, isLoading } = useDefaultLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (isLoading) {
    return (
      <span className="gf-home__location-trigger gf-home__location-trigger--muted">
        📍 Loading…
      </span>
    );
  }

  if (locations.length === 0) {
    return (
      <Link href={ROUTES.locations} className="gf-home__location-add">
        📍 Add location
      </Link>
    );
  }

  return (
    <div className="gf-home__location-dropdown" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="gf-home__location-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select location"
      >
        <span>📍 {selectedLocation?.label ?? 'Choose location'}</span>
        <span className="gf-home__location-chevron" aria-hidden>
          ▼
        </span>
      </button>
      {open && (
        <div className="gf-home__location-panel" role="listbox" aria-label="Locations">
          {locations.map((loc) => (
            <button
              key={loc.id}
              type="button"
              role="option"
              aria-selected={selectedLocation?.id === loc.id}
              className={`gf-home__location-option${selectedLocation?.id === loc.id ? ' is-selected' : ''}`}
              onClick={() => {
                setSelectedLocationById(loc.id);
                setOpen(false);
              }}
            >
              {loc.label}
            </button>
          ))}
          <Link
            href={ROUTES.locations}
            className="gf-home__location-manage"
            onClick={() => setOpen(false)}
          >
            Manage locations →
          </Link>
        </div>
      )}
    </div>
  );
}
