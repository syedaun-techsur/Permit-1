---
phase: 05-admin-and-compliance
plan: "01"
subsystem: api
tags: [nestjs, typeorm, admin, audit-log, csv, rbac, pagination]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: NestJS app scaffold, JWT auth guards, User entity, RefreshToken entity
  - phase: 02-applicant-core
    provides: PermitApplication entity, AuditLog entity, permits module
  - phase: 03-review-workflow
    provides: lifecycle actions, AuditService
  - phase: 04-dashboards
    provides: DashboardModule

provides:
  - GET /admin/permits — all-permits view with filters, pagination, reviewer name
  - GET /admin/users — user list filterable by role, status, search
  - POST /admin/users — user creation with audit log entry (USER_CREATED)
  - GET /admin/users/:userId — single user detail
  - PATCH /admin/users/:userId — deactivate/reactivate/role change with audit + token revocation
  - GET /admin/audit-log — cursor-paginated audit log with filters
  - GET /admin/audit-log/export — CSV streaming export with formula injection protection
  - REVIEWER_ASSIGNED audit log entry in permits.service.beginReview

affects:
  - 05-02 (admin frontend pages consume these endpoints)
  - 05-03 (WCAG audit depends on admin pages)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TypeORM QueryBuilder with explicit column selects (no SELECT *)
    - DB transaction (QueryRunner) for atomic user mutation + audit log
    - Cursor pagination using base64-encoded JSON (occurredAt + id)
    - CSV streaming via res.write() in batches of 500 (memory bounded)
    - sortBy whitelist prevents SQL injection in ORDER BY
    - Formula injection protection in CSV: tab-prefix + double-quote escaping

key-files:
  created:
    - backend/src/admin/admin.module.ts
    - backend/src/admin/admin.controller.ts
    - backend/src/admin/admin.service.ts
    - backend/src/admin/dto/admin-permits-query.dto.ts
    - backend/src/admin/dto/audit-log-query.dto.ts
    - backend/src/admin/dto/create-user.dto.ts
    - backend/src/admin/dto/update-user.dto.ts
    - backend/src/admin/dto/get-users-query.dto.ts
    - backend/test/admin/admin.integration.spec.ts
  modified:
    - backend/src/app.module.ts (added AdminModule)
    - backend/src/permits/permits.service.ts (REVIEWER_ASSIGNED audit entry)
    - backend/jest.config.js (added test/ root, integration.spec.ts pattern)

key-decisions:
  - "AdminService uses TypeORM QueryRunner transactions for createUser and updateUser — audit entries committed atomically with the mutation (T-05-05)"
  - "Explicit column selects in QueryBuilder prevent password_hash leakage (T-05-03)"
  - "sortBy whitelist (5 allowed columns) + PERMIT_SORT_MAP prevents SQL injection in ORDER BY (T-05-02)"
  - "CSV export uses quote-wrapping + tab-prefix on formula characters for formula injection protection (T-05-04)"
  - "SELF_DEACTIVATION check (userId === actorId) happens before any DB write (T-05-07)"
  - "jest.config.js roots updated to include test/ alongside src/ for integration test discovery"
  - "REVIEWER_ASSIGNED audit log written in beginReview() when reviewer first assigned (previously only REVIEW_STARTED was written)"

patterns-established:
  - "Admin endpoints: class-level @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) — applied once, covers all routes"
  - "Cursor pagination: base64(JSON{occurredAt, id}) — consistent with applicant cursor pattern from Phase 2"
  - "Streaming CSV: res.write() header + batch loop + res.end() — memory-bounded for large exports"

# Metrics
duration: 6min
completed: 2026-07-23
---

# Phase 5 Plan 01: Admin Backend Endpoints Summary

**NestJS admin module with 7 REST endpoints — all-permits view, full user CRUD with audit log, cursor-paginated audit log, and CSV streaming export — all guarded by JWT + admin RBAC**

## Performance

- **Duration:** 6 min
- **Started:** 2026-07-23T01:15:07Z
- **Completed:** 2026-07-23T01:21:00Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Complete AdminModule (controller, service, module, 5 DTOs) implementing PERM-07 + ADMN-01/02/03
- All 7 admin routes protected by class-level JwtAuthGuard + RolesGuard(admin)
- Security threat mitigations: sortBy whitelist (T-05-02), explicit selects (T-05-03), CSV formula injection (T-05-04), atomic transactions (T-05-05), SELF_DEACTIVATION guard (T-05-07)
- 26+ integration test cases covering happy paths, filters, 403 enforcement, conflict errors, and CSV streaming

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin DTOs + admin.service.ts methods** - `a0991bb` (feat)
2. **Task 2: Admin controller + supertest integration tests** - `30728fe` (feat)

