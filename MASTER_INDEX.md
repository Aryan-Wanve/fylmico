# Fylmico Master Index

This is the first document every engineer or AI agent should read before
working on Fylmico.

## Core Project Documents

- [README.md](README.md): Project overview and documentation entry point.
- [PROJECT_SPEC.md](PROJECT_SPEC.md): Canonical product and engineering brief.
- [AI_RULES.md](AI_RULES.md): Permanent instructions for future AI sessions.
- [PRODUCT_PRINCIPLES.md](PRODUCT_PRINCIPLES.md): Product philosophy and design
  principles.

## Project Memory

- [docs/context.md](docs/context.md): Permanent project memory.
- [docs/progress.md](docs/progress.md): Current progress and latest session
  summary.
- [docs/session.md](docs/session.md): Append-only development session log.
- [docs/roadmap.md](docs/roadmap.md): Milestones, backlog, and priorities.
- [docs/features.md](docs/features.md): Feature register and implementation
  notes.
- [docs/changelog.md](docs/changelog.md): Meaningful project changes.

## Engineering Documents

- [docs/architecture.md](docs/architecture.md): System architecture, services,
  dependencies, and scaling strategy.
- [docs/database.md](docs/database.md): Database model, relationships, indexes,
  constraints, and migration history.
- [docs/api.md](docs/api.md): API conventions, endpoint plan, authentication,
  permissions, and examples.
- [docs/authentication.md](docs/authentication.md): Authentication model and
  session strategy.
- [docs/permissions.md](docs/permissions.md): Authorization model, roles, and
  policy rules.
- [docs/deployment.md](docs/deployment.md): Deployment architecture and
  operational strategy.
- [docs/hostinger-deployment.md](docs/hostinger-deployment.md): Hostinger
  Node.js deployment settings and 403 checklist.
- [docs/coding-standards.md](docs/coding-standards.md): Coding standards and
  quality expectations.
- [docs/tech-stack.md](docs/tech-stack.md): Selected technologies and reasons.
- [docs/glossary.md](docs/glossary.md): Shared product and engineering language.

## Decisions

- [docs/decisions.md](docs/decisions.md): High-level decision log.
- [docs/adr](docs/adr): Architecture decision records.

Current ADRs:

- [0001-monorepo.md](docs/adr/0001-monorepo.md)
- [0002-database.md](docs/adr/0002-database.md)
- [0003-authentication.md](docs/adr/0003-authentication.md)
- [0004-permissions.md](docs/adr/0004-permissions.md)
- [0005-realtime.md](docs/adr/0005-realtime.md)
- [0006-deployment.md](docs/adr/0006-deployment.md)
- [0007-sprint-0-foundation.md](docs/adr/0007-sprint-0-foundation.md)
- [0008-modular-monolith-backend.md](docs/adr/0008-modular-monolith-backend.md)
- [0009-frontend-architecture.md](docs/adr/0009-frontend-architecture.md)
- [0010-api-architecture.md](docs/adr/0010-api-architecture.md)
- [0011-organization-hierarchy.md](docs/adr/0011-organization-hierarchy.md)
- [0012-project-hierarchy.md](docs/adr/0012-project-hierarchy.md)
- [0013-file-storage-architecture.md](docs/adr/0013-file-storage-architecture.md)
- [0014-ai-integration-architecture.md](docs/adr/0014-ai-integration-architecture.md)
- [0015-future-mobile-compatibility.md](docs/adr/0015-future-mobile-compatibility.md)
- [0016-scaling-strategy.md](docs/adr/0016-scaling-strategy.md)
- [0017-frontend-backend-independence.md](docs/adr/0017-frontend-backend-independence.md)
- [0018-backend-bootstrap.md](docs/adr/0018-backend-bootstrap.md)
- [0019-auth-module.md](docs/adr/0019-auth-module.md)
- [0020-organizations-houses-module.md](docs/adr/0020-organizations-houses-module.md)
- [0021-tasks-chat-module.md](docs/adr/0021-tasks-chat-module.md)
- [0022-projects-clients-module.md](docs/adr/0022-projects-clients-module.md)
- [0023-notifications-module.md](docs/adr/0023-notifications-module.md)
- [0024-comments-module.md](docs/adr/0024-comments-module.md)
- [0025-frontend-backend-integration.md](docs/adr/0025-frontend-backend-integration.md)
- [0026-tasks-page-extension.md](docs/adr/0026-tasks-page-extension.md)
- [0027-projects-page-extension.md](docs/adr/0027-projects-page-extension.md)
- [0028-crews-module.md](docs/adr/0028-crews-module.md)

