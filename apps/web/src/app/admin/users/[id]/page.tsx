'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '../../../routes';
import { adminApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing user ID');
      return;
    }
    let cancelled = false;
    adminApi.userDetail(id)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Not found'));
          setUser(null);
        } else {
          setUser(data ?? null);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load user');
          setUser(null);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleDeleteAccount = () => {
    if (!id || !user) return;
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    setDeleteError(null);
    setDeleting(true);
    adminApi.deleteAccount(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'success') {
          router.push(ROUTES.adminUsers);
        } else {
          setDeleteError(String(data?.message ?? 'Delete failed'));
        }
      })
      .catch(() => setDeleteError('Delete failed'))
      .finally(() => setDeleting(false));
  };

  if (!id) {
    return (
      <>
        <Link href={ROUTES.adminUsers} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Users</Link>
        <p style={{ color: 'var(--groupfit-grey)', marginTop: 16 }}>Invalid user.</p>
      </>
    );
  }

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link href={ROUTES.adminUsers} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Users</Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>User detail</h1>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>{error}</p>
      ) : user ? (
        <div style={{ padding: 20, border: '1px solid var(--groupfit-border-light)', borderRadius: 8, maxWidth: 480 }}>
          <p><strong>ID</strong> {String(user.id ?? '')}</p>
          <p><strong>Email</strong> {String(user.email ?? '')}</p>
          <p><strong>Name</strong> {String(user.name ?? '—')}</p>
          <p><strong>Role</strong> {String(user.role ?? '')}</p>
          <p><strong>Locale</strong> {String(user.locale ?? '—')}</p>
          <p><strong>Phone</strong> {String(user.phone ?? '—')}</p>
          <p><strong>Created</strong> {user.createdAt ? new Date(String(user.createdAt)).toLocaleString() : '—'}</p>
          {deleteError && <p style={{ color: 'var(--groupfit-error, #c00)', marginTop: 12 }}>{deleteError}</p>}
          <p style={{ marginTop: 16 }}>
            <Link href={ROUTES.adminUsers} style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Back to users</Link>
          </p>
          {getStoredUser()?.sub !== id && (
            <p style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--groupfit-error, #c00)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </p>
          )}
        </div>
      ) : null}
    </>
  );
}
