'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredUser } from '@/lib/auth';
import { customerApi, trainerApi } from '@/lib/api';
import { ROLES } from '@groupfit/shared';
import { getApiErrorMessage } from '@groupfit/shared';

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locale, setLocale] = useState('en');
  const [role, setRole] = useState<string>(ROLES.CUSTOMER);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    const isTrainer = user.role === ROLES.TRAINER || user.role === ROLES.ADMIN;
    setRole(isTrainer ? ROLES.TRAINER : ROLES.CUSTOMER);
    const api = isTrainer ? trainerApi : customerApi;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.viewProfile();
        const data = res.data as { mtype?: string; name?: string; emailid?: string; phone?: string; locale?: string };
        if (!cancelled && data?.mtype === 'success') {
          setName(data.name ?? '');
          setEmail(data.emailid ?? '');
          setPhone(data.phone ?? '');
          setLocale(data.locale ?? 'en');
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiClientError ? e.message : 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const api = role === ROLES.TRAINER ? trainerApi : customerApi;
    try {
      const res = await api.editProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        locale: locale.trim() || undefined,
      });
      const data = res.data as { mtype?: string; message?: string };
      if (data?.mtype === 'success') {
        router.push('/profile');
        router.refresh();
      } else {
        setError('Update failed');
      }
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="gf-profile-main" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="gf-profile-main" style={{ maxWidth: 480, margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/profile" style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}>
          ← Back to Profile
        </Link>
      </div>
      <h1 style={{ marginBottom: '1rem' }}>Edit Profile</h1>
      {error && <p style={{ color: 'var(--groupfit-secondary)', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: 8 }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            readOnly
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: 8, backgroundColor: '#eee' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="phone" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Phone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7700 900000"
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: 8 }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="locale" style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Locale</label>
          <input
            id="locale"
            type="text"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            placeholder="en"
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: 8 }}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'var(--groupfit-secondary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </main>
  );
}
