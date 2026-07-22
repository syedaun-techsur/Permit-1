import { test, expect } from '@playwright/test';

const mockCreatedPermit = {
  id: 'permit-new-001',
  reference_number: 'REF-2024-003',
  applicant_id: 'user-001',
  status: 'draft',
  permit_type: 'construction',
  project_description: 'Build a new garage with two car spaces',
  site_street: '123 Main St',
  site_city: 'Springfield',
  site_state: 'CA',
  site_zip: '90210',
  contact_name: 'Jane Smith',
  contact_phone: '555-555-5555',
  contact_email: 'jane@example.com',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const mockSubmittedPermit = {
  ...mockCreatedPermit,
  status: 'submitted',
  submitted_at: '2024-01-02T00:00:00.000Z',
};

test.describe('Permit Form Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set auth state
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

    // Mock create permit
    await page.route('**/permits', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(mockCreatedPermit),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], nextCursor: null, totalCount: 0 }),
        });
      }
    });

    // Mock update permit (auto-save)
    await page.route('**/permits/permit-new-001', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...mockCreatedPermit, updated_at: new Date().toISOString() }),
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockCreatedPermit),
        });
      }
    });

    // Mock submit permit
    await page.route('**/permits/permit-new-001/submit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSubmittedPermit),
      });
    });

    // Mock lifecycle
    await page.route('**/permits/*/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ stages: [] }),
      });
    });

    // Mock documents
    await page.route('**/permits/*/documents*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
  });

  test('multi-step form renders with progress stepper', async ({ page }) => {
    await page.goto('/permits/new');

    // Stepper should show 3 steps
    const step1 = page.locator('[data-testid="step-1"]');
    const step2 = page.locator('[data-testid="step-2"]');
    const step3 = page.locator('[data-testid="step-3"]');

    await expect(step1).toBeVisible();
    await expect(step2).toBeVisible();
    await expect(step3).toBeVisible();

    // Step 1 should be active (aria-current="step")
    await expect(step1).toHaveAttribute('aria-current', 'step');

    // Step 1 content should be visible
    await expect(page.locator('[data-testid="step-1-content"]')).toBeVisible();
  });

  test('step 1 form fields validate correctly', async ({ page }) => {
    await page.goto('/permits/new');

    // Select a permit type
    await page.selectOption('select#permitType', 'construction');

    // Fill description (valid)
    await page.fill('textarea#projectDescription', 'Build a new garage with ample space for vehicles');

    // Fill site address with invalid ZIP
    await page.fill('input[placeholder="123 Main St"]', '123 Main St');
    await page.fill('input[placeholder="Springfield"]', 'Springfield');
    await page.fill('input[placeholder="CA"]', 'CA');
    await page.fill('input[placeholder="90210"]', 'INVALID-ZIP');

    // Fill contact info
    await page.fill('input[placeholder="Jane Smith"]', 'Jane Smith');
    await page.fill('input[type="tel"]', '555-555-5555');
    await page.fill('input[type="email"]', 'jane@example.com');

    // Click Next to trigger validation
    await page.click('[data-testid="next-button"]');

    // Should show ZIP validation error inline (not modal)
    const zipError = page.locator('p[role="alert"]').filter({ hasText: /zip code/i });
    await expect(zipError).toBeVisible();
  });

  test('Next button advances to step 2', async ({ page }) => {
    await page.goto('/permits/new');

    // Fill valid step 1 data
    await page.selectOption('select#permitType', 'construction');
    await page.fill('textarea#projectDescription', 'Build a new garage with ample space for two vehicles');
    await page.fill('input[placeholder="123 Main St"]', '123 Main St');
    await page.fill('input[placeholder="Springfield"]', 'Springfield');
    await page.fill('input[placeholder="CA"]', 'CA');
    await page.fill('input[placeholder="90210"]', '90210');
    await page.fill('input[placeholder="Jane Smith"]', 'Jane Smith');
    await page.fill('input[type="tel"]', '555-555-5555');
    await page.fill('input[type="email"]', 'jane@example.com');

    // Click Next
    await page.click('[data-testid="next-button"]');

    // Step 2 content should be visible
    await expect(page.locator('[data-testid="step-2-content"]')).toBeVisible();

    // Stepper step 2 should now be active
    const step2 = page.locator('[data-testid="step-2"]');
    await expect(step2).toHaveAttribute('aria-current', 'step');
  });

  test('auto-save indicator appears after typing', async ({ page }) => {
    await page.goto('/permits/new');

    // Fill minimum valid data to enable auto-save
    await page.selectOption('select#permitType', 'construction');
    await page.fill('textarea#projectDescription', 'Build a new garage with ample space for two vehicles');
    await page.fill('input[placeholder="123 Main St"]', '123 Main St');
    await page.fill('input[placeholder="Springfield"]', 'Springfield');
    await page.fill('input[placeholder="CA"]', 'CA');
    await page.fill('input[placeholder="90210"]', '90210');
    await page.fill('input[placeholder="Jane Smith"]', 'Jane Smith');
    await page.fill('input[type="tel"]', '555-555-5555');
    await page.fill('input[type="email"]', 'jane@example.com');

    // Click Next to create permit (switches to edit mode with ID)
    await page.click('[data-testid="next-button"]');

    // Go back to step 1
    await page.click('[data-testid="back-button"]');

    // Type more in description field to trigger auto-save
    await page.fill('textarea#projectDescription', 'Build a new garage with ample space for three vehicles');

    // Wait for auto-save debounce (2s) + network
    await page.waitForTimeout(2500);

    // Save indicator should show "Saved ✓"
    const saveIndicator = page.locator('[data-testid="save-indicator"]');
    await expect(saveIndicator).toBeVisible();
    await expect(saveIndicator).toContainText('Saved ✓');
  });

  test('submit button calls submit endpoint and navigates', async ({ page }) => {
    await page.goto('/permits/new');

    // Fill valid step 1 data
    await page.selectOption('select#permitType', 'construction');
    await page.fill('textarea#projectDescription', 'Build a new garage with ample space for two vehicles');
    await page.fill('input[placeholder="123 Main St"]', '123 Main St');
    await page.fill('input[placeholder="Springfield"]', 'Springfield');
    await page.fill('input[placeholder="CA"]', 'CA');
    await page.fill('input[placeholder="90210"]', '90210');
    await page.fill('input[placeholder="Jane Smith"]', 'Jane Smith');
    await page.fill('input[type="tel"]', '555-555-5555');
    await page.fill('input[type="email"]', 'jane@example.com');

    // Navigate through steps
    await page.click('[data-testid="next-button"]'); // → step 2
    await expect(page.locator('[data-testid="step-2-content"]')).toBeVisible();

    await page.click('[data-testid="next-button"]'); // → step 3
    await expect(page.locator('[data-testid="step-3-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-summary"]')).toBeVisible();

    // Click submit
    await page.click('[data-testid="submit-button"]');

    // Should navigate to detail view /permits/:id
    await expect(page).toHaveURL(/\/permits\/permit-new-001$/);
  });

  test('no horizontal scroll at 375px viewport on form page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/permits/new');

    // Wait for form to render
    await expect(page.locator('[data-testid="step-1-content"]')).toBeVisible();

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});
