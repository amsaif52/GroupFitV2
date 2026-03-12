import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { customerApi } from '../../../lib/api';
import { useDefaultLocation } from '../../../contexts/DefaultLocationContext';

type ActivityItem = Record<string, unknown>;

export default function ActivitiesTab() {
  const router = useRouter();
  const { defaultLocation } = useDefaultLocation();
  const [loading, setLoading] = useState(true);
  const [allActivities, setAllActivities] = useState<ActivityItem[]>([]);
  const [favourites, setFavourites] = useState<ActivityItem[]>([]);

  const hasLocationCoords =
    defaultLocation &&
    typeof defaultLocation.latitude === 'number' &&
    typeof defaultLocation.longitude === 'number';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const allPromise = hasLocationCoords
          ? customerApi.activitiesAtLocation({
              latitude: defaultLocation!.latitude!,
              longitude: defaultLocation!.longitude!,
            })
          : customerApi.fetchAllActivity();
        const [allRes, favRes] = await Promise.all([
          allPromise,
          customerApi.fetchFavouriteActivities(),
        ]);
        if (cancelled) return;
        const allData = (allRes?.data as Record<string, unknown>) ?? {};
        const favData = (favRes?.data as Record<string, unknown>) ?? {};
        setAllActivities((allData.customerActivityList as ActivityItem[]) ?? []);
        setFavourites((favData.favouriteActivities as ActivityItem[]) ?? []);
      } catch {
        if (!cancelled) setAllActivities([]);
        setFavourites([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    hasLocationCoords,
    defaultLocation?.id,
    defaultLocation?.latitude,
    defaultLocation?.longitude,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>GroupFit</Text>
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Activities</Text>
        {defaultLocation ? (
          <TouchableOpacity
            onPress={() => router.push('/app/locations')}
            style={styles.locationChip}
          >
            <Text style={styles.locationChipText} numberOfLines={1}>
              📍 {defaultLocation.label}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {defaultLocation && hasLocationCoords ? (
        <Text style={styles.subtitle}>Showing activities at your default address</Text>
      ) : null}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {!defaultLocation ? (
            <TouchableOpacity
              onPress={() => router.push('/app/locations')}
              style={styles.setLocationHint}
            >
              <Text style={styles.setLocationHintText}>
                Set a default address to see activities near you
              </Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.sectionLabel}>
            {hasLocationCoords ? 'Activities at your location' : 'All activities'}
          </Text>
          {allActivities.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No activities available.</Text>
            </View>
          ) : (
            allActivities.map((item, i) => {
              const row = item as Record<string, unknown>;
              const activityId = row.id ?? String(i);
              return (
                <TouchableOpacity
                  key={String(activityId)}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/app/activity/${activityId}`)}
                >
                  <Text style={styles.cardTitle}>
                    {String(row.activityName ?? row.name ?? 'Activity')}
                  </Text>
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
                <TouchableOpacity
                  key={String(activityId)}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/app/activity/${activityId}`)}
                >
                  <Text style={styles.cardTitle}>
                    {String(row.activityName ?? row.name ?? 'Activity')}
                  </Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.black },
  locationChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    maxWidth: 160,
  },
  locationChipText: { fontSize: 13, color: colors.secondary, fontWeight: '600' },
  subtitle: { fontSize: 13, color: colors.grey, marginHorizontal: 16, marginTop: 4 },
  setLocationHint: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 10,
    backgroundColor: colors.borderLight,
    borderRadius: 8,
  },
  setLocationHintText: { fontSize: 13, color: colors.grey },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.grey,
    marginHorizontal: 16,
    marginBottom: 8,
  },
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
