# E2E tests (Playwright)

## Running locally

**Option A – servers started by Playwright (default)**  
From repo root:

```bash
npm run e2e
```

This starts the web app (port 3000) and API (port 3001), then runs both web and API specs. If you see **EMFILE: too many open files**, raise the limit and retry:

```bash
ulimit -n 10240
npm run e2e
```

**Option B – use existing servers (no EMFILE risk)**  
Start the apps yourself, then run tests without starting them again:

```bash
# Terminal 1
npm run dev:api

# Terminal 2
npm run dev:web

# Terminal 3
npm run e2e:local
```

`e2e:local` uses `playwright.config.local.ts` and does not start any webServer.

## Projects

- **web** – `e2e/web.spec.ts`: home, login, signup, onboarding, help, account, payment-history, dashboard, privacy, terms, server-unavailable, account-activation.
- **api** – `e2e/api.spec.ts`: health, auth (login/signup), customer and trainer endpoints (with JWT).

Run a single project:

```bash
npm run e2e -- --project=web
npm run e2e -- --project=api
```

## CI

- Set `CI=1` so Playwright uses one worker and retries twice.
- If the web server fails with **EMFILE**, configure the runner to raise the open-file limit (e.g. `ulimit -n 10240` or equivalent in your CI config).
