---

## F07: Role-Specific Dashboards {#f07}

**PRD Feature:** F7 · **Phase:** 4 — Dashboards · **Priority:** P1
**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04

### Description

Every user role lands on a dashboard tailored to their priorities. Dashboards are not generic summaries — they surface precisely the information each role needs to act immediately. Applicant dashboards emphasize active permits and pending actions. Reviewer dashboards prioritize the work queue. Admin dashboards give system-wide throughput visibility. Each dashboard includes at least one visual progress indicator (chart or activity feed). Dashboard data must not be staler than 30 seconds.

### Terminology

- **Summary Card:** A metric tile displaying a single count or KPI with a label and optional trend indicator (e.g., "Active Applications: 4").
- **Activity Feed:** A chronological list of recent system events relevant to the current user (status changes, new messages, decisions).
- **Status Distribution Chart:** A visual chart (bar or donut) showing the count of applications across each lifecycle stage.
- **Workload Table:** A table showing each reviewer's assigned application count by status.
- **Pending Action:** An application or item requiring the user's immediate attention (e.g., applicant has an application in `additional_info_needed`; reviewer has applications in `submitted` unassigned).

### Sub-features

- **DASH-01** — Applicant dashboard
- **DASH-02** — Reviewer dashboard
- **DASH-03** — Admin dashboard
- **DASH-04** — Visual progress indicators shared across all dashboards

---

### DASH-01: Applicant Dashboard

**Route:** `/dashboard` (redirect target after applicant login)

**Process:**
1. `[Applicant]` is redirected to or navigates to `/dashboard`.
2. `[System]` fetches in parallel:
   - Application summary counts by status (for the current applicant)
   - Recent applications (last 5, sorted by `updated_at DESC`)
   - Unread notifications count
   - Total unread message count across all applications
3. `[Frontend]` renders the dashboard skeleton immediately, then populates as data resolves.

**Dashboard Components:**

| Component | Content |
|-----------|---------|
| Summary Cards (top row) | "Active Applications" (submitted + under_review + additional_info_needed); "Action Required" (count of applications in additional_info_needed); "Unread Messages" (total across all applications) |
| Recent Applications List | Last 5 applications with: reference, permit type, status badge, last-updated timestamp, unread message count; "View All" link |
| Pending Actions Panel | Highlighted list of applications requiring the applicant's immediate attention (all in `additional_info_needed`); each shows the info request note excerpt and a "Respond" CTA |
| Quick Start CTA | "Start New Application" button — prominent, accessible from dashboard without nav |
| Activity Feed | Last 10 status change notifications for this applicant's applications, most recent first |

**Data Refresh:** Dashboard polls for updated data every 30 seconds. Polling stops when the page is not visible (`document.visibilityState === 'hidden'`).

**Empty State:** If the applicant has no applications, the dashboard shows a welcome state: "You have no permit applications yet. Start your first application." with a large CTA button.

**Error States:**

| Scenario | UI Response |
|----------|------------|
| API fetch fails on load | Skeleton replaced by error card with retry per-section |
| One section fails (partial) | Failed section shows inline error; other sections load normally |
| Session expired during poll | Redirect to `/login` with message "Your session has expired." |

---

### DASH-02: Reviewer Dashboard

**Route:** `/dashboard` (role-aware: reviewers see this view; same route, role-determined rendering)

**Process:**
1. `[Reviewer]` is redirected to or navigates to `/dashboard`.
2. `[System]` fetches in parallel:
   - Applications assigned to reviewer by status count
   - Unassigned applications in `submitted` status (count and list)
   - Reviewer's applications sorted by priority order (see PERM-05)
   - Total unread message count across reviewer's applications

**Dashboard Components:**

