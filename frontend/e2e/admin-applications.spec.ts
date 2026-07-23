/**
 * Admin Applications Page E2E Tests (05-02)
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

const MOCK_PERMITS = [
  {
    id: 'permit-001',
    referenceNumber: 'REF-2024-001',
    permitType: 'construction',
    applicantName: 'Alice Smith',
    assignedReviewerId: null,
    assignedReviewerName: null,
    status: 'submitted',
    submittedAt: '2024-01-10T09:00:00.000Z',
    updatedAt: '2024-01-10T09:00:00.000Z',
  },
  {
    id: 'permit-002',
    referenceNumber: 'REF-2024-002',
    permitType: 'renovation',
    applicantName: 'Bob Jones',
    assignedReviewerId: 'reviewer-001',
    assignedReviewerName: 'Jane Reviewer',
    status: 'under_review',
    submittedAt: '2024-01-11T10:00:00.000Z',
    updatedAt: '2024-01-12T14:00:00.000Z',
  },
];

const MOCK_REVIEWERS = [
  {
    id: 'reviewer-001',
    fullName: 'Jane Reviewer',
    email: 'reviewer@permits.local',
    role: 'reviewer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLoginAt: null,
    activeApplicationCount: 3,
  },
];

async function loginAsAdmin(page: Page) {
  // Mock auth/login endpoint
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

  // Mock auth/me for session persistence
  await page.route('**/auth/me', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(ADMIN_USER),
    });
  });

  // Mock admin permits endpoint
  await page.route('**/admin/permits**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: MOCK_PERMITS,
        total: MOCK_PERMITS.length,
        page: 1,
        limit: 25,
      }),
    });
  });

  // Mock admin users (for reviewer dropdown)
  await page.route('**/admin/users**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: MOCK_REVIEWERS,
        total: MOCK_REVIEWERS.length,
        page: 1,
        limit: 100,
      }),
    });
  });

  // Mock notifications
  await page.route('**/notifications**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], nextCursor: null }),
    });
  });

  // Login
  await page.goto('/login');
  await page.getByLabel('Email address').fill(ADMIN_USER.email);
  await page.getByLabel('Password').fill('Admin@12345!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/);
}

test.describe('AdminApplicationsPage', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin sees all-applications table with data', async ({ page }) => {
    await page.goto('/admin/applications');
    await expect(page.getByRole('heading', { name: 'All Applications' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('sidebar shows Admin section with All Apps link for admin role', async ({ page }) => {
    await page.goto('/admin/applications');
    await expect(page.getByRole('link', { name: /all apps/i })).toBeVisible();
  });

  test('sidebar shows Users and Audit Log links for admin role', async ({ page }) => {
    await page.goto('/admin/applications');
    await expect(page.getByRole('link', { name: /users/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /audit log/i })).toBeVisible();
  });

  test('status filter is present with options', async ({ page }) => {
    await page.goto('/admin/applications');
    const statusFilter = page.getByLabel('Status');
    await expect(statusFilter).toBeVisible();
    await expect(statusFilter.locator('option[value="submitted"]')).toBeAttached();
  });

  test('Assign Reviewer button opens modal', async ({ page }) => {
    await page.goto('/admin/applications');
    // Wait for permits to load
    await page.waitForSelector('tbody tr');
    const firstAssignBtn = page.getByRole('button', { name: /assign reviewer/i }).first();
    await expect(firstAssignBtn).toBeVisible();
    await firstAssignBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/assign reviewer/i).first()).toBeVisible();
  });

  test('clicking reference number navigates to application detail', async ({ page }) => {
    await page.goto('/admin/applications');
    await page.waitForSelector('tbody tr');
    const firstRef = page.locator('tbody tr').first().getByRole('link').first();
    await expect(firstRef).toBeVisible();
    await firstRef.click();
    await expect(page).toHaveURL(/permits\/.+/);
  });

  test('table shows permit data columns', async ({ page }) => {
    await page.goto('/admin/applications');
    await page.waitForSelector('tbody tr');
    // Check for Reference # column content
    await expect(page.getByText('REF-2024-001')).toBeVisible();
    await expect(page.getByText('Alice Smith')).toBeVisible();
  });
});
