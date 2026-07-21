# UX Mockup: Permit Management System

**Project:** Permit Management System
**Generated:** 2026-07-21
**Based on:** UserStories-PermitManagementSystem.md, PRD-PermitManagementSystem.md, Personas-PermitManagementSystem.md, Journeys-PermitManagementSystem.md

---

## UX Approach & Design Principles

### Design Philosophy

The Permit Management System must feel like a **premium fintech/enterprise SaaS product**, not a government portal. Every visual and interaction decision is intentional. The aesthetic is clean, spacious, confident — the kind of tool a contractor or a permitting officer would choose to use, not be forced to use.

Design reference points: Linear, Stripe Dashboard, Vercel — information-dense without feeling cluttered, with generous whitespace at the structural level and precision at the component level.

### Five Core Principles

1. **Proactive Clarity** — Every screen surfaces what the user needs to do next. No hunting for action items.
2. **Confirmed Actions** — No action completes silently. Toast notifications, status updates, and audit entries fire for every state-changing event.
3. **Single-Pane Context** — Documents, messages, timeline, and controls live on one screen. Users never navigate away mid-task.
4. **Role-Appropriate Density** — Applicant views are airy and guided; reviewer and admin views are information-dense with table affordances, keyboard navigation, and bulk actions.
5. **Trust Through Detail** — Timestamps, actor names, role badges, and audit trails are always visible. This is an official process; the UI signals that without feeling bureaucratic.

---

## Design System Tokens

### Color Palette

```
Primary Brand
  --color-primary-500   : #4F46E5  (Indigo — primary CTAs, active nav, links)
  --color-primary-600   : #4338CA  (hover state for primary)
  --color-primary-700   : #3730A3  (active/pressed state)
  --color-primary-50    : #EEF2FF  (light tint — selected rows, focus fills)

Surface & Backgrounds
  --color-surface-0     : #FFFFFF  (card surfaces, modal backgrounds)
  --color-surface-50    : #F8FAFC  (page background)
  --color-surface-100   : #F1F5F9  (sidebar background, input fills)
  --color-surface-200   : #E2E8F0  (dividers, skeleton base)
  --color-surface-300   : #CBD5E1  (skeleton shimmer, disabled borders)

Text
  --color-text-900      : #0F172A  (headings, primary body)
  --color-text-700      : #334155  (secondary body, labels)
  --color-text-500      : #64748B  (captions, placeholders, timestamps)
  --color-text-300      : #94A3B8  (disabled text)
  --color-text-inverse  : #FFFFFF  (text on dark/primary backgrounds)

Status Colors (semantic)
  --color-status-draft       : #64748B  / bg: #F1F5F9   (grey)
  --color-status-submitted   : #2563EB  / bg: #EFF6FF   (blue)
  --color-status-review      : #D97706  / bg: #FFFBEB   (amber)
  --color-status-info        : #EA580C  / bg: #FFF7ED   (orange — action required)
  --color-status-approved    : #059669  / bg: #ECFDF5   (emerald)
  --color-status-rejected    : #DC2626  / bg: #FEF2F2   (red)

Borders
  --color-border-default : #E2E8F0
  --color-border-focus   : #4F46E5
  --color-border-error   : #DC2626
  --color-border-success : #059669

Shadows (Tailwind shadow tokens)
  --shadow-sm   : 0 1px 2px 0 rgb(0 0 0 / 0.05)
  --shadow-md   : 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)
  --shadow-lg   : 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)
  --shadow-card : 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)
```

### Typography Scale

```
Font Family: Inter (system-ui fallback)

Display  : 36px / 40px / weight 700 / tracking -0.02em  — page titles (rare)
H1       : 28px / 34px / weight 700 / tracking -0.01em  — screen headings
H2       : 22px / 28px / weight 600 / tracking -0.01em  — section headings
H3       : 18px / 24px / weight 600                     — card headings
H4       : 15px / 20px / weight 600                     — subsection labels
Body-lg  : 16px / 24px / weight 400                     — primary body text
Body     : 14px / 20px / weight 400                     — secondary body, tables
Body-sm  : 13px / 18px / weight 400                     — captions, helper text
Label    : 13px / 16px / weight 500 / tracking 0.01em   — form labels
Caption  : 12px / 16px / weight 400                     — timestamps, meta
Code     : 13px / 18px / font-mono                      — IDs, codes
```

