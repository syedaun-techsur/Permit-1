---
phase: 03-review-workflow
plan: "02"
subsystem: api
tags: [nestjs, messaging, notifications, documents, archiver, s3, minio, typeorm, cursor-pagination]

# Dependency graph
requires:
  - phase: 03-review-workflow
    provides: "03-01: Phase 3 DB migration (messages/message_reads/message_attachments tables), TypeORM entities, lifecycle action endpoints"
  - phase: 02-applicant-core
    provides: "DocumentsModule with S3Service, NotificationsModule, PermitsModule"
provides:
  - "MessagesController: POST/GET /permits/:id/messages, GET unread-count, POST read, POST attachment upload-url, POST attachment register"
  - "MessagesService: sendMessage, listMessages, markRead, getUnreadCount, getAttachmentUploadUrl, registerAttachment"
  - "NotificationsController: GET /notifications, PATCH /notifications/read-all, PATCH /notifications/:id/read"
  - "NotificationsService: listNotifications(), markOneRead(), markAllRead(), createNotification()"
  - "DocumentsController: GET /permits/:id/documents/archive (reviewer/admin)"
  - "DocumentsService.getArchiveUrl(): generates ZIP via archiver, uploads to MinIO, returns presigned URL"
  - "S3Service: uploadBuffer(), getObjectBuffer() for archive generation"
  - "Integration test files: messages.e2e-spec.ts, notifications.e2e-spec.ts"
affects: [03-03, 03-04, frontend-MessagePanel, frontend-NotificationsPanel, frontend-ReviewerQueue]

# Tech tracking
tech-stack:
  added: [archiver, supertest, @types/archiver, @types/jest, @types/supertest]
  patterns:
    - "Cursor-based pagination using base64(id) for both messages and notifications"
    - "Route ordering guard: static routes (unread-count, read-all, archive) declared before dynamic (:msgId, :notifId, :docId) to prevent param conflicts"
    - "IDOR protection: markOneRead() queries WHERE id AND user_id together, returns 404 on mismatch (prevents enumeration)"
    - "ZipArchive via archiverModule.ZipArchive class (not function call) — archiver npm exports classes not factory function"
    - "createNotification() accepts optional type param (defaults to STATUS_CHANGE); NEW_MESSAGE used for messaging notifications"

