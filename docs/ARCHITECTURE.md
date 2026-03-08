# GroupFit – Design & Architecture

High-level design and architecture for the GroupFit fitness platform monorepo.

---

## 1. Overview

GroupFit is a **fitness platform** where:

- **Customers** book sessions with trainers, manage activities, locations, groups, referrals, and payments.
- **Trainers** manage sessions, availability, activities, earnings, and certificates.
- **Admins** manage users, sessions, support, discounts, activities, and master data.

The system is built as a **monorepo** with one backend API and multiple client apps that share code and a single API contract.

---

## 2. Repository structure

```
GroupFitV2/
├── apps/
│   ├── api/          # NestJS backend (single API for all roles)
│   ├── web/          # Next.js web app (customer + trainer + admin)
│   ├── customer-app/ # React Native (Expo) – customer
│   └── trainer-app/  # React Native (Expo) – trainer
├── packages/
│   └── shared/       # Shared UI, utils, i18n, API types, theme
├── e2e/              # Playwright E2E (web + API)
└── docs/             # Architecture, runbooks, import checklist
```

- **Single API:** One NestJS app serves customer, trainer, and admin; role is enforced with JWT claims and guards.
- **Web:** One Next.js app with role-based routing (customer dashboard, trainer dashboard, admin area, choose-experience for admins).
- **Native apps:** Two separate Expo apps (customer vs trainer) for store distribution and role-specific UX; both call the same API.
- **Shared package:** Shared by web and both RN apps for components (atomic design), translations, theme (Tamagui), API client helpers, and types. In dev it is consumed from source; for production it is built once (`npm run build:shared`).

---

## 3. Tech stack

| Layer       | Technology                                        |
| ----------- | ------------------------------------------------- |
| Backend     | NestJS, Prisma, PostgreSQL                        |
| Web         | Next.js (App Router), React                       |
| Mobile      | React Native, Expo                                |
| UI / design | Tamagui (web + RN), shared theme                  |
| Auth        | JWT (Bearer), bcrypt, optional Google/Apple OAuth |
| Payments    | Stripe (Payment Intents, Payment Element / Sheet) |
| Chat / AI   | OpenAI (customer and trainer assistants)          |
| E2E         | Playwright (web + API)                            |
| Monorepo    | npm workspaces                                    |

---

## 4. High-level architecture

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                     Clients                              │
                    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
                    │  │   Web       │  │ Customer    │  │ Trainer     │      │
                    │  │ (Next.js)   │  │ App (Expo)  │  │ App (Expo)  │      │
                    │  │ Customer +  │  │             │  │             │      │
                    │  │ Trainer +   │  │             │  │             │      │
                    │  │ Admin       │  │             │  │             │      │
                    │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
                    │         │                │                │              │
                    │         └────────────────┼────────────────┘              │
                    │                          │                               │
                    │              @groupfit/shared (components, i18n, api)     │
                    └──────────────────────────┼──────────────────────────────┘
                                               │
                                    HTTPS      │  JWT (Bearer)
                                               ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │  API (NestJS)  –  /api  prefix  –  port 3001 (default)   │
                    │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌───────┐         │
                    │  │ Auth    │ │ Customer │ │ Trainer │ │ Admin │         │
                    │  │ (login, │ │ (sessions│ │ (sessions│ │ (users│         │
                    │  │ signup, │ │ activities│ │ earnings│ │ support│         │
                    │  │ JWT)    │ │ payments)│ │ certs)  │ │ etc.) │         │
                    │  └────┬────┘ └────┬─────┘ └────┬────┘ └───┬───┘         │
                    │       │           │            │          │              │
                    │       └───────────┴────────────┴──────────┘              │
                    │                          │                               │
                    │                    Prisma │  Swagger /api/docs           │
                    └──────────────────────────┼──────────────────────────────┘
                                               │
                                               ▼
                    ┌─────────────────────────────────────────────────────────┐
                    │  PostgreSQL (DATABASE_URL)                               │
                    │  User, Session, Activity, TrainerActivity, SupportTicket │
                    │  Notification, Referral, Group, Discount, …             │
                    └─────────────────────────────────────────────────────────┘
