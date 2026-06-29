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

Architecture is not yet implemented. The planned direction is a monorepo:

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

## Planned Stack

- Web: Next.js, React, TypeScript, TailwindCSS, shadcn/ui, Framer Motion
- API: Node.js, NestJS
- Database: PostgreSQL, Prisma ORM
- Realtime: Socket.IO
- Authentication: JWT, OAuth, email authentication
- Infrastructure: Docker, Nginx, Hostinger VPS, GitHub

## Database Overview

No database schema has been implemented yet. The database design must be planned
before implementation and documented in `docs/database.md`.

## Current Milestone

Phase 1: foundation and planning.

## Current Progress

Documentation scaffold created. No application code has been written.

## Current Blockers

- Complete architecture design.
- Complete database design.
- Complete permissions model.
- Complete authentication design.
- Complete deployment design.
- Decide initial milestone scope.

## Current Priorities

1. Finalize architecture.
2. Finalize database model.
3. Finalize permissions and authentication.
4. Finalize deployment approach.
5. Create initial ADRs for major decisions.
6. Only then scaffold application code.

## Latest Implemented Feature

None. No product features have been implemented.

## Next Feature

No feature should be started until Phase 1 foundation work is complete. The
likely first implementation area is authentication plus organization workspace
setup, after ADR approval.

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
- `docs/context.md`
- `docs/progress.md`
- `docs/roadmap.md`
- `docs/decisions.md`
- Latest ADRs in `docs/adr`
