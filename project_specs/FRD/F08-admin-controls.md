---

## F08: Admin Controls {#f08}

**PRD Feature:** F8 · **Phase:** 5 — Admin & Compliance · **Priority:** P1
**Requirements:** PERM-07, ADMN-01, ADMN-02, ADMN-03

### Description

Administrators have full operational control over the system. They can create and deactivate user accounts, assign reviewers to applications, view all applications system-wide, and access a complete, immutable audit log of all status changes and key system actions. Admin tools are purpose-built for operational oversight. All admin actions are themselves logged in the audit trail.

### Terminology

- **Soft Delete (User):** Setting `users.is_active = false`. The user cannot log in; their data is preserved. Hard deletion is not supported in v1.
- **Reviewer Assignment:** Setting `permit_applications.reviewer_id` to a specific reviewer's `userId`.
- **Audit Log:** The `audit_log` table; append-only; no update or delete operations permitted. Read-only in the admin UI.
- **All-Applications View:** A paginated, filterable, sortable list of every permit application in the system — unrestricted by applicant or reviewer ownership.

### Sub-features

- **PERM-07** — Admin: view all applications
- **ADMN-01** — Admin: create, deactivate, and manage user accounts
- **ADMN-02** — Admin: assign reviewers to permit applications
- **ADMN-03** — Admin: view audit logs

---

### PERM-07: Admin — All Applications View

**Route:** `/admin/applications`

**Process:**
1. `[Admin]` navigates to the all-applications view.
2. `[System]` fetches all applications across all applicants and reviewers (no ownership filter).
3. `[System]` returns a paginated list (default: 25 per page, max 100).
4. `[Frontend]` renders a data table with columns: Reference, Permit Type, Applicant Name, Status, Assigned Reviewer, Submission Date, Last Updated, Actions.
5. `[Admin]` can filter by: Status, Permit Type, Assigned Reviewer (or Unassigned), Date Range (submitted_at).
6. `[Admin]` can sort by: any column.
7. `[Admin]` can click any row to open the application detail view (same view as PERM-06 reviewer detail, with admin access overrides).
8. `[Admin]` can perform reviewer assignment from the table row actions (ADMN-02).

**Outputs (per row):** `id`, `referenceNumber`, `permitType`, `applicantName`, `status`, `assignedReviewerName`, `submittedAt`, `updatedAt`.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Non-admin accesses endpoint | 403 | FORBIDDEN | "Admin access required." |
| Invalid filter parameters | 422 | VALIDATION_ERROR | "Invalid filter value for '{param}'." |

---

### ADMN-01: User Account Management

**Route:** `/admin/users`

**Process — View User List:**
1. `[Admin]` navigates to `/admin/users`.
2. `[System]` returns a paginated list of all users (active and inactive), sorted by `created_at DESC`.
3. `[Frontend]` renders a table: Full Name, Email, Role, Status (Active/Inactive), Created Date, Last Login, Actions.
4. `[Admin]` can filter by: Role, Status (Active/Inactive).
5. `[Admin]` can search by name or email (case-insensitive substring match).

**Process — Create User:**
1. `[Admin]` clicks "Create User".
2. `[Frontend]` opens a modal/form with fields: `fullName`, `email`, `role`, optional `temporaryPassword`.
3. `[Admin]` submits the form.
4. `[System]` validates: unique email, valid role, password complexity (if provided) or generates a temporary password.
5. `[System]` creates the user record with `is_active = true`.
6. `[System]` (if no password provided) sends a "Set Your Password" email to the new user with a password reset link (AUTH-04 flow).
7. `[System]` creates an audit log entry: `{ action: 'USER_CREATED', actor: adminId, targetUserId }`.
8. `[System]` returns `201 Created` with the new user object.

**Process — Deactivate User:**
1. `[Admin]` clicks "Deactivate" on a user row.
2. `[Frontend]` shows confirmation: "Deactivate {name}? They will immediately lose access to the system."
3. `[Admin]` confirms.
4. `[System]` sets `users.is_active = false`.
5. `[System]` revokes all active refresh tokens for that user.
6. `[System]` creates an audit log entry: `{ action: 'USER_DEACTIVATED', actor: adminId, targetUserId }`.
7. `[System]` returns `200 OK`.

**Process — Reactivate User:**
1. `[Admin]` clicks "Reactivate" on an inactive user row.
2. `[System]` sets `users.is_active = true`.
3. `[System]` creates an audit log entry: `{ action: 'USER_REACTIVATED', actor: adminId, targetUserId }`.

**Process — Change User Role:**
1. `[Admin]` clicks "Edit Role" on a user row.
2. `[Frontend]` displays a role selector: `applicant`, `reviewer`, `admin`.
3. `[Admin]` selects new role and confirms.
4. `[System]` updates `users.role`.
5. `[System]` creates an audit log entry: `{ action: 'USER_ROLE_CHANGED', actor: adminId, targetUserId, oldRole, newRole }`.
6. New role takes effect on the user's next token refresh (max 15 minutes for existing sessions).

**Inputs (Create User):**
- `fullName` (string, required): 1–100 characters
- `email` (string, required): Valid email, unique
- `role` (enum, required): `'applicant'` | `'reviewer'` | `'admin'`
- `temporaryPassword` (string, optional): If omitted, system sends password-set email

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Email already exists | 409 | EMAIL_ALREADY_EXISTS | "A user with this email already exists." |
| Invalid role value | 422 | INVALID_ROLE | "Role must be one of: applicant, reviewer, admin." |
| Admin attempts to deactivate themselves | 409 | SELF_DEACTIVATION | "You cannot deactivate your own account." |
| User not found | 404 | USER_NOT_FOUND | "User not found." |
| Non-admin accesses | 403 | FORBIDDEN | "Admin access required." |

