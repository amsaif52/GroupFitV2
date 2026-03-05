import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { decodeJwtPayload } from '@groupfit/shared';
import { ProfileScreenNative } from '@groupfit/shared/components/native';
import { getStoredToken, clearStoredToken } from '../../lib/api';

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
      variant="customer"
      userName={userName}
      onLogout={handleLogout}
      onEditProfile={() => router.push('/app/profile/edit')}
      onReferFriend={() => router.push('/app/refer')}
      onMyLocations={() => router.push('/app/locations')}
      onNotifications={() => router.push('/app/notifications')}
      onGroups={() => router.push('/app/groups')}
      onPaymentHistory={() => router.push('/app/payments')}
      onHelp={() => router.push('/app/help')}
    />
  );
}
