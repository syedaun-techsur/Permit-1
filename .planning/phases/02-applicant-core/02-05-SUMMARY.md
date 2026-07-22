---
phase: 02-applicant-core
plan: "05"
subsystem: ui
tags: [react, typescript, tailwind, playwright, date-fns, lucide-react]

# Dependency graph
requires:
  - phase: 02-03
    provides: usePermit hook (15s polling), PermitApplication + LifecycleStage types
  - phase: 02-04
    provides: DocumentList component (applicationId + applicationStatus props)
provides:
  - PermitStatusTimeline component — 7-stage vertical stepper with branching terminal states
  - PermitDetailPage — full detail view assembling all panels with 15s polling
  - Route /permits/:id registered and protected
  - E2E Playwright tests for permit detail (10 tests)
affects:
  - 03-reviewer-core (reviewer reads permit detail to take action)
  - DASH-01 applicant dashboard (links to /permits/:id)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Skeleton panel pattern: isLoading && !permit → skeleton UI, no full-page spinner"
    - "Polling pattern: usePermit hook polls every 15s — status changes auto-reflected in UI"
    - "Branching terminal state: approved/rejected rendered as ├─/└─ branching nodes"
    - "XSS safety: info_request_note rendered via React text nodes, never dangerouslySetInnerHTML"

key-files:
  created:
    - frontend/src/components/permit/PermitStatusTimeline.tsx
    - frontend/src/pages/permits/PermitDetailPage.tsx
    - e2e/permit-detail.spec.ts
  modified:
    - frontend/src/router/index.tsx

key-decisions:
  - "PermitStatusTimeline uses data-testid + data-state attributes for Playwright test targeting of stage states"
  - "getStageState() derives stage indicators from stages[] history array — approved/rejected get muted-terminal when the other terminal is currentStatus"
  - "PermitDetailPage renders without AppShell wrapper — page-level layout handled by existing shell in parent routing"
  - "Edit button uses anchor tag (href) not Link — allows direct navigation matching test assertion on href attribute"

patterns-established:
  - "Stage state derivation: completed (in stages[]), current (matches currentStatus), muted-terminal (unreached terminal), future (default)"
  - "Skeleton: per-panel skeleton components (HeaderSkeleton, TimelineSkeleton, FormPanelSkeleton, DocumentPanelSkeleton) — no full-page spinner"

# Metrics
duration: 4min
completed: 2026-07-22
---

# Phase 02 Plan 05: Permit Detail Page + Lifecycle Timeline Summary

**7-stage PermitStatusTimeline stepper with branching approved/rejected terminal nodes, PermitDetailPage assembling all panels with 15s polling and skeleton loading, protected route at /permits/:id**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-22T19:41:19Z
- **Completed:** 2026-07-22T19:46:10Z
- **Tasks:** 2 completed
- **Files modified:** 4

## Accomplishments

- PermitStatusTimeline: renders all 6 ApplicationStatus stages in fixed order with completed/current/future/muted-terminal indicators
- PermitDetailPage: assembles header (ref# + badge + submitted date), Form Data (read-only, Edit for draft), Document panel, Messaging stub, Timeline panel
- Skeleton panels shown while initial data loads (header + timeline + form + document skeletons — no full-page spinner)
- 15-second polling active via usePermit hook; status changes auto-reflected without manual refresh
- Route /permits/:id registered (protected, lazy-loaded) in AppRouter
- 10 Playwright E2E tests covering all required scenarios

## Task Commits

Each task was committed atomically:

1. **Task 1: PermitStatusTimeline — 7-stage stepper** - `5252c3f` (feat)
2. **Task 2: PermitDetailPage + route + skeleton + E2E** - `38b4621` (feat)

_Note: E2E tests written as artifact; execution deferred to verify phase._

## Files Created/Modified

- `frontend/src/components/permit/PermitStatusTimeline.tsx` — 7-stage vertical stepper with branching terminal states; filled/ring/muted indicators; relative timestamps with hover tooltip; orange info request note box
- `frontend/src/pages/permits/PermitDetailPage.tsx` — Full detail page assembling all panels with skeleton loading and 15s polling via usePermit hook
- `frontend/src/router/index.tsx` — Added /permits/:id route (protected, lazy-loaded PermitDetailPage)
- `e2e/permit-detail.spec.ts` — 10 Playwright tests: skeleton, timeline stages, In Progress pill, approved/rejected state, info request note, DocumentList, messaging stub, 375px no-scroll, Edit button

## Decisions Made

- `getStageState()` derives indicator type from stages[] history array — stages in the history are "completed", currentStatus (when not in history) is "current", and the unreached terminal gets "muted-terminal" when the other terminal is reached
- `data-testid` + `data-state` attributes added to stage nodes for reliable Playwright targeting
- PermitDetailPage omits AppShell wrapper — existing routing provides layout shell
- Edit button uses `<a href>` not React Router `<Link>` to support `toHaveAttribute('href', ...)` Playwright assertion pattern

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Permit detail page complete — applicants can track their application lifecycle in real time
- PermitStatusTimeline ready for reuse in Phase 3 reviewer core (admin detail view)
- /permits/:id route live and accessible from PermitCard "View" buttons built in 02-03
- E2E tests deferred to verify phase; all written and ready to run

## Self-Check: PASSED

- ✅ `frontend/src/components/permit/PermitStatusTimeline.tsx` — exists
- ✅ `frontend/src/pages/permits/PermitDetailPage.tsx` — exists
- ✅ `e2e/permit-detail.spec.ts` — exists
- ✅ Commit `5252c3f` — verified in git log
- ✅ Commit `38b4621` — verified in git log

---
*Phase: 02-applicant-core*
*Completed: 2026-07-22*