| Component | Content |
|-----------|---------|
| Summary Cards | "Assigned Applications" (total assigned); "Awaiting Response" (additional_info_needed where applicant has responded); "Unassigned In Pool" (submitted, no reviewer); "Unread Messages" |
| Priority Queue (main panel) | Applications sorted by priority: 1. additional_info_needed (applicant responded), 2. submitted (unassigned — claimable), 3. under_review (active). Each row shows: reference, permit type, applicant name, status badge, days since submission, unread message badge, quick-action button ("Begin Review", "Continue", "Review Response") |
| Pending Decisions Panel | Applications in `under_review` assigned to this reviewer with no action taken for > 3 business days — highlighted as at-risk |
| Activity Feed | Last 10 events on this reviewer's assigned applications: new messages, applicant responses, info requests |

**Sort and Filter on Dashboard Queue:**
- Default: priority order (status priority, then oldest first)
- Filter options: Status, Date range
- Queue is live-refreshed on 30-second poll

**Empty State:** "No applications assigned. Check the submission pool for new applications." with link to full review queue.

**Error States:** Same pattern as DASH-01 (per-section error, retry action).

---

### DASH-03: Admin Dashboard

**Route:** `/dashboard` (admin role sees this view)

**Process:**
1. `[Admin]` is redirected to or navigates to `/dashboard`.
2. `[System]` fetches in parallel:
   - System-wide application counts by status (all applicants)
   - Reviewer workload data (application counts per reviewer, by status)
   - Recent audit log entries (last 20)
   - Total new applications in last 7 days

**Dashboard Components:**

| Component | Content |
|-----------|---------|
| System-Wide Summary Cards | "Total Applications" (all time); "Active Applications" (not in terminal state); "Submitted This Week"; "Decisions This Week" (approved + rejected) |
| Status Distribution Chart | Visual chart (donut or grouped bar) showing application counts by lifecycle stage. Clickable segments navigate to the admin applications list filtered by that status |
| Reviewer Workload Table | One row per active reviewer: Name, Assigned (active), Under Review count, Additional Info Needed count, Decided This Week. Sortable by any column |
| Recent Activity Feed | Last 20 audit log entries system-wide: status transitions, user creations, reviewer assignments |
| Quick Actions | "Manage Users" link; "Assign Applications" link; "View Audit Log" link |

**Data Notes:**
- All counts are real-time (on dashboard load + 30-second poll).
- Reviewer workload table data source: `permit_applications` JOIN `users` grouped by `reviewer_id`.
- Admin cannot take permit actions (approve/reject) from the dashboard — those require navigating to the application detail.

**Error States:** Per-section error pattern; status chart failure shows fallback table.

---

### DASH-04: Visual Progress Indicators

**Description:** Every dashboard includes at least one meaningful visual chart or indicator beyond raw counts. These are defined per dashboard but share common implementation patterns.

**Required Visual Components:**

| Dashboard | Visual Indicator | Implementation |
|-----------|-----------------|---------------|
| Applicant | Activity Feed | Chronological event list with status-colored left border; latest 10 events |
| Reviewer | Priority Queue Heat Indicator | Age-based color coding on queue rows: < 3 days = green, 3–5 days = amber, > 5 days = red |
| Admin | Status Distribution Chart | Donut chart (preferred) or horizontal bar chart; one segment per lifecycle stage; uses `color.status.*` tokens |
| Admin | Reviewer Workload Bar | Horizontal bar chart comparing reviewer application counts; identifies overloaded reviewers at a glance |

**Chart Library:** A lightweight chart library (e.g., Recharts, Victory, or Nivo) must be used — no Canvas-only libraries that break accessibility. All charts must include:
- ARIA `role="img"` with a descriptive `aria-label`
- A fallback text summary for screen readers (e.g., "Status breakdown: 12 Under Review, 5 Submitted, 3 Additional Info Needed, 2 Approved, 1 Rejected")
- Color-blind-safe palette (avoid red/green as the only differentiators)

**Refresh Behavior:**
- All charts update on the 30-second polling cycle.
- Chart updates are smooth (animated transitions between values, not flash-replace).
- If a chart fails to load, it shows an inline error with a "Retry" button — it does not block the rest of the dashboard.

**Schema Surface:** uses tables `permit_applications`, `users`, `notifications`, `messages`, `audit_log` — see `Y0-schema.md` §Dashboards.
**API Surface:** see `Y1-api.md` §Dashboards for full request/response schemas.
