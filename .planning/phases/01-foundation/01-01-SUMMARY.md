---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [docker, postgres, nestjs, typeorm, react, vite, minio, migrations]

# Dependency graph
requires: []
provides:
  - "docker-compose.yml orchestrating postgres:15, minio, NestJS backend, React frontend"
  - "PostgreSQL schema: users, refresh_tokens, password_reset_tokens tables with indexes"
  - "Idempotent seed: admin@permits.local, reviewer@permits.local, applicant@permits.local"
  - "NestJS backend on :3000 with health endpoint, TypeORM, throttler, global exception filter"
  - "React/Vite frontend scaffold on :5173 with Tailwind, react-router-dom, zustand"
  - "UserRole enum (applicant/reviewer/admin), PermitStatus enum"
affects: [01-02, 01-03, 01-04, 01-05]

# Tech tracking
tech-stack:
  added:
    - "NestJS 10.x (backend framework)"
    - "TypeORM 0.3.x (ORM + migrations)"
    - "PostgreSQL 15 (primary database)"
    - "MinIO RELEASE.2024-01-16T16-07-38Z (object storage)"
    - "React 18 + Vite 5 (frontend)"
    - "Tailwind CSS 3.4 (design system)"
    - "bcrypt (password hashing)"
    - "passport-jwt (auth middleware)"
    - "zustand (state management)"
  patterns:
    - "Docker Compose DB contract: healthcheck → depends_on service_healthy → migrate → seed → serve"
    - "TypeORM migrations with timestamp-suffixed class names (InitialSchema1700000000001)"
    - "Idempotent seed via ON CONFLICT (email) DO NOTHING"
    - "NestJS bind to 0.0.0.0 for sandbox proxy compatibility"
    - "Volume mounts ./backend:/app + /app/node_modules for hot-reload in compose"

key-files:
  created:
    - "docker-compose.yml"
    - "backend/Dockerfile"
    - "frontend/Dockerfile"
    - "backend/package.json"
    - "frontend/package.json"
    - "backend/src/main.ts"
    - "backend/src/app.module.ts"
    - "backend/src/database/data-source.ts"
    - "backend/src/database/database.module.ts"
    - "backend/src/database/migrations/1700000000001-InitialSchema.ts"
    - "backend/src/database/seed.ts"
    - "backend/src/common/enums/role.enum.ts"
    - "backend/src/common/enums/permit-status.enum.ts"
    - "backend/src/common/filters/http-exception.filter.ts"
    - "backend/src/health/health.controller.ts"
  modified: []

key-decisions:
  - "NestJS 10.x chosen over Express — plan specified NestJS; decorators, TypeORM integration, Swagger built-in"
  - "postgres:15 pinned per plan spec (preseeded in sandbox cache)"
  - "TypeORM migrations with timestamp suffix (1700000000001) required by TypeORM naming convention"
  - "MinIO healthcheck uses /usr/bin/mc ready local (curl absent from minio image)"
  - "Removed obsolete 'version:' from compose (docker compose warning)"
  - "Backend Dockerfile uses npm install --include=dev (no lock file at build time; devDeps needed for nest start --watch)"
  - "main.ts binds 0.0.0.0 per sandbox runtime contract §2"

patterns-established:
  - "Compose pattern: all DB-backed services have healthcheck; app depends_on service_healthy"
  - "Migration pattern: class name ends with JS timestamp (TypeORM requirement)"
  - "Seed pattern: ON CONFLICT (email) DO NOTHING ensures idempotency across restarts"
  - "NestJS pattern: global ValidationPipe + global HttpExceptionFilter + ThrottlerModule in AppModule"

# Metrics
duration: 10min
completed: 2026-07-22
---

# Phase 1 Plan 01: Foundation Infrastructure Summary

**Docker Compose stack with postgres:15 + MinIO + NestJS 10 backend + React/Vite frontend, TypeORM migration creating users/refresh_tokens/password_reset_tokens tables, idempotent bcrypt-seeded users via ON CONFLICT DO NOTHING**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-22T16:33:56Z
- **Completed:** 2026-07-22T16:44:32Z
- **Tasks:** 3
- **Files modified:** 17

