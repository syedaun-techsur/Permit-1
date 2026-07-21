# User Journeys: Permit Management System

| Field | Value |
|---|---|
| **Product** | Permit Management System |
| **Date** | 2026-07-21 |
| **Related Personas** | PER-01 Marcus Rivera, PER-02 Diana Osei, PER-03 James Whitfield |
| **Related JTBD** | JTBD-01.1–01.4, JTBD-02.1–02.4, JTBD-03.1–03.4 |
| **Related PRD** | PRD-PermitManagementSystem.md |
| **Status** | Draft |

---

## Journey Index

| JRN-ID | Persona | Scenario | Key JTBD | Stages |
|---|---|---|---|---|
| JRN-01.1 | PER-01 Marcus (Applicant) | First-time account creation and first permit submission | JTBD-01.1 | 6 |
| JRN-01.2 | PER-01 Marcus (Applicant) | Receiving reviewer feedback, uploading a replacement document, responding to info request, and tracking through to approval | JTBD-01.2, JTBD-01.3, JTBD-01.4 | 6 |
| JRN-02.1 | PER-02 Diana (Reviewer) | Morning triage — identifying priority applications and advancing the queue | JTBD-02.1, JTBD-02.4 | 5 |
| JRN-02.2 | PER-02 Diana (Reviewer) | Full application review — evaluating documents, requesting information, and issuing an approval or rejection | JTBD-02.2, JTBD-02.3 | 6 |
| JRN-03.1 | PER-03 James (Admin) | Onboarding a new reviewer and offboarding a departed staff member | JTBD-03.1 | 5 |
| JRN-03.2 | PER-03 James (Admin) | Balancing reviewer workload, reviewing audit logs, and verifying access controls | JTBD-03.2, JTBD-03.3, JTBD-03.4 | 5 |

---

## PER-01: Marcus Rivera — Permit Applicant

---

### JRN-01.1: First Account Creation and First Permit Submission

**Persona:** PER-01 (Marcus Rivera)

**Scenario:** Marcus has a new commercial tenant-improvement project starting next week. He has never used the portal before — previously he submitted everything by email and phone. A colleague mentioned the new system. He arrives at the landing page on his desktop, creates an account, fills out his business profile, and submits his first permit application. He needs confidence that the submission actually landed before he moves on with his day.

**Related Jobs:** JTBD-01.1

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **1. Discover** | Navigates to the portal URL shared by a colleague; lands on the marketing/login page | Landing page (AUTH-01) | "Is this actually going to be better than calling the office? Let me see if it looks legit." | Skeptical, cautiously curious | Legacy system memory creates low expectations; unclear if portal is official or a third-party tool | Clear government branding, trust badges, and a one-line value prop ("submit and track permits in minutes") eliminate doubt immediately |
| **2. Register** | Clicks "Create Account," fills in name, email, and password; completes email verification | Sign-up flow (AUTH-01, AUTH-02) | "Please don't make me call someone to activate this." | Mildly anxious; relieved when verification email arrives quickly | Broken verification emails or long activation windows kill momentum | One-click email verification with a 60-second expiry countdown; auto-redirect into the app on confirm |
| **3. Profile Setup** | Fills in business profile: company name, contractor license number, business address, phone | Business profile form (PERM-01 pre-fill) | "I fill this in on every application. If I have to do this again for the next one I'll go back to email." | Mildly frustrated at form length, relieved when told this saves for future use | No pre-fill = re-entering the same data 6–12 times per month on every future application | Tooltip confirms "This information pre-fills on all future applications" — Marcus immediately sees long-term ROI |
| **4. Start Application** | Clicks "New Application," selects permit type (Commercial Tenant Improvement), reviews pre-filled business data | Application form (PERM-01, PERM-02) | "Good, my details are already here. What else do I need?" | Confident, focused | Unclear which permit type applies; no guidance on which documents are required for each type | Permit type selector shows a brief description and required document list before Marcus commits; draft auto-saves every 30 seconds |
| **5. Upload Documents** | Drags and drops floor plan PDF, contractor insurance certificate; sees inline validation and thumbnail previews | Document uploader (DOCS-01, DOCS-02, DOCS-03) | "Did that actually upload? Is the file the right type? Let me check the preview." | Cautiously hopeful, reassured by visible previews | No preview = blind trust that the file attached correctly; legacy portals give no feedback | Instant thumbnail preview + green checkmark per file + file size/type validation feedback inline — Marcus sees exactly what the reviewer will see |
| **6. Submit & Confirm** | Clicks "Submit Application"; sees confirmation screen with application ID, submission timestamp, and a status badge of "Submitted" | Confirmation screen + Dashboard (PERM-01, STAT-01, DASH-01, STAT-07) | "Did that actually go through? I don't want to call tomorrow to find out." | Anxious → relieved the moment the confirmation appears | No confirmation = Marcus calling the office the next morning; the most common failure of legacy systems | In-app toast notification + email confirmation within 5 seconds; application appears on dashboard with "Submitted" badge immediately |

