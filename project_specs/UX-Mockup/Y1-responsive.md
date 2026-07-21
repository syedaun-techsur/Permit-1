## Responsive Design Considerations

---

### Breakpoints

```
Mobile  : 375px – 767px    (sm: in Tailwind)
Tablet  : 768px – 1023px   (md: in Tailwind)
Desktop : 1024px – 1439px  (lg: in Tailwind)
Wide    : 1440px+           (xl: in Tailwind)
```

---

### Desktop (≥ 1024px) — Primary Layout

**Shell:**
- Fixed sidebar 256px visible at all times
- Content area fills remaining width
- Max-width 1280px, centered for wide screens

**Application Detail:**
- Two-column layout (55% info / 45% messaging)
- Timeline displayed horizontally

**Application List:**
- Full table view with all columns
- Hover states, row click to navigate

**Admin Screens:**
- Full table density with all columns
- Bulk action toolbar visible

---

### Tablet (768px – 1023px)

**Shell:**
- Sidebar collapses to 64px icon-only strip (icons + tooltips on hover)
- OR: off-canvas sidebar triggered by hamburger icon
- Header shows hamburger menu icon (left) + wordmark (center)

**Application Detail:**
- Two columns maintained (48% / 52%) but slightly compressed
- Messaging panel may require scroll

**Admin Tables:**
- Less-critical columns hidden: e.g., "Last Updated" column hidden; "Age" shown instead
- Horizontal scroll on table if necessary (not preferred)

**Sidebar (tablet icon-only):**
```
┌────────────────────┐
│  ◈                 │  ← Logo icon only
│  ──────────────    │
│  ⊞                 │  ← Dashboard icon + tooltip on hover
│  ☰                 │  ← Applications icon
│  ＋                │  ← New Permit icon
│  ──────────────    │
│  [MR]              │  ← Avatar only
│  ⚙                 │
│  ↪                 │
└────────────────────┘
```

---

### Mobile (375px – 767px) — Marcus's On-Site Context

**Shell:**
- Sidebar hidden by default; hamburger icon in header triggers slide-over drawer
- Header: [☰] [PermitFlow wordmark] [🔔] [Avatar]
- Bottom navigation bar NOT used (insufficient items for bottom nav pattern)

**Mobile Navigation Drawer:**
```
┌──────────────────────────────────────────────────┐
│  ✕  PermitFlow                                   │
│  ─────────────────────────────────────────────── │
│                                                  │
│  ⊞  Dashboard                                    │
│  ☰  My Applications                             │
│  ＋  New Application                             │
│  ─────────────────────────────────────────────── │
│  ┌──┐ Marcus Rivera · Applicant                  │
│  │MR│                                            │
│  └──┘                                            │
│  ⚙  Settings                                    │
│  ↪  Log out                                     │
└──────────────────────────────────────────────────┘
Overlay: bg-black/50 on content behind drawer
Drawer: slide in from left, w-[280px], h-full
```

**Applicant Dashboard (mobile):**
- Summary cards: 1-column stack (full-width cards)
- Recent application list: full-width rows (adapted — less metadata)
- Status chart: hidden on mobile or collapsed behind "View status summary" expand

**Application List (mobile):**
- Full-width rows
- Table collapses: no table header row; each row is a card-style item
- Sort/filter: hidden behind a "Filter & Sort" button → bottom sheet

```
┌────────────────────────────────────────────┐
│  ⚠ #APP-0042                    2d ago    │
│  Commercial TI — Monroe St.     ⚠ Info Req │
│  4 documents                       💬 2   │
└────────────────────────────────────────────┘
```

**Application Detail (mobile):**
- Single column layout (no side-by-side)
- Section order (stacked top to bottom):
  1. Application header + status badge
  2. Action Required banner (if applicable)
  3. Lifecycle timeline (vertical orientation)
  4. Application info (collapsed behind "Show details" accordion)
  5. Documents panel
  6. Messaging panel (full width, takes majority of scroll area)

**Lifecycle Timeline (mobile):**
```
Horizontal timeline doesn't fit → vertical left-rail timeline:

●  Draft         Jul 15 · 9:00 AM
│  ✓ Complete
│
●  Submitted     Jul 18 · 10:32 AM
│  ✓ Complete
│
●  Under Review  Jul 19 · 2:00 PM
│  ◐ In Progress
│
○  Info Needed   ─ (upcoming)
│
○  Approved      ─ (upcoming)
```

**Document Upload (mobile):**
- Drag-and-drop hidden on touch devices; replaced by:
  ```
  ┌─────────────────────────────────────────────┐
  │  📎 Tap to upload a file                    │
  │  PDF, JPG, PNG, DOCX · Max 25 MB            │
  └─────────────────────────────────────────────┘
  ```
- Camera option may surface depending on device capabilities (OS file picker)

**Messaging Panel (mobile):**
- Full width
- Composer sticks to bottom of viewport (sticky positioning)
- File attachment icon in composer toolbar

**Modals (mobile):**
- Full-screen bottom sheet instead of centered modal
- `rounded-t-xl` on top corners; `h-auto max-h-[90vh]` with scroll inside
- Close handle (drag indicator) at top

**New Application Form (mobile):**
- Single column (full width inputs)
- Progress stepper: abbreviated (step numbers only: ① ② ③)
- Auto-save same behavior as desktop

**Admin Screens (mobile):**
- Admin is desktop-first (James uses desktop only per persona)
- Mobile access still functional but optimized for desktop density
- Tables reflow to card view on < 768px
- Bulk actions hidden on mobile (checkbox column removed; individual row actions only)

---

### Touch Targets

```
All interactive elements: minimum 44×44px (WCAG 2.5.5)

Button heights : h-11 (44px) on mobile, h-10 (40px) on desktop
Icon buttons   : h-11 w-11 (44×44) on mobile, h-9 w-9 (36×36) on desktop
Table row clicks: full row is clickable (py-4 ensures 44px+ tap height)
Checkbox: 20×20 visual, 44×44 tap area via padding
```

---

### Performance on Mobile

```
Images: Responsive <img> with srcset; WebP format preferred
Lazy loading: document thumbnails and message avatars below fold
Bundle splitting: admin chunk not loaded for applicant/reviewer roles
Font: Inter loaded via Google Fonts with display=swap to avoid FOIT
Animation: prefers-reduced-motion media query respected — all transitions
           disabled for users who have set this OS preference
```

---

*End of Y1-responsive.md*
