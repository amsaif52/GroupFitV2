'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { adminApi } from '@/lib/api';

export default function AdminContactPage() {
  const [loading, setLoading] = useState(true);
  const [formEmail, setFormEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    adminApi
      .contactUs()
      .then((res) => {
        const data = res?.data as { mtype?: string; contactEmail?: string };
        if (data?.mtype === 'success' && data.contactEmail != null) {
          setFormEmail(data.contactEmail);
        }
      })
      .catch(() => setError('Failed to load contact email'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccess(false);
    adminApi
      .updateContactUs(formEmail.trim())
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setSuccess(true);
        } else {
          setError(String(data?.message ?? 'Update failed'));
        }
      })
      .catch(() => setError('Update failed'))
      .finally(() => setSubmitLoading(false));
  };

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Link
          href={ROUTES.adminSettings}
          style={{ fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 600 }}
        >
          ← Settings
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>Contact Us</h1>
        <p style={{ fontSize: 14, color: 'var(--groupfit-grey)', marginTop: 8 }}>
          Contact email shown on help and contact pages.
        </p>
      </header>

      {error && <p style={{ color: '#c00', marginBottom: 16 }}>{error}</p>}
      {success && <p style={{ color: 'var(--groupfit-secondary)', marginBottom: 16 }}>Saved.</p>}

      {loading ? (
        <p style={{ color: 'var(--groupfit-grey)' }}>Loading…</p>
      ) : (
        <div
          style={{
            maxWidth: 480,
            padding: 20,
            border: '1px solid var(--groupfit-border-light)',
            borderRadius: 8,
          }}
        >
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
              Contact email
            </label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="support@example.com"
              required
              style={{
                padding: 8,
                width: '100%',
                marginBottom: 16,
                borderRadius: 6,
                border: '1px solid var(--groupfit-border-light)',
              }}
            />
            <button
              type="submit"
              disabled={submitLoading}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--groupfit-secondary)',
                color: '#fff',
                fontWeight: 600,
                cursor: submitLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {submitLoading ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
