# GroupFit

Monorepo for the GroupFit fitness platform.

## Structure

- **apps/api** – NestJS backend (customer, trainer, admin divisions)
- **apps/web** – Next.js web app (admin, customer, trainer login)
- **apps/customer-app** – React Native customer app
- **apps/trainer-app** – React Native trainer app
- **packages/shared** – Common components (atomic design), utils, i18n

**UI:** Web and both React Native apps use **Tamagui** for a shared design system (themes, layout, components). Each app has its own `tamagui.config.ts` using `@tamagui/config/v5`.

**Storybook:**

- **Shared** (constants, i18n, utils): `npm run storybook:shared` → http://localhost:6006
- **Web UI:** `npm run storybook:web` → http://localhost:6007

## Quick run & test

1. **One-time setup:** `npm install`, `cp .env.example .env`, set `DATABASE_URL` (and optionally `OPENAI_API_KEY`, `JWT_SECRET`). Then `cd apps/api && npx prisma migrate dev`.
2. **Start API:** `npm run dev:api` (http://localhost:3001).
3. **Start web:** `npm run dev:web` (http://localhost:3000).
4. **E2E:** `npm run e2e` (starts web + API, runs Playwright). Optional: set `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` to run the login→dashboard credential test.

## Setup

```bash
npm install
npm run build:shared   # required for production builds; see below for dev
cp .env.example .env   # then edit with your DATABASE_URL, etc.
```

For the API (Prisma), set `DATABASE_URL` in `.env` (see `.env.example`). Then:

```bash
cd apps/api && npx prisma migrate dev   # first-time DB setup
```

### Environment variables

| Variable                               | Where        | Purpose                                                                       |
| -------------------------------------- | ------------ | ----------------------------------------------------------------------------- |
| `DATABASE_URL`                         | API          | PostgreSQL connection (required for API and E2E).                             |
| `PORT`                                 | API          | Server port (default 3001).                                                   |
| `CORS_ORIGIN`                          | API          | Allowed origin (e.g. `http://localhost:3000`).                                |
| `JWT_SECRET`                           | API          | Signing secret (min 32 chars).                                                |
| `JWT_EXPIRES_IN`                       | API          | Token expiry (e.g. `7d`).                                                     |
| `OPENAI_API_KEY`                       | API          | Enables customer/trainer chat assistants.                                     |
| `OPENAI_CHAT_MODEL`                    | API          | Model name (default `gpt-4o-mini`).                                           |
| `NEXT_PUBLIC_API_URL`                  | Web          | API base URL (e.g. `http://localhost:3001/api`).                              |
| `STRIPE_SECRET_KEY`                    | API          | Stripe secret key (sk\_…) for Payment Intents (session payments).             |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`   | Web          | Stripe publishable key for Payment Element (card, Apple Pay, Google Pay).     |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`   | Customer app | Stripe publishable key for Payment Sheet (card, Apple Pay, Google Pay on RN). |
| `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` | E2E          | Optional; enables login→dashboard E2E test.                                   |

### Runbook (ops)

- **API won’t start:** Check `DATABASE_URL` and that Postgres is running. Run `cd apps/api && npx prisma migrate dev` if the schema is out of date.
- **Web can’t reach API:** Ensure API is running on the port in `NEXT_PUBLIC_API_URL` and `CORS_ORIGIN` includes the web origin.
- **E2E fails (timeouts):** Start API and web manually, then run `npm run e2e`; ensure no port conflicts. For login test, set `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD`.
- **Chat assistant says “not configured”:** Set `OPENAI_API_KEY` in `.env` for the API.
- **Session payment / Apple Pay / Google Pay:** Set `STRIPE_SECRET_KEY` on the API and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (web) or `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (customer-app). Enable Apple Pay and Google Pay in the [Stripe Dashboard](https://dashboard.stripe.com/settings/payment_methods). For native Apple/Google Pay on RN, configure Apple Pay capability (iOS) and Google Pay in the Stripe Dashboard and app.
- **Trainer location tracking (30 mins before session):** Ensure the migration that adds `trainer_session_location` has been applied (`cd apps/api && npx prisma migrate deploy` or `prisma migrate dev`). In the trainer app, run `npm install` so `expo-location` is installed. On web, trainers need browser location permission; on RN, the app will request foreground location permission when they tap “Share my location” on a session in the 30‑minute window.

If you use **pnpm**, keep `pnpm-workspace.yaml` and run `pnpm install` then `pnpm build:shared`. Root scripts in `package.json` use npm; adjust for pnpm if needed (`pnpm --filter api dev`, etc.).

### Do I need to build `packages/shared` every time?

**In development: no.** Web, customer-app, and trainer-app are configured to resolve `@groupfit/shared` to the **source** (`packages/shared/src`), so edits in the shared package are picked up on save/refresh without running `build:shared`. The API already used source via path mapping.

**For production:** run `npm run build:shared` before building or deploying web/API (and before building the RN apps for release).

## Development

```bash
# Backend API (NestJS) - http://localhost:3001
npm run dev:api

# Web app (Next.js) - http://localhost:3000
npm run dev:web

# Customer app (React Native / Expo)
npm run dev:customer-app

# Trainer app (React Native / Expo)
npm run dev:trainer-app
```

## Lint & format

```bash
npm run lint        # ESLint (root + workspaces)
npm run lint:fix    # ESLint with auto-fix
npm run format      # Prettier write
npm run format:check # Prettier check
```

Pre-commit (Husky + lint-staged) runs Prettier and ESLint on staged files.

## Testing

- **API (Jest):** `npm run test --workspace=api`
- **Web (Jest + React Testing Library):** `npm run test --workspace=web`
- **All unit tests:** `npm run test`

## E2E (Playwright)

Starts web and API via `webServer`, then runs E2E tests:

```bash
npm run e2e         # headless
npm run e2e:ui      # Playwright UI
npm run e2e:headed  # headed browser
```

Requires `DATABASE_URL` in `.env` for the API (use a real DB or a throwaway Postgres for CI).

## Shared package

- **components/** – Atomic design (atoms, molecules, organisms, templates)
- **utils/** – Constants and utilities
- **i18n/** – Translations (en, fr, extensible). Use `resolveAppLocale(profileLocale)` or profile locale + `getTranslations(locale)`. **App language must not be taken from device/browser** (no `navigator.language` on web, no device locale on RN); only the user’s profile locale or default may set the app language.
- **api/** – API types (`ApiUser`, `LoginRequest`, `LoginResponse`, `ApiErrorBody`), `createApiClient`, `API_ERROR_CODES`
