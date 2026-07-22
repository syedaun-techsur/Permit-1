import { test, expect } from '@playwright/test';

/**
 * Document Upload E2E Tests
 *
 * These tests cover the document upload UI (DOCS-01 through DOCS-04).
 * They mock the backend API endpoints to test the frontend behavior in isolation.
 *
 * The API client calls http://localhost:3000 directly (see frontend/src/api/client.ts).
 * Playwright route patterns intercept these requests.
 */

const APPLICANT = { email: 'applicant@permits.local', password: 'Applicant@12345!' };

// API base used by the frontend in dev/test
const API_BASE = 'http://localhost:3000';

// Helper: log in as applicant
async function loginAsApplicant(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(APPLICANT.email);
  await page.getByLabel('Password').fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/applicant/);
}

function makePermitData(permitId: string, status = 'draft') {
  return {
    id: permitId,
    status,
    permit_type: 'construction',
    project_description: 'Test project',
    site_street: '123 Main St',
    site_city: 'Anytown',
    site_state: 'CA',
    site_zip: '12345',
    contact_name: 'Test User',
    contact_phone: '555-0100',
    contact_email: 'test@example.com',
    reference_number: `PERM-${permitId}`,
    applicant_id: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submitted_at: status === 'submitted' ? new Date().toISOString() : undefined,
  };
}

