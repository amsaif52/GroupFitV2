'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CustomerLayout } from '../../CustomerLayout';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../../routes';
import { useDefaultLocation } from '@/contexts/DefaultLocationContext';

type TrainerDetail = Record<string, unknown>;

const ACTIVITY_OPTIONS = ['Yoga', 'HIIT', 'Strength', 'Cardio', 'General Fitness'];

export default function TrainerDetailPage() {
  const params = useParams();
  const { defaultLocation } = useDefaultLocation();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<TrainerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBook, setShowBook] = useState(false);
  const [bookDate, setBookDate] = useState('');
  const [bookActivity, setBookActivity] = useState('');
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing trainer ID');
      return;
    }
    let cancelled = false;
    customerApi
      .viewTrainer(id)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Not found'));
          setDetail(null);
        } else {
          setDetail(data ?? null);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load trainer');
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !bookDate.trim()) return;
    setBookLoading(true);
    setBookSuccess(null);
    const scheduledAt = new Date(bookDate).toISOString();
    customerApi
      .addSession(id, scheduledAt, bookActivity.trim() || undefined)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success' && data?.sessionId) {
          setBookSuccess(String(data.sessionId));
          setShowBook(false);
          setBookDate('');
          setBookActivity('');
        } else {
          setError(String(data?.message ?? 'Failed to book session'));
        }
      })
      .catch(() => setError('Failed to book session'))
      .finally(() => setBookLoading(false));
  };

  if (!id) {
    return (
      <CustomerLayout>
        <p style={{ color: 'var(--groupfit-grey)' }}>Invalid trainer.</p>
        <Link
          href={ROUTES.trainers}
          style={{
            marginTop: 16,
            display: 'inline-block',
            color: 'var(--groupfit-secondary)',
            fontWeight: 600,
          }}
        >
          ← Back to trainers
        </Link>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <Link
          href={ROUTES.trainers}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← My Trainers
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>Trainer profile</h1>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error && !bookSuccess ? (
        <div className="gf-home__empty">
          <p>{error}</p>
          <Link
            href={ROUTES.trainers}
            style={{
              marginTop: 16,
              display: 'inline-block',
              color: 'var(--groupfit-secondary)',
              fontWeight: 600,
            }}
          >
            ← Back to trainers
          </Link>
        </div>
      ) : detail ? (
        <div className="gf-home__empty" style={{ textAlign: 'left', padding: 20 }}>
          <p>
            <strong>Name:</strong> {String(detail.trainerName ?? detail.name ?? '')}
          </p>
          <p>
            <strong>Email:</strong> {String(detail.email ?? '')}
          </p>
          {detail.phone && (
            <p>
              <strong>Phone:</strong> {String(detail.phone)}
            </p>
          )}
          {bookSuccess && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: 'var(--groupfit-border-light)',
                borderRadius: 8,
              }}
            >
              <p style={{ fontWeight: 600, color: 'var(--groupfit-secondary)' }}>Session booked!</p>
              <Link
                href={ROUTES.sessionDetail(bookSuccess)}
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--groupfit-secondary)' }}
              >
                View session →
              </Link>
              {' · '}
              <Link
                href={ROUTES.sessions}
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--groupfit-secondary)' }}
              >
                My sessions
              </Link>
            </div>
          )}
          {!showBook ? (
            <button
              type="button"
              onClick={() => setShowBook(true)}
              style={{
                marginTop: 20,
                padding: '12px 20px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--groupfit-secondary)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Book a session
            </button>
          ) : (
            <form
              onSubmit={handleBookSubmit}
              style={{
                marginTop: 20,
                padding: 16,
                border: '1px solid var(--groupfit-border-light)',
                borderRadius: 8,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Book a session</h3>
              {defaultLocation && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: 10,
                    background: 'var(--groupfit-border-light)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14 }}>
                    📍 Using default address: {defaultLocation.label}
                  </span>
                  <Link
                    href={ROUTES.locations}
                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--groupfit-secondary)' }}
                  >
                    Change location
                  </Link>
                </div>
              )}
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
                Date & time
              </label>
              <input
                type="datetime-local"
                value={bookDate}
                onChange={(e) => setBookDate(e.target.value)}
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
                Activity (optional)
              </label>
              <select
                value={bookActivity}
                onChange={(e) => setBookActivity(e.target.value)}
                style={{
                  padding: 8,
                  width: '100%',
                  maxWidth: 280,
                  marginBottom: 16,
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-border-light)',
                }}
              >
                <option value="">—</option>
                {ACTIVITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={bookLoading}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--groupfit-secondary)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: bookLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {bookLoading ? 'Booking…' : 'Book session'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBook(false);
                    setBookDate('');
                    setBookActivity('');
                  }}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--groupfit-grey)',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          <div style={{ marginTop: 24 }}>
            <Link
              href={ROUTES.trainers}
              style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}
            >
              ← Back to trainers
            </Link>
          </div>
        </div>
      ) : null}
    </CustomerLayout>
  );
}