---

#### Key Moments

- **Delight Opportunity — Profile Setup:** The moment Marcus sees "This saves for future applications" is the moment he commits to using the platform long-term rather than reverting to email.
- **Risk of Abandonment — Document Upload:** If drag-and-drop fails silently or gives no preview confirmation, Marcus will not trust the upload and may call the office anyway — defeating the platform's core value.
- **Decision Point — Submission Confirmation:** The confirmation screen is the make-or-break moment. A visible application ID, timestamp, and dashboard entry prove the submission registered — eliminating the follow-up phone call that was his biggest pain point.

#### Success Outcome

Marcus submits a complete, validated permit application in under 10 minutes from first login and receives immediate confirmation without a follow-up call (JTBD-01.1 success measure).

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Discover | Landing page (AUTH-01) |
| Register | Sign-up + email verification (AUTH-01, AUTH-02) |
| Profile Setup | Business profile (PERM-01 pre-fill) |
| Start Application | Application form, draft auto-save (PERM-01, PERM-02) |
| Upload Documents | Drag-and-drop uploader, validation, preview (DOCS-01, DOCS-02, DOCS-03, DOCS-04) |
| Submit & Confirm | Confirmation screen, dashboard, notification (PERM-01, STAT-01, STAT-07, DASH-01) |

---

### JRN-01.2: Tracking Status → Responding to Info Request → Receiving Approval

**Persona:** PER-01 (Marcus Rivera)

**Scenario:** Three days after submitting his commercial tenant-improvement permit, Marcus logs in during a morning site visit from his iPhone. He wants to check where all five of his active applications stand without calling anyone. One application has moved to "Additional Info Needed" — the reviewer wants an updated fire suppression plan. Marcus uploads the replacement document, messages the reviewer for clarification on one detail, and checks back two days later to find the application has been approved.

**Related Jobs:** JTBD-01.2, JTBD-01.3, JTBD-01.4

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **1. Morning Check** | Opens app on iPhone; lands on applicant dashboard showing all 5 active applications with status badges | Dashboard (DASH-01, PERM-03, STAT-01, STAT-02) | "Which ones need my attention right now? Is anything holding up the Monroe Street project?" | Slightly anxious — doesn't know if something is stalled | Previously had to call the office or wait for an email; spreadsheet was always out of date | Dashboard surfaces a red "Action Required" badge on the relevant application; all other statuses visible at a glance without clicking into each one |
| **2. Spot the Alert** | Taps the application with "Additional Info Needed" badge; reads the reviewer's information request message in the messaging panel | Application detail (PERM-04, STAT-02, MSG-01, MSG-02, STAT-07) | "What exactly do they need? Is this the floor plan again or something new?" | Mildly frustrated — another document request — but reassured the request is specific and actionable | Legacy experience: vague emails with no application reference, requiring a phone call for clarification | Reviewer's request is threaded to the application, states exactly which document is needed, and includes any annotated notes; Marcus has full context without a phone call |
| **3. Upload Replacement** | Taps document section; drags (or taps to browse on mobile) the updated fire suppression PDF; sees upload progress and inline preview | Document uploader, application detail (DOCS-01, DOCS-02, DOCS-03, DOCS-04, STAT-05) | "Is this the right file? Let me preview it before I confirm. And will they know I uploaded it?" | Determined, cautious; relieved when preview appears and upload confirms | Mobile upload on legacy portals is broken or unsupported | Responsive uploader works on iPhone; preview renders the PDF inline; confirmation toast says "Document uploaded — reviewer notified automatically" |
| **4. Message the Reviewer** | Opens messaging panel; types a quick clarification question about the fire rating spec on the new plan | Messaging panel, application detail (MSG-01, MSG-02, MSG-03) | "I don't want to send this to a generic inbox and never hear back. Is the reviewer actually going to see this?" | Uncertain, but hopeful | Legacy: emails to a shared mailbox go unanswered for days; no application context | Message is threaded to the application; Marcus sees the reviewer's name and role in the panel header; sends without leaving the page |
| **5. Await & Track** | Logs in the next morning; sees no new notifications; checks application status — still "Under Review"; checks back the following day | Dashboard, notification badge (DASH-01, STAT-02, STAT-07, MSG-03) | "Is it moving? Should I nudge them again? I don't want to be annoying but I need this approved before framing starts." | Impatient but informed — the timeline stage shows the application is in review, not stalled | Opacity: no way to distinguish "moving forward" from "lost in a queue" | Visual lifecycle timeline shows current stage, previous stages completed, and estimated next milestone; Marcus can see progress without guessing |
| **6. Receive Approval** | Receives in-app notification: "Application #1042 — Approved." Opens app; reads approval decision with reviewer rationale and timestamp on the application detail page | Notification, application detail (STAT-06, STAT-07, PERM-04) | "Finally. Can I share this with my contractor?" | Relieved, satisfied | Approval arrives by mail days later in legacy systems; no digital confirmation accessible | In-app notification fires within seconds of approval; application detail shows the approved status, reviewer's documented rationale, and exact approval timestamp — full decision record visible without any additional steps |

