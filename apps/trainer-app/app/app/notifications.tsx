import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@groupfit/shared/theme';
import { getApiErrorMessage } from '@groupfit/shared';
import { trainerApi } from '../../lib/api';

type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchList = () => {
    trainerApi
      .getNotificationList()
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'error') {
          setError(String(data.message ?? 'Failed to load'));
          setList([]);
        } else {
          setList((data?.notificationList as NotificationItem[]) ?? []);
          setError(null);
        }
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to load notifications'));
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

  const handleMarkRead = (id: string) => {
    setActionId(id);
    trainerApi
      .updateNotificationReadStatus(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
      })
      .finally(() => setActionId(null));
  };

  const handleMarkAllRead = () => {
    setActionId('all');
    trainerApi
      .readAllNotification()
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
      })
      .finally(() => setActionId(null));
  };

  const handleDelete = (id: string) => {
    setActionId(id);
    trainerApi
      .deleteNotification(id)
      .then((res) => {
        const data = res?.data as Record<string, unknown>;
        if (data?.mtype === 'success') fetchList();
      })
      .finally(() => setActionId(null));
  };

  const unreadCount = list.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>
      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={handleMarkAllRead}
          disabled={actionId === 'all'}
          style={[styles.markAllButton, actionId === 'all' && styles.buttonDisabled]}
        >
          <Text style={styles.markAllButtonText}>
            {actionId === 'all' ? 'Updating…' : `Mark all as read (${unreadCount})`}
          </Text>
        </TouchableOpacity>
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
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : list.length === 0 ? (
          <Text style={styles.message}>No notifications yet.</Text>
        ) : (
          list.map((n) => (
            <View key={n.id} style={[styles.card, n.read ? styles.cardRead : styles.cardUnread]}>
              <View style={styles.cardMain}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                {n.body ? <Text style={styles.cardBody}>{n.body}</Text> : null}
                <Text style={styles.cardDate}>
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </Text>
              </View>
              <View style={styles.cardActions}>
                {!n.read && (
                  <TouchableOpacity
                    onPress={() => handleMarkRead(n.id)}
                    disabled={actionId === n.id}
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                  >
                    <Text style={styles.actionButtonPrimaryText}>Mark read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleDelete(n.id)}
                  disabled={actionId === n.id}
                  style={[styles.actionButton, styles.actionButtonDanger]}
                >
                  <Text style={styles.actionButtonDangerText}>Delete</Text>
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
  markAllButton: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  markAllButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  buttonDisabled: { opacity: 0.6 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  message: { fontSize: 16, color: colors.grey, textAlign: 'center', marginTop: 24 },
  error: { fontSize: 14, color: colors.grey, marginTop: 24 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 13,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardRead: { borderLeftColor: 'transparent' },
  cardUnread: { borderLeftColor: colors.secondary },
  cardMain: { marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.black },
  cardBody: { fontSize: 14, color: colors.grey, marginTop: 4 },
  cardDate: { fontSize: 12, color: colors.grey, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  actionButtonPrimary: { backgroundColor: colors.secondary },
  actionButtonPrimaryText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  actionButtonDanger: { borderWidth: 1, borderColor: '#c00' },
  actionButtonDangerText: { fontSize: 14, fontWeight: '600', color: '#c00' },
});
