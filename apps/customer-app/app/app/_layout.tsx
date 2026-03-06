import { Stack } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';
import { DefaultLocationProvider } from '../../contexts/DefaultLocationContext';

const stripePublishableKey =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) || '';

export default function AppLayout() {
  return (
    <StripeProvider publishableKey={stripePublishableKey}>
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
    </StripeProvider>
  );
}
