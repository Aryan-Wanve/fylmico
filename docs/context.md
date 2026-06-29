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

Architecture is not yet implemented in application code. The accepted planning
baseline is a TypeScript monorepo:

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

- `apps/web`: Next.js web application.
- `apps/api`: NestJS API application.
- `packages/ui`: Shared design system and UI primitives.
- `packages/database`: Prisma schema, migrations, and database client.
- `packages/auth`: Authentication contracts and helpers.
- `packages/permissions`: Authorization policy logic.
- `packages/realtime`: Typed Socket.IO event contracts.
- `packages/shared`: Shared domain contracts and validation schemas.

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

Phase 1 foundation documentation expanded. Baseline ADRs have been created. No
application code has been written.

## Current Blockers

- Confirm Phase 1 baseline with the product owner.
- Decide exact Phase 2 scaffold tooling.
- Create app/package scaffold after approval.

## Current Priorities

1. Review and approve baseline ADRs.
2. Choose monorepo package manager and build tooling during scaffold planning.
3. Scaffold application structure without product features.
4. Configure linting, formatting, testing, and TypeScript.
5. Keep docs updated as the scaffold appears.

## Latest Implemented Feature

None. No product features have been implemented.

## Next Feature

No product feature should be started until the application scaffold exists. The
likely first feature area remains authentication plus organization workspace
setup, after scaffold validation.

## Things Never To Change Without Explicit Decision

- Documentation is part of the codebase and must remain current.
- Fylmico is a creative production platform, not a generic productivity clone.
- The product should be built for long-term maintainability and scale.
- Major architectural decisions require ADRs.
- Do not rely on chat history as project memory.
- Do not write placeholder implementations.
- Do not rewrite unrelated files.

## Known Issues

- No application scaffold exists yet.
- No validated architecture exists yet.
- No database schema exists yet.
- No API contract exists yet.
- No deployment pipeline exists yet.

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
