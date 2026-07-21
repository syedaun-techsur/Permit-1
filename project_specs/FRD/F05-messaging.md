---

## F05: Integrated Messaging {#f05}

**PRD Feature:** F5 · **Phase:** 3 — Review Workflow · **Priority:** P1
**Requirements:** MSG-01, MSG-02, MSG-03, MSG-04

### Description

Each permit application has a dedicated messaging panel visible on both the applicant's and the reviewer's application detail view. Applicants and their assigned reviewer can exchange messages in context — directly tied to the specific permit. Messages display structured metadata (sender name, role, timestamp) and are ordered chronologically. The reviewer can attach supporting documents or notes to individual messages. Unread message counts are surfaced on the application list and dashboards so no message is missed.

### Terminology

- **Message Thread:** The ordered collection of all messages on a single permit application.
- **Message Attachment:** A file or note attached to a specific message by a reviewer (different from application documents — these are contextual communication artifacts).
- **Unread Message Count:** The number of messages on a given application that the current user has not yet read.
- **Read Receipt:** A record marking when a specific user first viewed a message.

### Sub-features

- **MSG-01** — Send and receive messages on a permit application
- **MSG-02** — Message metadata display (sender, role, timestamp)
- **MSG-03** — Unread message counts on list view and dashboard
- **MSG-04** — Reviewer: attach documents or notes to a message

---

### MSG-01: Integrated Messaging Panel

**Access Rules:**
- The applicant who owns the application can view and send messages.
- The reviewer assigned to the application can view and send messages.
- Admins can view messages on any application but cannot send messages (read-only for admin).
- No other users can access the message thread.

**Process — Sending a Message:**
1. `[User]` opens the application detail page.
2. `[Frontend]` renders the messaging panel with the full chronological message thread.
3. `[User]` types a message in the compose box at the bottom of the panel.
4. `[User]` optionally attaches a document/note (reviewer only; see MSG-04).
5. `[User]` sends the message via:
   a. Clicking the "Send" button, OR
   b. Pressing `Ctrl+Enter` (or `Cmd+Enter` on macOS)
6. `[System]` validates the message (see Validation below).
7. `[System]` creates a `messages` record.
8. `[System]` marks the message as `unread` for all other participants on this thread.
9. `[System]` triggers a notification for the recipient (see STAT-07 §notification triggers).
10. `[System]` returns `201 Created` with the new message object.
11. `[Frontend]` appends the new message to the thread and scrolls to the bottom.

**Process — Receiving Messages:**
1. The message thread is loaded when the application detail page opens.
2. Messages are fetched via `GET /permits/{id}/messages?limit=50&cursor=...` (paginated, newest-first).
3. `[Frontend]` polls `GET /permits/{id}/messages/unread-count` every 30 seconds while the panel is in view.
4. If new messages are detected during polling, the thread updates automatically (new messages appended).
5. When a user views a message, `[System]` marks it as read: `POST /permits/{id}/messages/{msgId}/read`.

**Inputs (send message):**
- `applicationId` (string, required): From URL path
- `body` (string, required): Message text, 1–5000 characters
- `attachments` (array, optional): Array of attachment objects (reviewer only; see MSG-04)

**Outputs (MessageObject):**
```json
{
  "id": "uuid",
  "applicationId": "uuid",
  "senderId": "uuid",
  "senderName": "Diana Osei",
  "senderRole": "reviewer",
  "body": "Please provide the updated site plan with setback dimensions.",
  "attachments": [],
  "sentAt": "2026-07-21T14:30:00Z",
  "readBy": ["uuid-applicant"]
}
```

**Validation:**
- `body` must be 1–5000 characters (trimmed)
- `body` must not be empty or whitespace-only
- User must be the application's owner (applicant) or the assigned reviewer
- Application must not be in `draft` status (messaging only available from `submitted` onward)
- Reviewer cannot send messages on an application they are not assigned to (unless Admin)

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Empty message body | 422 | VALIDATION_ERROR | "Message cannot be empty." |
| Message exceeds 5000 characters | 422 | VALIDATION_ERROR | "Message cannot exceed 5000 characters." |
| User not a participant on this application | 403 | FORBIDDEN | "You are not authorized to message on this application." |
| Application in draft status | 409 | MESSAGING_NOT_AVAILABLE | "Messaging is available once an application has been submitted." |
| Application not found | 404 | APPLICATION_NOT_FOUND | "Application not found." |

