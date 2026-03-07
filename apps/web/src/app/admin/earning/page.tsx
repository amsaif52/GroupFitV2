'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

type EarningData = {
  sessionCount?: number;
  completedSessionCount?: number;
  earningTotalCents?: number;
  earningTotalFormatted?: string;
};

export default function AdminEarningPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EarningData | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .earningReport()
      .then((res) => {
        if (cancelled) return;
        const d = res?.data as Record<string, unknown> | undefined;
        setData(((d?.data ?? d) as EarningData) ?? null);
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
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminDashboard}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Earning Report</h1>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : data == null ? (
        <div className="gf-home__empty">No earning data.</div>
      ) : (
        <div style={{ padding: 24 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 16,
            }}
          >
            <div className="gf-home__empty" style={{ padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-secondary)' }}>
                {data.sessionCount ?? 0}
              </div>
              <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>
                Total sessions
              </div>
            </div>
            <div className="gf-home__empty" style={{ padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-secondary)' }}>
                {data.completedSessionCount ?? 0}
              </div>
              <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>
                Completed
              </div>
            </div>
            <div className="gf-home__empty" style={{ padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--groupfit-secondary)' }}>
                {data.earningTotalFormatted ?? '$0.00'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 4 }}>
                Earnings (completed)
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
