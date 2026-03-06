import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { healthCheck } from '../lib/api';

export default function ServerOffScreen() {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setError(null);
    setRetrying(true);
    try {
      await healthCheck();
      router.replace('/app');
    } catch {
      setError('Still unavailable. Try again in a moment.');
    } finally {
      setRetrying(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Server unavailable</Text>
      <Text style={styles.message}>
        We couldn’t reach the server. This might be temporary. Check your connection and try again.
      </Text>
      <TouchableOpacity
        style={[styles.button, retrying && styles.buttonDisabled]}
        onPress={handleRetry}
        disabled={retrying}
      >
        <Text style={styles.buttonText}>{retrying ? 'Checking…' : 'Retry'}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.link} onPress={() => router.replace('/')}>
        <Text style={styles.linkText}>← Back to home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.primaryLight },
  title: { fontSize: 20, fontWeight: '700', color: colors.black, marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 16, color: colors.grey, textAlign: 'center', marginBottom: 24, paddingHorizontal: 16 },
  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: colors.secondary },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  errorText: { color: colors.secondary, marginTop: 16, fontSize: 14, textAlign: 'center' },
  link: { marginTop: 32 },
  linkText: { fontSize: 14, fontWeight: '600', color: colors.secondary },
});
