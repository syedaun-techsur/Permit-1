## Screen Designs — Application Detail (Reviewer) + Action Modals

---

### Screen-09: Application Detail — Reviewer View

**Route:** `/review/applications/:id`
**Purpose:** Single-pane review workspace: form data, documents, messaging, action controls
**User Stories:** US-6.2, US-3.5, US-4.3, US-4.4, US-4.6, US-5.1, US-5.2, US-5.4

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (reviewer) │  HEADER: ← Queue  App #APP-0042         [🔔 5] [DO]  │
├─────────────────────┼───────────────────────────────────────────────────────┤
│                     │                                                       │
│  [nav]              │  Commercial Tenant Improvement — #APP-0042            │
│                     │  Marcus Rivera · Submitted Jul 18, 2026               │
│                     │                                                       │
│                     │  ┌── Reviewer Action Panel ────────────────────────┐ │
│                     │  │  Status: 🔵 Submitted                           │ │
│                     │  │                                                  │ │
│                     │  │  ┌──────────────────────────────────────────┐   │ │
│                     │  │  │  [Begin Review]  ← primary button h-11  │   │ │
│                     │  │  └──────────────────────────────────────────┘   │ │
│                     │  └──────────────────────────────────────────────────┘ │
│                     │                    ▲ changes per status (see below)   │
│                     │                                                       │
│                     │  ┌── Lifecycle Timeline ───────────────────────────┐ │
│                     │  │  ●─────────●─ ─ ─ ─○─ ─ ─ ─○─ ─ ─ ─○          │ │
│                     │  │ Submit   Review  Info?    Approved  Rejected     │ │
│                     │  │ ✓ Jul18   (next)                                │ │
│                     │  └──────────────────────────────────────────────────┘ │
│                     │                                                       │
│                     │  ┌────────────────────┐  ┌────────────────────────┐  │
│                     │  │  LEFT COL (55%)    │  │  RIGHT COL (45%)       │  │
│                     │  │                    │  │                        │  │
│                     │  │ ─ Application Info ─│  │ ─ Messaging Panel ─── │  │
│                     │  │                    │  │                        │  │
│                     │  │  Permit Type       │  │ [chronological thread] │  │
│                     │  │  Commercial TI     │  │                        │  │
│                     │  │                    │  │  Jul 18, 10:32 AM      │  │
│                     │  │  Project Desc.     │  │  ┌──────────────────┐  │  │
│                     │  │  Interior reno     │  │  │ Attached fire    │  │  │
│                     │  │  including…        │  │  │ suppression plan │  │  │
│                     │  │                    │  │  └──────────────────┘  │  │
│                     │  │  Site Address      │  │  Marcus R. · Applicant │  │
│                     │  │  1420 Monroe St.   │  │                        │  │
│                     │  │  Oakland CA 94612  │  │  ┌──────────────────┐  │  │
│                     │  │                    │  │  │ Application looks│  │  │
│                     │  │  Contact           │  │  │ complete to me   │  │  │
│                     │  │  Marcus Rivera     │  │  └──────────────────┘  │  │
│                     │  │  (555) 867-5309    │  │  Diana O. · Reviewer   │  │
│                     │  │                    │  │                        │  │
│                     │  │  ─ Documents (3) ── │  │  ┌──────────────────┐  │  │
│                     │  │                    │  │  │ 📎 Attach file   │  │  │
│                     │  │  [PDF] site_plan   │  │  │ Type a message…  │  │  │
│                     │  │  👁 Preview ↓ DL   │  │  └──────────────────┘  │  │
│                     │  │                    │  │  [📎 Attach] [Send →]  │  │
│                     │  │  [IMG] cert.jpg    │  │                        │  │
│                     │  │  👁 Preview ↓ DL   │  │                        │  │
│                     │  │                    │  │                        │  │
│                     │  │  [PDF] fire_plan   │  │                        │  │
│                     │  │  👁 Preview ↓ DL   │  │                        │  │
│                     │  │                    │  │                        │  │
│                     │  │  [↓ Download All]  │  │                        │  │
│                     │  └────────────────────┘  └────────────────────────┘  │
└─────────────────────┴─────────────────────────────────────────────────────┘
```

#### Reviewer Action Panel — Status-Conditional Controls

```
┌── When Status = Submitted ─────────────────────────────────────────────────┐
│  🔵 Submitted                                                              │
│  This application has been received and is awaiting review.                │
│                                                                            │
│  [  Begin Review  ]  ← primary button (full width in panel)               │
└────────────────────────────────────────────────────────────────────────────┘