---

### ADMN-02: Reviewer Assignment

**Route:** Accessible from `/admin/applications` (inline action) and the application detail view.

**Process:**
1. `[Admin]` selects a permit application.
2. `[Admin]` clicks "Assign Reviewer" (from list row actions or detail header).
3. `[Frontend]` displays a reviewer selector: searchable dropdown showing all active users with `role = 'reviewer'`, their current assigned application count displayed next to their name.
4. `[Admin]` selects a reviewer and confirms.
5. `[System]` validates:
   - Application must not be in a terminal state (`approved`, `rejected`)
   - Selected user must have `role = 'reviewer'` and `is_active = true`
6. `[System]` updates `permit_applications.reviewer_id`.
7. `[System]` creates an audit log entry: `{ action: 'REVIEWER_ASSIGNED', actor: adminId, applicationId, reviewerId, previousReviewerId }`.
8. `[System]` triggers an in-app notification for the assigned reviewer: "You have been assigned application #{ref}."
9. `[System]` returns the updated application.

**Process — Reassignment:**
- Same flow as above; if the application already has a reviewer, the new assignment replaces it.
- The previous reviewer loses access to the application (their assigned queue no longer includes it).
- The outgoing reviewer receives no notification (admin discretion).
- The incoming reviewer receives the assignment notification.

**Inputs:**
- `applicationId` (string, required)
- `reviewerId` (string, required): UUID of an active reviewer

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application in terminal state | 409 | INVALID_STATUS_TRANSITION | "Cannot assign a reviewer to a completed application." |
| Selected user is not a reviewer | 422 | INVALID_REVIEWER | "The selected user does not have the reviewer role." |
| Selected user is inactive | 422 | USER_INACTIVE | "The selected user's account is inactive." |
| Application not found | 404 | APPLICATION_NOT_FOUND | "Application not found." |
| Non-admin | 403 | FORBIDDEN | "Admin access required." |

---

### ADMN-03: Audit Log

**Route:** `/admin/audit-log`

**Access:** Read-only. The `audit_log` table is append-only; no entries can be edited or deleted — enforced at both the API and database constraint level.

**Process:**
1. `[Admin]` navigates to `/admin/audit-log`.
2. `[System]` returns a paginated log of all audit entries, sorted by `occurred_at DESC` (newest first).
3. `[Frontend]` renders a table: Timestamp, Actor (name + role), Action, Application Reference, Details, IP Address.
4. `[Admin]` can filter by: Actor, Action Type, Application Reference, Date Range.
5. `[Admin]` can search by application reference number.

**Logged Events (complete list):**

| Action Code | Description |
|-------------|------------|
| `USER_CREATED` | Admin created a new user |
| `USER_DEACTIVATED` | Admin deactivated a user |
| `USER_REACTIVATED` | Admin reactivated a user |
| `USER_ROLE_CHANGED` | Admin changed a user's role |
| `APPLICATION_CREATED` | Applicant started a new application (draft created) |
| `APPLICATION_SUBMITTED` | Applicant submitted their application |
| `APPLICATION_STATUS_CHANGED` | Any lifecycle transition with from/to status |
| `REVIEWER_ASSIGNED` | Admin assigned a reviewer |
| `DOCUMENT_UPLOADED` | Document uploaded to an application |
| `DOCUMENT_REMOVED` | Document removed from an application |
| `DOCUMENT_DOWNLOADED` | Document downloaded by a reviewer |
| `MESSAGE_SENT` | Message sent on an application |
| `DECISION_MADE` | Reviewer approved or rejected an application |
| `INFO_REQUEST_SENT` | Reviewer requested additional information |
| `INFO_RESPONSE_SUBMITTED` | Applicant responded to info request |
| `PASSWORD_RESET_REQUESTED` | Password reset link requested |
| `PASSWORD_RESET_COMPLETED` | Password successfully reset |

**Audit Log Entry Object:**
```json
{
  "id": "uuid",
  "action": "REVIEWER_ASSIGNED",
  "actorId": "uuid",
  "actorName": "James Whitfield",
  "actorRole": "admin",
  "applicationId": "uuid",
  "applicationRef": "PMS-00042",
  "details": { "reviewerId": "uuid", "reviewerName": "Diana Osei", "previousReviewerId": null },
  "ipAddress": "192.168.1.1",
  "occurredAt": "2026-07-21T10:00:00Z"
}
```

**Validation:**
- Audit log entries are created by the server only — no client-submitted audit records.
- `occurredAt` is always the server timestamp; client-provided timestamps are not accepted.
- The `details` field is a JSONB blob containing action-specific context; schema varies by action code.

**Pagination:** Cursor-based; `?cursor=<lastId>&limit=50`. Response includes `nextCursor` and `totalCount`.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Non-admin accesses audit log | 403 | FORBIDDEN | "Admin access required." |
| Invalid filter parameters | 422 | VALIDATION_ERROR | "Invalid filter value for '{param}'." |
| Database error | 500 | SERVER_ERROR | "Failed to load audit log. Please refresh." |

**Schema Surface:** uses tables `users`, `permit_applications`, `audit_log` — see `Y0-schema.md` §Admin.
**API Surface:** see `Y1-api.md` §Admin for full request/response schemas.
