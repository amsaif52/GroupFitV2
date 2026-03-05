import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '@groupfit/shared/theme';
import { trainerApi } from '../../../lib/api';

export default function EarningTab() {
  const [loading, setLoading] = useState(true);
  const [currentEarning, setCurrentEarning] = useState<unknown>(null);
  const [earningStats, setEarningStats] = useState<unknown>(null);
  const [referralSummary, setReferralSummary] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [earnRes, statsRes, refRes] = await Promise.all([
          trainerApi.currentEarning(),
          trainerApi.earningStats(),
          trainerApi.referralSummary(),
        ]);
        if (cancelled) return;
        const getData = (r: { data?: unknown }) => (r?.data as Record<string, unknown>) ?? {};
        setCurrentEarning(getData(earnRes).currentEarning ?? null);
        setEarningStats(getData(statsRes).earningStats ?? null);
        setReferralSummary(getData(refRes).referralSummary ?? null);
      } catch {
        if (!cancelled) setCurrentEarning(null); setEarningStats(null); setReferralSummary(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const amountStr = currentEarning != null && typeof currentEarning === 'object' && 'amount' in (currentEarning as object)
    ? String((currentEarning as Record<string, unknown>).amount)
    : currentEarning != null ? String(currentEarning) : '£0.00';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>GroupFit</Text>
      </View>
      <Text style={styles.title}>My Earnings</Text>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.earningCard}>
            <Text style={styles.earningLabel}>Current month</Text>
            <Text style={styles.earningValue}>{amountStr}</Text>
          </View>
          {(earningStats != null || referralSummary != null) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Summary</Text>
              <Text style={styles.cardSub}>{JSON.stringify(earningStats ?? referralSummary).slice(0, 120)}…</Text>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 70,
    backgroundColor: colors.blue,
  },
  logo: { fontSize: 20, fontWeight: '700', color: colors.white, letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '700', color: colors.black, marginHorizontal: 16, marginTop: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  earningCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 13,
    padding: 20,
    marginBottom: 16,
  },
  earningLabel: { fontSize: 14, color: colors.white, opacity: 0.9, marginBottom: 4 },
  earningValue: { fontSize: 28, fontWeight: '800', color: colors.white },
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
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.black },
  cardSub: { fontSize: 12, color: colors.grey, marginTop: 4 },
});
