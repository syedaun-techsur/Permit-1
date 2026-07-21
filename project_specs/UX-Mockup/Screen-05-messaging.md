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
