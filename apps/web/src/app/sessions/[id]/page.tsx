'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredUser } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { CustomerLayout } from '../../CustomerLayout';
import { TrainerLayout } from '../../TrainerLayout';
import { customerApi, trainerApi } from '@/lib/api';
import { ROUTES } from '../../routes';

type SessionDetail = Record<string, unknown>;

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const user = getStoredUser();
  const isTrainer = user?.role === ROLES.TRAINER || user?.role === ROLES.ADMIN;
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleAt, setRescheduleAt] = useState('');

  const fetchDetail = () => {
    if (!id) return;
    setLoading(true);
    (isTrainer ? trainerApi.fetchSessionDetails(id) : customerApi.fetchSessionDetails(id))
      .then((res: { data?: Record<string, unknown> }) => {
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
        setError('Failed to load session');
        setDetail(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing session ID');
      return;
    }
    fetchDetail();
  }, [id, isTrainer]);

  const handleCancel = () => {
    if (!id || !window.confirm('Cancel this session? This cannot be undone.')) return;
    setActionLoading(true);
    const api = isTrainer ? trainerApi.cancelSession(id) : customerApi.cancelSession(id);
    api
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          router.push(ROUTES.sessions);
        } else {
          setError(String((data as Record<string, unknown>)?.message ?? 'Failed to cancel'));
        }
      })
      .catch(() => setError('Failed to cancel session'))
      .finally(() => setActionLoading(false));
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !rescheduleAt.trim()) return;
    setActionLoading(true);
    const api = isTrainer
      ? trainerApi.rescheduleSession(id, new Date(rescheduleAt).toISOString())
      : customerApi.rescheduleSession(id, new Date(rescheduleAt).toISOString());
    api
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setShowReschedule(false);
          setRescheduleAt('');
          fetchDetail();
        } else {
          setError(String((data as Record<string, unknown>)?.message ?? 'Failed to reschedule'));
        }
      })
      .catch(() => setError('Failed to reschedule session'))
      .finally(() => setActionLoading(false));
  };

  const canAct = detail && String(detail.status) === 'scheduled';
  const Layout = isTrainer ? TrainerLayout : CustomerLayout;

  if (!id) {
    return (
      <Layout>
        <p style={{ color: 'var(--groupfit-grey)' }}>Invalid session.</p>
        <Link href={ROUTES.sessions} style={{ marginTop: 16, display: 'inline-block', color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Back to sessions</Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <Link href={ROUTES.sessions} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← My Sessions</Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>Session details</h1>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error ? (
        <div className="gf-home__empty">
          <p>{error}</p>
          <Link href={ROUTES.sessions} style={{ marginTop: 16, display: 'inline-block', color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Back to sessions</Link>
        </div>
      ) : detail ? (
        <div className="gf-home__empty" style={{ textAlign: 'left', padding: 20 }}>
          <p><strong>Session:</strong> {String(detail.sessionName ?? detail.sessionId ?? 'Session')}</p>
          <p><strong>Date & time:</strong> {detail.scheduledAt ? new Date(String(detail.scheduledAt)).toLocaleString() : '—'}</p>
          <p><strong>Status:</strong> {String(detail.status ?? '')}</p>
          {!isTrainer && <p><strong>Trainer:</strong> {String(detail.trainerName ?? detail.trainerEmail ?? '')}</p>}
          {isTrainer && <p><strong>Customer:</strong> {String(detail.customerName ?? detail.customerEmail ?? '')}</p>}
          {detail.amountCents != null && <p><strong>Amount:</strong> ${(Number(detail.amountCents) / 100).toFixed(2)}</p>}
          {canAct && (
            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button type="button" onClick={handleCancel} disabled={actionLoading} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #c00', background: '#fff', color: '#c00', fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                {actionLoading ? 'Please wait…' : 'Cancel session'}
              </button>
              <button type="button" onClick={() => setShowReschedule(true)} disabled={actionLoading} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: 'var(--groupfit-secondary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                Reschedule
              </button>
            </div>
          )}
          {showReschedule && canAct && (
            <form onSubmit={handleRescheduleSubmit} style={{ marginTop: 16, padding: 16, border: '1px solid var(--groupfit-border-light)', borderRadius: 8 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>New date & time</label>
              <input type="datetime-local" value={rescheduleAt} onChange={(e) => setRescheduleAt(e.target.value)} required style={{ padding: 8, width: '100%', maxWidth: 280, marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--groupfit-secondary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                <button type="button" onClick={() => { setShowReschedule(false); setRescheduleAt(''); }} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--groupfit-grey)', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}
          <div style={{ marginTop: 24 }}>
            <Link href={ROUTES.sessions} style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Back to sessions</Link>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
