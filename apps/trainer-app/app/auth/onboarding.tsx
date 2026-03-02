import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingScreen, ONBOARDING_SLIDES_TRAINER } from '@groupfit/shared/components/native';

const ONBOARDING_COMPLETED_KEY = 'OnBoardingCompleted';

export default function OnboardingScreenRoute() {
  const router = useRouter();

  async function handleComplete() {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'YES');
    router.replace('/auth/login');
  }

  return (
    <OnboardingScreen
      slides={ONBOARDING_SLIDES_TRAINER}
      onComplete={handleComplete}
      getStartedLabel="Let's begin"
    />
  );
}
