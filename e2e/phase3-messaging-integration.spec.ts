/**
 * Phase 3 Messaging Integration E2E Tests
 *
 * Cross-user messaging integration tests:
 *   - Applicant sends message → reviewer receives it
 *   - Unread count badge on ReviewQueuePage
 *   - Opening MessagePanel marks messages as read
 *   - Shift+Enter creates newline (does not send)
 *   - Messaging blocked on draft applications
 *   - Reviewer sees attach button; applicant does not
 *
 * Uses page.route() to mock API responses for deterministic testing.
 * All tests align with Phase 3 plan 03-05 acceptance criteria.
 */
import { test, expect, type Page } from '@playwright/test';
import { loginAs, setupCommonRoutes, TEST_USERS } from './helpers/auth.helper';

// ─── Test IDs ─────────────────────────────────────────────────────────────────

const PERMIT_ID = 'e2e-permit-p3-msg-001';
const PERMIT_REF = 'REF-P3-MSG-001';
const DRAFT_PERMIT_ID = 'e2e-permit-p3-draft-001';

// ─── Message mock data ────────────────────────────────────────────────────────

const applicantMessage = {
  id: 'msg-applicant-p3-001',
  applicationId: PERMIT_ID,
  senderId: TEST_USERS.applicant.id,
  senderName: TEST_USERS.applicant.fullName,
  senderRole: 'applicant' as const,
  body: 'Hello, I have submitted my initial documents.',
  attachments: [],
  sentAt: new Date().toISOString(),
  readBy: [],
};

const reviewerMessage = {
  id: 'msg-reviewer-p3-001',
  applicationId: PERMIT_ID,
  senderId: TEST_USERS.reviewer.id,
  senderName: TEST_USERS.reviewer.fullName,
  senderRole: 'reviewer' as const,
  body: 'Thank you for your submission. I will review your documents.',
  attachments: [],
  sentAt: new Date(Date.now() + 1000).toISOString(),
  readBy: [],
};

// ─── Permit fixtures ──────────────────────────────────────────────────────────

const underReviewPermit = {
  id: PERMIT_ID,
  reference_number: PERMIT_REF,
  applicant_id: TEST_USERS.applicant.id,
  reviewer_id: TEST_USERS.reviewer.id,
  status: 'under_review',
  permit_type: 'construction',
  project_description: 'E2E messaging test permit.',
  site_street: '2 Message Lane',
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

const draftPermit = {
  ...underReviewPermit,
  id: DRAFT_PERMIT_ID,
  reference_number: 'REF-P3-DRAFT-001',
  reviewer_id: null,
  status: 'draft',
  submitted_at: null,
};

const emptyMessages = { data: [], nextCursor: null };
const withApplicantMessage = { data: [applicantMessage], nextCursor: null };

// ─── Route helpers ────────────────────────────────────────────────────────────

function setupPermitRoutes(
  page: Page,
  permitId: string,
  permit: object,
  messages: object = emptyMessages,
  unreadCount = 0,
): void {
  setupCommonRoutes(page);

  void page.route(`**/permits/${permitId}/lifecycle`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        stages: [
          { id: 's1', application_id: permitId, stage: 'submitted', entered_at: '2024-01-10T09:00:00.000Z' },
          { id: 's2', application_id: permitId, stage: 'under_review', entered_at: '2024-01-11T09:00:00.000Z' },
        ],
      }),
    });
  });

  void page.route(`**/permits/${permitId}/messages/unread-count`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ unreadCount }),
    });
  });

  void page.route(`**/permits/${permitId}/messages/**`, (route) => {
    if (route.request().method() === 'POST') {
      // mark read
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    } else {
      route.continue();
    }
  });

  void page.route(`**/permits/${permitId}/messages`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(messages),
      });
    } else if (route.request().method() === 'POST') {
      // send message — return the applicant message as the sent one
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(applicantMessage),
      });
    } else {
      route.continue();
    }
  });

  void page.route(`**/permits/${permitId}/documents**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], nextCursor: null }),
    });
  });

  void page.route(`**/permits/${permitId}`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(permit),
      });
    } else {
      route.continue();
    }
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Messaging — Applicant sends a message', () => {
  test('Test 1: Applicant sends a message and it appears in the panel', async ({ page }) => {
    setupPermitRoutes(page, PERMIT_ID, underReviewPermit, emptyMessages);

    await loginAs(page, 'applicant');
    await page.goto(`/permits/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="message-composer-input"]');

    // Type message in composer
    const composerInput = page.getByTestId('message-composer-input');
    await composerInput.fill('Hello, I have submitted my initial documents.');

    // Press Enter to send
    await composerInput.press('Enter');

    // Wait for message bubble to appear
    await expect(page.getByTestId('message-bubble').first()).toBeVisible({ timeout: 5000 });

    // Bubble contains the message text
    await expect(page.getByTestId('message-bubble').filter({ hasText: 'Hello, I have submitted my initial documents.' })).toBeVisible();
  });
});

