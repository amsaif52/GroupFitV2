import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { decodeJwtPayload } from '@groupfit/shared';
import { ProfileScreenNative } from '@groupfit/shared/components/native';
import { getStoredToken, clearStoredToken } from '../../lib/api';

const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION ?? '1.0.0';

export default function ProfileScreenRoute() {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const payload = decodeJwtPayload(token);
      setUserName(payload?.email ?? payload?.name ?? '');
    }
  }, []);

  async function handleLogout() {
    await clearStoredToken();
    router.replace('/auth/login');
  }

  return (
    <ProfileScreenNative
      variant="trainer"
      userName={userName}
      isVerified={true}
      appVersion={APP_VERSION}
      onLogout={handleLogout}
      onEditProfile={() => router.push('/app/profile/edit')}
      onAvailability={() => router.push('/app/availability')}
      onActivities={() => router.push('/app/activities')}
      onActivityArea={() => router.push('/app/activity-area')}
      onCertificates={() => router.push('/app/certificates')}
      onBankDetails={() => router.push('/app/bank-details')}
      onReviews={() => router.push('/app/reviews')}
      onEarning={() => router.push('/app/earning')}
      onNotifications={() => {}}
      onHelp={() => router.push('/app/help')}
    />
  );
}
