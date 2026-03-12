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

  test('POST /api/auth/google with invalid token returns 401', async ({ request }) => {
    const res = await request.post('/api/auth/google', {
      data: { idToken: 'invalid-token' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/auth/apple with invalid token returns 401', async ({ request }) => {
    const res = await request.post('/api/auth/apple', {
      data: { idToken: 'invalid-token' },
    });
    expect(res.status()).toBe(401);
  });

  test.describe('Login', () => {
    test('POST /api/auth/login with invalid credentials returns 401', async ({ request }) => {
      const res = await request.post('/api/auth/login', {
        data: { email: 'nonexistent@test.com', password: 'wrong' },
      });
      expect(res.status()).toBe(401);
    });

    test('POST /api/auth/login with valid credentials returns 200 and accessToken', async ({
      request,
    }) => {
      const signupRes = await request.post('/api/auth/signup', {
        data: {
          name: 'E2E Login User',
          email: 'e2e-login@groupfit.test',
          password: 'password123',
          role: 'customer',
        },
      });
      expect(signupRes.ok()).toBeTruthy();
      const loginRes = await request.post('/api/auth/login', {
        data: { email: 'e2e-login@groupfit.test', password: 'password123' },
      });
      expect(loginRes.ok()).toBeTruthy();
      const body = await loginRes.json();
      expect(body.accessToken).toBeDefined();
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe('e2e-login@groupfit.test');
    });
  });

  test.describe('Signup', () => {
    test('POST /api/auth/signup with new email returns 200 and accessToken', async ({
      request,
    }) => {
      const email = `e2e-signup-${Date.now()}@groupfit.test`;
      const res = await request.post('/api/auth/signup', {
        data: { name: 'E2E User', email, password: 'password123', role: 'customer' },
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.accessToken).toBeDefined();
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe(email);
    });

    test('POST /api/auth/signup with existing email returns 409', async ({ request }) => {
      const email = `e2e-dup-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'First', email, password: 'password123' },
      });
      const res = await request.post('/api/auth/signup', {
        data: { name: 'Second', email, password: 'otherpass' },
      });
      expect(res.status()).toBe(409);
    });
  });

  test.describe('Country list', () => {
    test('POST /api/auth/country-list returns 200 and list of countries', async ({ request }) => {
      const res = await request.post('/api/auth/country-list', { data: {} });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('success');
      expect(Array.isArray(body.list)).toBe(true);
      if (body.list.length > 0) {
        expect(body.list[0]).toHaveProperty('id');
        expect(body.list[0]).toHaveProperty('name');
        expect(body.list[0]).toHaveProperty('isdCode');
      }
    });
  });

  test.describe('OTP', () => {
    test('POST /api/auth/send-otp with valid phone returns 200 and userCode', async ({
      request,
    }) => {
      const res = await request.post('/api/auth/send-otp', {
        data: { data: '+447700900001', type: 'phone' },
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.message).toBeDefined();
      expect(body.userCode).toBeDefined();
      expect(typeof body.userCode).toBe('string');
    });

    test('POST /api/auth/send-otp with invalid phone returns 400', async ({ request }) => {
      const res = await request.post('/api/auth/send-otp', {
        data: { data: '123', type: 'phone' },
      });
      expect(res.status()).toBe(400);
    });

    test('POST /api/auth/verify-otp with invalid userCode returns 401', async ({ request }) => {
      const res = await request.post('/api/auth/verify-otp', {
        data: { otp: '1234', userCode: 'non-existent-user-id' },
      });
      expect(res.status()).toBe(401);
    });

    test('POST /api/auth/verify-otp with wrong OTP returns 401', async ({ request }) => {
      const sendRes = await request.post('/api/auth/send-otp', {
        data: { data: '+447700900002', type: 'phone' },
      });
      expect(sendRes.ok()).toBeTruthy();
      const { userCode } = await sendRes.json();
      const res = await request.post('/api/auth/verify-otp', {
        data: { otp: '0000', userCode },
      });
      expect(res.status()).toBe(401);
    });

    test('POST /api/auth/resend-otp with phone that has no user returns 400', async ({
      request,
    }) => {
      const res = await request.post('/api/auth/resend-otp', {
        data: { phoneNumber: '+449999999999' },
      });
      expect(res.status()).toBe(400);
    });

    test('POST /api/auth/resend-otp after send-otp returns 200', async ({ request }) => {
      await request.post('/api/auth/send-otp', {
        data: { data: '+447700900003', type: 'phone' },
      });
      const res = await request.post('/api/auth/resend-otp', {
        data: { phoneNumber: '+447700900003' },
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.message).toBeDefined();
      expect(body.userCode).toBeDefined();
    });
  });

  test.describe('Customer JWT flows', () => {
    test('POST /api/customer/ReferralList without JWT returns 401', async ({ request }) => {
      const res = await request.post('/api/customer/ReferralList', { data: {} });
      expect(res.status()).toBe(401);
    });

    test('POST /api/customer/ReferralList with JWT returns 200 and list', async ({ request }) => {
      const email = `e2e-referral-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'E2E Referral User', email, password: 'password123', role: 'customer' },
      });
      const loginRes = await request.post('/api/auth/login', {
        data: { email, password: 'password123' },
      });
      expect(loginRes.ok()).toBeTruthy();
      const { accessToken } = await loginRes.json();
      const res = await request.post('/api/customer/ReferralList', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {},
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('success');
      expect(Array.isArray(body.ReferralList ?? body.list)).toBe(true);
    });

    test('POST /api/customer/fetchallgroupslist with JWT returns 200 and list', async ({
      request,
    }) => {
      const email = `e2e-groups-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'E2E Groups User', email, password: 'password123', role: 'customer' },
      });
      const loginRes = await request.post('/api/auth/login', {
        data: { email, password: 'password123' },
      });
      expect(loginRes.ok()).toBeTruthy();
      const { accessToken } = await loginRes.json();
      const res = await request.post('/api/customer/fetchallgroupslist', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {},
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('success');
      expect(Array.isArray(body.fetchallgroupslist ?? body.list)).toBe(true);
    });

    test('POST /api/customer/addgroupname with JWT creates group and returns id', async ({
      request,
    }) => {
      const email = `e2e-addgroup-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'E2E AddGroup User', email, password: 'password123', role: 'customer' },
      });
      const loginRes = await request.post('/api/auth/login', {
        data: { email, password: 'password123' },
      });
      expect(loginRes.ok()).toBeTruthy();
      const { accessToken } = await loginRes.json();
      const res = await request.post('/api/customer/addgroupname', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { name: 'E2E Test Group' },
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('success');
      expect(body.id).toBeDefined();
      expect(typeof body.id).toBe('string');
    });

    test('POST /api/customer/avialableDiscountList returns 200 and list', async ({ request }) => {
      const res = await request.post('/api/customer/avialableDiscountList', { data: {} });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('success');
      expect(Array.isArray(body.avialableDiscountList ?? body.list)).toBe(true);
    });

    test('POST /api/customer/checkDiscount with empty code returns error', async ({ request }) => {
      const res = await request.post('/api/customer/checkDiscount', { data: { code: '' } });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('error');
      expect(body.message).toBeDefined();
    });

    test('POST /api/customer/otherConcern without JWT returns 401', async ({ request }) => {
      const res = await request.post('/api/customer/otherConcern', {
        data: { message: 'Need help' },
      });
      expect(res.status()).toBe(401);
    });

    test('POST /api/customer/otherConcern with JWT and message returns success', async ({
      request,
    }) => {
      const email = `e2e-other-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'E2E Other User', email, password: 'password123', role: 'customer' },
      });
      const loginRes = await request.post('/api/auth/login', {
        data: { email, password: 'password123' },
      });
      expect(loginRes.ok()).toBeTruthy();
      const { accessToken } = await loginRes.json();
      const res = await request.post('/api/customer/otherConcern', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { message: 'E2E other concern message' },
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('success');
      expect(body.ticketId).toBeDefined();
    });

    test('POST /api/customer/fetchSoloMembers with JWT returns 200 and list', async ({
      request,
    }) => {
      const email = `e2e-solo-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'E2E Solo User', email, password: 'password123', role: 'customer' },
      });
      const loginRes = await request.post('/api/auth/login', {
        data: { email, password: 'password123' },
      });
      expect(loginRes.ok()).toBeTruthy();
      const { accessToken } = await loginRes.json();
      const res = await request.post('/api/customer/fetchSoloMembers', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {},
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('success');
      expect(Array.isArray(body.list)).toBe(true);
    });

    test('POST /api/customer/GroupInvite with JWT adds member to group', async ({ request }) => {
      const ownerEmail = `e2e-owner-${Date.now()}@groupfit.test`;
      const inviteeEmail = `e2e-invitee-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'E2E Owner', email: ownerEmail, password: 'password123', role: 'customer' },
      });
      const inviteeSignup = await request.post('/api/auth/signup', {
        data: {
          name: 'E2E Invitee',
          email: inviteeEmail,
          password: 'password123',
          role: 'customer',
        },
      });
      expect(inviteeSignup.ok()).toBeTruthy();
      const inviteeBody = await inviteeSignup.json();
      const inviteeId = inviteeBody.user?.id;
      const ownerLogin = await request.post('/api/auth/login', {
        data: { email: ownerEmail, password: 'password123' },
      });
      expect(ownerLogin.ok()).toBeTruthy();
      const { accessToken } = await ownerLogin.json();
      const groupRes = await request.post('/api/customer/addgroupname', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { name: 'E2E Invite Group' },
      });
      expect(groupRes.ok()).toBeTruthy();
      const groupBody = await groupRes.json();
      const groupId = groupBody.id;
      const inviteRes = await request.post('/api/customer/GroupInvite', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { groupId, userId: inviteeId },
      });
      expect(inviteRes.ok()).toBeTruthy();
      const inviteResult = await inviteRes.json();
      expect(inviteResult.mtype).toBe('success');
      expect(inviteResult.id).toBeDefined();
      const membersRes = await request.post('/api/customer/fetchgroupMembers', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { groupId },
      });
      expect(membersRes.ok()).toBeTruthy();
      const membersBody = await membersRes.json();
      expect(membersBody.mtype).toBe('success');
      expect(Array.isArray(membersBody.fetchgroupMembers ?? membersBody.list)).toBe(true);
      expect((membersBody.fetchgroupMembers ?? membersBody.list).length).toBe(1);
    });
  });

  test.describe('Trainer JWT flows', () => {
    test('POST /api/trainer/GetTrainerLocation without JWT returns 401', async ({ request }) => {
      const res = await request.post('/api/trainer/GetTrainerLocation', { data: {} });
      expect(res.status()).toBe(401);
    });

    test('POST /api/trainer/GetTrainerLocation with JWT returns 200', async ({ request }) => {
      const email = `e2e-trainer-loc-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'E2E Trainer Loc', email, password: 'password123', role: 'trainer' },
      });
      const loginRes = await request.post('/api/auth/login', {
        data: { email, password: 'password123' },
      });
      expect(loginRes.ok()).toBeTruthy();
      const { accessToken } = await loginRes.json();
      const res = await request.post('/api/trainer/GetTrainerLocation', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {},
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('success');
      expect(Array.isArray(body.trainerServiceList ?? body.list)).toBe(true);
    });

    test('POST /api/trainer/referralSummary with JWT returns 200 and referralSummary', async ({
      request,
    }) => {
      const email = `e2e-trainer-ref-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'E2E Trainer Ref', email, password: 'password123', role: 'trainer' },
      });
      const loginRes = await request.post('/api/auth/login', {
        data: { email, password: 'password123' },
      });
      expect(loginRes.ok()).toBeTruthy();
      const { accessToken } = await loginRes.json();
      const res = await request.post('/api/trainer/referralSummary', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {},
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('success');
      expect(body.referralSummary).toBeDefined();
      expect(typeof body.referralSummary.totalReferrals).toBe('number');
      expect(typeof body.referralSummary.totalEarnedFromReferrals).toBe('number');
    });
  });

  test.describe('Admin JWT flows', () => {
    test('POST /api/admin/DeleteAccount without JWT returns 401', async ({ request }) => {
      const res = await request.post('/api/admin/DeleteAccount', {
        data: { userId: 'some-user-id' },
      });
      expect(res.status()).toBe(401);
    });

    test('POST /api/admin/DeleteAccount with customer JWT returns 403', async ({ request }) => {
      const email = `e2e-admin-del-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'E2E Customer', email, password: 'password123', role: 'customer' },
      });
      const loginRes = await request.post('/api/auth/login', {
        data: { email, password: 'password123' },
      });
      expect(loginRes.ok()).toBeTruthy();
      const { accessToken } = await loginRes.json();
      const res = await request.post('/api/admin/DeleteAccount', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { userId: 'any-user-id' },
      });
      expect(res.status()).toBe(403);
    });

    test('POST /api/admin/DeleteAccount with admin JWT and target user returns success', async ({
      request,
    }) => {
      const adminEmail = `e2e-admin-${Date.now()}@groupfit.test`;
      const victimEmail = `e2e-victim-${Date.now()}@groupfit.test`;
      await request.post('/api/auth/signup', {
        data: { name: 'E2E Admin', email: adminEmail, password: 'password123', role: 'admin' },
      });
      await request.post('/api/auth/signup', {
        data: { name: 'E2E Victim', email: victimEmail, password: 'password123', role: 'customer' },
      });
      const victimLogin = await request.post('/api/auth/login', {
        data: { email: victimEmail, password: 'password123' },
      });
      expect(victimLogin.ok()).toBeTruthy();
      const victimBody = await victimLogin.json();
      const victimId = victimBody.user?.id;
      const adminLogin = await request.post('/api/auth/login', {
        data: { email: adminEmail, password: 'password123' },
      });
      expect(adminLogin.ok()).toBeTruthy();
      const { accessToken } = await adminLogin.json();
      const res = await request.post('/api/admin/DeleteAccount', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { userId: victimId },
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.mtype).toBe('success');
    });
  });
});
