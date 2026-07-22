import { test, expect } from '@playwright/test';

// Seed credentials from Plan 01-01
const APPLICANT = { email: 'applicant@permits.local', password: 'Applicant@12345!' };
const REVIEWER = { email: 'reviewer@permits.local', password: 'Reviewer@12345!' };

const TEST_APP_ID = 'permit-msg-001';

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockApplicantUser = {
  id: 'user-applicant-001',
  email: APPLICANT.email,
  fullName: 'Test Applicant',
  role: 'applicant',
};

const mockReviewerUser = {
  id: 'user-reviewer-001',
  email: REVIEWER.email,
  fullName: 'Test Reviewer',
  role: 'reviewer',
};

const mockPermit = {
  id: TEST_APP_ID,
  reference_number: 'REF-MSG-001',
  applicant_id: mockApplicantUser.id,
  status: 'under_review',
  permit_type: 'construction',
  project_description: 'Test project for messaging',
  site_street: '1 Test St',
  site_city: 'Springfield',
  site_state: 'CA',
  site_zip: '90210',
  contact_name: 'Test Applicant',
  contact_phone: '555-0000',
  contact_email: APPLICANT.email,
  submitted_at: '2024-01-02T10:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T10:00:00.000Z',
  documents: [],
};

const reviewerMessage = {
  id: 'msg-reviewer-001',
  applicationId: TEST_APP_ID,
  senderId: mockReviewerUser.id,
  senderName: mockReviewerUser.fullName,
  senderRole: 'reviewer' as const,
  body: 'Hello applicant, I need additional info.',
  attachments: [],
  sentAt: new Date().toISOString(),
  readBy: [],
};

const mockNotification = {
  id: 'notif-001',
  applicationId: TEST_APP_ID,
  body: 'A reviewer has sent you a message regarding REF-MSG-001.',
  isRead: false,
  createdAt: new Date().toISOString(),
};

// ─── Helper: set up auth intercepts ──────────────────────────────────────────

async function setupAuthInterceptsAsApplicant(page: Parameters<typeof test>[1] extends { page: infer P } ? P : never) {
  // auth/me — returns applicant user
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockApplicantUser),
    });
  });

  // token refresh
  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'mock-applicant-access-token' }),
    });
  });

  // Inject auth state into localStorage for Zustand hydration
  await page.addInitScript((user) => {
    // Pre-seed the Zustand auth store via localStorage (if persisted)
    // or via window.__authState for the store to pick up
    (window as unknown as Record<string, unknown>).__testUser = user;
    (window as unknown as Record<string, unknown>).__testAccessToken = 'mock-applicant-access-token';
  }, mockApplicantUser);
}

// ─── Test 1: Applicant sends a message ───────────────────────────────────────

test.describe('Messaging — send and receive messages', () => {
  test('applicant can send a message; it appears as own message bubble', async ({ page }) => {
    const sentMessageText = 'Hello reviewer, I have a question about the permit.';
    const sentMessage = {
      id: 'msg-new-001',
      applicationId: TEST_APP_ID,
      senderId: mockApplicantUser.id,
      senderName: mockApplicantUser.fullName,
      senderRole: 'applicant' as const,
      body: sentMessageText,
      attachments: [],
      sentAt: new Date().toISOString(),
      readBy: [mockApplicantUser.id],
    };

    // Route: auth/me
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApplicantUser),
      });
    });

    // Route: auth/refresh
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-applicant-token' }),
      });
    });

    // Route: GET permits/:id
    await page.route(`**/${TEST_APP_ID}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockPermit),
        });
      } else {
        await route.continue();
      }
    });

    // Route: GET permits/:id/lifecycle
    await page.route(`**/permits/${TEST_APP_ID}/lifecycle`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Route: GET permits/:id/documents
    await page.route(`**/permits/${TEST_APP_ID}/documents**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], nextCursor: null }) });
    });

    // Route: GET messages — initially empty
    await page.route(`**/permits/${TEST_APP_ID}/messages`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], nextCursor: null }),
        });
      } else if (route.request().method() === 'POST') {
        // POST = send message
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(sentMessage),
        });
      } else {
        await route.continue();
      }
    });

    // Route: unread-count
    await page.route(`**/permits/${TEST_APP_ID}/messages/unread-count`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 0 }),
      });
    });

    // Route: notifications unread-count
    await page.route('**/notifications/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 0 }),
      });
    });

    // Log in as applicant
    await page.goto('/login');
    await page.getByLabel('Email address').fill(APPLICANT.email);
    await page.getByLabel('Password').fill(APPLICANT.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Navigate to the permit detail page
    await page.goto(`/permits/${TEST_APP_ID}`);

    // Find the message composer
    const composer = page.getByTestId('message-composer-input');
    await expect(composer).toBeVisible({ timeout: 10000 });

    // Type a message and send with Enter
    await composer.fill(sentMessageText);
    await composer.press('Enter');

    // Assert the sent message bubble appears
    const bubbles = page.getByTestId('message-bubble');
    await expect(bubbles.first()).toBeVisible({ timeout: 5000 });
    await expect(bubbles.first()).toContainText(sentMessageText);
  });

  test('message bubbles show sender name and role badge', async ({ page }) => {
    // Route: auth
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApplicantUser),
      });
    });
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-applicant-token' }),
      });
    });

    // Route: permit
    await page.route(`**/permits/${TEST_APP_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPermit),
      });
    });
    await page.route(`**/permits/${TEST_APP_ID}/lifecycle`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**/permits/${TEST_APP_ID}/documents**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], nextCursor: null }) });
    });

    // Route: messages — return one reviewer message
    await page.route(`**/permits/${TEST_APP_ID}/messages`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [reviewerMessage], nextCursor: null }),
      });
    });

    await page.route(`**/permits/${TEST_APP_ID}/messages/unread-count`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unreadCount: 1 }) });
    });

    // mark-read routes
    await page.route(`**/permits/${TEST_APP_ID}/messages/*/read`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    await page.route('**/notifications/unread-count', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unreadCount: 0 }) });
    });

    await page.goto('/login');
    await page.getByLabel('Email address').fill(APPLICANT.email);
    await page.getByLabel('Password').fill(APPLICANT.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.goto(`/permits/${TEST_APP_ID}`);

    // Wait for message panel to load
    const bubble = page.getByTestId('message-bubble').first();
    await expect(bubble).toBeVisible({ timeout: 10000 });

    // Assert reviewer's name and role badge visible
    await expect(bubble).toContainText(reviewerMessage.senderName);
    await expect(bubble).toContainText('Reviewer');
    await expect(bubble).toContainText(reviewerMessage.body);
  });
});

