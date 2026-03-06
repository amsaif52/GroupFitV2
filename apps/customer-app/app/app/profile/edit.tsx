import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { customerApi } from '../../../lib/api';
import { ApiClientError } from '@groupfit/shared';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locale, setLocale] = useState('en');
  const [countryCode, setCountryCode] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await customerApi.viewProfile();
        const data = res.data as {
          mtype?: string;
          name?: string;
          emailid?: string;
          phone?: string;
          locale?: string;
          countryCode?: string;
        };
        if (!cancelled && data?.mtype === 'success') {
          setName(data.name ?? '');
          setEmail(data.emailid ?? '');
          setPhone(data.phone ?? '');
          setLocale(data.locale ?? 'en');
          setCountryCode(data.countryCode ?? '');
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiClientError ? e.message : 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await customerApi.editProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        locale: locale.trim() || undefined,
        countryCode: countryCode.trim().toUpperCase() || undefined,
      });
      const data = res.data as { mtype?: string; message?: string };
      if (data?.mtype === 'success') {
        Alert.alert('Saved', data.message ?? 'Profile updated.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        setError('Update failed');
      }
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.topbar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.grey}
          autoCapitalize="words"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={email}
          editable={false}
          placeholder="Email"
          placeholderTextColor={colors.grey}
        />
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+44 7700 900000"
          placeholderTextColor={colors.grey}
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>Locale</Text>
        <TextInput
          style={styles.input}
          value={locale}
          onChangeText={setLocale}
          placeholder="en"
          placeholderTextColor={colors.grey}
        />
        <Text style={styles.label}>Country (for payments, e.g. US, GB)</Text>
        <TextInput
          style={styles.input}
          value={countryCode}
          onChangeText={(t) => setCountryCode(t.toUpperCase().slice(0, 2))}
          placeholder="US"
          placeholderTextColor={colors.grey}
          autoCapitalize="characters"
          maxLength={2}
        />
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, paddingBottom: 40 },
  errorText: { color: colors.secondary, marginBottom: 12, fontSize: 14 },
  label: { fontSize: 14, fontWeight: '600', color: colors.black, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.black,
    marginBottom: 16,
  },
  inputDisabled: { backgroundColor: colors.borderLight, opacity: 0.8 },
  saveBtn: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
