---

## F02: Permit Application Submission {#f02}

**PRD Feature:** F2 · **Phase:** 2 — Applicant Core · **Priority:** P0
**Requirements:** PERM-01, PERM-02, PERM-03, PERM-04

### Description

Applicants create, draft, and submit permit applications through a structured multi-field form. Applications can be saved as drafts at any point and returned to later. Once submitted, the application enters the lifecycle at `submitted` status and becomes visible to reviewers. The application list view provides applicants with an organized overview of all their applications (both drafts and submitted), and the detail view exposes all entered data, documents, lifecycle status, and the messaging panel in a single unified page.

### Terminology

- **Application Form:** The structured data entry interface for creating a permit application.
- **Draft:** An application with `status = 'draft'`; not yet submitted; editable by the applicant.
- **Submitted Application:** An application with `status = 'submitted'` or beyond; the core form fields are locked.
- **Permit Type:** A categorical classification of the permit (e.g., "Construction", "Zoning Variance", "Event Permit", "Demolition").
- **Auto-save:** The system automatically persists draft changes to the backend as the applicant types (debounced, 2-second delay after last keystroke).
- **Inline Validation:** Field-level error messages that appear when a field loses focus (`onBlur`) or on form submission attempt — not only on the final submit click.

### Sub-features

- **PERM-01** — Create and submit a new permit application
- **PERM-02** — Save application as draft; return and complete later
- **PERM-03** — View list of own applications (submitted and draft)
- **PERM-04** — View full application detail

---

### PERM-01: Permit Application Submission

**Process:**
1. `[Applicant]` navigates to "New Application" from the dashboard or application list.
2. `[System]` creates a new application record with `status = 'draft'` and `applicant_id = req.user.id`.
3. `[Applicant]` fills in the application form fields.
4. `[System]` auto-saves changes to the draft record every 2 seconds after the last keystroke (debounced `PATCH /permits/{id}`).
5. `[Applicant]` uploads required documents (see F03).
6. `[Applicant]` clicks "Submit Application".
7. `[System]` runs full-form validation.
8. If validation fails: `[System]` highlights all failing fields with inline errors; does NOT submit.
9. If validation passes:
   a. `[System]` sets `status = 'submitted'` and `submitted_at = now()`.
   b. `[System]` creates an audit log entry: `{ action: 'APPLICATION_SUBMITTED', actor: userId, applicationId, timestamp }`.
   c. `[System]` creates a lifecycle stage entry: `{ stage: 'submitted', enteredAt: now() }`.
   d. `[System]` returns `200 OK` with updated application object.
   e. `[Frontend]` redirects the applicant to the application detail view.

**Inputs:**
- `permitType` (string, required): One of the defined permit type values
- `projectDescription` (string, required): Free-text description of the project
- `siteAddress` (object, required): `{ street, city, state, zipCode }`
  - `street` (string, required)
  - `city` (string, required)
  - `state` (string, required): 2-letter US state code
  - `zipCode` (string, required)
- `contactName` (string, required): Applicant contact name for this project
- `contactPhone` (string, required): Phone number for contact
- `contactEmail` (string, required): Email for project contact
- `estimatedStartDate` (string, optional): ISO 8601 date
- `estimatedValue` (number, optional): Estimated project value in USD (positive number)
- `additionalNotes` (string, optional): Free-form field for extra context (max 2000 characters)

**Outputs:**
- `200 OK` (update draft to submitted): `{ application: ApplicationObject }`
- `201 Created` (new application creation): `{ application: ApplicationObject }`

**ApplicationObject:**
```json
{
  "id": "uuid",
  "status": "submitted",
  "permitType": "Construction",
  "projectDescription": "string",
  "siteAddress": { "street": "", "city": "", "state": "", "zipCode": "" },
  "contactName": "string",
  "contactPhone": "string",
  "contactEmail": "string",
  "estimatedStartDate": "2026-08-01",
  "estimatedValue": 150000,
  "additionalNotes": "string",
  "applicantId": "uuid",
  "submittedAt": "2026-07-21T10:00:00Z",
  "createdAt": "2026-07-21T09:00:00Z",
  "updatedAt": "2026-07-21T10:00:00Z"
}
```

**Validation:**
- `permitType` must be one of: `construction`, `zoning_variance`, `event_permit`, `demolition`, `renovation`, `signage`
- `projectDescription` must be 10–5000 characters
- `siteAddress.street` must be 1–200 characters
- `siteAddress.city` must be 1–100 characters
- `siteAddress.state` must be a valid 2-letter US state code
- `siteAddress.zipCode` must match regex `/^\d{5}(-\d{4})?$/`
- `contactName` must be 1–100 characters
- `contactPhone` must match E.164 or US-formatted phone pattern
- `contactEmail` must be valid email format
- `estimatedStartDate` if provided, must be today or a future date
- `estimatedValue` if provided, must be a positive number ≤ 999,999,999
- `additionalNotes` if provided, must be ≤ 2000 characters
- Application must have at least one document attached before submission is allowed (DOCS-01 dependency)

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Required field missing | 422 | VALIDATION_ERROR | "Field '{field}' is required." |
| Invalid permit type | 422 | INVALID_PERMIT_TYPE | "'{value}' is not a valid permit type." |
| Phone format invalid | 422 | INVALID_PHONE | "Please enter a valid phone number." |
| Address zip invalid | 422 | INVALID_ZIPCODE | "Please enter a valid US ZIP code." |
| No documents attached | 422 | DOCUMENTS_REQUIRED | "At least one document must be attached before submitting." |
| Application not in draft status | 409 | INVALID_STATUS_TRANSITION | "Only draft applications can be submitted." |
| Applicant does not own application | 403 | FORBIDDEN | "You do not have permission to modify this application." |
| Auto-save conflict (concurrent edit) | 409 | CONFLICT | "This application was modified in another session. Refresh to see the latest." |

