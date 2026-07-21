---

## 5. Security Architecture

### 5.1 Authentication Flow

The system uses a **JWT access + refresh token pair**. Access tokens are short-lived (15 minutes) and carry the user's `id`, `email`, and `role` in the payload. Refresh tokens are long-lived (7 days) and stored in the database (hashed) to enable server-side revocation on logout or suspected compromise.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Authentication Flow                           │
│                                                                      │
│  Login/Register                                                      │
│  ─────────────                                                       │
│  1. Client: POST /auth/login { email, password }                    │
│  2. Server: bcrypt.compare(password, user.password_hash)            │
│  3. Server: sign accessToken (15m) + refreshToken (7d)              │
│  4. Server: store SHA-256(refreshToken) in refresh_tokens table     │
│  5. Client: store accessToken in memory (Zustand), refreshToken      │
│             in localStorage (or HttpOnly cookie — recommended)       │
│                                                                      │
│  Authenticated Request                                               │
│  ────────────────────                                                │
│  1. Axios interceptor: attach Authorization: Bearer {accessToken}   │
│  2. NestJS JwtStrategy: verify signature, extract payload           │
│  3. RolesGuard: check payload.role against @Roles() decorator       │
│  4. Handler executes; actor injected via @CurrentUser() decorator   │
│                                                                      │
│  Token Refresh                                                       │
│  ─────────────                                                       │
│  1. API returns 401 (access token expired)                          │
│  2. Axios response interceptor: POST /auth/refresh { refreshToken } │
│  3. Server: verify refreshToken JWT signature                       │
│  4. Server: lookup SHA-256(refreshToken) in DB — must exist & valid │
│  5. Server: invalidate old refresh token, issue new pair            │
│  6. Axios: retry original request with new accessToken              │
│  7. If refresh also fails → redirect to /login                      │
│                                                                      │
│  Logout                                                              │
│  ──────                                                              │
│  1. Client: POST /auth/logout { refreshToken }                      │
│  2. Server: delete refresh token record from DB                     │
│  3. Client: clear accessToken from memory, refreshToken from store  │
└──────────────────────────────────────────────────────────────────────┘
```

**JWT Payload (access token):**
```typescript
interface JwtPayload {
  sub: string;      // user.id (UUID)
  email: string;
  role: UserRole;
  iat: number;      // issued at
  exp: number;      // expiry (15 min from iat)
}
```

---

### 5.2 Authorization Model (RBAC)

All authorization is enforced **server-side** at the API layer. Frontend route guards are a UX convenience only — they must never be relied upon for security.

#### Role Capability Matrix

| Capability | Applicant | Reviewer | Admin |
|-----------|:---------:|:--------:|:-----:|
| Register / login / logout | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Create permit application | ✅ | — | — |
| View own permits | ✅ | — | — |
| Upload / remove documents (own permits) | ✅ | — | — |
| Submit permit (draft → submitted) | ✅ | — | — |
| Resubmit (additional_info → under_review) | ✅ | — | — |
| Send messages on own permits | ✅ | — | — |
| View assigned/available permits | — | ✅ | — |
| Begin review (submitted → under_review) | — | ✅ | — |
| Request info (under_review → add_info) | — | ✅ | — |
| Approve / reject applications | — | ✅ | — |
| Download documents (any assigned permit) | — | ✅ | — |
| Send messages as reviewer | — | ✅ | — |
| View all permits (system-wide) | — | — | ✅ |
| Create / deactivate users | — | — | ✅ |
| Assign reviewers to permits | — | — | ✅ |
| View audit logs | — | — | ✅ |
| View system statistics | — | — | ✅ |

#### Implementation in NestJS

```typescript
// Decorator on controller method
@Post(':id/approve')
@Roles(Role.REVIEWER)                   // RBAC guard checks this
@UseGuards(JwtAuthGuard, RolesGuard)
async approvePermit(
  @Param('id') id: string,
  @Body() dto: DecisionRequest,
  @CurrentUser() user: JwtPayload,
): Promise<PermitApplication> {
  // Service additionally verifies reviewer is assigned to this specific permit
  return this.permitsService.approve(id, dto.reason, user);
}
```

**Resource-level authorization** (beyond role): The `PermitsService` verifies:
- **Applicants** can only access/modify their own permits (`applicant_id = user.id`)
- **Reviewers** can only take action on permits assigned to them (`reviewer_id = user.id`)
- **Admins** have no resource-level restriction

---

### 5.3 Data Protection

| Category | Measure |
|----------|---------|
| Passwords | bcrypt hashed (cost factor 12); never stored or logged in plaintext |
| Password reset tokens | SHA-256 hashed in DB; raw token sent in email only; 1-hour expiry; single-use |
| Data in transit | TLS 1.2+ enforced on all connections (API, database, S3); HSTS header required |
| Data at rest | PostgreSQL encryption at rest via managed provider (AWS RDS, Supabase encrypted volumes) |
| S3 objects | Bucket is private (no public access); access only via presigned URLs with short expiry |
| Presigned URL expiry | Upload URLs: 15 minutes; download URLs: 5 minutes |
| JWT secrets | RS256 (asymmetric) preferred; HS256 acceptable if secret ≥ 256 bits and stored in env vault |
| Sensitive env vars | Never committed to VCS; injected via environment variables / secrets manager |
| Database connections | Connection pool with TLS; credentials in env vars only |
| Audit logs | `audit_logs` table is append-only; no `UPDATE` or `DELETE` granted on this table |
| CORS | Strict origin allowlist; only the frontend domain is permitted |
| Rate limiting | `/auth/login`, `/auth/forgot-password`: 5 requests/minute per IP (throttle guard) |

---

### 5.4 File Upload Security

```
Client Validation (UX only — not trusted):
  ✓ File type: PDF, JPG, JPEG, PNG, DOCX
  ✓ File size: max 25 MB

Server-Side Validation (enforced):
  ✓ mimeType allowlist check before issuing presigned URL
  ✓ fileSizeBytes checked before issuing presigned URL
  ✓ S3 bucket policy enforces max object size at PutObject level
  ✓ storage_key format validated (pattern: permit-documents/{uuid}/{uuid}/*)
  ✓ document.status must be 'pending' before confirm is accepted
  ✓ S3 presigned URL scoped to exact storage_key — cannot upload to different path

V2 Enhancement:
  • ClamAV or cloud malware scanning on S3 object create event
  • Quarantine bucket for scanning before document is accessible
```

---

### 5.5 Security Headers

All API responses include:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

Frontend SPA adds:
```
Content-Security-Policy: script-src 'self'; connect-src 'self' https://api.example.com https://*.s3.amazonaws.com
```

---

### 5.6 Input Validation & Injection Prevention

- **All API inputs** validated with `class-validator` decorators on DTOs; NestJS `ValidationPipe` throws 400 on any invalid input before it reaches service logic
- **SQL injection**: prevented by TypeORM/Prisma parameterized queries — no raw SQL string concatenation
- **XSS**: React escapes output by default; any user-supplied HTML in the message body is not rendered as HTML
- **CSRF**: API is stateless (JWT, not session cookies); CSRF attacks are not applicable; if refresh token is moved to HttpOnly cookie, implement `SameSite=Strict`
