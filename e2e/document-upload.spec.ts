import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Document Upload E2E Tests
 *
 * These tests cover the document upload UI (DOCS-01 through DOCS-04).
 * They mock the backend API endpoints to test the frontend behavior in isolation.
 *
 * Full integration tests (with real MinIO and backend) are in the verify phase.
 */

const APPLICANT = { email: 'applicant@permits.local', password: 'Applicant@12345!' };

// Helper: log in as applicant
async function loginAsApplicant(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(APPLICANT.email);
  await page.getByLabel('Password').fill(APPLICANT.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/applicant/);
}

// Helper: navigate to a permit form step 2 with mocked API
async function navigateToStep2(
  page: import('@playwright/test').Page,
  permitId = 'test-permit-123',
) {
  // Mock GET /permits/:id to return a draft permit
  await page.route(`**/api/permits/${permitId}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: permitId,
          status: 'draft',
          permit_type: 'construction',
          project_description: 'Test project',
          site_street: '123 Main St',
          site_city: 'Anytown',
          site_state: 'CA',
          site_zip: '12345',
          contact_name: 'Test User',
          contact_phone: '555-0100',
          contact_email: 'test@example.com',
          reference_number: 'PERM-0001',
          applicant_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock GET /permits/:id/documents to return empty list initially
  await page.route(`**/api/permits/${permitId}/documents`, async (route) => {
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

  await page.goto(`/permits/${permitId}/edit`);
  // Navigate to step 2
  await page.getByTestId('next-button').click();
}

test.describe('Document Upload — Upload Zone', () => {
  test('shows upload zone with drag-drop area and Browse Files button', async ({ page }) => {
    await loginAsApplicant(page);

    const permitId = 'test-permit-browse';

    // Mock APIs
    await page.route(`**/api/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: permitId,
          status: 'draft',
          permit_type: 'construction',
          project_description: 'Test project for browse files',
          site_street: '123 Main St',
          site_city: 'Anytown',
          site_state: 'CA',
          site_zip: '12345',
          contact_name: 'Test User',
          contact_phone: '555-0100',
          contact_email: 'test@example.com',
          reference_number: 'PERM-0002',
          applicant_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    await page.route(`**/api/permits/${permitId}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`/permits/${permitId}/edit`);
    // Click next to advance to step 2
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('step-2-content')).toBeVisible();

    // Upload zone should be visible
    const uploadZone = page.getByTestId('upload-zone');
    await expect(uploadZone).toBeVisible();

    // Browse Files button should be present
    const browseBtn = page.getByTestId('browse-files-button');
    await expect(browseBtn).toBeVisible();
    await expect(browseBtn).toHaveText(/browse files/i);

    // File limits info should be shown
    await expect(page.getByText(/accepted: pdf, jpeg, png, docx/i)).toBeVisible();
  });
});

test.describe('Document Upload — Client-side Validation', () => {
  test('client-side rejects file larger than 25 MB without network call', async ({ page }) => {
    await loginAsApplicant(page);

    const permitId = 'test-permit-size';
    let uploadUrlCalled = false;

    await page.route(`**/api/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: permitId,
          status: 'draft',
          permit_type: 'construction',
          project_description: 'Test project',
          site_street: '123 Main St',
          site_city: 'Anytown',
          site_state: 'CA',
          site_zip: '12345',
          contact_name: 'Test User',
          contact_phone: '555-0100',
          contact_email: 'test@example.com',
          reference_number: 'PERM-0003',
          applicant_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    await page.route(`**/api/permits/${permitId}/documents`, async (route) => {
      if (route.request().url().includes('upload-url')) {
        uploadUrlCalled = true;
        await route.fulfill({ status: 200, body: JSON.stringify({}) });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await page.goto(`/permits/${permitId}/edit`);
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('step-2-content')).toBeVisible();

    // Create an oversized file buffer (26 MB > 25 MB limit)
    const oversizedBuffer = Buffer.alloc(26 * 1024 * 1024, 'x');

    // Use file chooser to attach the oversized file
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('browse-files-button').click(),
    ]);
    await fileChooser.setFiles({
      name: 'oversized.pdf',
      mimeType: 'application/pdf',
      buffer: oversizedBuffer,
    });

    // Error should appear inline (not in modal/toast)
    await expect(page.getByText(/file too large/i)).toBeVisible();

    // Network call should NOT have been made
    expect(uploadUrlCalled).toBe(false);
  });

  test('client-side rejects invalid file type', async ({ page }) => {
    await loginAsApplicant(page);

    const permitId = 'test-permit-type';

    await page.route(`**/api/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: permitId,
          status: 'draft',
          permit_type: 'construction',
          project_description: 'Test project',
          site_street: '123 Main St',
          site_city: 'Anytown',
          site_state: 'CA',
          site_zip: '12345',
          contact_name: 'Test User',
          contact_phone: '555-0100',
          contact_email: 'test@example.com',
          reference_number: 'PERM-0004',
          applicant_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    await page.route(`**/api/permits/${permitId}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`/permits/${permitId}/edit`);
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('step-2-content')).toBeVisible();

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('browse-files-button').click(),
    ]);
    await fileChooser.setFiles({
      name: 'malware.exe',
      mimeType: 'application/x-executable',
      buffer: Buffer.from('MZ'),
    });

    // Error should appear inline
    await expect(page.getByText(/invalid file type/i)).toBeVisible();
  });
});

