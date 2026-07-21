# Personas: Permit Management System

| Field | Value |
|---|---|
| **Product** | Permit Management System |
| **Date** | 2026-07-21 |
| **Related Requirements** | REQUIREMENTS.md, PROJECT.md |
| **Persona Count** | 3 |
| **Status** | Draft |

---

## Persona Summary

| ID | Name | Role | Primary Goal |
|---|---|---|---|
| PER-01 | Marcus Rivera | Permit Applicant (Small Business Owner) | Submit permit applications without bureaucratic friction and track their status without having to call the office |
| PER-02 | Diana Osei | Permit Reviewer (Permitting Officer) | Efficiently evaluate and process assigned applications while maintaining clear, documented communication with applicants |
| PER-03 | James Whitfield | System Administrator (Permitting Office Admin) | Keep the platform running smoothly, manage user access, and have system-wide visibility to support the team |

---

## PER-01: Marcus Rivera

**Permit Applicant — Small Business Owner**

### Role & Context

Marcus is a 41-year-old owner of a mid-sized construction and renovation company. He files 6–12 permit applications per month across multiple projects — residential remodels, commercial tenant improvements, and occasional event permits for client site launches. He has been in the industry for 15 years and remembers when everything was submitted at a physical counter, but adopted digital tools for his business operations years ago. He is comfortable with web-based software, uses project management platforms daily, but has low tolerance for confusing government portals.

Marcus works from both his office desktop and his phone when on-site. His biggest frustrations are the opacity of the permitting process — he often doesn't know if a submission landed, why it's stalled, or what exactly is missing — and the time lost chasing status updates via phone calls and emails. He sees the permitting process as a necessary overhead he wants to minimize, not a task he wants to master.

He is the primary applicant persona, and his use of the system spans the full application lifecycle from initial submission through approval.

### Goals

- Submit a permit application quickly without re-entering the same information multiple times (PERM-01, PERM-02)
- Know exactly where each active application stands at any moment without contacting the office (STAT-02, DASH-01)
- Upload required documents in one place, understand what's missing, and replace files without re-submitting the whole application (DOCS-01, DOCS-02, DOCS-04)
- Communicate directly with the reviewer on a specific application rather than routing through a general inbox (MSG-01, MSG-02)
- Get notified immediately when an action is required or a decision is made (STAT-07)

### Pain Points

- Currently emails scanned documents and then calls the office to confirm receipt — no confirmation loop
- Has no visibility into review stage; learns of issues only when called or emailed days later
- Receives requests for additional information as vague emails with no reference to the specific application
- Must track the status of multiple concurrent applications in a personal spreadsheet
- Frequently re-enters the same business information for each new application

### Technical Expertise

**Intermediate.** Uses project management tools (Procore, Buildertrend), comfortable with web forms and file uploads. Avoids anything requiring technical configuration. Expects the platform to behave predictably and surface errors clearly. Uses Chrome on desktop and Safari on iPhone.

### Top Tasks

1. **Submit a new permit application** — 6–12x/month, critical path
2. **Check status of active applications** — daily, multiple times per day during active projects
3. **Upload or replace a required document** — per application, often triggered by reviewer requests
4. **Respond to a reviewer's request for additional information** — as needed, time-sensitive
5. **Message a reviewer about a specific application** — as needed, replaces phone calls

### Success Criteria

- Submits a complete permit application in under 10 minutes from an empty form
- Can see the current stage and pending actions for all active applications on the dashboard in a single view
- Receives an in-app notification within seconds of a status change
- Can upload, preview, and replace a document without navigating away from the application detail page
- Never needs to call the office to ask "what's the status?" on a submitted application

---

## PER-02: Diana Osei

**Permit Reviewer — Permitting Officer**

### Role & Context

Diana is a 34-year-old permitting officer at a mid-size municipal planning department. She has been in her role for 5 years and manages a queue of 30–50 active applications at any given time across permit categories including construction, zoning variances, and event permits. She reports to the permitting office director and works alongside 4 other reviewers who share the incoming application queue.

Diana spends most of her day in the permitting platform — reviewing submissions, requesting clarifications, and making approval or rejection decisions. She is methodical and documentation-conscious; her department is subject to audit, so every decision needs a paper trail. She is experienced with government web systems and has low expectations for usability — but is genuinely excited when tools are well-designed and reduce manual work.

Her core challenge is managing volume and prioritization: knowing which applications need action today, which are waiting on applicants, and which are approaching deadline. She currently toggles between a legacy portal, email, and a shared team spreadsheet to piece together a coherent workload view. She is the primary reviewer persona and uses every reviewer-facing feature.

### Goals

