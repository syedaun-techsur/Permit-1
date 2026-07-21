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
## User Flows — Authentication

### Flow-00: Sign Up → Verify → Dashboard

**Trigger:** New user lands on `/register` (linked from Sign In or direct URL)
**User Stories:** US-0.1

```
[Landing / Sign In Page]
        │
        ▼ click "Create account"
[Sign Up Form]
        │
        ├─ Validation error ──▶ [Inline field errors] ──▶ [Fix & retry]
        │
        ▼ valid submit
[Account Created — Success State]
        │
        ▼ auto-redirect (role-based)
[Applicant/Reviewer/Admin Dashboard]
```

**Steps:**
1. User visits `/register`; form shows Name, Email, Password fields
2. Password strength meter appears as user types
3. On blur, each field validates inline (error beneath field)
4. On submit with errors: error summary banner at top + fields highlighted
5. On success: toast "Account created — welcome!" + redirect to dashboard

---

### Flow-01: Sign In → Dashboard

**Trigger:** User visits `/login` or is redirected from protected route
**User Stories:** US-0.2

```
[Sign In Page]
        │
        ├─ Invalid credentials ──▶ [Error banner: "Email or password is incorrect"]
        │
        ├─ 5th failed attempt ──▶ [Account locked message + countdown]
        │
        ▼ valid credentials
[Role-based redirect]
        ├─ Applicant ──▶ /dashboard
        ├─ Reviewer  ──▶ /dashboard (reviewer variant)
        └─ Admin     ──▶ /admin/dashboard
```

---

### Flow-02: Forgot Password → Reset

**Trigger:** User clicks "Forgot password?" on Sign In
**User Stories:** US-0.4

```
[Sign In Page] ──▶ [Forgot Password Form]
                          │
                          ▼ submit email
                   [Success message — always shown]
                   "If an account exists, you'll receive
                    a reset link shortly."
                          │
                          ▼ user opens email → clicks link
                   [Reset Password Form]
                          │
                          ├─ Expired/used link ──▶ [Error: "Link expired — request a new one"]
                          │
                          ▼ valid new password
                   [Sign In page — "Password updated" banner]
```

---

*End of Flow-00-auth.md*
## User Flows — Applicant: Submit New Application

### Flow-03: New Application → Draft → Submit → Confirm

**Trigger:** Applicant clicks "New Application" on Dashboard or Application List
**User Stories:** US-2.1, US-2.2, US-3.1, US-3.2, US-3.3

```
[Dashboard / App List]
        │ click "New Application"
        ▼
[New Application Form — Step 1: Permit Details]
        │
        ├─ Unsaved changes, navigate away ──▶ [Confirm dialog: "Leave? Unsaved changes"] ──▶ leave or stay
        │
        ▼ "Save Draft" or auto-save (debounce 5s)
[Draft saved — "Saved ✓" indicator in header]
        │
        ▼ all required fields filled → Upload Documents (inline section)
[Document Upload Zone active]
        │
        ├─ Invalid file ──▶ [Inline error: "file.exe is not an accepted type"]
        ├─ Oversized file ──▶ [Inline error: "plan.pdf exceeds 25MB limit"]
        │
        ▼ files uploaded successfully
[Document list shows thumbnails + checkmarks]
        │
        ▼ click "Review & Submit"
[Review Summary — all fields read-only + document list]
        │
        ├─ Missing required fields ──▶ [Error summary banner + scroll to field]
        │
        ▼ click "Submit Application"
[Confirmation Screen]
        │  Application ID: #APP-2024-0042
        │  Status: Submitted ✓
        │  Timestamp: Jul 21, 2026 at 10:32 AM
        ▼
[Applicant Dashboard — app appears with "Submitted" badge]
```

---

### Flow-04: Respond to Additional Information Request

**Trigger:** Applicant opens application with status "Additional Info Needed"
**User Stories:** US-4.5, US-3.1, US-5.1

```
[Application Detail — "Additional Info Needed" status]
        │
        ▼ prominent info request banner visible
[Read Reviewer's Request Note]
        │
        ├─ Upload new/replacement document ──▶ [Document upload zone opens]
        │                                       [Preview + checkmark on success]
        │
        ├─ Send clarification message ──▶ [Messaging panel compose]
        │
        ▼ click "Re-Submit for Review"
[Confirm dialog: "Re-submit this application for review?"]
        │
        ▼ confirm
[Application status → Under Review]
[Toast: "Application re-submitted — reviewer notified"]
[Reviewer receives in-app notification]
```

---

*End of Flow-01-applicant-submit.md*
## User Flows — Reviewer Workflow

### Flow-05: Morning Triage → Open Application → Take Action

**Trigger:** Reviewer logs in; lands on Reviewer Dashboard
**User Stories:** US-7.2, US-6.1, US-6.2, US-4.3, US-4.4, US-4.6

```
[Reviewer Dashboard]
        │  Queue buckets auto-sorted by priority
        ▼ click application row
[Application Detail — Reviewer View]
        │
        ├─ Status: Submitted ──▶ [Begin Review button visible]
        │                              │ click
        │                              ▼
        │                     [Status: Under Review]
        │                     [Applicant notified]
        │
        ├─ Status: Under Review ──▶ [Request Info | Approve | Reject buttons]
        │        │
        │        ├─ click "Request Additional Information"
        │        │         │
        │        │         ▼
        │        │   [Request Info Modal — mandatory note field]
        │        │         │ submit
        │        │         ▼
        │        │   [Status: Additional Info Needed]
        │        │   [Applicant notified]
        │        │   [Application leaves reviewer's action queue]
        │        │
        │        ├─ click "Approve"
        │        │         │
        │        │         ▼
        │        │   [Approve Modal — mandatory rationale field]
        │        │         │ confirm
        │        │         ▼
        │        │   [Status: Approved — terminal]
        │        │   [Applicant notified within 5 seconds]
        │        │   [Audit log entry written]
        │        │
        │        └─ click "Reject"
        │                  │
        │                  ▼
        │            [Reject Modal — mandatory rationale field]
        │                  │ confirm
        │                  ▼
        │            [Status: Rejected — terminal]
        │            [Applicant notified]
        │            [Audit log entry written]
        │
        └─ Status: Additional Info Needed — applicant responded
                   ──▶ Application auto-resurfaces in "Ready for Review" bucket
                       Reviews docs → Approve or Reject (same flow above)
```

