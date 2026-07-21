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
