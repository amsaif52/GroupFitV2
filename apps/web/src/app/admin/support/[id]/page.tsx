'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '../../../routes';
import { adminApi } from '@/lib/api';

export default function AdminSupportDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing ticket ID');
      return;
    }
    let cancelled = false;
    adminApi
      .supportDetail(id)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Not found'));
          setTicket(null);
        } else {
          setTicket(data ?? null);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load ticket');
          setTicket(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) {
    return (
      <>
        <Link
          href={ROUTES.adminSupport}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Support
        </Link>
        <p style={{ color: 'var(--groupfit-grey)', marginTop: 16 }}>Invalid ticket.</p>
      </>
    );
  }

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminSupport}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Support
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Support ticket</h1>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>{error}</p>
      ) : ticket ? (
        <div
          style={{
            padding: 20,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
            maxWidth: 560,
          }}
        >
          <p>
            <strong>Subject</strong> {String(ticket.subject ?? '')}
          </p>
          <p>
            <strong>Status</strong> {String(ticket.status ?? '')}
          </p>
          <p>
            <strong>User</strong> {String(ticket.userName ?? ticket.userEmail ?? '')} (
            {String(ticket.userRole ?? '')})
          </p>
          <p>
            <strong>Email</strong> {String(ticket.userEmail ?? '')}
          </p>
          <p>
            <strong>Created</strong>{' '}
            {ticket.createdAt ? new Date(String(ticket.createdAt)).toLocaleString() : '—'}
          </p>
          <div style={{ marginTop: 12 }}>
            <strong>Message</strong>
            <p style={{ marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {String(ticket.body ?? ticket.message ?? '')}
            </p>
          </div>
          <p style={{ marginTop: 16 }}>
            <Link
              href={ROUTES.adminSupport}
              style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}
            >
              ← Back to support
            </Link>
          </p>
        </div>
      ) : null}
    </>
  );
}
