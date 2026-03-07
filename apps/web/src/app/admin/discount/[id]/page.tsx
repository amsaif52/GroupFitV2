'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '../../../../routes';
import { adminApi } from '@/lib/api';

function formatDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

export default function AdminDiscountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDetail = () => {
    if (!id) return;
    setLoading(true);
    adminApi
      .discountDetail(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Not found'));
          setDiscount(null);
        } else {
          setDiscount(data ?? null);
          setError(null);
          setCode(String(data?.code ?? ''));
          setType((data?.type as 'percent' | 'fixed') ?? 'percent');
          setValue(String(data?.value ?? ''));
          setValidFrom(formatDateInput(data?.validFrom as string));
          setValidTo(formatDateInput(data?.validTo as string));
        }
      })
      .catch(() => {
        setError('Failed to load discount');
        setDiscount(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing discount ID');
      return;
    }
    let cancelled = false;
    adminApi
      .discountDetail(id)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Not found'));
          setDiscount(null);
        } else {
          setDiscount(data ?? null);
          setError(null);
          setCode(String(data?.code ?? ''));
          setType((data?.type as 'percent' | 'fixed') ?? 'percent');
          setValue(String(data?.value ?? ''));
          setValidFrom(formatDateInput(data?.validFrom as string));
          setValidTo(formatDateInput(data?.validTo as string));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load discount');
          setDiscount(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    const numValue = Number(value);
    if (!code.trim()) {
      setError('Code is required');
      return;
    }
    if (Number.isNaN(numValue) || numValue < 0) {
      setError('Value must be a non-negative number');
      return;
    }
    setSubmitLoading(true);
    adminApi
      .updateDiscount({
        id,
        code: code.trim(),
        type,
        value: numValue,
        validFrom: validFrom.trim() || undefined,
        validTo: validTo.trim() || undefined,
      })
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setEditing(false);
          fetchDetail();
        } else {
          setError(String(data?.message ?? 'Update failed'));
        }
      })
      .catch(() => setError('Update failed'))
      .finally(() => setSubmitLoading(false));
  };

  const handleDelete = () => {
    if (!id) return;
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Delete this discount? This cannot be undone.')
    )
      return;
    setDeleteLoading(true);
    adminApi
      .deleteDiscount(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') router.push(ROUTES.adminDiscount);
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch(() => setError('Delete failed'))
      .finally(() => setDeleteLoading(false));
  };

  if (!id) {
    return (
      <>
        <Link
          href={ROUTES.adminDiscount}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Discount
        </Link>
        <p style={{ color: 'var(--groupfit-grey)', marginTop: 16 }}>Invalid discount.</p>
      </>
    );
  }

  const valueDisplay = discount
    ? discount.type === 'percent'
      ? `${Number(discount.value)}%`
      : `$${Number(discount.value ?? 0).toFixed(2)}`
    : '';

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminDiscount}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Discount
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Discount detail</h1>
      </header>
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : error && !discount ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>{error}</p>
      ) : discount && !editing ? (
        <div
          style={{
            padding: 20,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
            maxWidth: 480,
          }}
        >
          <p>
            <strong>Code</strong> {String(discount.code ?? '')}
          </p>
          <p>
            <strong>Type</strong> {String(discount.type ?? '')}
          </p>
          <p>
            <strong>Value</strong> {valueDisplay}
          </p>
          <p>
            <strong>Valid from</strong>{' '}
            {discount.validFrom ? new Date(String(discount.validFrom)).toLocaleDateString() : '—'}
          </p>
          <p>
            <strong>Valid to</strong>{' '}
            {discount.validTo ? new Date(String(discount.validTo)).toLocaleDateString() : '—'}
          </p>
          <p>
            <strong>Created</strong>{' '}
            {discount.createdAt ? new Date(String(discount.createdAt)).toLocaleString() : '—'}
          </p>
          <p>
            <strong>Updated</strong>{' '}
            {discount.updatedAt ? new Date(String(discount.updatedAt)).toLocaleString() : '—'}
          </p>
          <p style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--groupfit-secondary)',
                color: 'var(--groupfit-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid #c00',
                color: '#c00',
                fontWeight: 600,
                cursor: deleteLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </button>
            <Link
              href={ROUTES.adminDiscount}
              style={{ color: 'var(--groupfit-secondary)', fontWeight: 600, alignSelf: 'center' }}
            >
              ← Back to discounts
            </Link>
          </p>
        </div>
      ) : discount && editing ? (
        <form
          onSubmit={handleUpdate}
          style={{
            marginBottom: 24,
            padding: 16,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
            maxWidth: 400,
          }}
        >
          {error && <p style={{ color: '#c00', marginBottom: 8 }}>{error}</p>}
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Code</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 4,
                padding: 8,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'percent' | 'fixed')}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 4,
                padding: 8,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Value</span>
            <input
              type="number"
              min={0}
              step={type === 'percent' ? 1 : 0.01}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 4,
                padding: 8,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Valid from (optional)</span>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 4,
                padding: 8,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Valid to (optional)</span>
            <input
              type="date"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 4,
                padding: 8,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
          </label>
          <p style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              type="submit"
              disabled={submitLoading}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: 'var(--groupfit-secondary)',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                cursor: submitLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {submitLoading ? 'Saving…' : 'Update'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid var(--groupfit-grey)',
                color: 'var(--groupfit-grey)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </p>
        </form>
      ) : null}
    </>
  );
}
