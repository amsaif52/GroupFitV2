'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '../CustomerLayout';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { getApiErrorMessage } from '@groupfit/shared';
import { useDefaultLocation } from '@/contexts/DefaultLocationContext';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

type LocationItem = {
  id: string;
  label: string;
  address?: string;
  streetLine1?: string;
  streetLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  createdAt: string;
};

type InputMode = 'autocomplete' | 'manual';

type ParsedAddress = {
  streetLine1: string;
  streetLine2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
};

function getComponent(
  components: { long_name: string; short_name: string; types: string[] }[],
  type: string
): string {
  const c = components.find((x) => x.types.includes(type));
  return c?.long_name ?? '';
}

function parseAddressComponents(place: {
  address_components?: { long_name: string; short_name: string; types: string[] }[];
}): ParsedAddress {
  const comp = place.address_components ?? [];
  const streetNumber = getComponent(comp, 'street_number');
  const route = getComponent(comp, 'route');
  const streetLine1 = [streetNumber, route].filter(Boolean).join(' ').trim();
  const subpremise = getComponent(comp, 'subpremise');
  const streetLine2 = subpremise || getComponent(comp, 'premise') || '';
  return {
    streetLine1,
    streetLine2,
    city:
      getComponent(comp, 'locality') ||
      getComponent(comp, 'sublocality') ||
      getComponent(comp, 'sublocality_level_1'),
    stateProvince: getComponent(comp, 'administrative_area_level_1'),
    postalCode: getComponent(comp, 'postal_code'),
    country: getComponent(comp, 'country'),
  };
}

function formatAddressFromParts(parts: {
  streetLine1?: string;
  streetLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
}): string {
  const arr = [
    parts.streetLine1,
    parts.streetLine2,
    parts.city,
    parts.stateProvince,
    parts.postalCode,
    parts.country,
  ].filter(Boolean);
  return arr.join(', ');
}

