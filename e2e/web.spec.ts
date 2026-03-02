import { test, expect } from '@playwright/test';

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
    await expect(page.getByPlaceholderText(/email|Enter your email here/i)).toBeVisible();
    await expect(page.getByPlaceholderText('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('login form submit shows error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholderText('Email').fill('wrong@example.com');
    await page.getByPlaceholderText('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText(/invalid|failed|credentials|error/i)).toBeVisible({ timeout: 10000 });
  });

  test('login has sign up link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: 'Sign up now' }).or(page.getByRole('button', { name: 'Sign up now' }))).toBeVisible();
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
    await expect(page.getByText(/Google sign-in is not configured yet/i)).toBeVisible({ timeout: 5000 });
  });

  test('clicking Continue with Apple on login shows placeholder message', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Continue with Apple' }).click();
    await expect(page.getByText(/Apple sign-in is not configured yet/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Signup page', () => {
  test('signup page shows title and form', async ({ page }) => {
    await page.goto('/signup');
    await expect(
      page.getByText('Set Up Your Account').or(page.getByText('Sign Up'))
    ).toBeVisible();
    await expect(page.getByPlaceholderText('Name')).toBeVisible();
    await expect(page.getByPlaceholderText('Email')).toBeVisible();
    await expect(page.getByPlaceholderText('Password')).toBeVisible();
    await expect(page.getByPlaceholderText('Confirm password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('signup form shows validation when passwords do not match', async ({ page }) => {
    await page.goto('/signup');
    await page.getByPlaceholderText('Name').fill('Test User');
    await page.getByPlaceholderText('Email').fill('test@example.com');
    await page.getByPlaceholderText('Password').fill('secret123');
    await page.getByPlaceholderText('Confirm password').fill('different');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible({ timeout: 5000 });
  });

  test('signup has login link', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('link', { name: 'Log in' }).or(page.getByRole('button', { name: 'Log in' }))).toBeVisible();
  });

  test('can navigate from login to signup', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Sign up now' }).or(page.getByRole('button', { name: 'Sign up now' })).first().click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(
      page.getByText('Set Up Your Account').or(page.getByText('Sign Up'))
    ).toBeVisible();
  });

  test('can navigate from signup to login', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('link', { name: 'Log in' }).or(page.getByRole('button', { name: 'Log in' })).first().click();
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
    await expect(page.getByText(/Google sign-up is not configured yet/i)).toBeVisible({ timeout: 5000 });
  });

  test('clicking Continue with Apple on signup shows placeholder message', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('button', { name: 'Continue with Apple' }).click();
    await expect(page.getByText(/Apple sign-up is not configured yet/i)).toBeVisible({ timeout: 5000 });
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
