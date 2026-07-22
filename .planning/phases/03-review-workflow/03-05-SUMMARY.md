---
phase: 03-review-workflow
plan: "05"
subsystem: testing
tags: [playwright, e2e, lifecycle, messaging, notifications, integration]

# Dependency graph
requires:
  - phase: 03-review-workflow
    plan: "03-03"
    provides: "MessagePanel, MessageBubble, MessageComposer, NotificationPanel with data-testid selectors"
  - phase: 03-review-workflow
    plan: "03-04"
    provides: "ReviewQueuePage, ReviewDetailPage, ReviewerActionPanel, RequestInfoModal, DecisionModal"
  - phase: 03-review-workflow
    plan: "03-01"
    provides: "Backend lifecycle action endpoints (begin-review, request-info, respond-to-info, decide)"
  - phase: 03-review-workflow
    plan: "03-02"
    provides: "Backend messaging + notification API endpoints"
provides:
  - Complete Phase 3 Playwright E2E integration test suite (22 tests across 3 spec files)
  - e2e/helpers/auth.helper.ts shared login utilities reusable across future phases
  - Full lifecycle coverage: submitted → under_review → additional_info_needed → under_review → approved + reject path
  - Cross-user messaging coverage: send, receive, unread counts, mark-read, Shift+Enter, draft blocking, attach visibility
  - Notification coverage: badge counts, panel display, click navigation, mark-all-read
affects:
  - "verify phase: all 22 Phase 3 tests run in verify harness"
  - "phase-04+: auth.helper.ts reusable by future E2E specs"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "page.route() mocking for deterministic E2E tests without full docker compose stack"
    - "Shared auth helpers in e2e/helpers/ for DRY login setup across specs"
    - "Describe block per flow for clear test organization and isolation"
    - "Fixture objects for each permit state (submitted, under_review, additional_info_needed, approved, rejected)"

key-files:
  created:
    - e2e/phase3-full-lifecycle.spec.ts
    - e2e/phase3-messaging-integration.spec.ts
    - e2e/phase3-notifications.spec.ts
    - e2e/helpers/auth.helper.ts
  modified:
    - frontend/src/components/messaging/MessageComposer.tsx
    - frontend/src/components/notifications/NotificationPanel.tsx

key-decisions:
  - "Used page.route() mocking (same pattern as 03-04 reviewer-workflow spec) for deterministic tests without requiring live docker compose stack"
  - "Split messaging Test 7 into 7 and 7b for cleaner applicant vs reviewer assertions in separate test contexts"
  - "auth.helper.ts placed in e2e/helpers/ to follow project convention and enable reuse by future test specs"
  - "Notification click navigates to /permits/:id (not /applications/:id) — fixed bug in NotificationPanel.tsx"

patterns-established:
  - "Phase 3 E2E pattern: fixture objects per permit state + page.route() per endpoint + loginAs() helper"
  - "Spec file naming: phase{N}-{feature}.spec.ts for cross-cutting integration tests"

# Metrics
duration: 6min
completed: 2026-07-22
---

# Phase 3 Plan 05: E2E Integration Tests Summary

**Playwright E2E integration tests covering the full Phase 3 acceptance criteria: complete reviewer lifecycle (approve + reject paths), cross-user messaging (send/receive/unread/mark-read/Shift+Enter/draft/attach roles), and notification system (badge counts, click navigation, mark-all-read)**

## Performance

- **Duration:** 6 min
- **Started:** 2026-07-22T22:42:14Z
- **Completed:** 2026-07-22T22:48:26Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created 3 E2E spec files with 22 tests total covering all Phase 3 acceptance criteria
- Built shared `e2e/helpers/auth.helper.ts` with `loginAs()` and `createMockPermit()` utilities
- Fixed two bugs discovered during test writing (NotificationPanel URL, MessageComposer attach-btn testid)

## Task Commits

Each task was committed atomically:

1. **Task 1: Full lifecycle E2E tests** - `455daca` (feat)
2. **Task 2: Messaging + notifications E2E tests + helpers** - `b56404a` (feat)

