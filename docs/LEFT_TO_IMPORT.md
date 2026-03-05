# What’s Left to Import from Old Projects

This doc lists what still needs to be brought over from the desktop projects (**newCustomer**, **newTrainer**, **adminApi**, **customerApi**, **trainerApi**) into GroupFitV2.

---

## Progress (updated as we implement)

| Area | Done | Remaining |
|------|------|-----------|
| **Admin API** | Dashboard; usersList, trainerList, customerList; sessionList, supportList, discountList, earningReport; Activity CRUD; **updateUserRole** (admin-only); **faqList** (DB), **contactUs** (DB/env); **createFaq**, **updateFaq**, **deleteFaq**; **updateContactUs**; **getCustomizeDashboard**, **setCustomizeDashboard**; **AdminGuard** (all POST routes require role=admin) | — |
| **Customer API** | Reference data; session lists + detail + cancel/reschedule/addSession; fetchAllActivity, viewActivity, **GetTrendingActivities**; topratedTrainersList, viewTrainer; Favourites; Notifications; **raiseSupport**; **customerServiceList** (CustomerLocation DB); **addCustomerService**, **viewServiceArea**, **editCustomerService**, **deleteCustomerService** (JWT); **PaymentSheet** (Stripe when STRIPE_SECRET_KEY), **PaymentStatus**, **sessionPayment**; **faqlist** (Faq DB), **fetchContactLink** (ContactSetting/env); **fileUpload** (JWT stub) | Optional: PaymentList from DB |
| **Trainer API** | Reference data; trainerSessionList, trainerSessionNewList, trainerSessionCompletedList, todaySession, fetchSessionDetails; Notifications; Earnings (real); raiseSupport; **Availability (DB);** **Certificates (DB);** **Services/Bank (DB);** **Reviews (DB);** **basicdetails, saveSocialLinks, getSocialLinks**; **fileUpload**, **AddDocument** (JWT stubs); **deletetrainer** (JWT; same as deleteProfile) | — |
| **Admin Web** | Dashboard; table UI + search for users/trainers/customers; Sessions (table + session detail); Support/Discount (table + ticket/discount detail); Earning; Activity CRUD; Users (role dropdown + user detail + **Delete account** button); Trainer/Customer detail pages; **Master data** page (Activity, **FAQ**, **Contact Us**, **Customize dashboard** links); **FAQ** (list + add/edit/delete); **Contact Us** (edit contact email); **Customize dashboard** (edit JSON config) | — |
| **Detail screens** | Session detail (Web + RN) with **Cancel** and **Reschedule** (Web: datetime picker; RN: cancel only); Activity/Trainer detail + list links; **Book session** (Web: trainer detail form; RN: book-session screen from trainer detail) | — |
| **Schema / tests** | Prisma: User, Session, SupportTicket, Discount, Notification, CustomerFavourite*, Activity, **TrainerAvailability**, **Referral**, **TrainerCertificate**, **Review**, **TrainerActivity**, **Group**, **GroupMember**, **TrainerBankDetail**, **TrainerServiceArea**; API specs; Web spec; Storybook; e2e: auth, customer (ReferralList, groups, avialableDiscountList, checkDiscount, otherConcern, fetchSoloMembers, **GroupInvite**), trainer (GetTrainerLocation, referralSummary), admin (DeleteAccount) | More e2e, payment models if needed |

---

## Already in GroupFitV2

- **Customer:** Tab bar (Home, My Sessions, Activities, My Trainers, Account) + screens on RN and Web; customer API with real session lists, session detail, activity list/detail, trainer list/detail; reference data.
- **Trainer:** Tab bar (Home, My Sessions, Refer, My Earnings, Profile) + screens on RN and Web; trainer API with real session lists and session detail.
- **Admin:** Left nav + pages with real data: Dashboard (counts), Users/Trainers/Customers (tables + search), Sessions/Support/Discount (tables), Earning (report cards); admin API with real Prisma-backed lists and dashboard.
- **Auth:** Login, signup, verify, onboarding; JWT and profile (view/edit) implemented in API.

---

## 1. Customer (RN + Web)

### Screens / flows not yet in GroupFitV2 (or only as “coming soon”)

