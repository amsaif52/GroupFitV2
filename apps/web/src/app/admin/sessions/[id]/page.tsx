'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '../../../routes';
import { adminApi } from '@/lib/api';

export default function AdminSessionDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing session ID');
      return;
    }
    let cancelled = false;
    adminApi.sessionDetail(id)
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
          setError('Failed to load session');
          setDetail(null);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (!id) {
    return (
      <>
        <Link href={ROUTES.adminSessions} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Sessions</Link>
        <p style={{ color: 'var(--groupfit-grey)', marginTop: 16 }}>Invalid session.</p>
      </>
    );
  }

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link href={ROUTES.adminSessions} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Sessions</Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Session detail</h1>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>{error}</p>
      ) : detail ? (
        <div style={{ padding: 20, border: '1px solid var(--groupfit-border-light)', borderRadius: 8, maxWidth: 480 }}>
          <p><strong>ID</strong> {String(detail.id ?? '')}</p>
          <p><strong>Date / time</strong> {detail.scheduledAt ? new Date(String(detail.scheduledAt)).toLocaleString() : '—'}</p>
          <p><strong>Activity</strong> {String(detail.activityName ?? '—')}</p>
          <p><strong>Status</strong> {String(detail.status ?? '')}</p>
          <p><strong>Customer</strong> {String(detail.customerName ?? detail.customerEmail ?? '')}</p>
          <p><strong>Trainer</strong> {String(detail.trainerName ?? detail.trainerEmail ?? '')}</p>
          <p><strong>Amount</strong> {detail.amountCents != null ? `$${(Number(detail.amountCents) / 100).toFixed(2)}` : '—'}</p>
        </div>
      ) : null}
    </>
  );
}
