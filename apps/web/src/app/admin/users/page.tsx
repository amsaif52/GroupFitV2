'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

const ROLES = ['admin', 'trainer', 'customer'];

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<unknown[]>([]);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .usersList()
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

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return (list as Record<string, unknown>[]).filter(
      (row) =>
        String(row.email ?? '')
          .toLowerCase()
          .includes(q) ||
        String(row.name ?? '')
          .toLowerCase()
          .includes(q) ||
        String(row.role ?? '')
          .toLowerCase()
          .includes(q)
    );
  }, [list, search]);

  const fetchList = () => {
    setLoading(true);
    adminApi
      .usersList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        setList((data?.list as unknown[]) ?? []);
        setError(null);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setError(null);
    adminApi
      .updateUserRole(userId, newRole)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Update failed'));
      })
      .catch(() => setError('Update failed'))
      .finally(() => setUpdatingId(null));
  };

  return (
    <>
      <header className="gf-admin-header">
        <div className="gf-admin-header__left">
          <Link href={ROUTES.adminDashboard} className="gf-admin-back">
            ← Dashboard
          </Link>
          <h1 className="gf-admin-title">Users</h1>
        </div>
      </header>
      {error && <p className="gf-admin-error">{error}</p>}
      {list.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <input
            type="search"
            placeholder="Search by email, name, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gf-admin-input"
          />
        </div>
      )}
      {loading ? (
        <div className="gf-admin-empty">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="gf-admin-empty">No users.{search ? ' Try a different search.' : ''}</div>
      ) : (
        <div className="gf-admin-table-wrap" style={{ overflow: 'auto' }}>
          <table className="gf-admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row: Record<string, unknown>, i: number) => (
                <tr key={(row.id as string) ?? i}>
                  <td>
                    <Link href={ROUTES.adminUserDetail((row.id as string) ?? '')}>
                      {String(row.email ?? '')}
                    </Link>
                  </td>
                  <td>{String(row.name ?? '')}</td>
                  <td>
                    <select
                      value={String(row.role ?? '')}
                      onChange={(e) => handleRoleChange(row.id as string, e.target.value)}
                      disabled={updatingId === row.id}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--groupfit-border-light)',
                        background: '#fff',
                        fontSize: 14,
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    {updatingId === row.id && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--groupfit-grey)' }}>
                        …
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--groupfit-grey)' }}>
                    {row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : ''}
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
