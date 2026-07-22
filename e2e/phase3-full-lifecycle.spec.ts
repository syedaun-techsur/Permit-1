/**
 * Phase 3 Full Lifecycle E2E Tests
 *
 * Integration tests covering the complete reviewer lifecycle:
 *   Full Approve Path: submitted → under_review → additional_info_needed → under_review → approved
 *   Reject Path: submitted → under_review → rejected
 *
 * Uses page.route() to mock API responses so tests run without a full docker compose stack.
 * These tests verify that the UI correctly handles all lifecycle state transitions,
 * action panels, status badges, and decision details across applicant and reviewer contexts.
 *
 * Spec aligns with plan 03-05 acceptance criteria.
 */
import { test, expect, type Page } from '@playwright/test';

// ─── Test credentials ─────────────────────────────────────────────────────────

const REVIEWER = { email: 'e2e-reviewer-p3@test.com', password: 'TestPass123!' };
const APPLICANT = { email: 'e2e-applicant-p3@test.com', password: 'TestPass123!' };

// ─── Test IDs ─────────────────────────────────────────────────────────────────

const PERMIT_ID = 'e2e-permit-p3-lifecycle-001';
const PERMIT_REF = 'REF-P3-LC-001';
const APPLICANT_USER_ID = 'e2e-applicant-user-p3-001';
const REVIEWER_USER_ID = 'e2e-reviewer-user-p3-001';

// ─── Permit state fixtures ────────────────────────────────────────────────────

const basePermit = {
  id: PERMIT_ID,
  reference_number: PERMIT_REF,
  applicant_id: APPLICANT_USER_ID,
  reviewer_id: null,
  status: 'submitted',
  permit_type: 'construction',
  project_description: 'Build a test garage for Phase 3 lifecycle E2E coverage.',
  site_street: '100 Phase3 Lane',
  site_city: 'Testville',
  site_state: 'CA',
  site_zip: '90001',
  contact_name: 'E2E Applicant',
  contact_phone: '555-0001',
  contact_email: APPLICANT.email,
  applicant_email: APPLICANT.email,
  applicant_phone: '555-0001',
  estimated_start_date: '2024-06-01',
  submitted_at: '2024-01-10T09:00:00.000Z',
  created_at: '2024-01-09T12:00:00.000Z',
  updated_at: '2024-01-10T09:00:00.000Z',
  documents: [],
  timeline: [],
};

const underReviewPermit = {
  ...basePermit,
  status: 'under_review',
  reviewer_id: REVIEWER_USER_ID,
  updated_at: '2024-01-11T09:00:00.000Z',
};

const additionalInfoPermit = {
  ...underReviewPermit,
  status: 'additional_info_needed',
  info_request_note: 'Please provide an updated site plan showing all drainage channels.',
  info_request_at: '2024-01-12T10:00:00.000Z',
  updated_at: '2024-01-12T10:00:00.000Z',
};

const respondedPermit = {
  ...underReviewPermit,
  status: 'under_review',
  info_request_note: additionalInfoPermit.info_request_note,
  info_response_note: 'I have attached the updated site plan.',
  info_response_at: '2024-01-13T09:00:00.000Z',
  updated_at: '2024-01-13T09:00:00.000Z',
};

const approvedPermit = {
  ...respondedPermit,
  status: 'approved',
  decision_outcome: 'approved',
  decision_reason: 'Application meets all zoning requirements and drainage standards.',
  decision_at: '2024-01-15T14:00:00.000Z',
  updated_at: '2024-01-15T14:00:00.000Z',
};

const rejectedPermit = {
  ...underReviewPermit,
  status: 'rejected',
  decision_outcome: 'rejected',
  decision_reason: 'The site does not comply with setback requirements per section 4.2.',
  decision_at: '2024-01-16T10:00:00.000Z',
  updated_at: '2024-01-16T10:00:00.000Z',
};

// Second permit for reject path
const PERMIT_ID_2 = 'e2e-permit-p3-lifecycle-002';
const PERMIT_REF_2 = 'REF-P3-LC-002';

const basePermit2 = {
  ...basePermit,
  id: PERMIT_ID_2,
  reference_number: PERMIT_REF_2,
};

const underReviewPermit2 = {
  ...basePermit2,
  status: 'under_review',
  reviewer_id: REVIEWER_USER_ID,
  updated_at: '2024-01-11T10:00:00.000Z',
};

const rejectedPermit2 = {
  ...underReviewPermit2,
  status: 'rejected',
  decision_outcome: 'rejected',
  decision_reason: 'The site does not comply with setback requirements per section 4.2.',
  decision_at: '2024-01-16T10:00:00.000Z',
  updated_at: '2024-01-16T10:00:00.000Z',
};

