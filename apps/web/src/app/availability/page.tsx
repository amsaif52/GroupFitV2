'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrainerLayout } from '../TrainerLayout';
import { trainerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { getApiErrorMessage } from '@groupfit/shared';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type SlotItem = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
};

const TIME_STEP_MINUTES = 15;

/** Format time string to HH:MM and snap to nearest 15-minute step for display. */
function formatTimeForInput(s: string): string {
  if (!s) return '';
  const match = /^(\d{1,2}):(\d{2})/.exec(s);
  if (match) {
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2] || '0', 10);
    const totalMins = h * 60 + m;
    const stepped = Math.round(totalMins / TIME_STEP_MINUTES) * TIME_STEP_MINUTES;
    const steppedH = Math.floor(stepped / 60) % 24;
    const steppedM = stepped % 60;
    return `${String(steppedH).padStart(2, '0')}:${String(steppedM).padStart(2, '0')}`;
  }
  if (s.length >= 5 && s[2] === ':') return s.slice(0, 5);
  return s;
}

/** Generate 15-minute time options from 00:00 to 23:45. */
function getTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += TIME_STEP_MINUTES) {
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return options;
}

const TIME_OPTIONS = getTimeOptions();

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<SlotItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SlotItem | null>(null);
  const [formDay, setFormDay] = useState<number>(1);
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('17:00');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = () => {
    trainerApi
      .viewListAllAvailabilty()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          const slots = (data?.availabilityList ?? data?.list) as SlotItem[] | undefined;
          setList(slots ?? []);
          setError(null);
        }
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to load availability'));
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormDay(1);
    setFormStart('09:00');
    setFormEnd('17:00');
    setShowForm(true);
  };

  const openEdit = (row: SlotItem) => {
    setEditing(row);
    setFormDay(row.dayOfWeek);
    setFormStart(formatTimeForInput(row.startTime));
    setFormEnd(formatTimeForInput(row.endTime));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormDay(1);
    setFormStart('09:00');
    setFormEnd('17:00');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = formatTimeForInput(formStart.trim());
    const end = formatTimeForInput(formEnd.trim());
    if (!start || !end) {
      setError('Start and end time are required');
      return;
    }
    setSubmitLoading(true);
    setError(null);
    if (editing) {
      trainerApi
        .editTrainerAvailability({
          id: editing.id,
          dayOfWeek: formDay,
          startTime: start,
          endTime: end,
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
      trainerApi
        .addTrainerAvailability({
          dayOfWeek: formDay,
          startTime: start,
          endTime: end,
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
    if (!confirm('Remove this time slot?')) return;
    setActionId(id);
    trainerApi
      .deleteAvaibilitySlot(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Delete failed')))
      .finally(() => setActionId(null));
  };

  return (
    <TrainerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">Availability</span>
      </header>

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
        Add time slot
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
            {editing ? 'Edit time slot' : 'New time slot'}
          </h2>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Day of week
            </label>
            <select
              value={formDay}
              onChange={(e) => setFormDay(Number(e.target.value))}
              style={{
                padding: 8,
                width: '100%',
                maxWidth: 200,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            >
              {DAY_NAMES.map((name, i) => (
                <option key={i} value={i}>
                  {name}
                </option>
              ))}
            </select>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Start time (15-min steps)
            </label>
            <select
              value={formStart}
              onChange={(e) => setFormStart(e.target.value)}
              required
              style={{
                padding: 8,
                width: 120,
                marginBottom: 12,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              End time (15-min steps)
            </label>
            <select
              value={formEnd}
              onChange={(e) => setFormEnd(e.target.value)}
              required
              style={{
                padding: 8,
                width: 120,
                marginBottom: 16,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
        <div className="gf-home__empty">
          No time slots yet. Add when you’re available for sessions.
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>
                    {DAY_NAMES[row.dayOfWeek] ?? `Day ${row.dayOfWeek}`}
                  </span>
                  <span style={{ marginLeft: 8, color: 'var(--groupfit-grey)' }}>
                    {formatTimeForInput(row.startTime)} – {formatTimeForInput(row.endTime)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
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
