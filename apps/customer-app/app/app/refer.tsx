import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { getApiErrorMessage } from '@groupfit/shared';
import { customerApi } from '../../lib/api';

const REFERRAL_MESSAGE =
  'Join GroupFit – your fitness community. Get started with GroupFit today. https://groupfit.app';

type ReferralItem = {
  id: string;
  referredUserId: string;
  referredUserName?: string;
  referredUserEmail?: string;
  referredUserJoinedAt?: string;
  createdAt: string;
};

export default function ReferFriendScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ReferralItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchList = () => {
    customerApi
      .ReferralList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          const referralList = (data?.ReferralList ?? data?.list) as ReferralItem[] | undefined;
          setList(referralList ?? []);
          setError(null);
        }
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to load referrals'));
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: REFERRAL_MESSAGE,
        title: 'Refer a friend – GroupFit',
      });
    } catch {
      // User cancelled or share failed
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Refer a Friend</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Refer a friend</Text>
        <Text style={styles.subtitle}>
          Share the love. Get a reward for you and your training buddy.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleShare}>
          <Text style={styles.primaryButtonText}>Share</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>People you&apos;ve referred</Text>
        {loading ? (
          <ActivityIndicator size="small" color={colors.secondary} style={styles.loader} />
        ) : list.length === 0 ? (
          <Text style={styles.muted}>No referrals yet. Share your link above.</Text>
        ) : (
          list.map((r) => (
            <View key={r.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {r.referredUserName || r.referredUserEmail || r.referredUserId}
              </Text>
              {r.referredUserEmail && r.referredUserName !== r.referredUserEmail && (
                <Text style={styles.cardEmail}>{r.referredUserEmail}</Text>
              )}
              {r.referredUserJoinedAt && (
                <Text style={styles.cardDate}>
                  Joined {new Date(r.referredUserJoinedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
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
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 14, color: colors.grey, marginBottom: 24 },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#c00', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  loader: { marginVertical: 20 },
  muted: { fontSize: 14, color: colors.grey },
  card: {
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
  },
  cardTitle: { fontWeight: '600', fontSize: 16 },
  cardEmail: { fontSize: 14, color: colors.grey, marginTop: 4 },
  cardDate: { fontSize: 12, color: colors.grey, marginTop: 4 },
});
