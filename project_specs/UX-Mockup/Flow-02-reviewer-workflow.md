## User Flows — Reviewer Workflow

### Flow-05: Morning Triage → Open Application → Take Action

**Trigger:** Reviewer logs in; lands on Reviewer Dashboard
**User Stories:** US-7.2, US-6.1, US-6.2, US-4.3, US-4.4, US-4.6

```
[Reviewer Dashboard]
        │  Queue buckets auto-sorted by priority
        ▼ click application row
[Application Detail — Reviewer View]
        │
        ├─ Status: Submitted ──▶ [Begin Review button visible]
        │                              │ click
        │                              ▼
        │                     [Status: Under Review]
        │                     [Applicant notified]
        │
        ├─ Status: Under Review ──▶ [Request Info | Approve | Reject buttons]
        │        │
        │        ├─ click "Request Additional Information"
        │        │         │
        │        │         ▼
        │        │   [Request Info Modal — mandatory note field]
        │        │         │ submit
        │        │         ▼
        │        │   [Status: Additional Info Needed]
        │        │   [Applicant notified]
        │        │   [Application leaves reviewer's action queue]
        │        │
        │        ├─ click "Approve"
        │        │         │
        │        │         ▼
        │        │   [Approve Modal — mandatory rationale field]
        │        │         │ confirm
        │        │         ▼
        │        │   [Status: Approved — terminal]
        │        │   [Applicant notified within 5 seconds]
        │        │   [Audit log entry written]
        │        │
        │        └─ click "Reject"
        │                  │
        │                  ▼
        │            [Reject Modal — mandatory rationale field]
        │                  │ confirm
        │                  ▼
        │            [Status: Rejected — terminal]
        │            [Applicant notified]
        │            [Audit log entry written]
        │
        └─ Status: Additional Info Needed — applicant responded
                   ──▶ Application auto-resurfaces in "Ready for Review" bucket
                       Reviews docs → Approve or Reject (same flow above)
```

---

### Flow-06: Admin — Onboard User → Assign Application

**Trigger:** Admin logs in; navigates to User Management
**User Stories:** US-8.2, US-8.3, US-8.4

```
[Admin Dashboard]
        │ sidebar: "User Management"
        ▼
[User Management Table]
        │
        ├─ DEACTIVATE: search user → click "Deactivate" → confirm dialog
        │                  │
        │                  ▼
        │           [Status: Deactivated — immediate]
        │           [All sessions terminated]
        │           [Toast: "Access revoked immediately"]
        │           [Audit log entry]
        │
        ├─ CREATE: click "Add User" → form (name, email, role) → submit
        │                  │
        │                  ▼
        │           [User appears in table: Active]
        │           [Welcome email auto-sent]
        │           [Audit log entry]
        │
        ▼ sidebar: "All Applications"
[All Applications — Admin View]
        │ select application(s) → "Assign Reviewer"
        ▼
[Reviewer selector dropdown → confirm]
[Reviewer notified in-app]
[Assignment logged in audit trail]
```

---

*End of Flow-02-reviewer-workflow.md*
