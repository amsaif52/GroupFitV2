'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '../../../../routes';
import { adminApi } from '@/lib/api';

export default function AdminTrainerDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing trainer ID');
      return;
    }
    let cancelled = false;
    adminApi
      .userDetail(id)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Not found'));
          setUser(null);
        } else {
          setUser(data ?? null);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load trainer');
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const setTrainerCanSetOwnPrice = (canSetOwnPrice: boolean) => {
    if (!id) return;
    setToggleLoading(true);
    adminApi
      .setTrainerCanSetOwnPrice(id, canSetOwnPrice)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setUser((u) => (u ? { ...u, trainerCanSetOwnPrice: canSetOwnPrice } : null));
        } else {
          setError(String(data?.message ?? 'Update failed'));
        }
      })
      .catch(() => setError('Update failed'))
      .finally(() => setToggleLoading(false));
  };

  if (!id) {
    return (
      <>
        <Link
          href={ROUTES.adminTrainers}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Trainers
        </Link>
        <p style={{ color: 'var(--groupfit-grey)', marginTop: 16 }}>Invalid trainer.</p>
      </>
    );
  }

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminTrainers}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Trainers
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Trainer detail</h1>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>{error}</p>
      ) : user ? (
        <div
          style={{
            padding: 20,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
            maxWidth: 480,
          }}
        >
          <p>
            <strong>ID</strong> {String(user.id ?? '')}
          </p>
          <p>
            <strong>Email</strong> {String(user.email ?? '')}
          </p>
          <p>
            <strong>Name</strong> {String(user.name ?? '—')}
          </p>
          <p>
            <strong>Role</strong> {String(user.role ?? '')}
          </p>
          <p>
            <strong>Locale</strong> {String(user.locale ?? '—')}
          </p>
          <p>
            <strong>Phone</strong> {String(user.phone ?? '—')}
          </p>
          <p>
            <strong>Created</strong>{' '}
            {user.createdAt ? new Date(String(user.createdAt)).toLocaleString() : '—'}
          </p>
          {user.role === 'trainer' && (
            <p style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong>Can set own activity price</strong>
              <button
                type="button"
                disabled={toggleLoading}
                onClick={() => setTrainerCanSetOwnPrice(!user.trainerCanSetOwnPrice)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--groupfit-secondary)',
                  background: user.trainerCanSetOwnPrice ? 'var(--groupfit-secondary)' : '#fff',
                  color: user.trainerCanSetOwnPrice ? '#fff' : 'var(--groupfit-secondary)',
                  cursor: toggleLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {toggleLoading ? '…' : user.trainerCanSetOwnPrice ? 'On' : 'Off'}
              </button>
            </p>
          )}
          <p style={{ marginTop: 16 }}>
            <Link
              href={ROUTES.adminTrainers}
              style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}
            >
              ← Back to trainers
            </Link>
          </p>
        </div>
      ) : null}
    </>
  );
}
