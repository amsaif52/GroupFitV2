# API mapping: Legacy C# → NestJS GroupFitV2

Legacy apps called **CustomerAPI** and **TrainerApi** (and Admin). In GroupFitV2 the API runs under one NestJS app with global prefix `api`. All listed endpoints are **POST** unless noted.

**Base URL:** `https://your-domain.com/api` (or `http://localhost:3001/api` for dev).

- **Web:** Set `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:3001/api`).
- **RN (Expo):** Set `EXPO_PUBLIC_API_URL` or `extra.apiUrl` in app config to the same base (including `/api`).

**Auth:** Send JWT in header: `Authorization: Bearer <token>` for protected endpoints (e.g. `viewProfile`, `editProfile`).

---

## Auth (NestJS – not in C# controller names)

| Purpose   | Legacy (C#)     | NestJS (GroupFitV2)   |
|----------|------------------|------------------------|
| Login    | CustomerAPI/Login, TrainerApi/Login | `POST /api/auth/login` |
| Signup   | CustomerAPI/Signup, TrainerApi/Signup | `POST /api/auth/signup` |
| OTP send | CustomerAPI/SendOTP, TrainerApi/SendOTP | `POST /api/auth/send-otp` |
| OTP verify | CustomerAPI/otpVerification, TrainerApi/otpVerification | `POST /api/auth/verify-otp` |
| Google   | (external)       | `POST /api/auth/google` |
| Apple    | (external)       | `POST /api/auth/apple` |

---

## Customer API

Legacy base: `CustomerAPI` (e.g. `POST https://groupfitcustomer.edifybiz.com/CustomerApi/viewProfile`).  
NestJS base: `POST /api/customer/<Route>`.

| Legacy route (CustomerAPI) | NestJS | Notes |
|----------------------------|--------|--------|
| APIVersionCheck | `POST /api/customer/APIVersionCheck` | Returns version, division, timestamp |
| User_Exist | (use JWT /me or auth) | Handled by auth |
| Login | `POST /api/auth/login` | See Auth section |
| otpcreate | (internal) | Use send-otp / verify-otp |
| otpVerification | `POST /api/auth/verify-otp` | See Auth section |
| SendOTP | `POST /api/auth/send-otp` | See Auth section |
| GroupInvite | `POST /api/customer/GroupInvite` | JWT. Body: groupId, userId. Same as addgroupmember (invite = add member). |
| countryList | `POST /api/customer/countryList` | Stub / implement with reference data |
| stateList | `POST /api/customer/stateList` | Stub / implement with reference data |
| citylist | `POST /api/customer/citylist` | Stub / implement with reference data |
| Signup | `POST /api/auth/signup` | See Auth section |
| ReferralList | `POST /api/customer/ReferralList` | JWT. Returns list of people referred by current user (Referral table). Response: `ReferralList`, `list`. |
| referraldetails | `POST /api/customer/referraldetails` | JWT. Body: `referralId`. Returns one referral if referrer is current user. |
| resendOTP | `POST /api/auth/resend-otp` | See Auth section |
| contactList | `POST /api/customer/contactList` | Returns contactList, list (empty by default). |
| fetchallgroupslist | `POST /api/customer/fetchallgroupslist` | JWT. Returns groups owned by current user (id, name, ownerId, memberCount, createdAt). |
| deletegrouplist | `POST /api/customer/deletegrouplist` | JWT. Body: `groupId`. Deletes group (owner only). |
| addgroupname | `POST /api/customer/addgroupname` | JWT. Body: `name`. Creates group. |
| addgroupmember | `POST /api/customer/addgroupmember` | JWT. Body: `groupId`, `userId` (member to add). Owner only. |
| updategroupmember | `POST /api/customer/updategroupmember` | JWT. Body: `groupId`, `memberId`. Removes member (owner only). |
| fetchgroupMembers | `POST /api/customer/fetchgroupMembers` | JWT. Body: `groupId`. Returns members (owner only). |
| fetchSoloMembers | `POST /api/customer/fetchSoloMembers` | Stub |
| viewProfile | `POST /api/customer/viewProfile` | Implement with JWT + User |
| editProfile | `POST /api/customer/editProfile` | Implement with JWT + User |
| deleteProfile | `POST /api/customer/deleteProfile` | JWT. Returns success + message to contact support. |
| faqlist | `POST /api/customer/faqlist` | Returns faqlist, list (from Faq table). |
| fetchContactLink | `POST /api/customer/fetchContactLink` | Returns contactLink, contactEmail (ContactSetting key contact_email or env CONTACT_EMAIL). |
| fetchSessionDetails | `POST /api/customer/fetchSessionDetails` | Stub |
| fetchcancelreason | `POST /api/customer/fetchcancelreason` | Stub |
| rescheduleSession | `POST /api/customer/rescheduleSession` | Stub |
| cancelSession | `POST /api/customer/cancelSession` | Stub |
| raiseSupport | `POST /api/customer/raiseSupport` | JWT, body: `subject`, `message`; creates SupportTicket |
| otherConcern | `POST /api/customer/otherConcern` | JWT. Body: subject?, message. Creates SupportTicket (subject default "Other concern"). |
| avialableDiscountList | `POST /api/customer/avialableDiscountList` | Returns discounts valid now (validFrom/validTo). Response: avialableDiscountList, list. |
| checkDiscount | `POST /api/customer/checkDiscount` | Body: code. Validates code; returns valid, type, value or error. |
| addSession | `POST /api/customer/addSession` | Stub |
| SessionTrainersList | `POST /api/customer/SessionTrainersList` | Returns trainers (same shape as topratedTrainersList). No body required. |
| CheckTrainerAvailability | `POST /api/customer/CheckTrainerAvailability` | Body: `trainerId`, optional `date` (YYYY-MM-DD), optional `time` (HH:mm). Returns `available: true/false`. |
| SessionAvailabilityDateList | `POST /api/customer/SessionAvailabilityDateList` | Body: `trainerId`, optional `limit` (default 30). Returns next N dates with availability. |
| SessionAvailabilityTimeList | `POST /api/customer/SessionAvailabilityTimeList` | Body: `trainerId`, `date` (YYYY-MM-DD). Returns 30-min slots for that date. |
| viewTrainer | `POST /api/customer/viewTrainer` | Stub |
| todaysessionlist | `POST /api/customer/todaysessionlist` | Stub |
| customerSessionList | `POST /api/customer/customerSessionList` | Stub |
| customerSessionCompletedList | `POST /api/customer/customerSessionCompletedList` | Stub |
| ViewSession | `POST /api/customer/ViewSession` | JWT. Body: sessionId. Same as fetchSessionDetails. |
| fetchFavouriteTrainers | `POST /api/customer/fetchFavouriteTrainers` | JWT, returns list from DB |
| customerServiceList | `POST /api/customer/customerServiceList` | JWT. Returns customerServiceList, list (CustomerLocation for current user). |
| trainerServiceList | `POST /api/customer/trainerServiceList` | Stub |
| addCustomerService | `POST /api/customer/addCustomerService` | JWT. Body: label, address?, latitude?, longitude?. Creates CustomerLocation. |
| viewServiceArea | `POST /api/customer/viewServiceArea` | JWT. Body: locationId. Returns one location (owner only). |
| editCustomerService | `POST /api/customer/editCustomerService` | JWT. Body: locationId, label?, address?, latitude?, longitude?. |
| deleteCustomerService | `POST /api/customer/deleteCustomerService` | JWT. Body: locationId. |
| updateCustomerService | `POST /api/customer/updateCustomerService` | Stub |
| fetchactivitytype | `POST /api/customer/fetchactivitytype` | Stub |
| fetchAllActivity | `POST /api/customer/fetchAllActivity` | Stub |
| viewActivity | `POST /api/customer/viewActivity` | Stub |
| fetchFavouriteActivities | `POST /api/customer/fetchFavouriteActivities` | JWT, returns list from DB |
| addFavouriteActivity | `POST /api/customer/addFavouriteActivity` | JWT, body: `activityCode` |
| removeFavouriteActivity | `POST /api/customer/removeFavouriteActivity` | JWT, body: `activityCode` |
| GetTrendingActivities | `POST /api/customer/GetTrendingActivities` | Returns trendingActivities from Activity table (top 10) |
| customerActivityList | `POST /api/customer/customerActivityList` | Returns activity list (same shape as fetchAllActivity). Response: customerActivityList, list. |
| getTrainerAvgRating | `POST /api/customer/getTrainerAvgRating` | Body: `trainerId`. Returns `rating`, `reviewCount` from Review table. |
| fetchTrainerRelatedReviews | `POST /api/customer/fetchTrainerRelatedReviews` | Body: `trainerId`. Returns list of reviews for trainer. |
| customerreview | `POST /api/customer/customerreview` | JWT. Body: `trainerId`, `rating` (1–5), optional `comment`, `sessionId`. Creates Review. |
| reviewlist | `POST /api/customer/reviewlist` | Body: trainerId. Same as fetchTrainerRelatedReviews; response includes reviewlist. |
| topratedTrainersList | `POST /api/customer/topratedTrainersList` | Stub |
| favouriteTrainersList | `POST /api/customer/favouriteTrainersList` | JWT, returns list from DB |
| addFavouriteTrainer | `POST /api/customer/addFavouriteTrainer` | JWT, body: `trainerId` |
| deletefavouriteTrainer | `POST /api/customer/deletefavouriteTrainer` | JWT, body: `trainerId` |
| PaymentSheet | `POST /api/customer/PaymentSheet` | Body: amountCents?, currency?. Creates Stripe PaymentIntent when STRIPE_SECRET_KEY set; returns clientSecret. |
| sessionPayment | `POST /api/customer/sessionPayment` | Body: sessionId?, paymentIntentId?. Confirms/links payment; updates Session.amountCents when paid. |
| PaymentStatus | `POST /api/customer/PaymentStatus` | Body: paymentIntentId. Returns Stripe PaymentIntent status (or pending if no key). |
| PaymentList | `POST /api/customer/PaymentList` | JWT. Returns PaymentList, list (sessions with amountCents paid, from DB). |
| fileUpload | `POST /api/customer/fileUpload` | JWT. Stub: profilepath, filecode (empty). |
| GetNotificationList | `POST /api/customer/GetNotificationList` | JWT, returns list from DB |
| GetNotificationFlag | `POST /api/customer/GetNotificationFlag` | JWT, returns unreadCount |
| UpdateNotificationReadStatus | `POST /api/customer/UpdateNotificationReadStatus` | JWT, body: `notificationId?` (omit = mark all read) |
| deleteNotification | `POST /api/customer/deleteNotification` | JWT, body: `notificationId` |

Legacy GETs (GetReducedImage, BaseUrl, GetAllFilesByType, GetFilesByType, GetFilesByCode, requestLog) are not yet in NestJS; add under `/api/customer/` when needed.

---

## Trainer API

Legacy base: `TrainerApi`. NestJS base: `POST /api/trainer/<Route>`.

| Legacy route (TrainerApi) | NestJS | Notes |
|---------------------------|--------|--------|
| APIVersionCheck | `POST /api/trainer/APIVersionCheck` | Returns version, division, timestamp |
| User_Exist | (use JWT) | Handled by auth |
| saveSocialLinks | `POST /api/trainer/saveSocialLinks` | JWT. Body: facebook?, instagram?, twitter?, linkedin?. Stub success until storage. |
| getSocialLinks | `POST /api/trainer/getSocialLinks` | JWT. Returns getSocialLinks: { facebook, instagram, twitter, linkedin } (null placeholders). |
| Login | `POST /api/auth/login` | See Auth section |
| getTrainerAvgRating | `POST /api/trainer/getTrainerAvgRating` | Body: optional `trainerId`. If omitted and JWT present, uses current user. Returns `rating`, `reviewCount`. |
| getSessionAvgRating | `POST /api/trainer/getSessionAvgRating` | Body: `sessionId`. Returns avg rating and reviewCount from Review table for that session. |
| basicdetails | `POST /api/trainer/basicdetails` | JWT. Returns current trainer profile (usercode, name, emailid, role, locale, phone). |
| otpVerification | `POST /api/auth/verify-otp` | See Auth section |
| SendOTP | `POST /api/auth/send-otp` | See Auth section |
| countryList | `POST /api/trainer/countryList` | Stub |
| stateList | `POST /api/trainer/stateList` | Stub |
| citylist | `POST /api/trainer/citylist` | Stub |
| languageList | `POST /api/trainer/languageList` | Stub |
| Signup | `POST /api/auth/signup` | See Auth section |
| resendOTP | `POST /api/auth/resend-otp` | See Auth section |
| viewProfile | `POST /api/trainer/viewProfile` | Implement with JWT + User |
| editProfile | `POST /api/trainer/editProfile` | Implement with JWT + User |
| deleteProfile | `POST /api/trainer/deleteProfile` | JWT. Returns success + message to contact support. |
| fetchExperienceList | `POST /api/trainer/fetchExperienceList` | Stub |
| allActivityList | `POST /api/trainer/allActivityList` | Returns all Activity types (master data). No auth. |
| trainerActivityList | `POST /api/trainer/trainerActivityList` | JWT. Returns activities offered by current trainer (TrainerActivity + activity name). |
| addTrainerActivity | `POST /api/trainer/addTrainerActivity` | JWT. Body: `activityCode`. Adds activity to trainer. |
| editTrainerActivity | `POST /api/trainer/editTrainerActivity` | JWT. Body: `id`, optional `activityCode`. |
| viewActivity | `POST /api/trainer/viewActivity` | JWT. Body: `id`. Returns one trainer activity. |
| deleteActivity | `POST /api/trainer/deleteActivity` | JWT. Body: `id`. Removes activity from trainer. |
| currentEarning | `POST /api/trainer/currentEarning` | Stub |
| earningStats | `POST /api/trainer/earningStats` | Stub |
| referralSummary | `POST /api/trainer/referralSummary` | JWT. Returns referralSummary: { totalReferrals, totalEarnedFromReferrals }. |
| trainerCertificateList | `POST /api/trainer/trainerCertificateList` | JWT. Returns list for current trainer (TrainerCertificate). |
| addTrainerCertificate | `POST /api/trainer/addTrainerCertificate` | JWT. Body: `name`, optional `issuingOrganization`, `issuedAt`, `credentialId`, `documentUrl`. |
| editTrainerCertificate | `POST /api/trainer/editTrainerCertificate` | JWT. Body: `id`, optional `name`, `issuingOrganization`, `issuedAt`, `credentialId`, `documentUrl`. |
| viewCertification | `POST /api/trainer/viewCertification` | JWT. Body: `id`. Returns one certificate. |
| deleteCertification | `POST /api/trainer/deleteCertification` | JWT. Body: `id`. |
| trainerServiceList | `POST /api/trainer/trainerServiceList` | JWT. Returns list of trainer service areas (TrainerServiceArea). |
| addTrainerService | `POST /api/trainer/addTrainerService` | JWT. Body: `label`, optional `address`, `latitude`, `longitude`, `radiusKm`. |
| viewServiceArea | `POST /api/trainer/viewServiceArea` | JWT. Body: optional `id` (one area); omit = list all. |
| editTrainerService | `POST /api/trainer/editTrainerService` | JWT. Body: `id`, optional `label`, `address`, `latitude`, `longitude`, `radiusKm`. |
| deleteTrainerService | `POST /api/trainer/deleteTrainerService` | JWT. Body: `id`. |
| serviceAreaOnOff | `POST /api/trainer/serviceAreaOnOff` | JWT. Body: `id`, optional `isActive` (omit = toggle). |
| GetTrainerLocation | `POST /api/trainer/GetTrainerLocation` | Stub |
| trainerAvailabilityList | `POST /api/trainer/trainerAvailabilityList` | JWT, returns availabilityList (dayOfWeek 0–6, startTime, endTime) |
| viewListAllAvailabilty | `POST /api/trainer/viewListAllAvailabilty` | JWT, same as trainerAvailabilityList |
| addTrainerAvailability | `POST /api/trainer/addTrainerAvailability` | JWT, body: `dayOfWeek`, `startTime`, `endTime` |
| editTrainerAvailability | `POST /api/trainer/editTrainerAvailability` | JWT, body: `id`, `dayOfWeek?`, `startTime?`, `endTime?` |
| viewAvailabilty | `POST /api/trainer/viewAvailabilty` | JWT, body: `id?` (omit = list all) |
| deleteAvaibilitySlot | `POST /api/trainer/deleteAvaibilitySlot` | JWT, body: `id` |
| addTrainerBankDetails | `POST /api/trainer/addTrainerBankDetails` | JWT. Body: `accountHolderName`, `last4` (4 digits), optional `bankName`, `routingLast4`. Upserts TrainerBankDetail (one per trainer). |
| viewTrainerBankDetails | `POST /api/trainer/viewTrainerBankDetails` | JWT. Returns own bank details (masked: last4, routingLast4). |
| trainerSessionList | `POST /api/trainer/trainerSessionList` | Stub |
| trainerSessionNewList | `POST /api/trainer/trainerSessionNewList` | JWT, returns scheduled sessions (trainerSessionNewList) |
| trainerSessionCompletedList | `POST /api/trainer/trainerSessionCompletedList` | Stub |
| SessionUpcomingView | `POST /api/trainer/SessionUpcomingView` | JWT. Body: sessionId. Session detail when status = scheduled. |
| SessionCompletedView | `POST /api/trainer/SessionCompletedView` | JWT. Body: sessionId. Session detail when status = completed. |
| faqlist | `POST /api/trainer/faqlist` | Returns faqlist, list (empty by default). |
| fetchContactLink | `POST /api/trainer/fetchContactLink` | Returns contactLink, contactEmail (env CONTACT_EMAIL). |
| fetchSessionDetails | `POST /api/trainer/fetchSessionDetails` | Stub |
| fetchcancelreason | `POST /api/trainer/fetchcancelreason` | Stub |
| raiseSupport | `POST /api/trainer/raiseSupport` | JWT, body: `subject`, `message`; creates SupportTicket |
| screenFlags | `POST /api/trainer/screenFlags` | Returns screenFlags object (feature flags). |
| todaySession | `POST /api/trainer/todaySession` | Stub |
| fileUpload | `POST /api/trainer/fileUpload` | JWT. Stub: returns profilepath, filecode (empty). |
| AddDocument | `POST /api/trainer/AddDocument` | JWT. Stub success. |
| GetNotificationList | `POST /api/trainer/GetNotificationList` | JWT, returns list from DB |
| GetNotificationFlag | `POST /api/trainer/GetNotificationFlag` | JWT, returns unreadCount |
| UpdateNotificationReadStatus | `POST /api/trainer/UpdateNotificationReadStatus` | JWT, body: `notificationId?` (omit = mark all read) |
| deleteNotification | `POST /api/trainer/deleteNotification` | JWT, body: `notificationId` |
| DeleteNotifications | `POST /api/trainer/DeleteNotifications` | JWT, deletes all for user |
| ReadAllNotification | `POST /api/trainer/ReadAllNotification` | JWT, marks all read |
| UpdateSessionCompleteFlag | `POST /api/trainer/UpdateSessionCompleteFlag` | JWT. Body: sessionId, optional amountCents. Marks session completed. |
| deletetrainer | `POST /api/trainer/deletetrainer` | JWT. Same as deleteProfile (request deletion; contact support). |
| FetchReviews | `POST /api/trainer/FetchReviews` | JWT. Returns reviews for current trainer (list with customerName, rating, comment, createdAt). |
| getAdditionalImageCodes | `POST /api/trainer/getAdditionalImageCodes` | Returns getAdditionalImageCodes, codes, list (empty by default). |
| addAdditionalImageCodes | `POST /api/trainer/addAdditionalImageCodes` | Success no-op (extend when storage exists). |
| removeAdditionalImageCodes | `POST /api/trainer/removeAdditionalImageCodes` | Success no-op (extend when storage exists). |
| convertRequiredTimeFormat | `POST /api/trainer/convertRequiredTimeFormat` | Legacy. Body: `time` or `timeStr` (e.g. "9:00", "09:00"). Returns mtype, convertedTime (HH:mm). |

---

## Admin API

NestJS base: `POST /api/admin/<Route>`.

| NestJS | Notes |
|--------|--------|
| `GET /api/admin/health` | Health check |
| `POST /api/admin/dashboard` | Stub |
| `POST /api/admin/usersList` | Stub |
| `POST /api/admin/trainerList` | Stub |
| `POST /api/admin/customerList` | Stub |
| `POST /api/admin/sessionList` | JWT, returns list from Prisma |
| `POST /api/admin/sessionDetail` | JWT, body: `sessionId`, returns session by id |
| `POST /api/admin/supportList` | Stub |
| `POST /api/admin/discountList` | Stub |
| `POST /api/admin/earningReport` | Stub |
| `POST /api/admin/activityList` | JWT, returns list from Activity table |
| `POST /api/admin/createActivity` | JWT, body: `code`, `name`, `description?` |
| `POST /api/admin/updateActivity` | JWT, body: `id`, `code?`, `name?`, `description?` |
| `POST /api/admin/deleteActivity` | JWT, body: `id` |
| `POST /api/admin/updateUserRole` | JWT (admin only), body: `userId`, `role` |
| `POST /api/admin/DeleteAccount` | JWT (admin only), body: `userId`; deletes user (cascade) |
| `POST /api/admin/userDetail` | JWT, body: `userId`, returns user by id |
| `POST /api/admin/supportDetail` | JWT, body: `supportId`, returns support ticket by id |
| `POST /api/admin/discountDetail` | JWT, body: `discountId`, returns discount by id |
| `POST /api/admin/createDiscount` | JWT, body: `code`, `type` (percent\|fixed), `value`, `validFrom?`, `validTo?` |
| `POST /api/admin/updateDiscount` | JWT, body: `id`, optional `code`, `type`, `value`, `validFrom?`, `validTo?` |
| `POST /api/admin/deleteDiscount` | JWT, body: `id` |
| `POST /api/admin/faqList` | JWT, returns faqList, list (empty stub) |
| `POST /api/admin/contactUs` | JWT, returns contactEmail (env CONTACT_EMAIL) |

---

## Using from clients

- **Web:** `api.post('/customer/viewProfile', {})` or `api.post('/trainer/viewProfile', {})` with same `baseURL` that includes `/api`.
- **RN (customer-app):** Use `api.post('/customer/...', body)` for customer endpoints.
- **RN (trainer-app):** Use `api.post('/trainer/...', body)` for trainer endpoints.
- Always send the JWT from login/signup in `Authorization: Bearer <token>` for protected endpoints.
