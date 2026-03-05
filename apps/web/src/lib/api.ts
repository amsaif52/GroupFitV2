import { createAxiosApiClient } from '@groupfit/shared';
import { getStoredToken, clearStoredToken } from './auth';

const baseURL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
    : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

/** Axios instance for calling the API. Use api.get(), api.post(), etc. */
export const api = createAxiosApiClient({
  baseURL,
  getAccessToken: getStoredToken,
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      clearStoredToken();
      window.location.href = '/login';
    }
  },
});

/** Customer division: POST /api/customer/<action>. */
export const customerApi = {
  viewProfile: () => api.post<{ mtype: string; name?: string; emailid?: string; phone?: string; locale?: string }>('/customer/viewProfile', {}),
  editProfile: (body: { name?: string; phone?: string; locale?: string }) =>
    api.post<{ mtype: string; message?: string }>('/customer/editProfile', body),
  paymentList: () => api.post<{ mtype: string; list?: unknown[] }>('/customer/PaymentList', {}),

  customerSessionList: (body: { status?: string }) =>
    api.post<{ mtype: string; customerSessionList?: unknown[] }>('/customer/customerSessionList', body),
  customerSessionCompletedList: (body: { status?: string }) =>
    api.post<{ mtype: string; customerSessionCompletedList?: unknown[] }>('/customer/customerSessionCompletedList', body),
  todaysessionlist: () =>
    api.post<{ mtype: string; todaysessionlist?: unknown[] }>('/customer/todaysessionlist', {}),

  fetchAllActivity: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; activityList?: unknown[] }>('/customer/fetchAllActivity', body ?? {}),
  fetchFavouriteActivities: () =>
    api.post<{ mtype: string; favouriteActivities?: unknown[] }>('/customer/fetchFavouriteActivities', {}),
  addFavouriteActivity: (activityCode: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/addFavouriteActivity', { activityCode }),
  removeFavouriteActivity: (activityCode: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/removeFavouriteActivity', { activityCode }),
  GetTrendingActivities: () =>
    api.post<{ mtype: string; trendingActivities?: unknown[] }>('/customer/GetTrendingActivities', {}),

  fetchFavouriteTrainers: () =>
    api.post<{ mtype: string; favouriteTrainersList?: unknown[] }>('/customer/fetchFavouriteTrainers', {}),
  topratedTrainersList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; topratedTrainersList?: unknown[] }>('/customer/topratedTrainersList', body ?? {}),
  favouriteTrainersList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; favouriteTrainersList?: unknown[] }>('/customer/favouriteTrainersList', body ?? {}),
  addFavouriteTrainer: (trainerId: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/addFavouriteTrainer', { trainerId }),
  deleteFavouriteTrainer: (trainerId: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/deletefavouriteTrainer', { trainerId }),
  fetchSessionDetails: (sessionId: string) =>
    api.post<{ mtype: string; sessionId?: string; sessionName?: string; trainerName?: string; scheduledAt?: string; status?: string }>('/customer/fetchSessionDetails', { sessionId }),
  cancelSession: (sessionId: string, cancelReason?: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/cancelSession', { sessionId, cancelReason }),
  rescheduleSession: (sessionId: string, newScheduledAt: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/rescheduleSession', { sessionId, newScheduledAt }),
  addSession: (trainerId: string, scheduledAt: string, activityName?: string) =>
    api.post<{ mtype: string; message?: string; sessionId?: string }>('/customer/addSession', { trainerId, scheduledAt, activityName }),
  viewActivity: (activityId: string) =>
    api.post<{ mtype: string; id?: string; activityName?: string; name?: string; description?: string }>('/customer/viewActivity', { activityId }),
  viewTrainer: (trainerId: string) =>
    api.post<{ mtype: string; id?: string; trainerName?: string; name?: string; email?: string; phone?: string }>('/customer/viewTrainer', { trainerId }),

  getNotificationList: () =>
    api.post<{ mtype: string; notificationList?: { id: string; title: string; body?: string; read: boolean; createdAt: string }[] }>('/customer/GetNotificationList', {}),
  getNotificationFlag: () =>
    api.post<{ mtype: string; unreadCount?: number }>('/customer/GetNotificationFlag', {}),
  updateNotificationReadStatus: (notificationId?: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/UpdateNotificationReadStatus', { notificationId }),
  deleteNotification: (notificationId: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/deleteNotification', { notificationId }),
};

/** Trainer division: POST /api/trainer/<action>. */
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
    api.post<{ mtype: string; sessionId?: string; sessionName?: string; customerName?: string; customerEmail?: string; scheduledAt?: string; status?: string }>('/trainer/fetchSessionDetails', { sessionId }),
  cancelSession: (sessionId: string) =>
    api.post<{ mtype: string; message?: string }>('/trainer/cancelSession', { sessionId }),
  rescheduleSession: (sessionId: string, newScheduledAt: string) =>
    api.post<{ mtype: string; message?: string }>('/trainer/rescheduleSession', { sessionId, newScheduledAt }),

  currentEarning: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; currentEarning?: unknown }>('/trainer/currentEarning', body ?? {}),
  earningStats: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; earningStats?: unknown }>('/trainer/earningStats', body ?? {}),
  referralSummary: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; referralSummary?: unknown }>('/trainer/referralSummary', body ?? {}),

  viewServiceArea: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; address?: string; city?: string; country?: string }>('/trainer/viewServiceArea', body ?? {}),
  viewListAllAvailabilty: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; availabilityList?: unknown[] }>('/trainer/viewListAllAvailabilty', body ?? {}),
  trainerActivityList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; trainerActivityList?: unknown[] }>('/trainer/trainerActivityList', body ?? {}),
};

