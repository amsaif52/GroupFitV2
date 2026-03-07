import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { trainerApi } from '../../lib/api';

type CertItem = {
  id: string;
  name: string;
  issuingOrganization?: string | null;
  issuedAt?: string | null;
  credentialId?: string | null;
  documentUrl?: string | null;
  createdAt: string;
};

export default function CertificatesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<CertItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CertItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formIssuingOrg, setFormIssuingOrg] = useState('');
  const [formIssuedAt, setFormIssuedAt] = useState('');
  const [formCredentialId, setFormCredentialId] = useState('');
  const [formDocumentUrl, setFormDocumentUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = () => {
    trainerApi
      .trainerCertificateList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          const certList = (data?.trainerCertificateList ?? data?.list) as CertItem[] | undefined;
          setList(certList ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load certificates');
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormName('');
    setFormIssuingOrg('');
    setFormIssuedAt('');
    setFormCredentialId('');
    setFormDocumentUrl('');
    setShowForm(true);
  };

  const openEdit = (row: CertItem) => {
    setEditing(row);
    setFormName(row.name);
    setFormIssuingOrg(row.issuingOrganization ?? '');
    setFormIssuedAt(row.issuedAt ? String(row.issuedAt).slice(0, 10) : '');
    setFormCredentialId(row.credentialId ?? '');
    setFormDocumentUrl(row.documentUrl ?? '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = () => {
    const name = formName.trim();
    if (!name) return;
    setSubmitLoading(true);
    setError(null);
    if (editing) {
      trainerApi
        .editTrainerCertificate({
          id: editing.id,
          name,
          issuingOrganization: formIssuingOrg.trim() || null,
          issuedAt: formIssuedAt.trim() || null,
          credentialId: formCredentialId.trim() || null,
          documentUrl: formDocumentUrl.trim() || null,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeForm();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Update failed'));
          }
        })
        .catch(() => setError('Update failed'))
        .finally(() => setSubmitLoading(false));
    } else {
      trainerApi
        .addTrainerCertificate({
          name,
          issuingOrganization: formIssuingOrg.trim() || null,
          issuedAt: formIssuedAt.trim() || null,
          credentialId: formCredentialId.trim() || null,
          documentUrl: formDocumentUrl.trim() || null,
        })
        .then((res) => {
          const data = res?.data as Record<string, unknown>;
          if (data?.mtype === 'success') {
            closeForm();
            fetchList();
          } else {
            setError(String(data?.message ?? 'Add failed'));
          }
        })
        .catch(() => setError('Add failed'))
        .finally(() => setSubmitLoading(false));
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove certificate', 'Remove this certificate?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setActionId(id);
          trainerApi
            .deleteCertification(id)
            .then((res) => {
              const data = res?.data as Record<string, unknown>;
              if (data?.mtype === 'success') fetchList();
              else setError(String(data?.message ?? 'Delete failed'));
            })
            .catch(() => setError('Delete failed'))
            .finally(() => setActionId(null));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Certificates</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Add and manage your certifications (e.g. CPR, NASM, ACE).
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.primaryButton} onPress={() => setShowForm((v) => !v)}>
          <Text style={styles.primaryButtonText}>{showForm ? 'Cancel' : 'Add certificate'}</Text>
        </TouchableOpacity>
        {showForm && (
          <View style={styles.form}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formName}
              onChangeText={setFormName}
              placeholder="e.g. CPR"
              placeholderTextColor={colors.grey}
              editable={!submitLoading}
            />
            <Text style={styles.label}>Issuing organization (optional)</Text>
            <TextInput
              style={styles.input}
              value={formIssuingOrg}
              onChangeText={setFormIssuingOrg}
              placeholder="e.g. Red Cross"
              placeholderTextColor={colors.grey}
              editable={!submitLoading}
            />
            <Text style={styles.label}>Issued date (optional, YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={formIssuedAt}
              onChangeText={setFormIssuedAt}
              placeholder="2024-01-15"
              placeholderTextColor={colors.grey}
              editable={!submitLoading}
            />
            <Text style={styles.label}>Credential ID (optional)</Text>
            <TextInput
              style={styles.input}
              value={formCredentialId}
              onChangeText={setFormCredentialId}
              placeholderTextColor={colors.grey}
              editable={!submitLoading}
            />
            <Text style={styles.label}>Document URL (optional)</Text>
            <TextInput
              style={styles.input}
              value={formDocumentUrl}
              onChangeText={setFormDocumentUrl}
              placeholder="https://..."
              placeholderTextColor={colors.grey}
              editable={!submitLoading}
            />
            <View style={styles.formRow}>
              <TouchableOpacity
                style={[styles.primaryButton, submitLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={submitLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {submitLoading ? 'Saving…' : editing ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={closeForm}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {loading ? (
          <ActivityIndicator size="small" color={colors.secondary} style={styles.loader} />
        ) : list.length === 0 ? (
          <Text style={styles.empty}>No certificates yet. Add one above.</Text>
        ) : (
          list.map((row) => (
            <View key={row.id} style={styles.card}>
              <Text style={styles.cardTitle}>{row.name}</Text>
              {row.issuingOrganization ? (
                <Text style={styles.cardSub}>{row.issuingOrganization}</Text>
              ) : null}
              {row.issuedAt ? (
                <Text style={styles.cardSub}>Issued: {String(row.issuedAt).slice(0, 10)}</Text>
              ) : null}
              <View style={styles.cardRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => openEdit(row)}>
                  <Text style={styles.secondaryButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={() => handleDelete(row.id)}
                  disabled={actionId === row.id}
                >
                  <Text style={styles.dangerButtonText}>
                    {actionId === row.id ? '…' : 'Remove'}
                  </Text>
                </TouchableOpacity>
              </View>
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
  subtitle: { fontSize: 14, color: colors.grey, marginBottom: 16 },
  error: { color: '#c00', marginBottom: 16 },
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
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#666',
  },
  cancelButtonText: { color: '#666', fontWeight: '600' },
  loader: { marginVertical: 20 },
  empty: { fontSize: 16, color: colors.grey },
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 14, color: colors.grey, marginBottom: 4 },
  cardRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  secondaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 6,
  },
  secondaryButtonText: { color: colors.secondary, fontSize: 13 },
  dangerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#c00',
    borderRadius: 6,
  },
  dangerButtonText: { color: '#c00', fontSize: 13 },
});
