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
