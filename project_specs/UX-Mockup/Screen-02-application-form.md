## Screen Designs — New Application Form & Application Detail (Applicant)

---

### Screen-05: New Application Form

**Route:** `/applications/new`
**Purpose:** Structured form for creating and submitting a permit application
**User Stories:** US-2.1, US-2.2, US-3.1, US-3.2, US-3.3, US-3.4

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER: New Application  ← Back    Saved ✓  [🔔] [MR]  │
├───────────────────┼─────────────────────────────────────────────────────────┤
│                   │                                                         │
│  [nav]            │  New Permit Application                                 │
│                   │  Complete all required fields to submit.                │
│                   │                                                         │
│                   │  ┌── Progress Steps ───────────────────────────────┐  │
│                   │  │  ①── Permit Details ──②── Documents ──③── Review│  │
│                   │  └─────────────────────────────────────────────────┘  │
│                   │                                                         │
│                   │  ── Step 1: Permit Details ─────────────────────────── │
│                   │                                                         │
│                   │  ┌─────────────────────────────────────────────────┐  │
│                   │  │                                                  │  │
│                   │  │  Permit Type *                                   │  │
│                   │  │  ┌────────────────────────────────────────────┐  │  │
│                   │  │  │ Commercial Tenant Improvement            ▾  │  │  │
│                   │  │  └────────────────────────────────────────────┘  │  │
│                   │  │  ℹ Required docs: Site plan, Contractor cert,   │  │  │
│                   │  │    Fire suppression plan                         │  │  │
│                   │  │                                                  │  │  │
│                   │  │  Project Description *                           │  │  │
│                   │  │  ┌────────────────────────────────────────────┐  │  │
│                   │  │  │                                            │  │  │
│                   │  │  │                                            │  │  │
│                   │  │  └────────────────────────────────────────────┘  │  │
│                   │  │  Describe the scope of work (min 50 characters)  │  │
│                   │  │                                                  │  │  │
│                   │  │  ── Site Address ──────────────────────────────  │  │
│                   │  │                                                  │  │
│                   │  │  Street Address *      Unit/Suite               │  │
│                   │  │  ┌─────────────────┐  ┌─────────────────┐      │  │
│                   │  │  │                 │  │                 │      │  │
│                   │  │  └─────────────────┘  └─────────────────┘      │  │
│                   │  │                                                  │  │
│                   │  │  City *                State *   ZIP *          │  │
│                   │  │  ┌──────────┐  ┌──────┐  ┌──────┐             │  │
│                   │  │  │          │  │  CA  │  │      │             │  │
│                   │  │  └──────────┘  └──────┘  └──────┘             │  │
│                   │  │                                                  │  │
│                   │  │  ── Contact Information ────────────────────── │  │
│                   │  │  (Pre-filled from profile — editable)           │  │
│                   │  │                                                  │  │
│                   │  │  Contact Name *        Phone *                  │  │
│                   │  │  ┌─────────────────┐  ┌─────────────────┐      │  │
│                   │  │  │ Marcus Rivera   │  │ (555) 867-5309  │      │  │
│                   │  │  └─────────────────┘  └─────────────────┘      │  │
│                   │  │  Company Name                                    │  │
│                   │  │  ┌────────────────────────────────────────────┐  │  │
│                   │  │  │ Rivera Construction Group                  │  │  │
│                   │  │  └────────────────────────────────────────────┘  │  │
│                   │  │                                                  │  │
│                   │  │  ┌─────────────────────┐  ┌────────────────┐   │  │
│                   │  │  │   Save Draft        │  │  Next: Docs → │   │  │  ← secondary + primary buttons
│                   │  │  └─────────────────────┘  └────────────────┘   │  │
│                   │  └─────────────────────────────────────────────────┘  │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

#### Progress Stepper

