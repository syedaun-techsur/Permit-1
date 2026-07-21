# Story Map: Permit Management System

| Field | Value |
|---|---|
| **Product** | Permit Management System |
| **Date** | 2026-07-21 |
| **Version** | 1.0 |
| **Personas** | PER-01 Marcus Rivera (Applicant), PER-02 Diana Osei (Reviewer), PER-03 James Whitfield (Admin) |
| **Source Stories** | UserStories-PermitManagementSystem.md (40 stories, US-0.1–US-9.2) |
| **Source JTBD** | JTBD-PermitManagementSystem.md (JTBD-01.1–03.4) |
| **Source Journeys** | Journeys-PermitManagementSystem.md (JRN-01.1–03.2) |
| **Phases** | 5 (Foundation → Applicant Core → Review Workflow → Dashboards → Admin & Compliance) |
| **Status** | Draft |

---

## Overview

This Story Map organizes all 40 user stories along two dimensions:

- **Horizontal (X-axis): Backbone Activities** — the high-level activities each persona performs across their journey, derived from the journey stage sequences in Journeys-PermitManagementSystem.md. These are the "verbs" of the product.
- **Vertical (Y-axis): Story Slices** — stories stacked beneath each activity, ordered from core (walking skeleton, Phase 1) through successive enrichment phases.

**NaC (Natural Acceptance Criteria)** bridge each story to a JTBD outcome. Each NaC is derived from the intersection of a specific JTBD outcome and the journey stage context — not invented. They appear in the story map matrix and the NaC Derivation Table.

**Release phases** group stories so that each phase delivers at least one complete end-to-end journey slice before the next phase adds depth.

---

## Story Map Matrix

The backbone spans all three personas. Activities are drawn from journey stage names. Stories beneath each activity are ordered Phase 1 (walking skeleton) → Phase 5 (full depth).

### Backbone (Row 0) — Activities

| | **Authenticate & Access** | **Set Up Profile / Account** | **Create & Submit Application** | **Manage Documents** | **Track Status & Lifecycle** | **Review & Decide** | **Communicate** | **Dashboard & Visibility** | **Admin: User & Workflow Control** |
|---|---|---|---|---|---|---|---|---|---|
| **Journey** | JRN-01.1: Discover→Register / JRN-02.1: Login / JRN-03.1: Login | JRN-01.1: Profile Setup | JRN-01.1: Start Application→Submit | JRN-01.1: Upload / JRN-01.2: Upload Replacement | JRN-01.2: Morning Check→Await→Receive Approval | JRN-02.2: Review→Request→Decide | JRN-01.2: Message / JRN-02.2: Info Request | JRN-01.2: Await & Track / JRN-02.1: Read Buckets | JRN-03.1: Deactivate/Provision / JRN-03.2: Workload/Audit |
| **Primary Persona** | All | PER-01 | PER-01 | PER-01 + PER-02 | PER-01 | PER-02 | PER-01 + PER-02 | All | PER-03 |

---

### Walking Skeleton — Phase 1: Foundation

Stories that must exist before any other work can proceed. Delivers a secure, beautifully designed system that all roles can log into.

| SM-ID | Activity | Story | NaC (derived) | Persona | Phase |
|---|---|---|---|---|---|
| SM-0.1 | Authenticate & Access | US-0.1: Create an Account | JTBD-01.1 → Register: Account is created and accessible within 60 seconds of email verification | All | 1 |
| SM-0.2 | Authenticate & Access | US-0.2: Log In and Maintain Session | JTBD-01.1 → Register: User lands on role-appropriate dashboard within 2 seconds of valid login | All | 1 |
| SM-0.3 | Authenticate & Access | US-0.3: Log Out | JTBD-03.1 → Deactivate: Session is fully terminated server-side; back-button cannot restore access | All | 1 |
| SM-0.4 | Authenticate & Access | US-0.4: Reset Forgotten Password | JTBD-01.1 → Register: Password reset completes via email link without support contact | All | 1 |
| SM-0.5 | Authenticate & Access | US-0.5: Role-Based Access Control Enforcement | JTBD-03.4 → Spot-Check: API rejects wrong-role requests with 403; unauthorized attempts are logged | System | 1 |
| SM-1.1 | Dashboard & Visibility | US-1.1: Experience a Custom Visual Design | JTBD-01.1 → Discover: Interface immediately reads as a professional official tool, not a generic portal | All | 1 |
| SM-1.2 | Dashboard & Visibility | US-1.2: See Skeleton Screens During Page-Level Loads | JTBD-02.1 → Login & Land: Dashboard content area appears within 100ms (skeleton), full data in <3 sec | All | 1 |
| SM-1.3 | Dashboard & Visibility | US-1.3: Experience Smooth Micro-Interactions | JTBD-01.1 → Discover: All buttons, inputs, and cards have ≤200ms styled state transitions | All | 1 |

---

### Phase 2: Applicant Core

Delivers the complete applicant-facing journey (JRN-01.1 in full, JRN-01.2 partially). At the end of Phase 2, PER-01 can create an account, submit a permit, manage documents, and track their application status — end to end.

