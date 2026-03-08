import { useEffect } from 'react';
import { Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from '@expo-google-fonts/inter/useFonts';
import { Inter_400Regular } from '@expo-google-fonts/inter';
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
  const [fontsLoaded] = useFonts({ Inter_400Regular });

  useEffect(() => {
    void loadStoredToken();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      Text.defaultProps = { ...Text.defaultProps, style: { fontFamily: 'Inter_400Regular' } };
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme="light">
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
