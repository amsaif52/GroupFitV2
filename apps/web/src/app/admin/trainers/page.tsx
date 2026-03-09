'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

export default function AdminTrainersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<unknown[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchList = useCallback(() => {
    setLoading(true);
    adminApi
      .trainerList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        setList((data?.list as unknown[]) ?? []);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

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
        String(row.phone ?? '')
          .toLowerCase()
          .includes(q)
    );
  }, [list, search]);

  const openAddModal = () => {
    setFormEmail('');
    setFormName('');
    setFormPhone('');
    setAddError(null);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddError(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setSubmitLoading(true);
    adminApi
      .createTrainer({
        email: formEmail.trim(),
        name: formName.trim() || undefined,
        phone: formPhone.trim() || undefined,
      })
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success' && data?.id) {
          closeAddModal();
          fetchList();
          router.push(ROUTES.adminTrainerDetail(String(data.id)));
        } else {
          setAddError(String(data?.message ?? 'Create failed'));
        }
      })
      .catch(() => setAddError('Create failed'))
      .finally(() => setSubmitLoading(false));
  };

  useEffect(() => {
    if (!showAddModal) return;
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') closeAddModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showAddModal]);

  return (
    <>
      <header className="gf-admin-header">
        <div className="gf-admin-header__left">
          <Link href={ROUTES.adminDashboard} className="gf-admin-back">
            ← Dashboard
          </Link>
          <h1 className="gf-admin-title">Trainers</h1>
        </div>
      </header>

      <div className="gf-admin-toolbar">
        <h2 className="gf-admin-toolbar__title">Trainers List</h2>
        <div className="gf-admin-toolbar__actions">
          <button
            type="button"
            onClick={() => fetchList()}
            className="gf-admin-btn gf-admin-btn--secondary"
            aria-label="Refresh list"
          >
            ↻ Refresh
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="gf-admin-btn gf-admin-btn--primary"
          >
            + Add Trainer
          </button>
          {list.length > 0 && (
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="gf-admin-input"
              style={{ maxWidth: 220, marginLeft: 8 }}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="gf-admin-empty">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="gf-admin-empty">No trainers.{search ? ' Try a different search.' : ''}</div>
      ) : (
        <div className="gf-admin-table-wrap" style={{ overflow: 'auto' }}>
          <table className="gf-admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Created On</th>
                <th>Updated On</th>
                <th>Is Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row: Record<string, unknown>, i: number) => (
                <tr key={(row.id as string) ?? i}>
                  <td>
                    <Link href={ROUTES.adminTrainerDetail(String(row.id ?? ''))}>
                      {String(row.name ?? '—')}
                    </Link>
                  </td>
                  <td>{String(row.phone ?? '—')}</td>
                  <td>{String(row.email ?? '—')}</td>
                  <td style={{ color: 'var(--groupfit-grey)', whiteSpace: 'nowrap' }}>
                    {row.createdAt
                      ? new Date(String(row.createdAt)).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </td>
                  <td style={{ color: 'var(--groupfit-grey)', whiteSpace: 'nowrap' }}>
                    {row.updatedAt
                      ? new Date(String(row.updatedAt)).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </td>
                  <td>
                    <span
                      className={
                        row.isActive !== false
                          ? 'gf-admin-status-pill gf-admin-status-pill--active'
                          : 'gf-admin-status-pill gf-admin-status-pill--inactive'
                      }
                    >
                      {row.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-trainer-title"
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
              <h2 id="add-trainer-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Add Trainer
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
            <form onSubmit={handleAddSubmit} style={{ padding: 20 }}>
              {addError && (
                <p className="gf-admin-error" style={{ marginBottom: 16 }}>
                  {addError}
                </p>
              )}
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="add-trainer-email">
                  Email <span className="gf-admin-field__required">*</span>
                </label>
                <input
                  id="add-trainer-email"
                  type="email"
                  required
                  className="gf-admin-field__input"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="trainer@example.com"
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="add-trainer-name">
                  Name
                </label>
                <input
                  id="add-trainer-name"
                  type="text"
                  className="gf-admin-field__input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Display name"
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 20 }}>
                <label className="gf-admin-field__label" htmlFor="add-trainer-phone">
                  Phone
                </label>
                <input
                  id="add-trainer-phone"
                  type="tel"
                  className="gf-admin-field__input"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="gf-admin-btn gf-admin-btn--primary"
                >
                  {submitLoading ? 'Creating…' : 'Create'}
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
    </>
  );
}
