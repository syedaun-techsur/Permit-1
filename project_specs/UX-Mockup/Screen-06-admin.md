## Screen Designs — Admin Screens

---

### Screen-14: Admin Dashboard

**Route:** `/admin/dashboard`
**Purpose:** System-wide visibility — application stats, reviewer workload, recent activity
**User Stories:** US-7.3, US-7.4

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (admin)   │  HEADER: Admin Dashboard              [🔔 1]  [JW ▾]  │
│                    │                                                        │
│  ◈ PermitFlow     │  System Overview                                       │
│                    │  Last updated: just now                                │
│  ──────────────── │                                                        │
│  ⊞ Dashboard ●     │  ┌─────────────────────────────────────────────────┐  │
│  📋 All Apps       │  │  Application Status Distribution                │  │
│  👥 User Mgmt      │  │                                                 │  │
│  📜 Audit Log      │  │  Draft   Submitted  Under Rev.  Info Needed     │  │
│                    │  │   12       28          41          9             │  │
│  ──────────────── │  │   ●grey    ●blue       ●amber      ●orange       │  │
│  ┌──┐              │  │                                                 │  │
│  │JW│ James W.     │  │  Approved   Rejected                            │  │
│  └──┘ Admin        │  │    87         15                                │  │
│  ↪ Log out        │  │   ●emerald   ●red                               │  │
│                    │  │                                                 │  │
│                    │  │  [Bar chart — horizontal bars per status]        │  │
│                    │  └─────────────────────────────────────────────────┘  │
│                    │                                                        │
│                    │  ┌── Reviewer Workload ───────────────────────────┐   │
│                    │  │                                               [Manage →]│
│                    │  │  Reviewer        Active  Needs Action  Waiting  │   │
│                    │  │  ─────────────────────────────────────────────  │   │
│                    │  │  Diana Osei       38        7            14     │   │
│                    │  │  Alex Thornton    22        3             8     │   │
│                    │  │  Rosa Martinez    19        2             5     │   │
│                    │  │  Sam Nguyen       31        9            12 ⚠   │   │  ← ⚠ high load
│                    │  └───────────────────────────────────────────────┘    │
│                    │                                                        │
│                    │  ┌── Recent Activity Feed ───────────────────────┐    │
│                    │  │                                               │    │
│                    │  │  2m ago   Diana Osei approved #APP-0038       │    │
│                    │  │  15m ago  Marcus Rivera resubmitted #APP-0042  │    │
│                    │  │  1h ago   James Whitfield created user K.Lee   │    │
│                    │  │  2h ago   Alex Thornton requested info #APP-33 │    │
│                    │  │  3h ago   Sam Nguyen began review #APP-0031    │    │
│                    │  │  [View full audit log →]                       │    │
│                    │  └───────────────────────────────────────────────┘    │
└────────────────────┴────────────────────────────────────────────────────────┘
```

#### Workload Table Row

```
┌────────────────────────────────────────────────────────────────────────┐
│  flex items-center gap-4 py-3 border-b border-surface-100              │
│                                                                        │
│  ┌──┐  Sam Nguyen        31 active    9 action req.    12 awaiting    │
│  │SN│  Reviewer          text-sm      ⚠ text-orange    text-text-500  │
│  └──┘  [View queue →]                                                  │
│  avatar  link text-primary-500 text-sm                                 │
└────────────────────────────────────────────────────────────────────────┘

