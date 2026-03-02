import { test, expect } from '@playwright/test';

test.describe('API', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });

  test('GET /api/customer/health returns division health', async ({ request }) => {
    const res = await request.get('/api/customer/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.division).toBe('customer');
    expect(body.status).toBe('ok');
  });
});
