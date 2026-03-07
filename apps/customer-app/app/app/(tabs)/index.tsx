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

export default function HomeTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todaySessions, setTodaySessions] = useState<unknown[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<unknown[]>([]);
  const [activities, setActivities] = useState<unknown[]>([]);
  const [favouriteActivities, setFavouriteActivities] = useState<unknown[]>([]);
  const [trending, setTrending] = useState<unknown[]>([]);
  const [favouriteTrainers, setFavouriteTrainers] = useState<unknown[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [todayRes, upcomingRes, allActRes, favActRes, trendRes, favTrainRes] =
          await Promise.all([
            customerApi.todaysessionlist(),
            customerApi.customerSessionList({ status: 'Upcoming' }),
            customerApi.fetchAllActivity(),
            customerApi.fetchFavouriteActivities(),
            customerApi.GetTrendingActivities(),
            customerApi.fetchFavouriteTrainers(),
          ]);
        if (cancelled) return;
        const todayData = (todayRes?.data as Record<string, unknown>) ?? {};
        const upcomingData = (upcomingRes?.data as Record<string, unknown>) ?? {};
        const allActData = (allActRes?.data as Record<string, unknown>) ?? {};
        const favActData = (favActRes?.data as Record<string, unknown>) ?? {};
        const trendData = (trendRes?.data as Record<string, unknown>) ?? {};
        const favTrainData = (favTrainRes?.data as Record<string, unknown>) ?? {};
        setTodaySessions((todayData.todaysessionlist as unknown[]) ?? []);
        setUpcomingSessions((upcomingData.customerSessionList as unknown[]) ?? []);
        setActivities((allActData.activityList as unknown[]) ?? []);
        setFavouriteActivities((favActData.favouriteActivities as unknown[]) ?? []);
        setTrending((trendData.trendingActivities as unknown[]) ?? []);
        setFavouriteTrainers((favTrainData.favouriteTrainersList as unknown[]) ?? []);
      } catch {
        if (!cancelled) {
          setTodaySessions([]);
          setUpcomingSessions([]);
          setActivities([]);
          setFavouriteActivities([]);
          setTrending([]);
          setFavouriteTrainers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section
          title="Upcoming Sessions"
          seeAllHref={() => router.push('/app/sessions')}
          emptyMessage="There are no sessions scheduled for today"
          items={todaySessions.length > 0 ? todaySessions : upcomingSessions}
          tall
        />
        <Section
          title="Activities"
          seeAllHref={() => router.push('/app/activities')}
          emptyMessage="There are no activities available"
          items={activities}
        />
        <Section
          title="Favourites"
          seeAllHref={() => router.push('/app/activities')}
          emptyMessage="There are no favourited activities"
          items={favouriteActivities}
          tall
        />
        <Section
          title="Trending"
          seeAllHref={() => router.push('/app/activities')}
          emptyMessage="There are no trending activities"
          items={trending}
          tall
        />
        <Section
          title="My Trainers"
          seeAllHref={() => router.push('/app/trainers')}
          emptyMessage="There are no favorited trainers"
          items={favouriteTrainers}
        />
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
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
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
});