### Spacing System

```
Base unit: 4px (Tailwind default)

xs  :  4px  (gap-1)
sm  :  8px  (gap-2)
md  : 12px  (gap-3)
lg  : 16px  (gap-4)
xl  : 24px  (gap-6)
2xl : 32px  (gap-8)
3xl : 48px  (gap-12)

Layout padding
  Page horizontal  : px-6 (24px) mobile → px-8 (32px) desktop
  Card padding     : p-6 (24px)
  Section gap      : gap-6 (24px)
  Sidebar width    : 256px fixed
  Content max-w    : 1280px (max-w-screen-xl), centered
```

### Border Radius

```
none   : 0
sm     : 2px   (form inputs, tight elements)
md     : 6px   (buttons, badges)
lg     : 8px   (cards, panels)
xl     : 12px  (modals, drawers)
full   : 9999px (avatar, pill badge)
```

---

## Component Patterns

### Button Variants

```
Primary    bg-primary-500 text-white   hover:bg-primary-600   h-10 px-4 rounded-md shadow-sm font-medium text-sm
Secondary  bg-white border text-text-700  hover:bg-surface-100   h-10 px-4 rounded-md shadow-sm
Ghost      transparent text-primary-500  hover:bg-primary-50   h-10 px-4 rounded-md
Danger     bg-red-600 text-white   hover:bg-red-700   h-10 px-4 rounded-md (destructive actions)
Link       text-primary-500  hover:underline  inline; no height
Disabled   opacity-50 cursor-not-allowed (any variant)

Icon button  h-9 w-9 rounded-md flex-center (toolbar actions)
```

### Status Badge

```
Pill shape: inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium

Draft             bg-slate-100     text-slate-600    ● grey dot
Submitted         bg-blue-50       text-blue-700     ● blue dot
Under Review      bg-amber-50      text-amber-700    ● amber dot
Additional Info   bg-orange-50     text-orange-700   ⚠ icon
Approved          bg-emerald-50    text-emerald-700  ✓ icon
Rejected          bg-red-50        text-red-700      ✗ icon
```

### Card

```
bg-white rounded-lg shadow-card border border-surface-200 p-6
Hover (clickable card): hover:shadow-md transition-shadow duration-150
```

### Form Input

```
bg-surface-50 border border-surface-300 rounded-md text-sm text-text-900 h-10 px-3
Focus: outline-none ring-2 ring-primary-500 border-transparent
Error: border-red-500 ring-0 (+ error text in red below)
Disabled: bg-surface-100 text-text-300 cursor-not-allowed
Textarea: min-h-[100px] resize-y py-2
Label: block text-sm font-medium text-text-700 mb-1.5
Helper: text-xs text-text-500 mt-1
Error msg: text-xs text-red-600 mt-1 flex items-center gap-1
```

### Toast Notification

```
Position: bottom-right, fixed, stacked (max 3)
Width: 360px
Padding: p-4 rounded-lg shadow-lg

Success: bg-white border-l-4 border-emerald-500 — icon: ✓ green circle
Error:   bg-white border-l-4 border-red-500     — icon: ✗ red circle
Info:    bg-white border-l-4 border-primary-500  — icon: ℹ blue circle
Warning: bg-white border-l-4 border-amber-500   — icon: ⚠ amber circle

Auto-dismiss: 4 seconds (error: 6 seconds, stays until dismissed)
```

### Skeleton Screens

```
Skeleton base   : bg-surface-200 rounded animate-pulse
Skeleton shimmer: relative overflow-hidden::after(bg gradient L→R slide)

Timings:
  Appears    : 100ms after navigation (no flash for <200ms loads)
  Dismissed  : when data arrives (fade-in 150ms)

Shapes:
  Text line   : h-4 w-full or w-3/4 rounded
  Title       : h-6 w-1/3 rounded
  Avatar      : h-10 w-10 rounded-full
  Card block  : h-24 w-full rounded-lg
  Table row   : h-12 w-full rounded with 3-4 cell placeholders
```

---

## Navigation Map

