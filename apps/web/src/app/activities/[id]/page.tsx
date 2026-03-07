'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CustomerLayout } from '../../CustomerLayout';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../../routes';

type ActivityDetail = Record<string, unknown>;

export default function ActivityDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ActivityDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === undefined) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    customerApi
      .viewActivity(id ?? '')
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
          setError('Failed to load activity');
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

  if (id === undefined) {
    return (
      <CustomerLayout>
        <p style={{ color: 'var(--groupfit-grey)' }}>Invalid activity.</p>
        <Link
          href={ROUTES.activities}
          style={{
            marginTop: 16,
            display: 'inline-block',
            color: 'var(--groupfit-secondary)',
            fontWeight: 600,
          }}
        >
          ← Back to activities
        </Link>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <Link
          href={ROUTES.activities}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Activities
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>Activity details</h1>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error ? (
        <div className="gf-home__empty">
          <p>{error}</p>
          <Link
            href={ROUTES.activities}
            style={{
              marginTop: 16,
              display: 'inline-block',
              color: 'var(--groupfit-secondary)',
              fontWeight: 600,
            }}
          >
            ← Back to activities
          </Link>
        </div>
      ) : detail ? (
        <div className="gf-home__empty" style={{ textAlign: 'left', padding: 20 }}>
          <p>
            <strong>Activity:</strong> {String(detail.activityName ?? detail.name ?? 'Activity')}
          </p>
          {detail.description && (
            <p>
              <strong>Description:</strong> {String(detail.description)}
            </p>
          )}
          <div style={{ marginTop: 24 }}>
            <Link
              href={ROUTES.activities}
              style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}
            >
              ← Back to activities
            </Link>
          </div>
        </div>
      ) : null}
    </CustomerLayout>
  );
}
