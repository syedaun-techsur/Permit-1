## User Flows — Authentication

### Flow-00: Sign Up → Verify → Dashboard

**Trigger:** New user lands on `/register` (linked from Sign In or direct URL)
**User Stories:** US-0.1

```
[Landing / Sign In Page]
        │
        ▼ click "Create account"
[Sign Up Form]
        │
        ├─ Validation error ──▶ [Inline field errors] ──▶ [Fix & retry]
        │
        ▼ valid submit
[Account Created — Success State]
        │
        ▼ auto-redirect (role-based)
[Applicant/Reviewer/Admin Dashboard]
```

**Steps:**
1. User visits `/register`; form shows Name, Email, Password fields
2. Password strength meter appears as user types
3. On blur, each field validates inline (error beneath field)
4. On submit with errors: error summary banner at top + fields highlighted
5. On success: toast "Account created — welcome!" + redirect to dashboard

---

### Flow-01: Sign In → Dashboard

**Trigger:** User visits `/login` or is redirected from protected route
**User Stories:** US-0.2

```
[Sign In Page]
        │
        ├─ Invalid credentials ──▶ [Error banner: "Email or password is incorrect"]
        │
        ├─ 5th failed attempt ──▶ [Account locked message + countdown]
        │
        ▼ valid credentials
[Role-based redirect]
        ├─ Applicant ──▶ /dashboard
        ├─ Reviewer  ──▶ /dashboard (reviewer variant)
        └─ Admin     ──▶ /admin/dashboard
```

---

### Flow-02: Forgot Password → Reset

**Trigger:** User clicks "Forgot password?" on Sign In
**User Stories:** US-0.4

```
[Sign In Page] ──▶ [Forgot Password Form]
                          │
                          ▼ submit email
                   [Success message — always shown]
                   "If an account exists, you'll receive
                    a reset link shortly."
                          │
                          ▼ user opens email → clicks link
                   [Reset Password Form]
                          │
                          ├─ Expired/used link ──▶ [Error: "Link expired — request a new one"]
                          │
                          ▼ valid new password
                   [Sign In page — "Password updated" banner]
```

---

*End of Flow-00-auth.md*
