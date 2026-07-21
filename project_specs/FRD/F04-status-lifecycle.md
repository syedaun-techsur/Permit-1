---

## F04: Permit Status Tracking & Lifecycle {#f04}

**PRD Feature:** F4 · **Phase:** 2 (tracking) → 3 (reviewer actions + notifications) · **Priority:** P0
**Requirements:** STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06, STAT-07

### Description

Every permit application moves through a strictly ordered lifecycle of seven stages. Transitions are triggered by specific actors (applicant submission, reviewer actions, applicant response). Each transition is recorded as an immutable lifecycle stage entry with a timestamp. The applicant sees a visual timeline showing all past stages and the current stage. Reviewers drive the workflow forward from their application detail view. Every status change triggers an in-app notification to the applicant.

### Terminology

- **Lifecycle Stage:** One of seven ordered states. Valid values: `draft`, `submitted`, `under_review`, `additional_info_needed`, `approved`, `rejected`.
- **Terminal State:** A state from which no further transitions are possible: `approved` or `rejected`.
- **Info Request Note:** A required free-text message written by the reviewer when moving an application to `additional_info_needed`. This message is displayed prominently to the applicant.
- **Decision Reason:** A required free-text explanation written by the reviewer when approving or rejecting an application. Stored on the application and visible to the applicant.
- **Lifecycle Stage Entry:** An immutable record capturing `{ applicationId, stage, enteredAt, actor }` — created on every transition.

### Sub-features

- **STAT-01** — Defined lifecycle stages and transition rules
- **STAT-02** — Visual lifecycle timeline for applicants
- **STAT-03** — Reviewer: advance to Under Review
- **STAT-04** — Reviewer: request additional information
- **STAT-05** — Applicant: respond to info request
- **STAT-06** — Reviewer: approve or reject with documented reason
- **STAT-07** — In-app notification on status change

---

### STAT-01: Lifecycle Stages & Transition Rules

**Permitted Transitions:**

| From | To | Actor | Trigger |
|------|----|-------|---------|
| — | `draft` | `[Applicant]` | Application created (PERM-01) |
| `draft` | `submitted` | `[Applicant]` | Applicant clicks "Submit Application" (PERM-01) |
| `submitted` | `under_review` | `[Reviewer]` | Reviewer claims the application (STAT-03) |
| `under_review` | `additional_info_needed` | `[Reviewer]` | Reviewer requests more information (STAT-04) |
| `under_review` | `approved` | `[Reviewer]` | Reviewer approves with reason (STAT-06) |
| `under_review` | `rejected` | `[Reviewer]` | Reviewer rejects with reason (STAT-06) |
| `additional_info_needed` | `under_review` | `[Applicant]` | Applicant responds to info request (STAT-05) |

**Forbidden Transitions (enforced at API layer):**
- Any transition not listed above returns `409 INVALID_STATUS_TRANSITION`.
- Terminal states (`approved`, `rejected`) cannot be transitioned from.
- Applicants cannot transition their own application from `submitted` to `under_review`.
- Reviewers cannot move an application back to `draft` or `submitted`.

**Process (Transition Execution):**
1. `[Actor]` triggers the transition action.
2. `[System]` validates the current application status and the requested transition.
3. `[System]` validates role authorization for the transition.
4. `[System]` validates required inputs (e.g., reason text for STAT-04, STAT-06).
5. `[System]` updates `permit_applications.status` to the new stage.
6. `[System]` creates a `lifecycle_stages` entry: `{ applicationId, stage: newStage, enteredAt: now(), actorId: req.user.id }`.
7. `[System]` creates an `audit_log` entry.
8. `[System]` triggers in-app notification for the applicant (STAT-07).
9. `[System]` returns the updated application object.

---

### STAT-02: Visual Lifecycle Timeline

**Description:** A horizontal or vertical stepper component rendered on the applicant's application detail page. Shows all lifecycle stages, with visual differentiation between completed, current, and future stages.

**Process:**
1. `[System]` fetches all `lifecycle_stages` entries for the application.
2. `[Frontend]` renders the timeline stepper with:
   - All seven stages displayed in fixed order: Draft → Submitted → Under Review → Additional Info Needed → Approved / Rejected
   - **Completed stages:** filled/colored indicator + timestamp (relative and absolute)
   - **Current stage:** highlighted indicator + label (no timestamp — in progress)
   - **Future stages:** muted/unfilled indicator (greyed out)
   - **Branching terminal states:** Approved and Rejected shown as two alternative terminal nodes; the reached one is highlighted, the other is muted
