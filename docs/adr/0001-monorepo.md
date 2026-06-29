# 0001: Monorepo Structure

Date: 2026-06-29

Status: Accepted

## Problem

Fylmico will include a web app, API, shared design system, database package,
auth logic, realtime contracts, permissions, notifications, search, AI, and
creative production modules. These parts must evolve together without copying
types, duplicating business rules, or losing documentation.

## Decision

Use a TypeScript monorepo with:

```text
apps/
  web/
  api/
packages/
  ui/
  database/
  auth/
  shared/
  realtime/
  notifications/
  calendar/
  storyboard/
  editor/
  permissions/
  search/
  ai/
docs/
```

Application code will live in `apps`. Reusable platform and domain code will
live in `packages`. Durable project memory will live in `docs`.

## Alternatives

- Separate repositories for web, API, and shared packages.
- Single full-stack app without packages.
- Backend-first repository with frontend added later.

## Tradeoffs

Benefits:

- Shared types and contracts stay close to their consumers.
- Documentation, API, and database decisions remain in one repository.
- Refactors across app and API boundaries are easier.

Costs:

- Requires clear package boundaries.
- Requires tooling discipline to avoid circular dependencies.
- Repository can become large if ownership is not maintained.

## Future Implications

The monorepo should eventually use a workspace-aware package manager and build
tooling. Package boundaries must be enforced through linting and review. Domain
packages should be created only when there is real shared behavior.
