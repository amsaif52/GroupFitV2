import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type FeatureFlags = Record<string, boolean>;

export const featureFlagKeys = {
  all: ['featureFlags'] as const,
};

async function fetchFeatureFlags(): Promise<FeatureFlags> {
  const { data } = await api.post<{ mtype?: string; flags?: FeatureFlags }>(
    '/auth/feature-flags',
    {}
  );
  if (data?.mtype === 'success' && data.flags) return data.flags;
  return {};
}

/** Server-safe fetch for feature flags (e.g. in Next.js Server Components). Use native fetch with your base URL. */
export async function fetchFeatureFlagsServer(
  url: string,
  init?: RequestInit
): Promise<FeatureFlags> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      ...init,
    });
    const data = (await res.json()) as { mtype?: string; flags?: FeatureFlags };
    if (data?.mtype === 'success' && data.flags) return data.flags;
  } catch {
    // ignore; caller can treat as {}
  }
  return {};
}

export function useFeatureFlagsQuery(initialData?: FeatureFlags) {
  return useQuery({
    queryKey: featureFlagKeys.all,
    queryFn: fetchFeatureFlags,
    initialData,
    refetchOnWindowFocus: false,
  });
}
