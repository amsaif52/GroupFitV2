'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '1rem' }}>Coming soon</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        This page is not built yet. We’ll add it soon.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Go back
        </button>
        <Link href="/dashboard" style={{ padding: '0.5rem 1rem', color: 'var(--groupfit-secondary)', fontWeight: 600 }}>
          Dashboard
        </Link>
        <Link href="/profile" style={{ padding: '0.5rem 1rem', color: 'var(--groupfit-secondary)', fontWeight: 600 }}>
          Profile
        </Link>
      </div>
    </main>
  );
}
