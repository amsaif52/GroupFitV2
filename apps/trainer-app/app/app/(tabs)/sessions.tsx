import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { trainerApi } from '../../../lib/api';

type SessionItem = Record<string, unknown>;

export default function TrainerSessionsTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<SessionItem[]>([]);
  const [completed, setCompleted] = useState<SessionItem[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [upRes, compRes] = await Promise.all([
          trainerApi.trainerSessionList(),
          trainerApi.trainerSessionCompletedList(),
        ]);
        if (cancelled) return;
        const upData = (upRes?.data as Record<string, unknown>) ?? {};
        const compData = (compRes?.data as Record<string, unknown>) ?? {};
        setUpcoming((upData.trainerSessionList as SessionItem[]) ?? []);
        setCompleted((compData.trainerSessionCompletedList as SessionItem[]) ?? []);
      } catch {
        if (!cancelled) setUpcoming([]); setCompleted([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const list = activeTab === 'upcoming' ? upcoming : completed;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>GroupFit</Text>
        <TouchableOpacity onPress={() => router.push('/app/notifications')}>
          <Text style={styles.headerIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>My Sessions</Text>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>Completed</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {list.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {activeTab === 'upcoming' ? 'No upcoming sessions.' : 'No completed sessions.'}
              </Text>
            </View>
          ) : (
            list.map((item, i) => {
              const row = item as Record<string, unknown>;
              const sessionId = row.id ?? row.sessionId;
              return (
                <TouchableOpacity
                  key={String(sessionId ?? i)}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => sessionId && router.push(`/app/session/${sessionId}`)}
                >
                  <Text style={styles.cardTitle}>{String(row.sessionName ?? 'Session')}</Text>
                  <Text style={styles.cardSub}>{String(row.customerName ?? '')} · {row.scheduledAt ? new Date(String(row.scheduledAt)).toLocaleString() : ''}</Text>
                </TouchableOpacity>
              );
            })
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
  headerIcon: { fontSize: 22 },
  title: { fontSize: 22, fontWeight: '700', color: colors.black, marginHorizontal: 16, marginTop: 16 },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 8 },
  tab: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.white },
  tabActive: { backgroundColor: colors.secondary },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.grey },
  tabTextActive: { color: colors.white },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.placeholder },
  card: {
    backgroundColor: colors.white,
    borderRadius: 13,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.black },
  cardSub: { fontSize: 12, color: colors.grey, marginTop: 4 },
});
