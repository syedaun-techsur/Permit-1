# User Stories: Permit Management System

| Field | Value |
|---|---|
| **Product** | Permit Management System |
| **Version** | 1.0 |
| **Date** | 2026-07-21 |
| **Roles** | Applicant (Marcus Rivera), Reviewer (Diana Osei), Admin (James Whitfield) |
| **Total Stories** | 44 |
| **Related PRD** | PRD-PermitManagementSystem.md |
| **Related FRD** | FRD-PermitManagementSystem.md |
| **Status** | Draft |

---

## Table of Contents

1. [Epic 0: Authentication & User Management (F0)](#epic-0-authentication--user-management-f0)
2. [Epic 1: Design System & UI Foundation (F1)](#epic-1-design-system--ui-foundation-f1)
3. [Epic 2: Permit Application Submission (F2)](#epic-2-permit-application-submission-f2)
4. [Epic 3: Document Management (F3)](#epic-3-document-management-f3)
5. [Epic 4: Permit Status Tracking & Lifecycle (F4)](#epic-4-permit-status-tracking--lifecycle-f4)
6. [Epic 5: Integrated Messaging (F5)](#epic-5-integrated-messaging-f5)
7. [Epic 6: Reviewer Workflow (F6)](#epic-6-reviewer-workflow-f6)
8. [Epic 7: Role-Specific Dashboards (F7)](#epic-7-role-specific-dashboards-f7)
9. [Epic 8: Admin Controls (F8)](#epic-8-admin-controls-f8)
10. [Epic 9: Accessibility & Responsive Design (F9)](#epic-9-accessibility--responsive-design-f9)
11. [Story Index](#story-index)
12. [Priority Definitions](#priority-definitions)

---

## Epic 0: Authentication & User Management (F0)

> Secure account creation, login, session management, and password recovery. Every user has a defined role enforced at the API layer — no role-inappropriate data is ever served regardless of frontend state.

**Phase:** 1 — Foundation | **Priority:** P0

---

### US-0.1: Create an Account

**As an** applicant, reviewer, or admin, **I want to** register an account with my email and password, **so that** I can access the Permit Management System with the appropriate role.

**Acceptance Criteria:**
- [ ] Registration form collects email, password, and name; all fields are required with inline validation
- [ ] Password must meet minimum strength requirements (8+ characters); error message shown if not met
- [ ] Submitting a duplicate email shows a clear error: "An account with this email already exists"
- [ ] On successful registration, user is assigned a role (Applicant by default; Reviewer/Admin assigned by Admin)
- [ ] A confirmation screen or in-app notification acknowledges successful account creation
- [ ] New account is immediately accessible for login with the registered credentials

**Priority:** P0 | **Req Ref:** AUTH-01 | **Feature Ref:** F0

---

### US-0.2: Log In and Maintain Session

**As a** user (applicant, reviewer, or admin), **I want to** log in with my email and password and remain authenticated across browser sessions, **so that** I do not have to re-enter my credentials every time I open the application.

**Acceptance Criteria:**
- [ ] Login form accepts email and password; both fields required
- [ ] Valid credentials redirect user to their role-appropriate dashboard within 2 seconds
- [ ] Invalid credentials show a non-specific error: "Email or password is incorrect" (no enumeration of which field is wrong)
- [ ] Session persists across page refreshes and browser restarts via refresh token
- [ ] Access token is refreshed silently in the background before expiry; user is not interrupted
- [ ] After 5 failed login attempts, the account is temporarily locked with a clear message

**Priority:** P0 | **Req Ref:** AUTH-02 | **Feature Ref:** F0

---

### US-0.3: Log Out

**As a** user, **I want to** log out from any page in the application, **so that** I can end my session securely, especially on shared or public devices.

**Acceptance Criteria:**
- [ ] A "Log Out" action is accessible from every page (e.g., user menu in the header)
- [ ] Clicking "Log Out" invalidates the session and refresh token server-side immediately
- [ ] User is redirected to the login page with a confirmation message ("You have been logged out")
- [ ] After logout, pressing the browser back button does not restore access to protected pages
- [ ] Session cannot be resumed after logout without re-authenticating

**Priority:** P0 | **Req Ref:** AUTH-03 | **Feature Ref:** F0

---

### US-0.4: Reset Forgotten Password

**As a** user, **I want to** reset my password via an email link, **so that** I can regain access to my account without contacting support.

**Acceptance Criteria:**
- [ ] "Forgot password?" link is visible on the login page
- [ ] User enters their email; system sends a password reset link (success message shown regardless of whether email exists, to prevent enumeration)
- [ ] Reset link expires after 1 hour and is single-use
- [ ] Clicking the link opens a form to enter and confirm a new password
- [ ] New password must meet strength requirements; mismatch between fields shows inline error
- [ ] On success, user is redirected to the login page with confirmation; old sessions are invalidated

**Priority:** P0 | **Req Ref:** AUTH-04 | **Feature Ref:** F0

---

### US-0.5: Role-Based Access Control Enforcement

**As a** system, **I want to** enforce role-based access control at the API layer for every protected endpoint, **so that** unauthenticated users and users with the wrong role cannot access data they are not permitted to see.

**Acceptance Criteria:**
- [ ] Every protected API endpoint returns HTTP 401 for requests without a valid authentication token
- [ ] Every protected API endpoint returns HTTP 403 for requests where the authenticated user's role lacks permission
- [ ] Applicants cannot access reviewer or admin endpoints (e.g., reviewer queue, user management)
- [ ] Reviewers cannot access admin endpoints (e.g., user creation, audit logs)
- [ ] Frontend route guards redirect unauthorized users to an appropriate page (login or 403 error page)
- [ ] RBAC enforcement is server-side; removing frontend restrictions does not bypass access control
- [ ] Unauthorized access attempts are logged in the audit trail with user ID, timestamp, and endpoint

**Priority:** P0 | **Req Ref:** AUTH-05 | **Feature Ref:** F0

---

## Epic 1: Design System & UI Foundation (F1)

> A custom design system built on Tailwind CSS that establishes the visual language for the entire product — intentional color, type, spacing, motion, and component primitives — creating a premium SaaS aesthetic while maintaining WCAG-compliant contrast.

**Phase:** 1 — Foundation | **Priority:** P0

---

### US-1.1: Experience a Custom Visual Design (Not a Default Template)

**As a** user (any role), **I want to** interact with an interface that has a coherent, premium visual design, **so that** I trust the platform as a professional, official tool rather than a generic government form portal.

**Acceptance Criteria:**
- [ ] All UI uses a custom color palette with semantic design tokens (primary, surface, border, status colors); no default Tailwind or browser-default colors in production
- [ ] Typography uses a defined scale with clear hierarchy: headings, body, labels, captions — consistent across all pages
- [ ] Spacing and layout follow a consistent grid; no ad-hoc margins or misaligned elements
- [ ] Component primitives (buttons, inputs, cards, badges, modals, toasts) are visually consistent and purpose-built
- [ ] No element looks like an unstyled HTML default; every interactive element has an intentional designed state

**Priority:** P0 | **Req Ref:** UX-05 | **Feature Ref:** F1

---

### US-1.2: See Skeleton Screens During Page-Level Loads

**As a** user, **I want to** see skeleton screens instead of generic spinners when page-level content is loading, **so that** the interface feels responsive and I understand that content is on its way.

**Acceptance Criteria:**
- [ ] All page-level content areas (permit list, dashboard cards, application detail) display skeleton screens during initial data fetch
- [ ] Skeleton screens match the approximate layout and dimensions of the content they replace
- [ ] Skeleton screens appear within 100ms of navigation; they do not flash briefly if data loads in under 200ms
- [ ] No generic full-page spinner is used for page-level loads
- [ ] Inline actions (e.g., sending a message) may use a smaller spinner or disabled state — not a full skeleton

**Priority:** P0 | **Req Ref:** UX-03 | **Feature Ref:** F1

---

### US-1.3: Experience Smooth Micro-Interactions on Interactive Elements

**As a** user, **I want to** see smooth hover, focus, and active states on all interactive elements, **so that** the interface feels polished and I receive clear visual feedback when interacting with buttons, links, and form controls.

**Acceptance Criteria:**
- [ ] All buttons have distinct hover, focus, and active states with CSS transitions (≤ 200ms)
- [ ] All form inputs have visible focus rings styled to brand (not browser-default outline suppressed without replacement)
- [ ] Links and interactive cards show hover state changes (color shift, underline, or elevation change)
- [ ] Destructive actions (delete, reject) use a distinct color variant on hover/active to signal consequence
- [ ] State transitions are smooth (no jarring layout shifts or flashes)

**Priority:** P0 | **Req Ref:** UX-04 | **Feature Ref:** F1

---

## Epic 2: Permit Application Submission (F2)

> Applicants can create, fill out, save as draft, and submit permit applications through a structured form interface. The application list gives applicants an organized overview of all their submissions.

**Phase:** 2 — Applicant Core | **Priority:** P0

---

### US-2.1: Submit a New Permit Application

**As an** applicant (Marcus), **I want to** fill out and submit a new permit application with all required fields, **so that** my permit request is formally received by the permitting office and enters the review queue.

**Acceptance Criteria:**
- [ ] Application form includes required fields: permit type (dropdown), project description (text area), site address (structured address fields), and applicant contact details
- [ ] Field-level validation fires on blur (when leaving a field); errors appear inline beneath the field, not only on submit
- [ ] Form prevents submission if any required field is empty or invalid; a summary of errors is shown at the top on attempted submit
- [ ] On successful submission, application status changes from Draft to Submitted
- [ ] A confirmation screen displays with the application ID and submission timestamp
- [ ] Submitted application appears in the applicant's application list with status "Submitted"
- [ ] Submission completes in under 10 minutes from an empty form for a standard permit type (usability target)

**Priority:** P0 | **Req Ref:** PERM-01 | **Feature Ref:** F2

---

### US-2.2: Save Application as Draft

**As an** applicant, **I want to** save my permit application as a draft before submitting, **so that** I can leave the form and return to complete it later without losing my progress.

**Acceptance Criteria:**
- [ ] An explicit "Save Draft" button is available at all times while filling out the form
- [ ] Draft is saved with all currently entered data including any uploaded documents
- [ ] Auto-save triggers on form field change with a debounce of ≤ 5 seconds; a "Saved" indicator appears
- [ ] Navigating away from the form while unsaved changes exist shows a confirmation dialog ("You have unsaved changes — leave anyway?")
- [ ] Returning to a draft application pre-fills all previously entered data
- [ ] Draft applications appear in the application list with a "Draft" status badge and last-saved timestamp
- [ ] Zero data loss occurs on session expiry for saved drafts (data is server-persisted, not only localStorage)

**Priority:** P0 | **Req Ref:** PERM-02 | **Feature Ref:** F2

---

### US-2.3: View My Application List

**As an** applicant, **I want to** view a list of all my submitted and draft permit applications, **so that** I can quickly find any application and see its current status at a glance.

**Acceptance Criteria:**
- [ ] Application list page shows all applications belonging to the logged-in applicant (submitted and draft)
- [ ] Each list item displays: application ID, permit type, status badge, and last-updated timestamp
- [ ] Status badges use distinct colors per status (Draft: grey, Submitted: blue, Under Review: yellow, Additional Info Needed: orange, Approved: green, Rejected: red)
- [ ] Applications with unread messages show an unread count badge on the list row
- [ ] Applications requiring applicant action (Additional Info Needed) are visually differentiated (e.g., highlighted border or icon)
- [ ] List is sortable by submission date (newest first by default) and filterable by status
- [ ] Skeleton screen appears during initial list load; empty state message shown if no applications exist

**Priority:** P0 | **Req Ref:** PERM-03 | **Feature Ref:** F2

---

### US-2.4: View Full Application Detail

**As an** applicant, **I want to** open any of my permit applications and see all its details, **so that** I can review everything I submitted, check the current status, see attached documents, and access the messaging panel — all in one place.

**Acceptance Criteria:**
- [ ] Application detail page displays: all form fields as submitted, current status with lifecycle timeline, attached documents list, and messaging panel
- [ ] All submitted field values are read-only on a submitted application (no editing after submission)
- [ ] Draft applications show the form in editable state
- [ ] Status timeline shows all past stage transitions with timestamps (see also US-4.2)
- [ ] Document list shows all attachments with name, type, size, and upload date
- [ ] Messaging panel is accessible from the application detail page (see also Epic 5)
- [ ] Page loads with skeleton screen during data fetch; all content renders within 3 seconds on a 4G connection

**Priority:** P0 | **Req Ref:** PERM-04 | **Feature Ref:** F2

---

## Epic 3: Document Management (F3)

> Applicants upload supporting documents via drag-and-drop with immediate validation feedback and inline preview. Reviewers can view and download all documents associated with any application.

**Phase:** 2 (applicant upload) → Phase 3 (reviewer download) | **Priority:** P0

---

### US-3.1: Upload Documents via Drag-and-Drop or File Picker

**As an** applicant, **I want to** upload supporting documents to my permit application using drag-and-drop or a file picker, **so that** I can attach all required files without leaving the application detail page.

**Acceptance Criteria:**
- [ ] Document upload zone is visible on the application form and detail page with a clear drag-and-drop target area
- [ ] Clicking the zone opens the OS file picker as a fallback
- [ ] Multiple files can be selected and uploaded in a single action
- [ ] Upload progress is shown per file (progress bar or percentage)
- [ ] On successful upload, files immediately appear in the document list without requiring a page refresh
- [ ] Upload zone is accessible via keyboard (Tab to focus, Enter/Space to trigger file picker)

**Priority:** P0 | **Req Ref:** DOCS-01 | **Feature Ref:** F3

---

### US-3.2: Receive Immediate File Validation Feedback

**As an** applicant, **I want to** receive immediate, clear feedback when an uploaded file is invalid (wrong type or too large), **so that** I can correct the issue without confusion and upload the correct file.

**Acceptance Criteria:**
- [ ] Accepted file types are: PDF, JPG, PNG, DOCX; any other type is rejected client-side before upload begins
- [ ] Maximum file size is enforced (e.g., 25MB per file); oversized files are rejected client-side with a clear error
- [ ] Validation errors appear immediately on the upload zone (not after a server round-trip) with the specific file name and reason
- [ ] Valid files in a multi-file selection are uploaded even if some files in the selection are invalid
- [ ] Server-side validation also enforces type and size limits; server rejection errors are surfaced in the same UI pattern
- [ ] Error messages are specific: "invoice.exe is not an accepted file type (PDF, JPG, PNG, DOCX allowed)"

**Priority:** P0 | **Req Ref:** DOCS-02 | **Feature Ref:** F3

---

### US-3.3: Preview Uploaded Documents Inline

**As an** applicant, **I want to** preview my uploaded documents inline within the application, **so that** I can confirm the correct files were attached before submitting.

**Acceptance Criteria:**
- [ ] Image files (JPG, PNG) render as thumbnails in the document list immediately after upload
- [ ] PDF files display a PDF viewer panel when clicked (or open in a lightbox/modal)
- [ ] DOCX files show a file icon with name; inline preview is not required but a clear filename is displayed
- [ ] Preview is accessible without downloading the file
- [ ] Thumbnail/preview loading uses a placeholder while the preview renders
- [ ] Preview modal/panel is keyboard-accessible and closable via Escape key

**Priority:** P0 | **Req Ref:** DOCS-03 | **Feature Ref:** F3

---

### US-3.4: Remove or Replace Documents Before Submission

**As an** applicant, **I want to** remove or replace any uploaded document before I submit my application, **so that** I can correct mistakes or update files without starting a new application.

**Acceptance Criteria:**
- [ ] Each uploaded document in the list has a "Remove" action (button or icon)
- [ ] Clicking "Remove" shows a confirmation prompt ("Remove [filename]?"); on confirm, the file is deleted from the application
- [ ] To replace a file, the applicant can remove the old file and upload a new one
- [ ] Remove and replace actions are only available before the application is submitted (status = Draft)
- [ ] After submission, documents are read-only for the applicant (no remove/replace)
- [ ] Removing a file updates the document list immediately without a page refresh

**Priority:** P0 | **Req Ref:** DOCS-04 | **Feature Ref:** F3

---

### US-3.5: Reviewer Views and Downloads Application Documents

**As a** reviewer (Diana), **I want to** view and download all documents attached to a permit application, **so that** I can evaluate the complete submission without navigating to an external storage system.

**Acceptance Criteria:**
- [ ] Application detail view for the reviewer shows a document panel listing all attached files with name, type, size, and upload date
- [ ] Each document has an individual "Download" button/link that triggers a direct file download
- [ ] "Download All" action downloads all documents as a ZIP archive in a single action
- [ ] Documents are accessible via secure presigned URLs (not publicly guessable)
- [ ] Reviewer can preview image files inline (same as applicant preview)
- [ ] Document panel loads with skeleton state while files are fetched; list is complete within 2 seconds

**Priority:** P0 | **Req Ref:** DOCS-05 | **Feature Ref:** F3

---

## Epic 4: Permit Status Tracking & Lifecycle (F4)

> Every permit moves through a defined lifecycle. The current stage and all historical transitions are surfaced to the applicant through a visual timeline. Status changes are triggered by reviewer actions and reflected in real time.

**Phase:** 2 (tracking) → Phase 3 (reviewer actions + notifications) | **Priority:** P0

---

### US-4.1: Lifecycle Stages Are Defined and Enforced

**As a** user (any role), **I want** the permit application to progress through defined lifecycle stages in a structured, enforced order, **so that** every application has a clear, predictable status at all times.

**Acceptance Criteria:**
- [ ] The defined lifecycle stages are: Draft → Submitted → Under Review → Additional Info Needed → Approved / Rejected
- [ ] Status transitions are enforced at the API layer — invalid transitions are rejected (e.g., cannot skip from Submitted to Approved)
- [ ] Only authorized roles can trigger specific transitions (Reviewer: Submitted→Under Review, Under Review→Additional Info Needed, Under Review→Approved/Rejected; Applicant: Additional Info Needed→Submitted)
- [ ] Every status change is recorded with actor name, role, new status, and ISO timestamp
- [ ] Status is displayed consistently as a badge across all list views and detail pages

**Priority:** P0 | **Req Ref:** STAT-01 | **Feature Ref:** F4

---

### US-4.2: View Visual Lifecycle Timeline

**As an** applicant (Marcus), **I want to** see a visual lifecycle timeline showing the current stage of my application and all past stages with timestamps, **so that** I always know exactly where my application stands in the process.

**Acceptance Criteria:**
- [ ] A timeline/stepper component is displayed on the application detail page showing all lifecycle stages in order
- [ ] The current stage is highlighted (visually distinct from completed and upcoming stages)
- [ ] Completed stages display the date and time the stage was entered
- [ ] Upcoming stages are shown in a muted/disabled style to indicate they have not occurred yet
- [ ] If the application was rejected, the rejected stage is marked clearly; "Approved" stage is shown as not reached
- [ ] Timeline is readable on mobile screen sizes (stacks or scrolls gracefully)
- [ ] Screen readers can navigate the timeline and read each stage name, status, and timestamp

**Priority:** P0 | **Req Ref:** STAT-02 | **Feature Ref:** F4

---

### US-4.3: Reviewer Advances Application to Under Review

**As a** reviewer (Diana), **I want to** advance a submitted application to "Under Review" status, **so that** I can claim the application for my review and the applicant knows their submission is being actively evaluated.

**Acceptance Criteria:**
- [ ] A "Begin Review" button is visible on the application detail view for reviewers when the application status is "Submitted"
- [ ] Clicking "Begin Review" changes the application status from Submitted to Under Review immediately
- [ ] The action is confirmed with a success toast notification to the reviewer
- [ ] The applicant receives an in-app notification that their application is now Under Review
- [ ] The status change is recorded in the audit log with Diana's actor ID and timestamp
- [ ] "Begin Review" button is hidden/disabled when the application is already Under Review or in a later stage

**Priority:** P0 | **Req Ref:** STAT-03 | **Feature Ref:** F4

---

### US-4.4: Reviewer Requests Additional Information

**As a** reviewer (Diana), **I want to** request additional information from the applicant with a specific documented note, **so that** the applicant knows exactly what is needed and the request is permanently recorded on the application.

**Acceptance Criteria:**
- [ ] A "Request Additional Information" action is available on the application detail view for reviewers when the status is "Under Review"
- [ ] Clicking this action opens a modal/panel requiring the reviewer to enter a mandatory note describing what is needed
- [ ] On submission, the application status changes to "Additional Info Needed"
- [ ] The request note is recorded on the application and visible to both the applicant and reviewer
- [ ] The request note is also posted as a message in the application's messaging thread
- [ ] The applicant receives an in-app notification that additional information is needed
- [ ] The action and note are captured in the audit log

**Priority:** P0 | **Req Ref:** STAT-04 | **Feature Ref:** F4

---

### US-4.5: Applicant Responds to Additional Information Request

**As an** applicant (Marcus), **I want to** respond to a reviewer's additional information request by uploading new documents or sending a message, and re-submit my application for review, **so that** I can resolve the request quickly and get back into the review queue.

**Acceptance Criteria:**
- [ ] When an application status is "Additional Info Needed," the applicant sees a prominent banner or panel showing the reviewer's request note
- [ ] Applicant can upload additional documents directly on the application detail page
- [ ] Applicant can reply via the messaging panel (see Epic 5) to provide context
- [ ] A "Re-Submit for Review" button is available and enabled once the applicant has addressed the request
- [ ] Clicking "Re-Submit for Review" changes the application status back to "Under Review"
- [ ] The reviewer receives an in-app notification that the applicant has responded and re-submitted
- [ ] The re-submission action and timestamp are recorded in the audit log

**Priority:** P0 | **Req Ref:** STAT-05 | **Feature Ref:** F4

---

### US-4.6: Reviewer Approves or Rejects Application

**As a** reviewer (Diana), **I want to** approve or reject a permit application with a documented reason, **so that** the applicant receives a final decision with clear reasoning and the decision is permanently recorded for audit purposes.

**Acceptance Criteria:**
- [ ] "Approve" and "Reject" action buttons are available on the application detail view when status is "Under Review"
- [ ] Both actions require a mandatory reason field before the action can be confirmed
- [ ] A confirmation dialog ("Are you sure you want to [approve/reject] this application?") is shown before the action is executed
- [ ] On confirmation, the application status changes to Approved or Rejected; no further status transitions are possible from these terminal states (except by Admin)
- [ ] The decision reason is permanently stored on the application and visible to the applicant
- [ ] The applicant receives an in-app notification of the final decision within 5 seconds
- [ ] The decision, reason, actor, and timestamp are captured in the audit log

**Priority:** P0 | **Req Ref:** STAT-06 | **Feature Ref:** F4

---

### US-4.7: Receive In-App Notification on Status Change

**As an** applicant (Marcus), **I want to** receive an in-app notification whenever my permit application status changes, **so that** I know immediately when action is needed or a decision has been made without polling or calling the office.

**Acceptance Criteria:**
- [ ] In-app notifications are delivered for every status transition on the applicant's applications (Submitted, Under Review, Additional Info Needed, Approved, Rejected)
- [ ] Notifications appear as an in-app indicator (e.g., bell icon with unread count in the nav bar)
- [ ] Each notification includes: application ID, new status, and a timestamp
- [ ] Clicking a notification navigates directly to the relevant application detail page
- [ ] Notifications are delivered within 5 seconds of the triggering status change
- [ ] Unread notification count is visible on the notification icon; clicking marks them as read
- [ ] Notifications persist across sessions (not lost on page refresh)

**Priority:** P0 | **Req Ref:** STAT-07 | **Feature Ref:** F4

---

## Epic 5: Integrated Messaging (F5)

> Each permit application has a dedicated messaging panel where applicant and reviewer communicate directly in context. Messages are structured and tied to the specific application — no lost email threads.

**Phase:** 3 — Review Workflow | **Priority:** P1

---

### US-5.1: Exchange Messages on a Permit Application

**As an** applicant or reviewer, **I want to** send and receive messages within a messaging panel on the application detail page, **so that** all communication about a specific application is threaded and accessible in one place without using external email.

**Acceptance Criteria:**
- [ ] A messaging panel is displayed on the application detail page for both the applicant and the assigned reviewer
- [ ] Text input allows composing and sending a message; Enter or a "Send" button submits
- [ ] New messages from either party appear in the thread immediately (within 2 seconds of sending) without a full page refresh
- [ ] Message thread is ordered chronologically with newest messages at the bottom
- [ ] Messaging panel is accessible at all lifecycle stages (Draft through terminal states)
- [ ] Empty state message shown when no messages have been sent: "No messages yet. Start the conversation."

**Priority:** P1 | **Req Ref:** MSG-01 | **Feature Ref:** F5

---

### US-5.2: View Message Sender Identity and Timestamp

**As a** user reading messages, **I want to** see the sender's full name, role, and timestamp on every message, **so that** I know who said what and when, and can distinguish applicant messages from reviewer messages.

**Acceptance Criteria:**
- [ ] Each message displays: sender's full name, role badge (Applicant or Reviewer), and timestamp (date + time)
- [ ] Sent messages (by the current user) are visually aligned right; received messages are aligned left
- [ ] Role badges use distinct colors (e.g., blue for Reviewer, grey for Applicant) consistent with the design system
- [ ] Timestamp is in a human-readable format (e.g., "Jul 21, 2026 at 2:34 PM"); hovering shows the precise ISO timestamp
- [ ] Sender name and role cannot be spoofed; they are resolved server-side from the authenticated user's profile

**Priority:** P1 | **Req Ref:** MSG-02 | **Feature Ref:** F5

---

### US-5.3: See Unread Message Counts on Application List and Dashboard

**As a** user (applicant or reviewer), **I want to** see unread message counts on the application list and my dashboard, **so that** I know at a glance which applications have new messages without opening each one individually.

**Acceptance Criteria:**
- [ ] Application list rows show an unread message count badge when there are unread messages for that application
- [ ] Unread count is per-user — messages sent by the other party that have not been viewed count as unread
- [ ] Dashboard cards (applicant: DASH-01, reviewer: DASH-02) surface total unread message count or per-application counts
- [ ] Opening the messaging panel for an application marks those messages as read and clears the unread count
- [ ] Unread counts update in real time or within 30 seconds without a manual refresh

**Priority:** P1 | **Req Ref:** MSG-03 | **Feature Ref:** F5

---

### US-5.4: Reviewer Attaches Documents or Notes to a Message

**As a** reviewer (Diana), **I want to** attach documents or notes to a message in the application messaging thread, **so that** I can provide annotated feedback or reference materials directly in the communication thread without a separate email.

**Acceptance Criteria:**
- [ ] Reviewer message composer includes an attachment option (file picker or drag-and-drop onto the compose area)
- [ ] Accepted attachment types and size limits match the document management feature (PDF, JPG, PNG, DOCX; ≤ 25MB)
- [ ] Attached files appear as downloadable links within the message bubble after sending
- [ ] Applicant can view and download reviewer-attached files from the messaging panel
- [ ] File validation errors are shown inline in the composer before sending
- [ ] Attachment feature is reviewer-only; applicants submit documents via the document panel (DOCS-01), not the message composer

**Priority:** P1 | **Req Ref:** MSG-04 | **Feature Ref:** F5

---

## Epic 6: Reviewer Workflow (F6)

> Reviewers have a dedicated workspace to manage all permit applications. All workflow actions — advance, request info, approve, reject — are available directly from the application detail view.

**Phase:** 3 — Review Workflow | **Priority:** P0

---

### US-6.1: View Assigned Application Queue

**As a** reviewer (Diana), **I want to** see a list of all permit applications assigned to me or available for my review, **so that** I can prioritize my work and identify which applications need action today without a supplemental spreadsheet.

**Acceptance Criteria:**
- [ ] Reviewer application list shows all applications in the reviewer's queue with: application ID, permit type, applicant name, status badge, and last-updated timestamp
- [ ] List is sortable by: status priority (Additional Info Needed → Submitted → Under Review), submission date, and last-updated date
- [ ] List is filterable by status (all, pending action, waiting on applicant, decided)
- [ ] Applications where the applicant has responded to an info request are visually surfaced / auto-sorted to the top of the "needs review" group
- [ ] Unread message counts are shown per application row
- [ ] Skeleton screen shown during list load; empty state message if no applications are assigned

**Priority:** P0 | **Req Ref:** PERM-05 | **Feature Ref:** F6

---

### US-6.2: View Full Application Detail as Reviewer

**As a** reviewer (Diana), **I want to** open any permit application and see all submitted form data, documents, communication history, status timeline, and action controls in one view, **so that** I can evaluate and act on an application without navigating between multiple pages.

**Acceptance Criteria:**
- [ ] Reviewer application detail page displays: all applicant-submitted form data (read-only), status timeline, document panel (with download), messaging panel, and status action controls
- [ ] All sections are visible on a single page with clear visual separation (no hidden tabs that obscure critical information)
- [ ] Status action controls are contextually available based on current status (e.g., "Begin Review" only when Submitted; "Approve/Reject" only when Under Review)
- [ ] Documented reasons for past info requests and decisions are visible on the timeline and/or in the action history
- [ ] Page loads all content within 3 seconds on a standard connection; skeleton screens used during fetch

**Priority:** P0 | **Req Ref:** PERM-06 | **Feature Ref:** F6

---

## Epic 7: Role-Specific Dashboards (F7)

> Every role lands on a dashboard tailored to their priorities — surfacing the information each role needs to act immediately, with at least one visual progress indicator per dashboard.

**Phase:** 4 — Dashboards | **Priority:** P1

---

### US-7.1: Applicant Views Their Dashboard

**As an** applicant (Marcus), **I want to** land on a dashboard that shows my active permits, recent status changes, and unread messages at a glance, **so that** I can immediately see if any of my applications need attention without navigating to the permit list.

**Acceptance Criteria:**
- [ ] Applicant dashboard displays summary cards: active applications count, applications with pending actions (Additional Info Needed), and total unread messages
- [ ] A recent applications list shows the last 5 applications with status badge, permit type, and last-activity timestamp
- [ ] Applications requiring action are visually highlighted in the recent list (e.g., "Action Required" badge)
- [ ] A "Start New Application" quick-action button is prominently accessible from the dashboard
- [ ] At least one visual progress indicator is present (e.g., status distribution of applications, or activity feed of recent changes)
- [ ] Dashboard data is no more than 30 seconds stale; updates without requiring a manual page refresh
- [ ] Dashboard loads within 3 seconds; skeleton screens shown during data fetch

**Priority:** P1 | **Req Ref:** DASH-01 | **Feature Ref:** F7

---

### US-7.2: Reviewer Views Their Dashboard

**As a** reviewer (Diana), **I want to** land on a dashboard that shows my application queue sorted by priority, pending actions, and unread messages, **so that** I can start processing applications immediately on login without consulting a spreadsheet.

**Acceptance Criteria:**
- [ ] Reviewer dashboard shows assigned applications sorted by action-required status: Additional Info Needed responses first, then newly Submitted, then Under Review
- [ ] Each application row in the dashboard shows: permit type, applicant name, status, last-updated timestamp, and unread message count
- [ ] Applications where the applicant has just responded are visually surfaced at the top of the queue
- [ ] A count summary is shown: "X applications need your action today"
- [ ] At least one visual progress indicator is present (e.g., a donut chart of applications by status, or activity feed)
- [ ] Dashboard data is no more than 30 seconds stale; auto-refreshes or uses polling
- [ ] Diana can identify her top 5 priority applications within 90 seconds of logging in (usability target)

**Priority:** P1 | **Req Ref:** DASH-02 | **Feature Ref:** F7

---

### US-7.3: Admin Views System-Wide Dashboard

**As an** admin (James), **I want to** see system-wide statistics on my dashboard — total applications by status and reviewer workload distribution — **so that** I can monitor system health and rebalance workload without a spreadsheet.

**Acceptance Criteria:**
- [ ] Admin dashboard displays total application counts broken down by status (Draft, Submitted, Under Review, Additional Info Needed, Approved, Rejected)
- [ ] A reviewer workload section shows: each reviewer's name, their application count by status, and pending action count
- [ ] A recent system activity feed shows the latest status changes, user provisioning actions, and reviewer assignments
- [ ] Dashboard data is no more than 30 seconds stale; refreshes automatically
- [ ] Admin can navigate from the workload section directly to any reviewer's application list
- [ ] Dashboard loads within 3 seconds with skeleton screens during data fetch

**Priority:** P1 | **Req Ref:** DASH-03 | **Feature Ref:** F7

---

### US-7.4: Dashboards Include Visual Progress Indicators

**As a** user (any role), **I want to** see at least one meaningful visual progress indicator on my dashboard, **so that** I can understand system state or my own progress at a glance without reading raw numbers.

**Acceptance Criteria:**
- [ ] Every role dashboard includes at least one chart or visual widget (e.g., status distribution donut/bar chart, activity feed with timeline, progress bar)
- [ ] Visual indicators use the application's design system colors — status colors map consistently to lifecycle stages
- [ ] Charts and graphs are readable without requiring legend interaction; labels are visible directly
- [ ] Visual indicators are accessible: charts include text alternatives (data table or ARIA labels) for screen readers
- [ ] Indicators reflect near-real-time data (≤ 30 seconds stale)

**Priority:** P1 | **Req Ref:** DASH-04 | **Feature Ref:** F7

---

## Epic 8: Admin Controls (F8)

> Administrators have full visibility and control: managing user accounts, assigning reviewers, viewing all applications, and accessing a complete, read-only audit log.

**Phase:** 5 — Admin & Compliance | **Priority:** P1

---

### US-8.1: Admin Views All Permit Applications System-Wide

**As an** admin (James), **I want to** view all permit applications across all applicants and reviewers in a single paginated list, **so that** I have full system visibility and can investigate any application without depending on individual reviewers.

**Acceptance Criteria:**
- [ ] Admin applications list shows all applications in the system regardless of applicant or assigned reviewer
- [ ] Each row displays: application ID, permit type, applicant name, assigned reviewer (if any), status badge, and submission/last-updated dates
- [ ] List is paginated (default 25 per page) with page navigation controls
- [ ] List is filterable by: status, assigned reviewer, permit type, and date range
- [ ] List is sortable by: submission date (default), last-updated date, and status
- [ ] Admin can open any application's full detail view in read-only mode

**Priority:** P1 | **Req Ref:** PERM-07 | **Feature Ref:** F8

---

### US-8.2: Admin Creates and Manages User Accounts

**As an** admin (James), **I want to** create new user accounts and deactivate existing ones directly from the admin interface, **so that** I can onboard new staff and revoke access immediately without vendor involvement.

**Acceptance Criteria:**
- [ ] User management page lists all users with: name, email, role, account status (Active/Deactivated), and created-at date
- [ ] "Create User" form collects: full name, email, and role (Applicant / Reviewer / Admin); role is mandatory
- [ ] Created accounts receive an email invite to set their password (or a temporary password is shown once)
- [ ] "Deactivate" action on any active account immediately revokes all session tokens and blocks login; no grace period
- [ ] Deactivated accounts remain in the list with a "Deactivated" status; they can be reactivated by the admin
- [ ] Role changes take effect immediately on the user's next API call (no cache delay)
- [ ] All create, deactivate, and role-change actions are logged in the audit trail with James's actor ID, timestamp, and target user
- [ ] James can complete account creation or deactivation in under 2 minutes (usability target)

**Priority:** P1 | **Req Ref:** ADMN-01 | **Feature Ref:** F8

---

### US-8.3: Admin Assigns Reviewers to Permit Applications

**As an** admin (James), **I want to** assign or reassign reviewers to permit applications, **so that** I can balance workload when staffing changes without a verbal handoff or spreadsheet.

**Acceptance Criteria:**
- [ ] On any application's detail page (admin view), a "Assign Reviewer" control shows the currently assigned reviewer and allows selection from active reviewers
- [ ] Admin can also reassign from the all-applications list view (inline action or bulk action)
- [ ] Reassigning a reviewer sends an in-app notification to the newly assigned reviewer
- [ ] The previously assigned reviewer is notified of the reassignment (in-app)
- [ ] Reviewer assignment change is reflected immediately in the reviewer's application queue
- [ ] Bulk assignment: admin can select multiple applications and assign them to a single reviewer in one action
- [ ] All assignment and reassignment actions are captured in the audit log

**Priority:** P1 | **Req Ref:** ADMN-02 | **Feature Ref:** F8

---

### US-8.4: Admin Views Audit Log

**As an** admin (James), **I want to** view a complete, chronological audit log of all status changes and key system actions, **so that** I can reconstruct any application's decision history for compliance audits without piecing together email threads.

**Acceptance Criteria:**
- [ ] Audit log page displays all recorded events in reverse-chronological order
- [ ] Each log entry includes: actor name and role, action type, application ID (where applicable), target user (for user management actions), and ISO timestamp
- [ ] Audit log covers: all status transitions, document uploads, messages sent, user account creation/deactivation, role changes, reviewer assignments, and unauthorized access attempts
- [ ] Log is filterable by: date range, actor (user), action type, and application ID
- [ ] Log is searchable by application ID or user name
- [ ] Audit log is read-only and append-only; no entries can be deleted or modified
- [ ] Log is exportable as CSV for external audit submission
- [ ] Admin can retrieve a complete activity log for any application within 2 minutes (usability target)

**Priority:** P1 | **Req Ref:** ADMN-03 | **Feature Ref:** F8

---

## Epic 9: Accessibility & Responsive Design (F9)

> The entire interface is fully functional on desktop and mobile, and meets WCAG 2.1 AA accessibility standards throughout. Accessibility is built into every component from the foundation phase — not a post-launch audit task.

**Phase:** 2 (responsive) → Phase 5 (full WCAG audit) | **Priority:** P0

---

### US-9.1: Use the Platform on Desktop and Mobile Devices

**As a** user (any role), **I want to** use all platform features on any screen size from mobile (375px) to desktop (1440px+), **so that** I can access and act on my permits whether I'm at my desk or on a job site using my phone.

**Acceptance Criteria:**
- [ ] All pages and features are fully functional on viewport widths from 375px to 1440px and above
- [ ] Navigation is usable on mobile (e.g., hamburger menu or collapsible nav); no horizontal scrolling on content pages
- [ ] Document upload drag-and-drop degrades gracefully on touch devices (tap-to-browse fallback is available)
- [ ] Application list, detail view, messaging panel, and dashboard are all usable on a 375px viewport without content being hidden or truncated
- [ ] Tables and data grids reflow to card layouts on small screens where appropriate
- [ ] Touch targets (buttons, links) are at least 44×44px on mobile per WCAG 2.5.5
- [ ] Responsive behavior is verified on iOS Safari and Android Chrome (current OS versions)

**Priority:** P0 | **Req Ref:** UX-01 | **Feature Ref:** F9

---

### US-9.2: Access the Platform With Assistive Technologies

**As a** user who relies on a keyboard or screen reader, **I want to** navigate and operate all platform features without a mouse, **so that** I can complete permitting tasks independently regardless of my accessibility needs.

**Acceptance Criteria:**
- [ ] All interactive elements (buttons, links, form inputs, modals, dropdowns) are reachable and operable via keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys as appropriate)
- [ ] Focus order is logical and follows visual reading order; no focus traps except within open modal dialogs
- [ ] All interactive elements have visible, styled focus indicators (not suppressed browser-default outlines)
- [ ] All images, icons, and non-text content have meaningful alt text or ARIA labels
- [ ] Form fields have associated `<label>` elements; error messages are associated via `aria-describedby`
- [ ] Status updates and notifications use ARIA live regions so screen readers announce changes without requiring focus movement
- [ ] Lifecycle timeline stages are accessible: each stage reads as name + status + timestamp in screen reader output
- [ ] Color contrast ratios meet WCAG 2.1 AA: ≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI components
- [ ] All pages pass automated WCAG 2.1 AA audit (axe-core or equivalent) with zero critical violations

**Priority:** P0 | **Req Ref:** UX-02 | **Feature Ref:** F9

---

## Story Index

| Story ID | Title | Role | Phase | Priority | Req Ref | Feature |
|---|---|---|---|---|---|---|
| US-0.1 | Create an Account | All | 1 | P0 | AUTH-01 | F0 |
| US-0.2 | Log In and Maintain Session | All | 1 | P0 | AUTH-02 | F0 |
| US-0.3 | Log Out | All | 1 | P0 | AUTH-03 | F0 |
| US-0.4 | Reset Forgotten Password | All | 1 | P0 | AUTH-04 | F0 |
| US-0.5 | Role-Based Access Control Enforcement | System | 1 | P0 | AUTH-05 | F0 |
| US-1.1 | Experience a Custom Visual Design | All | 1 | P0 | UX-05 | F1 |
| US-1.2 | See Skeleton Screens During Page-Level Loads | All | 1 | P0 | UX-03 | F1 |
| US-1.3 | Experience Smooth Micro-Interactions | All | 1 | P0 | UX-04 | F1 |
| US-2.1 | Submit a New Permit Application | Applicant | 2 | P0 | PERM-01 | F2 |
| US-2.2 | Save Application as Draft | Applicant | 2 | P0 | PERM-02 | F2 |
| US-2.3 | View My Application List | Applicant | 2 | P0 | PERM-03 | F2 |
| US-2.4 | View Full Application Detail | Applicant | 2 | P0 | PERM-04 | F2 |
| US-3.1 | Upload Documents via Drag-and-Drop | Applicant | 2 | P0 | DOCS-01 | F3 |
| US-3.2 | Receive Immediate File Validation Feedback | Applicant | 2 | P0 | DOCS-02 | F3 |
| US-3.3 | Preview Uploaded Documents Inline | Applicant | 2 | P0 | DOCS-03 | F3 |
| US-3.4 | Remove or Replace Documents Before Submission | Applicant | 2 | P0 | DOCS-04 | F3 |
| US-3.5 | Reviewer Views and Downloads Application Documents | Reviewer | 3 | P0 | DOCS-05 | F3 |
| US-4.1 | Lifecycle Stages Are Defined and Enforced | All | 2→3 | P0 | STAT-01 | F4 |
| US-4.2 | View Visual Lifecycle Timeline | Applicant | 2 | P0 | STAT-02 | F4 |
| US-4.3 | Reviewer Advances Application to Under Review | Reviewer | 3 | P0 | STAT-03 | F4 |
| US-4.4 | Reviewer Requests Additional Information | Reviewer | 3 | P0 | STAT-04 | F4 |
| US-4.5 | Applicant Responds to Additional Information Request | Applicant | 3 | P0 | STAT-05 | F4 |
| US-4.6 | Reviewer Approves or Rejects Application | Reviewer | 3 | P0 | STAT-06 | F4 |
| US-4.7 | Receive In-App Notification on Status Change | Applicant | 3 | P0 | STAT-07 | F4 |
| US-5.1 | Exchange Messages on a Permit Application | Applicant, Reviewer | 3 | P1 | MSG-01 | F5 |
| US-5.2 | View Message Sender Identity and Timestamp | Applicant, Reviewer | 3 | P1 | MSG-02 | F5 |
| US-5.3 | See Unread Message Counts | Applicant, Reviewer | 3 | P1 | MSG-03 | F5 |
| US-5.4 | Reviewer Attaches Documents or Notes to Message | Reviewer | 3 | P1 | MSG-04 | F5 |
| US-6.1 | View Assigned Application Queue | Reviewer | 3 | P0 | PERM-05 | F6 |
| US-6.2 | View Full Application Detail as Reviewer | Reviewer | 3 | P0 | PERM-06 | F6 |
| US-7.1 | Applicant Views Their Dashboard | Applicant | 4 | P1 | DASH-01 | F7 |
| US-7.2 | Reviewer Views Their Dashboard | Reviewer | 4 | P1 | DASH-02 | F7 |
| US-7.3 | Admin Views System-Wide Dashboard | Admin | 4 | P1 | DASH-03 | F7 |
| US-7.4 | Dashboards Include Visual Progress Indicators | All | 4 | P1 | DASH-04 | F7 |
| US-8.1 | Admin Views All Permit Applications System-Wide | Admin | 5 | P1 | PERM-07 | F8 |
| US-8.2 | Admin Creates and Manages User Accounts | Admin | 5 | P1 | ADMN-01 | F8 |
| US-8.3 | Admin Assigns Reviewers to Applications | Admin | 5 | P1 | ADMN-02 | F8 |
| US-8.4 | Admin Views Audit Log | Admin | 5 | P1 | ADMN-03 | F8 |
| US-9.1 | Use the Platform on Desktop and Mobile | All | 2→5 | P0 | UX-01 | F9 |
| US-9.2 | Access the Platform With Assistive Technologies | All | 2→5 | P0 | UX-02 | F9 |

**Total:** 40 stories covering all 40 v1 requirements across 10 epics and 5 delivery phases.

---

## Priority Definitions

| Priority | Label | Meaning |
|---|---|---|
| **P0** | Critical | MVP gate — launch is blocked without this. All P0 stories must be complete before v1 ships. |
| **P1** | High | Required for full product value — included in v1. Delivers a complete, useful product when combined with P0. |
| **P2** | Medium | Improves experience — targeted for v1 if timeline allows; deferred to v2 if necessary. |
| **P3** | Low | Nice to have — deferred to v2 or beyond; not required for initial launch. |

**Note:** All 40 stories in this document are P0 or P1 — reflecting that every v1 requirement maps to either a critical MVP gate or a high-value feature required for a complete product. No P2/P3 stories exist in v1 scope; those will appear in the v2 backlog.

---

## Requirement Coverage

| Requirement Group | Requirements | Stories | Coverage |
|---|---|---|---|
| Authentication & User Management | AUTH-01–05 | US-0.1–0.5 | ✓ 5/5 |
| Design System & UI Foundation | UX-03, UX-04, UX-05 | US-1.1–1.3 | ✓ 3/3 |
| Permit Application Submission | PERM-01–04 | US-2.1–2.4 | ✓ 4/4 |
| Document Management | DOCS-01–05 | US-3.1–3.5 | ✓ 5/5 |
| Status Tracking & Lifecycle | STAT-01–07 | US-4.1–4.7 | ✓ 7/7 |
| Messaging & Communication | MSG-01–04 | US-5.1–5.4 | ✓ 4/4 |
| Reviewer Workflow | PERM-05–06 | US-6.1–6.2 | ✓ 2/2 |
| Dashboards | DASH-01–04 | US-7.1–7.4 | ✓ 4/4 |
| Admin Controls | PERM-07, ADMN-01–03 | US-8.1–8.4 | ✓ 4/4 |
| Accessibility & Responsive | UX-01, UX-02 | US-9.1–9.2 | ✓ 2/2 |
| **Total** | **40** | **40** | **✓ 40/40** |

---

*User Stories Version 1.0 — Generated 2026-07-21*  
*All 40 v1 requirements covered. Personas: Marcus Rivera (Applicant), Diana Osei (Reviewer), James Whitfield (Admin).*  
*Derived from: PRD-PermitManagementSystem.md, FRD-PermitManagementSystem.md, JTBD-PermitManagementSystem.md, Personas-PermitManagementSystem.md*