## Files Created/Modified
- `e2e/phase3-full-lifecycle.spec.ts` — 8 tests: approve path (Tests 1-6) + reject path (Tests 7-8)
- `e2e/phase3-messaging-integration.spec.ts` — 8 tests: send, receive, unread count, mark-read, Shift+Enter newline, draft blocking, attach button visibility (split into 7+7b)
- `e2e/phase3-notifications.spec.ts` — 6 tests: begin-review notification, badge count, click-navigate, mark-all-read, reviewer notification on response, new message notification
- `e2e/helpers/auth.helper.ts` — Shared `loginAs()`, `setupCommonRoutes()`, `createMockPermit()` utilities
- `frontend/src/components/messaging/MessageComposer.tsx` — Added `data-testid="attach-btn"` to paperclip button
- `frontend/src/components/notifications/NotificationPanel.tsx` — Fixed navigation URL from `/applications/:id` to `/permits/:id`

## Decisions Made
- Used `page.route()` mocking (same pattern as existing 03-04 reviewer-workflow spec) rather than requiring a live docker compose stack — consistent with project's established test approach and allows tests to run deterministically
- `auth.helper.ts` placed in `e2e/helpers/` directory for discoverability and future reuse
- Tests written for verify phase execution — per test execution boundary, E2E tests are not run during execute phase

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed NotificationPanel applicant navigation URL**
- **Found during:** Task 2 (writing notification click-to-navigate test)
- **Issue:** `NotificationPanel.tsx` navigated applicants to `/applications/${applicationId}` — this route doesn't exist in the React Router; router uses `/permits/:id`
- **Fix:** Changed navigation path to `/permits/${applicationId}` for non-reviewer users
- **Files modified:** `frontend/src/components/notifications/NotificationPanel.tsx`
- **Verification:** TypeScript compiles clean; test assertion targets `/permits/:id`
- **Committed in:** `b56404a` (Task 2 commit)

**2. [Rule 2 - Missing Critical] Added `data-testid="attach-btn"` to MessageComposer**
- **Found during:** Task 2 (writing messaging attach button test — Test 7)
- **Issue:** The plan specifies `data-testid="attach-btn"` for E2E targeting, but the button only had `aria-label="Attach file"` — missing the testid required by the spec
- **Fix:** Added `data-testid="attach-btn"` to the reviewer-only paperclip button
- **Files modified:** `frontend/src/components/messaging/MessageComposer.tsx`
- **Verification:** TypeScript compiles; `grep -n "attach-btn" MessageComposer.tsx` confirms attribute present
- **Committed in:** `b56404a` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug fix, 1 missing critical testid)
**Impact on plan:** Both auto-fixes necessary for test correctness and navigation functionality. No scope creep.

## Issues Encountered
- Tests written for the verify phase; E2E execution deferred to verify phase per test execution boundary (no browser, no server during execute phase)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 complete — all 5 plans have summaries
- Phase 3 E2E tests (22 total across 3 new specs + pre-existing messaging.spec.ts + reviewer-workflow.spec.ts) ready for verify phase
- Phase 4 can proceed: all Phase 3 backend APIs, frontend components, and integration tests are in place

## Self-Check: PASSED

- ✅ `e2e/phase3-full-lifecycle.spec.ts` exists (8 tests)
- ✅ `e2e/phase3-messaging-integration.spec.ts` exists (8 tests)
- ✅ `e2e/phase3-notifications.spec.ts` exists (6 tests)
- ✅ `e2e/helpers/auth.helper.ts` exists
- ✅ Commit `455daca` confirmed in git log
- ✅ Commit `b56404a` confirmed in git log
- ✅ `frontend/src/components/messaging/MessageComposer.tsx` has `data-testid="attach-btn"`
- ✅ `frontend/src/components/notifications/NotificationPanel.tsx` navigates to `/permits/:id`
- ✅ `npx tsc --noEmit` exits 0

---
*Phase: 03-review-workflow*
*Completed: 2026-07-22*
