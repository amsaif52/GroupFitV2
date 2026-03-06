import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { getApiErrorMessage } from '@groupfit/shared';
import { customerApi } from '../../../lib/api';
import { useDefaultLocation } from '../../../contexts/DefaultLocationContext';

export default function BookSessionScreen() {
  const { trainerId } = useLocalSearchParams<{ trainerId: string }>();
  const router = useRouter();
  const { defaultLocation } = useDefaultLocation();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [activity, setActivity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!trainerId || !date.trim() || !time.trim()) {
      setError('Please enter date and time.');
      return;
    }
    const d = new Date(`${date.trim()}T${time.trim()}`);
    if (Number.isNaN(d.getTime())) {
      setError('Invalid date or time.');
      return;
    }
    const scheduledAt = d.toISOString();
    setLoading(true);
    setError(null);
    customerApi
      .addSession(trainerId, scheduledAt, activity.trim() || undefined)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          router.replace('/app/sessions');
        } else {
          setError(String(data?.message ?? 'Failed to book session'));
        }
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to book session')))
      .finally(() => setLoading(false));
  };

  if (!trainerId) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Invalid trainer.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.link}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Book a session</Text>
        {defaultLocation ? (
          <View style={styles.defaultAddressRow}>
            <Text style={styles.defaultAddressText}>
              📍 Using default address: {defaultLocation.label}
            </Text>
            <TouchableOpacity onPress={() => router.push('/app/locations')}>
              <Text style={styles.changeLocationLink}>Change location</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={styles.card}>
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="e.g. 2025-03-15"
            style={styles.input}
            autoCapitalize="none"
            editable={!loading}
          />
          <Text style={styles.label}>Time (HH:MM)</Text>
          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder="e.g. 14:00"
            style={styles.input}
            autoCapitalize="none"
            editable={!loading}
          />
          <Text style={styles.label}>Activity (optional)</Text>
          <TextInput
            value={activity}
            onChangeText={setActivity}
            placeholder="e.g. Yoga, HIIT"
            style={styles.input}
            editable={!loading}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.button, loading && styles.buttonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Book session</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  content: { padding: 16, paddingBottom: 40 },
  backRow: { marginBottom: 8 },
  link: { fontSize: 14, fontWeight: '600', color: colors.secondary },
  title: { fontSize: 22, fontWeight: '700', color: colors.black, marginBottom: 16 },
  defaultAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
    padding: 10,
    backgroundColor: colors.borderLight,
    borderRadius: 8,
    gap: 8,
  },
  defaultAddressText: { fontSize: 14, color: colors.black, flex: 1 },
  changeLocationLink: { fontSize: 13, fontWeight: '600', color: colors.secondary },
  card: {
    backgroundColor: colors.white,
    borderRadius: 13,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  label: { fontSize: 12, color: colors.grey, marginTop: 12, marginBottom: 2 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
  },
  error: { fontSize: 14, color: '#c00', marginTop: 12 },
  button: {
    marginTop: 20,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
