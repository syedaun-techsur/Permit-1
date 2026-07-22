# Roadmap: Permit Management System

## Overview

The Permit Management System is built across five phases. Phase 1 establishes a secure, beautifully designed foundation — auth, design system, and RBAC. Phase 2 delivers the complete applicant-facing experience: submitting applications, managing documents, and tracking status. Phase 3 brings in reviewers with the full workflow loop — review, decision, additional-info requests, and integrated messaging. Phase 4 gives all roles tailored dashboards that surface the right information at a glance. Phase 5 completes the platform with admin controls, system-wide visibility, and full accessibility compliance.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Secure authentication, design system, and role-based access control
- [ ] **Phase 2: Applicant Core** - Permit submission, document management, and status tracking for applicants
- [ ] **Phase 3: Review Workflow** - Reviewer tools, full lifecycle management, and integrated messaging
- [ ] **Phase 4: Dashboards** - Role-specific dashboards with visual progress indicators and activity feeds
- [ ] **Phase 5: Admin & Compliance** - Admin controls, system-wide visibility, and WCAG accessibility

## Phase Details

### Phase 1: Foundation
**Status**: In Progress
**Goal**: Users can securely access the system with the correct role, experiencing a premium-quality interface from first login
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, UX-05
**Success Criteria** (what must be TRUE):
  1. User can create an account with email/password and is assigned the correct role
  2. User can log in and remain authenticated across browser sessions, then log out from any page
  3. User can reset a forgotten password via an email link
  4. API layer enforces role-based access — unauthenticated or wrong-role requests are rejected
  5. The interface uses a custom design system (color tokens, typography, spacing, shadows) — nothing looks like a default template
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Docker Compose stack + NestJS scaffold + DB migrations + seed data
- [ ] 01-02-PLAN.md — NestJS auth module (register/login/refresh/logout/forgot/reset) + RBAC guards
- [ ] 01-03-PLAN.md — React design system (Tailwind tokens + 7 UI primitives + auth types)
- [ ] 01-04-PLAN.md — React auth pages + Zustand store + Axios JWT interceptors + protected routing

### Phase 2: Applicant Core
**Status**: executing
**Goal**: Applicants can submit a permit application, manage their supporting documents, and see their application's status on a visual lifecycle timeline
**Depends on**: Phase 1
**Requirements**: PERM-01, PERM-02, PERM-03, PERM-04, DOCS-01, DOCS-02, DOCS-03, DOCS-04, STAT-01, STAT-02, UX-01, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. Applicant can fill out and submit a permit application form, or save it as a draft to finish later
  2. Applicant can see a list of all their applications (submitted and draft) and open any for full detail
  3. Applicant can upload documents via drag-and-drop or file picker, preview them inline, and remove or replace them before submission — with immediate validation feedback on errors
  4. Applicant can view a visual lifecycle timeline showing the current stage (Draft → Submitted → Under Review → Additional Info Needed → Approved/Rejected) with timestamps for each past stage
  5. The interface renders correctly on desktop and mobile with no horizontal scroll at 375px viewport width on any applicant flow page (UX-01)
  6. Skeleton screens appear during page-level content loads — no full-page spinner shown to the user (UX-03)
  7. All interactive elements (buttons, inputs, links, cards) have distinct hover, focus, and active states with smooth transitions — no default browser-only styling (UX-04)
**Plans**: 6 plans

Plans:
- [ ] 02-01-PLAN.md — Phase 2 DB migration (5 tables) + TypeORM entities + permits API module (PERM-01/02/03/04, STAT-01)
- [ ] 02-02-PLAN.md — Documents module + MinIO/S3 presigned URL service (DOCS-01/02/03/04)
- [ ] 02-03-PLAN.md — Frontend types + API client + Zustand store + PermitListPage + PermitFormPage + auto-save (PERM-01/02/03, UX-03/04)
- [ ] 02-04-PLAN.md — Document upload UI (drag-drop zone, progress, preview, remove) + wired into PermitFormPage (DOCS-01/02/03/04)
- [ ] 02-05-PLAN.md — PermitStatusTimeline component + PermitDetailPage assembling all panels (PERM-04, STAT-02, UX-03)
- [ ] 02-06-PLAN.md — AppShell + NavBar responsive + notification badge + 375px E2E tests + interactive state tests (UX-01/03/04)

