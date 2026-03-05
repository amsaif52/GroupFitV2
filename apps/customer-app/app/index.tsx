import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen } from '@groupfit/shared/components/native';

const ONBOARDING_COMPLETED_KEY = 'OnBoardingCompleted';
const TOKEN_KEY = 'groupfit_token';

export default function Index() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const [onboardingDone, token] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY),
        AsyncStorage.getItem(TOKEN_KEY),
      ]);

      if (cancelled) return;

      if (onboardingDone !== 'YES') {
        router.replace('/auth/onboarding');
        return;
      }
      if (!token) {
        router.replace('/auth/login');
        return;
      }
      router.replace('/app');
    }

    run().then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return <SplashScreen title="GroupFit" loading />;
  }

  return null;
}
