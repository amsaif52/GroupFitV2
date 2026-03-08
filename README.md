# GroupFit

Monorepo for the GroupFit fitness platform.

## Structure

- **apps/api** – NestJS backend (customer, trainer, admin divisions). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design and architecture.
- **apps/web** – Next.js web app (admin, customer, trainer login)
- **apps/customer-app** – React Native customer app
- **apps/trainer-app** – React Native trainer app
- **shared** – Common components (atomic design), utils, i18n (`@groupfit/shared`)

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

| Variable                               | Where        | Purpose                                                                                                          |
| -------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                         | API          | PostgreSQL connection (required for API and E2E).                                                                |
| `PORT`                                 | API          | Server port (default 3001).                                                                                      |
| `CORS_ORIGIN`                          | API          | Allowed origin (e.g. `http://localhost:3000`).                                                                   |
| `JWT_SECRET`                           | API          | Signing secret (min 32 chars).                                                                                   |
| `JWT_EXPIRES_IN`                       | API          | Token expiry (e.g. `7d`).                                                                                        |
| `OPENAI_API_KEY`                       | API          | Enables customer/trainer chat assistants.                                                                        |
| `OPENAI_CHAT_MODEL`                    | API          | Model name (default `gpt-4o-mini`).                                                                              |
| `NEXT_PUBLIC_API_URL`                  | Web          | API base URL (e.g. `http://localhost:3001/api`).                                                                 |
| `STRIPE_SECRET_KEY`                    | API          | Stripe secret key (sk\_…) for Payment Intents (session payments).                                                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`   | Web          | Stripe publishable key for Payment Element (card, Apple Pay, Google Pay).                                        |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`   | Customer app | Stripe publishable key for Payment Sheet (card, Apple Pay, Google Pay on RN).                                    |
| `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` | E2E          | Optional; enables login→dashboard, trainer-dashboard, and admin choose-experience E2E tests (use matching role). |

### Runbook (ops)

- **API won’t start:** Check `DATABASE_URL` and that Postgres is running. Run `cd apps/api && npx prisma migrate dev` if the schema is out of date.
- **Web can’t reach API:** Ensure API is running on the port in `NEXT_PUBLIC_API_URL` and `CORS_ORIGIN` includes the web origin.
- **E2E fails (timeouts / EMFILE “too many open files”):** Start API and web manually (`npm run dev:api`, `npm run dev:web`), then run `npm run e2e:local` so Playwright does not start servers; ensure no port conflicts. For the login→dashboard test, set `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD`.
- **Chat assistant says “not configured”:** Set `OPENAI_API_KEY` in `.env` for the API.
- **Session payment / Apple Pay / Google Pay:** Set `STRIPE_SECRET_KEY` on the API and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (web) or `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (customer-app). Enable Apple Pay and Google Pay in the [Stripe Dashboard](https://dashboard.stripe.com/settings/payment_methods). For native Apple/Google Pay on RN, configure Apple Pay capability (iOS) and Google Pay in the Stripe Dashboard and app.
- **Trainer location tracking (30 mins before session):** Ensure the migration that adds `trainer_session_location` has been applied (`cd apps/api && npx prisma migrate deploy` or `prisma migrate dev`). In the trainer app, run `npm install` so `expo-location` is installed. On web, trainers need browser location permission; on RN, the app will request foreground location permission when they tap “Share my location” on a session in the 30‑minute window.

If you use **pnpm**, keep `pnpm-workspace.yaml` and run `pnpm install` then `pnpm build:shared`. Root scripts in `package.json` use npm; adjust for pnpm if needed (`pnpm --filter api dev`, etc.). If you see **"double-loading config ... pnpm/rc as global, previously loaded as user"**, run root scripts with npm instead (e.g. `npm run dev:web` or `npm run dev:web:fresh`), or fix pnpm’s config so the same file isn’t used as both user and global (e.g. use only `~/.config/pnpm/rc` by setting `XDG_CONFIG_HOME=$HOME` and removing `~/Library/Preferences/pnpm/rc`, or the reverse).

### Do I need to build `shared` every time?

**In development: no.** Web, API, customer-app, and trainer-app all resolve `@groupfit/shared` to **source** (`shared/src`) and compile it themselves, so edits in the shared package are picked up on save/refresh without running `build:shared`.

**For production:** run `npm run build:shared` before building or deploying web/API, or before building the RN apps for release (e.g. EAS Build or `expo build`).

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
npm run e2e         # headless (starts web + API automatically)
npm run e2e:local   # run with web + API already up (no server start; use if e2e hits EMFILE)
npm run e2e:ui      # Playwright UI
npm run e2e:headed  # headed browser
npx playwright test -g "Account page"   # run only tests whose name matches
npm run e2e:creds   # run only trainer + admin credential tests (set E2E_TEST_EMAIL/PASSWORD first)
npm run e2e:local -- -g "test credentials"   # same, with web + API already running
```

Requires `DATABASE_URL` in `.env` for the API (use a real DB or a throwaway Postgres for CI). Most tests sign up a new customer and need no extra env; the login→dashboard, trainer-dashboard, and admin choose-experience tests run only when `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` are set (use a trainer or admin account to run those tests). Coverage includes customer pages (sessions, account, profile, activities, trainers, notifications, locations, groups, refer, payment-history), session/activity/trainer detail (invalid id), admin and choose-experience redirects, help, auth (signup→login flow), trainer and admin flows (with test creds), and static pages.

**Adding E2E tests:** Use the `signUpCustomer(page, 'UniqueName')` helper in `e2e/web.spec.ts` for flows that need a logged-in customer; use a unique name per test. Add tests to an existing `test.describe` or create a new one; for protected routes, add a “redirects to login when not authenticated” test and a “when logged in, page shows …” test.

## Shared package

- **components/** – Atomic design (atoms, molecules, organisms, templates)
- **utils/** – Constants and utilities
- **i18n/** – Translations (en, fr, extensible). Use `resolveAppLocale(profileLocale)` or profile locale + `getTranslations(locale)`. **App language must not be taken from device/browser** (no `navigator.language` on web, no device locale on RN); only the user’s profile locale or default may set the app language.
- **api/** – API types (`ApiUser`, `LoginRequest`, `LoginResponse`, `ApiErrorBody`), `createApiClient`, `API_ERROR_CODES`
