'use client';

import Link from 'next/link';

export default function AccountActivationPage() {
  return (
    <main style={{ maxWidth: 480, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Account activation</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Your account is pending activation. You may need to verify your email or wait for admin
        approval. We’ll notify you when you can sign in.
      </p>
      <p>
        <Link
          href="/login"
          style={{ color: 'var(--groupfit-secondary, #2563eb)', fontWeight: 600 }}
        >
          ← Back to login
        </Link>
      </p>
    </main>
  );
}
