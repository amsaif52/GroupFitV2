import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { customerApi } from '../../../lib/api';

type TrainerItem = Record<string, unknown>;

export default function TrainersTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState<TrainerItem[]>([]);
  const [topRated, setTopRated] = useState<TrainerItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [favRes, topRes] = await Promise.all([
          customerApi.favouriteTrainersList(),
          customerApi.topratedTrainersList(),
        ]);
        if (cancelled) return;
        const favData = (favRes?.data as Record<string, unknown>) ?? {};
        const topData = (topRes?.data as Record<string, unknown>) ?? {};
        setFavourites((favData.favouriteTrainersList as TrainerItem[]) ?? []);
        setTopRated((topData.topratedTrainersList as TrainerItem[]) ?? []);
      } catch {
        if (!cancelled) setFavourites([]); setTopRated([]);
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
      <Text style={styles.title}>My Trainers</Text>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionLabel}>Favourite trainers</Text>
          {favourites.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No favourite trainers.</Text>
            </View>
          ) : (
            favourites.map((item, i) => {
              const row = item as Record<string, unknown>;
              const trainerId = row.id ?? row.trainerId;
              return (
                <TouchableOpacity key={String(trainerId ?? i)} style={styles.card} activeOpacity={0.8} onPress={() => trainerId && router.push(`/app/trainer/${trainerId}`)}>
                  <Text style={styles.cardTitle}>{String(row.trainerName ?? row.name ?? 'Trainer')}</Text>
                </TouchableOpacity>
              );
            })
          )}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Top rated</Text>
          {topRated.length === 0 ? (
            <Text style={styles.emptyText}>No trainers listed.</Text>
          ) : (
            topRated.map((item, i) => {
              const row = item as Record<string, unknown>;
              const trainerId = row.id ?? row.trainerId;
              return (
                <TouchableOpacity key={String(trainerId ?? i)} style={styles.card} activeOpacity={0.8} onPress={() => trainerId && router.push(`/app/trainer/${trainerId}`)}>
                  <Text style={styles.cardTitle}>{String(row.trainerName ?? row.name ?? 'Trainer')}</Text>
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
