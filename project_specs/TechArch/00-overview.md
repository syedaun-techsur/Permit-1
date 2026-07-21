# TechArch: Permit Management System

**Document Type:** Technical Architecture Document  
**Project:** Permit Management System  
**Version:** 1.0  
**Date:** 2026-07-21  
**Status:** Draft  

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Component Architecture](#2-component-architecture)
3. [Data Model](#3-data-model)
4. [API Design](#4-api-design)
5. [Security Architecture](#5-security-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Integration Points](#7-integration-points)

---

## 1. Architectural Overview

### 1.1 Architecture Pattern

The Permit Management System follows a **layered, monolithic-first architecture** with clean separation between the frontend SPA, backend REST API, relational database, and object storage. This pattern is chosen deliberately for v1: it reduces operational complexity, enables rapid iteration, and provides a clear upgrade path to microservices if workload demands it in v2.

**Key architectural decisions:**

| Decision | Rationale |
|----------|-----------|
| Monolithic API (single NestJS service) | Reduces deployment complexity for v1; all permit domain logic is cohesive and benefits from shared transaction boundaries |
| PostgreSQL as primary store | ACID compliance required for permit lifecycle state transitions; rich relational joins for audit trails and reporting |
| S3-compatible object storage | Permit documents require durable, scalable binary storage separate from relational data; presigned URLs avoid proxying large files through the API |
| SPA with client-side routing | Premium interactive experience; role-based route guards enforce access at UI layer (API enforcement is primary) |
| Polling for status updates | Eliminates WebSocket operational complexity for v1; 10-second polling interval meets the < 30s staleness target; upgrade to SSE/WebSocket in v2 if needed |
| JWT access + refresh token pair | Stateless horizontal scaling; refresh token rotation prevents long-lived credential theft |

---

### 1.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              React SPA (Vite + TypeScript)                   │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │  Auth Layer  │  │  Routing     │  │  State (Zustand) │  │   │
│  │  │  JWT store   │  │  React Router│  │  auth / permits  │  │   │
│  │  │  interceptor │  │  Role guards │  │  messages / notif│  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │   │
│  │                                                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │Dashboard │ │Permit    │ │Document  │ │Messaging     │  │   │
│  │  │(per role)│ │List/Form │ │Upload    │ │Panel         │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS / REST JSON
                            │ (JWT Bearer token on all protected routes)
┌───────────────────────────▼─────────────────────────────────────────┐
│                     BACKEND API LAYER                               │
│                  NestJS — Node.js — Express                         │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Auth Module │  │ Permit Module│  │  Document Module         │  │
│  │  JWT / RBAC  │  │  CRUD +      │  │  Upload / Presign        │  │
│  │  Guards      │  │  Lifecycle   │  │  S3 integration          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Message     │  │  Notification│  │  Admin Module            │  │
│  │  Module      │  │  Module      │  │  Users / Audit           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  Shared Infrastructure                        │  │
│  │  TypeORM / Prisma ORM  │  Logger  │  Error Handler  │  Guard │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────┬────────────────────────────────────────┬────────────────┘
           │ SQL (TLS)                              │ S3 API (HTTPS)
┌──────────▼────────────┐              ┌────────────▼────────────────┐
│     PostgreSQL 15      │              │   S3-Compatible Object       │
│                        │              │   Storage                    │
│  • users               │              │                              │
│  • permit_applications │              │  • permit-documents/         │
│  • permit_status_hist  │              │    {app_id}/{doc_id}/        │
│  • documents           │              │    {filename}                │
│  • messages            │              │                              │
│  • message_attachments │              │  Access: presigned URLs      │
│  • notifications       │              │  only (no public buckets)    │
│  • audit_logs          │              │                              │
└────────────────────────┘              └─────────────────────────────┘
```

---

### 1.3 Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                    │
│                                                             │
│  ┌─────────────────┐        ┌──────────────────────────┐   │
│  │   CDN / Edge    │        │     Load Balancer         │   │
│  │  (static assets)│        │   (HTTPS termination)     │   │
│  │  React SPA      │        └────────────┬─────────────┘   │
│  └─────────────────┘                     │                  │
│                                 ┌────────▼──────────┐       │
│                                 │  API Server(s)    │       │
│                                 │  NestJS / Node    │       │
│                                 │  (1–N instances)  │       │
│                                 └────────┬──────────┘       │
│                      ┌──────────────────┼──────────────┐    │
│            ┌─────────▼──────┐   ┌───────▼────────┐     │    │
│            │  PostgreSQL 15  │   │  S3-Compatible │     │    │
│            │  (Primary +    │   │  Object Storage│     │    │
│            │   Read Replica)│   └────────────────┘     │    │
│            └────────────────┘                          │    │
└─────────────────────────────────────────────────────────────┘
```

**Deployment targets (recommended):**
- **Frontend SPA**: Vercel, Netlify, or AWS CloudFront + S3
- **Backend API**: Railway, Render, or AWS ECS/Fargate (containerized)
- **Database**: Managed PostgreSQL — AWS RDS, Supabase, or Neon
- **Object Storage**: AWS S3 or compatible (Cloudflare R2, MinIO for self-hosted)
- **Containerization**: Docker + Docker Compose for local development; Docker image for production deployments

---

### 1.4 Request Flow — Authenticated API Call

```
Browser                 API Server              PostgreSQL
  │                         │                       │
  │  POST /api/v1/permits   │                       │
  │  Authorization: Bearer  │                       │
  │  {access_token}         │                       │
  │────────────────────────>│                       │
  │                         │ Verify JWT signature  │
  │                         │ Extract user_id, role │
  │                         │ Check RBAC guard      │
  │                         │                       │
  │                         │ INSERT permit_app...  │
  │                         │──────────────────────>│
  │                         │                       │
  │                         │<─ { id, status, ... } │
  │                         │                       │
  │                         │ INSERT audit_log...   │
  │                         │──────────────────────>│
  │                         │                       │
  │<─ 201 { permit data }   │                       │
```

---

### 1.5 File Upload Flow

```
Browser                 API Server              S3 Storage
  │                         │                       │
  │ POST /documents/presign │                       │
  │ { filename, mime_type } │                       │
  │────────────────────────>│                       │
  │                         │ GeneratePresignedURL  │
  │                         │──────────────────────>│
  │                         │<── presigned_url      │
  │                         │                       │
  │<─ { upload_url,         │                       │
  │     document_id }       │                       │
  │                         │                       │
  │  PUT {upload_url}       │                       │
  │  (file bytes direct)    │                       │
  │────────────────────────────────────────────────>│
  │<─ 200 OK ───────────────────────────────────────│
  │                         │                       │
  │ POST /documents/confirm │                       │
  │ { document_id }         │                       │
  │────────────────────────>│                       │
  │                         │ UPDATE document       │
  │                         │ SET status='uploaded' │
  │                         │──────────────────────>│
  │<─ 200 { document }      │                       │
```

The two-phase upload (presign → direct S3 PUT → confirm) keeps large binary data off the API server, reduces bandwidth costs, and enables parallel uploads from the client.

---

### 1.6 Status Update Polling Strategy

For v1, status updates and notifications use **short-poll** from the frontend:

```
Browser                          API Server
  │                                  │
  │ GET /notifications/unread        │
  │ (every 10 seconds)               │
  │─────────────────────────────────>│
  │<─ { count, latest_events }       │
  │                                  │
  │ GET /permits/{id} (on open detail│
  │ page, every 15 seconds)          │
  │─────────────────────────────────>│
  │<─ { permit with current status } │
```

**Polling intervals:**
- Notification badge: 10-second interval (dashboard / all pages)
- Application detail status: 15-second interval (when detail page is open)
- Application list: 30-second interval (background refresh)

**v2 upgrade path:** Server-Sent Events (SSE) or WebSocket for push-based real-time updates, reducing server load at scale.
