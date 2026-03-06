import { Stack } from 'expo-router';
import { DefaultLocationProvider } from '../../contexts/DefaultLocationContext';

export default function AppLayout() {
  return (
    <DefaultLocationProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" />
        <Stack.Screen name="help" />
        <Stack.Screen name="coming-soon" />
        <Stack.Screen name="payments" />
        <Stack.Screen name="groups" />
        <Stack.Screen name="refer" />
        <Stack.Screen name="locations" />
        <Stack.Screen name="notifications" />
      </Stack>
    </DefaultLocationProvider>
  );
}
