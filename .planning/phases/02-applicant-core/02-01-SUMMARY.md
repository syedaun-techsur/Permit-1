---
phase: 02-applicant-core
plan: "01"
subsystem: api
tags: [nestjs, typeorm, postgres, permits, lifecycle, audit, notifications, jwt, rbac]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: users table, JwtAuthGuard, RolesGuard, TypeORM DatabaseModule, ThrottlerModule

provides:
  - Migration SQL for 5 new Phase 2 tables (permit_applications, lifecycle_stages, documents, notifications, audit_log) with enums, indexes, sequence
  - PermitApplication TypeORM entity with ApplicationStatus + PermitType enums
  - LifecycleStage, Document, Notification, AuditLog TypeORM entities
  - PermitsModule with 6 REST endpoints (POST/GET/PATCH /permits, submit, lifecycle)
  - LifecycleModule for immutable stage history
  - AuditModule for non-blocking audit trail
  - NotificationsModule with GET /notifications/unread-count

affects:
  - 02-applicant-core (all subsequent plans depend on this data layer)
  - 03-reviewer-core (uses PermitApplication entity and status transitions)
  - 04-admin-core (uses audit_log, notifications tables)

# Tech tracking
tech-stack:
  added: [class-validator, class-transformer, @nestjs/mapped-types (PartialType)]
  patterns:
    - Cursor-based pagination using base64-encoded updated_at timestamp
    - Audit logging wrapped in try/catch to avoid blocking main flow
    - Ownership enforcement via applicant_id comparison (never from request body)
    - permit_reference_seq PostgreSQL sequence for PA-000001 style reference numbers
    - TypeORM forFeature with multiple modules sharing Document entity

key-files:
  created:
    - backend/src/database/migrations/002_phase2_permits.sql
    - backend/src/permits/entities/permit-application.entity.ts
    - backend/src/permits/entities/lifecycle-stage.entity.ts
    - backend/src/documents/entities/document.entity.ts
    - backend/src/notifications/entities/notification.entity.ts
    - backend/src/audit/entities/audit-log.entity.ts
    - backend/src/permits/dto/create-permit.dto.ts
    - backend/src/permits/dto/update-permit.dto.ts
    - backend/src/permits/permits.controller.ts
    - backend/src/permits/permits.service.ts
    - backend/src/permits/permits.module.ts
    - backend/src/lifecycle/lifecycle.service.ts
    - backend/src/lifecycle/lifecycle.module.ts
    - backend/src/audit/audit.service.ts
    - backend/src/audit/audit.module.ts
    - backend/src/notifications/notifications.controller.ts
    - backend/src/notifications/notifications.service.ts
    - backend/src/notifications/notifications.module.ts
  modified:
    - backend/src/app.module.ts

key-decisions:
  - "Cursor-based pagination using base64(updated_at ISO) for applicant permit list — efficient, stable ordering"
  - "AuditService.createEntry() wrapped in try/catch — audit failures never block main application flow"
  - "applicant_id always set from req.user.id in service, never from request body — prevents T-02-04 threat"
  - "UpdatePermitDto uses PartialType(CreatePermitDto) — excludes status field to prevent T-02-02 tampering"
  - "permit_reference_seq used for reference number generation — atomic, gap-resistant PA-000001 format"

patterns-established:
  - "Ownership guard: findOne by id then compare applicantId !== userId → throw ForbiddenException"
  - "Status transition guard: if app.status !== 'draft' → throw ConflictException('INVALID_STATUS_TRANSITION')"
  - "Document requirement check before status transition: count WHERE status='uploaded'"

# Metrics
duration: 5min
completed: 2026-07-22
---

# Phase 2 Plan 01: Applicant Core Backend Summary

**PostgreSQL DDL for 5 permit tables + TypeORM entities + full NestJS permits API with lifecycle/audit/notifications modules, enforcing applicant ownership (403), draft-only mutations (409), and document-required submission (422)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-07-22T19:18:10Z
- **Completed:** 2026-07-22T19:23:31Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments

- Migration SQL `002_phase2_permits.sql` with 5 tables, 4 enums, permit_reference_seq, and all indexes per TechArch DDL
- 5 TypeORM entities matching exact DDL column names, types, and constraints
- PermitsController with 6 endpoints: POST/GET/PATCH /permits, POST /:id/submit (throttled), GET /:id, GET /:id/lifecycle
- PermitsService implementing all security invariants: ownership 403, status 409, document-required 422
- LifecycleService recording immutable stage history on every transition
- AuditService logging create and submit events (non-blocking try/catch)
- NotificationsController exposing GET /notifications/unread-count

