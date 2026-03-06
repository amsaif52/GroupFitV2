'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ServerUnavailablePage() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setError(null);
    setRetrying(true);
    try {
      await api.get<{ status: string }>('/health');
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Still unavailable. Please try again in a moment.');
    } finally {
      setRetrying(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Server unavailable</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        We couldn’t reach the server. This might be temporary. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={handleRetry}
        disabled={retrying}
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: 8,
          border: 'none',
          background: 'var(--groupfit-secondary, #2563eb)',
          color: '#fff',
          fontWeight: 600,
          cursor: retrying ? 'not-allowed' : 'pointer',
          opacity: retrying ? 0.7 : 1,
        }}
      >
        {retrying ? 'Checking…' : 'Retry'}
      </button>
      {error && <p style={{ color: 'var(--groupfit-secondary)', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</p>}
      <p style={{ marginTop: '2rem' }}>
        <Link href="/login" style={{ color: 'var(--groupfit-secondary)', fontWeight: 600 }}>
          ← Back to login
        </Link>
      </p>
    </main>
  );
}