| From newCustomer | RN | Web |
|------------------|----|-----|
| SessionDetail, CancelSession, RescheduleSession | ✅ view + cancel (reschedule on web) | ✅ view + cancel + reschedule |
| ActivityDetail, ActivityList (full) | ✅ view | ✅ view |
| Trainer (detail), TrainerList, TrainerLocation | ✅ view | ✅ view |
| Group: AddMember, CreateGroup, ContactReader | ❌ | ❌ |
| ReferralList (list of referrals) | ❌ | ❌ |
| ScheduledSessions, UpComingSession, CompleteSession | ✅ lists + detail | ✅ lists + detail |
| Payment: Invoice, CheckPaymentStatus, PaymentList (full) | payments stub | payment-history exists |
| Location: AddLocation, PickLocation, MyLocations, SearchLocation, EditLocation | locations stub | locations placeholder |
| Notifications (full UI) | ✅ list, mark read, delete | ✅ list, mark all read, mark read, delete |
| Support, OtherConcerns, WriteReview, HelpCentre, Review | help exists | help exists |
| PrivacyPolicy, TermsCondition | ✅ (optional) | ✅ privacy, terms pages (static content) |
| Fitness, DateTimeSchedule, TrainerActivityList | ❌ | ❌ |
| ServerOff, AccountActivation | ❌ | ❌ |

### Customer API (Nest) – remaining stubs / missing

- **Sessions:** ✅ `customerSessionList`, `customerSessionCompletedList`, `todaysessionlist`, `fetchSessionDetails`, `cancelSession`, `rescheduleSession`, `fetchcancelreason`, `addSession` (minimal: book with trainerId + scheduledAt). ✅ **ViewSession** (JWT; body: sessionId; same as fetchSessionDetails). ✅ **Session availability:** `SessionTrainersList`, `CheckTrainerAvailability`, `SessionAvailabilityDateList`, `SessionAvailabilityTimeList` (TrainerAvailability + existing sessions).
- **Groups:** ✅ `fetchallgroupslist`, `addgroupname`, `addgroupmember`, `fetchgroupMembers`, `updategroupmember` (remove member), `deletegrouplist` (JWT; Group + GroupMember tables). ✅ **fetchSoloMembers** (JWT; body: groupId; returns customers not in that group for add-member picker).
- **Activities:** ✅ `fetchAllActivity`, `fetchactivitytype`, `viewActivity`, `fetchFavouriteActivities`, `addFavouriteActivity`, `removeFavouriteActivity`, `GetTrendingActivities` (from Activity table). ✅ **customerActivityList** (returns activity list, same shape as fetchAllActivity).
- **Trainers:** ✅ `topratedTrainersList`, `viewTrainer`, `favouriteTrainersList`, `fetchFavouriteTrainers`, `addFavouriteTrainer`, `deletefavouriteTrainer`, `getTrainerAvgRating` (body: trainerId), `fetchTrainerRelatedReviews` (body: trainerId). ✅ **customerreview** (JWT; body: trainerId, rating 1–5, comment?, sessionId?) creates Review.
- **Payments:** ✅ **PaymentList** (stub list). ✅ **PaymentSheet** (body: amountCents?, currency?; creates Stripe PaymentIntent when STRIPE_SECRET_KEY set; returns clientSecret). ✅ **PaymentStatus** (body: paymentIntentId; retrieves Stripe status). ✅ **sessionPayment** (body: sessionId?, paymentIntentId?; links/confirms payment, updates Session.amountCents when paid). Set STRIPE_SECRET_KEY in env for live payments.
- **Locations / services:** ✅ **customerServiceList** (JWT; returns CustomerLocation list). ✅ **addCustomerService** (JWT; body: label, address?, latitude?, longitude?). ✅ **viewServiceArea** (JWT; body: locationId). ✅ **editCustomerService** (JWT; body: locationId, label?, address?, latitude?, longitude?). ✅ **deleteCustomerService** (JWT; body: locationId).
- **Referrals:** ✅ `ReferralList` (JWT; returns people referred by current user from Referral table), ✅ `referraldetails` (JWT; body: `referralId`). ✅ **GroupInvite** (JWT; body: groupId, userId; same as addgroupmember).
- **Notifications:** ✅ `GetNotificationList`, `GetNotificationFlag`, `UpdateNotificationReadStatus`, `deleteNotification` (DB-backed; created on session book).
- **Reference data:** ✅ `countryList`, `stateList`, `citylist`.
- **Other:** ✅ `fetchcancelreason`. ✅ **avialableDiscountList** (discounts valid now by validFrom/validTo). ✅ **checkDiscount** (body: code; validates and returns type, value). ✅ **reviewlist** (body: trainerId; same as fetchTrainerRelatedReviews, plus reviewlist key). ✅ **faqlist** (returns faqlist/list from Faq table). ✅ **fetchContactLink** (returns contactEmail from ContactSetting or env CONTACT_EMAIL). ✅ **otherConcern** (JWT; body: subject?, message; creates SupportTicket). ✅ **contactList** (returns contactList/list; empty by default). ✅ **deleteProfile** (JWT; returns success + message to contact support; actual deletion admin/support flow). ✅ **fileUpload** (JWT; stub returns profilepath, filecode empty).
---

## 2. Trainer (RN + Web)

### Screens / flows not yet in GroupFitV2 (or only stubs)