```
  ①  Permit Details        ──────────        ②  Documents        ──────────        ③  Review & Submit
  ●────────────────────────────────────────────●─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─●
  complete (step done)                      active (current)             upcoming (muted)

  Complete step: ● filled primary-500, label text-primary-600 font-semibold
  Active step  : ● filled primary-500 ring-4 ring-primary-100, label text-primary-600 font-semibold
  Upcoming step: ○ border-surface-300, label text-text-500
  Connector    : ── primary-500 (complete) or dashed surface-300 (upcoming)
```

#### Step 2: Document Upload

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ── Step 2: Upload Documents ────────────────────────────────────────────── │
│                                                                             │
│  Attach all required supporting documents.                                 │
│  Required for this permit type: Site plan, Contractor cert, Fire plan      │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                                                                    │    │
│  │   ☁  Drag & drop files here, or click to browse                   │    │
│  │                                                                    │    │
│  │      Accepted: PDF, JPG, PNG, DOCX · Max 25 MB per file          │    │
│  │                                                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│  bg-surface-50 border-2 border-dashed border-surface-300 rounded-xl p-12   │
│  text-center; hover: border-primary-400 bg-primary-50                      │
│  drag-over: border-primary-500 bg-primary-50 scale-[1.01]                  │
│                                                                             │
│  ── Uploaded Files ──────────────────────────────────────────────────────  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ [PDF] site_plan_v2.pdf           · 2.4 MB · Jul 21, 10:14 AM    ✓  │  │
│  │       ████████████████████████████████████████ 100%               │  │
│  │       [👁 Preview]  [✕ Remove]                                     │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ [IMG] contractor_cert.jpg         · 890 KB                        ✓  │  │
│  │       [thumbnail 48×48]  [👁 Preview]  [✕ Remove]                  │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │ [PDF] invoice.exe ✗ Not accepted — only PDF, JPG, PNG, DOCX        │  │
│  │       [✕ Dismiss]                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────┐  ┌────────────────────────┐                      │
│  │   ← Back            │  │  Next: Review →         │                      │
│  └──────────────────────┘  └────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Upload Progress States

```
Uploading : [filename.pdf] ████████░░░░ 67% · Uploading…
Complete  : [filename.pdf] ████████████ ✓  · 2.4 MB
Error     : [filename.pdf] ✗ Upload failed — click to retry
Invalid   : [invoice.exe]  ✗ Not accepted · red text, bg-red-50 row
Oversized : [bigfile.pdf]  ✗ Exceeds 25 MB limit · red text, bg-red-50 row
```

#### Step 3: Review & Submit

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ── Step 3: Review & Submit ──────────────────────────────────────────────  │
│                                                                             │
│  ┌── Permit Details (read-only) ────────────────────────────────────────┐  │
│  │  Permit Type: Commercial Tenant Improvement                          │  │
│  │  Description: Interior renovation including electrical…              │  │
│  │  Site Address: 1420 Monroe St., Suite 4B, Oakland CA 94612          │  │
│  │  Contact: Marcus Rivera · (555) 867-5309 · Rivera Construction       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌── Documents (3 attached) ────────────────────────────────────────────┐  │
│  │  📄 site_plan_v2.pdf   📷 contractor_cert.jpg   📄 fire_plan.pdf    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌── Error summary (only shown on invalid submit attempt) ──────────────┐  │
│  │  ✗ Please fix the following before submitting:                        │  │
│  │    · Project description is required                                  │  │
│  │    · At least one document must be uploaded                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────┐  ┌────────────────────────────────────────────┐  │
│  │   ← Back to Docs    │  │  Submit Application  → [primary, h-11]     │  │
│  └──────────────────────┘  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Submission Confirmation Screen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│               ┌───────────────────────────────────────────┐                │
│               │  ✓                                        │                │
│               │  Application Submitted!                   │  ← H2 centered │
│               │                                           │                │
│               │  Your application has been received       │                │
│               │  and is now in the review queue.          │                │
│               │                                           │                │
│               │  Application ID                           │                │
│               │  ┌────────────────────────────────────┐   │                │
│               │  │  #APP-2024-0042                    │   │  ← mono, copy  │
│               │  └────────────────────────────────────┘   │                │
│               │                                           │                │
│               │  Submitted: Jul 21, 2026 at 10:32 AM     │                │
│               │  Status: Submitted                        │                │
│               │                                           │                │
│               │  You'll be notified when a reviewer       │                │
│               │  begins evaluating your application.      │                │
│               │                                           │                │
│               │  [View Application]  [Go to Dashboard]    │                │
│               └───────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Auto-Save Indicator

