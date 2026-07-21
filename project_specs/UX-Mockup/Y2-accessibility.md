## Accessibility Notes

**Standard:** WCAG 2.1 Level AA
**Automated check:** axe-core (zero critical violations required before ship)
**User Stories:** US-9.2, US-1.1

---

### Color Contrast

```
All text/background pairings must meet:
  Normal text (< 18pt / < 14pt bold) : 4.5:1 minimum
  Large text (≥ 18pt / ≥ 14pt bold)  : 3:1 minimum
  UI components and icons            : 3:1 minimum

Verified pairings:
  text-text-900 (#0F172A) on white (#FFFFFF)           : ~21:1 ✓
  text-text-700 (#334155) on white                     : ~9.7:1 ✓
  text-text-500 (#64748B) on white                     : ~4.6:1 ✓ (borderline — use only for captions)
  text-primary-600 (#4338CA) on white                  : ~8.2:1 ✓
  white (#FFFFFF) on primary-500 (#4F46E5) buttons     : ~7.8:1 ✓
  text-emerald-700 (#047857) on emerald-50 (#ECFDF5)   : ~6.1:1 ✓ (approved badge)
  text-red-700 (#B91C1C) on red-50 (#FEF2F2)           : ~6.8:1 ✓ (rejected badge)
  text-amber-700 (#B45309) on amber-50 (#FFFBEB)       : ~4.9:1 ✓ (review badge)
  text-orange-700 (#C2410C) on orange-50 (#FFF7ED)     : ~5.3:1 ✓ (info needed badge)

⚠ text-text-500 on white is ONLY used for non-critical captions/timestamps.
  Never use text-text-400 or lighter for meaningful body text.
```

---

### Keyboard Navigation

```
Tab order: follows DOM order which matches visual reading order

Focus indicators:
  All interactive elements: visible focus ring
  ring-2 ring-primary-500 ring-offset-2
  (NOT the browser default outline — that is suppressed and replaced)

Keyboard shortcuts:
  Escape : Close modal / close slide-over panel / cancel inline action
  Enter  : Submit focused form / confirm focused button
  Space  : Toggle checkbox / trigger button (if Enter not handled by browser)
  Arrow  : Navigate select dropdowns / navigate PDF preview pages
  Tab    : Forward navigation
  Shift+Tab : Backward navigation

Focus traps:
  Open modal dialogs: focus trapped inside modal
  Slide-over panels: focus trapped inside panel
  Tab cycles within trap: last focusable element → back to first
  On close: focus returns to the element that triggered the modal/panel
```

---

### Semantic HTML & ARIA

```
Page structure:
  <header role="banner">     — app header
  <nav role="navigation" aria-label="Main navigation">  — sidebar
  <main role="main">         — content area
  <footer role="contentinfo"> — app footer

Buttons vs Links:
  <button>   : for actions (Submit, Send, Approve, Begin Review)
  <a href>   : for navigation (go to application detail, go to dashboard)
  Never use <div> or <span> as interactive elements without role+tabIndex

Form fields:
  Every input has an associated <label> (via htmlFor / aria-labelledby)
  Error messages: aria-describedby linking error text to input
  Required fields: aria-required="true" + visual asterisk (*) + label annotation
  
  Example:
  <label htmlFor="projectDesc">Project Description <span aria-hidden="true">*</span></label>
  <textarea id="projectDesc" aria-required="true" aria-describedby="projectDesc-error" />
  <span id="projectDesc-error" role="alert">Project description is required</span>

Status badges:
  <span role="status" aria-label="Application status: Under Review">
    🔵 Under Review
  </span>

Lifecycle timeline:
  <ol aria-label="Application lifecycle">
    <li aria-current="step" aria-label="Under Review — in progress, started Jul 19 2026">…</li>
    <li aria-label="Additional Info Needed — not reached">…</li>
    <li aria-label="Approved — not reached">…</li>
  </ol>

Document list:
  <ul aria-label="Uploaded documents (3 files)">
    <li>…</li>
  </ul>

Modals:
  <div role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
    <h2 id="modal-title">Approve Application</h2>
    <p id="modal-desc">…</p>
  </div>
```

