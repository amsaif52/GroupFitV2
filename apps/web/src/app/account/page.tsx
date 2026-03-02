'use client';

import { useRouter } from 'next/navigation';
import { getStoredUser, clearStoredToken } from '@/lib/auth';
import { ROLES, type Role } from '@groupfit/shared';
import { getTranslations } from '@groupfit/shared';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '../routes';
import { CustomerProfileContent, TrainerProfileContent } from '../profile/profileContent';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser> | undefined>(undefined);
  const [role, setRole] = useState<Role>(ROLES.CUSTOMER);
  const t = getTranslations('en');

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

  return (
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
}
