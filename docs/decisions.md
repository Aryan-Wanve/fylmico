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

### 2026-06-29: Hostinger static export fallback

Status: Accepted

Decision: Add `npm run build:hostinger` to export the current static Sprint 0
shell to `dist/hostinger` for Hostinger Git deployments that require a publish
directory instead of a Node.js startup file.

ADR: [0007-sprint-0-foundation.md](adr/0007-sprint-0-foundation.md)

## Pending Decisions

- Package manager and build tooling.
- Validation library.
- Object storage provider.
- Email provider.
- Background job system.
- Monitoring and logging provider.
- Search infrastructure.

## ADR Requirements

Every ADR must include:

- Problem
- Decision
- Alternatives
- Tradeoffs
- Future implications