test.describe('Document Upload — Upload Flow', () => {
  test('successful upload shows progress bar then checkmark', async ({ page }) => {
    await loginAsApplicant(page);

    const permitId = 'test-permit-success';

    await page.route(`**/api/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: permitId,
          status: 'draft',
          permit_type: 'construction',
          project_description: 'Test project',
          site_street: '123 Main St',
          site_city: 'Anytown',
          site_state: 'CA',
          site_zip: '12345',
          contact_name: 'Test User',
          contact_phone: '555-0100',
          contact_email: 'test@example.com',
          reference_number: 'PERM-0005',
          applicant_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    // Mock upload-url endpoint
    await page.route(`**/api/permits/${permitId}/documents/upload-url`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          uploadUrl: 'http://localhost:9000/test-bucket/test-key?presigned=true',
          storageKey: 'test-storage-key',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        }),
      });
    });

    // Mock MinIO presigned PUT
    await page.route('**/test-bucket/**', async (route) => {
      await route.fulfill({ status: 200 });
    });

    // Mock register document endpoint
    await page.route(`**/api/permits/${permitId}/documents`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'doc-1',
            application_id: permitId,
            uploaded_by: 'user-1',
            filename: 'test.pdf',
            mime_type: 'application/pdf',
            size_bytes: 1024,
            storage_key: 'test-storage-key',
            status: 'uploaded',
            uploaded_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await page.goto(`/permits/${permitId}/edit`);
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('step-2-content')).toBeVisible();

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('browse-files-button').click(),
    ]);
    await fileChooser.setFiles({
      name: 'test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test content'),
    });

    // Should eventually show checkmark (uploaded state)
    await expect(page.getByLabel('Uploaded')).toBeVisible({ timeout: 10000 });
  });

  test('individual file error does not block other files', async ({ page }) => {
    await loginAsApplicant(page);

    const permitId = 'test-permit-partial';
    let callCount = 0;

    await page.route(`**/api/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: permitId,
          status: 'draft',
          permit_type: 'construction',
          project_description: 'Test project',
          site_street: '123 Main St',
          site_city: 'Anytown',
          site_state: 'CA',
          site_zip: '12345',
          contact_name: 'Test User',
          contact_phone: '555-0100',
          contact_email: 'test@example.com',
          reference_number: 'PERM-0006',
          applicant_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    // First file fails upload-url, second succeeds
    await page.route(`**/api/permits/${permitId}/documents/upload-url`, async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            uploadUrl: 'http://localhost:9000/test-bucket/test-key-2?presigned=true',
            storageKey: 'test-storage-key-2',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          }),
        });
      }
    });

    await page.route('**/test-bucket/**', async (route) => {
      await route.fulfill({ status: 200 });
    });

    await page.route(`**/api/permits/${permitId}/documents`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'doc-2',
            application_id: permitId,
            uploaded_by: 'user-1',
            filename: 'file2.pdf',
            mime_type: 'application/pdf',
            size_bytes: 512,
            storage_key: 'test-storage-key-2',
            status: 'uploaded',
            uploaded_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await page.goto(`/permits/${permitId}/edit`);
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('step-2-content')).toBeVisible();

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('browse-files-button').click(),
    ]);
    await fileChooser.setFiles([
      {
        name: 'file1.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 file1'),
      },
      {
        name: 'file2.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 file2'),
      },
    ]);

    // First file shows error
    await expect(page.getByLabel('Error')).toBeVisible({ timeout: 10000 });
    // Second file shows success checkmark
    await expect(page.getByLabel('Uploaded')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Document Upload — Remove Flow', () => {
  test('remove button shows confirmation dialog then removes document', async ({ page }) => {
    await loginAsApplicant(page);

    const permitId = 'test-permit-remove';
    const docId = 'doc-to-remove';

    await page.route(`**/api/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: permitId,
          status: 'draft',
          permit_type: 'construction',
          project_description: 'Test project',
          site_street: '123 Main St',
          site_city: 'Anytown',
          site_state: 'CA',
          site_zip: '12345',
          contact_name: 'Test User',
          contact_phone: '555-0100',
          contact_email: 'test@example.com',
          reference_number: 'PERM-0007',
          applicant_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    // Mock listDocuments with one existing document
    await page.route(`**/api/permits/${permitId}/documents`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: docId,
              application_id: permitId,
              uploaded_by: 'user-1',
              filename: 'existing-doc.pdf',
              mime_type: 'application/pdf',
              size_bytes: 2048,
              storage_key: 'some-key',
              status: 'uploaded',
              uploaded_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]),
        });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200, body: JSON.stringify({ message: 'Deleted' }) });
      } else {
        await route.continue();
      }
    });

    await page.route(`**/api/permits/${permitId}/documents/${docId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Document deleted successfully' }),
      });
    });

    await page.goto(`/permits/${permitId}/edit`);
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('step-2-content')).toBeVisible();

    // The document should be listed
    await expect(page.getByText('existing-doc.pdf')).toBeVisible({ timeout: 5000 });

    // Click the remove (trash) button
    await page.getByRole('button', { name: /remove existing-doc\.pdf/i }).click();

    // Confirmation dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/remove "existing-doc\.pdf"\? this cannot be undone/i)).toBeVisible();

    // Click Remove to confirm
    await page.getByRole('button', { name: /^remove$/i }).click();

    // Document should be removed from the list
    await expect(page.getByText('existing-doc.pdf')).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Document Upload — Preview', () => {
  test('image thumbnail shown for JPEG upload', async ({ page }) => {
    await loginAsApplicant(page);

    const permitId = 'test-permit-img';
    const docId = 'doc-jpeg';

    await page.route(`**/api/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: permitId,
          status: 'draft',
          permit_type: 'construction',
          project_description: 'Test project',
          site_street: '123 Main St',
          site_city: 'Anytown',
          site_state: 'CA',
          site_zip: '12345',
          contact_name: 'Test User',
          contact_phone: '555-0100',
          contact_email: 'test@example.com',
          reference_number: 'PERM-0008',
          applicant_id: 'user-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    // Mock listDocuments with a JPEG document
    await page.route(`**/api/permits/${permitId}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: docId,
            application_id: permitId,
            uploaded_by: 'user-1',
            filename: 'site-photo.jpg',
            mime_type: 'image/jpeg',
            size_bytes: 153600,
            storage_key: 'photo-key',
            status: 'uploaded',
            uploaded_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]),
      });
    });

    // Mock getDocumentUrl for the JPEG
    await page.route(`**/api/permits/${permitId}/documents/${docId}/url`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'http://localhost:9000/test-bucket/photo-key?presigned=get',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        }),
      });
    });

    // Mock the actual image
    await page.route('**/photo-key**', async (route) => {
      // Return a small valid 1x1 JPEG
      const minJpeg = Buffer.from(
        'ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb00430109090a0d0a0d1a0d0d1a321a1a321a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1affc0001108000100010203012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a929394959697989 9a0a2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b511000201020404030407050404000102770001020311040521314106134261510722711432819112021a1082342b1c1155262031a213352733261463552764472819a2535363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a929394959697989 9a0a2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00fbd',
        'hex',
      ).subarray(0, 10);
      await route.fulfill({
        status: 200,
        contentType: 'image/jpeg',
        body: minJpeg,
      });
    });

    await page.goto(`/permits/${permitId}/edit`);
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('step-2-content')).toBeVisible();

    // The JPEG document should be listed
    await expect(page.getByText('site-photo.jpg')).toBeVisible({ timeout: 5000 });

    // An img element should be rendered for the thumbnail
    await expect(page.locator('img[alt="site-photo.jpg"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Document Upload — Disabled State', () => {
  test('upload zone is disabled for submitted applications', async ({ page }) => {
    await loginAsApplicant(page);

    const permitId = 'test-permit-submitted';

    await page.route(`**/api/permits/${permitId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: permitId,
          status: 'submitted', // Submitted — upload should be disabled
          permit_type: 'construction',
          project_description: 'Test project',
          site_street: '123 Main St',
          site_city: 'Anytown',
          site_state: 'CA',
          site_zip: '12345',
          contact_name: 'Test User',
          contact_phone: '555-0100',
          contact_email: 'test@example.com',
          reference_number: 'PERM-0009',
          applicant_id: 'user-1',
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });
    });

    await page.route(`**/api/permits/${permitId}/documents`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto(`/permits/${permitId}/edit`);
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('step-2-content')).toBeVisible();

    // Upload zone should be visible but disabled
    const uploadZone = page.getByTestId('upload-zone');
    await expect(uploadZone).toBeVisible();
    await expect(uploadZone).toHaveAttribute('aria-disabled', 'true');

    // Browse Files button should be disabled
    const browseBtn = page.getByTestId('browse-files-button');
    await expect(browseBtn).toBeDisabled();
  });
});