| SM-ID | Activity | Story | NaC (derived) | Persona | Phase |
|---|---|---|---|---|---|
| SM-2.1 | Create & Submit Application | US-2.1: Submit a New Permit Application | JTBD-01.1 → Submit & Confirm: Application confirmed with ID and timestamp within 5 seconds of submission | PER-01 | 2 |
| SM-2.2 | Create & Submit Application | US-2.2: Save Application as Draft | JTBD-01.1 → Start Application: Draft auto-saves every ≤5 sec; zero data loss on session expiry | PER-01 | 2 |
| SM-2.3 | Dashboard & Visibility | US-2.3: View My Application List | JTBD-01.2 → Morning Check: All applications with status badges visible on list load; unread counts shown per row | PER-01 | 2 |
| SM-2.4 | Dashboard & Visibility | US-2.4: View Full Application Detail | JTBD-01.2 → Spot the Alert: Full application context (form, timeline, documents, messages) on one page within 3 sec | PER-01 | 2 |
| SM-3.1 | Manage Documents | US-3.1: Upload Documents via Drag-and-Drop | JTBD-01.3 → Upload Documents: Files uploaded via drag-and-drop; appear in list immediately without page refresh | PER-01 | 2 |
| SM-3.2 | Manage Documents | US-3.2: Receive Immediate File Validation Feedback | JTBD-01.3 → Upload Documents: Invalid file rejected client-side with specific error before upload begins | PER-01 | 2 |
| SM-3.3 | Manage Documents | US-3.3: Preview Uploaded Documents Inline | JTBD-01.3 → Upload Documents: Applicant confirms correct file via inline preview without downloading | PER-01 | 2 |
| SM-3.4 | Manage Documents | US-3.4: Remove or Replace Documents Before Submission | JTBD-01.3 → Upload Documents: Old file removed and replaced in one flow; list updates immediately | PER-01 | 2 |
| SM-4.1 | Track Status & Lifecycle | US-4.1: Lifecycle Stages Are Defined and Enforced | JTBD-01.2 → Await & Track: Invalid status transitions rejected at API; every change logged with actor + timestamp | All | 2 |
| SM-4.2 | Track Status & Lifecycle | US-4.2: View Visual Lifecycle Timeline | JTBD-01.2 → Morning Check: Current stage highlighted; past stages show timestamps; readable on mobile | PER-01 | 2 |
| SM-9.1 | Authenticate & Access | US-9.1: Use the Platform on Desktop and Mobile | JTBD-01.3 → Upload Replacement: Mobile upload (tap-to-browse) works on 375px viewport; no horizontal scroll | All | 2 |

---

### Phase 3: Review Workflow

Delivers the complete reviewer journey (JRN-02.1, JRN-02.2 in full) and the second half of the applicant journey (JRN-01.2 — responding to info requests, messaging, receiving approval). At the end of Phase 3, the full applicant↔reviewer loop is closed.

| SM-ID | Activity | Story | NaC (derived) | Persona | Phase |
|---|---|---|---|---|---|
| SM-6.1 | Review & Decide | US-6.1: View Assigned Application Queue | JTBD-02.1 → Read Buckets: Reviewer sees all assigned applications sorted by action-priority; top 5 identifiable in <90 sec | PER-02 | 3 |
| SM-6.2 | Review & Decide | US-6.2: View Full Application Detail as Reviewer | JTBD-02.2 → Open Application: Docs, messages, status history, and action controls in single-pane view within 3 sec | PER-02 | 3 |
| SM-3.5 | Manage Documents | US-3.5: Reviewer Views and Downloads Application Documents | JTBD-02.2 → Review Documents: All documents viewable inline and bulk-downloadable in one action; loaded within 2 sec | PER-02 | 3 |
| SM-4.3 | Review & Decide | US-4.3: Reviewer Advances Application to Under Review | JTBD-02.2 → Open Application: "Begin Review" transitions status immediately; applicant notified within 5 sec | PER-02 | 3 |
| SM-4.4 | Review & Decide | US-4.4: Reviewer Requests Additional Information | JTBD-02.3 → Send Info Request: Request sent in <2 min from detail page; status transitions to "Additional Info Needed"; applicant notified | PER-02 | 3 |
| SM-4.5 | Track Status & Lifecycle | US-4.5: Applicant Responds to Additional Information Request | JTBD-01.3 → Upload Replacement: Applicant uploads doc and re-submits in <3 min; reviewer notified within 30 sec | PER-01 | 3 |
| SM-4.6 | Review & Decide | US-4.6: Reviewer Approves or Rejects Application | JTBD-02.2 → Approve with Rationale: Approval/rejection with mandatory rationale in <5 min; decision written to immutable audit trail | PER-02 | 3 |
| SM-4.7 | Track Status & Lifecycle | US-4.7: Receive In-App Notification on Status Change | JTBD-01.2 → Receive Approval: Applicant notified of every status change within 5 sec; clicking navigates to application detail | PER-01 | 3 |
| SM-5.1 | Communicate | US-5.1: Exchange Messages on a Permit Application | JTBD-01.4 → Message the Reviewer: Messages appear in thread within 2 sec; full conversation threaded to application; no email needed | PER-01 + PER-02 | 3 |
| SM-5.2 | Communicate | US-5.2: View Message Sender Identity and Timestamp | JTBD-01.4 → Message the Reviewer: Every message shows sender name, role badge, and timestamp; resolved server-side | PER-01 + PER-02 | 3 |
| SM-5.3 | Communicate | US-5.3: See Unread Message Counts on Application List and Dashboard | JTBD-02.4 → Catch Overnight Responses: Unread counts visible per application row; updated within 30 sec without manual refresh | PER-01 + PER-02 | 3 |
| SM-5.4 | Communicate | US-5.4: Reviewer Attaches Documents or Notes to a Message | JTBD-02.3 → Send Info Request: Reviewer can attach annotated notes to request; applicant downloads from messaging panel | PER-02 | 3 |

