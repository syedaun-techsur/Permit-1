-- Phase 2 Migration: Permit Applications, Documents, Lifecycle, Notifications, Audit

-- Enums (skip if exists)
DO $$ BEGIN
  CREATE TYPE permit_type_enum AS ENUM (
    'construction', 'zoning_variance', 'event_permit', 'demolition', 'renovation', 'signage'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status_enum AS ENUM (
    'draft', 'submitted', 'under_review', 'additional_info_needed', 'approved', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_status_enum AS ENUM ('uploaded', 'deleted', 'superseded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type_enum AS ENUM (
    'STATUS_CHANGE', 'NEW_MESSAGE', 'REVIEWER_ASSIGNED', 'INFO_REQUEST', 'INFO_RESPONSE', 'DECISION_MADE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- permit_applications table
CREATE TABLE IF NOT EXISTS permit_applications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number     VARCHAR(20) NOT NULL UNIQUE,
  applicant_id         UUID NOT NULL REFERENCES users(id),
  reviewer_id          UUID REFERENCES users(id),
  status               application_status_enum NOT NULL DEFAULT 'draft',
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
  submitted_at         TIMESTAMPTZ,
  under_review_at      TIMESTAMPTZ,
  info_request_note    TEXT,
  info_request_at      TIMESTAMPTZ,
  info_response_note   TEXT,
  info_response_at     TIMESTAMPTZ,
  decision_outcome     VARCHAR(10) CHECK (decision_outcome IN ('approved', 'rejected')),
  decision_reason      TEXT,
  decision_at          TIMESTAMPTZ,
  decided_by           UUID REFERENCES users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pa_applicant_id ON permit_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_pa_reviewer_id ON permit_applications(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_pa_status ON permit_applications(status);
CREATE INDEX IF NOT EXISTS idx_pa_submitted_at ON permit_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_pa_reference_number ON permit_applications(reference_number);

CREATE SEQUENCE IF NOT EXISTS permit_reference_seq START 1;

-- lifecycle_stages table (immutable — one row per transition)
CREATE TABLE IF NOT EXISTS lifecycle_stages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
  stage          application_status_enum NOT NULL,
  entered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id       UUID REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_ls_application_id ON lifecycle_stages(application_id);
CREATE INDEX IF NOT EXISTS idx_ls_entered_at ON lifecycle_stages(entered_at);

-- documents table
CREATE TABLE IF NOT EXISTS documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id      UUID NOT NULL REFERENCES permit_applications(id) ON DELETE CASCADE,
  uploaded_by         UUID NOT NULL REFERENCES users(id),
  filename            VARCHAR(255) NOT NULL,
  mime_type           VARCHAR(100) NOT NULL,
  size_bytes          BIGINT NOT NULL,
  document_type       VARCHAR(100),
  storage_key         TEXT NOT NULL,
  status              document_status_enum NOT NULL DEFAULT 'uploaded',
  superseded_by       UUID REFERENCES documents(id),
  uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_docs_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_docs_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_docs_uploaded_by ON documents(uploaded_by);

-- notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES permit_applications(id) ON DELETE CASCADE,
  type           notification_type_enum NOT NULL,
  body           TEXT NOT NULL,
  read           BOOLEAN NOT NULL DEFAULT FALSE,
  read_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notif_created_at ON notifications(created_at);

-- audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action         VARCHAR(60) NOT NULL,
  actor_id       UUID REFERENCES users(id),
  actor_role     VARCHAR(20),
  application_id UUID REFERENCES permit_applications(id),
  target_user_id UUID REFERENCES users(id),
  details        JSONB,
  ip_address     INET,
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_al_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_al_actor_id ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_al_application_id ON audit_log(application_id);
