'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { TrainerLayout } from '../TrainerLayout';
import { trainerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { getApiErrorMessage } from '@groupfit/shared';
import { COUNTRY_CODES, type CountryCode } from '@groupfit/shared';

/** Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local to enable address autocomplete (Places API). */
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

type ServiceAreaItem = {
  id: string;
  label: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  isActive: boolean;
  createdAt: string;
};

export default function ActivityAreaPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ServiceAreaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ServiceAreaItem | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLatitude, setFormLatitude] = useState<string>('');
  const [formLongitude, setFormLongitude] = useState<string>('');
  const [formRadiusKm, setFormRadiusKm] = useState<string>('');
  const [formCountryCode, setFormCountryCode] = useState('');
  const [locationEntryMethod, setLocationEntryMethod] = useState<'google' | 'manual'>('manual');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<unknown>(null);

  const fetchList = () => {
    trainerApi
      .trainerServiceList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          const areaList = (data?.trainerServiceList ?? data?.list) as
            | ServiceAreaItem[]
            | undefined;
          setList(areaList ?? []);
          setError(null);
        }
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to load service areas'));
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Google Places Autocomplete for service area address (only when "Search with Google", restricted by country)
  useEffect(() => {
    if (
      !showForm ||
      !GOOGLE_MAPS_API_KEY ||
      locationEntryMethod !== 'google' ||
      !addressInputRef.current
    )
      return;

    const input = addressInputRef.current;
    const country = formCountryCode?.trim().toLowerCase();
    const componentRestrictions = country ? { country } : undefined;

    function initAutocomplete() {
      const win =
        typeof window !== 'undefined'
          ? (window as unknown as {
              google?: {
                maps: {
                  places: {
                    Autocomplete: new (
                      el: HTMLInputElement,
                      opts?: { types?: string[]; componentRestrictions?: { country: string } }
                    ) => {
                      addListener: (ev: string, fn: () => void) => void;
                      getPlace: () => {
                        formatted_address?: string;
                        geometry?: { location: { lat: () => number; lng: () => number } };
                      };
                    };
                  };
                };
              };
            })
          : null;
      const g = win?.google;
      if (!g?.maps?.places?.Autocomplete) return;
      const Autocomplete = g.maps.places.Autocomplete;
      const autocomplete = new Autocomplete(input, {
        types: ['address'],
        ...(componentRestrictions && { componentRestrictions }),
      });
      autocompleteRef.current = autocomplete;
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) setFormAddress(place.formatted_address);
        if (place.geometry?.location) {
          setFormLatitude(String(place.geometry.location.lat()));
          setFormLongitude(String(place.geometry.location.lng()));
        }
      });
    }

    if ((window as unknown as { google?: unknown }).google) {
      initAutocomplete();
      return () => {
        autocompleteRef.current = null;
      };
    }

    const scriptId = 'google-maps-places-script';
    if (document.getElementById(scriptId)) {
      const win = window as unknown as { google?: unknown };
      if (win.google) {
        initAutocomplete();
      } else {
        const retry = setInterval(() => {
          if ((window as unknown as { google?: unknown }).google) {
            clearInterval(retry);
            initAutocomplete();
          }
        }, 100);
        return () => {
          clearInterval(retry);
          autocompleteRef.current = null;
        };
      }
      return () => {
        autocompleteRef.current = null;
      };
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initAutocomplete();
    document.head.appendChild(script);
    return () => {
      autocompleteRef.current = null;
    };
  }, [showForm, locationEntryMethod, formCountryCode]);

  const openAdd = () => {
    setEditing(null);
    setFormLabel('');
    setFormAddress('');
    setFormLatitude('');
    setFormLongitude('');
    setFormRadiusKm('');
    setFormCountryCode('');
    setLocationEntryMethod('manual');
    setShowForm(true);
  };

  const openEdit = (row: ServiceAreaItem) => {
    setEditing(row);
    setFormLabel(row.label);
    setFormAddress(row.address ?? '');
    setFormLatitude(row.latitude != null ? String(row.latitude) : '');
    setFormLongitude(row.longitude != null ? String(row.longitude) : '');
    setFormRadiusKm(row.radiusKm != null ? String(row.radiusKm) : '');
    setFormCountryCode('');
    setLocationEntryMethod('manual');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormLabel('');
    setFormAddress('');
    setFormLatitude('');
    setFormLongitude('');
    setFormRadiusKm('');
    setFormCountryCode('');
    setLocationEntryMethod('manual');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = formLabel.trim();
    if (!label) return;
    const address = formAddress.trim();
    if (!address) {
      setError('Address is required. Please choose a location from the suggestions.');
      return;
    }
    const radiusRaw = formRadiusKm.trim();
    if (!radiusRaw) {
      setError('Travel radius (km) is required.');
      return;
    }
    const radius = Number(radiusRaw);
    if (Number.isNaN(radius) || radius < 0 || radius > 100) {
      setError('Please enter a valid travel radius between 0 and 100 km.');
      return;
    }
    setSubmitLoading(true);
    setError(null);
    const lat = formLatitude.trim() ? Number(formLatitude) : null;
    const lng = formLongitude.trim() ? Number(formLongitude) : null;
    if (editing) {
      trainerApi
        .editTrainerService({
          id: editing.id,
          label,
          address,
          latitude: lat,
          longitude: lng,
          radiusKm: radius,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeForm();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Update failed'));
          }
        })
        .catch(() => setError('Update failed'))
        .finally(() => setSubmitLoading(false));
    } else {
      trainerApi
        .addTrainerService({
          label,
          address,
          latitude: lat,
          longitude: lng,
          radiusKm: radius,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeForm();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Add failed'));
          }
        })
        .catch((err) => setError(getApiErrorMessage(err, 'Add failed')))
        .finally(() => setSubmitLoading(false));
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this service area?')) return;
    setActionId(id);
    trainerApi
      .deleteTrainerService(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Delete failed')))
      .finally(() => setActionId(null));
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    setActionId(id);
    trainerApi
      .serviceAreaOnOff(id, !currentActive)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Update failed'));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Update failed')))
      .finally(() => setActionId(null));
  };

  return (
    <TrainerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">Service areas</span>
      </header>

      <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
        Define where you offer sessions. Customers can find you in these areas. Toggle an area off
        to hide it from search.
      </p>

      <Link
        href={ROUTES.dashboard}
        style={{
          fontSize: 14,
          color: 'var(--groupfit-secondary)',
          fontWeight: 600,
          marginBottom: 16,
          display: 'inline-block',
        }}
      >
        ← Dashboard
      </Link>

      {error && <p style={{ color: '#c00', marginBottom: 16 }}>{error}</p>}

      <button
        type="button"
        onClick={openAdd}
        style={{
          marginBottom: 20,
          padding: '10px 16px',
          borderRadius: 8,
          border: 'none',
          background: 'var(--groupfit-secondary)',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Add service area
      </button>

      {showForm && (
        <div
          style={{
            marginBottom: 24,
            padding: 20,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
            {editing ? 'Edit service area' : 'New service area'}
          </h2>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Label *
            </label>
            <input
              type="text"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder="e.g. Downtown, North Side"
              required
              style={{
                padding: 8,
                width: '100%',
                maxWidth: 280,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Country
            </label>
            <select
              value={formCountryCode}
              onChange={(e) => setFormCountryCode(e.target.value)}
              style={{
                padding: 8,
                width: '100%',
                maxWidth: 280,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            >
              <option value="">Select country</option>
              {(COUNTRY_CODES as CountryCode[]).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <p
              style={{
                fontSize: 14,
                color: 'var(--groupfit-secondary)',
                marginBottom: 8,
                marginTop: 0,
              }}
            >
              How would you like to enter the address?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => GOOGLE_MAPS_API_KEY && setLocationEntryMethod('google')}
                disabled={!GOOGLE_MAPS_API_KEY}
                style={{
                  padding: '12px 14px',
                  textAlign: 'left',
                  border:
                    locationEntryMethod === 'google'
                      ? '2px solid var(--groupfit-primary, #1976d2)'
                      : '1px solid var(--groupfit-border-light, #ccc)',
                  borderRadius: 8,
                  background:
                    locationEntryMethod === 'google'
                      ? 'var(--groupfit-primary-light, #e3f2fd)'
                      : 'transparent',
                  cursor: GOOGLE_MAPS_API_KEY ? 'pointer' : 'not-allowed',
                  fontSize: 13,
                  fontWeight: 600,
                  opacity: GOOGLE_MAPS_API_KEY ? 1 : 0.7,
                }}
              >
                Search with Google
              </button>
              <button
                type="button"
                onClick={() => setLocationEntryMethod('manual')}
                style={{
                  padding: '12px 14px',
                  textAlign: 'left',
                  border:
                    locationEntryMethod === 'manual'
                      ? '2px solid var(--groupfit-primary, #1976d2)'
                      : '1px solid var(--groupfit-border-light, #ccc)',
                  borderRadius: 8,
                  background:
                    locationEntryMethod === 'manual'
                      ? 'var(--groupfit-primary-light, #e3f2fd)'
                      : 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Enter manually
              </button>
            </div>
            {locationEntryMethod === 'google' && GOOGLE_MAPS_API_KEY && (
              <div
                style={{
                  padding: 12,
                  marginBottom: 12,
                  background: 'var(--groupfit-border-light, #f5f5f5)',
                  borderRadius: 8,
                }}
              >
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                  Search for address
                </label>
                <input
                  ref={addressInputRef}
                  type="text"
                  placeholder={
                    formCountryCode
                      ? `e.g. 123 Main St, ${(COUNTRY_CODES as CountryCode[]).find((c) => c.code === formCountryCode)?.name ?? formCountryCode}`
                      : 'Select a country above, then type address'
                  }
                  autoComplete="off"
                  style={{
                    padding: 10,
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 6,
                    border: '1px solid var(--groupfit-border-light)',
                  }}
                />
                {formCountryCode ? (
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--groupfit-secondary)',
                      marginTop: 6,
                      marginBottom: 0,
                    }}
                  >
                    Suggestions limited to{' '}
                    {(COUNTRY_CODES as CountryCode[]).find((c) => c.code === formCountryCode)
                      ?.name ?? formCountryCode}
                    .
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--groupfit-secondary)',
                      marginTop: 6,
                      marginBottom: 0,
                    }}
                  >
                    Select a country above to narrow search.
                  </p>
                )}
              </div>
            )}
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Address *
            </label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Street, city"
              required
              autoComplete="off"
              style={{
                padding: 8,
                width: '100%',
                maxWidth: 400,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Travel radius (km) *
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={formRadiusKm}
              onChange={(e) => setFormRadiusKm(e.target.value)}
              placeholder="How far you'll travel from this location (0–100)"
              required
              style={{
                padding: 8,
                width: 120,
                marginBottom: 6,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={submitLoading}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--groupfit-secondary)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: submitLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {submitLoading ? 'Saving…' : editing ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #666',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : list.length === 0 ? (
        <div className="gf-home__empty">No service areas yet. Add one above.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {list.map((row) => (
            <li
              key={row.id}
              style={{
                padding: 16,
                marginBottom: 12,
                border: '1px solid var(--groupfit-border-light)',
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.label}</div>
                  {row.address && (
                    <div style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 4 }}>
                      {row.address}
                    </div>
                  )}
                  {(row.latitude != null || row.longitude != null) && (
                    <div style={{ fontSize: 12, color: 'var(--groupfit-grey)' }}>
                      {row.latitude}, {row.longitude}
                      {row.radiusKm != null ? ` · ${row.radiusKm} km` : ''}
                    </div>
                  )}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: row.isActive ? 'var(--groupfit-secondary)' : 'var(--groupfit-grey)',
                    }}
                  >
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(row.id, row.isActive)}
                    disabled={actionId === row.id}
                    style={{
                      padding: '6px 12px',
                      fontSize: 13,
                      borderRadius: 6,
                      border: '1px solid var(--groupfit-secondary)',
                      background: row.isActive ? 'var(--groupfit-secondary)' : '#fff',
                      color: row.isActive ? '#fff' : 'var(--groupfit-secondary)',
                      cursor: actionId === row.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {actionId === row.id ? '…' : row.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    style={{
                      padding: '6px 12px',
                      fontSize: 13,
                      borderRadius: 6,
                      border: '1px solid var(--groupfit-secondary)',
                      background: '#fff',
                      color: 'var(--groupfit-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    disabled={actionId === row.id}
                    style={{
                      padding: '6px 12px',
                      fontSize: 13,
                      borderRadius: 6,
                      border: '1px solid #c00',
                      background: '#fff',
                      color: '#c00',
                      cursor: actionId === row.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {actionId === row.id ? '…' : 'Remove'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </TrainerLayout>
  );
}