---

### Flow-06: Admin — Onboard User → Assign Application

**Trigger:** Admin logs in; navigates to User Management
**User Stories:** US-8.2, US-8.3, US-8.4

```
[Admin Dashboard]
        │ sidebar: "User Management"
        ▼
[User Management Table]
        │
        ├─ DEACTIVATE: search user → click "Deactivate" → confirm dialog
        │                  │
        │                  ▼
        │           [Status: Deactivated — immediate]
        │           [All sessions terminated]
        │           [Toast: "Access revoked immediately"]
        │           [Audit log entry]
        │
        ├─ CREATE: click "Add User" → form (name, email, role) → submit
        │                  │
        │                  ▼
        │           [User appears in table: Active]
        │           [Welcome email auto-sent]
        │           [Audit log entry]
        │
        ▼ sidebar: "All Applications"
[All Applications — Admin View]
        │ select application(s) → "Assign Reviewer"
        ▼
[Reviewer selector dropdown → confirm]
[Reviewer notified in-app]
[Assignment logged in audit trail]
```

---

*End of Flow-02-reviewer-workflow.md*
## Screen Designs — Authentication

---

### Screen-00: Sign In

**Route:** `/login`
**Purpose:** Authenticate existing users; entry point for password reset and account creation
**User Stories:** US-0.2, US-0.3, US-0.4

#### Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    ◈  PermitFlow                    │  ← centered logo, text-primary-500
│                                                     │
│         ┌──────────────────────────────────┐        │
│         │  Sign in to your account         │        │  ← H2, text-text-900, font-semibold
│         │  New here? Create an account →   │        │  ← text-sm, link text-primary-500
│         │                                  │        │
│         │  Email address                   │        │  ← label
│         │  ┌────────────────────────────┐  │        │
│         │  │ marcus@riveraconstruct.com  │  │        │  ← input h-10
│         │  └────────────────────────────┘  │        │
│         │                                  │        │
│         │  Password                        │        │
│         │  ┌──────────────────────────┬──┐ │        │
│         │  │ ••••••••••••             │👁 │ │        │  ← show/hide toggle
│         │  └──────────────────────────┴──┘ │        │
│         │  Forgot password?                │        │  ← right-aligned link
│         │                                  │        │
│         │  [  Sign In  ] ← primary button  │        │  ← full width, h-11
│         │                                  │        │
│         │  ┌────────────────────────────┐  │        │  ← error state (hidden by default)
│         │  │ ✗ Email or password is     │  │        │
│         │  │   incorrect                │  │        │
│         │  └────────────────────────────┘  │        │
│         └──────────────────────────────────┘        │
│                                                     │
│              © 2026 City Permitting Office          │  ← footer text-xs text-text-500
└─────────────────────────────────────────────────────┘
```

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Default | Empty fields, Sign In enabled | N/A |
| Typing | Focus ring on active field (ring-2 ring-primary-500) | Real-time |
| Submitting | Button shows spinner, disabled; fields disabled | "Signing in…" |
| Error | Red error banner below password field | "Email or password is incorrect" |
| Locked (5 attempts) | Red banner + countdown timer | "Account locked. Try again in 14 minutes." |

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | Email + Password fields + Sign In CTA | Center card |
| Secondary | "Create account" link | Below heading |
| Tertiary | Forgot password, footer | Below form, bottom |

#### Interaction Notes

- **Password toggle:** Eye icon button (44×44px touch target) toggles `type=password` / `type=text`; `aria-label="Show password"` toggles to `"Hide password"`
- **Submit on Enter:** `<form>` with `onSubmit`; Enter in any field submits
- **Error state:** Red banner replaces the success state; does not specify which field is wrong (security)
- **Auto-redirect:** On valid credentials, immediate redirect with no intermediate screen

---

### Screen-01: Sign Up

**Route:** `/register`
**Purpose:** Create a new applicant account (default role)
**User Stories:** US-0.1

#### Layout

```
┌─────────────────────────────────────────────────────┐
│                    ◈  PermitFlow                    │
│                                                     │
│         ┌──────────────────────────────────┐        │
│         │  Create your account             │        │
│         │  Already have one? Sign in →     │        │
│         │                                  │        │
│         │  Full name                       │        │
│         │  ┌────────────────────────────┐  │        │
│         │  │ Marcus Rivera              │  │        │
│         │  └────────────────────────────┘  │        │
│         │                                  │        │
│         │  Work email address             │        │
│         │  ┌────────────────────────────┐  │        │
│         │  │                            │  │        │
│         │  └────────────────────────────┘  │        │
│         │                                  │        │
│         │  Password                        │        │
│         │  ┌──────────────────────────┬──┐ │        │
│         │  │                          │👁 │ │        │
│         │  └──────────────────────────┴──┘ │        │
│         │  ●●●○○  Strength: Good           │        │  ← strength indicator (5 dots)
│         │  Min 8 characters, one uppercase │        │  ← helper text
│         │                                  │        │
│         │  [  Create Account  ]            │        │
│         │                                  │        │
│         │  By continuing, you agree to the │        │
│         │  Terms of Service & Privacy      │        │  ← text-xs, links to policy pages
│         └──────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

#### Password Strength Indicator

```
Weak   : ●○○○○  text-red-500
Fair   : ●●○○○  text-orange-500
Good   : ●●●○○  text-amber-500
Strong : ●●●●○  text-emerald-500
Secure : ●●●●●  text-emerald-600
```

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Default | Empty fields | N/A |
| Field error (blur) | Red border + error text beneath field | "Email is required" / "Password too short" |
| Duplicate email (submit) | Error banner | "An account with this email already exists" |
| Submitting | Button spinner + disabled | "Creating account…" |
| Success | Redirect to dashboard + toast | "Welcome to PermitFlow, Marcus!" |

---

### Screen-02: Forgot Password

**Route:** `/forgot-password`
**Purpose:** Initiate password reset via email
**User Stories:** US-0.4

