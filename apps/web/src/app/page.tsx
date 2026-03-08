'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES } from '@groupfit/shared';
import { ROUTES } from './routes';
import { getStoredUser } from '@/lib/auth';

/**
 * Home: unauthenticated users go to login; authenticated users go to dashboard
 * or choose-experience (if they have multiple roles, i.e. admin).
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace(ROUTES.login);
      return;
    }
    // Admin can choose customer/trainer/admin experience; others go to dashboard
    if (user.role === ROLES.ADMIN) {
      router.replace(ROUTES.chooseExperience);
    } else {
      router.replace(ROUTES.dashboard);
    }
  }, [router]);

  return (
    <main style={{ padding: 24, textAlign: 'center' }}>
      <p>Loading…</p>
    </main>
  );
}
