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

/** Session is kept until the user explicitly logs out (no 401-triggered logout). */
export const api = createAxiosApiClient({
  baseURL,
  getAccessToken: () => memoryToken,
  // Intentionally no onUnauthorized: we do not force logout on 401.
});

/** Root API health (GET). Use to detect server availability. */
export function healthCheck() {
  return api.get<{ status: string; timestamp?: string }>('/health');
}

/** Customer division: POST /api/customer/<action>. Use for customer-app. */
export const customerApi = {
  viewProfile: () =>
    api.post<{ mtype: string; name?: string; emailid?: string; phone?: string; locale?: string }>(
      '/customer/viewProfile',
      {}
    ),
  editProfile: (body: { name?: string; phone?: string; locale?: string }) =>
    api.post<{ mtype: string; message?: string }>('/customer/editProfile', body),
  paymentList: () => api.post<{ mtype: string; list?: unknown[] }>('/customer/PaymentList', {}),

  // Sessions
  customerSessionList: (body: { status?: string }) =>
    api.post<{ mtype: string; customerSessionList?: unknown[] }>(
      '/customer/customerSessionList',
      body
    ),
  customerSessionCompletedList: (body: { status?: string }) =>
    api.post<{ mtype: string; customerSessionCompletedList?: unknown[] }>(
      '/customer/customerSessionCompletedList',
      body
    ),
  todaysessionlist: () =>
    api.post<{ mtype: string; todaysessionlist?: unknown[] }>('/customer/todaysessionlist', {}),

  // Activities
  fetchAllActivity: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; activityList?: unknown[] }>('/customer/fetchAllActivity', body ?? {}),
  /** Activities offered by trainers at location (latitude, longitude, radiusKm optional). */
  activitiesAtLocation: (body: { latitude?: number; longitude?: number; radiusKm?: number }) =>
    api.post<{ mtype: string; activityList?: unknown[] }>('/customer/activitiesAtLocation', body),
  fetchFavouriteActivities: () =>
    api.post<{ mtype: string; favouriteActivities?: unknown[] }>(
      '/customer/fetchFavouriteActivities',
      {}
    ),
  addFavouriteActivity: (activityCode: string) =>
    api.post<Record<string, unknown>>('/customer/addFavouriteActivity', { activityCode }),
  removeFavouriteActivity: (activityCode: string) =>
    api.post<Record<string, unknown>>('/customer/removeFavouriteActivity', { activityCode }),
  GetTrendingActivities: () =>
    api.post<{ mtype: string; trendingActivities?: unknown[] }>(
      '/customer/GetTrendingActivities',
      {}
    ),

  // Trainers
  fetchFavouriteTrainers: () =>
    api.post<{ mtype: string; favouriteTrainersList?: unknown[] }>(
      '/customer/fetchFavouriteTrainers',
      {}
    ),
  topratedTrainersList: (body?: { latitude?: number; longitude?: number; radiusKm?: number }) =>
    api.post<{ mtype: string; topratedTrainersList?: unknown[] }>(
      '/customer/topratedTrainersList',
      body ?? {}
    ),
  favouriteTrainersList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; favouriteTrainersList?: unknown[] }>(
      '/customer/favouriteTrainersList',
      body ?? {}
    ),
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
    api.post<Record<string, unknown>>('/customer/addSession', {
      trainerId,
      scheduledAt,
      activityName,
    }),

  getNotificationList: () => api.post<Record<string, unknown>>('/customer/GetNotificationList', {}),
  getNotificationFlag: () => api.post<Record<string, unknown>>('/customer/GetNotificationFlag', {}),
  updateNotificationReadStatus: (notificationId?: string) =>
    api.post<Record<string, unknown>>('/customer/UpdateNotificationReadStatus', { notificationId }),
  deleteNotification: (notificationId: string) =>
    api.post<Record<string, unknown>>('/customer/deleteNotification', { notificationId }),

  // Groups
  fetchallgroupslist: () =>
    api.post<{ mtype: string; fetchallgroupslist?: unknown[]; list?: unknown[] }>(
      '/customer/fetchallgroupslist',
      {}
    ),
  addgroupname: (name: string) =>
    api.post<Record<string, unknown>>('/customer/addgroupname', { name }),
  fetchgroupMembers: (groupId: string) =>
    api.post<{ mtype: string; fetchgroupMembers?: unknown[]; list?: unknown[] }>(
      '/customer/fetchgroupMembers',
      { groupId }
    ),
  addgroupmember: (groupId: string, userId: string) =>
    api.post<Record<string, unknown>>('/customer/addgroupmember', { groupId, userId }),
  updategroupmember: (groupId: string, memberId: string) =>
    api.post<Record<string, unknown>>('/customer/updategroupmember', { groupId, memberId }),
  deletegrouplist: (groupId: string) =>
    api.post<Record<string, unknown>>('/customer/deletegrouplist', { groupId }),
  fetchSoloMembers: (groupId: string) =>
    api.post<{ mtype: string; fetchSoloMembers?: unknown[]; list?: unknown[] }>(
      '/customer/fetchSoloMembers',
      { groupId }
    ),

  // Referrals
  ReferralList: () =>
    api.post<{ mtype: string; ReferralList?: unknown[]; list?: unknown[] }>(
      '/customer/ReferralList',
      {}
    ),

  // Locations (saved addresses)
  customerServiceList: () =>
    api.post<{ mtype: string; customerServiceList?: unknown[]; list?: unknown[] }>(
      '/customer/customerServiceList',
      {}
    ),
  addCustomerService: (body: {
    label: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }) => api.post<Record<string, unknown>>('/customer/addCustomerService', body),
  editCustomerService: (body: {
    locationId: string;
    label?: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }) => api.post<Record<string, unknown>>('/customer/editCustomerService', body),
  deleteCustomerService: (locationId: string) =>
    api.post<Record<string, unknown>>('/customer/deleteCustomerService', { locationId }),

  faqlist: () =>
    api.post<{
      mtype: string;
      faqlist?: { id: string; question: string; answer: string }[];
      list?: unknown[];
    }>('/customer/faqlist', {}),
  fetchContactLink: () =>
    api.post<{ mtype: string; contactEmail?: string; contactLink?: string }>(
      '/customer/fetchContactLink',
      {}
    ),
  raiseSupport: (body: { subject?: string; message?: string }) =>
    api.post<Record<string, unknown>>('/customer/raiseSupport', body),
  /** Assistant chat (JWT). Body: message, conversationId (optional). Returns message + conversationId. */
  chat: (body: { message: string; conversationId?: string }) =>
    api.post<{ message: string; conversationId: string }>('/customer/chat', body),
};
