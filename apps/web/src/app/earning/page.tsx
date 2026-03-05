'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { TrainerLayout } from '../TrainerLayout';
import { trainerApi } from '@/lib/api';

export default function EarningPage() {
  const router = useRouter();
  const user = getStoredUser();
  const [loading, setLoading] = useState(true);
  const [currentEarning, setCurrentEarning] = useState<unknown>(null);
  const [earningStats, setEarningStats] = useState<unknown>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== ROLES.TRAINER && user.role !== ROLES.ADMIN) {
      router.replace('/profile');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [earnRes, statsRes] = await Promise.all([
          trainerApi.currentEarning(),
          trainerApi.earningStats(),
        ]);
        if (cancelled) return;
        const getData = (r: { data?: unknown }) => (r?.data as Record<string, unknown>) ?? {};
        setCurrentEarning(getData(earnRes).currentEarning ?? null);
        setEarningStats(getData(statsRes).earningStats ?? null);
      } catch {
        if (!cancelled) setCurrentEarning(null); setEarningStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, router]);

  if (!user) return null;
  if (user.role !== ROLES.TRAINER && user.role !== ROLES.ADMIN) return null;

  const amountStr = currentEarning != null && typeof currentEarning === 'object' && 'amount' in (currentEarning as object)
    ? String((currentEarning as Record<string, unknown>).amount)
    : currentEarning != null ? String(currentEarning) : '£0.00';

  return (
    <TrainerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">My Earnings</span>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : (
        <>
          <div className="gf-home__earning" style={{ marginBottom: 24 }}>
            <p className="gf-home__earning-label">Current month</p>
            <p className="gf-home__earning-value">{amountStr}</p>
          </div>
          {earningStats != null && (
            <div className="gf-home__empty" style={{ padding: 16 }}>
              <strong>Summary</strong>
              <pre style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginTop: 8, overflow: 'auto' }}>
                {JSON.stringify(earningStats, null, 2).slice(0, 300)}…
              </pre>
            </div>
          )}
        </>
      )}
    </TrainerLayout>
  );
}