---

### Phase 4: Dashboards

Adds role-specific dashboards with visual progress indicators. At the end of Phase 4, every role lands on a tailored home screen that surfaces the right information without any navigation. JRN-02.1 (Morning Triage) is fully realized for PER-02.

| SM-ID | Activity | Story | NaC (derived) | Persona | Phase |
|---|---|---|---|---|---|
| SM-7.1 | Dashboard & Visibility | US-7.1: Applicant Views Their Dashboard | JTBD-01.2 → Morning Check: Active permits, pending actions, and unread messages visible at a glance; dashboard ≤30 sec stale | PER-01 | 4 |
| SM-7.2 | Dashboard & Visibility | US-7.2: Reviewer Views Their Dashboard | JTBD-02.1 → Login & Land: Queue sorted by action-priority; "Needs Action" bucket distinct; loads in <3 sec on login | PER-02 | 4 |
| SM-7.3 | Dashboard & Visibility | US-7.3: Admin Views System-Wide Dashboard | JTBD-03.2 → View Workload Distribution: Real-time reviewer workload table; application counts by status; no spreadsheet needed | PER-03 | 4 |
| SM-7.4 | Dashboard & Visibility | US-7.4: Dashboards Include Visual Progress Indicators | JTBD-02.4 → Catch Overnight Responses: Each dashboard has at least one chart/widget using design-system status colors; screen-reader accessible | All | 4 |

---

### Phase 5: Admin & Compliance

Completes the admin journey (JRN-03.1, JRN-03.2 in full) and brings the entire interface to WCAG 2.1 AA compliance. At the end of Phase 5, the product is v1-complete.

| SM-ID | Activity | Story | NaC (derived) | Persona | Phase |
|---|---|---|---|---|---|
| SM-8.1 | Admin: User & Workflow Control | US-8.1: Admin Views All Permit Applications System-Wide | JTBD-03.2 → View Workload Distribution: All applications visible in paginated list; filterable by status, reviewer, type, date | PER-03 | 5 |
| SM-8.2 | Admin: User & Workflow Control | US-8.2: Admin Creates and Manages User Accounts | JTBD-03.1 → Deactivate/Provision: Account created or deactivated in <2 min; access revoked immediately; both actions logged in audit trail | PER-03 | 5 |
| SM-8.3 | Admin: User & Workflow Control | US-8.3: Admin Assigns Reviewers to Applications | JTBD-03.2 → Bulk Reassign: Batch of 10+ applications reassigned to reviewer in one action in <5 min; reviewer notified immediately | PER-03 | 5 |
| SM-8.4 | Admin: User & Workflow Control | US-8.4: Admin Views Audit Log | JTBD-03.3 → Pull Application Audit Log: Full activity log for any application retrievable by ID in <2 min; exportable as CSV | PER-03 | 5 |
| SM-9.2 | Authenticate & Access | US-9.2: Access the Platform With Assistive Technologies | JTBD-01.2 → Morning Check (mobile): All pages pass axe-core WCAG 2.1 AA audit; zero critical violations; focus order logical | All | 5 |

---

## NaC Derivation Table

Full traceability: JTBD outcome → journey stage → Natural Acceptance Criterion → story.

