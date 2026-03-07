'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

type ActivityItem = {
  id: string;
  code: string;
  name: string;
  description?: string;
  defaultPriceCents?: number;
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
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

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

  const openAdd = () => {
    setEditing(null);
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setFormDefaultPriceCents('');
    setShowForm(true);
  };

  const openEdit = (row: ActivityItem) => {
    setEditing(row);
    setFormCode(row.code);
    setFormName(row.name);
    setFormDescription(row.description ?? '');
    setFormDefaultPriceCents(row.defaultPriceCents != null ? String(row.defaultPriceCents) : '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setFormDefaultPriceCents('');
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
    if (editing) {
      adminApi
        .updateActivity(
          editing.id,
          formCode.trim(),
          formName.trim(),
          formDescription.trim() || undefined,
          defaultPriceCentsUpdate === 0 ? 0 : defaultPriceCentsUpdate || null
        )
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
        .createActivity(
          formCode.trim(),
          formName.trim(),
          formDescription.trim() || undefined,
          defaultPriceCentsCreate
        )
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
    if (!confirm('Delete this activity type? It may be used in sessions.')) return;
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

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminDashboard}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Activity types</h1>
        <button
          type="button"
          onClick={openAdd}
          style={{
            marginTop: 12,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--groupfit-secondary)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Add activity
        </button>
      </header>

      {error && <p style={{ color: '#c00', marginBottom: 16 }}>{error}</p>}

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
            {editing ? 'Edit activity' : 'New activity'}
          </h2>
          <form onSubmit={handleSubmit}>
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
                marginBottom: 16,
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
                {submitLoading ? 'Saving…' : editing ? 'Update' : 'Create'}
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
        <div className="gf-home__empty">No activity types. Add one above.</div>
      ) : (
        <div className="gf-home__empty" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr
                style={{
                  borderBottom: '2px solid var(--groupfit-border-light)',
                  textAlign: 'left',
                }}
              >
                <th style={{ padding: '12px 16px' }}>Code</th>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Description</th>
                <th style={{ padding: '12px 16px' }}>Default price</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--groupfit-border-light)' }}>
                  <td style={{ padding: '12px 16px' }}>{row.code}</td>
                  <td style={{ padding: '12px 16px' }}>{row.name}</td>
                  <td style={{ padding: '12px 16px', maxWidth: 240 }}>{row.description || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {row.defaultPriceCents != null ? `${row.defaultPriceCents}¢` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      style={{
                        marginRight: 8,
                        padding: '6px 10px',
                        fontSize: 12,
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
                        padding: '6px 10px',
                        fontSize: 12,
                        borderRadius: 6,
                        border: '1px solid #c00',
                        background: '#fff',
                        color: '#c00',
                        cursor: actionId === row.id ? 'not-allowed' : 'pointer',
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
    </>
  );
}
