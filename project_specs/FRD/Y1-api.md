---

## Y1: REST API Endpoints {#y1}

**Base URL:** `/api/v1`
**Content-Type:** `application/json`
**Authentication:** `Authorization: Bearer <accessToken>` on all protected routes
**Error format:** `{ "error": { "code": "ERROR_CODE", "message": "Human-readable message", "details": {} } }`

**Role abbreviations in Access column:** A = Applicant, R = Reviewer, ADM = Admin

---

### §Authentication

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `POST` | `/auth/register` | Public | Create a new user account |
| `POST` | `/auth/login` | Public | Authenticate and receive tokens |
| `POST` | `/auth/logout` | A, R, ADM | Revoke refresh token and clear cookie |
| `POST` | `/auth/refresh` | Cookie | Issue new access token using refresh cookie |
| `POST` | `/auth/forgot-password` | Public | Request password reset email |
| `POST` | `/auth/reset-password` | Public (token) | Submit new password with reset token |

**POST /auth/register — Request:**
```json
{
  "fullName": "Marcus Rivera",
  "email": "marcus@example.com",
  "password": "Secure@Pass1",
  "confirmPassword": "Secure@Pass1"
}
```
**Response 201:**
```json
{
  "accessToken": "eyJ...",
  "user": { "id": "uuid", "email": "marcus@example.com", "fullName": "Marcus Rivera", "role": "applicant" }
}
```

**POST /auth/login — Request:**
```json
{ "email": "marcus@example.com", "password": "Secure@Pass1" }
```
**Response 200:** Same shape as register response.

**POST /auth/refresh — Request:** (No body; uses HTTP-only cookie)
**Response 200:** `{ "accessToken": "eyJ..." }`

---

### §Permits

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `POST` | `/permits` | A | Create a new permit application (draft) |
| `GET` | `/permits` | A | List all applications for the current applicant |
| `GET` | `/permits/:id` | A, R, ADM | Get full application detail |
| `PATCH` | `/permits/:id` | A | Update draft application fields (auto-save) |
| `POST` | `/permits/:id/submit` | A | Submit a draft application |
| `GET` | `/permits/review-queue` | R, ADM | Reviewer: list assigned + available applications |
| `GET` | `/admin/permits` | ADM | Admin: list all applications |
| `POST` | `/permits/:id/actions/begin-review` | R, ADM | Transition: submitted → under_review |
| `POST` | `/permits/:id/actions/request-info` | R, ADM | Transition: under_review → additional_info_needed |
| `POST` | `/permits/:id/actions/respond-to-info` | A | Transition: additional_info_needed → under_review |
| `POST` | `/permits/:id/actions/decide` | R, ADM | Transition: under_review → approved or rejected |
| `PATCH` | `/permits/:id/assign-reviewer` | ADM | Assign or reassign a reviewer |

**POST /permits — Request:**
```json
{
  "permitType": "construction",
  "projectDescription": "Two-story residential addition...",
  "siteAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "CA",
    "zipCode": "90210"
  },
  "contactName": "Marcus Rivera",
  "contactPhone": "+1-555-555-1234",
  "contactEmail": "marcus@example.com",
  "estimatedStartDate": "2026-09-01",
  "estimatedValue": 150000,
  "additionalNotes": "..."
}
```
**Response 201:** Full `ApplicationObject`.

**GET /permits — Query params:**
- `status`: filter by status (comma-separated for multiple)
- `cursor`: for pagination
- `limit`: items per page (default 20, max 100)

**Response 200:**
```json
{
  "data": [ ApplicationObject, ... ],
  "nextCursor": "uuid-or-null",
  "totalCount": 42
}
```

**POST /permits/:id/actions/request-info — Request:**
```json
{ "infoRequestNote": "Please provide the updated site plan with dimensions." }
```
**Response 200:** Updated `ApplicationObject`.

**POST /permits/:id/actions/decide — Request:**
```json
{ "outcome": "approved", "decisionReason": "All requirements met. Site plan approved." }
```
**Response 200:** Updated `ApplicationObject`.

**PATCH /permits/:id/assign-reviewer — Request:**
```json
{ "reviewerId": "uuid-of-reviewer" }
```
**Response 200:** Updated `ApplicationObject`.

---

### §Documents

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `POST` | `/permits/:id/documents/upload-url` | A | Get presigned PUT URL for direct upload |
| `POST` | `/permits/:id/documents` | A | Register document metadata after upload |
| `GET` | `/permits/:id/documents` | A, R, ADM | List all documents for an application |
| `GET` | `/permits/:id/documents/:docId/url` | A, R, ADM | Get presigned GET URL for preview/download |
| `DELETE` | `/permits/:id/documents/:docId` | A | Soft-delete a document (draft/info_needed only) |
| `GET` | `/permits/:id/documents/archive` | R, ADM | Request ZIP download of all documents |

**POST /permits/:id/documents/upload-url — Request:**
```json
{ "filename": "site-plan.pdf", "mimeType": "application/pdf", "sizeBytes": 2048000 }
```
**Response 200:**
```json
{
  "uploadUrl": "https://s3.example.com/...",
  "storageKey": "documents/{appId}/{uuid}.pdf",
  "expiresAt": "2026-07-21T10:15:00Z"
}
```

**POST /permits/:id/documents — Request:**
```json
{
  "filename": "site-plan.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 2048000,
  "documentType": "Site Plan",
  "storageKey": "documents/{appId}/{uuid}.pdf"
}
```
**Response 201:** `DocumentObject`.

