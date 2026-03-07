import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { customerApi } from '../../../lib/api';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === undefined) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    customerApi
      .viewActivity(id ?? '')
      .then((res) => {
        if (cancelled) return;
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
        if (!cancelled) {
          setError('Failed to load activity');
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Text style={styles.link}>← Activities</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Activity details</Text>
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
          <Text style={styles.label}>Activity</Text>
          <Text style={styles.value}>
            {String(detail.activityName ?? detail.name ?? 'Activity')}
          </Text>
          {detail.description ? (
            <>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{String(detail.description)}</Text>
            </>
          ) : null}
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
});