- See all applications assigned to her in a single prioritized queue — no spreadsheet cross-referencing (PERM-05, DASH-02)
- Advance, request information, approve, or reject an application entirely within the platform with documented reasoning (STAT-03, STAT-04, STAT-06)
- Communicate with applicants directly on the application record — not through external email (MSG-01, MSG-02, MSG-04)
- Access and download all supporting documents for an application from one place (DOCS-05)
- Know at a glance which applicants have responded to information requests so she can reprioritize her queue (STAT-05, DASH-02)

### Pain Points

- Currently uses a shared spreadsheet to track who owns which application and what stage it's in
- Applicant communications happen in a separate email thread, making it hard to reconstruct the decision history for audits
- Has no reliable way to know when an applicant has uploaded new documents or responded to a request
- Spends significant time per application hunting for documents scattered across emails and shared drives
- Approval and rejection decisions are recorded in an external log, disconnected from the application itself

### Technical Expertise

**Intermediate to Advanced.** Comfortable with complex web applications; has used government legacy portals and modern SaaS tools. Appreciates keyboard navigation and table views for high-volume work. Uses Chrome on desktop; rarely uses mobile for review work.

### Top Tasks

1. **Review assigned application queue and identify actions needed today** — every morning, critical
2. **Open an application, review documents, and advance its status** — 8–15 times/day, core task
3. **Request additional information from an applicant with a specific message** — 5–10 times/day
4. **Approve or reject an application with documented rationale** — 3–8 times/day, audit-sensitive
5. **Message an applicant for clarification on a specific application** — as needed, replaces email

### Success Criteria

- Reviewer dashboard immediately surfaces all applications requiring action, sorted by priority, without any supplemental spreadsheet
- Can move an application from review to a decision (approve/reject) in under 5 minutes with documented reason
- All applicant communication is threaded per application and accessible from the application detail view
- Can download all attached documents for an application in one action
- Decision history (status changes + rationale) is automatically preserved per application for audit purposes

---

## PER-03: James Whitfield

**System Administrator — Permitting Office IT/Operations Lead**

### Role & Context

James is a 48-year-old IT and operations lead at the municipal permitting office. He is not a domain expert in permitting law, but he owns the operational integrity of the permitting platform. His responsibilities include provisioning accounts for new reviewers and applicants, managing access control, assigning applications to reviewers, and monitoring system activity for irregularities or compliance concerns.

James works from a desktop in the office and rarely accesses the platform from mobile. He has a strong technical background — he manages several other municipal SaaS tools — and expects administrative interfaces to be information-dense and precise. He is the least frequent user of the system day-to-day but becomes heavily engaged during onboarding of new staff, compliance audits, or when something breaks.

His primary concern is control and visibility: he needs to trust that only authorized users can access the platform, that every meaningful action is logged, and that he can intervene quickly if something is misconfigured. He does not submit permits or review them, but he enables everyone who does.

### Goals

- Create, deactivate, and manage user accounts without submitting a support ticket to a vendor (ADMN-01)
- Assign permit applications to specific reviewers and rebalance workload when staffing changes (ADMN-02)
- Access a complete audit log of status changes and key platform actions for compliance reviews (ADMN-03)
- See system-wide application statistics — volume, status distribution, reviewer workload — in one view (DASH-03, PERM-07)
- Trust that RBAC is enforced at the API layer so applicants cannot access reviewer data and vice versa (AUTH-05)

### Pain Points

- Currently has no audit log in the legacy system — must reconstruct decision history from email threads when audited
- Reviewer workload is tracked in a shared spreadsheet that goes stale within hours
- Deactivating a departed employee's access requires contacting a vendor, causing delays and security exposure
- Has no visibility into system-wide processing time or bottlenecks; reports are manual and quarterly
- User role changes require manual database updates by a vendor — not self-service

### Technical Expertise

**Advanced.** Manages enterprise SaaS platforms; comfortable with admin dashboards, audit logs, user tables, and access control configuration. Expects tables with sort/filter, bulk actions, and export capabilities. Uses Chrome on desktop exclusively.

### Top Tasks

1. **Provision or deactivate a user account and set their role** — on staff changes, time-sensitive for offboarding
2. **Assign or reassign permit applications to reviewers** — weekly, or when caseload is unbalanced (ADMN-02)
3. **Review audit logs for a specific application or user** — on compliance audit or incident investigation (ADMN-03)
4. **Monitor system-wide application volume and reviewer workload from the admin dashboard** — weekly (DASH-03)
5. **Verify access control is working as expected (role-based data isolation)** — periodically, security hygiene

### Success Criteria

- Can provision a new reviewer account and assign their first application in under 5 minutes without vendor involvement
- Audit log captures all status changes, document uploads, user creation, and role changes with actor, timestamp, and application reference
- Admin dashboard shows real-time application counts by status and reviewer workload distribution — no spreadsheet needed
- Deactivating an account immediately revokes all access — no grace period or vendor ticket required
- Admin role is fully isolated from applicant and reviewer data scopes at the API layer

