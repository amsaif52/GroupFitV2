import { createAxiosApiClient } from '@groupfit/shared';
import { getStoredToken } from './auth';

const baseURL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api');

/**
 * Axios instance for calling the API. Use api.get(), api.post(), etc.
 * Session is kept until the user explicitly logs out (no 401-triggered logout).
 */
export const api = createAxiosApiClient({
  baseURL,
  getAccessToken: getStoredToken,
  // Intentionally no onUnauthorized: we do not force logout on 401.
});

/** Customer division: POST /api/customer/<action>. */
export const customerApi = {
  viewProfile: () =>
    api.post<{
      mtype: string;
      name?: string;
      emailid?: string;
      phone?: string;
      locale?: string;
      countryCode?: string;
    }>('/customer/viewProfile', {}),
  /** Create Stripe PaymentIntent; returns clientSecret for Payment Element. */
  paymentSheet: (body: { amountCents?: number; currency?: string }) =>
    api.post<{ mtype: string; clientSecret?: string | null }>('/customer/PaymentSheet', body),
  paymentStatus: (paymentIntentId: string) =>
    api.post<{ mtype: string; status?: string }>('/customer/PaymentStatus', { paymentIntentId }),
  sessionPayment: (body: { sessionId?: string; paymentIntentId?: string }) =>
    api.post<{ mtype: string; paid?: boolean }>('/customer/sessionPayment', body),
  editProfile: (body: { name?: string; phone?: string; locale?: string; countryCode?: string }) =>
    api.post<{ mtype: string; message?: string }>('/customer/editProfile', body),
  paymentList: () => api.post<{ mtype: string; list?: unknown[] }>('/customer/PaymentList', {}),

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

  fetchAllCategoryActivities: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; activityList?: unknown[] }>('/customer/fetchAllActivity', body ?? {}),
  fetchAllActivity: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; customerActivityList?: unknown[] }>(
      '/customer/fetchactivitytype',
      body ?? {}
    ),
  activitiesAtLocation: (body: { latitude?: number; longitude?: number; radiusKm?: number }) =>
    api.post<{ mtype: string; activityList?: unknown[] }>('/customer/activitiesAtLocation', body),
  fetchFavouriteActivities: () =>
    api.post<{ mtype: string; favouriteActivities?: unknown[] }>(
      '/customer/fetchFavouriteActivities',
      {}
    ),
  getToastActivitiesDisclaimer: () =>
    api.get<{ mtype: string; seen?: boolean }>('/customer/toast/activities-disclaimer'),
  setToastActivitiesDisclaimer: () =>
    api.post<{ mtype: string }>('/customer/toast/activities-disclaimer', {}),
  addFavouriteActivity: (activityCode: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/addFavouriteActivity', {
      activityCode,
    }),
  removeFavouriteActivity: (activityCode: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/removeFavouriteActivity', {
      activityCode,
    }),
  GetTrendingActivities: () =>
    api.post<{ mtype: string; trendingActivities?: unknown[] }>(
      '/customer/GetTrendingActivities',
      {}
    ),

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
    api.post<{ mtype: string; message?: string }>('/customer/addFavouriteTrainer', { trainerId }),
  deleteFavouriteTrainer: (trainerId: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/deletefavouriteTrainer', {
      trainerId,
    }),
  fetchSessionDetails: (sessionId: string) =>
    api.post<{
      mtype: string;
      sessionId?: string;
      sessionName?: string;
      trainerName?: string;
      scheduledAt?: string;
      status?: string;
    }>('/customer/fetchSessionDetails', { sessionId }),
  cancelSession: (sessionId: string, cancelReason?: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/cancelSession', {
      sessionId,
      cancelReason,
    }),
  rescheduleSession: (sessionId: string, newScheduledAt: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/rescheduleSession', {
      sessionId,
      newScheduledAt,
    }),
  addSession: (trainerId: string, scheduledAt: string, activityName?: string) =>
    api.post<{ mtype: string; message?: string; sessionId?: string }>('/customer/addSession', {
      trainerId,
      scheduledAt,
      activityName,
    }),
  viewActivity: (activityId: string) =>
    api.post<{
      mtype: string;
      id?: string;
      activityName?: string;
      name?: string;
      description?: string;
    }>('/customer/viewActivity', { activityId }),
  viewTrainer: (trainerId: string) =>
    api.post<{
      mtype: string;
      id?: string;
      trainerName?: string;
      name?: string;
      email?: string;
      phone?: string;
    }>('/customer/viewTrainer', { trainerId }),

  customerServiceList: () =>
    api.post<{
      mtype: string;
      customerServiceList?: {
        id: string;
        label: string;
        address?: string;
        latitude?: number;
        longitude?: number;
        createdAt: string;
      }[];
    }>('/customer/customerServiceList', {}),
  addCustomerService: (body: {
    label: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }) =>
    api.post<{ mtype: string; id?: string; message?: string }>(
      '/customer/addCustomerService',
      body
    ),
  viewServiceArea: (locationId: string) =>
    api.post<{
      mtype: string;
      id?: string;
      label?: string;
      address?: string;
      latitude?: number;
      longitude?: string;
    }>('/customer/viewServiceArea', { locationId }),
  editCustomerService: (body: {
    locationId: string;
    label?: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }) => api.post<{ mtype: string; message?: string }>('/customer/editCustomerService', body),
  deleteCustomerService: (locationId: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/deleteCustomerService', {
      locationId,
    }),

  fetchallgroupslist: () =>
    api.post<{
      mtype: string;
      list?: {
        id: string;
        name: string;
        ownerId: string;
        memberCount?: number;
        createdAt: string;
      }[];
    }>('/customer/fetchallgroupslist', {}),
  addgroupname: (name: string) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/customer/addgroupname', { name }),
  addgroupmember: (groupId: string, userId: string) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/customer/addgroupmember', {
      groupId,
      userId,
    }),
  fetchgroupMembers: (groupId: string) =>
    api.post<{
      mtype: string;
      list?: {
        id: string;
        userId: string;
        userName?: string;
        userEmail?: string;
        createdAt: string;
      }[];
    }>('/customer/fetchgroupMembers', { groupId }),
  updategroupmember: (groupId: string, memberId: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/updategroupmember', {
      groupId,
      memberId,
    }),
  deletegrouplist: (groupId: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/deletegrouplist', { groupId }),
  fetchSoloMembers: (groupId: string) =>
    api.post<{ mtype: string; list?: { id: string; name?: string; email: string }[] }>(
      '/customer/fetchSoloMembers',
      { groupId }
    ),

  ReferralList: () =>
    api.post<{
      mtype: string;
      ReferralList?: {
        id: string;
        referredUserId: string;
        referredUserName?: string;
        referredUserEmail?: string;
        referredUserJoinedAt?: string;
        createdAt: string;
      }[];
    }>('/customer/ReferralList', {}),
  referraldetails: (referralId: string) =>
    api.post<{
      mtype: string;
      id?: string;
      referredUserId?: string;
      referredUserName?: string;
      referredUserEmail?: string;
      referredUserJoinedAt?: string;
      createdAt?: string;
    }>('/customer/referraldetails', { referralId }),

  getNotificationList: () =>
    api.post<{
      mtype: string;
      notificationList?: {
        id: string;
        title: string;
        body?: string;
        read: boolean;
        createdAt: string;
      }[];
    }>('/customer/GetNotificationList', {}),
  getNotificationFlag: () =>
    api.post<{ mtype: string; unreadCount?: number }>('/customer/GetNotificationFlag', {}),
  updateNotificationReadStatus: (notificationId?: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/UpdateNotificationReadStatus', {
      notificationId,
    }),
  deleteNotification: (notificationId: string) =>
    api.post<{ mtype: string; message?: string }>('/customer/deleteNotification', {
      notificationId,
    }),

  faqlist: () =>
    api.post<{ mtype: string; faqlist?: { id: string; question: string; answer: string }[] }>(
      '/customer/faqlist',
      {}
    ),
  fetchContactLink: () =>
    api.post<{ mtype: string; contactEmail?: string; contactLink?: string }>(
      '/customer/fetchContactLink',
      {}
    ),
  raiseSupport: (body: { subject?: string; message?: string }) =>
    api.post<{ mtype: string; message?: string }>('/customer/raiseSupport', body),
  /** Assistant chat (JWT). Body: message, conversationId (optional). Returns message + conversationId. */
  chat: (body: { message: string; conversationId?: string }) =>
    api.post<{ message: string; conversationId: string }>('/customer/chat', body),
};

