import SignupPageClient from './SignupPageClient';
import { getApiBaseUrl } from '@/config';
import { fetchFeatureFlagsServer } from '@/lib/queries/featureFlags';
import { getCountryList } from '@groupfit/shared';

export default async function SignupPage() {
  const featureFlags = await fetchFeatureFlagsServer(`${getApiBaseUrl()}/auth/feature-flags`);
  const countryList = await getCountryList(getApiBaseUrl());
  return <SignupPageClient featureFlags={featureFlags} countryList={countryList} />;
}