## Files Created/Modified

- `backend/src/admin/admin.module.ts` — NestJS module with TypeOrmModule.forFeature([User, PermitApplication, AuditLog, RefreshToken])
- `backend/src/admin/admin.controller.ts` — 7 routes, class-level admin guard
- `backend/src/admin/admin.service.ts` — getAllPermits, getUsers, getUserById, createUser, updateUser, getAuditLog, exportAuditLogCsv
- `backend/src/admin/dto/admin-permits-query.dto.ts` — filters, pagination, sortBy/sortOrder
- `backend/src/admin/dto/audit-log-query.dto.ts` — cursor pagination, action/actor/application filters
- `backend/src/admin/dto/create-user.dto.ts` — fullName, email, role, temporaryPassword
- `backend/src/admin/dto/update-user.dto.ts` — isActive, role
- `backend/src/admin/dto/get-users-query.dto.ts` — role, isActive, search, pagination
- `backend/test/admin/admin.integration.spec.ts` — 26+ supertest integration test cases
- `backend/src/app.module.ts` — AdminModule registered
- `backend/src/permits/permits.service.ts` — REVIEWER_ASSIGNED audit entry added to beginReview
- `backend/jest.config.js` — roots expanded to include test/ directory

## Decisions Made

- Used TypeORM QueryRunner transactions for atomic user mutations + audit entries (T-05-05)
- Explicit column selects throughout (no SELECT *) prevent password_hash disclosure (T-05-03)
- sortBy validated against ALLOWED_PERMIT_SORT_COLUMNS whitelist + PERMIT_SORT_MAP prevents SQL injection (T-05-02)
- CSV cells wrapped in double-quotes with `"` → `""` escaping; cells starting with `=+−@` prefixed with tab (T-05-04)
- SELF_DEACTIVATION check happens before any DB write, throws ConflictException (T-05-07)
- Added REVIEWER_ASSIGNED audit log entry to permits.service.beginReview() — previously only REVIEW_STARTED was written

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added GetUsersQueryDto not mentioned in plan**
- **Found during:** Task 1 (DTO creation)
- **Issue:** Plan specified CreateUserDto, UpdateUserDto, AdminPermitsQueryDto, AuditLogQueryDto, but the `GET /admin/users` query params needed their own DTO for validation
- **Fix:** Created GetUsersQueryDto with role, isActive, search, page, limit fields
- **Files modified:** backend/src/admin/dto/get-users-query.dto.ts
- **Verification:** TypeScript compiles cleanly; test cases validate filters
- **Committed in:** a0991bb (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added REVIEWER_ASSIGNED audit log to beginReview**
- **Found during:** Task 2 (plan explicitly says "verify/ensure PATCH /permits/:id/assign-reviewer writes REVIEWER_ASSIGNED audit_log entry if not already done")
- **Issue:** beginReview() only wrote REVIEW_STARTED, not REVIEWER_ASSIGNED
- **Fix:** Added conditional REVIEWER_ASSIGNED audit entry when `!previousReviewerId` in beginReview()
- **Files modified:** backend/src/permits/permits.service.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 30728fe (Task 2 commit)

**3. [Rule 3 - Blocking] Updated jest.config.js to discover test/ directory**
- **Found during:** Task 2 (test file creation)
- **Issue:** jest.config.js used `rootDir: 'src'` so test files outside src/ were not discovered
- **Fix:** Changed to `roots: ['<rootDir>/src', '<rootDir>/test']` and added `integration.spec.ts` pattern; also added 60s testTimeout for integration tests
- **Files modified:** backend/jest.config.js
- **Verification:** `jest --listTests` shows admin.integration.spec.ts
- **Committed in:** 30728fe (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 missing critical, 1 blocking)
**Impact on plan:** All auto-fixes necessary for correctness and test discovery. No scope creep.

## Issues Encountered

None — plan executed cleanly with three minor gaps filled automatically.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 7 admin endpoints ready for frontend consumption in 05-02
- All ADMN-01/02/03 + PERM-07 contracts satisfied
- Integration test suite written; execution deferred to verify phase (requires live DB)
- No blockers for 05-02 (admin frontend pages)

---
*Phase: 05-admin-and-compliance*
*Completed: 2026-07-23*

## Self-Check: PASSED

All key files verified on disk. Both task commits verified in git log:
- a0991bb: Task 1 (DTOs + service + module + controller scaffold)
- 30728fe: Task 2 (controller routes + integration tests + permit REVIEWER_ASSIGNED audit)
