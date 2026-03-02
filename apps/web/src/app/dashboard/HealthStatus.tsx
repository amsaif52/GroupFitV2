'use client';

import { useHealthQuery } from '@/lib/queries/health';

export function HealthStatus() {
  const { data, isLoading, error } = useHealthQuery();
  if (isLoading) return <p>Checking API…</p>;
  if (error) return <p>API unavailable</p>;
  return <p>API: {data?.status ?? '—'} at {data?.timestamp}</p>;
}