// ─── Lifecycle / timeline fixtures ───────────────────────────────────────────

const lifecycleSubmitted = {
  stages: [{ id: 's1', application_id: PERMIT_ID, stage: 'submitted', entered_at: '2024-01-10T09:00:00.000Z' }],
};

const lifecycleUnderReview = {
  stages: [
    ...lifecycleSubmitted.stages,
    { id: 's2', application_id: PERMIT_ID, stage: 'under_review', entered_at: '2024-01-11T09:00:00.000Z' },
  ],
};

const lifecycleAdditionalInfo = {
  stages: [
    ...lifecycleUnderReview.stages,
    { id: 's3', application_id: PERMIT_ID, stage: 'additional_info_needed', entered_at: '2024-01-12T10:00:00.000Z' },
  ],
};

const lifecycleResponded = {
  stages: [
    ...lifecycleAdditionalInfo.stages,
    { id: 's4', application_id: PERMIT_ID, stage: 'under_review', entered_at: '2024-01-13T09:00:00.000Z' },
  ],
};

const lifecycleApproved = {
  stages: [
    ...lifecycleResponded.stages,
    { id: 's5', application_id: PERMIT_ID, stage: 'approved', entered_at: '2024-01-15T14:00:00.000Z' },
  ],
};

const lifecycleRejected = {
  stages: [
    ...lifecycleSubmitted.stages,
    { id: 's6', application_id: PERMIT_ID, stage: 'under_review', entered_at: '2024-01-11T10:00:00.000Z' },
    { id: 's7', application_id: PERMIT_ID, stage: 'rejected', entered_at: '2024-01-16T10:00:00.000Z' },
  ],
};

// ─── Review queue fixture ─────────────────────────────────────────────────────

const reviewQueueResponse = {
  data: [
    {
      id: PERMIT_ID,
      referenceNumber: PERMIT_REF,
      status: 'submitted',
      permitType: 'construction',
      applicantName: 'E2E Applicant',
      siteAddressSummary: '100 Phase3 Lane, Testville, CA 90001',
      submittedAt: '2024-01-10T09:00:00.000Z',
      updatedAt: '2024-01-10T09:00:00.000Z',
      unreadMessageCount: 0,
      assignedReviewerId: null,
      daysSinceSubmitted: 3,
    },
  ],
  meta: { total: 1, page: 1, limit: 25, totalPages: 1 },
};

const emptyMessages = { data: [], nextCursor: null };

// ─── Auth helpers ─────────────────────────────────────────────────────────────

async function loginAsReviewer(page: Page): Promise<void> {
  await page.route('**/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: REVIEWER_USER_ID,
          email: REVIEWER.email,
          fullName: 'E2E Reviewer',
          role: 'reviewer',
        },
        accessToken: 'mock-reviewer-token-p3',
      }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email address').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/reviewer/);
}

async function loginAsApplicant(page: Page): Promise<void> {
  await page.route('**/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: APPLICANT_USER_ID,
          email: APPLICANT.email,
          fullName: 'E2E Applicant',
          role: 'applicant',
        },
        accessToken: 'mock-applicant-token-p3',
      }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email address').fill(APPLICANT.email);
  await page.getByLabel('Password').fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/applicant/);
}

// ─── Common route setup helpers ───────────────────────────────────────────────

function setupCommonRoutes(page: Page): void {
  // Unread notifications
  void page.route('**/notifications/unread-count', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ unreadCount: 0 }),
    });
  });

  // Notifications list
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

function setupReviewerRoutes(
  page: Page,
  permitOverride: object,
  lifecycleOverride: object,
): void {
  setupCommonRoutes(page);

  void page.route('**/permits/review-queue**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(reviewQueueResponse),
    });
  });

  void page.route(`**/permits/${PERMIT_ID}/lifecycle`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(lifecycleOverride),
    });
  });

  void page.route(`**/permits/${PERMIT_ID}/messages**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyMessages),
    });
  });

  void page.route(`**/permits/${PERMIT_ID}/documents**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], nextCursor: null }),
    });
  });

  void page.route(`**/permits/${PERMIT_ID}`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(permitOverride),
      });
    } else {
      route.continue();
    }
  });
}

function setupApplicantRoutes(
  page: Page,
  permitOverride: object,
  lifecycleOverride: object,
): void {
  setupCommonRoutes(page);

  void page.route(`**/permits/${PERMIT_ID}/lifecycle`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(lifecycleOverride),
    });
  });

  void page.route(`**/permits/${PERMIT_ID}/messages**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyMessages),
    });
  });

  void page.route(`**/permits/${PERMIT_ID}/documents**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [], nextCursor: null }),
    });
  });

  void page.route(`**/permits/${PERMIT_ID}`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(permitOverride),
      });
    } else {
      route.continue();
    }
  });
}

