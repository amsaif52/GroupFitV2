'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { VerifyNumberScreen } from '@groupfit/shared/components';
import { ROUTES } from '../routes';
import { api } from '@/lib/api';
import { setStoredToken } from '@/lib/auth';
import type { LoginResponse } from '@groupfit/shared';
import { ApiClientError } from '@groupfit/shared';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phoneFromQuery = searchParams.get('phone') ?? searchParams.get('mobile') ?? '';
  const userCodeFromQuery = searchParams.get('userCode') ?? searchParams.get('usercode') ?? '';

  const [phoneNumber, setPhoneNumber] = useState(phoneFromQuery);
  const [userCode, setUserCode] = useState(userCodeFromQuery);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setPhoneNumber(phoneFromQuery);
    setUserCode(userCodeFromQuery);
  }, [phoneFromQuery, userCodeFromQuery]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  async function handleVerify(otp: string) {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>('/auth/verify-otp', {
        otp,
        userCode: userCode || 'demo',
      });
      setStoredToken(data.accessToken);
      router.push(ROUTES.dashboard);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : 'Verification failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await api.post('/auth/resend-otp', {
        phoneNumber: phoneNumber || 'demo',
        userCode: userCode || undefined,
      });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Could not resend code. Try again later.',
      );
    }
  }

  function handleBack() {
    router.push(ROUTES.login);
  }

  if (!phoneFromQuery && !userCodeFromQuery) {
    return (
      <main className="gf-auth-main">
        <div className="gf-auth" style={{ padding: 24, textAlign: 'center' }}>
          <h1 className="gf-auth__title">Verify Phone Number</h1>
          <p className="gf-auth__subtitle">
            This page is used after requesting an OTP. Please go to login or signup
            and request a code, or open this page with query params: ?phone=...&amp;userCode=...
          </p>
          <Link href={ROUTES.login} className="gf-verify__resend-btn" style={{ marginTop: 16 }}>
            ← Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <VerifyNumberScreen
      phoneNumber={phoneNumber || 'your phone'}
      onVerify={handleVerify}
      onResend={handleResend}
      onBack={handleBack}
      loading={loading}
      error={error}
      resendCooldownSeconds={resendCooldown}
      title="Verify Your\nPhone Number"
      submitLabel="Verify"
      backLabel="Back"
    />
  );
}