## Task Commits

Each task was committed atomically:

1. **Task 1: Phase 2 DB migration + TypeORM entities** - `57d2a6e` (feat)
2. **Task 2: Permits API module** - `14455ec` (feat)

**Plan metadata:** (to be committed with SUMMARY)

## Files Created/Modified

- `backend/src/database/migrations/002_phase2_permits.sql` — All Phase 2 DDL: 4 enums, 5 tables, indexes, sequence
- `backend/src/permits/entities/permit-application.entity.ts` — PermitApplication entity + ApplicationStatus/PermitType enums
- `backend/src/permits/entities/lifecycle-stage.entity.ts` — LifecycleStage entity
- `backend/src/documents/entities/document.entity.ts` — Document entity + DocumentStatus enum
- `backend/src/notifications/entities/notification.entity.ts` — Notification entity + NotificationType enum
- `backend/src/audit/entities/audit-log.entity.ts` — AuditLog entity
- `backend/src/permits/dto/create-permit.dto.ts` — CreatePermitDto + SiteAddressDto with class-validator
- `backend/src/permits/dto/update-permit.dto.ts` — UpdatePermitDto as PartialType(CreatePermitDto)
- `backend/src/permits/permits.controller.ts` — 6 REST endpoints with JwtAuthGuard
- `backend/src/permits/permits.service.ts` — Full business logic: create, update, submit, list, getById, getLifecycle
- `backend/src/permits/permits.module.ts` — PermitsModule wiring
- `backend/src/lifecycle/lifecycle.service.ts` — createStage(), getStages()
- `backend/src/lifecycle/lifecycle.module.ts` — LifecycleModule
- `backend/src/audit/audit.service.ts` — createEntry() (try/catch wrapped)
- `backend/src/audit/audit.module.ts` — AuditModule
- `backend/src/notifications/notifications.controller.ts` — GET /notifications/unread-count
- `backend/src/notifications/notifications.service.ts` — getUnreadCount()
- `backend/src/notifications/notifications.module.ts` — NotificationsModule
- `backend/src/app.module.ts` — Added PermitsModule, LifecycleModule, AuditModule, NotificationsModule imports

## Decisions Made

- **Cursor pagination**: base64(updated_at ISO string) — efficient, no OFFSET performance degradation
- **Audit non-blocking**: try/catch around all audit inserts — audit failures never block application workflow
- **applicant_id from JWT only**: Service always sets `applicantId = req.user.id`, never from DTO — T-02-04 mitigated
- **PartialType for UpdatePermitDto**: excludes `status` field — T-02-02 tampering mitigated
- **permit_reference_seq**: PostgreSQL sequence via `SELECT nextval()` — atomically correct, avoids race conditions

## Deviations from Plan

None - plan executed exactly as written.

Note: The `app.module.ts` was updated to include both the pre-existing `DocumentsModule` (added by concurrent 02-02 plan agent) and the new Phase 2 modules. This was handled by reading the current HEAD state of app.module.ts before applying edits.

## Issues Encountered

None — TypeScript compiled clean on first attempt after npm install.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 data layer is complete: all 5 tables with correct schemas
- PermitsModule is live: permits can be created, updated, submitted, listed, and detailed
- LifecycleModule ready to record stage history for any phase using it
- AuditModule ready for any module that needs audit trail
- NotificationsModule ready: unread count endpoint live, notification rows writable by other modules
- Phase 2 Plans 02+ can now upload documents (applications have IDs), display lifecycle timelines, and show permit lists

## Self-Check: PASSED

All key files verified present on disk. Task commits `57d2a6e` and `14455ec` confirmed in git log. All 7 success criteria verified:
1. ✅ 5 tables in migration SQL
2. ✅ 5 TypeORM entities exist and compile
3. ✅ 6 endpoints in PermitsController
4. ✅ ForbiddenException/ConflictException/UnprocessableEntityException in PermitsService
5. ✅ GET /notifications/unread-count endpoint present
6. ✅ 4 lifecycle+audit calls in permits service (create + submit each)
7. ✅ 0 TypeScript errors

---
*Phase: 02-applicant-core*
*Completed: 2026-07-22*
