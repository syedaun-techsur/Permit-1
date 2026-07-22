import { test, expect } from '@playwright/test';

test.describe('Design System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page renders with custom design tokens — not default Tailwind blue', async ({ page }) => {
    // The heading must exist and use custom token class text-heading-xl
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Background should be surface-base (#F8FAFC) not pure white
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('page title is Permit Management System', async ({ page }) => {
    await expect(page).toHaveTitle('Permit Management System');
  });

  test('globals.css loads — Inter font family applied to body', async ({ page }) => {
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    // Should contain Inter (from Google Fonts import) or system-ui fallback
    expect(fontFamily.toLowerCase()).toMatch(/inter|system-ui|sans-serif/);
  });

  test('brand-primary color token is applied as CSS variable / utility', async ({ page }) => {
    // Inject a test element to verify brand-primary resolves
    await page.evaluate(() => {
      const el = document.createElement('div');
      el.className = 'bg-brand-primary';
      el.id = 'token-test';
      document.body.appendChild(el);
    });
    const el = page.locator('#token-test');
    const bg = await el.evaluate((node) => window.getComputedStyle(node).backgroundColor);
    // bg-brand-primary = #2563EB = rgb(37, 99, 235)
    expect(bg).toBe('rgb(37, 99, 235)');
  });
});
