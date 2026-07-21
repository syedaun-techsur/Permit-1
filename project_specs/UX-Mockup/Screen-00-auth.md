## Screen Designs — Authentication

---

### Screen-00: Sign In

**Route:** `/login`
**Purpose:** Authenticate existing users; entry point for password reset and account creation
**User Stories:** US-0.2, US-0.3, US-0.4

#### Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    ◈  PermitFlow                    │  ← centered logo, text-primary-500
│                                                     │
│         ┌──────────────────────────────────┐        │
│         │  Sign in to your account         │        │  ← H2, text-text-900, font-semibold
│         │  New here? Create an account →   │        │  ← text-sm, link text-primary-500
│         │                                  │        │
│         │  Email address                   │        │  ← label
│         │  ┌────────────────────────────┐  │        │
│         │  │ marcus@riveraconstruct.com  │  │        │  ← input h-10
│         │  └────────────────────────────┘  │        │
│         │                                  │        │
│         │  Password                        │        │
│         │  ┌──────────────────────────┬──┐ │        │
│         │  │ ••••••••••••             │👁 │ │        │  ← show/hide toggle
│         │  └──────────────────────────┴──┘ │        │
│         │  Forgot password?                │        │  ← right-aligned link
│         │                                  │        │
│         │  [  Sign In  ] ← primary button  │        │  ← full width, h-11
│         │                                  │        │
│         │  ┌────────────────────────────┐  │        │  ← error state (hidden by default)
│         │  │ ✗ Email or password is     │  │        │
│         │  │   incorrect                │  │        │
│         │  └────────────────────────────┘  │        │
│         └──────────────────────────────────┘        │
│                                                     │
│              © 2026 City Permitting Office          │  ← footer text-xs text-text-500
└─────────────────────────────────────────────────────┘
```

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Default | Empty fields, Sign In enabled | N/A |
| Typing | Focus ring on active field (ring-2 ring-primary-500) | Real-time |
| Submitting | Button shows spinner, disabled; fields disabled | "Signing in…" |
| Error | Red error banner below password field | "Email or password is incorrect" |
| Locked (5 attempts) | Red banner + countdown timer | "Account locked. Try again in 14 minutes." |

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | Email + Password fields + Sign In CTA | Center card |
| Secondary | "Create account" link | Below heading |
| Tertiary | Forgot password, footer | Below form, bottom |

#### Interaction Notes

- **Password toggle:** Eye icon button (44×44px touch target) toggles `type=password` / `type=text`; `aria-label="Show password"` toggles to `"Hide password"`
- **Submit on Enter:** `<form>` with `onSubmit`; Enter in any field submits
- **Error state:** Red banner replaces the success state; does not specify which field is wrong (security)
- **Auto-redirect:** On valid credentials, immediate redirect with no intermediate screen

---

### Screen-01: Sign Up

**Route:** `/register`
**Purpose:** Create a new applicant account (default role)
**User Stories:** US-0.1

#### Layout

```
┌─────────────────────────────────────────────────────┐
│                    ◈  PermitFlow                    │
│                                                     │
│         ┌──────────────────────────────────┐        │
│         │  Create your account             │        │
│         │  Already have one? Sign in →     │        │
│         │                                  │        │
│         │  Full name                       │        │
│         │  ┌────────────────────────────┐  │        │
│         │  │ Marcus Rivera              │  │        │
│         │  └────────────────────────────┘  │        │
│         │                                  │        │
│         │  Work email address             │        │
│         │  ┌────────────────────────────┐  │        │
│         │  │                            │  │        │
│         │  └────────────────────────────┘  │        │
│         │                                  │        │
│         │  Password                        │        │
│         │  ┌──────────────────────────┬──┐ │        │
│         │  │                          │👁 │ │        │
│         │  └──────────────────────────┴──┘ │        │
│         │  ●●●○○  Strength: Good           │        │  ← strength indicator (5 dots)
│         │  Min 8 characters, one uppercase │        │  ← helper text
│         │                                  │        │
│         │  [  Create Account  ]            │        │
│         │                                  │        │
│         │  By continuing, you agree to the │        │
│         │  Terms of Service & Privacy      │        │  ← text-xs, links to policy pages
│         └──────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

#### Password Strength Indicator

```
Weak   : ●○○○○  text-red-500
Fair   : ●●○○○  text-orange-500
Good   : ●●●○○  text-amber-500
Strong : ●●●●○  text-emerald-500
Secure : ●●●●●  text-emerald-600
```

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Default | Empty fields | N/A |
| Field error (blur) | Red border + error text beneath field | "Email is required" / "Password too short" |
| Duplicate email (submit) | Error banner | "An account with this email already exists" |
| Submitting | Button spinner + disabled | "Creating account…" |
| Success | Redirect to dashboard + toast | "Welcome to PermitFlow, Marcus!" |

---

### Screen-02: Forgot Password

**Route:** `/forgot-password`
**Purpose:** Initiate password reset via email
**User Stories:** US-0.4

#### Layout

```
┌─────────────────────────────────────────────────────┐
│                    ◈  PermitFlow                    │
│                                                     │
│         ┌──────────────────────────────────┐        │
│         │  Reset your password             │        │
│         │                                  │        │
│         │  Enter your email and we'll send │        │
│         │  you a link to reset your        │        │
│         │  password.                       │        │
│         │                                  │        │
│         │  Email address                   │        │
│         │  ┌────────────────────────────┐  │        │
│         │  │                            │  │        │
│         │  └────────────────────────────┘  │        │
│         │                                  │        │
│         │  [  Send Reset Link  ]           │        │
│         │  ← Back to sign in              │        │  ← link
│         │                                  │        │
│         │  ┌────────────────────────────┐  │        │  ← Success state
│         │  │ ✓ Check your email         │  │        │
│         │  │   A reset link is on its   │  │        │
│         │  │   way if that email exists │  │        │
│         │  └────────────────────────────┘  │        │
│         └──────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

#### Screen-02b: Reset Password Form

**Route:** `/reset-password/:token`

```
┌─────────────────────────────────────────────────────┐
│                    ◈  PermitFlow                    │
│                                                     │
│         ┌──────────────────────────────────┐        │
│         │  Set a new password              │        │
│         │                                  │        │
│         │  New password                    │        │
│         │  ┌──────────────────────────┬──┐ │        │
│         │  │                          │👁 │ │        │
│         │  └──────────────────────────┴──┘ │        │
│         │  ●●●●○ Strength: Strong           │        │
│         │                                  │        │
│         │  Confirm new password            │        │
│         │  ┌──────────────────────────┬──┐ │        │
│         │  │                          │👁 │ │        │
│         │  └──────────────────────────┴──┘ │        │
│         │  ✗ Passwords do not match        │        │  ← error state
│         │                                  │        │
│         │  [  Update Password  ]           │        │
│         └──────────────────────────────────┘        │
│                                                     │
│  ┌──── Expired link state ────────────────────────┐ │
│  │ ✗ This link has expired or already been used.  │ │
│  │   Request a new reset link →                   │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

*End of Screen-00-auth.md*
