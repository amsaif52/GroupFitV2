import { test, expect, type Page } from '@playwright/test';

/** Sign up as a new customer and wait for dashboard. Use a unique namePrefix per test. */
async function signUpCustomer(page: Page, namePrefix: string): Promise<void> {
  await page.goto('/signup');
  await page
    .getByPlaceholder(/name|Full name/i)
    .first()
    .fill(`E2E ${namePrefix}`);
  await page
    .getByPlaceholder(/email|Enter your email here/i)
    .fill(`e2e-${namePrefix.replace(/\s+/g, '-')}-${Date.now()}@groupfit.test`);
  await page
    .getByPlaceholder(/Enter your password here|Password/i)
    .first()
    .fill('password123');
  await page.getByPlaceholder(/Confirm your password|Confirm password/i).fill('password123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

test.describe('Web app', () => {
  test('home page shows GroupFit and role links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'GroupFit' })).toBeVisible();
    await expect(page.getByText('Sign in as:')).toBeVisible();
    await expect(page.getByRole('link', { name: 'admin' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'trainer' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'customer' })).toBeVisible();
  });

  test('can navigate to login with role', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'customer' }).click();
    await expect(page).toHaveURL(/\/(login|login\?role=customer)/);
  });
});

test.describe('Login page', () => {
  test('login page shows title and form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Get Together.').or(page.getByText('Sign In'))).toBeVisible();
    await expect(
      page.getByText('Login to your account').or(page.getByText('Enter your email and password'))
    ).toBeVisible();
    await expect(page.getByPlaceholder(/email|Enter your email here/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password|Enter your password here/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('login form submit shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/email|Enter your email here/i).fill('wrong@example.com');
    await page.getByPlaceholder(/password|Enter your password here/i).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText(/invalid|failed|credentials|error|Login failed/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('after signup, user can log in with same credentials', async ({ page }) => {
    const email = `e2e-login-flow-${Date.now()}@groupfit.test`;
    await page.goto('/signup');
    await page
      .getByPlaceholder(/name|Full name/i)
      .first()
      .fill('E2E Login Flow');
    await page.getByPlaceholder(/email|Enter your email here/i).fill(email);
    await page
      .getByPlaceholder(/Enter your password here|Password/i)
      .first()
      .fill('password123');
    await page.getByPlaceholder(/Confirm your password|Confirm password/i).fill('password123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await page.goto('/login');
    await page.getByPlaceholder(/email|Enter your email here/i).fill(email);
    await page.getByPlaceholder(/password|Enter your password here/i).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/(dashboard|choose-experience)/, { timeout: 15000 });
    await expect(page.getByText('GroupFit').first()).toBeVisible({ timeout: 5000 });
  });

  test('login has sign up link', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page
        .getByRole('link', { name: 'Sign up now' })
        .or(page.getByRole('button', { name: 'Sign up now' }))
    ).toBeVisible();
  });

  test('login shows social login buttons and or divider', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Apple' })).toBeVisible();
    await expect(page.getByText('or')).toBeVisible();
  });

  test('clicking Continue with Google on login shows placeholder message', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Continue with Google' }).click();
    await expect(page.getByText(/Google sign-in is not configured yet/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('clicking Continue with Apple on login shows placeholder message', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Continue with Apple' }).click();
    await expect(page.getByText(/Apple sign-in is not configured yet/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('login has connection issues link to server-unavailable', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /Having connection issues/i })).toBeVisible();
    await page.getByRole('link', { name: /Having connection issues/i }).click();
    await expect(page).toHaveURL(/\/server-unavailable/);
    await expect(page.getByRole('heading', { name: 'Server unavailable' })).toBeVisible();
  });
});

test.describe('Signup page', () => {
  test('signup page shows title and form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Set Up Your Account').or(page.getByText('Sign Up'))).toBeVisible();
    await expect(page.getByPlaceholder(/name|Full name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email|Enter your email here/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Enter your password here|Password/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Confirm your password|Confirm password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('signup form shows validation when passwords do not match', async ({ page }) => {
    await page.goto('/signup');
    await page
      .getByPlaceholder(/name|Full name/i)
      .first()
      .fill('Test User');
    await page.getByPlaceholder(/email|Enter your email here/i).fill('test@example.com');
    await page
      .getByPlaceholder(/Enter your password here|Password/i)
      .first()
      .fill('secret123');
    await page.getByPlaceholder(/Confirm your password|Confirm password/i).fill('different');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible({ timeout: 5000 });
  });

  test('signup has login link', async ({ page }) => {
    await page.goto('/signup');
    await expect(
      page.getByRole('link', { name: 'Log in' }).or(page.getByRole('button', { name: 'Log in' }))
    ).toBeVisible();
  });

  test('can navigate from login to signup', async ({ page }) => {
    await page.goto('/login');
    await page
      .getByRole('link', { name: 'Sign up now' })
      .or(page.getByRole('button', { name: 'Sign up now' }))
      .first()
      .click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByText('Set Up Your Account').or(page.getByText('Sign Up'))).toBeVisible();
  });

  test('can navigate from signup to login', async ({ page }) => {
    await page.goto('/signup');
    await page
      .getByRole('link', { name: 'Log in' })
      .or(page.getByRole('button', { name: 'Log in' }))
      .first()
      .click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Get Together.').or(page.getByText('Sign In'))).toBeVisible();
  });

  test('signup shows social login buttons and or divider', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Apple' })).toBeVisible();
    await expect(page.getByText('or')).toBeVisible();
  });

  test('clicking Continue with Google on signup shows placeholder message', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('button', { name: 'Continue with Google' }).click();
    await expect(page.getByText(/Google sign-up is not configured yet/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('clicking Continue with Apple on signup shows placeholder message', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('button', { name: 'Continue with Apple' }).click();
    await expect(page.getByText(/Apple sign-up is not configured yet/i)).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('Onboarding (demo page)', () => {
  test('demo onboarding page shows first slide content', async ({ page }) => {
    await page.goto('/demo/onboarding');
    await expect(page.getByText('Pick')).toBeVisible();
    await expect(page.getByText('the activity and trainer')).toBeVisible();
    await expect(page.getByText('for your group')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skip' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('Skip navigates to login', async ({ page }) => {
    await page.goto('/demo/onboarding');
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('Get Started on last slide navigates to login', async ({ page }) => {
    await page.goto('/demo/onboarding');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});

test.describe('Help page', () => {
  test('help page shows Help Centre and tabs', async ({ page }) => {
    await page.goto('/help');
    await expect(page.getByRole('heading', { name: 'Help Centre' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'FAQs' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Contact us' })).toBeVisible();
  });

  test('FAQs tab shows FAQ items', async ({ page }) => {
    await page.goto('/help');
    await expect(page.getByText('How do I book a session?')).toBeVisible({ timeout: 5000 });
  });

  test('Contact us tab shows contact links', async ({ page }) => {
    await page.goto('/help');
    await page.getByRole('button', { name: 'Contact us' }).click();
    await expect(page.getByText('Customer service')).toBeVisible({ timeout: 3000 });
  });

  test('help page has link back to dashboard', async ({ page }) => {
    await page.goto('/help');
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
  });

  test('when logged in, Help shows Assistant tab and chat UI', async ({ page }) => {
    await signUpCustomer(page, 'Help User');
    await page.goto('/help');
    await expect(page.getByRole('button', { name: 'Assistant' })).toBeVisible();
    await page.getByRole('button', { name: 'Assistant' }).click();
    await expect(page.getByPlaceholder(/Type a message/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Ask about your sessions|upcoming sessions/i)).toBeVisible();
  });
});

test.describe('Account page', () => {
  test('account page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('when logged in, account page shows Account heading and nav', async ({ page }) => {
    await signUpCustomer(page, 'Account User');
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'Account' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
  });
});

test.describe('Profile page', () => {
  test('profile page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('when logged in, profile page shows Profile heading and nav', async ({ page }) => {
    await signUpCustomer(page, 'Profile User');
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /Profile/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
  });
});

test.describe('Activities page', () => {
  test('when logged in as customer, activities page shows title and content', async ({ page }) => {
    await signUpCustomer(page, 'Activities User');
    await page.goto('/activities');
    await expect(page.getByText('Activities')).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText(
        /Loading|Set a default address|No activities available|Favourites|All activities/i
      )
    ).toBeVisible({ timeout: 8000 });
  });

  test('when logged in as customer, activity detail with invalid id shows back link and error', async ({
    page,
  }) => {
    await signUpCustomer(page, 'Activity Detail User');
    await page.goto('/activities/invalid-activity-id-e2e');
    await expect(page.getByRole('link', { name: /Back to activities/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/Not found|Failed to load activity/i)).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('Locations page', () => {
  test('when logged in as customer, locations page shows title and content', async ({ page }) => {
    await signUpCustomer(page, 'Locations User');
    await page.goto('/locations');
    await expect(page.getByText('My Locations')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Saved addresses|Add location|Dashboard|Loading/i)).toBeVisible({
      timeout: 8000,
    });
  });
});

test.describe('Groups page', () => {
  test('when logged in as customer, groups page shows title and content', async ({ page }) => {
    await signUpCustomer(page, 'Groups User');
    await page.goto('/groups');
    await expect(page.getByText('Groups')).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText(/Create groups|Create group|Loading|No groups yet|Dashboard/i)
    ).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Refer page', () => {
  test('when logged in as customer, refer page shows title and content', async ({ page }) => {
    await signUpCustomer(page, 'Refer User');
    await page.goto('/refer');
    await expect(page.getByText('Refer')).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText(/Refer a friend|Share the love|People you've referred|No referrals yet|Share/i)
    ).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Trainers page', () => {
  test('when logged in as customer, trainers page shows title and content', async ({ page }) => {
    await signUpCustomer(page, 'Trainers User');
    await page.goto('/trainers');
    await expect(page.getByText('My Trainers')).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText(
        /Loading|Set a default address|Favourite trainers|No favourite trainers|Top rated|No trainers listed/i
      )
    ).toBeVisible({ timeout: 8000 });
  });

  test('when logged in as customer, trainer detail with invalid id shows back link and error', async ({
    page,
  }) => {
    await signUpCustomer(page, 'Trainer Detail User');
    await page.goto('/trainers/invalid-trainer-id-e2e');
    await expect(page.getByRole('link', { name: /Back to trainers/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByText(/Not found|Failed to load trainer|Missing trainer ID/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Notifications page', () => {
  test('when logged in as customer, notifications page shows title and content', async ({
    page,
  }) => {
    await signUpCustomer(page, 'Notifications User');
    await page.goto('/notifications');
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText(/Loading|No notifications yet|Dashboard/i)).toBeVisible({
      timeout: 8000,
    });
  });
});

test.describe('Payment history page', () => {
  test('payment-history redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/payment-history');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('when logged in as customer, payment-history shows title and content', async ({ page }) => {
    await signUpCustomer(page, 'Payment User');
    await page.goto('/payment-history');
    await expect(page.getByRole('heading', { name: 'Payment History' })).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByText(/No payments yet|Payment History|Date|Amount|Status/i)
    ).toBeVisible();
  });
});

test.describe('Sessions page', () => {
  test('sessions redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/sessions');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('when logged in as customer, sessions page shows title and content', async ({ page }) => {
    await signUpCustomer(page, 'Sessions User');
    await page.goto('/sessions');
    await expect(page.getByText('My Sessions')).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText(/Upcoming|Completed|No upcoming sessions|No completed sessions/i)
    ).toBeVisible();
  });

  test('when logged in as customer, session detail with invalid id shows back link and error', async ({
    page,
  }) => {
    await signUpCustomer(page, 'Session Detail User');
    await page.goto('/sessions/invalid-session-id-e2e');
    await expect(page.getByRole('link', { name: /Back to sessions/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByText(/Not found|Failed to load session|Missing session ID/i)
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin', () => {
  test('admin redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('when logged in as customer, admin redirects to dashboard', async ({ page }) => {
    await signUpCustomer(page, 'Admin Redirect Customer');
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});

test.describe('Choose experience', () => {
  test('choose-experience redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/choose-experience');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('when logged in as customer, choose-experience redirects to dashboard', async ({ page }) => {
    await signUpCustomer(page, 'Choose Experience Customer');
    await page.goto('/choose-experience');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});

test.describe('Dashboard (home screen)', () => {
  test('dashboard page shows GroupFit and nav', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('GroupFit').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Profile/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Account' })).toBeVisible();
  });

  test('dashboard shows section titles', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(
      page
        .getByRole('heading', { name: 'Upcoming Sessions' })
        .or(page.getByRole('heading', { name: "Today's Sessions" }))
    ).toBeVisible({ timeout: 5000 });
  });

  test('login with credentials then dashboard (when E2E_TEST_EMAIL set)', async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    test.skip(!email || !password, 'Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run this test');
    await page.goto('/login');
    await page.getByPlaceholder(/email|Enter your email here/i).fill(email);
    await page.getByPlaceholder(/password|Enter your password here/i).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/(dashboard|choose-experience)/, { timeout: 15000 });
    await expect(page.getByText('GroupFit').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Trainer (with test credentials)', () => {
  test('when E2E_TEST_EMAIL is trainer, login shows trainer dashboard', async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    test.skip(!email || !password, 'Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run this test');
    await page.goto('/login');
    await page.getByPlaceholder(/email|Enter your email here/i).fill(email);
    await page.getByPlaceholder(/password|Enter your password here/i).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    // Trainer dashboard has "New Sessions" and "Earning" sections (customer has "Upcoming Sessions")
    await expect(
      page
        .getByRole('heading', { name: 'New Sessions' })
        .or(page.getByRole('heading', { name: 'Earning' }))
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin (with test credentials)', () => {
  test('when E2E_TEST_EMAIL is admin, login shows choose-experience page', async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    test.skip(!email || !password, 'Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run this test');
    await page.goto('/login');
    await page.getByPlaceholder(/email|Enter your email here/i).fill(email);
    await page.getByPlaceholder(/password|Enter your password here/i).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/choose-experience/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Choose your experience' })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole('button', { name: 'Continue as Customer' })).toBeVisible();
  });
});

test.describe('Privacy Policy', () => {
  test('privacy page shows title and content', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByText(/Introduction/i)).toBeVisible();
    await expect(page.getByText(/Information we collect/i)).toBeVisible();
  });

  test('privacy page has link back to dashboard', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
  });

  test('privacy page has link to help centre', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('link', { name: /Help Centre/i })).toBeVisible();
  });
});

test.describe('Terms and Conditions', () => {
  test('terms page shows title and content', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: 'Terms and Conditions' })).toBeVisible();
    await expect(page.getByText(/Agreement to terms/i)).toBeVisible();
    await expect(page.getByText(/Use of the service/i)).toBeVisible();
  });

  test('terms page has link back to dashboard', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
  });

  test('terms page has link to help centre', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('link', { name: /Help Centre/i })).toBeVisible();
  });
});

test.describe('Server unavailable page', () => {
  test('server-unavailable page shows message and retry', async ({ page }) => {
    await page.goto('/server-unavailable');
    await expect(page.getByRole('heading', { name: 'Server unavailable' })).toBeVisible();
    await expect(page.getByText(/couldn't reach the server/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to login/i })).toBeVisible();
  });
});

test.describe('Account activation page', () => {
  test('account-activation page shows message and login link', async ({ page }) => {
    await page.goto('/account-activation');
    await expect(page.getByRole('heading', { name: 'Account activation' })).toBeVisible();
    await expect(page.getByText(/pending activation/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to login/i })).toBeVisible();
  });
});