---

#### Key Moments

- **Delight Opportunity — Upload Confirmation:** "Reviewer notified automatically" removes Marcus's biggest anxiety: the uncertainty of whether the office actually received his document.
- **Decision Point — Message vs. Phone Call:** The moment Marcus uses the in-app messenger instead of reaching for his phone is the moment the platform has replaced the phone-call habit — a permanent behavioral shift.
- **Risk of Abandonment — Waiting Stage:** If the lifecycle timeline doesn't distinguish "actively in review" from "stalled/lost," Marcus will revert to calling the office during any period of silence.
- **Delight Opportunity — Approval Notification:** Instant notification + immediate access to the approval decision with documented rationale is the finish-line experience. If this feels good, Marcus submits his next application without hesitation.

#### Success Outcome

Marcus identifies all active application statuses within 60 seconds of login, uploads a replacement document in under 3 minutes without leaving the application detail page, and receives approval confirmation instantly — with the reviewer's documented rationale and timestamp visible on the application detail page — no phone calls at any stage (JTBD-01.2, JTBD-01.3, JTBD-01.4 success measures).

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Morning Check | Dashboard, application list, status badges (DASH-01, PERM-03, STAT-01, STAT-02) |
| Spot the Alert | Application detail, messaging panel, notification (PERM-04, MSG-01, MSG-02, STAT-07) |
| Upload Replacement | Document uploader, inline preview, status update (DOCS-01–04, STAT-05) |
| Message the Reviewer | Messaging panel, application detail (MSG-01, MSG-02, MSG-03) |
| Await & Track | Dashboard, lifecycle timeline, notification (DASH-01, STAT-02, STAT-07) |
| Receive Approval | Notification, approval decision with rationale and timestamp on application detail (STAT-06, STAT-07, PERM-04) |

---

## PER-02: Diana Osei — Permit Reviewer

---

### JRN-02.1: Morning Triage — Prioritizing the Review Queue

**Persona:** PER-02 (Diana Osei)

**Scenario:** Diana arrives at the office at 8:45 AM. She has 38 active applications assigned to her. Before she can do any substantive review work, she needs to understand what needs her attention today — specifically which applications have applicant responses waiting, which are approaching deadlines, and which she left mid-review yesterday. Previously she would open the shared team spreadsheet, check her email, and mentally piece together a workload picture. Today she logs into the platform.

**Related Jobs:** JTBD-02.1, JTBD-02.4

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **1. Login & Land** | Opens Chrome, navigates to platform, enters credentials; lands on reviewer dashboard | Login (AUTH-02), Reviewer dashboard (DASH-02) | "Please just show me what I need to do. Don't make me click around to figure out my workload." | Focused, slightly tense before seeing the queue state | Legacy: dashboard is empty or generic; true workload is in a spreadsheet she opens in a second tab | Reviewer dashboard loads in under 3 seconds, pre-sorted into "Needs Your Action," "Awaiting Applicant," and "Ready for Review" buckets — no spreadsheet needed |
| **2. Read the Buckets** | Scans the three queue buckets: 7 "Needs Action," 14 "Awaiting Applicant," 17 "Ready for Review"; notes the applicant-response notifications | Reviewer queue (DASH-02, STAT-01, STAT-05, MSG-03) | "Good — 7 that I need to act on today. Which of these are approaching deadline? Are any of the 'awaiting applicant' ones overdue?" | Methodical, relieved to see structure | No deadline-proximity indicator makes it hard to sequence work | Applications in "Needs Action" bucket show submission date and days-since-last-update; overdue items surface with an amber indicator |
| **3. Catch Overnight Responses** | Notices 3 applications in "Ready for Review" that were previously "Awaiting Applicant" — applicants uploaded documents overnight | In-app notifications, queue auto-update (STAT-05, STAT-07, MSG-03, DASH-04) | "These three moved on their own. I didn't have to check emails to find this out." | Pleasantly surprised; gains confidence in the system's real-time accuracy | Legacy: applicant responses sit in email; Diana finds out by accident or at next manual spreadsheet review | Applications automatically surface in the correct bucket when applicants act; unread message badges visible on the application row without opening each record |
| **4. Sequence the Day** | Mentally (or with notes) sequences her work: starts with the 3 applicant-response items (ready to advance), then addresses the 7 action-needed items | Reviewer queue, application rows (DASH-02, PERM-05) | "I'll do the three that are back from applicants first — quickest wins. Then the 7 I need to review from scratch." | Confident, in control | Without clear queue buckets, she would have worked in arrival order rather than priority order | Bucket structure naturally surfaces highest-value sequencing; Diana gains 30–45 minutes of triage efficiency per day |
| **5. Open First Application** | Clicks the top "Ready for Review" application to begin substantive review | Application detail (PERM-06, DOCS-05, STAT-03) | "Let me see if the documents they uploaded actually address what I asked for." | Focused, ready to work | N/A at this stage — transitions into JRN-02.2 | Application detail opens with the messaging thread scrolled to the applicant's latest response and the document panel highlighted |

