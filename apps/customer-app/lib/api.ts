import { createAxiosApiClient } from '@groupfit/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const TOKEN_KEY = 'groupfit_token';

let memoryToken: string | null = null;

/** Call once on app load (e.g. root layout) to hydrate token from storage. */
export async function loadStoredToken(): Promise<string | null> {
  const t = await AsyncStorage.getItem(TOKEN_KEY);
  memoryToken = t;
  return t;
}

export function getStoredToken(): string | null {
  return memoryToken;
}

export async function setStoredToken(token: string): Promise<void> {
  memoryToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  memoryToken = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}

const baseURL =
  Constants.expoConfig?.extra?.apiUrl ??
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ??
  'http://localhost:3001/api';

export const api = createAxiosApiClient({
  baseURL,
  getAccessToken: () => memoryToken,
  onUnauthorized: () => {
    memoryToken = null;
    void AsyncStorage.removeItem(TOKEN_KEY);
  },
});
