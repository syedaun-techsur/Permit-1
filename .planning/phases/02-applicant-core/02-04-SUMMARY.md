---
phase: 02-applicant-core
plan: "04"
subsystem: ui
tags: [react, react-dropzone, react-pdf, typescript, document-upload, presigned-url, minio, playwright]

# Dependency graph
requires:
  - phase: 02-applicant-core
    provides: "02-02: Document backend endpoints (upload-url, register, list, get-url, delete)"
  - phase: 01-foundation
    provides: "01-03: Axios apiClient with JWT interceptor"
provides:
  - "DocumentUploadZone: drag-drop zone with Browse Files, disabled for submitted apps"
  - "UploadProgress: per-file status display (queued/uploading/uploaded/error) with inline errors"
  - "DocumentList: list of uploaded docs with remove button (draft/info_needed only) + confirmation dialog"
  - "DocumentPreview: image lightbox, react-pdf embedded viewer, DOCX icon + download"
  - "useDocumentUpload: presign → PUT (axios progress) → register flow with Promise.allSettled"
  - "documentsApi: 5 methods (getUploadUrl, registerDocument, listDocuments, getDocumentUrl, deleteDocument)"
  - "PermitFormPage Step 2: DocumentUploadZone wired with real permitId and permit status"
  - "E2E tests: 8 Playwright tests covering all DOCS-01..DOCS-04 scenarios"
affects: [02-05, permits-submit-gate]

# Tech tracking
tech-stack:
  added: [react-dropzone@19.1.1, react-pdf@10.4.1]
  patterns:
    - "Presigned URL pattern: browser → getUploadUrl → PUT MinIO directly (plain axios, no auth header) → registerDocument"
    - "Promise.allSettled for parallel uploads: individual failures don't block the batch"
    - "Client-side validation before any network call: MIME type, file size (25 MB), filename length (255 chars)"
    - "react-dropzone noClick: separate Browse Files button triggers open() — avoids accidental uploads"
    - "Lightbox: fixed inset-0 overlay with click-outside-to-close for image full-size preview"
    - "Lazy presigned GET URL fetch: images on mount, PDFs on first 'View PDF' click"

key-files:
  created:
    - frontend/src/components/document/DocumentUploadZone.tsx
    - frontend/src/components/document/UploadProgress.tsx
    - frontend/src/components/document/DocumentList.tsx
    - frontend/src/components/document/DocumentPreview.tsx
    - e2e/document-upload.spec.ts
  modified:
    - frontend/src/api/documents.api.ts
    - frontend/src/hooks/useDocumentUpload.ts
    - frontend/src/pages/permits/PermitFormPage.tsx
    - frontend/src/types/document.types.ts

key-decisions:
  - "Plain axios (not apiClient) for MinIO presigned PUT: presigned URL auth is in query params; JWT Authorization header would break the request"
  - "Promise.allSettled: failures on individual files do not abort sibling uploads in the batch"
  - "Client-side validation is UX-only: server enforces max size and MIME type authoritatively (T-02-19)"
  - "react-dropzone noClick=true: explicit Browse Files button prevents the entire zone from acting as a file picker trigger"
  - "Lazy URL fetch for PDFs: presigned GET URL fetched on first 'View PDF' click to avoid unnecessary requests on list load"

patterns-established:
  - "File upload pattern: presign → PUT → confirm (3-step) for all direct-to-MinIO uploads"
  - "E2E test pattern: intercept http://localhost:3000 (not /api prefix) matching the apiClient BASE_URL"

# Metrics
duration: 9min
completed: 2026-07-22
---

# Phase 2 Plan 04: Document Upload UI Summary

**Drag-drop document upload zone with presigned URL flow (react-dropzone), per-file progress tracking, inline preview (lightbox for images, react-pdf for PDFs, DOCX icon+download), remove with confirmation, wired into PermitFormPage Step 2**

## Performance

