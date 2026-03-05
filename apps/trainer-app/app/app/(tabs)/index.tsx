import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { trainerApi } from '../../../lib/api';

function Section({
  title,
  seeAllHref,
  emptyMessage,
  items,
  tall,
}: {
  title: string;
  seeAllHref: () => void;
  emptyMessage: string;
  items: unknown[];
  tall?: boolean;
}) {
  const isEmpty = !items || items.length === 0;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={seeAllHref}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.card, tall && styles.cardTall]}>
        {isEmpty ? (
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        ) : (
          <Text style={styles.countText}>{items.length} item(s)</Text>
        )}
      </View>
    </View>
  );
}

export default function TrainerHomeTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todaySessions, setTodaySessions] = useState<unknown[]>([]);
  const [newSessions, setNewSessions] = useState<unknown[]>([]);
  const [earning, setEarning] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [todayRes, newRes, earnRes] = await Promise.all([
          trainerApi.todaySession(),
          trainerApi.trainerSessionNewList(),
          trainerApi.currentEarning(),
        ]);
        if (cancelled) return;
        const getData = (r: { data?: unknown }) => (r?.data as Record<string, unknown>) ?? {};
        setTodaySessions((getData(todayRes).todaySession as unknown[]) ?? []);
        setNewSessions((getData(newRes).trainerSessionNewList as unknown[]) ?? []);
        setEarning(getData(earnRes).currentEarning ?? null);
      } catch {
        if (!cancelled) {
          setTodaySessions([]);
          setNewSessions([]);
          setEarning(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  const earningValue = earning != null && typeof earning === 'object' && 'amount' in (earning as object)
    ? String((earning as Record<string, unknown>).amount)
    : earning != null ? String(earning) : '£0.00';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>GroupFit</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/app/notifications')}>
            <Text style={styles.headerIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/app/account')} style={styles.avatar} />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Section
          title="Today's Sessions"
          seeAllHref={() => router.push('/app/sessions')}
          emptyMessage="There are no sessions scheduled for today"
          items={todaySessions}
          tall
        />
        <Section
          title="New Sessions"
          seeAllHref={() => router.push('/app/sessions')}
          emptyMessage="No new sessions"
          items={newSessions}
          tall
        />
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Earning</Text>
            <TouchableOpacity onPress={() => router.push('/app/earning')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.earning}>
            <Text style={styles.earningLabel}>Current month</Text>
            <Text style={styles.earningValue}>{earningValue}</Text>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  centered: { justifyContent: 'center', alignItems: 'center' },
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { fontSize: 22 },
  avatar: { width: 45, height: 45, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.3)' },
  scroll: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 24 },
  section: { marginBottom: 24 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.black },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.secondary },
  card: {
    backgroundColor: colors.white,
    borderRadius: 13,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTall: { minHeight: 150 },
  emptyText: { fontSize: 14, fontWeight: '600', color: colors.placeholder, textAlign: 'center' },
  countText: { fontSize: 14, fontWeight: '600', color: colors.grey },
  earning: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    padding: 20,
  },
  earningLabel: { fontSize: 14, color: colors.white, opacity: 0.9, marginBottom: 4 },
  earningValue: { fontSize: 28, fontWeight: '800', color: colors.white },
});
