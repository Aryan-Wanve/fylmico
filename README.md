# Fylmico

**The Operating System for Creative Production**

Fylmico is a collaboration platform for filmmakers, production houses, editors,
photographers, agencies, creative teams, and social media management companies.
The goal is to replace disconnected tools with one seamless production
workspace, from client onboarding to final delivery.

## Current Phase

The app runs on a real backend end-to-end - no mock data or mock services
remain anywhere. Every sidebar destination (Home/HUD, Projects, Calendar,
Tasks, Crews, Files, Storyboard, Scripts, Messages, Bookings, Call Sheets,
Announcements, Analytics, Settings) is a real route backed by PostgreSQL via
Prisma.

The backend lives inside `apps/web` itself (Next.js Route Handlers under
`src/app/api/v1/*` + domain services under `src/server/*`), not a separate
NestJS service - see [ADR 0037](docs/adr/0037-merge-backend-into-nextjs.md).
See [docs/progress.md](docs/progress.md) for the session-by-session build
log and [docs/features.md](docs/features.md) for what's shipped vs. still
planned.

## Required Reading Before Implementation

Before any implementation session, read these files:

- [MASTER_INDEX.md](MASTER_INDEX.md)
- [PROJECT_SPEC.md](PROJECT_SPEC.md)
- [AI_RULES.md](AI_RULES.md)
- [PRODUCT_PRINCIPLES.md](PRODUCT_PRINCIPLES.md)
- [docs/context.md](docs/context.md)
- [docs/progress.md](docs/progress.md)
- [docs/roadmap.md](docs/roadmap.md)
- [docs/features.md](docs/features.md)
- [docs/decisions.md](docs/decisions.md)
- Latest records in [docs/adr](docs/adr)

## Documentation Index

- [Project context](docs/context.md)
- [Progress log](docs/progress.md)
- [Roadmap](docs/roadmap.md)
- [Feature register](docs/features.md)
- [Changelog](docs/changelog.md)
- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [API](docs/api.md)
- [Authentication](docs/authentication.md)
- [Permissions](docs/permissions.md)
- [Deployment](docs/deployment.md)
- [Hostinger deployment](docs/hostinger-deployment.md)
- [Coding standards](docs/coding-standards.md)
- [Tech stack](docs/tech-stack.md)
- [Glossary](docs/glossary.md)
- [Session log](docs/session.md)
- [Decision log](docs/decisions.md)
- [Architecture decision records](docs/adr)

## Product Principles

Fylmico is not a generic productivity app, Notion clone, Discord clone, Trello
clone, or Frame.io clone. It combines the best parts of those patterns into one
unified ecosystem designed specifically for creative production.

The interface should be premium, modern, minimal, elegant, fast, responsive,
smooth, professional, and dark-mode-first. Visual clutter should be avoided.
Whitespace should be intentional. Animations should be subtle.

## Technical Direction

The actual architecture is a monorepo with:

- `apps/web` for the Next.js web app - this is both the frontend and the
  backend (Route Handlers under `src/app/api/v1/*`).
- `packages/database` for the Prisma schema, migrations, and generated
  client.
- `docs/*` for durable project memory.

The actual stack is Next.js, React, TypeScript, TailwindCSS, shadcn/ui,
Framer Motion, PostgreSQL, Prisma, Supabase Realtime, JWT, Google OAuth,
Docker, Nginx, and Hostinger VPS. (The originally planned separate NestJS
API and Socket.IO realtime layer were superseded - see ADR 0037 and 0044.)

## Current Baseline Decisions

- Monorepo structure is accepted in [ADR 0001](docs/adr/0001-monorepo.md).
- PostgreSQL and Prisma are accepted in [ADR 0002](docs/adr/0002-database.md).
- JWT access tokens with rotated refresh tokens are accepted in
  [ADR 0003](docs/adr/0003-authentication.md).
- Hybrid RBAC and policy-based authorization is accepted in
  [ADR 0004](docs/adr/0004-permissions.md), extended with a modular
  permission system in [ADR 0048](docs/adr/0048-pending-members-and-permissions.md).
- The backend was merged directly into the Next.js app in
  [ADR 0037](docs/adr/0037-merge-backend-into-nextjs.md), superseding the
  original separate-NestJS-service plan.
- Supabase Realtime powers chat/presence, accepted in
  [ADR 0044](docs/adr/0044-realtime-chat-supabase.md), superseding the
  original Socket.IO plan in [ADR 0005](docs/adr/0005-realtime.md).
- Docker, Nginx, GitHub, and Hostinger VPS deployment is accepted in
  [ADR 0006](docs/adr/0006-deployment.md).

## Documentation Policy

Documentation is part of the product. Every completed task must update the
relevant documentation so another engineer or AI agent can continue from the
repository without relying on chat history.