#### Layout

```
┌─────────────────────────────────────────────────────┐
│                    ◈  PermitFlow                    │
│                                                     │
│         ┌──────────────────────────────────┐        │
│         │  Reset your password             │        │
│         │                                  │        │
│         │  Enter your email and we'll send │        │
│         │  you a link to reset your        │        │
│         │  password.                       │        │
│         │                                  │        │
│         │  Email address                   │        │
│         │  ┌────────────────────────────┐  │        │
│         │  │                            │  │        │
│         │  └────────────────────────────┘  │        │
│         │                                  │        │
│         │  [  Send Reset Link  ]           │        │
│         │  ← Back to sign in              │        │  ← link
│         │                                  │        │
│         │  ┌────────────────────────────┐  │        │  ← Success state
│         │  │ ✓ Check your email         │  │        │
│         │  │   A reset link is on its   │  │        │
│         │  │   way if that email exists │  │        │
│         │  └────────────────────────────┘  │        │
│         └──────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

#### Screen-02b: Reset Password Form

**Route:** `/reset-password/:token`

```
┌─────────────────────────────────────────────────────┐
│                    ◈  PermitFlow                    │
│                                                     │
│         ┌──────────────────────────────────┐        │
│         │  Set a new password              │        │
│         │                                  │        │
│         │  New password                    │        │
│         │  ┌──────────────────────────┬──┐ │        │
│         │  │                          │👁 │ │        │
│         │  └──────────────────────────┴──┘ │        │
│         │  ●●●●○ Strength: Strong           │        │
│         │                                  │        │
│         │  Confirm new password            │        │
│         │  ┌──────────────────────────┬──┐ │        │
│         │  │                          │👁 │ │        │
│         │  └──────────────────────────┴──┘ │        │
│         │  ✗ Passwords do not match        │        │  ← error state
│         │                                  │        │
│         │  [  Update Password  ]           │        │
│         └──────────────────────────────────┘        │
│                                                     │
│  ┌──── Expired link state ────────────────────────┐ │
│  │ ✗ This link has expired or already been used.  │ │
│  │   Request a new reset link →                   │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

*End of Screen-00-auth.md*
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
## Screen Designs — Integrated Messaging Panel

---

### Screen-13: Messaging Panel (Shared Component)

**Used on:** Application Detail (Applicant view), Application Detail (Reviewer view)
**Purpose:** In-context threaded communication tied to a specific application
**User Stories:** US-5.1, US-5.2, US-5.3, US-5.4

#### Full Panel Layout (as rendered in right column of Application Detail)

```
┌────────────────────────────────────────────────────────────┐
│  MESSAGING PANEL  — Application #APP-0042                  │
│  bg-white rounded-lg border border-surface-200 h-full flex │
│  flex-col overflow-hidden                                   │
│                                                            │
├── Panel Header ────────────────────────────────────────────┤
│  Messages                              [2 unread]          │
│  text-sm font-semibold text-text-900   badge primary-500   │
│  ─────────────────────────────────────────────────────── │
│                                                            │
├── Thread Area (flex-1 overflow-y-auto) ────────────────────┤
│  py-4 px-4 space-y-4                                       │
│                                                            │
│  ── DATE DIVIDER ────────────────────────────────────────  │
│  ─── Jul 18, 2026 ───  text-xs text-text-500 text-center  │
│                                                            │
│  ┌── RECEIVED message (left-aligned) ──────────────────┐  │
│  │  ┌───┐  Marcus Rivera                               │  │
│  │  │MR │  Applicant                                   │  │  ← avatar + name + role badge
│  │  └───┘  Jul 18 · 10:32 AM                          │  │  ← timestamp text-xs text-text-500
│  │         ┌─────────────────────────────────────┐    │  │
│  │         │  Hi, I've submitted my application  │    │  │
│  │         │  for the Monroe St. renovation.     │    │  │  ← bubble: bg-surface-100 rounded-lg
│  │         │  Let me know if you need anything.  │    │  │    rounded-tl-none p-3 text-sm
│  │         └─────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌── SENT message (right-aligned, current user) ────────┐  │
│  │                     Diana Osei  ┌───┐               │  │
│  │                     Reviewer    │DO │               │  │
│  │                     Jul 18 · 3:14 PM └───┘          │  │
│  │  ┌──────────────────────────────────────┐           │  │
│  │  │ Thanks, Marcus. I'll begin review   │           │  │  ← bubble: bg-primary-500 text-white
│  │  │ shortly. Will update you if I need  │           │  │    rounded-lg rounded-tr-none p-3
│  │  │ any additional documents.            │           │  │
│  │  └──────────────────────────────────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ── DATE DIVIDER ────────────────────────────────────────  │
│  ─── Jul 20, 2026 ───                                     │
│                                                            │
│  ┌── RECEIVED message with ATTACHMENT ──────────────────┐  │
│  │  ┌───┐  Diana Osei · Reviewer                       │  │
│  │  │DO │  Jul 20 · 2:15 PM                            │  │
│  │  └───┘                                              │  │
│  │       ┌────────────────────────────────────────┐   │  │
│  │       │ Please see the attached annotated      │   │  │
│  │       │ page showing the missing stamp.        │   │  │
│  │       │                                        │   │  │
│  │       │ ┌──────────────────────────────────┐  │   │  │
│  │       │ │ 📄 annotation_notes.pdf  120 KB  │  │   │  │
│  │       │ │    [↓ Download]                  │  │   │  │
│  │       │ └──────────────────────────────────┘  │   │  │
│  │       └────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌── SYSTEM MESSAGE (status change) ───────────────────┐  │
│  │  ─── Application status changed to Under Review ──  │  │  ← text-xs text-text-500 text-center
│  │      Jul 20 · 2:17 PM                              │  │    bg-surface-100 rounded px-2 py-1
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
├── Composer Area (always visible at bottom) ────────────────┤
│  px-4 py-3 border-t border-surface-200 bg-surface-50       │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Type a message…                               [📎]  │  │  ← 📎 = file attach (reviewer only)
│  └──────────────────────────────────────────────────────┘  │
│  textarea min-h-[44px] max-h-[120px] auto-resize           │
│  bg-white border border-surface-300 rounded-lg text-sm     │
│  focus: ring-2 ring-primary-500                            │
│                                                            │
│  ┌─── Attachment preview (when file selected) ──────────┐  │
│  │  📄 annotation.pdf  120 KB  [✕ Remove]               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  Shift+Enter = new line · Enter = Send            [Send →] │
│  text-xs text-text-400                            primary  │
│                                                    button  │
└────────────────────────────────────────────────────────────┘
```

