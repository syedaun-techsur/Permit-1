---

## 3. Data Model

### 3.1 Entity Relationship Diagram

```
┌─────────────┐          ┌──────────────────────┐
│    users    │          │  permit_applications  │
│─────────────│          │──────────────────────│
│ id (PK)     │1        *│ id (PK)              │
│ email       ├──────────┤ applicant_id (FK)    │
│ password_hash│         │ reviewer_id (FK)     │──┐
│ full_name   │          │ permit_type          │  │
│ role        │          │ status               │  │
│ is_active   │          │ title                │  │
│ created_at  │          │ description          │  │
│ updated_at  │          │ site_address         │  │
└─────────────┘          │ contact_phone        │  │
      │                  │ submission_date      │  │
      │                  │ decision_reason      │  │
      │                  │ created_at           │  │
      │                  │ updated_at           │  │
      │                  └──────────┬───────────┘  │
      │                             │1             │
      │                   ┌─────────▼──────────┐   │
      │                   │permit_status_history│   │
      │                   │────────────────────│   │
      │                   │ id (PK)            │   │
      │                   │ application_id (FK)│   │
      │                   │ from_status        │   │
      │                   │ to_status          │   │
      │                   │ changed_by (FK)    │───┘
      │                   │ note               │
      │                   │ created_at         │
      │                   └────────────────────┘
      │
      │     ┌──────────────────────┐
      │     │      documents       │
      │     │──────────────────────│
      │     │ id (PK)             │
      └─────┤ application_id (FK) │
            │ uploaded_by (FK)    │
            │ file_name           │
            │ file_type           │
            │ file_size_bytes     │
            │ storage_key         │
            │ status              │
            │ created_at          │
            │ updated_at          │
            └──────────┬──────────┘
                       │1
             ┌─────────▼──────────────┐
             │  message_attachments   │
             │────────────────────────│
             │ id (PK)               │
             │ message_id (FK)       │
             │ document_id (FK)      │
             │ created_at            │
             └────────────────────────┘
                       │
            ┌──────────▼──────────────┐
            │        messages         │
            │─────────────────────────│
            │ id (PK)                │
            │ application_id (FK)    │
            │ sender_id (FK)         │
            │ body                   │
            │ is_read_by_applicant   │
            │ is_read_by_reviewer    │
            │ created_at             │
            └─────────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐
│     notifications    │       │      audit_logs       │
│──────────────────────│       │──────────────────────│
│ id (PK)              │       │ id (PK)              │
│ user_id (FK)         │       │ actor_id (FK)        │
│ type                 │       │ application_id (FK)  │
│ title                │       │ action               │
│ body                 │       │ metadata (JSONB)     │
│ application_id (FK)  │       │ created_at           │
│ is_read              │       └──────────────────────┘
│ created_at           │
└──────────────────────┘

┌──────────────────────┐
│  password_reset_     │
│  tokens              │
│──────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ token_hash          │
│ expires_at          │
│ used_at             │
│ created_at          │
└──────────────────────┘
```

---

### 3.2 DDL — Complete Table Definitions

#### Enumerations

```sql
-- Role enum
CREATE TYPE user_role AS ENUM (
    'applicant',
    'reviewer',
    'admin'
);

-- Permit application status enum
CREATE TYPE permit_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'additional_info_needed',
    'approved',
    'rejected'
);

-- Document upload status enum
CREATE TYPE document_status AS ENUM (
    'pending',     -- presigned URL issued; upload not yet confirmed
    'uploaded',    -- upload confirmed by client
    'deleted'      -- soft-deleted by applicant before submission
);

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
    'status_changed',
    'message_received',
    'info_requested',
    'approved',
    'rejected'
);
```

---

#### users

```sql
CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT            NOT NULL UNIQUE,
    password_hash   TEXT            NOT NULL,
    full_name       TEXT            NOT NULL,
    role            user_role       NOT NULL DEFAULT 'applicant',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email     ON users (email);
CREATE INDEX idx_users_role      ON users (role);
CREATE INDEX idx_users_is_active ON users (is_active);

COMMENT ON TABLE  users              IS 'All system users: applicants, reviewers, and admins';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash; never stored in plaintext';
COMMENT ON COLUMN users.is_active     IS 'FALSE = soft-deleted; user cannot log in';
```

---

#### permit_applications

```sql
CREATE TABLE permit_applications (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id    UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewer_id     UUID            REFERENCES users(id) ON DELETE SET NULL,
    permit_type     TEXT            NOT NULL,
    status          permit_status   NOT NULL DEFAULT 'draft',
    title           TEXT            NOT NULL,
    description     TEXT            NOT NULL,
    site_address    TEXT            NOT NULL,
    contact_phone   TEXT,
    form_data       JSONB           NOT NULL DEFAULT '{}',
    submission_date TIMESTAMPTZ,
    decision_reason TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permit_app_applicant ON permit_applications (applicant_id);
CREATE INDEX idx_permit_app_reviewer  ON permit_applications (reviewer_id);
CREATE INDEX idx_permit_app_status    ON permit_applications (status);
CREATE INDEX idx_permit_app_submitted ON permit_applications (submission_date DESC);
CREATE INDEX idx_permit_app_type      ON permit_applications (permit_type);

COMMENT ON TABLE  permit_applications             IS 'Core permit application records';
COMMENT ON COLUMN permit_applications.form_data   IS 'JSONB bag for additional permit-type-specific fields; enables v2 configurable types';
COMMENT ON COLUMN permit_applications.decision_reason IS 'Required text when reviewer approves or rejects';
COMMENT ON COLUMN permit_applications.submission_date IS 'Set when status transitions from draft to submitted';
```