- **Duration:** 9 min
- **Started:** 2026-07-22T19:28:11Z
- **Completed:** 2026-07-22T19:37:51Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Complete presign → PUT → register upload flow with per-file progress bars and `Promise.allSettled` parallel uploads (individual failures don't block the batch)
- Client-side validation rejects invalid MIME types and files > 25 MB before any network call, showing inline errors per file (not modal/toast)
- DocumentPreview renders image thumbnails with full-screen lightbox, react-pdf embedded viewer with page navigation, and DOCX icon + download link
- DocumentUploadZone disabled (with muted styling) for non-editable application statuses (not draft or additional_info_needed)
- DocumentUploadZone wired into PermitFormPage Step 2 with real `permitId` and `permitStatus` from the loaded/created permit
- 8 Playwright E2E tests covering all DOCS-01..DOCS-04 scenarios

## Task Commits

1. **Task 1: documents API + useDocumentUpload hook** — `a03ed87` (feat)
2. **Task 2: Document UI components + PermitFormPage wiring + E2E tests** — `54813f1` (feat)

**Plan metadata:** *(committed below)*

## Files Created/Modified

- `frontend/src/components/document/DocumentUploadZone.tsx` — Drag-drop zone (react-dropzone) with Browse Files button, disabled state for submitted apps
- `frontend/src/components/document/UploadProgress.tsx` — Per-file status list: clock/progress bar/checkmark/error with inline error text
- `frontend/src/components/document/DocumentList.tsx` — Uploaded document list with remove button + Modal confirmation (draft/info_needed only)
- `frontend/src/components/document/DocumentPreview.tsx` — Image lightbox, react-pdf embedded viewer, DOCX download link
- `frontend/src/hooks/useDocumentUpload.ts` — Client-side validation → presigned PUT with axios progress → register; Promise.allSettled parallel
- `frontend/src/api/documents.api.ts` — 5 documentsApi methods (getUploadUrl, registerDocument, listDocuments, getDocumentUrl, deleteDocument)
- `frontend/src/pages/permits/PermitFormPage.tsx` — Step 2 replaced placeholder with DocumentUploadZone wired to real permitId/permitStatus
- `frontend/src/types/document.types.ts` — `filename` field added to UploadFileState for queue tracking
- `e2e/document-upload.spec.ts` — 8 Playwright tests; fixed intercept URL pattern to match `http://localhost:3000` (apiClient BASE_URL)

## Decisions Made

- Used plain `axios` (not `apiClient`) for MinIO presigned PUT — presigned URLs embed auth in query params; the JWT Authorization header from `apiClient` would break them
- `Promise.allSettled` for parallel batch uploads — individual file errors don't abort other uploads in the same batch
- `noClick: true` on react-dropzone with a separate Browse Files button — avoids the full zone acting as a giant file picker trigger
- Lazy presigned GET URL fetch for PDFs — fetched on first "View PDF" click, not on list load

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] E2E API intercept URL used wrong base pattern**
- **Found during:** Task 2 (E2E test creation)
- **Issue:** Prior version used `**/api/permits/**` but the apiClient calls `http://localhost:3000` directly (no `/api` prefix)
- **Fix:** Changed all route intercepts to use `const API_BASE = 'http://localhost:3000'` matching the client
- **Files modified:** `e2e/document-upload.spec.ts`
- **Verification:** URL pattern matches apiClient BASE_URL configuration
- **Committed in:** 54813f1

**2. [Rule 1 - Bug] Removed unused `UploadFileState` import in DocumentUploadZone**
- **Found during:** Task 2 (TypeScript review)
- **Issue:** Import was leftover after refactoring the onDrop logic
- **Fix:** Removed unused import
- **Files modified:** `frontend/src/components/document/DocumentUploadZone.tsx`
- **Committed in:** 54813f1

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Minor corrections. All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered

- Prior plan (02-03) had pre-built all document component files and the PermitFormPage as forward-planning deliverables. This plan focused on refinements: fixing the E2E test API URL pattern, cleaning up imports, and confirming full TypeScript correctness.

## User Setup Required

None - no external service configuration required for this plan. The MinIO presigned URL integration uses the existing MinIO compose service from Phase 1.

## Next Phase Readiness

- All DOCS-01..DOCS-04 features implemented and TypeScript-clean
- `DocumentUploadZone` wired into `PermitFormPage` Step 2 — applicants can upload documents before submitting
- E2E tests written; execution deferred to verify phase (tests require running app + mocked API)
- Ready for Phase 2 Plan 05 (permit submission flow, DOCUMENTS_REQUIRED gate)

## Self-Check: PASSED

All key files verified on disk:
- ✓ frontend/src/components/document/DocumentUploadZone.tsx
- ✓ frontend/src/components/document/UploadProgress.tsx
- ✓ frontend/src/components/document/DocumentList.tsx
- ✓ frontend/src/components/document/DocumentPreview.tsx
- ✓ frontend/src/api/documents.api.ts
- ✓ frontend/src/hooks/useDocumentUpload.ts
- ✓ e2e/document-upload.spec.ts

Commits verified:
- ✓ a03ed87: feat(02-04): documents API client + useDocumentUpload hook
- ✓ 54813f1: feat(02-04): Document UI components, PermitFormPage Step 2, and E2E tests
- ✓ 2eb7343: docs(02-04): complete document-upload-ui plan

---
*Phase: 02-applicant-core*
*Completed: 2026-07-22*
