---
phase: 01-foundation
plan: "04"
subsystem: auth
tags: [react, zustand, axios, jwt, react-hook-form, zod, react-router, playwright]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "POST /auth/login, /auth/refresh, /auth/logout, /auth/register, /auth/forgot-password, /auth/reset-password endpoints"
  - phase: 01-foundation
    provides: "Button, Input, Card, Toast UI primitives + UserRole/User/AuthState types"
provides:
  - "useAuthStore: Zustand auth store with user/accessToken in memory (no localStorage)"
  - "apiClient: Axios instance with JWT Bearer attach + 401 silent refresh interceptor"
  - "authApi: typed wrappers for all /auth/* endpoints"
  - "useAuth: hook with handleLogin/handleRegister/handleLogout + role-based navigation"
  - "ProtectedRoute: redirects unauthenticated users to /login"
  - "RoleGuard: renders 403 for wrong-role access"
  - "AppRouter: lazy-loaded auth pages + protected dashboard route stubs"
  - "LoginPage, RegisterPage: React Hook Form + Zod validated auth pages"
  - "ForgotPasswordPage, ResetPasswordPage: password reset flow (anti-enumeration)"
  - "AppShell, TopBar, Sidebar: application layout with logout button"
  - "e2e/auth.spec.ts: 11 Playwright E2E tests for full auth flow"
affects: [01-05, 02-applicant-portal, 03-reviewer-portal, 05-admin]

# Tech tracking
tech-stack:
  added:
    - "@hookform/resolvers ^3.10.0 (Zod resolver for React Hook Form)"
  patterns:
    - "Zustand store pattern: create<StoreType>() with no persist() — token stays in JS heap only"
    - "Axios JWT pattern: separate apiClient instance, request interceptor attaches Bearer, response interceptor handles 401 refresh with failedQueue dedup"
    - "Protected route pattern: ProtectedRoute + RoleGuard compose around route elements"
    - "Auth form pattern: useForm({ resolver: zodResolver(schema) }) with Input error prop"
    - "Anti-enumeration: ForgotPasswordPage always shows success regardless of email existence"

key-files:
  created:
    - frontend/src/store/auth.store.ts
    - frontend/src/store/ui.store.ts
    - frontend/src/api/client.ts
    - frontend/src/api/auth.api.ts
    - frontend/src/hooks/useAuth.ts
    - frontend/src/router/index.tsx
    - frontend/src/router/ProtectedRoute.tsx
    - frontend/src/router/RoleGuard.tsx
    - frontend/src/pages/auth/LoginPage.tsx
    - frontend/src/pages/auth/RegisterPage.tsx
    - frontend/src/pages/auth/ForgotPasswordPage.tsx
    - frontend/src/pages/auth/ResetPasswordPage.tsx
    - frontend/src/components/layout/AppShell.tsx
    - frontend/src/components/layout/Sidebar.tsx
    - frontend/src/components/layout/TopBar.tsx
    - frontend/src/vite-env.d.ts
    - e2e/auth.spec.ts
  modified:
    - frontend/src/App.tsx (wired AppRouter + global toast container)
    - frontend/package.json (added @hookform/resolvers)

key-decisions:
  - "Access token in Zustand memory only — no localStorage/sessionStorage (XSS risk mitigation)"
  - "failedQueue pattern in Axios interceptor: prevents multiple simultaneous refresh calls on concurrent 401s"
  - "ForgotPasswordPage always shows success: matches backend anti-enumeration (always 200)"
  - "Removed unused React imports in App.tsx and router/index.tsx — React 17+ JSX transform + noUnusedLocals strict mode"
  - "vite-env.d.ts added: missing Vite env type reference for import.meta.env TypeScript support"

patterns-established:
  - "Import pattern for ProtectedRoute: import { ProtectedRoute } from '../router/ProtectedRoute'"
  - "Import pattern for RoleGuard: import { RoleGuard } from '../router/RoleGuard'"
  - "Adding protected route: wrap element with <ProtectedRoute><RoleGuard allowedRoles={[UserRole.ADMIN]}>...</RoleGuard></ProtectedRoute>"
  - "Zustand access outside React: useAuthStore.getState().accessToken (used in Axios interceptor)"
  - "useAuth hook pattern: const { user, isAuthenticated, handleLogin, handleLogout } = useAuth()"