| JTBD-ID | Outcome (Success Measure) | Journey Stage | NaC Statement | Story |
|---|---|---|---|---|
| JTBD-01.1 | Submit complete application in <10 min with instant confirmation | JRN-01.1: Register | Account created and accessible within 60 sec of email verification | US-0.1 |
| JTBD-01.1 | Submit complete application in <10 min with instant confirmation | JRN-01.1: Profile Setup | Business profile data pre-fills on all future applications (tooltip confirms at setup) | US-2.1 |
| JTBD-01.1 | Submit complete application in <10 min with instant confirmation | JRN-01.1: Start Application | Draft auto-saves every ≤5 sec; zero data loss on session expiry | US-2.2 |
| JTBD-01.1 | Submit complete application in <10 min with instant confirmation | JRN-01.1: Submit & Confirm | Confirmation with application ID and timestamp appears within 5 sec of submission | US-2.1 |
| JTBD-01.1 | Submit complete application in <10 min with instant confirmation | JRN-01.1: Discover | Interface reads as a professional official tool, not a generic portal, on first load | US-1.1 |
| JTBD-01.2 | Identify stage and pending actions for all applications in <60 sec | JRN-01.2: Morning Check | All active applications with status badges and "Action Required" indicators visible on list load | US-2.3, US-7.1 |
| JTBD-01.2 | Identify stage and pending actions for all applications in <60 sec | JRN-01.2: Spot the Alert | Current stage highlighted; past stages show timestamps; timeline readable on mobile | US-4.2 |
| JTBD-01.2 | Identify stage and pending actions for all applications in <60 sec | JRN-01.2: Await & Track | Visual timeline distinguishes "actively in review" from terminal states; no call required | US-4.1, US-4.2 |
| JTBD-01.2 | Identify stage and pending actions for all applications in <60 sec | JRN-01.2: Receive Approval | In-app notification fires within 5 sec of approval; certificate downloadable from detail page | US-4.7 |
| JTBD-01.3 | Upload replacement document in <3 min from application detail page | JRN-01.1: Upload Documents | Files uploaded via drag-and-drop; appear in list immediately; invalid files rejected client-side | US-3.1, US-3.2 |
| JTBD-01.3 | Upload replacement document in <3 min from application detail page | JRN-01.2: Upload Replacement | Inline PDF preview confirms correct file; "Reviewer notified automatically" toast fires on upload | US-3.3, US-4.5 |
| JTBD-01.3 | Upload replacement document in <3 min from application detail page | JRN-01.2: Upload Replacement | Mobile upload works on 375px viewport (tap-to-browse fallback); no degradation | US-9.1 |
| JTBD-01.4 | Full conversation threaded to application, no external email | JRN-01.2: Message the Reviewer | Messages appear in thread within 2 sec; sender name, role badge, and timestamp on every message | US-5.1, US-5.2 |
| JTBD-01.4 | Full conversation threaded to application, no external email | JRN-01.2: Message the Reviewer | Unread badge increments on reviewer's list row without applicant leaving the page | US-5.3 |
| JTBD-02.1 | Identify top 5 priority applications in <90 sec on login | JRN-02.1: Login & Land | Reviewer dashboard loads in <3 sec; pre-sorted into action-priority buckets | US-7.2, US-1.2 |
| JTBD-02.1 | Identify top 5 priority applications in <90 sec on login | JRN-02.1: Read the Buckets | "Needs Action," "Awaiting Applicant," "Ready for Review" buckets clearly differentiated | US-6.1, US-7.2 |
| JTBD-02.1 | Identify top 5 priority applications in <90 sec on login | JRN-02.1: Sequence the Day | Queue rows show submission date, last-updated, and unread count; top 5 identifiable without opening any application | US-6.1 |
| JTBD-02.2 | Decision made in <5 min, rationale auto-preserved in audit trail | JRN-02.2: Open Application | Single-pane application detail: documents, messages, status history, and action controls within 3 sec | US-6.2 |
| JTBD-02.2 | Decision made in <5 min, rationale auto-preserved in audit trail | JRN-02.2: Review Documents | All documents listed with upload date; one-click inline preview; "Download All" as ZIP | US-3.5 |
| JTBD-02.2 | Decision made in <5 min, rationale auto-preserved in audit trail | JRN-02.2: Approve with Rationale | Mandatory rationale field gates approval button; decision written to immutable audit trail with actor + timestamp | US-4.6 |
| JTBD-02.3 | Information request sent in <2 min, visible in messaging thread | JRN-02.2: Send Info Request | Structured request with optional annotation attachment sent in <2 min; status auto-transitions; applicant notified | US-4.4, US-5.4 |
| JTBD-02.3 | Information request sent in <2 min, visible in messaging thread | JRN-02.2: Send Info Request | Request message appears in application messaging thread; applicant can respond without email | US-5.1 |
| JTBD-02.4 | Reviewer notified of applicant response in <30 sec, queue auto-updated | JRN-02.1: Catch Overnight Responses | Applications auto-surface in "Ready for Review" bucket when applicant uploads; no email check needed | US-7.2, US-7.4 |
| JTBD-02.4 | Reviewer notified of applicant response in <30 sec, queue auto-updated | JRN-02.2: Await Applicant Response | Reviewer notified within 30 sec of applicant upload; unread message count visible on application row | US-5.3, US-4.7 |
| JTBD-03.1 | Account provisioned or deactivated in <5 min, self-service, logged | JRN-03.1: Deactivate Departed Account | Deactivation revokes all access immediately; "Access revoked immediately" confirmation shown; audit log entry within seconds | US-8.2 |
| JTBD-03.1 | Account provisioned or deactivated in <5 min, self-service, logged | JRN-03.1: Provision New Account | Account created with role in single form; welcome email auto-sent; appears in user table immediately | US-8.2 |
| JTBD-03.1 | Account provisioned or deactivated in <5 min, self-service, logged | JRN-03.1: Verify in Audit Log | Both account actions appear in audit log within seconds; CSV export available | US-8.4 |
| JTBD-03.2 | Batch reassign 10 applications in <5 min with real-time workload view | JRN-03.2: View Workload Distribution | Real-time reviewer workload table shows application count + status breakdown per reviewer | US-7.3 |
| JTBD-03.2 | Batch reassign 10 applications in <5 min with real-time workload view | JRN-03.2: Bulk Reassign Applications | Batch of 10+ applications reassigned in one action; receiving reviewers notified immediately | US-8.3 |
| JTBD-03.3 | Full activity log retrieved and exported in <2 min for any application | JRN-03.2: Pull Application Audit Log | Every event (status, upload, message, user action) for an application retrieved by ID in <2 min | US-8.4 |
| JTBD-03.3 | Full activity log retrieved and exported in <2 min for any application | JRN-03.2: Export and Share | Structured CSV export with actor, role, action, application ID, timestamp; no manual reformatting | US-8.4 |
| JTBD-03.4 | Role boundaries verified via admin interface in <10 min, no developer | JRN-03.2: Spot-Check Access Controls | Role column visible per user; unauthorized access attempts surfaced in audit log filter; no developer needed | US-0.5, US-8.4 |
| JTBD-03.4 | Role boundaries verified via admin interface in <10 min, no developer | JRN-03.1: Login to Admin Panel | Admin dashboard accessible on login; RBAC enforced at API (403 on wrong-role requests) | US-0.5, US-7.3 |

