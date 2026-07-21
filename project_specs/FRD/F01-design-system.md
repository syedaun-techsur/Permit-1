---

## F01: Design System & UI Foundation {#f01}

**PRD Feature:** F1 · **Phase:** 1 — Foundation · **Priority:** P0
**Requirements:** UX-03, UX-04, UX-05

### Description

The design system establishes the complete visual language for the Permit Management System. It is implemented as a set of Tailwind CSS configuration extensions plus a library of React component primitives. Every visual decision — color, typography, spacing, shadow, border radius, motion — is token-driven and intentional. This is not a default template; the system must feel like a premium SaaS product. The design system is the foundation that every subsequent feature builds on.

### Terminology

- **Design Token:** A semantic named variable (e.g., `color.surface.primary`, `spacing.4`) that maps to a specific CSS value. Tokens are defined in the Tailwind config and referenced throughout the codebase.
- **Component Primitive:** A base-level UI element (Button, Input, Card, Badge, Modal, Toast) that accepts standardized props and enforces token usage.
- **Skeleton Screen:** A loading placeholder that renders the exact layout skeleton of the page's content using animated shimmer blocks — no spinners for page-level loads.
- **Micro-interaction:** A subtle animated state change (hover lift, focus ring, active press) on interactive elements that provides visual feedback without distracting from content.

### Sub-features

- **UX-05** — Custom design token system (color, typography, spacing, shadows, border radii)
- **UX-04** — Interactive element hover, focus, and active states with smooth transitions
- **UX-03** — Skeleton screen loading states for page-level content

---

### UX-05: Custom Design Token System

**Process:**
1. `[System/Frontend]` loads `tailwind.config.ts` which extends Tailwind's default theme with custom tokens.
2. All components reference tokens by semantic name, never raw Tailwind utility classes for design-critical properties.
3. Token changes propagate automatically across all components at build time.

**Token Specification:**

**Color Tokens:**

| Token | Usage | Approximate Value |
|-------|-------|------------------|
| `color.brand.primary` | Primary actions, CTAs, links | Custom blue (not Tailwind default) |
| `color.brand.secondary` | Supporting accents | Complementary hue |
| `color.surface.base` | Page background | Near-white or light gray |
| `color.surface.card` | Card backgrounds | White with subtle elevation |
| `color.surface.sidebar` | Sidebar/nav backgrounds | Slightly darker than base |
| `color.text.primary` | Body text | Near-black, ≥ 4.5:1 contrast on surface |
| `color.text.secondary` | Labels, captions | Medium gray, ≥ 3:1 contrast on surface |
| `color.text.disabled` | Disabled state text | Light gray |
| `color.border.default` | Default borders and dividers | Subtle gray |
| `color.border.focus` | Focus ring color | High-visibility, matches brand |
| `color.status.draft` | Draft badge | Neutral/gray |
| `color.status.submitted` | Submitted badge | Blue |
| `color.status.under_review` | Under Review badge | Amber/orange |
| `color.status.additional_info` | Additional Info Needed badge | Orange/red-orange |
| `color.status.approved` | Approved badge | Green |
| `color.status.rejected` | Rejected badge | Red |
| `color.feedback.error` | Error messages, borders | Red, WCAG-compliant |
| `color.feedback.warning` | Warning states | Amber, WCAG-compliant |
| `color.feedback.success` | Success states | Green, WCAG-compliant |

**Typography Tokens:**

| Token | Usage | Scale |
|-------|-------|-------|
| `text.heading.xl` | Page titles | 28–32px, weight 700 |
| `text.heading.lg` | Section headings | 22–24px, weight 600 |
| `text.heading.md` | Card headings | 18–20px, weight 600 |
| `text.body.md` | Primary body text | 16px, weight 400 |
| `text.body.sm` | Secondary body, labels | 14px, weight 400 |
| `text.label` | Form labels | 14px, weight 500 |
| `text.caption` | Timestamps, metadata | 12px, weight 400 |
| `text.code` | Code blocks, IDs | Monospace, 14px |

**Spacing Tokens:** 4px base unit. Scale: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px), 6 (24px), 8 (32px), 10 (40px), 12 (48px), 16 (64px).

**Shadow Tokens:**

| Token | Usage |
|-------|-------|
| `shadow.sm` | Subtle card lift |
| `shadow.md` | Modal, dropdown elevation |
| `shadow.lg` | Full-screen overlay, drawer |

**Border Radius Tokens:**