┌── When Status = Under Review ──────────────────────────────────────────────┐
│  🟡 Under Review                                                           │
│  You are assigned to this application. Take action below.                 │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  [  Request Additional Information  ]  ← secondary button            │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────┐  ┌─────────────────────────┐                   │
│  │  ✓  Approve           │  │  ✗  Reject              │                   │
│  │  primary/emerald btn  │  │  danger/red btn         │                   │
│  └───────────────────────┘  └─────────────────────────┘                   │
└────────────────────────────────────────────────────────────────────────────┘

┌── When Status = Additional Info Needed ────────────────────────────────────┐
│  🟠 Additional Information Requested                                       │
│  Awaiting applicant response. You'll be notified when they respond.       │
│                                                                            │
│  Request sent: Jul 20, 2026 at 2:15 PM                                    │
│  "Please provide updated fire suppression plan with engineer's stamp."    │
│  ─ action buttons hidden/disabled until applicant responds ─              │
└────────────────────────────────────────────────────────────────────────────┘

┌── When Status = Approved / Rejected (terminal) ────────────────────────────┐
│  ✓ Approved  /  ✗ Rejected                                                │
│  Decision recorded: Jul 22, 2026 at 3:41 PM · Diana Osei                 │
│  Reason: "All required documents present and verified."                   │
│  ─ No further actions available ─                                         │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen-10: Request Additional Information Modal

**Triggered by:** "Request Additional Information" button on reviewer detail view
**User Stories:** US-4.4

#### Modal Design

```
┌─── BACKDROP (bg-black/50) ─────────────────────────────────────────────────┐
│                                                                             │
│          ┌─────────────────────────────────────────────────────┐           │
│          │  bg-white rounded-xl shadow-xl w-[540px] p-8        │           │
│          │                                                      │           │
│          │  Request Additional Information          ✕           │           │
│          │  text-xl font-semibold                  close btn    │           │
│          │                                                      │           │
│          │  Application: #APP-0042 — Monroe St. Comm. TI        │           │
│          │  text-sm text-text-500                               │           │
│          │                                                      │           │
│          │  ─────────────────────────────────────────────────   │           │
│          │                                                      │           │
│          │  Request Note *                                      │           │
│          │  Describe exactly what information is needed.        │           │
│          │  This note will be visible to the applicant.        │           │
│          │                                                      │           │
│          │  ┌────────────────────────────────────────────────┐  │           │
│          │  │                                                │  │           │
│          │  │                                                │  │           │
│          │  │                                                │  │           │
│          │  └────────────────────────────────────────────────┘  │           │
│          │  min-h-[120px] textarea                              │           │
│          │  0 / 1000 characters                                │           │
│          │                                                      │           │
│          │  ⓘ This note will be posted as a message in the     │           │
│          │    application thread and trigger an email           │           │
│          │    notification to the applicant.                   │           │
│          │    The application status will change to            │           │
│          │    "Additional Info Needed."                        │           │
│          │                                                      │           │
│          │  ┌──────────────┐  ┌──────────────────────────────┐ │           │
│          │  │  Cancel      │  │  Send Request →              │ │           │
│          │  │  secondary   │  │  primary (disabled if empty) │ │           │
│          │  └──────────────┘  └──────────────────────────────┘ │           │
│          └─────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen-11: Approve Application Modal

**Triggered by:** "Approve" button on reviewer detail view
**User Stories:** US-4.6

#### Modal Design

```
┌─── BACKDROP ───────────────────────────────────────────────────────────────┐
│                                                                             │
│          ┌─────────────────────────────────────────────────────┐           │
│          │  Approve Application                     ✕           │           │
│          │                                                      │           │
│          │  ✓  You are approving:                               │           │
│          │     #APP-0042 — Commercial Tenant Improvement        │           │
│          │     Marcus Rivera                                    │           │
│          │     Submitted Jul 18, 2026                          │           │
│          │                                                      │           │
│          │  This action is final and cannot be undone          │           │
│          │  by a reviewer. The applicant will be notified      │           │
│          │  immediately.                                        │           │
│          │                                                      │           │
│          │  Approval Rationale *                                │           │
│          │  Your reasoning is recorded in the audit log        │           │
│          │  and visible to the applicant.                      │           │
│          │                                                      │           │
│          │  ┌────────────────────────────────────────────────┐  │           │
│          │  │                                                │  │           │
│          │  │                                                │  │           │
│          │  └────────────────────────────────────────────────┘  │           │
│          │  Describe why this application is approved.         │           │
│          │                                                      │           │
│          │  ┌──────────────┐  ┌──────────────────────────────┐ │           │
│          │  │  Cancel      │  │  ✓ Confirm Approval          │ │           │
│          │  │  secondary   │  │  primary-emerald (disabled   │ │           │
│          │  │              │  │  until rationale entered)    │ │           │
│          │  └──────────────┘  └──────────────────────────────┘ │           │
│          └─────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen-12: Reject Application Modal

