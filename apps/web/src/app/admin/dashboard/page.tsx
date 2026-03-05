'use client';

import { useEffect, useState } from 'react';
import { getStoredUser, clearStoredToken } from '@/lib/auth';
import { adminApi } from '@/lib/api';
import { ROUTES } from '../../routes';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const user = getStoredUser();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi.dashboard()
      .then((res) => {
        if (cancelled) return;
        const body = res?.data as Record<string, unknown> | undefined;
        setData((body?.data as Record<string, unknown>) ?? null);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>{user?.email ?? user?.name}</span>
          <Link href={ROUTES.adminActivity} style={{ fontSize: 14, fontWeight: 600, color: 'var(--groupfit-secondary)' }}>Activity</Link>
          <button
            type="button"
            onClick={() => { clearStoredToken(); window.location.href = '/login'; }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--groupfit-secondary)' }}
          >
            Log out
          </button>
        </div>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : (
        <div style={{ padding: 24 }}>
          <p style={{ marginBottom: 24 }}>Welcome to GroupFit Admin. Use the sidebar to manage Activity, Discount, Trainers, Customers, Sessions, Earning, Support, and Users.</p>
          {data && typeof data.userCount === 'number' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
              <div className="gf-home__empty" style={{ padding: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-secondary)' }}>{data.userCount}</div>
                <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>Users</div>
              </div>
              <div className="gf-home__empty" style={{ padding: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-secondary)' }}>{data.trainerCount}</div>
                <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>Trainers</div>
              </div>
              <div className="gf-home__empty" style={{ padding: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-secondary)' }}>{data.customerCount}</div>
                <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>Customers</div>
              </div>
              <div className="gf-home__empty" style={{ padding: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-grey)' }}>{data.sessionCount ?? 0}</div>
                <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>Sessions</div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