export default function LocationsPage() {
  const { defaultLocation, setDefaultLocation, clearDefaultLocation } = useDefaultLocation();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<LocationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('autocomplete');
  const [editing, setEditing] = useState<LocationItem | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formStreetLine1, setFormStreetLine1] = useState('');
  const [formStreetLine2, setFormStreetLine2] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formStateProvince, setFormStateProvince] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formLatitude, setFormLatitude] = useState<string>('');
  const [formLongitude, setFormLongitude] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<unknown>(null);

  const fetchList = () => {
    customerApi
      .customerServiceList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          const locations =
            (data?.customerServiceList as LocationItem[]) ?? (data?.list as LocationItem[]) ?? [];
          setList(locations);
          setError(null);
          const defaultLoc = locations.find((l) => l.isDefault);
          if (defaultLoc) {
            setDefaultLocation({
              id: defaultLoc.id,
              label: defaultLoc.label,
              address: defaultLoc.address,
              latitude: defaultLoc.latitude,
              longitude: defaultLoc.longitude,
            });
          }
        }
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to load locations'));
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (
      !showForm ||
      inputMode !== 'autocomplete' ||
      !GOOGLE_MAPS_API_KEY ||
      !addressInputRef.current
    )
      return;
    const input = addressInputRef.current;

    function initAutocomplete() {
      const win =
        typeof window !== 'undefined'
          ? (window as unknown as {
              google?: {
                maps: {
                  places: {
                    Autocomplete: new (
                      el: HTMLInputElement,
                      opts?: { types?: string[] }
                    ) => {
                      addListener: (ev: string, fn: () => void) => void;
                      getPlace: (cb: (place: unknown) => void) => void;
                    };
                  };
                };
              };
            })
          : null;
      const g = win?.google;
      if (!g?.maps?.places?.Autocomplete) return;
      const Autocomplete = g.maps.places.Autocomplete;
      const autocomplete = new Autocomplete(input, { types: ['address'] });
      autocompleteRef.current = autocomplete;
      autocomplete.addListener('place_changed', () => {
        const place = (autocomplete as unknown as { getPlace?: () => unknown }).getPlace?.();
        if (!place || typeof place !== 'object') return;
        const p = place as {
          formatted_address?: string;
          address_components?: { long_name: string; short_name: string; types: string[] }[];
          geometry?: { location: { lat: () => number; lng: () => number } };
        };
        if (p.formatted_address) setFormAddress(p.formatted_address);
        const parsed = parseAddressComponents(p);
        setFormStreetLine1(parsed.streetLine1);
        setFormStreetLine2(parsed.streetLine2);
        setFormCity(parsed.city);
        setFormStateProvince(parsed.stateProvince);
        setFormPostalCode(parsed.postalCode);
        setFormCountry(parsed.country);
        if (p.geometry?.location) {
          setFormLatitude(String(p.geometry.location.lat()));
          setFormLongitude(String(p.geometry.location.lng()));
        }
      });
    }

    if ((window as unknown as { google?: unknown }).google) {
      initAutocomplete();
      return () => {
        autocompleteRef.current = null;
      };
    }
    const scriptId = 'google-maps-places-locations';
    if (document.getElementById(scriptId)) {
      if ((window as unknown as { google?: unknown }).google) initAutocomplete();
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
  }, [showForm, inputMode]);

  const openAdd = () => {
    setEditing(null);
    setFormLabel('');
    setFormAddress('');
    setFormStreetLine1('');
    setFormStreetLine2('');
    setFormCity('');
    setFormStateProvince('');
    setFormPostalCode('');
    setFormCountry('');
    setFormLatitude('');
    setFormLongitude('');
    setInputMode('autocomplete');
    setShowForm(true);
  };

  const openEdit = (row: LocationItem) => {
    setEditing(row);
    setFormLabel(row.label);
    setFormAddress(row.address ?? '');
    setFormStreetLine1(row.streetLine1 ?? '');
    setFormStreetLine2(row.streetLine2 ?? '');
    setFormCity(row.city ?? '');
    setFormStateProvince(row.stateProvince ?? '');
    setFormPostalCode(row.postalCode ?? '');
    setFormCountry(row.country ?? '');
    setFormLatitude(row.latitude != null ? String(row.latitude) : '');
    setFormLongitude(row.longitude != null ? String(row.longitude) : '');
    setInputMode(GOOGLE_MAPS_API_KEY ? 'autocomplete' : 'manual');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormLabel('');
    setFormAddress('');
    setFormStreetLine1('');
    setFormStreetLine2('');
    setFormCity('');
    setFormStateProvince('');
    setFormPostalCode('');
    setFormCountry('');
    setFormLatitude('');
    setFormLongitude('');
  };

  const getSubmitPayload = () => {
    const lat = formLatitude.trim() ? Number(formLatitude) : null;
    const lng = formLongitude.trim() ? Number(formLongitude) : null;
    const address =
      formAddress.trim() ||
      formatAddressFromParts({
        streetLine1: formStreetLine1.trim() || undefined,
        streetLine2: formStreetLine2.trim() || undefined,
        city: formCity.trim() || undefined,
        stateProvince: formStateProvince.trim() || undefined,
        postalCode: formPostalCode.trim() || undefined,
        country: formCountry.trim() || undefined,
      });
    return {
      label: formLabel.trim(),
      address: address || null,
      streetLine1: formStreetLine1.trim() || null,
      streetLine2: formStreetLine2.trim() || null,
      city: formCity.trim() || null,
      stateProvince: formStateProvince.trim() || null,
      postalCode: formPostalCode.trim() || null,
      country: formCountry.trim() || null,
      latitude: lat,
      longitude: lng,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    const payload = getSubmitPayload();
    if (editing) {
      customerApi
        .editCustomerService({ locationId: editing.id, ...payload })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeForm();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Update failed'));
          }
        })
        .catch((err) => setError(getApiErrorMessage(err, 'Update failed')))
        .finally(() => setSubmitLoading(false));
    } else {
      customerApi
        .addCustomerService(payload)
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

  const handleSetDefault = (row: LocationItem) => {
    setActionId(row.id);
    customerApi
      .setDefaultCustomerLocation(row.id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setDefaultLocation({
            id: row.id,
            label: row.label,
            address: row.address,
            latitude: row.latitude,
            longitude: row.longitude,
          });
          fetchList();
        } else {
          setError(String(data?.message ?? 'Failed to set default'));
        }
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to set default'));
      })
      .finally(() => setActionId(null));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this location?')) return;
    setActionId(id);
    customerApi
      .deleteCustomerService(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          if (defaultLocation?.id === id) clearDefaultLocation();
          fetchList();
        } else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Delete failed')))
      .finally(() => setActionId(null));
  };

  const displayAddress = (row: LocationItem) =>
    row.address ||
    formatAddressFromParts({
      streetLine1: row.streetLine1,
      streetLine2: row.streetLine2,
      city: row.city,
      stateProvince: row.stateProvince,
      postalCode: row.postalCode,
      country: row.country,
    });

  return (
    <CustomerLayout>
      <header className="gf-home__header gf-locations__header">
        <span className="gf-home__logo">My Locations</span>
        <div className="gf-home__header-actions">
          <Link
            href={ROUTES.notifications}
            className="gf-home__header-link"
            aria-label="Notifications"
          >
            🔔
          </Link>
          <button
            type="button"
            onClick={openAdd}
            className="gf-locations__add-btn gf-locations__add-btn--header"
          >
            + Add location
          </button>
        </div>
      </header>

      <div className="gf-locations">
        <p className="gf-locations__intro">
          Saved addresses for sessions. Add with Google search or enter manually. Choose a default.
        </p>

        <Link href={ROUTES.profile} className="gf-locations__back">
          ← Profile
        </Link>

        {error && (
          <div className="gf-locations__error" role="alert">
            {error}
          </div>
        )}

        {showForm && (
          <div
            className="gf-locations-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gf-locations-modal-title"
          >
            <div className="gf-locations-modal__backdrop" onClick={closeForm} aria-hidden />
            <div
              className="gf-locations-modal__box"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="gf-locations-modal__close"
                onClick={closeForm}
                aria-label="Close"
              >
                ×
              </button>
              <div className="gf-locations-form">
                <h2 id="gf-locations-modal-title" className="gf-locations-form__title">
                  {editing ? 'Edit location' : 'New location'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <label className="gf-locations-form__label" htmlFor="locations-label">
                    Label *
                  </label>
                  <input
                    id="locations-label"
                    type="text"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="e.g. Home, Gym"
                    required
                    className="gf-locations-form__input gf-locations-form__input--narrow"
                  />

                  <div className="gf-locations-form__section">
                    <span className="gf-locations-form__section-title">Address</span>
                    {!GOOGLE_MAPS_API_KEY && (
                      <p className="gf-locations-form__hint">
                        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to use address search.
                      </p>
                    )}
                    <div className="gf-locations-form__tabs" role="tablist">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={inputMode === 'autocomplete'}
                        className={`gf-locations-form__tab${inputMode === 'autocomplete' ? ' gf-locations-form__tab--active' : ''}`}
                        onClick={() => setInputMode('autocomplete')}
                      >
                        Search with Google
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={inputMode === 'manual'}
                        className={`gf-locations-form__tab${inputMode === 'manual' ? ' gf-locations-form__tab--active' : ''}`}
                        onClick={() => setInputMode('manual')}
                      >
                        Enter manually
                      </button>
                    </div>

                    {inputMode === 'autocomplete' ? (
                      <>
                        <label
                          className="gf-locations-form__label"
                          htmlFor="locations-address-search"
                        >
                          {GOOGLE_MAPS_API_KEY ? 'Search address' : 'Address'}
                        </label>
                        <input
                          id="locations-address-search"
                          ref={addressInputRef}
                          type="text"
                          value={formAddress}
                          onChange={(e) => setFormAddress(e.target.value)}
                          placeholder={
                            GOOGLE_MAPS_API_KEY ? 'Start typing address…' : 'Street, city'
                          }
                          autoComplete="off"
                          className="gf-locations-form__input"
                        />
                        <p className="gf-locations-form__hint">
                          Selecting an address fills street, city, state, country and coordinates.
                        </p>
                      </>
                    ) : (
                      <div className="gf-locations-form__grid">
                        <div className="gf-locations-form__field gf-locations-form__field--full">
                          <label className="gf-locations-form__label">Street line 1 *</label>
                          <input
                            type="text"
                            value={formStreetLine1}
                            onChange={(e) => setFormStreetLine1(e.target.value)}
                            placeholder="Street number and name"
                            className="gf-locations-form__input"
                          />
                        </div>
                        <div className="gf-locations-form__field gf-locations-form__field--full">
                          <label className="gf-locations-form__label">Street line 2</label>
                          <input
                            type="text"
                            value={formStreetLine2}
                            onChange={(e) => setFormStreetLine2(e.target.value)}
                            placeholder="Apt, suite, unit, building (optional)"
                            className="gf-locations-form__input"
                          />
                        </div>
                        <div className="gf-locations-form__field">
                          <label className="gf-locations-form__label">City *</label>
                          <input
                            type="text"
                            value={formCity}
                            onChange={(e) => setFormCity(e.target.value)}
                            placeholder="City"
                            className="gf-locations-form__input"
                          />
                        </div>
                        <div className="gf-locations-form__field">
                          <label className="gf-locations-form__label">State / Province</label>
                          <input
                            type="text"
                            value={formStateProvince}
                            onChange={(e) => setFormStateProvince(e.target.value)}
                            placeholder="State or province"
                            className="gf-locations-form__input"
                          />
                        </div>
                        <div className="gf-locations-form__field">
                          <label className="gf-locations-form__label">Postal code</label>
                          <input
                            type="text"
                            value={formPostalCode}
                            onChange={(e) => setFormPostalCode(e.target.value)}
                            placeholder="ZIP / postal code"
                            className="gf-locations-form__input"
                          />
                        </div>
                        <div className="gf-locations-form__field">
                          <label className="gf-locations-form__label">Country</label>
                          <input
                            type="text"
                            value={formCountry}
                            onChange={(e) => setFormCountry(e.target.value)}
                            placeholder="Country"
                            className="gf-locations-form__input"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="gf-locations-form__actions">
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="gf-locations-btn gf-locations-btn--primary"
                    >
                      {submitLoading ? 'Saving…' : editing ? 'Update' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="gf-locations-btn gf-locations-btn--secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="gf-locations-loading">Loading…</p>
        ) : list.length === 0 ? (
          <div className="gf-home__empty">No saved locations. Add one above.</div>
        ) : (
          <ul className="gf-locations-list">
            {list.map((row) => (
              <li key={row.id} className="gf-locations-card">
                <div className="gf-locations-card__head">
                  <span className="gf-locations-card__title">{row.label}</span>
                  {(row.isDefault || defaultLocation?.id === row.id) && (
                    <span className="gf-locations-card__badge">Default</span>
                  )}
                </div>
                {displayAddress(row) && (
                  <div className="gf-locations-card__address">{displayAddress(row)}</div>
                )}
                <div className="gf-locations-card__actions">
                  <button
                    type="button"
                    onClick={() => handleSetDefault(row)}
                    disabled={
                      actionId === row.id || (row.isDefault ?? defaultLocation?.id === row.id)
                    }
                    className={`gf-locations-card-btn gf-locations-card-btn--default${row.isDefault || defaultLocation?.id === row.id ? ' is-active' : ''}`}
                  >
                    {row.isDefault || defaultLocation?.id === row.id
                      ? 'Default address'
                      : 'Set as default'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="gf-locations-card-btn gf-locations-card-btn--outline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    disabled={actionId === row.id}
                    className="gf-locations-card-btn gf-locations-card-btn--danger"
                  >
                    {actionId === row.id ? '…' : 'Remove'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerLayout>
  );
}
