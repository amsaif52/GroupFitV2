'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import {
  getTranslations,
  ROLES,
  ApiClientError,
  decodeJwtPayload,
  type Role,
  type Locale,
  type LoginResponse,
  type SignupFormInput,
  SignupScreen,
} from '@groupfit/shared';
import { api } from '@/lib/api';
import { setStoredToken } from '@/lib/auth';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? undefined;

type CountryOption = { code: string; dial: string; name: string };

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = (searchParams.get('role') as Role) ?? ROLES.CUSTOMER;
  const [locale] = useState<Locale>('en');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const t = getTranslations(locale);

  useEffect(() => {
    api
      .post<{ mtype?: string; list?: { id: string; name: string; isdCode: string }[] }>(
        '/auth/country-list',
        {}
      )
      .then((res) => {
        const list = res?.data?.list;
        if (list?.length) {
          setCountryOptions(list.map((c) => ({ code: c.id, dial: c.isdCode, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  async function handleSendSignupOtp(data: SignupFormInput) {
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/signup-send-otp', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        state: data.state,
        role: data.role ?? 'customer',
        ...(data.referralCode && { referralCode: data.referralCode }),
      });
    } catch (err: unknown) {
      setError(
        err instanceof ApiClientError ? err.message : 'Failed to send code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifySignupOtp(otp: string, data: SignupFormInput) {
    setError(null);
    setLoading(true);
    try {
      const { data: res } = await api.post<LoginResponse>('/auth/signup-verify', {
        otp,
        phone: data.phone,
        name: data.name,
        email: data.email,
        country: data.country,
        state: data.state,
        role: data.role ?? 'customer',
        ...(data.referralCode && { referralCode: data.referralCode }),
      });
      setStoredToken(res.accessToken);
      const role = res.user?.role ?? (decodeJwtPayload(res.accessToken)?.role as Role);
      router.push(role === ROLES.ADMIN ? '/choose-experience' : '/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof ApiClientError ? err.message : 'Invalid or expired code. Please try again.'
      );
      throw err;
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
    [roleParam, router]
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

  const googleButton = googleClientId ? (
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
        title={t.auth.signUp}
        subtitle={t.auth.enterDetailsToCreateAccount}
        nameLabel={t.auth.name}
        emailLabel={t.auth.email}
        phoneLabel={t.auth.phone ?? 'Phone number'}
        countryLabel={t.auth.country ?? 'Country'}
        stateLabel={t.auth.state ?? 'State'}
        referralCodeLabel={t.auth.referralCode ?? 'Referral code (optional)'}
        submitLabel={t.auth.createAccount}
        loadingLabel={t.common.loading}
        footerPrompt={t.auth.alreadyHaveAccount}
        footerLinkText={t.auth.login}
        privacyLabel={t.auth.privacyAcceptPrefix ?? 'I accept the '}
        privacyLinkText={t.auth.privacyLink ?? 'Privacy Policy'}
        onPrivacyClick={() => window.open('https://groupfitapp.com/privacy-policy/', '_blank')}
        termsLabel={t.auth.termsAgreePrefix}
        termsLinkText={t.auth.termsLink}
        onTermsClick={() =>
          window.open('https://groupfitapp.com/app-user-terms-and-condition/', '_blank')
        }
        onSendSignupOtp={handleSendSignupOtp}
        onVerifySignupOtp={handleVerifySignupOtp}
        loading={loading}
        error={error}
        otpPlaceholder={t.auth.otpPlaceholder ?? 'Enter 4-digit code'}
        verifyLabel={t.auth.verify ?? 'Verify and create account'}
        resendCodeLabel={t.auth.resendCode ?? 'Resend code'}
        changeNumberLabel={t.auth.changeNumber ?? 'Change number'}
        countryOptions={countryOptions.length > 0 ? countryOptions : undefined}
        onLoginClick={() => router.push('/login')}
        onGooglePress={googleButton ? undefined : handleGoogleSignupFallback}
        onApplePress={handleAppleSignup}
        googleButton={googleButton ?? undefined}
        continueWithGoogleLabel={t.auth.continueWithGoogle}
        continueWithAppleLabel={t.auth.continueWithApple}
        orLabel={t.auth.or}
      />
    </>
  );

  if (googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
  }
  return content;
}
