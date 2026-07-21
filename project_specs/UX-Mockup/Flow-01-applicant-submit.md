## User Flows — Applicant: Submit New Application

### Flow-03: New Application → Draft → Submit → Confirm

**Trigger:** Applicant clicks "New Application" on Dashboard or Application List
**User Stories:** US-2.1, US-2.2, US-3.1, US-3.2, US-3.3

```
[Dashboard / App List]
        │ click "New Application"
        ▼
[New Application Form — Step 1: Permit Details]
        │
        ├─ Unsaved changes, navigate away ──▶ [Confirm dialog: "Leave? Unsaved changes"] ──▶ leave or stay
        │
        ▼ "Save Draft" or auto-save (debounce 5s)
[Draft saved — "Saved ✓" indicator in header]
        │
        ▼ all required fields filled → Upload Documents (inline section)
[Document Upload Zone active]
        │
        ├─ Invalid file ──▶ [Inline error: "file.exe is not an accepted type"]
        ├─ Oversized file ──▶ [Inline error: "plan.pdf exceeds 25MB limit"]
        │
        ▼ files uploaded successfully
[Document list shows thumbnails + checkmarks]
        │
        ▼ click "Review & Submit"
[Review Summary — all fields read-only + document list]
        │
        ├─ Missing required fields ──▶ [Error summary banner + scroll to field]
        │
        ▼ click "Submit Application"
[Confirmation Screen]
        │  Application ID: #APP-2024-0042
        │  Status: Submitted ✓
        │  Timestamp: Jul 21, 2026 at 10:32 AM
        ▼
[Applicant Dashboard — app appears with "Submitted" badge]
```

---

### Flow-04: Respond to Additional Information Request

**Trigger:** Applicant opens application with status "Additional Info Needed"
**User Stories:** US-4.5, US-3.1, US-5.1

```
[Application Detail — "Additional Info Needed" status]
        │
        ▼ prominent info request banner visible
[Read Reviewer's Request Note]
        │
        ├─ Upload new/replacement document ──▶ [Document upload zone opens]
        │                                       [Preview + checkmark on success]
        │
        ├─ Send clarification message ──▶ [Messaging panel compose]
        │
        ▼ click "Re-Submit for Review"
[Confirm dialog: "Re-submit this application for review?"]
        │
        ▼ confirm
[Application status → Under Review]
[Toast: "Application re-submitted — reviewer notified"]
[Reviewer receives in-app notification]
```

---

*End of Flow-01-applicant-submit.md*
