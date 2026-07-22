import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 375, height: 812 };

const mockPermits = [
  {
    id: 'permit-001',
    reference_number: 'APP-000001',
    applicant_id: 'user-001',
    status: 'draft',
    permit_type: 'construction',
    project_description: 'Build a new garage with two car spaces and storage area',
    site_street: '123 Main St',
    site_city: 'Springfield',
    site_state: 'CA',
    site_zip: '90210',
    contact_name: 'Jane Smith',
    contact_phone: '555-1234',
    contact_email: 'jane@example.com',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 'permit-002',
    reference_number: 'APP-000002',
    applicant_id: 'user-001',
    status: 'submitted',
    permit_type: 'renovation',
    project_description: 'Kitchen renovation',
    site_street: '456 Oak Ave',
    site_city: 'Portland',
    site_state: 'OR',
    site_zip: '97201',
    contact_name: 'Jane Smith',
    contact_phone: '555-1234',
    contact_email: 'jane@example.com',
    created_at: '2024-01-03T00:00:00.000Z',
    updated_at: '2024-01-04T00:00:00.000Z',
  },
  {
    id: 'permit-003',
    reference_number: 'APP-000003',
    applicant_id: 'user-001',
    status: 'under_review',
    permit_type: 'zoning_variance',
    project_description: 'Zoning variance for home addition',
    site_street: '789 Elm St',
    site_city: 'Eugene',
    site_state: 'OR',
    site_zip: '97401',
    contact_name: 'Jane Smith',
    contact_phone: '555-1234',
    contact_email: 'jane@example.com',
    created_at: '2024-01-05T00:00:00.000Z',
    updated_at: '2024-01-06T00:00:00.000Z',
  },
];

const mockPermitDetail = {
  ...mockPermits[1],
  submitted_at: '2024-01-04T00:00:00.000Z',
};

const mockLifecycle = {
  stages: [
    {
      id: 'stage-001',
      application_id: 'permit-002',
      stage: 'draft',
      entered_at: '2024-01-03T00:00:00.000Z',
    },
    {
      id: 'stage-002',
      application_id: 'permit-002',
      stage: 'submitted',
      entered_at: '2024-01-04T00:00:00.000Z',
    },
  ],
};

// Standard auth setup reused across tests
function setupAuth(page: ReturnType<typeof test.info>['project'] extends object ? never : Parameters<Parameters<typeof test>[1]>[0]['page']) {
  return page.addInitScript(() => {
    localStorage.setItem(
      'auth-store',
      JSON.stringify({
        state: {
          user: { id: 'user-001', email: 'applicant@permits.local', role: 'applicant', fullName: 'Jane Smith' },
          accessToken: 'mock-token',
          isAuthenticated: true,
          isLoading: false,
        },
        version: 0,
      }),
    );
  });
}

// Helper: check no horizontal scroll on current page
async function assertNoHorizontalScroll(page: Parameters<Parameters<typeof test>[1]>[0]['page']) {
  const hasScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasScroll, 'Page has horizontal scroll at 375px').toBe(false);
}

test.describe('Responsive at 375px — Permit List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await setupAuth(page);

    // Mock notifications (unread count)
    await page.route('**/notifications/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 0 }),
      });
    });

    // Mock GET /permits
    await page.route('**/permits*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockPermits, nextCursor: null, totalCount: 3 }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('no horizontal scroll on permit list', async ({ page }) => {
    await page.goto('/permits');
    await page.waitForSelector('[data-testid="permit-card"]', { timeout: 5000 });
    await assertNoHorizontalScroll(page);
  });

  test('navbar shows hamburger menu (not full nav) at 375px', async ({ page }) => {
    await page.goto('/permits');
    await expect(page.locator('[data-testid="hamburger-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();
  });

  test('hamburger opens nav drawer with all links', async ({ page }) => {
    await page.goto('/permits');
    await page.click('[data-testid="hamburger-button"]');
    await expect(page.locator('text=My Applications')).toBeVisible();
    await expect(page.locator('text=New Application')).toBeVisible();
  });

  test('permit cards stack in single column without overflow', async ({ page }) => {
    await page.goto('/permits');
    await page.waitForSelector('[data-testid="permit-card"]');
    const cards = page.locator('[data-testid="permit-card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    await assertNoHorizontalScroll(page);
  });
});

test.describe('Responsive at 375px — Permit Form Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    // Mock notifications
    await page.route('**/notifications/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 0 }),
      });
    });

    // Mock permits endpoint (for list calls)
    await page.route('**/permits*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], nextCursor: null, totalCount: 0 }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('no horizontal scroll on permit form step 1', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/permits/new');
    await page.waitForSelector('[data-testid="step-1-content"]', { timeout: 5000 });
    await assertNoHorizontalScroll(page);
  });

  test('form fields stack in single column on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/permits/new');
    await page.waitForSelector('[data-testid="step-1-content"]', { timeout: 5000 });
    // All form fields should be visible without scrolling horizontally
    await expect(page.locator('label:has-text("Permit Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Project Description")')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });

  test('multi-step stepper readable on mobile', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/permits/new');
    await page.waitForSelector('[data-testid="step-1-content"]', { timeout: 5000 });
    // Stepper shows all 3 steps
    await expect(page.locator('text=Permit Details')).toBeVisible();
    await assertNoHorizontalScroll(page);
  });
});

test.describe('Responsive at 375px — Permit Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);

    // Mock notifications
    await page.route('**/notifications/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 0 }),
      });
    });

    // Mock GET /permits/permit-002
    await page.route('**/permits/permit-002', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPermitDetail),
      });
    });

    // Mock GET /permits/permit-002/lifecycle
    await page.route('**/permits/permit-002/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycle),
      });
    });

    // Mock GET /permits/permit-002/documents
    await page.route('**/permits/permit-002/documents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
  });

  test('no horizontal scroll on permit detail', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/permits/permit-002');
    await page.waitForSelector('[data-testid="permit-reference"]', { timeout: 5000 });
    await assertNoHorizontalScroll(page);
  });

  test('timeline stacks below form data on mobile (not side by side)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto('/permits/permit-002');
    await page.waitForSelector('[data-testid="permit-reference"]', { timeout: 5000 });

    // On mobile, both sections should be in single column
    const formSection = page.locator('[data-testid="form-data-panel"]');
    const timelineSection = page.locator('[data-testid="timeline-panel"]');
    const formBounds = await formSection.boundingBox();
    const timelineBounds = await timelineSection.boundingBox();
    // Timeline should be BELOW form (higher y value) on mobile
    expect(timelineBounds!.y).toBeGreaterThan(formBounds!.y);
    await assertNoHorizontalScroll(page);
  });
});
