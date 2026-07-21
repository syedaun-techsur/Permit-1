# Jobs-to-be-Done: Permit Management System

| Field | Value |
|---|---|
| **Product** | Permit Management System |
| **Date** | 2026-07-21 |
| **Related Personas** | PER-01 Marcus Rivera, PER-02 Diana Osei, PER-03 James Whitfield |
| **Related PRD** | PRD-PermitManagementSystem.md |
| **Status** | Draft |

---

## JTBD Summary Table

| JTBD-ID | Persona | Job Statement (abbreviated) | Priority |
|---|---|---|---|
| JTBD-01.1 | PER-01 Marcus (Applicant) | Get a complete permit application submitted without revisiting the process | P0 |
| JTBD-01.2 | PER-01 Marcus (Applicant) | Know where every active application stands without contacting the office | P0 |
| JTBD-01.3 | PER-01 Marcus (Applicant) | Satisfy document requests without re-submitting the entire application | P0 |
| JTBD-01.4 | PER-01 Marcus (Applicant) | Communicate directly with the reviewer on a specific application | P1 |
| JTBD-02.1 | PER-02 Diana (Reviewer) | Identify which applications need action today without a supplemental spreadsheet | P0 |
| JTBD-02.2 | PER-02 Diana (Reviewer) | Evaluate and decide on an application with a complete, traceable record | P0 |
| JTBD-02.3 | PER-02 Diana (Reviewer) | Request and receive clarification within the application record | P1 |
| JTBD-02.4 | PER-02 Diana (Reviewer) | Know immediately when an applicant has responded so I can reprioritize | P1 |
| JTBD-03.1 | PER-03 James (Admin) | Onboard and offboard staff without vendor involvement or delay | P0 |
| JTBD-03.2 | PER-03 James (Admin) | Balance reviewer workload without a shared spreadsheet | P1 |
| JTBD-03.3 | PER-03 James (Admin) | Reconstruct any application's decision history on demand for audits | P0 |
| JTBD-03.4 | PER-03 James (Admin) | Confirm that access controls are enforced as configured | P1 |

---

## PER-01: Marcus Rivera — Permit Applicant (Small Business Owner)

---

### JTBD-01.1: Submit a Complete Application Without Revisiting the Process

**Job Statement:**
When I need to open a new project and a permit is a prerequisite, I want to submit a complete, well-formed application in a single sitting, so I can move my project forward without losing time to process re-entry or rework.

**Current Alternatives:**
- Fills out paper or legacy web forms, emails scanned documents, then calls the office to confirm receipt
- Re-enters the same business entity information (name, license, address) for every new application
- Has no confirmation loop — does not know whether the submission registered until staff responds

**Hiring Criteria:**
- Structured form captures all required fields and surfaces validation errors inline before submission
- Business profile data (name, license number, contact) pre-fills from a saved profile on new applications
- Confirmation screen and in-app notification confirm receipt immediately on submission
- Application is created in a Draft state allowing save-and-resume before final submit
- Completes in under 10 minutes from an empty form for a standard permit type

**Success Measure:** Marcus submits a complete, validated permit application in under 10 minutes without a follow-up call to confirm receipt.

**Related Features:** PERM-01, PERM-02, AUTH-01–04
**Priority:** P0

---

### JTBD-01.2: Know Where Every Active Application Stands Without Contacting the Office

**Job Statement:**
When I have multiple active permit applications across concurrent projects, I want to see the current stage and any pending actions for every application at a glance, so I can allocate my time to the right projects and eliminate status-chase phone calls.

**Current Alternatives:**
- Maintains a personal spreadsheet of application IDs, dates submitted, and status guesses
- Calls the permitting office 2–3 times per week to ask "where does my application stand?"
- Learns of problems only after days of silence — no proactive notification

**Hiring Criteria:**
- Dashboard lists all active applications with their current lifecycle stage (Submitted → Under Review → Additional Info Needed → Approved/Rejected)
- Visual timeline indicator shows exactly which stage each application is in and what stage comes next
- Status badges make it immediately obvious which applications require action from Marcus
- In-app notifications fire within seconds of any status change on any application

**Success Measure:** Marcus can identify the current stage and any pending action for all active applications within 60 seconds of logging in, without placing a call or sending an email.

**Related Features:** STAT-01, STAT-02, STAT-07, DASH-01, PERM-03, PERM-04
**Priority:** P0