/** Trainer division: POST /api/trainer/<action>. */
export const trainerApi = {
  viewProfile: () =>
    api.post<{
      mtype: string;
      name?: string;
      emailid?: string;
      phone?: string;
      locale?: string;
      countryCode?: string | null;
      state?: string | null;
      canSetOwnPrice?: boolean;
    }>('/trainer/viewProfile', {}),
  editProfile: (body: {
    name?: string;
    phone?: string;
    locale?: string;
    countryCode?: string;
    state?: string;
  }) => api.post<{ mtype: string; message?: string }>('/trainer/editProfile', body),

  trainerSessionList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; trainerSessionList?: unknown[] }>(
      '/trainer/trainerSessionList',
      body ?? {}
    ),
  trainerSessionNewList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; trainerSessionNewList?: unknown[] }>(
      '/trainer/trainerSessionNewList',
      body ?? {}
    ),
  trainerSessionCompletedList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; trainerSessionCompletedList?: unknown[] }>(
      '/trainer/trainerSessionCompletedList',
      body ?? {}
    ),
  todaySession: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; todaySession?: unknown[] }>('/trainer/todaySession', body ?? {}),
  fetchSessionDetails: (sessionId: string) =>
    api.post<{
      mtype: string;
      sessionId?: string;
      sessionName?: string;
      customerName?: string;
      customerEmail?: string;
      scheduledAt?: string;
      status?: string;
    }>('/trainer/fetchSessionDetails', { sessionId }),
  cancelSession: (sessionId: string) =>
    api.post<{ mtype: string; message?: string }>('/trainer/cancelSession', { sessionId }),
  rescheduleSession: (sessionId: string, newScheduledAt: string) =>
    api.post<{ mtype: string; message?: string }>('/trainer/rescheduleSession', {
      sessionId,
      newScheduledAt,
    }),
  /** Share trainer location for a session (allowed only within 30 mins before start). */
  updateSessionLocation: (sessionId: string, latitude: number, longitude: number) =>
    api.post<{ mtype: string; message?: string }>('/trainer/updateSessionLocation', {
      sessionId,
      latitude,
      longitude,
    }),

  currentEarning: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; currentEarning?: unknown }>('/trainer/currentEarning', body ?? {}),
  earningStats: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; earningStats?: unknown }>('/trainer/earningStats', body ?? {}),
  referralSummary: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; referralSummary?: unknown }>('/trainer/referralSummary', body ?? {}),

  viewServiceArea: (body?: { id?: string }) =>
    api.post<{
      mtype: string;
      trainerServiceList?: {
        id: string;
        label: string;
        address?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        radiusKm?: number | null;
        isActive: boolean;
        createdAt: string;
      }[];
      id?: string;
      label?: string;
      address?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      radiusKm?: number | null;
      isActive?: boolean;
    }>('/trainer/viewServiceArea', body ?? {}),
  trainerServiceList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      trainerServiceList?: {
        id: string;
        label: string;
        address?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        radiusKm?: number | null;
        isActive: boolean;
        createdAt: string;
      }[];
    }>('/trainer/trainerServiceList', body ?? {}),
  addTrainerService: (body: {
    label: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    radiusKm?: number | null;
  }) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/trainer/addTrainerService', body),
  editTrainerService: (body: {
    id: string;
    label?: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    radiusKm?: number | null;
  }) => api.post<{ mtype: string; message?: string }>('/trainer/editTrainerService', body),
  deleteTrainerService: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/trainer/deleteTrainerService', { id }),
  serviceAreaOnOff: (id: string, isActive?: boolean) =>
    api.post<{ mtype: string; isActive?: boolean; message?: string }>('/trainer/serviceAreaOnOff', {
      id,
      isActive,
    }),
  viewListAllAvailabilty: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      availabilityList?: {
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        createdAt: string;
      }[];
    }>('/trainer/viewListAllAvailabilty', body ?? {}),
  trainerAvailabilityList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      availabilityList?: {
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        createdAt: string;
      }[];
    }>('/trainer/trainerAvailabilityList', body ?? {}),
  addTrainerAvailability: (body: { dayOfWeek: number; startTime: string; endTime: string }) =>
    api.post<{ mtype: string; id?: string; message?: string }>(
      '/trainer/addTrainerAvailability',
      body
    ),
  editTrainerAvailability: (body: {
    id: string;
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
  }) => api.post<{ mtype: string; message?: string }>('/trainer/editTrainerAvailability', body),
  viewAvailabilty: (id?: string) =>
    api.post<{
      mtype: string;
      availabilityList?: { id: string; dayOfWeek: number; startTime: string; endTime: string }[];
      id?: string;
      startTime?: string;
      endTime?: string;
    }>('/trainer/viewAvailabilty', id != null ? { id } : {}),
  deleteAvaibilitySlot: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/trainer/deleteAvaibilitySlot', { id }),
  trainerActivityList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      trainerActivityList?: {
        id: string;
        trainerId: string;
        activityCode: string;
        activityName?: string;
        activityDescription?: string;
        defaultPriceCents?: number;
        priceCents?: number;
        canSetOwnPrice?: boolean;
        effectivePriceCents?: number;
        createdAt: string;
      }[];
      canSetOwnPrice?: boolean;
    }>('/trainer/trainerActivityList', body ?? {}),
  allActivityList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      allActivityList?: {
        id: string;
        code: string;
        name: string;
        description?: string;
        defaultPriceCents?: number;
        createdAt: string;
      }[];
    }>('/trainer/allActivityList', body ?? {}),
  addTrainerActivity: (activityCode: string, priceCents?: number) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/trainer/addTrainerActivity', {
      activityCode,
      priceCents,
    }),
  editTrainerActivity: (id: string, activityCode?: string, priceCents?: number | null) =>
    api.post<{ mtype: string; message?: string }>('/trainer/editTrainerActivity', {
      id,
      activityCode,
      priceCents,
    }),
  viewActivity: (id: string) =>
    api.post<{
      mtype: string;
      id?: string;
      activityCode?: string;
      activityName?: string;
      activityDescription?: string;
    }>('/trainer/viewActivity', { id }),
  deleteActivity: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/trainer/deleteActivity', { id }),

  trainerCertificateList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      trainerCertificateList?: {
        id: string;
        name: string;
        issuingOrganization?: string | null;
        issuedAt?: string | null;
        credentialId?: string | null;
        documentUrl?: string | null;
        createdAt: string;
      }[];
    }>('/trainer/trainerCertificateList', body ?? {}),
  addTrainerCertificate: (body: {
    name: string;
    issuingOrganization?: string | null;
    issuedAt?: string | null;
    credentialId?: string | null;
    documentUrl?: string | null;
  }) =>
    api.post<{ mtype: string; id?: string; message?: string }>(
      '/trainer/addTrainerCertificate',
      body
    ),
  editTrainerCertificate: (body: {
    id: string;
    name?: string;
    issuingOrganization?: string | null;
    issuedAt?: string | null;
    credentialId?: string | null;
    documentUrl?: string | null;
  }) => api.post<{ mtype: string; message?: string }>('/trainer/editTrainerCertificate', body),
  viewCertification: (id: string) =>
    api.post<{
      mtype: string;
      id?: string;
      name?: string;
      issuingOrganization?: string | null;
      issuedAt?: string | null;
      credentialId?: string | null;
      documentUrl?: string | null;
    }>('/trainer/viewCertification', { id }),
  deleteCertification: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/trainer/deleteCertification', { id }),

  viewTrainerBankDetails: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      id?: string;
      accountHolderName?: string;
      bankName?: string | null;
      last4?: string;
      routingLast4?: string | null;
      createdAt?: string;
    }>('/trainer/viewTrainerBankDetails', body ?? {}),
  addTrainerBankDetails: (body: {
    accountHolderName: string;
    bankName?: string | null;
    last4?: string | null;
    routingLast4?: string | null;
  }) => api.post<{ mtype: string; message?: string }>('/trainer/addTrainerBankDetails', body),

  FetchReviews: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      FetchReviews?: {
        id: string;
        trainerId: string;
        customerId: string;
        customerName?: string;
        sessionId?: string | null;
        rating: number;
        comment?: string | null;
        createdAt: string;
      }[];
    }>('/trainer/FetchReviews', body ?? {}),
  getTrainerAvgRating: (body?: { trainerId?: string }) =>
    api.post<{ mtype: string; rating?: number; reviewCount?: number }>(
      '/trainer/getTrainerAvgRating',
      body ?? {}
    ),
  raiseSupport: (body: { subject?: string; message?: string }) =>
    api.post<{ mtype: string; message?: string }>('/trainer/raiseSupport', body),
  /** Trainer assistant chat (JWT; trainer or admin only). Body: message, conversationId (optional). */
  chat: (body: { message: string; conversationId?: string }) =>
    api.post<{ message: string; conversationId: string }>('/trainer/chat', body),
};

