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
- **i18n/** – Translations (en, fr, extensible)
- **api/** – API types (`ApiUser`, `LoginRequest`, `LoginResponse`, `ApiErrorBody`), `createApiClient`, `API_ERROR_CODES`
