import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';

export default function AccountActivationScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account activation</Text>
      <Text style={styles.message}>
        Your account is pending activation. You may need to verify your email or wait for admin approval. We’ll notify you when you can sign in.
      </Text>
      <TouchableOpacity style={styles.link} onPress={() => router.replace('/auth/login')}>
        <Text style={styles.linkText}>← Back to login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.primaryLight },
  title: { fontSize: 20, fontWeight: '700', color: colors.black, marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 16, color: colors.grey, textAlign: 'center', marginBottom: 24, paddingHorizontal: 16 },
  link: { marginTop: 16 },
  linkText: { fontSize: 14, fontWeight: '600', color: colors.secondary },
});