---

## Release Planning

### Phase 1: Foundation — "Secure, Premium Entry Point"

**Goal:** Users can securely access the system with the correct role, experiencing a premium-quality interface from first login.

**Theme:** Trust and access. Before any permit work can happen, users must be able to authenticate reliably and see an interface that warrants their trust.

**Journeys enabled (partially):** JRN-01.1 (Discover + Register stages only), JRN-02.1 (Login & Land only), JRN-03.1 (Login to Admin Panel only)

| Story | Title | Persona | JTBD |
|---|---|---|---|
| US-0.1 | Create an Account | All | JTBD-01.1 |
| US-0.2 | Log In and Maintain Session | All | JTBD-01.1 |
| US-0.3 | Log Out | All | JTBD-03.1 |
| US-0.4 | Reset Forgotten Password | All | JTBD-01.1 |
| US-0.5 | Role-Based Access Control Enforcement | System | JTBD-03.4 |
| US-1.1 | Experience a Custom Visual Design | All | JTBD-01.1 |
| US-1.2 | See Skeleton Screens During Page-Level Loads | All | JTBD-02.1 |
| US-1.3 | Experience Smooth Micro-Interactions | All | JTBD-01.1 |

**Stories this phase:** 8 | **P0:** 8 | **P1:** 0

**Complete journeys:** None (authentication foundation only — all journeys require Phase 2+ to be complete)

---

### Phase 2: Applicant Core — "First Permit Submitted"

**Goal:** Applicants can submit a permit application, manage their supporting documents, and see their application's status on a visual lifecycle timeline.

**Theme:** The complete applicant origination experience. By the end of Phase 2, PER-01 can execute JRN-01.1 end-to-end: create account, build profile, submit application, upload documents, see status.

**Journeys enabled (complete):** JRN-01.1 (all stages complete)

**Journeys enabled (partial):** JRN-01.2 (Morning Check + Await & Track stages; response and messaging deferred to Phase 3)

| Story | Title | Persona | JTBD |
|---|---|---|---|
| US-2.1 | Submit a New Permit Application | PER-01 | JTBD-01.1 |
| US-2.2 | Save Application as Draft | PER-01 | JTBD-01.1 |
| US-2.3 | View My Application List | PER-01 | JTBD-01.2 |
| US-2.4 | View Full Application Detail | PER-01 | JTBD-01.2 |
| US-3.1 | Upload Documents via Drag-and-Drop | PER-01 | JTBD-01.3 |
| US-3.2 | Receive Immediate File Validation Feedback | PER-01 | JTBD-01.3 |
| US-3.3 | Preview Uploaded Documents Inline | PER-01 | JTBD-01.3 |
| US-3.4 | Remove or Replace Documents Before Submission | PER-01 | JTBD-01.3 |
| US-4.1 | Lifecycle Stages Are Defined and Enforced | All | JTBD-01.2 |
| US-4.2 | View Visual Lifecycle Timeline | PER-01 | JTBD-01.2 |
| US-9.1 | Use the Platform on Desktop and Mobile | All | JTBD-01.3 |

**Stories this phase:** 11 | **P0:** 11 | **P1:** 0

**Complete journeys:** JRN-01.1 (Marcus first application end-to-end)

---

### Phase 3: Review Workflow — "Full Loop Closed"

**Goal:** Reviewers can manage their assigned applications end-to-end. Applicants and reviewers can communicate. The full applicant↔reviewer lifecycle is operational.

**Theme:** The complete review and communication loop. Phase 3 is the most complex phase — it closes the loop between applicant and reviewer, enables decisions, and delivers messaging. JRN-01.2 and both JRN-02.x journeys complete here.

