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
  downloadUrl: string;  // presigned GET URL; expires in 5 minutes
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
