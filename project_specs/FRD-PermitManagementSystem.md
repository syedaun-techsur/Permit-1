# Functional Requirements Document: Permit Management System

**Document Type:** Functional Requirements Document (FRD)
**Project:** Permit Management System
**Acronym:** PMS
**Version:** 1.0
**Date:** 2026-07-21
**Status:** Draft
**Source PRD:** `project_specs/PRD-PermitManagementSystem.md` v1.0
**Coverage:** 40 v1 requirements across 10 features and 5 delivery phases

---

## Scope

This document specifies the functional behavior of the Permit Management System v1. It translates every PRD feature (F0–F9) and associated requirement (AUTH-01–05, PERM-01–07, DOCS-01–05, STAT-01–07, MSG-01–04, DASH-01–04, ADMN-01–03, UX-01–05) into precise inputs, outputs, validation rules, process steps, error states, API surface, and database schema. It is the primary reference for implementation and does not repeat product vision or rationale beyond what is necessary for unambiguous engineering.

---

## Table of Contents

| Chunk | Feature | Requirements |
|-------|---------|-------------|
| [F00 Authentication & User Management](#f00) | AUTH-01–05 | Phase 1 |
| [F01 Design System & UI Foundation](#f01) | UX-03, UX-04, UX-05 | Phase 1 |
| [F02 Permit Application Submission](#f02) | PERM-01–04 | Phase 2 |
| [F03 Document Management](#f03) | DOCS-01–05 | Phase 2→3 |
| [F04 Permit Status Tracking & Lifecycle](#f04) | STAT-01–07 | Phase 2→3 |
| [F05 Integrated Messaging](#f05) | MSG-01–04 | Phase 3 |
| [F06 Reviewer Workflow](#f06) | PERM-05–06, STAT-03–04, STAT-06 | Phase 3 |
| [F07 Role-Specific Dashboards](#f07) | DASH-01–04 | Phase 4 |
| [F08 Admin Controls](#f08) | PERM-07, ADMN-01–03 | Phase 5 |
| [F09 Accessibility & Responsive Design](#f09) | UX-01, UX-02 | Phase 2→5 |
| [Y0 Database Schema](#y0) | All entities | — |
| [Y1 API Endpoints](#y1) | All endpoints | — |
| [Y2 Error Catalog](#y2) | Cross-feature errors | — |
| [Y3 Integration Points](#y3) | External systems | — |

---

## Conventions

- **Requirement IDs** follow the pattern `AREA-NN` (e.g., `AUTH-01`). Each is mapped to a PRD feature `F{n}`.
- **HTTP status codes** use standard RFC 7231 semantics.
- **Error codes** are `SCREAMING_SNAKE_CASE` strings returned in the API `error.code` field.
- **Process steps** are numbered. Where a step involves a conditional branch, sub-steps are lettered (e.g., 3a, 3b).
- **Must / Shall** — non-negotiable constraint. **Should** — strong preference, deviation requires justification. **May** — permitted but optional.
- **Actor labels:** `[Applicant]`, `[Reviewer]`, `[Admin]`, `[System]` identify who triggers each action.
- **Role precedence:** Admin ⊃ Reviewer ⊃ Applicant (Admin can perform any action available to lower roles unless otherwise stated).
- **All timestamps** are stored and returned in ISO 8601 UTC format.
- **File references:** Cross-feature DDL lives in `Y0-schema.md`; full API specs in `Y1-api.md`; error catalog in `Y2-errors.md`; external integrations in `Y3-integrations.md`.

---

## Shared Terminology

| Term | Definition |
|------|-----------|
| **Applicant** | A user with role `applicant`; submits and tracks permit applications |
| **Reviewer** | A user with role `reviewer`; evaluates, actions, and decides on permit applications |
| **Admin** | A user with role `admin`; manages users, assignments, and has system-wide visibility |
| **Permit Application** | A structured record representing a request for a municipal/government permit |
| **Lifecycle Stage** | One of seven ordered states a permit application can occupy: `draft`, `submitted`, `under_review`, `additional_info_needed`, `approved`, `rejected` |
| **JWT** | JSON Web Token; access token with 15-minute expiry used to authenticate API requests |
| **Refresh Token** | Long-lived token (7-day expiry) stored in an HTTP-only cookie; used to obtain new access tokens |
| **RBAC** | Role-Based Access Control; API-layer enforcement that returns 401/403 for unauthorized access |
| **Draft** | A permit application saved but not yet submitted; visible only to the creating applicant |
| **Presigned URL** | A time-limited signed URL granting access to a file in object storage (S3-compatible) |
| **Audit Log** | Append-only, read-only record of every status transition, admin action, and key system event |
| **Skeleton Screen** | A loading state that renders a placeholder matching the layout of the content being loaded |
| **Design Token** | A named variable representing a design decision (color, spacing, shadow) applied consistently across the UI |
| **WCAG 2.1 AA** | Web Content Accessibility Guidelines, Level AA — the accessibility compliance target for all UI |
| **In-App Notification** | A real-time alert surfaced within the application UI (not email); triggered by status changes and new messages |
| **Soft Delete** | Marking a record as inactive (`is_active = false`) rather than physically removing it from the database |

---

*Generated: 2026-07-21 · FRD v1.0 for Permit Management System*
---

## F00: Authentication & User Management {#f00}

**PRD Feature:** F0 · **Phase:** 1 — Foundation · **Priority:** P0
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05

### Description

This feature provides all account lifecycle operations: registration, login, session persistence, logout, and password recovery. Every user is assigned exactly one role (`applicant`, `reviewer`, or `admin`) that governs all downstream data access and UI capabilities. Authentication state is maintained via JWT access tokens (short-lived) and HTTP-only refresh tokens (long-lived). The API layer enforces RBAC on every protected endpoint — no role-inappropriate data is served regardless of frontend state.

### Terminology

- **Access Token:** A JWT signed by the server; contains `userId`, `role`, `exp` (15 min). Sent in `Authorization: Bearer` header.
- **Refresh Token:** An opaque token stored in an HTTP-only `Secure` cookie; 7-day sliding expiry. Used only on `POST /auth/refresh`.
- **Password Reset Token:** A short-lived (1-hour), single-use token embedded in the password reset email link.
- **Role Assignment:** Applicants self-register and receive the `applicant` role by default. Reviewer and Admin roles are assigned by an Admin via the user management interface (ADMN-01).

### Sub-features

- **AUTH-01** — Account registration with email and password
- **AUTH-02** — Login with persistent session via refresh token
- **AUTH-03** — Logout from any page (revokes refresh token)
- **AUTH-04** — Password reset via email link
- **AUTH-05** — RBAC enforcement at the API layer

---

### AUTH-01: Account Registration

**Process:**
1. `[Applicant]` navigates to `/register`.
2. `[Applicant]` submits the registration form with `email`, `password`, `confirmPassword`, `fullName`.
3. `[System]` validates inputs (see Validation below).
4. `[System]` checks that `email` is not already registered.
5. `[System]` hashes password using bcrypt (cost factor ≥ 12).
6. `[System]` creates a new `users` record with `role = 'applicant'` and `is_active = true`.
7. `[System]` issues an access token and refresh token.
8. `[System]` returns `201 Created` with the access token and user object; sets refresh token in HTTP-only cookie.
9. `[System]` redirects the user to the applicant dashboard.

**Inputs:**
- `email` (string, required): User's email address
- `password` (string, required): Chosen password
- `confirmPassword` (string, required): Must match `password`
- `fullName` (string, required): User's display name

**Outputs:**
- `201 Created`: `{ accessToken: string, user: { id, email, fullName, role } }`
- HTTP-only cookie: `refreshToken` (Secure, SameSite=Strict)

**Validation:**
- `email` must be a valid email format (RFC 5322)
- `email` must not already exist in the `users` table
- `password` must be 8–128 characters
- `password` must contain at least one uppercase letter, one lowercase letter, one digit, and one special character
- `confirmPassword` must exactly match `password`
- `fullName` must be 1–100 characters; non-empty after trimming

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Email already registered | 409 | EMAIL_ALREADY_EXISTS | "An account with this email already exists." |
| Password does not meet complexity | 422 | PASSWORD_TOO_WEAK | "Password must be 8–128 characters with uppercase, lowercase, digit, and special character." |
| Passwords do not match | 422 | PASSWORD_MISMATCH | "Passwords do not match." |
| Invalid email format | 422 | INVALID_EMAIL | "Please enter a valid email address." |
| Missing required field | 422 | VALIDATION_ERROR | "Field '{field}' is required." |
| Server error during user creation | 500 | REGISTRATION_FAILED | "Registration failed. Please try again." |

---

### AUTH-02: Login & Session Persistence

**Process:**
1. `[User]` navigates to `/login`.
2. `[User]` submits `email` and `password`.
3. `[System]` looks up the user by `email`.
4. `[System]` checks `is_active = true`.
5. `[System]` verifies the submitted password against the stored bcrypt hash.
6. `[System]` issues a new JWT access token (15 min expiry) and a refresh token (7-day sliding expiry).
7. `[System]` returns `200 OK` with access token; sets refresh token in HTTP-only cookie.
8. `[System]` redirects to the user's role-appropriate dashboard.

**Session Persistence:**
- On subsequent page loads or app restarts, the frontend checks for a valid access token in memory.
- If the access token is expired or absent, the frontend silently calls `POST /auth/refresh` using the HTTP-only refresh cookie.
- If the refresh token is valid, a new access token is issued and the session continues seamlessly.
- If the refresh token is absent, expired, or revoked, the user is redirected to `/login`.

**Inputs:**
- `email` (string, required)
- `password` (string, required)

**Outputs:**
- `200 OK`: `{ accessToken: string, user: { id, email, fullName, role } }`
- HTTP-only cookie: `refreshToken` (renewed 7-day expiry)

**Validation:**
- Both fields required; neither may be empty

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Email not found | 401 | INVALID_CREDENTIALS | "Invalid email or password." |
| Incorrect password | 401 | INVALID_CREDENTIALS | "Invalid email or password." |
| Account deactivated | 403 | ACCOUNT_INACTIVE | "Your account has been deactivated. Contact support." |
| Missing field | 422 | VALIDATION_ERROR | "Email and password are required." |
| Refresh token expired/revoked | 401 | SESSION_EXPIRED | "Your session has expired. Please log in again." |

> **Security note:** `INVALID_CREDENTIALS` is returned for both "email not found" and "wrong password" to prevent email enumeration.

---

### AUTH-03: Logout

**Process:**
1. `[User]` clicks the "Log Out" action from any page (available in the navigation header).
2. `[System]` calls `POST /auth/logout` with the current refresh token cookie.
3. `[System]` revokes the refresh token (marks as `revoked` in `refresh_tokens` table or deletes the record).
4. `[System]` clears the `refreshToken` HTTP-only cookie (sets `Max-Age=0`).
5. `[System]` clears the access token from frontend memory.
6. `[System]` returns `200 OK`.
7. `[Frontend]` redirects the user to `/login`.

**Inputs:** (none beyond the cookie sent automatically)

**Outputs:**
- `200 OK`: `{ message: "Logged out successfully." }`
- Cookie `refreshToken` cleared

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Refresh token already revoked | 200 | — | Treated as successful logout (idempotent) |
| No cookie present | 200 | — | Treated as successful logout (already signed out) |

---

### AUTH-04: Password Reset

**Process:**
1. `[User]` navigates to `/forgot-password` and submits their `email`.
2. `[System]` looks up the user by email.
3. `[System]` generates a cryptographically random password reset token (URL-safe, 32 bytes).
4. `[System]` stores a hashed version of the token in `password_reset_tokens` with `expires_at = now() + 1 hour` and `used = false`.
5. `[System]` sends a password reset email to the address (see Y3-integrations.md §Email).
6. `[System]` returns `200 OK` regardless of whether the email exists (prevents enumeration).
7. `[User]` clicks the link in the email: `GET /reset-password?token={token}`.
8. `[System]` validates the token: exists, not expired, not already used.
9. `[System]` presents the new password form.
10. `[User]` submits `newPassword` and `confirmPassword`.
11. `[System]` validates password complexity.
12. `[System]` updates the user's password hash.
13. `[System]` marks the reset token as `used = true`.
14. `[System]` revokes all existing refresh tokens for that user.
15. `[System]` returns `200 OK` with success message; redirects to `/login`.

**Inputs (step 1):**
- `email` (string, required)

**Inputs (step 10):**
- `newPassword` (string, required): Same complexity rules as AUTH-01
- `confirmPassword` (string, required): Must match `newPassword`
- `token` (string, required): Extracted from query string

**Outputs:**
- Step 6: `200 OK`: `{ message: "If an account exists with this email, a reset link has been sent." }`
- Step 15: `200 OK`: `{ message: "Password updated successfully. You can now log in." }`

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Token expired | 400 | RESET_TOKEN_EXPIRED | "This password reset link has expired. Please request a new one." |
| Token already used | 400 | RESET_TOKEN_USED | "This password reset link has already been used." |
| Token not found / invalid | 400 | RESET_TOKEN_INVALID | "This password reset link is invalid." |
| Password complexity failure | 422 | PASSWORD_TOO_WEAK | "Password must be 8–128 characters with uppercase, lowercase, digit, and special character." |
| Passwords do not match | 422 | PASSWORD_MISMATCH | "Passwords do not match." |

---

### AUTH-05: Role-Based Access Control (RBAC)

**Process:**
- Every protected API endpoint is decorated with the minimum required role.
- On each request, the API middleware:
  1. Extracts the JWT from the `Authorization: Bearer` header.
  2. Verifies the JWT signature and checks expiry.
  3. Extracts `userId` and `role` from the token payload.
  4. Checks that the user's role meets the endpoint's minimum role requirement.
  5. Attaches `req.user = { id, role }` to the request context.
  6. If any check fails, returns 401 or 403 immediately — no data is returned.

**Role Hierarchy:**

| Role | Can Access |
|------|-----------|
| `applicant` | Own applications, own documents, own messages, own dashboard |
| `reviewer` | All applications (assigned + available pool), all documents on those applications, messaging on those applications, reviewer dashboard |
| `admin` | All of the above + user management, reviewer assignment, audit log, admin dashboard |

**Inputs:** `Authorization: Bearer <accessToken>` header on every protected request.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| No Authorization header | 401 | UNAUTHORIZED | "Authentication required." |
| JWT signature invalid | 401 | TOKEN_INVALID | "Invalid token." |
| JWT expired | 401 | TOKEN_EXPIRED | "Token expired. Please refresh your session." |
| Role insufficient for endpoint | 403 | FORBIDDEN | "You do not have permission to access this resource." |
| User account deactivated (valid token) | 403 | ACCOUNT_INACTIVE | "Your account has been deactivated." |

**Schema Surface:** uses tables `users`, `refresh_tokens`, `password_reset_tokens` — see `Y0-schema.md` §Auth.
**API Surface:** see `Y1-api.md` §Authentication for full request/response schemas.
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
---

## F02: Permit Application Submission {#f02}

**PRD Feature:** F2 · **Phase:** 2 — Applicant Core · **Priority:** P0
**Requirements:** PERM-01, PERM-02, PERM-03, PERM-04

### Description

Applicants create, draft, and submit permit applications through a structured multi-field form. Applications can be saved as drafts at any point and returned to later. Once submitted, the application enters the lifecycle at `submitted` status and becomes visible to reviewers. The application list view provides applicants with an organized overview of all their applications (both drafts and submitted), and the detail view exposes all entered data, documents, lifecycle status, and the messaging panel in a single unified page.

### Terminology

- **Application Form:** The structured data entry interface for creating a permit application.
- **Draft:** An application with `status = 'draft'`; not yet submitted; editable by the applicant.
- **Submitted Application:** An application with `status = 'submitted'` or beyond; the core form fields are locked.
- **Permit Type:** A categorical classification of the permit (e.g., "Construction", "Zoning Variance", "Event Permit", "Demolition").
- **Auto-save:** The system automatically persists draft changes to the backend as the applicant types (debounced, 2-second delay after last keystroke).
- **Inline Validation:** Field-level error messages that appear when a field loses focus (`onBlur`) or on form submission attempt — not only on the final submit click.

### Sub-features

- **PERM-01** — Create and submit a new permit application
- **PERM-02** — Save application as draft; return and complete later
- **PERM-03** — View list of own applications (submitted and draft)
- **PERM-04** — View full application detail

---

### PERM-01: Permit Application Submission

**Process:**
1. `[Applicant]` navigates to "New Application" from the dashboard or application list.
2. `[System]` creates a new application record with `status = 'draft'` and `applicant_id = req.user.id`.
3. `[Applicant]` fills in the application form fields.
4. `[System]` auto-saves changes to the draft record every 2 seconds after the last keystroke (debounced `PATCH /permits/{id}`).
5. `[Applicant]` uploads required documents (see F03).
6. `[Applicant]` clicks "Submit Application".
7. `[System]` runs full-form validation.
8. If validation fails: `[System]` highlights all failing fields with inline errors; does NOT submit.
9. If validation passes:
   a. `[System]` sets `status = 'submitted'` and `submitted_at = now()`.
   b. `[System]` creates an audit log entry: `{ action: 'APPLICATION_SUBMITTED', actor: userId, applicationId, timestamp }`.
   c. `[System]` creates a lifecycle stage entry: `{ stage: 'submitted', enteredAt: now() }`.
   d. `[System]` returns `200 OK` with updated application object.
   e. `[Frontend]` redirects the applicant to the application detail view.

**Inputs:**
- `permitType` (string, required): One of the defined permit type values
- `projectDescription` (string, required): Free-text description of the project
- `siteAddress` (object, required): `{ street, city, state, zipCode }`
  - `street` (string, required)
  - `city` (string, required)
  - `state` (string, required): 2-letter US state code
  - `zipCode` (string, required)
- `contactName` (string, required): Applicant contact name for this project
- `contactPhone` (string, required): Phone number for contact
- `contactEmail` (string, required): Email for project contact
- `estimatedStartDate` (string, optional): ISO 8601 date
- `estimatedValue` (number, optional): Estimated project value in USD (positive number)
- `additionalNotes` (string, optional): Free-form field for extra context (max 2000 characters)

**Outputs:**
- `200 OK` (update draft to submitted): `{ application: ApplicationObject }`
- `201 Created` (new application creation): `{ application: ApplicationObject }`

**ApplicationObject:**
```json
{
  "id": "uuid",
  "status": "submitted",
  "permitType": "Construction",
  "projectDescription": "string",
  "siteAddress": { "street": "", "city": "", "state": "", "zipCode": "" },
  "contactName": "string",
  "contactPhone": "string",
  "contactEmail": "string",
  "estimatedStartDate": "2026-08-01",
  "estimatedValue": 150000,
  "additionalNotes": "string",
  "applicantId": "uuid",
  "submittedAt": "2026-07-21T10:00:00Z",
  "createdAt": "2026-07-21T09:00:00Z",
  "updatedAt": "2026-07-21T10:00:00Z"
}
```

**Validation:**
- `permitType` must be one of: `construction`, `zoning_variance`, `event_permit`, `demolition`, `renovation`, `signage`
- `projectDescription` must be 10–5000 characters
- `siteAddress.street` must be 1–200 characters
- `siteAddress.city` must be 1–100 characters
- `siteAddress.state` must be a valid 2-letter US state code
- `siteAddress.zipCode` must match regex `/^\d{5}(-\d{4})?$/`
- `contactName` must be 1–100 characters
- `contactPhone` must match E.164 or US-formatted phone pattern
- `contactEmail` must be valid email format
- `estimatedStartDate` if provided, must be today or a future date
- `estimatedValue` if provided, must be a positive number ≤ 999,999,999
- `additionalNotes` if provided, must be ≤ 2000 characters
- Application must have at least one document attached before submission is allowed (DOCS-01 dependency)

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Required field missing | 422 | VALIDATION_ERROR | "Field '{field}' is required." |
| Invalid permit type | 422 | INVALID_PERMIT_TYPE | "'{value}' is not a valid permit type." |
| Phone format invalid | 422 | INVALID_PHONE | "Please enter a valid phone number." |
| Address zip invalid | 422 | INVALID_ZIPCODE | "Please enter a valid US ZIP code." |
| No documents attached | 422 | DOCUMENTS_REQUIRED | "At least one document must be attached before submitting." |
| Application not in draft status | 409 | INVALID_STATUS_TRANSITION | "Only draft applications can be submitted." |
| Applicant does not own application | 403 | FORBIDDEN | "You do not have permission to modify this application." |
| Auto-save conflict (concurrent edit) | 409 | CONFLICT | "This application was modified in another session. Refresh to see the latest." |

---

### PERM-02: Draft Save

**Process:**
1. Draft is created automatically when the applicant starts a new application (step 2 in PERM-01 process).
2. Auto-save triggers on every form field change, debounced 2 seconds.
3. `[System]` sends `PATCH /permits/{id}` with only the changed fields.
4. `[System]` updates the `updated_at` timestamp and returns `200 OK`.
5. `[Frontend]` shows a subtle "Saved" indicator (not a modal or toast — a quiet inline label).
6. `[Applicant]` may navigate away and return to the draft at any time via the application list.

**Edge Cases:**
- If the applicant's session expires during a draft edit, unsaved changes since the last auto-save are queued in `localStorage` and re-synced on the next session load.
- If the auto-save request fails (network error), the frontend retries up to 3 times with exponential backoff (1s, 2s, 4s). After 3 failures, a warning toast is shown: "Auto-save failed. Your recent changes may not be saved — please save manually."
- A "Save Draft" button is always visible as an explicit save action independent of auto-save.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Draft not found | 404 | APPLICATION_NOT_FOUND | "Application not found." |
| Application already submitted (cannot update) | 409 | APPLICATION_NOT_EDITABLE | "Submitted applications cannot be edited through this endpoint." |

---

### PERM-03: Application List View

**Process:**
1. `[Applicant]` navigates to `/applications`.
2. `[System]` fetches all applications where `applicant_id = req.user.id`, ordered by `updated_at DESC`.
3. `[System]` returns a paginated list (default: 20 per page).
4. `[Frontend]` renders application cards with status badge, permit type, site address summary, last updated timestamp, and unread message count.
5. `[Applicant]` can filter by status (All, Draft, Submitted, Under Review, Additional Info Needed, Approved, Rejected).
6. `[Applicant]` can click any card to navigate to the application detail view.

**Outputs (per application card):**
- Application ID (displayed as a human-readable reference, e.g., `PMS-00042`)
- Permit type
- Site address (street + city)
- Status badge (color-coded per status token)
- Last updated timestamp (relative: "3 hours ago")
- Unread message count badge (only shown if > 0)
- Quick action: "Continue" for drafts; "View" for submitted

**Pagination:** Cursor-based pagination; `?cursor=<lastId>&limit=20`. Response includes `nextCursor` and `totalCount`.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Unauthenticated | 401 | UNAUTHORIZED | "Authentication required." |
| Database error | 500 | SERVER_ERROR | "Failed to load applications. Please refresh." |

---

### PERM-04: Application Detail View

**Process:**
1. `[Applicant]` navigates to `/applications/{id}`.
2. `[System]` fetches the application, verifying `applicant_id = req.user.id`.
3. `[System]` fetches associated documents, lifecycle stages, and messages in parallel.
4. `[Frontend]` renders:
   - **Header:** Application reference number, permit type, status badge, submission date
   - **Form Data Panel:** All submitted field values (read-only unless status is `draft` or `additional_info_needed`)
   - **Lifecycle Timeline:** Visual stepper showing all stages with timestamps (see F04)
   - **Document Panel:** List of uploaded documents with preview and remove/replace controls (see F03)
   - **Messaging Panel:** Full message thread with compose box (see F05)
   - **Info Request Panel:** If status is `additional_info_needed`, shows the reviewer's request note and a response submission form

**Outputs:**
- Full `ApplicationObject` plus:
  - `documents`: `DocumentObject[]`
  - `lifecycleStages`: `LifecycleStageObject[]`
  - `messages`: `MessageObject[]` (paginated, latest 50)
  - `infoRequest`: `{ note: string, requestedAt: timestamp } | null`
  - `reviewerName`: string (name of assigned reviewer, if any; do not expose reviewer's email/personal data)
  - `decision`: `{ outcome: 'approved' | 'rejected', reason: string, decidedAt: timestamp } | null`

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not found | 404 | APPLICATION_NOT_FOUND | "Application not found." |
| Application belongs to another user | 403 | FORBIDDEN | "You do not have permission to view this application." |
| Parallel fetch partial failure | 200 + partial | PARTIAL_DATA | Individual panel shows error state; other panels load normally |

**Schema Surface:** uses tables `permit_applications`, `lifecycle_stages`, `documents`, `messages`, `audit_log` — see `Y0-schema.md` §Permits.
**API Surface:** see `Y1-api.md` §Permits for full request/response schemas.
---

## F03: Document Management {#f03}

**PRD Feature:** F3 · **Phase:** 2 (applicant upload) → 3 (reviewer download) · **Priority:** P0
**Requirements:** DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05

### Description

Applicants upload supporting documents directly within the permit application interface using a drag-and-drop zone or file picker. Each upload undergoes immediate client-side and server-side validation for file type and size. Uploaded documents are previewable inline without downloading. Before the application is submitted, documents can be removed or replaced. After submission, documents become read-only for the applicant but remain accessible to reviewers, who can view and download individual files.

### Terminology

- **Document Slot:** A named position in the document checklist for a specific required document type (e.g., "Site Plan", "Proof of Ownership").
- **Allowed File Types:** PDF, JPEG, PNG, DOCX — enforced on both client and server.
- **Size Limit:** 25 MB per file; 100 MB total per application.
- **Presigned Upload URL:** A time-limited S3-compatible signed URL generated by the API that allows the client to PUT the file directly to object storage without routing the binary through the API server.
- **Presigned Download URL:** A time-limited S3-compatible signed URL for GET access, valid for 15 minutes.
- **Inline Preview:** Rendering a document within the application detail page without navigating away — image thumbnails for JPEG/PNG, embedded PDF viewer for PDFs, generic icon for DOCX.

### Sub-features

- **DOCS-01** — Drag-and-drop and file picker upload
- **DOCS-02** — File validation with immediate feedback
- **DOCS-03** — Inline document preview
- **DOCS-04** — Remove or replace documents before submission
- **DOCS-05** — Reviewer: view and download all documents

---

### DOCS-01: Document Upload

**Process:**
1. `[Applicant]` opens the application detail page (status: `draft` or `additional_info_needed`).
2. `[Frontend]` renders the document upload zone with drag-and-drop target and "Browse Files" button.
3. `[Applicant]` either:
   a. Drags one or more files onto the drop zone, OR
   b. Clicks "Browse Files" and selects files via the OS file picker.
4. `[Frontend]` immediately validates file type and size client-side (step DOCS-02).
5. If validation passes:
   a. `[Frontend]` shows an upload progress indicator for each file.
   b. `[Frontend]` calls `POST /permits/{id}/documents/upload-url` to request a presigned upload URL.
   c. `[System]` generates a presigned PUT URL for the file in object storage (15-minute expiry).
   d. `[Frontend]` PUTs the file binary directly to the presigned URL.
   e. `[Frontend]` calls `POST /permits/{id}/documents` to register the document metadata in the database (filename, type, size, storageKey).
   f. `[System]` creates a `documents` record with `status = 'uploaded'`.
   g. `[System]` creates an audit log entry: `{ action: 'DOCUMENT_UPLOADED', actor: userId, applicationId, documentId }`.
   h. `[Frontend]` adds the document to the document list without page reload.
6. If validation fails: inline error shown; file is not uploaded (step DOCS-02).

**Inputs:**
- `file` (binary, required): The file to upload
- `documentType` (string, optional): User-selected label (e.g., "Site Plan", "Proof of Identity", "Other")
- `permitApplicationId` (string, required): The application this document belongs to

**Outputs:**
- `DocumentObject`:
```json
{
  "id": "uuid",
  "permitApplicationId": "uuid",
  "filename": "site-plan.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 2048000,
  "documentType": "Site Plan",
  "storageKey": "documents/{appId}/{uuid}.pdf",
  "uploadedAt": "2026-07-21T10:00:00Z",
  "uploadedBy": "uuid"
}
```

**Validation:**
- Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- File extension must match MIME type (prevent extension spoofing)
- Maximum file size: 25 MB (26,214,400 bytes)
- Maximum total documents per application: 20 files
- Maximum total storage per application: 100 MB
- Application must be in status `draft` or `additional_info_needed` for uploads to be accepted
- File name must be ≤ 255 characters

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| File type not allowed | 422 | INVALID_FILE_TYPE | "Only PDF, JPEG, PNG, and DOCX files are accepted." |
| File exceeds 25 MB | 422 | FILE_TOO_LARGE | "This file exceeds the 25 MB limit. Please compress or split the file." |
| Total storage exceeded | 422 | STORAGE_LIMIT_EXCEEDED | "This application has reached the 100 MB document limit." |
| Too many documents (> 20) | 422 | TOO_MANY_DOCUMENTS | "Maximum 20 documents per application." |
| Application not in editable state | 409 | APPLICATION_NOT_EDITABLE | "Documents cannot be added to an application in its current status." |
| Presigned URL expired | 410 | UPLOAD_URL_EXPIRED | "The upload session expired. Please try uploading again." |
| Upload to storage failed | 502 | STORAGE_UPLOAD_FAILED | "Document upload failed. Please try again." |
| Applicant does not own application | 403 | FORBIDDEN | "You do not have permission to add documents to this application." |

---

### DOCS-02: File Validation & Feedback

**Process:**
1. Validation occurs in two stages:
   - **Client-side (immediate):** As soon as files are selected or dropped, before any network request.
   - **Server-side (authoritative):** When `POST /permits/{id}/documents/upload-url` is called and when the document metadata is registered.
2. `[Frontend]` checks: MIME type (from the `File.type` browser API), file size.
3. `[Frontend]` renders inline validation feedback directly on the drop zone or beside the file in the upload queue.
4. Valid files proceed to upload; invalid files show an error and are not queued.
5. Server-side validation repeats all checks — client-side validation is a UX improvement only, never a security gate.

**Feedback Display:**
- Each file in the upload queue shows its own status indicator: `Queued → Uploading (with % progress) → Uploaded ✓` or `Error ✗ {reason}`.
- Error messages appear inline next to the filename, not as a modal or toast.
- Batch upload: individual file failures do not block successful files in the same batch.

---

### DOCS-03: Inline Document Preview

**Process:**
1. `[User]` views the document list on the application detail page.
2. Document list shows: filename, type label, file size, upload date, and a preview control.
3. `[User]` clicks the preview control (thumbnail or "Preview" button).
4. `[Frontend]` requests a presigned download URL: `GET /permits/{id}/documents/{docId}/url`.
5. `[System]` returns a presigned URL valid for 15 minutes.
6. Preview renders:
   - **JPEG/PNG:** Thumbnail displayed inline in the document list; clicking opens a full-size lightbox overlay.
   - **PDF:** Opens an embedded PDF viewer (using browser's native PDF renderer or a library such as `react-pdf`) within the page — no navigation away.
   - **DOCX:** No inline preview; shows a "Download to view" label and a download button. A generic document icon is displayed.

**Inputs:**
- Implicit: the document's `id` and the current user's auth context

**Outputs:**
- `200 OK`: `{ url: "https://presigned-s3-url...", expiresAt: "ISO8601" }`

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Document not found | 404 | DOCUMENT_NOT_FOUND | "Document not found." |
| User lacks access to this document | 403 | FORBIDDEN | "You do not have access to this document." |
| Presigned URL generation failed | 502 | STORAGE_URL_FAILED | "Preview unavailable. Try downloading the file." |

---

### DOCS-04: Remove or Replace Documents

**Condition:** Only available when application status is `draft` or `additional_info_needed`. Documents on submitted/under review/approved/rejected applications are read-only for applicants.

**Remove Process:**
1. `[Applicant]` clicks the remove icon (trash) on a document in the list.
2. `[Frontend]` shows a confirmation: "Remove '{filename}'? This cannot be undone."
3. `[Applicant]` confirms.
4. `[System]` calls `DELETE /permits/{id}/documents/{docId}`.
5. `[System]` marks the document as `deleted` in the database (soft delete); does not immediately delete from object storage.
6. `[System]` schedules the storage object for deletion (async job, 24-hour delay — allows recovery if needed).
7. `[System]` creates an audit log entry: `{ action: 'DOCUMENT_REMOVED', actor: userId, documentId }`.
8. `[Frontend]` removes the document from the list without page reload.

**Replace Process:**
1. `[Applicant]` clicks "Replace" on a document.
2. `[Frontend]` opens file picker (single file).
3. New file goes through the standard DOCS-01 upload flow.
4. After successful upload, `[System]` marks the old document as `superseded` (not deleted — kept for audit).
5. The new document is linked as the current version.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not editable | 409 | APPLICATION_NOT_EDITABLE | "Documents on submitted applications cannot be removed." |
| Document not found | 404 | DOCUMENT_NOT_FOUND | "Document not found." |
| Delete of others' document | 403 | FORBIDDEN | "You do not have permission to remove this document." |

---

### DOCS-05: Reviewer: View and Download Documents

**Process:**
1. `[Reviewer]` opens any application detail view.
2. `[System]` verifies `req.user.role === 'reviewer'` and that the application is accessible to this reviewer (assigned to them or in the available pool).
3. `[Frontend]` renders the document panel showing all documents (including those uploaded during info request responses).
4. Each document shows: filename, type label, size, uploader name, upload date, and "Download" button.
5. `[Reviewer]` clicks "Download" on a document.
6. `[System]` generates a presigned download URL: `GET /permits/{id}/documents/{docId}/url`.
7. `[Frontend]` triggers a browser download using the presigned URL.
8. `[System]` creates an audit log entry: `{ action: 'DOCUMENT_DOWNLOADED', actor: userId, documentId }`.

**Bulk Download (optional for v1, required if feasible):**
- "Download All" button triggers a server-side ZIP generation of all documents.
- Endpoint: `GET /permits/{id}/documents/archive`
- Server generates the ZIP asynchronously; returns a download URL when ready (polling or 202 + Location header).

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Reviewer lacks access to application | 403 | FORBIDDEN | "You are not assigned to this application." |
| Document not found | 404 | DOCUMENT_NOT_FOUND | "Document not found." |
| Storage retrieval failed | 502 | STORAGE_FETCH_FAILED | "Download failed. Please try again." |

**Schema Surface:** uses tables `documents`, `permit_applications` — see `Y0-schema.md` §Documents.
**API Surface:** see `Y1-api.md` §Documents for full request/response schemas.
---

## F04: Permit Status Tracking & Lifecycle {#f04}

**PRD Feature:** F4 · **Phase:** 2 (tracking) → 3 (reviewer actions + notifications) · **Priority:** P0
**Requirements:** STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06, STAT-07

### Description

Every permit application moves through a strictly ordered lifecycle of seven stages. Transitions are triggered by specific actors (applicant submission, reviewer actions, applicant response). Each transition is recorded as an immutable lifecycle stage entry with a timestamp. The applicant sees a visual timeline showing all past stages and the current stage. Reviewers drive the workflow forward from their application detail view. Every status change triggers an in-app notification to the applicant.

### Terminology

- **Lifecycle Stage:** One of seven ordered states. Valid values: `draft`, `submitted`, `under_review`, `additional_info_needed`, `approved`, `rejected`.
- **Terminal State:** A state from which no further transitions are possible: `approved` or `rejected`.
- **Info Request Note:** A required free-text message written by the reviewer when moving an application to `additional_info_needed`. This message is displayed prominently to the applicant.
- **Decision Reason:** A required free-text explanation written by the reviewer when approving or rejecting an application. Stored on the application and visible to the applicant.
- **Lifecycle Stage Entry:** An immutable record capturing `{ applicationId, stage, enteredAt, actor }` — created on every transition.

### Sub-features

- **STAT-01** — Defined lifecycle stages and transition rules
- **STAT-02** — Visual lifecycle timeline for applicants
- **STAT-03** — Reviewer: advance to Under Review
- **STAT-04** — Reviewer: request additional information
- **STAT-05** — Applicant: respond to info request
- **STAT-06** — Reviewer: approve or reject with documented reason
- **STAT-07** — In-app notification on status change

---

### STAT-01: Lifecycle Stages & Transition Rules

**Permitted Transitions:**

| From | To | Actor | Trigger |
|------|----|-------|---------|
| — | `draft` | `[Applicant]` | Application created (PERM-01) |
| `draft` | `submitted` | `[Applicant]` | Applicant clicks "Submit Application" (PERM-01) |
| `submitted` | `under_review` | `[Reviewer]` | Reviewer claims the application (STAT-03) |
| `under_review` | `additional_info_needed` | `[Reviewer]` | Reviewer requests more information (STAT-04) |
| `under_review` | `approved` | `[Reviewer]` | Reviewer approves with reason (STAT-06) |
| `under_review` | `rejected` | `[Reviewer]` | Reviewer rejects with reason (STAT-06) |
| `additional_info_needed` | `under_review` | `[Applicant]` | Applicant responds to info request (STAT-05) |

**Forbidden Transitions (enforced at API layer):**
- Any transition not listed above returns `409 INVALID_STATUS_TRANSITION`.
- Terminal states (`approved`, `rejected`) cannot be transitioned from.
- Applicants cannot transition their own application from `submitted` to `under_review`.
- Reviewers cannot move an application back to `draft` or `submitted`.

**Process (Transition Execution):**
1. `[Actor]` triggers the transition action.
2. `[System]` validates the current application status and the requested transition.
3. `[System]` validates role authorization for the transition.
4. `[System]` validates required inputs (e.g., reason text for STAT-04, STAT-06).
5. `[System]` updates `permit_applications.status` to the new stage.
6. `[System]` creates a `lifecycle_stages` entry: `{ applicationId, stage: newStage, enteredAt: now(), actorId: req.user.id }`.
7. `[System]` creates an `audit_log` entry.
8. `[System]` triggers in-app notification for the applicant (STAT-07).
9. `[System]` returns the updated application object.

---

### STAT-02: Visual Lifecycle Timeline

**Description:** A horizontal or vertical stepper component rendered on the applicant's application detail page. Shows all lifecycle stages, with visual differentiation between completed, current, and future stages.

**Process:**
1. `[System]` fetches all `lifecycle_stages` entries for the application.
2. `[Frontend]` renders the timeline stepper with:
   - All seven stages displayed in fixed order: Draft → Submitted → Under Review → Additional Info Needed → Approved / Rejected
   - **Completed stages:** filled/colored indicator + timestamp (relative and absolute)
   - **Current stage:** highlighted indicator + label (no timestamp — in progress)
   - **Future stages:** muted/unfilled indicator (greyed out)
   - **Branching terminal states:** Approved and Rejected shown as two alternative terminal nodes; the reached one is highlighted, the other is muted
3. If the application is in `additional_info_needed`, the info request note is shown prominently above or below the timeline.
4. If the application is `approved` or `rejected`, the decision reason is shown prominently below the terminal stage.

**Outputs (per stage entry):**
- `stage`: stage name
- `label`: Human-readable label (e.g., "Under Review")
- `enteredAt`: ISO 8601 timestamp
- `relativeTime`: Human-readable relative time (e.g., "2 days ago")
- `actorRole`: Role of the actor who triggered this transition

**Validation:**
- Timeline must always show all seven stages even if not yet reached
- Approved and Rejected are mutually exclusive terminal states — only one can be reached per application
- Timestamps must be sorted ascending; no duplicate stage entries for the same stage on the same path (re-entry to `under_review` from `additional_info_needed` creates a new entry, preserving history)

---

### STAT-03: Reviewer — Advance to Under Review

**Process:**
1. `[Reviewer]` opens an application in `submitted` status.
2. `[Reviewer]` clicks "Begin Review" action button.
3. `[System]` validates:
   - Application is in `submitted` status
   - User has role `reviewer` or `admin`
4. `[System]` assigns `reviewer_id = req.user.id` on the `permit_applications` record if not already assigned.
5. `[System]` executes transition: `submitted → under_review`.
6. `[System]` notifies the applicant (STAT-07).
7. `[System]` returns the updated application.

**Inputs:** `{ action: 'begin_review' }` (no additional fields required)

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not in `submitted` status | 409 | INVALID_STATUS_TRANSITION | "This application is not in 'Submitted' status." |
| Role not reviewer/admin | 403 | FORBIDDEN | "Only reviewers can begin application review." |

---

### STAT-04: Reviewer — Request Additional Information

**Process:**
1. `[Reviewer]` is viewing an application in `under_review` status.
2. `[Reviewer]` clicks "Request Information" action button.
3. `[Frontend]` displays a modal/panel with a required text area: "Describe what additional information is needed."
4. `[Reviewer]` enters the info request note and submits.
5. `[System]` validates:
   - Application is in `under_review` status
   - `infoRequestNote` is non-empty and ≤ 2000 characters
6. `[System]` stores the note in `permit_applications.info_request_note` and `info_request_at = now()`.
7. `[System]` executes transition: `under_review → additional_info_needed`.
8. `[System]` notifies the applicant with the note content (STAT-07).
9. `[System]` returns the updated application.

**Inputs:**
- `infoRequestNote` (string, required): 1–2000 characters describing what is needed

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not in `under_review` | 409 | INVALID_STATUS_TRANSITION | "This application is not under review." |
| Empty info request note | 422 | VALIDATION_ERROR | "A description of the required information is mandatory." |
| Note exceeds 2000 characters | 422 | VALIDATION_ERROR | "Info request note cannot exceed 2000 characters." |

---

### STAT-05: Applicant — Respond to Info Request

**Process:**
1. `[Applicant]` opens their application in `additional_info_needed` status.
2. Application detail page shows a prominent "Action Required" banner with the reviewer's info request note.
3. `[Applicant]` may:
   a. Upload additional documents (DOCS-01 flow, permitted in this status)
   b. Write a response note in the "Response" text area
4. `[Applicant]` clicks "Re-submit for Review".
5. `[System]` validates:
   - Application is in `additional_info_needed` status
   - `[Applicant]` owns the application
   - At least one document has been uploaded OR a response note has been provided (not both required, but at least one)
6. `[System]` stores the response note in `permit_applications.info_response_note` and `info_response_at = now()`.
7. `[System]` executes transition: `additional_info_needed → under_review`.
8. `[System]` notifies the assigned reviewer of the applicant's response (in-app).
9. `[System]` returns the updated application.

**Inputs:**
- `responseNote` (string, optional): Applicant's written response (max 2000 characters)
- (Documents are uploaded separately via DOCS-01; their presence is checked at this step)

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not in `additional_info_needed` | 409 | INVALID_STATUS_TRANSITION | "This action is only available for applications awaiting additional information." |
| No response provided | 422 | RESPONSE_REQUIRED | "Please upload a document or provide a written response before re-submitting." |
| Applicant does not own application | 403 | FORBIDDEN | "You do not have permission to respond to this request." |

---

### STAT-06: Reviewer — Approve or Reject

**Process:**
1. `[Reviewer]` is viewing an application in `under_review` status.
2. `[Reviewer]` clicks either "Approve" or "Reject" action button.
3. `[Frontend]` displays a confirmation modal with:
   - Action label: "Approve Application" or "Reject Application"
   - Required text area: "Document your reason for this decision"
   - Confirm and Cancel buttons
   - Danger styling for Reject action
4. `[Reviewer]` enters the decision reason and confirms.
5. `[System]` validates:
   - Application is in `under_review` status
   - User is the assigned reviewer or an admin
   - `decisionReason` is non-empty and 10–2000 characters
6. `[System]` updates: `permit_applications.decision = { outcome, reason, decidedAt: now(), decidedBy: reviewerId }`.
7. `[System]` executes transition: `under_review → approved` or `under_review → rejected`.
8. `[System]` notifies the applicant with the decision outcome and reason (STAT-07).
9. `[System]` returns the updated application.

**Inputs:**
- `outcome` (enum, required): `'approved'` or `'rejected'`
- `decisionReason` (string, required): 10–2000 characters

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not in `under_review` | 409 | INVALID_STATUS_TRANSITION | "A decision can only be made on applications under review." |
| Missing or too short reason | 422 | VALIDATION_ERROR | "A documented reason (at least 10 characters) is required." |
| Reason exceeds 2000 characters | 422 | VALIDATION_ERROR | "Decision reason cannot exceed 2000 characters." |
| Reviewer not assigned to application | 403 | FORBIDDEN | "Only the assigned reviewer or an admin can make a decision." |
| Application already in terminal state | 409 | INVALID_STATUS_TRANSITION | "This application has already been decided." |

---

### STAT-07: In-App Notifications

**Description:** Every status transition triggers an in-app notification delivered to the affected user(s). Notifications are persistent (stored in the database) and surfaced via a notification indicator in the global navigation.

**Notification Triggers:**

| Event | Notified User | Notification Text |
|-------|--------------|-------------------|
| `submitted → under_review` | Applicant | "Your permit application #{ref} is now under review." |
| `under_review → additional_info_needed` | Applicant | "Additional information is needed for your application #{ref}: '{infoRequestNote excerpt}'" |
| `additional_info_needed → under_review` | Assigned Reviewer | "Applicant has responded to your information request on #{ref}." |
| `under_review → approved` | Applicant | "Your permit application #{ref} has been approved." |
| `under_review → rejected` | Applicant | "Your permit application #{ref} has been rejected. Reason: '{reason excerpt}'" |
| New message received | Recipient (applicant or reviewer) | "New message on application #{ref} from {sender}." |

**Process:**
1. `[System]` generates a notification record in the `notifications` table after each triggering event.
2. `[Frontend]` polls `GET /notifications/unread-count` every 30 seconds to update the nav badge.
3. When the user navigates to the notification panel, `[Frontend]` fetches `GET /notifications` (paginated, latest 50).
4. Reading a notification marks it as `read` via `PATCH /notifications/{id}/read`.
5. Clicking a notification navigates to the relevant application detail page.

**Notification Object:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "applicationId": "uuid",
  "applicationRef": "PMS-00042",
  "type": "STATUS_CHANGE",
  "body": "Your permit application PMS-00042 is now under review.",
  "read": false,
  "createdAt": "2026-07-21T10:00:00Z"
}
```

**Edge Cases:**
- If the applicant is actively viewing the application detail page when a notification is generated, the page updates without requiring navigation away (status badge and timeline refresh via polling or optimistic update).
- Notifications are never deleted — they are marked as read only.
- Unread notification count is shown in the nav as a numeric badge (capped at display of "99+" for counts > 99).

**Schema Surface:** uses tables `notifications`, `lifecycle_stages`, `permit_applications`, `audit_log` — see `Y0-schema.md` §Lifecycle.
**API Surface:** see `Y1-api.md` §Status & Lifecycle for full request/response schemas.
---

## F05: Integrated Messaging {#f05}

**PRD Feature:** F5 · **Phase:** 3 — Review Workflow · **Priority:** P1
**Requirements:** MSG-01, MSG-02, MSG-03, MSG-04

### Description

Each permit application has a dedicated messaging panel visible on both the applicant's and the reviewer's application detail view. Applicants and their assigned reviewer can exchange messages in context — directly tied to the specific permit. Messages display structured metadata (sender name, role, timestamp) and are ordered chronologically. The reviewer can attach supporting documents or notes to individual messages. Unread message counts are surfaced on the application list and dashboards so no message is missed.

### Terminology

- **Message Thread:** The ordered collection of all messages on a single permit application.
- **Message Attachment:** A file or note attached to a specific message by a reviewer (different from application documents — these are contextual communication artifacts).
- **Unread Message Count:** The number of messages on a given application that the current user has not yet read.
- **Read Receipt:** A record marking when a specific user first viewed a message.

### Sub-features

- **MSG-01** — Send and receive messages on a permit application
- **MSG-02** — Message metadata display (sender, role, timestamp)
- **MSG-03** — Unread message counts on list view and dashboard
- **MSG-04** — Reviewer: attach documents or notes to a message

---

### MSG-01: Integrated Messaging Panel

**Access Rules:**
- The applicant who owns the application can view and send messages.
- The reviewer assigned to the application can view and send messages.
- Admins can view messages on any application but cannot send messages (read-only for admin).
- No other users can access the message thread.

**Process — Sending a Message:**
1. `[User]` opens the application detail page.
2. `[Frontend]` renders the messaging panel with the full chronological message thread.
3. `[User]` types a message in the compose box at the bottom of the panel.
4. `[User]` optionally attaches a document/note (reviewer only; see MSG-04).
5. `[User]` sends the message via:
   a. Clicking the "Send" button, OR
   b. Pressing `Ctrl+Enter` (or `Cmd+Enter` on macOS)
6. `[System]` validates the message (see Validation below).
7. `[System]` creates a `messages` record.
8. `[System]` marks the message as `unread` for all other participants on this thread.
9. `[System]` triggers a notification for the recipient (see STAT-07 §notification triggers).
10. `[System]` returns `201 Created` with the new message object.
11. `[Frontend]` appends the new message to the thread and scrolls to the bottom.

**Process — Receiving Messages:**
1. The message thread is loaded when the application detail page opens.
2. Messages are fetched via `GET /permits/{id}/messages?limit=50&cursor=...` (paginated, newest-first).
3. `[Frontend]` polls `GET /permits/{id}/messages/unread-count` every 30 seconds while the panel is in view.
4. If new messages are detected during polling, the thread updates automatically (new messages appended).
5. When a user views a message, `[System]` marks it as read: `POST /permits/{id}/messages/{msgId}/read`.

**Inputs (send message):**
- `applicationId` (string, required): From URL path
- `body` (string, required): Message text, 1–5000 characters
- `attachments` (array, optional): Array of attachment objects (reviewer only; see MSG-04)

**Outputs (MessageObject):**
```json
{
  "id": "uuid",
  "applicationId": "uuid",
  "senderId": "uuid",
  "senderName": "Diana Osei",
  "senderRole": "reviewer",
  "body": "Please provide the updated site plan with setback dimensions.",
  "attachments": [],
  "sentAt": "2026-07-21T14:30:00Z",
  "readBy": ["uuid-applicant"]
}
```

**Validation:**
- `body` must be 1–5000 characters (trimmed)
- `body` must not be empty or whitespace-only
- User must be the application's owner (applicant) or the assigned reviewer
- Application must not be in `draft` status (messaging only available from `submitted` onward)
- Reviewer cannot send messages on an application they are not assigned to (unless Admin)

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Empty message body | 422 | VALIDATION_ERROR | "Message cannot be empty." |
| Message exceeds 5000 characters | 422 | VALIDATION_ERROR | "Message cannot exceed 5000 characters." |
| User not a participant on this application | 403 | FORBIDDEN | "You are not authorized to message on this application." |
| Application in draft status | 409 | MESSAGING_NOT_AVAILABLE | "Messaging is available once an application has been submitted." |
| Application not found | 404 | APPLICATION_NOT_FOUND | "Application not found." |

---

### MSG-02: Message Metadata Display

**Required Display Elements per Message:**

| Field | Display Format |
|-------|---------------|
| Sender full name | Bold label above message bubble |
| Sender role | Role badge adjacent to name: "Applicant" (blue) or "Reviewer" (amber) |
| Timestamp | Relative time on hover/below message (e.g., "Today at 2:30 PM"); absolute on hover tooltip |
| Message body | Left-aligned in a chat-style bubble; reviewer messages distinguished by color/positioning |
| Attachments | Listed below the message body with filename, type icon, and download link |

**Layout:**
- Applicant messages: right-aligned bubbles (from the current user's perspective when viewing as applicant), or left-aligned when viewed by reviewer.
- Reviewer messages: distinguished by a different bubble background color using design tokens.
- System messages (e.g., "Application submitted", "Status changed to Under Review"): centered, muted, italic — not attributed to a sender role.

---

### MSG-03: Unread Message Counts

**Surfaces where unread counts appear:**

| Surface | Display |
|---------|---------|
| Application list (PERM-03 view) | Badge on the application card: "3 unread" |
| Applicant dashboard (DASH-01) | "Unread messages" count in the summary card |
| Reviewer dashboard (DASH-02) | Unread message count per application row |
| Global navigation | Total unread message count across all applications (merged with notification badge, or separate) |

**Process:**
1. When a message is created, `[System]` increments the unread count for all thread participants except the sender.
2. When a participant views the message thread, `[System]` marks all unread messages as read for that user.
3. `[System]` recalculates the unread count for that user asynchronously.
4. `[Frontend]` reflects the updated count on the next poll cycle (30 seconds) or immediately via optimistic update.

**Data Model:** `message_reads` table tracks `{ messageId, userId, readAt }`. Unread count = total messages on thread minus messages with a `message_reads` entry for the current user.

---

### MSG-04: Reviewer — Attach Documents or Notes to Messages

**Condition:** Only available to users with role `reviewer` or `admin`.

**Process:**
1. `[Reviewer]` is composing a message.
2. `[Reviewer]` clicks "Attach" in the compose box.
3. Two options are presented:
   a. **Attach File:** Opens file picker; uploads file via the same presigned URL flow as DOCS-01 but to a `message_attachments` storage path.
   b. **Attach Note:** Opens a secondary text area within the compose box for a formatted structured note (e.g., code excerpts, checklists in Markdown).
4. Attachments are linked to the message record (not the application's main document list).
5. On message send, attachments are included in the message object and displayed below the message body.
6. Applicants can view and download message attachments.

**Message Attachment Object:**
```json
{
  "id": "uuid",
  "messageId": "uuid",
  "filename": "inspection-report.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 512000,
  "storageKey": "message-attachments/{appId}/{msgId}/{uuid}.pdf",
  "uploadedAt": "2026-07-21T14:30:00Z"
}
```

**Validation:**
- Same file type and size restrictions as DOCS-01 (PDF, JPEG, PNG, DOCX; max 25 MB per file)
- Maximum 5 attachments per message
- Note text (if chosen instead of file): max 2000 characters
- Only reviewers may attach files to messages; applicants see "Attach" button disabled with tooltip "Only reviewers can attach files to messages."

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Applicant attempts to attach file | 403 | FORBIDDEN | "Only reviewers can attach files to messages." |
| File type not allowed | 422 | INVALID_FILE_TYPE | "Only PDF, JPEG, PNG, and DOCX files are accepted." |
| File exceeds 25 MB | 422 | FILE_TOO_LARGE | "Attachment exceeds the 25 MB limit." |
| Exceeds 5 attachments per message | 422 | TOO_MANY_ATTACHMENTS | "A maximum of 5 attachments per message is allowed." |

**Schema Surface:** uses tables `messages`, `message_reads`, `message_attachments` — see `Y0-schema.md` §Messaging.
**API Surface:** see `Y1-api.md` §Messaging for full request/response schemas.
---

## F06: Reviewer Workflow {#f06}

**PRD Feature:** F6 · **Phase:** 3 — Review Workflow · **Priority:** P0
**Requirements:** PERM-05, PERM-06, DOCS-05 (see F03), STAT-03, STAT-04, STAT-06 (see F04)

### Description

Reviewers have a dedicated workspace to manage permit applications assigned to them or available in the shared review pool. The reviewer's application list view is filterable and sortable by status and urgency. The application detail view gives the reviewer access to all form data, documents, the full message thread, and status action controls — all on one page. Reviewers perform all workflow actions (begin review, request info, approve, reject) without navigating away from the application detail view.

### Terminology

- **Assigned Application:** An application where `reviewer_id` matches the current reviewer's `userId`. The reviewer has sole decision-making authority.
- **Available Pool:** Applications in `submitted` status with `reviewer_id = null`, visible to all reviewers and claimable.
- **Status Priority Order:** The order in which the reviewer queue surfaces applications: `additional_info_needed` (applicant has responded) > `submitted` (unassigned) > `under_review` (assigned, active) > terminal states (for reference).
- **Action Controls:** The set of buttons/actions rendered on the reviewer's application detail view based on the current application status.

### Sub-features

- **PERM-05** — Reviewer: view list of assigned/available applications
- **PERM-06** — Reviewer: view full application detail with all documents, messages, and action controls
- **STAT-03, STAT-04, STAT-06** — Status transitions (fully specified in F04; summarized here for reviewer workflow context)

---

### PERM-05: Reviewer Application List

**Access Rules:** `role = 'reviewer'` or `role = 'admin'`. Reviewers see applications assigned to them plus unassigned applications in `submitted` status. Admins see all applications (see F08/PERM-07).

**Process:**
1. `[Reviewer]` navigates to `/review-queue` (or is redirected there after login).
2. `[System]` fetches:
   - All applications where `reviewer_id = req.user.id` (any status)
   - All applications where `reviewer_id = null` AND `status = 'submitted'`
3. `[System]` returns the combined list sorted by the priority order defined above.
4. `[Frontend]` renders the queue as a sortable table/list with:
   - Application reference (e.g., `PMS-00042`)
   - Permit type
   - Applicant name
   - Site address summary
   - Status badge (color-coded)
   - Days since submitted (age indicator — highlights applications older than 5 business days)
   - Unread message count badge
   - Assigned/unassigned indicator
5. `[Reviewer]` can filter by: Status (All, Submitted, Under Review, Additional Info Needed, Approved, Rejected), Permit Type, Assignment (Mine, All Available).
6. `[Reviewer]` can sort by: Status (priority order), Submission Date (oldest first as default), Permit Type.
7. `[Reviewer]` clicks an application row to open the detail view.

**Outputs (per application list item):**
- `id`, `referenceNumber`, `status`, `permitType`, `applicantName`, `siteAddressSummary`, `submittedAt`, `updatedAt`, `unreadMessageCount`, `assignedReviewerId`, `daysSinceSubmitted`

**Pagination:** Server-side; `?page=1&limit=25`. Default sort: status priority ascending, then submission date ascending.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Unauthenticated | 401 | UNAUTHORIZED | "Authentication required." |
| Applicant attempts to access reviewer queue | 403 | FORBIDDEN | "You do not have access to the reviewer queue." |
| Database error | 500 | SERVER_ERROR | "Failed to load review queue. Please refresh." |

---

### PERM-06: Reviewer Application Detail View

**Process:**
1. `[Reviewer]` navigates to `/review/{applicationId}`.
2. `[System]` verifies the reviewer has access (assigned reviewer, admin, or application is in `submitted` status and unassigned).
3. `[System]` fetches in parallel: application data, documents, lifecycle stages, messages, and any info request/decision data.
4. `[Frontend]` renders:
   - **Application Header:** Reference number, permit type, applicant name, status badge, submission date, assigned reviewer (if any), days since submission
   - **Application Form Data Panel (read-only):** All permit fields displayed in a structured layout
   - **Lifecycle Timeline:** Same visual stepper as applicant view (STAT-02), but reviewer sees all stage details
   - **Document Panel:** All attached documents with inline preview and download — see DOCS-05 in F03
   - **Action Controls Panel:** Context-sensitive buttons based on current status (see below)
   - **Messaging Panel:** Full thread with compose box; reviewer can attach files — see MSG-01, MSG-04 in F05

**Action Controls by Status:**

| Application Status | Available Actions |
|-------------------|------------------|
| `submitted` | "Begin Review" → triggers STAT-03 |
| `under_review` | "Request Information" → triggers STAT-04; "Approve" → triggers STAT-06; "Reject" → triggers STAT-06 |
| `additional_info_needed` (applicant responded) | "Begin Review" (re-claim) OR review immediately — triggers STAT-03 transition back to `under_review` |
| `approved` / `rejected` | Read-only; shows decision details; no action buttons |
| `draft` | Reviewer sees "This application has not been submitted yet." No action controls |

**Reviewer-Specific Data:**
- Reviewer can see the applicant's full name, contact email, and contact phone as entered on the application.
- Reviewer sees the info request note and applicant's response note (if applicable).
- Reviewer sees the decision record if the application is in a terminal state.

**Outputs:** Full `ApplicationObject` as defined in PERM-04 (F02), plus reviewer-visible fields:
- `applicantEmail` (reviewer-only)
- `applicantPhone` (reviewer-only)
- `infoRequestNote`, `infoResponseNote`, `infoRequestAt`, `infoResponseAt`
- `decision`: `{ outcome, reason, decidedAt, decidedBy }`

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application not found | 404 | APPLICATION_NOT_FOUND | "Application not found." |
| Reviewer not authorized (assigned to another reviewer, not in pool) | 403 | FORBIDDEN | "You do not have access to this application." |
| Application in draft (reviewers cannot view draft applications) | 403 | FORBIDDEN | "This application has not been submitted." |

**Schema Surface:** uses tables `permit_applications`, `documents`, `lifecycle_stages`, `messages`, `users` — see `Y0-schema.md` §Permits.
**API Surface:** see `Y1-api.md` §ReviewerWorkflow for full request/response schemas.
---

## F07: Role-Specific Dashboards {#f07}

**PRD Feature:** F7 · **Phase:** 4 — Dashboards · **Priority:** P1
**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04

### Description

Every user role lands on a dashboard tailored to their priorities. Dashboards are not generic summaries — they surface precisely the information each role needs to act immediately. Applicant dashboards emphasize active permits and pending actions. Reviewer dashboards prioritize the work queue. Admin dashboards give system-wide throughput visibility. Each dashboard includes at least one visual progress indicator (chart or activity feed). Dashboard data must not be staler than 30 seconds.

### Terminology

- **Summary Card:** A metric tile displaying a single count or KPI with a label and optional trend indicator (e.g., "Active Applications: 4").
- **Activity Feed:** A chronological list of recent system events relevant to the current user (status changes, new messages, decisions).
- **Status Distribution Chart:** A visual chart (bar or donut) showing the count of applications across each lifecycle stage.
- **Workload Table:** A table showing each reviewer's assigned application count by status.
- **Pending Action:** An application or item requiring the user's immediate attention (e.g., applicant has an application in `additional_info_needed`; reviewer has applications in `submitted` unassigned).

### Sub-features

- **DASH-01** — Applicant dashboard
- **DASH-02** — Reviewer dashboard
- **DASH-03** — Admin dashboard
- **DASH-04** — Visual progress indicators shared across all dashboards

---

### DASH-01: Applicant Dashboard

**Route:** `/dashboard` (redirect target after applicant login)

**Process:**
1. `[Applicant]` is redirected to or navigates to `/dashboard`.
2. `[System]` fetches in parallel:
   - Application summary counts by status (for the current applicant)
   - Recent applications (last 5, sorted by `updated_at DESC`)
   - Unread notifications count
   - Total unread message count across all applications
3. `[Frontend]` renders the dashboard skeleton immediately, then populates as data resolves.

**Dashboard Components:**

| Component | Content |
|-----------|---------|
| Summary Cards (top row) | "Active Applications" (submitted + under_review + additional_info_needed); "Action Required" (count of applications in additional_info_needed); "Unread Messages" (total across all applications) |
| Recent Applications List | Last 5 applications with: reference, permit type, status badge, last-updated timestamp, unread message count; "View All" link |
| Pending Actions Panel | Highlighted list of applications requiring the applicant's immediate attention (all in `additional_info_needed`); each shows the info request note excerpt and a "Respond" CTA |
| Quick Start CTA | "Start New Application" button — prominent, accessible from dashboard without nav |
| Activity Feed | Last 10 status change notifications for this applicant's applications, most recent first |

**Data Refresh:** Dashboard polls for updated data every 30 seconds. Polling stops when the page is not visible (`document.visibilityState === 'hidden'`).

**Empty State:** If the applicant has no applications, the dashboard shows a welcome state: "You have no permit applications yet. Start your first application." with a large CTA button.

**Error States:**

| Scenario | UI Response |
|----------|------------|
| API fetch fails on load | Skeleton replaced by error card with retry per-section |
| One section fails (partial) | Failed section shows inline error; other sections load normally |
| Session expired during poll | Redirect to `/login` with message "Your session has expired." |

---

### DASH-02: Reviewer Dashboard

**Route:** `/dashboard` (role-aware: reviewers see this view; same route, role-determined rendering)

**Process:**
1. `[Reviewer]` is redirected to or navigates to `/dashboard`.
2. `[System]` fetches in parallel:
   - Applications assigned to reviewer by status count
   - Unassigned applications in `submitted` status (count and list)
   - Reviewer's applications sorted by priority order (see PERM-05)
   - Total unread message count across reviewer's applications

**Dashboard Components:**

| Component | Content |
|-----------|---------|
| Summary Cards | "Assigned Applications" (total assigned); "Awaiting Response" (additional_info_needed where applicant has responded); "Unassigned In Pool" (submitted, no reviewer); "Unread Messages" |
| Priority Queue (main panel) | Applications sorted by priority: 1. additional_info_needed (applicant responded), 2. submitted (unassigned — claimable), 3. under_review (active). Each row shows: reference, permit type, applicant name, status badge, days since submission, unread message badge, quick-action button ("Begin Review", "Continue", "Review Response") |
| Pending Decisions Panel | Applications in `under_review` assigned to this reviewer with no action taken for > 3 business days — highlighted as at-risk |
| Activity Feed | Last 10 events on this reviewer's assigned applications: new messages, applicant responses, info requests |

**Sort and Filter on Dashboard Queue:**
- Default: priority order (status priority, then oldest first)
- Filter options: Status, Date range
- Queue is live-refreshed on 30-second poll

**Empty State:** "No applications assigned. Check the submission pool for new applications." with link to full review queue.

**Error States:** Same pattern as DASH-01 (per-section error, retry action).

---

### DASH-03: Admin Dashboard

**Route:** `/dashboard` (admin role sees this view)

**Process:**
1. `[Admin]` is redirected to or navigates to `/dashboard`.
2. `[System]` fetches in parallel:
   - System-wide application counts by status (all applicants)
   - Reviewer workload data (application counts per reviewer, by status)
   - Recent audit log entries (last 20)
   - Total new applications in last 7 days

**Dashboard Components:**

| Component | Content |
|-----------|---------|
| System-Wide Summary Cards | "Total Applications" (all time); "Active Applications" (not in terminal state); "Submitted This Week"; "Decisions This Week" (approved + rejected) |
| Status Distribution Chart | Visual chart (donut or grouped bar) showing application counts by lifecycle stage. Clickable segments navigate to the admin applications list filtered by that status |
| Reviewer Workload Table | One row per active reviewer: Name, Assigned (active), Under Review count, Additional Info Needed count, Decided This Week. Sortable by any column |
| Recent Activity Feed | Last 20 audit log entries system-wide: status transitions, user creations, reviewer assignments |
| Quick Actions | "Manage Users" link; "Assign Applications" link; "View Audit Log" link |

**Data Notes:**
- All counts are real-time (on dashboard load + 30-second poll).
- Reviewer workload table data source: `permit_applications` JOIN `users` grouped by `reviewer_id`.
- Admin cannot take permit actions (approve/reject) from the dashboard — those require navigating to the application detail.

**Error States:** Per-section error pattern; status chart failure shows fallback table.

---

### DASH-04: Visual Progress Indicators

**Description:** Every dashboard includes at least one meaningful visual chart or indicator beyond raw counts. These are defined per dashboard but share common implementation patterns.

**Required Visual Components:**

| Dashboard | Visual Indicator | Implementation |
|-----------|-----------------|---------------|
| Applicant | Activity Feed | Chronological event list with status-colored left border; latest 10 events |
| Reviewer | Priority Queue Heat Indicator | Age-based color coding on queue rows: < 3 days = green, 3–5 days = amber, > 5 days = red |
| Admin | Status Distribution Chart | Donut chart (preferred) or horizontal bar chart; one segment per lifecycle stage; uses `color.status.*` tokens |
| Admin | Reviewer Workload Bar | Horizontal bar chart comparing reviewer application counts; identifies overloaded reviewers at a glance |

**Chart Library:** A lightweight chart library (e.g., Recharts, Victory, or Nivo) must be used — no Canvas-only libraries that break accessibility. All charts must include:
- ARIA `role="img"` with a descriptive `aria-label`
- A fallback text summary for screen readers (e.g., "Status breakdown: 12 Under Review, 5 Submitted, 3 Additional Info Needed, 2 Approved, 1 Rejected")
- Color-blind-safe palette (avoid red/green as the only differentiators)

**Refresh Behavior:**
- All charts update on the 30-second polling cycle.
- Chart updates are smooth (animated transitions between values, not flash-replace).
- If a chart fails to load, it shows an inline error with a "Retry" button — it does not block the rest of the dashboard.

**Schema Surface:** uses tables `permit_applications`, `users`, `notifications`, `messages`, `audit_log` — see `Y0-schema.md` §Dashboards.
**API Surface:** see `Y1-api.md` §Dashboards for full request/response schemas.
---

## F08: Admin Controls {#f08}

**PRD Feature:** F8 · **Phase:** 5 — Admin & Compliance · **Priority:** P1
**Requirements:** PERM-07, ADMN-01, ADMN-02, ADMN-03

### Description

Administrators have full operational control over the system. They can create and deactivate user accounts, assign reviewers to applications, view all applications system-wide, and access a complete, immutable audit log of all status changes and key system actions. Admin tools are purpose-built for operational oversight. All admin actions are themselves logged in the audit trail.

### Terminology

- **Soft Delete (User):** Setting `users.is_active = false`. The user cannot log in; their data is preserved. Hard deletion is not supported in v1.
- **Reviewer Assignment:** Setting `permit_applications.reviewer_id` to a specific reviewer's `userId`.
- **Audit Log:** The `audit_log` table; append-only; no update or delete operations permitted. Read-only in the admin UI.
- **All-Applications View:** A paginated, filterable, sortable list of every permit application in the system — unrestricted by applicant or reviewer ownership.

### Sub-features

- **PERM-07** — Admin: view all applications
- **ADMN-01** — Admin: create, deactivate, and manage user accounts
- **ADMN-02** — Admin: assign reviewers to permit applications
- **ADMN-03** — Admin: view audit logs

---

### PERM-07: Admin — All Applications View

**Route:** `/admin/applications`

**Process:**
1. `[Admin]` navigates to the all-applications view.
2. `[System]` fetches all applications across all applicants and reviewers (no ownership filter).
3. `[System]` returns a paginated list (default: 25 per page, max 100).
4. `[Frontend]` renders a data table with columns: Reference, Permit Type, Applicant Name, Status, Assigned Reviewer, Submission Date, Last Updated, Actions.
5. `[Admin]` can filter by: Status, Permit Type, Assigned Reviewer (or Unassigned), Date Range (submitted_at).
6. `[Admin]` can sort by: any column.
7. `[Admin]` can click any row to open the application detail view (same view as PERM-06 reviewer detail, with admin access overrides).
8. `[Admin]` can perform reviewer assignment from the table row actions (ADMN-02).

**Outputs (per row):** `id`, `referenceNumber`, `permitType`, `applicantName`, `status`, `assignedReviewerName`, `submittedAt`, `updatedAt`.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Non-admin accesses endpoint | 403 | FORBIDDEN | "Admin access required." |
| Invalid filter parameters | 422 | VALIDATION_ERROR | "Invalid filter value for '{param}'." |

---

### ADMN-01: User Account Management

**Route:** `/admin/users`

**Process — View User List:**
1. `[Admin]` navigates to `/admin/users`.
2. `[System]` returns a paginated list of all users (active and inactive), sorted by `created_at DESC`.
3. `[Frontend]` renders a table: Full Name, Email, Role, Status (Active/Inactive), Created Date, Last Login, Actions.
4. `[Admin]` can filter by: Role, Status (Active/Inactive).
5. `[Admin]` can search by name or email (case-insensitive substring match).

**Process — Create User:**
1. `[Admin]` clicks "Create User".
2. `[Frontend]` opens a modal/form with fields: `fullName`, `email`, `role`, optional `temporaryPassword`.
3. `[Admin]` submits the form.
4. `[System]` validates: unique email, valid role, password complexity (if provided) or generates a temporary password.
5. `[System]` creates the user record with `is_active = true`.
6. `[System]` (if no password provided) sends a "Set Your Password" email to the new user with a password reset link (AUTH-04 flow).
7. `[System]` creates an audit log entry: `{ action: 'USER_CREATED', actor: adminId, targetUserId }`.
8. `[System]` returns `201 Created` with the new user object.

**Process — Deactivate User:**
1. `[Admin]` clicks "Deactivate" on a user row.
2. `[Frontend]` shows confirmation: "Deactivate {name}? They will immediately lose access to the system."
3. `[Admin]` confirms.
4. `[System]` sets `users.is_active = false`.
5. `[System]` revokes all active refresh tokens for that user.
6. `[System]` creates an audit log entry: `{ action: 'USER_DEACTIVATED', actor: adminId, targetUserId }`.
7. `[System]` returns `200 OK`.

**Process — Reactivate User:**
1. `[Admin]` clicks "Reactivate" on an inactive user row.
2. `[System]` sets `users.is_active = true`.
3. `[System]` creates an audit log entry: `{ action: 'USER_REACTIVATED', actor: adminId, targetUserId }`.

**Process — Change User Role:**
1. `[Admin]` clicks "Edit Role" on a user row.
2. `[Frontend]` displays a role selector: `applicant`, `reviewer`, `admin`.
3. `[Admin]` selects new role and confirms.
4. `[System]` updates `users.role`.
5. `[System]` creates an audit log entry: `{ action: 'USER_ROLE_CHANGED', actor: adminId, targetUserId, oldRole, newRole }`.
6. New role takes effect on the user's next token refresh (max 15 minutes for existing sessions).

**Inputs (Create User):**
- `fullName` (string, required): 1–100 characters
- `email` (string, required): Valid email, unique
- `role` (enum, required): `'applicant'` | `'reviewer'` | `'admin'`
- `temporaryPassword` (string, optional): If omitted, system sends password-set email

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Email already exists | 409 | EMAIL_ALREADY_EXISTS | "A user with this email already exists." |
| Invalid role value | 422 | INVALID_ROLE | "Role must be one of: applicant, reviewer, admin." |
| Admin attempts to deactivate themselves | 409 | SELF_DEACTIVATION | "You cannot deactivate your own account." |
| User not found | 404 | USER_NOT_FOUND | "User not found." |
| Non-admin accesses | 403 | FORBIDDEN | "Admin access required." |

---

### ADMN-02: Reviewer Assignment

**Route:** Accessible from `/admin/applications` (inline action) and the application detail view.

**Process:**
1. `[Admin]` selects a permit application.
2. `[Admin]` clicks "Assign Reviewer" (from list row actions or detail header).
3. `[Frontend]` displays a reviewer selector: searchable dropdown showing all active users with `role = 'reviewer'`, their current assigned application count displayed next to their name.
4. `[Admin]` selects a reviewer and confirms.
5. `[System]` validates:
   - Application must not be in a terminal state (`approved`, `rejected`)
   - Selected user must have `role = 'reviewer'` and `is_active = true`
6. `[System]` updates `permit_applications.reviewer_id`.
7. `[System]` creates an audit log entry: `{ action: 'REVIEWER_ASSIGNED', actor: adminId, applicationId, reviewerId, previousReviewerId }`.
8. `[System]` triggers an in-app notification for the assigned reviewer: "You have been assigned application #{ref}."
9. `[System]` returns the updated application.

**Process — Reassignment:**
- Same flow as above; if the application already has a reviewer, the new assignment replaces it.
- The previous reviewer loses access to the application (their assigned queue no longer includes it).
- The outgoing reviewer receives no notification (admin discretion).
- The incoming reviewer receives the assignment notification.

**Inputs:**
- `applicationId` (string, required)
- `reviewerId` (string, required): UUID of an active reviewer

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Application in terminal state | 409 | INVALID_STATUS_TRANSITION | "Cannot assign a reviewer to a completed application." |
| Selected user is not a reviewer | 422 | INVALID_REVIEWER | "The selected user does not have the reviewer role." |
| Selected user is inactive | 422 | USER_INACTIVE | "The selected user's account is inactive." |
| Application not found | 404 | APPLICATION_NOT_FOUND | "Application not found." |
| Non-admin | 403 | FORBIDDEN | "Admin access required." |

---

### ADMN-03: Audit Log

**Route:** `/admin/audit-log`

**Access:** Read-only. The `audit_log` table is append-only; no entries can be edited or deleted — enforced at both the API and database constraint level.

**Process:**
1. `[Admin]` navigates to `/admin/audit-log`.
2. `[System]` returns a paginated log of all audit entries, sorted by `occurred_at DESC` (newest first).
3. `[Frontend]` renders a table: Timestamp, Actor (name + role), Action, Application Reference, Details, IP Address.
4. `[Admin]` can filter by: Actor, Action Type, Application Reference, Date Range.
5. `[Admin]` can search by application reference number.

**Logged Events (complete list):**

| Action Code | Description |
|-------------|------------|
| `USER_CREATED` | Admin created a new user |
| `USER_DEACTIVATED` | Admin deactivated a user |
| `USER_REACTIVATED` | Admin reactivated a user |
| `USER_ROLE_CHANGED` | Admin changed a user's role |
| `APPLICATION_CREATED` | Applicant started a new application (draft created) |
| `APPLICATION_SUBMITTED` | Applicant submitted their application |
| `APPLICATION_STATUS_CHANGED` | Any lifecycle transition with from/to status |
| `REVIEWER_ASSIGNED` | Admin assigned a reviewer |
| `DOCUMENT_UPLOADED` | Document uploaded to an application |
| `DOCUMENT_REMOVED` | Document removed from an application |
| `DOCUMENT_DOWNLOADED` | Document downloaded by a reviewer |
| `MESSAGE_SENT` | Message sent on an application |
| `DECISION_MADE` | Reviewer approved or rejected an application |
| `INFO_REQUEST_SENT` | Reviewer requested additional information |
| `INFO_RESPONSE_SUBMITTED` | Applicant responded to info request |
| `PASSWORD_RESET_REQUESTED` | Password reset link requested |
| `PASSWORD_RESET_COMPLETED` | Password successfully reset |

**Audit Log Entry Object:**
```json
{
  "id": "uuid",
  "action": "REVIEWER_ASSIGNED",
  "actorId": "uuid",
  "actorName": "James Whitfield",
  "actorRole": "admin",
  "applicationId": "uuid",
  "applicationRef": "PMS-00042",
  "details": { "reviewerId": "uuid", "reviewerName": "Diana Osei", "previousReviewerId": null },
  "ipAddress": "192.168.1.1",
  "occurredAt": "2026-07-21T10:00:00Z"
}
```

**Validation:**
- Audit log entries are created by the server only — no client-submitted audit records.
- `occurredAt` is always the server timestamp; client-provided timestamps are not accepted.
- The `details` field is a JSONB blob containing action-specific context; schema varies by action code.

**Pagination:** Cursor-based; `?cursor=<lastId>&limit=50`. Response includes `nextCursor` and `totalCount`.

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Non-admin accesses audit log | 403 | FORBIDDEN | "Admin access required." |
| Invalid filter parameters | 422 | VALIDATION_ERROR | "Invalid filter value for '{param}'." |
| Database error | 500 | SERVER_ERROR | "Failed to load audit log. Please refresh." |

**Schema Surface:** uses tables `users`, `permit_applications`, `audit_log` — see `Y0-schema.md` §Admin.
**API Surface:** see `Y1-api.md` §Admin for full request/response schemas.
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
---

## Y0: Database Schema {#y0}

**Technology:** PostgreSQL (with `uuid-ossp` and `pgcrypto` extensions)

All tables use UUID primary keys. `created_at` and `updated_at` are maintained via triggers on all tables. The `audit_log` table has no update or delete privileges granted at the database level.

---

### §Auth — Authentication & Session Tables

```sql
-- Users table
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('applicant', 'reviewer', 'admin')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Refresh tokens (one active token per user; revoked on logout or deactivation)
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,    -- bcrypt hash of the opaque token
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked     BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- Password reset tokens (single-use, 1-hour expiry)
CREATE TABLE password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,    -- SHA-256 hash of the plaintext token
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prt_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_prt_token_hash ON password_reset_tokens(token_hash);
```

---

### §Permits — Application Tables

```sql
-- Permit type enum
CREATE TYPE permit_type_enum AS ENUM (
  'construction', 'zoning_variance', 'event_permit', 'demolition', 'renovation', 'signage'
);

-- Lifecycle status enum
CREATE TYPE application_status_enum AS ENUM (
  'draft', 'submitted', 'under_review', 'additional_info_needed', 'approved', 'rejected'
);

-- Permit applications
CREATE TABLE permit_applications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number     VARCHAR(20) NOT NULL UNIQUE,  -- e.g., 'PMS-00042', auto-generated
  applicant_id         UUID NOT NULL REFERENCES users(id),
  reviewer_id          UUID REFERENCES users(id),    -- nullable until assigned
  status               application_status_enum NOT NULL DEFAULT 'draft',

  -- Form fields
  permit_type          permit_type_enum NOT NULL,
  project_description  TEXT NOT NULL,
  site_street          VARCHAR(200) NOT NULL,
  site_city            VARCHAR(100) NOT NULL,
  site_state           CHAR(2) NOT NULL,
  site_zip             VARCHAR(10) NOT NULL,
  contact_name         VARCHAR(100) NOT NULL,
  contact_phone        VARCHAR(30) NOT NULL,
  contact_email        VARCHAR(255) NOT NULL,
  estimated_start_date DATE,
  estimated_value      NUMERIC(12,2),
  additional_notes     TEXT,

  -- Lifecycle timestamps
  submitted_at         TIMESTAMPTZ,
  under_review_at      TIMESTAMPTZ,

  -- Info request / response
  info_request_note    TEXT,
  info_request_at      TIMESTAMPTZ,
  info_response_note   TEXT,
  info_response_at     TIMESTAMPTZ,

  -- Decision
  decision_outcome     VARCHAR(10) CHECK (decision_outcome IN ('approved', 'rejected')),
  decision_reason      TEXT,
  decision_at          TIMESTAMPTZ,
  decided_by           UUID REFERENCES users(id),

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pa_applicant_id ON permit_applications(applicant_id);
CREATE INDEX idx_pa_reviewer_id ON permit_applications(reviewer_id);
CREATE INDEX idx_pa_status ON permit_applications(status);
CREATE INDEX idx_pa_submitted_at ON permit_applications(submitted_at);
CREATE INDEX idx_pa_reference_number ON permit_applications(reference_number);

-- Sequence for generating reference numbers
CREATE SEQUENCE permit_reference_seq START 1;
-- reference_number generated as: 'PMS-' || LPAD(nextval('permit_reference_seq')::text, 5, '0')

-- Lifecycle stage history (immutable; one row per transition)
CREATE TABLE lifecycle_stages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
  stage          application_status_enum NOT NULL,
  entered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id       UUID REFERENCES users(id)   -- NULL for system-generated transitions
);

CREATE INDEX idx_ls_application_id ON lifecycle_stages(application_id);
CREATE INDEX idx_ls_entered_at ON lifecycle_stages(entered_at);
```

---

### §Documents — Document Management Tables

```sql
-- Document status enum
CREATE TYPE document_status_enum AS ENUM ('uploaded', 'deleted', 'superseded');

CREATE TABLE documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id      UUID NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
  uploaded_by         UUID NOT NULL REFERENCES users(id),
  filename            VARCHAR(255) NOT NULL,
  mime_type           VARCHAR(100) NOT NULL,
  size_bytes          BIGINT NOT NULL,
  document_type       VARCHAR(100),              -- user-assigned label (e.g., 'Site Plan')
  storage_key         TEXT NOT NULL,             -- S3-compatible object key
  status              document_status_enum NOT NULL DEFAULT 'uploaded',
  superseded_by       UUID REFERENCES documents(id),  -- for replace flow
  uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_docs_application_id ON documents(application_id);
CREATE INDEX idx_docs_status ON documents(status);
CREATE INDEX idx_docs_uploaded_by ON documents(uploaded_by);
```

---

### §Messaging — Message Tables

```sql
CREATE TABLE messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
  sender_id      UUID NOT NULL REFERENCES users(id),
  body           TEXT NOT NULL,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_application_id ON messages(application_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);

-- Message read receipts
CREATE TABLE message_reads (
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

CREATE INDEX idx_mr_user_id ON message_reads(user_id);

-- Message attachments (reviewer-only; stored separately from application documents)
CREATE TABLE message_attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  filename     VARCHAR(255) NOT NULL,
  mime_type    VARCHAR(100) NOT NULL,
  size_bytes   BIGINT NOT NULL,
  storage_key  TEXT NOT NULL,
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ma_message_id ON message_attachments(message_id);
```

---

### §Lifecycle — Notifications

```sql
CREATE TYPE notification_type_enum AS ENUM (
  'STATUS_CHANGE', 'NEW_MESSAGE', 'REVIEWER_ASSIGNED', 'INFO_REQUEST', 'INFO_RESPONSE', 'DECISION_MADE'
);

CREATE TABLE notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES permit_applications(id) ON DELETE CASCADE,
  type           notification_type_enum NOT NULL,
  body           TEXT NOT NULL,
  read           BOOLEAN NOT NULL DEFAULT FALSE,
  read_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user_id ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(user_id, read);
CREATE INDEX idx_notif_created_at ON notifications(created_at);
```

---

### §Admin — Audit Log

```sql
CREATE TABLE audit_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action         VARCHAR(60) NOT NULL,           -- e.g., 'APPLICATION_SUBMITTED'
  actor_id       UUID REFERENCES users(id),      -- NULL for system actions
  actor_role     VARCHAR(20),
  application_id UUID REFERENCES permit_applications(id),
  target_user_id UUID REFERENCES users(id),      -- for user management actions
  details        JSONB,                           -- action-specific context
  ip_address     INET,
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log is INSERT-only: no UPDATE or DELETE granted to application role
-- Enforced via PostgreSQL GRANT:
-- GRANT INSERT, SELECT ON audit_log TO app_role;
-- (No UPDATE or DELETE granted)

CREATE INDEX idx_al_action ON audit_log(action);
CREATE INDEX idx_al_actor_id ON audit_log(actor_id);
CREATE INDEX idx_al_application_id ON audit_log(application_id);
CREATE INDEX idx_al_occurred_at ON audit_log(occurred_at DESC);
```

---

### §Summary — Entity Relationship Overview

```
users
  ├── permit_applications (applicant_id → users.id)
  ├── permit_applications (reviewer_id → users.id)
  ├── documents (uploaded_by → users.id)
  ├── messages (sender_id → users.id)
  ├── notifications (user_id → users.id)
  ├── refresh_tokens (user_id → users.id)
  └── password_reset_tokens (user_id → users.id)

permit_applications
  ├── lifecycle_stages (application_id → permit_applications.id)
  ├── documents (application_id → permit_applications.id)
  ├── messages (application_id → permit_applications.id)
  └── notifications (application_id → permit_applications.id)

messages
  ├── message_reads (message_id → messages.id)
  └── message_attachments (message_id → messages.id)
```
---

## Y1: REST API Endpoints {#y1}

**Base URL:** `/api/v1`
**Content-Type:** `application/json`
**Authentication:** `Authorization: Bearer <accessToken>` on all protected routes
**Error format:** `{ "error": { "code": "ERROR_CODE", "message": "Human-readable message", "details": {} } }`

**Role abbreviations in Access column:** A = Applicant, R = Reviewer, ADM = Admin

---

### §Authentication

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `POST` | `/auth/register` | Public | Create a new user account |
| `POST` | `/auth/login` | Public | Authenticate and receive tokens |
| `POST` | `/auth/logout` | A, R, ADM | Revoke refresh token and clear cookie |
| `POST` | `/auth/refresh` | Cookie | Issue new access token using refresh cookie |
| `POST` | `/auth/forgot-password` | Public | Request password reset email |
| `POST` | `/auth/reset-password` | Public (token) | Submit new password with reset token |

**POST /auth/register — Request:**
```json
{
  "fullName": "Marcus Rivera",
  "email": "marcus@example.com",
  "password": "Secure@Pass1",
  "confirmPassword": "Secure@Pass1"
}
```
**Response 201:**
```json
{
  "accessToken": "eyJ...",
  "user": { "id": "uuid", "email": "marcus@example.com", "fullName": "Marcus Rivera", "role": "applicant" }
}
```

**POST /auth/login — Request:**
```json
{ "email": "marcus@example.com", "password": "Secure@Pass1" }
```
**Response 200:** Same shape as register response.

**POST /auth/refresh — Request:** (No body; uses HTTP-only cookie)
**Response 200:** `{ "accessToken": "eyJ..." }`

---

### §Permits

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `POST` | `/permits` | A | Create a new permit application (draft) |
| `GET` | `/permits` | A | List all applications for the current applicant |
| `GET` | `/permits/:id` | A, R, ADM | Get full application detail |
| `PATCH` | `/permits/:id` | A | Update draft application fields (auto-save) |
| `POST` | `/permits/:id/submit` | A | Submit a draft application |
| `GET` | `/permits/review-queue` | R, ADM | Reviewer: list assigned + available applications |
| `GET` | `/admin/permits` | ADM | Admin: list all applications |
| `POST` | `/permits/:id/actions/begin-review` | R, ADM | Transition: submitted → under_review |
| `POST` | `/permits/:id/actions/request-info` | R, ADM | Transition: under_review → additional_info_needed |
| `POST` | `/permits/:id/actions/respond-to-info` | A | Transition: additional_info_needed → under_review |
| `POST` | `/permits/:id/actions/decide` | R, ADM | Transition: under_review → approved or rejected |
| `PATCH` | `/permits/:id/assign-reviewer` | ADM | Assign or reassign a reviewer |

**POST /permits — Request:**
```json
{
  "permitType": "construction",
  "projectDescription": "Two-story residential addition...",
  "siteAddress": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "CA",
    "zipCode": "90210"
  },
  "contactName": "Marcus Rivera",
  "contactPhone": "+1-555-555-1234",
  "contactEmail": "marcus@example.com",
  "estimatedStartDate": "2026-09-01",
  "estimatedValue": 150000,
  "additionalNotes": "..."
}
```
**Response 201:** Full `ApplicationObject`.

**GET /permits — Query params:**
- `status`: filter by status (comma-separated for multiple)
- `cursor`: for pagination
- `limit`: items per page (default 20, max 100)

**Response 200:**
```json
{
  "data": [ ApplicationObject, ... ],
  "nextCursor": "uuid-or-null",
  "totalCount": 42
}
```

**POST /permits/:id/actions/request-info — Request:**
```json
{ "infoRequestNote": "Please provide the updated site plan with dimensions." }
```
**Response 200:** Updated `ApplicationObject`.

**POST /permits/:id/actions/decide — Request:**
```json
{ "outcome": "approved", "decisionReason": "All requirements met. Site plan approved." }
```
**Response 200:** Updated `ApplicationObject`.

**PATCH /permits/:id/assign-reviewer — Request:**
```json
{ "reviewerId": "uuid-of-reviewer" }
```
**Response 200:** Updated `ApplicationObject`.

---

### §Documents

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `POST` | `/permits/:id/documents/upload-url` | A | Get presigned PUT URL for direct upload |
| `POST` | `/permits/:id/documents` | A | Register document metadata after upload |
| `GET` | `/permits/:id/documents` | A, R, ADM | List all documents for an application |
| `GET` | `/permits/:id/documents/:docId/url` | A, R, ADM | Get presigned GET URL for preview/download |
| `DELETE` | `/permits/:id/documents/:docId` | A | Soft-delete a document (draft/info_needed only) |
| `GET` | `/permits/:id/documents/archive` | R, ADM | Request ZIP download of all documents |

**POST /permits/:id/documents/upload-url — Request:**
```json
{ "filename": "site-plan.pdf", "mimeType": "application/pdf", "sizeBytes": 2048000 }
```
**Response 200:**
```json
{
  "uploadUrl": "https://s3.example.com/...",
  "storageKey": "documents/{appId}/{uuid}.pdf",
  "expiresAt": "2026-07-21T10:15:00Z"
}
```

**POST /permits/:id/documents — Request:**
```json
{
  "filename": "site-plan.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 2048000,
  "documentType": "Site Plan",
  "storageKey": "documents/{appId}/{uuid}.pdf"
}
```
**Response 201:** `DocumentObject`.

**GET /permits/:id/documents/:docId/url — Response 200:**
```json
{ "url": "https://s3.example.com/presigned-url...", "expiresAt": "2026-07-21T10:15:00Z" }
```

---

### §Messaging

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/permits/:id/messages` | A, R, ADM | List messages for an application (paginated) |
| `POST` | `/permits/:id/messages` | A, R | Send a message |
| `GET` | `/permits/:id/messages/unread-count` | A, R | Get unread message count for this application |
| `POST` | `/permits/:id/messages/:msgId/read` | A, R | Mark a message as read |
| `POST` | `/permits/:id/messages/:msgId/attachments/upload-url` | R | Get presigned URL for message attachment upload |
| `POST` | `/permits/:id/messages/:msgId/attachments` | R | Register message attachment metadata |

**POST /permits/:id/messages — Request:**
```json
{
  "body": "Please see the updated site plan attached.",
  "attachments": []
}
```
**Response 201:** `MessageObject`.

**GET /permits/:id/messages — Query params:** `cursor`, `limit` (default 50).
**Response 200:** `{ "data": [ MessageObject, ... ], "nextCursor": "...", "totalCount": 12 }`

**GET /permits/:id/messages/unread-count — Response 200:**
```json
{ "unreadCount": 3 }
```

---

### §Status & Lifecycle

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/permits/:id/lifecycle` | A, R, ADM | Get all lifecycle stage entries for an application |
| `GET` | `/notifications` | A, R | List notifications for the current user |
| `GET` | `/notifications/unread-count` | A, R | Get total unread notification count |
| `PATCH` | `/notifications/:notifId/read` | A, R | Mark a notification as read |
| `PATCH` | `/notifications/read-all` | A, R | Mark all notifications as read |

**GET /permits/:id/lifecycle — Response 200:**
```json
{
  "stages": [
    {
      "id": "uuid",
      "stage": "submitted",
      "enteredAt": "2026-07-20T09:00:00Z",
      "actorId": "uuid",
      "actorRole": "applicant"
    }
  ]
}
```

**GET /notifications — Query params:** `cursor`, `limit` (default 50), `read` (filter: `true`/`false`).

---

### §Dashboards

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/dashboard/applicant` | A | Applicant dashboard data |
| `GET` | `/dashboard/reviewer` | R | Reviewer dashboard data |
| `GET` | `/dashboard/admin` | ADM | Admin dashboard data |

**GET /dashboard/applicant — Response 200:**
```json
{
  "summaryCards": {
    "activeApplications": 4,
    "actionRequired": 1,
    "unreadMessages": 3
  },
  "recentApplications": [ ApplicationSummaryObject, ... ],
  "pendingActions": [ ApplicationSummaryObject, ... ],
  "activityFeed": [ NotificationObject, ... ]
}
```

**GET /dashboard/reviewer — Response 200:**
```json
{
  "summaryCards": {
    "assignedApplications": 12,
    "awaitingResponse": 2,
    "unassignedInPool": 5,
    "unreadMessages": 8
  },
  "priorityQueue": [ ReviewQueueItemObject, ... ],
  "atRiskApplications": [ ReviewQueueItemObject, ... ],
  "activityFeed": [ AuditEventObject, ... ]
}
```

**GET /dashboard/admin — Response 200:**
```json
{
  "summaryCards": {
    "totalApplications": 120,
    "activeApplications": 45,
    "submittedThisWeek": 12,
    "decisionsThisWeek": 8
  },
  "statusDistribution": [
    { "status": "submitted", "count": 10 },
    { "status": "under_review", "count": 22 }
  ],
  "reviewerWorkload": [
    { "reviewerId": "uuid", "reviewerName": "Diana Osei", "assigned": 15, "underReview": 8, "additionalInfoNeeded": 2, "decidedThisWeek": 5 }
  ],
  "recentActivity": [ AuditEventObject, ... ]
}
```

---

### §Admin

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| `GET` | `/admin/users` | ADM | List all users |
| `POST` | `/admin/users` | ADM | Create a new user |
| `PATCH` | `/admin/users/:userId` | ADM | Update user (role, is_active) |
| `GET` | `/admin/users/:userId` | ADM | Get user detail |
| `GET` | `/admin/audit-log` | ADM | List audit log entries |
| `GET` | `/admin/permits` | ADM | List all applications (see §Permits) |

**POST /admin/users — Request:**
```json
{
  "fullName": "Diana Osei",
  "email": "diana@municipality.gov",
  "role": "reviewer",
  "temporaryPassword": "TempPass@1!"
}
```
**Response 201:** `UserObject`.

**PATCH /admin/users/:userId — Request (deactivate):**
```json
{ "isActive": false }
```
**PATCH /admin/users/:userId — Request (role change):**
```json
{ "role": "reviewer" }
```
**Response 200:** Updated `UserObject`.

**GET /admin/audit-log — Query params:** `action`, `actorId`, `applicationId`, `cursor`, `limit` (default 50), `from`, `to` (date range).
**Response 200:** `{ "data": [ AuditLogEntry, ... ], "nextCursor": "...", "totalCount": 1042 }`

---

### §Error Response Format (all endpoints)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'email' is required.",
    "details": {
      "field": "email",
      "constraint": "required"
    }
  }
}
```

For validation errors with multiple fields:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {
      "fields": [
        { "field": "email", "message": "Please enter a valid email address." },
        { "field": "password", "message": "Password must be 8–128 characters." }
      ]
    }
  }
}
```
---

## Y2: Cross-Feature Error Catalog {#y2}

This catalog covers all error codes returned by the API, organized by category. Each entry includes the HTTP status code, the `error.code` string returned in the JSON body, the human-readable message, retry guidance, and the features that can produce this error.

---

### Authentication Errors

| HTTP | Error Code | Message | Retry? | Features |
|------|-----------|---------|--------|---------|
| 401 | `UNAUTHORIZED` | "Authentication required." | No — redirect to login | All protected endpoints |
| 401 | `TOKEN_INVALID` | "Invalid token." | No — redirect to login | All protected endpoints |
| 401 | `TOKEN_EXPIRED` | "Token expired. Please refresh your session." | Yes — call `/auth/refresh` | All protected endpoints |
| 401 | `INVALID_CREDENTIALS` | "Invalid email or password." | No | AUTH-01, AUTH-02 |
| 401 | `SESSION_EXPIRED` | "Your session has expired. Please log in again." | No — redirect to login | AUTH-02 |
| 403 | `FORBIDDEN` | "You do not have permission to access this resource." | No | AUTH-05, all role-gated endpoints |
| 403 | `ACCOUNT_INACTIVE` | "Your account has been deactivated. Contact support." | No | AUTH-02, AUTH-05 |
| 400 | `RESET_TOKEN_EXPIRED` | "This password reset link has expired. Please request a new one." | No — request new link | AUTH-04 |
| 400 | `RESET_TOKEN_USED` | "This password reset link has already been used." | No | AUTH-04 |
| 400 | `RESET_TOKEN_INVALID` | "This password reset link is invalid." | No | AUTH-04 |

---

### Validation Errors

| HTTP | Error Code | Message | Retry? | Features |
|------|-----------|---------|--------|---------|
| 422 | `VALIDATION_ERROR` | "Field '{field}' is required." (or field-specific message) | Yes — fix and resubmit | All endpoints |
| 422 | `INVALID_EMAIL` | "Please enter a valid email address." | Yes | AUTH-01, AUTH-04, PERM-01 |
| 422 | `INVALID_PHONE` | "Please enter a valid phone number." | Yes | PERM-01 |
| 422 | `INVALID_ZIPCODE` | "Please enter a valid US ZIP code." | Yes | PERM-01 |
| 422 | `INVALID_PERMIT_TYPE` | "'{value}' is not a valid permit type." | Yes | PERM-01 |
| 422 | `INVALID_ROLE` | "Role must be one of: applicant, reviewer, admin." | Yes | ADMN-01 |
| 422 | `INVALID_REVIEWER` | "The selected user does not have the reviewer role." | Yes | ADMN-02 |
| 422 | `PASSWORD_TOO_WEAK` | "Password must be 8–128 characters with uppercase, lowercase, digit, and special character." | Yes | AUTH-01, AUTH-04 |
| 422 | `PASSWORD_MISMATCH` | "Passwords do not match." | Yes | AUTH-01, AUTH-04 |
| 422 | `RESPONSE_REQUIRED` | "Please upload a document or provide a written response before re-submitting." | Yes | STAT-05 |
| 422 | `USER_INACTIVE` | "The selected user's account is inactive." | No | ADMN-02 |

---

### Conflict Errors

| HTTP | Error Code | Message | Retry? | Features |
|------|-----------|---------|--------|---------|
| 409 | `EMAIL_ALREADY_EXISTS` | "An account with this email already exists." | No | AUTH-01, ADMN-01 |
| 409 | `INVALID_STATUS_TRANSITION` | "This action is not valid for the application's current status." | No — review current status | STAT-01–06 |
| 409 | `APPLICATION_NOT_EDITABLE` | "Submitted applications cannot be edited through this endpoint." | No | PERM-02, DOCS-01, DOCS-04 |
| 409 | `MESSAGING_NOT_AVAILABLE` | "Messaging is available once an application has been submitted." | No | MSG-01 |
| 409 | `SELF_DEACTIVATION` | "You cannot deactivate your own account." | No | ADMN-01 |
| 409 | `CONFLICT` | "This application was modified in another session. Refresh to see the latest." | Yes — refresh and retry | PERM-02 |

---

### Not Found Errors

| HTTP | Error Code | Message | Retry? | Features |
|------|-----------|---------|--------|---------|
| 404 | `APPLICATION_NOT_FOUND` | "Application not found." | No | PERM-03–06, all /permits/:id |
| 404 | `DOCUMENT_NOT_FOUND` | "Document not found." | No | DOCS-03, DOCS-04, DOCS-05 |
| 404 | `USER_NOT_FOUND` | "User not found." | No | ADMN-01 |

---

### File & Storage Errors

| HTTP | Error Code | Message | Retry? | Features |
|------|-----------|---------|--------|---------|
| 422 | `INVALID_FILE_TYPE` | "Only PDF, JPEG, PNG, and DOCX files are accepted." | Yes — upload correct file type | DOCS-01, MSG-04 |
| 422 | `FILE_TOO_LARGE` | "This file exceeds the 25 MB limit. Please compress or split the file." | Yes — reduce file size | DOCS-01, MSG-04 |
| 422 | `STORAGE_LIMIT_EXCEEDED` | "This application has reached the 100 MB document limit." | No | DOCS-01 |
| 422 | `TOO_MANY_DOCUMENTS` | "Maximum 20 documents per application." | No | DOCS-01 |
| 422 | `TOO_MANY_ATTACHMENTS` | "A maximum of 5 attachments per message is allowed." | No | MSG-04 |
| 410 | `UPLOAD_URL_EXPIRED` | "The upload session expired. Please try uploading again." | Yes — request new upload URL | DOCS-01 |
| 502 | `STORAGE_UPLOAD_FAILED` | "Document upload failed. Please try again." | Yes — retry upload | DOCS-01 |
| 502 | `STORAGE_FETCH_FAILED` | "Download failed. Please try again." | Yes — retry | DOCS-03, DOCS-05 |
| 502 | `STORAGE_URL_FAILED` | "Preview unavailable. Try downloading the file." | Yes — retry | DOCS-03 |

---

### Authorization Errors (Resource-Level)

| HTTP | Error Code | Message | Retry? | Features |
|------|-----------|---------|--------|---------|
| 403 | `FORBIDDEN` | "You do not have permission to view this application." | No | PERM-04, PERM-06, DOCS-05 |
| 403 | `FORBIDDEN` | "You are not authorized to message on this application." | No | MSG-01 |
| 403 | `FORBIDDEN` | "Only the assigned reviewer or an admin can make a decision." | No | STAT-06 |
| 403 | `FORBIDDEN` | "Only reviewers can attach files to messages." | No | MSG-04 |
| 403 | `FORBIDDEN` | "Admin access required." | No | PERM-07, ADMN-01–03 |

---

### Server Errors

| HTTP | Error Code | Message | Retry? | Features |
|------|-----------|---------|--------|---------|
| 500 | `SERVER_ERROR` | "An unexpected error occurred. Please try again." | Yes — after brief delay | Any endpoint |
| 500 | `REGISTRATION_FAILED` | "Registration failed. Please try again." | Yes | AUTH-01 |
| 503 | `SERVICE_UNAVAILABLE` | "The service is temporarily unavailable. Please try again later." | Yes — with backoff | Any endpoint |

---

### Client-Side Error Handling Guidelines

1. **401 TOKEN_EXPIRED:** Frontend middleware intercepts and calls `POST /auth/refresh` transparently. If refresh succeeds, the original request is retried. If refresh fails (401), redirect to `/login`.
2. **401/403 on any protected route:** Display error message; do not show partial data. For 403, show "Access Denied" page — not a 404 (avoid leaking resource existence).
3. **422 VALIDATION_ERROR:** Display errors inline on the relevant form field(s); move focus to error summary if multiple fields fail.
4. **409 INVALID_STATUS_TRANSITION:** Refresh the application detail page to show the current status; the action button that triggered this may no longer be visible after refresh.
5. **500/503:** Show a user-friendly error card with a "Try Again" button; log error details to monitoring.
6. **Storage errors (502):** Retry button on the upload or download action; do not show raw error details to the user.
---

## Y3: External Integration Points {#y3}

This document describes all external systems the Permit Management System v1 depends on, along with integration contracts, failure modes, and fallback behavior.

---

### §Email — Transactional Email Service

**Purpose:** Sending password reset emails (AUTH-04). No other email notifications in v1 (email notifications are a v2 feature per REQUIREMENTS.md).

**Trigger Points:**

| Event | Email Type | Recipient | Content |
|-------|-----------|-----------|---------|
| AUTH-04: Password reset requested | Password Reset | The requesting user's email | Subject: "Reset your Permit Management System password" · Body: Reset link with 1-hour expiry token |
| ADMN-01: Admin creates user without temp password | Account Setup | The new user's email | Subject: "Set up your Permit Management System account" · Body: Password set link (uses AUTH-04 reset flow) |

**Integration Requirements:**
- Use a transactional email provider (e.g., SendGrid, Postmark, AWS SES)
- Emails sent asynchronously from a background queue — the API response does not wait for email delivery confirmation
- From address: configurable via environment variable (`EMAIL_FROM_ADDRESS`)
- Reply-to: configurable via environment variable (`EMAIL_REPLY_TO`)
- All email sends are logged in the audit log: `{ action: 'EMAIL_SENT', details: { template, recipientId } }` (no plaintext content logged)

**Failure Handling:**
- If the email service is unavailable: the password reset token is still created in the database (the API responds 200 to prevent enumeration); the email send is queued for retry (3 attempts, exponential backoff: 1min, 5min, 15min)
- If all retries fail: log the failure; do NOT surface the error to the user (they can request a new reset link)
- Never expose email delivery status to the public endpoint response

**Configuration (environment variables):**

| Variable | Description |
|----------|------------|
| `EMAIL_PROVIDER` | Provider name: `sendgrid`, `postmark`, or `ses` |
| `EMAIL_API_KEY` | API key for the chosen provider |
| `EMAIL_FROM_ADDRESS` | e.g., `noreply@permits.municipality.gov` |
| `EMAIL_REPLY_TO` | e.g., `support@permits.municipality.gov` |

---

### §Object Storage — S3-Compatible File Storage

**Purpose:** Storing all uploaded documents (DOCS-01) and message attachments (MSG-04). The API server never handles file binary data directly — all uploads go directly from the client browser to object storage via presigned URLs.

**Storage Layout:**

| Path Pattern | Contents |
|-------------|---------|
| `documents/{applicationId}/{uuid}.{ext}` | Application documents |
| `message-attachments/{applicationId}/{messageId}/{uuid}.{ext}` | Message attachments |

**Bucket Configuration:**
- Bucket is private (no public access)
- Server-side encryption enabled (AES-256 or KMS)
- Versioning enabled (allows recovery of accidentally deleted objects)
- Lifecycle policy: objects in `deleted` status (soft-deleted documents) are permanently removed after 30 days
- CORS configured to allow PUT from the application's frontend origin (for direct upload)

**Presigned URL Specifications:**

| URL Type | Method | Expiry | Use |
|----------|--------|--------|-----|
| Upload URL | PUT | 15 minutes | Client uploads file directly |
| Download/Preview URL | GET | 15 minutes | Client previews or downloads file |
| Archive URL (bulk download) | GET | 60 minutes | ZIP of all documents for an application |

**Configuration (environment variables):**

| Variable | Description |
|----------|------------|
| `STORAGE_PROVIDER` | `s3`, `gcs`, or `minio` |
| `STORAGE_BUCKET` | Bucket name |
| `STORAGE_REGION` | AWS region (or equivalent) |
| `STORAGE_ACCESS_KEY_ID` | Access key |
| `STORAGE_SECRET_ACCESS_KEY` | Secret key |
| `STORAGE_ENDPOINT` | Custom endpoint URL (for MinIO or S3-compatible services) |

**Failure Handling:**
- If presigned URL generation fails: return `502 STORAGE_URL_FAILED` to the client; log the error
- If the client PUT to the presigned URL fails: client-side retry up to 3 times; if all fail, surface `STORAGE_UPLOAD_FAILED` error
- Document metadata is only registered in the database (`POST /permits/:id/documents`) after the upload succeeds — dangling metadata without actual file objects is prevented
- If bulk ZIP generation fails: return a 502 error with retry guidance

---

### §Database — PostgreSQL

**Purpose:** Primary data store for all application data.

**Connection:** Via connection pool (e.g., `pg-pool` or Prisma's connection pool). Pool size: min 2, max 20 (configurable).

**Configuration (environment variables):**

| Variable | Description |
|----------|------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DB_POOL_MIN` | Minimum pool connections (default: 2) |
| `DB_POOL_MAX` | Maximum pool connections (default: 20) |

**Backup:** Database backups are the responsibility of the hosting infrastructure (not in application scope). Recommended: daily automated backups with 30-day retention, and point-in-time recovery (PITR) enabled.

**Failure Handling:**
- Connection pool exhaustion: return `503 SERVICE_UNAVAILABLE`; alert monitoring
- Query timeout (> 5s): return `503 SERVICE_UNAVAILABLE`; log query details for investigation
- Database unavailable: fail fast with `503`; do not mask errors as empty data responses

---

### §Monitoring & Logging

**Purpose:** Error tracking, performance monitoring, and structured logging for operational visibility.

**Recommended integrations (provider-agnostic — implementation choice):**

| Integration Type | Example Providers | Data Captured |
|-----------------|------------------|--------------|
| Error tracking | Sentry, Bugsnag, Rollbar | Uncaught exceptions, API errors, stack traces |
| Structured logging | Winston + CloudWatch, Pino + Datadog | All API requests (method, path, status, duration), all errors |
| Performance monitoring | Datadog APM, New Relic, Jaeger | API response times, DB query times, p50/p95/p99 latencies |

**Logging Requirements:**
- All API requests logged: method, path, query params (sanitized), response status, duration, user ID (if authenticated)
- All errors logged at ERROR level: error code, message, stack trace, request context
- Sensitive data (passwords, tokens, full email addresses) never logged
- Audit log events (Y0 §Admin) are stored in the database — separate from application logs

**Configuration (environment variables):**

| Variable | Description |
|----------|------------|
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` |
| `SENTRY_DSN` | Sentry DSN for error tracking (optional) |
| `NODE_ENV` | `development`, `test`, `production` |

---

### §Out-of-Scope Integrations (v1 — not implemented)

The following integration points are explicitly out of scope for v1:

| Integration | Reason Deferred |
|-------------|----------------|
| Email notifications for status changes | v2 feature (NOTF-01); in-app only for v1 |
| Payment gateway (Stripe, PayPal) | PCI-DSS compliance complexity; v2 (PAY-01) |
| OAuth / SSO (Google, Microsoft Azure AD) | Email/password sufficient for v1; reduces complexity |
| Public REST API / webhooks | Not required for v1; increases attack surface |
| GIS / mapping APIs for site address validation | Address is free-text + zip validation only for v1 |
| Document virus/malware scanning | Recommended in PRD but deferred; server-side MIME type validation is v1 security gate |
| Multi-factor authentication (MFA) | Post-v1; email/password + strong passwords sufficient for initial launch |
