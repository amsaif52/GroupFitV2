import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { getTranslations, ROLES } from '@groupfit/shared';
import type { LoginResponse } from '@groupfit/shared';
import { LoginScreen } from '@groupfit/shared/components/native';
import { api, setStoredToken } from '../../lib/api';
import { ApiClientError } from '@groupfit/shared';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export default function LoginScreenRoute() {
  const router = useRouter();
  const t = getTranslations('en');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(email: string, password: string) {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
      await setStoredToken(data.accessToken);
      router.replace('/app/home');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGooglePress() {
    setError(null);
    if (!GOOGLE_WEB_CLIENT_ID) {
      setError('Google sign-in is not configured.');
      return;
    }
    try {
      GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
      const response = await GoogleSignin.signIn();
      if (response?.type !== 'success' || !response.data?.idToken) {
        setError('Google sign-in was cancelled or did not return a token.');
        return;
      }
      const res = await api.post<LoginResponse>('/auth/google', {
        idToken: response.data.idToken,
        role: ROLES.TRAINER,
      });
      await setStoredToken(res.data.accessToken);
      router.replace('/app/home');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Google sign-in failed');
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
        setError('Apple sign-in did not return a token.');
        return;
      }
      const res = await api.post<LoginResponse>('/auth/apple', {
        idToken: cred.identityToken,
        role: ROLES.TRAINER,
      });
      await setStoredToken(res.data.accessToken);
      router.replace('/app/home');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      setError(err instanceof ApiClientError ? err.message : 'Apple sign-in failed');
    }
  }

  return (
    <LoginScreen
      title="Get Together.\nGet Fit."
      subtitle={t.roles[ROLES.TRAINER]}
      emailLabel={t.auth.email}
      passwordLabel={t.auth.password}
      submitLabel={t.auth.login}
      loadingLabel={t.common.loading}
      footerPrompt="New here?"
      footerLinkText={t.auth.signUp}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onSignUpClick={() => router.push('/auth/signup')}
      onGooglePress={handleGooglePress}
      onApplePress={Platform.OS === 'ios' ? handleApplePress : undefined}
      continueWithGoogleLabel={t.auth.continueWithGoogle}
      continueWithAppleLabel={t.auth.continueWithApple}
      orLabel={t.auth.or}
    />
  );
}
