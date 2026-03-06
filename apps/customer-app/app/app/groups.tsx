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
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { customerApi } from '../../lib/api';

type GroupItem = { id: string; name: string; ownerId: string; memberCount?: number; createdAt: string };
type GroupMemberItem = { id: string; userId: string; userName?: string; userEmail?: string; createdAt: string };
type SoloMemberItem = { id: string; name?: string; email: string };

export default function GroupsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMemberItem[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [soloList, setSoloList] = useState<SoloMemberItem[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchGroups = () => {
    customerApi
      .fetchallgroupslist()
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setGroups([]);
        } else {
          const list = (data?.fetchallgroupslist ?? data?.list) as GroupItem[] | undefined;
          setGroups(list ?? []);
          setError(null);
        }
      })
      .catch(() => {
        setError('Failed to load groups');
        setGroups([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) {
      setMembers([]);
      setShowAddMember(false);
      return;
    }
    setMembersLoading(true);
    customerApi
      .fetchgroupMembers(selectedGroupId)
      .then((res) => {
        const data = res?.data as Record<string, unknown> | undefined;
        const list = (data?.fetchgroupMembers ?? data?.list) as GroupMemberItem[] | undefined;
        setMembers(list ?? []);
      })
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }, [selectedGroupId]);

  const loadSoloMembers = () => {
    if (!selectedGroupId) return;
    customerApi.fetchSoloMembers(selectedGroupId).then((res) => {
      const data = res?.data as Record<string, unknown> | undefined;
      const list = (data?.fetchSoloMembers ?? data?.list) as SoloMemberItem[] | undefined;
      setSoloList(list ?? []);
      setShowAddMember(true);
    });
  };

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    setCreateLoading(true);
    setError(null);
    customerApi
      .addgroupname(name)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setNewGroupName('');
          setShowCreateForm(false);
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Create failed'));
        }
      })
      .catch(() => setError('Create failed'))
      .finally(() => setCreateLoading(false));
  };

  const handleAddMember = (userId: string) => {
    if (!selectedGroupId) return;
    setAddMemberLoading(true);
    setError(null);
    customerApi
      .addgroupmember(selectedGroupId, userId)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') {
          setShowAddMember(false);
          customerApi.fetchgroupMembers(selectedGroupId).then((r) => {
            const d = r?.data as Record<string, unknown>;
            setMembers((d?.fetchgroupMembers ?? d?.list) as GroupMemberItem[] ?? []);
          });
          fetchGroups();
        } else {
          setError(String(data?.message ?? 'Add member failed'));
        }
      })
      .catch(() => setError('Add member failed'))
      .finally(() => setAddMemberLoading(false));
  };

  const handleRemoveMember = (groupId: string, memberId: string) => {
    Alert.alert('Remove member', 'Remove this member from the group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setActionLoading(memberId);
          setError(null);
          customerApi
            .updategroupmember(groupId, memberId)
            .then((res) => {
              const data = res?.data as Record<string, unknown>;
              if (data?.mtype === 'success') {
                setMembers((prev) => prev.filter((m) => m.id !== memberId));
                fetchGroups();
              } else {
                setError(String(data?.message ?? 'Remove failed'));
              }
            })
            .catch(() => setError('Remove failed'))
            .finally(() => setActionLoading(null));
        },
      },
    ]);
  };

  const handleDeleteGroup = (groupId: string) => {
    Alert.alert('Delete group', 'Delete this group? Members will not be removed from the app.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setActionLoading('delete');
          setError(null);
          customerApi
            .deletegrouplist(groupId)
            .then((res) => {
              const data = res?.data as Record<string, unknown>;
              if (data?.mtype === 'success') {
                setSelectedGroupId(null);
                setMembers([]);
                fetchGroups();
              } else {
                setError(String(data?.message ?? 'Delete failed'));
              }
            })
            .catch(() => setError('Delete failed'))
            .finally(() => setActionLoading(null));
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
        <Text style={styles.title}>Groups</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Create groups and add other customers as members.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setShowCreateForm((v) => !v)}
        >
          <Text style={styles.primaryButtonText}>{showCreateForm ? 'Cancel' : 'Create group'}</Text>
        </TouchableOpacity>

        {showCreateForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={newGroupName}
              onChangeText={setNewGroupName}
              placeholder="Group name (e.g. Weekend runners)"
              placeholderTextColor={colors.grey}
              editable={!createLoading}
            />
            <TouchableOpacity
              style={[styles.primaryButton, createLoading && styles.buttonDisabled]}
              onPress={handleCreateGroup}
              disabled={createLoading}
            >
              <Text style={styles.primaryButtonText}>{createLoading ? 'Creating…' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="small" color={colors.secondary} style={styles.loader} />
        ) : groups.length === 0 ? (
          <Text style={styles.empty}>No groups yet. Create one above.</Text>
        ) : (
          groups.map((group) => {
            const isExpanded = selectedGroupId === group.id;
            return (
              <View key={group.id} style={[styles.card, isExpanded && styles.cardExpanded]}>
                <View style={styles.cardRow}>
                  <TouchableOpacity
                    onPress={() => setSelectedGroupId(isExpanded ? null : group.id)}
                    style={styles.cardTitleWrap}
                  >
                    <Text style={styles.cardTitle}>{group.name}</Text>
                    <Text style={styles.memberCount}>
                      {group.memberCount ?? 0} member{(group.memberCount ?? 0) !== 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                  {isExpanded && (
                    <TouchableOpacity
                      onPress={() => handleDeleteGroup(group.id)}
                      disabled={actionLoading === 'delete'}
                      style={styles.dangerButton}
                    >
                      <Text style={styles.dangerButtonText}>
                        {actionLoading === 'delete' ? '…' : 'Delete'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {isExpanded && (
                  <View style={styles.membersSection}>
                    {membersLoading ? (
                      <ActivityIndicator size="small" color={colors.secondary} />
                    ) : (
                      <>
                        <View style={styles.membersHeader}>
                          <Text style={styles.membersTitle}>Members</Text>
                          <TouchableOpacity onPress={loadSoloMembers} style={styles.secondaryButton}>
                            <Text style={styles.secondaryButtonText}>Add member</Text>
                          </TouchableOpacity>
                        </View>
                        {members.length === 0 ? (
                          <Text style={styles.muted}>No members. Add one above.</Text>
                        ) : (
                          members.map((m) => (
                            <View key={m.id} style={styles.memberRow}>
                              <Text style={styles.memberName}>
                                {m.userName || m.userEmail || m.userId}
                              </Text>
                              <TouchableOpacity
                                onPress={() => handleRemoveMember(group.id, m.id)}
                                disabled={actionLoading === m.id}
                                style={styles.dangerButtonSmall}
                              >
                                <Text style={styles.dangerButtonText}>
                                  {actionLoading === m.id ? '…' : 'Remove'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ))
                        )}
                      </>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showAddMember} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select customer to add</Text>
            {addMemberLoading ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : soloList.length === 0 ? (
              <Text style={styles.muted}>No other customers to add.</Text>
            ) : (
              <FlatList
                data={soloList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.soloItem}
                    onPress={() => handleAddMember(item.id)}
                    disabled={addMemberLoading}
                  >
                    <Text style={styles.soloItemText}>
                      {item.name || item.email} ({item.email})
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity
              style={[styles.primaryButton, styles.modalClose]}
              onPress={() => setShowAddMember(false)}
            >
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
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: colors.black,
  },
  loader: { marginVertical: 20 },
  empty: { fontSize: 16, color: colors.grey },
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
  },
  cardExpanded: { backgroundColor: '#f8f9fa' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  cardTitleWrap: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  memberCount: { fontSize: 14, color: colors.grey, marginTop: 4 },
  dangerButton: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#c00', borderRadius: 6 },
  dangerButtonText: { color: '#c00', fontSize: 13 },
  dangerButtonSmall: { paddingVertical: 4, paddingHorizontal: 10 },
  membersSection: { marginTop: 16 },
  membersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  membersTitle: { fontSize: 14, fontWeight: '600' },
  secondaryButton: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.secondary, borderRadius: 6 },
  secondaryButtonText: { color: colors.secondary, fontSize: 13 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  memberName: { fontSize: 14 },
  muted: { fontSize: 14, color: colors.grey },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 360, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalClose: { marginTop: 16 },
  soloItem: { paddingVertical: 12, paddingHorizontal: 0, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  soloItemText: { fontSize: 16 },
});
