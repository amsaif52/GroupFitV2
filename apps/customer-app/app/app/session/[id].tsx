import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import { colors } from '@groupfit/shared/theme';
import { customerApi } from '../../../lib/api';

function toDatePart(d: Date) {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}
function toTimePart(d: Date) {
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const fetchDetail = () => {
    if (!id) return;
    setLoading(true);
    customerApi
      .fetchSessionDetails(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Not found'));
          setDetail(null);
        } else {
          setDetail(data ?? null);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load session');
        setDetail(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing session ID');
      return;
    }
    fetchDetail();
  }, [id]);

  const handleCancel = () => {
    if (!id) return;
    Alert.alert('Cancel session', 'Cancel this session? This cannot be undone.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: () => {
          setActionLoading(true);
          customerApi
            .cancelSession(id)
            .then((res) => {
              const data = res?.data as Record<string, unknown>;
              if (data?.mtype === 'success') router.replace('/app/sessions');
              else setError(String(data?.message ?? 'Failed to cancel'));
            })
            .catch(() => setError('Failed to cancel session'))
            .finally(() => setActionLoading(false));
        },
      },
    ]);
  };

  const openReschedule = () => {
    setRescheduleError(null);
    if (detail?.scheduledAt) {
      const d = new Date(String(detail.scheduledAt));
      setRescheduleDate(toDatePart(d));
      setRescheduleTime(toTimePart(d));
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setRescheduleDate(toDatePart(d));
      setRescheduleTime('09:00');
    }
    setShowReschedule(true);
  };

  const handleReschedule = () => {
    if (!id) return;
    const dateStr = rescheduleDate.trim();
    const timeStr = rescheduleTime.trim();
    if (!dateStr || !timeStr) {
      setRescheduleError('Enter date (YYYY-MM-DD) and time (HH:MM)');
      return;
    }
    const iso = new Date(dateStr + 'T' + timeStr + ':00').toISOString();
    if (Number.isNaN(Date.parse(iso))) {
      setRescheduleError('Invalid date or time');
      return;
    }
    setActionLoading(true);
    setRescheduleError(null);
    customerApi
      .rescheduleSession(id, iso)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setShowReschedule(false);
          setRescheduleDate('');
          setRescheduleTime('');
          fetchDetail();
        } else {
          setRescheduleError(String(data?.message ?? 'Failed to reschedule'));
        }
      })
      .catch(() => setRescheduleError('Failed to reschedule session'))
      .finally(() => setActionLoading(false));
  };

  const canAct = detail && String(detail.status) === 'scheduled';
  const canPay = detail && String(detail.status) === 'scheduled';
  const amountCents = detail?.amountCents != null ? Number(detail.amountCents) : 0;
  const trainerCurrency =
    detail && typeof (detail as { trainerCurrency?: string }).trainerCurrency === 'string'
      ? (detail as { trainerCurrency: string }).trainerCurrency
      : 'usd';
  const currencyDisplay = trainerCurrency.toUpperCase();

  const handlePayPress = () => {
    if (!id) return;
    setPayError(null);
    setPayLoading(true);
    Promise.all([
      customerApi.viewProfile().then((r) => (r?.data as { countryCode?: string })?.countryCode),
      customerApi.paymentSheet({ amountCents: amountCents || 100, currency: trainerCurrency }),
    ])
      .then(([customerCountryCode, sheetRes]) => {
        const data = sheetRes?.data as { clientSecret?: string | null };
        const clientSecret = data?.clientSecret;
        if (!clientSecret) {
          setPayError('Unable to start payment. Check that Stripe is configured.');
          setPayLoading(false);
          return;
        }
        const countryCode =
          (customerCountryCode && String(customerCountryCode).toUpperCase()) || 'US';
        const payParams: Parameters<typeof initPaymentSheet>[0] = {
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'GroupFit',
          ...(Platform.OS === 'ios' && { applePay: { merchantCountryCode: countryCode } }),
          ...(Platform.OS === 'android' && {
            googlePay: { merchantCountryCode: countryCode, currencyCode: currencyDisplay },
          }),
        };
        return initPaymentSheet(payParams)
          .then((initResult) => {
            if (initResult.error) {
              setPayError(initResult.error.message ?? 'Failed to initialize payment');
              setPayLoading(false);
              return;
            }
            return presentPaymentSheet();
          })
          .then((presentResult) => {
            if (presentResult?.error) {
              setPayError(presentResult.error?.message ?? 'Payment failed');
              setPayLoading(false);
              return;
            }
            const paymentIntentId = clientSecret.split('_secret_')[0];
            if (paymentIntentId) {
              return customerApi.sessionPayment({ sessionId: id, paymentIntentId });
            }
          })
          .then((linkRes) => {
            const linkData = linkRes?.data as { paid?: boolean } | undefined;
            if (linkData?.paid) {
              fetchDetail();
            }
          })
          .catch(() => setPayError('Payment failed'))
          .finally(() => setPayLoading(false));
      })
      .catch(() => {
        setPayError('Failed to start payment');
        setPayLoading(false);
      });
  };

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Invalid session.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Text style={styles.link}>← My Sessions</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Session details</Text>
      {loading ? (
        <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 24 }} />
      ) : error ? (
        <View style={styles.card}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={styles.link}>← Back</Text>
          </TouchableOpacity>
        </View>
      ) : detail ? (
        <View style={styles.card}>
          <Text style={styles.label}>Session</Text>
          <Text style={styles.value}>
            {String(detail.sessionName ?? detail.sessionId ?? 'Session')}
          </Text>
          <Text style={styles.label}>Date & time</Text>
          <Text style={styles.value}>
            {detail.scheduledAt ? new Date(String(detail.scheduledAt)).toLocaleString() : '—'}
          </Text>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{String(detail.status ?? '')}</Text>
          <Text style={styles.label}>Trainer</Text>
          <Text style={styles.value}>
            {String(detail.trainerName ?? detail.trainerEmail ?? '')}
          </Text>
          {detail.amountCents != null && (
            <>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.value}>
                {currencyDisplay} {(Number(detail.amountCents) / 100).toFixed(2)}
              </Text>
            </>
          )}
          {canPay && (
            <View style={[styles.card, { marginTop: 16 }]}>
              <Text style={styles.label}>Pay for this session</Text>
              <Text style={[styles.value, { marginBottom: 8 }]}>
                Card, Apple Pay, or Google Pay
              </Text>
              {payError ? <Text style={styles.rescheduleError}>{payError}</Text> : null}
              <TouchableOpacity
                onPress={handlePayPress}
                disabled={payLoading}
                style={[styles.buttonPrimary, payLoading && styles.buttonDisabled]}
              >
                <Text style={styles.buttonPrimaryText}>
                  {payLoading ? 'Preparing…' : 'Pay for session'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {canAct && (
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleCancel}
                disabled={actionLoading}
                style={[styles.buttonDanger, actionLoading && styles.buttonDisabled]}
              >
                <Text style={styles.buttonDangerText}>
                  {actionLoading ? 'Please wait…' : 'Cancel session'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openReschedule}
                disabled={actionLoading}
                style={[styles.buttonPrimary, actionLoading && styles.buttonDisabled]}
              >
                <Text style={styles.buttonPrimaryText}>Reschedule</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : null}

      <Modal visible={showReschedule} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reschedule session</Text>
            <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={rescheduleDate}
              onChangeText={setRescheduleDate}
              placeholder="2025-03-15"
              placeholderTextColor={colors.grey}
              editable={!actionLoading}
            />
            <Text style={styles.inputLabel}>Time (HH:MM)</Text>
            <TextInput
              style={styles.input}
              value={rescheduleTime}
              onChangeText={setRescheduleTime}
              placeholder="14:30"
              placeholderTextColor={colors.grey}
              editable={!actionLoading}
            />
            {rescheduleError ? <Text style={styles.rescheduleError}>{rescheduleError}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={handleReschedule}
                disabled={actionLoading}
                style={[styles.buttonPrimary, actionLoading && styles.buttonDisabled]}
              >
                <Text style={styles.buttonPrimaryText}>{actionLoading ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowReschedule(false);
                  setRescheduleError(null);
                }}
                disabled={actionLoading}
                style={styles.buttonSecondary}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: 16, paddingBottom: 40 },
  backRow: { marginBottom: 8 },
  link: { fontSize: 14, fontWeight: '600', color: colors.secondary },
  title: { fontSize: 22, fontWeight: '700', color: colors.black, marginBottom: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 13,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  label: { fontSize: 12, color: colors.grey, marginTop: 12, marginBottom: 2 },
  value: { fontSize: 16, color: colors.black },
  error: { fontSize: 14, color: colors.grey },
  actions: { marginTop: 20, gap: 12 },
  buttonDanger: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c00',
    alignItems: 'center',
  },
  buttonPrimary: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  buttonPrimaryText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  buttonDisabled: { opacity: 0.6 },
  buttonDangerText: { fontSize: 16, fontWeight: '600', color: '#c00' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: colors.black,
  },
  rescheduleError: { color: '#c00', fontSize: 14, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  buttonSecondary: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    alignItems: 'center',
  },
  buttonSecondaryText: { fontSize: 16, fontWeight: '600', color: colors.grey },
});