## Accomplishments

- Full `docker compose up` boots 4 services from cold start: postgres:15 (with healthcheck), MinIO (object storage), NestJS backend (:3000), React frontend (:5173)
- Database schema created via TypeORM migration: `users`, `refresh_tokens`, `password_reset_tokens` tables with all TechArch-specified indexes + updated_at trigger
- Idempotent seed script creates 3 login-ready users (admin/reviewer/applicant roles) using bcrypt hash + ON CONFLICT DO NOTHING
- NestJS scaffold configured with global ValidationPipe, HttpExceptionFilter, ThrottlerModule, Swagger, TypeORM integration
- React/Vite frontend scaffold with TypeScript, Tailwind CSS, react-router-dom, zustand, react-hook-form, zod

## Seed Credentials

For use by later plans and UAT:

| Email | Password | Role |
|-------|----------|------|
| admin@permits.local | Admin@12345! | admin |
| reviewer@permits.local | Reviewer@12345! | reviewer |
| applicant@permits.local | Applicant@12345! | applicant |

## Task Commits

Each task was committed atomically:

1. **Task 1: Docker Compose stack + NestJS + React scaffolds** - `d21a008` (feat)
2. **Task 2: NestJS scaffold + TypeORM migrations + DB schema + seed data** - `4ce4ad1` (feat)
3. **Task 3: Full stack boot verification + bug fixes** - `cb11cf4` (feat)

**Plan metadata:** _(this SUMMARY commit)_ (docs: complete plan)

## Files Created/Modified

- `docker-compose.yml` — Full local dev stack: postgres:15, minio, backend, frontend with healthchecks and depends_on
- `backend/Dockerfile` — node:20-alpine, npm install --include=dev, exposes :3000
- `frontend/Dockerfile` — node:20-alpine, npm install --include=dev, exposes :5173
- `backend/package.json` — NestJS 10.x, TypeORM, bcrypt, passport-jwt, winston
- `frontend/package.json` — React 18, Vite 5, Tailwind, zustand, react-router-dom, react-hook-form, zod
- `backend/tsconfig.json` — CommonJS, ES2021, decorators enabled
- `backend/nest-cli.json` — sourceRoot: src
- `backend/.env.example` — All env vars documented with placeholder values
- `backend/src/main.ts` — NestJS bootstrap, CORS, ValidationPipe, Swagger, binds 0.0.0.0:3000
- `backend/src/app.module.ts` — ThrottlerModule + DatabaseModule + HealthController
- `backend/src/database/data-source.ts` — TypeORM CLI DataSource for migration commands
- `backend/src/database/database.module.ts` — TypeOrmModule.forRootAsync from env vars
- `backend/src/database/migrations/1700000000001-InitialSchema.ts` — users, refresh_tokens, password_reset_tokens DDL
- `backend/src/database/seed.ts` — Idempotent seed for 3 roles
- `backend/src/common/enums/role.enum.ts` — UserRole enum
- `backend/src/common/enums/permit-status.enum.ts` — PermitStatus enum
- `backend/src/common/filters/http-exception.filter.ts` — Global exception handler
- `backend/src/health/health.controller.ts` — GET /health endpoint

## Decisions Made

