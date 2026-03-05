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

/** Customer division: POST /api/customer/<action>. Use for customer-app. */
export const customerApi = {
  viewProfile: () => api.post<{ mtype: string; name?: string; emailid?: string; phone?: string; locale?: string }>('/customer/viewProfile', {}),
  editProfile: (body: { name?: string; phone?: string; locale?: string }) =>
    api.post<{ mtype: string; message?: string }>('/customer/editProfile', body),
  paymentList: () => api.post<{ mtype: string; list?: unknown[] }>('/customer/PaymentList', {}),

  // Sessions
  customerSessionList: (body: { status?: string }) =>
    api.post<{ mtype: string; customerSessionList?: unknown[] }>('/customer/customerSessionList', body),
  customerSessionCompletedList: (body: { status?: string }) =>
    api.post<{ mtype: string; customerSessionCompletedList?: unknown[] }>('/customer/customerSessionCompletedList', body),
  todaysessionlist: () =>
    api.post<{ mtype: string; todaysessionlist?: unknown[] }>('/customer/todaysessionlist', {}),

  // Activities
  fetchAllActivity: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; activityList?: unknown[] }>('/customer/fetchAllActivity', body ?? {}),
  fetchFavouriteActivities: () =>
    api.post<{ mtype: string; favouriteActivities?: unknown[] }>('/customer/fetchFavouriteActivities', {}),
  addFavouriteActivity: (activityCode: string) =>
    api.post<Record<string, unknown>>('/customer/addFavouriteActivity', { activityCode }),
  removeFavouriteActivity: (activityCode: string) =>
    api.post<Record<string, unknown>>('/customer/removeFavouriteActivity', { activityCode }),
  GetTrendingActivities: () =>
    api.post<{ mtype: string; trendingActivities?: unknown[] }>('/customer/GetTrendingActivities', {}),

  // Trainers
  fetchFavouriteTrainers: () =>
    api.post<{ mtype: string; favouriteTrainersList?: unknown[] }>('/customer/fetchFavouriteTrainers', {}),
  topratedTrainersList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; topratedTrainersList?: unknown[] }>('/customer/topratedTrainersList', body ?? {}),
  favouriteTrainersList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; favouriteTrainersList?: unknown[] }>('/customer/favouriteTrainersList', body ?? {}),
  addFavouriteTrainer: (trainerId: string) =>
    api.post<Record<string, unknown>>('/customer/addFavouriteTrainer', { trainerId }),
  deleteFavouriteTrainer: (trainerId: string) =>
    api.post<Record<string, unknown>>('/customer/deletefavouriteTrainer', { trainerId }),
  fetchSessionDetails: (sessionId: string) =>
    api.post<Record<string, unknown>>('/customer/fetchSessionDetails', { sessionId }),
  cancelSession: (sessionId: string, cancelReason?: string) =>
    api.post<Record<string, unknown>>('/customer/cancelSession', { sessionId, cancelReason }),
  rescheduleSession: (sessionId: string, newScheduledAt: string) =>
    api.post<Record<string, unknown>>('/customer/rescheduleSession', { sessionId, newScheduledAt }),
  viewActivity: (activityId: string) =>
    api.post<Record<string, unknown>>('/customer/viewActivity', { activityId }),
  viewTrainer: (trainerId: string) =>
    api.post<Record<string, unknown>>('/customer/viewTrainer', { trainerId }),
  addSession: (trainerId: string, scheduledAt: string, activityName?: string) =>
    api.post<Record<string, unknown>>('/customer/addSession', { trainerId, scheduledAt, activityName }),

  getNotificationList: () =>
    api.post<Record<string, unknown>>('/customer/GetNotificationList', {}),
  getNotificationFlag: () =>
    api.post<Record<string, unknown>>('/customer/GetNotificationFlag', {}),
  updateNotificationReadStatus: (notificationId?: string) =>
    api.post<Record<string, unknown>>('/customer/UpdateNotificationReadStatus', { notificationId }),
  deleteNotification: (notificationId: string) =>
    api.post<Record<string, unknown>>('/customer/deleteNotification', { notificationId }),
};
