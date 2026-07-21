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
