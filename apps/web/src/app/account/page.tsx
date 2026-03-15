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
import { CustomerHeader } from '@/components/CustomerHeader';
import { trainerApi } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getStoredUser> | undefined>(undefined);
  const [role, setRole] = useState<Role>(ROLES.CUSTOMER);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [reviewCount, setReviewCount] = useState<number | undefined>(undefined);
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
    if (role !== ROLES.TRAINER) return;
    let cancelled = false;
    trainerApi
      .getTrainerAvgRating({})
      .then((res) => {
        if (cancelled) return;
        const data = res?.data as
          | { mtype?: string; rating?: number; reviewCount?: number }
          | undefined;
        if (data?.mtype === 'success') {
          setRating(data.rating ?? 0);
          setReviewCount(data.reviewCount ?? 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRating(0);
          setReviewCount(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

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
      <CustomerHeader
        title="Account"
        backLink={
          <Link href={ROUTES.dashboard} className="gf-home__header-link">
            ← {t.nav.dashboard}
          </Link>
        }
      />

      {isTrainer ? (
        <TrainerProfileContent
          user={user}
          onLogout={handleLogout}
          t={t}
          rating={rating}
          reviewCount={reviewCount}
        />
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