#### Message Bubble Variants

```
RECEIVED (other party):
  Avatar: 40×40 circle, initials, bg based on role
    Applicant: bg-slate-200 text-slate-700
    Reviewer:  bg-primary-100 text-primary-700
  Name: text-xs font-medium text-text-700
  Role badge: inline pill (xs) — "Applicant" grey / "Reviewer" blue
  Timestamp: text-xs text-text-400
  Bubble: bg-surface-100 rounded-lg rounded-tl-none p-3 text-sm text-text-900
          max-w-[80%]

SENT (current user, right-aligned):
  Bubble: bg-primary-500 rounded-lg rounded-tr-none p-3 text-sm text-white
          max-w-[80%] ml-auto
  Timestamp: text-xs text-text-400 text-right mt-1

ATTACHMENT in bubble:
  ┌───────────────────────────────────────────────┐
  │  📄 filename.pdf  ·  120 KB                  │
  │  [↓ Download]  text-primary-500 hover:underline│
  └───────────────────────────────────────────────┘
  bg-white/80 (in sent bubble: bg-white/20) border rounded p-2 mt-2

SYSTEM message:
  Centered, full-width divider style
  text-xs text-text-500
  bg-surface-100 inline px-3 py-1 rounded-full
```

#### Role Badge Colors in Messages

```
Applicant : bg-slate-100 text-slate-600   px-1.5 py-0.5 rounded text-xs
Reviewer  : bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded text-xs
Admin     : bg-purple-50 text-purple-700  px-1.5 py-0.5 rounded text-xs
```

#### Composer — Reviewer Attachment Flow

```
1. Reviewer clicks 📎 icon → OS file picker opens
2. File selected → attachment preview row appears above send button
3. Validation runs client-side (type + size)
   ✗ Invalid → "annotation.exe is not an accepted type" inline error, file rejected
   ✓ Valid   → preview shows with remove option
4. Reviewer types message (optional — attachment alone is allowed)
5. Click [Send] or press Enter:
   → Message appears in thread immediately (optimistic update)
   → Attachment uploaded, linked in message
   → Applicant receives in-app notification
```

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Loading thread | Skeleton bubbles (3-4 alternating left/right) | Pulse animation |
| Empty thread | Centered "No messages yet. Start the conversation." | Empty state text |
| Sending | Send button shows spinner, composer disabled | "Sending…" |
| Send error | Error inline above composer: "Failed to send — try again" | Red banner |
| Unread indicator | Blue dot before first unread message in thread | "2 unread messages" marker divider |
| Scroll to new | Auto-scrolls to bottom on new message arrival | Smooth scroll |
| Long thread | Scrollable; sticky date dividers | N/A |

#### Notifications from Messaging

```
New message notification (bell icon):
  ● Unread dot on bell icon (red, 8px) — always visible
  Badge count: absolute positioned, bg-red-500 text-white text-xs rounded-full
               min-w-[18px] h-[18px] flex-center
               shows number (9+) when > 9

Application list row unread badge:
  Inline at end of row: bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5
  "2" — clears when messaging panel is opened and messages marked read
```

---

*End of Screen-05-messaging.md*
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
## Screen Designs — Notifications Panel & Shared Components

---

### Screen-18: Notifications Panel (Slide-Over)

**Triggered by:** Bell icon in header
**Purpose:** View and act on all in-app notifications (status changes, messages, assignments)
**User Stories:** US-4.7, US-5.3

#### Layout

```
┌─── MAIN CONTENT (dimmed) ─────────────┬── NOTIFICATIONS PANEL (slide-over) ┐
│                                       │  w-96 bg-white shadow-xl h-full     │
│  [dimmed with bg-black/30]            │  fixed right-0 top-0 bottom-0       │
│                                       │                                     │
│                                       │  ┌─── Panel Header ───────────────┐ │
│                                       │  │  Notifications      [Mark all  │ │
│                                       │  │  text-lg font-semibold  read] ✕│ │
│                                       │  └───────────────────────────────┘ │
│                                       │                                     │
│                                       │  ── Today ──────────────────────── │
│                                       │                                     │
│                                       │  ┌──────────────────────────────┐  │
│                                       │  │ ● [✓ Approved] #APP-0038    │  │  ← unread: blue left border
│                                       │  │ Your Residential Remodel     │  │    bg-primary-50/30
│                                       │  │ was approved.                │  │
│                                       │  │ Diana Osei · 9:42 AM         │  │
│                                       │  └──────────────────────────────┘  │
│                                       │                                     │
│                                       │  ┌──────────────────────────────┐  │
│                                       │  │ ● [💬 Message] #APP-0042    │  │
│                                       │  │ Diana Osei replied to your  │  │
│                                       │  │ message.                     │  │
│                                       │  │ 2 hours ago                  │  │
│                                       │  └──────────────────────────────┘  │
│                                       │                                     │
│                                       │  ┌──────────────────────────────┐  │
│                                       │  │   [⚠ Info Needed] #APP-0041 │  │  ← read: no blue border
│                                       │  │   Additional information    │  │    bg-white
│                                       │  │   requested for Commercial   │  │
│                                       │  │   TI permit.                 │  │
│                                       │  │   Yesterday · 4:15 PM        │  │
│                                       │  └──────────────────────────────┘  │
│                                       │                                     │
│                                       │  ── Earlier ────────────────────── │
│                                       │                                     │
│                                       │  ┌──────────────────────────────┐  │
│                                       │  │   [🔵 Submitted] #APP-0037  │  │
│                                       │  │   Your application is now    │  │
│                                       │  │   under review.              │  │
│                                       │  │   Jul 19                     │  │
│                                       │  └──────────────────────────────┘  │
│                                       │                                     │
│                                       │  ── Empty state ─────────────────  │
│                                       │  (when no notifications)            │
│                                       │  🔔 No notifications yet.          │
│                                       │  You'll see updates here           │
│                                       │  when something changes.           │
└───────────────────────────────────────┴─────────────────────────────────────┘
```

