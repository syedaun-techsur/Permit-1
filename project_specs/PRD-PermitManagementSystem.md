# PRD: Permit Management System

**Document Type:** Product Requirements Document  
**Project:** Permit Management System  
**Version:** 1.0  
**Date:** 2026-07-21  
**Status:** Draft  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision](#3-product-vision)
4. [Technical Architecture](#4-technical-architecture)
5. [Feature Requirements](#5-feature-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Success Metrics](#7-success-metrics)
8. [Risks & Mitigations](#8-risks--mitigations)
9. [Feature Index](#9-feature-index)
10. [Out of Scope (v1)](#10-out-of-scope-v1)

---

## 1. Executive Summary

The Permit Management System is a digital permitting platform that replaces fragmented, paper-based, or legacy-portal processes with a modern, premium-quality SaaS experience. Applicants submit permit requests, manage documents, track real-time status, and communicate directly with reviewers — all through a single unified interface. Reviewers and administrators gain structured workflow tools that eliminate manual coordination overhead and improve processing transparency across the entire permit lifecycle.

---

## 2. Problem Statement

Municipal and government permitting processes are plagued by structural inefficiencies that frustrate both applicants and staff.

**For Applicants:**
- No visibility into where their application stands — status updates require phone calls or in-person visits
- Document submission is fragmented: email attachments, fax, or physical drop-off
- Communication with reviewers is asynchronous and opaque, often lost in email chains
- No way to know what is missing or what action is needed without directly contacting staff
- The experience is anxiety-inducing: applicants cannot tell if their application is progressing or stalled

**For Reviewers and Administrators:**
- Applications arrive via inconsistent channels, making prioritization and tracking manual and error-prone
- No structured way to request additional information — back-and-forth email loses context
- Workload is invisible to administrators; bottlenecks go undetected until deadlines are missed
- Approval and rejection decisions lack documented reasoning trails, creating audit risk
- Legacy systems offer no reporting or aggregate visibility into application throughput

**The Core Gap:**  
There is no purpose-built tool that gives applicants real-time transparency into their permit lifecycle while giving reviewers and admins structured workflow and communication tools — delivered at the quality standard applicants expect from modern SaaS products.

---

## 3. Product Vision

> **Make permitting feel less like bureaucracy and more like a premium service.** Every applicant should know exactly where their application stands at every moment, and every reviewer should have the tools to process applications with confidence and speed.

### Strategic Goals

- Eliminate applicant uncertainty by making permit status visible, accurate, and real-time at every lifecycle stage
- Replace fragmented communication channels with a unified, structured messaging experience tied directly to each permit application
- Give reviewers a clean, organized workspace that surfaces pending actions and eliminates manual coordination
- Provide administrators with system-wide visibility and control over users, assignments, and audit trails
- Deliver a design quality that builds institutional trust — premium SaaS aesthetics with the clarity required for official processes
- Ship a production-ready v1 that validates core applicant and reviewer workflows, with a clear expansion path to payments, analytics, and workflow configuration in v2

### Target Users

- **Applicants** — individuals, contractors, and businesses who need to obtain permits; expect consumer-grade digital experiences
- **Reviewers** — permitting staff responsible for evaluating, requesting information, and deciding on applications
- **Administrators** — system operators who manage users, assign workload, and maintain audit compliance

---

## 4. Technical Architecture

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend Framework | React 18 + Vite + TypeScript | Modern build tooling, strong type safety |
| Routing | React Router v6 | Client-side routing with protected role-based routes |
| State Management | Zustand or Redux Toolkit | Global auth/session state; local UI state kept component-level |
| Styling | Tailwind CSS + custom design tokens | Custom color palette, typography scale, spacing, shadows — no default template look |
| Backend Framework | Node.js with Express or NestJS | RESTful API; NestJS preferred for structure at scale |
| Authentication | JWT (JSON Web Tokens) | Stateless; access + refresh token pattern |
| Authorization | RBAC at API layer | Roles: Applicant, Reviewer, Admin; enforced on every protected route |
| Database | Relational (PostgreSQL) | Permit records, user accounts, messages, audit logs |
| File Storage | Object storage (S3-compatible) | Document uploads; presigned URLs for secure access |
| API Style | RESTful JSON API | Versioned endpoints; documented with OpenAPI spec |

---

## 5. Feature Requirements

### F0: Authentication & User Management

**Description:** Secure account creation, login, session management, and password recovery. Every user has a defined role that determines what they can see and do throughout the system. Authentication is enforced at the API layer — no role-inappropriate data is ever served regardless of frontend state.

**Capabilities:**
- User can register an account with email and password; role is assigned at registration or by admin
- User can log in and remain authenticated across browser sessions (refresh token persistence)
- User can log out from any page in the application
- User can reset a forgotten password via a time-limited email link
- API layer enforces RBAC on every protected endpoint — unauthenticated or wrong-role requests return 401/403

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05  
**Phase:** 1 — Foundation  
**Priority:** P0 (Critical — MVP gate)

---

### F1: Design System & UI Foundation

**Description:** A custom design system built on Tailwind CSS that establishes the visual language for the entire product. This is not a default template — every visual decision (color, type, spacing, shadow, border radius, motion) is intentional and creates a premium SaaS aesthetic while maintaining WCAG-compliant contrast and clarity required for official processes.

**Capabilities:**
- Custom color palette with semantic tokens (primary, surface, border, status colors)
- Typography scale with clear hierarchy: headings, body, labels, captions
- Spacing and layout grid consistent across all views
- Component primitives: buttons, inputs, cards, badges, modals, toast notifications
- Smooth micro-interactions on hover, focus, and active states for all interactive elements
- Skeleton screen loading states for page-level content (no generic spinners)

**Requirements:** UX-03, UX-04, UX-05  
**Phase:** 1 — Foundation  
**Priority:** P0 (Critical — establishes visual quality baseline)

---

### F2: Permit Application Submission

**Description:** Applicants can create, fill out, save as draft, and submit permit applications through a structured form interface. The form collects all required fields (permit type, project description, location, contact information) and supports iterative drafting before final submission. The application list view gives applicants an organized overview of all their submissions.

**Capabilities:**
- Structured application form with required fields: permit type, project description, site address, applicant contact details
- Auto-save or explicit draft save — applicant can leave and return to complete submission later
- Validation feedback inline — field errors appear as the applicant moves through the form, not only on submit
- Application list view shows all submitted and draft applications with status badges and last-updated timestamps
- Application detail view shows all entered data, current status, attached documents, and the messaging panel

**Requirements:** PERM-01, PERM-02, PERM-03, PERM-04  
**Phase:** 2 — Applicant Core  
**Priority:** P0 (Critical — core applicant workflow)

---

### F3: Document Management

**Description:** Applicants upload supporting documents (site plans, identification, certifications) directly within the permit application interface. The upload experience is drag-and-drop first, with immediate validation feedback. Uploaded documents are previewable inline so applicants can confirm the right files were attached before submitting. Reviewers can view and download all documents associated with any application.

**Capabilities:**
- Drag-and-drop upload zone with click-to-browse fallback
- Immediate validation feedback: file type restrictions (PDF, JPG, PNG, DOCX) and size limits enforced client-side with clear error messages
- Inline preview: image thumbnails rendered in the document list; PDF viewer for PDF files
- Applicant can remove or replace any document before the application is submitted
- Document list shows file name, type, size, and upload timestamp
- Reviewer can view all attached documents and download individual files

**Requirements:** DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05  
**Phase:** 2 (applicant upload) → Phase 3 (reviewer download)  
**Priority:** P0 (Critical — applications without documents are incomplete)

---

### F4: Permit Status Tracking & Lifecycle

**Description:** Every permit application moves through a defined lifecycle: Draft → Submitted → Under Review → Additional Info Needed → Approved or Rejected. The current stage and all historical stage transitions are surfaced to the applicant through a visual timeline/stepper component with timestamps. Status changes are triggered by reviewer actions and automatically reflected in the applicant's view.

**Capabilities:**
- Visual lifecycle timeline/stepper component showing all stages, current stage highlighted, and timestamps for completed stages
- Lifecycle stages: Draft → Submitted → Under Review → Additional Info Needed → Approved / Rejected
- Status badge displayed on application list cards for at-a-glance visibility
- Reviewer can advance application from Submitted → Under Review (claiming it for review)
- Reviewer can move application to Additional Info Needed with a documented request note
- Applicant can respond to an additional info request, re-submitting the application to Under Review
- Reviewer can approve or reject an application with a documented reason (both visible to applicant)
- Applicant receives an in-app notification whenever their permit status changes

**Requirements:** STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06, STAT-07  
**Phase:** 2 (tracking) → Phase 3 (reviewer actions + notifications)  
**Priority:** P0 (Critical — core value proposition)

---

### F5: Integrated Messaging

**Description:** Each permit application has a dedicated messaging panel where the applicant and assigned reviewer can communicate directly in context. Messages are structured (sender name, role, timestamp) and tied to the specific application — eliminating lost email threads. The reviewer can also attach supporting documents or notes to messages. Unread message counts surface on the application list and dashboard so no message goes unnoticed.

**Capabilities:**
- Integrated messaging panel visible on the application detail view for both applicant and reviewer
- Messages display sender full name, role badge (Applicant / Reviewer), and timestamp
- Reviewer can attach documents or notes to individual messages
- Unread message counts shown on the application list row and on the dashboard card
- Message thread is ordered chronologically; new messages append at the bottom
- Notifications trigger when a new message is received (in-app indicator)

**Requirements:** MSG-01, MSG-02, MSG-03, MSG-04  
**Phase:** 3 — Review Workflow  
**Priority:** P1 (High — directly enables reviewer-applicant coordination)

---

### F6: Reviewer Workflow

**Description:** Reviewers have a dedicated workspace to manage all permit applications assigned to or available for their review. The review view surfaces application details, attached documents, and the full messaging thread in one place. Reviewers can take all workflow actions (advance, request info, approve, reject) directly from the application detail view without navigating away.

**Capabilities:**
- Reviewer application list: filterable and sortable by status, submission date, and permit type
- Application detail view for reviewer: full form data, document panel with download, messaging panel, status action controls
- Status action controls: "Begin Review" (Submitted → Under Review), "Request Info" (with required note), "Approve" (with required reason), "Reject" (with required reason)
- Documented reasons for approvals, rejections, and info requests are stored and visible to applicants
- Reviewer can see all documents and download any file attached to an application

**Requirements:** PERM-05, PERM-06, DOCS-05, STAT-03, STAT-04, STAT-06  
**Phase:** 3 — Review Workflow  
**Priority:** P0 (Critical — without reviewers, the lifecycle cannot complete)

---

### F7: Role-Specific Dashboards

**Description:** Every user role lands on a dashboard tailored to their priorities. Dashboards are not generic — they surface the information each role needs to act immediately. Applicants see their active permits and recent changes; reviewers see pending work sorted by urgency; administrators see system-wide throughput and workload distribution. At least one visual progress indicator (chart or activity feed) appears on every dashboard.

**Capabilities:**

**Applicant Dashboard:**
- Summary cards: active applications count, pending actions needed, unread messages
- Recent applications list with status badges and last-activity timestamps
- Quick link to start a new application

**Reviewer Dashboard:**
- Application queue sorted by status priority (Additional Info Needed → Submitted → Under Review)
- Unread message count per application surfaced in the list
- Pending action indicator for applications awaiting reviewer decision

**Admin Dashboard:**
- System-wide statistics: total applications by status (chart/table)
- Reviewer workload distribution: applications per reviewer, pending count
- Recent system activity feed

**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04  
**Phase:** 4 — Dashboards  
**Priority:** P1 (High — critical for usability at scale)

---

### F8: Admin Controls

**Description:** Administrators have full visibility and control over the system. They can manage user accounts (create, deactivate), assign reviewers to applications, and view a complete audit log of all status changes and key system actions. Admin tools are purpose-built for operational oversight, not just superuser access.

**Capabilities:**
- User management: create new user accounts, assign roles, deactivate accounts (soft delete)
- Reviewer assignment: admin can assign or reassign a reviewer to any permit application
- All-applications view: paginated list of every permit application across all applicants and reviewers, with full filter and sort capability
- Audit log: chronological record of all status transitions, reviewer assignments, and admin actions — includes actor, timestamp, and action detail
- Audit log is read-only and append-only (no deletion)

**Requirements:** PERM-07, ADMN-01, ADMN-02, ADMN-03  
**Phase:** 5 — Admin & Compliance  
**Priority:** P1 (High — required for operational trust and compliance)

---

### F9: Accessibility & Responsive Design

**Description:** The entire interface is fully functional on desktop and mobile screen sizes, and meets WCAG 2.1 AA accessibility standards throughout. Accessibility is not a post-launch audit task — it is built into every component from the foundation phase. The premium aesthetic must not come at the cost of usability for keyboard-only or screen-reader users.

**Capabilities:**
- Responsive layout: all views usable on viewport widths from 375px (mobile) through 1440px+ (desktop)
- WCAG 2.1 AA color contrast ratios on all text, icons, and interactive elements
- Full keyboard navigation: all interactive elements reachable and operable via keyboard
- Meaningful ARIA labels and roles on all interactive elements, form fields, and status indicators
- Focus indicators visible and styled (not browser-default outlines suppressed without replacement)
- Screen-reader-compatible markup: semantic HTML, live regions for status updates and notifications

**Requirements:** UX-01, UX-02  
**Phase:** 2 (responsive) → Phase 5 (full WCAG audit and compliance)  
**Priority:** P0 (Critical — legal and ethical requirement; non-negotiable)

---

## 6. Non-Functional Requirements

| Category | Requirement | Target |
|----------|------------|--------|
| Performance | Page load time (initial) | < 2.5s on 4G connection |
| Performance | Time to Interactive | < 3.5s on mid-range device |
| Performance | API response time (p95) | < 500ms for all read endpoints |
| Security | Authentication | JWT with refresh token rotation; HTTPS-only |
| Security | Authorization | RBAC enforced server-side on every protected endpoint |
| Security | File uploads | File type and size validation server-side; malware scanning recommended |
| Security | Data | All data in transit encrypted (TLS 1.2+); sensitive fields encrypted at rest |
| Reliability | API uptime | 99.5% uptime target |
| Reliability | Error handling | All API errors return structured JSON with error code and human-readable message |
| Scalability | Concurrent users | Support 500 concurrent users without degradation (v1 target) |
| Accessibility | Standard | WCAG 2.1 Level AA throughout all pages |
| Browsers | Support matrix | Chrome, Firefox, Safari, Edge — latest two major versions |
| Mobile | Support | Responsive web; iOS Safari and Android Chrome on current OS versions |
| Auditability | Logs | All status transitions and admin actions logged with actor and timestamp |
| Code Quality | TypeScript | Strict mode; no `any` in production code |

---

## 7. Success Metrics

### Phase 1 — Foundation
- 100% of API routes return 401/403 for unauthenticated or wrong-role requests (security gate)
- Design system passes WCAG 2.1 AA contrast checks for all color token pairings

### Phase 2 — Applicant Core
- Applicant can complete a permit application from start to submission in under 5 minutes (usability target)
- Document upload success rate ≥ 98% for valid files under the size limit
- Zero instances of applicant data loss due to navigation or session expiry (draft auto-save)

### Phase 3 — Review Workflow
- Reviewer can action any application (advance, request info, approve, reject) in under 60 seconds from application detail view
- All status transitions reflected in applicant view within 5 seconds (near-real-time)
- In-app notification delivered for every status change event

### Phase 4 — Dashboards
- Every role's dashboard surfaces actionable next steps without requiring navigation to another view
- Dashboard data staleness < 30 seconds (polling or cache invalidation)

### Phase 5 — Admin & Compliance
- 100% of pages pass automated WCAG 2.1 AA audit (axe-core or equivalent)
- Audit log captures 100% of status change and admin action events with no gaps
- Admin can create/deactivate a user account in under 2 minutes

### Business Metrics (Post-Launch)
- Average permit processing time reduced by 40% vs. baseline (legacy process)
- Applicant satisfaction score ≥ 4.2 / 5.0 on post-submission survey
- Reviewer application throughput increases by ≥ 25% within 90 days of launch
- < 5% of submitted applications require in-person or phone clarification (vs. current baseline)

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Design quality slips to "generic" under delivery pressure | Medium | High | Design system (F1) is a Phase 1 deliverable — establish tokens and components before feature work begins |
| WCAG compliance becomes a last-minute audit | Medium | High | Accessibility requirements embedded in every component from Phase 1; automated axe-core checks in CI |
| File upload reliability issues (large files, slow connections) | Medium | Medium | Client-side progress indicators; chunked upload consideration for large files; clear file size limits |
| JWT token management introduces session bugs | Low | High | Refresh token rotation with sliding expiry; thorough auth edge-case testing (expiry, concurrent sessions) |
| Reviewer workflow complexity underestimated | Medium | Medium | Phase 3 starts after Phase 2 is complete; review workflow informed by real applicant data from staging |
| Scope creep — stakeholders request v2 features in v1 | High | Medium | Hard out-of-scope list maintained in REQUIREMENTS.md; PRD changes require documented version bump |
| Mobile usability gaps discovered late | Low | Medium | Responsive design verified from Phase 2 onward on real devices; not a post-launch concern |
| Data loss on draft applications | Low | High | Auto-save on form change with debounce; local storage fallback for unsaved state |

---

## 9. Feature Index

| ID | Feature | Phase | Priority | Requirements |
|----|---------|-------|----------|-------------|
| F0 | Authentication & User Management | 1 | P0 | AUTH-01–05 |
| F1 | Design System & UI Foundation | 1 | P0 | UX-03, UX-04, UX-05 |
| F2 | Permit Application Submission | 2 | P0 | PERM-01–04 |
| F3 | Document Management | 2 → 3 | P0 | DOCS-01–05 |
| F4 | Permit Status Tracking & Lifecycle | 2 → 3 | P0 | STAT-01–07 |
| F5 | Integrated Messaging | 3 | P1 | MSG-01–04 |
| F6 | Reviewer Workflow | 3 | P0 | PERM-05–06, DOCS-05, STAT-03–04, STAT-06 |
| F7 | Role-Specific Dashboards | 4 | P1 | DASH-01–04 |
| F8 | Admin Controls | 5 | P1 | PERM-07, ADMN-01–03 |
| F9 | Accessibility & Responsive Design | 2 → 5 | P0 | UX-01, UX-02 |

**Priority Key:**
- **P0** — Critical; MVP gate; launch is blocked without this
- **P1** — High; required for full product value; included in v1
- **P2** — Medium; improves experience; targeted for v1 if timeline allows
- **P3** — Low; deferred to v2 or beyond

---

## 10. Out of Scope (v1)

| Feature | Reason Deferred |
|---------|----------------|
| Native mobile app (iOS/Android) | Web-first; responsive web covers mobile use cases in v1 |
| Payment processing for permit fees | PCI-DSS compliance complexity; deferred to v2 |
| AI/ML auto-approval or document classification | Manual review flow sufficient for v1; model dependency adds risk |
| Public API / third-party integrations | Not required for initial launch; increases attack surface |
| Multi-language / internationalization | English-only for v1; expand if user base warrants |
| OAuth / social login (Google, Microsoft) | Email/password sufficient; reduces SSO complexity for v1 |
| Real-time collaborative editing of applications | Draft auto-save covers v1 needs; complex operational concern |
| Email notifications | In-app notifications sufficient for v1; email in v2 (NOTF-01) |
| Reporting & analytics exports | Admin dashboard covers v1; CSV export and analytics in v2 |
| Configurable workflow (custom permit types, multi-stage approval) | Fixed workflow sufficient for v1; configurable in v2 |

---

## Related Documents

- `.planning/PROJECT.md` — Project description, context, and constraints
- `.planning/REQUIREMENTS.md` — Full requirements list with traceability matrix
- `.planning/ROADMAP.md` — Phase-by-phase delivery plan with success criteria
- `project_specs/FRD-PermitManagementSystem.md` — Functional Requirements Document *(to be generated)*
- `project_specs/TechArch-PermitManagementSystem.md` — Technical Architecture Document *(to be generated)*
- `project_specs/UserStories-PermitManagementSystem.md` — User Stories *(to be generated)*

---

*PRD Version 1.0 — Generated 2026-07-21*  
*All 40 v1 requirements covered across 10 features and 5 delivery phases.*