### Phase 3: Review Workflow
**Status**: executing
**Goal**: Reviewers can manage their assigned applications end-to-end — advancing, requesting information, deciding — while applicants and reviewers can communicate through an integrated messaging panel
**Depends on**: Phase 2
**Requirements**: PERM-05, PERM-06, DOCS-05, STAT-03, STAT-04, STAT-05, STAT-06, STAT-07, MSG-01, MSG-02, MSG-03, MSG-04
**Success Criteria** (what must be TRUE):
  1. Reviewer can see a list of all applications available for review and open any for full detail including all attached documents (with download)
  2. Reviewer can advance an application from Submitted → Under Review, request additional information (triggering an applicant notification), and the applicant can respond to re-submit for review
  3. Reviewer can approve or reject an application with a documented reason, closing out the lifecycle
  4. Applicant and reviewer can exchange messages on a permit application — messages show sender name, role, and timestamp; reviewer can attach documents or notes
  5. Applicant receives an in-app notification when their permit status changes; unread message counts appear on the permit list
**Plans**: 5 plans

Plans:
- [ ] 03-01-PLAN.md — Phase 3 DB migration (messages/message_reads/message_attachments) + lifecycle action endpoints (STAT-03/04/05/06) + notification wiring (STAT-07)
- [ ] 03-02-PLAN.md — Messages NestJS module (send/list/read/attachment) + notifications list/read endpoints + document archive endpoint (DOCS-05)
- [ ] 03-03-PLAN.md — Frontend messaging components (MessagePanel/MessageBubble/MessageComposer) + NotificationPanel + useMessages/useNotifications hooks + API clients
- [ ] 03-04-PLAN.md — ReviewQueuePage + ReviewDetailPage + ReviewerActionPanel + modals + applicant respond-to-info UI + routing (PERM-05/06, STAT-03/04/05/06)
- [ ] 03-05-PLAN.md — Playwright E2E: full lifecycle (approve + reject) + messaging cross-user + notification display + Phase 2 regression

### Phase 4: Dashboards
**Status**: awaiting verify
**Goal**: Every role lands on a dashboard that immediately surfaces their most important information — active permits, pending actions, status distribution, and unread messages
**Depends on**: Phase 3
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. Applicant dashboard shows a summary of active permits, recent status changes, and unread message counts at a glance
  2. Reviewer dashboard shows assigned applications sorted by status priority with pending actions and unread messages surfaced
  3. Admin dashboard shows system-wide statistics: total applications by status and reviewer workload
  4. A reviewer can identify the status distribution of their application queue from the dashboard page without opening any individual application; an applicant can see all active permit statuses and unread message counts without navigating away from their dashboard
**Plans**: 4 plans

Plans:
- [ ] 04-01-PLAN.md — NestJS dashboard module: GET /dashboard/applicant, /reviewer, /admin with SQL aggregates + supertest integration tests
- [ ] 04-02-PLAN.md — Frontend shared dashboard infrastructure: Recharts install, TypeScript types, API client, useDashboard hook (30s polling), StatCard + chart + table components
- [ ] 04-03-PLAN.md — ApplicantDashboard + ReviewerDashboard pages (replace stubs), DashboardPage role router, router wiring, Playwright E2E tests
- [ ] 04-04-PLAN.md — AdminDashboard page (new), Playwright E2E tests for admin dashboard

### Phase 5: Admin & Compliance
**Goal**: Admins have full control over users and assignments, system-wide permit visibility, and the entire interface is WCAG 2.1 AA compliant
**Depends on**: Phase 4
**Requirements**: PERM-07, ADMN-01, ADMN-02, ADMN-03, UX-02
**Success Criteria** (what must be TRUE):
  1. Admin can view all permit applications across all reviewers and applicants in a single list
  2. Admin can create, deactivate, and manage user accounts, and assign reviewers to permit applications
  3. Admin can view an audit log of all status changes and key actions across the system
  4. Every page passes WCAG 2.1 AA criteria: sufficient contrast ratios, full keyboard navigation, and meaningful screen-reader labels on all interactive elements
**Plans**: 3 plans

Plans:
- [ ] 05-01-PLAN.md — NestJS admin module extensions: all-permits endpoint (PERM-07), user CRUD (ADMN-01), audit log + CSV export (ADMN-03) + supertest integration tests
- [ ] 05-02-PLAN.md — Frontend admin pages (AdminApplicationsPage, UserManagementPage, AuditLogPage) + modals (AssignReviewerModal, CreateUserModal, DeactivateConfirmDialog) + admin API client + router wiring + Playwright E2E
- [ ] 05-03-PLAN.md — WCAG 2.1 AA compliance pass: @axe-core/playwright install, skip link, SessionExpiryWarning modal, aria-live toasts, Modal focus trap, Skeleton aria-busy + prefers-reduced-motion, PermitStatusTimeline aria-labels, DocumentUploadZone keyboard + checkA11y() compliance gate

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/? | Not started | - |
| 2. Applicant Core | 0/? | Not started | - |
| 3. Review Workflow | 0/? | Not started | - |
| 4. Dashboards | 0/? | Not started | - |
| 5. Admin & Compliance | 0/? | Not started | - |