**Triggered by:** "Reject" button on reviewer detail view
**User Stories:** US-4.6

#### Modal Design

```
┌─── BACKDROP ───────────────────────────────────────────────────────────────┐
│                                                                             │
│          ┌─────────────────────────────────────────────────────┐           │
│          │  Reject Application                      ✕           │           │
│          │                                                      │           │
│          │  ✗  You are rejecting:                               │           │
│          │     #APP-0042 — Commercial Tenant Improvement        │           │
│          │     ── bg-red-50 border-red-200 rounded-lg px-4 py-3 │           │
│          │                                                      │           │
│          │  This action is final. The applicant will            │           │
│          │  receive the rejection notice and reason             │           │
│          │  immediately.                                        │           │
│          │                                                      │           │
│          │  Rejection Reason *                                  │           │
│          │  Be specific — the applicant will see this          │           │
│          │  reason and it will appear in the audit log.        │           │
│          │                                                      │           │
│          │  ┌────────────────────────────────────────────────┐  │           │
│          │  │                                                │  │           │
│          │  │                                                │  │           │
│          │  └────────────────────────────────────────────────┘  │           │
│          │                                                      │           │
│          │  ┌──────────────┐  ┌──────────────────────────────┐ │           │
│          │  │  Cancel      │  │  ✗ Confirm Rejection         │ │           │
│          │  │  secondary   │  │  danger/red btn (disabled    │ │           │
│          │  │              │  │  until reason entered)       │ │           │
│          │  └──────────────┘  └──────────────────────────────┘ │           │
│          └─────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Modal Interaction Notes (all modals)

- Opens with `role="dialog"` `aria-modal="true"` `aria-labelledby` pointing to heading
- Focus traps inside open modal; `Escape` key closes
- Backdrop click closes only for non-destructive modals (Cancel/Request); NOT for Approve/Reject
- Confirm button is disabled until required text field has content (min 10 chars)
- On confirm: modal closes → spinner on button → status updates → toast notification
- On confirm error: modal stays open, error banner shown inline

#### States (modals)

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Rationale empty | Confirm button disabled (opacity-50) | "Required" tooltip on hover |
| Rationale filled | Confirm button enabled | N/A |
| Submitting | Confirm button shows spinner + "Submitting…", Cancel hidden | Prevents double-submit |
| Error | Inline red banner inside modal | "Something went wrong — try again" |

---

*End of Screen-04-review-detail.md*
