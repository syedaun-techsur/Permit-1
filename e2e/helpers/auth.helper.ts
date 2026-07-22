/**
 * E2E Authentication Helpers — Phase 3 Integration Tests
 *
 * Reusable helpers for Phase 3 E2E specs.
 * Uses page.route() to mock API responses for deterministic testing.
 */
import type { Page } from '@playwright/test';

// ─── Standard test user credentials ──────────────────────────────────────────

export const TEST_USERS = {
  applicant: {
    id: 'e2e-applicant-user-p3-001',
    email: 'e2e-applicant-p3@test.com',
    fullName: 'E2E Applicant P3',
    role: 'applicant' as const,
    password: 'TestPass123!',
  },
  reviewer: {
    id: 'e2e-reviewer-user-p3-001',
    email: 'e2e-reviewer-p3@test.com',
    fullName: 'E2E Reviewer P3',
    role: 'reviewer' as const,
    password: 'TestPass123!',
  },
};

// ─── Login helpers ────────────────────────────────────────────────────────────

/**
 * Login as a specific role by mocking the auth/login API response.
 * Waits for redirect to the role's home page.
 */
export async function loginAs(
  page: Page,
  role: 'applicant' | 'reviewer',
): Promise<void> {
  const user = TEST_USERS[role];

  await page.route('**/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        accessToken: `mock-${role}-token-p3`,
      }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email address').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for redirect to role-appropriate home
  if (role === 'reviewer') {
    await page.waitForURL(/\/reviewer/);
  } else {
    await page.waitForURL(/\/applicant/);
  }
}

// ─── Common API mock setup ────────────────────────────────────────────────────

/**
 * Setup common routes used across most tests (notifications, unread counts).
 */
export function setupCommonRoutes(page: Page): void {
  void page.route('**/notifications/unread-count', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ unreadCount: 0 }),
    });
  });

  void page.route('**/notifications**', (route) => {
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
}

// ─── Permit mock factory ──────────────────────────────────────────────────────

/**
 * Creates a basic permit mock object in submitted state.
 */
export function createMockPermit(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'e2e-permit-p3-001',
    reference_number: 'REF-P3-001',
    applicant_id: TEST_USERS.applicant.id,
    reviewer_id: null,
    status: 'submitted',
    permit_type: 'construction',
    project_description: 'E2E test permit for Phase 3 integration testing.',
    site_street: '1 Test Boulevard',
    site_city: 'E2E City',
    site_state: 'CA',
    site_zip: '90001',
    contact_name: TEST_USERS.applicant.fullName,
    contact_phone: '555-0001',
    contact_email: TEST_USERS.applicant.email,
    applicant_email: TEST_USERS.applicant.email,
    applicant_phone: '555-0001',
    estimated_start_date: '2024-06-01',
    submitted_at: '2024-01-10T09:00:00.000Z',
    created_at: '2024-01-09T12:00:00.000Z',
    updated_at: '2024-01-10T09:00:00.000Z',
    documents: [],
    ...overrides,
  };
}