---

#### permit_status_history

```sql
CREATE TABLE permit_status_history (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID            NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
    from_status     permit_status,
    to_status       permit_status   NOT NULL,
    changed_by      UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    note            TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_psh_application ON permit_status_history (application_id, created_at DESC);
CREATE INDEX idx_psh_changed_by  ON permit_status_history (changed_by);

COMMENT ON TABLE  permit_status_history         IS 'Immutable log of every permit status transition; drives the timeline UI';
COMMENT ON COLUMN permit_status_history.note    IS 'Required for info_requested transitions; optional for others';
COMMENT ON COLUMN permit_status_history.from_status IS 'NULL for first entry (initial draft creation)';
```

---

#### documents

```sql
CREATE TABLE documents (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID            NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
    uploaded_by     UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_name       TEXT            NOT NULL,
    file_type       TEXT            NOT NULL,
    file_size_bytes BIGINT          NOT NULL,
    storage_key     TEXT            NOT NULL UNIQUE,
    status          document_status NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_docs_application ON documents (application_id, status);
CREATE INDEX idx_docs_uploaded_by ON documents (uploaded_by);
CREATE INDEX idx_docs_storage_key ON documents (storage_key);

COMMENT ON TABLE  documents             IS 'Document metadata; binary content stored in S3-compatible object storage';
COMMENT ON COLUMN documents.storage_key IS 'S3 object key: permit-documents/{app_id}/{doc_id}/{filename}';
COMMENT ON COLUMN documents.status      IS 'pending = presigned URL issued but upload not confirmed';
```

---

#### messages

```sql
CREATE TABLE messages (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id          UUID        NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
    sender_id               UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    body                    TEXT        NOT NULL,
    is_read_by_applicant    BOOLEAN     NOT NULL DEFAULT FALSE,
    is_read_by_reviewer     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_application ON messages (application_id, created_at ASC);
CREATE INDEX idx_messages_sender      ON messages (sender_id);
CREATE INDEX idx_messages_unread_app  ON messages (application_id, is_read_by_applicant);
CREATE INDEX idx_messages_unread_rev  ON messages (application_id, is_read_by_reviewer);

COMMENT ON TABLE messages IS 'Per-permit application message thread between applicant and reviewer';
```

---

#### message_attachments

```sql
CREATE TABLE message_attachments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id  UUID        NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    document_id UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (message_id, document_id)
);

CREATE INDEX idx_msg_att_message  ON message_attachments (message_id);
CREATE INDEX idx_msg_att_document ON message_attachments (document_id);
```

---

#### notifications

```sql
CREATE TABLE notifications (
    id              UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            notification_type   NOT NULL,
    title           TEXT                NOT NULL,
    body            TEXT                NOT NULL,
    application_id  UUID                REFERENCES permit_applications(id) ON DELETE SET NULL,
    is_read         BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user       ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_application ON notifications (application_id);

COMMENT ON TABLE notifications IS 'In-app notifications delivered to users on status changes and messages';
```

---

#### audit_logs

```sql
CREATE TABLE audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    application_id  UUID        REFERENCES permit_applications(id) ON DELETE SET NULL,
    action          TEXT        NOT NULL,
    metadata        JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor       ON audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_application ON audit_logs (application_id, created_at DESC);
CREATE INDEX idx_audit_action      ON audit_logs (action);
CREATE INDEX idx_audit_created     ON audit_logs (created_at DESC);

COMMENT ON TABLE  audit_logs          IS 'Append-only log; no UPDATE or DELETE is ever issued against this table';
COMMENT ON COLUMN audit_logs.action   IS 'e.g. permit.submitted, permit.approved, user.deactivated, reviewer.assigned';
COMMENT ON COLUMN audit_logs.metadata IS 'Contextual data: { from_status, to_status, reason, assigned_reviewer_id, ... }';
```

---

#### password_reset_tokens

```sql
CREATE TABLE password_reset_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prt_user    ON password_reset_tokens (user_id);
CREATE INDEX idx_prt_token   ON password_reset_tokens (token_hash);
CREATE INDEX idx_prt_expires ON password_reset_tokens (expires_at);

COMMENT ON TABLE  password_reset_tokens          IS 'Single-use tokens for password reset flow; expire after 1 hour';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'SHA-256 hash of the token sent in the email link';
```

---

### 3.3 PostgreSQL Performance Considerations

| Concern | Mitigation |
|---------|-----------|
| Permit list queries with filters | Composite index on `(status, submission_date DESC)` and `(applicant_id, status)` |
| Unread message count on every page load | Dedicated indexes on `is_read_by_applicant` / `is_read_by_reviewer`; count query is O(n messages) per permit — acceptable for v1 scale |
| Audit log growth | Indexed on `created_at DESC`; add table partitioning by month in v2 if volume warrants |
| JSONB `form_data` queries | GIN index if admin filtering by form field values is added in v2 |
| Notification polling | Index on `(user_id, is_read, created_at DESC)` makes unread count a fast index-only scan |
| `updated_at` auto-update | Trigger on all mutable tables to set `updated_at = NOW()` on every `UPDATE` |

```sql
-- Auto-update trigger (apply to: users, permit_applications, documents)
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON permit_applications
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
```
