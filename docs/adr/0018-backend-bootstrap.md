# 0018: Backend Bootstrap

Date: 2026-07-08

Status: Accepted

## Problem

ADR 0017 established a frontend/backend independence model where the backend
was owned by a separate developer and treated as a black box from the
frontend workstream. The person doing frontend work has now taken over
backend engineering directly as well. `apps/api` and `packages/*` were
intentionally never created (ADR 0007) until they contained real code — that
condition is now true, and the extensive backend planning already captured in
ADRs 0001-0016 (monorepo layout, database, authentication, permissions,
realtime, deployment, modular monolith, API architecture, organization/project
hierarchy, file storage, AI integration, scaling) needs a first real
implementation to build on.

## Decision

Stand up `apps/api` (NestJS) and `packages/database` (Prisma) as scaffold
only: a running API connected to a real PostgreSQL database, wired into the
existing npm workspaces and docker-compose setup, with a single health-check
endpoint (`GET /api/v1/health`). No domain models, authentication, or
business logic are introduced in this pass.

Specifically:

- `apps/api`: NestJS app following the layering in `docs/architecture.md`
  (controllers/gateways -> guards/interceptors -> application services ->
  repositories/Prisma), global `/api/v1` prefix and the `{ "data": ... }`
  response envelope from ADR 0010 applied even to the health check, CORS
  configured from environment.
- `packages/database`: Prisma schema with only a `datasource`/`generator`
  block (no models yet), a `PrismaService` (Nest lifecycle-managed
  `PrismaClient`), and a `DatabaseModule` exported for `apps/api` to import,
  per ADR 0008's rule that database access goes through `packages/database`.
- Root `package.json` workspaces, `docker-compose.yml` (new `postgres` and
  `api` services alongside `web`), and `.env.example` updated to match.

The next pass (not part of this ADR) is expected to add identity/auth models
and endpoints (`users`, `auth_accounts`, `sessions`) per ADR 0003, since
nearly every other domain depends on an authenticated context.

## Alternatives

- Build auth (or auth + organizations/houses) in the same pass as the
  scaffold. Rejected for this pass: mixing monorepo/tooling wiring with a
  first schema and business logic makes both harder to review; scaffold-only
  gets a running, connected backend to verify independently first.
- Keep `apps/api` deferred further and continue frontend-only. No longer
  applies: the two-developer split behind ADR 0017 has ended for this
  workstream.
- Use a different backend framework or ORM than what ADRs 0002/0008 already
  decided. Not reconsidered here — those decisions stand; this ADR only
  begins implementing them.

## Tradeoffs

Benefits:

- Establishes a real, running backend connected to a real database without
  the risk surface of also reviewing a first domain schema and auth logic.
- Confirms the monorepo/workspace/docker wiring works before any business
  logic depends on it.
- Keeps `packages/database` aligned with ADR 0008 from the start rather than
  retrofitting a shared data-access layer later.

Costs:

- No functional backend endpoint exists yet beyond a health check; frontend
  still runs entirely on mock services until the next pass.
- Establishes conventions (module layering, response envelope, Docker
  multi-stage build) that later domains must follow consistently.

## Future Implications

- ADR 0017's "backend is a black box, frontend-only workstream" framing is
  superseded going forward for this developer; `docs/roadmap.md`'s "Standing
  Development Rule" and repeated "no backend implementation" notes in
  `docs/progress.md` reflect the old model and are updated alongside this
  ADR.
- Follow-up passes should add domain models to `packages/database/prisma/schema.prisma`
  and corresponding Nest modules under `apps/api/src/`, starting with identity/auth,
  then organizations (the "House" concept)/permissions, per the dependency
  order in `docs/architecture.md`.
- The frontend's existing mock service (`apps/web/src/services/base-workspace.service.ts`)
  and its documented contracts in `docs/api.md` remain the target shape for
  the first real endpoints once auth and houses are implemented.
