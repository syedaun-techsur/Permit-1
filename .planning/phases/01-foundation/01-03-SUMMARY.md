---
phase: 01-foundation
plan: "03"
subsystem: ui
tags: [tailwindcss, react, typescript, design-tokens, lucide-react, playwright]

# Dependency graph
requires: []
provides:
  - Custom Tailwind config with full UX-05 design token set (brand, surface, text, border, status, feedback colors)
  - Typography tokens: heading-xl/lg/md, body-md/sm, label, caption, code (30px-12px scale)
  - Spacing scale (4px base), border-radius (sm/md/lg/full), box-shadow (sm/md/lg), shimmer animation
  - Button component: 5 variants (primary/secondary/ghost/danger/icon) with loading (Loader2) and disabled states
  - Input component: label/error/helpText, aria-invalid, focus ring, disabled state
  - Card, Badge (12 variants incl permit statuses), Modal (focus trap + ESC), Toast (auto-dismiss + aria-live), Skeleton (shimmer)
  - TypeScript types: User, UserRole, AuthState, LoginRequest, RegisterRequest, AuthResponse, ApiError
  - Playwright config + 4 design-system E2E tests
affects:
  - 01-foundation/01-04 (auth pages use all UI primitives)
  - All subsequent phases (every feature page imports from components/ui/)

# Tech tracking
tech-stack:
  added:
    - tailwindcss@3.4.1 (custom tokens, shimmer animation)
    - lucide-react@0.344.0 (Loader2, X, CheckCircle, AlertCircle, AlertTriangle, Info icons)
    - @playwright/test@1.42.1 (E2E test framework)
  patterns:
    - Design token → Tailwind utility class mapping (bg-brand-primary, text-text-primary, etc.)
    - React.forwardRef pattern for form components (Button, Input)
    - Component index.ts barrel exports for clean imports
    - skeleton-shimmer CSS class with prefers-reduced-motion override in globals.css

key-files:
  created:
    - frontend/tailwind.config.ts
    - frontend/postcss.config.js
    - frontend/src/styles/globals.css
    - frontend/src/types/auth.types.ts
    - frontend/src/types/permit.types.ts
    - frontend/src/components/ui/Button/Button.tsx
    - frontend/src/components/ui/Button/index.ts
    - frontend/src/components/ui/Input/Input.tsx
    - frontend/src/components/ui/Input/index.ts
    - frontend/src/components/ui/Card/Card.tsx
    - frontend/src/components/ui/Card/index.ts
    - frontend/src/components/ui/Badge/Badge.tsx
    - frontend/src/components/ui/Badge/index.ts
    - frontend/src/components/ui/Modal/Modal.tsx
    - frontend/src/components/ui/Modal/index.ts
    - frontend/src/components/ui/Toast/Toast.tsx
    - frontend/src/components/ui/Toast/index.ts
    - frontend/src/components/ui/Skeleton/Skeleton.tsx
    - frontend/src/components/ui/Skeleton/index.ts
    - frontend/src/main.tsx
    - frontend/src/App.tsx
    - frontend/index.html
    - frontend/playwright.config.ts
    - e2e/design-system.spec.ts
  modified: []

key-decisions:
  - "Removed explicit React import from App.tsx — React 17+ JSX transform with noUnusedLocals strict mode makes bare import a TS error"
  - "Badge.tsx imports removed PermitStatus type from permit.types.ts — using inline union type instead to avoid circular dep risk; permit.types.ts kept as placeholder for future phases"
  - "Playwright E2E tests written but not executed — per execute-phase boundary rule, test execution is deferred to verify phase"

patterns-established:
  - "Design tokens: all Tailwind utilities are prefixed with semantic name (brand-, surface-, text-, border-, status-, feedback-)"
  - "Component exports: each component directory has an index.ts barrel; import as `import { Button } from '../Button'`"
  - "Interactive state pattern: default → hover (150ms) → focus (ring-2 ring-border-focus) → active (scale-[0.98] 75ms) → disabled (opacity-50 cursor-not-allowed)"
  - "Skeleton shimmer: use .skeleton-shimmer CSS class from globals.css (not Tailwind animate-pulse); respects prefers-reduced-motion"

