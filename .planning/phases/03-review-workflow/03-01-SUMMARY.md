---
phase: 03-review-workflow
plan: "01"
subsystem: api
tags: [nestjs, typeorm, postgres, lifecycle, notifications, rbac, integration-tests]

# Dependency graph
requires:
  - phase: 02-applicant-core
    provides: permit_applications table, submit transition, lifecycle/audit services
provides:
  - messages, message_reads, message_attachments PostgreSQL tables + TypeORM entities
  - POST /permits/:id/actions/begin-review (REVIEWER/ADMIN → under_review)
  - POST /permits/:id/actions/request-info (REVIEWER/ADMIN → additional_info_needed)
  - POST /permits/:id/actions/respond-to-info (APPLICANT → under_review)
  - POST /permits/:id/actions/decide (REVIEWER/ADMIN → approved|rejected)
  - NotificationsService.createNotification() called on every lifecycle transition
affects:
  - 03-02-review-queue: needs under_review/additional_info_needed statuses
  - 03-messaging: needs messages table
  - verify-phase: integration tests verifiable against live DB

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Lifecycle action endpoints under /permits/:id/actions/* with HttpCode(OK) for state transitions
    - RBAC via @Roles + @UseGuards(RolesGuard) per-action decorator pattern
    - NotificationsService.createNotification() injected into PermitsService for in-app notifications
    - Integration tests use NestJS Testing module + supertest against live DB with ts-jest esModuleInterop

key-files:
  created:
    - backend/src/database/migrations/003_phase3_messages.sql
    - backend/src/database/migrations/1700000000003-Phase3Messages.ts
    - backend/src/messages/entities/message.entity.ts
    - backend/src/messages/entities/message-read.entity.ts
    - backend/src/messages/entities/message-attachment.entity.ts
    - backend/src/messages/messages.module.ts
    - backend/src/permits/dto/begin-review.dto.ts
    - backend/src/permits/dto/request-info.dto.ts
    - backend/src/permits/dto/respond-to-info.dto.ts
    - backend/src/permits/dto/decide.dto.ts
    - backend/src/permits/tests/lifecycle-actions.e2e-spec.ts
  modified:
    - backend/src/app.module.ts (MessagesModule added)
    - backend/src/notifications/notifications.service.ts (createNotification added)
    - backend/src/permits/permits.service.ts (4 lifecycle action methods added)
    - backend/src/permits/permits.controller.ts (4 action routes + HttpCode(OK))
    - backend/src/permits/permits.module.ts (NotificationsModule imported)
    - backend/jest.config.js (esModuleInterop + transformIgnorePatterns for archiver ESM)

key-decisions:
  - "Action endpoints return HTTP 200 (not 201) — state transitions update existing resource via @HttpCode(HttpStatus.OK)"
  - "beginReview() accepts submitted OR additional_info_needed status — allows re-review after info response"
  - "createNotification() takes optional NotificationType param defaulting to STATUS_CHANGE"
  - "jest.config.js updated with esModuleInterop + transformIgnorePatterns to handle archiver ESM package in CJS jest environment"
  - "Reviewer role set via direct DB UPDATE in integration tests (register endpoint creates APPLICANT only; role promotion is out-of-scope for public API)"

patterns-established:
  - "Action endpoints: @Post(':id/actions/name') + @HttpCode(OK) + @UseGuards(RolesGuard) + @Roles(...)"
  - "Integration tests: bootstrap full AppModule via @nestjs/testing, use live DB, seed via direct DataSource.query()"

# Metrics
duration: 10min
completed: 2026-07-22
---

# Phase 3 Plan 01: Review Workflow Lifecycle Actions Summary

**Four lifecycle action endpoints (begin-review, request-info, respond-to-info, decide) with RBAC guards, audit trail, and in-app notifications — full reviewer workflow implemented with 13 passing integration tests**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-22T22:06:39Z
- **Completed:** 2026-07-22T22:16:00Z
- **Tasks:** 2 completed
- **Files modified:** 16

## Accomplishments

- Phase 3 DB migration (messages, message_reads, message_attachments tables + 6 indexes) with idempotent SQL and TypeORM migration class
- Four lifecycle action endpoints on PermitsController with per-route RBAC guards and HTTP 200 responses
- NotificationsService extended with `createNotification()` called after every state transition
- Full lifecycle flow tested (submitted → under_review → additional_info_needed → under_review → approved) + 409/403/400 error cases — all 13 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Phase 3 DB migration + TypeORM message entities** - `bbc2a03` (feat)
2. **Task 2: Lifecycle action endpoints + notification creation** - `f4ee828` (feat)

## Files Created/Modified

- `backend/src/database/migrations/003_phase3_messages.sql` - Raw SQL reference for messages/message_reads/message_attachments tables
- `backend/src/database/migrations/1700000000003-Phase3Messages.ts` - TypeORM migration class (idempotent IF NOT EXISTS)
- `backend/src/messages/entities/message.entity.ts` - Message TypeORM entity (@Entity('messages'))
- `backend/src/messages/entities/message-read.entity.ts` - MessageRead with composite PK
- `backend/src/messages/entities/message-attachment.entity.ts` - MessageAttachment entity
- `backend/src/messages/messages.module.ts` - MessagesModule registered in AppModule
- `backend/src/notifications/notifications.service.ts` - Added createNotification() method
- `backend/src/permits/dto/begin-review.dto.ts` - Empty DTO (no body required)
- `backend/src/permits/dto/request-info.dto.ts` - infoRequestNote with MinLength(1)/MaxLength(2000)
- `backend/src/permits/dto/respond-to-info.dto.ts` - Optional responseNote
- `backend/src/permits/dto/decide.dto.ts` - @IsIn(['approved','rejected']) outcome + decisionReason
- `backend/src/permits/permits.service.ts` - Added beginReview/requestInfo/respondToInfo/decide methods
- `backend/src/permits/permits.controller.ts` - Added 4 action routes with HttpCode(OK) + RBAC guards
- `backend/src/permits/permits.module.ts` - NotificationsModule imported for DI
- `backend/src/permits/tests/lifecycle-actions.e2e-spec.ts` - 13 integration tests, all passing
- `backend/jest.config.js` - esModuleInterop + transformIgnorePatterns for archiver ESM

## Decisions Made

- Action endpoints return HTTP 200 (not 201) — state transitions update an existing resource, not create a new one. Added `@HttpCode(HttpStatus.OK)` to all four endpoints.
- `beginReview()` allows transition from both `submitted` AND `additional_info_needed` — permits re-entry into review after an info response.
- `createNotification()` has optional `type` param defaulting to `STATUS_CHANGE` — preserves simple 3-arg call signature.
- jest.config.js updated with `esModuleInterop: true` and `transformIgnorePatterns` to handle the `archiver` ESM package that ts-jest couldn't compile in CJS mode. This is a pre-existing setup gap unrelated to this plan.
- Reviewer role set via direct `DataSource.query()` in test setup — the `/auth/register` endpoint only creates `APPLICANT` role users by design (T-02-04 STRIDE mitigation).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] jest.config.js — archiver ESM package incompatible with CJS jest**
- **Found during:** Task 2 (running integration tests)
- **Issue:** `archiver` npm package v7+ is pure ESM but jest runs in CJS mode; ts-jest failed with `SyntaxError: Cannot use import statement outside a module` in the archiver package transitively imported via DocumentsModule
- **Fix:** Updated jest.config.js with `tsconfig: { esModuleInterop: true }` in ts-jest options and added `transformIgnorePatterns` to transform archiver + its ESM transitive dependencies
- **Files modified:** `backend/jest.config.js`
- **Verification:** All 13 integration tests compiled and passed
- **Committed in:** f4ee828

**2. [Rule 1 - Bug] Action endpoints returning HTTP 201 instead of 200**
- **Found during:** Task 2 (integration test verification)
- **Issue:** NestJS defaults `@Post()` methods to HTTP 201 Created; lifecycle action endpoints return updated resources (not new ones), so 200 OK is correct per plan contracts
- **Fix:** Added `@HttpCode(HttpStatus.OK)` to all four action endpoints
- **Files modified:** `backend/src/permits/permits.controller.ts`
- **Verification:** Integration tests pass with `expect(200)` assertions
- **Committed in:** f4ee828

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes required for correct HTTP semantics and test compilation. No scope creep.

## Issues Encountered

None beyond the two auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 4 lifecycle action endpoints operational and tested
- Messages table ready for Phase 3 messaging plans (03-messaging)
- Notifications table populated on every transition — ready for 03-02 reviewer queue (needs `status IN ('under_review', 'additional_info_needed')` query)
- Zero TypeScript compilation errors

## Self-Check: PASSED

All key files verified on disk:
- ✅ backend/src/database/migrations/003_phase3_messages.sql
- ✅ backend/src/database/migrations/1700000000003-Phase3Messages.ts
- ✅ backend/src/messages/entities/message.entity.ts
- ✅ backend/src/messages/entities/message-read.entity.ts
- ✅ backend/src/messages/entities/message-attachment.entity.ts
- ✅ backend/src/permits/tests/lifecycle-actions.e2e-spec.ts
- ✅ backend/src/notifications/notifications.service.ts (createNotification added)

Commits verified:
- ✅ bbc2a03 feat(03-01): Phase 3 DB migration + TypeORM message entities
- ✅ f4ee828 feat(03-01): lifecycle action endpoints + notification creation

---
*Phase: 03-review-workflow*
*Completed: 2026-07-22*