---

## Persona Relationships

| Persona | Interacts With | Via | Nature of Interaction |
|---|---|---|---|
| PER-01 Marcus (Applicant) | PER-02 Diana (Reviewer) | Integrated messaging panel (MSG-01), status notifications (STAT-07) | Applicant submits; reviewer requests clarification or issues decision |
| PER-02 Diana (Reviewer) | PER-01 Marcus (Applicant) | Messaging panel, status transitions (STAT-03–06) | Reviewer drives application lifecycle; communicates information needs |
| PER-02 Diana (Reviewer) | PER-03 James (Admin) | Admin assigns applications (ADMN-02); audit log (ADMN-03) | Admin manages reviewer workload and monitors reviewer actions |
| PER-03 James (Admin) | PER-01 Marcus (Applicant) | User management (ADMN-01); audit log | Admin provisions accounts; can view all applications (PERM-07) |
| PER-03 James (Admin) | PER-02 Diana (Reviewer) | Application assignment (ADMN-02); workload dashboard (DASH-03) | Admin balances caseload; monitors reviewer activity |

---

## Feature-Persona Matrix

| Requirement | Feature Description | PER-01 Marcus (Applicant) | PER-02 Diana (Reviewer) | PER-03 James (Admin) |
|---|---|---|---|---|
| AUTH-01–04 | Account creation, login, logout, password reset | **Primary** | **Primary** | **Primary** |
| AUTH-05 | Role-based access control enforcement | None | Secondary | **Primary** |
| PERM-01 | Submit new permit application | **Primary** | None | None |
| PERM-02 | Save application as draft | **Primary** | None | None |
| PERM-03 | View own application list | **Primary** | None | None |
| PERM-04 | View application detail (applicant) | **Primary** | None | None |
| PERM-05 | Reviewer: view assigned application list | None | **Primary** | None |
| PERM-06 | Reviewer: view any application detail | None | **Primary** | None |
| PERM-07 | Admin: view all applications | None | None | **Primary** |
| DOCS-01 | Upload documents (drag-and-drop) | **Primary** | None | None |
| DOCS-02 | File validation and error feedback | **Primary** | None | None |
| DOCS-03 | Preview documents inline | **Primary** | Secondary | None |
| DOCS-04 | Remove/replace documents before submission | **Primary** | None | None |
| DOCS-05 | Reviewer: view and download all documents | None | **Primary** | None |
| STAT-01 | Lifecycle stage progression | **Primary** | **Primary** | Secondary |
| STAT-02 | Visual lifecycle timeline (applicant) | **Primary** | None | None |
| STAT-03 | Reviewer: advance to Under Review | None | **Primary** | None |
| STAT-04 | Reviewer: request additional information | None | **Primary** | None |
| STAT-05 | Applicant: respond to info request | **Primary** | Secondary | None |
| STAT-06 | Reviewer: approve or reject with reason | None | **Primary** | None |
| STAT-07 | In-app notification on status change | **Primary** | Secondary | None |
| MSG-01 | Integrated messaging panel | **Primary** | **Primary** | None |
| MSG-02 | Message metadata (sender, role, timestamp) | **Primary** | **Primary** | None |
| MSG-03 | Unread message counts on list/dashboard | **Primary** | **Primary** | None |
| MSG-04 | Reviewer: attach documents/notes to message | None | **Primary** | None |
| DASH-01 | Applicant dashboard: active permits, messages | **Primary** | None | None |
| DASH-02 | Reviewer dashboard: queue by priority, messages | None | **Primary** | None |
| DASH-03 | Admin dashboard: system-wide stats | None | None | **Primary** |
| DASH-04 | Visual progress indicators, activity feed | **Primary** | **Primary** | Secondary |
| ADMN-01 | Admin: manage user accounts | None | None | **Primary** |
| ADMN-02 | Admin: assign reviewers to applications | None | Secondary | **Primary** |
| ADMN-03 | Admin: audit logs | None | None | **Primary** |
| UX-01 | Responsive (desktop + mobile) | **Primary** | Secondary | None |
| UX-02 | WCAG 2.1 AA accessibility | **Primary** | **Primary** | Secondary |
| UX-03–05 | Skeleton screens, micro-interactions, design tokens | **Primary** | **Primary** | Secondary |

**Legend:** **Primary** = core persona for this feature · Secondary = benefits from but not primary driver · None = not applicable

---

*Personas generated: 2026-07-21*
*Derived from: PROJECT.md, REQUIREMENTS.md*
*Next: Use these personas to drive JTBD, User Journeys, User Stories, and UX design decisions*
