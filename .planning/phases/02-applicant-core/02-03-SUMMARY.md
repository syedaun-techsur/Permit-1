---
phase: 02-applicant-core
plan: "03"
subsystem: ui
tags: [react, typescript, zustand, react-hook-form, zod, playwright, tailwind, axios, date-fns]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Design system primitives (Card, Button, Input, Skeleton, Toast), Axios apiClient, auth store/hooks, ProtectedRoute
  - phase: 02-applicant-core
    plan: "01"
    provides: Backend permit endpoints (POST/GET/PATCH /permits, POST /permits/:id/submit)

provides:
  - TypeScript types for PermitApplication, ApplicationStatus, PermitType, LifecycleStage, PaginatedPermits
  - permitsApi client (createPermit, updatePermit, submitPermit, listPermits, getPermit, getLifecycle)
  - notificationsApi client (getUnreadCount)
  - usePermitsStore Zustand store with permitList, selectedPermit, isLoading, upsertPermit
  - usePermit hook (polls every 15s, updates store)
  - useNotifications hook (polls every 30s)
  - PermitStatusBadge component with 6 color-coded statuses
  - PermitCard component with reference, type, address, status badge, action button
  - PermitFormFields component (12 fields with RHF/Zod integration)
  - PermitListPage (skeleton loading, card grid, filter tabs, empty state)
  - PermitFormPage (3-step stepper, 2s debounced auto-save with 3x retry, submit flow)
  - Routes: /permits, /permits/new, /permits/:id/edit
  - E2E Playwright tests for permit-list and permit-form pages
affects: [02-04-document-upload, 02-05-permit-detail, 03-reviewer-core]

# Tech tracking
tech-stack:
  added: [date-fns (relative timestamps)]
  patterns:
    - Debounced auto-save with exponential backoff (2s debounce, 1s/2s/4s retry, 3 attempts max)
    - Zustand upsertPermit pattern for optimistic list updates
    - FormProvider + useFormContext for multi-step form field composition
    - Lazy-loaded React Router pages with Suspense
    - Polling with setInterval + cleanup in useEffect for real-time data

key-files:
  created:
    - frontend/src/types/permit.types.ts
    - frontend/src/types/document.types.ts
    - frontend/src/api/permits.api.ts
    - frontend/src/api/notifications.api.ts
    - frontend/src/store/permits.store.ts
    - frontend/src/hooks/usePermit.ts
    - frontend/src/hooks/useNotifications.ts
    - frontend/src/components/permit/PermitStatusBadge.tsx
    - frontend/src/components/permit/PermitCard.tsx
    - frontend/src/components/permit/PermitFormFields.tsx
    - frontend/src/pages/permits/PermitListPage.tsx
    - frontend/src/pages/permits/PermitFormPage.tsx
    - e2e/permit-list.spec.ts
    - e2e/permit-form.spec.ts
  modified:
    - frontend/src/router/index.tsx
    - frontend/src/components/document/DocumentUploadZone.tsx

key-decisions:
  - "PermitFormPage integrates DocumentUploadZone from 02-02 in Step 2 (not a placeholder) — enables earlier document attachment"
  - "Button 'as' prop pattern not available — used Link component directly with button styling for navigation actions"
  - "permitStatus tracked as separate state in PermitFormPage to correctly gate DocumentUploadZone editability"

patterns-established:
  - "Auto-save pattern: useWatch → 2s debounce → PATCH → retry 3x with 1s/2s/4s backoff → toast after failures"
  - "Polling hooks: useEffect with setInterval + cleanup, interval ID returned for clearInterval"
  - "E2E mocking: page.addInitScript for Zustand localStorage state, page.route for API interception"

# Metrics
duration: 7min
completed: 2026-07-22
---

# Phase 2 Plan 3: Permit Types, API Layer, Zustand Store, PermitListPage, PermitFormPage Summary

**React frontend layer for permit applications: TypeScript types + Axios API client + Zustand store + multi-step form with 2-second debounced auto-save, skeleton-loading list page, and 11 Playwright E2E tests**

## Performance

- **Duration:** 7 min
- **Started:** 2026-07-22T19:28:53Z
- **Completed:** 2026-07-22T19:35:35Z
- **Tasks:** 2 of 2
- **Files modified:** 16

## Accomplishments

- Full TypeScript type coverage for backend permit entities (PermitApplication, ApplicationStatus × 6, PermitType × 6, LifecycleStage, PaginatedPermits)
- `permitsApi` covering all 6 permit CRUD/lifecycle endpoints; `notificationsApi` for unread count polling
- `usePermitsStore` Zustand store with `upsertPermit` for optimistic list updates from auto-save
- `PermitListPage`: 5 skeleton cards during load, PermitCard grid after, filter tabs, empty state with CTA
- `PermitFormPage`: 3-step stepper (Permit Details → Documents → Review & Submit), Zod validation, 2s debounced auto-save with exponential backoff retry × 3, "Saved ✓" inline indicator
- Routes `/permits`, `/permits/new`, `/permits/:id/edit` added to AppRouter under ProtectedRoute

