import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs web (Next.js :3000) and api (Nest :3001) by default.
 * To run with servers already up: start `npm run dev:web` and `npm run dev:api` then run `npm run e2e`.
 * CI: if you see "EMFILE: too many open files", increase limit: ulimit -n 10240 (or similar).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,
  expect: { timeout: 10000 },
  projects: [
    {
      name: 'web',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
      testMatch: /web\.spec\.ts/,
    },
    {
      name: 'api',
      use: { baseURL: 'http://localhost:3001' },
      testMatch: /api\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: 'npm run dev --workspace=web',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'npm run build:shared && npm run dev --workspace=api',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
