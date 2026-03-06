'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrainerLayout } from '../TrainerLayout';
import { trainerApi } from '@/lib/api';
import { ROUTES } from '../routes';

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
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = () => {
    trainerApi
      .trainerServiceList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          const areaList = (data?.trainerServiceList ?? data?.list) as ServiceAreaItem[] | undefined;
          setList(areaList ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load service areas');
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
    setFormRadiusKm('');
    setShowForm(true);
  };

  const openEdit = (row: ServiceAreaItem) => {
    setEditing(row);
    setFormLabel(row.label);
    setFormAddress(row.address ?? '');
    setFormLatitude(row.latitude != null ? String(row.latitude) : '');
    setFormLongitude(row.longitude != null ? String(row.longitude) : '');
    setFormRadiusKm(row.radiusKm != null ? String(row.radiusKm) : '');
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = formLabel.trim();
    if (!label) return;
    setSubmitLoading(true);
    setError(null);
    const lat = formLatitude.trim() ? Number(formLatitude) : null;
    const lng = formLongitude.trim() ? Number(formLongitude) : null;
    const radius = formRadiusKm.trim() ? Number(formRadiusKm) : null;
    if (editing) {
      trainerApi
        .editTrainerService({
          id: editing.id,
          label,
          address: formAddress.trim() || null,
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
          address: formAddress.trim() || null,
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
        .catch(() => setError('Add failed'))
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
      .catch(() => setError('Delete failed'))
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
      .catch(() => setError('Update failed'))
      .finally(() => setActionId(null));
  };

  return (
    <TrainerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">Service areas</span>
      </header>

      <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
        Define where you offer sessions. Customers can find you in these areas. Toggle an area off to hide it from search.
      </p>

      <Link href={ROUTES.dashboard} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600, marginBottom: 16, display: 'inline-block' }}>
        ← Dashboard
      </Link>

      {error && <p style={{ color: '#c00', marginBottom: 16 }}>{error}</p>}

      <button
        type="button"
        onClick={openAdd}
        style={{ marginBottom: 20, padding: '10px 16px', borderRadius: 8, border: 'none', background: 'var(--groupfit-secondary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
      >
        Add service area
      </button>

      {showForm && (
        <div style={{ marginBottom: 24, padding: 20, border: '1px solid var(--groupfit-border-light)', borderRadius: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{editing ? 'Edit service area' : 'New service area'}</h2>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Label *</label>
            <input
              type="text"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder="e.g. Downtown, North Side"
              required
              style={{ padding: 8, width: '100%', maxWidth: 280, marginBottom: 12, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Address (optional)</label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="Street, city"
              style={{ padding: 8, width: '100%', maxWidth: 400, marginBottom: 12, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
            />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Latitude / Longitude (optional)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                value={formLatitude}
                onChange={(e) => setFormLatitude(e.target.value)}
                placeholder="Lat"
                style={{ padding: 8, width: 120, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
              />
              <input
                type="text"
                value={formLongitude}
                onChange={(e) => setFormLongitude(e.target.value)}
                placeholder="Lng"
                style={{ padding: 8, width: 120, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
              />
            </div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Radius (km, optional)</label>
            <input
              type="text"
              inputMode="decimal"
              value={formRadiusKm}
              onChange={(e) => setFormRadiusKm(e.target.value)}
              placeholder="e.g. 10"
              style={{ padding: 8, width: 80, marginBottom: 16, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={submitLoading} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: 'var(--groupfit-secondary)', color: '#fff', fontWeight: 600, cursor: submitLoading ? 'not-allowed' : 'pointer' }}>
                {submitLoading ? 'Saving…' : editing ? 'Update' : 'Add'}
              </button>
              <button type="button" onClick={closeForm} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #666', background: '#fff', cursor: 'pointer' }}>Cancel</button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.label}</div>
                  {row.address && <div style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 4 }}>{row.address}</div>}
                  {(row.latitude != null || row.longitude != null) && (
                    <div style={{ fontSize: 12, color: 'var(--groupfit-grey)' }}>{row.latitude}, {row.longitude}{row.radiusKm != null ? ` · ${row.radiusKm} km` : ''}</div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: row.isActive ? 'var(--groupfit-secondary)' : 'var(--groupfit-grey)' }}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(row.id, row.isActive)}
                    disabled={actionId === row.id}
                    style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid var(--groupfit-secondary)', background: row.isActive ? 'var(--groupfit-secondary)' : '#fff', color: row.isActive ? '#fff' : 'var(--groupfit-secondary)', cursor: actionId === row.id ? 'not-allowed' : 'pointer' }}
                  >
                    {actionId === row.id ? '…' : row.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" onClick={() => openEdit(row)} style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid var(--groupfit-secondary)', background: '#fff', color: 'var(--groupfit-secondary)', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(row.id)} disabled={actionId === row.id} style={{ padding: '6px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #c00', background: '#fff', color: '#c00', cursor: actionId === row.id ? 'not-allowed' : 'pointer' }}>
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
