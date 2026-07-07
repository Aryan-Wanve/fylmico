# Project Context

This file is the permanent memory of Fylmico. Another engineer or AI agent
should be able to understand the project after reading only this file.

## Project Overview

Fylmico is intended to become the operating system for creative production: one
workspace for production houses, agencies, editors, filmmakers, photographers,
social media teams, and creative teams to manage the entire workflow from client
onboarding to final delivery.

## Product Philosophy

Fylmico is not a clone of Notion, Discord, Trello, or Frame.io. It should feel
like a purpose-built ecosystem for creative production where communication,
planning, assets, review, approvals, scheduling, and delivery connect naturally.

## Design Philosophy

The product should feel premium, modern, minimal, elegant, fast, responsive,
smooth, professional, and dark-mode-first. Avoid visual clutter. Use intentional
whitespace. Keep animations subtle. The interface should feel expensive without
becoming decorative or inefficient.

## Current Architecture

Sprint 1 has completed the complete technical architecture documentation
baseline. No Sprint 1 application features, database migrations, API endpoints,
package folders, or placeholder implementations were created.

Development direction update: Fylmico is now developed by two developers. This
workstream is frontend-only unless the user explicitly changes direction.
Developer 1 owns frontend engineering, UI/UX, frontend architecture, design
system, component library, state management, frontend performance,
accessibility, animations, responsive design, and frontend API integration.
Developer 2 owns backend engineering, authentication, database, Prisma, NestJS,
business logic, REST APIs, WebSockets, permissions, storage, notifications, AI
services, infrastructure, and backend deployment.

The accepted frontend baseline is a TypeScript npm workspace:

```text
apps/
  web/
packages/
  ui/
  shared/
docs/
```

Baseline architecture decisions:

- `apps/web`: Next.js App Router web application. This is the only runnable app
  in Sprint 0.
- `packages/ui`: Shared design system and UI primitives.
- `packages/shared`: Frontend-safe public API contracts, shared domain types,
  and validation schemas for client-side forms only.

`apps/api`, backend packages, and backend implementation folders must not be
created in this workstream unless the user explicitly changes direction.

Sprint 1 accepted architecture decisions:

- Start with a modular monolith backend, not microservices.
- Use Next.js App Router with a shared UI package and typed API/realtime
  clients.
- Use versioned REST over JSON under `/api/v1`.
- Treat organization as the primary tenant boundary.
- Treat project as the primary production workspace inside an organization.
- Store file binaries in object storage and file metadata in PostgreSQL.
- Use Socket.IO with server-authorized rooms for realtime collaboration.
- Use AI only through permission-aware backend services with minimized context.
- Keep API/auth/realtime/file contracts compatible with future mobile clients.
- Scale in phases: single-node deployment, workers/Redis/object storage,
  horizontal scale, then selective service extraction.
- Treat the backend as a black box and communicate only through documented
  public API contracts.
- Use realistic mock data and service abstractions until backend APIs exist.
- Never put Prisma, SQL, database logic, backend business logic, backend
  validation implementations, or backend implementation assumptions in frontend
  code.

## Planned Stack

- Web: Next.js, React, TypeScript, TailwindCSS, shadcn/ui, Framer Motion
- Frontend API layer: `lib/api/*` and service abstractions with mock services
  until backend APIs exist
- Backend API: public API contracts defined by frontend/backend collaboration
- Backend implementation stack: owned by Developer 2 and treated as a black box

## Database Overview

Database work is owned by Developer 2. Frontend work must not create schemas,
migrations, Prisma models, SQL, or database logic. Frontend models represent
public API contracts and UI view models only.

## Authentication Overview

Authentication backend implementation is owned by Developer 2. Frontend work
builds authentication screens, session UI, auth state, route protection UX, and
API contracts/mock services without implementing backend auth logic.

## Permissions Overview

Permissions backend implementation is owned by Developer 2. Frontend work may
use public permission claims or capability responses for UI experience, but the
API remains the enforcement source.

## Current Milestone

Phase 1 (foundation and planning) is complete. The project is now in Phase
2/3: frontend application scaffold and early authentication UI, built
frontend-only with a black-box backend and public API contracts (ADR 0017).

## Current Progress

The repository has a root npm workspace, Next.js App Router app in
`apps/web`, TypeScript, ESLint, Prettier, Husky, lint-staged, Docker, GitHub
Actions CI, and both a Hostinger Node.js standalone startup entry and a
static Git deployment path (`npm run build:hostinger`, publishing to
`dist/hostinger` and mirroring to the repository root).

`apps/web` now uses Tailwind v4 + shadcn/ui as its actual design system
(`components/ui/*`). Real routes exist under an `(app)` route group: a home
dashboard (`/`), a no-house onboarding flow (`/houses/new`), and a login
screen (`/login`) outside the group. All are backed by the mock service in
`services/base-workspace.service.ts` per ADR 0017 — no backend
implementation exists in this workstream.

Sprint 1 architecture documentation is complete in `docs/architecture.md` with
ADR coverage through ADR 0016. It covers overall system architecture, frontend,
backend, database, API, authentication, authorization, organization hierarchy,
project hierarchy, file storage, realtime, AI integration, future mobile
compatibility, deployment, and scaling strategy.

ADR 0017 records the frontend/backend independence model.

## Current Blockers

- Backend implementation must not be started in this workstream.
- Confirm the Hostinger deployment returns HTTP 200 after using either root
  Node.js deployment with `server.js` startup or static Git deployment with
  `dist/hostinger`, if this has not already been confirmed outside the repo.

## Current Priorities

1. Focus only on frontend application development.
2. For every backend dependency, define an API contract and mock service.
3. Confirm the deployed domain returns HTTP 200 if deployment confirmation is
   still pending.

## Latest Implemented Feature

Full frontend rebuild on the new design system: login screen, authenticated
app shell (sidebar/topbar), home dashboard (stat cards, schedule, tasks,
projects, activity), and no-house onboarding. See
[docs/progress.md](progress.md) for the detailed session log.

## Next Feature

The remaining sidebar destinations (Projects, Calendar, Tasks, Crews, Files,
Storyboard, Messages, Bookings, Analytics, Settings) each need their own
route, following the same pattern already established: design UI against the
shared reference mockups, define/extend the API contract, create or extend a
mock service, build components, connect to mocks, handle loading/empty/error/
success states, and update documentation.

## Things Never To Change Without Explicit Decision

- Documentation is part of the codebase and must remain current.
- Fylmico is a creative production platform, not a generic productivity clone.
- The product should be built for long-term maintainability and scale.
- Major architectural decisions require ADRs.
- Do not rely on chat history as project memory.
- Do not write placeholder implementations.
- Do not rewrite unrelated files.
- Frontend must never depend on backend implementation details.
- Frontend must communicate only through documented public API contracts.
- Mock services are required until backend APIs exist.

## Known Issues

- Hostinger deployment needs confirmation after switching the panel to either
  Node.js mode with `server.js` or static Git mode with `dist/hostinger`.
- Backend implementation is external to this frontend workstream.
- Frontend API contracts must be created as features need them.
- Sprint 1 architecture is documentation-only and does not implement the
  architecture.

## Session Startup Checklist

Before implementation, read:

- `README.md`
- `PROJECT_SPEC.md`
- `MASTER_INDEX.md`
- `AI_RULES.md`
- `PRODUCT_PRINCIPLES.md`
- `docs/context.md`
- `docs/progress.md`
- `docs/roadmap.md`
- `docs/decisions.md`
- Latest ADRs in `docs/adr`
