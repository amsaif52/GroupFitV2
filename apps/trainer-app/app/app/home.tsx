import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getTranslations } from '@groupfit/shared';
import { colors } from '@groupfit/shared/theme';

const t = getTranslations('en');

function Section({
  title,
  seeAllHref,
  emptyMessage,
  tall,
}: {
  title: string;
  seeAllHref: () => void;
  emptyMessage: string;
  tall?: boolean;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={seeAllHref}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.empty, tall && styles.emptyTall]}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>GroupFit</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/app/account')}>
            <Text style={styles.headerIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/app/account')} style={styles.avatar} />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Section
          title="Today's Sessions"
          seeAllHref={() => router.push('/app/profile')}
          emptyMessage="There are no sessions scheduled for today"
          tall
        />
        <Section
          title="New Sessions"
          seeAllHref={() => router.push('/app/profile')}
          emptyMessage="No new sessions"
          tall
        />
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Earning</Text>
            <TouchableOpacity onPress={() => router.push('/app/profile')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.earning}>
            <Text style={styles.earningLabel}>Current month</Text>
            <Text style={styles.earningValue}>£0.00</Text>
          </View>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.push('/app/profile')}>
            <Text style={styles.navLink}>{t.nav.profile}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/app/account')}>
            <Text style={styles.navLink}>Account</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 70,
    backgroundColor: colors.blue,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 22,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  empty: {
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
  emptyTall: {
    minHeight: 150,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.placeholder,
    textAlign: 'center',
  },
  earning: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    padding: 20,
  },
  earningLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  earningValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },
  navRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  navLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
});