---

### JTBD-01.3: Satisfy Document Requests Without Re-Submitting the Entire Application

**Job Statement:**
When a reviewer requests a missing or corrected document, I want to upload the new file directly on the existing application and receive confirmation it was received, so I can resolve the request quickly without losing my place in the review queue.

**Current Alternatives:**
- Receives vague email requests with no reference to application ID or specific document
- Must re-email the corrected document and call to confirm it was matched to the right application
- Has no way to preview what was already uploaded — guesses whether the prior version was correct

**Hiring Criteria:**
- Reviewer requests link directly to the specific application and indicate exactly which document is needed
- Applicant can upload, preview inline, and replace a document on the application detail page without leaving that context
- File validation (type, size, completeness) surfaces errors before upload completes
- Upload triggers an automatic notification to the reviewer confirming receipt

**Success Measure:** Marcus uploads and confirms a replacement document in under 3 minutes of receiving the information request, without leaving the application detail page.

**Related Features:** DOCS-01, DOCS-02, DOCS-03, DOCS-04, STAT-05, STAT-07
**Priority:** P0

---

### JTBD-01.4: Communicate Directly With the Reviewer on a Specific Application

**Job Statement:**
When I have a question about why an application is stalled or what exactly a reviewer needs, I want to send a message that is threaded to that specific application and receive a response in the same place, so I can get clarity without routing through a general inbox or playing phone tag.

**Current Alternatives:**
- Calls the general permitting office number and waits in a queue
- Sends emails to a shared departmental address — responses are delayed and lack application context
- Receives replies that reference vague descriptions rather than the specific application record

**Hiring Criteria:**
- Messaging panel is accessible from the application detail page and scoped to that application
- Messages show sender name, role (Applicant/Reviewer), and timestamp
- Unread message badge on the dashboard and application list view indicates new reviewer replies
- No external email required for any part of the conversation

**Success Measure:** Marcus sends a question to the reviewer and receives a response without ever leaving the platform or using email — full conversation is retrievable on the application detail page.

**Related Features:** MSG-01, MSG-02, MSG-03, DASH-01
**Priority:** P1

---

## PER-02: Diana Osei — Permit Reviewer (Permitting Officer)

---

### JTBD-02.1: Identify Which Applications Need Action Today Without a Supplemental Spreadsheet

**Job Statement:**
When I start my workday with a queue of 30–50 active applications, I want to see immediately which ones require action from me today — sorted by urgency and deadline — so I can sequence my work without manually cross-referencing a spreadsheet or email inbox.

**Current Alternatives:**
- Checks a shared team spreadsheet updated manually by reviewers — goes stale within hours
- Scans email inbox for applicant replies or manager assignments to infer priorities
- Relies on memory and informal team communication to know what needs attention

**Hiring Criteria:**
- Reviewer dashboard shows all assigned applications sorted by action-needed status and submission date
- Applications awaiting applicant response are clearly differentiated from those awaiting Diana's review
- New applicant responses and document uploads surface automatically — no manual refresh required
- Dashboard loads in under 3 seconds with full current state on login

**Success Measure:** Diana identifies her top 5 priority applications within 90 seconds of logging in, with no reference to a spreadsheet or external tool.

**Related Features:** PERM-05, PERM-06, DASH-02, STAT-01, STAT-05, MSG-03
**Priority:** P0

---

### JTBD-02.2: Evaluate and Decide on an Application With a Complete, Traceable Record

**Job Statement:**
When I am ready to make a final determination on an application, I want to review all submitted documents and the full communication history in one place and record my approval or rejection with documented reasoning, so I can close the application confidently knowing the decision is auditable.

**Current Alternatives:**
- Downloads documents from email attachments and a shared drive — often mismatched to application versions
- Writes approval/rejection rationale in an external log disconnected from the application record
- Decision history is reconstructed manually from email threads during audits — incomplete and time-consuming

**Hiring Criteria:**
- Application detail view shows all submitted documents with the ability to preview and bulk-download in one action
- Approve and Reject actions require a mandatory rationale field before confirming the decision
- Status changes and their reasons are automatically recorded with actor name and timestamp on the application record
- Decision is irreversible except by an admin — prevents accidental overwrites

**Success Measure:** Diana moves an application from Under Review to a final decision (Approve or Reject) in under 5 minutes, with the rationale and timestamp automatically preserved in the application's audit trail.

