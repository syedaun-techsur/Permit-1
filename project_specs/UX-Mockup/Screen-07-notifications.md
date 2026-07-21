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
