/**
 * Reviewer Workflow E2E Tests
 *
 * Tests the full reviewer lifecycle:
 *   - Review queue visibility
 *   - Begin review action
 *   - Request information action
 *   - Applicant responds to info request
 *   - Approve/reject decision
 *   - Nav link visibility by role
 *   - Download all archive trigger
 *
 * Uses page.route() to mock API responses for deterministic testing.
 */
import { test, expect } from '@playwright/test';

// ─── Test credentials ─────────────────────────────────────────────────────────

const REVIEWER = { email: 'reviewer@permits.local', password: 'Reviewer@12345!' };
const APPLICANT = { email: 'applicant@permits.local', password: 'Applicant@12345!' };

// ─── Mock data ────────────────────────────────────────────────────────────────

const PERMIT_ID = 'permit-reviewer-001';
const PERMIT_REF = 'REF-2024-RV001';

const basePermit = {
  id: PERMIT_ID,
  reference_number: PERMIT_REF,
  applicant_id: 'applicant-user-001',
  reviewer_id: null,
  status: 'submitted',
  permit_type: 'construction',
  project_description: 'Build a new garage with attached workshop space.',
  site_street: '456 Oak Avenue',
  site_city: 'Riverdale',
  site_state: 'CA',
  site_zip: '90211',
  contact_name: 'Bob Applicant',
  contact_phone: '555-9876',
  contact_email: 'bob@example.com',
  applicant_email: 'bob@example.com',
  applicant_phone: '555-9876',
  estimated_start_date: '2024-06-01',
  submitted_at: '2024-01-10T09:00:00.000Z',
  created_at: '2024-01-09T12:00:00.000Z',
  updated_at: '2024-01-10T09:00:00.000Z',
};

const underReviewPermit = {
  ...basePermit,
  status: 'under_review',
  reviewer_id: 'reviewer-user-001',
  updated_at: '2024-01-11T09:00:00.000Z',
};

const additionalInfoPermit = {
  ...underReviewPermit,
  status: 'additional_info_needed',
  info_request_note: 'Please provide an updated site plan showing all property boundaries and setbacks.',
  info_request_at: '2024-01-12T10:00:00.000Z',
  updated_at: '2024-01-12T10:00:00.000Z',
};

const respondedPermit = {
  ...underReviewPermit,
  status: 'under_review',
  info_request_note: additionalInfoPermit.info_request_note,
  info_response_note: 'Updated site plan is attached to documents. The setbacks are 5ft on all sides.',
  info_response_at: '2024-01-13T09:00:00.000Z',
  updated_at: '2024-01-13T09:00:00.000Z',
};

const approvedPermit = {
  ...underReviewPermit,
  status: 'approved',
  decision_outcome: 'approved',
  decision_reason: 'All requirements are met. Application approved as submitted.',
  decision_at: '2024-01-15T14:00:00.000Z',
  updated_at: '2024-01-15T14:00:00.000Z',
};

const lifecycleSubmitted = {
  stages: [
    { id: 's1', application_id: PERMIT_ID, stage: 'draft', entered_at: '2024-01-09T12:00:00.000Z' },
    { id: 's2', application_id: PERMIT_ID, stage: 'submitted', entered_at: '2024-01-10T09:00:00.000Z' },
  ],
};

const lifecycleUnderReview = {
  stages: [
    ...lifecycleSubmitted.stages,
    { id: 's3', application_id: PERMIT_ID, stage: 'under_review', entered_at: '2024-01-11T09:00:00.000Z' },
  ],
};

const lifecycleAdditionalInfo = {
  stages: [
    ...lifecycleUnderReview.stages,
    { id: 's4', application_id: PERMIT_ID, stage: 'additional_info_needed', entered_at: '2024-01-12T10:00:00.000Z' },
  ],
};

const lifecycleApproved = {
  stages: [
    ...lifecycleUnderReview.stages,
    { id: 's5', application_id: PERMIT_ID, stage: 'approved', entered_at: '2024-01-15T14:00:00.000Z' },
  ],
};

const reviewQueueResponse = {
  data: [
    {
      id: PERMIT_ID,
      referenceNumber: PERMIT_REF,
      status: 'submitted',
      permitType: 'construction',
      applicantName: 'Bob Applicant',
      siteAddressSummary: '456 Oak Avenue, Riverdale, CA 90211',
      submittedAt: '2024-01-10T09:00:00.000Z',
      updatedAt: '2024-01-10T09:00:00.000Z',
      unreadMessageCount: 2,
      assignedReviewerId: null,
      daysSinceSubmitted: 8,
    },
  ],
  meta: { total: 1, page: 1, limit: 25, totalPages: 1 },
};

const emptyMessages = { data: [], nextCursor: null };
const emptyDocuments: unknown[] = [];

