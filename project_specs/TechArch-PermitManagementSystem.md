# TechArch: Permit Management System

**Document Type:** Technical Architecture Document  
**Project:** Permit Management System  
**Version:** 1.0  
**Date:** 2026-07-21  
**Status:** Draft  

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Component Architecture](#2-component-architecture)
3. [Data Model](#3-data-model)
4. [API Design](#4-api-design)
5. [Security Architecture](#5-security-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Integration Points](#7-integration-points)

---

## 1. Architectural Overview

### 1.1 Architecture Pattern

The Permit Management System follows a **layered, monolithic-first architecture** with clean separation between the frontend SPA, backend REST API, relational database, and object storage. This pattern is chosen deliberately for v1: it reduces operational complexity, enables rapid iteration, and provides a clear upgrade path to microservices if workload demands it in v2.

**Key architectural decisions:**

| Decision | Rationale |
|----------|-----------|
| Monolithic API (single NestJS service) | Reduces deployment complexity for v1; all permit domain logic is cohesive and benefits from shared transaction boundaries |
| PostgreSQL as primary store | ACID compliance required for permit lifecycle state transitions; rich relational joins for audit trails and reporting |
| S3-compatible object storage | Permit documents require durable, scalable binary storage separate from relational data; presigned URLs avoid proxying large files through the API |
| SPA with client-side routing | Premium interactive experience; role-based route guards enforce access at UI layer (API enforcement is primary) |
| Polling for status updates | Eliminates WebSocket operational complexity for v1; 10-second polling interval meets the < 30s staleness target; upgrade to SSE/WebSocket in v2 if needed |
| JWT access + refresh token pair | Stateless horizontal scaling; refresh token rotation prevents long-lived credential theft |

---

### 1.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              React SPA (Vite + TypeScript)                   │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │  Auth Layer  │  │  Routing     │  │  State (Zustand) │  │   │
│  │  │  JWT store   │  │  React Router│  │  auth / permits  │  │   │
│  │  │  interceptor │  │  Role guards │  │  messages / notif│  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │   │
│  │                                                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │Dashboard │ │Permit    │ │Document  │ │Messaging     │  │   │
│  │  │(per role)│ │List/Form │ │Upload    │ │Panel         │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS / REST JSON
                            │ (JWT Bearer token on all protected routes)
┌───────────────────────────▼─────────────────────────────────────────┐
│                     BACKEND API LAYER                               │
│                  NestJS — Node.js — Express                         │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Auth Module │  │ Permit Module│  │  Document Module         │  │
│  │  JWT / RBAC  │  │  CRUD +      │  │  Upload / Presign        │  │
│  │  Guards      │  │  Lifecycle   │  │  S3 integration          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Message     │  │  Notification│  │  Admin Module            │  │
│  │  Module      │  │  Module      │  │  Users / Audit           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  Shared Infrastructure                        │  │
│  │  TypeORM / Prisma ORM  │  Logger  │  Error Handler  │  Guard │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────┬────────────────────────────────────────┬────────────────┘
           │ SQL (TLS)                              │ S3 API (HTTPS)
┌──────────▼────────────┐              ┌────────────▼────────────────┐
│     PostgreSQL 15      │              │   S3-Compatible Object       │
│                        │              │   Storage                    │
│  • users               │              │                              │
│  • permit_applications │              │  • permit-documents/         │
│  • permit_status_hist  │              │    {app_id}/{doc_id}/        │
│  • documents           │              │    {filename}                │
│  • messages            │              │                              │
│  • message_attachments │              │  Access: presigned URLs      │
│  • notifications       │              │  only (no public buckets)    │
│  • audit_logs          │              │                              │
└────────────────────────┘              └─────────────────────────────┘
```

---

### 1.3 Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                    │
│                                                             │
│  ┌─────────────────┐        ┌──────────────────────────┐   │
│  │   CDN / Edge    │        │     Load Balancer         │   │
│  │  (static assets)│        │   (HTTPS termination)     │   │
│  │  React SPA      │        └────────────┬─────────────┘   │
│  └─────────────────┘                     │                  │
│                                 ┌────────▼──────────┐       │
│                                 │  API Server(s)    │       │
│                                 │  NestJS / Node    │       │
│                                 │  (1–N instances)  │       │
│                                 └────────┬──────────┘       │
│                      ┌──────────────────┼──────────────┐    │
│            ┌─────────▼──────┐   ┌───────▼────────┐     │    │
│            │  PostgreSQL 15  │   │  S3-Compatible │     │    │
│            │  (Primary +    │   │  Object Storage│     │    │
│            │   Read Replica)│   └────────────────┘     │    │
│            └────────────────┘                          │    │
└─────────────────────────────────────────────────────────────┘
```

**Deployment targets (recommended):**
- **Frontend SPA**: Vercel, Netlify, or AWS CloudFront + S3
- **Backend API**: Railway, Render, or AWS ECS/Fargate (containerized)
- **Database**: Managed PostgreSQL — AWS RDS, Supabase, or Neon
- **Object Storage**: AWS S3 or compatible (Cloudflare R2, MinIO for self-hosted)
- **Containerization**: Docker + Docker Compose for local development; Docker image for production deployments

---

### 1.4 Request Flow — Authenticated API Call

```
Browser                 API Server              PostgreSQL
  │                         │                       │
  │  POST /api/v1/permits   │                       │
  │  Authorization: Bearer  │                       │
  │  {access_token}         │                       │
  │────────────────────────>│                       │
  │                         │ Verify JWT signature  │
  │                         │ Extract user_id, role │
  │                         │ Check RBAC guard      │
  │                         │                       │
  │                         │ INSERT permit_app...  │
  │                         │──────────────────────>│
  │                         │                       │
  │                         │<─ { id, status, ... } │
  │                         │                       │
  │                         │ INSERT audit_log...   │
  │                         │──────────────────────>│
  │                         │                       │
  │<─ 201 { permit data }   │                       │
```

---

### 1.5 File Upload Flow

```
Browser                 API Server              S3 Storage
  │                         │                       │
  │ POST /documents/presign │                       │
  │ { filename, mime_type } │                       │
  │────────────────────────>│                       │
  │                         │ GeneratePresignedURL  │
  │                         │──────────────────────>│
  │                         │<── presigned_url      │
  │                         │                       │
  │<─ { upload_url,         │                       │
  │     document_id }       │                       │
  │                         │                       │
  │  PUT {upload_url}       │                       │
  │  (file bytes direct)    │                       │
  │────────────────────────────────────────────────>│
  │<─ 200 OK ───────────────────────────────────────│
  │                         │                       │
  │ POST /documents/confirm │                       │
  │ { document_id }         │                       │
  │────────────────────────>│                       │
  │                         │ UPDATE document       │
  │                         │ SET status='uploaded' │
  │                         │──────────────────────>│
  │<─ 200 { document }      │                       │
```

The two-phase upload (presign → direct S3 PUT → confirm) keeps large binary data off the API server, reduces bandwidth costs, and enables parallel uploads from the client.

---

### 1.6 Status Update Polling Strategy

For v1, status updates and notifications use **short-poll** from the frontend:

```
Browser                          API Server
  │                                  │
  │ GET /notifications/unread        │
  │ (every 10 seconds)               │
  │─────────────────────────────────>│
  │<─ { count, latest_events }       │
  │                                  │
  │ GET /permits/{id} (on open detail│
  │ page, every 15 seconds)          │
  │─────────────────────────────────>│
  │<─ { permit with current status } │
```

**Polling intervals:**
- Notification badge: 10-second interval (dashboard / all pages)
- Application detail status: 15-second interval (when detail page is open)
- Application list: 30-second interval (background refresh)

**v2 upgrade path:** Server-Sent Events (SSE) or WebSocket for push-based real-time updates, reducing server load at scale.
---

## 2. Component Architecture

### 2.1 Backend Modules (NestJS)

```
src/
├── main.ts                         # Bootstrap, global pipes, CORS
├── app.module.ts                   # Root module
│
├── auth/                           # Authentication & session
│   ├── auth.module.ts
│   ├── auth.controller.ts          # POST /auth/*
│   ├── auth.service.ts             # register, login, refresh, logout, reset
│   ├── strategies/
│   │   ├── jwt.strategy.ts         # Passport JWT access token validation
│   │   └── jwt-refresh.strategy.ts # Passport JWT refresh token validation
│   ├── guards/
│   │   ├── jwt-auth.guard.ts       # Protects all authenticated routes
│   │   └── roles.guard.ts          # Enforces RBAC decorator
│   └── decorators/
│       └── roles.decorator.ts      # @Roles(Role.REVIEWER, Role.ADMIN)
│
├── users/                          # User management (Admin)
│   ├── users.module.ts
│   ├── users.controller.ts         # GET/POST/PATCH /users/*
│   └── users.service.ts
│
├── permits/                        # Core permit application domain
│   ├── permits.module.ts
│   ├── permits.controller.ts       # CRUD + lifecycle actions
│   ├── permits.service.ts          # Business logic, status transitions
│   └── permit-lifecycle.service.ts # State machine: validates valid transitions
│
├── documents/                      # File management
│   ├── documents.module.ts
│   ├── documents.controller.ts     # Presign, confirm, list, delete, download
│   ├── documents.service.ts        # Orchestrates S3 + DB
│   └── s3.service.ts               # AWS SDK wrapper (presigned URLs, delete)
│
├── messages/                       # Integrated messaging
│   ├── messages.module.ts
│   ├── messages.controller.ts      # GET/POST /permits/:id/messages
│   └── messages.service.ts         # Message CRUD, unread counts
│
├── notifications/                  # In-app notification delivery
│   ├── notifications.module.ts
│   ├── notifications.controller.ts # GET /notifications, PATCH /notifications/:id/read
│   └── notifications.service.ts   # Create on lifecycle events, poll endpoint
│
├── admin/                          # Admin-only operations
│   ├── admin.module.ts
│   ├── admin.controller.ts         # User mgmt, reviewer assignment, audit log
│   └── admin.service.ts
│
├── audit/                          # Audit log (append-only)
│   ├── audit.module.ts
│   └── audit.service.ts            # createEntry() — called by all services on state changes
│
└── common/                         # Shared utilities
    ├── filters/
    │   └── http-exception.filter.ts  # Structured error responses
    ├── interceptors/
    │   └── logging.interceptor.ts
    ├── pipes/
    │   └── validation.pipe.ts        # class-validator global pipe
    ├── dto/
    │   └── pagination.dto.ts
    └── enums/
        ├── role.enum.ts              # Applicant | Reviewer | Admin
        └── permit-status.enum.ts     # Draft | Submitted | UnderReview | ...
```

#### Module Responsibilities

| Module | Responsibility | Key Dependencies |
|--------|---------------|-----------------|
| `AuthModule` | JWT issuance, refresh, password reset flow | `UsersModule`, Passport, bcrypt |
| `UsersModule` | User CRUD, role assignment, soft-delete | `AuditModule` |
| `PermitsModule` | Permit application CRUD, lifecycle state machine | `AuditModule`, `NotificationsModule` |
| `DocumentsModule` | Presigned URL generation, upload confirmation, metadata | `S3Service`, `AuditModule` |
| `MessagesModule` | Per-permit message threads, unread tracking | `NotificationsModule` |
| `NotificationsModule` | In-app notification creation and polling | — (consumed by other modules) |
| `AdminModule` | Reviewer assignment, all-apps view, audit log read | `UsersModule`, `PermitsModule` |
| `AuditModule` | Append-only audit log writes | — (used by all modules) |

---

### 2.2 Permit Lifecycle State Machine

The `PermitLifecycleService` enforces valid status transitions. Invalid transitions return HTTP 422 with an error code.

```
                    ┌─────────┐
        Applicant   │  DRAFT  │  Applicant
        saves draft │         │  submits
                    └────┬────┘
                         │ submit()
                         ▼
                    ┌─────────────┐
                    │  SUBMITTED  │  Reviewer: beginReview()
                    └──────┬──────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ UNDER_REVIEW │
                    └──┬───────┬───┘
                       │       │
          requestInfo()│       │approve() / reject()
                       ▼       ▼
          ┌──────────────┐  ┌──────────┐  ┌──────────┐
          │ ADDITIONAL_  │  │ APPROVED │  │ REJECTED │
          │ INFO_NEEDED  │  └──────────┘  └──────────┘
          └──────┬───────┘   (terminal)   (terminal)
                 │
     Applicant   │ resubmit()
     responds    │
                 ▼
          ┌──────────────┐
          │ UNDER_REVIEW │ (loops back)
          └──────────────┘
```

**Valid transitions table:**

| From | To | Actor | Action |
|------|----|-------|--------|
| DRAFT | SUBMITTED | Applicant | `submit()` |
| SUBMITTED | UNDER_REVIEW | Reviewer | `beginReview()` |
| UNDER_REVIEW | ADDITIONAL_INFO_NEEDED | Reviewer | `requestInfo(note)` |
| UNDER_REVIEW | APPROVED | Reviewer | `approve(reason)` |
| UNDER_REVIEW | REJECTED | Reviewer | `reject(reason)` |
| ADDITIONAL_INFO_NEEDED | UNDER_REVIEW | Applicant | `resubmit()` |

Any other transition raises `InvalidTransitionException` (HTTP 422).

---

### 2.3 Frontend Architecture (React SPA)

```
src/
├── main.tsx                        # Vite entry point
├── App.tsx                         # Router + global providers
│
├── router/
│   ├── index.tsx                   # All route definitions
│   ├── ProtectedRoute.tsx          # Redirects unauthenticated users
│   └── RoleGuard.tsx              # Redirects wrong-role users (403 page)
│
├── store/                          # Zustand global state
│   ├── auth.store.ts               # user, tokens, login/logout actions
│   ├── permits.store.ts            # permit list + selected permit
│   ├── notifications.store.ts      # unread count, notification list
│   └── ui.store.ts                 # toast queue, modal state
│
├── api/                            # API client layer
│   ├── client.ts                   # Axios instance + JWT interceptors
│   ├── auth.api.ts
│   ├── permits.api.ts
│   ├── documents.api.ts
│   ├── messages.api.ts
│   └── notifications.api.ts
│
├── hooks/                          # Custom React hooks
│   ├── useAuth.ts
│   ├── usePermit.ts                # Polling hook for permit detail
│   ├── useNotifications.ts         # 10s polling for unread count
│   ├── useDocumentUpload.ts        # Presign → S3 PUT → confirm flow
│   └── useMessages.ts
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── dashboard/
│   │   ├── ApplicantDashboard.tsx
│   │   ├── ReviewerDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── permits/
│   │   ├── PermitListPage.tsx
│   │   ├── PermitDetailPage.tsx    # Tabs: Info | Documents | Messages | Timeline
│   │   └── PermitFormPage.tsx      # New + Edit (draft)
│   ├── admin/
│   │   ├── AllApplicationsPage.tsx  # Admin view: all permits across all users (PERM-07)
│   │   ├── UserManagementPage.tsx
│   │   └── AuditLogPage.tsx
│   └── errors/
│       ├── NotFoundPage.tsx
│       └── ForbiddenPage.tsx
│
├── components/
│   ├── ui/                         # Design system primitives
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Modal/
│   │   ├── Toast/
│   │   └── Skeleton/
│   ├── permit/
│   │   ├── PermitCard.tsx          # List row card with status badge
│   │   ├── PermitStatusTimeline.tsx # Visual lifecycle stepper
│   │   ├── PermitStatusBadge.tsx
│   │   └── PermitActionPanel.tsx   # Reviewer actions (approve/reject/etc.)
│   ├── document/
│   │   ├── DocumentUploadZone.tsx  # Drag-and-drop zone
│   │   ├── DocumentList.tsx
│   │   ├── DocumentPreview.tsx     # Image thumbnail / PDF iframe
│   │   └── UploadProgress.tsx
│   ├── messaging/
│   │   ├── MessagePanel.tsx        # Full message thread
│   │   ├── MessageBubble.tsx       # Individual message with metadata
│   │   └── MessageComposer.tsx     # Textarea + send + attach
│   ├── notifications/
│   │   └── NotificationBadge.tsx   # Unread count indicator
│   ├── layout/
│   │   ├── AppShell.tsx            # Sidebar + topbar wrapper
│   │   ├── Sidebar.tsx             # Role-aware nav links
│   │   └── TopBar.tsx              # User menu, notifications
│   └── dashboard/
│       ├── StatCard.tsx            # Summary count card
│       ├── StatusChart.tsx         # Status distribution visual
│       └── ActivityFeed.tsx        # Recent events list
│
├── types/                          # TypeScript interfaces (mirrors API)
│   ├── auth.types.ts
│   ├── permit.types.ts
│   ├── document.types.ts
│   ├── message.types.ts
│   └── notification.types.ts
│
└── styles/
    ├── tailwind.config.ts          # Custom design tokens
    └── globals.css                 # CSS variables, base resets
```

#### Frontend State Management Pattern

| Store | Managed State | Update Trigger |
|-------|--------------|----------------|
| `auth.store` | `user`, `accessToken`, `refreshToken`, `isAuthenticated` | Login / logout / refresh |
| `permits.store` | `permits[]`, `selectedPermit`, `loading`, `error` | API calls, polling |
| `notifications.store` | `unreadCount`, `notifications[]` | 10s polling interval |
| `ui.store` | `toasts[]`, `activeModal`, `sidebarOpen` | Component interactions |

The Axios interceptor in `client.ts` automatically attaches the `Authorization: Bearer` header from `auth.store` and handles 401 responses by calling the refresh token endpoint and retrying the original request once before redirecting to login.
---

## 3. Data Model

### 3.1 Entity Relationship Diagram

```
┌─────────────┐          ┌──────────────────────┐
│    users    │          │  permit_applications  │
│─────────────│          │──────────────────────│
│ id (PK)     │1        *│ id (PK)              │
│ email       ├──────────┤ applicant_id (FK)    │
│ password_hash│         │ reviewer_id (FK)     │──┐
│ full_name   │          │ permit_type          │  │
│ role        │          │ status               │  │
│ is_active   │          │ title                │  │
│ created_at  │          │ description          │  │
│ updated_at  │          │ site_address         │  │
└─────────────┘          │ contact_phone        │  │
      │                  │ submission_date      │  │
      │                  │ decision_reason      │  │
      │                  │ created_at           │  │
      │                  │ updated_at           │  │
      │                  └──────────┬───────────┘  │
      │                             │1             │
      │                   ┌─────────▼──────────┐   │
      │                   │permit_status_history│   │
      │                   │────────────────────│   │
      │                   │ id (PK)            │   │
      │                   │ application_id (FK)│   │
      │                   │ from_status        │   │
      │                   │ to_status          │   │
      │                   │ changed_by (FK)    │───┘
      │                   │ note               │
      │                   │ created_at         │
      │                   └────────────────────┘
      │
      │     ┌──────────────────────┐
      │     │      documents       │
      │     │──────────────────────│
      │     │ id (PK)             │
      └─────┤ application_id (FK) │
            │ uploaded_by (FK)    │
            │ file_name           │
            │ file_type           │
            │ file_size_bytes     │
            │ storage_key         │
            │ status              │
            │ created_at          │
            │ updated_at          │
            └──────────┬──────────┘
                       │1
             ┌─────────▼──────────────┐
             │  message_attachments   │
             │────────────────────────│
             │ id (PK)               │
             │ message_id (FK)       │
             │ document_id (FK)      │
             │ created_at            │
             └────────────────────────┘
                       │
            ┌──────────▼──────────────┐
            │        messages         │
            │─────────────────────────│
            │ id (PK)                │
            │ application_id (FK)    │
            │ sender_id (FK)         │
            │ body                   │
            │ is_read_by_applicant   │
            │ is_read_by_reviewer    │
            │ created_at             │
            └─────────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐
│     notifications    │       │      audit_logs       │
│──────────────────────│       │──────────────────────│
│ id (PK)              │       │ id (PK)              │
│ user_id (FK)         │       │ actor_id (FK)        │
│ type                 │       │ application_id (FK)  │
│ title                │       │ action               │
│ body                 │       │ metadata (JSONB)     │
│ application_id (FK)  │       │ created_at           │
│ is_read              │       └──────────────────────┘
│ created_at           │
└──────────────────────┘

┌──────────────────────┐
│  password_reset_     │
│  tokens              │
│──────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ token_hash          │
│ expires_at          │
│ used_at             │
│ created_at          │
└──────────────────────┘
```

---

### 3.2 DDL — Complete Table Definitions

#### Enumerations

```sql
-- Role enum
CREATE TYPE user_role AS ENUM (
    'applicant',
    'reviewer',
    'admin'
);

-- Permit application status enum
CREATE TYPE permit_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'additional_info_needed',
    'approved',
    'rejected'
);

-- Document upload status enum
CREATE TYPE document_status AS ENUM (
    'pending',     -- presigned URL issued; upload not yet confirmed
    'uploaded',    -- upload confirmed by client
    'deleted'      -- soft-deleted by applicant before submission
);

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
    'status_changed',
    'message_received',
    'info_requested',
    'approved',
    'rejected'
);
```

---

#### users

```sql
CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT            NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,
    full_name       TEXT            NOT NULL,
    role            user_role       NOT NULL DEFAULT 'applicant',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email     ON users (email);
CREATE INDEX idx_users_role      ON users (role);
CREATE INDEX idx_users_is_active ON users (is_active);

COMMENT ON TABLE  users              IS 'All system users: applicants, reviewers, and admins';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash; never stored in plaintext';
COMMENT ON COLUMN users.is_active     IS 'FALSE = soft-deleted; user cannot log in';
```

---

#### permit_applications

```sql
CREATE TABLE permit_applications (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id    UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewer_id     UUID            REFERENCES users(id) ON DELETE SET NULL,
    permit_type     TEXT            NOT NULL,
    status          permit_status   NOT NULL DEFAULT 'draft',
    title           TEXT            NOT NULL,
    description     TEXT            NOT NULL,
    site_address    TEXT            NOT NULL,
    contact_phone   TEXT,
    form_data       JSONB           NOT NULL DEFAULT '{}',
    submission_date TIMESTAMPTZ,
    decision_reason TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permit_app_applicant ON permit_applications (applicant_id);
CREATE INDEX idx_permit_app_reviewer  ON permit_applications (reviewer_id);
CREATE INDEX idx_permit_app_status    ON permit_applications (status);
CREATE INDEX idx_permit_app_submitted ON permit_applications (submission_date DESC);
CREATE INDEX idx_permit_app_type      ON permit_applications (permit_type);

COMMENT ON TABLE  permit_applications             IS 'Core permit application records';
COMMENT ON COLUMN permit_applications.form_data   IS 'JSONB bag for additional permit-type-specific fields; enables v2 configurable types';
COMMENT ON COLUMN permit_applications.decision_reason IS 'Required text when reviewer approves or rejects';
COMMENT ON COLUMN permit_applications.submission_date IS 'Set when status transitions from draft to submitted';
```

---

#### permit_status_history

```sql
CREATE TABLE permit_status_history (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID            NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
    from_status     permit_status,
    to_status       permit_status   NOT NULL,
    changed_by      UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    note            TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_psh_application ON permit_status_history (application_id, created_at DESC);
CREATE INDEX idx_psh_changed_by  ON permit_status_history (changed_by);

COMMENT ON TABLE  permit_status_history         IS 'Immutable log of every permit status transition; drives the timeline UI';
COMMENT ON COLUMN permit_status_history.note    IS 'Required for info_requested transitions; optional for others';
COMMENT ON COLUMN permit_status_history.from_status IS 'NULL for first entry (initial draft creation)';
```

---

#### documents

```sql
CREATE TABLE documents (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID            NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
    uploaded_by     UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_name       TEXT            NOT NULL,
    file_type       TEXT            NOT NULL,
    file_size_bytes BIGINT          NOT NULL,
    storage_key     TEXT            NOT NULL UNIQUE,
    status          document_status NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_docs_application ON documents (application_id, status);
CREATE INDEX idx_docs_uploaded_by ON documents (uploaded_by);
CREATE INDEX idx_docs_storage_key ON documents (storage_key);

COMMENT ON TABLE  documents             IS 'Document metadata; binary content stored in S3-compatible object storage';
COMMENT ON COLUMN documents.storage_key IS 'S3 object key: permit-documents/{app_id}/{doc_id}/{filename}';
COMMENT ON COLUMN documents.status      IS 'pending = presigned URL issued but upload not confirmed';
```

---

#### messages

```sql
CREATE TABLE messages (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id          UUID        NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
    sender_id               UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    body                    TEXT        NOT NULL,
    is_read_by_applicant    BOOLEAN     NOT NULL DEFAULT FALSE,
    is_read_by_reviewer     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_application ON messages (application_id, created_at ASC);
CREATE INDEX idx_messages_sender      ON messages (sender_id);
CREATE INDEX idx_messages_unread_app  ON messages (application_id, is_read_by_applicant);
CREATE INDEX idx_messages_unread_rev  ON messages (application_id, is_read_by_reviewer);

COMMENT ON TABLE messages IS 'Per-permit application message thread between applicant and reviewer';
```

---

#### message_attachments

```sql
CREATE TABLE message_attachments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id  UUID        NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (message_id, document_id)
);

CREATE INDEX idx_msg_att_message  ON message_attachments (message_id);
CREATE INDEX idx_msg_att_document ON message_attachments (document_id);
```

---

#### notifications

```sql
CREATE TABLE notifications (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            notification_type   NOT NULL,
    title           TEXT                NOT NULL,
    body            TEXT                NOT NULL,
    application_id  UUID                REFERENCES permit_applications(id) ON DELETE SET NULL,
    is_read         BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user       ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_application ON notifications (application_id);

COMMENT ON TABLE notifications IS 'In-app notifications delivered to users on status changes and messages';
```

---

#### audit_logs

```sql
CREATE TABLE audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    application_id  UUID        REFERENCES permit_applications(id) ON DELETE SET NULL,
    action          TEXT        NOT NULL,
    metadata        JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor       ON audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_application ON audit_logs (application_id, created_at DESC);
CREATE INDEX idx_audit_action      ON audit_logs (action);
CREATE INDEX idx_audit_created     ON audit_logs (created_at DESC);

COMMENT ON TABLE  audit_logs          IS 'Append-only log; no UPDATE or DELETE is ever issued against this table';
COMMENT ON COLUMN audit_logs.action   IS 'e.g. permit.submitted, permit.approved, user.deactivated, reviewer.assigned';
COMMENT ON COLUMN audit_logs.metadata IS 'Contextual data: { from_status, to_status, reason, assigned_reviewer_id, ... }';
```

---

#### refresh_tokens

```sql
CREATE TABLE refresh_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rt_user    ON refresh_tokens (user_id);
CREATE INDEX idx_rt_token   ON refresh_tokens (token_hash);
CREATE INDEX idx_rt_expires ON refresh_tokens (expires_at);

COMMENT ON TABLE  refresh_tokens           IS 'Server-side store of active refresh tokens; enables revocation on logout and rotation on refresh';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256 hash of the refresh token JWT; raw token is never stored';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'Non-null = token has been explicitly invalidated (logout or rotation)';
```

---

#### password_reset_tokens

```sql
CREATE TABLE password_reset_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prt_user    ON password_reset_tokens (user_id);
CREATE INDEX idx_prt_token   ON password_reset_tokens (token_hash);
CREATE INDEX idx_prt_expires ON password_reset_tokens (expires_at);

COMMENT ON TABLE  password_reset_tokens          IS 'Single-use tokens for password reset flow; expire after 1 hour';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'SHA-256 hash of the token sent in the email link';
```

---

### 3.3 PostgreSQL Performance Considerations

| Concern | Mitigation |
|---------|-----------|
| Permit list queries with filters | Composite index on `(status, submission_date DESC)` and `(applicant_id, status)` |
| Unread message count on every page load | Dedicated indexes on `is_read_by_applicant` / `is_read_by_reviewer`; count query is O(n messages) per permit — acceptable for v1 scale |
| Audit log growth | Indexed on `created_at DESC`; add table partitioning by month in v2 if volume warrants |
| JSONB `form_data` queries | GIN index if admin filtering by form field values is added in v2 |
| Notification polling | Index on `(user_id, is_read, created_at DESC)` makes unread count a fast index-only scan |
| `updated_at` auto-update | Trigger on all mutable tables to set `updated_at = NOW()` on every `UPDATE` |

```sql
-- Auto-update trigger (apply to: users, permit_applications, documents)
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON permit_applications
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
```
---

## 4. API Design

### 4.1 API Conventions

- **Base URL:** `https://api.example.com/api/v1`
- **Format:** JSON (`Content-Type: application/json`)
- **Auth:** `Authorization: Bearer {access_token}` on all protected endpoints
- **Errors:** Structured JSON error body on all 4xx/5xx responses
- **Pagination:** `?page=1&limit=20` query params; response includes `{ data[], meta: { total, page, limit, totalPages } }`
- **Versioning:** URL-based (`/api/v1/...`); backward-compatible changes within v1; breaking changes increment to v2

**Standard error response:**
```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "permit_type is required",
  "timestamp": "2026-07-21T10:00:00.000Z",
  "path": "/api/v1/permits"
}
```

---

### 4.2 TypeScript Interfaces (Shared Types)

```typescript
// ─── Enums ────────────────────────────────────────────────────────────────────

type UserRole = 'applicant' | 'reviewer' | 'admin';

type PermitStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'additional_info_needed'
  | 'approved'
  | 'rejected';

type DocumentStatus = 'pending' | 'uploaded' | 'deleted';

type NotificationType =
  | 'status_changed'
  | 'message_received'
  | 'info_requested'
  | 'approved'
  | 'rejected';

// ─── Core Entities ────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

interface PermitApplication {
  id: string;
  applicantId: string;
  applicant: Pick<User, 'id' | 'fullName' | 'email'>;
  reviewerId: string | null;
  reviewer: Pick<User, 'id' | 'fullName' | 'email'> | null;
  permitType: string;
  status: PermitStatus;
  title: string;
  description: string;
  siteAddress: string;
  contactPhone: string | null;
  formData: Record<string, unknown>;
  submissionDate: string | null;
  decisionReason: string | null;
  unreadMessageCount?: number;   // injected on list queries
  createdAt: string;
  updatedAt: string;
}

interface PermitStatusHistoryEntry {
  id: string;
  applicationId: string;
  fromStatus: PermitStatus | null;
  toStatus: PermitStatus;
  changedBy: Pick<User, 'id' | 'fullName' | 'role'>;
  note: string | null;
  createdAt: string;
}

interface Document {
  id: string;
  applicationId: string;
  uploadedBy: Pick<User, 'id' | 'fullName'>;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  status: DocumentStatus;
  downloadUrl?: string;   // presigned; only present when explicitly requested
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  applicationId: string;
  sender: Pick<User, 'id' | 'fullName' | 'role'>;
  body: string;
  attachments: Document[];
  isReadByApplicant: boolean;
  isReadByReviewer: boolean;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  applicationId: string | null;
  isRead: boolean;
  createdAt: string;
}

interface AuditLog {
  id: string;
  actorId: string;
  actor: Pick<User, 'id' | 'fullName' | 'role'>;
  applicationId: string | null;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// ─── Pagination Wrapper ───────────────────────────────────────────────────────

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

### 4.3 Authentication Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/auth/register` | None | — | Register new account |
| POST | `/auth/login` | None | — | Login; returns token pair |
| POST | `/auth/refresh` | Refresh token | — | Rotate access + refresh tokens |
| POST | `/auth/logout` | JWT | Any | Invalidate refresh token |
| POST | `/auth/forgot-password` | None | — | Send reset email |
| POST | `/auth/reset-password` | None | — | Submit new password with token |
| GET | `/auth/me` | JWT | Any | Get current user profile |

**POST /auth/register**
```typescript
// Request
interface RegisterRequest {
  email: string;
  password: string;       // min 8 chars, enforced server-side
  fullName: string;
}
// Response: 201
interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

**POST /auth/login**
```typescript
// Request
interface LoginRequest { email: string; password: string; }
// Response: 200
interface LoginResponse {
  user: User;
  accessToken: string;    // expires in 15 minutes
  refreshToken: string;   // expires in 7 days; HttpOnly cookie option available
}
```

**POST /auth/refresh**
```typescript
// Request
interface RefreshRequest { refreshToken: string; }
// Response: 200
interface RefreshResponse { accessToken: string; refreshToken: string; }
```

---

### 4.4 Permit Application Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/permits` | JWT | Applicant | Create new permit (draft) |
| GET | `/permits` | JWT | Any | List permits (role-filtered) |
| GET | `/permits/:id` | JWT | Any | Get single permit detail |
| PATCH | `/permits/:id` | JWT | Applicant | Update draft permit fields |
| DELETE | `/permits/:id` | JWT | Applicant | Delete draft (soft delete) |
| POST | `/permits/:id/submit` | JWT | Applicant | Submit draft → submitted |
| POST | `/permits/:id/begin-review` | JWT | Reviewer | submitted → under_review |
| POST | `/permits/:id/request-info` | JWT | Reviewer | under_review → additional_info_needed |
| POST | `/permits/:id/resubmit` | JWT | Applicant | additional_info_needed → under_review |
| POST | `/permits/:id/approve` | JWT | Reviewer | under_review → approved |
| POST | `/permits/:id/reject` | JWT | Reviewer | under_review → rejected |
| GET | `/permits/:id/history` | JWT | Any | Get status history timeline |

**POST /permits**
```typescript
interface CreatePermitRequest {
  permitType: string;
  title: string;
  description: string;
  siteAddress: string;
  contactPhone?: string;
  formData?: Record<string, unknown>;
}
// Response: 201 — PermitApplication
```

**GET /permits** (query params)
```typescript
interface PermitListQuery {
  status?: PermitStatus;
  permitType?: string;
  page?: number;      // default 1
  limit?: number;     // default 20, max 100
  sortBy?: 'createdAt' | 'updatedAt' | 'submissionDate';
  sortOrder?: 'asc' | 'desc';
}
// Response: 200 — PaginatedResponse<PermitApplication>
// Role behaviour:
//   Applicant  → own applications only
//   Reviewer   → applications assigned to them or unassigned + submitted/under_review
//   Admin      → all applications
```

**POST /permits/:id/request-info**
```typescript
interface RequestInfoRequest { note: string; }   // note required
// Response: 200 — PermitApplication
```

**POST /permits/:id/approve | /permits/:id/reject**
```typescript
interface DecisionRequest { reason: string; }    // reason required
// Response: 200 — PermitApplication
```

---

### 4.5 Document Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/permits/:id/documents/presign` | JWT | Applicant | Get presigned upload URL |
| POST | `/permits/:id/documents/confirm` | JWT | Applicant | Confirm upload complete |
| GET | `/permits/:id/documents` | JWT | Any | List documents for permit |
| GET | `/permits/:id/documents/:docId/download` | JWT | Any | Get presigned download URL |
| DELETE | `/permits/:id/documents/:docId` | JWT | Applicant | Soft-delete document |

**POST /permits/:id/documents/presign**
```typescript
interface PresignRequest {
  fileName: string;
  mimeType: string;     // must be in allowlist: pdf, jpg, jpeg, png, docx
  fileSizeBytes: number; // max 25MB enforced server-side
}
interface PresignResponse {
  documentId: string;   // pre-created DB record in 'pending' status
  uploadUrl: string;    // presigned S3 PUT URL; expires in 15 minutes
  storageKey: string;   // for client reference
}
```

**POST /permits/:id/documents/confirm**
```typescript
interface ConfirmUploadRequest { documentId: string; }
// Response: 200 — Document (status: 'uploaded')
```

**GET /permits/:id/documents/:docId/download**
```typescript
// Response: 200
interface DownloadResponse {
  downloadUrl: string;  // presigned GET URL; expires in 15 minutes
  fileName: string;
}
```

---

### 4.6 Messaging Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/permits/:id/messages` | JWT | Any | Get all messages for permit |
| POST | `/permits/:id/messages` | JWT | Any | Send a message |
| PATCH | `/permits/:id/messages/read` | JWT | Any | Mark messages as read |

**POST /permits/:id/messages**
```typescript
interface SendMessageRequest {
  body: string;
  attachmentDocumentIds?: string[];  // existing uploaded document IDs
}
// Response: 201 — Message
```

**PATCH /permits/:id/messages/read**
```typescript
// Marks all unread messages in the thread as read for the requesting user's role
// Response: 204 No Content
```

---

### 4.7 Notification Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/notifications` | JWT | Any | List user notifications (paginated) |
| GET | `/notifications/unread-count` | JWT | Any | Get unread count (polling target) |
| PATCH | `/notifications/:id/read` | JWT | Any | Mark single notification read |
| PATCH | `/notifications/read-all` | JWT | Any | Mark all notifications read |

**GET /notifications/unread-count**
```typescript
// Response: 200
interface UnreadCountResponse { count: number; }
```

**GET /notifications**
```typescript
// Query: ?page=1&limit=20&unreadOnly=true
// Response: 200 — PaginatedResponse<Notification>
```

---

### 4.8 Admin Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/admin/users` | JWT | Admin | List all users |
| POST | `/admin/users` | JWT | Admin | Create user with role |
| PATCH | `/admin/users/:id` | JWT | Admin | Update user (role, active status) |
| PATCH | `/admin/users/:id/deactivate` | JWT | Admin | Soft-deactivate user account |
| POST | `/admin/permits/:id/assign` | JWT | Admin | Assign reviewer to permit |
| GET | `/admin/audit-logs` | JWT | Admin | Paginated audit log |
| GET | `/admin/stats` | JWT | Admin | System-wide permit statistics |

**POST /admin/users**
```typescript
interface CreateUserRequest {
  email: string;
  fullName: string;
  role: UserRole;
  temporaryPassword: string;
}
// Response: 201 — User
```

**POST /admin/permits/:id/assign**
```typescript
interface AssignReviewerRequest { reviewerId: string; }
// Response: 200 — PermitApplication
```

**GET /admin/stats**
```typescript
interface AdminStatsResponse {
  totalApplications: number;
  byStatus: Record<PermitStatus, number>;
  reviewerWorkload: Array<{
    reviewer: Pick<User, 'id' | 'fullName'>;
    assignedCount: number;
    pendingActionCount: number;
  }>;
}
```

**GET /admin/audit-logs**
```typescript
// Query: ?page=1&limit=50&actorId=...&applicationId=...&action=...&from=...&to=...
// Response: 200 — PaginatedResponse<AuditLog>
```
---

## 5. Security Architecture

### 5.1 Authentication Flow

The system uses a **JWT access + refresh token pair**. Access tokens are short-lived (15 minutes) and carry the user's `id`, `email`, and `role` in the payload. Refresh tokens are long-lived (7 days) and stored in the database (hashed) to enable server-side revocation on logout or suspected compromise.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Authentication Flow                           │
│                                                                      │
│  Login/Register                                                      │
│  ─────────────                                                       │
│  1. Client: POST /auth/login { email, password }                    │
│  2. Server: bcrypt.compare(password, user.password_hash)            │
│  3. Server: sign accessToken (15m) + refreshToken (7d)              │
│  4. Server: store SHA-256(refreshToken) in refresh_tokens table     │
│  5. Client: store accessToken in memory (Zustand), refreshToken      │
│             in localStorage (or HttpOnly cookie — recommended)       │
│                                                                      │
│  Authenticated Request                                               │
│  ────────────────────                                                │
│  1. Axios interceptor: attach Authorization: Bearer {accessToken}   │
│  2. NestJS JwtStrategy: verify signature, extract payload           │
│  3. RolesGuard: check payload.role against @Roles() decorator       │
│  4. Handler executes; actor injected via @CurrentUser() decorator   │
│                                                                      │
│  Token Refresh                                                       │
│  ─────────────                                                       │
│  1. API returns 401 (access token expired)                          │
│  2. Axios response interceptor: POST /auth/refresh { refreshToken } │
│  3. Server: verify refreshToken JWT signature                       │
│  4. Server: lookup SHA-256(refreshToken) in DB — must exist & valid │
│  5. Server: invalidate old refresh token, issue new pair            │
│  6. Axios: retry original request with new accessToken              │
│  7. If refresh also fails → redirect to /login                      │
│                                                                      │
│  Logout                                                              │
│  ──────                                                              │
│  1. Client: POST /auth/logout { refreshToken }                      │
│  2. Server: delete refresh token record from DB                     │
│  3. Client: clear accessToken from memory, refreshToken from store  │
└──────────────────────────────────────────────────────────────────────┘
```

**JWT Payload (access token):**
```typescript
interface JwtPayload {
  sub: string;      // user.id (UUID)
  email: string;
  role: UserRole;
  iat: number;      // issued at
  exp: number;      // expiry (15 min from iat)
}
```

---

### 5.2 Authorization Model (RBAC)

All authorization is enforced **server-side** at the API layer. Frontend route guards are a UX convenience only — they must never be relied upon for security.

#### Role Capability Matrix

| Capability | Applicant | Reviewer | Admin |
|-----------|:---------:|:--------:|:-----:|
| Register / login / logout | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Create permit application | ✅ | — | — |
| View own permits | ✅ | — | — |
| Upload / remove documents (own permits) | ✅ | — | — |
| Submit permit (draft → submitted) | ✅ | — | — |
| Resubmit (additional_info → under_review) | ✅ | — | — |
| Send messages on own permits | ✅ | — | — |
| View assigned/available permits | — | ✅ | — |
| Begin review (submitted → under_review) | — | ✅ | — |
| Request info (under_review → add_info) | — | ✅ | — |
| Approve / reject applications | — | ✅ | — |
| Download documents (any assigned permit) | — | ✅ | — |
| Send messages as reviewer | — | ✅ | — |
| View all permits (system-wide) | — | — | ✅ |
| Create / deactivate users | — | — | ✅ |
| Assign reviewers to permits | — | — | ✅ |
| View audit logs | — | — | ✅ |
| View system statistics | — | — | ✅ |

#### Implementation in NestJS

```typescript
// Decorator on controller method
@Post(':id/approve')
@Roles(Role.REVIEWER)                   // RBAC guard checks this
@UseGuards(JwtAuthGuard, RolesGuard)
async approvePermit(
  @Param('id') id: string,
  @Body() dto: DecisionRequest,
  @CurrentUser() user: JwtPayload,
): Promise<PermitApplication> {
  // Service additionally verifies reviewer is assigned to this specific permit
  return this.permitsService.approve(id, dto.reason, user);
}
```

**Resource-level authorization** (beyond role): The `PermitsService` verifies:
- **Applicants** can only access/modify their own permits (`applicant_id = user.id`)
- **Reviewers** can only take action on permits assigned to them (`reviewer_id = user.id`)
- **Admins** have no resource-level restriction

---

### 5.3 Data Protection

| Category | Measure |
|----------|---------|
| Passwords | bcrypt hashed (cost factor 12); never stored or logged in plaintext |
| Password reset tokens | SHA-256 hashed in DB; raw token sent in email only; 1-hour expiry; single-use |
| Data in transit | TLS 1.2+ enforced on all connections (API, database, S3); HSTS header required |
| Data at rest | PostgreSQL encryption at rest via managed provider (AWS RDS, Supabase encrypted volumes) |
| S3 objects | Bucket is private (no public access); access only via presigned URLs with short expiry |
| Presigned URL expiry | Upload URLs: 15 minutes; download URLs: 15 minutes |
| JWT secrets | RS256 (asymmetric) preferred; HS256 acceptable if secret ≥ 256 bits and stored in env vault |
| Sensitive env vars | Never committed to VCS; injected via environment variables / secrets manager |
| Database connections | Connection pool with TLS; credentials in env vars only |
| Audit logs | `audit_logs` table is append-only; no `UPDATE` or `DELETE` granted on this table |
| CORS | Strict origin allowlist; only the frontend domain is permitted |
| Rate limiting | `/auth/login`, `/auth/forgot-password`: 5 requests/minute per IP (throttle guard) |

---

### 5.4 File Upload Security

```
Client Validation (UX only — not trusted):
  ✓ File type: PDF, JPG, JPEG, PNG, DOCX
  ✓ File size: max 25 MB

Server-Side Validation (enforced):
  ✓ mimeType allowlist check before issuing presigned URL
  ✓ fileSizeBytes checked before issuing presigned URL
  ✓ S3 bucket policy enforces max object size at PutObject level
  ✓ storage_key format validated (pattern: permit-documents/{uuid}/{uuid}/*)
  ✓ document.status must be 'pending' before confirm is accepted
  ✓ S3 presigned URL scoped to exact storage_key — cannot upload to different path

V2 Enhancement:
  • ClamAV or cloud malware scanning on S3 object create event
  • Quarantine bucket for scanning before document is accessible
```

---

### 5.5 Security Headers

All API responses include:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

Frontend SPA adds:
```
Content-Security-Policy: script-src 'self'; connect-src 'self' https://api.example.com https://*.s3.amazonaws.com
```

---

### 5.6 Input Validation & Injection Prevention

- **All API inputs** validated with `class-validator` decorators on DTOs; NestJS `ValidationPipe` throws 400 on any invalid input before it reaches service logic
- **SQL injection**: prevented by TypeORM/Prisma parameterized queries — no raw SQL string concatenation
- **XSS**: React escapes output by default; any user-supplied HTML in the message body is not rendered as HTML
- **CSRF**: API is stateless (JWT, not session cookies); CSRF attacks are not applicable; if refresh token is moved to HttpOnly cookie, implement `SameSite=Strict`
---

## 6. Technology Stack

### 6.1 Full Stack Technology Table

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | | | |
| Framework | React | 18.x | UI component model, hooks-based architecture |
| Build Tool | Vite | 5.x | Fast HMR, optimized production bundling |
| Language | TypeScript | 5.x | Type safety; strict mode required |
| Routing | React Router | 6.x | Client-side routing, protected routes |
| State Management | Zustand | 4.x | Lightweight global state (auth, permits, notifications) |
| Styling | Tailwind CSS | 3.x | Utility-first CSS with custom design tokens |
| HTTP Client | Axios | 1.x | REST API calls; interceptors for JWT attach + refresh |
| Form Handling | React Hook Form | 7.x | Performant forms with validation integration |
| Validation (FE) | Zod | 3.x | Schema validation; shared type inference with forms |
| Date Formatting | date-fns | 3.x | Lightweight date utilities; no moment.js |
| Icons | Lucide React | latest | Consistent SVG icon set; tree-shakeable |
| PDF Preview | react-pdf | 7.x | In-browser PDF rendering for document preview |
| Drag-and-Drop | react-dropzone | 14.x | File upload zone with validation hooks |
| Accessibility | axe-core | 4.x | Automated WCAG 2.1 AA checks in CI |
| Testing | Vitest + RTL | latest | Unit and integration tests; co-located with components |
| E2E Testing | Playwright | 1.x | Browser automation; cross-browser test suite |
| **Backend** | | | |
| Runtime | Node.js | 20 LTS | JavaScript runtime; LTS for stability |
| Framework | NestJS | 10.x | Structured, modular architecture; decorator-based DI |
| Language | TypeScript | 5.x | Shared type safety; strict mode |
| ORM | TypeORM | 0.3.x | PostgreSQL integration; migrations; entity-based |
| Auth Library | Passport.js | 0.7.x | Strategy pattern for JWT validation |
| JWT | @nestjs/jwt | 10.x | Token issuance and verification |
| Validation | class-validator + class-transformer | 0.14.x | DTO validation with decorators |
| Password Hashing | bcrypt | 5.x | Secure password hashing (cost factor 12) |
| S3 Integration | @aws-sdk/client-s3 | 3.x | S3-compatible storage; presigned URLs |
| Rate Limiting | @nestjs/throttler | 5.x | Per-IP rate limits on auth endpoints |
| Logging | winston | 3.x | Structured JSON logging; console + file transport |
| API Docs | @nestjs/swagger | 7.x | Auto-generated OpenAPI spec from decorators |
| Testing | Jest | 29.x | Unit + integration tests for services |
| **Database** | | | |
| RDBMS | PostgreSQL | 15.x | Primary data store; ACID compliance |
| Migrations | TypeORM migrations | — | Schema versioning; run on deploy |
| Connection Pool | pg (node-postgres) | 8.x | Via TypeORM; pool size tuned per environment |
| **Infrastructure** | | | |
| Object Storage | AWS S3 / Cloudflare R2 | — | Document binary storage; private bucket |
| Containerization | Docker | 24.x | Reproducible builds; dev/prod parity |
| Orchestration | Docker Compose | 2.x | Local development multi-service orchestration |
| CI/CD | GitHub Actions | — | Lint, test, build, deploy pipeline |
| Environment Secrets | dotenv (dev) / Secrets Manager (prod) | — | Env var injection; never committed to VCS |

---

### 6.2 Key Dependency Decisions

| Decision | Chosen | Rejected | Rationale |
|----------|--------|---------|-----------|
| State management | Zustand | Redux Toolkit | Zustand has significantly less boilerplate for a project of this scale; straightforward migration to Redux Toolkit if complexity grows |
| ORM | TypeORM | Prisma | TypeORM integrates more directly with NestJS decorators; Prisma is a valid alternative with excellent type generation — either works |
| Form library | React Hook Form + Zod | Formik | RHF is lighter and re-renders less; Zod provides end-to-end type safety from schema to form value |
| Icon set | Lucide React | Heroicons, FontAwesome | Lucide is tree-shakeable, MIT-licensed, and stylistically consistent with the design direction |
| PDF viewer | react-pdf | iframe / embed | react-pdf renders PDFs in-canvas for accessibility and consistent cross-browser experience |
| Testing framework (FE) | Vitest | Jest | Native Vite integration; faster HMR-aware test runs; same API surface as Jest |
| Logging | Winston | Pino | Winston is better supported in NestJS ecosystem; Pino is faster if performance becomes a concern |

---

### 6.3 Local Development Setup

```
┌─────────────────────────────────────────────────────────────┐
│                 docker-compose.yml (dev)                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  frontend    │  │   backend    │  │   postgres       │  │
│  │  Vite HMR   │  │  NestJS      │  │  postgres:15     │  │
│  │  :5173      │  │  :3000       │  │  :5432           │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────┐                       │
│  │  MinIO (S3-compatible local)     │                       │
│  │  :9000 (API) + :9001 (Console)  │                       │
│  └──────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

MinIO provides an S3-compatible API locally so the presigned URL flow works identically to production without needing AWS credentials in local development.

---

### 6.4 CI/CD Pipeline

```
GitHub Push / PR
       │
       ▼
┌─────────────────────────────────────────────┐
│  GitHub Actions Workflow                    │
│                                             │
│  1. lint         ESLint + TypeScript check  │
│  2. test:unit    Vitest (FE) + Jest (BE)    │
│  3. test:e2e     Playwright (main branch)   │
│  4. build        Vite build + NestJS build  │
│  5. docker:build Build API Docker image     │
│  6. deploy       Push image; migrate DB;    │
│                  deploy frontend to CDN     │
└─────────────────────────────────────────────┘
```

Database migrations run as a pre-deployment step via `typeorm migration:run` before the new API version serves traffic, ensuring schema is always ahead of application code.
---

## 7. Integration Points

### 7.1 External Systems

| System | Purpose | Integration Method | v1 / v2 |
|--------|---------|-------------------|---------|
| S3-Compatible Object Storage | Document binary storage | AWS SDK v3 (`@aws-sdk/client-s3`); presigned URLs | v1 |
| SMTP / Transactional Email | Password reset emails | Nodemailer + SendGrid / SES / Resend | v1 (reset only); v2 (notifications) |
| (Future) Stripe / payment processor | Permit fee payments | REST API + webhooks | v2 |
| (Future) ClamAV / malware scanner | Document security scanning | S3 event trigger → Lambda → scan service | v2 |
| (Future) Analytics / reporting | Admin analytics dashboards | Data warehouse or BI tool (Metabase) | v2 |

---

### 7.2 S3-Compatible Object Storage Integration

**Bucket structure:**
```
permit-documents/
└── {application_id}/
    └── {document_id}/
        └── {sanitized_filename}
```

**Operations performed by the API:**

| Operation | SDK Method | When |
|-----------|-----------|------|
| Generate upload URL | `getSignedUrl(PutObjectCommand)` | `POST /documents/presign` |
| Generate download URL | `getSignedUrl(GetObjectCommand)` | `GET /documents/:id/download` |
| Delete object | `DeleteObjectCommand` | Document soft-deleted + background job |
| Check object exists | `HeadObjectCommand` | Optional confirm validation |

**Bucket policy (enforce private-only access):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::permit-documents/*",
      "Condition": {
        "StringNotEquals": {
          "s3:authType": "REST-QUERY-STRING"
        }
      }
    }
  ]
}
```

This ensures all access goes through presigned URLs — direct public GET requests are denied.

---

### 7.3 Email Integration (Password Reset)

For v1, the only email sent is the password reset link. The system uses a transactional email provider to avoid SMTP deliverability issues.

**Recommended provider:** Resend (developer-friendly, generous free tier) or AWS SES (if already in AWS ecosystem).

**Password reset email flow:**
```
1. POST /auth/forgot-password { email }
2. Server: generate secure random token (crypto.randomBytes(32))
3. Server: store SHA-256(token) in password_reset_tokens with 1h expiry
4. Server: email link: https://app.example.com/reset-password?token={raw_token}
5. User clicks link → POST /auth/reset-password { token, newPassword }
6. Server: SHA-256(token) lookup → validate expiry and used_at
7. Server: bcrypt.hash(newPassword), update user.password_hash
8. Server: mark token as used (set used_at = NOW())
9. Server: invalidate any existing refresh tokens for this user
```

---

### 7.4 Environment Configuration

```bash
# ─── App ─────────────────────────────────────────────────
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.example.com

# ─── Database ────────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/permit_db?sslmode=require

# ─── JWT ─────────────────────────────────────────────────
JWT_ACCESS_SECRET=<256-bit random secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<256-bit random secret — different from access>
JWT_REFRESH_EXPIRES_IN=7d

# ─── S3 Storage ──────────────────────────────────────────
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<iam-key>
AWS_SECRET_ACCESS_KEY=<iam-secret>
S3_BUCKET_NAME=permit-documents
S3_ENDPOINT=https://s3.amazonaws.com  # override for Cloudflare R2 / MinIO

# ─── Email ───────────────────────────────────────────────
SMTP_FROM=noreply@example.com
RESEND_API_KEY=<resend-api-key>       # or use SENDGRID_API_KEY / SES config

# ─── Rate Limiting ───────────────────────────────────────
THROTTLE_AUTH_LIMIT=5
THROTTLE_AUTH_TTL=60000               # ms (5 requests per 60 seconds)

# ─── Frontend (Vite env vars, prefix VITE_) ──────────────
VITE_API_BASE_URL=https://api.example.com/api/v1
VITE_MAX_FILE_SIZE_MB=25
```

---

### 7.5 Architectural Constraints & Future Extension Points

The v1 architecture is designed with deliberate extension seams for v2 features:

| v2 Feature | v1 Foundation | Extension Path |
|------------|--------------|----------------|
| Email notifications on status change | `notifications` table captures all events | Add email dispatch in `NotificationsService` alongside in-app creation |
| Malware scanning | Documents stored in S3 with `pending → uploaded` status flow | Insert `scanning` status; S3 event triggers scan; confirm sets `uploaded` |
| Configurable permit types | `form_data JSONB` field on `permit_applications` | Introduce `permit_type_configs` table defining required fields per type; form renders dynamically |
| Multi-stage approval workflows | `permit_status_history` captures all transitions | Add `workflow_steps` table; lifecycle service reads step config |
| WebSocket / SSE real-time | Polling hooks in frontend (`usePermit`, `useNotifications`) | Replace polling interval with EventSource or Socket.io connection; same store interface |
| Payment integration | `permit_applications.status` flow | Add `payment_pending` status between `submitted` and `submitted` confirmation |
| Analytics export | `audit_logs` + `permit_applications` structured data | Add read replica query layer; expose CSV endpoint on admin |

---

*TechArch Version 1.0 — Generated 2026-07-21*  
*Covers all 40 v1 requirements across 5 delivery phases.*  
*Architecture decisions documented in Section 1.1; revisit after Phase 3 for WebSocket/SSE evaluation.*