---

#### Key Moments

- **Delight Opportunity — Bucket Auto-Update:** Diana seeing that the three overnight responses automatically appeared in "Ready for Review" — without her checking email — is the moment she stops trusting the spreadsheet and starts trusting the platform.
- **Decision Point — Queue Sequencing:** Diana's choice to work the "applicant responded" bucket first is the highest-leverage decision of her morning. The bucket structure makes this obvious; a flat queue would obscure it.
- **Risk of Abandonment — Slow Load:** If the dashboard takes more than 3–4 seconds to load or shows stale data on login, Diana will open the spreadsheet "just to double-check" — and the habit loop never breaks.

#### Success Outcome

Diana identifies her top 5 priority applications and sequences her morning work within 90 seconds of logging in, with no reference to a spreadsheet or email inbox (JTBD-02.1 success measure).

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Login & Land | Authentication, reviewer dashboard (AUTH-02, DASH-02) |
| Read the Buckets | Queue buckets, status indicators (DASH-02, STAT-01, STAT-05) |
| Catch Overnight Responses | Notifications, auto-queue update, message badges (STAT-07, MSG-03, DASH-04) |
| Sequence the Day | Queue rows with metadata (DASH-02, PERM-05) |
| Open First Application | Application detail, document panel, messaging thread (PERM-06, DOCS-05, STAT-03) |

---

### JRN-02.2: Full Application Review — Documents, Info Request, and Decision

**Persona:** PER-02 (Diana Osei)

**Scenario:** Diana opens a mid-queue commercial construction permit application. She reviews the submitted documents, identifies a missing structural engineer's stamp on the foundation plan, sends an information request to the applicant, and two days later — when the applicant has responded and uploaded a corrected document — returns to the application, completes her review, and issues an approval with documented rationale.

**Related Jobs:** JTBD-02.2, JTBD-02.3

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **1. Open Application** | Clicks application from queue; application detail loads with submitted documents, messaging thread, status history, and applicant details in one view | Application detail (PERM-06, STAT-01, STAT-03) | "Is everything I need on this page, or am I going to have to go hunting for attachments in email?" | Skeptical → relieved as full context loads | Legacy: documents in email, status in spreadsheet, notes in a separate log — 3 tools to reconstruct one application's state | Single-pane application detail: documents panel, messaging thread, and status history all visible without leaving the page |
| **2. Review Documents** | Opens each document inline for preview; finds the foundation plan is missing a structural engineer's stamp | Document panel, inline preview (DOCS-05, DOCS-03) | "This floor plan looks fine. Wait — the foundation plan doesn't have the engineer's stamp. That's a problem." | Focused → mildly frustrated at the omission | Legacy: downloading files one by one from email, version confusion if applicant re-sent files | All documents listed in the panel with upload date, file name, and file size; one-click inline preview; bulk download option; version clarity by upload timestamp |
| **3. Send Info Request** | Clicks "Request Additional Information"; types a specific message citing the missing stamp; attaches an annotated page reference; submits | Info request action, messaging panel (STAT-04, MSG-01, MSG-02, MSG-04, STAT-07) | "I want to be specific enough that they don't send me the wrong thing again. Can I attach a note showing exactly which page?" | Methodical, careful | Vague email requests result in incorrect or incomplete resubmissions, adding another round-trip | Structured info request form with free-text message + optional document/annotation attachment; applicant receives in-app notification immediately; application status auto-transitions to "Additional Info Needed" |
| **4. Await Applicant Response** | Application moves out of her "Needs Action" bucket; Diana works other applications; receives in-app notification 48 hours later when applicant uploads corrected document | Notification, queue auto-update (STAT-07, STAT-05, DASH-02, MSG-03) | "I'll get notified when they respond — I don't need to keep checking. Let me move to the next one." | Confident in the system, focused on next task | Legacy: manually polling email or spreadsheet; easy to miss a response or pick it back up late | Push notification fires the moment applicant uploads; application auto-moves to "Ready for Review"; unread badge on application row shows new message waiting |
| **5. Complete Review** | Returns to application on notification; reviews the updated foundation plan — stamp is present; reads full messaging thread to confirm everything is in order | Application detail, document panel, messaging thread (PERM-06, DOCS-05, MSG-01, STAT-03) | "Good — they addressed exactly what I asked. The thread shows the full back-and-forth. Is there anything else I need to confirm before I approve?" | Thorough, satisfied with documentation trail | Legacy: reconstructing the full conversation for audit required searching multiple email threads | Full messaging thread is chronological and immutable; status history (with timestamps) confirms the "Additional Info Needed" round-trip; Diana has a complete audit-ready record |
| **6. Approve with Rationale** | Clicks "Approve"; required rationale text field appears; types documented reasoning; clicks "Confirm Approval" | Approval action, rationale modal (STAT-06, ADMN-03, STAT-07) | "I need to be specific here — this goes on the record. Let me write a clear rationale in case this comes up in an audit." | Deliberate, professional; relieved to close the application | Decision log disconnected from application in legacy system; rationale written in a separate spreadsheet row | Rationale field is mandatory before the approval button activates; on confirm, status changes to "Approved," rationale is written to the application's immutable audit trail, and applicant receives immediate notification |