⚠ threshold: show amber indicator when "Needs Action" count > 8
```

---

### Screen-15: User Management

**Route:** `/admin/users`
**Purpose:** Create, view, and deactivate user accounts; change roles
**User Stories:** US-8.2

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (admin)   │  HEADER: User Management             [🔔 1]  [JW ▾]   │
├────────────────────┼────────────────────────────────────────────────────────┤
│                    │                                                        │
│  [nav]             │  User Management (84 users)         [+ Add User]       │
│                    │                                                        │
│                    │  ┌ Filters ─────────────────────────────────────────┐  │
│                    │  │ Role: [All ▾]  Status: [Active ▾]  🔍 Search     │  │
│                    │  └──────────────────────────────────────────────────┘  │
│                    │                                                        │
│                    │  ┌────────────────────────────────────────────────┐   │
│                    │  │  Name ↕        Email          Role      Status │   │
│                    │  ├────────────────────────────────────────────────┤   │
│                    │  │ Diana Osei  diana@city.gov  Reviewer  ● Active  │   │
│                    │  │ [Edit role] [Deactivate]                       │   │
│                    │  ├────────────────────────────────────────────────┤   │
│                    │  │ Sam Nguyen  sam@city.gov   Reviewer  ● Active  │   │
│                    │  │ [Edit role] [Deactivate]                       │   │
│                    │  ├────────────────────────────────────────────────┤   │
│                    │  │ Chen Wei    chen@city.gov  Reviewer  ✗ Inactive │   │
│                    │  │ [Reactivate]                                   │   │
│                    │  ├────────────────────────────────────────────────┤   │
│                    │  │ Marcus R.  marcus@rivera  Applicant ● Active   │   │
│                    │  │ [Edit role] [Deactivate]                       │   │
│                    │  ├────────────────────────────────────────────────┤   │
│                    │  │  ... (25 per page, paginated)                  │   │
│                    │  └────────────────────────────────────────────────┘   │
│                    │                                                        │
│                    │  ← Prev  Page 1 of 4  Next →                         │
└────────────────────┴────────────────────────────────────────────────────────┘
```

#### Add User Modal

```
┌─── BACKDROP ────────────────────────────────────────────────────────────────┐
│                                                                             │
│          ┌─────────────────────────────────────────────────────┐           │
│          │  Add New User                            ✕           │           │
│          │  text-xl font-semibold                               │           │
│          │                                                      │           │
│          │  Full Name *                                         │           │
│          │  ┌────────────────────────────────────────────────┐  │           │
│          │  │                                                │  │           │
│          │  └────────────────────────────────────────────────┘  │           │
│          │                                                      │           │
│          │  Work Email *                                        │           │
│          │  ┌────────────────────────────────────────────────┐  │           │
│          │  │                                                │  │           │
│          │  └────────────────────────────────────────────────┘  │           │
│          │                                                      │           │
│          │  Role *                                              │           │
│          │  ┌────────────────────────────────────────────────┐  │           │
│          │  │ Select a role…                               ▾  │  │           │
│          │  └────────────────────────────────────────────────┘  │           │
│          │  ○ Applicant  ○ Reviewer  ○ Admin                    │           │
│          │  (radio buttons with role description text)         │           │
│          │                                                      │           │
│          │  ⓘ A welcome email with a password-setup link will   │           │
│          │    be sent to this address automatically.            │           │
│          │                                                      │           │
│          │  ┌──────────────┐  ┌──────────────────────────────┐ │           │
│          │  │  Cancel      │  │  Create Account →            │ │           │
│          │  └──────────────┘  └──────────────────────────────┘ │           │
│          └─────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Deactivate Confirm Dialog

```
┌─── CONFIRM DIALOG (smaller, centered) ──────────────────────────────────────┐
│                                                                             │
│          ┌──────────────────────────────────────────────┐                  │
│          │  Deactivate Account                 ✕         │                  │
│          │                                              │                  │
│          │  ✗ You are deactivating:                     │                  │
│          │    Chen Wei · chen@city.gov · Reviewer        │                  │
│          │    bg-red-50 border-red-200 rounded p-3       │                  │
│          │                                              │                  │
│          │  This will immediately:                       │                  │
│          │  · Terminate all active sessions             │                  │
│          │  · Block all future logins                   │                  │
│          │  · Keep their data and applications intact   │                  │
│          │                                              │                  │
│          │  This action takes effect immediately        │                  │
│          │  and will be logged in the audit trail.      │                  │
│          │                                              │                  │
│          │  ┌────────────────┐  ┌──────────────────┐   │                  │
│          │  │    Cancel      │  │ ✗ Deactivate     │   │                  │
│          │  │    secondary   │  │ danger (red btn) │   │                  │
│          │  └────────────────┘  └──────────────────┘   │                  │
│          └──────────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### User Table Row States

