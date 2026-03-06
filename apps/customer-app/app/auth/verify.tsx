import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VerifyNumberScreen } from '@groupfit/shared/components/native';
import { api, setStoredToken } from '../../lib/api';
import type { LoginResponse } from '@groupfit/shared';
import { getApiErrorMessage } from '@groupfit/shared';
import { colors } from '@groupfit/shared/theme';

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; mobile?: string; userCode?: string; usercode?: string }>();
  const phoneNumber = params.phone ?? params.mobile ?? '';
  const userCode = params.userCode ?? params.usercode ?? '';

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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
      await setStoredToken(data.accessToken);
      router.replace('/app/home');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Verification failed. Please try again.'));
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
      setError(getApiErrorMessage(err, 'Could not resend code.'));
    }
  }

  function handleBack() {
    router.replace('/auth/login');
  }

  if (!phoneNumber && !userCode) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>Verify Phone Number</Text>
        <Text style={styles.fallbackText}>
          Open this screen with phone and userCode params.
        </Text>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
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

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
});