```
Saving…   : ↻ Saving…   text-text-500 text-xs animate-spin (icon)
Saved     : ✓ Saved      text-emerald-600 text-xs (shown 3s then fades)
Save error: ✗ Not saved  text-red-600 text-xs + "Retry" link
```

#### States (full form)

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Empty form | All fields blank, pre-filled contact visible | N/A |
| Typing | Focus ring, character count on textarea | Real-time |
| Field error (blur) | Red border + error text | "Project description is required" |
| Auto-saved | "✓ Saved" indicator in header | Fades after 3s |
| Unsaved nav | Confirm dialog | "Leave page? Unsaved changes will be lost." |
| Submitting | Submit btn spinner; all inputs disabled | "Submitting…" |

---

### Screen-06: Application Detail (Applicant)

**Route:** `/applications/:id`
**Purpose:** Full detail view — status, timeline, documents, messaging
**User Stories:** US-2.4, US-4.2, US-4.5, US-3.3, US-5.1, US-5.2, US-5.3

#### Layout (submitted / under review state)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER: ← Applications  App #APP-0042     [🔔] [MR]   │
├───────────────────┼─────────────────────────────────────────────────────────┤
│                   │                                                         │
│  [nav]            │  Commercial Tenant Improvement              [Download ↓]│
│                   │  #APP-0042 · Submitted Jul 18, 2026                     │
│                   │                                                         │
│                   │  ┌── Status ────────────────────────────────────────┐  │
│                   │  │  🔵 Under Review                                  │  │
│                   │  └──────────────────────────────────────────────────┘  │
│                   │                                                         │
│                   │  ┌── Lifecycle Timeline ────────────────────────────┐  │
│                   │  │                                                  │  │
│                   │  │  ●─────────●─────────●─ ─ ─ ─○─ ─ ─ ─○         │  │
│                   │  │ Draft    Submit   Review    Info     Approved    │  │
│                   │  │  ✓ Jul15  ✓ Jul18  ✓ Jul19  (next)   (later)   │  │
│                   │  │                                                  │  │
│                   │  └──────────────────────────────────────────────────┘  │
│                   │                                                         │
│                   │  ┌────────────────────┐  ┌────────────────────────┐   │
│                   │  │  APPLICATION INFO  │  │  MESSAGING PANEL       │   │
│                   │  │  (left 50%)        │  │  (right 50%)           │   │
│                   │  │                    │  │                        │   │
│                   │  │  Permit Type       │  │  Diana Osei · Reviewer │   │
│                   │  │  Commercial TI     │  │  ──────────────────── │   │
│                   │  │                    │  │                        │   │
│                   │  │  Project Desc.     │  │  Jul 19, 10:14 AM      │   │
│                   │  │  Interior reno…    │  │  ┌──────────────────┐  │   │
│                   │  │                    │  │  │ Application rec'd │  │   │
│                   │  │  Site Address      │  │  │ Thank you, under  │  │   │
│                   │  │  1420 Monroe St.   │  │  │ review now.       │  │   │
│                   │  │  Oakland CA 94612  │  │  └──────────────────┘  │   │
│                   │  │                    │  │  Reviewer [badge]      │   │
│                   │  │  Contact           │  │                        │   │
│                   │  │  Marcus Rivera     │  │                        │   │
│                   │  │  (555) 867-5309    │  │  ┌──────────────────┐  │   │
│                   │  │                    │  │  │ Quick question?   │  │   │
│                   │  │  ─────────────     │  │  └──────────────────┘  │   │
│                   │  │  Documents (3)     │  │  You [right-aligned]   │   │
│                   │  │                    │  │                        │   │
│                   │  │  [PDF] site_plan   │  │                        │   │
│                   │  │       👁 ↓ Remove  │  │  ┌──────────────────┐  │   │
│                   │  │  [IMG] cert.jpg    │  │  │ Type a message…  │  │   │
│                   │  │       👁 ↓ Remove  │  │  └──────────────────┘  │   │
│                   │  │  [PDF] fire_plan   │  │              [Send →] │   │
│                   │  │       👁 ↓ Remove  │  │                        │   │
│                   │  │                    │  │                        │   │
│                   │  │  [+ Upload More]   │  │                        │   │
│                   │  └────────────────────┘  └────────────────────────┘   │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