#### Notification Row Design

```
Unread notification:
  ┌──────────────────────────────────────────────────────────┐
  │  border-l-4 border-primary-500 bg-primary-50/20 px-4 py-3│
  │  cursor-pointer hover:bg-primary-50/40                   │
  │                                                          │
  │  ● [status/type badge]  Application ID (link)            │
  │  blue dot 8px          text-xs badge                     │
  │                                                          │
  │  Message text (1-2 lines)                                │
  │  text-sm text-text-900                                   │
  │                                                          │
  │  Actor name · timestamp                                  │
  │  text-xs text-text-500                                   │
  └──────────────────────────────────────────────────────────┘

Read notification:
  Same layout, no left border/blue tint, text-text-700 (slightly muted)
```

#### Notification Type Variants

```
Status: Approved      → [✓ Approved]   badge emerald
Status: Rejected      → [✗ Rejected]   badge red
Status: Under Review  → [🔵 In Review] badge blue
Status: Info Needed   → [⚠ Action]     badge orange
Status: Submitted     → [Submitted]    badge blue
New Message           → [💬 Message]   badge primary
Reviewer Assigned     → [Assigned]     badge purple (reviewer only)
```

#### Behavior

- Panel opens as right slide-over (translate-x animation, 200ms ease-out)
- Clicking notification row: navigates to relevant application detail, closes panel, marks as read
- "Mark all read" clears all blue indicators
- Bell icon count badge updates within 30 seconds (polling or websocket)
- Panel maintains scroll position between opens in same session

---

### Shared Component: Document Preview Modal

**Triggered by:** "Preview" click on any document
**User Stories:** US-3.3, US-3.5

```
┌─── BACKDROP ─────────────────────────────────────────────────────────────────┐
│                                                                              │
│   ┌── PREVIEW MODAL ───────────────────────────────────────────────────┐    │
│   │  bg-white rounded-xl shadow-xl w-[80vw] max-w-[1000px] h-[85vh]   │    │
│   │  flex flex-col                                                     │    │
│   │                                                                    │    │
│   │  ┌─ Header ──────────────────────────────────────────────────┐    │    │
│   │  │  site_plan_v2.pdf · 2.4 MB              [↓ Download] [✕] │    │    │
│   │  └───────────────────────────────────────────────────────────┘    │    │
│   │                                                                    │    │
│   │  ┌─ Preview Area (flex-1 overflow-hidden) ──────────────────┐    │    │
│   │  │                                                           │    │    │
│   │  │  PDF:  [embedded PDF viewer / iframe]                    │    │    │
│   │  │        with scroll, page navigation                      │    │    │
│   │  │                                                           │    │    │
│   │  │  IMG:  [<img> centered, max-h-full object-contain]       │    │    │
│   │  │        with zoom on click                                │    │    │
│   │  │                                                           │    │    │
│   │  │  DOCX: [file icon + "Preview not available for DOCX"]    │    │    │
│   │  │        [↓ Download to view]  secondary button            │    │    │
│   │  │                                                           │    │    │
│   │  └───────────────────────────────────────────────────────────┘    │    │
│   └────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘

Keyboard: Escape closes modal
          Arrow keys: previous/next page (PDF)
          Arrow left/right: previous/next document in list
```

---

*End of Screen-07-notifications.md*
## Interaction Patterns

---

### Pattern-01: Optimistic UI Updates

**When to use:** Any action with a high success rate and fast server response (send message, begin review, mark notification read)

**Behavior:**
1. User triggers action (click Send, click Begin Review)
2. UI updates immediately (message appears in thread, status badge changes)
3. Network request fires in background
4. On success: nothing visible changes (update already shown)
5. On error: UI reverts + error toast "Action failed — your change was undone"

**Examples:**
- Sending a message → appears in thread immediately
- Marking notification as read → blue dot disappears immediately
- Uploading a file → progress bar animates immediately

**Do NOT use for:**
- Approve/Reject (irreversible — use confirm modal pattern instead)
- Deactivate user (security-critical — wait for server confirmation)

---

### Pattern-02: Confirm Modal (Destructive / Irreversible Actions)

**When to use:** Any action that is hard or impossible to reverse, or has significant system impact

**Behavior:**
1. User clicks action button (Approve, Reject, Deactivate User)
2. Modal opens immediately (no delay)
3. Modal shows what will happen clearly
4. Required text field must be filled (rationale, reason)
5. Confirm button is disabled until field has content (min length enforced)
6. On confirm: button shows spinner + "Processing…"; inputs disabled
7. Modal closes on success; toast + status update shown
8. On error: modal stays open; error banner shown inline within modal

**Examples:**
- Approve Application → Approval modal with rationale
- Reject Application → Reject modal with rejection reason
- Deactivate User → Deactivate confirm with impact summary

---

### Pattern-03: Inline Validation (Forms)

**When to use:** All form inputs across the application

**Behavior:**
- Validation fires on **blur** (when user leaves the field), not on keystroke (too aggressive) and not only on submit (too late)
- Error text appears immediately below the field, replacing helper text
- Field border turns red (`border-red-500`)
- On correction: error clears on next valid input (live removal)
- On form submit with errors: all invalid fields show errors simultaneously + error summary banner scrolls into view at top

**Error message format:**
```
❌ [field name] [specific problem]
   e.g.: "Project description must be at least 50 characters"
         "Email is not a valid format"
         "Password must contain at least one uppercase letter"
```

**Summary banner (on submit):**
```
┌────────────────────────────────────────────────────────┐
│  ✗  Please fix 2 errors before submitting:             │
│  · Project description is required                     │
│  · Site address — ZIP code is required                 │
└────────────────────────────────────────────────────────┘
```

---

### Pattern-04: Skeleton Screens

**When to use:** All page-level content loads (dashboard, application list, detail view)

