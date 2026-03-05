import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { colors, fontSizes, spacing } from '../../theme';

export type ProfileVariant = 'customer' | 'trainer';

export interface ProfileScreenNativeProps {
  variant: ProfileVariant;
  userName?: string;
  userEmail?: string;
  /** Trainer only: when false, show "Your account is under review" modal when tapping avatar/verified badge */
  isVerified?: boolean;
  /** Optional app version string (e.g. "1.0.0") shown at bottom for trainer */
  appVersion?: string;
  onLogout: () => void;
  onEditProfile?: () => void;
  onReferFriend?: () => void;
  onMyLocations?: () => void;
  onNotifications?: () => void;
  onGroups?: () => void;
  onPaymentHistory?: () => void;
  onAvailability?: () => void;
  onActivities?: () => void;
  onActivityArea?: () => void;
  onCertificates?: () => void;
  onBankDetails?: () => void;
  onReviews?: () => void;
  onEarning?: () => void;
  onHelp?: () => void;
}

const PRIVACY_URL = 'https://groupfitapp.com/app-privacy-policy/';
const TERMS_URL = 'https://groupfitapp.com/app-user-terms-and-condition/';

function Row({
  icon,
  label,
  onPress,
  signOut,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  signOut?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress && !signOut}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, signOut && styles.signOutLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const UNDER_REVIEW_TITLE = 'Your account is under review';
const UNDER_REVIEW_MESSAGE =
  'Please ensure you have provided all the information required under My Profile/Personal Information. Your profile will not be visible to customers until the review process is complete. Our team will review the information submitted and activate your profile within 3 business days. Thank you for your patience.';

export function ProfileScreenNative({
  variant,
  userName = '',
  userEmail = '',
  isVerified = true,
  appVersion,
  onLogout,
  onEditProfile,
  onReferFriend,
  onMyLocations,
  onNotifications,
  onGroups,
  onPaymentHistory,
  onAvailability,
  onActivities,
  onActivityArea,
  onCertificates,
  onBankDetails,
  onReviews,
  onEarning,
  onHelp,
}: ProfileScreenNativeProps) {
  const displayName = userName || userEmail || '';
  const [showUnderReviewModal, setShowUnderReviewModal] = useState(false);

  const handleLogout = () => {
    Alert.alert('', 'Are you sure you want to logout?', [
      { text: 'No' },
      { text: 'Yes', onPress: onLogout },
    ]);
  };

  if (variant === 'trainer') {
    return (
      <>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <TouchableOpacity
              onPress={() => !isVerified && setShowUnderReviewModal(true)}
              activeOpacity={isVerified ? 1 : 0.7}
              style={styles.avatarTouchWrap}
            >
              <View style={[styles.avatar, styles.avatarLarge]} />
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>{isVerified ? '✓' : '!'}</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.nameCenter}>{displayName}</Text>
          </View>
          <View style={styles.rating}>
            <Text style={styles.ratingLabel}>Overall Rating</Text>
            <Text style={styles.ratingValue}>4.0</Text>
            <Text style={styles.stars}>
              {'★'.repeat(4)}
              <Text style={styles.starsEmpty}>{'★'}</Text>
            </Text>
          </View>
          <View style={styles.list}>
            <Row icon="👤" label="Edit Profile" onPress={onEditProfile} />
            <Row icon="📅" label="Availability" onPress={onAvailability} />
            <Row icon="🏃" label="Activities" onPress={onActivities} />
            <Row icon="📍" label="Activity Area" onPress={onActivityArea} />
            <Row icon="📜" label="Certificates" onPress={onCertificates} />
            <Row icon="🏦" label="Bank Details" onPress={onBankDetails} />
            <Row icon="⭐" label="Reviews" onPress={onReviews} />
            <Row icon="💰" label="Earning" onPress={onEarning} />
            <Row icon="🔒" label="Privacy Policy" onPress={() => Linking.openURL(PRIVACY_URL)} />
            <Row
              icon="📄"
              label="Terms and Conditions"
              onPress={() => Linking.openURL(TERMS_URL)}
            />
            <Row icon="❓" label="Help" onPress={onHelp} />
            <Row icon="⎋" label="Logout" onPress={handleLogout} signOut />
          </View>
          {appVersion != null && appVersion !== '' && (
            <Text style={styles.version}>v{appVersion}</Text>
          )}
        </ScrollView>
        <Modal visible={showUnderReviewModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{UNDER_REVIEW_TITLE}</Text>
              <Text style={styles.modalMessage}>{UNDER_REVIEW_MESSAGE}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowUnderReviewModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.avatar} />
      </View>
      <View style={styles.cards}>
        <TouchableOpacity style={styles.card} onPress={onEditProfile} activeOpacity={0.8}>
          <Text style={styles.cardIcon}>👤</Text>
          <Text style={styles.cardLabel}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={onGroups} activeOpacity={0.8}>
          <Text style={styles.cardIcon}>👥</Text>
          <Text style={styles.cardLabel}>Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={onPaymentHistory} activeOpacity={0.8}>
          <Text style={styles.cardIcon}>💳</Text>
          <Text style={styles.cardLabel}>Payment History</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.list}>
        <Row icon="➕" label="Refer a Friend" onPress={onReferFriend} />
        <Row icon="📍" label="My Locations" onPress={onMyLocations} />
        <Row icon="🔔" label="Notifications" onPress={onNotifications} />
        <Row icon="🔒" label="Privacy Policy" onPress={() => Linking.openURL(PRIVACY_URL)} />
        <Row icon="📄" label="Terms and Conditions" onPress={() => Linking.openURL(TERMS_URL)} />
        <Row icon="❓" label="Help Centre" onPress={onHelp} />
        <Row icon="⎋" label="Sign Out" onPress={handleLogout} signOut />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
  },
  nameCenter: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.black,
    marginTop: 12,
    textAlign: 'center',
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: colors.borderLight,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarTouchWrap: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  version: {
    fontSize: 14,
    color: colors.grey,
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  rating: {
    alignItems: 'center',
    marginBottom: 28,
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.grey,
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.black,
    marginBottom: 8,
  },
  stars: {
    color: '#FFAA05',
    fontSize: 18,
  },
  starsEmpty: {
    color: colors.borderLight,
  },
  cards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    minHeight: 90,
    padding: 16,
    backgroundColor: 'rgba(44,44,46,0.08)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44,44,46,0.08)',
    gap: 12,
  },
  rowIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  signOutLabel: {
    color: colors.secondary,
    fontWeight: '600',
    fontSize: 18,
  },
});
