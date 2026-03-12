'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '../CustomerLayout';
import { CustomerHeader } from '@/components/CustomerHeader';
import { customerApi } from '@/lib/api';
import { ROUTES } from '../routes';
import { getApiErrorMessage } from '@groupfit/shared';

type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = () => {
    customerApi
      .getNotificationList()
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          setList((data?.notificationList as NotificationItem[]) ?? []);
          setError(null);
        }
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to load notifications'));
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleMarkRead = (id: string) => {
    setActionId(id);
    customerApi
      .updateNotificationReadStatus(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
      })
      .finally(() => setActionId(null));
  };

  const handleMarkAllRead = () => {
    setActionId('all');
    customerApi
      .updateNotificationReadStatus()
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
      })
      .finally(() => setActionId(null));
  };

  const handleDelete = (id: string) => {
    setActionId(id);
    customerApi
      .deleteNotification(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
      })
      .finally(() => setActionId(null));
  };

  const unreadCount = list.filter((n) => !n.read).length;

  return (
    <CustomerLayout>
      <CustomerHeader
        title="Notifications"
        backLink={
          <Link
            href={ROUTES.dashboard}
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.95)',
              fontWeight: 600,
              marginRight: 12,
            }}
          >
            ← Dashboard
          </Link>
        }
        rightContent={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={actionId === 'all'}
              style={{
                padding: '8px 12px',
                fontSize: 14,
                borderRadius: 8,
                border: 'none',
                background: 'var(--groupfit-secondary)',
                color: '#fff',
                fontWeight: 600,
                cursor: actionId === 'all' ? 'not-allowed' : 'pointer',
              }}
            >
              {actionId === 'all' ? 'Updating…' : `Mark all as read (${unreadCount})`}
            </button>
          ) : null
        }
      />
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>{error}</p>
      ) : list.length === 0 ? (
        <div className="gf-home__empty">
          <p>No notifications yet.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {list.map((n) => (
            <li
              key={n.id}
              style={{
                padding: 16,
                marginBottom: 8,
                background: n.read ? '#f9f9f9' : 'var(--groupfit-border-light)',
                borderRadius: 8,
                borderLeft: n.read ? 'none' : '4px solid var(--groupfit-secondary)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <div>
                  <strong style={{ fontSize: 16 }}>{n.title}</strong>
                  {n.body && (
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--groupfit-grey)' }}>
                      {n.body}
                    </p>
                  )}
                  <p style={{ marginTop: 4, fontSize: 12, color: 'var(--groupfit-grey)' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      disabled={actionId === n.id}
                      style={{
                        padding: '6px 10px',
                        fontSize: 12,
                        borderRadius: 6,
                        border: 'none',
                        background: 'var(--groupfit-secondary)',
                        color: '#fff',
                        cursor: actionId === n.id ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    disabled={actionId === n.id}
                    style={{
                      padding: '6px 10px',
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid #c00',
                      background: '#fff',
                      color: '#c00',
                      cursor: actionId === n.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CustomerLayout>
  );
}
