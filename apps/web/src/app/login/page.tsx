import LoginPageClient from './LoginPageClient';
import { getApiBaseUrl } from '@/config';
import { fetchFeatureFlagsServer } from '@/lib/queries/featureFlags';

export default async function LoginPage() {
  const featureFlags = await fetchFeatureFlagsServer(`${getApiBaseUrl()}/auth/feature-flags`);
  return <LoginPageClient featureFlags={featureFlags} />;
}