**Journeys enabled (complete):** JRN-01.2 (all stages), JRN-02.1 (all stages), JRN-02.2 (all stages)

| Story | Title | Persona | JTBD |
|---|---|---|---|
| US-6.1 | View Assigned Application Queue | PER-02 | JTBD-02.1 |
| US-6.2 | View Full Application Detail as Reviewer | PER-02 | JTBD-02.2 |
| US-3.5 | Reviewer Views and Downloads Application Documents | PER-02 | JTBD-02.2 |
| US-4.3 | Reviewer Advances Application to Under Review | PER-02 | JTBD-02.2 |
| US-4.4 | Reviewer Requests Additional Information | PER-02 | JTBD-02.3 |
| US-4.5 | Applicant Responds to Additional Information Request | PER-01 | JTBD-01.3 |
| US-4.6 | Reviewer Approves or Rejects Application | PER-02 | JTBD-02.2 |
| US-4.7 | Receive In-App Notification on Status Change | PER-01 | JTBD-01.2 |
| US-5.1 | Exchange Messages on a Permit Application | PER-01 + PER-02 | JTBD-01.4, JTBD-02.3 |
| US-5.2 | View Message Sender Identity and Timestamp | PER-01 + PER-02 | JTBD-01.4 |
| US-5.3 | See Unread Message Counts | PER-01 + PER-02 | JTBD-02.4 |
| US-5.4 | Reviewer Attaches Documents or Notes to a Message | PER-02 | JTBD-02.3 |

**Stories this phase:** 12 | **P0:** 8 (US-6.1, 6.2, 3.5, 4.3–4.7) | **P1:** 4 (US-5.1–5.4)

**Complete journeys:** JRN-01.2, JRN-02.1, JRN-02.2

---

### Phase 4: Dashboards — "At-a-Glance Clarity"

**Goal:** Every role lands on a dashboard that immediately surfaces their most important information — no further navigation required to understand current state.

**Theme:** Role-specific visibility. Phase 4 transforms the product from a functional tool into an intelligent workspace. Each persona's primary "Morning Triage" moment is fully realized.

**Journeys enhanced:** JRN-01.2 (Morning Check → enhanced by DASH-01), JRN-02.1 (Login & Land → fully realized by DASH-02), JRN-03.2 (View Workload Distribution → enabled by DASH-03)

| Story | Title | Persona | JTBD |
|---|---|---|---|
| US-7.1 | Applicant Views Their Dashboard | PER-01 | JTBD-01.2 |
| US-7.2 | Reviewer Views Their Dashboard | PER-02 | JTBD-02.1 |
| US-7.3 | Admin Views System-Wide Dashboard | PER-03 | JTBD-03.2 |
| US-7.4 | Dashboards Include Visual Progress Indicators | All | JTBD-02.4 |

**Stories this phase:** 4 | **P0:** 0 | **P1:** 4

**Complete journeys:** JRN-02.1 fully realized (Reviewer morning triage with dashboard)

---

### Phase 5: Admin & Compliance — "Full Platform, Fully Compliant"

**Goal:** Admins have full control over users and assignments, system-wide permit visibility, a complete audit log, and the entire interface meets WCAG 2.1 AA standards.

**Theme:** Control, auditability, and inclusivity. Phase 5 closes the admin journeys (JRN-03.1, JRN-03.2) and makes the product compliant for regulated government use.

**Journeys enabled (complete):** JRN-03.1 (all stages), JRN-03.2 (all stages)

| Story | Title | Persona | JTBD |
|---|---|---|---|
| US-8.1 | Admin Views All Permit Applications System-Wide | PER-03 | JTBD-03.2 |
| US-8.2 | Admin Creates and Manages User Accounts | PER-03 | JTBD-03.1 |
| US-8.3 | Admin Assigns Reviewers to Applications | PER-03 | JTBD-03.2 |
| US-8.4 | Admin Views Audit Log | PER-03 | JTBD-03.3 |
| US-9.2 | Access the Platform With Assistive Technologies | All | JTBD-01.2 |

**Stories this phase:** 5 | **P0:** 1 (US-9.2) | **P1:** 4

**Complete journeys:** JRN-03.1, JRN-03.2

---

## Coverage Analysis

### Persona Coverage by Phase

| Phase | PER-01 Applicant | PER-02 Reviewer | PER-03 Admin |
|---|---|---|---|
| Phase 1: Foundation | ✓ (auth + design) | ✓ (auth + design) | ✓ (auth + design) |
| Phase 2: Applicant Core | ✓ **Primary** (full origination) | — (receives applications, cannot yet act) | — |
| Phase 3: Review Workflow | ✓ (responds to info requests, receives decisions) | ✓ **Primary** (full workflow loop) | — |
| Phase 4: Dashboards | ✓ (applicant dashboard) | ✓ (reviewer dashboard) | ✓ (admin dashboard) |
| Phase 5: Admin & Compliance | ✓ (WCAG) | ✓ (WCAG) | ✓ **Primary** (user mgmt, audit) |