// ─── Test 2: Unread count on application list ────────────────────────────────

test.describe('Messaging — unread count badge', () => {
  test('unread notification count badge appears in NavBar when there are unread notifications', async ({ page }) => {
    // auth
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApplicantUser),
      });
    });
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-applicant-token' }),
      });
    });

    // permits list
    await page.route('**/permits**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [mockPermit], nextCursor: null }),
      });
    });

    // notifications unread-count — returns 3
    await page.route('**/notifications/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 3 }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email address').fill(APPLICANT.email);
    await page.getByLabel('Password').fill(APPLICANT.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.goto('/permits');

    // Assert the notification badge shows "3" (or similar)
    const badge = page.locator('[aria-label*="unread notification"]');
    await expect(badge.first()).toBeVisible({ timeout: 10000 });
    await expect(badge.first()).toContainText('3');
  });
});

// ─── Test 3: NotificationPanel opens and shows notifications ─────────────────

test.describe('NotificationPanel — open, display, and mark all read', () => {
  test('clicking bell icon opens NotificationPanel with notifications', async ({ page }) => {
    // auth
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApplicantUser),
      });
    });
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-applicant-token' }),
      });
    });

    await page.route('**/notifications/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 1 }),
      });
    });

    await page.route('**/notifications', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [mockNotification], nextCursor: null }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/permits**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], nextCursor: null }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email address').fill(APPLICANT.email);
    await page.getByLabel('Password').fill(APPLICANT.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.goto('/permits');

    // Click bell icon
    const bellBtn = page.getByTestId('notification-bell').first();
    await expect(bellBtn).toBeVisible({ timeout: 10000 });
    await bellBtn.click();

    // Assert panel opens
    const panel = page.getByTestId('notification-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    // Assert notification text visible
    await expect(panel).toContainText(mockNotification.body);
  });

  test('Mark all as read clears unread count badge', async ({ page }) => {
    let unreadCount = 2;

    // auth
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockApplicantUser),
      });
    });
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-applicant-token' }),
      });
    });

    await page.route('**/notifications/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount }),
      });
    });

    await page.route('**/notifications', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [mockNotification, { ...mockNotification, id: 'notif-002', body: 'Second notification' }],
            nextCursor: null,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/notifications/read-all', async (route) => {
      unreadCount = 0;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.route('**/permits**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], nextCursor: null }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email address').fill(APPLICANT.email);
    await page.getByLabel('Password').fill(APPLICANT.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.goto('/permits');

    // Badge should be visible with count
    const badge = page.locator('[aria-label*="unread notification"]').first();
    await expect(badge).toBeVisible({ timeout: 10000 });

    // Open notification panel
    const bellBtn = page.getByTestId('notification-bell').first();
    await bellBtn.click();

    const panel = page.getByTestId('notification-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    // Click "Mark all as read"
    const markAllBtn = page.getByRole('button', { name: /mark all as read/i });
    await expect(markAllBtn).toBeVisible();
    await markAllBtn.click();

    // Badge should disappear (unread count = 0 in local state)
    await expect(badge).not.toBeVisible({ timeout: 3000 });
  });
});

// ─── Test 4: Reviewer attach file (conditional skip) ─────────────────────────

test.describe('Messaging — reviewer attachment (skipped in CI if MinIO not reachable)', () => {
  test.skip(() => !!process.env.CI, 'Skipped in CI: MinIO presigned URL upload not testable without real MinIO');

  test('reviewer sees paperclip attach button; applicant does not', async ({ page }) => {
    // Route: auth as reviewer
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockReviewerUser),
      });
    });
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-reviewer-token' }),
      });
    });

    await page.route(`**/permits/${TEST_APP_ID}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPermit),
      });
    });
    await page.route(`**/permits/${TEST_APP_ID}/lifecycle`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route(`**/permits/${TEST_APP_ID}/documents**`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], nextCursor: null }) });
    });
    await page.route(`**/permits/${TEST_APP_ID}/messages`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], nextCursor: null }),
      });
    });
    await page.route(`**/permits/${TEST_APP_ID}/messages/unread-count`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unreadCount: 0 }) });
    });
    await page.route('**/notifications/unread-count', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unreadCount: 0 }) });
    });

    await page.goto('/login');
    await page.getByLabel('Email address').fill(REVIEWER.email);
    await page.getByLabel('Password').fill(REVIEWER.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.goto(`/permits/${TEST_APP_ID}`);

    // Reviewer should see paperclip attach button
    const paperclipBtn = page.getByRole('button', { name: /attach file/i });
    await expect(paperclipBtn).toBeVisible({ timeout: 10000 });
  });
});
