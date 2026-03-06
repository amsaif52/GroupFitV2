'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import { getTranslations, ROLES, type Role } from '@groupfit/shared';
import { SignupScreen, Button } from '@groupfit/shared/components';
import type { Locale } from '@groupfit/shared';
import { api } from '@/lib/api';
import { ROUTES } from '../routes';
import { setStoredToken } from '@/lib/auth';
import type { LoginResponse } from '@groupfit/shared';
import { ApiClientError, decodeJwtPayload } from '@groupfit/shared';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? undefined;

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = (searchParams.get('role') as Role) ?? ROLES.CUSTOMER;
  const [locale, setLocale] = useState<Locale>('en');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = getTranslations(locale);

  async function handleSubmit(data: { name: string; email: string; password: string }) {
    setError(null);
    setLoading(true);
    try {
      const { data: res } = await api.post<LoginResponse>('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: roleParam,
      });
      setStoredToken(res.accessToken);
      const role = res.user?.role ?? (decodeJwtPayload(res.accessToken)?.role as Role);
      router.push(role === ROLES.ADMIN ? '/choose-experience' : '/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
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
        const role = data.user?.role ?? (decodeJwtPayload(data.accessToken)?.role as Role);
        router.push(role === ROLES.ADMIN ? '/choose-experience' : '/dashboard');
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof ApiClientError ? err.message : 'Google sign-up failed');
      }
    },
    [roleParam, router],
  );

  const handleGoogleError = useCallback(() => {
    setError('Google sign-up was cancelled or failed.');
  }, []);

  function handleGoogleSignupFallback() {
    setError('Google sign-up is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
  }

  function handleAppleSignup() {
    setError(null);
    setError('Apple sign-up is not configured yet. Use the form below or Google.');
  }

  const googleButton =
    googleClientId ? (
      <GoogleLogin
        onSuccess={(res) => res.credential && handleGoogleSuccess(res.credential)}
        onError={handleGoogleError}
        theme="outline"
        size="large"
        text="signup_with"
        shape="rectangular"
        width="320"
      />
    ) : null;

  const content = (
    <>
      <SignupScreen
        variant="admin"
        title={t.auth.signUp}
        subtitle={t.auth.enterDetailsToCreateAccount}
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
        onTermsClick={() => window.open('https://groupfitapp.com/app-user-terms-and-condition/', '_blank')}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onLoginClick={() => router.push('/login')}
        onGooglePress={googleButton ? undefined : handleGoogleSignupFallback}
        onApplePress={handleAppleSignup}
        googleButton={googleButton ?? undefined}
        continueWithGoogleLabel={t.auth.continueWithGoogle}
        continueWithAppleLabel={t.auth.continueWithApple}
        orLabel={t.auth.or}
      />
      <p style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
        <Link href={ROUTES.serverUnavailable} style={{ color: 'var(--groupfit-secondary)', fontWeight: 500 }}>
          Having connection issues?
        </Link>
      </p>
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
