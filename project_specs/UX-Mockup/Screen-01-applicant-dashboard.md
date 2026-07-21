## Screen Designs — Applicant Dashboard & Application List

---

### Screen-03: Applicant Dashboard

**Route:** `/dashboard` (applicant role)
**Purpose:** Immediate awareness of active applications, pending actions, and unread messages
**User Stories:** US-7.1, US-7.4, US-4.7

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (256px)  │  HEADER: Dashboard          [🔔 2]  [MR ▾]              │
├───────────────────┼─────────────────────────────────────────────────────────┤
│                   │                                                         │
│  ◈ PermitFlow    │  Good morning, Marcus          [+ New Application]       │
│                   │  Here's an overview of your permits.                    │
│  ─────────────── │                                                         │
│  ⊞ Dashboard ●   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  ☰ Applications  │  │  5           │ │  1           │ │  3           │    │
│  ＋ New Permit   │  │  Active Apps │ │  Action Req. │ │  Unread Msgs │    │
│                   │  │  text-2xl    │ │  text-2xl    │ │  text-2xl    │    │
│  ─────────────── │  │  font-bold   │ │  font-bold   │ │  font-bold   │    │
│  ┌───┐            │  │              │ │  ⚠ orange    │ │  ● primary   │    │
│  │MR │ Marcus R.  │  └──────────────┘ └──────────────┘ └──────────────┘    │
│  └───┘ Applicant  │                                                         │
│  ⚙ Settings      │  ── Recent Applications ────────────────────────────── │
│  ↪ Log out       │                                          View all →      │
│                   │  ┌────────────────────────────────────────────────────┐ │
│                   │  │ #APP-0042  Commercial TI   ⚠ Addl Info Needed  2d  │ │
│                   │  │ Monroe St. Tenant Imp.     [Action Required]   💬 2 │ │
│                   │  ├────────────────────────────────────────────────────┤ │
│                   │  │ #APP-0041  Residential Rmdl   🔵 Under Review   5d  │ │
│                   │  │ 4521 Oak Ave.                                  💬 0 │ │
│                   │  ├────────────────────────────────────────────────────┤ │
│                   │  │ #APP-0038  Event Permit    ✓ Approved         14d  │ │
│                   │  │ Riverside Plaza                                💬 0 │ │
│                   │  ├────────────────────────────────────────────────────┤ │
│                   │  │ #APP-0037  Commercial TI   🔵 Submitted        18d  │ │
│                   │  │ 880 Industrial Blvd.                           💬 1 │ │
│                   │  ├────────────────────────────────────────────────────┤ │
│                   │  │ #APP-0035  Zoning Variance  Draft             22d  │ │
│                   │  │ 210 Harbor Rd.                                 💬 0 │ │
│                   │  └────────────────────────────────────────────────────┘ │
│                   │                                                         │
│                   │  ── Application Status Overview ──────────────────────  │
│                   │  ┌───────────────────────────────────────────────────┐  │
│                   │  │  [Donut chart: 5 slices by status color]          │  │
│                   │  │  Approved 2 ●  Under Review 1 ●  Submitted 1 ●   │  │
│                   │  │  Additional Info 1 ●  Draft 1 ●                  │  │
│                   │  └───────────────────────────────────────────────────┘  │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

#### Summary Card Detail

```
┌──────────────────────────────────────┐
│  bg-white rounded-lg shadow-card     │
│  p-6 border border-surface-200       │
│                                      │
│  [Icon in 40×40 bg-primary-50 box]   │
│  5                                   │  ← text-3xl font-bold text-text-900
│  Active Applications                 │  ← text-sm text-text-500 mt-1
└──────────────────────────────────────┘
```

#### Recent Application Row

