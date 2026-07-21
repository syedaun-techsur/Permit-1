## Screen Designs — Reviewer Dashboard & Review Queue

---

### Screen-07: Reviewer Dashboard

**Route:** `/dashboard` (reviewer role)
**Purpose:** Morning triage — prioritized queue buckets, action counts, unread messages
**User Stories:** US-7.2, US-7.4, US-6.1

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (reviewer) │  HEADER: Dashboard                    [🔔 5]  [DO ▾] │
│                     │                                                       │
│  ◈ PermitFlow      │  Good morning, Diana.                                 │
│                     │  You have 7 applications needing action today.        │
│  ─────────────────  │                                                       │
│  ⊞ Dashboard ●      │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  ≡ Review Queue     │  │  7          │  │  14         │  │  17         │  │
│                     │  │  Needs      │  │  Awaiting   │  │  Under      │  │
│  ─────────────────  │  │  Action     │  │  Applicant  │  │  Review     │  │
│  ┌──┐               │  │  ⚠ orange   │  │  ● grey     │  │  ● amber    │  │
│  │DO│ Diana Osei    │  └─────────────┘  └─────────────┘  └─────────────┘  │
│  └──┘ Reviewer      │                                                       │
│  ⚙ Settings        │  ── Needs Action (7) ───────────────────────────────  │
│  ↪ Log out         │  "Applications awaiting your decision or response"     │
│                     │                                                       │
│                     │  ┌──────────────────────────────────────────────┐    │
│                     │  │ ★ #APP-0038  Residential Rmdl  ↩ Resubmitted │    │
│                     │  │ Sarah Chen · 5d ago                    💬 2  │    │
│                     │  ├──────────────────────────────────────────────┤    │
│                     │  │ ★ #APP-0041  Comm. TI         🔵 Submitted   │    │
│                     │  │ James Park · 3d ago                   💬 0  │    │
│                     │  ├──────────────────────────────────────────────┤    │
│                     │  │ #APP-0035  Event Permit       🔵 Submitted   │    │
│                     │  │ Lisa Wong · 7d ago                    💬 1  │    │
│                     │  └──────────────────────────────────────────────┘    │
│                     │  (+ 4 more)                                          │
│                     │                                                       │
│                     │  ── Status Distribution ───────────────────────────  │
│                     │  ┌───────────────────────────────────────────────┐   │
│                     │  │  [Donut chart — 38 total]                     │   │
│                     │  │  Needs Action 7  ● orange                     │   │
│                     │  │  Awaiting Applicant 14  ● grey                │   │
│                     │  │  Under Review 17  ● amber                     │   │
│                     │  └───────────────────────────────────────────────┘   │
└─────────────────────┴─────────────────────────────────────────────────────┘
```

#### Queue Bucket Card (Needs Action)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Section heading: "Needs Action (7)"  text-base font-semibold text-text-900 │
│  + "Applications awaiting your decision" text-sm text-text-500              │
│                                                                            │
│  Each row:                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  left: 3px border-orange-400 (resubmitted) or border-blue-400 (new) │  │
│  │                                                                     │  │
│  │  ★ [Resubmitted badge: bg-orange-100 text-orange-700 "Responded"]   │  │
│  │                                                                     │  │
│  │  #APP-0038  Residential Remodel        ↩ Resubmitted      5d ago   │  │
│  │  Sarah Chen                                                 💬 2   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ★ = star icon (amber) for top-priority applicant-responded items         │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen-08: Review Queue (Full List)

**Route:** `/review/queue`
**Purpose:** Complete filterable/sortable list of all assigned applications
**User Stories:** US-6.1, US-5.3

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (reviewer) │  HEADER: Review Queue                 [🔔 5]  [DO]   │
├─────────────────────┼───────────────────────────────────────────────────────┤
│                     │                                                       │
│  [nav]              │  Review Queue (38)                                    │
│                     │                                                       │
│                     │  ┌ Filters ────────────────────────────────────────┐ │
│                     │  │ Status: [All ▾]  Sort: [Priority ▾]  🔍 Search  │ │
│                     │  └─────────────────────────────────────────────────┘ │
│                     │                                                       │
│                     │  ┌── Quick filter tabs ──────────────────────────┐  │
│                     │  │ [All 38] [Needs Action 7] [Awaiting 14] [Done]│  │
│                     │  └──────────────────────────────────────────────┘  │
│                     │                                                       │
│                     │  ┌────────────────────────────────────────────────┐  │
│                     │  │  ID ↕      Type ↕       Applicant  Status  Age │  │
│                     │  ├────────────────────────────────────────────────┤  │
│                     │  │ ★ #0038  Res. Rmdl  S.Chen  ↩ Responded   5d  │  │
│                     │  │ ★ #0041  Comm. TI   J.Park  🔵 Submitted   3d  │  │
│                     │  │   #0035  Event      L.Wong  🔵 Submitted   7d  │  │
│                     │  │   #0033  Zoning     M.Ali   🟡 Under Rev  10d  │  │
│                     │  │   #0031  Res. Rmdl  C.Tran  ⏳ Awaiting   12d  │  │
│                     │  │   #0029  Comm. TI   B.Smith ✓  Approved   20d  │  │
│                     │  │   ... (paginated 25 per page)                  │  │
│                     │  └────────────────────────────────────────────────┘  │
│                     │                                                       │
│                     │  ← Prev  Page 1 of 2  Next →  (25 per page)         │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

#### Table Row Detail

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  tr hover:bg-surface-50 cursor-pointer transition-colors py-3.5              │
│  Resubmitted row: bg-orange-50/40 hover:bg-orange-50                         │
│                                                                              │
│  ★  │ #APP-0038  │ Residential  │ Sarah Chen    │ ↩ Responded  │ 5 days     │
│  star│ font-mono  │ Remodel      │ text-text-700 │ badge orange │ text-500   │
│     │ text-xs    │ text-sm      │               │              │            │
│     │ text-500   │ text-900     │               │              │  [💬 2]    │
│                                                                              │
│  Click row → /review/applications/APP-0038                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Quick Filter Tabs

```
  [All 38]  [Needs Action 7]  [Awaiting Applicant 14]  [Ready for Review 17]

  Active tab:   bg-primary-500 text-white rounded-md px-4 py-2 text-sm font-medium
  Inactive tab: text-text-700 hover:bg-surface-100 rounded-md px-4 py-2 text-sm
```

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Loading | Skeleton table (7 rows × 5 cols) | Pulse animation |
| Empty queue | "Your queue is clear" with illustration | Celebrate the moment |
| Filtered — no results | "No applications match these filters" + reset | Inline message |
| New item arrived | Rows auto-update / count badge increments | No jarring refresh |

---

*End of Screen-03-reviewer.md*