```

---

## 5. API (NestJS)

### 5.1 Global setup

- **Base path:** `/api` (e.g. `POST /api/auth/login`).
- **CORS:** Configured via `CORS_ORIGIN` (comma-separated origins).
- **Validation:** Global `ValidationPipe` (whitelist, forbid non-whitelisted, transform).
- **Errors:** `AllExceptionsFilter` for consistent error responses.
- **Rate limiting:** `ThrottlerModule` (e.g. 100 requests per 60s per IP).
- **Docs:** Swagger at `/api/docs` with Bearer auth.

### 5.2 Modules

| Module         | Path prefix | Purpose                                                                                                           |
| -------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- |
| AuthModule     | `/auth`     | Login, signup, Google/Apple, OTP verify; issues JWT.                                                              |
| CustomerModule | `/customer` | Customer-only endpoints (sessions, activities, trainers, payments, groups, referrals, notifications, chat, etc.). |
| TrainerModule  | `/trainer`  | Trainer-only endpoints (sessions, availability, earnings, certificates, bank details, chat, etc.).                |
| AdminModule    | `/admin`    | Admin-only endpoints (dashboard, users, trainers, customers, sessions, support, discounts, FAQ, etc.).            |
| HealthModule   | `/health`   | Health check for availability.                                                                                    |
| PrismaModule   | –           | PrismaService used by all feature modules.                                                                        |
| CommonModule   | –           | Shared utilities.                                                                                                 |

### 5.3 Auth and authorization

- **Login/signup:** Email+password, Google ID token, or Apple identity token. API returns `{ accessToken, user }`. JWT payload includes `sub` (userId), `email`, `role` (admin | trainer | customer).
- **Guards:**
  - **JwtAuthGuard:** Validates Bearer token; attaches user to request.
  - **TrainerGuard:** Allows trainer or admin (for trainer division).
  - **AdminGuard:** Allows admin only (for admin division).
- **Customer endpoints:** `JwtAuthGuard` only (any authenticated user with customer role uses customer endpoints; admin can act as customer via web “Switch experience”).
- **Trainer endpoints:** `JwtAuthGuard` + `TrainerGuard`.
- **Admin endpoints:** `JwtAuthGuard` + `AdminGuard`.

Clients store the JWT in memory and in persistent storage (localStorage on web, AsyncStorage on RN) and send it as `Authorization: Bearer <token>` on every request.

### 5.4 Database (Prisma)

- **Provider:** PostgreSQL.
- **Schema:** Single schema with domain models: `User`, `Session`, `Activity`, `TrainerActivity`, `TrainerAvailability`, `CustomerLocation`, `Group`, `GroupMember`, `Referral`, `Notification`, `SupportTicket`, `Discount`, `Review`, `TrainerCertificate`, `TrainerBankDetail`, `TrainerServiceArea`, `Conversation`, etc.
- **Migrations:** `apps/api/prisma/migrations`; run with `npx prisma migrate dev` or `deploy`.
- **Seeding:** Optional seed script for reference data (e.g. activities, FAQs).

---

## 6. Clients

### 6.1 Web (Next.js)

- **App Router:** Routes under `apps/web/src/app/` (e.g. `/login`, `/dashboard`, `/sessions`, `/admin/*`).
- **API client:** Axios instance in `apps/web/src/lib/api.ts`; base URL from `NEXT_PUBLIC_API_URL`. Token from `getStoredToken()` (localStorage); attached as Bearer by the shared client.
- **Auth:** Token and optional `viewAs` (customer | trainer) in localStorage; `getStoredUser()` decodes JWT for display (API always validates token).
- **Role behavior:** After login, admins are sent to `/choose-experience`; customers and trainers to `/dashboard`. Dashboard content (customer vs trainer) is driven by role or admin’s “view as” choice.
- **Static/legal:** Privacy, Terms, Help (FAQ + contact + support) and other static pages.

### 6.2 Customer app (Expo)

- **Routing:** Expo Router; auth routes (login, signup, verify) and app tabs (home, sessions, activities, trainers, account).
- **API:** Same API base URL via `EXPO_PUBLIC_API_URL` or app config; token in AsyncStorage, hydrated on load and sent as Bearer.
- **Shared:** Uses `@groupfit/shared` for components, i18n, API types, and `createAxiosApiClient` with `getAccessToken` pointing at in-memory token.

### 6.3 Trainer app (Expo)

- **Structure:** Mirrors customer-app (auth + app tabs: home, sessions, refer, earnings, profile).
- **API:** Same backend; trainer endpoints only (enforced by backend guards).
- **Shared:** Same shared package as customer-app and web.

---

## 7. Shared package (`@groupfit/shared`)

- **Components:** Atomic design (atoms, molecules, organisms); exported for web and for React Native via `./components` and `./components/native`.
- **Theme / UI:** Tamagui config and theme used by web and both RN apps for consistent look and layout.
- **i18n:** Translations (e.g. en, fr); `getTranslations(locale)`, `resolveAppLocale(profileLocale)`. App language is driven by user profile locale, not device/browser.
- **API:** Types (`LoginRequest`, `LoginResponse`, `ApiUser`, etc.), `createApiClient` / `createAxiosApiClient` for consistent base URL and Bearer injection.
- **Utils:** Constants (e.g. `ROLES`), timezone helpers, error handling (`getApiErrorMessage`, `API_ERROR_CODES`).

Consumption: In development, web and RN apps resolve `@groupfit/shared` to `shared/src` so edits apply without rebuilding. For production, run `npm run build:shared` before building apps.

---

## 8. Data and auth flow (summary)

1. **User opens web or app** → If no token, redirect to login/signup (or show public pages).
2. **Login/signup** → Client calls `POST /api/auth/login` (or signup/Google/Apple); API returns JWT. Client stores token and (on web) optionally `viewAs`; then navigates to dashboard or choose-experience (admin).
3. **Authenticated requests** → Client sends `Authorization: Bearer <token>`. API validates JWT and applies role guards; Prisma loads data; response returned.
4. **Sessions, activities, payments, etc.** → All go through the same API; customer vs trainer vs admin division is determined by URL prefix and guards. No separate backends per role.

---

## 9. External services

- **Stripe:** Payment Intents (session payments); publishable key on web and customer-app for Payment Element / Sheet. API holds secret key.
- **OpenAI:** Customer and trainer chat assistants; API holds `OPENAI_API_KEY` and calls OpenAI from backend.
- **Google / Apple:** OAuth and Sign in with Apple; clients use SDKs and send ID tokens to API; API validates and issues JWT.
- **Optional (future):** Object storage (e.g. Cloudflare R2) for profile pictures; see [Profile picture storage](./PROFILE_PICTURE_STORAGE.md).

---

## 10. Deployment and ops

- **API:** Deploy NestJS app (e.g. Node on a host or container); set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`, and optional Stripe/OpenAI keys. Run Prisma migrations on deploy.
- **Web:** Build Next.js with `NEXT_PUBLIC_API_URL` pointing at the deployed API; deploy to Vercel or similar.
- **RN apps:** Build with EAS (or similar); set `EXPO_PUBLIC_API_URL` (and Stripe key for customer-app) in env or app config.
- **E2E:** Playwright runs against web + API (default: Playwright starts both). For local runs without starting servers (e.g. to avoid EMFILE), use `npm run e2e:local` with API and web already running. See README and [LEFT_TO_IMPORT](./LEFT_TO_IMPORT.md) for E2E coverage and credential-based tests.

---

## 11. Key docs

- [LEFT_TO_IMPORT.md](./LEFT_TO_IMPORT.md) – What’s done vs remaining from legacy projects; next steps.
- [PROFILE_PICTURE_STORAGE.md](./PROFILE_PICTURE_STORAGE.md) – Design for profile picture uploads (e.g. R2 + presigned URLs).
- **README.md** – Setup, env vars, runbook, E2E, shared package usage.