---

#### Key Moments

- **Delight Opportunity — Single-Pane Detail View:** Diana seeing all documents, messages, and status history on one screen — without switching tabs — is the moment the platform earns her trust as a professional tool.
- **Decision Point — Info Request Specificity:** The quality of Diana's information request directly determines whether the next round-trip succeeds. The ability to attach annotations removes ambiguity that causes re-work.
- **Risk of Abandonment — Approval Rationale Friction:** If the rationale field feels like bureaucratic busywork rather than a clear audit-trail benefit, Diana will write generic placeholder text. Framing it as "this appears in the audit log" gives it professional gravity.
- **Delight Opportunity — Automated Audit Trail:** When Diana completes the approval and sees the decision already in the application's status history with her name, role, and timestamp, she recognizes this eliminates hours of audit-prep work.

#### Success Outcome

Diana reviews all documents, sends a structured information request in under 2 minutes, and upon response, issues an approval with documented rationale in under 5 minutes — with the full decision trail automatically preserved for audits (JTBD-02.2, JTBD-02.3 success measures).

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Open Application | Application detail, status history (PERM-06, STAT-01, STAT-03) |
| Review Documents | Document panel, inline preview, bulk download (DOCS-05, DOCS-03) |
| Send Info Request | Info request action, messaging, annotation attachment (STAT-04, MSG-01, MSG-02, MSG-04, STAT-07) |
| Await Applicant Response | Notification, queue auto-update, message badge (STAT-07, STAT-05, DASH-02, MSG-03) |
| Complete Review | Application detail, document panel, messaging thread (PERM-06, DOCS-05, MSG-01, STAT-03) |
| Approve with Rationale | Approval modal, rationale field, audit trail, notification (STAT-06, ADMN-03, STAT-07) |

---

## PER-03: James Whitfield — System Administrator

---

### JRN-03.1: Onboarding a New Reviewer and Offboarding a Departed Staff Member

**Persona:** PER-03 (James Whitfield)

**Scenario:** On a Monday morning, James receives two tasks at once: provision an account for a new permitting officer starting today, and immediately deactivate the account of a reviewer who resigned on Friday. The deactivation is time-sensitive — a former employee's active account is a security exposure. James needs to handle both without submitting a vendor ticket and without verifying with anyone that it worked.

**Related Jobs:** JTBD-03.1

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **1. Login to Admin Panel** | Opens Chrome; logs in with admin credentials; lands on the admin dashboard showing system-wide stats and a user management shortcut | Admin dashboard (DASH-03, AUTH-02, AUTH-05) | "I need to deactivate Chen's account first — that's the security risk. Then I'll add the new person." | Purposeful, slightly stressed about the open security gap | Legacy: must email vendor; typical 2–4 hour response window; account stays active the entire time | Admin dashboard prominently surfaces User Management in the primary navigation; no vendor call, no ticket — James acts directly |
| **2. Deactivate Departed Account** | Navigates to User Management; searches for the departed reviewer by name; clicks "Deactivate Account"; confirms the action | User management table (ADMN-01, AUTH-05) | "Is this immediate? Or does it take a few hours to take effect? I need to know it's done right now." | Tense → relieved only when confirmation is clear | Legacy: deactivation confirmation came from the vendor hours later, leaving a security window | On confirmation, status immediately changes to "Inactive" in the user table; a success banner reads "Access revoked immediately — all sessions terminated"; the action appears in the audit log within seconds |
| **3. Provision New Account** | Clicks "Add User"; fills in new reviewer's name, work email, and selects role "Reviewer"; clicks "Create Account" | Add user form (ADMN-01, AUTH-01) | "Will she get a welcome email automatically? Do I need to send her the login link manually?" | Efficient, focused | Legacy: account creation required a vendor; role assignment was a separate manual step | Account creation sends an auto-generated welcome email with a password-set link; role is set in the same form; no follow-up step required; new account appears in the user table immediately |
| **4. Verify Both Actions in Audit Log** | Navigates to Audit Log; filters by "Today" and "User Account Actions"; sees both entries — deactivation and creation — with his actor ID, timestamps, and action types | Audit log (ADMN-03) | "I need to screenshot this for the security log. Can I export it?" | Methodical, satisfied when both entries appear | Legacy: no audit log; had to rely on vendor email confirmation as the only record | Audit log shows both entries side-by-side: actor (James Whitfield / Admin), action (Account Deactivated / Account Created), target user, and ISO timestamp; one-click CSV export for the security report |
| **5. First Application Assignment** | Returns to admin panel; navigates to Applications; filters unassigned applications; assigns one starter application to the new reviewer | Application assignment (ADMN-02, PERM-07, STAT-07) | "Let me give her one easy application to start. Is there a way to see which ones are least complex?" | Helpful, methodical | No visibility into application complexity in legacy system | Application list shows permit type, submission date, and document count; James picks a single-document residential application; new reviewer receives an in-app notification of assignment immediately |

