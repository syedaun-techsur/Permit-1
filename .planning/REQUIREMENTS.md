# Requirements: Permit Management System

**Defined:** 2026-07-21
**Core Value:** Applicants can track every stage of their permit lifecycle in real time and communicate directly with reviewers — eliminating the opacity and friction of traditional permitting processes.

## v1 Requirements

### Authentication & User Management

- [ ] **AUTH-01**: User can create an account with email and password
- [ ] **AUTH-02**: User can log in with email and password and remain authenticated across sessions
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User can reset password via email link
- [ ] **AUTH-05**: System enforces role-based access control (Applicant, Reviewer, Admin) at the API layer

### Permit Applications

- [ ] **PERM-01**: Applicant can submit a new permit application with structured form data (type, description, location, required fields)
- [ ] **PERM-02**: Applicant can save a permit application as a draft before submitting
- [ ] **PERM-03**: Applicant can view a list of their submitted and draft permit applications
- [ ] **PERM-04**: Applicant can view the full detail of any of their permit applications
- [ ] **PERM-05**: Reviewer can view a list of all permit applications assigned to or available for their review
- [ ] **PERM-06**: Reviewer can view the full detail of any permit application
- [ ] **PERM-07**: Admin can view all permit applications across all reviewers and applicants

### Document Management

- [ ] **DOCS-01**: Applicant can upload documents to a permit application via drag-and-drop or file picker
- [ ] **DOCS-02**: System validates uploaded files (type, size) and provides immediate feedback on errors
- [ ] **DOCS-03**: Applicant can preview uploaded documents inline (image thumbnails, PDF viewer)
- [ ] **DOCS-04**: Applicant can remove or replace uploaded documents before submission
- [ ] **DOCS-05**: Reviewer can view and download all documents attached to a permit application

### Status Tracking & Lifecycle

- [ ] **STAT-01**: Permit application progresses through defined lifecycle stages: Draft → Submitted → Under Review → Additional Info Needed → Approved / Rejected
- [ ] **STAT-02**: Applicant can view a visual lifecycle timeline/stepper showing current stage and all past stages with timestamps
- [ ] **STAT-03**: Reviewer can advance a permit application from Submitted → Under Review
- [ ] **STAT-04**: Reviewer can request additional information from an applicant (moves status to Additional Info Needed)
- [ ] **STAT-05**: Applicant can respond to an additional information request (re-submits to Under Review)
- [ ] **STAT-06**: Reviewer can approve or reject an application with a documented reason
- [ ] **STAT-07**: Applicant receives an in-app notification when their permit status changes

### Messaging & Communication

- [ ] **MSG-01**: Applicant and Reviewer can exchange messages on a permit application via an integrated messaging panel
- [ ] **MSG-02**: Messages display sender name, role, timestamp, and message body
- [ ] **MSG-03**: Unread message counts are surfaced on the permit list and dashboard
- [ ] **MSG-04**: Reviewer can attach documents or notes to a message

### Dashboard & Navigation

- [ ] **DASH-01**: Applicant dashboard shows summary of active permits, recent status changes, and unread messages
- [ ] **DASH-02**: Reviewer dashboard shows assigned applications by status priority, pending actions, and unread messages
- [ ] **DASH-03**: Admin dashboard shows system-wide statistics: total applications, by status, by reviewer workload
- [ ] **DASH-04**: Dashboard includes visual progress indicators (status distribution chart, activity feed)

### Admin & Configuration

- [ ] **ADMN-01**: Admin can create, deactivate, and manage user accounts
- [ ] **ADMN-02**: Admin can assign reviewers to permit applications
- [ ] **ADMN-03**: Admin can view audit logs for all status changes and key actions

### UI / UX Quality

- [ ] **UX-01**: Interface is responsive and fully functional on desktop and mobile screen sizes
- [ ] **UX-02**: Interface meets WCAG 2.1 AA accessibility standards (contrast ratios, keyboard navigation, screen-reader support)
- [ ] **UX-03**: Loading states use skeleton screens instead of spinners where page-level content is loading
- [ ] **UX-04**: Interactive elements have meaningful hover, focus, and active states with smooth transitions
- [ ] **UX-05**: Design system uses custom tokens (color palette, typography, spacing, border-radius, shadows) — no default/template look

## v2 Requirements

### Notifications

- **NOTF-01**: User receives email notifications on status changes
- **NOTF-02**: User can configure which events trigger email vs. in-app notifications
- **NOTF-03**: Admin can send system-wide announcements

### Payments

- **PAY-01**: Applicant can pay permit fees online during application submission
- **PAY-02**: System generates fee receipts upon successful payment

### Reporting & Analytics

- **RPT-01**: Admin can export permit data to CSV/Excel
- **RPT-02**: Admin can view processing time analytics by permit type and reviewer
- **RPT-03**: Admin can generate compliance reports

### Workflow Configuration

- **WRK-01**: Admin can define custom permit types with configurable required fields and document checklists
- **WRK-02**: Admin can configure multi-stage approval workflows (e.g., sequential reviewer sign-off)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Native mobile app (iOS/Android) | Web-first; responsive web covers mobile use cases in v1 |
| Payment processing for permit fees | Compliance complexity (PCI-DSS); deferred to v2 |
| AI/ML auto-approval or document classification | Manual review flow sufficient for v1; adds model dependency |
| Public API / third-party integrations | Not required for initial launch; adds surface area |
| Multi-language / internationalization | English-only for v1; defer if user base expands |
| OAuth / social login (Google, Microsoft) | Email/password sufficient; reduces SSO complexity for v1 |
| Real-time collaborative editing of applications | Complex operational concern; draft save covers v1 needs |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| UX-05 | Phase 1 | Pending |
| PERM-01 | Phase 2 | Pending |
| PERM-02 | Phase 2 | Pending |
| PERM-03 | Phase 2 | Pending |
| PERM-04 | Phase 2 | Pending |
| DOCS-01 | Phase 2 | Pending |
| DOCS-02 | Phase 2 | Pending |
| DOCS-03 | Phase 2 | Pending |
| DOCS-04 | Phase 2 | Pending |
| STAT-01 | Phase 2 | Pending |
| STAT-02 | Phase 2 | Pending |
| UX-01 | Phase 2 | Pending |
| UX-03 | Phase 2 | Pending |
| UX-04 | Phase 2 | Pending |
| PERM-05 | Phase 3 | Pending |
| PERM-06 | Phase 3 | Pending |
| DOCS-05 | Phase 3 | Pending |
| STAT-03 | Phase 3 | Pending |
| STAT-04 | Phase 3 | Pending |
| STAT-05 | Phase 3 | Pending |
| STAT-06 | Phase 3 | Pending |
| STAT-07 | Phase 3 | Pending |
| MSG-01 | Phase 3 | Pending |
| MSG-02 | Phase 3 | Pending |
| MSG-03 | Phase 3 | Pending |
| MSG-04 | Phase 3 | Pending |
| DASH-01 | Phase 4 | Pending |
| DASH-02 | Phase 4 | Pending |
| DASH-03 | Phase 4 | Pending |
| DASH-04 | Phase 4 | Pending |
| PERM-07 | Phase 5 | Pending |
| ADMN-01 | Phase 5 | Pending |
| ADMN-02 | Phase 5 | Pending |
| ADMN-03 | Phase 5 | Pending |
| UX-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-21*
*Last updated: 2026-07-21 after roadmap creation — all 40 v1 requirements mapped to phases*
