---

## F06: Reviewer Workflow {#f06}

**PRD Feature:** F6 · **Phase:** 3 — Review Workflow · **Priority:** P0
**Requirements:** PERM-05, PERM-06, DOCS-05 (see F03), STAT-03, STAT-04, STAT-06 (see F04)

### Description

Reviewers have a dedicated workspace to manage permit applications assigned to them or available in the shared review pool. The reviewer's application list view is filterable and sortable by status and urgency. The application detail view gives the reviewer access to all form data, documents, the full message thread, and status action controls — all on one page. Reviewers perform all workflow actions (begin review, request info, approve, reject) without navigating away from the application detail view.

### Terminology

- **Assigned Application:** An application where `reviewer_id` matches the current reviewer's `userId`. The reviewer has sole decision-making authority.
- **Available Pool:** Applications in `submitted` status with `reviewer_id = null`, visible to all reviewers and claimable.
- **Status Priority Order:** The order in which the reviewer queue surfaces applications: `additional_info_needed` (applicant has responded) > `submitted` (unassigned) > `under_review` (assigned, active) > terminal states (for reference).
- **Action Controls:** The set of buttons/actions rendered on the reviewer's application detail view based on the current application status.

### Sub-features

- **PERM-05** — Reviewer: view list of assigned/available applications
- **PERM-06** — Reviewer: view full application detail with all documents, messages, and action controls
- **STAT-03, STAT-04, STAT-06** — Status transitions (fully specified in F04; summarized here for reviewer workflow context)

---

### PERM-05: Reviewer Application List

**Access Rules:** `role = 'reviewer'` or `role = 'admin'`. Reviewers see applications assigned to them plus unassigned applications in `submitted` status. Admins see all applications (see F08/PERM-07).

**Process:**
1. `[Reviewer]` navigates to `/review-queue` (or is redirected there after login).
2. `[System]` fetches:
   - All applications where `reviewer_id = req.user.id` (any status)
   - All applications where `reviewer_id = null` AND `status = 'submitted'`
3. `[System]` returns the combined list sorted by the priority order defined above.
4. `[Frontend]` renders the queue as a sortable table/list with:
   - Application reference (e.g., `PMS-00042`)
   - Permit type
   - Applicant name
   - Site address summary
   - Status badge (color-coded)
   - Days since submitted (age indicator — highlights applications older than 5 business days)
   - Unread message count badge
   - Assigned/unassigned indicator
5. `[Reviewer]` can filter by: Status (All, Submitted, Under Review, Additional Info Needed, Approved, Rejected), Permit Type, Assignment (Mine, All Available).
6. `[Reviewer]` can sort by: Status (priority order), Submission Date (oldest first as default), Permit Type.
7. `[Reviewer]` clicks an application row to open the detail view.

**Outputs (per application list item):**
- `id`, `referenceNumber`, `status`, `permitType`, `applicantName`, `siteAddressSummary`, `submittedAt`, `updatedAt`, `unreadMessageCount`, `assignedReviewerId`, `daysSinceSubmitted`

**Pagination:** Server-side; `?page=1&limit=25`. Default sort: status priority ascending, then submission date ascending.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Unauthenticated | 401 | UNAUTHORIZED | "Authentication required." |
| Applicant attempts to access reviewer queue | 403 | FORBIDDEN | "You do not have access to the reviewer queue." |
| Database error | 500 | SERVER_ERROR | "Failed to load review queue. Please refresh." |

---

### PERM-06: Reviewer Application Detail View

**Process:**
1. `[Reviewer]` navigates to `/review/{applicationId}`.
2. `[System]` verifies the reviewer has access (assigned reviewer, admin, or application is in `submitted` status and unassigned).
3. `[System]` fetches in parallel: application data, documents, lifecycle stages, messages, and any info request/decision data.
4. `[Frontend]` renders:
   - **Application Header:** Reference number, permit type, applicant name, status badge, submission date, assigned reviewer (if any), days since submission
   - **Application Form Data Panel (read-only):** All permit fields displayed in a structured layout
   - **Lifecycle Timeline:** Same visual stepper as applicant view (STAT-02), but reviewer sees all stage details
   - **Document Panel:** All attached documents with inline preview and download — see DOCS-05 in F03
   - **Action Controls Panel:** Context-sensitive buttons based on current status (see below)
   - **Messaging Panel:** Full thread with compose box; reviewer can attach files — see MSG-01, MSG-04 in F05

**Action Controls by Status:**

| Application Status | Available Actions |
|-------------------|------------------|
| `submitted` | "Begin Review" → triggers STAT-03 |
| `under_review` | "Request Information" → triggers STAT-04; "Approve" → triggers STAT-06; "Reject" → triggers STAT-06 |
| `additional_info_needed` (applicant responded) | "Begin Review" (re-claim) OR review immediately — triggers STAT-03 transition back to `under_review` |
| `approved` / `rejected` | Read-only; shows decision details; no action buttons |
| `draft` | Reviewer sees "This application has not been submitted yet." No action controls |

**Reviewer-Specific Data:**
- Reviewer can see the applicant's full name, contact email, and contact phone as entered on the application.
- Reviewer sees the info request note and applicant's response note (if applicable).
- Reviewer sees the decision record if the application is in a terminal state.

**Outputs:** Full `ApplicationObject` as defined in PERM-04 (F02), plus reviewer-visible fields:
- `applicantEmail` (reviewer-only)
- `applicantPhone` (reviewer-only)
- `infoRequestNote`, `infoResponseNote`, `infoRequestAt`, `infoResponseAt`
- `decision`: `{ outcome, reason, decidedAt, decidedBy }`

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not found | 404 | APPLICATION_NOT_FOUND | "Application not found." |
| Reviewer not authorized (assigned to another reviewer, not in pool) | 403 | FORBIDDEN | "You do not have access to this application." |
| Application in draft (reviewers cannot view draft applications) | 403 | FORBIDDEN | "This application has not been submitted." |

**Schema Surface:** uses tables `permit_applications`, `documents`, `lifecycle_stages`, `messages`, `users` — see `Y0-schema.md` §Permits.
**API Surface:** see `Y1-api.md` §ReviewerWorkflow for full request/response schemas.