# Metrics
duration: 3min
completed: 2026-07-22
---

# Phase 1 Plan 04: Frontend Auth Layer Summary

**React auth layer: Zustand in-memory token store, Axios JWT interceptor with silent refresh + failedQueue dedup, 4 auth pages with React Hook Form + Zod, ProtectedRoute/RoleGuard, AppShell layout, and 11 Playwright E2E tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-22T17:00:29Z
- **Completed:** 2026-07-22T17:04:28Z
- **Tasks:** 3
- **Files modified:** 19

## Accomplishments

- Zustand auth store: accessToken lives in JS heap only (no localStorage, mitigates XSS token theft)
- Axios client with dual interceptors: request attaches Bearer token, response interceptor silently refreshes on 401 with failedQueue dedup preventing duplicate refresh calls
- ProtectedRoute + RoleGuard: full role-based access control at route level with 403 page for wrong-role access
- 4 auth pages with React Hook Form + Zod validation matching backend DTO rules: LoginPage, RegisterPage, ForgotPasswordPage (anti-enumeration), ResetPasswordPage
- AppShell layout: TopBar (user info + logout) + Sidebar + main content area
- 11 Playwright E2E tests covering: login, invalid creds, form validation, register, forgot-password, protected routes, logout flow

## Route + Import Reference

```tsx
// ProtectedRoute — blocks unauthenticated access
import { ProtectedRoute } from '../router/ProtectedRoute';
<Route path="/feature" element={<ProtectedRoute><FeaturePage /></ProtectedRoute>} />

// RoleGuard — blocks wrong-role access (renders 403)
import { RoleGuard } from '../router/RoleGuard';
import { UserRole } from '../types/auth.types';
<ProtectedRoute><RoleGuard allowedRoles={[UserRole.ADMIN]}><AdminPage /></RoleGuard></ProtectedRoute>

// useAuthStore — Zustand store (React and non-React contexts)
import { useAuthStore } from '../store/auth.store';
const { user, isAuthenticated } = useAuthStore();          // React hook
const token = useAuthStore.getState().accessToken;         // Outside React (e.g. Axios interceptor)

// apiClient — all API requests go through this instance
import { apiClient } from '../api/client';
const data = await apiClient.get('/some/endpoint').then(r => r.data);

// useAuth — login/register/logout with navigation
import { useAuth } from '../hooks/useAuth';
const { user, isAuthenticated, isLoading, handleLogin, handleRegister, handleLogout } = useAuth();
```

## Task Commits

Each task was committed atomically:

1. **Task 1: Zustand stores + Axios client + auth API + useAuth hook** - `49029a8` (feat)
2. **Task 2: Auth pages + protected routing + AppShell + App.tsx** - `03090ba` (feat)
3. **Task 3: Playwright E2E auth tests** - `b50df91` (feat)

**Plan metadata:** _(this SUMMARY commit)_ (docs: complete plan)

## Files Created/Modified

- `frontend/src/store/auth.store.ts` — Zustand auth store: user/accessToken/isAuthenticated/isLoading + login/logout/setAccessToken/setLoading actions
- `frontend/src/store/ui.store.ts` — Zustand UI store: toast queue with addToast/dismissToast
- `frontend/src/api/client.ts` — Axios instance: withCredentials, Bearer attach interceptor, 401 refresh interceptor with failedQueue dedup
- `frontend/src/api/auth.api.ts` — Typed wrappers: register, login, refresh, logout, forgotPassword, resetPassword, getMe
- `frontend/src/hooks/useAuth.ts` — handleLogin/handleRegister/handleLogout with role-based navigation, error toasts
- `frontend/src/router/ProtectedRoute.tsx` — Redirects unauthenticated to /login (preserves from-location)
- `frontend/src/router/RoleGuard.tsx` — Renders 403 for wrong-role users
- `frontend/src/router/index.tsx` — AppRouter with lazy-loaded auth pages + protected dashboard stubs
- `frontend/src/pages/auth/LoginPage.tsx` — Login form (email + password, Zod validation, forgot password link)
- `frontend/src/pages/auth/RegisterPage.tsx` — Registration form (fullName/email/password/confirmPassword with strong password rules)
- `frontend/src/pages/auth/ForgotPasswordPage.tsx` — Always shows success after submit (anti-enumeration)
- `frontend/src/pages/auth/ResetPasswordPage.tsx` — Token from ?token= query param, same strong password rules
- `frontend/src/components/layout/AppShell.tsx` — TopBar + Sidebar + main content layout
- `frontend/src/components/layout/TopBar.tsx` — PermitFlow wordmark + user info + Log Out button
- `frontend/src/components/layout/Sidebar.tsx` — Navigation sidebar (placeholder — expanded in later phases)
- `frontend/src/vite-env.d.ts` — Vite env type reference for import.meta.env
- `frontend/src/App.tsx` — AppRouter + global toast container (rewritten from placeholder)
- `frontend/package.json` — Added @hookform/resolvers
- `e2e/auth.spec.ts` — 11 Playwright E2E tests covering full auth flow