key-files:
  created:
    - backend/src/messages/messages.module.ts (full implementation replacing 03-01 placeholder)
    - backend/src/messages/messages.controller.ts
    - backend/src/messages/messages.service.ts
    - backend/src/messages/dto/send-message.dto.ts
    - backend/src/messages/dto/upload-url-request.dto.ts
    - backend/src/messages/dto/register-attachment.dto.ts
    - backend/src/messages/tests/messages.e2e-spec.ts
    - backend/src/notifications/tests/notifications.e2e-spec.ts
    - backend/jest.config.js
  modified:
    - backend/src/notifications/notifications.service.ts (added createNotification, listNotifications, markOneRead, markAllRead)
    - backend/src/notifications/notifications.controller.ts (added GET /notifications, PATCH read-all, PATCH /:id/read)
    - backend/src/documents/documents.controller.ts (added GET archive route before /:docId/url)
    - backend/src/documents/documents.service.ts (added getArchiveUrl() with archiver ZIP generation)
    - backend/src/documents/documents.module.ts (export S3Service for MessagesModule)
    - backend/src/documents/s3.service.ts (added uploadBuffer(), getObjectBuffer())
    - backend/src/app.module.ts (registered MessagesModule)
    - backend/tsconfig.json (added types: [jest, node])
    - backend/package.json (added archiver, supertest, @types/* devDeps)

key-decisions:
  - "archiver npm exports ZipArchive class (not factory function); use new archiverModule.ZipArchive() not archiver('zip')"
  - "S3Service exported from DocumentsModule (previously only DocumentsService was exported) — needed by MessagesModule"
  - "User entity has fullName not firstName+lastName; senderName uses fullName directly"
  - "createNotification() defaults to NotificationType.STATUS_CHANGE; caller passes NEW_MESSAGE for messaging"
  - "Included uncommitted 03-01 Task 2 work (lifecycle DTOs/service/controller methods) into this plan's commit since they were in working tree and required for messaging tests"

patterns-established:
  - "Route ordering: static routes before parameterized routes within same controller prefix"
  - "IDOR prevention: ownership check embedded in WHERE clause of DB query, not post-fetch comparison"
  - "Archive generation: in-memory buffer approach using archiver.finalize(), upload via S3Service.uploadBuffer()"
  - "Non-blocking notifications: createNotification wrapped in try/catch so messaging workflow is not aborted by notification failures"

# Metrics
duration: 8min
completed: 2026-07-22
---

# Phase 3 Plan 02: Messages API + Notifications List/Read + Document Archive Summary

**Full MessagesModule (send/list/read/attachment upload), NotificationsController with cursor-paginated list + mark-read, and ZIP document archive endpoint via MinIO archiver integration**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-22T22:13:43Z
- **Completed:** 2026-07-22T22:21:45Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments

- Full messaging API: send, list (cursor-paginated), mark-read, unread-count, attachment upload URL + register
- Role-based access: applicant/reviewer can message; only reviewer/admin can upload attachments; draft applications return 403
- Notifications API complete: cursor-paginated list, mark-one-read (IDOR-protected), mark-all-read
- Document archive: reviewer/admin GET downloads all documents as a ZIP via MinIO presigned URL (15-min expiry)
- Integration test files for messaging (6 tests) and notifications (4 tests) written and ready for verify phase
- Added jest config + @types/jest to enable TypeScript test compilation

## Task Commits

Each task was committed atomically:

1. **Task 1: Messages NestJS module** - `064b9fa` (feat)
2. **Task 2: Notifications list/read + document archive** - `98855a6` (feat)

**Plan metadata:** (created below with state update)

## Files Created/Modified

- `backend/src/messages/messages.module.ts` - Full MessagesModule replacing 03-01 placeholder
- `backend/src/messages/messages.controller.ts` - 6 routes with correct ordering (unread-count before :msgId)
- `backend/src/messages/messages.service.ts` - All 6 service methods with RBAC + validation
- `backend/src/messages/dto/*.ts` - 3 DTO files for send, upload-url, register-attachment
- `backend/src/messages/tests/messages.e2e-spec.ts` - 6 integration tests
- `backend/src/notifications/notifications.service.ts` - Extended with createNotification, list, markOneRead, markAllRead
- `backend/src/notifications/notifications.controller.ts` - Full controller with read-all before :notifId/read
- `backend/src/notifications/tests/notifications.e2e-spec.ts` - 4 integration tests
- `backend/src/documents/documents.controller.ts` - Archive route before :docId/url
- `backend/src/documents/documents.service.ts` - getArchiveUrl() with archiver ZIP generation
- `backend/src/documents/s3.service.ts` - uploadBuffer() + getObjectBuffer()

## Decisions Made

- Used `archiverModule.ZipArchive` class instantiation (not factory call) — archiver npm exports classes, not a factory function; `archiver('zip')` pattern from docs doesn't work with this package's TS exports
- Exported `S3Service` from `DocumentsModule` since `MessagesModule` needs it for presigned attachment URLs
- `User.fullName` used as `senderName` (entity has single field, not first/last name split)
- `createNotification()` has optional `type` parameter defaulting to `STATUS_CHANGE` — messaging calls pass `NEW_MESSAGE` type
- Uncommitted 03-01 Task 2 work (lifecycle DTOs, permits service methods, permits controller routes) was in working tree and included in Task 1 commit — deviation documented below

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Committed uncommitted 03-01 Task 2 lifecycle work**
- **Found during:** Task 1 (MessagesModule setup)
- **Issue:** 03-01 plan only committed Task 1 (migration + entities); Task 2 (lifecycle action endpoints, DTOs, permits service) was in working tree but uncommitted. The begin-review endpoint is needed for messaging test setup.
- **Fix:** Staged and committed lifecycle action DTOs, permits service methods (beginReview/requestInfo/respondToInfo/decide), permits controller action routes, permits module (with NotificationsModule import), and NotificationsService.createNotification() as part of Task 1 commit
- **Files modified:** backend/src/permits/permits.controller.ts, permits.service.ts, permits.module.ts, dto/begin-review.dto.ts, dto/request-info.dto.ts, dto/respond-to-info.dto.ts, dto/decide.dto.ts, notifications.service.ts
- **Verification:** `npx tsc --noEmit` exits 0; contracts verified
- **Committed in:** 064b9fa (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed archiver import — exports ZipArchive class not factory function**
- **Found during:** Task 2 (document archive implementation)
- **Issue:** Plan suggested `archiver('zip', options)` factory pattern; TypeScript compilation error TS2349 "not callable" because the archiver npm package exports ZipArchive class
- **Fix:** Changed to `new archiverModule.ZipArchive({ zlib: { level: 6 } })` 
- **Files modified:** backend/src/documents/documents.service.ts
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** 98855a6 (Task 2 commit)

**3. [Rule 2 - Missing Critical] Added S3Service to DocumentsModule exports**
- **Found during:** Task 1 (MessagesModule creation)
- **Issue:** DocumentsModule only exported DocumentsService; MessagesModule imports DocumentsModule to get S3Service for presigned attachment URLs — would fail at runtime with dependency injection error
- **Fix:** Added `S3Service` to `exports` array in DocumentsModule
- **Files modified:** backend/src/documents/documents.module.ts
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** 064b9fa (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for correctness and functionality. No scope creep.

## Issues Encountered

- None beyond the auto-fixed deviations above.

## User Setup Required

None — no external service configuration required beyond what's already in docker-compose.yml.

## Next Phase Readiness

- Messaging API fully functional: send, list, read, unread-count, attachment upload/register
- Notifications lifecycle complete: create (03-01) → list/read (03-02)
- Document archive ready for reviewer download
- Integration tests written; execution deferred to verify phase
- Ready for Phase 03-03 (frontend MessagePanel component) and 03-04 (Reviewer Queue)

## Self-Check

- [x] `backend/src/messages/messages.module.ts` — exists
- [x] `backend/src/messages/messages.controller.ts` — exists
- [x] `backend/src/messages/messages.service.ts` — exists
- [x] `backend/src/notifications/notifications.controller.ts` — exists
- [x] `backend/src/documents/documents.controller.ts` — exists, archive route present
- [x] `064b9fa` commit exists in git log
- [x] `98855a6` commit exists in git log
- [x] `npx tsc --noEmit` exits 0

---
*Phase: 03-review-workflow*
*Completed: 2026-07-22*
