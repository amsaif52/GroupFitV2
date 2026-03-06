'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import { customerApi } from '@/lib/api';
import { ROLES } from '@groupfit/shared';
import { ApiClientError } from '@groupfit/shared';

type PaymentItem = { id?: string; amount?: number; date?: string; status?: string; [key: string]: unknown };

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<PaymentItem[]>([]);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    // Customer-only: trainers see Earning, not Payment History
    if (user.role === ROLES.TRAINER || user.role === ROLES.ADMIN) {
      router.replace('/profile');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await customerApi.paymentList();
        const data = res.data as { mtype?: string; list?: PaymentItem[]; PaymentList?: PaymentItem[] };
        if (!cancelled && data?.mtype === 'success') {
          const items = Array.isArray(data.list) ? data.list : (Array.isArray(data.PaymentList) ? data.PaymentList : []);
          setList(items);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiClientError ? e.message : 'Failed to load payments');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <main className="gf-profile-main" style={{ maxWidth: 720, margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/profile" style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}>
          ← Back to Profile
        </Link>
      </div>
      <h1 style={{ marginBottom: '1rem' }}>Payment History</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'var(--groupfit-secondary)' }}>{error}</p>}
      {!loading && !error && list.length === 0 && (
        <p style={{ color: '#666' }}>No payments yet. When you book sessions, they will appear here.</p>
      )}
      {!loading && !error && list.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Activity</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, i) => (
              <tr key={item.id ?? i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{String(item.date ?? item.createdAt ?? '—')}</td>
                <td style={{ padding: '0.5rem' }}>{String(item.activityName ?? '—')}</td>
                <td style={{ padding: '0.5rem' }}>{item.amount != null ? `£${Number(item.amount).toFixed(2)}` : '—'}</td>
                <td style={{ padding: '0.5rem' }}>{String(item.status ?? '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
