import { test, expect } from '@playwright/test';

// Seed credentials matching Plan 01-01 seeds
const APPLICANT = { email: 'applicant@permits.local', password: 'Applicant@12345!' };

const mockPermit = {
  id: 'permit-001',
  reference_number: 'REF-2024-001',
  applicant_id: 'user-001',
  status: 'submitted',
  permit_type: 'construction',
  project_description: 'Build a new garage',
  site_street: '123 Main St',
  site_city: 'Springfield',
  site_state: 'CA',
  site_zip: '90210',
  contact_name: 'Jane Smith',
  contact_phone: '555-1234',
  contact_email: 'jane@example.com',
  submitted_at: '2024-01-02T10:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-02T10:00:00.000Z',
};

const draftPermit = {
  ...mockPermit,
  id: 'permit-draft',
  reference_number: 'REF-2024-DRAFT',
  status: 'draft',
  submitted_at: undefined,
};

const underReviewPermit = {
  ...mockPermit,
  id: 'permit-review',
  reference_number: 'REF-2024-REVIEW',
  status: 'under_review',
};

const approvedPermit = {
  ...mockPermit,
  id: 'permit-approved',
  reference_number: 'REF-2024-APPROVED',
  status: 'approved',
  decision_at: '2024-01-10T12:00:00.000Z',
};

const additionalInfoPermit = {
  ...mockPermit,
  id: 'permit-info',
  reference_number: 'REF-2024-INFO',
  status: 'additional_info_needed',
  info_request_note: 'Please provide proof of property ownership.',
};

const mockLifecycleSubmitted = {
  stages: [
    {
      id: 'stage-1',
      application_id: 'permit-001',
      stage: 'draft',
      entered_at: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'stage-2',
      application_id: 'permit-001',
      stage: 'submitted',
      entered_at: '2024-01-02T10:00:00.000Z',
    },
  ],
};

const mockLifecycleDraft = {
  stages: [
    {
      id: 'stage-1',
      application_id: 'permit-draft',
      stage: 'draft',
      entered_at: '2024-01-01T00:00:00.000Z',
    },
  ],
};

const mockLifecycleUnderReview = {
  stages: [
    {
      id: 'stage-1',
      application_id: 'permit-review',
      stage: 'draft',
      entered_at: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'stage-2',
      application_id: 'permit-review',
      stage: 'submitted',
      entered_at: '2024-01-02T10:00:00.000Z',
    },
    {
      id: 'stage-3',
      application_id: 'permit-review',
      stage: 'under_review',
      entered_at: '2024-01-05T09:00:00.000Z',
    },
  ],
};

const mockLifecycleApproved = {
  stages: [
    {
      id: 'stage-1',
      application_id: 'permit-approved',
      stage: 'draft',
      entered_at: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'stage-2',
      application_id: 'permit-approved',
      stage: 'submitted',
      entered_at: '2024-01-02T10:00:00.000Z',
    },
    {
      id: 'stage-3',
      application_id: 'permit-approved',
      stage: 'under_review',
      entered_at: '2024-01-05T09:00:00.000Z',
    },
    {
      id: 'stage-4',
      application_id: 'permit-approved',
      stage: 'approved',
      entered_at: '2024-01-10T12:00:00.000Z',
    },
  ],
};

const mockLifecycleAdditionalInfo = {
  stages: [
    {
      id: 'stage-1',
      application_id: 'permit-info',
      stage: 'draft',
      entered_at: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'stage-2',
      application_id: 'permit-info',
      stage: 'submitted',
      entered_at: '2024-01-02T10:00:00.000Z',
    },
    {
      id: 'stage-3',
      application_id: 'permit-info',
      stage: 'under_review',
      entered_at: '2024-01-05T09:00:00.000Z',
    },
    {
      id: 'stage-4',
      application_id: 'permit-info',
      stage: 'additional_info_needed',
      entered_at: '2024-01-07T14:00:00.000Z',
    },
  ],
};

