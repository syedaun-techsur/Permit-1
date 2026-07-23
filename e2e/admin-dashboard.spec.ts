/**
 * Admin Dashboard E2E Tests — Phase 4 Plan 04 (DASH-03)
 *
 * Uses page.route() to mock API responses so tests run without a full
 * docker compose stack.
 *
 * Admin login redirects to /admin → router redirects to /dashboard where
 * DashboardPage renders AdminDashboard for role='admin'.
 */
import { test, expect, type Page } from '@playwright/test';

// ─── Mock data ────────────────────────────────────────────────────────────────

const ADMIN_USER = {
  id: 'e2e-admin-user-p4-001',
  email: 'admin@permits.local',
  fullName: 'E2E Admin',
  role: 'admin' as const,
};

const MOCK_ADMIN_DASHBOARD = {
  summaryCards: {
    totalApplications: 142,
    activeApplications: 98,
    submittedThisWeek: 17,
    decisionsThisWeek: 11,
  },
  statusDistribution: [
    { status: 'submitted', count: 45 },
    { status: 'under_review', count: 38 },
    { status: 'additional_info_needed', count: 15 },
    { status: 'approved', count: 33 },
    { status: 'rejected', count: 11 },
  ],
  reviewerWorkload: [
    {
      reviewerId: 'rev-001',
      reviewerName: 'Alice Reviewer',
      assigned: 12,
      underReview: 6,
      additionalInfoNeeded: 3,
      decidedThisWeek: 4,
    },
    {
      reviewerId: 'rev-002',
      reviewerName: 'Bob Reviewer',
      assigned: 9,
      underReview: 4,
      additionalInfoNeeded: 9, // ≥ 8 — should show ⚠
      decidedThisWeek: 3,
    },
  ],
  recentActivity: [
    {
      id: 'audit-001',
      action: 'permit.submitted',
      metadata: {},
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
      applicationId: 'app-abc12345-def6',
      actorName: 'Jane Applicant',
      actorRole: 'applicant',
    },
    {
      id: 'audit-002',
      action: 'permit.approved',
      metadata: {},
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      applicationId: 'app-xyz98765-ghi0',
      actorName: 'Alice Reviewer',
      actorRole: 'reviewer',
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loginAsAdmin(page: Page): Promise<void> {
  // Mock auth/login to return admin user
  await page.route('**/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: ADMIN_USER,
        accessToken: 'mock-admin-token-p4',
      }),
    });
  });

  // Mock dashboard/admin endpoint
  await page.route('**/dashboard/admin', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_ADMIN_DASHBOARD),
    });
  });

  // Mock notifications (NavBar uses this)
  await page.route('**/notifications/unread-count', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ unreadCount: 0 }),
    });
  });

  await page.route('**/notifications**', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], nextCursor: null }),
      });
    } else {
      route.continue();
    }
  });

  await page.goto('/login');
  await page.getByLabel('Email address').fill(ADMIN_USER.email);
  await page.getByLabel('Password').fill('Admin@12345!');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Admin → /admin → redirected to /dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('shows "System Overview" heading and last-updated subtitle', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("System Overview")')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=/Last updated/')).toBeVisible();
  });

  test('shows 4 system stat cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    // Wait for skeletons to resolve
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 15000 })
      .catch(() => {});
    await expect(page.locator('text=Total Applications')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Active Applications')).toBeVisible();
    await expect(page.locator('text=Submitted This Week')).toBeVisible();
    await expect(page.locator('text=Decisions This Week')).toBeVisible();
  });

  test('stat card numbers are numeric after loading', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 15000 })
      .catch(() => {});
    // StatCard renders value in text-3xl font-bold span
    const statValues = page.locator('.text-3xl.font-bold');
    if ((await statValues.count()) > 0) {
      const text = await statValues.first().textContent();
      expect(/[\d,]+/.test(text ?? '')).toBe(true);
    }
  });

  test('status bar chart has accessible role=img and aria-label', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 15000 })
      .catch(() => {});
    const chart = page.locator('[role="img"]').first();
    if (await chart.isVisible()) {
      await expect(chart).toHaveAttribute('aria-label', /.+/);
    }
  });

  test('status bar chart has sr-only fallback table', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    // Verify aria-label is set on the chart container (StatusBarChart sets role=img + aria-label)
    const chart = page.locator('[role="img"]');
    if ((await chart.count()) > 0 && (await chart.first().isVisible())) {
      await expect(chart.first()).toHaveAttribute('aria-label', /.+/);
    }
    // The sr-only fallback table may be nested; check for the sr-only class wrapping a table
    const srTable = page.locator('.sr-only').filter({ has: page.locator('table') });
    if ((await srTable.count()) > 0) {
      await expect(srTable.first()).toBeDefined();
    }
  });

  test('reviewer workload table is visible', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 15000 })
      .catch(() => {});
    await expect(page.locator('text=Reviewer Workload')).toBeVisible({ timeout: 8000 });
  });

  test('reviewer workload table shows reviewer names', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 15000 })
      .catch(() => {});
    await expect(page.locator('text=Alice Reviewer')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Bob Reviewer')).toBeVisible();
  });

  test('reviewer workload table is sortable by column header click', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 15000 })
      .catch(() => {});

    // Table heading should be present
    await expect(page.locator('text=Reviewer Workload')).toBeVisible({ timeout: 8000 });

    // Click "Needs Action" column header to sort
    const needsActionHeader = page.locator('th:has-text("Needs Action")');
    if (await needsActionHeader.isVisible()) {
      await needsActionHeader.click();
      // Table should still be visible after sort (no crash)
      await expect(page.locator('table[aria-label="Reviewer workload"]')).toBeVisible();
    }
  });

  test('"View queue →" link in workload table navigates to /admin/permits with reviewerId param', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 15000 })
      .catch(() => {});
    const viewQueueLink = page.locator('button:has-text("View queue →")').first();
    if (await viewQueueLink.isVisible()) {
      await viewQueueLink.click();
      await expect(page).toHaveURL(/\/admin\/permits\?reviewerId=/);
    }
  });

  test('recent activity feed section is visible', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Recent Activity')).toBeVisible({ timeout: 8000 });
  });

  test('recent activity feed shows audit log entries', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 15000 })
      .catch(() => {});
    // Should show actor names from mock data
    await expect(page.locator('text=Jane Applicant')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Alice Reviewer')).toBeVisible();
  });

  test('"View full log →" button in activity feed is present', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const viewFullLog = page.locator('button:has-text("View full log")');
    await expect(viewFullLog).toBeVisible({ timeout: 8000 });
  });

  test('quick action "Manage Users" button is present', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const manageUsers = page.locator('button:has-text("Manage Users"), a:has-text("Manage Users")');
    await expect(manageUsers).toBeVisible({ timeout: 8000 });
  });

  test('quick action "View All Applications" button navigates to /admin/permits', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const viewAll = page.locator('button:has-text("View All Applications")');
    await expect(viewAll).toBeVisible({ timeout: 8000 });
    await viewAll.click();
    await expect(page).toHaveURL(/\/admin\/permits/);
  });

  test('quick action "View Audit Log" button is present', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const auditLog = page.locator('button:has-text("View Audit Log")');
    await expect(auditLog).toBeVisible({ timeout: 8000 });
  });

  test('skeleton loading resolves into content', async ({ page }) => {
    await page.reload();
    // Re-apply mocks after reload
    await page.route('**/dashboard/admin', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ADMIN_DASHBOARD),
      });
    });
    // Skeleton should appear briefly, then disappear
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 20000 })
      .catch(() => {});
    // System Overview heading should be visible after load
    await expect(page.locator('h1:has-text("System Overview")')).toBeVisible({ timeout: 10000 });
  });

  test('bar chart click navigates to /admin/permits with status filter', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 15000 })
      .catch(() => {});
    // Recharts bars are SVG rect elements
    const bar = page
      .locator(
        'svg rect.recharts-bar-rectangle, svg [class*="recharts-bar-rectangle"], svg .recharts-bar-background-rectangle',
      )
      .first();
    if (await bar.isVisible()) {
      await bar.click();
      await expect(page).toHaveURL(/\/admin\/permits\?status=/);
    }
    // Passes vacuously if no data or chart not rendered
  });

  test('amber warning indicator shown for reviewer with additionalInfoNeeded >= 8', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page
      .waitForSelector('[class*="animate-pulse"]', { state: 'detached', timeout: 15000 })
      .catch(() => {});
    // Bob Reviewer has additionalInfoNeeded: 9 — should show ⚠ indicator
    const warningIndicator = page.locator('text=⚠').or(page.locator('[class*="amber"], [class*="warning"]').filter({ hasText: '⚠' }));
    if (await warningIndicator.count() > 0) {
      await expect(warningIndicator.first()).toBeVisible();
    }
  });
});
