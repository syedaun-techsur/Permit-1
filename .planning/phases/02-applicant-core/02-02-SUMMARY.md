---
phase: 02-applicant-core
plan: "02"
subsystem: api
tags: [minio, s3, documents, presigned-url, nestjs, typeorm]

requires:
  - phase: 01-foundation
    provides: JwtAuthGuard, TypeORM entities (users), docker-compose with postgres + minio base

provides:
  - DocumentsModule with DocumentsController, DocumentsService, S3Service
  - POST /permits/:id/documents/upload-url → presigned PUT URL + storageKey
  - POST /permits/:id/documents → register document metadata
  - GET /permits/:id/documents → list active documents
  - GET /permits/:id/documents/:docId/url → presigned GET URL
  - DELETE /permits/:id/documents/:docId → soft-delete
  - MinIO createbuckets init container in docker-compose.yml

affects:
  - 02-04 (frontend document upload UI needs these endpoints)
  - 02-01 (permit submit check depends on document count)

tech-stack:
  added: [minio npm package]
  patterns:
    - Presigned URL pattern: browser PUT directly to MinIO, backend never proxies file bytes
    - Soft-delete pattern: status='deleted' + deleted_at timestamp, fire-and-forget MinIO removal
    - Ownership check before any operation (403 ForbiddenException)
    - Application status gate for upload/delete: only draft/additional_info_needed allowed

key-files:
  created:
    - backend/src/documents/s3.service.ts
    - backend/src/documents/documents.controller.ts
    - backend/src/documents/documents.service.ts
    - backend/src/documents/documents.module.ts
    - backend/src/documents/dto/upload-url-request.dto.ts
    - backend/src/documents/dto/register-document.dto.ts
  modified:
    - docker-compose.yml (added createbuckets init service)
    - backend/.env.example (added MINIO_USE_SSL, MINIO_BUCKET_NAME)
    - backend/src/app.module.ts (registered DocumentsModule)
    - backend/package.json (added minio dependency)

key-decisions:
  - "S3Service reads bucket name from MINIO_BUCKET_NAME or MINIO_BUCKET (fallback) for backward compat with existing compose env var"
  - "storageKey is generated server-side with UUID prefix to prevent path traversal (T-02-11)"
  - "createbuckets init container uses minio/mc to create permits-documents bucket and set anonymous download policy"
  - "Soft-delete fire-and-forget MinIO removal provides audit window before physical deletion"

patterns-established:
  - "Presigned URL pattern: client receives signed URL from backend, uploads directly to MinIO, then POSTs metadata to backend"
  - "Status gate: UPLOAD_ALLOWED_STATUSES = [draft, additional_info_needed] enforced server-side"

duration: 3min
completed: 2026-07-22
---

# Phase 2 Plan 02: Document Management Backend Summary

**MinIO S3-compatible document service with presigned URL upload/preview pattern, soft-delete, and docker-compose createbuckets init container for permits-documents bucket**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-22T19:19:00Z
- **Completed:** 2026-07-22T19:22:34Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- S3Service wrapping MinIO client with presignedPutObject, presignedGetObject, removeObject (fire-and-forget)
- DocumentsController exposing all 5 document endpoints under `/permits/:id/documents`
- DocumentsService enforcing ownership (403), application status gate (422/403), max 20 docs (422), max 100MB total (422)
- createbuckets init container in docker-compose.yml that creates permits-documents bucket on MinIO startup
- TypeScript compiles cleanly across the entire backend

## Task Commits

Each task was committed atomically:

1. **Task 1: Add MinIO to docker-compose.yml + S3Service wrapper** - `0467b2f` (feat)
2. **Task 2: DocumentsModule — controller, service, DTOs** - `77af8d4` (feat)

## Files Created/Modified

- `backend/src/documents/s3.service.ts` - MinIO/S3 SDK wrapper with getPresignedPutUrl(), getPresignedGetUrl(), scheduleDelete()
- `backend/src/documents/documents.controller.ts` - REST endpoints: POST upload-url, POST register, GET list, GET :docId/url, DELETE :docId
- `backend/src/documents/documents.service.ts` - Business logic with all guards: ownership, status gate, doc count, total size
- `backend/src/documents/documents.module.ts` - NestJS module registering Document + PermitApplication TypeORM entities
- `backend/src/documents/dto/upload-url-request.dto.ts` - DTO with mimeType allowlist and max 25MB size validation
- `backend/src/documents/dto/register-document.dto.ts` - DTO for metadata registration
- `docker-compose.yml` - Added createbuckets init service (minio/mc) that creates permits-documents bucket
- `backend/.env.example` - Added MINIO_USE_SSL and MINIO_BUCKET_NAME vars
- `backend/src/app.module.ts` - Registered DocumentsModule
- `backend/package.json` - Added minio npm package

## Decisions Made

- S3Service reads bucket from `MINIO_BUCKET_NAME || MINIO_BUCKET` for backward compat with the existing compose env var (`MINIO_BUCKET`)
- storageKey generated server-side as `${applicationId}/${randomUUID()}-${sanitizedFilename}` to prevent path traversal (T-02-11)
- createbuckets sets anonymous download policy on the bucket (required for presigned GET URLs to work without extra auth)
- Soft-delete is fire-and-forget for MinIO removal, providing an audit window

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used MINIO_BUCKET fallback in S3Service bucket name resolution**
- **Found during:** Task 1 (S3Service creation)
- **Issue:** docker-compose.yml uses `MINIO_BUCKET` env var for the backend, but the plan's S3Service uses `MINIO_BUCKET_NAME`. Without fallback, the bucket would be undefined.
- **Fix:** S3Service reads `process.env.MINIO_BUCKET_NAME || process.env.MINIO_BUCKET || 'permits-documents'`
- **Files modified:** backend/src/documents/s3.service.ts
- **Verification:** TypeScript compiles, env vars align between compose and service
- **Committed in:** 0467b2f (Task 1 commit)

**2. [Rule 2 - Missing Critical] Sanitized filename in storageKey generation**
- **Found during:** Task 2 (DocumentsService getUploadUrl method)
- **Issue:** Plan mentions sanitizing filename but doesn't specify how. Raw client filename could contain special chars.
- **Fix:** Applied `filename.replace(/[^a-zA-Z0-9._-]/g, '_')` before appending to storageKey after UUID prefix
- **Files modified:** backend/src/documents/documents.service.ts
- **Verification:** Threat model T-02-11 (path traversal) mitigated
- **Committed in:** 77af8d4 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both fixes necessary for correctness and security. No scope creep.

## Issues Encountered

None — docker-compose already had MinIO service with healthcheck from Phase 1 work. Added createbuckets init container as specified. The minio npm package installed cleanly.

## User Setup Required

None - no external service configuration required. MinIO runs in docker-compose.

## Next Phase Readiness

- Document endpoints live, TypeScript clean
- createbuckets ensures permits-documents bucket exists on stack startup
- Ready for 02-03 (reviewer backend) and 02-04 (frontend document upload UI)

## Self-Check: PASSED

- ✅ backend/src/documents/s3.service.ts exists
- ✅ backend/src/documents/documents.controller.ts exists
- ✅ backend/src/documents/documents.service.ts exists
- ✅ backend/src/documents/documents.module.ts exists
- ✅ backend/src/documents/dto/upload-url-request.dto.ts exists
- ✅ backend/src/documents/dto/register-document.dto.ts exists
- ✅ Commit 0467b2f (Task 1) exists
- ✅ Commit 77af8d4 (Task 2) exists

---
*Phase: 02-applicant-core*
*Completed: 2026-07-22*
