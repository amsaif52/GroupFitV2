import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { customerApi } from '../../lib/api';
import { ApiClientError } from '@groupfit/shared';

type PaymentItem = { id?: string; amount?: number; date?: string; status?: string; [key: string]: unknown };

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<PaymentItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await customerApi.paymentList();
        const data = res.data as { mtype?: string; list?: PaymentItem[] };
        if (!cancelled && data?.mtype === 'success' && Array.isArray(data.list)) {
          setList(data.list);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof ApiClientError ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment History</Text>
      </View>
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      )}
      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      {!loading && !error && list.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No payments yet. When you book sessions, they will appear here.</Text>
        </View>
      )}
      {!loading && !error && list.length > 0 && (
        <FlatList
          data={list}
          keyExtractor={(item, i) => item.id ?? String(i)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowDate}>{String(item.date ?? item.createdAt ?? '—')}</Text>
              <Text style={styles.rowAmount}>{item.amount != null ? `£${Number(item.amount).toFixed(2)}` : '—'}</Text>
              <Text style={styles.rowStatus}>{String(item.status ?? '—')}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  back: { fontSize: 14, color: colors.secondary, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '600', color: colors.black },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: colors.secondary, textAlign: 'center' },
  emptyText: { color: colors.grey, textAlign: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  rowDate: { flex: 1, fontSize: 14, color: colors.black },
  rowAmount: { flex: 1, fontSize: 14, color: colors.black, textAlign: 'center' },
  rowStatus: { flex: 1, fontSize: 14, color: colors.grey, textAlign: 'right' },
});
