---
phase: 03-review-workflow
plan: "03"
subsystem: messaging
tags: [react, typescript, polling, websocket-alt, notifications, playwright]

# Dependency graph
requires:
  - phase: 03-02
    provides: messages and notifications backend API endpoints
  - phase: 02-applicant-core
    provides: apiClient (with Bearer token interceptor), useAuthStore, Tailwind design tokens
provides:
  - Message, MessageAttachment, Notification TypeScript interfaces
  - messagesApi (list, send, markRead, getUnreadCount, getAttachmentUploadUrl, registerAttachment)
  - notificationsApi (getUnreadCount, list, markOneRead, markAllRead)
  - useMessages hook with 30s polling
  - useNotifications hook extended with notification list + mark-read
  - MessagePanel shared component (applicant + reviewer pages)
  - MessageBubble component with alignment, role badge, timestamp
  - MessageComposer with Enter=send, Shift+Enter=newline, reviewer paperclip
  - NotificationPanel dropdown from NavBar bell
  - NavBar updated with notification panel wiring
  - e2e/messaging.spec.ts Playwright tests
affects: [03-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "30s polling interval via setInterval in useCallback + useEffect cleanup"
    - "Mark-read-on-open pattern: useEffect fires when messages load, marks unread IDs"
    - "Optimistic local state update for markOneRead/markAllRead before server confirmation"
    - "Separate API layer (messagesApi, notificationsApi) using shared apiClient with Bearer auto-attach"
    - "data-testid attributes on all key interactive elements for Playwright targeting"

key-files:
  created:
    - frontend/src/types/message.types.ts
    - frontend/src/api/messages.api.ts
    - frontend/src/api/notifications.api.ts
    - frontend/src/hooks/useMessages.ts
    - frontend/src/components/messaging/MessageBubble.tsx
    - frontend/src/components/messaging/MessageComposer.tsx
    - frontend/src/components/messaging/MessagePanel.tsx
    - frontend/src/components/notifications/NotificationPanel.tsx
    - e2e/messaging.spec.ts
  modified:
    - frontend/src/hooks/useNotifications.ts
    - frontend/src/components/layout/NavBar.tsx

key-decisions:
  - "MessagePanel uses separate MessageBubble and MessageComposer sub-components (not inline) for testability and reuse"
  - "design tokens mapped to actual Tailwind config values: bg-brand-primary (not bg-primary-500), bg-surface-sidebar (not bg-surface-100) — plan used non-existent Tailwind class names"
  - "NavBar has two separate bell button instances (desktop/mobile) each with its own notifRef for correct click-outside detection"
  - "MessageComposer file attachment flow: getAttachmentUploadUrl → PUT to presigned URL (plain fetch, no auth header) → registerAttachment"
  - "Playwright tests use page.route() for API mocking — no real server required for unit-style E2E"

patterns-established:
  - "Shared UI components built in dedicated plan before consumer pages (MessagePanel built here, consumed by 03-04)"
  - "Polling hooks follow: fetchOnMount + setInterval(30s) + cleanup in useEffect return"
  - "data-testid naming: hyphen-separated lowercase, e.g. message-composer-input, notification-bell"

# Metrics
duration: 8min
completed: 2026-07-22
---

# Phase 3 Plan 03: Messaging UI Components Summary

**React messaging components (MessagePanel, MessageBubble, MessageComposer) and NotificationPanel dropdown wired to NavBar bell icon, with 30s polling, mark-read-on-open, and Playwright E2E test coverage**

## Performance

- **Duration:** 8 min
- **Started:** 2026-07-22T22:29:08Z
- **Completed:** 2026-07-22T22:37:21Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- TypeScript interfaces for Message, MessageAttachment, Notification with full type safety
- messagesApi and notificationsApi clients wrapping the apiClient with Bearer token auto-attach
- useMessages hook with 30s polling, sendMessage, markAllRead, refetch
- useNotifications hook extended with notification list, loadNotifications, markOneRead, markAllRead
- MessageBubble renders own messages right-aligned (bg-brand-primary text-white) and others left-aligned (bg-surface-sidebar), with sender name, role badge, timestamp, attachment download links
- MessageComposer: Enter=send, Shift+Enter=newline, send button disabled during in-flight, reviewer-only paperclip attach button with presigned URL file upload flow
- MessagePanel shared component with Skeleton loading, date dividers, scroll-to-bottom, mark-read-on-open, unread count badge
- NotificationPanel dropdown from NavBar bell with mark-one-read on click + navigate, mark-all-read link, loading skeletons
- NavBar updated with click-outside dismiss, data-testid="notification-bell" on bell buttons
- Playwright E2E test suite covering: send message, message bubble display (name + role badge), unread count badge, notification panel open/mark-all-read; CI-conditional skip for MinIO attachment test

## Task Commits

Each task was committed atomically:

1. **Task 1: Message types, API clients, and hooks** - `191bea0` (feat)
2. **Task 2: Components + NavBar + Playwright tests** - `5ea0a3e` (feat)
3. **Fix: MessagePanel full implementation** - `04c26d2` (fix)

**Plan metadata:** _(committed with state update)_

_Note: A fix commit was required because 03-04 ran between 03-03's two task commits and created a simplified MessagePanel stub; the fix replaces it with the full implementation._

## Files Created/Modified

- `frontend/src/types/message.types.ts` — Message, MessageAttachment, MessageListResponse, Notification, NotificationListResponse interfaces
- `frontend/src/api/messages.api.ts` — list, send, markRead, getUnreadCount, getAttachmentUploadUrl, registerAttachment
- `frontend/src/api/notifications.api.ts` — getUnreadCount, list, markOneRead, markAllRead
- `frontend/src/hooks/useMessages.ts` — 30s polling hook with sendMessage, markAllRead, refetch
- `frontend/src/hooks/useNotifications.ts` — extended with notification list + mark-read actions
- `frontend/src/components/messaging/MessageBubble.tsx` — alignment, role badge, timestamp, attachments
- `frontend/src/components/messaging/MessageComposer.tsx` — Enter=send, reviewer paperclip, data-testid
- `frontend/src/components/messaging/MessagePanel.tsx` — full shared component using above two
- `frontend/src/components/notifications/NotificationPanel.tsx` — dropdown notification list
- `frontend/src/components/layout/NavBar.tsx` — bell icon wired to NotificationPanel, click-outside close
- `e2e/messaging.spec.ts` — 4 Playwright test suites with API mocking

## Decisions Made

- Mapped plan's non-existent Tailwind tokens (`bg-primary-500`, `bg-surface-100`) to actual design system tokens from Phase 1 config (`bg-brand-primary`, `bg-surface-sidebar`) — plan specified classes not in tailwind.config.ts
- Used two separate `useRef` instances in NavBar (desktopNotifRef, mobileNotifRef) to handle click-outside correctly for both viewports without conditional refs (which React rules prohibit)
- Reviewer-only paperclip button conditionally renders based on `isReviewer` prop — backend RBAC is authoritative; UI is defense-in-depth per T-03-18 threat mitigation
- E2E tests use `page.route()` mocking pattern matching existing e2e test conventions in the repo

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced 03-04 stub MessagePanel with full 03-03 implementation**
- **Found during:** Task 2 verification
- **Issue:** Plan 03-04 had already committed a simplified MessagePanel.tsx stub (160 lines, inline MessageBubble function, no useMessages hook, no Skeleton, no date dividers, wrong data-testid values: `message-input` instead of `message-composer-input`, `message-send-btn` instead of `message-send-button`)
- **Fix:** Wrote full MessagePanel.tsx using separate MessageBubble + MessageComposer components, with all required data-testid attributes matching e2e/messaging.spec.ts expectations
- **Files modified:** `frontend/src/components/messaging/MessagePanel.tsx`
- **Verification:** `npx tsc --noEmit` exits 0; both consuming pages (PermitDetailPage, ReviewDetailPage) compile correctly
- **Committed in:** `04c26d2` (fix commit)

**2. [Rule 1 - Bug] Design token correction: bg-primary-500 → bg-brand-primary**
- **Found during:** Task 2 (MessageBubble implementation)
- **Issue:** Plan specified `bg-primary-500 text-white` and `bg-surface-100` but tailwind.config.ts has no `primary` or `surface-100` color keys; these classes would produce no styling
- **Fix:** Used actual design tokens: `bg-brand-primary text-white` (own messages) and `bg-surface-sidebar text-text-primary` (other messages)
- **Files modified:** `frontend/src/components/messaging/MessageBubble.tsx`
- **Verification:** TypeScript compiles, classes match Tailwind config entries
- **Committed in:** `5ea0a3e` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bug fixes)
**Impact on plan:** Both fixes essential for correctness — wrong data-testids would fail all E2E tests, wrong Tailwind classes would produce unstyled bubbles. No scope creep.

## Issues Encountered

- 03-04 ran between 03-03's two task commits (wave 2 parallel execution), creating MessagePanel.tsx as a stub; required fix commit to restore full implementation. All interfaces remain backward-compatible.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- MessagePanel is a fully reusable shared component; 03-04's ReviewDetailPage can embed it directly
- All data-testid attributes present for E2E targeting
- Zero TypeScript errors
- Playwright messaging tests written; execution deferred to verify phase

## Self-Check: PASSED

All key files present on disk. All 3 task commits verified in git history (191bea0, 5ea0a3e, 04c26d2). TypeScript: 0 errors.

---
*Phase: 03-review-workflow*
*Completed: 2026-07-22*
