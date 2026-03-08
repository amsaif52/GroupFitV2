'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import {
  getTranslations,
  ROLES,
  decodeJwtPayload,
  getApiErrorMessage,
  type Role,
  type Locale,
  type LoginResponse,
} from '@groupfit/shared';
import { LoginScreen } from '@/lib/shared-login';
import { api } from '@/lib/api';
import { setStoredToken } from '@/lib/auth';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? undefined;

export default function LoginPage() {
  const router = useRouter();
  const [locale] = useState<Locale>('en');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = getTranslations(locale);

  async function handleSubmit(email: string, password: string) {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      setStoredToken(data.accessToken);
      const role = data.user?.role ?? (decodeJwtPayload(data.accessToken)?.role as Role);
      router.push(role === ROLES.ADMIN ? '/choose-experience' : '/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(payload: string, type: 'phone' | 'email') {
    setError(null);
    const { data } = await api.post<{ message: string; userCode: string }>('/auth/send-otp', {
      data: payload.trim(),
      type,
    });
    return { userCode: data.userCode };
  }

  async function handleVerifyOtp(otp: string, userCode: string) {
    setError(null);
    const { data } = await api.post<LoginResponse>('/auth/verify-otp', {
      otp,
      userCode,
    });
    setStoredToken(data.accessToken);
    const role = data.user?.role ?? (decodeJwtPayload(data.accessToken)?.role as Role);
    router.push(role === ROLES.ADMIN ? '/choose-experience' : '/dashboard');
    router.refresh();
  }

  const handleGoogleSuccess = useCallback(
    async (credential: string) => {
      setError(null);
      try {
        const { data } = await api.post<LoginResponse>('/auth/google', {
          idToken: credential,
        });
        setStoredToken(data.accessToken);
        const role = data.user?.role ?? (decodeJwtPayload(data.accessToken)?.role as Role);
        router.push(role === ROLES.ADMIN ? '/choose-experience' : '/dashboard');
        router.refresh();
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Google sign-in failed'));
      }
    },
    [router]
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

  const googleButton = googleClientId ? (
    <GoogleLogin
      onSuccess={(res: { credential?: string }) =>
        res.credential && handleGoogleSuccess(res.credential)
      }
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
        phoneLabel={t.auth.phone}
        sendCodeLabel={t.auth.sendCode}
        otpPlaceholder={t.auth.otpPlaceholder}
        verifyLabel={t.auth.verify}
        resendCodeLabel={t.auth.resendCode}
        phoneTabLabel={t.auth.phone}
        emailTabLabel={t.auth.email}
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
        onSendOtp={handleSendOtp}
        onVerifyOtp={handleVerifyOtp}
      />
      {/* <p style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
        <Link
          href={ROUTES.serverUnavailable}
          style={{ color: 'var(--groupfit-secondary)', fontWeight: 500 }}
        >
          Having connection issues?
        </Link>
      </p> */}
      {/* <div className="gf-locale">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          label={locale === 'en' ? 'Français' : 'English'}
          onPress={() => setLocale(locale === 'en' ? 'fr' : 'en')}
        />
      </div> */}
    </>
  );

  if (googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
  }
  return content;
}