| From newTrainer | RN | Web |
|-----------------|----|-----|
| Availability: NewAvail, EditAvail, AvailabilityView | ✅ list, add, edit, delete | placeholder |
| Certificate list/add/view, CertificateList, CertificationView | certificates stub | placeholder |
| Bank details (full) | bank-details stub | placeholder |
| Services: ServiceArea, ServiceView, service area on/off | ❌ | ❌ |
| Activities: SelectActivites, ActivityView, add/edit/delete activity | activities stub | ❌ |
| Session detail: UpcomingSession, CompletedSession, CancelSession, RescheduleSession | ✅ view + cancel | ✅ view + cancel + reschedule |
| RateUS, Trendings, Support, OtherConcerns | ❌ | ❌ |
| PublicProfile, Specializations, AddActivity, AdditionalImages, SocialMediaLinks | ❌ | ❌ |
| AddLocation, EditLocation, ServiceLocation, AddLocationInfo, SearchPage | ❌ | ❌ |
| HelpCentre, TodaysSession, Demo | ❌ | ❌ |
| Notifications (list, mark read, delete) | ✅ RN | (use customer notifications route if trainer web shares app) |
| VerifyNumberW, BankDetailW, CertificateW (widgets) | ❌ | ❌ |

### Trainer API (Nest) – remaining stubs / missing

- **Availability:** ✅ `trainerAvailabilityList`, `viewListAllAvailabilty`, `addTrainerAvailability`, `editTrainerAvailability`, `viewAvailabilty`, `deleteAvaibilitySlot` (TrainerAvailability table: dayOfWeek 0–6, startTime, endTime).
- **Certificates:** ✅ `trainerCertificateList`, `addTrainerCertificate`, `editTrainerCertificate`, `viewCertification`, `deleteCertification` (JWT; TrainerCertificate table). ✅ **getAdditionalImageCodes** (returns getAdditionalImageCodes/codes/list; empty by default). ✅ **addAdditionalImageCodes**, **removeAdditionalImageCodes** (success no-op; extend when storage exists).
- **Services / area:** ✅ `trainerServiceList`, `addTrainerService`, `editTrainerService`, `deleteTrainerService`, `viewServiceArea`, `serviceAreaOnOff` (JWT; TrainerServiceArea table). ✅ **GetTrainerLocation** (JWT; returns current trainer’s service areas, same shape as trainerServiceList).
- **Bank:** ✅ `addTrainerBankDetails` (JWT; body: accountHolderName, last4, optional bankName, routingLast4; upsert TrainerBankDetail), ✅ `viewTrainerBankDetails` (JWT; returns masked details).
- **Sessions:** ✅ `trainerSessionList`, `trainerSessionNewList` (scheduled), `trainerSessionCompletedList`, `todaySession`, `fetchSessionDetails`, `cancelSession`, `rescheduleSession`, `fetchcancelreason`. ✅ **SessionUpcomingView** (JWT; body: sessionId; session detail when status = scheduled). ✅ **SessionCompletedView** (JWT; body: sessionId; session detail when status = completed). ✅ **UpdateSessionCompleteFlag** (JWT; body: sessionId, optional amountCents; marks session completed).
- **Earnings / referral:** ✅ `currentEarning`, `earningStats` (from Session completed + amountCents). ✅ **referralSummary** (JWT; returns totalReferrals + totalEarnedFromReferrals from Referral + Session).
- **Activities:** ✅ `allActivityList` (master Activity list), ✅ `trainerActivityList`, `addTrainerActivity`, `editTrainerActivity`, `viewActivity`, `deleteActivity` (JWT; TrainerActivity table).
- **Profile / social:** ✅ **basicdetails** (JWT; returns current trainer profile, same shape as viewProfile). ✅ **saveSocialLinks** (JWT; body: facebook?, instagram?, twitter?, linkedin?; stub success until storage). ✅ **getSocialLinks** (JWT; returns getSocialLinks object with null placeholders).
- **Support / reviews:** ✅ `raiseSupport` (create SupportTicket, JWT). ✅ **FetchReviews** (JWT = own trainer), **getTrainerAvgRating** (body: trainerId or JWT), **getSessionAvgRating** (body: sessionId; from Review table). ✅ **screenFlags** (returns screenFlags object for feature flags). ✅ **faqlist**, **fetchContactLink** (same shape as customer).
- **Notifications:** ✅ `GetNotificationList`, `GetNotificationFlag`, `UpdateNotificationReadStatus`, `deleteNotification`, `DeleteNotifications`, `ReadAllNotification` (DB-backed; trainer notified when session booked).
- **Reference data:** ✅ `countryList`, `stateList`, `citylist`, `languageList`, `fetchExperienceList`.
- **Other:** ✅ `faqlist`, `fetchContactLink`, `screenFlags`. ✅ **deleteProfile** (JWT; returns success + message to contact support). Still stub: `fileUpload`, `AddDocument`, `deletetrainer`, etc.

