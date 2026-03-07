'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';
import { ROLES } from '@groupfit/shared';
import { AdminLayout } from '../AdminLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = getStoredUser();

  useEffect(() => {
    if (user === null) {
      router.replace('/login');
      return;
    }
    if (user && user.role !== ROLES.ADMIN) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (!user) return null;
  if (user.role !== ROLES.ADMIN) return null;

  return <AdminLayout>{children}</AdminLayout>;
}
