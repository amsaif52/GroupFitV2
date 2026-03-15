'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '../../../routes';
import { adminApi } from '@/lib/api';

type TrainerActivityRow = {
  id: string;
  activityCode: string;
  activityName: string;
  defaultPriceCents?: number;
  priceCents?: number;
  canSetOwnPrice?: boolean;
  effectivePriceCents?: number;
  createdAt?: string;
};

type TrainerSessionRow = {
  id: string;
  customerName?: string | null;
  customerEmail: string;
  activityName?: string | null;
  scheduledAt: string;
  status: string;
  amountCents?: number | null;
  createdAt: string;
};

type TrainerCertRow = {
  id: string;
  name: string;
  issuingOrganization?: string | null;
  issuedAt?: string | null;
  credentialId?: string | null;
  documentUrl?: string | null;
  createdAt: string;
};

type ServiceAreaRow = {
  id: string;
  label: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  isActive: boolean;
  createdAt: string;
};

export default function AdminTrainerDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [activityList, setActivityList] = useState<TrainerActivityRow[]>([]);
  const [activityListLoading, setActivityListLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addActivityCode, setAddActivityCode] = useState('');
  const [addPriceCents, setAddPriceCents] = useState<string>('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addSubmitLoading, setAddSubmitLoading] = useState(false);
  const [allActivities, setAllActivities] = useState<
    { code: string; name: string; defaultPriceCents?: number }[]
  >([]);
  const [priceEdit, setPriceEdit] = useState<{ activityCode: string; value: string } | null>(null);
  const [priceSaveLoading, setPriceSaveLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sessionsList, setSessionsList] = useState<TrainerSessionRow[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [certificatesList, setCertificatesList] = useState<TrainerCertRow[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [serviceAreasList, setServiceAreasList] = useState<ServiceAreaRow[]>([]);
  const [serviceAreasLoading, setServiceAreasLoading] = useState(false);
  const [earningsData, setEarningsData] = useState<{
    completedSessionCount: number;
    earningTotalCents: number;
    earningTotalFormatted: string;
  } | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState<'plaid' | 'stripe' | null>(null);

  const router = useRouter();

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
        setError('Failed to load trainer');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const fetchActivityList = useCallback(() => {
    if (!id) return;
    setActivityListLoading(true);
    adminApi
      .trainerActivityList(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'success' && Array.isArray(data?.list)) {
          setActivityList(data.list as TrainerActivityRow[]);
        } else {
          setActivityList([]);
        }
      })
      .catch(() => setActivityList([]))
      .finally(() => setActivityListLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing trainer ID');
      return;
    }
    fetchUser();
  }, [id, fetchUser]);

  const fetchTrainerSessions = useCallback(() => {
    if (!id) return;
    setSessionsLoading(true);
    adminApi
      .trainerSessions(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'success' && Array.isArray(data?.list)) {
          setSessionsList(data.list as TrainerSessionRow[]);
        } else {
          setSessionsList([]);
        }
      })
      .catch(() => setSessionsList([]))
      .finally(() => setSessionsLoading(false));
  }, [id]);

  const fetchTrainerCertificates = useCallback(() => {
    if (!id) return;
    setCertificatesLoading(true);
    adminApi
      .trainerCertificates(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'success' && Array.isArray(data?.list)) {
          setCertificatesList(data.list as TrainerCertRow[]);
        } else {
          setCertificatesList([]);
        }
      })
      .catch(() => setCertificatesList([]))
      .finally(() => setCertificatesLoading(false));
  }, [id]);

  const fetchTrainerServiceAreas = useCallback(() => {
    if (!id) return;
    setServiceAreasLoading(true);
    adminApi
      .trainerServiceAreas(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'success' && Array.isArray(data?.list)) {
          setServiceAreasList(data.list as ServiceAreaRow[]);
        } else {
          setServiceAreasList([]);
        }
      })
      .catch(() => setServiceAreasList([]))
      .finally(() => setServiceAreasLoading(false));
  }, [id]);

  const fetchTrainerEarnings = useCallback(() => {
    if (!id) return;
    setEarningsLoading(true);
    adminApi
      .trainerEarnings(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'success' && data?.data) {
          const d = data.data as {
            completedSessionCount: number;
            earningTotalCents: number;
            earningTotalFormatted: string;
          };
          setEarningsData(d);
        } else {
          setEarningsData(null);
        }
      })
      .catch(() => setEarningsData(null))
      .finally(() => setEarningsLoading(false));
  }, [id]);

  useEffect(() => {
    if (id && user?.role === 'trainer') fetchActivityList();
  }, [id, user?.role, fetchActivityList]);

  useEffect(() => {
    if (id && user?.role === 'trainer') {
      fetchTrainerSessions();
      fetchTrainerCertificates();
      fetchTrainerServiceAreas();
      fetchTrainerEarnings();
    }
  }, [
    id,
    user?.role,
    fetchTrainerSessions,
    fetchTrainerCertificates,
    fetchTrainerServiceAreas,
    fetchTrainerEarnings,
  ]);

  useEffect(() => {
    if (!showAddModal) return;
    adminApi.activityList().then((res) => {
      const data = res?.data as Record<string, unknown> | undefined;
      const list =
        (data?.list as { code: string; name: string; defaultPriceCents?: number }[]) ?? [];
      setAllActivities(list);
      if (list.length > 0 && !addActivityCode) setAddActivityCode(list[0].code);
    });
  }, [showAddModal]);

  const setTrainerCanSetOwnPrice = (canSetOwnPrice: boolean) => {
    if (!id) return;
    setToggleLoading(true);
    adminApi
      .setTrainerCanSetOwnPrice(id, canSetOwnPrice)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setUser((u) => (u ? { ...u, trainerCanSetOwnPrice: canSetOwnPrice } : null));
          fetchActivityList();
        } else {
          setError(String(data?.message ?? 'Update failed'));
        }
      })
      .catch(() => setError('Update failed'))
      .finally(() => setToggleLoading(false));
  };

  const openAddModal = () => {
    setAddActivityCode('');
    setAddPriceCents('');
    setAddError(null);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddError(null);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !addActivityCode.trim()) return;
    setAddError(null);
    setAddSubmitLoading(true);
    const price =
      addPriceCents.trim() === '' ? undefined : Math.round(Number(addPriceCents)) || undefined;
    adminApi
      .addTrainerActivity(id, addActivityCode.trim(), price ?? null)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          closeAddModal();
          fetchActivityList();
        } else {
          setAddError(String(data?.message ?? 'Failed to add activity'));
        }
      })
      .catch(() => setAddError('Failed to add activity'))
      .finally(() => setAddSubmitLoading(false));
  };

  const handleSetPrice = (activityCode: string, value: string) => {
    if (!id) return;
    const priceCents = value.trim() === '' ? null : Math.round(Number(value));
    if (value.trim() !== '' && (Number.isNaN(priceCents) || (priceCents ?? 0) < 0)) return;
    setPriceSaveLoading(true);
    setPriceEdit(null);
    adminApi
      .setTrainerActivityPrice(id, activityCode, priceCents)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchActivityList();
        else setError(String(data?.message ?? 'Update failed'));
      })
      .catch(() => setError('Update failed'))
      .finally(() => setPriceSaveLoading(false));
  };

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
      .updateTrainer(id, {
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
        'Delete this trainer? This cannot be undone and may affect sessions and related data.'
      )
    )
      return;
    setActionLoading('delete');
    adminApi
      .deleteAccount(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          router.push(ROUTES.adminTrainers);
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

  const handleToggleVerified = () => {
    if (!id || user == null) return;
    const nextVerified = user.isVerified === true ? false : true;
    setActionLoading('verified');
    adminApi
      .setTrainerVerified(id, nextVerified)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setUser((u) => (u ? { ...u, isVerified: nextVerified } : null));
        } else {
          setError(String(data?.message ?? 'Update failed'));
        }
      })
      .catch(() => setError('Update failed'))
      .finally(() => setActionLoading(null));
  };

  const copyToClipboard = (text: string, kind: 'plaid' | 'stripe') => {
    if (typeof navigator?.clipboard?.writeText === 'function') {
      navigator.clipboard.writeText(text).then(() => {
        setLinkCopied(kind);
        setTimeout(() => setLinkCopied(null), 2000);
      });
    }
  };

  const handleSendPlaidLink = () => {
    if (!id) return;
    setActionLoading('plaid');
    adminApi
      .getPlaidVerificationLink(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success' && typeof data?.link === 'string') {
          copyToClipboard(data.link, 'plaid');
          window.open(data.link, '_blank');
        } else {
          setError(String(data?.message ?? 'Could not get link'));
        }
      })
      .catch(() => setError('Could not get Plaid link'))
      .finally(() => setActionLoading(null));
  };

  const handleSendStripeLink = () => {
    if (!id) return;
    setActionLoading('stripe');
    adminApi
      .getStripeConnectLink(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success' && typeof data?.link === 'string') {
          copyToClipboard(data.link, 'stripe');
          window.open(data.link, '_blank');
        } else {
          setError(String(data?.message ?? 'Could not get link'));
        }
      })
      .catch(() => setError('Could not get Stripe Connect link'))
      .finally(() => setActionLoading(null));
  };

  useEffect(() => {
    if (!showEditModal) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') closeEditModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showEditModal]);

  if (!id) {
    return (
      <>
        <Link href={ROUTES.adminTrainers} className="gf-admin-back">
          ← Trainers
        </Link>
        <p className="gf-admin-error" style={{ marginTop: 16 }}>
          Invalid trainer.
        </p>
      </>
    );
  }

  return (
    <>
      <header className="gf-admin-header">
        <div className="gf-admin-header__left">
          <Link href={ROUTES.adminTrainers} className="gf-admin-back">
            ← Trainers
          </Link>
          <h1 className="gf-admin-title">Trainer Details</h1>
        </div>
        {user && (
          <div className="gf-admin-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
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
            {user.role === 'trainer' && (
              <>
                <button
                  type="button"
                  onClick={handleToggleVerified}
                  disabled={actionLoading !== null}
                  className={
                    user.isVerified === true
                      ? 'gf-admin-btn gf-admin-btn--secondary'
                      : 'gf-admin-btn gf-admin-btn--primary'
                  }
                  style={
                    user.isVerified === true
                      ? { background: 'var(--groupfit-secondary)', color: '#fff' }
                      : undefined
                  }
                >
                  {actionLoading === 'verified'
                    ? '…'
                    : user.isVerified === true
                      ? 'Unverify'
                      : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={handleSendPlaidLink}
                  disabled={actionLoading !== null}
                  className="gf-admin-btn gf-admin-btn--secondary"
                  title="Open and copy Plaid verification link"
                >
                  {actionLoading === 'plaid'
                    ? '…'
                    : linkCopied === 'plaid'
                      ? 'Copied!'
                      : 'Plaid link'}
                </button>
                <button
                  type="button"
                  onClick={handleSendStripeLink}
                  disabled={actionLoading !== null}
                  className="gf-admin-btn gf-admin-btn--secondary"
                  title="Open and copy Stripe Connect link"
                >
                  {actionLoading === 'stripe'
                    ? '…'
                    : linkCopied === 'stripe'
                      ? 'Copied!'
                      : 'Stripe Connect'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionLoading !== null}
              className="gf-admin-btn gf-admin-btn--ghost"
              style={{ color: 'var(--groupfit-error)', border: '1px solid var(--groupfit-error)' }}
            >
              {actionLoading === 'delete' ? '…' : 'Delete Trainer'}
            </button>
            <button
              type="button"
              onClick={openEditModal}
              className="gf-admin-btn gf-admin-btn--primary"
            >
              Edit
            </button>
            <Link href={ROUTES.adminTrainers} className="gf-admin-btn gf-admin-btn--secondary">
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
        <div style={{ maxWidth: 800 }}>
          <section className="gf-admin-form-section">
            <div className="gf-admin-detail-row">
              <span className="gf-admin-detail-row__label">ID</span>
              <span className="gf-admin-detail-row__value">{String(user.id ?? '')}</span>
            </div>
            <div className="gf-admin-detail-row">
              <span className="gf-admin-detail-row__label">Email</span>
              <span className="gf-admin-detail-row__value">{String(user.email ?? '—')}</span>
            </div>
            <div className="gf-admin-detail-row">
              <span className="gf-admin-detail-row__label">Name</span>
              <span className="gf-admin-detail-row__value">{String(user.name ?? '—')}</span>
            </div>
            <div className="gf-admin-detail-row">
              <span className="gf-admin-detail-row__label">Phone</span>
              <span className="gf-admin-detail-row__value">{String(user.phone ?? '—')}</span>
            </div>
            {user.role === 'trainer' && (
              <>
                <div className="gf-admin-detail-row">
                  <span className="gf-admin-detail-row__label">Verified</span>
                  <span className="gf-admin-detail-row__value">
                    <span
                      className={
                        user.isVerified === true
                          ? 'gf-admin-status-pill gf-admin-status-pill--active'
                          : 'gf-admin-status-pill gf-admin-status-pill--inactive'
                      }
                      style={{ marginRight: 8 }}
                    >
                      {user.isVerified === true ? 'Verified' : 'Unverified'}
                    </span>
                    (toggle via header button)
                  </span>
                </div>
                <div className="gf-admin-detail-row">
                  <span className="gf-admin-detail-row__label">Can set own activity price</span>
                  <span className="gf-admin-detail-row__value">
                    <button
                      type="button"
                      disabled={toggleLoading}
                      onClick={() => setTrainerCanSetOwnPrice(!user.trainerCanSetOwnPrice)}
                      className="gf-admin-btn gf-admin-btn--secondary"
                      style={{
                        background: user.trainerCanSetOwnPrice
                          ? 'var(--groupfit-secondary)'
                          : undefined,
                        color: user.trainerCanSetOwnPrice ? '#fff' : undefined,
                      }}
                    >
                      {toggleLoading ? '…' : user.trainerCanSetOwnPrice ? 'On' : 'Off'}
                    </button>
                    <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--groupfit-grey)' }}>
                      When On, custom prices below are used for sessions.
                    </span>
                  </span>
                </div>
              </>
            )}
          </section>

          {user.role === 'trainer' && (
            <section className="gf-admin-form-section" style={{ marginTop: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <h2 className="gf-admin-form-section__title" style={{ marginBottom: 0 }}>
                  Trainer Activity
                </h2>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="gf-admin-btn gf-admin-btn--primary"
                >
                  + Add Activity
                </button>
              </div>
              {activityListLoading ? (
                <p style={{ margin: 0, color: 'var(--groupfit-grey)' }}>Loading activities…</p>
              ) : activityList.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--groupfit-grey)' }}>
                  No activities added. Use “+ Add Activity” to add specializations and optional
                  custom prices.
                </p>
              ) : (
                <div className="gf-admin-table-wrap" style={{ overflow: 'auto' }}>
                  <table className="gf-admin-table">
                    <thead>
                      <tr>
                        <th>Activity Name</th>
                        <th>Default Price</th>
                        <th>Custom Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityList.map((row) => (
                        <tr key={row.id}>
                          <td>{row.activityName}</td>
                          <td>
                            {row.defaultPriceCents != null ? `${row.defaultPriceCents}¢` : '—'}
                          </td>
                          <td>
                            {priceEdit?.activityCode === row.activityCode ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleSetPrice(row.activityCode, priceEdit.value);
                                }}
                                style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                              >
                                <input
                                  type="number"
                                  min={0}
                                  value={priceEdit.value}
                                  onChange={(e) =>
                                    setPriceEdit({ ...priceEdit, value: e.target.value })
                                  }
                                  className="gf-admin-input"
                                  style={{ maxWidth: 100 }}
                                  placeholder="¢"
                                />
                                <button
                                  type="submit"
                                  disabled={priceSaveLoading}
                                  className="gf-admin-btn gf-admin-btn--primary"
                                  style={{ padding: '6px 12px' }}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPriceEdit(null)}
                                  className="gf-admin-btn gf-admin-btn--secondary"
                                  style={{ padding: '6px 12px' }}
                                >
                                  Cancel
                                </button>
                              </form>
                            ) : (
                              <>
                                {row.priceCents != null ? `${row.priceCents}¢` : '—'}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPriceEdit({
                                      activityCode: row.activityCode,
                                      value: row.priceCents != null ? String(row.priceCents) : '',
                                    })
                                  }
                                  className="gf-admin-btn gf-admin-btn--ghost"
                                  style={{ marginLeft: 8, padding: '4px 8px', fontSize: 13 }}
                                >
                                  Edit price
                                </button>
                              </>
                            )}
                          </td>
                          <td>—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {user?.role === 'trainer' && (
            <>
              <section className="gf-admin-form-section" style={{ marginTop: 24 }}>
                <h2 className="gf-admin-form-section__title">Earning</h2>
                {earningsLoading ? (
                  <p style={{ margin: 0, color: 'var(--groupfit-grey)' }}>Loading…</p>
                ) : earningsData ? (
                  <div className="gf-admin-detail-row" style={{ flexWrap: 'wrap', gap: 16 }}>
                    <span>
                      <strong>Completed sessions:</strong> {earningsData.completedSessionCount}
                    </span>
                    <span>
                      <strong>Total earnings:</strong> {earningsData.earningTotalFormatted}
                    </span>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: 'var(--groupfit-grey)' }}>No earnings data.</p>
                )}
              </section>

              <section className="gf-admin-form-section" style={{ marginTop: 24 }}>
                <h2 className="gf-admin-form-section__title">Sessions</h2>
                {sessionsLoading ? (
                  <p style={{ margin: 0, color: 'var(--groupfit-grey)' }}>Loading…</p>
                ) : sessionsList.length === 0 ? (
                  <p style={{ margin: 0, color: 'var(--groupfit-grey)' }}>No sessions.</p>
                ) : (
                  <div className="gf-admin-table-wrap" style={{ overflow: 'auto' }}>
                    <table className="gf-admin-table">
                      <thead>
                        <tr>
                          <th>Activity</th>
                          <th>Customer</th>
                          <th>Scheduled</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionsList.map((row) => (
                          <tr key={row.id}>
                            <td>{row.activityName ?? '—'}</td>
                            <td>{row.customerName ?? row.customerEmail}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {new Date(row.scheduledAt).toLocaleString(undefined, {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </td>
                            <td>{row.status}</td>
                            <td>
                              {row.amountCents != null
                                ? `$${(row.amountCents / 100).toFixed(2)}`
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="gf-admin-form-section" style={{ marginTop: 24 }}>
                <h2 className="gf-admin-form-section__title">Service area</h2>
                {serviceAreasLoading ? (
                  <p style={{ margin: 0, color: 'var(--groupfit-grey)' }}>Loading…</p>
                ) : serviceAreasList.length === 0 ? (
                  <p style={{ margin: 0, color: 'var(--groupfit-grey)' }}>No service areas.</p>
                ) : (
                  <div className="gf-admin-table-wrap" style={{ overflow: 'auto' }}>
                    <table className="gf-admin-table">
                      <thead>
                        <tr>
                          <th>Label</th>
                          <th>Address</th>
                          <th>Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceAreasList.map((row) => (
                          <tr key={row.id}>
                            <td>{row.label}</td>
                            <td>{row.address ?? '—'}</td>
                            <td>
                              <span
                                className={
                                  row.isActive
                                    ? 'gf-admin-status-pill gf-admin-status-pill--active'
                                    : 'gf-admin-status-pill gf-admin-status-pill--inactive'
                                }
                              >
                                {row.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="gf-admin-form-section" style={{ marginTop: 24 }}>
                <h2 className="gf-admin-form-section__title">Certifications</h2>
                {certificatesLoading ? (
                  <p style={{ margin: 0, color: 'var(--groupfit-grey)' }}>Loading…</p>
                ) : certificatesList.length === 0 ? (
                  <p style={{ margin: 0, color: 'var(--groupfit-grey)' }}>No certificates.</p>
                ) : (
                  <div className="gf-admin-table-wrap" style={{ overflow: 'auto' }}>
                    <table className="gf-admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Issuing organization</th>
                          <th>Issued</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certificatesList.map((row) => (
                          <tr key={row.id}>
                            <td>{row.name}</td>
                            <td>{row.issuingOrganization ?? '—'}</td>
                            <td>
                              {row.issuedAt
                                ? new Date(row.issuedAt).toLocaleDateString(undefined, {
                                    dateStyle: 'short',
                                  })
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      ) : null}

      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-trainer-activity-title"
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
          onClick={(e) => e.target === e.currentTarget && closeAddModal()}
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
              <h2
                id="add-trainer-activity-title"
                style={{ fontSize: 18, fontWeight: 700, margin: 0 }}
              >
                Add Activity
              </h2>
              <button
                type="button"
                onClick={closeAddModal}
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
            <form onSubmit={handleAddActivity} style={{ padding: 20 }}>
              {addError && (
                <p className="gf-admin-error" style={{ marginBottom: 16 }}>
                  {addError}
                </p>
              )}
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label">Activity</label>
                <select
                  value={addActivityCode}
                  onChange={(e) => setAddActivityCode(e.target.value)}
                  className="gf-admin-field__input"
                  style={{ padding: '10px 14px' }}
                >
                  {allActivities.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.name} ({a.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 20 }}>
                <label className="gf-admin-field__label">Custom price (cents, optional)</label>
                <input
                  type="number"
                  min={0}
                  value={addPriceCents}
                  onChange={(e) => setAddPriceCents(e.target.value)}
                  className="gf-admin-field__input"
                  placeholder="e.g. 2500"
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="submit"
                  disabled={addSubmitLoading}
                  className="gf-admin-btn gf-admin-btn--primary"
                >
                  {addSubmitLoading ? 'Adding…' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="gf-admin-btn gf-admin-btn--secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && user && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-trainer-title"
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
              <h2 id="edit-trainer-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Edit Trainer
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
                <label className="gf-admin-field__label" htmlFor="edit-trainer-name">
                  Name
                </label>
                <input
                  id="edit-trainer-name"
                  type="text"
                  className="gf-admin-field__input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Display name"
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 20 }}>
                <label className="gf-admin-field__label" htmlFor="edit-trainer-phone">
                  Phone
                </label>
                <input
                  id="edit-trainer-phone"
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
