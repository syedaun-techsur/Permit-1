# Requirements Traceability Matrix: Permit Management System

**Document Type:** Requirements Traceability Matrix (RTM)
**Project:** Permit Management System
**Acronym:** PMS
**Version:** 1.0
**Date:** 2026-07-21
**Status:** Draft

---

## Table of Contents

1. [Overview](#1-overview)
2. [Requirements Summary](#2-requirements-summary)
3. [Full Traceability Matrix](#3-full-traceability-matrix)
4. [Requirements Detail by Category](#4-requirements-detail-by-category)
5. [Test Coverage Matrix](#5-test-coverage-matrix)
6. [Journey & JTBD Coverage](#6-journey--jtbd-coverage)
7. [Change Management](#7-change-management)
8. [Approval](#8-approval)

---

## 1. Overview

This Requirements Traceability Matrix (RTM) provides bidirectional traceability across all specification artifacts for the Permit Management System v1. It links every one of the 40 v1 requirements — spanning authentication, permit applications, document management, status lifecycle, messaging, dashboards, admin controls, and UX quality — to their corresponding PRD feature, FRD functional specification, TechArch component, User Story, User Journey, Story Map entry, JTBD outcome, and roadmap delivery phase.

The RTM ensures that no requirement is implemented without a traceable business rationale, no user story exists without a requirement anchor, and no test case is written without a requirement reference. It serves as the single authoritative record for requirement coverage across all five delivery phases: Foundation, Applicant Core, Review Workflow, Dashboards, and Admin & Compliance.

Traceability in this matrix is bidirectional: starting from a requirement, a reader can forward-trace to every implementation artifact (feature, story, journey, test); starting from a user story or journey stage, a reader can backward-trace to the originating requirement and business need (JTBD outcome). Any requirement without complete forward-traces represents an implementation gap; any story or journey stage without backward-traces to a requirement represents scope that is unanchored and may indicate scope creep.

All 40 v1 requirements are mapped. Coverage is 100%. No requirement is unmapped, orphaned, or without a delivery phase assignment.

---

## 2. Requirements Summary

### Requirements by Category

- **Authentication & User Management (AUTH-01–05):** 5 requirements covering account registration, login and session persistence, logout, password reset, and API-layer role-based access control. All are Phase 1 (Foundation), Priority P0.

- **Permit Applications (PERM-01–07):** 7 requirements covering applicant application submission, draft save, application list view, application detail view, reviewer application list, reviewer detail view, and admin all-applications view. Phases 2–5, Priority P0–P1.

- **Document Management (DOCS-01–05):** 5 requirements covering drag-and-drop upload, file validation and feedback, inline document preview, remove/replace before submission, and reviewer document download. Phases 2–3, Priority P0.

- **Status Tracking & Lifecycle (STAT-01–07):** 7 requirements covering the defined lifecycle state machine, visual lifecycle timeline, reviewer advances to Under Review, reviewer requests additional info, applicant responds to info request, reviewer approves/rejects with reason, and in-app notification on status change. Phases 2–3, Priority P0.

- **Messaging & Communication (MSG-01–04):** 4 requirements covering the integrated messaging panel, message metadata display, unread message counts, and reviewer document/note attachment to messages. Phase 3, Priority P1.

- **Dashboard & Navigation (DASH-01–04):** 4 requirements covering the applicant dashboard, reviewer dashboard, admin dashboard, and visual progress indicators across all dashboards. Phase 4, Priority P1.

- **Admin & Configuration (ADMN-01–03):** 3 requirements covering admin user account management, reviewer assignment, and audit log access. Phase 5, Priority P1.

- **UI / UX Quality (UX-01–05):** 5 requirements covering responsive design, WCAG 2.1 AA accessibility, skeleton screens, micro-interactions, and custom design token system. Phases 1–5, Priority P0.

### Coverage Summary

| Category | Count | Phases | Priority |
|---|---|---|---|
| Authentication & User Management | 5 | Phase 1 | P0 |
| Permit Applications | 7 | Phases 2, 3, 5 | P0–P1 |
| Document Management | 5 | Phases 2–3 | P0 |
| Status Tracking & Lifecycle | 7 | Phases 2–3 | P0 |
| Messaging & Communication | 4 | Phase 3 | P1 |
| Dashboard & Navigation | 4 | Phase 4 | P1 |
| Admin & Configuration | 3 | Phase 5 | P1 |
| UI / UX Quality | 5 | Phases 1, 2, 5 | P0 |
| **Total** | **40** | **Phases 1–5** | **P0–P1** |

---

## 3. Full Traceability Matrix

The primary traceability table maps every v1 requirement to all specification artifacts.

**Column Key:**
- **Req ID** — Requirement identifier from REQUIREMENTS.md
- **PRD Feature** — Feature reference from PRD-PermitManagementSystem.md
- **FRD Spec** — Functional requirement chunk from FRD-PermitManagementSystem.md
- **TechArch Component** — Relevant backend module or frontend component from TechArch-PermitManagementSystem.md
- **User Story** — Story ID from UserStories-PermitManagementSystem.md
- **Journey Ref** — Journey ID and stage from Journeys-PermitManagementSystem.md
- **JTBD** — Jobs-to-be-Done reference from JTBD-PermitManagementSystem.md
- **Story Map** — SM-ID from StoryMap-PermitManagementSystem.md
- **Roadmap Phase** — Delivery phase from ROADMAP.md
- **Priority** — P0 (critical/MVP gate) or P1 (high value, included in v1)

### 3.1 Authentication & User Management

| Req ID | PRD Feature | FRD Spec | TechArch Component | User Story | Journey Ref | JTBD | Story Map | Roadmap Phase | Priority |
|---|---|---|---|---|---|---|---|---|---|
| AUTH-01 | F0: Authentication & User Management | F00: AUTH-01 Account Registration | `AuthModule` / `auth.controller.ts` / `RegisterPage.tsx` / `users` table | US-0.1: Create an Account | JRN-01.1: Register / JRN-03.1: Provision New Account | JTBD-01.1, JTBD-03.1 | SM-0.1 | Phase 1: Foundation | P0 |
| AUTH-02 | F0: Authentication & User Management | F00: AUTH-02 Login & Session Persistence | `AuthModule` / `jwt.strategy.ts` / `LoginPage.tsx` / `auth.store.ts` | US-0.2: Log In and Maintain Session | JRN-01.1: Register / JRN-02.1: Login & Land / JRN-03.1: Login to Admin Panel | JTBD-01.1, JTBD-02.1, JTBD-03.1 | SM-0.2 | Phase 1: Foundation | P0 |
| AUTH-03 | F0: Authentication & User Management | F00: AUTH-03 Logout | `AuthModule` / `auth.service.ts` / `TopBar.tsx` (user menu) | US-0.3: Log Out | JRN-03.1: Deactivate Departed Account (logout adjacency) | JTBD-03.1 | SM-0.3 | Phase 1: Foundation | P0 |
| AUTH-04 | F0: Authentication & User Management | F00: AUTH-04 Password Reset | `AuthModule` / `password_reset_tokens` table / `ResetPasswordPage.tsx` | US-0.4: Reset Forgotten Password | JRN-01.1: Register | JTBD-01.1 | SM-0.4 | Phase 1: Foundation | P0 |
| AUTH-05 | F0: Authentication & User Management | F00: AUTH-05 RBAC Enforcement | `jwt-auth.guard.ts` / `roles.guard.ts` / `roles.decorator.ts` / `RoleGuard.tsx` / `ProtectedRoute.tsx` | US-0.5: Role-Based Access Control Enforcement | JRN-03.1: Login to Admin Panel / JRN-03.2: Spot-Check Access Controls | JTBD-03.1, JTBD-03.4 | SM-0.5 | Phase 1: Foundation | P0 |

### 3.2 Permit Applications

| Req ID | PRD Feature | FRD Spec | TechArch Component | User Story | Journey Ref | JTBD | Story Map | Roadmap Phase | Priority |
|---|---|---|---|---|---|---|---|---|---|
| PERM-01 | F2: Permit Application Submission | F02: PERM-01 Application Submission | `PermitsModule` / `permits.controller.ts` / `PermitFormPage.tsx` / `permit_applications` table | US-2.1: Submit a New Permit Application | JRN-01.1: Start Application / JRN-01.1: Submit & Confirm | JTBD-01.1 | SM-2.1 | Phase 2: Applicant Core | P0 |
| PERM-02 | F2: Permit Application Submission | F02: PERM-02 Draft Save | `PermitsModule` / `permits.service.ts` / `PermitFormPage.tsx` / `permit_applications` table | US-2.2: Save Application as Draft | JRN-01.1: Start Application | JTBD-01.1 | SM-2.2 | Phase 2: Applicant Core | P0 |
| PERM-03 | F2: Permit Application Submission | F02: PERM-03 Application List View | `PermitsModule` / `permits.controller.ts` / `PermitListPage.tsx` / `PermitCard.tsx` | US-2.3: View My Application List | JRN-01.2: Morning Check | JTBD-01.2 | SM-2.3 | Phase 2: Applicant Core | P0 |
| PERM-04 | F2: Permit Application Submission | F02: PERM-04 Application Detail View | `PermitsModule` / `PermitDetailPage.tsx` / `permit_applications` table | US-2.4: View Full Application Detail | JRN-01.2: Spot the Alert / JRN-01.2: Receive Approval | JTBD-01.2 | SM-2.4 | Phase 2: Applicant Core | P0 |
| PERM-05 | F6: Reviewer Workflow | F06: PERM-05 Reviewer Application List | `PermitsModule` / `permits.controller.ts` (reviewer role scope) / `PermitListPage.tsx` (reviewer view) | US-6.1: View Assigned Application Queue | JRN-02.1: Read the Buckets / JRN-02.1: Sequence the Day | JTBD-02.1 | SM-6.1 | Phase 3: Review Workflow | P0 |
| PERM-06 | F6: Reviewer Workflow | F06: PERM-06 Reviewer Detail View | `PermitsModule` / `PermitDetailPage.tsx` (reviewer view) / `PermitActionPanel.tsx` | US-6.2: View Full Application Detail as Reviewer | JRN-02.2: Open Application / JRN-02.2: Complete Review | JTBD-02.2 | SM-6.2 | Phase 3: Review Workflow | P0 |
| PERM-07 | F8: Admin Controls | F08: PERM-07 Admin All-Applications View | `AdminModule` / `admin.controller.ts` / `UserManagementPage.tsx` (all-apps view) / `permit_applications` table | US-8.1: Admin Views All Permit Applications System-Wide | JRN-03.2: View Workload Distribution / JRN-03.2: Bulk Reassign Applications | JTBD-03.2 | SM-8.1 | Phase 5: Admin & Compliance | P1 |

### 3.3 Document Management

| Req ID | PRD Feature | FRD Spec | TechArch Component | User Story | Journey Ref | JTBD | Story Map | Roadmap Phase | Priority |
|---|---|---|---|---|---|---|---|---|---|
| DOCS-01 | F3: Document Management | F03: DOCS-01 Document Upload | `DocumentsModule` / `documents.controller.ts` / `s3.service.ts` / `DocumentUploadZone.tsx` / `documents` table | US-3.1: Upload Documents via Drag-and-Drop | JRN-01.1: Upload Documents / JRN-01.2: Upload Replacement | JTBD-01.3 | SM-3.1 | Phase 2: Applicant Core | P0 |
| DOCS-02 | F3: Document Management | F03: DOCS-02 File Validation & Feedback | `DocumentsModule` / `documents.service.ts` / `DocumentUploadZone.tsx` / `UploadProgress.tsx` | US-3.2: Receive Immediate File Validation Feedback | JRN-01.1: Upload Documents | JTBD-01.3 | SM-3.2 | Phase 2: Applicant Core | P0 |
| DOCS-03 | F3: Document Management | F03: DOCS-03 Inline Document Preview | `DocumentsModule` / `documents.controller.ts` (presigned URL) / `DocumentPreview.tsx` | US-3.3: Preview Uploaded Documents Inline | JRN-01.1: Upload Documents / JRN-02.2: Review Documents | JTBD-01.3 | SM-3.3 | Phase 2: Applicant Core | P0 |
| DOCS-04 | F3: Document Management | F03: DOCS-04 Remove or Replace Documents | `DocumentsModule` / `documents.controller.ts` (DELETE) / `DocumentList.tsx` | US-3.4: Remove or Replace Documents Before Submission | JRN-01.2: Upload Replacement | JTBD-01.3 | SM-3.4 | Phase 2: Applicant Core | P0 |
| DOCS-05 | F3: Document Management / F6: Reviewer Workflow | F03: DOCS-05 Reviewer View & Download | `DocumentsModule` / `s3.service.ts` (download URL) / `DocumentList.tsx` (reviewer view) | US-3.5: Reviewer Views and Downloads Application Documents | JRN-02.2: Review Documents | JTBD-02.2 | SM-3.5 | Phase 3: Review Workflow | P0 |

### 3.4 Status Tracking & Lifecycle

| Req ID | PRD Feature | FRD Spec | TechArch Component | User Story | Journey Ref | JTBD | Story Map | Roadmap Phase | Priority |
|---|---|---|---|---|---|---|---|---|---|
| STAT-01 | F4: Permit Status Tracking & Lifecycle | F04: STAT-01 Lifecycle Stages & Transition Rules | `PermitsModule` / `permit-lifecycle.service.ts` / `permit_status.enum.ts` / `permit_status_history` table | US-4.1: Lifecycle Stages Are Defined and Enforced | JRN-02.2: Open Application / JRN-03.2: Pull Application Audit Log | JTBD-01.2, JTBD-02.2 | SM-4.1 | Phase 2: Applicant Core | P0 |
| STAT-02 | F4: Permit Status Tracking & Lifecycle | F04: STAT-02 Visual Lifecycle Timeline | `PermitsModule` / `PermitStatusTimeline.tsx` / `PermitStatusBadge.tsx` | US-4.2: View Visual Lifecycle Timeline | JRN-01.2: Morning Check / JRN-01.2: Await & Track | JTBD-01.2 | SM-4.2 | Phase 2: Applicant Core | P0 |
| STAT-03 | F4: Permit Status Tracking & Lifecycle / F6: Reviewer Workflow | F04: STAT-03 Reviewer Advance to Under Review | `PermitsModule` / `permits.controller.ts` (`POST /permits/:id/begin-review`) / `PermitActionPanel.tsx` | US-4.3: Reviewer Advances Application to Under Review | JRN-02.2: Open Application / JRN-02.1: Open First Application | JTBD-02.2 | SM-4.3 | Phase 3: Review Workflow | P0 |
| STAT-04 | F4: Permit Status Tracking & Lifecycle / F6: Reviewer Workflow | F04: STAT-04 Reviewer Request Additional Info | `PermitsModule` / `permits.controller.ts` (`POST /permits/:id/request-info`) / `PermitActionPanel.tsx` | US-4.4: Reviewer Requests Additional Information | JRN-02.2: Send Info Request | JTBD-02.3 | SM-4.4 | Phase 3: Review Workflow | P0 |
| STAT-05 | F4: Permit Status Tracking & Lifecycle | F04: STAT-05 Applicant Respond to Info Request | `PermitsModule` / `permits.controller.ts` (`POST /permits/:id/resubmit`) / `PermitDetailPage.tsx` (info request panel) | US-4.5: Applicant Responds to Additional Information Request | JRN-01.2: Upload Replacement / JRN-02.2: Await Applicant Response | JTBD-01.3 | SM-4.5 | Phase 3: Review Workflow | P0 |
| STAT-06 | F4: Permit Status Tracking & Lifecycle / F6: Reviewer Workflow | F04: STAT-06 Reviewer Approve or Reject | `PermitsModule` / `permits.controller.ts` (`POST /permits/:id/approve`, `POST /permits/:id/reject`) / `PermitActionPanel.tsx` | US-4.6: Reviewer Approves or Rejects Application | JRN-02.2: Approve with Rationale | JTBD-02.2 | SM-4.6 | Phase 3: Review Workflow | P0 |
| STAT-07 | F4: Permit Status Tracking & Lifecycle | F04: STAT-07 In-App Notification on Status Change | `NotificationsModule` / `notifications.service.ts` / `NotificationBadge.tsx` / `notifications.store.ts` / `notifications` table | US-4.7: Receive In-App Notification on Status Change | JRN-01.2: Receive Approval / JRN-02.2: Await Applicant Response | JTBD-01.2, JTBD-02.4 | SM-4.7 | Phase 3: Review Workflow | P0 |

### 3.5 Messaging & Communication

| Req ID | PRD Feature | FRD Spec | TechArch Component | User Story | Journey Ref | JTBD | Story Map | Roadmap Phase | Priority |
|---|---|---|---|---|---|---|---|---|---|
| MSG-01 | F5: Integrated Messaging | F05: MSG-01 Messaging Panel | `MessagesModule` / `messages.controller.ts` / `MessagePanel.tsx` / `messages` table | US-5.1: Exchange Messages on a Permit Application | JRN-01.2: Message the Reviewer / JRN-02.2: Send Info Request | JTBD-01.4, JTBD-02.3 | SM-5.1 | Phase 3: Review Workflow | P1 |
| MSG-02 | F5: Integrated Messaging | F05: MSG-02 Message Metadata | `MessagesModule` / `messages.service.ts` / `MessageBubble.tsx` | US-5.2: View Message Sender Identity and Timestamp | JRN-01.2: Message the Reviewer | JTBD-01.4 | SM-5.2 | Phase 3: Review Workflow | P1 |
| MSG-03 | F5: Integrated Messaging | F05: MSG-03 Unread Message Counts | `MessagesModule` / `messages.service.ts` (unread counts) / `NotificationBadge.tsx` / `PermitCard.tsx` | US-5.3: See Unread Message Counts on Application List and Dashboard | JRN-01.2: Message the Reviewer / JRN-02.1: Catch Overnight Responses | JTBD-01.4, JTBD-02.4 | SM-5.3 | Phase 3: Review Workflow | P1 |
| MSG-04 | F5: Integrated Messaging | F05: MSG-04 Reviewer Attach Documents/Notes | `MessagesModule` / `DocumentsModule` / `MessageComposer.tsx` / `message_attachments` table | US-5.4: Reviewer Attaches Documents or Notes to a Message | JRN-02.2: Send Info Request | JTBD-02.3 | SM-5.4 | Phase 3: Review Workflow | P1 |

### 3.6 Dashboard & Navigation

| Req ID | PRD Feature | FRD Spec | TechArch Component | User Story | Journey Ref | JTBD | Story Map | Roadmap Phase | Priority |
|---|---|---|---|---|---|---|---|---|---|
| DASH-01 | F7: Role-Specific Dashboards | F07: DASH-01 Applicant Dashboard | `ApplicantDashboard.tsx` / `StatCard.tsx` / `ActivityFeed.tsx` / `permits.store.ts` | US-7.1: Applicant Views Their Dashboard | JRN-01.2: Morning Check / JRN-01.2: Await & Track | JTBD-01.2, JTBD-01.4 | SM-7.1 | Phase 4: Dashboards | P1 |
| DASH-02 | F7: Role-Specific Dashboards | F07: DASH-02 Reviewer Dashboard | `ReviewerDashboard.tsx` / `StatCard.tsx` / `StatusChart.tsx` / `notifications.store.ts` | US-7.2: Reviewer Views Their Dashboard | JRN-02.1: Login & Land / JRN-02.1: Read the Buckets | JTBD-02.1, JTBD-02.4 | SM-7.2 | Phase 4: Dashboards | P1 |
| DASH-03 | F7: Role-Specific Dashboards | F07: DASH-03 Admin Dashboard | `AdminDashboard.tsx` / `StatCard.tsx` / `StatusChart.tsx` / `AdminModule` | US-7.3: Admin Views System-Wide Dashboard | JRN-03.2: View Workload Distribution | JTBD-03.2, JTBD-03.4 | SM-7.3 | Phase 4: Dashboards | P1 |
| DASH-04 | F7: Role-Specific Dashboards | F07: DASH-04 Visual Progress Indicators | `StatusChart.tsx` / `ActivityFeed.tsx` / all dashboard pages | US-7.4: Dashboards Include Visual Progress Indicators | JRN-02.1: Catch Overnight Responses | JTBD-02.4 | SM-7.4 | Phase 4: Dashboards | P1 |

### 3.7 Admin & Configuration

| Req ID | PRD Feature | FRD Spec | TechArch Component | User Story | Journey Ref | JTBD | Story Map | Roadmap Phase | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ADMN-01 | F8: Admin Controls | F08: ADMN-01 User Account Management | `AdminModule` / `UsersModule` / `UserManagementPage.tsx` / `users` table | US-8.2: Admin Creates and Manages User Accounts | JRN-03.1: Deactivate Departed Account / JRN-03.1: Provision New Account | JTBD-03.1 | SM-8.2 | Phase 5: Admin & Compliance | P1 |
| ADMN-02 | F8: Admin Controls | F08: ADMN-02 Reviewer Assignment | `AdminModule` / `admin.controller.ts` / `admin.service.ts` / `permit_applications` table (`reviewer_id`) | US-8.3: Admin Assigns Reviewers to Applications | JRN-03.1: First Application Assignment / JRN-03.2: Bulk Reassign Applications | JTBD-03.2 | SM-8.3 | Phase 5: Admin & Compliance | P1 |
| ADMN-03 | F8: Admin Controls | F08: ADMN-03 Audit Log | `AuditModule` / `audit.service.ts` / `AuditLogPage.tsx` / `audit_logs` table | US-8.4: Admin Views Audit Log | JRN-03.1: Verify in Audit Log / JRN-03.2: Pull Application Audit Log / JRN-03.2: Export and Share | JTBD-03.3 | SM-8.4 | Phase 5: Admin & Compliance | P1 |

### 3.8 UI / UX Quality

| Req ID | PRD Feature | FRD Spec | TechArch Component | User Story | Journey Ref | JTBD | Story Map | Roadmap Phase | Priority |
|---|---|---|---|---|---|---|---|---|---|
| UX-01 | F9: Accessibility & Responsive Design | F09: UX-01 Responsive Design | All pages (responsive CSS) / Tailwind responsive utilities / `globals.css` | US-9.1: Use the Platform on Desktop and Mobile Devices | JRN-01.2: Upload Replacement (mobile) / JRN-02.1: Login & Land (desktop) | JTBD-01.3, JTBD-02.1 | SM-9.1 | Phase 2 → Phase 5 | P0 |
| UX-02 | F9: Accessibility & Responsive Design | F09: UX-02 WCAG 2.1 AA Accessibility | All pages (semantic HTML, ARIA) / axe-core CI checks / `globals.css` | US-9.2: Access the Platform With Assistive Technologies | JRN-01.2: Morning Check (mobile accessibility) | JTBD-01.2 | SM-9.2 | Phase 2 → Phase 5 | P0 |
| UX-03 | F1: Design System & UI Foundation | F01: UX-03 Skeleton Screen Loading States | `Skeleton/` component / all page-level loading states / `PermitListPage.tsx`, `PermitDetailPage.tsx`, dashboards | US-1.2: See Skeleton Screens During Page-Level Loads | JRN-02.1: Login & Land (speed expectation) | JTBD-02.1 | SM-1.2 | Phase 1: Foundation | P0 |
| UX-04 | F1: Design System & UI Foundation | F01: UX-04 Interactive Element States | `Button/`, `Input/`, all interactive components / `tailwind.config.ts` (transition tokens) | US-1.3: Experience Smooth Micro-Interactions on Interactive Elements | JRN-01.1: Discover | JTBD-01.1 | SM-1.3 | Phase 1: Foundation | P0 |
| UX-05 | F1: Design System & UI Foundation | F01: UX-05 Custom Design Token System | `tailwind.config.ts` / `globals.css` / design token spec (color, typography, spacing, shadow, radius) | US-1.1: Experience a Custom Visual Design (Not a Default Template) | JRN-01.1: Discover | JTBD-01.1 | SM-1.1 | Phase 1: Foundation | P0 |

---

## 4. Requirements Detail by Category

### 4.1 Authentication & User Management (F0 / Phase 1)

- **AUTH-01** — Account Registration: User self-registers with email, password, and full name. System creates account with `role = 'applicant'`, issues JWT + refresh token, redirects to dashboard. Admin-assigned roles (reviewer, admin) are provisioned through ADMN-01. → *PRD F0 · FRD F00 · US-0.1 · SM-0.1*

- **AUTH-02** — Login & Session Persistence: User authenticates with email and password. Access token (15-min) + HTTP-only refresh cookie (7-day sliding). Silent refresh on token expiry. Role-appropriate dashboard redirect. → *PRD F0 · FRD F00 · US-0.2 · SM-0.2*

- **AUTH-03** — Logout: "Log Out" accessible from every page via nav header. Revokes refresh token server-side, clears cookie, clears in-memory token, redirects to `/login`. Back-button does not restore session. → *PRD F0 · FRD F00 · US-0.3 · SM-0.3*

- **AUTH-04** — Password Reset: Time-limited (1-hour), single-use token sent to email. Token stored as hashed value. On use: updates password hash, revokes all refresh tokens, redirects to login. Enumeration-safe (always returns 200 on request). → *PRD F0 · FRD F00 · US-0.4 · SM-0.4*

- **AUTH-05** — RBAC Enforcement: Every protected API endpoint enforces role via `JwtAuthGuard` + `RolesGuard`. Returns 401 (no token / invalid token) or 403 (insufficient role). Applicants cannot access reviewer/admin endpoints. Frontend `RoleGuard` provides UX-layer enforcement; API is the security gate. → *PRD F0 · FRD F00 · US-0.5 · SM-0.5*

### 4.2 Permit Applications (F2, F6, F8 / Phases 2–5)

- **PERM-01** — Submit New Application: Structured form with required fields (permit type, project description, site address, contact details). Auto-save (2s debounce). Inline field validation on blur. On submit: status → `submitted`, audit log entry, lifecycle stage entry, confirmation redirect. At least one document must be attached. → *PRD F2 · FRD F02 · US-2.1 · SM-2.1*

- **PERM-02** — Draft Save: Draft created on application start. Auto-save triggers on every field change (2s debounce). Explicit "Save Draft" button always visible. Failed auto-save retries 3× with exponential backoff then shows warning toast. `localStorage` fallback for session-expiry edge case. → *PRD F2 · FRD F02 · US-2.2 · SM-2.2*

- **PERM-03** — Application List (Applicant): Paginated list of own applications (submitted + draft) ordered by `updated_at DESC`. Each card shows: ID, permit type, site address summary, status badge, last-updated timestamp, unread message count. Filterable by status. Skeleton screen on load. → *PRD F2 · FRD F02 · US-2.3 · SM-2.3*

- **PERM-04** — Application Detail (Applicant): Single-page view with all form data (read-only post-submit), lifecycle timeline, document panel, messaging panel, and info request panel (when `additional_info_needed`). Parallel data fetches. Skeleton screen during load. → *PRD F2 · FRD F02 · US-2.4 · SM-2.4*

- **PERM-05** — Reviewer Application List: All applications in reviewer's queue (assigned + available pool). Sortable by status priority, submission date, last-updated. Filterable by status. Unread message badge per row. Applications with applicant responses surfaced to top. → *PRD F6 · FRD F06 · US-6.1 · SM-6.1*

- **PERM-06** — Reviewer Application Detail: Same single-page view as PERM-04 plus: all reviewer action controls (`PermitActionPanel`), full document panel with download, messaging thread. Contextual actions (Begin Review / Request Info / Approve / Reject) based on current status. → *PRD F6 · FRD F06 · US-6.2 · SM-6.2*

- **PERM-07** — Admin All-Applications View: Paginated list of every application in the system regardless of applicant or reviewer. Filter by status, reviewer, permit type, date range. Sort by submission date, last-updated, status. Navigable to any application's full detail. → *PRD F8 · FRD F08 · US-8.1 · SM-8.1*

### 4.3 Document Management (F3 / Phases 2–3)

- **DOCS-01** — Document Upload: Drag-and-drop zone + click-to-browse fallback. Multi-file select. Two-phase upload: presigned PUT URL → direct S3 PUT → confirm to API. Progress indicator per file. Immediate list update without page refresh. Keyboard accessible (Tab + Enter/Space). → *PRD F3 · FRD F03 · US-3.1 · SM-3.1*

- **DOCS-02** — File Validation & Feedback: Client-side validation before any network request: MIME type (PDF, JPEG, PNG, DOCX), file size (≤25MB), total storage (≤100MB), max count (20 files). Inline error per file; valid files in batch proceed. Server repeats all checks authoritatively. Progress states: Queued → Uploading (%) → Uploaded ✓ / Error ✗. → *PRD F3 · FRD F03 · US-3.2 · SM-3.2*

- **DOCS-03** — Inline Preview: JPEG/PNG: thumbnail in document list, full-size lightbox on click. PDF: embedded viewer (native browser / react-pdf). DOCX: filename + generic icon + download button. Presigned download URL (15-min expiry) fetched on preview request. Accessible (keyboard, Escape to close). → *PRD F3 · FRD F03 · US-3.3 · SM-3.3*

- **DOCS-04** — Remove or Replace: Only available when status is `draft` or `additional_info_needed`. Remove: confirmation prompt → soft-delete in DB → schedule S3 deletion (24h delay) → audit log. Replace: remove old (marked `superseded`, not deleted) → upload new via DOCS-01 flow. → *PRD F3 · FRD F03 · US-3.4 · SM-3.4*

- **DOCS-05** — Reviewer Download: Reviewer sees full document panel on application detail. Each document shows: filename, type, size, uploader name, upload date, "Download" button. Download: presigned GET URL (15-min). Bulk "Download All": server-side ZIP generation (`GET /permits/:id/documents/archive`). Audit log entry per download. → *PRD F3/F6 · FRD F03 · US-3.5 · SM-3.5*

### 4.4 Status Tracking & Lifecycle (F4 / Phases 2–3)

- **STAT-01** — Lifecycle Stages & Transitions: Valid states: `draft → submitted → under_review → additional_info_needed → approved / rejected`. State machine enforced in `PermitLifecycleService`. Every transition: validates current state, validates actor role, validates required inputs, updates `permit_applications.status`, creates `permit_status_history` entry (immutable), creates audit log entry. Invalid transitions: 409 `INVALID_STATUS_TRANSITION`. → *PRD F4 · FRD F04 · US-4.1 · SM-4.1*

- **STAT-02** — Visual Timeline: `PermitStatusTimeline.tsx` stepper component on application detail page. Current stage highlighted. Past stages show entered-at timestamp. Future stages muted. Rejected: rejected stage marked; approved stage shown as unreached. Mobile-responsive (stacks/scrolls). Screen-reader accessible (stage name + status + timestamp per entry). → *PRD F4 · FRD F04 · US-4.2 · SM-4.2*

- **STAT-03** — Reviewer: Begin Review: `POST /permits/:id/begin-review` (role: reviewer). Transitions `submitted → under_review`. Reviewer sees "Begin Review" button only when status is `submitted`. Success toast to reviewer. Applicant in-app notification within 5 seconds. Audit log entry. → *PRD F4/F6 · FRD F04 · US-4.3 · SM-4.3*

- **STAT-04** — Reviewer: Request Additional Info: `POST /permits/:id/request-info` (role: reviewer). Requires mandatory note text. Transitions `under_review → additional_info_needed`. Note stored in `permit_status_history`. Note also posted to messaging thread (MSG-01). Applicant in-app notification. Audit log entry. → *PRD F4/F6 · FRD F04 · US-4.4 · SM-4.4*

- **STAT-05** — Applicant: Respond to Info Request: `POST /permits/:id/resubmit` (role: applicant). Available when status is `additional_info_needed`. Applicant uploads new documents via DOCS-01 flow, then clicks "Re-Submit for Review". Transitions `additional_info_needed → under_review`. Reviewer in-app notification. Audit log entry. → *PRD F4 · FRD F04 · US-4.5 · SM-4.5*

- **STAT-06** — Reviewer: Approve or Reject: `POST /permits/:id/approve` or `POST /permits/:id/reject` (role: reviewer). Both require mandatory reason text. Confirmation dialog before execution. Transitions `under_review → approved` or `under_review → rejected` (terminal states). Decision reason stored on application (`decision_reason`). Applicant in-app notification within 5 seconds. Audit log entry with actor, reason, timestamp. → *PRD F4/F6 · FRD F04 · US-4.6 · SM-4.6*

- **STAT-07** — In-App Notification: `NotificationsModule` creates notification on every status transition. Polling: 10-second interval on all pages (`GET /notifications/unread`). Bell icon with unread count in `TopBar.tsx`. Each notification: application ID, new status, timestamp, link to application detail. Persists across sessions. Marks read on click. → *PRD F4 · FRD F04 · US-4.7 · SM-4.7*

### 4.5 Messaging & Communication (F5 / Phase 3)

- **MSG-01** — Integrated Messaging Panel: `MessagePanel.tsx` on application detail page for both applicant and reviewer. Text input + Send button (Enter or click). New messages appear within 2 seconds (polling on open detail page). Chronological thread (newest at bottom). Empty state: "No messages yet. Start the conversation." Accessible at all lifecycle stages. → *PRD F5 · FRD F05 · US-5.1 · SM-5.1*

- **MSG-02** — Message Metadata: Each `MessageBubble.tsx` displays: sender full name, role badge (Applicant / Reviewer — color-coded per design system), ISO timestamp (human-readable display; ISO on hover). Sent messages aligned right, received left. Sender identity resolved server-side from JWT; cannot be spoofed. → *PRD F5 · FRD F05 · US-5.2 · SM-5.2*

- **MSG-03** — Unread Message Counts: Per-user unread tracking via `messages.is_read_by_applicant` / `messages.is_read_by_reviewer` columns. Unread badge on application list rows (PERM-03) and dashboard cards (DASH-01, DASH-02). Opening messaging panel marks all as read and clears badge. Unread counts update within 30 seconds via polling. → *PRD F5 · FRD F05 · US-5.3 · SM-5.3*

- **MSG-04** — Reviewer: Attach Documents/Notes: `MessageComposer.tsx` includes attachment control (reviewer only). Accepted types and size limits mirror DOCS-01. Files uploaded via presigned URL flow, then linked in `message_attachments` table. Attached files appear as downloadable links in `MessageBubble.tsx`. Applicant can view and download. Validation errors shown inline in composer. → *PRD F5 · FRD F05 · US-5.4 · SM-5.4*

### 4.6 Dashboard & Navigation (F7 / Phase 4)

- **DASH-01** — Applicant Dashboard: `ApplicantDashboard.tsx`. Summary `StatCard` tiles: active application count, applications with pending action (Additional Info Needed), total unread messages. Recent applications list (last 5) with status badges, permit types, last-activity timestamps. Action-required applications visually highlighted ("Action Required" badge). "Start New Application" quick-action. At least one visual indicator (status distribution or activity feed). Data staleness ≤30 seconds. → *PRD F7 · FRD F07 · US-7.1 · SM-7.1*

- **DASH-02** — Reviewer Dashboard: `ReviewerDashboard.tsx`. Application queue sorted by action-priority: Additional Info Needed (applicant responded) → Submitted → Under Review. Each row: permit type, applicant name, status, last-updated, unread message count. "X applications need your action today" summary count. At least one visual indicator (donut chart by status or activity feed). Data staleness ≤30 seconds. → *PRD F7 · FRD F07 · US-7.2 · SM-7.2*

- **DASH-03** — Admin Dashboard: `AdminDashboard.tsx`. System-wide application counts by status (chart + table). Reviewer workload table: name, application count, pending action count per reviewer. Recent system activity feed (status changes, user provisioning, assignments). Direct navigation from workload section to any reviewer's queue. Data staleness ≤30 seconds. → *PRD F7 · FRD F07 · US-7.3 · SM-7.3*

- **DASH-04** — Visual Progress Indicators: Every role dashboard includes at least one chart or visual widget. Design system status colors used consistently (`color.status.*` tokens). Charts readable without legend interaction. Accessible: text alternatives or ARIA labels for screen readers. Data ≤30 seconds stale. → *PRD F7 · FRD F07 · US-7.4 · SM-7.4*

### 4.7 Admin & Configuration (F8 / Phase 5)

- **ADMN-01** — User Account Management: `UserManagementPage.tsx`. User table with: name, email, role, status (Active/Deactivated), created-at. "Create User" form: full name, email, role (mandatory). Auto-generated welcome email with password-set link. "Deactivate": immediately revokes all session tokens (no grace period). Reactivation available. Role changes take effect on next API call. All actions in audit log. → *PRD F8 · FRD F08 · US-8.2 · SM-8.2*

- **ADMN-02** — Reviewer Assignment: `admin.controller.ts` + application detail (admin view). "Assign Reviewer" control on application detail and admin all-apps list. Bulk selection + assign to reviewer in one action. Newly assigned reviewer receives in-app notification. Previously assigned reviewer notified of reassignment. Assignment change reflected immediately in reviewer queue. All assignments in audit log. → *PRD F8 · FRD F08 · US-8.3 · SM-8.3*

- **ADMN-03** — Audit Log: `AuditLogPage.tsx` + `audit_logs` table (append-only; no UPDATE or DELETE). Reverse-chronological display. Each entry: actor name + role, action type, application ID (where applicable), target user (for user management actions), ISO timestamp. Covers: all status transitions, document uploads, messages sent, account creation/deactivation, role changes, reviewer assignments, unauthorized access attempts. Filterable by date range, actor, action type, application ID. Searchable. Exportable as CSV. Read-only. → *PRD F8 · FRD F08 · US-8.4 · SM-8.4*

### 4.8 UI / UX Quality (F1, F9 / Phases 1–5)

- **UX-01** — Responsive Design: All views fully functional at 375px to 1440px+. Navigation collapses on mobile (hamburger/collapsible). Drag-and-drop degrades to tap-to-browse on touch devices. Tables reflow to card layouts on small screens. Touch targets ≥44×44px. Verified on iOS Safari and Android Chrome. → *PRD F9 · FRD F09 · US-9.1 · SM-9.1*

- **UX-02** — WCAG 2.1 AA Accessibility: All interactive elements keyboard-reachable and operable (Tab, Enter, Space, Arrow keys). No focus traps except within open modals. Visible styled focus indicators (not suppressed). Meaningful alt text + ARIA labels. Form fields: associated `<label>` elements, errors via `aria-describedby`. ARIA live regions for status updates. Lifecycle timeline stages: name + status + timestamp for screen readers. Color contrast ≥4.5:1 (normal text), ≥3:1 (large text/UI components). Zero critical axe-core violations in CI. → *PRD F9 · FRD F09 · US-9.2 · SM-9.2*

- **UX-03** — Skeleton Screens: Page-level content loads (route navigation, initial load) render skeleton immediately matching the exact layout dimensions. Shimmer animation (1.5s cycle). Skeleton visible minimum 200ms even if data resolves faster. Skeletons defined for: Application List, Application Detail, Dashboard (3–4 stat cards), Reviewer Queue (8–10 rows), Messaging Panel (5–6 bubbles). Respects `prefers-reduced-motion`. → *PRD F1 · FRD F01 · US-1.2 · SM-1.2*

- **UX-04** — Interactive States: Every interactive element has: Default, Hover (150ms ease), Focus (immediate, WCAG-compliant ring), Active (75ms ease, scale-[0.98] or darken), Disabled (opacity 0.5, cursor not-allowed, no focus), Loading (spinner in button, button disabled). Transitions use CSS, never instant state changes. Button variants: primary, secondary, ghost, danger, icon. → *PRD F1 · FRD F01 · US-1.3 · SM-1.3*

- **UX-05** — Design Token System: `tailwind.config.ts` extends Tailwind with semantic tokens. Color tokens: brand (primary, secondary), surface (base, card, sidebar), text (primary, secondary, disabled), border (default, focus), status (draft, submitted, under_review, additional_info, approved, rejected), feedback (error, warning, success). Typography scale: xl/lg/md headings, body md/sm, label, caption, code. Spacing: 4px base unit (1–16 scale). Shadow: sm/md/lg. Border-radius: sm/md/lg/full. No raw hex/RGB in component files. Enforced via lint rule + PR checklist. → *PRD F1 · FRD F01 · US-1.1 · SM-1.1*

---

## 5. Test Coverage Matrix

This matrix defines the test type and coverage scope for each requirement. All 40 requirements have defined test coverage.

**Test Type Key:**
- **Unit** — Isolated function/service test (Jest)
- **Integration** — Module or API endpoint test (Supertest / NestJS testing utilities)
- **E2E** — End-to-end UI test (Playwright or Cypress)
- **Accessibility** — Automated axe-core scan
- **Visual** — Storybook component state verification or screenshot test

### 5.1 Authentication & User Management

| Req ID | User Story | Test Type | Test Scope | Coverage Notes |
|---|---|---|---|---|
| AUTH-01 | US-0.1 | Unit + Integration + E2E | `AuthService.register()`, `POST /auth/register`, registration form flow | Validation rules (email uniqueness, password complexity, confirmPassword match), 201 response, role assignment, token issuance |
| AUTH-02 | US-0.2 | Unit + Integration + E2E | `AuthService.login()`, `POST /auth/login`, `POST /auth/refresh`, session persistence | Valid credentials → 200 + tokens; invalid credentials → 401; deactivated account → 403; token refresh on expiry; redirect to role dashboard |
| AUTH-03 | US-0.3 | Integration + E2E | `POST /auth/logout`, nav header logout action | Refresh token revoked; cookie cleared; redirect to `/login`; back-button does not restore protected page |
| AUTH-04 | US-0.4 | Unit + Integration + E2E | `AuthService.requestPasswordReset()`, `AuthService.resetPassword()`, full email link flow | Enumeration-safe 200 on unknown email; token expiry (1h); single-use enforcement; password complexity; all refresh tokens revoked on reset |
| AUTH-05 | US-0.5 | Integration + E2E | `JwtAuthGuard`, `RolesGuard`, all protected routes | 401 without token; 403 for wrong-role requests; applicant blocked from reviewer/admin endpoints; reviewer blocked from admin endpoints; frontend `RoleGuard` redirects |

### 5.2 Permit Applications

| Req ID | User Story | Test Type | Test Scope | Coverage Notes |
|---|---|---|---|---|
| PERM-01 | US-2.1 | Unit + Integration + E2E | `PermitsService.submit()`, `POST /permits/:id/submit`, application form submission | All required fields validation; document attachment requirement; status → `submitted`; audit log entry; lifecycle stage entry; confirmation display |
| PERM-02 | US-2.2 | Integration + E2E | `PATCH /permits/:id` (auto-save), explicit save, draft list | Auto-save debounce; explicit "Save Draft" button; navigation-away confirmation dialog; data persists after session; zero data loss on reload |
| PERM-03 | US-2.3 | Integration + E2E | `GET /permits` (applicant scope), application list page | Only own applications returned; correct status badges; unread message count badge; filter by status; skeleton screen; empty state |
| PERM-04 | US-2.4 | Integration + E2E | `GET /permits/:id`, application detail page | All form data visible; lifecycle timeline rendered; document panel; messaging panel; info request panel (when `additional_info_needed`); 403 for other applicant's application |
| PERM-05 | US-6.1 | Integration + E2E | `GET /permits` (reviewer scope), reviewer application list | Reviewer sees assigned + available pool; sort by status priority; filter by status; unread message badges; applicant-responded applications surfaced |
| PERM-06 | US-6.2 | Integration + E2E | `GET /permits/:id` (reviewer role), reviewer detail page | All form data; document panel with download; messaging panel; contextual action buttons (Begin Review/Request Info/Approve/Reject); documented past reasons visible |
| PERM-07 | US-8.1 | Integration + E2E | `GET /permits` (admin scope), admin all-applications list | All applications returned regardless of applicant/reviewer; filter by status, reviewer, type, date range; sort; pagination; admin can open any application detail |

### 5.3 Document Management

| Req ID | User Story | Test Type | Test Scope | Coverage Notes |
|---|---|---|---|---|
| DOCS-01 | US-3.1 | Integration + E2E | `POST /permits/:id/documents/upload-url`, S3 presign, `POST /permits/:id/documents`, drag-and-drop upload zone | Presigned URL generation; direct S3 PUT; confirm to API; file appears in list without page refresh; keyboard accessibility; multi-file select |
| DOCS-02 | US-3.2 | Unit + E2E | Client-side validator, server-side validator in `DocumentsService` | Invalid MIME type rejected client-side; oversized file rejected; specific error message per file; valid files in batch proceed; server-side validation catches spoofed extensions |
| DOCS-03 | US-3.3 | Integration + E2E | `GET /permits/:id/documents/:docId/url`, `DocumentPreview.tsx` | JPEG/PNG: thumbnail + lightbox; PDF: embedded viewer; DOCX: icon + download; keyboard accessible; Escape to close; 15-min URL expiry |
| DOCS-04 | US-3.4 | Integration + E2E | `DELETE /permits/:id/documents/:docId`, remove/replace flow | Confirmation prompt; soft-delete DB record; schedule S3 deletion; replace marks old as `superseded`; action unavailable post-submission; audit log entry |
| DOCS-05 | US-3.5 | Integration + E2E | `GET /permits/:id/documents/:docId/url` (reviewer), bulk download | Reviewer sees all documents; individual download presigned URL; bulk ZIP download; document download audit log; 403 for reviewer not assigned |

### 5.4 Status Tracking & Lifecycle

| Req ID | User Story | Test Type | Test Scope | Coverage Notes |
|---|---|---|---|---|
| STAT-01 | US-4.1 | Unit + Integration | `PermitLifecycleService`, all transition endpoints | All valid transitions succeed; all invalid transitions return 409; terminal states (approved/rejected) cannot be further transitioned; role enforcement per transition; `permit_status_history` entry created |
| STAT-02 | US-4.2 | E2E + Visual | `PermitStatusTimeline.tsx`, lifecycle timeline on detail page | Current stage highlighted; past stages have timestamps; future stages muted; rejected application displays correctly; mobile responsive; screen-reader accessible |
| STAT-03 | US-4.3 | Integration + E2E | `POST /permits/:id/begin-review`, "Begin Review" button | Only visible to reviewer when status = submitted; status → under_review; success toast; applicant notification within 5 sec; audit log entry; button hidden in other states |
| STAT-04 | US-4.4 | Integration + E2E | `POST /permits/:id/request-info`, info request modal | Mandatory note required; status → additional_info_needed; note in status history; note posted to messaging thread; applicant notification; audit log entry |
| STAT-05 | US-4.5 | Integration + E2E | `POST /permits/:id/resubmit`, re-submit flow | Available only in `additional_info_needed` state; document upload followed by re-submit; status → under_review; reviewer notification; audit log entry |
| STAT-06 | US-4.6 | Integration + E2E | `POST /permits/:id/approve`, `POST /permits/:id/reject`, approval/rejection modal | Mandatory reason required; confirmation dialog; status → approved or rejected; decision reason stored; applicant notification within 5 sec; audit log; terminal state enforcement |
| STAT-07 | US-4.7 | Integration + E2E | `NotificationsService.create()`, `GET /notifications/unread`, notification badge | Notification created on every status transition; polling returns unread count within 10s interval; bell icon count visible; click navigates to application; persists across sessions; marks read |

### 5.5 Messaging & Communication

| Req ID | User Story | Test Type | Test Scope | Coverage Notes |
|---|---|---|---|---|
| MSG-01 | US-5.1 | Integration + E2E | `GET/POST /permits/:id/messages`, `MessagePanel.tsx` | Applicant and reviewer can send messages; messages appear within 2 sec; chronological order; empty state message; accessible at all lifecycle stages |
| MSG-02 | US-5.2 | Integration + E2E + Visual | `MessageBubble.tsx`, sender metadata | Sender full name visible; role badge (color-coded); timestamp display (human-readable + ISO hover); alignment (sent right, received left); server-side sender resolution |
| MSG-03 | US-5.3 | Integration + E2E | `MessagesService` (unread count query), permit list badges, dashboard cards | Per-user unread count; badge appears on list row and dashboard; opening panel marks as read + clears badge; updates within 30 sec |
| MSG-04 | US-5.4 | Integration + E2E | `MessageComposer.tsx` (reviewer), `message_attachments` table | Attachment UI visible only to reviewer; file validation matches DOCS-02; attachment links in message bubble; applicant can download; inline composer error messages |

### 5.6 Dashboard & Navigation

| Req ID | User Story | Test Type | Test Scope | Coverage Notes |
|---|---|---|---|---|
| DASH-01 | US-7.1 | Integration + E2E | `ApplicantDashboard.tsx`, dashboard data endpoints | Summary stat cards (active, pending, unread); recent 5 applications with status badges; "Action Required" highlight; "Start New Application" button; visual indicator present; data ≤30s stale |
| DASH-02 | US-7.2 | Integration + E2E | `ReviewerDashboard.tsx`, reviewer queue endpoints | Applications sorted by action-priority buckets; applicant-responded applications at top; count summary; visual indicator; data ≤30s stale; top 5 identifiable in <90 sec |
| DASH-03 | US-7.3 | Integration + E2E | `AdminDashboard.tsx`, admin stats endpoints | System-wide application counts by status; reviewer workload table (name, count, pending); activity feed; navigate to reviewer queue from workload section; data ≤30s stale |
| DASH-04 | US-7.4 | E2E + Accessibility + Visual | `StatusChart.tsx`, `ActivityFeed.tsx`, all dashboard visual indicators | At least one chart/widget per role dashboard; design system status colors; labels visible without legend interaction; screen-reader accessible (text alternative or ARIA); ≤30s data staleness |

### 5.7 Admin & Configuration

| Req ID | User Story | Test Type | Test Scope | Coverage Notes |
|---|---|---|---|---|
| ADMN-01 | US-8.2 | Integration + E2E | `UsersModule` CRUD, `UserManagementPage.tsx` | Create user: name, email, mandatory role; welcome email triggered; deactivate: all sessions revoked immediately; reactivate; role changes instant; all actions in audit log; 2-min usability target |
| ADMN-02 | US-8.3 | Integration + E2E | `AdminService.assignReviewer()`, bulk assignment | Single application assignment; bulk assignment (10+); newly assigned reviewer notified; previous reviewer notified; queue updated immediately; all assignments in audit log |
| ADMN-03 | US-8.4 | Integration + E2E | `AuditLogPage.tsx`, `GET /admin/audit-logs`, CSV export | All event types logged (status transitions, docs, messages, user actions, unauthorized access); filter by date/actor/action/application ID; searchable; CSV export with all required columns; read-only; 2-min retrieval target |

### 5.8 UI / UX Quality

| Req ID | User Story | Test Type | Test Scope | Coverage Notes |
|---|---|---|---|---|
| UX-01 | US-9.1 | E2E (responsive) | All pages at 375px, 768px, 1440px viewports | No horizontal scroll; nav collapses on mobile; drag-and-drop degrades to tap-to-browse; tables reflow to cards; touch targets ≥44×44px; iOS Safari + Android Chrome |
| UX-02 | US-9.2 | Accessibility (axe-core CI) + E2E | All pages — axe-core WCAG 2.1 AA automated scan | Zero critical violations in CI; keyboard navigation all interactive elements; visible focus indicators; ARIA labels/roles; live regions for status updates; contrast ratios ≥4.5:1 / ≥3:1 |
| UX-03 | US-1.2 | E2E + Visual | All page-level loading states | Skeleton matches layout of content; visible ≥200ms; no full-page spinner on page loads; `prefers-reduced-motion` respected (no shimmer animation); defined skeletons for all 5 view types |
| UX-04 | US-1.3 | Visual (Storybook) + E2E | All interactive component variants | Hover (150ms), focus (immediate ring), active (75ms), disabled (opacity 0.5, no events), loading (spinner) states on all buttons/inputs/cards; transition timing verified |
| UX-05 | US-1.1 | Visual (Storybook) + Unit (lint) | `tailwind.config.ts`, all components | No raw hex/RGB in component files (lint rule); all required color/type/spacing/shadow/radius tokens defined; WCAG contrast check on all text-on-background token pairs; premium vs. default look verified |

---

## 6. Journey & JTBD Coverage

### 6.1 Journey-to-Requirement Traceability

Each journey and its stages touch multiple requirements. This table maps journey stages to their primary requirement references.

| Journey | Stage | Primary Requirements | Phase |
|---|---|---|---|
| JRN-01.1 (Marcus: First Submission) | Discover | UX-05, UX-04, UX-03 | 1 |
| JRN-01.1 | Register | AUTH-01, AUTH-02 | 1 |
| JRN-01.1 | Profile Setup | PERM-01, PERM-02 | 2 |
| JRN-01.1 | Start Application | PERM-01, PERM-02 | 2 |
| JRN-01.1 | Upload Documents | DOCS-01, DOCS-02, DOCS-03, DOCS-04 | 2 |
| JRN-01.1 | Submit & Confirm | PERM-01, STAT-01, STAT-07, DASH-01 | 2 |
| JRN-01.2 (Marcus: Status → Approval) | Morning Check | DASH-01, PERM-03, STAT-01, STAT-02 | 2/4 |
| JRN-01.2 | Spot the Alert | PERM-04, MSG-01, MSG-02, STAT-07 | 3 |
| JRN-01.2 | Upload Replacement | DOCS-01, DOCS-02, DOCS-03, DOCS-04, STAT-05 | 3 |
| JRN-01.2 | Message the Reviewer | MSG-01, MSG-02, MSG-03 | 3 |
| JRN-01.2 | Await & Track | DASH-01, STAT-02, STAT-07, MSG-03 | 3/4 |
| JRN-01.2 | Receive Approval | STAT-06, STAT-07, PERM-04 | 3 |
| JRN-02.1 (Diana: Morning Triage) | Login & Land | AUTH-02, DASH-02 | 1/4 |
| JRN-02.1 | Read the Buckets | DASH-02, STAT-01, STAT-05, MSG-03 | 3/4 |
| JRN-02.1 | Catch Overnight Responses | STAT-07, STAT-05, DASH-04, MSG-03 | 3/4 |
| JRN-02.1 | Sequence the Day | DASH-02, PERM-05 | 3/4 |
| JRN-02.1 | Open First Application | PERM-06, DOCS-05, STAT-03 | 3 |
| JRN-02.2 (Diana: Full Review) | Open Application | PERM-06, STAT-01, STAT-03 | 3 |
| JRN-02.2 | Review Documents | DOCS-05, DOCS-03 | 3 |
| JRN-02.2 | Send Info Request | STAT-04, MSG-01, MSG-02, MSG-04, STAT-07 | 3 |
| JRN-02.2 | Await Applicant Response | STAT-07, STAT-05, DASH-02, MSG-03 | 3/4 |
| JRN-02.2 | Complete Review | PERM-06, DOCS-05, MSG-01, STAT-03 | 3 |
| JRN-02.2 | Approve with Rationale | STAT-06, ADMN-03, STAT-07 | 3/5 |
| JRN-03.1 (James: Staff Management) | Login to Admin Panel | DASH-03, AUTH-02, AUTH-05 | 1/4/5 |
| JRN-03.1 | Deactivate Departed Account | ADMN-01, AUTH-05 | 5 |
| JRN-03.1 | Provision New Account | ADMN-01, AUTH-01 | 5 |
| JRN-03.1 | Verify in Audit Log | ADMN-03 | 5 |
| JRN-03.1 | First Application Assignment | ADMN-02, PERM-07, STAT-07 | 5 |
| JRN-03.2 (James: Workload & Audit) | View Workload Distribution | DASH-03, ADMN-02, PERM-07 | 4/5 |
| JRN-03.2 | Bulk Reassign Applications | ADMN-02, PERM-07, STAT-07 | 5 |
| JRN-03.2 | Pull Application Audit Log | ADMN-03, STAT-01 | 5 |
| JRN-03.2 | Export and Share | ADMN-03 | 5 |
| JRN-03.2 | Spot-Check Access Controls | ADMN-01, AUTH-05, ADMN-03 | 1/5 |

### 6.2 JTBD-to-Requirement Traceability

| JTBD-ID | Job (abbreviated) | Primary Requirements | Phases | Priority |
|---|---|---|---|---|
| JTBD-01.1 | Submit complete application in <10 min | PERM-01, PERM-02, AUTH-01–04, UX-03–05 | 1, 2 | P0 |
| JTBD-01.2 | Know where every application stands without calling | STAT-01, STAT-02, STAT-07, DASH-01, PERM-03, PERM-04 | 2, 3, 4 | P0 |
| JTBD-01.3 | Satisfy document requests without re-submitting | DOCS-01, DOCS-02, DOCS-03, DOCS-04, STAT-05, STAT-07, UX-01 | 2, 3 | P0 |
| JTBD-01.4 | Communicate directly with reviewer in-app | MSG-01, MSG-02, MSG-03, DASH-01 | 3, 4 | P1 |
| JTBD-02.1 | Identify priority applications in <90 sec | PERM-05, PERM-06, DASH-02, STAT-01, STAT-05, MSG-03 | 3, 4 | P0 |
| JTBD-02.2 | Evaluate and decide with traceable record | DOCS-05, STAT-03, STAT-06, PERM-06, DASH-02, ADMN-03 | 3, 5 | P0 |
| JTBD-02.3 | Request clarification within application record | STAT-04, MSG-01, MSG-02, MSG-04, STAT-07, DASH-02 | 3, 4 | P1 |
| JTBD-02.4 | Know immediately when applicant has responded | STAT-05, STAT-07, MSG-03, DASH-02, DASH-04 | 3, 4 | P1 |
| JTBD-03.1 | Onboard/offboard staff without vendor involvement | ADMN-01, AUTH-01–04, AUTH-05, ADMN-03 | 1, 5 | P0 |
| JTBD-03.2 | Balance reviewer workload without spreadsheet | ADMN-02, DASH-03, PERM-07, STAT-07 | 4, 5 | P1 |
| JTBD-03.3 | Reconstruct decision history for audits | ADMN-03, ADMN-01, STAT-01, DASH-03 | 5 | P0 |
| JTBD-03.4 | Confirm access controls are enforced | AUTH-05, ADMN-01, ADMN-03, DASH-03 | 1, 5 | P1 |

### 6.3 Persona-to-Requirement Primary Coverage

| Persona | Primary Requirements | Phases Active |
|---|---|---|
| PER-01 Marcus (Applicant) | AUTH-01–04, PERM-01–04, DOCS-01–04, STAT-01–02, STAT-05, STAT-07, MSG-01–03, DASH-01, DASH-04, UX-01–05 | 1, 2, 3, 4 |
| PER-02 Diana (Reviewer) | AUTH-01–05, PERM-05–06, DOCS-05, STAT-01, STAT-03–04, STAT-06–07, MSG-01–04, DASH-02, DASH-04, UX-01–02 | 1, 3, 4 |
| PER-03 James (Admin) | AUTH-02, AUTH-05, PERM-07, ADMN-01–03, DASH-03–04, UX-02 | 1, 4, 5 |

---

## 7. Change Management

### Change Log

| Version | Date | Author | Change Description | Requirements Affected |
|---|---|---|---|---|
| 1.0 | 2026-07-21 | Spec Generator | Initial RTM created from PRD v1.0, FRD v1.0, TechArch v1.0, UserStories v1.0, Journeys, JTBD, StoryMap, REQUIREMENTS.md, and ROADMAP.md. All 40 v1 requirements mapped. | All 40 |

### Change Management Process

Changes to this RTM are required when any of the following occur:

- A new requirement is added to REQUIREMENTS.md or a PRD feature is modified
- An existing requirement is descoped or deferred to v2
- A user story is added, split, or removed
- A journey stage is added or significantly modified
- A Phase is added, merged, or resequenced in the ROADMAP
- A TechArch component is renamed, merged, or replaced

For each change:
1. Increment the RTM version (1.0 → 1.1 for minor; 1.x → 2.0 for major re-scope)
2. Record the change in the Change Log table above with date, author, description, and affected requirement IDs
3. Re-validate that no requirement has lost traceability after the change (coverage check)
4. Update all downstream references (FRD, UserStories, TechArch) before closing the change

---

## 8. Approval

### Sign-Off

| Role | Name | Signature | Date |
|---|---|---|---|
| Product Owner | | | |
| Technical Lead | | | |
| QA Lead | | | |
| Project Manager | | | |

### Traceability Coverage Declaration

By signing below, the undersigned confirm that this RTM accurately reflects the agreed v1 scope of the Permit Management System and that all 40 v1 requirements have complete forward and backward traceability across:

- PRD features (F0–F9)
- FRD functional specifications (F00–F09)
- TechArch components (backend modules + frontend pages/components)
- User Stories (US-0.1–US-9.2)
- User Journeys (JRN-01.1–JRN-03.2)
- Jobs-to-be-Done outcomes (JTBD-01.1–JTBD-03.4)
- Story Map entries (SM-0.1–SM-9.2)
- Roadmap delivery phases (Phase 1–5)
- Test coverage scope

**Coverage at signature:** 40 of 40 v1 requirements mapped · 0 gaps · 0 orphan stories · 0 unmapped JTBD outcomes

| Role | Name | Signature | Date |
|---|---|---|---|
| Product Owner | | | |
| Technical Lead | | | |

---

## Appendix: Quick-Reference Requirement Index

| Req ID | Description | Feature | Phase | Priority | User Story |
|---|---|---|---|---|---|
| AUTH-01 | Account registration | F0 | 1 | P0 | US-0.1 |
| AUTH-02 | Login & session persistence | F0 | 1 | P0 | US-0.2 |
| AUTH-03 | Logout from any page | F0 | 1 | P0 | US-0.3 |
| AUTH-04 | Password reset via email | F0 | 1 | P0 | US-0.4 |
| AUTH-05 | RBAC enforcement at API layer | F0 | 1 | P0 | US-0.5 |
| PERM-01 | Submit new permit application | F2 | 2 | P0 | US-2.1 |
| PERM-02 | Save application as draft | F2 | 2 | P0 | US-2.2 |
| PERM-03 | Applicant view application list | F2 | 2 | P0 | US-2.3 |
| PERM-04 | Applicant view application detail | F2 | 2 | P0 | US-2.4 |
| PERM-05 | Reviewer view assigned application list | F6 | 3 | P0 | US-6.1 |
| PERM-06 | Reviewer view application detail | F6 | 3 | P0 | US-6.2 |
| PERM-07 | Admin view all applications | F8 | 5 | P1 | US-8.1 |
| DOCS-01 | Upload via drag-and-drop or file picker | F3 | 2 | P0 | US-3.1 |
| DOCS-02 | File validation with immediate feedback | F3 | 2 | P0 | US-3.2 |
| DOCS-03 | Inline document preview | F3 | 2 | P0 | US-3.3 |
| DOCS-04 | Remove or replace documents before submission | F3 | 2 | P0 | US-3.4 |
| DOCS-05 | Reviewer view and download documents | F3/F6 | 3 | P0 | US-3.5 |
| STAT-01 | Lifecycle stages and transition rules | F4 | 2 | P0 | US-4.1 |
| STAT-02 | Visual lifecycle timeline (applicant) | F4 | 2 | P0 | US-4.2 |
| STAT-03 | Reviewer advances to Under Review | F4/F6 | 3 | P0 | US-4.3 |
| STAT-04 | Reviewer requests additional information | F4/F6 | 3 | P0 | US-4.4 |
| STAT-05 | Applicant responds to info request | F4 | 3 | P0 | US-4.5 |
| STAT-06 | Reviewer approves or rejects with reason | F4/F6 | 3 | P0 | US-4.6 |
| STAT-07 | In-app notification on status change | F4 | 3 | P0 | US-4.7 |
| MSG-01 | Integrated messaging panel | F5 | 3 | P1 | US-5.1 |
| MSG-02 | Message sender name, role, timestamp | F5 | 3 | P1 | US-5.2 |
| MSG-03 | Unread message counts on list/dashboard | F5 | 3 | P1 | US-5.3 |
| MSG-04 | Reviewer attaches documents/notes to message | F5 | 3 | P1 | US-5.4 |
| DASH-01 | Applicant dashboard | F7 | 4 | P1 | US-7.1 |
| DASH-02 | Reviewer dashboard | F7 | 4 | P1 | US-7.2 |
| DASH-03 | Admin dashboard system-wide stats | F7 | 4 | P1 | US-7.3 |
| DASH-04 | Visual progress indicators on all dashboards | F7 | 4 | P1 | US-7.4 |
| ADMN-01 | Admin create/deactivate/manage users | F8 | 5 | P1 | US-8.2 |
| ADMN-02 | Admin assign reviewers to applications | F8 | 5 | P1 | US-8.3 |
| ADMN-03 | Admin view audit logs | F8 | 5 | P1 | US-8.4 |
| UX-01 | Responsive design (desktop + mobile) | F9 | 2→5 | P0 | US-9.1 |
| UX-02 | WCAG 2.1 AA accessibility | F9 | 2→5 | P0 | US-9.2 |
| UX-03 | Skeleton screens for page-level loads | F1 | 1 | P0 | US-1.2 |
| UX-04 | Hover, focus, active states on interactive elements | F1 | 1 | P0 | US-1.3 |
| UX-05 | Custom design token system | F1 | 1 | P0 | US-1.1 |

---

*RTM Version 1.0 — Generated 2026-07-21*
*Source documents: REQUIREMENTS.md, ROADMAP.md, PRD v1.0, FRD v1.0, TechArch v1.0, UserStories v1.0, Journeys v1.0, JTBD v1.0, StoryMap v1.0, Personas v1.0*
*Coverage: 40 of 40 v1 requirements · 10 PRD features · 10 FRD spec chunks · 40 user stories · 6 user journeys · 12 JTBD outcomes · 40 story map entries · 5 roadmap phases*
