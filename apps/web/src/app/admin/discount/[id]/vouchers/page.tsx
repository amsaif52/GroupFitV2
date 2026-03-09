'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/app/routes';
import { adminApi } from '@/lib/api';

type VoucherRow = {
  id: string;
  code: string;
  recipientName?: string | null;
  recipientOrg?: string | null;
  createdAt: string;
  usedAt?: string | null;
};

const PAGE_SIZES = [10, 20, 50];

export default function AdminDiscountVouchersPage() {
  const params = useParams();
  const discountId = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [list, setList] = useState<VoucherRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formRecipientName, setFormRecipientName] = useState('');
  const [formRecipientOrg, setFormRecipientOrg] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const fetchList = useCallback(() => {
    if (!discountId) return;
    setLoading(true);
    adminApi
      .voucherListByDiscount(discountId)
      .then((res) => {
        const data = res?.data as {
          mtype?: string;
          message?: string;
          discountCode?: string;
          list?: VoucherRow[];
        };
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
          setDiscountCode('');
        } else {
          setList(data?.list ?? []);
          setDiscountCode(data?.discountCode ?? '');
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load vouchers');
        setList([]);
        setDiscountCode('');
      })
      .finally(() => setLoading(false));
  }, [discountId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (row) =>
        row.code.toLowerCase().includes(q) ||
        (row.recipientName ?? '').toLowerCase().includes(q) ||
        (row.recipientOrg ?? '').toLowerCase().includes(q)
    );
  }, [list, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = useMemo(() => filtered.slice(start, start + pageSize), [filtered, start, pageSize]);

  const openGenerate = () => {
    setFormRecipientName('');
    setFormRecipientOrg('');
    setGeneratedCode(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormRecipientName('');
    setFormRecipientOrg('');
    setGeneratedCode(null);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountId) return;
    setSubmitLoading(true);
    setError(null);
    adminApi
      .createVoucher({
        discountId,
        recipientName: formRecipientName.trim() || null,
        recipientOrg: formRecipientOrg.trim() || null,
      })
      .then((res) => {
        const data = res?.data as {
          mtype?: string;
          message?: string;
          code?: string;
          createdAt?: string;
        };
        if (data?.mtype === 'success' && data?.code) {
          setGeneratedCode(data.code);
          fetchList();
        } else {
          setError(String(data?.message ?? 'Generate failed'));
        }
      })
      .catch(() => setError('Generate failed'))
      .finally(() => setSubmitLoading(false));
  };

  const formatDate = (d: string | null | undefined) =>
    d
      ? new Date(d).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '—';

  if (!discountId) {
    return (
      <div style={{ padding: 24 }}>
        <Link
          href={ROUTES.adminDiscount}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Discount list
        </Link>
        <p style={{ marginTop: 16, color: 'var(--groupfit-grey)' }}>Missing discount.</p>
      </div>
    );
  }

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminDiscount}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Discount list
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
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
            Voucher list {discountCode ? `(${discountCode})` : ''}
          </h1>
          <button
            type="button"
            onClick={openGenerate}
            className="gf-admin-btn gf-admin-btn--primary"
          >
            + Generate voucher
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
          <label htmlFor="voucher-search" style={{ marginRight: 8, fontSize: 14 }}>
            Search:
          </label>
          <input
            id="voucher-search"
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
                  <th>Voucher code</th>
                  <th>Recipient / Person</th>
                  <th>Organization</th>
                  <th>Created on</th>
                  <th>Used on</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{row.code}</td>
                    <td>{row.recipientName ?? '—'}</td>
                    <td>{row.recipientOrg ?? '—'}</td>
                    <td style={{ color: 'var(--groupfit-grey)', whiteSpace: 'nowrap' }}>
                      {formatDate(row.createdAt)}
                    </td>
                    <td style={{ color: 'var(--groupfit-grey)', whiteSpace: 'nowrap' }}>
                      {row.usedAt ? formatDate(row.usedAt) : '—'}
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
            <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', margin: 0 }}>
              Showing {total === 0 ? 0 : start + 1} to {Math.min(start + pageSize, total)} of{' '}
              {total} vouchers
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
          aria-labelledby="voucher-modal-title"
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
              maxWidth: 440,
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
              <h2 id="voucher-modal-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                Generate voucher
              </h2>
            </div>
            <form onSubmit={handleGenerate} style={{ padding: 20 }}>
              <div className="gf-admin-field" style={{ marginBottom: 16 }}>
                <label className="gf-admin-field__label" htmlFor="voucher-recipient-name">
                  Recipient / Person (optional)
                </label>
                <input
                  id="voucher-recipient-name"
                  type="text"
                  className="gf-admin-field__input"
                  value={formRecipientName}
                  onChange={(e) => setFormRecipientName(e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="gf-admin-field" style={{ marginBottom: 20 }}>
                <label className="gf-admin-field__label" htmlFor="voucher-recipient-org">
                  Organization (optional)
                </label>
                <input
                  id="voucher-recipient-org"
                  type="text"
                  className="gf-admin-field__input"
                  value={formRecipientOrg}
                  onChange={(e) => setFormRecipientOrg(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--groupfit-grey)',
                    marginTop: 6,
                    display: 'block',
                  }}
                >
                  Add recipient or organization for analytics when distributing vouchers.
                </span>
              </div>
              {generatedCode && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    background: 'var(--groupfit-border-light)',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                >
                  Generated code: {generatedCode}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="gf-admin-btn gf-admin-btn--primary"
                >
                  {submitLoading ? 'Generating…' : generatedCode ? 'Generate another' : 'Generate'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="gf-admin-btn gf-admin-btn--secondary"
                >
                  {generatedCode ? 'Done' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
