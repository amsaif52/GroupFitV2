'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

export default function AdminSupportPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<unknown[]>([]);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .supportList()
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
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminDashboard}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Dashboard
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Support</h1>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : list.length === 0 ? (
        <div className="gf-home__empty">No support tickets.</div>
      ) : (
        <div className="gf-home__empty" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr
                style={{
                  borderBottom: '2px solid var(--groupfit-border-light)',
                  textAlign: 'left',
                }}
              >
                <th style={{ padding: '12px 16px' }}>Subject</th>
                <th style={{ padding: '12px 16px' }}>User</th>
                <th style={{ padding: '12px 16px' }}>Role</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row: Record<string, unknown>, i: number) => (
                <tr
                  key={(row.id as string) ?? i}
                  style={{ borderBottom: '1px solid var(--groupfit-border-light)' }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <Link
                      href={ROUTES.adminSupportDetail(String(row.id ?? ''))}
                      style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}
                    >
                      {String(row.subject ?? '')}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {String(row.userName ?? row.userEmail ?? '')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{String(row.userRole ?? '')}</td>
                  <td style={{ padding: '12px 16px' }}>{String(row.status ?? '')}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--groupfit-grey)' }}>
                    {row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : ''}
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