**Rules:**
- Appears within 100ms of navigation/data-fetch start
- Does NOT appear for data that loads in < 200ms (avoids flash)
- Matches approximate shape of final content (not generic spinner)
- Shimmer animation (`animate-pulse` or custom shimmer gradient)
- Dismissed with 150ms fade-in of real content

**Do NOT use skeleton for:**
- Inline actions (button clicks, sending messages) → use spinner on button instead
- Filters/sort changes on a loaded list → use opacity-50 overlay with spinner on the table

---

### Pattern-05: Auto-Save Indicator

**When to use:** New Application form (draft save)

**Behavior:**
- Debounce: 5 seconds after last keystroke
- States:
  ```
  Idle     : (nothing shown)
  Saving   : ↻ Saving…  text-text-500 text-xs  (spinner icon)
  Saved    : ✓ Saved    text-emerald-600 text-xs  (shown 3s, then fades)
  Error    : ✗ Not saved — Retry  text-red-600 text-xs  (stays until resolved)
  ```
- Placement: right side of form header, next to page title
- Unsaved navigation: `beforeunload` event shows browser confirm dialog
  AND an in-app dialog: "Leave page? Changes since your last save will be lost."

---

### Pattern-06: Empty States

**When to use:** Any list or data area with no results

**Design:**
```
Centered vertically in the content area
Icon/illustration (SVG, ~80×80px, monotone using surface-300)
H3 heading: short, direct
Subtext: 1-2 lines explaining why it's empty or what to do
CTA button (when applicable)
```

**Examples:**
```
Application List (no apps):
  🗂 [icon]
  No permit applications yet
  Submit your first application to get started.
  [+ New Application]  ← primary button

Review Queue (empty):
  ✓ [checkmark illustration]
  Your queue is clear
  All assigned applications have been actioned.
  No new items are waiting for your review.
  (no CTA — celebrate the achievement)

Audit Log (no results):
  🔍 [search icon]
  No events match your filters
  Try adjusting your date range or clearing the filters.
  [Clear filters]  ← secondary button
```

---

### Pattern-07: Toast Notifications

**Position:** Fixed, bottom-right corner
**Stack limit:** 3 visible at once (oldest dismissed first)
**Auto-dismiss:** 4s (success, info), 6s (warning), manual only (error)

**Success toast:**
```
┌──────────────────────────────────────────────────┐
│  ✓  Application submitted successfully           │
│     #APP-2024-0042 · Jul 21 at 10:32 AM         │
│                                              [✕] │
└──────────────────────────────────────────────────┘
  border-l-4 border-emerald-500
```

**Error toast:**
```
┌──────────────────────────────────────────────────┐
│  ✗  Upload failed                                │
│     Connection error. Try again.      [Retry]   │
│                                              [✕] │
└──────────────────────────────────────────────────┘
  border-l-4 border-red-500
  Does not auto-dismiss
```

**Accessibility:** `role="status"` for success/info; `role="alert"` for errors (ARIA live region)

---

### Pattern-08: Loading States on Buttons

**When to use:** Any button that triggers an async operation

```
Normal  : [  Begin Review  ]
Loading : [  ↻ Processing…  ]  — spinner replaces icon, text changes, disabled
Success : toast notification (button returns to normal or page navigates away)
Error   : button returns to normal, error toast or inline error shown
```

**Rules:**
- Button width stays constant during loading (prevents layout shift) — use `min-w-[...px]`
- Cursor: `cursor-not-allowed` during loading
- Adjacent cancel/secondary buttons: hidden or disabled during loading (prevents racing actions)

---

### Pattern-09: Status Change Animation

**When to use:** When a status badge on a visible card/row changes

```
1. Old status badge fades out (opacity 0, 150ms)
2. New status badge fades in (opacity 0 → 1, 150ms)
   + brief pulse animation: `animate-[pulse_0.5s_ease-out]`
3. If status card is on dashboard, count increments with number flip animation

This draws the eye to changes without jarring the user.
```

---

*End of Y0-patterns.md*
## Responsive Design Considerations

---

### Breakpoints

```
Mobile  : 375px – 767px    (sm: in Tailwind)
Tablet  : 768px – 1023px   (md: in Tailwind)
Desktop : 1024px – 1439px  (lg: in Tailwind)
Wide    : 1440px+           (xl: in Tailwind)
```

---

### Desktop (≥ 1024px) — Primary Layout

**Shell:**
- Fixed sidebar 256px visible at all times
- Content area fills remaining width
- Max-width 1280px, centered for wide screens

**Application Detail:**
- Two-column layout (55% info / 45% messaging)
- Timeline displayed horizontally

**Application List:**
- Full table view with all columns
- Hover states, row click to navigate

**Admin Screens:**
- Full table density with all columns
- Bulk action toolbar visible

---

### Tablet (768px – 1023px)

**Shell:**
- Sidebar collapses to 64px icon-only strip (icons + tooltips on hover)
- OR: off-canvas sidebar triggered by hamburger icon
- Header shows hamburger menu icon (left) + wordmark (center)

**Application Detail:**
- Two columns maintained (48% / 52%) but slightly compressed
- Messaging panel may require scroll

**Admin Tables:**
- Less-critical columns hidden: e.g., "Last Updated" column hidden; "Age" shown instead
- Horizontal scroll on table if necessary (not preferred)

**Sidebar (tablet icon-only):**
```
┌────────────────────┐
│  ◈                 │  ← Logo icon only
│  ──────────────    │
│  ⊞                 │  ← Dashboard icon + tooltip on hover
│  ☰                 │  ← Applications icon
│  ＋                │  ← New Permit icon
│  ──────────────    │
│  [MR]              │  ← Avatar only
│  ⚙                 │
│  ↪                 │
└────────────────────┘
```

---

### Mobile (375px – 767px) — Marcus's On-Site Context

**Shell:**
- Sidebar hidden by default; hamburger icon in header triggers slide-over drawer
- Header: [☰] [PermitFlow wordmark] [🔔] [Avatar]
- Bottom navigation bar NOT used (insufficient items for bottom nav pattern)