/** Admin division: POST /api/admin/<action>. */
export const adminApi = {
  dashboard: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; data?: unknown }>('/admin/dashboard', body ?? {}),
  usersList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/usersList', body ?? {}),
  userDetail: (userId: string) =>
    api.post<{
      mtype: string;
      id?: string;
      email?: string;
      name?: string;
      role?: string;
      createdAt?: string;
      trainerCanSetOwnPrice?: boolean;
    }>('/admin/userDetail', { userId }),
  trainerList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/trainerList', body ?? {}),
  customerList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/customerList', body ?? {}),
  sessionList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/sessionList', body ?? {}),
  sessionDetail: (sessionId: string) =>
    api.post<{
      mtype: string;
      id?: string;
      customerName?: string;
      trainerName?: string;
      scheduledAt?: string;
      status?: string;
      amountCents?: number;
    }>('/admin/sessionDetail', { sessionId }),
  supportList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/supportList', body ?? {}),
  supportDetail: (supportId: string) =>
    api.post<Record<string, unknown>>('/admin/supportDetail', { supportId }),
  discountList: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; list?: unknown[] }>('/admin/discountList', body ?? {}),
  discountDetail: (discountId: string) =>
    api.post<Record<string, unknown>>('/admin/discountDetail', { discountId }),
  createDiscount: (body: {
    code: string;
    type: string;
    value: number;
    validFrom?: string | null;
    validTo?: string | null;
    isActive?: boolean;
    allowedDays?: string | null;
    singleUsePerCustomer?: boolean;
  }) => api.post<Record<string, unknown>>('/admin/createDiscount', body),
  updateDiscount: (body: {
    id: string;
    code?: string;
    type?: string;
    value?: number;
    validFrom?: string | null;
    validTo?: string | null;
    isActive?: boolean;
    allowedDays?: string | null;
    singleUsePerCustomer?: boolean;
  }) => api.post<Record<string, unknown>>('/admin/updateDiscount', body),
  deleteDiscount: (id: string) =>
    api.post<Record<string, unknown>>('/admin/deleteDiscount', { id }),
  voucherListByDiscount: (discountId: string) =>
    api.post<{
      mtype: string;
      discountCode?: string;
      list?: {
        id: string;
        code: string;
        recipientName?: string | null;
        recipientOrg?: string | null;
        createdAt: string;
        usedAt?: string | null;
      }[];
    }>('/admin/voucherListByDiscount', { discountId }),
  createVoucher: (body: {
    discountId: string;
    recipientName?: string | null;
    recipientOrg?: string | null;
  }) =>
    api.post<{
      mtype: string;
      id?: string;
      code?: string;
      createdAt?: string;
      message?: string;
    }>('/admin/createVoucher', body),
  earningReport: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; data?: unknown }>('/admin/earningReport', body ?? {}),

  activityList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      list?: {
        id: string;
        code: string;
        name: string;
        description?: string;
        defaultPriceCents?: number;
        logoUrl?: string;
        activityGroup?: string;
        trainerSharePercent?: number;
        status?: string;
        createdBy?: string;
        createdAt?: string;
        updatedBy?: string;
        updatedAt?: string;
      }[];
    }>('/admin/activityList', body ?? {}),
  createActivity: (body: {
    code: string;
    name: string;
    description?: string;
    defaultPriceCents?: number;
    logoUrl?: string;
    activityGroup?: string;
    trainerSharePercent?: number | null;
    status?: string | null;
  }) => api.post<{ mtype: string; id?: string; message?: string }>('/admin/createActivity', body),
  updateActivity: (body: {
    id: string;
    code?: string;
    name?: string;
    description?: string;
    defaultPriceCents?: number | null;
    logoUrl?: string | null;
    activityGroup?: string | null;
    trainerSharePercent?: number | null;
    status?: string | null;
  }) => api.post<{ mtype: string; message?: string }>('/admin/updateActivity', body),
  deleteActivity: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/deleteActivity', { id }),

  updateUserRole: (userId: string, role: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateUserRole', { userId, role }),
  setTrainerCanSetOwnPrice: (trainerId: string, canSetOwnPrice: boolean) =>
    api.post<{ mtype: string; message?: string }>('/admin/setTrainerCanSetOwnPrice', {
      trainerId,
      canSetOwnPrice,
    }),
  deleteAccount: (userId: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/DeleteAccount', { userId }),

  createCustomer: (body: { email: string; name?: string; phone?: string }) =>
    api.post<{ mtype: string; message?: string; id?: string }>('/admin/createCustomer', body),
  updateCustomer: (customerId: string, body: { name?: string; phone?: string }) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateCustomer', {
      customerId,
      ...body,
    }),
  setUserActive: (userId: string, isActive: boolean) =>
    api.post<{ mtype: string; message?: string }>('/admin/setUserActive', { userId, isActive }),

  createTrainer: (body: { email: string; name?: string; phone?: string }) =>
    api.post<{ mtype: string; message?: string; id?: string }>('/admin/createTrainer', body),
  updateTrainer: (trainerId: string, body: { name?: string; phone?: string }) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateTrainer', {
      trainerId,
      ...body,
    }),

  trainerActivityList: (trainerId: string) =>
    api.post<{
      mtype: string;
      message?: string;
      list?: {
        id: string;
        activityCode: string;
        activityName: string;
        defaultPriceCents?: number;
        priceCents?: number;
        canSetOwnPrice?: boolean;
        effectivePriceCents?: number;
        createdAt?: string;
      }[];
      canSetOwnPrice?: boolean;
    }>('/admin/trainerActivityList', { trainerId }),
  addTrainerActivity: (trainerId: string, activityCode: string, priceCents?: number | null) =>
    api.post<{ mtype: string; message?: string; id?: string }>('/admin/addTrainerActivity', {
      trainerId,
      activityCode,
      priceCents,
    }),
  setTrainerActivityPrice: (trainerId: string, activityCode: string, priceCents: number | null) =>
    api.post<{ mtype: string; message?: string }>('/admin/setTrainerActivityPrice', {
      trainerId,
      activityCode,
      priceCents,
    }),

  faqList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      list?: {
        id: string;
        question: string;
        answer: string;
        sortOrder?: number;
        role?: string | null;
        updatedAt?: string;
      }[];
    }>('/admin/faqList', body ?? {}),
  createFaq: (question: string, answer: string, sortOrder?: number, role?: string) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/admin/createFaq', {
      question,
      answer,
      sortOrder,
      role,
    }),
  updateFaq: (id: string, question?: string, answer?: string, sortOrder?: number, role?: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateFaq', {
      id,
      question,
      answer,
      sortOrder,
      role,
    }),
  deleteFaq: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/deleteFaq', { id }),

  miscList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      list?: { id: string; name: string; type: string; updatedAt?: string }[];
    }>('/admin/miscList', body ?? {}),
  createMisc: (name: string, type: string) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/admin/createMisc', {
      name,
      type,
    }),
  updateMisc: (id: string, name?: string, type?: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateMisc', { id, name, type }),
  deleteMisc: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/deleteMisc', { id }),

  countryList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      list?: {
        id: string;
        name: string;
        isdCode: string;
        updatedAt?: string;
        updatedBy?: { name: string | null };
      }[];
    }>('/admin/countryList', body ?? {}),
  createCountry: (body: { name: string; isdCode: string }) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/admin/createCountry', body),
  updateCountry: (id: string, body: { name?: string; isdCode?: string }) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateCountry', { id, ...body }),
  deleteCountry: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/deleteCountry', { id }),

  languageList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      list?: {
        id: string;
        name: string;
        updatedAt?: string;
        updatedBy?: { name: string | null };
      }[];
    }>('/admin/languageList', body ?? {}),
  createLanguage: (body: { name: string }) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/admin/createLanguage', body),
  updateLanguage: (id: string, body: { name?: string }) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateLanguage', { id, ...body }),
  deleteLanguage: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/deleteLanguage', { id }),

  stateList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      list?: {
        id: string;
        name: string;
        countryId?: string | null;
        updatedAt?: string;
        updatedBy?: { name: string | null };
        country?: { name: string } | null;
      }[];
    }>('/admin/stateList', body ?? {}),
  createState: (body: { name: string; countryId?: string }) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/admin/createState', body),
  updateState: (id: string, body: { name?: string; countryId?: string }) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateState', { id, ...body }),
  deleteState: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/deleteState', { id }),

  contactLinkList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      list?: {
        id: string;
        name: string;
        link: string;
        iconUrl?: string | null;
        updatedAt?: string;
        updatedBy?: { name: string | null };
      }[];
    }>('/admin/contactLinkList', body ?? {}),
  createContactLink: (body: { name: string; link: string; iconUrl?: string }) =>
    api.post<{ mtype: string; id?: string; message?: string }>('/admin/createContactLink', body),
  updateContactLink: (id: string, body: { name?: string; link?: string; iconUrl?: string }) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateContactLink', { id, ...body }),
  deleteContactLink: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/deleteContactLink', { id }),

  activityCategoryList: (body?: Record<string, unknown>) =>
    api.post<{
      mtype: string;
      list?: {
        id: string;
        name: string;
        iconUrl?: string | null;
        updatedAt?: string;
        updatedBy?: { name: string | null };
      }[];
    }>('/admin/activityCategoryList', body ?? {}),
  createActivityCategory: (body: { name: string; iconUrl?: string }) =>
    api.post<{ mtype: string; id?: string; message?: string }>(
      '/admin/createActivityCategory',
      body
    ),
  updateActivityCategory: (id: string, body: { name?: string; iconUrl?: string }) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateActivityCategory', { id, ...body }),
  deleteActivityCategory: (id: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/deleteActivityCategory', { id }),

  contactUs: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; contactEmail?: string }>('/admin/contactUs', body ?? {}),
  updateContactUs: (contactEmail: string) =>
    api.post<{ mtype: string; message?: string }>('/admin/updateContactUs', { contactEmail }),

  getCustomizeDashboard: (body?: Record<string, unknown>) =>
    api.post<{ mtype: string; data?: Record<string, unknown> }>(
      '/admin/getCustomizeDashboard',
      body ?? {}
    ),
  setCustomizeDashboard: (data: Record<string, unknown>) =>
    api.post<{ mtype: string; message?: string }>('/admin/setCustomizeDashboard', { data }),
};