test.describe('Messaging — Reviewer receives the message', () => {
  test('Test 2: Reviewer navigates to review page and sees applicant message', async ({ page }) => {
    // Set up reviewer routes with the applicant message already present
    setupCommonRoutes(page);

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
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unreadCount: 1 }) });
    });

    void page.route(`**/permits/${PERMIT_ID}/messages/**`, (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
      } else {
        route.continue();
      }
    });

    void page.route(`**/permits/${PERMIT_ID}/messages`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(withApplicantMessage),
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
          body: JSON.stringify({ ...underReviewPermit, applicant_email: TEST_USERS.applicant.email }),
        });
      } else {
        route.continue();
      }
    });

    await loginAs(page, 'reviewer');
    await page.goto(`/review/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="message-bubble"]');

    // Applicant message bubble visible
    await expect(page.getByTestId('message-bubble').filter({ hasText: 'Hello, I have submitted my initial documents.' })).toBeVisible();

    // Bubble contains applicant's name
    await expect(page.getByTestId('message-bubble').filter({ hasText: TEST_USERS.applicant.fullName })).toBeVisible();
  });
});

test.describe('Messaging — Unread count badge on ReviewQueuePage', () => {
  test('Test 3: Reviewer queue page shows unread message badge for an application with unread messages', async ({ page }) => {
    setupCommonRoutes(page);

    // Review queue returns application with 1 unread message
    void page.route('**/permits/review-queue**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: PERMIT_ID,
              referenceNumber: PERMIT_REF,
              status: 'under_review',
              permitType: 'construction',
              applicantName: TEST_USERS.applicant.fullName,
              siteAddressSummary: '2 Message Lane, Testville, CA 90001',
              submittedAt: '2024-01-10T09:00:00.000Z',
              updatedAt: '2024-01-11T09:00:00.000Z',
              unreadMessageCount: 1,
              assignedReviewerId: TEST_USERS.reviewer.id,
              daysSinceSubmitted: 2,
            },
          ],
          meta: { total: 1, page: 1, limit: 25, totalPages: 1 },
        }),
      });
    });

    await loginAs(page, 'reviewer');
    await page.goto('/review/queue');
    await page.waitForLoadState('networkidle');

    // Application row with reference number visible
    await expect(page.getByText(PERMIT_REF)).toBeVisible();

    // Unread message count badge showing > 0 is visible
    await expect(page.getByText('1')).toBeVisible();
  });
});

test.describe('Messaging — Opening panel marks messages as read', () => {
  test('Test 4: Opening MessagePanel issues mark-read requests for unread messages', async ({ page }) => {
    const markReadRequests: string[] = [];

    setupCommonRoutes(page);

    void page.route(`**/permits/${PERMIT_ID}/lifecycle`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stages: [{ id: 's1', application_id: PERMIT_ID, stage: 'under_review', entered_at: '2024-01-11T09:00:00.000Z' }],
        }),
      });
    });

    void page.route(`**/permits/${PERMIT_ID}/messages/unread-count`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unreadCount: 1 }) });
    });

    void page.route(`**/permits/${PERMIT_ID}/messages/**/read`, (route) => {
      markReadRequests.push(route.request().url());
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    });

    void page.route(`**/permits/${PERMIT_ID}/messages`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(withApplicantMessage),
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
          body: JSON.stringify({ ...underReviewPermit, applicant_email: TEST_USERS.applicant.email }),
        });
      } else {
        route.continue();
      }
    });

    await loginAs(page, 'reviewer');
    await page.goto(`/review/${PERMIT_ID}`);

    // Wait for message panel to mount and mark-read to be called
    await page.waitForSelector('[data-testid="message-bubble"]', { timeout: 10000 });

    // Give time for mark-read requests to fire after mount
    await page.waitForTimeout(1000);

    // At least one mark-read POST was made (MessagePanel marks all on mount)
    expect(markReadRequests.length).toBeGreaterThan(0);
  });
});

test.describe('Messaging — Shift+Enter creates newline', () => {
  test('Test 5: Shift+Enter inserts newline; plain Enter sends', async ({ page }) => {
    setupPermitRoutes(page, PERMIT_ID, underReviewPermit, emptyMessages);

    await loginAs(page, 'reviewer');
    await page.goto(`/review/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="message-composer-input"]');

    const composerInput = page.getByTestId('message-composer-input');

    // Type first line, then Shift+Enter for newline
    await composerInput.click();
    await composerInput.type('Line one');
    await composerInput.press('Shift+Enter');
    await composerInput.type('Line two');

    // The textarea should still contain both lines (not sent yet)
    const inputValue = await composerInput.inputValue();
    expect(inputValue).toContain('Line one');
    expect(inputValue).toContain('Line two');

    // Now send with Enter — message should be dispatched and input cleared
    await composerInput.press('Enter');

    // Input should be cleared after send
    await expect(composerInput).toHaveValue('', { timeout: 5000 });
  });
});

