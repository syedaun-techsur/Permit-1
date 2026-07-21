# Functional Requirements Document: Permit Management System

**Document Type:** Functional Requirements Document (FRD)
**Project:** Permit Management System
**Acronym:** PMS
**Version:** 1.0
**Date:** 2026-07-21
**Status:** Draft
**Source PRD:** `project_specs/PRD-PermitManagementSystem.md` v1.0
**Coverage:** 40 v1 requirements across 10 features and 5 delivery phases

---

## Scope

This document specifies the functional behavior of the Permit Management System v1. It translates every PRD feature (F0–F9) and associated requirement (AUTH-01–05, PERM-01–07, DOCS-01–05, STAT-01–07, MSG-01–04, DASH-01–04, ADMN-01–03, UX-01–05) into precise inputs, outputs, validation rules, process steps, error states, API surface, and database schema. It is the primary reference for implementation and does not repeat product vision or rationale beyond what is necessary for unambiguous engineering.

---

## Table of Contents

| Chunk | Feature | Requirements |
|-------|---------|-------------|
| [F00 Authentication & User Management](#f00) | AUTH-01–05 | Phase 1 |
| [F01 Design System & UI Foundation](#f01) | UX-03, UX-04, UX-05 | Phase 1 |
| [F02 Permit Application Submission](#f02) | PERM-01–04 | Phase 2 |
| [F03 Document Management](#f03) | DOCS-01–05 | Phase 2→3 |
| [F04 Permit Status Tracking & Lifecycle](#f04) | STAT-01–07 | Phase 2→3 |
| [F05 Integrated Messaging](#f05) | MSG-01–04 | Phase 3 |
| [F06 Reviewer Workflow](#f06) | PERM-05–06, STAT-03–04, STAT-06 | Phase 3 |
| [F07 Role-Specific Dashboards](#f07) | DASH-01–04 | Phase 4 |
| [F08 Admin Controls](#f08) | PERM-07, ADMN-01–03 | Phase 5 |
| [F09 Accessibility & Responsive Design](#f09) | UX-01, UX-02 | Phase 2→5 |
| [Y0 Database Schema](#y0) | All entities | — |
| [Y1 API Endpoints](#y1) | All endpoints | — |
| [Y2 Error Catalog](#y2) | Cross-feature errors | — |
| [Y3 Integration Points](#y3) | External systems | — |

---

## Conventions

- **Requirement IDs** follow the pattern `AREA-NN` (e.g., `AUTH-01`). Each is mapped to a PRD feature `F{n}`.
- **HTTP status codes** use standard RFC 7231 semantics.
- **Error codes** are `SCREAMING_SNAKE_CASE` strings returned in the API `error.code` field.
- **Process steps** are numbered. Where a step involves a conditional branch, sub-steps are lettered (e.g., 3a, 3b).
- **Must / Shall** — non-negotiable constraint. **Should** — strong preference, deviation requires justification. **May** — permitted but optional.
- **Actor labels:** `[Applicant]`, `[Reviewer]`, `[Admin]`, `[System]` identify who triggers each action.
- **Role precedence:** Admin ⊃ Reviewer ⊃ Applicant (Admin can perform any action available to lower roles unless otherwise stated).
- **All timestamps** are stored and returned in ISO 8601 UTC format.
- **File references:** Cross-feature DDL lives in `Y0-schema.md`; full API specs in `Y1-api.md`; error catalog in `Y2-errors.md`; external integrations in `Y3-integrations.md`.

---

## Shared Terminology

| Term | Definition |
|------|-----------|
| **Applicant** | A user with role `applicant`; submits and tracks permit applications |
| **Reviewer** | A user with role `reviewer`; evaluates, actions, and decides on permit applications |
| **Admin** | A user with role `admin`; manages users, assignments, and has system-wide visibility |
| **Permit Application** | A structured record representing a request for a municipal/government permit |
| **Lifecycle Stage** | One of seven ordered states a permit application can occupy: `draft`, `submitted`, `under_review`, `additional_info_needed`, `approved`, `rejected` |
| **JWT** | JSON Web Token; access token with 15-minute expiry used to authenticate API requests |
| **Refresh Token** | Long-lived token (7-day expiry) stored in an HTTP-only cookie; used to obtain new access tokens |
| **RBAC** | Role-Based Access Control; API-layer enforcement that returns 401/403 for unauthorized access |
| **Draft** | A permit application saved but not yet submitted; visible only to the creating applicant |
| **Presigned URL** | A time-limited signed URL granting access to a file in object storage (S3-compatible) |
| **Audit Log** | Append-only, read-only record of every status transition, admin action, and key system event |
| **Skeleton Screen** | A loading state that renders a placeholder matching the layout of the content being loaded |
| **Design Token** | A named variable representing a design decision (color, spacing, shadow) applied consistently across the UI |
| **WCAG 2.1 AA** | Web Content Accessibility Guidelines, Level AA — the accessibility compliance target for all UI |
| **In-App Notification** | A real-time alert surfaced within the application UI (not email); triggered by status changes and new messages |
| **Soft Delete** | Marking a record as inactive (`is_active = false`) rather than physically removing it from the database |

---

*Generated: 2026-07-21 · FRD v1.0 for Permit Management System*