---

### ARIA Live Regions

```
Toast notifications:
  <div role="status" aria-live="polite" aria-atomic="true">  (success, info)
  <div role="alert" aria-live="assertive" aria-atomic="true"> (errors)

Status updates (when status changes on visible page):
  <div aria-live="polite">  wrapping status badge — announces new status

Unread counts:
  <span aria-live="polite" aria-label="3 unread notifications">3</span>

Auto-save indicator:
  <span aria-live="polite">Saved</span>  — polite, non-urgent

Upload progress:
  <div role="progressbar" aria-valuenow="67" aria-valuemin="0" aria-valuemax="100"
       aria-label="Uploading site_plan.pdf">
    <div style="width: 67%"></div>
  </div>
```

---

### Screen Reader Considerations

```
Icon-only buttons must have text alternatives:
  ✓ <button aria-label="Remove site_plan.pdf"><XIcon /></button>
  ✓ <button aria-label="Preview site_plan.pdf"><EyeIcon /></button>
  ✓ <button aria-label="Download all documents as ZIP"><DownloadIcon /></button>
  ✓ <button aria-label="Close notifications panel"><XIcon /></button>
  ✗ <button><XIcon /></button>  (no aria-label — invalid)

Decorative icons/illustrations:
  <SVGIcon aria-hidden="true" />  (purely decorative — hidden from screen readers)

Status badge with icon:
  <span>
    <CheckIcon aria-hidden="true" />  ← decorative
    <span>Approved</span>             ← readable
  </span>

Avatar with initials:
  <div aria-label="Diana Osei" role="img">DO</div>

Application ID in code style:
  <code aria-label="Application ID APP-2024-0042">#APP-2024-0042</code>

Timestamp with tooltip:
  <time datetime="2026-07-21T10:32:00Z" title="July 21, 2026 at 10:32 AM UTC">
    Jul 21, 10:32 AM
  </time>
```

---

### Reduced Motion

```
CSS media query: @media (prefers-reduced-motion: reduce)

In Tailwind: motion-safe: and motion-reduce: variants

Animations disabled under prefers-reduced-motion:
  - Skeleton pulse animation → static grey block
  - Status badge fade transition → instant switch
  - Toast slide-in → instant appear
  - Slide-over panel → instant show/hide
  - Page transition → none
  - Progress bar animation → static bar

Animations KEPT (functional, not decorative):
  - Upload progress bar fill (communicates real progress — needed for orientation)
  - Focus indicator transition (helps keyboard users track focus)
```

---

### Form Accessibility Checklist

```
Per field:
  ☐ <label> with for= attribute linking to input id
  ☐ Placeholder text is supplemental, NOT the label
  ☐ Error message has id; input has aria-describedby referencing it
  ☐ aria-required="true" on required fields
  ☐ aria-invalid="true" when field has error
  ☐ autocomplete attributes where applicable (name, email, tel, address fields)

Fieldsets:
  ☐ Address fields wrapped in <fieldset><legend>Site Address</legend>…</fieldset>
  ☐ Radio groups wrapped in <fieldset><legend>…</legend>…</fieldset>

Submit behavior:
  ☐ Error summary banner has aria-live="assertive" (announced immediately)
  ☐ Focus moves to error summary on invalid submit
  ☐ Success: focus moves to confirmation heading
```

---

### Automated Audit Requirements

```
Tool: axe-core (via @axe-core/react in development; CI integration)

Required result: ZERO violations at severity "critical" or "serious"

Runs:
  - On every PR merge to main (CI check, blocks merge on violation)
  - On every Storybook story (component-level coverage)
  - Manually on each screen before phase completion sign-off

Categories checked:
  ✓ color-contrast (all text/background pairings)
  ✓ label (all form inputs have labels)
  ✓ button-name (all buttons have accessible names)
  ✓ image-alt (all images have alt text)
  ✓ link-name (all links have accessible names)
  ✓ duplicate-id (no duplicate IDs in DOM)
  ✓ aria-required-attr (ARIA attributes used correctly)
  ✓ focus-order-semantics (focus order is logical)
```

---

*End of Y2-accessibility.md*