- **NestJS over Express**: Plan specified NestJS; adds TypeORM integration, Swagger, and decorator-based architecture critical for auth plans
- **TypeORM timestamp migration names**: Renamed from `001_initial_schema.ts` to `1700000000001-InitialSchema.ts` — TypeORM requires class names ending with a 13-digit JS timestamp
- **MinIO healthcheck via mc**: `curl` is absent from the minio image; used `/usr/bin/mc ready local` instead
- **npm install --include=dev in Dockerfile**: No lock file exists at build time; devDependencies required for `nest start --watch`
- **0.0.0.0 bind in main.ts**: Explicit per sandbox runtime contract §2 to avoid IPv6 localhost issues with preview proxy

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed obsolete 'version:' attribute from docker-compose.yml**
- **Found during:** Task 1 verification
- **Issue:** `docker compose config` emitted warning: "attribute 'version' is obsolete"
- **Fix:** Removed `version: "3.9"` line from docker-compose.yml
- **Files modified:** docker-compose.yml
- **Verification:** `docker compose config --quiet` exits 0 with no warnings
- **Committed in:** d21a008 (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed Dockerfile npm ci → npm install --include=dev**
- **Found during:** Task 1 verification (docker build)
- **Issue:** `npm ci` requires package-lock.json; none exists at build time → build fails with EUSAGE
- **Fix:** Changed `RUN npm ci` to `RUN npm install --include=dev` in both Dockerfiles
- **Files modified:** backend/Dockerfile, frontend/Dockerfile
- **Verification:** `docker build` succeeds for both images
- **Committed in:** d21a008 (Task 1 commit)

**3. [Rule 1 - Bug] Fixed TypeORM migration naming convention**
- **Found during:** Task 3 (docker compose up)
- **Issue:** `InitialSchema1001` fails — TypeORM requires class name to end with a 13-digit JS timestamp
- **Fix:** Renamed file to `1700000000001-InitialSchema.ts`, class to `InitialSchema1700000000001`
- **Files modified:** backend/src/database/migrations/1700000000001-InitialSchema.ts (renamed from 001_initial_schema.ts)
- **Verification:** `migration:run` succeeds: "No migrations are pending" on second run
- **Committed in:** cb11cf4 (Task 3 commit)

**4. [Rule 1 - Bug] Fixed MinIO healthcheck (curl not in minio image)**
- **Found during:** Task 3 (docker compose up)
- **Issue:** MinIO RELEASE.2024-01-16 image has no `curl`/`wget` — healthcheck exits -1 immediately → backend depends_on blocks
- **Fix:** Changed healthcheck to `["CMD-SHELL", "/usr/bin/mc ready local --insecure 2>/dev/null && exit 0 || exit 1"]`
- **Files modified:** docker-compose.yml
- **Verification:** `docker inspect project-minio-1 --format='{{json .State.Health.Status}}'` returns "healthy"
- **Committed in:** cb11cf4 (Task 3 commit)

**5. [Rule 2 - Missing Critical] Added 0.0.0.0 bind to main.ts**
- **Found during:** Task 2 (applying runtime contract §2)
- **Issue:** Plan's main.ts had `app.listen(process.env.PORT || 3000)` which binds only localhost; sandbox proxy requires 0.0.0.0
- **Fix:** Changed to `app.listen(process.env.PORT || 3000, '0.0.0.0')`
- **Files modified:** backend/src/main.ts
- **Verification:** Backend accessible via sandbox proxy at :3000
- **Committed in:** 4ce4ad1 (Task 2 commit)

---

**Total deviations:** 5 auto-fixed (1 obsolete config, 1 blocking, 2 bugs, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for correct operation. No scope creep. Core contract fulfilled exactly as specified.

## Issues Encountered

None - all issues were auto-fixed per deviation rules.

## User Setup Required

None - no external service configuration required. All services are self-hosted via docker-compose.

## Next Phase Readiness

- Foundation infrastructure complete; ready for Plan 02 (auth endpoints)
- DB schema provides users/refresh_tokens/password_reset_tokens tables for auth plans
- Seed credentials documented above for UAT
- `docker compose up` is the single command to start the full dev stack

---
*Phase: 01-foundation*
*Completed: 2026-07-22*

## Self-Check: PASSED

- FOUND: docker-compose.yml
- FOUND: backend/Dockerfile
- FOUND: backend/src/main.ts
- FOUND: backend/src/database/migrations/1700000000001-InitialSchema.ts
- FOUND: backend/src/database/seed.ts
- FOUND: backend/src/common/enums/role.enum.ts
- FOUND: .planning/phases/01-foundation/01-01-SUMMARY.md
- FOUND commit: d21a008 (Task 1)
- FOUND commit: 4ce4ad1 (Task 2)
- FOUND commit: cb11cf4 (Task 3)
