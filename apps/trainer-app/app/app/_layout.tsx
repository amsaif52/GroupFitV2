import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" />
      <Stack.Screen name="help" />
      <Stack.Screen name="coming-soon" />
      <Stack.Screen name="earning" />
      <Stack.Screen name="activities" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="certificates" />
      <Stack.Screen name="bank-details" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="activity-area" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
