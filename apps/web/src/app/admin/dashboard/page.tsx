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
    adminApi
      .dashboard()
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
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <header className="gf-admin-header">
        <div className="gf-admin-header__left">
          <h1 className="gf-admin-title">Admin Dashboard</h1>
        </div>
        <div className="gf-admin-user-bar">
          <span className="gf-admin-user-bar__email">{user?.email ?? user?.name}</span>
          <Link href={ROUTES.adminActivity}>Specializations</Link>
          <button
            type="button"
            onClick={() => {
              clearStoredToken();
              window.location.href = '/login';
            }}
          >
            Log out
          </button>
        </div>
      </header>
      {loading ? (
        <div className="gf-admin-empty">Loading…</div>
      ) : (
        <>
          <div className="gf-admin-welcome">
            <p>
              Welcome to GroupFit Admin. Use the sidebar to manage Specializations, Discount,
              Trainers, Customers, Sessions, Earning, Support, and Users.
            </p>
          </div>
          {data && typeof data.userCount === 'number' && (
            <div className="gf-admin-cards-grid">
              <div className="gf-admin-card">
                <div className="gf-admin-card__value">{data.userCount}</div>
                <div className="gf-admin-card__label">Users</div>
              </div>
              <div className="gf-admin-card">
                <div className="gf-admin-card__value">{data.trainerCount}</div>
                <div className="gf-admin-card__label">Trainers</div>
              </div>
              <div className="gf-admin-card">
                <div className="gf-admin-card__value">{data.customerCount}</div>
                <div className="gf-admin-card__label">Customers</div>
              </div>
              <div className="gf-admin-card gf-admin-card--muted">
                <div className="gf-admin-card__value">{data.sessionCount ?? 0}</div>
                <div className="gf-admin-card__label">Sessions</div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