---

### PERM-02: Draft Save

**Process:**
1. Draft is created automatically when the applicant starts a new application (step 2 in PERM-01 process).
2. Auto-save triggers on every form field change, debounced 2 seconds.
3. `[System]` sends `PATCH /permits/{id}` with only the changed fields.
4. `[System]` updates the `updated_at` timestamp and returns `200 OK`.
5. `[Frontend]` shows a subtle "Saved" indicator (not a modal or toast — a quiet inline label).
6. `[Applicant]` may navigate away and return to the draft at any time via the application list.

**Edge Cases:**
- If the applicant's session expires during a draft edit, unsaved changes since the last auto-save are queued in `localStorage` and re-synced on the next session load.
- If the auto-save request fails (network error), the frontend retries up to 3 times with exponential backoff (1s, 2s, 4s). After 3 failures, a warning toast is shown: "Auto-save failed. Your recent changes may not be saved — please save manually."
- A "Save Draft" button is always visible as an explicit save action independent of auto-save.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Draft not found | 404 | APPLICATION_NOT_FOUND | "Application not found." |
| Application already submitted (cannot update) | 409 | APPLICATION_NOT_EDITABLE | "Submitted applications cannot be edited through this endpoint." |

---

### PERM-03: Application List View

**Process:**
1. `[Applicant]` navigates to `/applications`.
2. `[System]` fetches all applications where `applicant_id = req.user.id`, ordered by `updated_at DESC`.
3. `[System]` returns a paginated list (default: 20 per page).
4. `[Frontend]` renders application cards with status badge, permit type, site address summary, last updated timestamp, and unread message count.
5. `[Applicant]` can filter by status (All, Draft, Submitted, Under Review, Additional Info Needed, Approved, Rejected).
6. `[Applicant]` can click any card to navigate to the application detail view.

**Outputs (per application card):**
- Application ID (displayed as a human-readable reference, e.g., `PMS-00042`)
- Permit type
- Site address (street + city)
- Status badge (color-coded per status token)
- Last updated timestamp (relative: "3 hours ago")
- Unread message count badge (only shown if > 0)
- Quick action: "Continue" for drafts; "View" for submitted

**Pagination:** Cursor-based pagination; `?cursor=<lastId>&limit=20`. Response includes `nextCursor` and `totalCount`.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Unauthenticated | 401 | UNAUTHORIZED | "Authentication required." |
| Database error | 500 | SERVER_ERROR | "Failed to load applications. Please refresh." |

---

### PERM-04: Application Detail View

**Process:**
1. `[Applicant]` navigates to `/applications/{id}`.
2. `[System]` fetches the application, verifying `applicant_id = req.user.id`.
3. `[System]` fetches associated documents, lifecycle stages, and messages in parallel.
4. `[Frontend]` renders:
   - **Header:** Application reference number, permit type, status badge, submission date
   - **Form Data Panel:** All submitted field values (read-only unless status is `draft` or `additional_info_needed`)
   - **Lifecycle Timeline:** Visual stepper showing all stages with timestamps (see F04)
   - **Document Panel:** List of uploaded documents with preview and remove/replace controls (see F03)
   - **Messaging Panel:** Full message thread with compose box (see F05)
   - **Info Request Panel:** If status is `additional_info_needed`, shows the reviewer's request note and a response submission form

**Outputs:**
- Full `ApplicationObject` plus:
  - `documents`: `DocumentObject[]`
  - `lifecycleStages`: `LifecycleStageObject[]`
  - `messages`: `MessageObject[]` (paginated, latest 50)
  - `infoRequest`: `{ note: string, requestedAt: timestamp } | null`
  - `reviewerName`: string (name of assigned reviewer, if any; do not expose reviewer's email/personal data)
  - `decision`: `{ outcome: 'approved' | 'rejected', reason: string, decidedAt: timestamp } | null`

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not found | 404 | APPLICATION_NOT_FOUND | "Application not found." |
| Application belongs to another user | 403 | FORBIDDEN | "You do not have permission to view this application." |
| Parallel fetch partial failure | 200 + partial | PARTIAL_DATA | Individual panel shows error state; other panels load normally |

**Schema Surface:** uses tables `permit_applications`, `lifecycle_stages`, `documents`, `messages`, `audit_log` — see `Y0-schema.md` §Permits.
**API Surface:** see `Y1-api.md` §Permits for full request/response schemas.