---

#### Key Moments

- **Critical Moment — Deactivation Confirmation:** James will not feel the security gap is closed until he sees an unambiguous "Access revoked immediately" confirmation. Soft language ("Account updated") creates lingering doubt.
- **Delight Opportunity — Audit Log Auto-Capture:** James seeing both his actions automatically logged — without him doing anything extra — is the moment he understands the platform is compliant-by-default. This is a major emotional relief for an IT admin.
- **Decision Point — Account Sequencing:** James correctly prioritizes deactivation over onboarding. The admin panel should make both actions equally fast and not obscure the deactivation path behind onboarding-focused UI.

#### Success Outcome

James deactivates a departed employee's account and provisions a new reviewer account — both with immediate effect, fully logged, and without any vendor involvement — in under 5 minutes total (JTBD-03.1 success measure).

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Login to Admin Panel | Admin dashboard, authentication (DASH-03, AUTH-02, AUTH-05) |
| Deactivate Departed Account | User management table, deactivation action (ADMN-01, AUTH-05) |
| Provision New Account | Add user form, welcome email automation (ADMN-01, AUTH-01) |
| Verify in Audit Log | Audit log, filter, CSV export (ADMN-03) |
| First Application Assignment | Application assignment, reviewer notification (ADMN-02, PERM-07, STAT-07) |

---

### JRN-03.2: Balancing Reviewer Workload, Auditing an Application, and Verifying Access Controls

**Persona:** PER-03 James Whitfield)

**Scenario:** It is Thursday morning. One of Diana's colleagues called in sick. James needs to redistribute her 12 active applications to the remaining reviewers. After doing that, he gets a compliance audit notice requesting the full activity history for a specific application that was rejected six weeks ago. Finally, he performs a periodic access-control spot check to verify that role boundaries are still enforced correctly after last week's deployment.

**Related Jobs:** JTBD-03.2, JTBD-03.3, JTBD-03.4

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **1. View Workload Distribution** | Opens admin dashboard; navigates to Workload view; sees a table of reviewers with live application counts, broken down by status bucket | Admin dashboard workload panel (DASH-03, ADMN-02, PERM-07) | "How many does Diana have right now? And who has capacity to absorb them?" | Problem-solving mode; mildly stressed under time pressure | Legacy: shared spreadsheet shows stale counts; James often discovered the imbalance after the fact | Real-time workload table shows each reviewer's name, active application count, and bucket breakdown (Needs Action / Awaiting Applicant / Ready for Review); James immediately sees who has bandwidth |
| **2. Bulk Reassign Applications** | Selects all 12 of Diana's active applications via checkboxes; uses "Reassign" bulk action; selects two receiving reviewers; splits the batch; confirms | Bulk assignment interface (ADMN-02, PERM-07, STAT-07) | "I want to spread these between two reviewers so neither one gets overwhelmed. Can I split a batch?" | Decisive, time-constrained | Legacy: reassignment was a verbal handoff — no formal system action; no notification to receiving reviewer | Bulk selection + reviewer split assignment in one action; receiving reviewers get an in-app notification listing the newly assigned applications; Diana's queue clears in real time |
| **3. Pull Application Audit Log** | Navigates to Audit Log; searches by Application ID (from the audit notice); sees the complete timestamped history: submission, status transitions, document uploads, info request, rejection with rationale | Audit log, search by application ID (ADMN-03, STAT-01) | "The auditor wants everything — every status change, every message, every document upload. Is it all here?" | Focused, slightly anxious before search — relieved when complete history loads | Legacy: reconstructing this manually from email threads and spreadsheets took days and was still incomplete | Audit log surfaces every event for the application: actor, action type, timestamp, and detail — all in one filterable view; one-click CSV export generates the file James needs for the auditor |
| **4. Export and Share** | Clicks "Export CSV"; downloads the file; reviews the columns (actor, role, action, application ID, timestamp); sends to the auditor | Audit log export (ADMN-03) | "Does this have everything the auditor asked for? Actor name, role, action type, timestamp — yes, all there." | Relieved, professionally satisfied | Legacy: no export capability; James had to paste content into a spreadsheet manually | Structured CSV export with named columns matches standard audit submission formats; no manual reformatting needed |
| **5. Spot-Check Access Controls** | Navigates to User Management; reviews role column for all active accounts; checks audit log "Unauthorized Access Attempts" filter; sees zero violations | User management table, audit log access-control filter (ADMN-01, AUTH-05, ADMN-03) | "Has anything been misconfigured since the deployment? Are any applicant accounts seeing reviewer-level data?" | Cautious, systematic | Legacy: no way to verify RBAC enforcement without manually probing accounts as a developer | Role column shows each user's assigned role; audit log filter surfaces any unauthorized access attempts by role + endpoint; James verifies enforcement without writing a single line of code |