## Current Sprint Gate

Backend implementation has started (ADR 0018), superseding ADR 0017's
"backend is a black box" framing for this workstream. `apps/api` (NestJS) and
`packages/database` (Prisma) have working identity/auth (ADR 0019),
organizations/houses (ADR 0020), tasks/chat (ADR 0021), projects/clients
(ADR 0022), notifications (ADR 0023), and comments (ADR 0024) domains, all
backed by real tables and curl-verified end to end.

**`apps/web` is now wired to the real backend for its core loop** (ADR
0025): signup, login, logout, house creation, and house joining all call
the real API — verified live in-browser with two real accounts creating and
joining a real house. **The standalone `/tasks` page is now real too** (ADR
0026): create, status toggle, duplicate, and delete all round-trip through
`POST`/`PATCH`/`DELETE /api/v1/tasks`, verified live in-browser. Wiring it up
required unifying the task status vocabulary (the dashboard's task panel and
the standalone Tasks page previously used two different, incompatible sets)
and adding update/delete endpoints that didn't exist before. **The
standalone `/projects` page is real too** (ADR 0027): create, duplicate,
and archive round-trip through `POST`/`PATCH`/`POST .../archive
/api/v1/houses/:houseId/projects` and `/api/v1/projects/:projectId`,
verified live in-browser. `Project` gained `type`/`genre`/`stage`/
`progress`/cover-art/`teamIds` fields to match its designed UI, with the
API's `status` field computed server-side from `stage` rather than stored
directly (the DB `status` column keeps its original archive-tracking
meaning). **The standalone `/crews` page is real too** (ADR 0028): a
"crew member" is now always a real house member (`User` +
`OrganizationMembership`), extended with a new `CrewProfile` (department,
role category, availability status, current assignment), auto-seeded
whenever someone creates or joins a house. "Invite Member" reveals the
house's real invite code instead of fabricating a fake person; "Remove"
really removes the member (`DELETE /api/v1/houses/:houseId/crew/:userId`,
this codebase's first member-removal capability - blocked only from
emptying a house entirely, with no finer-grained "only Owners can do
this" check yet). Verified live in-browser, including the last-member
guard correctly blocking removal. Everything else (`/files`,
`/storyboard`, `/calendar`, `/bookings`, `/analytics`, `/settings`, the
dashboard's "Recent Projects"/"Recent Activity" panels, and the standalone
`/messages` page) still runs on independent local mock data colocated per
page — those pages' designs are materially richer than their matching
(or, for files/storyboard/calendar/bookings/analytics, nonexistent)
backend models, so wiring each one up means extending its Prisma schema
first, not just swapping a mock for a fetch call. No object storage
exists anywhere in the backend yet - a concrete, named prerequisite for
project cover photos and the entire `/files` page. Real RBAC (who can
remove/edit what) is now a concretely scoped gap across every module, not
just one. The frontend silently refreshes an expired access token on a
`401` (verified live). No realtime delivery (Socket.IO, ADR 0005) exists
anywhere yet — notifications and chat are both REST/poll-based for now.

To run both sides locally: `docker compose up -d postgres`, then start the
`api` and `web` dev servers (`.claude/launch.json` has both configured).
`apps/api/.env` and root `.env.example` document the required variables.

## Required Startup Flow

Before writing application code:

1. Read this file.
2. Read `PROJECT_SPEC.md`.
3. Read `AI_RULES.md`.
4. Read `PRODUCT_PRINCIPLES.md`.
5. Read `docs/context.md`.
6. Read `docs/progress.md`.
7. Read `docs/roadmap.md`.
8. Read `docs/decisions.md`.
9. Read `docs/features.md`.
10. Read the latest ADRs in `docs/adr`.

Then summarize the current architecture, affected files, database impact, API
impact, security impact, performance impact, and scalability impact before
implementation.

For frontend features, also define the API contract, mock service, loading
state, empty state, error state, and success state before completion.