**Note:** PER-03 (Admin) has no dedicated stories in Phases 2–3 beyond authentication. This is intentional — admin functions depend on applications and users existing (Phases 2–3 data) before admin tooling is meaningful. Phase 4 gives Admin a dashboard; Phase 5 delivers full admin tooling.

---

### JTBD Coverage by Phase

| JTBD | Job | Phase Addressed |
|---|---|---|
| JTBD-01.1 | Submit complete application in <10 min | Phase 1 (auth) + Phase 2 (form, docs, confirm) |
| JTBD-01.2 | Know where every application stands without calling | Phase 2 (list, timeline) + Phase 3 (notifications) + Phase 4 (dashboard) |
| JTBD-01.3 | Satisfy document requests without re-submitting | Phase 2 (upload, validate, preview) + Phase 3 (replace + respond) |
| JTBD-01.4 | Communicate directly with reviewer on application | Phase 3 (messaging panel) |
| JTBD-02.1 | Identify priority applications in <90 sec on login | Phase 3 (reviewer queue) + Phase 4 (reviewer dashboard) |
| JTBD-02.2 | Evaluate and decide with complete traceable record | Phase 3 (detail view, doc download, approve/reject) |
| JTBD-02.3 | Request and receive clarification in application record | Phase 3 (info request + messaging + attachments) |
| JTBD-02.4 | Know immediately when applicant has responded | Phase 3 (notifications, unread counts) + Phase 4 (dashboard auto-surface) |
| JTBD-03.1 | Onboard/offboard staff without vendor involvement | Phase 5 (user management) |
| JTBD-03.2 | Balance reviewer workload without spreadsheet | Phase 4 (admin dashboard) + Phase 5 (assignment + all-apps view) |
| JTBD-03.3 | Reconstruct decision history on demand for audits | Phase 5 (audit log + CSV export) |
| JTBD-03.4 | Confirm access controls are enforced as configured | Phase 1 (RBAC API) + Phase 5 (audit log unauthorized filter) |

**All 12 JTBD outcomes are addressed across the five phases. No JTBD is left without at least one story.**

---

### Gap Analysis

#### Journey Stages Without Story Coverage
None. All 35 journey stages across 6 journeys (JRN-01.1, JRN-01.2, JRN-02.1, JRN-02.2, JRN-03.1, JRN-03.2) map to at least one story in the plan.

#### JTBD Outcomes Without Derived NaC
None. All 12 JTBD outcomes (JTBD-01.1 through JTBD-03.4) have at least one NaC derived and traceable in the NaC Derivation Table.

#### Orphan Stories (Stories Not Mapped to Any Journey Stage)
None. All 40 stories appear in the story map matrix above. 

The following stories are cross-cutting (they support multiple journeys and stages) rather than mapping to a single stage:
- **US-1.1, US-1.2, US-1.3** — Design system and UX polish; present across all stages of all journeys
- **US-4.1** — Lifecycle enforcement; underpins every status transition across JRN-01.x, JRN-02.x, JRN-03.x
- **US-9.1, US-9.2** — Responsive and accessibility; horizontal concerns spanning all journeys

These are placed in the matrix under their primary backbone activity and flagged with "All" persona.

#### Stories Crossing Phase Boundaries
| Story | Phase Span | Reason |
|---|---|---|
| US-4.1 | Phase 2→3 | Lifecycle enforcement starts in Phase 2 (applicant submission) but is extended in Phase 3 (reviewer transitions) |
| US-9.1 | Phase 2→5 | Responsive design introduced in Phase 2 (applicant mobile use case) but verified throughout |
| US-9.2 | Phase 2→5 | Accessibility built in from Phase 2; full WCAG audit completed in Phase 5 |

---

## NaC-to-Acceptance Criteria Alignment

Verifies that each NaC derived from JTBD outcomes is consistent with the corresponding UserStory acceptance criteria.

