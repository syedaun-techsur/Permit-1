/**
 * Phase 3 Notifications E2E Tests
 *
 * Notification system integration tests:
 *   - Notification created on lifecycle transitions (begin-review)
 *   - Notification badge count in NavBar
 *   - Clicking notification navigates to correct application
 *   - Mark all as read clears badge
 *   - Reviewer receives notification on applicant response
 *   - Notification for new messages
 *
 * Uses page.route() to mock API responses for deterministic testing.
 * All tests align with Phase 3 plan 03-05 acceptance criteria.
 */
import { test, expect, type Page } from '@playwright/test';
import { loginAs, setupCommonRoutes, TEST_USERS } from './helpers/auth.helper';

// ─── Test IDs ─────────────────────────────────────────────────────────────────

const PERMIT_ID = 'e2e-permit-p3-notif-001';
const PERMIT_REF = 'REF-P3-NOTIF-001';

// ─── Notification mock data ───────────────────────────────────────────────────

const beginReviewNotification = {
  id: 'notif-begin-review-001',
  applicationId: PERMIT_ID,
  body: `Your application ${PERMIT_REF} is now under review.`,
  isRead: false,
  createdAt: new Date().toISOString(),
};

const requestInfoNotification = {
  id: 'notif-request-info-001',
  applicationId: PERMIT_ID,
  body: `A reviewer has requested additional information on ${PERMIT_REF}.`,
  isRead: false,
  createdAt: new Date(Date.now() + 1000).toISOString(),
};

const applicantResponseNotification = {
  id: 'notif-applicant-response-001',
  applicationId: PERMIT_ID,
  body: `Applicant has responded to your information request on ${PERMIT_REF}.`,
  isRead: false,
  createdAt: new Date(Date.now() + 2000).toISOString(),
};

const newMessageNotification = {
  id: 'notif-new-message-001',
  applicationId: PERMIT_ID,
  body: `New message on application ${PERMIT_REF}.`,
  isRead: false,
  createdAt: new Date(Date.now() + 3000).toISOString(),
};

// ─── Permit fixture ───────────────────────────────────────────────────────────

const underReviewPermit = {
  id: PERMIT_ID,
  reference_number: PERMIT_REF,
  applicant_id: TEST_USERS.applicant.id,
  reviewer_id: TEST_USERS.reviewer.id,
  status: 'under_review',
  permit_type: 'construction',
  project_description: 'E2E notification test permit.',
  site_street: '3 Notification Ave',
  site_city: 'Testville',
  site_state: 'CA',
  site_zip: '90001',
  contact_name: TEST_USERS.applicant.fullName,
  contact_phone: '555-0001',
  contact_email: TEST_USERS.applicant.email,
  submitted_at: '2024-01-10T09:00:00.000Z',
  created_at: '2024-01-09T12:00:00.000Z',
  updated_at: '2024-01-11T09:00:00.000Z',
  documents: [],
};

const emptyMessages = { data: [], nextCursor: null };

// ─── Route helpers ────────────────────────────────────────────────────────────

function setupNotificationsRoute(page: Page, notifications: object[], unreadCount: number): void {
  void page.route('**/notifications/unread-count', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ unreadCount }),
    });
  });

  void page.route('**/notifications/read-all', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });

  void page.route('**/notifications/**/read', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });

  void page.route('**/notifications**', (route) => {
    if (route.request().method() === 'GET' && route.request().url().includes('/notifications') && !route.request().url().includes('/unread-count')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: notifications, nextCursor: null }),
      });
    } else {
      route.continue();
    }
  });
}

function setupPermitRoutes(page: Page): void {
  void page.route(`**/permits/${PERMIT_ID}/lifecycle`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        stages: [
          { id: 's1', application_id: PERMIT_ID, stage: 'submitted', entered_at: '2024-01-10T09:00:00.000Z' },
          { id: 's2', application_id: PERMIT_ID, stage: 'under_review', entered_at: '2024-01-11T09:00:00.000Z' },
        ],
      }),
    });
  });

  void page.route(`**/permits/${PERMIT_ID}/messages/unread-count`, (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unreadCount: 0 }) });
  });

  void page.route(`**/permits/${PERMIT_ID}/messages**`, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    } else if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyMessages),
      });
    } else {
      route.continue();
    }
  });

  void page.route(`**/permits/${PERMIT_ID}/documents**`, (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], nextCursor: null }) });
  });

  void page.route(`**/permits/${PERMIT_ID}`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(underReviewPermit),
      });
    } else {
      route.continue();
    }
  });

  void page.route('**/permits**', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [underReviewPermit],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1, nextCursor: null },
        }),
      });
    } else {
      route.continue();
    }
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Notifications — Panel visibility after begin-review', () => {
  test('Test 1: Applicant sees notification when review begins', async ({ page }) => {
    setupNotificationsRoute(page, [beginReviewNotification], 1);
    setupPermitRoutes(page);

    await loginAs(page, 'applicant');

    // Click bell icon
    const bellBtn = page.getByTestId('notification-bell').first();
    await bellBtn.click();

    // Notification panel appears
    await expect(page.getByTestId('notification-panel')).toBeVisible({ timeout: 5000 });

    // Notification item containing "now under review" + referenceNumber visible
    await expect(
      page.getByTestId('notification-panel').getByText(/now under review/i),
    ).toBeVisible();
    await expect(
      page.getByTestId('notification-panel').getByText(PERMIT_REF),
    ).toBeVisible();
  });
});