3. If the application is in `additional_info_needed`, the info request note is shown prominently above or below the timeline.
4. If the application is `approved` or `rejected`, the decision reason is shown prominently below the terminal stage.

**Outputs (per stage entry):**
- `stage`: stage name
- `label`: Human-readable label (e.g., "Under Review")
- `enteredAt`: ISO 8601 timestamp
- `relativeTime`: Human-readable relative time (e.g., "2 days ago")
- `actorRole`: Role of the actor who triggered this transition

**Validation:**
- Timeline must always show all seven stages even if not yet reached
- Approved and Rejected are mutually exclusive terminal states — only one can be reached per application
- Timestamps must be sorted ascending; no duplicate stage entries for the same stage on the same path (re-entry to `under_review` from `additional_info_needed` creates a new entry, preserving history)

---

### STAT-03: Reviewer — Advance to Under Review

**Process:**
1. `[Reviewer]` opens an application in `submitted` status.
2. `[Reviewer]` clicks "Begin Review" action button.
3. `[System]` validates:
   - Application is in `submitted` status
   - User has role `reviewer` or `admin`
4. `[System]` assigns `reviewer_id = req.user.id` on the `permit_applications` record if not already assigned.
5. `[System]` executes transition: `submitted → under_review`.
6. `[System]` notifies the applicant (STAT-07).
7. `[System]` returns the updated application.

**Inputs:** `{ action: 'begin_review' }` (no additional fields required)

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not in `submitted` status | 409 | INVALID_STATUS_TRANSITION | "This application is not in 'Submitted' status." |
| Role not reviewer/admin | 403 | FORBIDDEN | "Only reviewers can begin application review." |

---

### STAT-04: Reviewer — Request Additional Information

**Process:**
1. `[Reviewer]` is viewing an application in `under_review` status.
2. `[Reviewer]` clicks "Request Information" action button.
3. `[Frontend]` displays a modal/panel with a required text area: "Describe what additional information is needed."
4. `[Reviewer]` enters the info request note and submits.
5. `[System]` validates:
   - Application is in `under_review` status
   - `infoRequestNote` is non-empty and ≤ 2000 characters
6. `[System]` stores the note in `permit_applications.info_request_note` and `info_request_at = now()`.
7. `[System]` executes transition: `under_review → additional_info_needed`.
8. `[System]` notifies the applicant with the note content (STAT-07).
9. `[System]` returns the updated application.

**Inputs:**
- `infoRequestNote` (string, required): 1–2000 characters describing what is needed

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not in `under_review` | 409 | INVALID_STATUS_TRANSITION | "This application is not under review." |
| Empty info request note | 422 | VALIDATION_ERROR | "A description of the required information is mandatory." |
| Note exceeds 2000 characters | 422 | VALIDATION_ERROR | "Info request note cannot exceed 2000 characters." |

---

### STAT-05: Applicant — Respond to Info Request

**Process:**
1. `[Applicant]` opens their application in `additional_info_needed` status.
2. Application detail page shows a prominent "Action Required" banner with the reviewer's info request note.
3. `[Applicant]` may:
   a. Upload additional documents (DOCS-01 flow, permitted in this status)
   b. Write a response note in the "Response" text area
4. `[Applicant]` clicks "Re-submit for Review".
5. `[System]` validates:
   - Application is in `additional_info_needed` status
   - `[Applicant]` owns the application
   - At least one document has been uploaded OR a response note has been provided (not both required, but at least one)
6. `[System]` stores the response note in `permit_applications.info_response_note` and `info_response_at = now()`.
7. `[System]` executes transition: `additional_info_needed → under_review`.
8. `[System]` notifies the assigned reviewer of the applicant's response (in-app).
9. `[System]` returns the updated application.