/** Admin division: POST /api/admin/<action>. */
export const adminApi = {
  dashboard: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; data?: unknown }>('/admin/dashboard', body ?? {}),
  usersList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/usersList', body ?? {}),
  userDetail: (userId: string) =>
    api.post<{ mtype: string; id?: string; email?: string; name?: string; role?: string; createdAt?: string }>('/admin/userDetail', { userId }),
  trainerList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/trainerList', body ?? {}),
  customerList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/customerList', body ?? {}),
  sessionList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/sessionList', body ?? {}),
  sessionDetail: (sessionId: string) =>
    api.post<{ mtype: string; id?: string; customerName?: string; trainerName?: string; scheduledAt?: string; status?: string; amountCents?: number }>('/admin/sessionDetail', { sessionId }),
  supportList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/supportList', body ?? {}),
  supportDetail: (supportId: string) =>
    api.post<Record<string, unknown>>('/admin/supportDetail', { supportId }),
  discountList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/discountList', body ?? {}),
  discountDetail: (discountId: string) =>
    api.post<Record<string, unknown>>('/admin/discountDetail', { discountId }),
  createDiscount: (body: { code: string; type: string; value: number; validFrom?: string | null; validTo?: string | null }) =>
    api.post<Record<string, unknown>>('/admin/createDiscount', body),
  updateDiscount: (body: { id: string; code?: string; type?: string; value?: number; validFrom?: string | null; validTo?: string | null }) =>
    api.post<Record<string, unknown>>('/admin/updateDiscount', body),
  deleteDiscount: (id: string) =>
    api.post<Record<string, unknown>>('/admin/deleteDiscount', { id }),
  earningReport: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; data?: unknown }>('/admin/earningReport', body ?? {}),

  activityList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: { id: string; code: string; name: string; description?: string }[] }>('/admin/activityList', body ?? {}),
  createActivity: (code: string, name: string, description?: string) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/admin/createActivity', { code, name, description }),
  updateActivity: (id: string, code?: string, name?: string, description?: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateActivity', { id, code, name, description }),
  deleteActivity: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/deleteActivity', { id }),

  updateUserRole: (userId: string, role: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateUserRole', { userId, role }),
  deleteAccount: (userId: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/DeleteAccount', { userId }),

  faqList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: { id: string; question: string; answer: string; sortOrder?: number }[] }>('/admin/faqList', body ?? {}),
  createFaq: (question: string, answer: string, sortOrder?: number) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/admin/createFaq', { question, answer, sortOrder }),
  updateFaq: (id: string, question?: string, answer?: string, sortOrder?: number) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateFaq', { id, question, answer, sortOrder }),
  deleteFaq: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/deleteFaq', { id }),

  contactUs: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; contactEmail?: string }>('/admin/contactUs', body ?? {}),
  updateContactUs: (contactEmail: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateContactUs', { contactEmail }),

  getCustomizeDashboard: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; data?: Record<string, unknown> }>('/admin/getCustomizeDashboard', body ?? {}),
  setCustomizeDashboard: (data: Record<string, unknown>) =>
    api.post<{ mtype: string; message?: string }>('/admin/setCustomizeDashboard', { data }),
};

