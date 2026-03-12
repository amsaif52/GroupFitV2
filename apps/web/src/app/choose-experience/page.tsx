'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStoredUser, setStoredViewAs, type ViewAs } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { ROUTES } from '../routes';

export default function ChooseExperiencePage() {
  const router = useRouter();
  const { user, mounted } = useStoredUser();

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace(ROUTES.login);
      return;
    }
    if (user.role !== ROLES.ADMIN) {
      router.replace(ROUTES.dashboard);
    }
  }, [mounted, user, router]);

  if (!mounted) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <p>Loading…</p>
      </main>
    );
  }
  if (!user || user.role !== ROLES.ADMIN) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <p>Loading…</p>
      </main>
    );
  }

  const isAdmin = true;

  function handleChoose(viewAs: ViewAs) {
    setStoredViewAs(viewAs);
    router.push(ROUTES.dashboard);
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--groupfit-primary-light)',
      }}
    >
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--groupfit-black)',
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        Choose your experience
      </h1>
      <p
        style={{
          color: 'var(--groupfit-grey)',
          marginBottom: 32,
          textAlign: 'center',
          maxWidth: 360,
        }}
      >
        You can use GroupFit as a customer to book sessions, or as a trainer to manage your sessions
        and earnings. Select how you&apos;d like to continue.
      </p>
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 320 }}
      >
        <button
          type="button"
          onClick={() => handleChoose('customer')}
          style={{
            padding: '16px 24px',
            borderRadius: 12,
            border: '2px solid var(--groupfit-secondary)',
            background: 'var(--groupfit-primary-light)',
            color: 'var(--groupfit-secondary)',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Continue as Customer
        </button>
        <button
          type="button"
          onClick={() => handleChoose('trainer')}
          style={{
            padding: '16px 24px',
            borderRadius: 12,
            border: '2px solid var(--groupfit-secondary)',
            background: 'var(--groupfit-primary-light)',
            color: 'var(--groupfit-secondary)',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Continue as Trainer
        </button>
        {isAdmin && (
          <Link
            href={ROUTES.adminDashboard}
            style={{
              display: 'block',
              padding: '16px 24px',
              borderRadius: 12,
              border: '2px solid var(--groupfit-grey)',
              background: 'var(--groupfit-primary-light)',
              color: 'var(--groupfit-grey-dark)',
              fontSize: 16,
              fontWeight: 600,
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            Admin dashboard
          </Link>
        )}
      </div>
      <Link
        href={ROUTES.login}
        style={{ marginTop: 32, fontSize: 14, color: 'var(--groupfit-secondary)', fontWeight: 500 }}
      >
        ← Back to login
      </Link>
    </main>
  );
}
