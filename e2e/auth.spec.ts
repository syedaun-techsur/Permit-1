import { test, expect } from '@playwright/test';

// Seed credentials from Plan 01-01
const APPLICANT = { email: 'applicant@permits.local', password: 'Applicant@12345!' };
const ADMIN = { email: 'admin@permits.local', password: 'Admin@12345!' };

test.describe('Auth — Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('login page renders with email, password fields and sign-in button', async ({ page }) => {
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('invalid credentials shows error toast', async ({ page }) => {
    await page.getByLabel('Email address').fill('wrong@example.com');
    await page.getByLabel('Password').fill('WrongPass123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('alert')).toContainText(/invalid email or password/i);
  });

  test('empty form shows validation errors without submitting', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('valid applicant credentials redirect to applicant dashboard', async ({ page }) => {
    await page.getByLabel('Email address').fill(APPLICANT.email);
    await page.getByLabel('Password').fill(APPLICANT.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/applicant/);
  });
});

test.describe('Auth — Register', () => {
  test('register page renders all fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();
  });

  test('password mismatch shows validation error', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Full name').fill('Test User');
    await page.getByLabel('Email address').fill('newuser@example.com');
    await page.getByLabel('Password').fill('ValidPass123!');
    await page.getByLabel('Confirm password').fill('DifferentPass123!');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });
});

test.describe('Auth — Forgot Password', () => {
  test('forgot password form submits and shows confirmation', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByLabel('Email address')).toBeVisible();
    await page.getByLabel('Email address').fill('anyemail@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    // Always shows success — prevents enumeration
    await expect(page.getByText(/reset link has been sent/i)).toBeVisible();
  });
});

test.describe('Auth — Protected Routes', () => {
  test('unauthenticated user redirected to /login when accessing /applicant', async ({ page }) => {
    await page.goto('/applicant');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user redirected to /login when accessing /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Auth — Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.getByLabel('Email address').fill(APPLICANT.email);
    await page.getByLabel('Password').fill(APPLICANT.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/applicant/);
  });

  test('log out button redirects to /login and clears session', async ({ page }) => {
    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page).toHaveURL(/\/login/);
    // Verify session cleared — navigating back to /applicant should redirect to /login
    await page.goto('/applicant');
    await expect(page).toHaveURL(/\/login/);
  });
});

// Admin role test (for future use when admin dashboard is implemented)
test.describe('Auth — Admin Login', () => {
  test('valid admin credentials redirect to admin dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(ADMIN.email);
    await page.getByLabel('Password').fill(ADMIN.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/admin/);
  });
});
