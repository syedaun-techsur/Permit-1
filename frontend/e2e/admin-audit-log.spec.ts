/**
 * Admin Audit Log Page E2E Tests (05-02)
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

const MOCK_AUDIT_ENTRIES = [
  {
    id: 'audit-001',
    action: 'USER_CREATED',
    actorId: 'admin-user-001',
    actorName: 'System Admin',
    actorRole: 'admin',
    applicationId: null,
    applicationRef: null,
    details: { targetEmail: 'new@example.com' },
    ipAddress: '127.0.0.1',
    occurredAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'audit-002',
    action: 'REVIEWER_ASSIGNED',
    actorId: 'admin-user-001',
    actorName: 'System Admin',
    actorRole: 'admin',
    applicationId: 'permit-001',
    applicationRef: 'REF-2024-001',
    details: { reviewerId: 'reviewer-001' },
    ipAddress: '127.0.0.1',
    occurredAt: new Date(Date.now() - 7200_000).toISOString(),
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

  await page.route('**/admin/audit-log/export**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'text/csv',
      headers: {
        'Content-Disposition': 'attachment; filename="audit-log.csv"',
      },
      body: 'id,action,actorName,occurredAt\naudit-001,USER_CREATED,System Admin,2024-01-01T00:00:00Z',
    });
  });

  await page.route('**/admin/audit-log**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: MOCK_AUDIT_ENTRIES,
        nextCursor: null,
        totalCount: MOCK_AUDIT_ENTRIES.length,
      }),
    });
  });

  await page.route('**/admin/users**', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], total: 0, page: 1, limit: 100 }),
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

test.describe('AuditLogPage', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin sees audit log table', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('sidebar shows Audit Log link', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await expect(page.getByRole('link', { name: 'Audit Log' })).toBeVisible();
  });

  test('Export CSV button is present', async ({ page }) => {
    await page.goto('/admin/audit-log');
    const exportBtn = page.getByRole('button', { name: /export csv/i });
    await expect(exportBtn).toBeVisible();
  });

  test('Export CSV button triggers download', async ({ page }) => {
    await page.goto('/admin/audit-log');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /export csv/i }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/audit-log.*\.csv/);
  });

  test('action filter dropdown is present', async ({ page }) => {
    await page.goto('/admin/audit-log');
    const actionFilter = page.getByLabel('Action');
    await expect(actionFilter).toBeVisible();
    await expect(actionFilter.locator('option[value="USER_CREATED"]')).toBeAttached();
  });

  test('action filter can be changed', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await page.getByLabel('Action').selectOption('USER_CREATED');
    await expect(page.getByLabel('Action')).toHaveValue('USER_CREATED');
  });

  test('table shows audit log entries', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await page.waitForSelector('tbody tr');
    await expect(page.getByText('System Admin')).toBeVisible();
  });

  test('action codes are displayed in code style', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await page.waitForSelector('tbody tr');
    await expect(page.locator('code').first()).toBeVisible();
  });
});