---

#### Key Moments

- **Decision Point — Workload Split:** James splitting the batch between two reviewers rather than overloading one is the right call. The real-time workload table makes this decision obvious in seconds; without it, James would be guessing.
- **Delight Opportunity — Audit Log Completeness:** When James filters by application ID and sees every single event — submission, document upload, info request, response, rejection with rationale — in one view and exports it in one click, the hours of audit-prep pain that defined the legacy system evaporates.
- **Risk of Abandonment — Access Control Verification:** If the admin interface doesn't surface unauthorized access attempts or role misconfigurations visibly, James defaults to "I'll just trust the vendor" — which is exactly the compliance risk the platform is designed to eliminate.

#### Success Outcome

James rebalances 12 applications across two reviewers in under 3 minutes, retrieves and exports the full audit log for a specific application in under 2 minutes, and verifies access-control enforcement for all active accounts in under 5 minutes — all self-service (JTBD-03.2, JTBD-03.3, JTBD-03.4 success measures).

#### Feature Touchpoints

| Stage | Features |
|---|---|
| View Workload Distribution | Admin dashboard, workload panel (DASH-03, ADMN-02, PERM-07) |
| Bulk Reassign Applications | Bulk assignment, reviewer notification (ADMN-02, PERM-07, STAT-07) |
| Pull Application Audit Log | Audit log, application ID search (ADMN-03, STAT-01) |
| Export and Share | CSV export (ADMN-03) |
| Spot-Check Access Controls | User management, role column, unauthorized-access filter (ADMN-01, AUTH-05, ADMN-03) |

---

## Cross-Journey Patterns

### CP-01: The Confirmation Gap (Affects JRN-01.1, JRN-01.2, JRN-02.2, JRN-03.1)

**Pattern:** In the legacy system, every significant action — submitting an application, uploading a document, approving a permit, deactivating an account — left users uncertain whether it actually registered. The confirmation gap manifests as follow-up phone calls (Marcus), email polling (Diana), and vendor dependency (James).

**Platform Resolution:** Every state-changing action in the platform triggers an immediate in-UI confirmation (toast notification + status update) and, where appropriate, an in-app notification to the affected party. The rule: no action completes silently.

---

### CP-02: Cross-Tool Context Fragmentation (Affects JRN-02.1, JRN-02.2, JRN-03.2)

**Pattern:** Both Diana and James currently stitch together a complete picture of any application or workload state from three separate tools: a legacy portal, an email inbox, and a shared spreadsheet. This context fragmentation costs time, creates errors, and makes audit reconstruction nearly impossible.

**Platform Resolution:** The single-pane application detail (for reviewers) and the admin dashboard (for James) consolidate all context — documents, messaging, status history, workload counts — into one view per role. The shared spreadsheet becomes unnecessary because the platform's data is authoritative and real-time.

---

### CP-03: Proactive vs. Reactive Awareness (Affects JRN-01.2, JRN-02.1, JRN-02.2, JRN-03.2)

**Pattern:** All three personas currently operate reactively: Marcus checks status only when he remembers to call; Diana checks for applicant responses only when she polls her email; James discovers workload imbalances after the fact. The legacy system is pull-only.

**Platform Resolution:** The platform is push-first. In-app notifications fire within seconds of relevant state changes (applicant uploads a document → reviewer notified; application approved → applicant notified; reviewer receives reassigned applications → reviewer notified). Reactive polling is replaced by proactive awareness.

---

### CP-04: Audit Trail as Afterthought → Audit Trail as Default (Affects JRN-02.2, JRN-03.1, JRN-03.2)

**Pattern:** Both Diana and James currently maintain audit records externally — Diana's approval rationale in a disconnected spreadsheet; James's user-management actions via vendor email threads. When an audit arrives, reconstruction is manual, incomplete, and stressful.

**Platform Resolution:** Every status transition, document upload, message sent, account change, and role modification is automatically written to the immutable audit log with actor, role, timestamp, and application reference. The audit trail is not a report you generate — it is a continuous side-effect of using the platform.

---

### CP-05: Mobile-First Applicant, Desktop-First Staff (Affects JRN-01.2, JRN-02.1, JRN-02.2, JRN-03.1)

**Pattern:** Marcus frequently accesses the platform from his iPhone on-site. Diana and James work exclusively on desktop Chrome. These are fundamentally different interaction contexts with different density, interaction, and navigation requirements.