#### "Additional Info Needed" State (action required)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Above timeline — prominent banner]                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ⚠  Action Required — Additional Information Requested               │  │
│  │                                                                      │  │
│  │  Diana Osei (Reviewer) · Jul 20, 2026 at 2:15 PM                    │  │
│  │                                                                      │  │
│  │  "Please provide an updated fire suppression plan with the          │  │
│  │   structural engineer's stamp on page 3. The current version        │  │
│  │   is missing the required certification."                           │  │
│  │                                                                      │  │
│  │  [Upload Documents]  [Re-Submit for Review →]                       │  │  ← Re-Submit enabled after upload
│  └──────────────────────────────────────────────────────────────────────┘  │
│  bg-orange-50 border border-orange-200 rounded-lg                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Lifecycle Timeline Detail

```
Completed stage:
  ● filled circle (primary-500) + checkmark icon
  Label below: stage name (font-semibold text-primary-700)
  Timestamp below label: "Jul 18 · 10:32 AM" (text-xs text-text-500)
  Connector: solid line primary-300

Current stage:
  ● filled circle (primary-500) + ring-4 ring-primary-100 pulse animation
  Label: bold text-primary-700
  "In progress" sub-label text-xs text-text-500

Upcoming stage:
  ○ empty circle border-2 border-surface-300
  Label: text-text-400
  Connector: dashed surface-200

Terminal: Approved
  ✓ circle filled emerald-500
  Label: "Approved" text-emerald-700 font-semibold + timestamp

Terminal: Rejected
  ✗ circle filled red-500
  Label: "Rejected" text-red-700 font-semibold + timestamp + reason (collapsed expandable)

Mobile (< 768px): Timeline stacks vertically (connector becomes left-edge border)
```

#### Document List Row

```
┌──────────────────────────────────────────────────────────────────────────┐
│  flex items-center gap-3 py-3 border-b border-surface-100                │
│                                                                          │
│  [file type icon 36×36]  site_plan_v2.pdf                               │
│  bg-red-50 text-red-600  text-sm font-medium text-text-900              │
│  "PDF"                   2.4 MB · Jul 21                                 │
│                          text-xs text-text-500                           │
│                                                                          │
│  [👁 Preview]  [↓ Download]  [✕ Remove]  ← icon buttons, hover effects  │
└──────────────────────────────────────────────────────────────────────────┘
```

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Loading | Skeleton: status bar, timeline, two-col layout | Pulse animation |
| Submitted | Read-only form fields, no edit access | "Submitted — read only" tooltip on fields |
| Under Review | Blue status badge, timeline stage 3 active | N/A |
| Additional Info | Orange banner + action buttons | Prominent above all content |
| Approved | Green status badge, full timeline complete | Approval notice visible in thread |
| Rejected | Red status badge, rejected stage marked | Rejection reason in thread |

---

*End of Screen-02-application-form.md*