function makeDocumentData(docId: string, permitId: string, mimeType = 'application/pdf', filename = 'doc.pdf') {
  return {
    id: docId,
    application_id: permitId,
    uploaded_by: 'user-1',
    filename,
    mime_type: mimeType,
    size_bytes: 2048,
    storage_key: `${docId}-key`,
    status: 'uploaded',
    uploaded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Setup routes for a draft permit with no documents.
 */
async function setupDraftPermitRoutes(
  page: import('@playwright/test').Page,
  permitId: string,
  status = 'draft',
) {
  await page.route(`${API_BASE}/permits/${permitId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(makePermitData(permitId, status)),
    });
  });

  await page.route(`${API_BASE}/permits/${permitId}/documents`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Navigate to a permit edit page and advance to step 2.
 */
async function goToStep2(
  page: import('@playwright/test').Page,
  permitId: string,
) {
  await page.goto(`/permits/${permitId}/edit`);
  await page.getByTestId('next-button').click();
  await expect(page.getByTestId('step-2-content')).toBeVisible();
}

// ─── Tests ─────────────────────────────────────────────────────────────────

test.describe('Document Upload — Upload Zone', () => {
  test('shows upload zone with drag-drop area and Browse Files button', async ({ page }) => {
    await loginAsApplicant(page);
    const permitId = 'browse-files-test';
    await setupDraftPermitRoutes(page, permitId);
    await goToStep2(page, permitId);

    const uploadZone = page.getByTestId('upload-zone');
    await expect(uploadZone).toBeVisible();

    const browseBtn = page.getByTestId('browse-files-button');
    await expect(browseBtn).toBeVisible();
    await expect(browseBtn).toHaveText(/browse files/i);

    await expect(page.getByText(/accepted: pdf, jpeg, png, docx/i)).toBeVisible();
  });
});

test.describe('Document Upload — Client-side Validation', () => {
  test('client-side rejects file larger than 25 MB without network call', async ({ page }) => {
    await loginAsApplicant(page);

    const permitId = 'size-validation-test';
    let uploadUrlCalled = false;

    await page.route(`${API_BASE}/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makePermitData(permitId)),
      });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents/upload-url`, async (route) => {
      uploadUrlCalled = true;
      await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    await goToStep2(page, permitId);

    // Create a file buffer just over the 25 MB limit (26 MB)
    const oversizedBuffer = Buffer.alloc(26 * 1024 * 1024, 0);

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('browse-files-button').click(),
    ]);
    await fileChooser.setFiles({
      name: 'oversized.pdf',
      mimeType: 'application/pdf',
      buffer: oversizedBuffer,
    });

    // Error shown inline (not in modal/toast)
    await expect(page.getByText(/file too large/i)).toBeVisible();
    // No network call made
    expect(uploadUrlCalled).toBe(false);
  });

  test('client-side rejects invalid file type', async ({ page }) => {
    await loginAsApplicant(page);
    const permitId = 'type-validation-test';
    await setupDraftPermitRoutes(page, permitId);
    await goToStep2(page, permitId);

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('browse-files-button').click(),
    ]);
    await fileChooser.setFiles({
      name: 'malware.exe',
      mimeType: 'application/x-executable',
      buffer: Buffer.from('MZ'),
    });

    await expect(page.getByText(/invalid file type/i)).toBeVisible();
  });
});

test.describe('Document Upload — Upload Flow', () => {
  test('successful upload shows progress bar then checkmark', async ({ page }) => {
    await loginAsApplicant(page);
    const permitId = 'success-upload-test';

    await page.route(`${API_BASE}/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makePermitData(permitId)),
      });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents/upload-url`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          uploadUrl: 'http://localhost:9000/bucket/key?sig=abc',
          storageKey: 'uploads/key',
          expiresAt: new Date(Date.now() + 900000).toISOString(),
        }),
      });
    });

    // MinIO presigned PUT — plain axios, no auth header
    await page.route('http://localhost:9000/**', async (route) => {
      await route.fulfill({ status: 200 });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(makeDocumentData('doc-1', permitId, 'application/pdf', 'report.pdf')),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await goToStep2(page, permitId);

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('browse-files-button').click(),
    ]);
    await fileChooser.setFiles({
      name: 'report.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test'),
    });

    // Uploaded checkmark appears
    await expect(page.getByLabel('Uploaded')).toBeVisible({ timeout: 10000 });
  });

  test('individual file error does not block other files', async ({ page }) => {
    await loginAsApplicant(page);
    const permitId = 'partial-error-test';
    let callCount = 0;

    await page.route(`${API_BASE}/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makePermitData(permitId)),
      });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents/upload-url`, async (route) => {
      callCount++;
      if (callCount === 1) {
        // First call fails
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Server error' }),
        });
      } else {
        // Second call succeeds
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            uploadUrl: 'http://localhost:9000/bucket/key2?sig=def',
            storageKey: 'uploads/key2',
            expiresAt: new Date(Date.now() + 900000).toISOString(),
          }),
        });
      }
    });

    await page.route('http://localhost:9000/**', async (route) => {
      await route.fulfill({ status: 200 });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(makeDocumentData('doc-2', permitId, 'application/pdf', 'file2.pdf')),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await goToStep2(page, permitId);

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('browse-files-button').click(),
    ]);
    await fileChooser.setFiles([
      { name: 'file1.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 1') },
      { name: 'file2.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 2') },
    ]);

    // First file → error, second → checkmark (both visible)
    await expect(page.getByLabel('Error')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Uploaded')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Document Upload — Remove Flow', () => {
  test('remove button shows confirmation dialog then removes document', async ({ page }) => {
    await loginAsApplicant(page);
    const permitId = 'remove-test';
    const docId = 'doc-remove';

    await page.route(`${API_BASE}/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makePermitData(permitId)),
      });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          makeDocumentData(docId, permitId, 'application/pdf', 'existing-doc.pdf'),
        ]),
      });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents/${docId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Document deleted successfully' }),
      });
    });

    await goToStep2(page, permitId);

    // Wait for doc to appear
    await expect(page.getByText('existing-doc.pdf')).toBeVisible({ timeout: 5000 });

    // Click trash button
    await page.getByRole('button', { name: /remove existing-doc\.pdf/i }).click();

    // Confirmation modal should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByText(/this cannot be undone/i),
    ).toBeVisible();

    // Confirm removal
    await page.getByRole('button', { name: /^remove$/i }).click();

    // Document should be gone
    await expect(page.getByText('existing-doc.pdf')).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Document Upload — Preview', () => {
  test('image thumbnail shown for JPEG upload', async ({ page }) => {
    await loginAsApplicant(page);
    const permitId = 'jpeg-preview-test';
    const docId = 'doc-jpeg';

    await page.route(`${API_BASE}/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makePermitData(permitId)),
      });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          makeDocumentData(docId, permitId, 'image/jpeg', 'site-photo.jpg'),
        ]),
      });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents/${docId}/url`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=',
          expiresAt: new Date(Date.now() + 900000).toISOString(),
        }),
      });
    });

    await goToStep2(page, permitId);

    await expect(page.getByText('site-photo.jpg')).toBeVisible({ timeout: 5000 });
    // Image thumbnail rendered
    await expect(page.locator('img[alt="site-photo.jpg"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Document Upload — Disabled State', () => {
  test('upload zone is disabled for submitted applications', async ({ page }) => {
    await loginAsApplicant(page);
    const permitId = 'submitted-test';

    await page.route(`${API_BASE}/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(makePermitData(permitId, 'submitted')),
      });
    });

    await page.route(`${API_BASE}/permits/${permitId}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await goToStep2(page, permitId);

    const uploadZone = page.getByTestId('upload-zone');
    await expect(uploadZone).toBeVisible();
    await expect(uploadZone).toHaveAttribute('aria-disabled', 'true');

    const browseBtn = page.getByTestId('browse-files-button');
    await expect(browseBtn).toBeDisabled();
  });
});