**Mobile Navigation Drawer:**
```
┌──────────────────────────────────────────────────┐
│  ✕  PermitFlow                                   │
│  ─────────────────────────────────────────────── │
│                                                  │
│  ⊞  Dashboard                                    │
│  ☰  My Applications                             │
│  ＋  New Application                             │
│  ─────────────────────────────────────────────── │
│  ┌──┐ Marcus Rivera · Applicant                  │
│  │MR│                                            │
│  └──┘                                            │
│  ⚙  Settings                                    │
│  ↪  Log out                                     │
└──────────────────────────────────────────────────┘
Overlay: bg-black/50 on content behind drawer
Drawer: slide in from left, w-[280px], h-full
```

**Applicant Dashboard (mobile):**
- Summary cards: 1-column stack (full-width cards)
- Recent application list: full-width rows (adapted — less metadata)
- Status chart: hidden on mobile or collapsed behind "View status summary" expand

**Application List (mobile):**
- Full-width rows
- Table collapses: no table header row; each row is a card-style item
- Sort/filter: hidden behind a "Filter & Sort" button → bottom sheet

```
┌────────────────────────────────────────────┐
│  ⚠ #APP-0042                    2d ago    │
│  Commercial TI — Monroe St.     ⚠ Info Req │
│  4 documents                       💬 2   │
└────────────────────────────────────────────┘
```

**Application Detail (mobile):**
- Single column layout (no side-by-side)
- Section order (stacked top to bottom):
  1. Application header + status badge
  2. Action Required banner (if applicable)
  3. Lifecycle timeline (vertical orientation)
  4. Application info (collapsed behind "Show details" accordion)
  5. Documents panel
  6. Messaging panel (full width, takes majority of scroll area)

**Lifecycle Timeline (mobile):**
```
Horizontal timeline doesn't fit → vertical left-rail timeline:

●  Draft         Jul 15 · 9:00 AM
│  ✓ Complete
│
●  Submitted     Jul 18 · 10:32 AM
│  ✓ Complete
│
●  Under Review  Jul 19 · 2:00 PM
│  ◐ In Progress
│
○  Info Needed   ─ (upcoming)
│
○  Approved      ─ (upcoming)
```

**Document Upload (mobile):**
- Drag-and-drop hidden on touch devices; replaced by:
  ```
  ┌─────────────────────────────────────────────┐
  │  📎 Tap to upload a file                    │
  │  PDF, JPG, PNG, DOCX · Max 25 MB            │
  └─────────────────────────────────────────────┘
  ```
- Camera option may surface depending on device capabilities (OS file picker)

**Messaging Panel (mobile):**
- Full width
- Composer sticks to bottom of viewport (sticky positioning)
- File attachment icon in composer toolbar

**Modals (mobile):**
- Full-screen bottom sheet instead of centered modal
- `rounded-t-xl` on top corners; `h-auto max-h-[90vh]` with scroll inside
- Close handle (drag indicator) at top

**New Application Form (mobile):**
- Single column (full width inputs)
- Progress stepper: abbreviated (step numbers only: ① ② ③)
- Auto-save same behavior as desktop

**Admin Screens (mobile):**
- Admin is desktop-first (James uses desktop only per persona)
- Mobile access still functional but optimized for desktop density
- Tables reflow to card view on < 768px
- Bulk actions hidden on mobile (checkbox column removed; individual row actions only)

---

### Touch Targets

```
All interactive elements: minimum 44×44px (WCAG 2.5.5)

Button heights : h-11 (44px) on mobile, h-10 (40px) on desktop
Icon buttons   : h-11 w-11 (44×44) on mobile, h-9 w-9 (36×36) on desktop
Table row clicks: full row is clickable (py-4 ensures 44px+ tap height)
Checkbox: 20×20 visual, 44×44 tap area via padding
```

---

### Performance on Mobile

```
Images: Responsive <img> with srcset; WebP format preferred
Lazy loading: document thumbnails and message avatars below fold
Bundle splitting: admin chunk not loaded for applicant/reviewer roles
Font: Inter loaded via Google Fonts with display=swap to avoid FOIT
Animation: prefers-reduced-motion media query respected — all transitions
           disabled for users who have set this OS preference
```

---

*End of Y1-responsive.md*
## Accessibility Notes

**Standard:** WCAG 2.1 Level AA
**Automated check:** axe-core (zero critical violations required before ship)
**User Stories:** US-9.2, US-1.1

---

### Color Contrast

```
All text/background pairings must meet:
  Normal text (< 18pt / < 14pt bold) : 4.5:1 minimum
  Large text (≥ 18pt / ≥ 14pt bold)  : 3:1 minimum
  UI components and icons            : 3:1 minimum

Verified pairings:
  text-text-900 (#0F172A) on white (#FFFFFF)           : ~21:1 ✓
  text-text-700 (#334155) on white                     : ~9.7:1 ✓
  text-text-500 (#64748B) on white                     : ~4.6:1 ✓ (borderline — use only for captions)
  text-primary-600 (#4338CA) on white                  : ~8.2:1 ✓
  white (#FFFFFF) on primary-500 (#4F46E5) buttons     : ~7.8:1 ✓
  text-emerald-700 (#047857) on emerald-50 (#ECFDF5)   : ~6.1:1 ✓ (approved badge)
  text-red-700 (#B91C1C) on red-50 (#FEF2F2)           : ~6.8:1 ✓ (rejected badge)
  text-amber-700 (#B45309) on amber-50 (#FFFBEB)       : ~4.9:1 ✓ (review badge)
  text-orange-700 (#C2410C) on orange-50 (#FFF7ED)     : ~5.3:1 ✓ (info needed badge)

⚠ text-text-500 on white is ONLY used for non-critical captions/timestamps.
  Never use text-text-400 or lighter for meaningful body text.
```

---

### Keyboard Navigation