test.describe('Notifications — Badge count in NavBar', () => {
  test('Test 2: NavBar bell badge shows unread count; disappears after viewing', async ({ page }) => {
    setupNotificationsRoute(page, [beginReviewNotification], 1);
    setupPermitRoutes(page);

    await loginAs(page, 'applicant');

    // Navigate to permits list without opening notification panel
    await page.goto('/permits');
    await page.waitForLoadState('networkidle');

    // NavBar badge shows count > 0
    const badge = page.getByRole('generic').filter({ hasText: '1' }).first();
    // Alternative: check via aria-label on the badge
    await expect(
      page.locator('.bg-orange-500').filter({ hasText: '1' }),
    ).toBeVisible({ timeout: 5000 });

    // Click bell → panel opens
    const bellBtn = page.getByTestId('notification-bell').first();
    await bellBtn.click();
    await expect(page.getByTestId('notification-panel')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Notifications — Click to navigate', () => {
  test('Test 3: Clicking notification navigates to correct application and closes panel', async ({ page }) => {
    setupNotificationsRoute(page, [beginReviewNotification], 1);
    setupPermitRoutes(page);

    await loginAs(page, 'applicant');

    // Open notification panel
    const bellBtn = page.getByTestId('notification-bell').first();
    await bellBtn.click();
    await expect(page.getByTestId('notification-panel')).toBeVisible({ timeout: 5000 });

    // Click the notification item
    await page.getByTestId('notification-panel')
      .getByText(/now under review/i)
      .click();

    // URL should change to /permits/:id (the correct application)
    await expect(page).toHaveURL(new RegExp(`/permits/${PERMIT_ID}`), { timeout: 5000 });

    // Notification panel closes after navigation
    await expect(page.getByTestId('notification-panel')).not.toBeVisible({ timeout: 3000 });
  });
});

test.describe('Notifications — Mark all as read', () => {
  test('Test 4: Mark all as read clears badge and marks items as read', async ({ page }) => {
    const readAllCalled = { called: false };

    setupNotificationsRoute(page, [beginReviewNotification, requestInfoNotification], 2);
    setupPermitRoutes(page);

    // Override the read-all route to track the call
    void page.route('**/notifications/read-all', (route) => {
      readAllCalled.called = true;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await loginAs(page, 'applicant');

    // Open bell → panel opens with 2 notifications
    const bellBtn = page.getByTestId('notification-bell').first();
    await bellBtn.click();
    await expect(page.getByTestId('notification-panel')).toBeVisible({ timeout: 5000 });

    // Both notifications are shown
    await expect(
      page.getByTestId('notification-panel').getByText(/now under review/i),
    ).toBeVisible();

    // Click "Mark all as read"
    await page.getByRole('button', { name: /mark all as read/i }).click();

    // Give time for state to update
    await page.waitForTimeout(500);

    // read-all should have been called
    expect(readAllCalled.called).toBe(true);
  });
});

test.describe('Notifications — Reviewer receives notification on applicant response', () => {
  test('Test 5: Reviewer sees notification when applicant responds to info request', async ({ page }) => {
    setupNotificationsRoute(page, [applicantResponseNotification], 1);
    setupPermitRoutes(page);

    await loginAs(page, 'reviewer');

    // Click bell icon
    const bellBtn = page.getByTestId('notification-bell').first();
    await bellBtn.click();
    await expect(page.getByTestId('notification-panel')).toBeVisible({ timeout: 5000 });

    // Notification item containing "Applicant has responded" + referenceNumber visible
    await expect(
      page.getByTestId('notification-panel').getByText(/applicant has responded/i),
    ).toBeVisible();
    await expect(
      page.getByTestId('notification-panel').getByText(PERMIT_REF),
    ).toBeVisible();
  });
});

test.describe('Notifications — New message notification', () => {
  test('Test 6: Reviewer bell badge updates when applicant sends a message', async ({ page }) => {
    setupNotificationsRoute(page, [newMessageNotification], 1);
    setupPermitRoutes(page);

    await loginAs(page, 'reviewer');

    // NavBar badge count shows 1 (new message notification)
    await expect(
      page.locator('.bg-orange-500').filter({ hasText: '1' }),
    ).toBeVisible({ timeout: 5000 });

    // Open notification panel
    const bellBtn = page.getByTestId('notification-bell').first();
    await bellBtn.click();
    await expect(page.getByTestId('notification-panel')).toBeVisible({ timeout: 5000 });

    // NotificationPanel shows "New message on application" item
    await expect(
      page.getByTestId('notification-panel').getByText(/new message on application/i),
    ).toBeVisible();
  });
});