// ─── Full Approve Lifecycle ───────────────────────────────────────────────────

test.describe('Full Approve Lifecycle', () => {
  test('Test 1: ReviewQueuePage shows submitted application', async ({ page }) => {
    await page.route('**/permits/review-queue**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(reviewQueueResponse),
      });
    });
    setupCommonRoutes(page);

    await loginAsReviewer(page);
    await page.goto('/review/queue');
    await page.waitForLoadState('networkidle');

    // Assert page heading
    await expect(page.getByText('Review Queue')).toBeVisible();

    // Assert application row with reference number is visible
    await expect(page.getByText(PERMIT_REF)).toBeVisible();

    // Assert status badge shows "Submitted"
    await expect(page.getByText('Submitted')).toBeVisible();
  });

  test('Test 2: Reviewer begins review — status transitions to Under Review', async ({ page }) => {
    setupReviewerRoutes(page, basePermit, lifecycleSubmitted);

    // Mock begin-review to return under_review permit
    await page.route(`**/permits/${PERMIT_ID}/actions/begin-review`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(underReviewPermit),
      });
    });

    await loginAsReviewer(page);
    await page.goto(`/review/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="begin-review-btn"]');

    // Begin Review button visible
    await expect(page.getByTestId('begin-review-btn')).toBeVisible();

    // Click Begin Review
    await page.getByTestId('begin-review-btn').click();

    // After state update, request-info-btn should appear (under_review state)
    await expect(page.getByTestId('request-info-btn')).toBeVisible({ timeout: 5000 });

    // Status badge should show Under Review
    await expect(page.getByText('Under Review')).toBeVisible();
  });

  test('Test 3: Reviewer requests additional information', async ({ page }) => {
    setupReviewerRoutes(page, underReviewPermit, lifecycleUnderReview);

    // Mock request-info endpoint
    await page.route(`**/permits/${PERMIT_ID}/actions/request-info`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(additionalInfoPermit),
      });
    });

    await loginAsReviewer(page);
    await page.goto(`/review/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="request-info-btn"]');

    // Click Request Information button
    await page.getByTestId('request-info-btn').click();

    // Assert modal visible
    await expect(page.getByTestId('request-info-modal')).toBeVisible({ timeout: 5000 });

    // Fill in the textarea
    await page.getByTestId('info-request-textarea').fill(
      'Please provide an updated site plan showing all drainage channels.',
    );

    // Click Send Request
    await page.getByRole('button', { name: /send request/i }).click();

    // Modal should close and status badge shows Info Needed
    await expect(page.getByTestId('request-info-modal')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Info Needed')).toBeVisible({ timeout: 5000 });

    // infoRequestNote text should be visible
    await expect(
      page.getByText('Please provide an updated site plan showing all drainage channels.'),
    ).toBeVisible();
  });

  test('Test 4: Applicant sees information request on their detail page', async ({ page }) => {
    setupApplicantRoutes(page, additionalInfoPermit, lifecycleAdditionalInfo);

    await loginAsApplicant(page);
    await page.goto(`/permits/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="respond-to-info-section"]');

    // Respond-to-info section is visible
    await expect(page.getByTestId('respond-to-info-section')).toBeVisible();

    // The info request note text is visible within the section
    await expect(
      page.getByText('Please provide an updated site plan showing all drainage channels.'),
    ).toBeVisible();
  });

  test('Test 5: Applicant submits response — status returns to Under Review', async ({ page }) => {
    setupApplicantRoutes(page, additionalInfoPermit, lifecycleAdditionalInfo);

    // Mock respond-to-info endpoint
    await page.route(`**/permits/${PERMIT_ID}/actions/respond-to-info`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(respondedPermit),
      });
    });

    await loginAsApplicant(page);
    await page.goto(`/permits/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="respond-to-info-section"]');

    // Fill respond textarea
    await page.getByTestId('respond-textarea').fill(
      'I have attached the updated site plan.',
    );

    // Submit response
    await page.getByTestId('submit-response-btn').click();

    // Success toast visible containing expected message
    await expect(
      page.getByRole('alert').filter({ hasText: /back under review/i }),
    ).toBeVisible({ timeout: 5000 });

    // Respond-to-info section no longer visible (status changed to under_review)
    await expect(page.getByTestId('respond-to-info-section')).not.toBeVisible({ timeout: 5000 });
  });

  test('Test 6: Reviewer approves application', async ({ page }) => {
    setupReviewerRoutes(page, respondedPermit, lifecycleResponded);

    // Mock decide endpoint (approve)
    await page.route(`**/permits/${PERMIT_ID}/actions/decide`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(approvedPermit),
      });
    });

    await loginAsReviewer(page);
    await page.goto(`/review/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="approve-btn"]');

    // Approve button is visible (under_review state)
    await expect(page.getByTestId('approve-btn')).toBeVisible();

    // Click Approve
    await page.getByTestId('approve-btn').click();

    // DecisionModal is visible
    await expect(page.getByTestId('decision-modal')).toBeVisible({ timeout: 5000 });

    // Fill reason field
    await page.getByTestId('decision-reason-textarea').fill(
      'Application meets all zoning requirements and drainage standards.',
    );

    // Click the Approve button inside modal
    await page.getByTestId('confirm-approve-btn').click();

    // Status badge shows Approved
    await expect(page.getByText('Approved')).toBeVisible({ timeout: 5000 });

    // Decision details card is visible with the reason text
    await expect(
      page.getByText('Application meets all zoning requirements and drainage standards.'),
    ).toBeVisible();

    // Approve button is NOT in DOM (read-only state)
    await expect(page.getByTestId('approve-btn')).not.toBeVisible({ timeout: 3000 });
  });
});

// ─── Reject Lifecycle ─────────────────────────────────────────────────────────

test.describe('Reject Lifecycle', () => {
  test('Test 7: Reviewer begins review on second permit and rejects it', async ({ page }) => {
    setupCommonRoutes(page);

    // Route second permit GET
    void page.route(`**/permits/${PERMIT_ID_2}/lifecycle`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stages: [
            { id: 's1b', application_id: PERMIT_ID_2, stage: 'submitted', entered_at: '2024-01-10T09:00:00.000Z' },
            { id: 's2b', application_id: PERMIT_ID_2, stage: 'under_review', entered_at: '2024-01-11T10:00:00.000Z' },
          ],
        }),
      });
    });

    void page.route(`**/permits/${PERMIT_ID_2}/messages**`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyMessages) });
    });

    void page.route(`**/permits/${PERMIT_ID_2}/documents**`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], nextCursor: null }) });
    });

    void page.route(`**/permits/${PERMIT_ID_2}`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(underReviewPermit2),
        });
      } else {
        route.continue();
      }
    });

    // Mock decide endpoint (reject)
    await page.route(`**/permits/${PERMIT_ID_2}/actions/decide`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(rejectedPermit2),
      });
    });

    await loginAsReviewer(page);
    await page.goto(`/review/${PERMIT_ID_2}`);
    await page.waitForSelector('[data-testid="reject-btn"]');

    // Click Reject button
    await page.getByTestId('reject-btn').click();

    // Assert "Are you sure?" text visible in modal
    await expect(page.getByText(/are you sure/i)).toBeVisible({ timeout: 5000 });

    // Fill reason
    await page.getByTestId('decision-reason-textarea').fill(
      'The site does not comply with setback requirements per section 4.2.',
    );

    // Click red Reject Application button
    await page.getByTestId('confirm-reject-btn').click();

    // Status badge shows Rejected
    await expect(page.getByText('Rejected')).toBeVisible({ timeout: 5000 });

    // Decision details card shows rejected outcome and reason
    await expect(
      page.getByText('The site does not comply with setback requirements per section 4.2.'),
    ).toBeVisible();
  });

  test('Test 8: Rejected application cannot be acted upon again — no action buttons visible', async ({ page }) => {
    setupCommonRoutes(page);

    void page.route(`**/permits/${PERMIT_ID_2}/lifecycle`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stages: [
            { id: 's1b', application_id: PERMIT_ID_2, stage: 'submitted', entered_at: '2024-01-10T09:00:00.000Z' },
            { id: 's2b', application_id: PERMIT_ID_2, stage: 'rejected', entered_at: '2024-01-16T10:00:00.000Z' },
          ],
        }),
      });
    });

    void page.route(`**/permits/${PERMIT_ID_2}/messages**`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyMessages) });
    });

    void page.route(`**/permits/${PERMIT_ID_2}/documents**`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], nextCursor: null }) });
    });

    void page.route(`**/permits/${PERMIT_ID_2}`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(rejectedPermit2),
        });
      } else {
        route.continue();
      }
    });

    await loginAsReviewer(page);
    await page.goto(`/review/${PERMIT_ID_2}`);
    await page.waitForSelector('[data-testid="reviewer-action-panel"]');

    // Verify action panel shows no action buttons (read-only decision details)
    await expect(page.getByTestId('begin-review-btn')).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('approve-btn')).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('reject-btn')).not.toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('request-info-btn')).not.toBeVisible({ timeout: 3000 });

    // Read-only decision details visible
    await expect(page.getByText('Rejected')).toBeVisible();
    await expect(
      page.getByText('The site does not comply with setback requirements per section 4.2.'),
    ).toBeVisible();
  });
});
