'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

export default function AdminDiscountPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchList = () => {
    setLoading(true);
    adminApi.discountList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        setList((data?.list as unknown[]) ?? []);
        setError(null);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    adminApi.discountList()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as Record<string, unknown> | undefined;
        setList((data?.list as unknown[]) ?? []);
      })
      .catch(() => { if (!cancelled) setList([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numValue = Number(value);
    if (!code.trim()) { setError('Code is required'); return; }
    if (Number.isNaN(numValue) || numValue < 0) { setError('Value must be a non-negative number'); return; }
    setSubmitLoading(true);
    adminApi.createDiscount({
      code: code.trim(),
      type,
      value: numValue,
      validFrom: validFrom.trim() || undefined,
      validTo: validTo.trim() || undefined,
    })
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setShowForm(false);
          setCode('');
          setValue('');
          setValidFrom('');
          setValidTo('');
          fetchList();
        } else {
          setError(String(data?.message ?? 'Create failed'));
        }
      })
      .catch(() => setError('Create failed'))
      .finally(() => setSubmitLoading(false));
  };

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link href={ROUTES.adminDashboard} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Dashboard</Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Discount</h1>
      </header>
      <button
        type="button"
        onClick={() => setShowForm((v) => !v)}
        style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--groupfit-secondary)', color: 'var(--groupfit-secondary)', fontWeight: 600, cursor: 'pointer' }}
      >
        {showForm ? 'Cancel' : 'Add discount'}
      </button>
      {showForm && (
        <form onSubmit={handleCreate} style={{ marginBottom: 24, padding: 16, border: '1px solid var(--groupfit-border-light)', borderRadius: 8, maxWidth: 400 }}>
          {error && <p style={{ color: '#c00', marginBottom: 8 }}>{error}</p>}
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Code</span>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SAVE10" style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Type</span>
            <select value={type} onChange={(e) => setType(e.target.value as 'percent' | 'fixed')} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Value</span>
            <input type="number" min={0} step={type === 'percent' ? 1 : 0.01} value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'percent' ? '10' : '5.00'} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Valid from (optional)</span>
            <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Valid to (optional)</span>
            <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4, padding: 8, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }} />
          </label>
          <button type="submit" disabled={submitLoading} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--groupfit-secondary)', color: '#fff', fontWeight: 600, border: 'none', cursor: submitLoading ? 'not-allowed' : 'pointer' }}>
            {submitLoading ? 'Adding…' : 'Add'}
          </button>
        </form>
      )}
      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : list.length === 0 && !showForm ? (
        <div className="gf-home__empty">No discounts.</div>
      ) : list.length > 0 ? (
        <div className="gf-home__empty" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--groupfit-border-light)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>Code</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Value</th>
                <th style={{ padding: '12px 16px' }}>Valid from</th>
                <th style={{ padding: '12px 16px' }}>Valid to</th>
                <th style={{ padding: '12px 16px' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row: Record<string, unknown>, i: number) => (
                <tr key={(row.id as string) ?? i} style={{ borderBottom: '1px solid var(--groupfit-border-light)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    <Link href={ROUTES.adminDiscountDetail(String(row.id ?? ''))} style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}>{String(row.code ?? '')}</Link>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{String(row.type ?? '')}</td>
                  <td style={{ padding: '12px 16px' }}>{row.type === 'percent' ? `${row.value}%` : `$${Number(row.value ?? 0).toFixed(2)}`}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--groupfit-grey)' }}>{row.validFrom ? new Date(String(row.validFrom)).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--groupfit-grey)' }}>{row.validTo ? new Date(String(row.validTo)).toLocaleDateString() : '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--groupfit-grey)' }}>{row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
