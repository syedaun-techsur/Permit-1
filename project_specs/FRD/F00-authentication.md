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
