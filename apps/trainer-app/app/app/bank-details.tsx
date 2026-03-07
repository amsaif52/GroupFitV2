import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { trainerApi } from '../../lib/api';

type BankDetails = {
  id: string;
  accountHolderName: string;
  bankName?: string | null;
  last4: string;
  routingLast4?: string | null;
  createdAt?: string;
};

export default function BankDetailsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<BankDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formAccountHolder, setFormAccountHolder] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formLast4, setFormLast4] = useState('');
  const [formRoutingLast4, setFormRoutingLast4] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchDetails = () => {
    setLoading(true);
    trainerApi
      .viewTrainerBankDetails()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error' || data?.accountHolderName == null) {
          setDetails(null);
          setError(null);
        } else {
          setDetails({
            id: String(data?.id ?? ''),
            accountHolderName: String(data.accountHolderName),
            bankName: (data?.bankName as string | null) ?? null,
            last4: String(data?.last4 ?? ''),
            routingLast4: (data?.routingLast4 as string | null) ?? null,
            createdAt: data?.createdAt as string | undefined,
          });
          setError(null);
        }
      })
      .catch(() => {
        setDetails(null);
        setError('Failed to load bank details');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const openForm = () => {
    setFormAccountHolder(details?.accountHolderName ?? '');
    setFormBankName(details?.bankName ?? '');
    setFormLast4(details?.last4 ?? '');
    setFormRoutingLast4(details?.routingLast4 ?? '');
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const handleSubmit = () => {
    const name = formAccountHolder.trim();
    const last4 = formLast4.replace(/\D/g, '').slice(-4);
    if (!name) {
      setError('Account holder name is required');
      return;
    }
    if (last4.length !== 4) {
      setError('Last 4 digits of account number are required');
      return;
    }
    setSubmitLoading(true);
    setError(null);
    trainerApi
      .addTrainerBankDetails({
        accountHolderName: name,
        bankName: formBankName.trim() || null,
        last4,
        routingLast4: formRoutingLast4.replace(/\D/g, '').slice(-4) || null,
      })
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          closeForm();
          fetchDetails();
        } else {
          setError(String(data?.message ?? 'Save failed'));
        }
      })
      .catch(() => setError('Save failed'))
      .finally(() => setSubmitLoading(false));
  };

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bank Details</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Add or update your bank account for receiving payments. Only the last 4 digits are stored.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? (
          <ActivityIndicator size="small" color={colors.secondary} style={styles.loader} />
        ) : showForm ? (
          <View style={styles.form}>
            <Text style={styles.label}>Account holder name *</Text>
            <TextInput
              style={styles.input}
              value={formAccountHolder}
              onChangeText={setFormAccountHolder}
              placeholder="Full name on account"
              placeholderTextColor={colors.grey}
              editable={!submitLoading}
            />
            <Text style={styles.label}>Bank name (optional)</Text>
            <TextInput
              style={styles.input}
              value={formBankName}
              onChangeText={setFormBankName}
              placeholder="e.g. Chase"
              placeholderTextColor={colors.grey}
              editable={!submitLoading}
            />
            <Text style={styles.label}>Last 4 digits of account number *</Text>
            <TextInput
              style={styles.input}
              value={formLast4}
              onChangeText={(t) => setFormLast4(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              placeholderTextColor={colors.grey}
              keyboardType="number-pad"
              maxLength={4}
              editable={!submitLoading}
            />
            <Text style={styles.label}>Last 4 digits of routing number (optional)</Text>
            <TextInput
              style={styles.input}
              value={formRoutingLast4}
              onChangeText={(t) => setFormRoutingLast4(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="5678"
              placeholderTextColor={colors.grey}
              keyboardType="number-pad"
              maxLength={4}
              editable={!submitLoading}
            />
            <View style={styles.formRow}>
              <TouchableOpacity
                style={[styles.primaryButton, submitLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={submitLoading}
              >
                <Text style={styles.primaryButtonText}>{submitLoading ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={closeForm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : details ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{details.accountHolderName}</Text>
            {details.bankName ? <Text style={styles.cardSub}>{details.bankName}</Text> : null}
            <Text style={styles.cardSub}>Account ending ••••{details.last4}</Text>
            {details.routingLast4 ? (
              <Text style={styles.cardSub}>Routing ••••{details.routingLast4}</Text>
            ) : null}
            <TouchableOpacity style={styles.secondaryButton} onPress={openForm}>
              <Text style={styles.secondaryButtonText}>Update bank details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.empty}>No bank details on file. Add them to receive payments.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={openForm}>
              <Text style={styles.primaryButtonText}>Add bank details</Text>
            </TouchableOpacity>
          </>
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
  subtitle: { fontSize: 14, color: colors.grey, marginBottom: 16 },
  error: { color: '#c00', marginBottom: 16 },
  loader: { marginVertical: 20 },
  form: {
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
  },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: colors.black,
  },
  formRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelButtonText: { color: '#666', fontWeight: '600' },
  card: {
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 14, color: colors.grey, marginBottom: 4 },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 8,
  },
  secondaryButtonText: { color: colors.secondary, fontWeight: '600' },
  empty: { fontSize: 16, color: colors.grey, marginBottom: 16 },
});