**Related Features:** DOCS-05, STAT-03, STAT-06, PERM-06, DASH-02, ADMN-03
**Priority:** P0

---

### JTBD-02.3: Request and Receive Clarification Within the Application Record

**Job Statement:**
When a submission is incomplete or ambiguous, I want to send a specific, actionable information request to the applicant that is threaded to the application, so I can move to a decision as soon as the applicant responds without managing a separate email thread.

**Current Alternatives:**
- Sends clarification requests via email — applicant responses arrive in a general inbox with no application reference
- Must manually re-associate email replies to the correct application for record-keeping
- Information requests contain vague language because there is no template or attachment capability

**Hiring Criteria:**
- Information request action places the application in "Additional Info Needed" status and sends an in-app notification to the applicant
- Request message is attached to the application messaging thread — applicant sees it in context
- Diana can attach documents or annotated notes to the request message
- When applicant responds, Diana receives an in-app notification and the application resurfaces in her queue

**Success Measure:** Diana sends a structured information request in under 2 minutes from the application detail page, and the request is fully retrievable as part of the application's communication history.

**Related Features:** STAT-04, MSG-01, MSG-02, MSG-04, STAT-07, DASH-02
**Priority:** P1

---

### JTBD-02.4: Know Immediately When an Applicant Has Responded So I Can Reprioritize

**Job Statement:**
When I am waiting on applicant responses across multiple open requests, I want to be alerted the moment an applicant uploads documents or sends a reply, so I can reprioritize my queue around ready-to-advance applications rather than manually polling for updates.

**Current Alternatives:**
- Periodically refreshes her email inbox looking for applicant replies
- Checks the shared spreadsheet column for "applicant responded" status — updated inconsistently
- Finds out about responses from colleagues or during her next manual review of the application

**Hiring Criteria:**
- In-app notification fires immediately when an applicant uploads a document or sends a message
- Application moves from a "Waiting on Applicant" filter bucket to the "Ready for Review" bucket automatically on response
- Unread message counts are visible on the application list without opening each record
- Notification is actionable — tapping/clicking navigates directly to the application detail

**Success Measure:** Diana is notified of an applicant response within 30 seconds of submission and the application is surfaced at the top of her actionable queue automatically.

**Related Features:** STAT-05, STAT-07, MSG-03, DASH-02, DASH-04
**Priority:** P1

---

## PER-03: James Whitfield — System Administrator (Permitting Office IT/Ops Lead)

---

### JTBD-03.1: Onboard and Offboard Staff Without Vendor Involvement or Delay

**Job Statement:**
When a new reviewer joins the department or a staff member leaves, I want to create or deactivate their account and set their role immediately from the admin interface, so I can eliminate security gaps from delayed offboarding and avoid waiting on a vendor support ticket.

**Current Alternatives:**
- Deactivating a departed employee requires contacting a vendor — response times of hours to days create a security exposure window
- Role changes require a manual database update by the vendor — no self-service capability
- No way to verify that access was revoked without vendor confirmation

**Hiring Criteria:**
- Admin interface allows creating a user with name, email, and role (Applicant/Reviewer/Admin) in a single form
- Deactivating an account revokes all access immediately — no grace period, no vendor step
- Role changes take effect on next API call — no cache delay
- Account creation and deactivation actions are captured in the audit log with James's actor ID and timestamp

**Success Measure:** James provisions a new reviewer account and confirms deactivation of a departed employee's account in under 5 minutes each, entirely self-service, with both actions logged in the audit trail.

**Related Features:** ADMN-01, AUTH-01–04, AUTH-05, ADMN-03
**Priority:** P0

---

### JTBD-03.2: Balance Reviewer Workload Without a Shared Spreadsheet

**Job Statement:**
When caseload is unevenly distributed — due to a surge in applications or a reviewer's absence — I want to reassign applications to rebalance the queue from the admin panel, so I can maintain throughput without a manual coordination meeting or a shared spreadsheet.

**Current Alternatives:**
- Reviewer workload is tracked in a shared team spreadsheet — goes stale within hours and requires manual updates
- Reassigning applications requires a verbal handoff between reviewers — no formal reassignment in the system
- James has no real-time visibility into how many active applications each reviewer holds

