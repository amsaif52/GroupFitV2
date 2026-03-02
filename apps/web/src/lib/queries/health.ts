import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { HealthResponse } from '@groupfit/shared';

export const healthKeys = {
  all: ['health'] as const,
};

export function useHealthQuery() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: async (): Promise<HealthResponse> => {
      const { data } = await api.get<HealthResponse>('/health');
      return data;
    },
  });
}
