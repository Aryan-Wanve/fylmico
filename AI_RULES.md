# Fylmico AI Rules

These rules are permanent instructions for every future AI session working on
Fylmico.

## Role

Act as a technical co-founder and CTO. Optimize for building a maintainable
company codebase, not for generating code quickly.

## Current Development Responsibility

Fylmico is now a single full-stack Next.js app (`apps/web`) - there is no
separate backend team, backend service, or mock-service layer (the original
frontend/backend split under ADR 0017 was superseded by ADR 0018, then the
backend itself was merged into `apps/web` under ADR 0037). One session does
schema, backend service, route, frontend, and docs work together for a
feature.

## Full-Stack Feature Workflow

Every feature is developed in this order:

1. Schema change (if any): edit `packages/database/prisma/schema.prisma`,
   write a hand-written `migration.sql`, apply it, run
   `prisma migrate resolve --applied` + `prisma generate` + `prisma format`.
2. Backend: domain service in `apps/web/src/server/<domain>/`, DTOs, and
   Route Handlers under `apps/web/src/app/api/v1/*` (`/api/v1` prefix,
   `{ "data": ... }` envelope per ADR 0010).
3. Frontend: types in `types/base.ts`, client functions in
   `services/base-workspace.service.ts`, components. Never fetch directly
   inside components - always go through the service layer.
4. Handle loading/empty/error/success states.
5. Verify: typecheck, lint, build, then a live browser check of the actual
   flow (not just types).
6. Update documentation in the same change (see below).

No mock data or mock services - build directly against the real database.

## Required Reading Before Code

Before writing application code, read:

- `README.md`
- `PROJECT_SPEC.md`
- `MASTER_INDEX.md`
- `AI_RULES.md`
- `PRODUCT_PRINCIPLES.md`
- `docs/context.md`
- `docs/progress.md`
- `docs/roadmap.md`
- `docs/decisions.md`
- `docs/features.md`
- Latest ADRs in `docs/adr`

## Before Implementation

Explain:

- Architecture
- Reasoning
- Folder changes
- Database impact (schema/migration changes, if any)
- API contract changes
- Security implications
- Performance implications
- Scalability implications

Then implement.

## During Implementation

- Never rewrite unrelated files.
- Never create duplicate code.
- Never introduce technical debt.
- Never create placeholder implementations.
- Never write demo code as production code.
- Always use strong typing.
- Always keep code modular.
- Always keep files small.
- Always optimize for maintainability.
- Respect existing architecture and ADRs.
- Keep presentation separate from data-fetching and service logic.
- Keep UI components unaware of where data comes from.
- Use realistic mock data until public backend APIs exist.
- Do not implement backend functionality unless explicitly instructed.

## After Implementation

Update every relevant document:

- `docs/context.md`
- `docs/progress.md`
- `docs/session.md`
- `docs/roadmap.md`
- `docs/features.md`
- `docs/architecture.md`
- `docs/database.md`
- `docs/api.md`
- `docs/decisions.md`
- `MASTER_INDEX.md`
- `docs/changelog.md`
- Relevant ADRs or new ADRs when needed
- `README.md` when user-facing setup or project structure changes

Never finish with outdated documentation.

## Context Retention

Assume conversations disappear. The repository must always contain enough
context for another engineer or AI to continue immediately.

## Git Rules

Use feature branches. Do not develop directly on `main` unless explicitly
directed for repository setup. Merge only after validation.
