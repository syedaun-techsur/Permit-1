---
pivota_spec_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 02-applicant-core-05-PLAN.md
last_updated: "2026-07-22T19:50:32.859Z"
last_activity: "2026-07-22 — Plan 01-02 complete: NestJS auth module, all /auth/* endpoints, JWT + RBAC guards"
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 22
  completed_plans: 10
  percent: 14
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-21)

**Core value:** Applicants can track every stage of their permit lifecycle in real time and communicate directly with reviewers — eliminating the opacity and friction of traditional permitting processes.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 5 (Foundation)
Plan: 3 of 4 in current phase (01-02 complete)
Status: In progress
Last activity: 2026-07-22 — Plan 01-02 complete: NestJS auth module, all /auth/* endpoints, JWT + RBAC guards

Progress: [█░░░░░░░░░] 14%

## Performance Metrics

**Velocity:**

- Total plans completed: 1
- Average duration: 4 min
- Total execution time: 4 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| Phase 01-foundation P03 | 1 | 4 min | 4 min |

**Recent Trend:**

- Last 5 plans: 4 min
- Trend: —

*Updated after each plan completion*
| Phase 01-foundation P01 | 10min | 3 tasks | 17 files |
| Phase 01-foundation P02 | 8min | 2 tasks | 21 files |
| Phase 02-applicant-core P02 | 3min | 2 tasks | 10 files |
| Phase 02-applicant-core P01 | 5min | 2 tasks | 19 files |
| Phase 02-applicant-core P03 | 7min | 2 tasks | 16 files |
| Phase 02-applicant-core P04 | 9min | 2 tasks | 8 files |
| Phase 02-applicant-core P05 | 4min | 2 tasks | 4 files |
| Phase 02-applicant-core P06 | 7min | 2 tasks | 10 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: 5 phases derived from 40 v1 requirements; standard granularity
- Stack: React (Vite + TS) frontend, Node.js (Express or NestJS) backend, Tailwind CSS design system, JWT + RBAC auth
- Scope: Web-first (responsive), no payments, no native app, no AI/ML, English-only for v1
- [Phase 01-foundation]: Design tokens use semantic names as Tailwind classes (bg-brand-primary, text-text-primary) — not default Tailwind blue/gray
- [Phase 01-foundation]: React 17+ JSX transform configured — no explicit React imports needed in components that don't use React namespace
- [Phase 01-foundation]: TypeORM migration class names require 13-digit JS timestamp suffix (e.g. InitialSchema1700000000001)
- [Phase 01-foundation]: MinIO image lacks curl/wget; use /usr/bin/mc ready local for healthcheck
- [Phase 01-foundation]: NestJS main.ts must bind 0.0.0.0 (not localhost) per sandbox runtime contract §2
- [Phase 01-foundation]: bcryptjs over bcrypt: native addon segfaults on node:20-alpine; bcryptjs is pure JS and API-compatible
- [Phase 01-foundation]: cookie-parser added to main.ts: required for req.cookies?.refreshToken to be populated in auth endpoints
- [Phase 02-applicant-core]: S3Service reads bucket from MINIO_BUCKET_NAME || MINIO_BUCKET for backward compat with existing compose env var
- [Phase 02-applicant-core]: Presigned URL pattern: browser uploads directly to MinIO (signed URL), backend never proxies file bytes
- [Phase 02-applicant-core]: Cursor pagination for permit list uses base64(updated_at ISO) — efficient, avoids OFFSET degradation
- [Phase 02-applicant-core]: AuditService.createEntry() wrapped in try/catch — audit failures never block application workflow
- [Phase 02-applicant-core]: applicant_id always set from JWT req.user.id in service layer, never from DTO body — T-02-04 STRIDE threat mitigated
- [Phase 02-applicant-core]: PermitFormPage Step 2 integrates DocumentUploadZone from 02-02 directly (not placeholder), enabling correct document attachment workflow
- [Phase 02-applicant-core]: Auto-save pattern: 2s debounce on useWatch, exponential backoff retry (1s/2s/4s x3), warning toast after 3 failures
- [Phase 02-applicant-core]: Plain axios (not apiClient) for MinIO presigned PUT — presigned URL auth is in query params; adding JWT Authorization header would break MinIO signature verification
- [Phase 02-applicant-core]: Promise.allSettled for parallel batch uploads — individual file errors don't abort other uploads in the same batch
- [Phase 02-applicant-core]: PermitStatusTimeline uses data-testid + data-state attributes for Playwright test targeting of stage states
- [Phase 02-applicant-core]: NavBar implemented as separate component rendered by AppShell; document.title managed in AppShell via useEffect + title prop

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-07-22T19:47:07.155Z
Stopped at: Completed 02-applicant-core-05-PLAN.md
Resume file: None