**Hiring Criteria:**
- Admin dashboard shows current application count and status distribution per reviewer in real time
- James can reassign an application to a different reviewer from the application detail or the admin panel in a single action
- Reassigned reviewer receives an in-app notification of the new assignment
- Bulk reassignment is possible when a reviewer is out — multiple applications can be moved at once

**Success Measure:** James views real-time workload across all reviewers and completes a batch reassignment of 10 applications in under 5 minutes without a spreadsheet or team meeting.

**Related Features:** ADMN-02, DASH-03, PERM-07, STAT-07
**Priority:** P1

---

### JTBD-03.3: Reconstruct Any Application's Decision History on Demand for Audits

**Job Statement:**
When a compliance audit or a disputed decision requires a full activity reconstruction, I want to pull a complete, timestamped record of every status change, document upload, message, and user action on any application, so I can satisfy audit requirements without manually piecing together email threads and external logs.

**Current Alternatives:**
- No audit log exists in the legacy system — decision history is reconstructed from email threads manually
- External decision log is maintained by reviewers in a disconnected spreadsheet — incomplete and inconsistent
- Audit preparation takes days of staff time and still produces incomplete records

**Hiring Criteria:**
- Audit log captures every status transition, document upload, message sent, user account change, and role modification
- Each log entry records: actor name + role, action type, application reference (where applicable), and ISO timestamp
- Log is searchable and filterable by date range, user, action type, and application ID
- Log is exportable (CSV or similar) for external audit submission

**Success Measure:** James retrieves a complete, exportable activity log for any specific application or user within 2 minutes, covering all actions taken since account creation or application submission.

**Related Features:** ADMN-03, ADMN-01, STAT-01, DASH-03
**Priority:** P0

---

### JTBD-03.4: Confirm That Access Controls Are Enforced as Configured

**Job Statement:**
When I need to verify that role boundaries are working correctly — especially after a role change or a new deployment — I want to confirm that applicants cannot access reviewer data and reviewers cannot access admin functions, so I can trust the platform's security posture without requiring a vendor audit.

**Current Alternatives:**
- No tooling to verify RBAC enforcement — relies on trust in the vendor's configuration
- Boundary verification requires creating test accounts and manually probing the application — time-consuming and not repeatable
- Has no visibility into whether a role misconfiguration is silently exposing data

**Hiring Criteria:**
- Role-based access control is enforced at the API layer — UI restrictions alone are insufficient
- Admin dashboard surfaces the role of every active user and flags any accounts with mismatched role configurations
- James can review what data scopes each role can access without requiring a developer
- Any unauthorized access attempt is logged in the audit trail with user, timestamp, and endpoint

**Success Measure:** James verifies that all three role boundaries (Applicant, Reviewer, Admin) are correctly enforced within 10 minutes using only the admin interface and audit log — no developer involvement required.

**Related Features:** AUTH-05, ADMN-01, ADMN-03, DASH-03
**Priority:** P1

---

## Outcome-to-Feature Traceability

| JTBD-ID | Related Feature IDs | Expected Outcome |
|---|---|---|
| JTBD-01.1 | PERM-01, PERM-02, AUTH-01–04 | Applicant submits a valid application in <10 min with immediate receipt confirmation |
| JTBD-01.2 | STAT-01, STAT-02, STAT-07, DASH-01, PERM-03, PERM-04 | Applicant sees current stage for all active applications in <60 sec with no phone call |
| JTBD-01.3 | DOCS-01, DOCS-02, DOCS-03, DOCS-04, STAT-05, STAT-07 | Applicant uploads replacement document in <3 min from application detail page |
| JTBD-01.4 | MSG-01, MSG-02, MSG-03, DASH-01 | Full applicant-reviewer conversation is threaded to application, no external email needed |
| JTBD-02.1 | PERM-05, PERM-06, DASH-02, STAT-01, STAT-05, MSG-03 | Reviewer identifies top priority applications in <90 sec on login, no spreadsheet |
| JTBD-02.2 | DOCS-05, STAT-03, STAT-06, PERM-06, DASH-02, ADMN-03 | Reviewer makes auditable decision with full doc access in <5 min, rationale auto-preserved |
| JTBD-02.3 | STAT-04, MSG-01, MSG-02, MSG-04, STAT-07, DASH-02 | Information request sent in <2 min, visible in application messaging thread |
| JTBD-02.4 | STAT-05, STAT-07, MSG-03, DASH-02, DASH-04 | Reviewer notified of applicant response in <30 sec; application auto-surfaced in queue |
| JTBD-03.1 | ADMN-01, AUTH-01–04, AUTH-05, ADMN-03 | Reviewer account provisioned or deactivated in <5 min, self-service, fully logged |
| JTBD-03.2 | ADMN-02, DASH-03, PERM-07, STAT-07 | Batch reassignment of 10 applications in <5 min with real-time workload view |
| JTBD-03.3 | ADMN-03, ADMN-01, STAT-01, DASH-03 | Full application activity log retrieved and exported in <2 min for any application |
| JTBD-03.4 | AUTH-05, ADMN-01, ADMN-03, DASH-03 | All three role boundaries verified via admin interface in <10 min, no developer needed |

