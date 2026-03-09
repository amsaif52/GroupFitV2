'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/app/routes';
import { adminApi } from '@/lib/api';
import { CloudinaryUploadButton } from '@/components/CloudinaryUploadButton';

type ActivityCategoryRow = {
  id: string;
  name: string;
  iconUrl?: string | null;
  updatedAt?: string;
  updatedBy?: { name: string | null };
};

const PAGE_SIZES = [10, 20, 50];

export default function AdminSettingsActivityCategoryPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ActivityCategoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ActivityCategoryRow | null>(null);
  const [formName, setFormName] = useState('');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = useCallback(() => {
    setLoading(true);
    adminApi
      .activityCategoryList()
      .then((res) => {
        const data = res?.data as { mtype?: string; list?: ActivityCategoryRow[] };
        if (data?.mtype === 'error') {
          setError(String((data as { message?: string }).message ?? 'Failed to load'));
          setList([]);
        } else {
          setList(data?.list ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load');
        setList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter((row) => row.name.toLowerCase().includes(q));
  }, [list, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  const openAdd = () => {
    setEditing(null);
    setFormName('');
    setFormIconUrl('');
    setShowModal(true);
  };

  const openEdit = (row: ActivityCategoryRow) => {
    setEditing(row);
    setFormName(row.name);
    setFormIconUrl(row.iconUrl ?? '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormName('');
    setFormIconUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    const iconUrl = formIconUrl.trim() || undefined;
    if (editing) {
      adminApi
        .updateActivityCategory(editing.id, { name: formName.trim(), iconUrl })
        .then((res) => {
          const data = res?.data as { mtype?: string; message?: string };
          if (data?.mtype === 'success') {
            closeModal();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Update failed'));
          }
        })
        .catch(() => setError('Update failed'))
        .finally(() => setSubmitLoading(false));
    } else {
      adminApi
        .createActivityCategory({ name: formName.trim(), iconUrl })
        .then((res) => {
          const data = res?.data as { mtype?: string; message?: string };
          if (data?.mtype === 'success') {
            closeModal();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Create failed'));
          }
        })
        .catch(() => setError('Create failed'))
        .finally(() => setSubmitLoading(false));
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this activity category?')) return;
    setActionId(id);
    adminApi
      .deleteActivityCategory(id)
      .then((res) => {
        const data = res?.data as { mtype?: string; message?: string };
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch(() => setError('Delete failed'))
      .finally(() => setActionId(null));
  };

  const formatDate = (d: string | undefined) =>
    d
      ? new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '—';

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminSettings}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Settings
        </Link>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 8,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Activity Type</h1>
          <button type="button" onClick={openAdd} className="gf-admin-btn gf-admin-btn--primary">
            + Add
          </button>
        </div>
      </header>

      {error && (
        <p className="gf-admin-error" style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 14, color: 'var(--groupfit-grey)' }}>
          Show{' '}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="gf-admin-input"
            style={{ width: 70, padding: '6px 8px', marginLeft: 4 }}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </span>
        <span style={{ marginLeft: 16 }}>
          <label htmlFor="activity-cat-search" style={{ marginRight: 8, fontSize: 14 }}>
            Search:
          </label>
          <input
            id="activity-cat-search"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="gf-admin-input"
            style={{ width: 200 }}
          />
        </span>
      </div>

      {loading ? (
        <div className="gf-admin-empty">Loading…</div>
      ) : (
        <>
          <div className="gf-admin-table-wrap" style={{ overflow: 'auto' }}>
            <table className="gf-admin-table">
              <thead>
                <tr>
                  <th>Activity Type</th>
                  <th>Icon</th>
                  <th>Updated By</th>
                  <th>Updated On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>
                      {row.iconUrl ? (
                        <img
                          src={row.iconUrl}
                          alt=""
                          style={{ width: 32, height: 32, objectFit: 'contain' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span style={{ color: 'var(--groupfit-grey)', fontSize: 13 }}>—</span>
                      )}
                    </td>
                    <td>{row.updatedBy?.name ?? '—'}</td>
                    <td
                      style={{
                        color: 'var(--groupfit-grey)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDate(row.updatedAt)}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="gf-admin-btn gf-admin-btn--ghost"
                        style={{
                          marginRight: 8,
                          padding: '4px 8px',
                          fontSize: 13,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        disabled={actionId === row.id}
                        style={{
                          padding: '4px 8px',
                          fontSize: 13,
                          border: '1px solid var(--groupfit-error)',
                          background: 'transparent',
                          color: 'var(--groupfit-error)',
                          cursor: actionId === row.id ? 'not-allowed' : 'pointer',
                          borderRadius: 6,
                        }}
                      >
                        {actionId === row.id ? '…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: 'var(--groupfit-grey)',
                margin: 0,
              }}
            >
              Showing {total === 0 ? 0 : start + 1} to {Math.min(start + pageSize, total)} of{' '}
              {total} records
            </p>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="gf-admin-btn gf-admin-btn--secondary"
                style={{ padding: '6px 12px' }}
              >
                Prev
              </button>
              <span
                className="gf-admin-btn"
                style={{
                  padding: '6px 12px',
                  background: 'var(--groupfit-secondary)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'default',
                }}
              >
                {currentPage}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="gf-admin-btn gf-admin-btn--secondary"
                style={{ padding: '6px 12px' }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-cat-modal-title"
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
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              maxWidth: 420,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--groupfit-border-light)',
              }}
            >
              <h2
                id="activity-cat-modal-title"
                style={{ fontSize: 18, fontWeight: 700, margin: 0 }}
              >
                {editing ? 'Edit Activity Type' : 'Add Activity Type'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="activity-cat-name">
                  Activity Type
                </label>
                <input
                  id="activity-cat-name"
                  type="text"
                  required
                  className="gf-admin-field__input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Cardio and Endurance"
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 20 }}>
                <label className="gf-admin-field__label">Icon (optional)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <CloudinaryUploadButton
                      onUpload={(url) => setFormIconUrl(url)}
                      label="Upload image"
                    />
                    {formIconUrl && (
                      <img
                        src={formIconUrl}
                        alt=""
                        style={{
                          width: 36,
                          height: 36,
                          objectFit: 'contain',
                          border: '1px solid var(--groupfit-border-light)',
                          borderRadius: 6,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <label
                      htmlFor="activity-cat-icon"
                      style={{ fontSize: 13, color: 'var(--groupfit-grey)', whiteSpace: 'nowrap' }}
                    >
                      Or paste URL:
                    </label>
                    <input
                      id="activity-cat-icon"
                      type="url"
                      className="gf-admin-field__input"
                      value={formIconUrl}
                      onChange={(e) => setFormIconUrl(e.target.value)}
                      placeholder="https://..."
                      style={{ flex: 1, minWidth: 200 }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="gf-admin-btn gf-admin-btn--primary"
                >
                  {submitLoading ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
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
