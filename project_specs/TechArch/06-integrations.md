---

## 7. Integration Points

### 7.1 External Systems

| System | Purpose | Integration Method | v1 / v2 |
|--------|---------|-------------------|---------|
| S3-Compatible Object Storage | Document binary storage | AWS SDK v3 (`@aws-sdk/client-s3`); presigned URLs | v1 |
| SMTP / Transactional Email | Password reset emails | Nodemailer + SendGrid / SES / Resend | v1 (reset only); v2 (notifications) |
| (Future) Stripe / payment processor | Permit fee payments | REST API + webhooks | v2 |
| (Future) ClamAV / malware scanner | Document security scanning | S3 event trigger → Lambda → scan service | v2 |
| (Future) Analytics / reporting | Admin analytics dashboards | Data warehouse or BI tool (Metabase) | v2 |

---

### 7.2 S3-Compatible Object Storage Integration

**Bucket structure:**
```
permit-documents/
└── {application_id}/
    └── {document_id}/
        └── {sanitized_filename}
```

**Operations performed by the API:**

| Operation | SDK Method | When |
|-----------|-----------|------|
| Generate upload URL | `getSignedUrl(PutObjectCommand)` | `POST /documents/presign` |
| Generate download URL | `getSignedUrl(GetObjectCommand)` | `GET /documents/:id/download` |
| Delete object | `DeleteObjectCommand` | Document soft-deleted + background job |
| Check object exists | `HeadObjectCommand` | Optional confirm validation |

**Bucket policy (enforce private-only access):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::permit-documents/*",
      "Condition": {
        "StringNotEquals": {
          "s3:authType": "REST-QUERY-STRING"
        }
      }
    }
  ]
}
```

This ensures all access goes through presigned URLs — direct public GET requests are denied.

---

### 7.3 Email Integration (Password Reset)

For v1, the only email sent is the password reset link. The system uses a transactional email provider to avoid SMTP deliverability issues.

**Recommended provider:** Resend (developer-friendly, generous free tier) or AWS SES (if already in AWS ecosystem).

**Password reset email flow:**
```
1. POST /auth/forgot-password { email }
2. Server: generate secure random token (crypto.randomBytes(32))
3. Server: store SHA-256(token) in password_reset_tokens with 1h expiry
4. Server: email link: https://app.example.com/reset-password?token={raw_token}
5. User clicks link → POST /auth/reset-password { token, newPassword }
6. Server: SHA-256(token) lookup → validate expiry and used_at
7. Server: bcrypt.hash(newPassword), update user.password_hash
8. Server: mark token as used (set used_at = NOW())
9. Server: invalidate any existing refresh tokens for this user
```

---

### 7.4 Environment Configuration

```bash
# ─── App ─────────────────────────────────────────────────
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.example.com

# ─── Database ────────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/permit_db?sslmode=require

# ─── JWT ─────────────────────────────────────────────────
JWT_ACCESS_SECRET=<256-bit random secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<256-bit random secret — different from access>
JWT_REFRESH_EXPIRES_IN=7d

# ─── S3 Storage ──────────────────────────────────────────
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<iam-key>
AWS_SECRET_ACCESS_KEY=<iam-secret>
S3_BUCKET_NAME=permit-documents
S3_ENDPOINT=https://s3.amazonaws.com  # override for Cloudflare R2 / MinIO

# ─── Email ───────────────────────────────────────────────
SMTP_FROM=noreply@example.com
RESEND_API_KEY=<resend-api-key>       # or use SENDGRID_API_KEY / SES config

# ─── Rate Limiting ───────────────────────────────────────
THROTTLE_AUTH_LIMIT=5
THROTTLE_AUTH_TTL=60000               # ms (5 requests per 60 seconds)

# ─── Frontend (Vite env vars, prefix VITE_) ──────────────
VITE_API_BASE_URL=https://api.example.com/api/v1
VITE_MAX_FILE_SIZE_MB=25
```

---

### 7.5 Architectural Constraints & Future Extension Points

The v1 architecture is designed with deliberate extension seams for v2 features:

| v2 Feature | v1 Foundation | Extension Path |
|------------|--------------|----------------|
| Email notifications on status change | `notifications` table captures all events | Add email dispatch in `NotificationsService` alongside in-app creation |
| Malware scanning | Documents stored in S3 with `pending → uploaded` status flow | Insert `scanning` status; S3 event triggers scan; confirm sets `uploaded` |
| Configurable permit types | `form_data JSONB` field on `permit_applications` | Introduce `permit_type_configs` table defining required fields per type; form renders dynamically |
| Multi-stage approval workflows | `permit_status_history` captures all transitions | Add `workflow_steps` table; lifecycle service reads step config |
| WebSocket / SSE real-time | Polling hooks in frontend (`usePermit`, `useNotifications`) | Replace polling interval with EventSource or Socket.io connection; same store interface |
| Payment integration | `permit_applications.status` flow | Add `payment_pending` status between `submitted` and `submitted` confirmation |
| Analytics export | `audit_logs` + `permit_applications` structured data | Add read replica query layer; expose CSV endpoint on admin |

---

*TechArch Version 1.0 — Generated 2026-07-21*  
*Covers all 40 v1 requirements across 5 delivery phases.*  
*Architecture decisions documented in Section 1.1; revisit after Phase 3 for WebSocket/SSE evaluation.*
