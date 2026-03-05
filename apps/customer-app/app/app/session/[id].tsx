import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { customerApi } from '../../../lib/api';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = () => {
    if (!id) return;
    setLoading(true);
    customerApi.fetchSessionDetails(id)
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
      .catch(() => { setError('Failed to load session'); setDetail(null); })
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
          customerApi.cancelSession(id)
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

  const canAct = detail && String(detail.status) === 'scheduled';

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
          <Text style={styles.value}>{String(detail.sessionName ?? detail.sessionId ?? 'Session')}</Text>
          <Text style={styles.label}>Date & time</Text>
          <Text style={styles.value}>{detail.scheduledAt ? new Date(String(detail.scheduledAt)).toLocaleString() : '—'}</Text>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{String(detail.status ?? '')}</Text>
          <Text style={styles.label}>Trainer</Text>
          <Text style={styles.value}>{String(detail.trainerName ?? detail.trainerEmail ?? '')}</Text>
          {detail.amountCents != null && (
            <>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.value}>${(Number(detail.amountCents) / 100).toFixed(2)}</Text>
            </>
          )}
          {canAct && (
            <TouchableOpacity onPress={handleCancel} disabled={actionLoading} style={[styles.buttonDanger, actionLoading && styles.buttonDisabled]}>
              <Text style={styles.buttonDangerText}>{actionLoading ? 'Please wait…' : 'Cancel session'}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
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
  buttonDanger: { marginTop: 20, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#c00', alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonDangerText: { fontSize: 16, fontWeight: '600', color: '#c00' },
});