```
Active user row:
  bg-white hover:bg-surface-50
  Status pill: ● Active  bg-emerald-50 text-emerald-700
  Actions: [Edit role ▾] [Deactivate] (text buttons, danger color on deactivate)

Deactivated user row:
  bg-surface-50 (slightly muted)
  Name: text-text-400 (muted)
  Status pill: ✗ Inactive  bg-red-50 text-red-600
  Actions: [Reactivate] only
```

---

### Screen-16: All Applications (Admin View)

**Route:** `/admin/applications`
**Purpose:** System-wide paginated list; assign/reassign reviewers
**User Stories:** US-8.1, US-8.3

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (admin)   │  HEADER: All Applications           [🔔 1]  [JW ▾]    │
├────────────────────┼────────────────────────────────────────────────────────┤
│                    │                                                        │
│  [nav]             │  All Applications (192 total)                          │
│                    │                                                        │
│                    │  ┌ Filters ─────────────────────────────────────────┐  │
│                    │  │ Status[All▾]  Reviewer[All▾]  Type[All▾]  Date  🔍│  │
│                    │  └──────────────────────────────────────────────────┘  │
│                    │                                                        │
│                    │  [☐ Select all]  [Assign Reviewer ▾]  (bulk action)   │
│                    │                                                        │
│                    │  ┌──────────────────────────────────────────────────┐  │
│                    │  │☐ ID ↕    Type ↕  Applicant  Reviewer  Status  Age│  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │☐ #0042  Comm.TI  M.Rivera  D.Osei  ⚠Info   2d   │  │
│                    │  │         [Reassign reviewer ▾]                    │  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │☐ #0041  Comm.TI  J.Park    D.Osei  🔵Sub.   3d   │  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │☐ #0038  Res.   S.Chen    A.Thor. ↩Resub.  5d   │  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │☐ #0035  Event  L.Wong    Unassigned 🔵Sub.  7d   │  │
│                    │  │         ⚠ Unassigned · [Assign reviewer →]       │  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │  ... (25 per page)                               │  │
│                    │  └──────────────────────────────────────────────────┘  │
│                    │                                                        │
│                    │  ← Prev  Page 1 of 8  Next →                         │
└────────────────────┴────────────────────────────────────────────────────────┘
```

#### Bulk Assign Dropdown

```
[Select 3 rows via checkboxes] →

┌──────────────────────────────────┐
│  Assign Reviewer  ▾              │
└──────────────────────────────────┘
    ↓ opens dropdown:
┌──────────────────────────────────┐
│  Assign selected (3) to:         │
│  ─────────────────────────────── │
│  Diana Osei      (38 active)    │
│  Alex Thornton   (22 active)    │
│  Rosa Martinez   (19 active)    │  ← sorted by current load
│  Sam Nguyen      (31 active)  ⚠ │
└──────────────────────────────────┘
```

#### Unassigned Row Highlight

```
Unassigned application row:
  bg-amber-50/50  (subtle warm tint)
  ⚠ "Unassigned" amber warning badge in reviewer column
  [Assign reviewer →] — link-style button primary-500