| Screen | Route | Reached from | Nav element |
|--------|-------|--------------|-------------|
| Sign In | `/login` | Unauthenticated redirect / Sign Up link | Direct URL / Link |
| Sign Up | `/register` | Sign In page | "Create account" link on login |
| Forgot Password | `/forgot-password` | Sign In page | "Forgot password?" link |
| Reset Password | `/reset-password/:token` | Email link | Email CTA |
| **Applicant** | | | |
| Applicant Dashboard | `/dashboard` | Post-login redirect / Sidebar | Sidebar: "Dashboard" |
| Application List | `/applications` | Sidebar | Sidebar: "My Applications" |
| New Application | `/applications/new` | Dashboard quick-action / App list button | Dashboard: "New Application" btn / App list: "New Application" btn |
| Application Detail (Applicant) | `/applications/:id` | Application List row click | List: row click |
| **Reviewer** | | | |
| Reviewer Dashboard | `/dashboard` | Post-login redirect / Sidebar | Sidebar: "Dashboard" |
| Review Queue | `/review/queue` | Sidebar | Sidebar: "Review Queue" |
| Application Detail (Reviewer) | `/review/applications/:id` | Review Queue row click / Dashboard row click | Queue: row click |
| **Admin** | | | |
| Admin Dashboard | `/admin/dashboard` | Post-login redirect / Sidebar | Sidebar: "Dashboard" |
| All Applications (Admin) | `/admin/applications` | Sidebar | Sidebar: "All Applications" |
| Application Detail (Admin) | `/admin/applications/:id` | All Applications row click | List: row click |
| User Management | `/admin/users` | Sidebar | Sidebar: "User Management" |
| Audit Log | `/admin/audit-log` | Sidebar | Sidebar: "Audit Log" |
| **Shared** | | | |
| Notifications Panel | Slide-over overlay | Notification bell in header | Header: bell icon |
| Profile / Settings | `/settings` | User avatar menu in header | Header: avatar → "Settings" |

**Invariant — no orphan screens:** All screens above are reachable via sidebar navigation or a clear parent screen link. Modal/overlay screens (Notifications Panel, Approve/Reject modal, Request Info modal) are triggered contextually from their parent screens.

---

## Application Shell Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  SIDEBAR (256px)      │  HEADER (full width, h-16)               │
│  fixed, left          │  sticky top-0 z-30                       │
├───────────────────────┤─────────────────────────────────────────│
│                       │                                          │
│  [Logo / Wordmark]    │  [Page Title]         [Bell] [Avatar ▾] │
│                       │                                          │
│  ─────────────────    ├──────────────────────────────────────────│
│  [Nav Items]          │                                          │
│                       │  MAIN CONTENT AREA                       │
│  ─────────────────    │  max-w-screen-xl mx-auto px-8 py-8      │
│  [User Info]          │                                          │
│  [Logout]             │                                          │
└───────────────────────┴──────────────────────────────────────────┘
```

### Sidebar Detail

```
┌─────────────────────┐
│  PermitFlow    ◈    │  ← Logo (16px text-primary-500 wordmark + icon)
│                     │
│  ───────────────    │  ← divider (border-surface-200)
│                     │
│  ⊞  Dashboard       │  ← nav-item: px-3 py-2 rounded-md text-sm font-medium
│  ☰  Applications    │    default:  text-text-700 hover:bg-surface-100
│  ＋  New Permit     │    active:   bg-primary-50 text-primary-600 font-semibold
│                     │             left border 2px primary-500
│  ─── (reviewer) ──  │
│  ≡  Review Queue    │
│                     │
│  ─── (admin) ─────  │
│  👥 User Mgmt       │
│  📋 All Applications│
│  📜 Audit Log       │
│                     │
│  ─────────────────  │
│  ┌─────┐            │  ← User section (bottom of sidebar)
│  │ MR  │ Marcus R.  │    Avatar initials + name + role badge
│  └─────┘ Applicant  │
│  ⚙  Settings        │
│  ↪  Log out         │
└─────────────────────┘
```

### Header Detail

```
┌──────────────────────────────────────────────────────────────────────┐
│  [← Back]   My Applications                    [🔔 3]  [MR ▾]       │
│             text-xl font-semibold text-text-900   bell  avatar menu  │
└──────────────────────────────────────────────────────────────────────┘

Bell icon: relative indicator dot when unread count > 0
Avatar menu dropdown:
  ┌──────────────────┐
  │ Marcus Rivera    │  ← name, role
  │ Applicant        │
  │ ──────────────── │
  │ ⚙ Settings       │
  │ ↪ Log out        │
  └──────────────────┘
```

---

*End of 00-overview.md*
