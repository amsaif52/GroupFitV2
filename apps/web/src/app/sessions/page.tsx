'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoredUser } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { CustomerLayout } from '../CustomerLayout';
import { TrainerLayout } from '../TrainerLayout';
import { customerApi, trainerApi } from '@/lib/api';
import { ROUTES } from '../routes';

type SessionItem = Record<string, unknown>;

function SessionsContent({
  loading,
  upcoming,
  completed,
  activeTab,
  setActiveTab,
  isTrainer,
}: {
  loading: boolean;
  upcoming: SessionItem[];
  completed: SessionItem[];
  activeTab: 'upcoming' | 'completed';
  setActiveTab: (t: 'upcoming' | 'completed') => void;
  isTrainer: boolean;
}) {
  const list = activeTab === 'upcoming' ? upcoming : completed;
  const Layout = isTrainer ? TrainerLayout : CustomerLayout;

  return (
    <Layout>
      <header className="gf-home__header" style={{ marginBottom: 16 }}>
        <span className="gf-home__logo">My Sessions</span>
        <div className="gf-home__header-actions">
          <Link
            href={ROUTES.notifications}
            className="gf-home__header-link"
            aria-label="Notifications"
          >
            🔔
          </Link>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'upcoming' ? 'var(--groupfit-secondary)' : '#fff',
            color: activeTab === 'upcoming' ? '#fff' : 'var(--groupfit-grey)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Upcoming
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'completed' ? 'var(--groupfit-secondary)' : '#fff',
            color: activeTab === 'completed' ? '#fff' : 'var(--groupfit-grey)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : list.length === 0 ? (
        <div className="gf-home__empty gf-home__empty--tall">
          {activeTab === 'upcoming' ? 'No upcoming sessions.' : 'No completed sessions.'}
        </div>
      ) : (
        <ul style={{ listStyle: 'none' }}>
          {list.map((item, i) => {
            const row = item as Record<string, unknown>;
            const sessionId = row.id ?? row.sessionId;
            return (
              <li
                key={String(sessionId ?? i)}
                className="gf-home__empty"
                style={{ marginBottom: 12 }}
              >
                <Link
                  href={sessionId ? ROUTES.sessionDetail(String(sessionId)) : ROUTES.sessions}
                  style={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}
                >
                  {String(row.sessionName ?? 'Session')}
                </Link>
                <span style={{ fontSize: 12, color: 'var(--groupfit-grey)', marginLeft: 8 }}>
                  {row.trainerName ?? row.customerName ?? ''} ·{' '}
                  {row.scheduledAt ? new Date(String(row.scheduledAt)).toLocaleString() : ''}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Layout>
  );
}

export default function SessionsPage() {
  const user = getStoredUser();
  const isTrainer = user?.role === ROLES.TRAINER || user?.role === ROLES.ADMIN;
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<SessionItem[]>([]);
  const [completed, setCompleted] = useState<SessionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (isTrainer) {
          const [upRes, compRes] = await Promise.all([
            trainerApi.trainerSessionList(),
            trainerApi.trainerSessionCompletedList(),
          ]);
          if (cancelled) return;
          const upData = (upRes?.data as Record<string, unknown>) ?? {};
          const compData = (compRes?.data as Record<string, unknown>) ?? {};
          setUpcoming((upData.trainerSessionList as SessionItem[]) ?? []);
          setCompleted((compData.trainerSessionCompletedList as SessionItem[]) ?? []);
        } else {
          const [upRes, compRes] = await Promise.all([
            customerApi.customerSessionList({ status: 'Upcoming' }),
            customerApi.customerSessionCompletedList({ status: 'Completed' }),
          ]);
          if (cancelled) return;
          const upData = (upRes?.data as Record<string, unknown>) ?? {};
          const compData = (compRes?.data as Record<string, unknown>) ?? {};
          setUpcoming((upData.customerSessionList as SessionItem[]) ?? []);
          setCompleted((compData.customerSessionCompletedList as SessionItem[]) ?? []);
        }
      } catch {
        if (!cancelled) setUpcoming([]);
        setCompleted([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isTrainer]);

  return (
    <SessionsContent
      loading={loading}
      upcoming={upcoming}
      completed={completed}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isTrainer={!!isTrainer}
    />
  );
}
