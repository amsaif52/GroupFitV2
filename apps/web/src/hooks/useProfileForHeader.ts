'use client';

import { useState, useEffect } from 'react';
import { ROLES } from '@groupfit/shared';
import { useStoredUser } from '@/lib/auth';
import { customerApi, trainerApi } from '@/lib/api';

type ProfileForHeader = {
  name: string | null;
  avatarUrl: string | null;
};

/**
 * Fetches current user profile (name, avatarUrl) for header display.
 * Uses customer or trainer API based on role. Falls back to JWT name until loaded.
 */
export function useProfileForHeader(): ProfileForHeader {
  const { user } = useStoredUser();
  const [profile, setProfile] = useState<ProfileForHeader>({
    name: user?.name ?? null,
    avatarUrl: null,
  });

  useEffect(() => {
    setProfile((prev) => ({ ...prev, name: user?.name ?? null }));
    if (!user?.sub) {
      setProfile((prev) => ({ ...prev, avatarUrl: null }));
      return;
    }
    const isTrainer = user.role === ROLES.TRAINER || user.role === ROLES.ADMIN;
    const api = isTrainer ? trainerApi : customerApi;
    api
      .viewProfile()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'success') {
          setProfile({
            name: (data.name as string) ?? user?.name ?? null,
            avatarUrl: (data.avatarUrl as string) ?? null,
          });
        } else {
          setProfile((prev) => ({ ...prev, avatarUrl: null }));
        }
      })
      .catch(() => {
        setProfile((prev) => ({ ...prev, avatarUrl: null }));
      });
  }, [user?.sub, user?.role, user?.name]);

  return profile;
}
