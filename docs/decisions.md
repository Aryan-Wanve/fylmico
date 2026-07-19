# Decisions

This file tracks high-level decisions and links to ADRs. Major architectural
decisions must also be recorded as individual ADR files in `docs/adr`.

## Decision Log

### 2026-06-29: Documentation-first foundation

Status: Accepted

Context: Fylmico is intended to become a large, long-lived creative production
platform. The project specification requires durable project memory before
application code is written.

Decision: Create the documentation scaffold before writing application code.

Impact: Future work must keep documentation current and must read the project
memory files before implementation.

ADR: Not required; this directly follows the project specification.

### 2026-06-29: Monorepo structure

Status: Accepted

Decision: Use a TypeScript monorepo with `apps`, `packages`, and `docs`.

ADR: [0001-monorepo.md](adr/0001-monorepo.md)

### 2026-06-29: Database and ORM

Status: Accepted

Decision: Use PostgreSQL and Prisma ORM.

ADR: [0002-database.md](adr/0002-database.md)

### 2026-06-29: Authentication model

Status: Accepted

Decision: Use email/OAuth-ready identity, short-lived JWT access tokens, and
rotated opaque refresh tokens stored as hashes.

ADR: [0003-authentication.md](adr/0003-authentication.md)

### 2026-06-29: Permissions model

Status: Accepted

Decision: Use hybrid RBAC and policy-based authorization with organization as
the primary tenant boundary.

ADR: [0004-permissions.md](adr/0004-permissions.md)

### 2026-06-29: Realtime architecture

Status: Accepted

Decision: Use Socket.IO with typed event contracts and server-authorized rooms.

ADR: [0005-realtime.md](adr/0005-realtime.md)

### 2026-06-29: Deployment architecture

Status: Accepted

Decision: Use Dockerized services behind Nginx on Hostinger VPS for the initial
deployment path.

ADR: [0006-deployment.md](adr/0006-deployment.md)

### 2026-06-29: Hostinger standalone startup

Status: Accepted

Decision: Deploy from the repository root and use root `server.js` as the
Hostinger startup file. Root `npm start` runs the generated Next.js standalone
server instead of `next start`.

ADR: [0007-sprint-0-foundation.md](adr/0007-sprint-0-foundation.md)

### 2026-07-04: Modular monolith backend

Status: Accepted

Decision: Use a NestJS modular monolith for the initial backend, with domain
modules, thin controllers, application services, centralized policies, and
database access through `packages/database`.

ADR: [0008-modular-monolith-backend.md](adr/0008-modular-monolith-backend.md)

### 2026-07-04: Frontend architecture

Status: Accepted

Decision: Use Next.js App Router with typed API/realtime clients, route-level
composition in `apps/web`, and reusable primitives in `packages/ui` when shared.

ADR: [0009-frontend-architecture.md](adr/0009-frontend-architecture.md)

### 2026-07-04: API architecture

Status: Accepted

Decision: Use versioned REST over JSON under `/api/v1`, with typed contracts,
boundary validation, consistent envelopes, and API-side authorization.

ADR: [0010-api-architecture.md](adr/0010-api-architecture.md)

### 2026-07-04: Organization hierarchy

Status: Accepted

Decision: Treat organization as the primary tenant boundary. Users access an
organization through memberships, and organization-owned records must carry or
inherit organization scope.

ADR: [0011-organization-hierarchy.md](adr/0011-organization-hierarchy.md)

### 2026-07-04: Project hierarchy

Status: Accepted

Decision: Treat project as the primary production workspace inside an
organization, owning most collaboration, creative production, asset, review,
approval, and delivery records.

ADR: [0012-project-hierarchy.md](adr/0012-project-hierarchy.md)

### 2026-07-04: File storage architecture

Status: Accepted

Decision: Store binary media in object storage and store metadata, ownership,
permissions, versions, object keys, and processing state in PostgreSQL.

ADR: [0013-file-storage-architecture.md](adr/0013-file-storage-architecture.md)

### 2026-07-04: AI integration architecture

Status: Accepted

Decision: Implement AI as permission-aware backend application services that
use minimized authorized context and return user-controlled suggestions rather
than authoritative state changes.

ADR: [0014-ai-integration-architecture.md](adr/0014-ai-integration-architecture.md)

### 2026-07-04: Future mobile compatibility

Status: Accepted

Decision: Design API, auth, authorization, realtime, file access, and
notification contracts so future mobile clients can share the same backend.

ADR: [0015-future-mobile-compatibility.md](adr/0015-future-mobile-compatibility.md)

### 2026-07-04: Scaling strategy

Status: Accepted

Decision: Scale in phases from a single-node modular monolith to workers,
Redis, object storage, CDN, observability, horizontal API instances, and
selective service extraction only when metrics justify it.

ADR: [0016-scaling-strategy.md](adr/0016-scaling-strategy.md)

### 2026-07-04: Frontend and backend independence

Status: Accepted

Decision: Split development responsibility into a frontend-only workstream and
an independently owned backend workstream. Frontend code treats the backend as a
black box, communicates only through documented public API contracts, uses mock
services until APIs exist, and never depends on Prisma, SQL, database logic,
backend validation implementations, NestJS internals, or backend infrastructure.

ADR: [0017-frontend-backend-independence.md](adr/0017-frontend-backend-independence.md)

### 2026-06-29: Hostinger static export fallback

Status: Accepted

Decision: Add `npm run build:hostinger` to export the current static Sprint 0
shell to `dist/hostinger` for Hostinger Git deployments that require a publish
directory instead of a Node.js startup file.

ADR: [0007-sprint-0-foundation.md](adr/0007-sprint-0-foundation.md)

### 2026-07-19: Frame.io-style review system

Status: Accepted

Decision: Rebuild the Review system into a dedicated workspace (video
player with frame-stepping, timeline with comment/annotation markers,
draw-on-frame annotation tools, threaded comments with mentions/
reactions/resolve, and a three-button Needs Changes/Reject/Approve
workflow where Approve automates moving the file into Deliverables and
optionally Portfolio). Fixed three underlying bugs along the way: the
deliverable version-numbering race, the `approve()`/`markFinal()` status
inconsistency, and weaker auth on the review queue than its actions.

ADR: [0060-frameio-style-review-system.md](adr/0060-frameio-style-review-system.md)

## Pending Decisions

- Package manager and build tooling.
- Validation library.
- Object storage provider and CDN.
- Email provider.
- Background job system.
- Monitoring and logging provider.
- Search infrastructure.
- AI provider, retention, usage limits, and embeddings strategy.
- Mobile application technology choice.
- Frontend state management library.
- Frontend server-state/query library.
- Mock service organization and test strategy.

## ADR Requirements

Every ADR must include:

- Problem
- Decision
- Alternatives
- Tradeoffs
- Future implications
