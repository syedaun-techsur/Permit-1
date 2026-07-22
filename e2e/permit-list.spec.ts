import { test, expect } from '@playwright/test';

// Seed credentials matching Plan 01-01 seeds
const APPLICANT = { email: 'applicant@permits.local', password: 'Applicant@12345!' };

const mockPermits = [
  {
    id: 'permit-001',
    reference_number: 'REF-2024-001',
    applicant_id: 'user-001',
    status: 'draft',
    permit_type: 'construction',
    project_description: 'Build a new garage',
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
    reference_number: 'REF-2024-002',
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
];

test.describe('Permit List Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth to inject a valid session
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-001',
          email: APPLICANT.email,
          role: 'applicant',
          full_name: 'Jane Smith',
        }),
      });
    });
    // Mock auth refresh
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-access-token' }),
      });
    });
  });

  test('shows skeleton cards while loading', async ({ page }) => {
    // Delay the permits API response
    await page.route('**/permits*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockPermits, nextCursor: null, totalCount: 2 }),
      });
    });

    // Navigate directly to /permits with auth state set
    await page.addInitScript(() => {
      localStorage.setItem(
        'auth-store',
        JSON.stringify({
          state: {
            user: { id: 'user-001', email: 'applicant@permits.local', role: 'applicant' },
            accessToken: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
          },
          version: 0,
        }),
      );
    });

    await page.goto('/permits');

    // Skeleton cards should be visible during loading
    const skeletons = page.locator('[data-testid="permit-card-skeleton"]');
    await expect(skeletons.first()).toBeVisible();
  });

  test('shows empty state when no applications', async ({ page }) => {
    await page.route('**/permits*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], nextCursor: null, totalCount: 0 }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        'auth-store',
        JSON.stringify({
          state: {
            user: { id: 'user-001', email: 'applicant@permits.local', role: 'applicant' },
            accessToken: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
          },
          version: 0,
        }),
      );
    });

    await page.goto('/permits');

    const emptyState = page.locator('[data-testid="empty-state"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No applications yet');

    const newButton = page.locator('[data-testid="empty-state-new-button"]');
    await expect(newButton).toBeVisible();
    await expect(newButton).toHaveAttribute('href', '/permits/new');
  });

  test('renders permit cards with status badges', async ({ page }) => {
    await page.route('**/permits*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockPermits, nextCursor: null, totalCount: 2 }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        'auth-store',
        JSON.stringify({
          state: {
            user: { id: 'user-001', email: 'applicant@permits.local', role: 'applicant' },
            accessToken: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
          },
          version: 0,
        }),
      );
    });

    await page.goto('/permits');

    // Wait for cards to render
    const cards = page.locator('[data-testid="permit-card"]');
    await expect(cards).toHaveCount(2);

    // Check reference numbers
    await expect(page.getByText('REF-2024-001')).toBeVisible();
    await expect(page.getByText('REF-2024-002')).toBeVisible();

    // Check status badges
    const badges = page.locator('[data-testid="permit-status-badge"]');
    await expect(badges.first()).toBeVisible();
  });

  test('draft card shows Continue button, submitted shows View button', async ({ page }) => {
    await page.route('**/permits*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockPermits, nextCursor: null, totalCount: 2 }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        'auth-store',
        JSON.stringify({
          state: {
            user: { id: 'user-001', email: 'applicant@permits.local', role: 'applicant' },
            accessToken: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
          },
          version: 0,
        }),
      );
    });

    await page.goto('/permits');

    await expect(page.locator('[data-testid="continue-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="continue-button"]')).toContainText('Continue');

    await expect(page.locator('[data-testid="view-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="view-button"]')).toContainText('View');
  });

  test('no horizontal scroll at 375px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.route('**/permits*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockPermits, nextCursor: null, totalCount: 2 }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        'auth-store',
        JSON.stringify({
          state: {
            user: { id: 'user-001', email: 'applicant@permits.local', role: 'applicant' },
            accessToken: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
          },
          version: 0,
        }),
      );
    });

    await page.goto('/permits');
    await page.locator('[data-testid="permit-card"]').first().waitFor({ state: 'visible' });

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});
