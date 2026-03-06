import { createAxiosApiClient } from '@groupfit/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const TOKEN_KEY = 'groupfit_token';

let memoryToken: string | null = null;

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

/** Trainer division: POST /api/trainer/<action>. Use for trainer-app. */
export const trainerApi = {
  viewProfile: () => api.post<{ mtype: string; name?: string; emailid?: string; phone?: string; locale?: string }>('/trainer/viewProfile', {}),
  editProfile: (body: { name?: string; phone?: string; locale?: string }) =>
    api.post<{ mtype: string; message?: string }>('/trainer/editProfile', body),

  trainerSessionList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; trainerSessionList?: unknown[] }>('/trainer/trainerSessionList', body ?? {}),
  trainerSessionNewList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; trainerSessionNewList?: unknown[] }>('/trainer/trainerSessionNewList', body ?? {}),
  trainerSessionCompletedList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; trainerSessionCompletedList?: unknown[] }>('/trainer/trainerSessionCompletedList', body ?? {}),
  todaySession: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; todaySession?: unknown[] }>('/trainer/todaySession', body ?? {}),
  fetchSessionDetails: (sessionId: string) =>
    api.post<Record<string, unknown>>('/trainer/fetchSessionDetails', { sessionId }),
  cancelSession: (sessionId: string) =>
    api.post<Record<string, unknown>>('/trainer/cancelSession', { sessionId }),
  rescheduleSession: (sessionId: string, newScheduledAt: string) =>
    api.post<Record<string, unknown>>('/trainer/rescheduleSession', { sessionId, newScheduledAt }),

  currentEarning: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; currentEarning?: unknown }>('/trainer/currentEarning', body ?? {}),
  earningStats: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; earningStats?: unknown }>('/trainer/earningStats', body ?? {}),
  referralSummary: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; referralSummary?: unknown }>('/trainer/referralSummary', body ?? {}),

  viewServiceArea: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; address?: string; city?: string; country?: string }>('/trainer/viewServiceArea', body ?? {}),
  trainerAvailabilityList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; availabilityList?: unknown[] }>('/trainer/trainerAvailabilityList', body ?? {}),
  viewListAllAvailabilty: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; availabilityList?: unknown[] }>('/trainer/viewListAllAvailabilty', body ?? {}),
  addTrainerAvailability: (dayOfWeek: number, startTime: string, endTime: string) =>
    api.post<Record<string, unknown>>('/trainer/addTrainerAvailability', { dayOfWeek, startTime, endTime }),
  editTrainerAvailability: (id: string, dayOfWeek?: number, startTime?: string, endTime?: string) =>
    api.post<Record<string, unknown>>('/trainer/editTrainerAvailability', { id, dayOfWeek, startTime, endTime }),
  viewAvailabilty: (id?: string) =>
    api.post<Record<string, unknown>>('/trainer/viewAvailabilty', { id }),
  deleteAvaibilitySlot: (id: string) =>
    api.post<Record<string, unknown>>('/trainer/deleteAvaibilitySlot', { id }),
  trainerActivityList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; trainerActivityList?: unknown[] }>('/trainer/trainerActivityList', body ?? {}),
  allActivityList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; allActivityList?: unknown[] }>('/trainer/allActivityList', body ?? {}),
  addTrainerActivity: (activityCode: string) =>
    api.post<Record<string, unknown>>('/trainer/addTrainerActivity', { activityCode }),
  editTrainerActivity: (id: string, activityCode: string) =>
    api.post<Record<string, unknown>>('/trainer/editTrainerActivity', { id, activityCode }),
  deleteActivity: (id: string) =>
    api.post<Record<string, unknown>>('/trainer/deleteActivity', { id }),

  trainerServiceList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; trainerServiceList?: unknown[]; list?: unknown[] }>('/trainer/trainerServiceList', body ?? {}),
  addTrainerService: (body: { label: string; address?: string | null; latitude?: number | null; longitude?: number | null; radiusKm?: number | null }) =>
    api.post<Record<string, unknown>>('/trainer/addTrainerService', body),
  editTrainerService: (body: { id: string; label?: string; address?: string | null; latitude?: number | null; longitude?: number | null; radiusKm?: number | null }) =>
    api.post<Record<string, unknown>>('/trainer/editTrainerService', body),
  deleteTrainerService: (id: string) =>
    api.post<Record<string, unknown>>('/trainer/deleteTrainerService', { id }),
  serviceAreaOnOff: (id: string, isActive: boolean) =>
    api.post<Record<string, unknown>>('/trainer/serviceAreaOnOff', { id, isActive }),

  trainerCertificateList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; trainerCertificateList?: unknown[]; list?: unknown[] }>('/trainer/trainerCertificateList', body ?? {}),
  addTrainerCertificate: (body: { name: string; issuingOrganization?: string | null; issuedAt?: string | null; credentialId?: string | null; documentUrl?: string | null }) =>
    api.post<Record<string, unknown>>('/trainer/addTrainerCertificate', body),
  editTrainerCertificate: (body: { id: string; name?: string; issuingOrganization?: string | null; issuedAt?: string | null; credentialId?: string | null; documentUrl?: string | null }) =>
    api.post<Record<string, unknown>>('/trainer/editTrainerCertificate', body),
  deleteCertification: (id: string) =>
    api.post<Record<string, unknown>>('/trainer/deleteCertification', { id }),

  viewTrainerBankDetails: (body?: Record<string, unknown>) =>
    api.post<Record<string, unknown>>('/trainer/viewTrainerBankDetails', body ?? {}),
  addTrainerBankDetails: (body: { accountHolderName: string; bankName?: string | null; last4?: string | null; routingLast4?: string | null }) =>
    api.post<Record<string, unknown>>('/trainer/addTrainerBankDetails', body),

  getNotificationList: () =>
    api.post<Record<string, unknown>>('/trainer/GetNotificationList', {}),
  getNotificationFlag: () =>
    api.post<Record<string, unknown>>('/trainer/GetNotificationFlag', {}),
  updateNotificationReadStatus: (notificationId?: string) =>
    api.post<Record<string, unknown>>('/trainer/UpdateNotificationReadStatus', { notificationId }),
  deleteNotification: (notificationId: string) =>
    api.post<Record<string, unknown>>('/trainer/deleteNotification', { notificationId }),
  readAllNotification: () =>
    api.post<Record<string, unknown>>('/trainer/ReadAllNotification', {}),

  faqlist: () =>
    api.post<{ mtype: string; faqlist?: { id: string; question: string; answer: string }[]; list?: unknown[] }>('/trainer/faqlist', {}),
  fetchContactLink: () =>
    api.post<{ mtype: string; contactEmail?: string; contactLink?: string }>('/trainer/fetchContactLink', {}),
  raiseSupport: (body: { subject?: string; message?: string }) =>
    api.post<Record<string, unknown>>('/trainer/raiseSupport', body),
};
