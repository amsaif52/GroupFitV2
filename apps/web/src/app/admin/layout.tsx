'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStoredUser } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { AdminLayout } from '../AdminLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, mounted } = useStoredUser();

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== ROLES.ADMIN) {
      router.replace('/dashboard');
    }
  }, [mounted, user, router]);

  if (!mounted) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading…</div>;
  }
  if (!user || user.role !== ROLES.ADMIN) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading…</div>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
