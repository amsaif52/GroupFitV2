import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { trainerApi } from '../../lib/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Slot = { id: string; dayOfWeek: number; startTime: string; endTime: string };

export default function AvailabilityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<Slot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = () => {
    trainerApi
      .trainerAvailabilityList()
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          setList((data?.availabilityList as Slot[]) ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load availability');
        setList([]);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchList();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchList();
  };

  const openAdd = () => {
    setEditingId(null);
    setDayOfWeek(1);
    setStartTime('09:00');
    setEndTime('17:00');
    setShowForm(true);
  };

  const openEdit = (slot: Slot) => {
    setEditingId(slot.id);
    setDayOfWeek(slot.dayOfWeek);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    setSubmitLoading(true);
    if (editingId) {
      trainerApi
        .editTrainerAvailability(editingId, dayOfWeek, startTime, endTime)
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
        .addTrainerAvailability(dayOfWeek, startTime, endTime)
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
    setActionId(id);
    trainerApi
      .deleteAvaibilitySlot(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
        else setError(String(data?.message ?? 'Delete failed'));
      })
      .catch(() => setError('Delete failed'))
      .finally(() => setActionId(null));
  };

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Availability</Text>
      </View>
      <TouchableOpacity onPress={openAdd} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add slot</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{editingId ? 'Edit slot' : 'New slot'}</Text>
          <Text style={styles.label}>Day</Text>
          <View style={styles.dayRow}>
            {DAYS.map((d, i) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDayOfWeek(i)}
                style={[styles.dayChip, dayOfWeek === i && styles.dayChipActive]}
              >
                <Text style={[styles.dayChipText, dayOfWeek === i && styles.dayChipTextActive]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Start time (HH:mm)</Text>
          <TextInput
            value={startTime}
            onChangeText={setStartTime}
            placeholder="09:00"
            style={styles.input}
            autoCapitalize="none"
          />
          <Text style={styles.label}>End time (HH:mm)</Text>
          <TextInput
            value={endTime}
            onChangeText={setEndTime}
            placeholder="17:00"
            style={styles.input}
            autoCapitalize="none"
          />
          <View style={styles.formActions}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitLoading}
              style={[styles.primaryButton, submitLoading && styles.buttonDisabled]}
            >
              <Text style={styles.primaryButtonText}>
                {submitLoading ? '…' : editingId ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeForm} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.secondary]}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 24 }} />
        ) : list.length === 0 ? (
          <Text style={styles.message}>No availability slots. Add one above.</Text>
        ) : (
          list.map((slot) => (
            <View key={slot.id} style={styles.card}>
              <View style={styles.cardMain}>
                <Text style={styles.cardDay}>{DAYS[slot.dayOfWeek] ?? slot.dayOfWeek}</Text>
                <Text style={styles.cardTime}>
                  {slot.startTime} – {slot.endTime}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEdit(slot)} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(slot.id)}
                  disabled={actionId === slot.id}
                  style={[styles.smallButtonDanger, actionId === slot.id && styles.buttonDisabled]}
                >
                  <Text style={styles.smallButtonDangerText}>
                    {actionId === slot.id ? '…' : 'Delete'}
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
  addButton: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  addButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  error: { fontSize: 14, color: '#c00', marginHorizontal: 16, marginTop: 8 },
  form: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 12, color: colors.grey, marginTop: 8, marginBottom: 4 },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  dayChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  dayChipActive: { backgroundColor: colors.secondary },
  dayChipText: { fontSize: 12, color: colors.black },
  dayChipTextActive: { color: '#fff', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.black,
  },
  formActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  primaryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    flex: 1,
    alignItems: 'center',
  },
  primaryButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 14, color: colors.grey },
  buttonDisabled: { opacity: 0.6 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  message: { fontSize: 16, color: colors.grey, textAlign: 'center', marginTop: 24 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 13,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardMain: { flex: 1 },
  cardDay: { fontSize: 16, fontWeight: '600', color: colors.black },
  cardTime: { fontSize: 14, color: colors.grey, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
  smallButtonText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  smallButtonDanger: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c00',
  },
  smallButtonDangerText: { fontSize: 12, fontWeight: '600', color: '#c00' },
});
