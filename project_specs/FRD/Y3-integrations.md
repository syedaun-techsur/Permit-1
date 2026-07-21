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