---

## NaC Preview

> *Candidate Natural Acceptance Criteria derived from each job's success measure. These will be refined into formal NaC statements during story mapping.*

| JTBD-ID | Outcome (Success Measure) | Candidate Natural Acceptance Criteria |
|---|---|---|
| JTBD-01.1 | Submit complete application in <10 min with instant confirmation | Given a logged-in applicant with a saved business profile, when they complete and submit a standard permit application, then a confirmation notification appears within 5 seconds and the application is visible in their dashboard with status "Submitted" |
| JTBD-01.2 | Identify stage and pending actions for all applications in <60 sec | Given an applicant with 5+ active applications, when they load their dashboard, then each application displays its current lifecycle stage and a "Action Required" badge where applicable — no additional navigation needed |
| JTBD-01.3 | Upload replacement document in <3 min from application detail page | Given an applicant who received an "Additional Info Needed" status, when they upload a replacement file on the application detail page, then the upload validates and confirms in-page, and the reviewer is notified within 30 seconds |
| JTBD-01.4 | Full conversation threaded to application, no external email | Given an applicant on an application detail page, when they send a message, then it appears in the messaging panel with sender name, role, and timestamp, and the reviewer's unread count increments without any email exchange |
| JTBD-02.1 | Identify top 5 priority applications in <90 sec on login | Given a reviewer with 30+ assigned applications, when they load their dashboard, then applications are sorted by action-required status with "Awaiting Applicant" and "Ready for Review" buckets clearly differentiated |
| JTBD-02.2 | Decision made in <5 min, rationale auto-preserved in audit trail | Given a reviewer on an application detail page, when they select Approve or Reject and submit a rationale, then the status updates immediately, the rationale and timestamp are recorded on the application, and the change appears in the audit log |
| JTBD-02.3 | Information request sent in <2 min, visible in messaging thread | Given a reviewer on an application detail page, when they trigger "Request Additional Information" and submit a message, then the application status changes to "Additional Info Needed," the applicant receives an in-app notification, and the message is threaded to the application |
| JTBD-02.4 | Reviewer notified of applicant response in <30 sec, queue auto-updated | Given a reviewer waiting on applicant responses, when an applicant uploads a document or sends a message, then the reviewer receives an in-app notification within 30 seconds and the application moves to the "Ready for Review" queue bucket |
| JTBD-03.1 | Account provisioned or deactivated in <5 min, self-service, logged | Given an admin on the user management page, when they create or deactivate a user account, then the change takes effect immediately, a confirmation is shown, and the action appears in the audit log with actor, timestamp, and role |
| JTBD-03.2 | Batch reassign 10 applications in <5 min with real-time workload view | Given an admin on the assignment management page, when they select multiple applications and assign them to a reviewer, then all applications update to the new reviewer immediately and the reassigned reviewer receives an in-app notification |
| JTBD-03.3 | Full activity log retrieved and exported in <2 min for any application | Given an admin on the audit log page, when they filter by application ID, then all status changes, document uploads, messages, and user actions are displayed with actor, timestamp, and action type, and the result is exportable |
| JTBD-03.4 | Role boundaries verified via admin interface in <10 min, no developer | Given an admin reviewing user roles, when they inspect active accounts, then each account's role and data scope are visible, any misconfigured accounts are flagged, and unauthorized access attempts appear in the audit log |

---

*JTBD generated: 2026-07-21*
*Derived from: Personas-PermitManagementSystem.md, PROJECT.md*
*Next: Use JTBD to drive User Journey Map, Story Map, FRD acceptance criteria, and NaC generation*