```
┌──────────────────────────────────────────────────────────────────────────┐
│  bg-white hover:bg-surface-50 cursor-pointer transition-colors            │
│  px-6 py-4 border-b border-surface-200                                    │
│                                                                           │
│  [⚠ LEFT ACCENT — 3px orange border, "Action Required" only]             │
│                                                                           │
│  #APP-0042               ⚠ Additional Info Needed   2 days ago            │
│  text-sm font-mono       [status badge]              text-xs text-text-500 │
│  text-text-500                                                            │
│                                                                           │
│  Commercial Tenant Improvement — Monroe St.    💬 2  ← unread badge       │
│  text-sm font-medium text-text-900             bg-primary-500 text-white  │
│                                                rounded-full px-1.5        │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | Summary stat cards (active, action needed, unread) | Top row |
| Primary | "New Application" CTA | Top right |
| Secondary | Recent applications list | Mid-page |
| Tertiary | Status distribution donut chart | Bottom |

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Loading | Skeleton cards (3×) + skeleton list rows (5×) | Pulse animation |
| No applications | Empty state illustration + "Start your first application" CTA | Centered, friendly copy |
| All approved | Stat cards show 0 "Action Required" in grey | No urgent styling |
| Notification unread | Bell badge shows count (red dot, max "9+") | Draws eye to new events |

---

### Screen-04: Application List (Applicant)

**Route:** `/applications`
**Purpose:** Full list of all applicant's applications with filter/sort
**User Stories:** US-2.3, US-5.3

#### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR          │  HEADER: My Applications     [🔔 2]  [MR ▾]             │
├───────────────────┼─────────────────────────────────────────────────────────┤
│                   │                                                         │
│  [nav]            │  My Applications (12)                [+ New Application] │
│                   │                                                         │
│                   │  ┌ Filters ─────────────────────────────────────────┐  │
│                   │  │ Status: [All ▾]  Sort: [Newest ▾]  🔍 Search...  │  │
│                   │  └──────────────────────────────────────────────────┘  │
│                   │                                                         │
│                   │  ┌──────────────────────────────────────────────────┐  │
│                   │  │ ⚠ #APP-0042  Commercial TI    ⚠ Addl. Info Needed│  │
│                   │  │ Monroe St. TI — 4 docs  2d ago            💬 2   │  │
│                   │  ├──────────────────────────────────────────────────┤  │
│                   │  │ #APP-0041  Residential Remodel  🔵 Under Review  │  │
│                   │  │ 4521 Oak Ave — 3 docs      5d ago          💬 0  │  │
│                   │  ├──────────────────────────────────────────────────┤  │
│                   │  │ #APP-0038  Event Permit        ✓ Approved        │  │
│                   │  │ Riverside Plaza — 2 docs   14d ago         💬 0  │  │
│                   │  ├──────────────────────────────────────────────────┤  │
│                   │  │ #APP-0037  Commercial TI       🔵 Submitted      │  │
│                   │  │ 880 Industrial Blvd. — 5 docs  18d ago     💬 1  │  │
│                   │  ├──────────────────────────────────────────────────┤  │
│                   │  │ #APP-0035  Zoning Variance     ○ Draft           │  │
│                   │  │ 210 Harbor Rd. — 1 doc     22d ago         💬 0  │  │
│                   │  │                [Continue editing →]             │  │
│                   │  ├──────────────────────────────────────────────────┤  │
│                   │  │  ... (paginated 10 per page)                    │  │
│                   │  └──────────────────────────────────────────────────┘  │
│                   │                                                         │
│                   │  ← Prev  Page 1 of 2  Next →                          │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

#### Filter Bar

```
┌────────────────────────────────────────────────────────────────────┐
│  bg-white border border-surface-200 rounded-lg p-4 flex gap-3      │
│                                                                    │
│  Status:  ┌──────────────────┐   Sort:  ┌──────────────────┐      │
│           │ All statuses   ▾ │          │ Newest first   ▾ │      │
│           └──────────────────┘          └──────────────────┘      │
│                                                                    │
│  🔍 ┌────────────────────────────────────────────┐                │
│     │ Search by ID, type, or address...          │                │
│     └────────────────────────────────────────────┘                │
└────────────────────────────────────────────────────────────────────┘
```

#### Application Row (detailed)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Clickable row — full width, hover:bg-surface-50                           │
│  "Action Required" rows: left border 3px orange + bg-orange-50/30          │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │  px-6 py-4                                                          │  │
│  │                                                                     │  │
│  │  Row top:  #APP-0042 · Commercial TI    [⚠ Addl. Info Needed]  2d  │  │
│  │            font-mono text-xs                [badge]       timestamp │  │
│  │                                                                     │  │
│  │  Row mid:  Monroe Street Tenant Improvement                [💬 2]  │  │
│  │            text-sm font-medium text-text-900          unread badge  │  │
│  │                                                                     │  │
│  │  Row bot:  4 documents attached · Last updated Jul 19              │  │
│  │            text-xs text-text-500                                   │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Loading | 5× skeleton rows | Pulse animation |
| Empty (no apps) | Centered illustration + "Submit your first permit application" CTA | Full-width empty state |
| Filter no results | "No applications match your filters" + clear filters link | Inline message |
| Draft row | Subtle grey left accent + "Continue editing →" secondary action | N/A |

---

*End of Screen-01-applicant-dashboard.md*
