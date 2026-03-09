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

  // Always render the same layout so server and client HTML match (avoids hydration error).
  // Redirect happens in useEffect when user is missing or not admin.
  return <AdminLayout>{children}</AdminLayout>;
}
