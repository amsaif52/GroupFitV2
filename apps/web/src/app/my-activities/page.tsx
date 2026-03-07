'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrainerLayout } from '../TrainerLayout';
import { trainerApi } from '@/lib/api';
import { ROUTES } from '../routes';

type TrainerActivityItem = {
  id: string;
  trainerId: string;
  activityCode: string;
  activityName?: string;
  activityDescription?: string;
  defaultPriceCents?: number;
  priceCents?: number;
  canSetOwnPrice?: boolean;
  effectivePriceCents?: number;
  createdAt: string;
};

type MasterActivityItem = {
  id: string;
  code: string;
  name: string;
  description?: string;
  defaultPriceCents?: number;
  createdAt: string;
};

export default function MyActivitiesPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<TrainerActivityItem[]>([]);
  const [masterList, setMasterList] = useState<MasterActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [canSetOwnPrice, setCanSetOwnPrice] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addActivityCode, setAddActivityCode] = useState('');
  const [addPriceCents, setAddPriceCents] = useState<string>('');
  const [addLoading, setAddLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editActivityCode, setEditActivityCode] = useState('');
  const [editPriceCents, setEditPriceCents] = useState<string>('');
  const [editLoading, setEditLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchLists = () => {
    setLoading(true);
    Promise.all([trainerApi.trainerActivityList(), trainerApi.allActivityList()])
      .then(([myRes, allRes]) => {
        const myData = myRes?.data as Record<string, unknown> | undefined;
        const allData = allRes?.data as Record<string, unknown> | undefined;
        if (myData?.mtype === 'error') {
          setError(String(myData.message ?? 'Failed to load'));
          setList([]);
        } else {
          const myList = (myData?.trainerActivityList ?? myData?.list) as
            | TrainerActivityItem[]
            | undefined;
          setList(myList ?? []);
          setCanSetOwnPrice(Boolean((myData as Record<string, unknown>)?.canSetOwnPrice));
          setError(null);
        }
        if (allData?.mtype === 'error') {
          setMasterList([]);
        } else {
          const all = (allData?.allActivityList ?? allData?.list) as
            | MasterActivityItem[]
            | undefined;
          setMasterList(all ?? []);
        }
      })
      .catch(() => {
        setError('Failed to load activities');
        setList([]);
        setMasterList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const myCodes = new Set(list.map((r) => r.activityCode.toLowerCase()));
  const availableToAdd = masterList.filter((a) => !myCodes.has(a.code.toLowerCase()));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const code = addActivityCode.trim();
    if (!code) return;
    setAddLoading(true);
    setError(null);
    const priceCents =
      canSetOwnPrice && addPriceCents.trim() !== '' ? Math.round(Number(addPriceCents)) : undefined;
    trainerApi
      .addTrainerActivity(code, priceCents)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setShowAdd(false);
          setAddActivityCode('');
          setAddPriceCents('');
          fetchLists();
        } else {
          setError(String(data?.message ?? 'Add failed'));
        }
      })
      .catch(() => setError('Add failed'))
      .finally(() => setAddLoading(false));
  };

  const startEdit = (row: TrainerActivityItem) => {
    setEditingId(row.id);
    setEditActivityCode(row.activityCode);
    setEditPriceCents(row.priceCents != null ? String(row.priceCents) : '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditActivityCode('');
    setEditPriceCents('');
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const code = editActivityCode.trim();
    if (!code) return;
    setEditLoading(true);
    setError(null);
    const priceCents = canSetOwnPrice
      ? editPriceCents.trim() === ''
        ? null
        : Math.round(Number(editPriceCents))
      : undefined;
    trainerApi
      .editTrainerActivity(editingId, code, priceCents)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          cancelEdit();
          fetchLists();
        } else {
          setError(String(data?.message ?? 'Update failed'));
        }
      })
      .catch(() => setError('Update failed'))
      .finally(() => setEditLoading(false));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this activity from your list?')) return;
    setActionId(id);
    trainerApi
      .deleteActivity(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchLists();
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch(() => setError('Delete failed'))
      .finally(() => setActionId(null));
  };

  return (
    <TrainerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">My activities</span>
      </header>

      <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 16 }}>
        Choose which activities you offer. Customers will see these when they search for trainers.
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
        onClick={() => {
          setShowAdd((v) => !v);
          setAddActivityCode('');
          setAddPriceCents('');
          setError(null);
        }}
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
        {showAdd ? 'Cancel' : 'Add activity'}
      </button>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          style={{
            marginBottom: 24,
            padding: 20,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
          }}
        >
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
            Select activity to add
          </label>
          <select
            value={addActivityCode}
            onChange={(e) => setAddActivityCode(e.target.value)}
            required
            style={{
              padding: 8,
              width: '100%',
              maxWidth: 320,
              marginBottom: 12,
              borderRadius: 6,
              border: '1px solid var(--groupfit-border-light)',
            }}
          >
            <option value="">— Choose —</option>
            {availableToAdd.map((a) => (
              <option key={a.id} value={a.code}>
                {a.name} ({a.code})
              </option>
            ))}
          </select>
          {canSetOwnPrice && (
            <>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Your price (cents, optional)
              </label>
              <input
                type="number"
                min={0}
                value={addPriceCents}
                onChange={(e) => setAddPriceCents(e.target.value)}
                placeholder="Leave empty for default"
                style={{
                  padding: 8,
                  width: '100%',
                  maxWidth: 160,
                  marginBottom: 12,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              />
            </>
          )}
          {availableToAdd.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--groupfit-grey)', marginBottom: 8 }}>
              You’ve added all available activities.
            </p>
          )}
          <button
            type="submit"
            disabled={addLoading || availableToAdd.length === 0}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--groupfit-secondary)',
              color: '#fff',
              fontWeight: 600,
              cursor: addLoading || availableToAdd.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {addLoading ? 'Adding…' : 'Add'}
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : list.length === 0 ? (
        <div className="gf-home__empty">
          No activities yet. Add one above to show what you offer.
        </div>
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
              {editingId === row.id ? (
                <form onSubmit={handleEdit}>
                  <label
                    style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}
                  >
                    Change activity
                  </label>
                  <select
                    value={editActivityCode}
                    onChange={(e) => setEditActivityCode(e.target.value)}
                    required
                    style={{
                      padding: 8,
                      width: '100%',
                      maxWidth: 320,
                      marginBottom: 12,
                      borderRadius: 6,
                      border: '1px solid var(--groupfit-border-light)',
                    }}
                  >
                    {masterList.map((a) => (
                      <option key={a.id} value={a.code}>
                        {a.name} ({a.code})
                      </option>
                    ))}
                  </select>
                  {canSetOwnPrice && (
                    <>
                      <label
                        style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}
                      >
                        Your price (cents)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editPriceCents}
                        onChange={(e) => setEditPriceCents(e.target.value)}
                        placeholder="Default"
                        style={{
                          padding: 8,
                          width: '100%',
                          maxWidth: 160,
                          marginBottom: 12,
                          borderRadius: 6,
                          border: '1px solid var(--groupfit-border-light)',
                        }}
                      />
                    </>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="submit"
                      disabled={editLoading}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        border: 'none',
                        background: 'var(--groupfit-secondary)',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: editLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {editLoading ? '…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        border: '1px solid #666',
                        background: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {row.activityName ?? row.activityCode}
                  </div>
                  {row.activityDescription && (
                    <div style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginBottom: 8 }}>
                      {row.activityDescription}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: 'var(--groupfit-grey)', marginBottom: 12 }}>
                    Code: {row.activityCode}
                  </div>
                  {(row.effectivePriceCents != null || row.defaultPriceCents != null) && (
                    <div style={{ fontSize: 13, color: 'var(--groupfit-grey)', marginBottom: 8 }}>
                      Price:{' '}
                      {row.effectivePriceCents != null
                        ? `${row.effectivePriceCents}¢`
                        : row.defaultPriceCents != null
                          ? `${row.defaultPriceCents}¢ (default)`
                          : '—'}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
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
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </TrainerLayout>
  );
}
