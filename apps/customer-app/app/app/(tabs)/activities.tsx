import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { customerApi } from '../../../lib/api';

type ActivityItem = Record<string, unknown>;

export default function ActivitiesTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
  const [favourites, setFavourites] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [allRes, favRes] = await Promise.all([
          customerApi.fetchAllActivity(),
          customerApi.fetchFavouriteActivities(),
        ]);
        if (cancelled) return;
        const allData = (allRes?.data as Record<string, unknown>) ?? {};
        const favData = (favRes?.data as Record<string, unknown>) ?? {};
        setAllActivities((allData.activityList as ActivityItem[]) ?? []);
        setFavourites((favData.favouriteActivities as ActivityItem[]) ?? []);
      } catch {
        if (!cancelled) setAllActivities([]); setFavourites([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>GroupFit</Text>
      </View>
      <Text style={styles.title}>Activities</Text>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionLabel}>All activities</Text>
          {allActivities.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No activities available.</Text>
            </View>
          ) : (
            allActivities.map((item, i) => {
              const row = item as Record<string, unknown>;
              const activityId = row.id ?? String(i);
              return (
                <TouchableOpacity key={String(activityId)} style={styles.card} activeOpacity={0.8} onPress={() => router.push(`/app/activity/${activityId}`)}>
                  <Text style={styles.cardTitle}>{String(row.activityName ?? row.name ?? 'Activity')}</Text>
                </TouchableOpacity>
              );
            })
          )}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Favourites</Text>
          {favourites.length === 0 ? (
            <Text style={styles.emptyText}>No favourite activities.</Text>
          ) : (
            favourites.map((item, i) => {
              const row = item as Record<string, unknown>;
              const activityId = row.id ?? String(i);
              return (
                <TouchableOpacity key={String(activityId)} style={styles.card} activeOpacity={0.8} onPress={() => router.push(`/app/activity/${activityId}`)}>
                  <Text style={styles.cardTitle}>{String(row.activityName ?? row.name ?? 'Activity')}</Text>
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
  title: { fontSize: 22, fontWeight: '700', color: colors.black, marginHorizontal: 16, marginTop: 16 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.grey, marginHorizontal: 16, marginBottom: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  empty: { padding: 16 },
  emptyText: { fontSize: 14, color: colors.placeholder, marginHorizontal: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 13,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.black },
});
