import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { decodeJwtPayload } from '@groupfit/shared';
import { ProfileScreenNative } from '@groupfit/shared/components/native';
import { getStoredToken, clearStoredToken } from '../../../lib/api';

const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION ?? '1.0.0';

export default function TrainerAccountTab() {
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
      onNotifications={() => router.push('/app/notifications')}
      onHelp={() => router.push('/app/help')}
    />
  );
}
