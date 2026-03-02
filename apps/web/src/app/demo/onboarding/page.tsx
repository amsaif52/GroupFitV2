'use client';

import { OnboardingScreen, ONBOARDING_SLIDES_CUSTOMER } from '@groupfit/shared/components';
import { useRouter } from 'next/navigation';

export default function DemoOnboardingPage() {
  const router = useRouter();

  return (
    <OnboardingScreen
      slides={ONBOARDING_SLIDES_CUSTOMER}
      onComplete={() => router.push('/login')}
      getStartedLabel="Get Started"
    />
  );
}
