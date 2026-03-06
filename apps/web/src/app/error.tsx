'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main style={{ maxWidth: 480, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        We ran into an error. You can try again or go back to the dashboard.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            border: 'none',
            background: 'var(--groupfit-secondary)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 8,
            border: '2px solid var(--groupfit-secondary)',
            background: 'transparent',
            color: 'var(--groupfit-secondary)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Dashboard
        </Link>
      </div>
      <p style={{ marginTop: '2rem' }}>
        <Link href="/login" style={{ color: 'var(--groupfit-grey)', fontSize: 14 }}>
          ← Back to login
        </Link>
      </p>
    </main>
  );
}