```
Tab order: follows DOM order which matches visual reading order

Focus indicators:
  All interactive elements: visible focus ring
  ring-2 ring-primary-500 ring-offset-2
  (NOT the browser default outline — that is suppressed and replaced)

Keyboard shortcuts:
  Escape : Close modal / close slide-over panel / cancel inline action
  Enter  : Submit focused form / confirm focused button
  Space  : Toggle checkbox / trigger button (if Enter not handled by browser)
  Arrow  : Navigate select dropdowns / navigate PDF preview pages
  Tab    : Forward navigation
  Shift+Tab : Backward navigation

Focus traps:
  Open modal dialogs: focus trapped inside modal
  Slide-over panels: focus trapped inside panel
  Tab cycles within trap: last focusable element → back to first
  On close: focus returns to the element that triggered the modal/panel
```

---

### Semantic HTML & ARIA

```
Page structure:
  <header role="banner">     — app header
  <nav role="navigation" aria-label="Main navigation">  — sidebar
  <main role="main">         — content area
  <footer role="contentinfo"> — app footer

Buttons vs Links:
  <button>   : for actions (Submit, Send, Approve, Begin Review)
  <a href>   : for navigation (go to application detail, go to dashboard)
  Never use <div> or <span> as interactive elements without role+tabIndex

Form fields:
  Every input has an associated <label> (via htmlFor / aria-labelledby)
  Error messages: aria-describedby linking error text to input
  Required fields: aria-required="true" + visual asterisk (*) + label annotation
  
  Example:
  <label htmlFor="projectDesc">Project Description <span aria-hidden="true">*</span></label>
  <textarea id="projectDesc" aria-required="true" aria-describedby="projectDesc-error" />
  <span id="projectDesc-error" role="alert">Project description is required</span>

Status badges:
  <span role="status" aria-label="Application status: Under Review">
    🔵 Under Review
  </span>

Lifecycle timeline:
  <ol aria-label="Application lifecycle">
    <li aria-current="step" aria-label="Under Review — in progress, started Jul 19 2026">…</li>
    <li aria-label="Additional Info Needed — not reached">…</li>
    <li aria-label="Approved — not reached">…</li>
  </ol>

Document list:
  <ul aria-label="Uploaded documents (3 files)">
    <li>…</li>
  </ul>

Modals:
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
    <h2 id="modal-title">Approve Application</h2>
    <p id="modal-desc">…</p>
  </div>
```

---

### ARIA Live Regions

```
Toast notifications:
  <div role="status" aria-live="polite" aria-atomic="true">  (success, info)
  <div role="alert" aria-live="assertive" aria-atomic="true"> (errors)

Status updates (when status changes on visible page):
  <div aria-live="polite">  wrapping status badge — announces new status

Unread counts:
  <span aria-live="polite" aria-label="3 unread notifications">3</span>

Auto-save indicator:
  <span aria-live="polite">Saved</span>  — polite, non-urgent

Upload progress:
  <div role="progressbar" aria-valuenow="67" aria-valuemin="0" aria-valuemax="100"
       aria-label="Uploading site_plan.pdf">
    <div style="width: 67%"></div>
  </div>
```

---

### Screen Reader Considerations

```
Icon-only buttons must have text alternatives:
  ✓ <button aria-label="Remove site_plan.pdf"><XIcon /></button>
  ✓ <button aria-label="Preview site_plan.pdf"><EyeIcon /></button>
  ✓ <button aria-label="Download all documents as ZIP"><DownloadIcon /></button>
  ✓ <button aria-label="Close notifications panel"><XIcon /></button>
  ✗ <button><XIcon /></button>  (no aria-label — invalid)

Decorative icons/illustrations:
  <SVGIcon aria-hidden="true" />  (purely decorative — hidden from screen readers)

Status badge with icon:
  <span>
    <CheckIcon aria-hidden="true" />  ← decorative
    <span>Approved</span>             ← readable
  </span>

Avatar with initials:
  <div aria-label="Diana Osei" role="img">DO</div>

Application ID in code style:
  <code aria-label="Application ID APP-2024-0042">#APP-2024-0042</code>

Timestamp with tooltip:
  <time datetime="2026-07-21T10:32:00Z" title="July 21, 2026 at 10:32 AM UTC">
    Jul 21, 10:32 AM
  </time>
```

---

### Reduced Motion

```
CSS media query: @media (prefers-reduced-motion: reduce)

In Tailwind: motion-safe: and motion-reduce: variants

Animations disabled under prefers-reduced-motion:
  - Skeleton pulse animation → static grey block
  - Status badge fade transition → instant switch
  - Toast slide-in → instant appear
  - Slide-over panel → instant show/hide
  - Page transition → none
  - Progress bar animation → static bar

Animations KEPT (functional, not decorative):
  - Upload progress bar fill (communicates real progress — needed for orientation)
  - Focus indicator transition (helps keyboard users track focus)
```

---

### Form Accessibility Checklist

```
Per field:
  ☐ <label> with for= attribute linking to input id
  ☐ Placeholder text is supplemental, NOT the label
  ☐ Error message has id; input has aria-describedby referencing it
  ☐ aria-required="true" on required fields
  ☐ aria-invalid="true" when field has error
  ☐ autocomplete attributes where applicable (name, email, tel, address fields)

Fieldsets:
  ☐ Address fields wrapped in <fieldset><legend>Site Address</legend>…</fieldset>
  ☐ Radio groups wrapped in <fieldset><legend>…</legend>…</fieldset>

Submit behavior:
  ☐ Error summary banner has aria-live="assertive" (announced immediately)
  ☐ Focus moves to error summary on invalid submit
  ☐ Success: focus moves to confirmation heading
```

---

### Automated Audit Requirements

```
Tool: axe-core (via @axe-core/react in development; CI integration)

Required result: ZERO violations at severity "critical" or "serious"

Runs:
  - On every PR merge to main (CI check, blocks merge on violation)
  - On every Storybook story (component-level coverage)
  - Manually on each screen before phase completion sign-off

Categories checked:
  ✓ color-contrast (all text/background pairings)
  ✓ label (all form inputs have labels)
  ✓ button-name (all buttons have accessible names)
  ✓ image-alt (all images have alt text)
  ✓ link-name (all links have accessible names)
  ✓ duplicate-id (no duplicate IDs in DOM)
  ✓ aria-required-attr (ARIA attributes used correctly)
  ✓ focus-order-semantics (focus order is logical)
```

---

*End of Y2-accessibility.md*
