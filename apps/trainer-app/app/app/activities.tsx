import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { trainerApi } from '../../lib/api';

type TrainerActivityItem = {
  id: string;
  trainerId: string;
  activityCode: string;
  activityName?: string;
  activityDescription?: string;
  createdAt: string;
};

type MasterActivityItem = {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
};

export default function ActivitiesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<TrainerActivityItem[]>([]);
  const [masterList, setMasterList] = useState<MasterActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchLists = () => {
    setLoading(true);
    Promise.all([trainerApi.trainerActivityList(), trainerApi.allActivityList()])
      .then(([myRes, allRes]) => {
        const myData = myRes?.data as Record<string, unknown> | undefined;
        const allData = allRes?.data as Record<string, unknown> | undefined;
        if (myData?.mtype === 'error') {
          setError(String(myData.message ?? 'Failed to load'));
          setList([]);
        } else {
          const myList = (myData?.trainerActivityList ?? myData?.list) as TrainerActivityItem[] | undefined;
          setList(myList ?? []);
          setError(null);
        }
        if (allData?.mtype === 'error') {
          setMasterList([]);
        } else {
          const all = (allData?.allActivityList ?? allData?.list) as MasterActivityItem[] | undefined;
          setMasterList(all ?? []);
        }
      })
      .catch(() => {
        setError('Failed to load activities');
        setList([]);
        setMasterList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const myCodes = new Set(list.map((r) => r.activityCode.toLowerCase()));
  const availableToAdd = masterList.filter((a) => !myCodes.has(a.code.toLowerCase()));

  const handleAdd = (activityCode: string) => {
    setAddLoading(true);
    setError(null);
    trainerApi
      .addTrainerActivity(activityCode)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setShowAddModal(false);
          fetchLists();
        } else {
          setError(String(data?.message ?? 'Add failed'));
        }
      })
      .catch(() => setError('Add failed'))
      .finally(() => setAddLoading(false));
  };

  const startEdit = (row: TrainerActivityItem) => {
    setEditingId(row.id);
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowEditModal(false);
  };

  const handleEdit = (newCode: string) => {
    if (!editingId) return;
    setEditLoading(true);
    setError(null);
    trainerApi
      .editTrainerActivity(editingId, newCode)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          cancelEdit();
          fetchLists();
        } else {
          setError(String(data?.message ?? 'Update failed'));
        }
      })
      .catch(() => setError('Update failed'))
      .finally(() => setEditLoading(false));
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove activity', 'Remove this activity from your list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setActionId(id);
          trainerApi
            .deleteActivity(id)
            .then((res) => {
              const data = res?.data as Record<string, unknown>;
              if (data?.mtype === 'success') fetchLists();
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
        <Text style={styles.title}>My activities</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Activities you offer. Add from the master list below.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAddModal(true)} disabled={availableToAdd.length === 0}>
          <Text style={styles.primaryButtonText}>Add activity</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="small" color={colors.secondary} style={styles.loader} />
        ) : list.length === 0 ? (
          <Text style={styles.empty}>No activities yet. Add one above.</Text>
        ) : (
          list.map((row) => (
            <View key={row.id} style={styles.card}>
              <Text style={styles.cardTitle}>{row.activityName || row.activityCode}</Text>
              <Text style={styles.cardSub}>{row.activityCode}</Text>
              <View style={styles.cardRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => startEdit(row)}>
                  <Text style={styles.secondaryButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dangerButton} onPress={() => handleDelete(row.id)} disabled={actionId === row.id}>
                  <Text style={styles.dangerButtonText}>{actionId === row.id ? '…' : 'Remove'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select activity to add</Text>
            {addLoading ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : availableToAdd.length === 0 ? (
              <Text style={styles.muted}>No more activities to add.</Text>
            ) : (
              <FlatList
                data={availableToAdd}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.soloItem} onPress={() => handleAdd(item.code)} disabled={addLoading}>
                    <Text style={styles.soloItemText}>{item.name} ({item.code})</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={[styles.primaryButton, styles.modalClose]} onPress={() => setShowAddModal(false)}>
              <Text style={styles.primaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select new activity</Text>
            {editLoading ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : (
              <FlatList
                data={masterList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.soloItem} onPress={() => handleEdit(item.code)} disabled={editLoading}>
                    <Text style={styles.soloItemText}>{item.name} ({item.code})</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={[styles.primaryButton, styles.modalClose]} onPress={cancelEdit}>
              <Text style={styles.primaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryLight },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  back: { fontSize: 14, color: colors.secondary, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '600', color: colors.black },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  subtitle: { fontSize: 14, color: colors.grey, marginBottom: 16 },
  error: { color: '#c00', marginBottom: 16 },
  primaryButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.secondary, alignSelf: 'flex-start', marginBottom: 20 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  loader: { marginVertical: 20 },
  empty: { fontSize: 16, color: colors.grey },
  card: { padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 14, color: colors.grey, marginBottom: 4 },
  cardRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  secondaryButton: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.secondary, borderRadius: 6 },
  secondaryButtonText: { color: colors.secondary, fontSize: 13 },
  cancelButton: { paddingVertical: 6, paddingHorizontal: 12, marginLeft: 8, borderWidth: 1, borderColor: '#666', borderRadius: 6 },
  cancelButtonText: { color: '#666', fontSize: 13 },
  dangerButton: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#c00', borderRadius: 6 },
  dangerButtonText: { color: '#c00', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 360, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalClose: { marginTop: 16 },
  soloItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  soloItemText: { fontSize: 16 },
  muted: { fontSize: 14, color: colors.grey },
});
