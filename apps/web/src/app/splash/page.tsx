'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplashScreen } from '@groupfit/shared/components';
import { ROUTES } from '../routes';

const REDIRECT_DELAY_MS = 2000;

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/');
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <SplashScreen
      title="GroupFit"
      loading
    />
  );
}