| SM-ID | Story | NaC Statement | Aligned AC in UserStory | Alignment |
|---|---|---|---|---|
| SM-0.1 | US-0.1 | Account created and accessible within 60 sec of email verification | "New account is immediately accessible for login" + "A confirmation screen acknowledges successful creation" | ✓ |
| SM-0.2 | US-0.2 | User lands on role-appropriate dashboard within 2 seconds of valid login | "Valid credentials redirect user to their role-appropriate dashboard within 2 seconds" | ✓ Exact match |
| SM-0.5 | US-0.5 | API rejects wrong-role requests with 403; unauthorized attempts are logged | "Every protected endpoint returns HTTP 403 for wrong-role requests" + "Unauthorized access attempts are logged in the audit trail" | ✓ Exact match |
| SM-1.1 | US-1.1 | Interface reads as professional official tool on first load | "No element looks like an unstyled HTML default; every interactive element has an intentional designed state" | ✓ |
| SM-2.1 | US-2.1 | Confirmation with application ID and timestamp within 5 sec of submission | "A confirmation screen displays with the application ID and submission timestamp" | ✓ |
| SM-2.2 | US-2.2 | Draft auto-saves every ≤5 sec; zero data loss on session expiry | "Auto-save triggers on form field change with debounce ≤5 seconds" + "Zero data loss on session expiry" | ✓ Exact match |
| SM-3.1 | US-3.1 | Files uploaded via drag-and-drop; appear in list immediately | "On successful upload, files immediately appear in the document list without requiring a page refresh" | ✓ Exact match |
| SM-3.2 | US-3.2 | Invalid file rejected client-side with specific error before upload begins | "Accepted file types... any other type is rejected client-side before upload begins" + "Error messages are specific" | ✓ Exact match |
| SM-4.2 | US-4.2 | Current stage highlighted; past stages show timestamps; readable on mobile | "The current stage is highlighted" + "Completed stages display the date and time" + "Timeline is readable on mobile" | ✓ Exact match |
| SM-4.4 | US-4.4 | Structured request sent in <2 min; status transitions to "Additional Info Needed"; applicant notified | "Application status changes to 'Additional Info Needed'" + "Applicant receives an in-app notification" | ✓ |
| SM-4.5 | US-4.5 | Applicant uploads doc and re-submits in <3 min; reviewer notified within 30 sec | "Clicking 'Re-Submit for Review' changes status back to 'Under Review'" + "Reviewer receives an in-app notification" | ✓ |
| SM-4.6 | US-4.6 | Mandatory rationale field gates approval; decision written to immutable audit trail | "Both actions require a mandatory reason field before confirmed" + "decision, reason, actor, and timestamp captured in the audit log" | ✓ Exact match |
| SM-4.7 | US-4.7 | Applicant notified of every status change within 5 sec | "Notifications are delivered within 5 seconds of the triggering status change" | ✓ Exact match |
| SM-5.1 | US-5.1 | Messages appear in thread within 2 sec; no email needed | "New messages appear in the thread immediately (within 2 seconds of sending)" | ✓ Exact match |
| SM-5.3 | US-5.3 | Unread counts visible per application row; updated within 30 sec | "Unread counts update in real time or within 30 seconds without a manual refresh" | ✓ Exact match |
| SM-6.1 | US-6.1 | Top 5 identifiable in <90 sec without spreadsheet | "Diana can identify her top 5 priority applications within 90 seconds of logging in (usability target)" | ✓ Exact match |
| SM-6.2 | US-6.2 | All content on single-pane view within 3 sec | "Page loads all content within 3 seconds... skeleton screens used during fetch" | ✓ Exact match |
| SM-7.2 | US-7.2 | Queue sorted by action-priority; loads in <3 sec | "Reviewer dashboard shows assigned applications sorted by action-required status" + "Diana can identify her top 5 priority applications within 90 seconds" | ✓ |
| SM-8.2 | US-8.2 | Account created or deactivated in <2 min; access revoked immediately; logged | "Deactivate action immediately revokes all session tokens" + "all actions logged in audit trail" + "James can complete in under 2 minutes" | ✓ Exact match |
| SM-8.4 | US-8.4 | Full activity log for any application retrievable by ID in <2 min; exportable as CSV | "Admin can retrieve a complete activity log for any application within 2 minutes" + "Log is exportable as CSV" | ✓ Exact match |
| SM-9.1 | US-9.1 | Mobile upload works on 375px viewport; no horizontal scroll | "All pages fully functional on viewport widths from 375px" + "Document upload drag-and-drop degrades gracefully on touch devices (tap-to-browse fallback)" | ✓ Exact match |
| SM-9.2 | US-9.2 | All pages pass axe-core WCAG 2.1 AA; zero critical violations | "All pages pass automated WCAG 2.1 AA audit (axe-core or equivalent) with zero critical violations" | ✓ Exact match |

**Alignment summary:** All 22 sampled NaC statements are consistent with their corresponding UserStory acceptance criteria. No NaC was found to contradict or exceed the scope of its source story's AC.

---

## Story Count Summary

| Phase | Stories | P0 | P1 | Primary Journeys Completed |
|---|---|---|---|---|
| Phase 1: Foundation | 8 | 8 | 0 | — (foundation only) |
| Phase 2: Applicant Core | 11 | 11 | 0 | JRN-01.1 ✓ |
| Phase 3: Review Workflow | 12 | 8 | 4 | JRN-01.2 ✓, JRN-02.1 ✓, JRN-02.2 ✓ |
| Phase 4: Dashboards | 4 | 0 | 4 | JRN-02.1 fully realized ✓ |
| Phase 5: Admin & Compliance | 5 | 1 | 4 | JRN-03.1 ✓, JRN-03.2 ✓ |
| **Total** | **40** | **28** | **12** | **6 of 6 journeys ✓** |

---

*Story Map generated: 2026-07-21*  
*Source: UserStories-PermitManagementSystem.md (v1.0), JTBD-PermitManagementSystem.md, Journeys-PermitManagementSystem.md, Personas-PermitManagementSystem.md*  
*All 40 stories mapped · All 12 JTBD outcomes addressed · All 6 journeys covered · Zero orphan stories · Zero unmapped NaC*
