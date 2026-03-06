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
import { customerApi } from '../../lib/api';

type LocationItem = {
  id: string;
  label: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
};

export default function MyLocationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<LocationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LocationItem | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLatitude, setFormLatitude] = useState('');
  const [formLongitude, setFormLongitude] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = () => {
    customerApi
      .customerServiceList()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          const locList = (data?.customerServiceList ?? data?.list) as LocationItem[] | undefined;
          setList(locList ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load locations');
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setFormLabel('');
    setFormAddress('');
    setFormLatitude('');
    setFormLongitude('');
    setShowForm(true);
  };

  const openEdit = (row: LocationItem) => {
    setEditing(row);
    setFormLabel(row.label);
    setFormAddress(row.address ?? '');
    setFormLatitude(row.latitude != null ? String(row.latitude) : '');
    setFormLongitude(row.longitude != null ? String(row.longitude) : '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormLabel('');
    setFormAddress('');
    setFormLatitude('');
    setFormLongitude('');
  };

  const handleSubmit = () => {
    const label = formLabel.trim();
    if (!label) return;
    setSubmitLoading(true);
    setError(null);
    const lat = formLatitude.trim() ? Number(formLatitude) : null;
    const lng = formLongitude.trim() ? Number(formLongitude) : null;
    if (editing) {
      customerApi
        .editCustomerService({
          locationId: editing.id,
          label,
          address: formAddress.trim() || null,
          latitude: lat,
          longitude: lng,
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
      customerApi
        .addCustomerService({
          label,
          address: formAddress.trim() || null,
          latitude: lat,
          longitude: lng,
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
    Alert.alert('Remove location', 'Remove this saved location?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setActionId(id);
          customerApi
            .deleteCustomerService(id)
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
        <Text style={styles.title}>My Locations</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Saved addresses for sessions. Add, edit, or remove locations.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} onPress={openAdd}>
          <Text style={styles.primaryButtonText}>Add location</Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>{editing ? 'Edit location' : 'New location'}</Text>
            <Text style={styles.label}>Label *</Text>
            <TextInput
              style={styles.input}
              value={formLabel}
              onChangeText={setFormLabel}
              placeholder="e.g. Home, Gym"
              placeholderTextColor={colors.grey}
              editable={!submitLoading}
            />
            <Text style={styles.label}>Address (optional)</Text>
            <TextInput
              style={styles.input}
              value={formAddress}
              onChangeText={setFormAddress}
              placeholder="Street, city"
              placeholderTextColor={colors.grey}
              editable={!submitLoading}
            />
            <Text style={styles.label}>Latitude / Longitude (optional)</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputShort]}
                value={formLatitude}
                onChangeText={setFormLatitude}
                placeholder="Lat"
                placeholderTextColor={colors.grey}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, styles.inputShort]}
                value={formLongitude}
                onChangeText={setFormLongitude}
                placeholder="Lng"
                placeholderTextColor={colors.grey}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.primaryButton, submitLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={submitLoading}
              >
                <Text style={styles.primaryButtonText}>{submitLoading ? 'Saving…' : editing ? 'Update' : 'Add'}</Text>
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
          <Text style={styles.empty}>No locations yet. Add one above.</Text>
        ) : (
          list.map((row) => (
            <View key={row.id} style={styles.card}>
              <Text style={styles.cardTitle}>{row.label}</Text>
              {row.address ? <Text style={styles.cardAddress}>{row.address}</Text> : null}
              {(row.latitude != null || row.longitude != null) && (
                <Text style={styles.cardCoords}>
                  {row.latitude}, {row.longitude}
                </Text>
              )}
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => openEdit(row)}>
                  <Text style={styles.secondaryButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={() => handleDelete(row.id)}
                  disabled={actionId === row.id}
                >
                  <Text style={styles.dangerButtonText}>{actionId === row.id ? '…' : 'Remove'}</Text>
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
  form: { marginBottom: 24, padding: 16, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8 },
  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
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
  inputShort: { flex: 1 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  formButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#666' },
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
  cardAddress: { fontSize: 14, color: colors.grey, marginBottom: 4 },
  cardCoords: { fontSize: 12, color: colors.grey, marginBottom: 8 },
  cardActions: { flexDirection: 'row', gap: 8 },
  secondaryButton: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.secondary, borderRadius: 6 },
  secondaryButtonText: { color: colors.secondary, fontSize: 13 },
  dangerButton: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#c00', borderRadius: 6 },
  dangerButtonText: { color: '#c00', fontSize: 13 },
});
