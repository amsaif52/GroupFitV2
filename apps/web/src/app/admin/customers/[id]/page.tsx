'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '../../../routes';
import { adminApi } from '@/lib/api';

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUser = useCallback(() => {
    if (!id) return;
    setLoading(true);
    adminApi
      .userDetail(id)
      .then((res) => {
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
        setError('Failed to load customer');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing customer ID');
      return;
    }
    fetchUser();
  }, [id, fetchUser]);

  if (!id) {
    return (
      <>
        <header className="gf-admin-header">
          <div className="gf-admin-header__left">
            <Link href={ROUTES.adminCustomers} className="gf-admin-back">
              ← Customers
            </Link>
            <h1 className="gf-admin-title">Customer</h1>
          </div>
        </header>
        <p className="gf-admin-error">Invalid customer.</p>
      </>
    );
  }

  const openEditModal = () => {
    setEditName(String(user?.name ?? ''));
    setEditPhone(String(user?.phone ?? ''));
    setEditError(null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setEditError(null);
    setSubmitLoading(true);
    adminApi
      .updateCustomer(id, {
        name: editName.trim() || undefined,
        phone: editPhone.trim() || undefined,
      })
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          closeEditModal();
          fetchUser();
        } else {
          setEditError(String(data?.message ?? 'Update failed'));
        }
      })
      .catch(() => setEditError('Update failed'))
      .finally(() => setSubmitLoading(false));
  };

  const handleDelete = () => {
    if (!id) return;
    if (
      !confirm(
        'Delete this customer? This cannot be undone and may affect sessions and related data.'
      )
    )
      return;
    setActionLoading('delete');
    adminApi
      .deleteAccount(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          router.push(ROUTES.adminCustomers);
        } else {
          setError(String(data?.message ?? 'Delete failed'));
        }
      })
      .catch(() => setError('Delete failed'))
      .finally(() => setActionLoading(null));
  };

  const handleToggleActive = () => {
    if (!id || user == null) return;
    const nextActive = user.isActive !== false ? false : true;
    setActionLoading('active');
    adminApi
      .setUserActive(id, nextActive)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          fetchUser();
        } else {
          setError(String(data?.message ?? 'Update failed'));
        }
      })
      .catch(() => setError('Update failed'))
      .finally(() => setActionLoading(null));
  };

  const [activeTab, setActiveTab] = useState<'groups' | 'session' | 'locations'>('groups');

  useEffect(() => {
    if (!showEditModal) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') closeEditModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showEditModal]);

  const formatDate = (d: string | undefined) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';
  const val = (v: unknown) => (v != null && String(v).trim() !== '' ? String(v) : '—');

  return (
    <>
      <header className="gf-admin-header">
        <div className="gf-admin-header__left">
          <Link href={ROUTES.adminCustomers} className="gf-admin-back">
            ← Customers
          </Link>
          <h1 className="gf-admin-title">Customer Details</h1>
        </div>
        {user && (
          <div className="gf-admin-actions">
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={actionLoading !== null}
              className={
                user.isActive !== false
                  ? 'gf-admin-btn gf-admin-btn--secondary'
                  : 'gf-admin-btn gf-admin-btn--primary'
              }
              style={
                user.isActive !== false
                  ? undefined
                  : { background: 'var(--groupfit-grey-dark)', color: '#fff' }
              }
            >
              {actionLoading === 'active'
                ? '…'
                : user.isActive !== false
                  ? 'Set Inactive'
                  : 'Set Active'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionLoading !== null}
              className="gf-admin-btn gf-admin-btn--ghost"
              style={{ color: 'var(--groupfit-error)', border: '1px solid var(--groupfit-error)' }}
            >
              {actionLoading === 'delete' ? '…' : 'Delete Customer'}
            </button>
            <button
              type="button"
              onClick={openEditModal}
              className="gf-admin-btn gf-admin-btn--primary"
            >
              Edit
            </button>
            <Link href={ROUTES.adminCustomers} className="gf-admin-btn gf-admin-btn--secondary">
              Back
            </Link>
          </div>
        )}
      </header>

      {error && <p className="gf-admin-error">{error}</p>}

      {loading ? (
        <div className="gf-admin-empty">Loading…</div>
      ) : error && !user ? (
        <p className="gf-admin-error">{error}</p>
      ) : user ? (
        <div style={{ maxWidth: 900 }}>
          {/* Audit trail */}
          <p
            style={{
              marginBottom: 24,
              fontSize: 13,
              color: 'var(--groupfit-grey)',
              textAlign: 'right',
            }}
          >
            Created On: {formatDate(user.createdAt as string)} · Updated On:{' '}
            {formatDate(user.updatedAt as string)}
          </p>

          {/* Two-column customer info */}
          <section className="gf-admin-form-section">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px 32px',
              }}
            >
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">First Name</span>
                <span className="gf-admin-detail-row__value">{val(user.name)}</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Last Name</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Medical Condition Of Customer</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Date Of Birth</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Gender</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Email</span>
                <span className="gf-admin-detail-row__value">{val(user.email)}</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Mobile</span>
                <span className="gf-admin-detail-row__value">{val(user.phone)}</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Address Line1</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Address Line2</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Country</span>
                <span className="gf-admin-detail-row__value">{val(user.countryCode)}</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">State</span>
                <span className="gf-admin-detail-row__value">{val(user.state)}</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">City</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Height</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Weight</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Profile</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Referral Code</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Referrer</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Device Type</span>
                <span className="gf-admin-detail-row__value">—</span>
              </div>
              <div
                className="gf-admin-detail-row"
                style={{ borderBottom: 'none', padding: '8px 0' }}
              >
                <span className="gf-admin-detail-row__label">Status</span>
                <span className="gf-admin-detail-row__value">
                  <span
                    className={
                      user.isActive !== false
                        ? 'gf-admin-status-pill gf-admin-status-pill--active'
                        : 'gf-admin-status-pill gf-admin-status-pill--inactive'
                    }
                  >
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Tabs: Groups | Session | Locations */}
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                display: 'flex',
                gap: 0,
                borderBottom: '2px solid var(--groupfit-border-light)',
              }}
            >
              {(['groups', 'session', 'locations'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    borderBottom:
                      activeTab === tab
                        ? '2px solid var(--groupfit-secondary)'
                        : '2px solid transparent',
                    marginBottom: -2,
                    cursor: 'pointer',
                    color:
                      activeTab === tab ? 'var(--groupfit-secondary)' : 'var(--groupfit-grey-dark)',
                    fontFamily: 'inherit',
                  }}
                >
                  {tab === 'groups' ? 'Groups' : tab === 'session' ? 'Session' : 'Locations'}
                </button>
              ))}
            </div>
            <div
              className="gf-admin-form-section"
              style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
            >
              {activeTab === 'groups' && (
                <p style={{ margin: 0, fontSize: 14, color: 'var(--groupfit-grey)' }}>
                  Groups this customer belongs to. Add group data when your API supports it.
                </p>
              )}
              {activeTab === 'session' && (
                <p style={{ margin: 0, fontSize: 14, color: 'var(--groupfit-grey)' }}>
                  <Link
                    href={ROUTES.adminSessions}
                    style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}
                  >
                    View all sessions
                  </Link>{' '}
                  to see this customer&apos;s bookings.
                </p>
              )}
              {activeTab === 'locations' && (
                <p style={{ margin: 0, fontSize: 14, color: 'var(--groupfit-grey)' }}>
                  Saved locations for this customer. Add location data when your API supports it.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {showEditModal && user && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-customer-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            boxSizing: 'border-box',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && closeEditModal()}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
              maxWidth: 420,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--groupfit-border-light)',
              }}
            >
              <h2 id="edit-customer-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Edit Customer
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 24,
                  lineHeight: 1,
                  color: 'var(--groupfit-grey)',
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ padding: 20 }}>
              {editError && (
                <p className="gf-admin-error" style={{ marginBottom: 16 }}>
                  {editError}
                </p>
              )}
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label">Email</label>
                <input
                  type="text"
                  className="gf-admin-field__input"
                  value={String(user.email ?? '')}
                  disabled
                  style={{ opacity: 0.8 }}
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="edit-customer-name">
                  Name
                </label>
                <input
                  id="edit-customer-name"
                  type="text"
                  className="gf-admin-field__input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Display name"
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 20 }}>
                <label className="gf-admin-field__label" htmlFor="edit-customer-phone">
                  Mobile No
                </label>
                <input
                  id="edit-customer-phone"
                  type="tel"
                  className="gf-admin-field__input"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="gf-admin-btn gf-admin-btn--primary"
                >
                  {submitLoading ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="gf-admin-btn gf-admin-btn--secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
