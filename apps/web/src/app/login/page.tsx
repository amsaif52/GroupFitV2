'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { getTranslations, ROLES, type Role } from '@groupfit/shared';
import { LoginScreen, Button } from '@groupfit/shared/components';
import type { Locale } from '@groupfit/shared';
import { api } from '@/lib/api';
import { setStoredToken } from '@/lib/auth';
import type { LoginResponse } from '@groupfit/shared';
import { ApiClientError } from '@groupfit/shared';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? undefined;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = (searchParams.get('role') as Role) ?? ROLES.CUSTOMER;
  const [locale, setLocale] = useState<Locale>('en');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = getTranslations(locale);

  async function handleSubmit(email: string, password: string) {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
      setStoredToken(data.accessToken);
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = useCallback(
    async (credential: string) => {
      setError(null);
      try {
        const { data } = await api.post<LoginResponse>('/auth/google', {
          idToken: credential,
          role: roleParam,
        });
        setStoredToken(data.accessToken);
        router.push('/dashboard');
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof ApiClientError ? err.message : 'Google sign-in failed');
      }
    },
    [roleParam, router],
  );

  const handleGoogleError = useCallback(() => {
    setError('Google sign-in was cancelled or failed.');
  }, []);

  function handleGoogleLoginFallback() {
    setError('Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
  }

  async function handleAppleLogin() {
    setError(null);
    try {
      setError('Apple sign-in is not configured yet. Use email/password or Google.');
    } catch {
      setError('Something went wrong.');
    }
  }

  const googleButton =
    googleClientId ? (
      <GoogleLogin
        onSuccess={(res: { credential?: string }) => res.credential && handleGoogleSuccess(res.credential)}
        onError={handleGoogleError}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="320"
      />
    ) : null;

  const content = (
    <>
      <LoginScreen
        variant="admin"
        title={t.auth.signIn}
        subtitle={t.auth.enterEmailPassword}
        emailLabel={t.auth.email}
        passwordLabel={t.auth.password}
        submitLabel={t.auth.login}
        loadingLabel={t.common.loading}
        footerPrompt="New here?"
        footerLinkText={t.auth.signUp}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onSignUpClick={() => router.push('/signup')}
        onGooglePress={googleButton ? undefined : handleGoogleLoginFallback}
        onApplePress={handleAppleLogin}
        googleButton={googleButton ?? undefined}
        continueWithGoogleLabel={t.auth.continueWithGoogle}
        continueWithAppleLabel={t.auth.continueWithApple}
        orLabel={t.auth.or}
      />
      <div className="gf-locale">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          label={locale === 'en' ? 'Français' : 'English'}
          onPress={() => setLocale(locale === 'en' ? 'fr' : 'en')}
        />
      </div>
    </>
  );

  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        {content}
      </GoogleOAuthProvider>
    );
  }
  return content;
}