const mockDocuments = {
  documents: [
    {
      id: 'doc-001',
      application_id: 'permit-001',
      filename: 'site-plan.pdf',
      mime_type: 'application/pdf',
      size_bytes: 102400,
      storage_key: 'permits/permit-001/site-plan.pdf',
      uploaded_at: '2024-01-02T10:00:00.000Z',
    },
  ],
};

function setAuthState(page: Parameters<Parameters<typeof test>[1]>[0]) {
  return page.addInitScript(() => {
    localStorage.setItem(
      'auth-store',
      JSON.stringify({
        state: {
          user: {
            id: 'user-001',
            email: 'applicant@permits.local',
            role: 'applicant',
            full_name: 'Jane Smith',
          },
          accessToken: 'mock-access-token',
          isAuthenticated: true,
          isLoading: false,
        },
        version: 0,
      }),
    );
  });
}

test.describe('Permit Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth endpoints
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
    await page.route('**/auth/refresh', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-access-token' }),
      });
    });
  });

  test('shows skeleton panels while loading', async ({ page }) => {
    // Intercept GET /permits/:id with artificial delay
    await page.route('**/permits/permit-001', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPermit),
      });
    });
    await page.route('**/permits/permit-001/lifecycle', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycleSubmitted),
      });
    });
    await page.route('**/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDocuments),
      });
    });

    await setAuthState(page);
    await page.goto('/permits/permit-001');

    // Skeleton should be visible while loading
    const skeleton = page.locator('[data-testid="permit-detail-skeleton"]');
    await expect(skeleton).toBeVisible();
  });

  test('renders all 7 lifecycle stages in timeline', async ({ page }) => {
    await page.route('**/permits/permit-draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(draftPermit),
      });
    });
    await page.route('**/permits/permit-draft/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycleDraft),
      });
    });
    await page.route('**/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [] }),
      });
    });

    await setAuthState(page);
    await page.goto('/permits/permit-draft');

    // Wait for page to load
    await page.locator('[data-testid="permit-detail-page"]').waitFor({ state: 'visible' });

    // All 7 stage labels should be present (6 unique statuses displayed as text)
    await expect(page.getByText('Draft')).toBeVisible();
    await expect(page.getByText('Submitted')).toBeVisible();
    await expect(page.getByText('Under Review')).toBeVisible();
    await expect(page.getByText('Additional Info Needed')).toBeVisible();
    await expect(page.getByText('Approved')).toBeVisible();
    await expect(page.getByText('Rejected')).toBeVisible();
  });

  test('completed stage shows timestamp', async ({ page }) => {
    await page.route('**/permits/permit-001', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPermit),
      });
    });
    await page.route('**/permits/permit-001/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycleSubmitted),
      });
    });
    await page.route('**/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDocuments),
      });
    });

    await setAuthState(page);
    await page.goto('/permits/permit-001');
    await page.locator('[data-testid="permit-detail-page"]').waitFor({ state: 'visible' });

    // Submitted stage should show a relative timestamp (e.g. "ago")
    const timelinePanel = page.locator('[data-testid="permit-status-timeline"]');
    await expect(timelinePanel).toBeVisible();
    // The submitted stage entry has entered_at — some relative time text should appear
    const submittedStage = page.locator('[data-testid="stage-submitted"]');
    await expect(submittedStage).toBeVisible();
    // Verify relative time text is present in submitted stage
    await expect(submittedStage).toContainText('ago');
  });

  test('current stage shows In Progress indicator', async ({ page }) => {
    await page.route('**/permits/permit-review', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(underReviewPermit),
      });
    });
    await page.route('**/permits/permit-review/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycleUnderReview),
      });
    });
    await page.route('**/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [] }),
      });
    });

    await setAuthState(page);
    await page.goto('/permits/permit-review');
    await page.locator('[data-testid="permit-detail-page"]').waitFor({ state: 'visible' });

    // "In Progress" label should be visible on the under_review stage
    const inProgressPill = page.locator('[data-testid="in-progress-pill"]');
    await expect(inProgressPill).toBeVisible();
    await expect(inProgressPill).toContainText('In Progress');
  });

  test('approved terminal stage highlighted, rejected muted', async ({ page }) => {
    await page.route('**/permits/permit-approved', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(approvedPermit),
      });
    });
    await page.route('**/permits/permit-approved/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycleApproved),
      });
    });
    await page.route('**/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [] }),
      });
    });

    await setAuthState(page);
    await page.goto('/permits/permit-approved');
    await page.locator('[data-testid="permit-detail-page"]').waitFor({ state: 'visible' });

    // Approved stage should be completed (data-state="completed")
    const approvedStage = page.locator('[data-testid="stage-approved"]');
    await expect(approvedStage).toBeVisible();
    await expect(approvedStage).toHaveAttribute('data-state', 'completed');

    // Rejected stage should be muted-terminal
    const rejectedStage = page.locator('[data-testid="stage-rejected"]');
    await expect(rejectedStage).toBeVisible();
    await expect(rejectedStage).toHaveAttribute('data-state', 'muted-terminal');
  });

  test('info request note shown in orange box when additional_info_needed', async ({ page }) => {
    await page.route('**/permits/permit-info', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(additionalInfoPermit),
      });
    });
    await page.route('**/permits/permit-info/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycleAdditionalInfo),
      });
    });
    await page.route('**/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [] }),
      });
    });

    await setAuthState(page);
    await page.goto('/permits/permit-info');
    await page.locator('[data-testid="permit-detail-page"]').waitFor({ state: 'visible' });

    // Orange info request box should be visible
    const infoBox = page.locator('.bg-orange-50.border-orange-300');
    await expect(infoBox).toBeVisible();
    await expect(infoBox).toContainText('Please provide proof of property ownership.');
    await expect(infoBox).toContainText('Additional Information Requested');
  });

  test('document panel renders DocumentList for the application', async ({ page }) => {
    await page.route('**/permits/permit-001', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPermit),
      });
    });
    await page.route('**/permits/permit-001/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycleSubmitted),
      });
    });
    await page.route('**/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDocuments),
      });
    });

    await setAuthState(page);
    await page.goto('/permits/permit-001');
    await page.locator('[data-testid="permit-detail-page"]').waitFor({ state: 'visible' });

    // Document panel should be visible
    const documentPanel = page.locator('[data-testid="document-panel"]');
    await expect(documentPanel).toBeVisible();
    await expect(documentPanel).toContainText('Documents');

    // Document list should render the file
    await expect(documentPanel).toContainText('site-plan.pdf');
  });

  test('messaging panel shows stub placeholder text', async ({ page }) => {
    await page.route('**/permits/permit-001', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPermit),
      });
    });
    await page.route('**/permits/permit-001/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycleSubmitted),
      });
    });
    await page.route('**/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDocuments),
      });
    });

    await setAuthState(page);
    await page.goto('/permits/permit-001');
    await page.locator('[data-testid="permit-detail-page"]').waitFor({ state: 'visible' });

    // Messaging stub should be visible
    const messagingStub = page.locator('[data-testid="messaging-stub"]');
    await expect(messagingStub).toBeVisible();
    await expect(messagingStub).toContainText('Messaging will be available');
  });

  test('no horizontal scroll at 375px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.route('**/permits/permit-001', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPermit),
      });
    });
    await page.route('**/permits/permit-001/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycleSubmitted),
      });
    });
    await page.route('**/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [] }),
      });
    });

    await setAuthState(page);
    await page.goto('/permits/permit-001');
    await page.locator('[data-testid="permit-detail-page"]').waitFor({ state: 'visible' });

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('draft permit shows Edit button linking to edit page', async ({ page }) => {
    await page.route('**/permits/permit-draft', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(draftPermit),
      });
    });
    await page.route('**/permits/permit-draft/lifecycle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLifecycleDraft),
      });
    });
    await page.route('**/documents**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [] }),
      });
    });

    await setAuthState(page);
    await page.goto('/permits/permit-draft');
    await page.locator('[data-testid="permit-detail-page"]').waitFor({ state: 'visible' });

    // Edit button should be visible for draft permits
    const editButton = page.locator('[data-testid="edit-button"]');
    await expect(editButton).toBeVisible();
    await expect(editButton).toContainText('Edit');
    await expect(editButton).toHaveAttribute('href', '/permits/permit-draft/edit');
  });
});
