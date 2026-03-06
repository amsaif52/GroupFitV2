/**
 * Use when web and API are already running (e.g. npm run dev:web + npm run dev:api).
 * Run: npm run e2e:local
 * Or: npx playwright test -c playwright.config.local.ts
 */
import { defineConfig, devices } from '@playwright/test';

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
    { name: 'web', use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' }, testMatch: /web\.spec\.ts/ },
    { name: 'api', use: { baseURL: 'http://localhost:3001' }, testMatch: /api\.spec\.ts/ },
  ],
  webServer: [],
});