```

---

### Screen-17: Audit Log

**Route:** `/admin/audit-log`
**Purpose:** Complete, read-only, filterable chronological record of all system events
**User Stories:** US-8.4

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (admin)   │  HEADER: Audit Log                  [🔔 1]  [JW ▾]    │
├────────────────────┼────────────────────────────────────────────────────────┤
│                    │                                                        │
│  [nav]             │  Audit Log                          [↓ Export CSV]     │
│                    │  Read-only · All system events recorded automatically  │
│                    │                                                        │
│                    │  ┌ Filters ─────────────────────────────────────────┐  │
│                    │  │ Date: [Today ▾]  Actor: [All ▾]  Type: [All ▾]   │  │
│                    │  │ 🔍 Search by App ID or user name…                │  │
│                    │  └──────────────────────────────────────────────────┘  │
│                    │                                                        │
│                    │  ┌──────────────────────────────────────────────────┐  │
│                    │  │ Timestamp ↕    Actor     Action      Target       │  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │ Today 09:42  D.Osei   Approved     #APP-0038     │  │
│                    │  │  Reviewer    "All docs verified, engineer stamp   │  │
│                    │  │              confirmed on foundation plan."       │  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │ Today 09:15  M.Rivera  Resubmitted  #APP-0042    │  │
│                    │  │  Applicant   Status: Additional Info → Under Rev. │  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │ Today 08:55  J.Whitfield Created User  K.Lee     │  │
│                    │  │  Admin       kate.lee@city.gov · Role: Reviewer  │  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │ Today 08:47  J.Whitfield Deactivated  C.Wei      │  │
│                    │  │  Admin       chen.wei@city.gov · Access revoked  │  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │ Yesterday 16:22  A.Thor. Requested Info #APP-033 │  │
│                    │  │  Reviewer    "Missing structural calculations."   │  │
│                    │  ├──────────────────────────────────────────────────┤  │
│                    │  │  ... (50 per page, reverse-chronological)        │  │
│                    │  └──────────────────────────────────────────────────┘  │
│                    │                                                        │
│                    │  ← Prev  Page 1 of 15  Next →                        │
└────────────────────┴────────────────────────────────────────────────────────┘
```

#### Audit Log Row Detail

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Two-line row design                                                         │
│                                                                              │
│  Line 1 (header):                                                            │
│  Jul 21, 09:42 AM    Diana Osei · Reviewer    [✓ Approved] badge    #APP-0038│
│  text-xs text-500    text-sm font-medium       status badge           link   │
│                                                                              │
│  Line 2 (detail — expandable):                                               │
│  "All required documents present. Engineer's stamp confirmed on page 3."    │
│  text-sm text-text-700 pl-4 border-l-2 border-surface-200 mt-1             │
│  (collapsed by default for user-actions; always expanded for status changes) │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Action Type Badges in Audit Log

```
Approved         : ✓ bg-emerald-50 text-emerald-700
Rejected         : ✗ bg-red-50 text-red-700
Status Changed   : ↻ bg-blue-50 text-blue-700
Info Requested   : ? bg-orange-50 text-orange-700
Resubmitted      : ↩ bg-amber-50 text-amber-700
User Created     : ＋ bg-purple-50 text-purple-700
User Deactivated : ─ bg-red-50 text-red-700
Reviewer Assigned: ⇒ bg-primary-50 text-primary-700
Doc Uploaded     : ↑ bg-slate-50 text-slate-700
Unauthorized Att.: ⛔ bg-red-100 text-red-800 (visually distinct)
```

#### Export CSV

```
On click [↓ Export CSV]:
  → Triggers file download immediately (no modal needed)
  → Filename: audit-log-YYYY-MM-DD.csv
  → Columns: timestamp, actor_name, actor_role, action_type, application_id,
             target_user, detail
  → Toast: "Audit log exported — 1,247 entries"
```

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Loading | Skeleton rows (5×) | Pulse animation |
| No results | "No events match your filters" + clear filters link | Inline message |
| Search by App ID | Filters to all events for that application | Inline filter chip shows "App: #APP-0042" |
| Export | Button spinner during generation | "Preparing export…" then auto-download |

---

*End of Screen-06-admin.md*
