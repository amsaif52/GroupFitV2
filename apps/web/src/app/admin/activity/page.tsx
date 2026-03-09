'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

const BREAKPOINT_TABLE = 768;

function useIsNarrow() {
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT_TABLE - 1}px)`);
    const handler = () => setIsNarrow(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);
  return isNarrow;
}

type ActivityItem = {
  id: string;
  code: string;
  name: string;
  description?: string;
  defaultPriceCents?: number;
  logoUrl?: string;
  activityGroup?: string;
  trainerSharePercent?: number;
  status?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
};

export default function AdminActivityPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActivityItem | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDefaultPriceCents, setFormDefaultPriceCents] = useState<string>('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formActivityGroup, setFormActivityGroup] = useState('');
  const [formTrainerSharePercent, setFormTrainerSharePercent] = useState<string>('');
  const [formStatus, setFormStatus] = useState<string>('active');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const isNarrow = useIsNarrow();

  const fetchList = () => {
    adminApi
      .activityList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          setList((data?.list as ActivityItem[]) ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load activities');
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!showForm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeForm();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showForm]);

  const openAdd = () => {
    setEditing(null);
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setFormDefaultPriceCents('');
    setFormLogoUrl('');
    setFormActivityGroup('');
    setFormTrainerSharePercent('');
    setFormStatus('active');
    setShowForm(true);
  };

  const openEdit = (row: ActivityItem) => {
    setEditing(row);
    setFormCode(row.code);
    setFormName(row.name);
    setFormDescription(row.description ?? '');
    setFormDefaultPriceCents(row.defaultPriceCents != null ? String(row.defaultPriceCents) : '');
    setFormLogoUrl(row.logoUrl ?? '');
    setFormActivityGroup(row.activityGroup ?? '');
    setFormTrainerSharePercent(
      row.trainerSharePercent != null ? String(row.trainerSharePercent) : ''
    );
    setFormStatus(row.status ?? 'active');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setFormDefaultPriceCents('');
    setFormLogoUrl('');
    setFormActivityGroup('');
    setFormTrainerSharePercent('');
    setFormStatus('active');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const defaultPriceCentsCreate =
      formDefaultPriceCents.trim() === ''
        ? undefined
        : Math.round(Number(formDefaultPriceCents)) || undefined;
    const defaultPriceCentsUpdate =
      formDefaultPriceCents.trim() === '' ? null : Math.round(Number(formDefaultPriceCents));
    const trainerShare =
      formTrainerSharePercent.trim() === ''
        ? null
        : Math.min(100, Math.max(0, Math.round(Number(formTrainerSharePercent))));
    if (editing) {
      adminApi
        .updateActivity({
          id: editing.id,
          code: formCode.trim(),
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          defaultPriceCents:
            formDefaultPriceCents.trim() === '' ? null : (defaultPriceCentsUpdate ?? null),
          logoUrl: formLogoUrl.trim() || null,
          activityGroup: formActivityGroup.trim() || null,
          trainerSharePercent: trainerShare,
          status: formStatus.trim() || 'active',
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
      adminApi
        .createActivity({
          code: formCode.trim(),
          name: formName.trim(),
          description: formDescription.trim() || undefined,
          defaultPriceCents: defaultPriceCentsCreate,
          logoUrl: formLogoUrl.trim() || undefined,
          activityGroup: formActivityGroup.trim() || undefined,
          trainerSharePercent: trainerShare ?? undefined,
          status: formStatus.trim() || 'active',
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeForm();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Create failed'));
          }
        })
        .catch(() => setError('Create failed'))
        .finally(() => setSubmitLoading(false));
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this activity? It may be used in sessions.')) return;
    setActionId(id);
    adminApi
      .deleteActivity(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch(() => setError('Delete failed'))
      .finally(() => setActionId(null));
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 1200,
    margin: '0 auto',
    padding: 16,
    boxSizing: 'border-box',
    width: '100%',
    minWidth: 0,
  };

  return (
    <div className="gf-admin-activity-page" style={containerStyle}>
      <header className="gf-admin-header">
        <div className="gf-admin-header__left">
          <Link href={ROUTES.adminDashboard} className="gf-admin-back">
            ← Dashboard
          </Link>
          <h1 className="gf-admin-title">Activity List</h1>
        </div>
        <div className="gf-admin-actions">
          <button type="button" onClick={openAdd} className="gf-admin-btn gf-admin-btn--primary">
            Add Activity
          </button>
        </div>
      </header>

      {error && <p className="gf-admin-error">{error}</p>}

      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-form-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && closeForm()}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              maxWidth: 520,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--groupfit-border-light)',
              }}
            >
              <h2 id="activity-form-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                {editing ? 'Edit Activity' : 'Add Activity'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 24,
                  lineHeight: 1,
                  color: 'var(--groupfit-grey)',
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Code
              </label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. yoga"
                required
                disabled={!!editing}
                style={{
                  padding: 8,
                  width: '100%',
                  maxWidth: 200,
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                  boxSizing: 'border-box',
                }}
              />
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Yoga"
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
                Description (optional)
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
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
                Default price (cents, optional)
              </label>
              <input
                type="number"
                min={0}
                value={formDefaultPriceCents}
                onChange={(e) => setFormDefaultPriceCents(e.target.value)}
                placeholder="e.g. 2500"
                style={{
                  padding: 8,
                  width: '100%',
                  maxWidth: 160,
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              />
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Logo URL (optional)
              </label>
              <input
                type="url"
                value={formLogoUrl}
                onChange={(e) => setFormLogoUrl(e.target.value)}
                placeholder="https://…"
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
                Activity group (optional)
              </label>
              <input
                type="text"
                value={formActivityGroup}
                onChange={(e) => setFormActivityGroup(e.target.value)}
                placeholder="e.g. Fitness, Mind & Body"
                style={{
                  padding: 8,
                  width: '100%',
                  maxWidth: 200,
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              />
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Trainer share (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={formTrainerSharePercent}
                onChange={(e) => setFormTrainerSharePercent(e.target.value)}
                placeholder="0–100"
                style={{
                  padding: 8,
                  width: '100%',
                  maxWidth: 80,
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              />
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                style={{
                  padding: 8,
                  width: '100%',
                  maxWidth: 120,
                  marginBottom: 16,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="gf-admin-btn gf-admin-btn--primary"
                >
                  {submitLoading ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="gf-admin-btn gf-admin-btn--secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="gf-admin-empty">Loading…</div>
      ) : list.length === 0 ? (
        <div className="gf-admin-empty">No activities. Add one above.</div>
      ) : isNarrow ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {list.map((row) => (
            <li key={row.id} className="gf-admin-card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                {row.logoUrl && (
                  <img
                    src={row.logoUrl}
                    alt=""
                    style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{row.name}</div>
                  <dl style={{ margin: 0, fontSize: 14, display: 'grid', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <dt style={{ margin: 0, color: 'var(--groupfit-grey)', minWidth: 100 }}>
                        Cost
                      </dt>
                      <dd style={{ margin: 0 }}>
                        {row.defaultPriceCents != null ? `${row.defaultPriceCents}¢` : '—'}
                      </dd>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <dt style={{ margin: 0, color: 'var(--groupfit-grey)', minWidth: 100 }}>
                        Group
                      </dt>
                      <dd style={{ margin: 0 }}>{row.activityGroup || '—'}</dd>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <dt style={{ margin: 0, color: 'var(--groupfit-grey)', minWidth: 100 }}>
                        Trainer share
                      </dt>
                      <dd style={{ margin: 0 }}>
                        {row.trainerSharePercent != null ? `${row.trainerSharePercent}%` : '—'}
                      </dd>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <dt style={{ margin: 0, color: 'var(--groupfit-grey)', minWidth: 100 }}>
                        Created
                      </dt>
                      <dd style={{ margin: 0 }}>
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleString(undefined, {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '—'}{' '}
                        {row.createdBy ? `by ${row.createdBy}` : ''}
                      </dd>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <dt style={{ margin: 0, color: 'var(--groupfit-grey)', minWidth: 100 }}>
                        Updated
                      </dt>
                      <dd style={{ margin: 0 }}>
                        {row.updatedAt
                          ? new Date(row.updatedAt).toLocaleString(undefined, {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : '—'}{' '}
                        {row.updatedBy ? `by ${row.updatedBy}` : ''}
                      </dd>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <dt style={{ margin: 0, color: 'var(--groupfit-grey)', minWidth: 100 }}>
                        Status
                      </dt>
                      <dd style={{ margin: 0 }}>{row.status ?? 'active'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="gf-admin-btn gf-admin-btn--secondary"
                  style={{ padding: '8px 12px', fontSize: 13 }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  disabled={actionId === row.id}
                  className="gf-admin-btn gf-admin-btn--ghost"
                  style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    color: 'var(--groupfit-error)',
                    border: '1px solid var(--groupfit-error)',
                  }}
                >
                  {actionId === row.id ? '…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div
          className="gf-admin-table-wrap"
          style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          <table className="gf-admin-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Activity Name</th>
                <th>Cost Of Activity</th>
                <th>Logo Of Activity</th>
                <th>Activity Group</th>
                <th>Trainer Share (%)</th>
                <th>Created By</th>
                <th>Created On</th>
                <th>Updated By</th>
                <th>Updated On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.defaultPriceCents != null ? `${row.defaultPriceCents}¢` : '—'}</td>
                  <td>
                    {row.logoUrl ? (
                      <img
                        src={row.logoUrl}
                        alt=""
                        style={{ width: 32, height: 32, objectFit: 'contain' }}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{row.activityGroup || '—'}</td>
                  <td>{row.trainerSharePercent != null ? `${row.trainerSharePercent}%` : '—'}</td>
                  <td>{row.createdBy || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </td>
                  <td>{row.updatedBy || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {row.updatedAt
                      ? new Date(row.updatedAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </td>
                  <td>{row.status ?? 'active'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="gf-admin-btn gf-admin-btn--secondary"
                      style={{ marginRight: 8, padding: '6px 12px', fontSize: 13 }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      disabled={actionId === row.id}
                      className="gf-admin-btn gf-admin-btn--ghost"
                      style={{
                        padding: '6px 12px',
                        fontSize: 13,
                        color: 'var(--groupfit-error)',
                        border: '1px solid var(--groupfit-error)',
                      }}
                    >
                      {actionId === row.id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