**Inputs:**
- `responseNote` (string, optional): Applicant's written response (max 2000 characters)
- (Documents are uploaded separately via DOCS-01; their presence is checked at this step)

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not in `additional_info_needed` | 409 | INVALID_STATUS_TRANSITION | "This action is only available for applications awaiting additional information." |
| No response provided | 422 | RESPONSE_REQUIRED | "Please upload a document or provide a written response before re-submitting." |
| Applicant does not own application | 403 | FORBIDDEN | "You do not have permission to respond to this request." |

---

### STAT-06: Reviewer — Approve or Reject

**Process:**
1. `[Reviewer]` is viewing an application in `under_review` status.
2. `[Reviewer]` clicks either "Approve" or "Reject" action button.
3. `[Frontend]` displays a confirmation modal with:
   - Action label: "Approve Application" or "Reject Application"
   - Required text area: "Document your reason for this decision"
   - Confirm and Cancel buttons
   - Danger styling for Reject action
4. `[Reviewer]` enters the decision reason and confirms.
5. `[System]` validates:
   - Application is in `under_review` status
   - User is the assigned reviewer or an admin
   - `decisionReason` is non-empty and 10–2000 characters
6. `[System]` updates: `permit_applications.decision = { outcome, reason, decidedAt: now(), decidedBy: reviewerId }`.
7. `[System]` executes transition: `under_review → approved` or `under_review → rejected`.
8. `[System]` notifies the applicant with the decision outcome and reason (STAT-07).
9. `[System]` returns the updated application.

**Inputs:**
- `outcome` (enum, required): `'approved'` or `'rejected'`
- `decisionReason` (string, required): 10–2000 characters

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not in `under_review` | 409 | INVALID_STATUS_TRANSITION | "A decision can only be made on applications under review." |
| Missing or too short reason | 422 | VALIDATION_ERROR | "A documented reason (at least 10 characters) is required." |
| Reason exceeds 2000 characters | 422 | VALIDATION_ERROR | "Decision reason cannot exceed 2000 characters." |
| Reviewer not assigned to application | 403 | FORBIDDEN | "Only the assigned reviewer or an admin can make a decision." |
| Application already in terminal state | 409 | INVALID_STATUS_TRANSITION | "This application has already been decided." |

---

### STAT-07: In-App Notifications

**Description:** Every status transition triggers an in-app notification delivered to the affected user(s). Notifications are persistent (stored in the database) and surfaced via a notification indicator in the global navigation.

**Notification Triggers:**

| Event | Notified User | Notification Text |
|-------|--------------|-------------------|
| `submitted → under_review` | Applicant | "Your permit application #{ref} is now under review." |
| `under_review → additional_info_needed` | Applicant | "Additional information is needed for your application #{ref}: '{infoRequestNote excerpt}'" |
| `additional_info_needed → under_review` | Assigned Reviewer | "Applicant has responded to your information request on #{ref}." |
| `under_review → approved` | Applicant | "Your permit application #{ref} has been approved." |
| `under_review → rejected` | Applicant | "Your permit application #{ref} has been rejected. Reason: '{reason excerpt}'" |
| New message received | Recipient (applicant or reviewer) | "New message on application #{ref} from {sender}." |

**Process:**
1. `[System]` generates a notification record in the `notifications` table after each triggering event.
2. `[Frontend]` polls `GET /notifications/unread-count` every 30 seconds to update the nav badge.
3. When the user navigates to the notification panel, `[Frontend]` fetches `GET /notifications` (paginated, latest 50).
4. Reading a notification marks it as `read` via `PATCH /notifications/{id}/read`.
5. Clicking a notification navigates to the relevant application detail page.

**Notification Object:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "applicationId": "uuid",
  "applicationRef": "PMS-00042",
  "type": "STATUS_CHANGE",
  "body": "Your permit application PMS-00042 is now under review.",
  "read": false,
  "createdAt": "2026-07-21T10:00:00Z"
}
```

**Edge Cases:**
- If the applicant is actively viewing the application detail page when a notification is generated, the page updates without requiring navigation away (status badge and timeline refresh via polling or optimistic update).
- Notifications are never deleted — they are marked as read only.
- Unread notification count is shown in the nav as a numeric badge (capped at display of "99+" for counts > 99).

**Schema Surface:** uses tables `notifications`, `lifecycle_stages`, `permit_applications`, `audit_log` — see `Y0-schema.md` §Lifecycle.
**API Surface:** see `Y1-api.md` §Status & Lifecycle for full request/response schemas.
