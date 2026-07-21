---

## F09: Accessibility & Responsive Design {#f09}

**PRD Feature:** F9 · **Phase:** 2 (responsive) → 5 (full WCAG audit) · **Priority:** P0
**Requirements:** UX-01, UX-02

### Description

The entire Permit Management System interface is fully functional across all screen sizes (mobile through desktop) and meets WCAG 2.1 Level AA accessibility standards on every page. Accessibility is built into every component from the start — not retrofitted after launch. Responsive design ensures the mobile experience is not degraded; it is a first-class use case. The premium SaaS aesthetic must coexist with full WCAG compliance — visual quality and accessibility are not in conflict.

### Terminology

- **WCAG 2.1 AA:** Web Content Accessibility Guidelines version 2.1, Level AA — the compliance target. Covers perceivability, operability, understandability, and robustness.
- **Viewport Breakpoints:** Mobile: 375–767px; Tablet: 768–1023px; Desktop: 1024–1440px+.
- **Focus Management:** The programmatic control of keyboard focus when UI state changes (e.g., opening a modal moves focus inside it; closing returns focus to the trigger element).
- **Live Region:** An ARIA `role="status"` or `aria-live` region that announces dynamic content changes to screen readers without requiring focus change.
- **Skip Link:** A visually hidden but focusable link at the top of every page that jumps to the main content area (bypasses navigation).

### Sub-features

- **UX-01** — Responsive layout for desktop and mobile
- **UX-02** — WCAG 2.1 AA compliance

---

### UX-01: Responsive Design

**Breakpoint Behavior:**

| Viewport | Layout Pattern |
|----------|---------------|
| Mobile (375–767px) | Single-column; navigation collapses to hamburger menu; application detail panels stack vertically; tables become card lists |
| Tablet (768–1023px) | Two-column where appropriate; side navigation may collapse to icons; tables supported with horizontal scroll |
| Desktop (1024px+) | Full multi-column layout; side navigation always visible; application detail page uses two-column split (form + documents/messages) |

**Navigation:**
- Mobile: hamburger menu → full-screen or drawer navigation overlay.
- Tablet: collapsible sidebar; icon-only mode with tooltips.
- Desktop: always-visible sidebar.

**Application List:**
- Mobile: each application renders as a card (not a data table).
- Desktop: data table with sortable columns.

**Application Detail:**
- Mobile: stacked panels with accordions/tabs to manage screen real estate (Form, Documents, Status, Messages as tab options).
- Desktop: two-column split layout (form/status left, documents/messages right).

**Document Upload:**
- Mobile: "Browse Files" button only (no drag-and-drop — not practical on mobile). Drop zone still rendered but with tooltip explaining mobile upload method.
- Desktop: full drag-and-drop + browse.

**Messaging Panel:**
- Mobile: messaging panel accessible via a tab on the application detail page; compose box fixed to bottom of viewport when active.
- Desktop: integrated panel within the split layout.

**Testing Requirements:**
- All views tested at 375px, 768px, 1024px, 1440px.
- Test on real devices: iOS Safari (iPhone 14+), Android Chrome (Android 13+).
- Touch targets must be ≥ 44×44px (WCAG 2.5.5 AAA; targeted for AA compliance as a quality baseline).
- No horizontal scrolling on any view at any breakpoint except explicitly scroll-enabled data tables.

**Error States:**

| Scenario | Response |
|----------|---------|
| Viewport below 320px | Not supported; show a graceful notice. |

---

### UX-02: WCAG 2.1 AA Compliance

**The four WCAG principles (POUR) applied to this system:**

#### Perceivable

**Color Contrast:**
- All body text on background: ≥ 4.5:1 contrast ratio
- Large text (≥ 18pt or 14pt bold) on background: ≥ 3:1 contrast ratio
- UI components and graphical elements (icons, status badges, chart segments): ≥ 3:1 against adjacent colors
- Status colors (badges) must never rely on color alone — always include a text label

