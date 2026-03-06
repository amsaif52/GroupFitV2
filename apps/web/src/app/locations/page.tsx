'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '../CustomerLayout';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { getApiErrorMessage } from '@groupfit/shared';

type LocationItem = {
  id: string;
  label: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
};

export default function LocationsPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<LocationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LocationItem | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLatitude, setFormLatitude] = useState<string>('');
  const [formLongitude, setFormLongitude] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = () => {
    customerApi
      .customerServiceList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          setList(
            (data?.customerServiceList as LocationItem[]) ?? (data?.list as LocationItem[]) ?? []
          );
          setError(null);
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

  const openAdd = () => {
    setEditing(null);
    setFormLabel('');
    setFormAddress('');
    setFormLatitude('');
    setFormLongitude('');
    setShowForm(true);
  };

  const openEdit = (row: LocationItem) => {
    setEditing(row);
    setFormLabel(row.label);
    setFormAddress(row.address ?? '');
    setFormLatitude(row.latitude != null ? String(row.latitude) : '');
    setFormLongitude(row.longitude != null ? String(row.longitude) : '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormLabel('');
    setFormAddress('');
    setFormLatitude('');
    setFormLongitude('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    const lat = formLatitude.trim() ? Number(formLatitude) : null;
    const lng = formLongitude.trim() ? Number(formLongitude) : null;
    if (editing) {
      customerApi
        .editCustomerService({
          locationId: editing.id,
          label: formLabel.trim(),
          address: formAddress.trim() || null,
          latitude: lat,
          longitude: lng,
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
        .catch((err) => setError(getApiErrorMessage(err, 'Update failed')))
        .finally(() => setSubmitLoading(false));
    } else {
      customerApi
        .addCustomerService({
          label: formLabel.trim(),
          address: formAddress.trim() || null,
          latitude: lat,
          longitude: lng,
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
    if (!confirm('Remove this location?')) return;
    setActionId(id);
    customerApi
      .deleteCustomerService(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Delete failed')))
      .finally(() => setActionId(null));
  };

  return (
    <CustomerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">My Locations</span>
        <div className="gf-home__header-actions">
          <Link
            href={ROUTES.notifications}
            className="gf-home__header-link"
            aria-label="Notifications"
          >
            🔔
          </Link>
        </div>
      </header>

      <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
        Saved addresses for sessions. Add, edit, or remove locations.
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
        Add location
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
            {editing ? 'Edit location' : 'New location'}
          </h2>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Label
            </label>
            <input
              type="text"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder="e.g. Home, Gym"
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
              Address (optional)
            </label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Street, city"
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
              Latitude / Longitude (optional)
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                value={formLatitude}
                onChange={(e) => setFormLatitude(e.target.value)}
                placeholder="Lat"
                style={{
                  padding: 8,
                  width: 120,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              />
              <input
                type="text"
                value={formLongitude}
                onChange={(e) => setFormLongitude(e.target.value)}
                placeholder="Lng"
                style={{
                  padding: 8,
                  width: 120,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              />
            </div>
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
        <div className="gf-home__empty">No saved locations. Add one above.</div>
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
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.label}</div>
              {row.address && (
                <div style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 4 }}>
                  {row.address}
                </div>
              )}
              {(row.latitude != null || row.longitude != null) && (
                <div style={{ fontSize: 12, color: 'var(--groupfit-grey)' }}>
                  {row.latitude}, {row.longitude}
                </div>
              )}
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
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
            </li>
          ))}
        </ul>
      )}
    </CustomerLayout>
  );
}
