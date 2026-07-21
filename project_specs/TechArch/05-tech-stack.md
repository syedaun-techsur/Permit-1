---

## 6. Technology Stack

### 6.1 Full Stack Technology Table

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | | | |
| Framework | React | 18.x | UI component model, hooks-based architecture |
| Build Tool | Vite | 5.x | Fast HMR, optimized production bundling |
| Language | TypeScript | 5.x | Type safety; strict mode required |
| Routing | React Router | 6.x | Client-side routing, protected routes |
| State Management | Zustand | 4.x | Lightweight global state (auth, permits, notifications) |
| Styling | Tailwind CSS | 3.x | Utility-first CSS with custom design tokens |
| HTTP Client | Axios | 1.x | REST API calls; interceptors for JWT attach + refresh |
| Form Handling | React Hook Form | 7.x | Performant forms with validation integration |
| Validation (FE) | Zod | 3.x | Schema validation; shared type inference with forms |
| Date Formatting | date-fns | 3.x | Lightweight date utilities; no moment.js |
| Icons | Lucide React | latest | Consistent SVG icon set; tree-shakeable |
| PDF Preview | react-pdf | 7.x | In-browser PDF rendering for document preview |
| Drag-and-Drop | react-dropzone | 14.x | File upload zone with validation hooks |
| Accessibility | axe-core | 4.x | Automated WCAG 2.1 AA checks in CI |
| Testing | Vitest + RTL | latest | Unit and integration tests; co-located with components |
| E2E Testing | Playwright | 1.x | Browser automation; cross-browser test suite |
| **Backend** | | | |
| Runtime | Node.js | 20 LTS | JavaScript runtime; LTS for stability |
| Framework | NestJS | 10.x | Structured, modular architecture; decorator-based DI |
| Language | TypeScript | 5.x | Shared type safety; strict mode |
| ORM | TypeORM | 0.3.x | PostgreSQL integration; migrations; entity-based |
| Auth Library | Passport.js | 0.7.x | Strategy pattern for JWT validation |
| JWT | @nestjs/jwt | 10.x | Token issuance and verification |
| Validation | class-validator + class-transformer | 0.14.x | DTO validation with decorators |
| Password Hashing | bcrypt | 5.x | Secure password hashing (cost factor 12) |
| S3 Integration | @aws-sdk/client-s3 | 3.x | S3-compatible storage; presigned URLs |
| Rate Limiting | @nestjs/throttler | 5.x | Per-IP rate limits on auth endpoints |
| Logging | winston | 3.x | Structured JSON logging; console + file transport |
| API Docs | @nestjs/swagger | 7.x | Auto-generated OpenAPI spec from decorators |
| Testing | Jest | 29.x | Unit + integration tests for services |
| **Database** | | | |
| RDBMS | PostgreSQL | 15.x | Primary data store; ACID compliance |
| Migrations | TypeORM migrations | — | Schema versioning; run on deploy |
| Connection Pool | pg (node-postgres) | 8.x | Via TypeORM; pool size tuned per environment |
| **Infrastructure** | | | |
| Object Storage | AWS S3 / Cloudflare R2 | — | Document binary storage; private bucket |
| Containerization | Docker | 24.x | Reproducible builds; dev/prod parity |
| Orchestration | Docker Compose | 2.x | Local development multi-service orchestration |
| CI/CD | GitHub Actions | — | Lint, test, build, deploy pipeline |
| Environment Secrets | dotenv (dev) / Secrets Manager (prod) | — | Env var injection; never committed to VCS |

---

### 6.2 Key Dependency Decisions

| Decision | Chosen | Rejected | Rationale |
|----------|--------|---------|-----------|
| State management | Zustand | Redux Toolkit | Zustand has significantly less boilerplate for a project of this scale; straightforward migration to Redux Toolkit if complexity grows |
| ORM | TypeORM | Prisma | TypeORM integrates more directly with NestJS decorators; Prisma is a valid alternative with excellent type generation — either works |
| Form library | React Hook Form + Zod | Formik | RHF is lighter and re-renders less; Zod provides end-to-end type safety from schema to form value |
| Icon set | Lucide React | Heroicons, FontAwesome | Lucide is tree-shakeable, MIT-licensed, and stylistically consistent with the design direction |
| PDF viewer | react-pdf | iframe / embed | react-pdf renders PDFs in-canvas for accessibility and consistent cross-browser experience |
| Testing framework (FE) | Vitest | Jest | Native Vite integration; faster HMR-aware test runs; same API surface as Jest |
| Logging | Winston | Pino | Winston is better supported in NestJS ecosystem; Pino is faster if performance becomes a concern |

---

### 6.3 Local Development Setup

```
┌─────────────────────────────────────────────────────────────┐
│                 docker-compose.yml (dev)                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  frontend    │  │   backend    │  │   postgres       │  │
│  │  Vite HMR   │  │  NestJS      │  │  postgres:15     │  │
│  │  :5173      │  │  :3000       │  │  :5432           │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────┐                       │
│  │  MinIO (S3-compatible local)     │                       │
│  │  :9000 (API) + :9001 (Console)  │                       │
│  └──────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

MinIO provides an S3-compatible API locally so the presigned URL flow works identically to production without needing AWS credentials in local development.

---

### 6.4 CI/CD Pipeline

```
GitHub Push / PR
       │
       ▼
┌─────────────────────────────────────────────┐
│  GitHub Actions Workflow                    │
│                                             │
│  1. lint         ESLint + TypeScript check  │
│  2. test:unit    Vitest (FE) + Jest (BE)    │
│  3. test:e2e     Playwright (main branch)   │
│  4. build        Vite build + NestJS build  │
│  5. docker:build Build API Docker image     │
│  6. deploy       Push image; migrate DB;    │
│                  deploy frontend to CDN     │
└─────────────────────────────────────────────┘
```

Database migrations run as a pre-deployment step via `typeorm migration:run` before the new API version serves traffic, ensuring schema is always ahead of application code.