// ─── Helper: login as reviewer ────────────────────────────────────────────────

async function loginAsReviewer(page: import('@playwright/test').Page) {
  await page.route('**/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'reviewer-user-001',
          email: REVIEWER.email,
          fullName: 'Alice Reviewer',
          role: 'reviewer',
        },
        accessToken: 'mock-reviewer-token',
      }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email address').fill(REVIEWER.email);
  await page.getByLabel('Password').fill(REVIEWER.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/reviewer/);
}

async function loginAsApplicant(page: import('@playwright/test').Page) {
  await page.route('**/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'applicant-user-001',
          email: APPLICANT.email,
          fullName: 'Bob Applicant',
          role: 'applicant',
        },
        accessToken: 'mock-applicant-token',
      }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email address').fill(APPLICANT.email);
  await page.getByLabel('Password').fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/applicant/);
}

// ─── Helper: setup common API routes ─────────────────────────────────────────

function setupReviewerApiRoutes(
  page: import('@playwright/test').Page,
  permitOverride?: object,
  lifecycleOverride?: object,
) {
  const permit = permitOverride ?? basePermit;
  const lifecycle = lifecycleOverride ?? lifecycleSubmitted;

  page.route('**/permits/review-queue**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(reviewQueueResponse),
    });
  });

  page.route(`**/permits/${PERMIT_ID}/lifecycle`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(lifecycle),
    });
  });

  page.route(`**/permits/${PERMIT_ID}/messages**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyMessages),
    });
  });

  page.route(`**/permits/${PERMIT_ID}/documents**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyDocuments),
    });
  });

  page.route(`**/permits/${PERMIT_ID}`, (route) => {
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

test.describe('Reviewer Workflow', () => {
  test('Test 1: ReviewQueuePage loads and shows submitted application', async ({ page }) => {
    await page.route('**/permits/review-queue**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(reviewQueueResponse),
      });
    });

    await loginAsReviewer(page);
    await page.goto('/review/queue');
    await page.waitForLoadState('networkidle');

    // Page heading visible
    await expect(page.getByText('Review Queue')).toBeVisible();

    // Submitted application row visible with reference number
    await expect(page.getByText(PERMIT_REF)).toBeVisible();

    // Unread message badge visible (2 unread)
    await expect(page.getByText('2')).toBeVisible();

    // Age indicator: 8 days > 5 days threshold → amber indicator
    await expect(page.getByText('8d')).toBeVisible();
  });

  test('Test 2: Reviewer begins review — status changes to Under Review', async ({ page }) => {
    setupReviewerApiRoutes(page, basePermit, lifecycleSubmitted);

    // Mock begin-review endpoint
    let beginReviewCalled = false;
    await page.route(`**/permits/${PERMIT_ID}/actions/begin-review`, (route) => {
      beginReviewCalled = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(underReviewPermit),
      });
    });

    await loginAsReviewer(page);
    await page.goto(`/review/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="reviewer-action-panel"]');

    // Begin Review button should be visible for submitted status
    await expect(page.getByTestId('begin-review-btn')).toBeVisible();

    // Click Begin Review
    await page.getByTestId('begin-review-btn').click();

    // Wait for action to complete
    await page.waitForTimeout(500);

    // beginReview endpoint was called
    expect(beginReviewCalled).toBe(true);

    // Action panel should now show 3 buttons for under_review status
    await expect(page.getByTestId('request-info-btn')).toBeVisible();
    await expect(page.getByTestId('approve-btn')).toBeVisible();
    await expect(page.getByTestId('reject-btn')).toBeVisible();
  });

  test('Test 3: Reviewer requests information — modal and submission', async ({ page }) => {
    setupReviewerApiRoutes(page, underReviewPermit, lifecycleUnderReview);

    let requestInfoCalled = false;
    await page.route(`**/permits/${PERMIT_ID}/actions/request-info`, (route) => {
      requestInfoCalled = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(additionalInfoPermit),
      });
    });

    await loginAsReviewer(page);
    await page.goto(`/review/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="request-info-btn"]');

    // Click Request Information
    await page.getByTestId('request-info-btn').click();

    // Modal should open
    await expect(page.getByTestId('request-info-modal')).toBeVisible();

    // Fill in the info request note
    await page.getByTestId('info-request-textarea').fill('Please provide updated site plan');

    // Submit the request
    await page.getByRole('button', { name: 'Send Request' }).click();
    await page.waitForTimeout(500);

    // API was called
    expect(requestInfoCalled).toBe(true);

    // Status should change to additional_info_needed — action panel no longer shows 3 buttons
    await expect(page.getByTestId('request-info-btn')).not.toBeVisible();
  });

  test('Test 4: Applicant responds to info request', async ({ page }) => {
    // Setup: mock permit API to return additional_info_needed status
    await page.route(`**/permits/${PERMIT_ID}/lifecycle`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(lifecycleAdditionalInfo),
      });
    });

    await page.route(`**/permits/${PERMIT_ID}`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(additionalInfoPermit),
        });
      } else {
        route.continue();
      }
    });

    await page.route(`**/permits/${PERMIT_ID}/messages**`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyMessages),
      });
    });

    await page.route(`**/permits/${PERMIT_ID}/documents**`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyDocuments),
      });
    });

    let respondCalled = false;
    await page.route(`**/permits/${PERMIT_ID}/actions/respond-to-info`, (route) => {
      respondCalled = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(respondedPermit),
      });
    });

    await loginAsApplicant(page);
    await page.goto(`/permits/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="respond-to-info-section"]');

    // Respond-to-info section should be visible
    await expect(page.getByTestId('respond-to-info-section')).toBeVisible();

    // The reviewer's request note should be shown
    await expect(page.getByText('Please provide an updated site plan')).toBeVisible();

    // Fill in the response
    await page.getByTestId('respond-textarea').fill(
      'Updated site plan is attached to documents. The setbacks are 5ft on all sides.',
    );

    // Submit the response
    await page.getByTestId('submit-response-btn').click();
    await page.waitForTimeout(500);

    // API was called
    expect(respondCalled).toBe(true);

    // Success toast should appear
    await expect(page.getByText(/response submitted/i)).toBeVisible();
  });

  test('Test 5: Reviewer approves application — green modal, read-only decision card', async ({
    page,
  }) => {
    setupReviewerApiRoutes(page, underReviewPermit, lifecycleUnderReview);

    let decideCalled = false;
    await page.route(`**/permits/${PERMIT_ID}/actions/decide`, (route) => {
      decideCalled = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(approvedPermit),
      });
    });

    await loginAsReviewer(page);
    await page.goto(`/review/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="approve-btn"]');

    // Click Approve button
    await page.getByTestId('approve-btn').click();

    // Decision modal opens
    await expect(page.getByTestId('decision-modal')).toBeVisible();

    // Title shows "Approve Application"
    await expect(page.getByRole('heading', { name: 'Approve Application' })).toBeVisible();

    // Fill in decision reason (at least 10 chars)
    await page.getByTestId('decision-reason-textarea').fill(
      'All requirements are met. Application approved as submitted.',
    );

    // Click confirm approve button (green)
    await page.getByTestId('confirm-approve-btn').click();
    await page.waitForTimeout(500);

    // decide API was called
    expect(decideCalled).toBe(true);

    // Action panel now shows read-only decision card
    await expect(page.getByText('Decision')).toBeVisible();
    // Modal should be closed
    await expect(page.getByTestId('decision-modal')).not.toBeVisible();
  });

  test('Test 6: Review Queue nav link visible for reviewer, hidden for applicant', async ({
    page,
  }) => {
    // Test reviewer sees nav link
    await page.route('**/permits/review-queue**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: { total: 0, page: 1, limit: 25, totalPages: 0 } }),
      });
    });

    await loginAsReviewer(page);
    await page.waitForLoadState('networkidle');

    // Reviewer should see the Review Queue nav link
    await expect(page.getByTestId('nav-review-queue')).toBeVisible();

    // Now test applicant does NOT see nav link
    await page.route('**/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'applicant-user-001',
            email: APPLICANT.email,
            fullName: 'Bob Applicant',
            role: 'applicant',
          },
          accessToken: 'mock-applicant-token-2',
        }),
      });
    });

    // Navigate to login and log in as applicant
    await page.goto('/login');
    await page.getByLabel('Email address').fill(APPLICANT.email);
    await page.getByLabel('Password').fill(APPLICANT.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/applicant/);

    // Applicant should NOT see Review Queue nav link
    await expect(page.getByTestId('nav-review-queue')).not.toBeVisible();
  });

  test('Test 7: Download All triggers archive URL fetch', async ({ page }) => {
    setupReviewerApiRoutes(page, underReviewPermit, lifecycleUnderReview);

    let archiveRequestMade = false;
    await page.route(`**/permits/${PERMIT_ID}/documents/archive`, (route) => {
      archiveRequestMade = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          downloadUrl: 'https://storage.example.com/archive/permit-rv001.zip?token=abc123',
          expiresAt: '2024-01-15T15:00:00.000Z',
        }),
      });
    });

    await loginAsReviewer(page);
    await page.goto(`/review/${PERMIT_ID}`);
    await page.waitForSelector('[data-testid="download-all-btn"]');

    // Click Download All button
    await page.getByTestId('download-all-btn').click();
    await page.waitForTimeout(500);

    // Archive API endpoint was called
    expect(archiveRequestMade).toBe(true);
  });
});
