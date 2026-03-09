'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

type DiscountRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  validFrom?: string | null;
  validTo?: string | null;
  isActive?: boolean;
  allowedDays?: string | null;
  singleUsePerCustomer?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

const PAGE_SIZES = [10, 20, 50];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseAllowedDays(s: string | null | undefined): number[] {
  if (!s || !s.trim()) return [0, 1, 2, 3, 4, 5, 6];
  return s
    .split(',')
    .map((d) => parseInt(d.trim(), 10))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
}

function formatAllowedDays(s: string | null | undefined): string {
  const days = parseAllowedDays(s);
  if (days.length === 7) return 'All days';
  if (days.length === 0) return '—';
  return days
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS[d])
    .join(', ');
}

export default function AdminDiscountPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<DiscountRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DiscountRow | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<'percent' | 'fixed'>('percent');
  const [formValue, setFormValue] = useState('');
  const [formValidFrom, setFormValidFrom] = useState('');
  const [formValidTo, setFormValidTo] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formAllowedDays, setFormAllowedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [formSingleUsePerCustomer, setFormSingleUsePerCustomer] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = useCallback(() => {
    setLoading(true);
    adminApi
      .discountList()
      .then((res) => {
        const data = res?.data as { mtype?: string; list?: DiscountRow[] };
        if (data?.mtype === 'error') {
          setError(String((data as { message?: string }).message ?? 'Failed to load'));
          setList([]);
        } else {
          setList(data?.list ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load discounts');
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
    return list.filter(
      (row) => row.code.toLowerCase().includes(q) || (row.type ?? '').toLowerCase().includes(q)
    );
  }, [list, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  const openAdd = () => {
    setEditing(null);
    setFormCode('');
    setFormType('percent');
    setFormValue('');
    setFormValidFrom('');
    setFormValidTo('');
    setFormIsActive(true);
    setFormAllowedDays([0, 1, 2, 3, 4, 5, 6]);
    setFormSingleUsePerCustomer(false);
    setShowModal(true);
  };

  const openEdit = (row: DiscountRow) => {
    setEditing(row);
    setFormCode(row.code);
    setFormType((row.type === 'fixed' ? 'fixed' : 'percent') as 'percent' | 'fixed');
    setFormValue(String(row.value));
    setFormValidFrom(row.validFrom ? row.validFrom.slice(0, 10) : '');
    setFormValidTo(row.validTo ? row.validTo.slice(0, 10) : '');
    setFormIsActive(row.isActive !== false);
    setFormAllowedDays(parseAllowedDays(row.allowedDays));
    setFormSingleUsePerCustomer(row.singleUsePerCustomer === true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormCode('');
    setFormType('percent');
    setFormValue('');
    setFormValidFrom('');
    setFormValidTo('');
    setFormIsActive(true);
    setFormAllowedDays([0, 1, 2, 3, 4, 5, 6]);
    setFormSingleUsePerCustomer(false);
  };

  const toggleDay = (day: number) => {
    setFormAllowedDays((prev) => {
      const next = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort((a, b) => a - b);
      return next.length === 0 ? [day] : next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numValue = Number(formValue);
    if (!formCode.trim()) {
      setError('Code is required');
      return;
    }
    if (Number.isNaN(numValue) || numValue < 0) {
      setError('Value must be a non-negative number');
      return;
    }
    setSubmitLoading(true);
    const validFrom = formValidFrom.trim() || null;
    const validTo = formValidTo.trim() || null;
    const allowedDays =
      formAllowedDays.length === 0 || formAllowedDays.length === 7
        ? null
        : formAllowedDays.sort((a, b) => a - b).join(',');
    if (editing) {
      adminApi
        .updateDiscount({
          id: editing.id,
          code: formCode.trim(),
          type: formType,
          value: numValue,
          validFrom,
          validTo,
          isActive: formIsActive,
          allowedDays,
          singleUsePerCustomer: formSingleUsePerCustomer,
        })
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
        .createDiscount({
          code: formCode.trim(),
          type: formType,
          value: numValue,
          validFrom: validFrom ?? undefined,
          validTo: validTo ?? undefined,
          isActive: formIsActive,
          allowedDays: allowedDays ?? undefined,
          singleUsePerCustomer: formSingleUsePerCustomer,
        })
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
    if (!confirm('Delete this discount? This cannot be undone.')) return;
    setActionId(id);
    adminApi
      .deleteDiscount(id)
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

  const formatValue = (row: DiscountRow) =>
    row.type === 'percent' ? `${row.value}%` : `$${Number(row.value).toFixed(2)}`;

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminDashboard}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Dashboard
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
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Discount List</h1>
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
          <label htmlFor="discount-search" style={{ marginRight: 8, fontSize: 14 }}>
            Search:
          </label>
          <input
            id="discount-search"
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
                  <th>Code</th>
                  <th>Value</th>
                  <th>Days</th>
                  <th>Use</th>
                  <th>Active</th>
                  <th>Updated On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td style={{ maxWidth: 320, fontWeight: 600 }}>{row.code}</td>
                    <td>{formatValue(row)}</td>
                    <td style={{ fontSize: 13, color: 'var(--groupfit-grey)' }}>
                      {formatAllowedDays(row.allowedDays)}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {row.singleUsePerCustomer ? 'Single' : 'Multi'}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor:
                            row.isActive !== false
                              ? 'var(--groupfit-success, #22c55e)'
                              : 'var(--groupfit-grey, #94a3b8)',
                          color: '#fff',
                        }}
                      >
                        {row.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td
                      style={{
                        color: 'var(--groupfit-grey)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDate(row.updatedAt)}
                    </td>
                    <td>
                      <Link
                        href={ROUTES.adminDiscountVouchers(row.id)}
                        className="gf-admin-btn gf-admin-btn--ghost"
                        style={{
                          marginRight: 8,
                          padding: '4px 8px',
                          fontSize: 13,
                        }}
                      >
                        Vouchers
                      </Link>
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
          aria-labelledby="discount-modal-title"
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
              maxWidth: 480,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--groupfit-border-light)',
              }}
            >
              <h2 id="discount-modal-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                {editing ? 'Edit Discount' : 'Add Discount'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 20 }}>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="discount-code">
                  Code
                </label>
                <input
                  id="discount-code"
                  type="text"
                  required
                  disabled={!!editing}
                  className="gf-admin-field__input"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. SAVE10"
                  style={{ maxWidth: 200 }}
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="discount-type">
                  Type
                </label>
                <select
                  id="discount-type"
                  className="gf-admin-field__input"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'percent' | 'fixed')}
                  style={{ padding: '10px 14px', maxWidth: 160 }}
                >
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="discount-value">
                  Value
                </label>
                <input
                  id="discount-value"
                  type="number"
                  min={0}
                  step={formType === 'percent' ? 1 : 0.01}
                  required
                  className="gf-admin-field__input"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder={formType === 'percent' ? '10' : '5.00'}
                  style={{ maxWidth: 160 }}
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="discount-valid-from">
                  Valid from (optional)
                </label>
                <input
                  id="discount-valid-from"
                  type="date"
                  className="gf-admin-field__input"
                  value={formValidFrom}
                  onChange={(e) => setFormValidFrom(e.target.value)}
                  style={{ maxWidth: 200 }}
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="discount-valid-to">
                  Valid to (optional)
                </label>
                <input
                  id="discount-valid-to"
                  type="date"
                  className="gf-admin-field__input"
                  value={formValidTo}
                  onChange={(e) => setFormValidTo(e.target.value)}
                  style={{ maxWidth: 200 }}
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <span
                  className="gf-admin-field__label"
                  style={{ display: 'block', marginBottom: 8 }}
                >
                  Valid on days
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DAY_LABELS.map((label, i) => (
                    <label
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: `1px solid ${formAllowedDays.includes(i) ? 'var(--groupfit-secondary)' : 'var(--groupfit-border-light)'}`,
                        backgroundColor: formAllowedDays.includes(i)
                          ? 'rgba(59, 130, 246, 0.08)'
                          : 'transparent',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formAllowedDays.includes(i)}
                        onChange={() => toggleDay(i)}
                        style={{ margin: 0 }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--groupfit-grey)',
                    marginTop: 6,
                    display: 'block',
                  }}
                >
                  Select which days this voucher can be used. Leave all selected for every day.
                </span>
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label
                  htmlFor="discount-single-use"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    id="discount-single-use"
                    checked={formSingleUsePerCustomer}
                    onChange={(e) => setFormSingleUsePerCustomer(e.target.checked)}
                    style={{
                      position: 'absolute',
                      width: 1,
                      height: 1,
                      padding: 0,
                      margin: -1,
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 0,
                    }}
                  />
                  <span
                    role="switch"
                    aria-checked={formSingleUsePerCustomer}
                    onClick={() => setFormSingleUsePerCustomer((v) => !v)}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: 44,
                      height: 24,
                      flexShrink: 0,
                      borderRadius: 12,
                      backgroundColor: formSingleUsePerCustomer
                        ? 'var(--groupfit-secondary)'
                        : 'var(--groupfit-grey, #94a3b8)',
                      transition: 'background-color 0.2s ease',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: formSingleUsePerCustomer ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </span>
                  <span className="gf-admin-field__label">Single use per customer</span>
                </label>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--groupfit-grey)',
                    display: 'block',
                    marginTop: 4,
                  }}
                >
                  When on, each customer can use this discount only once. When off, they can use it
                  multiple times.
                </span>
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 20 }}>
                <label
                  htmlFor="discount-active"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    id="discount-active"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{
                      position: 'absolute',
                      width: 1,
                      height: 1,
                      padding: 0,
                      margin: -1,
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 0,
                    }}
                  />
                  <span
                    role="switch"
                    aria-checked={formIsActive}
                    onClick={() => setFormIsActive((v) => !v)}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: 44,
                      height: 24,
                      flexShrink: 0,
                      borderRadius: 12,
                      backgroundColor: formIsActive
                        ? 'var(--groupfit-success, #22c55e)'
                        : 'var(--groupfit-grey, #94a3b8)',
                      transition: 'background-color 0.2s ease',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: formIsActive ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </span>
                  <span className="gf-admin-field__label">Active</span>
                </label>
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
