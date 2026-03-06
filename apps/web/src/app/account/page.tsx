'use client';

import { useRouter } from 'next/navigation';
import { getStoredUser, clearStoredToken } from '@/lib/auth';
import { ROLES, type Role } from '@groupfit/shared';
import { useAppLocale } from '@/hooks/useAppLocale';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../routes';
import { CustomerProfileContent, TrainerProfileContent } from '../profile/profileContent';
import { CustomerLayout } from '../CustomerLayout';
import { TrainerLayout } from '../TrainerLayout';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser> | undefined>(undefined);
  const [role, setRole] = useState<Role>(ROLES.CUSTOMER);
  const { t } = useAppLocale(user?.locale);

  useEffect(() => {
    const u = getStoredUser();
    setUser(u ?? null);
    if (u?.role === ROLES.TRAINER || u?.role === ROLES.ADMIN) {
      setRole(ROLES.TRAINER);
    } else {
      setRole(ROLES.CUSTOMER);
    }
  }, []);

  useEffect(() => {
    if (user === null) {
      router.replace('/login');
    }
  }, [user, router]);

  function handleLogout() {
    clearStoredToken();
    router.push('/login');
    router.refresh();
  }

  if (user === undefined) {
    return (
      <main className="gf-profile-main">
        <p className="gf-profile__loading">Loading...</p>
      </main>
    );
  }

  if (user === null) {
    return null;
  }

  const isTrainer = role === ROLES.TRAINER;

  const content = (
    <main className="gf-profile-main">
      <div className="gf-profile__topbar">
        <Link href={ROUTES.dashboard} className="gf-profile__back">
          ← {t.nav.dashboard}
        </Link>
        <h2 className="gf-profile__title">Account</h2>
      </div>

      {isTrainer ? (
        <TrainerProfileContent user={user} onLogout={handleLogout} t={t} />
      ) : (
        <CustomerProfileContent user={user} onLogout={handleLogout} t={t} />
      )}
    </main>
  );

  if (!isTrainer) {
    return <CustomerLayout>{content}</CustomerLayout>;
  }

  return <TrainerLayout>{content}</TrainerLayout>;
}