---

### MSG-02: Message Metadata Display

**Required Display Elements per Message:**

| Field | Display Format |
|-------|---------------|
| Sender full name | Bold label above message bubble |
| Sender role | Role badge adjacent to name: "Applicant" (blue) or "Reviewer" (amber) |
| Timestamp | Relative time on hover/below message (e.g., "Today at 2:30 PM"); absolute on hover tooltip |
| Message body | Left-aligned in a chat-style bubble; reviewer messages distinguished by color/positioning |
| Attachments | Listed below the message body with filename, type icon, and download link |

**Layout:**
- Applicant messages: right-aligned bubbles (from the current user's perspective when viewing as applicant), or left-aligned when viewed by reviewer.
- Reviewer messages: distinguished by a different bubble background color using design tokens.
- System messages (e.g., "Application submitted", "Status changed to Under Review"): centered, muted, italic — not attributed to a sender role.

---

### MSG-03: Unread Message Counts

**Surfaces where unread counts appear:**

| Surface | Display |
|---------|---------|
| Application list (PERM-03 view) | Badge on the application card: "3 unread" |
| Applicant dashboard (DASH-01) | "Unread messages" count in the summary card |
| Reviewer dashboard (DASH-02) | Unread message count per application row |
| Global navigation | Total unread message count across all applications (merged with notification badge, or separate) |

**Process:**
1. When a message is created, `[System]` increments the unread count for all thread participants except the sender.
2. When a participant views the message thread, `[System]` marks all unread messages as read for that user.
3. `[System]` recalculates the unread count for that user asynchronously.
4. `[Frontend]` reflects the updated count on the next poll cycle (30 seconds) or immediately via optimistic update.

**Data Model:** `message_reads` table tracks `{ messageId, userId, readAt }`. Unread count = total messages on thread minus messages with a `message_reads` entry for the current user.

---

### MSG-04: Reviewer — Attach Documents or Notes to Messages

**Condition:** Only available to users with role `reviewer` or `admin`.

**Process:**
1. `[Reviewer]` is composing a message.
2. `[Reviewer]` clicks "Attach" in the compose box.
3. Two options are presented:
   a. **Attach File:** Opens file picker; uploads file via the same presigned URL flow as DOCS-01 but to a `message_attachments` storage path.
   b. **Attach Note:** Opens a secondary text area within the compose box for a formatted structured note (e.g., code excerpts, checklists in Markdown).
4. Attachments are linked to the message record (not the application's main document list).
5. On message send, attachments are included in the message object and displayed below the message body.
6. Applicants can view and download message attachments.

**Message Attachment Object:**
```json
{
  "id": "uuid",
  "messageId": "uuid",
  "filename": "inspection-report.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 512000,
  "storageKey": "message-attachments/{appId}/{msgId}/{uuid}.pdf",
  "uploadedAt": "2026-07-21T14:30:00Z"
}
```

**Validation:**
- Same file type and size restrictions as DOCS-01 (PDF, JPEG, PNG, DOCX; max 25 MB per file)
- Maximum 5 attachments per message
- Note text (if chosen instead of file): max 2000 characters
- Only reviewers may attach files to messages; applicants see "Attach" button disabled with tooltip "Only reviewers can attach files to messages."

**Error States:**

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Applicant attempts to attach file | 403 | FORBIDDEN | "Only reviewers can attach files to messages." |
| File type not allowed | 422 | INVALID_FILE_TYPE | "Only PDF, JPEG, PNG, and DOCX files are accepted." |
| File exceeds 25 MB | 422 | FILE_TOO_LARGE | "Attachment exceeds the 25 MB limit." |
| Exceeds 5 attachments per message | 422 | TOO_MANY_ATTACHMENTS | "A maximum of 5 attachments per message is allowed." |

**Schema Surface:** uses tables `messages`, `message_reads`, `message_attachments` — see `Y0-schema.md` §Messaging.
**API Surface:** see `Y1-api.md` §Messaging for full request/response schemas.