---

## 3. Admin (Web + API)

### Pages / features in old adminApi not yet in GroupFitV2

| From adminApi | Web | API |
|---------------|-----|-----|
| CustomizeDashboard, CustomizeDashboardForm | ❌ | ❌ |
| Master (country/state/city/language/activitytype/misc/contactus/faq) | ❌ | ❌ |
| DeleteAccount | ✅ user detail “Delete account” + confirm | ✅ DeleteAccount (admin only; body: userId) |
| Activity (CRUD / list) – real UI | ✅ list, add, edit, delete | ✅ activityList, createActivity, updateActivity, deleteActivity |
| Customer (list/detail/actions) – real UI | ✅ list + search + **detail page** (by id) | ✅ list (detail uses userDetail) |
| Trainer (list/detail/actions) – real UI | ✅ list + search + **detail page** (by id) | ✅ list (detail uses userDetail) |
| Session (list/detail/actions) – real UI | ✅ list (table) + **session detail** (by id) | ✅ list, ✅ sessionDetail |
| Discount (CRUD) – real UI | ✅ list (table) + **detail** (by id) + **add / edit / delete** | ✅ list, discountDetail, createDiscount, updateDiscount, deleteDiscount |
| Earning (reports) – real UI | ✅ report cards | ✅ earningReport |
| Support (tickets) – real UI | ✅ list (table) + **ticket detail** (by id) | ✅ list, ✅ supportDetail |
| Users, Userroles – real UI | ✅ list + search + **update role** (dropdown) | ✅ usersList, ✅ updateUserRole |
| Login (admin-specific) | use main login | N/A |
| Plaid, Identity (Stripe), DMS, Dropzone, FAQ, ContactUs, Language | ❌ | ❌ |

### Admin API (Nest) – remaining

- ✅ Implemented: `dashboard`, `usersList`, `trainerList`, `customerList`, `sessionList`, `supportList`, `discountList`, `earningReport` (all from Prisma).
- **faqList**, **contactUs:** ✅ faqList from DB; contactUs from ContactSetting or env. ✅ **createFaq**, **updateFaq**, **deleteFaq**. ✅ **updateContactUs**. ✅ **getCustomizeDashboard**, **setCustomizeDashboard** (JSON layout). **DeleteAccount:** ✅ API deleteUser (body: userId; admin only); ✅ Web: delete button on user detail (hidden when viewing self). **Activity CRUD:** ✅. **User roles:** ✅ updateUserRole. **Session detail:** ✅ sessionDetail (body: sessionId). **User detail:** ✅ userDetail (body: userId). **Support detail:** ✅ supportDetail (body: supportId). **Discount detail:** ✅ discountDetail (body: discountId). **Discount CRUD:** ✅ createDiscount, updateDiscount, deleteDiscount.

---

## 4. Optional / legacy (all projects)

- **Version / health:** `APIVersionCheck` (customerApi, trainerApi).
- **File/asset GETs:** GetReducedImage, BaseUrl, GetAllFilesByType, GetFilesByType, GetFilesByCode, requestLog (customerApi, trainerApi).
- **Payments / Stripe:** RefundPaymentIntentAsync, WebHook, UserUse100PercentCouponCode (customerApi).
- **Notifications / push:** CustomerNotification, TrainerNotification, CreateTrainerBranchLink, getImgPath, getSavePath, DeleteNotifications, ReadAllNotification, AccessToken (customerApi / trainerApi).
- **Trainer:** convertRequiredTimeFormat (trainerApi).

---

## Suggested order of work (remaining)

1. **Session booking UI:** ✅ addSession API; ✅ “Book session” flow on Web (trainer detail form) and RN (book-session screen from trainer detail).
2. **Customer:** ✅ Favourites (DB + API). ✅ Notifications (DB + API + Web/RN UI). Remaining: payments (Stripe/payment status), groups, locations, referrals.
3. **Trainer:** ✅ Notifications (API + RN UI). ✅ Availability (DB + API). Remaining: certificates, services, bank details; activity CRUD; reviews.
4. **Admin:** ✅ Activity CRUD (API + UI). ✅ User role update (API + Users page role dropdown). ✅ List + detail pages (session, user, trainer, customer, support, discount). ✅ Discount CRUD (add, edit, delete). ✅ DeleteAccount (API + user detail “Delete account” button with confirm; button hidden when viewing self). Remaining: Master data UI; CustomizeDashboard.
5. **Optional:** ✅ Privacy/Terms pages (Web). ✅ APIVersionCheck (customer + trainer). Remaining: file/asset endpoints, push notifications, Plaid/Stripe admin.

Use `docs/API_MAPPING.md` for C# → Nest route mapping when implementing endpoints.
