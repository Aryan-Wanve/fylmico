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

Sprint 0 has implemented the first application scaffold. The accepted baseline
is a TypeScript npm workspace:

```text
apps/
  web/
  api/
packages/
  ui/
  auth/
  database/
  shared/
  realtime/
  calendar/
  storyboard/
  editor/
  ai/
  notifications/
  search/
  permissions/
docs/
```

Baseline architecture decisions:

- `apps/web`: Next.js App Router web application. This is the only runnable app
  in Sprint 0.
- `apps/api`: NestJS API application.
- `packages/ui`: Shared design system and UI primitives.
- `packages/database`: Prisma schema, migrations, and database client.
- `packages/auth`: Authentication contracts and helpers.
- `packages/permissions`: Authorization policy logic.
- `packages/realtime`: Typed Socket.IO event contracts.
- `packages/shared`: Shared domain contracts and validation schemas.

`apps/api` and `packages/*` are intentionally not created yet because Sprint 0
must avoid placeholder folders.

## Planned Stack

- Web: Next.js, React, TypeScript, TailwindCSS, shadcn/ui, Framer Motion
- API: Node.js, NestJS
- Database: PostgreSQL, Prisma ORM
- Realtime: Socket.IO
- Authentication: JWT, OAuth, email authentication
- Infrastructure: Docker, Nginx, Hostinger VPS, GitHub

## Database Overview

No database schema has been implemented yet. The accepted planning baseline uses
PostgreSQL and Prisma. Organization is the primary tenant boundary. Initial
domain areas include users, authentication accounts, sessions, organizations,
memberships, roles, permissions, clients, projects, tasks, conversations,
assets, comments, approvals, versions, audit logs, and notifications.

## Authentication Overview

The accepted planning baseline uses email authentication, OAuth-ready auth
accounts, short-lived JWT access tokens, and rotated opaque refresh tokens
stored server-side as hashes. Authentication is separate from authorization.

## Permissions Overview

The accepted planning baseline uses hybrid RBAC and policy checks. Organization
is the primary tenant boundary. The API is the source of authorization
enforcement; UI permission checks are only for experience.

## Current Milestone

Phase 1: foundation and planning.

## Current Progress

Sprint 0 foundation scaffold exists. The repository has a root npm workspace,
Next.js App Router app in `apps/web`, TypeScript, TailwindCSS, ESLint,
Prettier, Husky, lint-staged, Docker, GitHub Actions CI, and a Hostinger
standalone startup entry.
Because the deployed Hostinger site continued returning HTTP 403, Sprint 0 also
supports a static Git deployment path with `npm run build:hostinger`, which
publishes to `dist/hostinger`.

## Current Blockers

- Confirm the Hostinger deployment returns HTTP 200 after using root deployment
  and `server.js` startup.
- Do not begin Sprint 1 until deployment is confirmed functional.

## Current Priorities

1. Redeploy on Hostinger from the repository root.
2. Use `npm install`, `npm run build`, and `npm start`.
3. Configure startup file as `server.js` if Hostinger asks for one.
4. If Hostinger asks for a publish directory instead of a startup file, use
   `npm run build:hostinger` and publish `dist/hostinger`.
5. Confirm the deployed domain returns HTTP 200.
6. Only then approve Sprint 1 planning.

## Latest Implemented Feature

None. No product features have been implemented.

## Next Feature

No product feature should be started until Hostinger deployment is confirmed
functional. The likely first feature area remains authentication plus
organization workspace setup, after deployment approval.

## Things Never To Change Without Explicit Decision

- Documentation is part of the codebase and must remain current.
- Fylmico is a creative production platform, not a generic productivity clone.
- The product should be built for long-term maintainability and scale.
- Major architectural decisions require ADRs.
- Do not rely on chat history as project memory.
- Do not write placeholder implementations.
- Do not rewrite unrelated files.

## Known Issues

- Hostinger deployment needs confirmation after switching the panel to either
  Node.js mode with `server.js` or static Git mode with `dist/hostinger`.
- No database schema exists yet.
- No API contract exists yet.
- No production database, object storage, or API deployment exists yet.

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