## Decisions Made

1. **Access token in Zustand memory only**: No `persist()` middleware on auth store — token lives in JS heap. Refresh token is in httpOnly cookie (server-set). On page reload, user must re-authenticate (or silent refresh succeeds if cookie valid).
2. **failedQueue dedup pattern**: Prevents multiple concurrent /auth/refresh calls when multiple 401s arrive simultaneously — queues retries until single in-flight refresh completes.
3. **Anti-enumeration on ForgotPassword**: Frontend always shows success after form submit, matching backend behavior (POST /auth/forgot-password returns 200 regardless of email existence).
4. **Removed unused React imports**: App.tsx and router/index.tsx don't use React namespace — React 17+ JSX transform handles JSX without explicit import; `noUnusedLocals: true` makes unused import a TS error.
5. **vite-env.d.ts added**: Required for `import.meta.env` TypeScript recognition; was missing from the Plan 01-03 scaffold.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused React imports causing TypeScript errors**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** `App.tsx` and `router/index.tsx` imported `React` from 'react' but with React 17+ JSX transform and `noUnusedLocals: true`, this triggers TS6133 errors
- **Fix:** Removed `import React from 'react'` from App.tsx; changed `import React, { Suspense, lazy }` to `import { Suspense, lazy }` in router/index.tsx
- **Files modified:** frontend/src/App.tsx, frontend/src/router/index.tsx
- **Verification:** `npx tsc --noEmit` returns clean output
- **Committed in:** 03090ba (Task 2 commit)

**2. [Rule 3 - Blocking] Added missing vite-env.d.ts for import.meta.env TypeScript support**
- **Found during:** Task 1 (TypeScript compilation check)
- **Issue:** `import.meta.env.VITE_API_URL` in client.ts triggered `TS2339: Property 'env' does not exist on type 'ImportMeta'` — Vite's client type reference file was missing from the scaffold
- **Fix:** Created `frontend/src/vite-env.d.ts` with `/// <reference types="vite/client" />`
- **Files modified:** frontend/src/vite-env.d.ts (new)
- **Verification:** `npx tsc --noEmit` returns clean output
- **Committed in:** 49029a8 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes are TypeScript strict mode correctness requirements. No scope change or behavioral impact. Plan executed exactly as specified otherwise.

## Issues Encountered

None — both deviations were caught during TypeScript compile checks and auto-fixed.

## User Setup Required

None — no external service configuration required. All services are self-hosted via docker-compose.

## Next Phase Readiness

- Complete authentication UI layer: login, register, forgot-password, reset-password all wired to backend
- ProtectedRoute + RoleGuard ready for all future feature plans that add protected pages
- AppShell layout ready — Sidebar will be expanded in later phases with feature-specific nav items
- E2E test infrastructure configured (auth.spec.ts + design-system.spec.ts); tests ready to run via verify phase
- Phase 1 Foundation complete: infrastructure (01-01) + backend auth (01-02) + design system (01-03) + frontend auth (01-04)
- Ready for Phase 2: Applicant Portal

---
*Phase: 01-foundation*
*Completed: 2026-07-22*
