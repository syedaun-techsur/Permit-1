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
