# What’s Left to Import from Old Projects

This doc lists what still needs to be brought over from the desktop projects (**newCustomer**, **newTrainer**, **adminApi**, **customerApi**, **trainerApi**) into GroupFitV2.

**Status:** Next steps 1 (payment status in UI) and 2 (E2E coverage, helper, redirects, auth flow, docs) are complete. Remaining: 3 (specs-dependent screens) and 4 (optional: push, Stripe webhooks, etc.). See “Next steps (continue from here)” below.

**Quick reference:** [Recent additions](#recent-additions-not-from-old-projects) · [Progress](#progress-updated-as-we-implement) · [Next steps](#next-steps-continue-from-here) · [Already in GroupFitV2](#already-in-groupfitv2)

---

## Recent additions (not from old projects)

The following were added after the import checklist and are **done** in GroupFitV2:

- **Trainer location tracking:** Within 30 minutes before a session, the trainer can share their location (web + RN); the customer sees "Trainer is on the way" and "View on map" on session detail (web + RN). API: `POST /trainer/updateSessionLocation`; `TrainerSessionLocation` table; customer `fetchSessionDetails` returns `trainerLatitude`, `trainerLongitude`, `trainerLocationUpdatedAt` when in window.
- **Trainer chatbot – report issue:** Trainer assistant has a `report_issue` tool that creates a support ticket (calls existing `raiseSupport`). Admin sees tickets in Support.
- **Activity default price + trainer can set own price:** Admin can set a default price per activity and toggle per trainer "Can set own activity price". Trainers (web + RN) can then set or edit price per activity when the flag is on; otherwise the activity default is used. Schema: `Activity.defaultPriceCents`, `User.trainerCanSetOwnPrice`, `TrainerActivity.priceCents`.

---

## Progress (updated as we implement)

| Area               | Done                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Remaining                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Admin API**      | Dashboard; usersList, trainerList, customerList; sessionList, supportList, discountList, earningReport; Activity CRUD; **updateUserRole** (admin-only); **faqList** (DB), **contactUs** (DB/env); **createFaq**, **updateFaq**, **deleteFaq**; **updateContactUs**; **getCustomizeDashboard**, **setCustomizeDashboard**; **AdminGuard** (all POST routes require role=admin)                                                                                                                                                                                                                                           | —                                  |
| **Customer API**   | Reference data; session lists + detail + cancel/reschedule/addSession; fetchAllActivity, viewActivity, **GetTrendingActivities**; topratedTrainersList, viewTrainer; Favourites; Notifications; **raiseSupport**; **customerServiceList** (CustomerLocation DB); **addCustomerService**, **viewServiceArea**, **editCustomerService**, **deleteCustomerService** (JWT); **PaymentSheet** (Stripe when STRIPE_SECRET_KEY), **PaymentStatus**, **sessionPayment**; **PaymentList** (JWT; from DB – sessions with amountCents); **faqlist** (Faq DB), **fetchContactLink** (ContactSetting/env); **fileUpload** (JWT stub) | —                                  |
| **Trainer API**    | Reference data; trainerSessionList, trainerSessionNewList, trainerSessionCompletedList, todaySession, fetchSessionDetails; Notifications; Earnings (real); raiseSupport; **Availability (DB);** **Certificates (DB);** **Services/Bank (DB);** **Reviews (DB);** **basicdetails, saveSocialLinks, getSocialLinks**; **fileUpload**, **AddDocument** (JWT stubs); **deletetrainer** (JWT; same as deleteProfile)                                                                                                                                                                                                         | —                                  |
| **Admin Web**      | Dashboard; table UI + search for users/trainers/customers; Sessions (table + session detail); Support/Discount (table + ticket/discount detail); Earning; Activity CRUD; Users (role dropdown + user detail + **Delete account** button); Trainer/Customer detail pages; **Master data** page (Activity, **FAQ**, **Contact Us**, **Customize dashboard** links); **FAQ** (list + add/edit/delete); **Contact Us** (edit contact email); **Customize dashboard** (edit JSON config)                                                                                                                                     | —                                  |
| **Detail screens** | Session detail (Web + RN) with **Cancel** and **Reschedule** (Web: datetime picker; RN: date/time modal); Activity/Trainer detail + list links; **Book session** (Web: trainer detail form; RN: book-session screen from trainer detail)                                                                                                                                                                                                                                                                                                                                                                                | —                                  |
| **Schema / tests** | Prisma: User, Session, SupportTicket, Discount, Notification, CustomerFavourite\*, Activity, **TrainerAvailability**, **Referral**, **TrainerCertificate**, **Review**, **TrainerActivity**, **Group**, **GroupMember**, **TrainerBankDetail**, **TrainerServiceArea**; API specs; Web spec; Storybook; e2e: auth, customer (ReferralList, groups, avialableDiscountList, checkDiscount, otherConcern, fetchSoloMembers, **GroupInvite**), trainer (GetTrainerLocation, referralSummary), admin (DeleteAccount)                                                                                                         | More e2e, payment models if needed |

---

### Remaining summary (as of last update)

- **Screens (need product specs):** Fitness, DateTimeSchedule, TrainerActivityList (customer/trainer); PublicProfile, Specializations, AddLocation/EditLocation/ServiceLocation (trainer); VerifyNumberW, BankDetailW, CertificateW widgets. Implement when specs are defined.
- **Optional/legacy:** File GETs (GetReducedImage, BaseUrl, GetAllFilesByType, GetFilesByType, GetFilesByCode, requestLog) — not implemented; **fileUpload** (customer + trainer) already stubbed. Stripe webhooks/refunds; push notifications; trainer **convertRequiredTimeFormat** (stub added for legacy clients).
- **Tests:** E2E covers customer pages, detail (session/activity/trainer invalid id), admin redirect, auth, help, static pages, trainer dashboard and admin choose-experience (when E2E_TEST_EMAIL/PASSWORD set to trainer/admin); more e2e and payment/Stripe models as needed.

### Next steps (continue from here)

**Steps 1–2 below are complete.** Remaining: 3 (blocked on specs), 4 (optional).

1. **Payment status in UI:** ✅ “Paid” in Payment History (web + RN). ✅ “Payment: Paid/Unpaid” on session detail (customer web + RN).
2. **E2E:** ✅ Payment-history, Sessions, Session/Activity/Trainer detail (invalid id), Account, Profile, Activities, Trainers, Notifications, Locations, Groups, Refer (customer). ✅ Admin redirect; choose-experience redirect (customer → dashboard). ✅ Signup then login with same credentials. ✅ Reusable `signUpCustomer()` helper in `e2e/web.spec.ts`. ✅ Trainer dashboard E2E when `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` are set to a trainer account (test skips otherwise). ✅ Admin choose-experience E2E when set to an admin account (test skips otherwise). More e2e as needed.
3. **Specs-dependent:** Fitness, DateTimeSchedule, PublicProfile, etc. — implement when product specs are defined.
4. **Optional:** File/asset endpoints (stubs), push notifications, Stripe webhooks/refunds. Profile picture storage: see [Profile picture storage (design)](./PROFILE_PICTURE_STORAGE.md) for low-cost approach (e.g. Cloudflare R2 + presigned URLs, store URL on User).

**What to do next:** Run `npm run e2e:local` with API and web already running to verify E2E. When product specs exist, implement step 3 (Fitness, DateTimeSchedule, PublicProfile, etc.). To run credential-dependent E2E, set `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` to a trainer account (trainer dashboard test) or admin account (choose-experience test); tests skip if unset. Tackle step 4 (push, Stripe webhooks) when prioritised.

---

## Already in GroupFitV2

- **Customer:** Tab bar (Home, My Sessions, Activities, My Trainers, Account) + screens on RN and Web; customer API with real session lists, session detail, activity list/detail, trainer list/detail; reference data.
- **Trainer:** Tab bar (Home, My Sessions, Refer, My Earnings, Profile) + screens on RN and Web; trainer API with real session lists and session detail.
- **Admin:** Left nav + pages with real data: Dashboard (counts), Users/Trainers/Customers (tables + search), Sessions/Support/Discount (tables), Earning (report cards); admin API with real Prisma-backed lists and dashboard.
- **Auth:** Login, signup, verify, onboarding; JWT and profile (view/edit) implemented in API.

---

## 1. Customer (RN + Web)

### Screens / flows not yet in GroupFitV2 (or only as “coming soon”)

| From newCustomer                                                               | RN                                                                                   | Web                                                                                   |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| SessionDetail, CancelSession, RescheduleSession                                | ✅ view + cancel + reschedule (date/time modal)                                      | ✅ view + cancel + reschedule                                                         |
| ActivityDetail, ActivityList (full)                                            | ✅ view                                                                              | ✅ view                                                                               |
| Trainer (detail), TrainerList, TrainerLocation                                 | ✅ view                                                                              | ✅ view                                                                               |
| Group: AddMember, CreateGroup, ContactReader                                   | ✅ list, create, add member (fetchSoloMembers), remove member, delete group          | ✅ list, create, add member (fetchSoloMembers), remove member, delete group           |
| ReferralList (list of referrals)                                               | ✅ list on Refer page (people you've referred)                                       | ✅ list on Refer page (people you've referred)                                        |
| ScheduledSessions, UpComingSession, CompleteSession                            | ✅ lists + detail                                                                    | ✅ lists + detail                                                                     |
| Payment: Invoice, CheckPaymentStatus, PaymentList (full)                       | ✅ Payment History (payments.tsx; list from DB, activity name)                       | ✅ payment-history (list from DB)                                                     |
| Location: AddLocation, PickLocation, MyLocations, SearchLocation, EditLocation | ✅ list + add/edit/delete (no map picker)                                            | ✅ list + add/edit/delete (no map picker yet)                                         |
| Notifications (full UI)                                                        | ✅ list, mark read, delete                                                           | ✅ list, mark all read, mark read, delete                                             |
| Support, OtherConcerns, WriteReview, HelpCentre, Review                        | ✅ Help (FAQ + contact from API; Contact support tab, raiseSupport)                  | ✅ Help (FAQ + contact from API; Contact support tab for ticket)                      |
| PrivacyPolicy, TermsCondition                                                  | ✅ (optional)                                                                        | ✅ privacy, terms pages (static content)                                              |
| Fitness, DateTimeSchedule, TrainerActivityList                                 | ❌                                                                                   | ❌                                                                                    |
| ServerOff, AccountActivation                                                   | ✅ Server Off (server-off + healthCheck); ✅ Account activation (placeholder screen) | ✅ Server unavailable (/server-unavailable); ✅ Account activation (placeholder page) |

### Customer API (Nest) – remaining stubs / missing

- **Sessions:** ✅ `customerSessionList`, `customerSessionCompletedList`, `todaysessionlist`, `fetchSessionDetails`, `cancelSession`, `rescheduleSession`, `fetchcancelreason`, `addSession` (minimal: book with trainerId + scheduledAt). ✅ **ViewSession** (JWT; body: sessionId; same as fetchSessionDetails). ✅ **Session availability:** `SessionTrainersList`, `CheckTrainerAvailability`, `SessionAvailabilityDateList`, `SessionAvailabilityTimeList` (TrainerAvailability + existing sessions).
- **Groups:** ✅ `fetchallgroupslist`, `addgroupname`, `addgroupmember`, `fetchgroupMembers`, `updategroupmember` (remove member), `deletegrouplist` (JWT; Group + GroupMember tables). ✅ **fetchSoloMembers** (JWT; body: groupId; returns customers not in that group for add-member picker).
- **Activities:** ✅ `fetchAllActivity`, `fetchactivitytype`, `viewActivity`, `fetchFavouriteActivities`, `addFavouriteActivity`, `removeFavouriteActivity`, `GetTrendingActivities` (from Activity table). ✅ **customerActivityList** (returns activity list, same shape as fetchAllActivity).
- **Trainers:** ✅ `topratedTrainersList`, `viewTrainer`, `favouriteTrainersList`, `fetchFavouriteTrainers`, `addFavouriteTrainer`, `deletefavouriteTrainer`, `getTrainerAvgRating` (body: trainerId), `fetchTrainerRelatedReviews` (body: trainerId). ✅ **customerreview** (JWT; body: trainerId, rating 1–5, comment?, sessionId?) creates Review.
- **Payments:** ✅ **PaymentList** (JWT; from DB – sessions where customer paid, amountCents set). ✅ **PaymentSheet** (body: amountCents?, currency?; creates Stripe PaymentIntent when STRIPE_SECRET_KEY set; returns clientSecret). ✅ **PaymentStatus** (body: paymentIntentId; retrieves Stripe status). ✅ **sessionPayment** (body: sessionId?, paymentIntentId?; links/confirms payment, updates Session.amountCents when paid). Set STRIPE_SECRET_KEY in env for live payments.
- **Locations / services:** ✅ **customerServiceList** (JWT; returns CustomerLocation list). ✅ **addCustomerService** (JWT; body: label, address?, latitude?, longitude?). ✅ **viewServiceArea** (JWT; body: locationId). ✅ **editCustomerService** (JWT; body: locationId, label?, address?, latitude?, longitude?). ✅ **deleteCustomerService** (JWT; body: locationId).
- **Referrals:** ✅ `ReferralList` (JWT; returns people referred by current user from Referral table), ✅ `referraldetails` (JWT; body: `referralId`). ✅ **GroupInvite** (JWT; body: groupId, userId; same as addgroupmember).
- **Notifications:** ✅ `GetNotificationList`, `GetNotificationFlag`, `UpdateNotificationReadStatus`, `deleteNotification` (DB-backed; created on session book).
- **Reference data:** ✅ `countryList`, `stateList`, `citylist`.
- **Other:** ✅ `fetchcancelreason`. ✅ **avialableDiscountList** (discounts valid now by validFrom/validTo). ✅ **checkDiscount** (body: code; validates and returns type, value). ✅ **reviewlist** (body: trainerId; same as fetchTrainerRelatedReviews, plus reviewlist key). ✅ **faqlist** (returns faqlist/list from Faq table). ✅ **fetchContactLink** (returns contactEmail from ContactSetting or env CONTACT_EMAIL). ✅ **otherConcern** (JWT; body: subject?, message; creates SupportTicket). ✅ **contactList** (returns contactList/list; empty by default). ✅ **deleteProfile** (JWT; returns success + message to contact support; actual deletion admin/support flow). ✅ **fileUpload** (JWT; stub returns profilepath, filecode empty).

---

## 2. Trainer (RN + Web)

### Screens / flows not yet in GroupFitV2 (or only stubs)

| From newTrainer                                                                     | RN                                                                      | Web                                                                     |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Availability: NewAvail, EditAvail, AvailabilityView                                 | ✅ list, add, edit, delete                                              | ✅ list, add, edit, delete                                              |
| Certificate list/add/view, CertificateList, CertificationView                       | ✅ list, add, edit, delete                                              | ✅ list, add, edit, delete                                              |
| Bank details (full)                                                                 | ✅ view + add/update (last4, routingLast4, accountHolderName, bankName) | ✅ view + add/update (last4, routingLast4, accountHolderName, bankName) |
| Services: ServiceArea, ServiceView, service area on/off                             | ✅ list, add, edit, delete, activate/deactivate (activity-area)         | ✅ list, add, edit, delete, activate/deactivate (activity-area)         |
| Activities: SelectActivites, ActivityView, add/edit/delete activity                 | ✅ list, add from master, edit, delete (activities)                     | ✅ list, add from master, edit, delete (my-activities)                  |
| Session detail: UpcomingSession, CompletedSession, CancelSession, RescheduleSession | ✅ view + cancel + reschedule (date/time modal)                         | ✅ view + cancel + reschedule                                           |
| RateUS, Trendings, Support, OtherConcerns                                           | ✅ Help (FAQs + contact from API; Contact support tab, raiseSupport)    | ✅ Support (Help → Contact support form; raiseSupport)                  |
| PublicProfile, Specializations, AddActivity, AdditionalImages, SocialMediaLinks     | ❌                                                                      | ❌                                                                      |
| AddLocation, EditLocation, ServiceLocation, AddLocationInfo, SearchPage             | ❌                                                                      | ❌                                                                      |
| HelpCentre, TodaysSession, Demo                                                     | ✅ Help (FAQs, contact, Contact support)                                | ✅ Help (FAQs, contact, Contact support)                                |
| Notifications (list, mark read, delete)                                             | ✅ RN                                                                   | (use customer notifications route if trainer web shares app)            |
| VerifyNumberW, BankDetailW, CertificateW (widgets)                                  | ❌                                                                      | ❌                                                                      |

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

| From adminApi                                                        | Web                                                            | API                                                                     |
| -------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| CustomizeDashboard, CustomizeDashboardForm                           | ✅ edit JSON config                                            | ✅ getCustomizeDashboard, setCustomizeDashboard                         |
| Master (country/state/city/language/activitytype/misc/contactus/faq) | ✅ Activity, FAQ, Contact Us, Customize dashboard              | ✅ API for FAQ, contactUs, CustomizeDashboard                           |
| DeleteAccount                                                        | ✅ user detail “Delete account” + confirm                      | ✅ DeleteAccount (admin only; body: userId)                             |
| Activity (CRUD / list) – real UI                                     | ✅ list, add, edit, delete                                     | ✅ activityList, createActivity, updateActivity, deleteActivity         |
| Customer (list/detail/actions) – real UI                             | ✅ list + search + **detail page** (by id)                     | ✅ list (detail uses userDetail)                                        |
| Trainer (list/detail/actions) – real UI                              | ✅ list + search + **detail page** (by id)                     | ✅ list (detail uses userDetail)                                        |
| Session (list/detail/actions) – real UI                              | ✅ list (table) + **session detail** (by id)                   | ✅ list, ✅ sessionDetail                                               |
| Discount (CRUD) – real UI                                            | ✅ list (table) + **detail** (by id) + **add / edit / delete** | ✅ list, discountDetail, createDiscount, updateDiscount, deleteDiscount |
| Earning (reports) – real UI                                          | ✅ report cards                                                | ✅ earningReport                                                        |
| Support (tickets) – real UI                                          | ✅ list (table) + **ticket detail** (by id)                    | ✅ list, ✅ supportDetail                                               |
| Users, Userroles – real UI                                           | ✅ list + search + **update role** (dropdown)                  | ✅ usersList, ✅ updateUserRole                                         |
| Login (admin-specific)                                               | use main login                                                 | N/A                                                                     |
| Plaid, Identity (Stripe), DMS, Dropzone, FAQ, ContactUs, Language    | ✅ FAQ CRUD, Contact Us edit                                   | ✅ API done                                                             |

### Admin API (Nest) – remaining

- ✅ Implemented: `dashboard`, `usersList`, `trainerList`, `customerList`, `sessionList`, `supportList`, `discountList`, `earningReport` (all from Prisma).
- **faqList**, **contactUs:** ✅ faqList from DB; contactUs from ContactSetting or env. ✅ **createFaq**, **updateFaq**, **deleteFaq**. ✅ **updateContactUs**. ✅ **getCustomizeDashboard**, **setCustomizeDashboard** (JSON layout). **DeleteAccount:** ✅ API deleteUser (body: userId; admin only); ✅ Web: delete button on user detail (hidden when viewing self). **Activity CRUD:** ✅. **User roles:** ✅ updateUserRole. **Session detail:** ✅ sessionDetail (body: sessionId). **User detail:** ✅ userDetail (body: userId). **Support detail:** ✅ supportDetail (body: supportId). **Discount detail:** ✅ discountDetail (body: discountId). **Discount CRUD:** ✅ createDiscount, updateDiscount, deleteDiscount.

---

## 4. Optional / legacy (all projects)

- **Version / health:** `APIVersionCheck` (customerApi, trainerApi). ✅ Done.
- **File/asset GETs:** GetReducedImage, BaseUrl, GetAllFilesByType, GetFilesByType, GetFilesByCode, requestLog (customerApi, trainerApi).
- **Payments / Stripe:** RefundPaymentIntentAsync, WebHook, UserUse100PercentCouponCode (customerApi).
- **Notifications / push:** CustomerNotification, TrainerNotification, CreateTrainerBranchLink, getImgPath, getSavePath, DeleteNotifications, ReadAllNotification, AccessToken (customerApi / trainerApi).
- **Trainer:** convertRequiredTimeFormat (trainerApi). Stub in Nest returns normalized time (HH:mm) for legacy clients.

---

## Specs needed (blocked until product defines)

| Item                                                   | Context                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **Fitness**                                            | Customer/trainer screen; exact flows and data model TBD.                       |
| **DateTimeSchedule**                                   | Customer/trainer; scheduling UI/UX and rules TBD.                              |
| **TrainerActivityList** (as a distinct screen)         | May overlap with existing “My activities”; clarify vs trainerActivityList API. |
| **PublicProfile / Specializations / AdditionalImages** | Trainer profile enhancements; fields and storage TBD.                          |
| **AddLocation / EditLocation / ServiceLocation**       | Trainer location flows; clarify vs existing service-area API.                  |

Use the above when prioritising or scoping; implement when specs are available.

---

## Suggested order of work (remaining)

1. **Session booking UI:** ✅ addSession API; ✅ “Book session” flow on Web (trainer detail form) and RN (book-session screen from trainer detail).
2. **Customer:** ✅ Favourites (DB + API). ✅ Notifications (DB + API + Web/RN UI). ✅ Locations (API + Web/RN: list, add, edit, delete). ✅ Groups (API + Web/RN: list, create, add/remove member, delete group). ✅ Referral list (API + Web/RN: list on Refer page). ✅ PaymentList (API from DB; Web/RN payment-history/payments). ✅ Payment status “Paid” in payment-history; “Payment: Paid/Unpaid” on session detail.
3. **Trainer:** ✅ Notifications (API + RN UI). ✅ Availability (DB + API + Web/RN). ✅ Certificates (API + Web/RN: list, add, edit, delete). ✅ Bank details (API + Web/RN: view, add/update). ✅ Service areas (API + Web/RN: list, add, edit, delete, on/off). ✅ My activities (API + Web/RN: list, add from master, edit, delete). ✅ Reviews (API + Web: list + avg rating for trainer).
4. **Admin:** ✅ Activity CRUD (API + UI). ✅ User role update (API + Users page role dropdown). ✅ List + detail pages (session, user, trainer, customer, support, discount). ✅ Discount CRUD (add, edit, delete). ✅ DeleteAccount (API + user detail “Delete account” button with confirm; button hidden when viewing self). ✅ Master data UI (FAQ, Contact Us, Customize dashboard). ✅ CustomizeDashboard (get/set JSON).
5. **Optional:** ✅ Privacy/Terms pages (Web). ✅ APIVersionCheck (customer + trainer). Remaining: file/asset endpoints (stubs), push notifications, Plaid/Stripe admin.

---

## Remaining (low priority)

- **Customer/Trainer screens:** Fitness, DateTimeSchedule, TrainerActivityList — see **Specs needed (blocked until product defines)** above.
- **Edge cases:** ✅ ServerOff (Web: /server-unavailable; RN: server-off + healthCheck). ✅ AccountActivation (placeholder screens; backend can redirect when account is pending).
- **Tests / schema:** e2e web: server-unavailable and account-activation pages covered; more e2e as needed; payment-related models if Stripe flows expand.
- **Optional/legacy:** Section 4 — file GETs, Stripe webhooks/refunds, push notifications; ✅ trainer **convertRequiredTimeFormat** (stub implemented).

Use `docs/API_MAPPING.md` for C# → Nest route mapping when implementing endpoints.