# Metrics
duration: 4min
completed: 2026-07-22
---

# Phase 1 Plan 03: Design System Foundation Summary

**Custom Tailwind design token system with 7 React UI primitives (Button, Input, Card, Badge, Modal, Toast, Skeleton), TypeScript auth domain types, and Playwright E2E test infrastructure**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-22T16:34:11Z
- **Completed:** 2026-07-22T16:38:52Z
- **Tasks:** 3
- **Files modified:** 24

## Accomplishments

- Complete Tailwind token system: 6 color groups (brand/surface/text/border/status/feedback), 8 typography sizes, 4px-base spacing, border-radius scale, box-shadow scale, shimmer keyframe animation
- Seven UI primitive components using design tokens: Button (5 variants + loading + disabled), Input (label/error/helpText/a11y), Card, Badge (12 variants incl all permit statuses), Modal (focus trap + ESC), Toast (auto-dismiss + aria-live), Skeleton (shimmer + reduced-motion)
- TypeScript auth types: User, UserRole (APPLICANT/REVIEWER/ADMIN), AuthState, LoginRequest, RegisterRequest, AuthResponse, ApiError — shared contract for auth pages and API client
- Playwright config + 4 E2E tests verifying design token correctness (brand-primary resolves to #2563EB)

## Tailwind Token Reference

Import pattern: `import { Button } from '../components/ui/Button'`

### Color Tokens

| Class | Value | Use |
|-------|-------|-----|
| `bg-brand-primary` / `text-brand-primary` | #2563EB | Primary CTAs, links |
| `bg-brand-secondary` | #7C3AED | Purple accent |
| `bg-surface-base` | #F8FAFC | Page background |
| `bg-surface-card` | #FFFFFF | Card backgrounds |
| `bg-surface-sidebar` | #F1F5F9 | Sidebar / hover states |
| `text-text-primary` | #0F172A | Body text (12.6:1 contrast) |
| `text-text-secondary` | #475569 | Secondary text (5.9:1 contrast) |
| `text-text-disabled` | #94A3B8 | Disabled text |
| `border-border-default` | #E2E8F0 | Default borders |
| `border-border-focus` | #2563EB | Focus ring color |
| `text-status-draft/submitted/under_review/additional_info/approved/rejected` | Various | Permit status colors |
| `text-feedback-error/warning/success` | #DC2626 / #D97706 / #16A34A | Feedback states |

### Typography Tokens

| Class | Size/Weight | Use |
|-------|-------------|-----|
| `text-heading-xl` | 30px/700 | Page headings |
| `text-heading-lg` | 24px/600 | Section headings |
| `text-heading-md` | 20px/600 | Card headings |
| `text-body-md` | 16px/400 | Body text |
| `text-body-sm` | 14px/400 | Secondary text |
| `text-label` | 14px/500 | Form labels |
| `text-caption` | 12px/400 | Captions, badges |

### Component API Reference

#### Button
```tsx
<Button variant="primary|secondary|ghost|danger|icon" size="sm|md|lg" loading={bool} disabled={bool}
  leftIcon={<Icon />} rightIcon={<Icon />}>
  Label
</Button>
```

#### Input
```tsx
<Input label="Email" error="Required" helpText="Enter your work email" placeholder="..." disabled />
```

#### Card
```tsx
<Card padding="none|sm|md|lg" className="...">Content</Card>
```

#### Badge
```tsx
<Badge variant="draft|submitted|under_review|additional_info|approved|rejected|default|primary|success|warning|error|info">
  Status
</Badge>
```

#### Modal
```tsx
<Modal open={bool} onClose={() => setOpen(false)} title="Optional Title" size="sm|md|lg">
  Content
</Modal>
```

#### Toast
```tsx
<Toast id="unique-id" type="success|error|warning|info" message="..." duration={5000} onDismiss={(id) => remove(id)} />
```

#### Skeleton
```tsx
<Skeleton lines={3} height="h-4" className="..." />
```

## Task Commits

Each task was committed atomically:

1. **Task 1: Tailwind design token config + global CSS** - `7bf9b1a` (feat)
2. **Task 2: UI primitive components + auth types** - `15abbcc` (feat)
3. **Task 3: Playwright setup + design system E2E tests** - `4cac08a` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified

- `frontend/tailwind.config.ts` — Complete UX-05 design token system as Tailwind theme.extend
- `frontend/postcss.config.js` — PostCSS config with tailwindcss + autoprefixer
- `frontend/src/styles/globals.css` — @tailwind directives, Inter font, skeleton-shimmer, focus-ring, prefers-reduced-motion
- `frontend/src/types/auth.types.ts` — User, UserRole, AuthState, LoginRequest, RegisterRequest, AuthResponse, ApiError
- `frontend/src/types/permit.types.ts` — PermitStatus type placeholder
- `frontend/src/components/ui/Button/Button.tsx` — 5 variants, loading (Loader2), disabled, active:scale-[0.98]
- `frontend/src/components/ui/Input/Input.tsx` — label/error/helpText, aria-invalid, focus ring
- `frontend/src/components/ui/Card/Card.tsx` — padding variants, design token classes
- `frontend/src/components/ui/Badge/Badge.tsx` — 12 variants incl all permit statuses
- `frontend/src/components/ui/Modal/Modal.tsx` — focus trap, ESC key, role=dialog aria-modal=true
- `frontend/src/components/ui/Toast/Toast.tsx` — auto-dismiss 5s, aria-live=polite, 4 types with icons
- `frontend/src/components/ui/Skeleton/Skeleton.tsx` — skeleton-shimmer, multi-line, aria-busy
- `frontend/src/main.tsx` — React 18 root with BrowserRouter
- `frontend/src/App.tsx` — Minimal app entry point using design tokens
- `frontend/index.html` — HTML entry point with correct title
- `frontend/playwright.config.ts` — Playwright config pointing to e2e/, webServer: npm run dev
- `e2e/design-system.spec.ts` — 4 E2E tests: render, title, font, brand-primary color

## Decisions Made

1. **No explicit React import in App.tsx** — React 17+ JSX transform is configured in tsconfig.json (`"jsx": "react-jsx"`); with `"noUnusedLocals": true`, a bare `import React` is a TS error. All other components that use React types explicitly import it.
2. **Badge uses inline union type** — Removed `import type { PermitStatus }` from Badge to avoid tight coupling; Badge uses its own comprehensive variant union which includes all permit status values.
3. **E2E tests written but not run** — Per execute-phase boundary (test_execution_boundary rule), E2E/browser tests are written as deliverables and execution is deferred to the verify phase.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused React import causing TypeScript error in App.tsx**
- **Found during:** Task 3 (TypeScript compilation check)
- **Issue:** `App.tsx` had `import React from 'react'` but with React 17+ JSX transform and `noUnusedLocals: true`, this triggers TS6133 error
- **Fix:** Removed explicit React import; React.forwardRef users keep their imports as those reference React namespace directly
- **Files modified:** frontend/src/App.tsx
- **Verification:** `npx tsc --noEmit` returns clean (no errors)
- **Committed in:** 4cac08a (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor TypeScript strict mode fix. No scope change or architectural impact.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Design system foundation complete; all 7 UI primitives ready for use in auth pages (Plan 01-04)
- Import pattern established: `import { Button } from '../components/ui/Button'`
- E2E test infrastructure configured; Playwright tests ready to run via verify phase
- Plan 01-01 (infrastructure) and Plan 01-02 (backend auth API) should be executed before Plan 01-04 (auth pages) which depends on them

---
*Phase: 01-foundation*
*Completed: 2026-07-22*

## Self-Check: PASSED

All key files exist on disk:
- ✅ frontend/tailwind.config.ts
- ✅ frontend/src/styles/globals.css
- ✅ frontend/src/components/ui/Button/Button.tsx
- ✅ frontend/src/components/ui/Input/Input.tsx
- ✅ frontend/src/components/ui/Skeleton/Skeleton.tsx
- ✅ frontend/src/types/auth.types.ts
- ✅ frontend/playwright.config.ts
- ✅ e2e/design-system.spec.ts

All task commits found:
- ✅ 7bf9b1a feat(01-03): Tailwind design token config + global CSS
- ✅ 15abbcc feat(01-03): UI primitive components + auth types
- ✅ 4cac08a feat(01-03): Playwright config + design system E2E tests
