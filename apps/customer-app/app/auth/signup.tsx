import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { getTranslations, resolveAppLocale, ROLES } from '@groupfit/shared';
import type { LoginResponse } from '@groupfit/shared';
import { SignupScreen } from '@groupfit/shared/components/native';
import { api, setStoredToken, getStoredUser } from '../../lib/api';
import { getApiErrorMessage } from '@groupfit/shared';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export default function SignupScreenRoute() {
  const router = useRouter();
  const t = getTranslations(resolveAppLocale(getStoredUser()?.locale));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: { name: string; email: string; password: string }) {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: ROLES.CUSTOMER,
      });
      await setStoredToken(res.data.accessToken);
      router.replace('/app/home');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Sign up failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGooglePress() {
    setError(null);
    if (!GOOGLE_WEB_CLIENT_ID) {
      setError('Google sign-up is not configured.');
      return;
    }
    try {
      GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
      const response = await GoogleSignin.signIn();
      if (response?.type !== 'success' || !response.data?.idToken) {
        setError('Google sign-up was cancelled or did not return a token.');
        return;
      }
      const res = await api.post<LoginResponse>('/auth/google', {
        idToken: response.data.idToken,
        role: ROLES.CUSTOMER,
      });
      await setStoredToken(res.data.accessToken);
      router.replace('/app/home');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Google sign-up failed'));
    }
  }

  async function handleApplePress() {
    setError(null);
    try {
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });
      if (!cred.identityToken) {
        setError('Apple sign-up did not return a token.');
        return;
      }
      const res = await api.post<LoginResponse>('/auth/apple', {
        idToken: cred.identityToken,
        role: ROLES.CUSTOMER,
      });
      await setStoredToken(res.data.accessToken);
      router.replace('/app/home');
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'ERR_REQUEST_CANCELED'
      ) {
        return;
      }
      setError(getApiErrorMessage(err, 'Apple sign-up failed'));
    }
  }

  return (
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
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onLoginClick={() => router.replace('/auth/login')}
      onGooglePress={handleGooglePress}
      onApplePress={Platform.OS === 'ios' ? handleApplePress : undefined}
      continueWithGoogleLabel={t.auth.continueWithGoogle}
      continueWithAppleLabel={t.auth.continueWithApple}
      orLabel={t.auth.or}
    />
  );
}
