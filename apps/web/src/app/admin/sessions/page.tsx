'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

export default function AdminSessionsPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<unknown[]>([]);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .sessionList()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as Record<string, unknown> | undefined;
        setList((data?.list as unknown[]) ?? []);
      })
      .catch(() => {
        if (!cancelled) setList([]);
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
          <Link href={ROUTES.adminDashboard} className="gf-admin-back">
            ← Dashboard
          </Link>
          <h1 className="gf-admin-title">Sessions</h1>
        </div>
      </header>
      {loading ? (
        <div className="gf-admin-empty">Loading…</div>
      ) : list.length === 0 ? (
        <div className="gf-admin-empty">No sessions.</div>
      ) : (
        <div className="gf-admin-table-wrap" style={{ overflow: 'auto' }}>
          <table className="gf-admin-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Specialization</th>
                <th>Customer</th>
                <th>Trainer</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row: Record<string, unknown>, i: number) => (
                <tr key={(row.id as string) ?? i}>
                  <td>
                    <Link href={ROUTES.adminSessionDetail((row.id as string) ?? '')}>
                      {row.scheduledAt ? new Date(String(row.scheduledAt)).toLocaleString() : ''}
                    </Link>
                  </td>
                  <td>{String(row.activityName ?? '—')}</td>
                  <td>{String(row.customerName ?? row.customerEmail ?? '')}</td>
                  <td>{String(row.trainerName ?? row.trainerEmail ?? '')}</td>
                  <td>{String(row.status ?? '')}</td>
                  <td>
                    {row.amountCents != null
                      ? `$${(Number(row.amountCents) / 100).toFixed(2)}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
