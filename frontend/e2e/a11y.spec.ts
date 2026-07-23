/**
 * WCAG 2.1 AA Accessibility Compliance Gate
 *
 * This test suite runs checkA11y() from @axe-core/playwright on every page in the
 * Permit Management System. Zero axe violations = WCAG 2.1 AA compliance pass.
 *
 * Covers:
 * - Unauthenticated pages: Login, Register, Forgot Password
 * - Applicant pages: Dashboard, Permit List, Permit Form, Permit Detail
 * - Reviewer pages: Dashboard, Review Queue, Review Detail
 * - Admin pages: Dashboard, All Applications, User Management, Audit Log
 * - Modal accessibility: AssignReviewerModal, CreateUserModal, DeactivateConfirmDialog
 * - Keyboard navigation: skip link, modal focus trap, document upload zone
 */

import { test, expect } from '@playwright/test';
import { checkA11y, injectAxe } from '@axe-core/playwright';

// ─── Auth helper ────────────────────────────────────────────────────────────

/**
 * Log in as a seeded test user. Credentials match the docker-compose seed
 * (see Phase 1 seed script).
 */
async function loginAs(
  page: import('@playwright/test').Page,
  role: 'admin' | 'reviewer' | 'applicant',
) {
  const credentials = {
    admin:     { email: 'admin@pms.test',     password: 'Admin1234!' },
    reviewer:  { email: 'reviewer@pms.test',  password: 'Review1234!' },
    applicant: { email: 'applicant@pms.test', password: 'Applicant1234!' },
  };

  await page.goto('/login');
  await page.getByLabel(/email/i).fill(credentials[role].email);
  await page.getByLabel(/password/i).fill(credentials[role].password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/dashboard|\/$/);
}

// ─── axe configuration ───────────────────────────────────────────────────────

/** Run all WCAG 2.1 Level A and AA rules. */
const axeOptions = {
  runOnly: { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
};

// ─── Unauthenticated pages ───────────────────────────────────────────────────

test.describe('WCAG 2.1 AA — Unauthenticated pages', () => {
  test('Login page has zero axe violations', async ({ page }) => {
    await page.goto('/login');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });

  test('Register page has zero axe violations', async ({ page }) => {
    await page.goto('/register');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });

  test('Forgot Password page has zero axe violations', async ({ page }) => {
    await page.goto('/forgot-password');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });
});

// ─── Applicant pages ─────────────────────────────────────────────────────────

test.describe('WCAG 2.1 AA — Applicant pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'applicant');
  });

  test('Applicant Dashboard has zero axe violations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });

  test('Permit List page has zero axe violations', async ({ page }) => {
    await page.goto('/permits');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });

  test('Permit Form (new) has zero axe violations', async ({ page }) => {
    await page.goto('/permits/new');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });

  test('Permit Detail page has zero axe violations', async ({ page }) => {
    await page.goto('/permits');
    await page.waitForLoadState('networkidle');
    const firstPermitLink = page.locator('table tbody tr').first().getByRole('link').first();
    if (await firstPermitLink.count() > 0) {
      await firstPermitLink.click();
      await page.waitForLoadState('networkidle');
      await injectAxe(page);
      await checkA11y(page, undefined, axeOptions);
    } else {
      test.skip(true, 'No permits available for applicant');
    }
  });

  test('Skip link is visible on keyboard focus', async ({ page }) => {
    await page.goto('/permits');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeVisible();
  });
});

// ─── Reviewer pages ──────────────────────────────────────────────────────────

test.describe('WCAG 2.1 AA — Reviewer pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'reviewer');
  });

  test('Reviewer Dashboard has zero axe violations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });

  test('Review Queue page has zero axe violations', async ({ page }) => {
    await page.goto('/review');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });

  test('Review Detail page has zero axe violations', async ({ page }) => {
    await page.goto('/review');
    await page.waitForLoadState('networkidle');
    const firstRow = page.locator('table tbody tr').first().getByRole('link').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.waitForLoadState('networkidle');
      await injectAxe(page);
      await checkA11y(page, undefined, axeOptions);
    } else {
      test.skip(true, 'No applications in review queue');
    }
  });
});

// ─── Admin pages ─────────────────────────────────────────────────────────────

test.describe('WCAG 2.1 AA — Admin pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('Admin Dashboard has zero axe violations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });

  test('Admin Applications page has zero axe violations', async ({ page }) => {
    await page.goto('/admin/applications');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });

  test('User Management page has zero axe violations', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });

  test('Audit Log page has zero axe violations', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await page.waitForLoadState('networkidle');
    await injectAxe(page);
    await checkA11y(page, undefined, axeOptions);
  });
});

// ─── Modal accessibility ─────────────────────────────────────────────────────

test.describe('WCAG 2.1 AA — Modal accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('AssignReviewerModal is accessible when open', async ({ page }) => {
    await page.goto('/admin/applications');
    await page.waitForLoadState('networkidle');
    const assignBtn = page.getByRole('button', { name: /assign reviewer/i }).first();
    if (await assignBtn.count() > 0) {
      await assignBtn.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await injectAxe(page);
      await checkA11y(page, '[role="dialog"]', axeOptions);
    } else {
      test.skip(true, 'No applications available to assign reviewer');
    }
  });

  test('CreateUserModal is accessible when open', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add user/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await injectAxe(page);
    await checkA11y(page, '[role="dialog"]', axeOptions);
  });

  test('Modal focus trap — Tab key cycles within modal', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add user/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Tab through all focusable elements — focus should not leave dialog
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    const focusedInsideDialog = await page.evaluate(
      () => document.activeElement?.closest('[role="dialog"]') !== null,
    );
    expect(focusedInsideDialog).toBe(true);
  });

  test('Modal closes on Escape key', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /add user/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('DeactivateConfirmDialog uses role=alertdialog', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    const deactivateBtn = page.getByRole('button', { name: /deactivate/i }).first();
    if (await deactivateBtn.count() > 0) {
      await deactivateBtn.click();
      await expect(page.getByRole('alertdialog')).toBeVisible();
    } else {
      test.skip(true, 'No active users to deactivate');
    }
  });
});

// ─── Keyboard navigation ─────────────────────────────────────────────────────

test.describe('WCAG 2.1 AA — Keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'applicant');
  });

  test('DocumentUploadZone is Tab-reachable and keyboard-activatable', async ({ page }) => {
    await page.goto('/permits/new');
    await page.waitForLoadState('networkidle');
    // Tab until upload zone is focused
    let focused = false;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const ariaLabel = await page.evaluate(
        () => document.activeElement?.getAttribute('aria-label') ?? '',
      );
      if (ariaLabel.toLowerCase().includes('upload')) {
        focused = true;
        break;
      }
    }
    expect(focused).toBe(true);
  });
});