| Token | Usage |
|-------|-------|
| `radius.sm` | Inputs, badges (4px) |
| `radius.md` | Cards, buttons (8px) |
| `radius.lg` | Modals, panels (12px) |
| `radius.full` | Pills, avatar circles |

**Validation:**
- All color token pairings used for text on background must meet WCAG 2.1 AA contrast ratio (≥ 4.5:1 for normal text, ≥ 3:1 for large text and UI components)
- No raw hex colors or RGB values may appear in component source files — tokens only
- Token file must be the single source of truth; no hardcoded design values in components

**Error States / Violations:**

| Violation | Severity | Enforcement |
|-----------|----------|-------------|
| Raw color in component | High | Lint rule (custom ESLint plugin or code review gate) |
| Contrast ratio failure | Critical | Automated axe-core check in CI |
| Missing token for new design element | Medium | PR review checklist |

---

### UX-04: Interactive Element States

**Process:**
1. Every interactive element (button, link, input, checkbox, radio, select, card with action, icon button) must implement all four states.
2. State transitions must use CSS transitions, not instant changes.

**Required States per Interactive Element:**

| State | Trigger | Visual Treatment |
|-------|---------|-----------------|
| Default | No interaction | Base token styles |
| Hover | Mouse over | Subtle background shift, optional shadow lift; `transition: 150ms ease` |
| Focus | Keyboard focus or click focus | Visible focus ring using `color.border.focus`; `outline-offset: 2px`; NEVER suppressed |
| Active | Mouse/touch pressed | Slight scale reduction (`scale-[0.98]`) or color darken; `transition: 75ms ease` |
| Disabled | `disabled` prop | `opacity: 0.5`; `cursor: not-allowed`; no hover/focus ring; ARIA `disabled` set |
| Loading | Async action pending | Spinner inside button (not skeleton); button disabled during load |

**Button Variants:**

| Variant | Use Case |
|---------|---------|
| `primary` | Main CTA (one per page section) |
| `secondary` | Supporting action |
| `ghost` | Tertiary actions, inline controls |
| `danger` | Destructive actions (reject, delete) — requires confirmation dialog |
| `icon` | Icon-only; must have `aria-label` |

**Transition Timing:**
- Hover: `150ms ease-in-out`
- Focus ring appearance: immediate (no transition) — per WCAG
- Active press: `75ms ease`
- Page-level transitions: `200ms ease-in-out`

**Validation:**
- All interactive elements must be testable for hover, focus, and active states in Storybook or equivalent
- Disabled elements must not receive focus (tabIndex=-1) or trigger click handlers

---

### UX-03: Skeleton Screen Loading States

**Process:**
1. When a page-level data fetch is initiated (e.g., route navigation, initial load), the page renders a skeleton immediately.
2. The skeleton matches the layout of the actual content: same number of rows, same column widths, same card dimensions.
3. Skeleton blocks use an animated shimmer effect (CSS gradient animation, `1.5s` cycle).
4. When data resolves, skeleton is replaced by actual content (no flash; data-driven swap).
5. If data fetch fails, skeleton is replaced by an error state with retry action.

**Skeleton Usage Rules:**
- Page-level content loads → skeleton screen (NOT a spinner or blank page)
- Component-level updates (e.g., single card refresh after action) → inline spinner or optimistic UI
- Form submission → button loading state (spinner within button); form remains visible
- Instant actions (< 200ms) → no skeleton or spinner (avoid flicker)

**Skeleton Specification:**

| View | Skeleton Elements |
|------|------------------|
| Application List | 5–8 application card skeletons with title, badge, and timestamp placeholders |
| Application Detail | Header area, two-column layout with form fields and document list placeholders |
| Dashboard | Summary stat card placeholders (3–4 cards), list skeleton below |
| Reviewer Queue | Table skeleton with 8–10 row placeholders |
| Messaging Panel | 5–6 message bubble placeholders alternating sides |

**Validation:**
- Skeleton must be visible for a minimum of 200ms even if data resolves faster (prevents jarring flash)
- Skeleton must not be used for sub-200ms interactions
- Shimmer animation must respect `prefers-reduced-motion` media query — use static placeholder (no animation) if set

**Error States:**

| Scenario | UI Response |
|----------|------------|
| Data fetch fails (network error) | Replace skeleton with error card: icon + "Failed to load. Try again." + Retry button |
| Data fetch fails (401) | Replace skeleton with session expiry message; redirect to `/login` after 3 seconds |
| Data fetch times out (> 10s) | Show timeout error with retry; log error to monitoring |

**Schema Surface (this feature):** No database entities — frontend only.
**API Surface (this feature):** Design system has no API endpoints.
