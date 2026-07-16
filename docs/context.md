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

The original plan (Sprint 1) was a frontend-only workstream with a
black-box, separately-owned backend (ADR 0017, two-developer split). That
model was superseded early: backend implementation entered this workstream
under ADR 0018, and the backend was later merged directly into the Next.js
app under ADR 0037 (there is no separate `apps/api` anymore).

Actual repository layout:

```text
apps/
  web/            # Next.js App Router - both the UI and the /api/v1/* backend
packages/
  database/       # Prisma schema, migrations, generated client
docs/
```

- `apps/web/src/app/api/v1/*`: the entire backend - Next.js Route Handlers,
  not a separate NestJS service (ADR 0037).
- `apps/web/src/server/*`: domain services (organizations, tasks, files,
  analytics, notifications, ...), one folder per domain, called directly by
  the route handlers.
- `packages/database`: Prisma schema/migrations, shared by the app via
  `apps/web/src/server/prisma.ts`.
- Every route follows the `/api/v1` prefix and `{ "data": ... }` response
  envelope from ADR 0010.
- Organization ("House") is the tenant boundary; Project is the production
  workspace inside a House.
- File binaries live in each House's own connected Google Drive
  (ADR 0038, 0045); file metadata lives in PostgreSQL.
- Realtime (chat, presence) uses Supabase Realtime, not Socket.IO
  (ADR 0044) - the earlier Socket.IO plan in ADR 0005 was superseded.
- AI integration and audit logs remain planned, not implemented (see
  `docs/features.md`).

## Planned Stack

Actual stack in use: Next.js (App Router) + React + TypeScript + Tailwind
v4 + shadcn/ui on the frontend; the same Next.js app's Route Handlers +
Prisma + PostgreSQL on the backend; JWT access tokens with rotated refresh
tokens (ADR 0003); Supabase Realtime for chat/presence (ADR 0044); Google
Drive for file storage (ADR 0045); Hostinger VPS via Docker/Nginx for
deployment (ADR 0006, 0034, 0042).

## Database Overview

`packages/database/prisma/schema.prisma` is the single source of truth.
Every table/column addition ships as a hand-written migration plus a
`docs/database.md` update in the same change - see that file for the full
implemented schema.

## Authentication Overview

OTP-based email login plus Google OAuth (ADR 0035, 0039), short-lived JWT
access tokens, rotated opaque refresh tokens, and session management under
`/api/v1/auth/*`. Fully implemented - see `docs/authentication.md` and
`docs/api.md`.

## Permissions Overview

A centralized 18-key permission system exists
(`apps/web/src/lib/permissions.ts`, ADR 0048): named Positions (roles) hold
a permission set, assigned via the Crews "Assign Role" wizard. Only
`approve_members` is enforced via `requirePermission` so far; other domain
services still use simpler Owner-only/any-member gates (see
`docs/features.md`'s Permissions entry for what's left).

## Current Milestone

Phase 9 (see `docs/progress.md`'s latest entries) - real backend for every
remaining domain, now well past the original Phase 1-8 roadmap. Every page
in `apps/web` runs against the real backend; there is no mock data or mock
service layer left anywhere in the app.

## Current Progress

The repository is a root npm workspace with `apps/web` (Next.js app +
backend) and `packages/database` (Prisma). ESLint, Prettier, Husky,
lint-staged, Docker, and GitHub Actions CI (migrate-on-push, ADR 0042) are
in place. Deployment targets a Hostinger VPS via a Node.js standalone
startup entry.

Every sidebar destination (Home/HUD, Projects, Calendar, Tasks, Crews,
Files, Storyboard, Scripts, Messages, Bookings, Call Sheets, Announcements,
Analytics, Settings) is a real route backed by the real database - see
`docs/progress.md` for the full session-by-session build history and
`docs/adr/` for the architectural decision behind each one.

## Current Blockers

- None tracked. Check `docs/progress.md`'s latest entry's "Known
  limitations / tradeoffs" and "Next task" sections for open items.

## Current Priorities

See the latest entry in `docs/progress.md` for the current "Next task"
list and `docs/features.md` for feature-level status (several modules -
Timeline/Gantt, Equipment, Budgets/Invoices/Contracts, Moodboards, Video
review, AI assistant, Voice/Video, Audit logs - remain planned, not
implemented).

## Latest Implemented Feature

See the most recent dated entry at the bottom of
[docs/progress.md](progress.md) - each entry lists what shipped, what was
explicitly deferred, and the ADR documenting the decision.

## Next Feature

See the "Next task" section of the latest entry in
[docs/progress.md](progress.md).

## Things Never To Change Without Explicit Decision

- Documentation is part of the codebase and must remain current.
- Fylmico is a creative production platform, not a generic productivity clone.
- The product should be built for long-term maintainability and scale.
- Major architectural decisions require ADRs.
- Do not rely on chat history as project memory.
- Do not write placeholder implementations.
- Do not rewrite unrelated files.
- The client must communicate only through the documented `/api/v1/*`
  contracts in `docs/api.md` - no direct Prisma/SQL calls from components.
- No mock data or mock services remain anywhere in the app - every page
  runs against the real database.

## Known Issues

- See the latest entry in `docs/progress.md`'s "Known limitations /
  tradeoffs" section - kept there per-feature instead of duplicated here.

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