test.describe('Messaging — Draft application blocks messaging', () => {
  test('Test 6: Draft application shows messaging unavailable message instead of MessagePanel', async ({ page }) => {
    setupCommonRoutes(page);

    void page.route(`**/permits/${DRAFT_PERMIT_ID}/lifecycle`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ stages: [{ id: 'd1', application_id: DRAFT_PERMIT_ID, stage: 'draft', entered_at: '2024-01-01T12:00:00.000Z' }] }),
      });
    });

    void page.route(`**/permits/${DRAFT_PERMIT_ID}/documents**`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], nextCursor: null }) });
    });

    void page.route(`**/permits/${DRAFT_PERMIT_ID}`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(draftPermit),
        });
      } else {
        route.continue();
      }
    });

    await loginAs(page, 'applicant');
    await page.goto(`/permits/${DRAFT_PERMIT_ID}`);
    await page.waitForSelector('[data-testid="permit-detail-page"]');

    // MessagePanel composer should NOT be present for drafts
    await expect(page.getByTestId('message-composer-input')).not.toBeVisible({ timeout: 3000 });

    // Instead, messaging stub message should be visible
    await expect(page.getByTestId('messaging-stub')).toBeVisible();
  });
});

test.describe('Messaging — Attach button role visibility', () => {
  test('Test 7: Reviewer sees attach button in composer; applicant does not', async ({ page: reviewerPage }) => {
    // Reviewer sees attach button
    setupPermitRoutes(reviewerPage, PERMIT_ID, { ...underReviewPermit, applicant_email: TEST_USERS.applicant.email }, emptyMessages);

    await loginAs(reviewerPage, 'reviewer');
    await reviewerPage.goto(`/review/${PERMIT_ID}`);
    await reviewerPage.waitForSelector('[data-testid="message-composer-input"]');

    // Reviewer's MessagePanel has isReviewer=true → paperclip attach button visible
    await expect(reviewerPage.getByTestId('attach-btn')).toBeVisible({ timeout: 5000 });
  });

  test('Test 7b: Applicant does NOT see attach button in composer', async ({ page: applicantPage }) => {
    setupPermitRoutes(applicantPage, PERMIT_ID, underReviewPermit, emptyMessages);

    await loginAs(applicantPage, 'applicant');
    await applicantPage.goto(`/permits/${PERMIT_ID}`);
    await applicantPage.waitForSelector('[data-testid="message-composer-input"]');

    // Applicant's MessagePanel has isReviewer=false → no paperclip
    await expect(applicantPage.getByTestId('attach-btn')).not.toBeVisible({ timeout: 3000 });
  });
});