**GET /permits/:id/documents/:docId/url — Response 200:**
```json
{ "url": "https://s3.example.com/presigned-url...", "expiresAt": "2026-07-21T10:15:00Z" }
```

---

### §Messaging

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/permits/:id/messages` | A, R, ADM | List messages for an application (paginated) |
| `POST` | `/permits/:id/messages` | A, R | Send a message |
| `GET` | `/permits/:id/messages/unread-count` | A, R | Get unread message count for this application |
| `POST` | `/permits/:id/messages/:msgId/read` | A, R | Mark a message as read |
| `POST` | `/permits/:id/messages/:msgId/attachments/upload-url` | R | Get presigned URL for message attachment upload |
| `POST` | `/permits/:id/messages/:msgId/attachments` | R | Register message attachment metadata |

**POST /permits/:id/messages — Request:**
```json
{
  "body": "Please see the updated site plan attached.",
  "attachments": []
}
```
**Response 201:** `MessageObject`.

**GET /permits/:id/messages — Query params:** `cursor`, `limit` (default 50).
**Response 200:** `{ "data": [ MessageObject, ... ], "nextCursor": "...", "totalCount": 12 }`

**GET /permits/:id/messages/unread-count — Response 200:**
```json
{ "unreadCount": 3 }
```

---

### §Status & Lifecycle

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/permits/:id/lifecycle` | A, R, ADM | Get all lifecycle stage entries for an application |
| `GET` | `/notifications` | A, R | List notifications for the current user |
| `GET` | `/notifications/unread-count` | A, R | Get total unread notification count |
| `PATCH` | `/notifications/:notifId/read` | A, R | Mark a notification as read |
| `PATCH` | `/notifications/read-all` | A, R | Mark all notifications as read |

**GET /permits/:id/lifecycle — Response 200:**
```json
{
  "stages": [
    {
      "id": "uuid",
      "stage": "submitted",
      "enteredAt": "2026-07-20T09:00:00Z",
      "actorId": "uuid",
      "actorRole": "applicant"
    }
  ]
}
```

**GET /notifications — Query params:** `cursor`, `limit` (default 50), `read` (filter: `true`/`false`).

---

### §Dashboards

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/dashboard/applicant` | A | Applicant dashboard data |
| `GET` | `/dashboard/reviewer` | R | Reviewer dashboard data |
| `GET` | `/dashboard/admin` | ADM | Admin dashboard data |

**GET /dashboard/applicant — Response 200:**
```json
{
  "summaryCards": {
    "activeApplications": 4,
    "actionRequired": 1,
    "unreadMessages": 3
  },
  "recentApplications": [ ApplicationSummaryObject, ... ],
  "pendingActions": [ ApplicationSummaryObject, ... ],
  "activityFeed": [ NotificationObject, ... ]
}
```

**GET /dashboard/reviewer — Response 200:**
```json
{
  "summaryCards": {
    "assignedApplications": 12,
    "awaitingResponse": 2,
    "unassignedInPool": 5,
    "unreadMessages": 8
  },
  "priorityQueue": [ ReviewQueueItemObject, ... ],
  "atRiskApplications": [ ReviewQueueItemObject, ... ],
  "activityFeed": [ AuditEventObject, ... ]
}
```

**GET /dashboard/admin — Response 200:**
```json
{
  "summaryCards": {
    "totalApplications": 120,
    "activeApplications": 45,
    "submittedThisWeek": 12,
    "decisionsThisWeek": 8
  },
  "statusDistribution": [
    { "status": "submitted", "count": 10 },
    { "status": "under_review", "count": 22 }
  ],
  "reviewerWorkload": [
    { "reviewerId": "uuid", "reviewerName": "Diana Osei", "assigned": 15, "underReview": 8, "additionalInfoNeeded": 2, "decidedThisWeek": 5 }
  ],
  "recentActivity": [ AuditEventObject, ... ]
}
```

---

### §Admin

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/admin/users` | ADM | List all users |
| `POST` | `/admin/users` | ADM | Create a new user |
| `PATCH` | `/admin/users/:userId` | ADM | Update user (role, is_active) |
| `GET` | `/admin/users/:userId` | ADM | Get user detail |
| `GET` | `/admin/audit-log` | ADM | List audit log entries |
| `GET` | `/admin/permits` | ADM | List all applications (see §Permits) |

**POST /admin/users — Request:**
```json
{
  "fullName": "Diana Osei",
  "email": "diana@municipality.gov",
  "role": "reviewer",
  "temporaryPassword": "TempPass@1!"
}
```
**Response 201:** `UserObject`.

**PATCH /admin/users/:userId — Request (deactivate):**
```json
{ "isActive": false }
```
**PATCH /admin/users/:userId — Request (role change):**
```json
{ "role": "reviewer" }
```
**Response 200:** Updated `UserObject`.

**GET /admin/audit-log — Query params:** `action`, `actorId`, `applicationId`, `cursor`, `limit` (default 50), `from`, `to` (date range).
**Response 200:** `{ "data": [ AuditLogEntry, ... ], "nextCursor": "...", "totalCount": 1042 }`

---

### §Error Response Format (all endpoints)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'email' is required.",
    "details": {
      "field": "email",
      "constraint": "required"
    }
  }
}
```

For validation errors with multiple fields:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {
      "fields": [
        { "field": "email", "message": "Please enter a valid email address." },
        { "field": "password", "message": "Password must be 8–128 characters." }
      ]
    }
  }
}
```
