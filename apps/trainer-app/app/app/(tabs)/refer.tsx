import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { colors } from '@groupfit/shared/theme';

const REFERRAL_MESSAGE =
  'Join GroupFit – your fitness community. Get started with GroupFit today. https://groupfit.app';

export default function ReferTab() {
  async function handleShare() {
    try {
      await Share.share({
        message: REFERRAL_MESSAGE,
        title: 'Refer a friend – GroupFit',
      });
    } catch {
      // User cancelled or share failed
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>GroupFit</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Refer a friend</Text>
        <Text style={styles.subtitle}>
          Share the love. Get a reward for you and your training buddy.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDark },
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
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: { fontSize: 14, color: colors.placeholderDark, textAlign: 'center', marginBottom: 24 },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: colors.white },
});