**Platform Resolution:** Responsive design (UX-01) ensures Marcus's on-site upload experience works without degradation on mobile. The reviewer and admin interfaces are optimized for desktop density (table views, keyboard navigation, bulk actions) without compromise. WCAG compliance (UX-02) applies across both contexts.

---

## Journey-to-JTBD Traceability

| JRN-ID | Stage | JTBD-ID | Expected Outcome |
|---|---|---|---|
| JRN-01.1 | Discover → Register | JTBD-01.1 | Account created without friction; email verification completes in <60 sec |
| JRN-01.1 | Profile Setup | JTBD-01.1 | Business data saved once; pre-fills all future applications |
| JRN-01.1 | Start Application | JTBD-01.1 | Draft auto-saves; permit type selector guides correct form selection |
| JRN-01.1 | Upload Documents | JTBD-01.1 | Drag-and-drop upload with inline preview and validation feedback |
| JRN-01.1 | Submit & Confirm | JTBD-01.1 | Confirmation within 5 seconds; application visible on dashboard with "Submitted" status |
| JRN-01.2 | Morning Check | JTBD-01.2 | All active applications with status badges visible in <60 sec on dashboard |
| JRN-01.2 | Spot the Alert | JTBD-01.2, JTBD-01.3 | "Additional Info Needed" badge surfaces with specific reviewer message in context |
| JRN-01.2 | Upload Replacement | JTBD-01.3 | Replacement document uploaded and reviewer auto-notified in <3 min |
| JRN-01.2 | Message the Reviewer | JTBD-01.4 | In-app message sent and threaded to application; no email needed |
| JRN-01.2 | Await & Track | JTBD-01.2 | Lifecycle timeline distinguishes "in review" from "stalled"; no call required |
| JRN-01.2 | Receive Approval | JTBD-01.2, JTBD-01.3 | In-app notification within seconds; approval decision with rationale and timestamp visible on application detail immediately |
| JRN-02.1 | Login & Land | JTBD-02.1 | Reviewer dashboard loads in <3 sec with queue buckets sorted by action priority |
| JRN-02.1 | Read the Buckets | JTBD-02.1 | Queue buckets clearly separate "Needs Action," "Awaiting Applicant," "Ready for Review" |
| JRN-02.1 | Catch Overnight Responses | JTBD-02.4 | Applicant responses surface in correct bucket automatically; no email check needed |
| JRN-02.1 | Sequence the Day | JTBD-02.1 | Top 5 priority applications identified in <90 sec; no spreadsheet |
| JRN-02.1 | Open First Application | JTBD-02.1, JTBD-02.2 | Application detail opens with full context in single view |
| JRN-02.2 | Open Application | JTBD-02.2 | Single-pane view with documents, messages, and status history |
| JRN-02.2 | Review Documents | JTBD-02.2 | Inline document preview; bulk download; upload-date clarity |
| JRN-02.2 | Send Info Request | JTBD-02.3 | Structured request with annotation capability sent in <2 min; status auto-transitions |
| JRN-02.2 | Await Applicant Response | JTBD-02.4 | Push notification within 30 sec of applicant upload; application auto-resurfaces in queue |
| JRN-02.2 | Complete Review | JTBD-02.2, JTBD-02.3 | Full messaging thread and document version history accessible on application detail |
| JRN-02.2 | Approve with Rationale | JTBD-02.2 | Mandatory rationale field; approval written to immutable audit trail with actor + timestamp |
| JRN-03.1 | Login to Admin Panel | JTBD-03.1 | Admin dashboard accessible with User Management prominent in navigation |
| JRN-03.1 | Deactivate Departed Account | JTBD-03.1 | Access revoked immediately; confirmation unambiguous; action logged in audit trail |
| JRN-03.1 | Provision New Account | JTBD-03.1 | Account created with role in single form; welcome email auto-sent; no follow-up step |
| JRN-03.1 | Verify in Audit Log | JTBD-03.1 | Both account actions appear in audit log within seconds; CSV export available |
| JRN-03.1 | First Application Assignment | JTBD-03.2 | Application assigned to new reviewer; reviewer notified immediately |
| JRN-03.2 | View Workload Distribution | JTBD-03.2 | Real-time reviewer workload table; no spreadsheet needed |
| JRN-03.2 | Bulk Reassign Applications | JTBD-03.2 | Batch of 10+ applications reassigned in single action in <5 min |
| JRN-03.2 | Pull Application Audit Log | JTBD-03.3 | Complete event history for any application retrievable by ID in <2 min |
| JRN-03.2 | Export and Share | JTBD-03.3 | Structured CSV export with all required audit fields; no manual reformatting |
| JRN-03.2 | Spot-Check Access Controls | JTBD-03.4 | Role assignments and unauthorized access attempts visible without developer involvement |

---

*Journeys generated: 2026-07-21*
*Derived from: Personas-PermitManagementSystem.md, JTBD-PermitManagementSystem.md, PROJECT.md*
*Next: Use Journeys to drive Story Map, User Stories, and UX wireframe prioritization*
