import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import { loadStoredToken } from '../lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
});

export default function RootLayout() {
  useEffect(() => {
    void loadStoredToken();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme="light">
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
