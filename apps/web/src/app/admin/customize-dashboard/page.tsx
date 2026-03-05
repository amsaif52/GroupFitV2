'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

export default function AdminCustomizeDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [jsonText, setJsonText] = useState('{}');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    adminApi
      .getCustomizeDashboard()
      .then((res) => {
        const data = res?.data as { mtype?: string; data?: Record<string, unknown> };
        if (data?.mtype === 'success') {
          const obj = data.data ?? {};
          setJsonText(JSON.stringify(obj, null, 2));
        }
      })
      .catch(() => setError('Failed to load dashboard config'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText) as Record<string, unknown>;
    } catch {
      setError('Invalid JSON');
      return;
    }
    setSubmitLoading(true);
    adminApi
      .setCustomizeDashboard(parsed)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setSuccess(true);
        } else {
          setError(String(data?.message ?? 'Save failed'));
        }
      })
      .catch(() => setError('Save failed'))
      .finally(() => setSubmitLoading(false));
  };

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link href={ROUTES.adminDashboard} style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}>← Dashboard</Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Customize dashboard</h1>
        <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginTop: 8 }}>
          Optional JSON config for dashboard layout or widget visibility. Save valid JSON only.
        </p>
      </header>

      {error && <p style={{ color: '#c00', marginBottom: 16 }}>{error}</p>}
      {success && <p style={{ color: 'var(--groupfit-secondary)', marginBottom: 16 }}>Saved.</p>}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : (
        <div style={{ maxWidth: 640, padding: 20, border: '1px solid var(--groupfit-border-light)', borderRadius: 8 }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>Dashboard config (JSON)</label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={12}
              style={{ padding: 8, width: '100%', fontFamily: 'monospace', fontSize: 13, borderRadius: 6, border: '1px solid var(--groupfit-border-light)' }}
              spellCheck={false}
            />
            <button type="submit" disabled={submitLoading} style={{ marginTop: 12, padding: '10px 16px', borderRadius: 8, border: 'none', background: 'var(--groupfit-secondary)', color: '#fff', fontWeight: 600, cursor: submitLoading ? 'not-allowed' : 'pointer' }}>
              {submitLoading ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
