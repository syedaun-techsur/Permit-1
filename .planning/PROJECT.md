# Permit Management System

## What This Is

A digital permitting platform that enables applicants to submit permit requests, upload required documents, track application progress, communicate with reviewers, and receive approvals — all through a single unified interface. The system serves two primary user groups: applicants who need to navigate the permitting process, and permitting staff (reviewers and admins) who manage, evaluate, and approve submissions. The product prioritizes transparency, speed, and a premium SaaS-quality user experience over the typical bureaucratic portal aesthetic.

## Core Value

Applicants can track every stage of their permit lifecycle in real time and communicate directly with reviewers — eliminating the opacity and friction of traditional permitting processes.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Applicants can create accounts and authenticate securely
- [ ] Applicants can submit permit applications with structured form data
- [ ] Applicants can upload, preview, and manage required documents (drag-and-drop, validation feedback)
- [ ] Applicants can track permit status through a visual lifecycle timeline (Submitted → Under Review → Additional Info Needed → Approved/Rejected)
- [ ] Applicants and reviewers can communicate via an integrated messaging panel
- [ ] Reviewers can manage and evaluate assigned permit applications
- [ ] Reviewers can request additional information from applicants
- [ ] Reviewers can approve or reject applications with documented reasoning
- [ ] Admins can manage users, configure workflows, and access reporting
- [ ] The system enforces role-based access control (Applicant, Reviewer, Admin)
- [ ] The dashboard provides visual progress indicators and status summaries
- [ ] The interface is responsive across desktop and mobile
- [ ] The interface meets WCAG accessibility standards (contrast, keyboard nav, screen-reader support)
- [ ] Smooth micro-interactions and loading states enhance perceived performance

### Out of Scope

- Native mobile app (iOS/Android) — web-first; responsive web covers mobile use cases in v1
- Payment processing for permit fees — complexity and compliance overhead; defer to v2
- AI/ML-based auto-approval or document classification — manual review flow sufficient for v1
- Public API / third-party integrations — out of scope for initial launch
- Multi-language / internationalization — English-only for v1

## Context

- **Domain:** Government/municipal permitting — traditionally paper-based or low-quality legacy web portals. The goal is to make this feel like a modern SaaS product (fintech/enterprise dashboard quality) while retaining the clarity and trust signals required for official processes.
- **Tech Stack (Frontend):** React with Vite, TypeScript, React Router for navigation, and Zustand or Redux Toolkit for state management. Design system built on Tailwind CSS with custom design tokens, subtle gradients, and consistent iconography.
- **Tech Stack (Backend):** Node.js with Express or NestJS, RESTful API architecture, JWT-based authentication, role-based access control.
- **UI Priorities:** Clean spacious layouts, refined color palette, smooth micro-interactions, dashboard-style status tracking, elegant document upload with drag-and-drop, modern integrated messaging (not a legacy comment thread), consistent use of cards/shadows/rounded corners.
- **Compliance:** WCAG accessibility standards required without compromising premium aesthetic.

## Constraints

- **Tech Stack**: React (Vite + TypeScript) frontend, Node.js (Express or NestJS) backend — required by stakeholders
- **UX Quality**: Must feel like a premium SaaS product — not a generic government form portal; design quality is a first-class requirement
- **Accessibility**: WCAG-compliant contrast, keyboard navigation, screen-reader support
- **Responsiveness**: Desktop and mobile support required
- **Security**: JWT authentication, RBAC enforced at API layer

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite + TypeScript for frontend | Modern tooling, strong ecosystem, type safety | — Pending |
| Node.js (Express or NestJS) for backend | Team familiarity, REST-first approach | — Pending |
| Tailwind CSS as design foundation | Utility-first enables rapid custom design tokens and consistent theming | — Pending |
| JWT + RBAC authentication model | Stateless, scalable; three clear roles (Applicant, Reviewer, Admin) | — Pending |
| Web-first (responsive, no native app) | Reduces scope; responsive web covers mobile sufficiently for v1 | — Pending |
| Three-role model (Applicant/Reviewer/Admin) | Clear separation of concerns; maps to real-world permitting org structure | — Pending |

---
*Last updated: 2026-07-21 after initialization*