## Task Commits

Each task was committed atomically:

1. **Task 1: TypeScript types, API client, Zustand store, and notification hook** - `d08e3f1` (feat)
2. **Task 2: PermitListPage + PermitFormPage + components + routes + E2E tests** - `52f83ec` (feat)

**Plan metadata:** (docs commit follows)

_Note: E2E tests written; execution deferred to verify phase._

## Files Created/Modified

- `frontend/src/types/permit.types.ts` — ApplicationStatus, PermitType, PermitApplication, LifecycleStage, PaginatedPermits types (replaced minimal stub)
- `frontend/src/types/document.types.ts` — PermitDocument, UploadFileState, UploadUrlResponse (migrated from PermitStatus to ApplicationStatus)
- `frontend/src/api/permits.api.ts` — createPermit, updatePermit, submitPermit, listPermits, getPermit, getLifecycle
- `frontend/src/api/notifications.api.ts` — getUnreadCount
- `frontend/src/store/permits.store.ts` — Zustand store: permitList, selectedPermit, isLoading, upsertPermit
- `frontend/src/hooks/usePermit.ts` — permit + lifecycle polling (15s interval)
- `frontend/src/hooks/useNotifications.ts` — unread count polling (30s interval)
- `frontend/src/components/permit/PermitStatusBadge.tsx` — color-coded badge for all 6 statuses
- `frontend/src/components/permit/PermitCard.tsx` — card with reference, type, address, status, action button
- `frontend/src/components/permit/PermitFormFields.tsx` — 12 form fields integrated with FormProvider/useFormContext
- `frontend/src/pages/permits/PermitListPage.tsx` — skeleton loading, card grid, filter tabs, empty state
- `frontend/src/pages/permits/PermitFormPage.tsx` — multi-step form with auto-save and submit
- `frontend/src/router/index.tsx` — added /permits, /permits/new, /permits/:id/edit routes
- `e2e/permit-list.spec.ts` — 5 Playwright tests (skeleton, empty state, cards, buttons, 375px)
- `e2e/permit-form.spec.ts` — 6 Playwright tests (stepper, validation, step nav, auto-save, submit, 375px)

## Decisions Made

- **PermitFormPage Step 2 uses DocumentUploadZone** (not placeholder): The DocumentUploadZone component from 02-02 was already built and available; integrating it directly is better than a placeholder, enabling applicants to attach documents in the correct workflow position.
- **Button navigation uses Link directly**: The Button component doesn't support an `as` prop for routing, so navigation actions use `<Link>` with button-equivalent Tailwind classes for correct hover/focus states (UX-04).
- **`permitStatus` tracked in PermitFormPage state**: DocumentUploadZone requires the application's current status to determine edit-ability (draft/additional_info_needed). This state is initialized from the loaded permit and updated on create/load.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed broken `PermitStatus` import in document.types.ts**
- **Found during:** Task 1 (TypeScript compile)
- **Issue:** Existing document.types.ts imported `PermitStatus` from permit.types.ts, which was replaced with the full `ApplicationStatus` type
- **Fix:** Updated import to use `ApplicationStatus` and re-exported it for downstream consumers
- **Files modified:** frontend/src/types/document.types.ts
- **Verification:** `npx tsc --noEmit` clean
- **Committed in:** d08e3f1 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed `FileRejection` type error in DocumentUploadZone**
- **Found during:** Task 2 (TypeScript compile)
- **Issue:** `ReturnType<typeof useDropzone>['rejectedFiles']` doesn't exist as a DropzoneState property in newer react-dropzone versions; caused 3 type errors
- **Fix:** Imported `FileRejection` type directly from react-dropzone, used it for the `onDrop` parameter and `.map()` callback
- **Files modified:** frontend/src/components/document/DocumentUploadZone.tsx
- **Verification:** `npx tsc --noEmit` clean
- **Committed in:** 52f83ec (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 type bugs)
**Impact on plan:** Both required for TypeScript compilation. No scope creep.

## Issues Encountered

None — all tasks completed as planned.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Permit list and form pages ready; applicants can create, draft-save, and submit applications
- PermitFormPage Step 2 already integrates DocumentUploadZone (02-04 doc upload feature)
- 02-04 plan (document upload) can build on the PermitFormPage slot or enhance the DocumentUploadZone component
- 02-05 plan (permit detail page) needs the `/permits/:id` route and will use `usePermit` hook and `usePermitsStore`
- Phase 3 (reviewer core) will use `ApplicationStatus` types and `permitsApi` for reviewer workflow

---
*Phase: 02-applicant-core*
*Completed: 2026-07-22*

## Self-Check: PASSED

- All 14 key files exist on disk ✓
- Commits d08e3f1 and 52f83ec found in git log ✓
- TypeScript compiles clean (`npx tsc --noEmit`) ✓
