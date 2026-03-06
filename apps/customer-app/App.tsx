import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import config from './tamagui.config';
import { getTranslations, resolveAppLocale, ROLES } from '@groupfit/shared';
import {
  LoginScreen,
  SignupScreen,
  OnboardingScreen,
  ONBOARDING_SLIDES_CUSTOMER,
  ProfileScreenNative,
  ErrorBoundaryNative,
} from '@groupfit/shared/components/native';
import { getStoredUser } from './lib/api';

const ONBOARDING_COMPLETED_KEY = 'OnBoardingCompleted';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
});

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const t = getTranslations(resolveAppLocale(getStoredUser()?.locale));

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY).then((value: string | null) => {
      setShowOnboarding(value !== 'YES');
    });
  }, []);

  async function handleOnboardingComplete() {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'YES');
    setShowOnboarding(false);
  }

  if (showOnboarding === null) {
    return null;
  }

  if (showOnboarding) {
    return (
      <ErrorBoundaryNative>
        <TamaguiProvider config={config} defaultTheme="light">
          <OnboardingScreen
            slides={ONBOARDING_SLIDES_CUSTOMER}
            onComplete={handleOnboardingComplete}
            getStartedLabel="Get Started"
          />
          <StatusBar style="light" />
        </TamaguiProvider>
      </ErrorBoundaryNative>
    );
  }

  if (isLoggedIn) {
    return (
      <ErrorBoundaryNative>
        <TamaguiProvider config={config} defaultTheme="light">
          <ProfileScreenNative
            variant="customer"
            userName={userName}
            onLogout={async () => {
              setIsLoggedIn(false);
              setUserName('');
              await AsyncStorage.removeItem('groupfit_token');
            }}
            onEditProfile={() => {}}
            onReferFriend={() => {}}
            onMyLocations={() => {}}
            onNotifications={() => {}}
            onGroups={() => {}}
            onPaymentHistory={() => {}}
            onHelp={() => {}}
          />
          <StatusBar style="dark" />
        </TamaguiProvider>
      </ErrorBoundaryNative>
    );
  }

  if (showSignup) {
    return (
      <ErrorBoundaryNative>
        <QueryClientProvider client={queryClient}>
          <TamaguiProvider config={config} defaultTheme="light">
            <SignupScreen
              title={t.auth.signUpTitle}
              subtitle={t.roles[ROLES.CUSTOMER]}
              nameLabel={t.auth.name}
              emailLabel={t.auth.email}
              passwordLabel={t.auth.password}
              confirmPasswordLabel={t.auth.confirmPassword}
              submitLabel={t.auth.createAccount}
              loadingLabel={t.common.loading}
              footerPrompt={t.auth.alreadyHaveAccount}
              footerLinkText={t.auth.login}
              termsLabel={t.auth.termsAgreePrefix}
              termsLinkText={t.auth.termsLink}
              onSubmit={async () => {
                // TODO: wire api.post('/auth/signup') and then login or verify
              }}
              onLoginClick={() => setShowSignup(false)}
              onGooglePress={async () => {
                // TODO: @react-native-google-signin/google-signin, then POST id_token to backend for JWT
              }}
              onApplePress={async () => {
                // TODO: expo-apple-authentication or @invertase/react-native-apple-authentication, then POST to backend
              }}
              continueWithGoogleLabel={t.auth.continueWithGoogle}
              continueWithAppleLabel={t.auth.continueWithApple}
              orLabel={t.auth.or}
            />
            <StatusBar style="dark" />
          </TamaguiProvider>
        </QueryClientProvider>
      </ErrorBoundaryNative>
    );
  }

  return (
    <ErrorBoundaryNative>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config} defaultTheme="light">
          <LoginScreen
            title={'Get Together.\nGet Fit.'}
            subtitle={t.roles[ROLES.CUSTOMER]}
            emailLabel={t.auth.email}
            passwordLabel={t.auth.password}
            submitLabel={t.auth.login}
            loadingLabel={t.common.loading}
            footerPrompt="New here?"
            footerLinkText={t.auth.signUp}
            onSubmit={async (email, _password) => {
              // TODO: wire api.post('/auth/login') and store token; then set token + user
              setUserName(email || '');
              setIsLoggedIn(true);
            }}
            onSignUpClick={() => setShowSignup(true)}
            onGooglePress={async () => {
              // TODO: @react-native-google-signin/google-signin, then POST id_token to backend for JWT
            }}
            onApplePress={async () => {
              // TODO: expo-apple-authentication or @invertase/react-native-apple-authentication, then POST to backend
            }}
            continueWithGoogleLabel={t.auth.continueWithGoogle}
            continueWithAppleLabel={t.auth.continueWithApple}
            orLabel={t.auth.or}
          />
          <StatusBar style="dark" />
        </TamaguiProvider>
      </QueryClientProvider>
    </ErrorBoundaryNative>
  );
}
