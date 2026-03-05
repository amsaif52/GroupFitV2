'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

export default function AdminTrainersPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<unknown[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    adminApi.trainerList()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as Record<string, unknown> | undefined;
        setList((data?.list as unknown[]) ?? []);
      })
      .catch(() => { if (!cancelled) setList([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return (list as Record<string, unknown>[]).filter(
      (row) =>
        String(row.email ?? '').toLowerCase().includes(q) ||
        String(row.name ?? '').toLowerCase().includes(q) ||
        String(row.phone ?? '').toLowerCase().includes(q)
    );
  }, [list, search]);

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link href={ROUTES.adminDashboard} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Dashboard</Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Trainers</h1>
      </header>
      {list.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="search"
            placeholder="Search by email, name, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px', width: '100%', maxWidth: 320, borderRadius: 8, border: '1px solid var(--groupfit-border-light)' }}
          />
        </div>
      )}
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="gf-home__empty">No trainers.{search ? ' Try a different search.' : ''}</div>
      ) : (
        <div className="gf-home__empty" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--groupfit-border-light)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Phone</th>
                <th style={{ padding: '12px 16px' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row: Record<string, unknown>, i: number) => (
                <tr key={row.id as string ?? i} style={{ borderBottom: '1px solid var(--groupfit-border-light)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={ROUTES.adminTrainerDetail(String(row.id ?? ''))} style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}>{String(row.email ?? '')}</Link>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{String(row.name ?? '')}</td>
                  <td style={{ padding: '12px 16px' }}>{String(row.phone ?? '')}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--groupfit-grey)' }}>{row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