**Images and Icons:**
- Decorative images: `alt=""` (empty alt, ignored by screen readers)
- Informative icons: `aria-label` on the element, or adjacent visible text
- All SVG icons: `aria-hidden="true"` if decorative; `role="img"` + `aria-label` if informative
- Charts: described via `aria-label` + a visually-hidden text summary

**Text Alternatives:**
- All form field inputs: associated `<label>` elements (not placeholder-only)
- Status badges: readable as text by screen readers (role="status" or aria-label)
- PDF viewer embeds: provide a direct download link as a text alternative

**Motion and Animation:**
- All animations respect `prefers-reduced-motion: reduce` — skeleton shimmer, transitions, and micro-interactions are suppressed or reduced when this media query is set.

#### Operable

**Keyboard Navigation:**
- All interactive elements reachable by Tab key in logical order.
- Skip link: `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>` on every page, visible on focus.
- Keyboard shortcuts: none that conflict with browser or assistive technology defaults.
- Modals: focus trapped inside while open; `Escape` closes modal; focus returns to trigger on close.
- Dropdowns and comboboxes: Arrow keys navigate options; `Enter` selects; `Escape` closes.
- Date inputs: accessible date picker with keyboard navigation; raw text input also accepted.
- Data tables: column headers are `<th scope="col">` with sort controls keyboard-accessible.

**Focus Indicators:**
- Focus ring visible on every interactive element using `color.border.focus` token.
- `:focus-visible` used (not `:focus`) to suppress focus ring on mouse click while preserving it for keyboard.
- Focus ring never suppressed without a replacement visual indicator.
- Minimum focus indicator: 2px solid ring with 2px offset (meets WCAG 2.4.11 focus appearance).

**Timing:**
- No time limits on forms unless explicitly required (none in v1).
- Session expiry warns the user at least 1 minute in advance (modal: "Your session will expire in 60 seconds. Stay signed in?").
- Auto-save (PERM-02) means form data is not lost on session expiry.

#### Understandable

**Forms:**
- Inline validation errors: associated with the field via `aria-describedby`.
- Error summary: on form submit failure, a summary at the top of the form lists all errors; focus is moved to the summary.
- Field labels: always visible (not just placeholders); required fields marked with `*` and `aria-required="true"`.
- Input purpose: standard fields (`email`, `tel`, `name`) use the correct `autocomplete` attribute.

**Language:**
- `<html lang="en">` on all pages.
- Error messages: plain language, no technical jargon.

**Navigation Consistency:**
- Navigation is in the same location on every page.
- Page titles are unique and descriptive: `<title>Application PMS-00042 — Permit Management System</title>`.

#### Robust

**Semantic HTML:**
- Use native HTML elements for their semantic purpose: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>` as appropriate.
- No `<div>` or `<span>` used as interactive elements without ARIA roles.
- Forms use `<form>`, `<fieldset>`, and `<legend>` for grouped controls.

**ARIA Usage:**
- ARIA used only when native HTML semantics are insufficient.
- `aria-live="polite"` for non-urgent updates (new messages, unread counts).
- `aria-live="assertive"` only for urgent errors or critical alerts.
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` on all modal dialogs.
- `aria-expanded` on collapsible elements (accordion, dropdown).
- `aria-busy="true"` on skeleton/loading containers.

**Testing Protocol:**
- Automated: axe-core integrated in CI pipeline (fail build on any violation).
- Manual: Keyboard-only navigation tested on every page type before phase sign-off.
- Screen reader: NVDA + Chrome (Windows) and VoiceOver + Safari (macOS/iOS) tested on core flows.
- Color contrast: tested with automated tool (axe-core) and manually verified for custom token pairings.
- WCAG audit checklist completed for every new page before the phase is marked complete.

**Compliance Gate:**
- Phase 5 is not complete until 100% of pages pass the automated axe-core audit with zero violations at AA level.
- Manual screen reader testing on the core flows (register, submit application, view status, send message) must be completed and documented.

**Schema Surface (this feature):** No database entities.
**API Surface (this feature):** No API endpoints specific to accessibility; accessibility is applied across all endpoints and UI.
