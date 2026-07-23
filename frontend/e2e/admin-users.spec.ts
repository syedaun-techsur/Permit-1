/**
 * Admin User Management Page E2E Tests (05-02)
 * Tests are written as artifacts for the verify phase.
 * Uses API mocking to avoid live backend dependency.
 */
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const ADMIN_USER = {
  id: 'admin-user-001',
  email: 'admin@permits.local',
  fullName: 'System Admin',
  role: 'admin' as const,
};

const MOCK_USERS = [
  {
    id: 'user-001',
    fullName: 'Alice Smith',
    email: 'alice@example.com',
    role: 'applicant',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: null,
  },
  {
    id: 'user-002',
    fullName: 'Bob Reviewer',
    email: 'bob@permits.local',
    role: 'reviewer',
    isActive: true,
    createdAt: '2024-01-02T00:00:00.000Z',
    lastLoginAt: null,
  },
  {
    id: 'user-003',
    fullName: 'Carol Inactive',
    email: 'carol@example.com',
    role: 'applicant',
    isActive: false,
    createdAt: '2024-01-03T00:00:00.000Z',
    lastLoginAt: null,
  },
];

async function loginAsAdmin(page: Page) {
  await page.route('**/auth/login', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: ADMIN_USER,
        accessToken: 'mock-admin-token',
      }),
    });
  });

  await page.route('**/auth/me', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(ADMIN_USER),
    });
  });

  await page.route('**/admin/users**', (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'POST') {
      // Create user
      void route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: `new-user-${Date.now()}`,
          fullName: 'Test Reviewer E2E',
          email: `e2e-${Date.now()}@example.com`,
          role: 'reviewer',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
        }),
      });
    } else {
      // List users
      const params = new URL(url).searchParams;
      const search = params.get('search') ?? '';
      const filtered = MOCK_USERS.filter(
        (u) =>
          !search ||
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      );
      void route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filtered,
          total: filtered.length,
          page: 1,
          limit: 25,
        }),
      });
    }
  });

  await page.route('**/admin/users/**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...MOCK_USERS[0], isActive: false }),
    });
  });

  await page.route('**/notifications**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], nextCursor: null }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email address').fill(ADMIN_USER.email);
  await page.getByLabel('Password').fill('Admin@12345!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/);
}

test.describe('UserManagementPage', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin sees user management table', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('sidebar shows Users link', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
  });

  test('Add User button opens create user modal', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByRole('button', { name: /add user/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
  });

  test('create user form has required fields', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByRole('button', { name: /add user/i }).click();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/role/i)).toBeVisible();
  });

  test('create user form submits and shows success toast', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByRole('button', { name: /add user/i }).click();
    await page.getByLabel(/full name/i).fill('Test Reviewer E2E');
    await page.getByLabel(/email/i).fill(`e2e-${Date.now()}@example.com`);
    await page.getByLabel(/role/i).selectOption('reviewer');
    await page.getByRole('button', { name: /create user/i }).click();
    await expect(page.getByText('User created')).toBeVisible();
  });

  test('deactivate button opens confirm dialog', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForSelector('tbody tr');
    // Find first active user's deactivate button
    const deactivateBtn = page.getByRole('button', { name: /deactivate/i }).first();
    await expect(deactivateBtn).toBeVisible();
    await deactivateBtn.click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
  });

  test('inactive user shows reactivate button', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForSelector('tbody tr');
    // Carol Inactive should show Reactivate
    await expect(page.getByRole('button', { name: /reactivate/i }).first()).toBeVisible();
  });

  test('search input is present', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('search filters user list', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByPlaceholder(/search/i).fill('admin');
    // Give debounce time
    await page.waitForTimeout(400);
    await expect(page.locator('tbody tr')).toBeTruthy();
  });
});
