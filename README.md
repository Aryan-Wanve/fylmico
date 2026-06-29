# Fylmico

**The Operating System for Creative Production**

Fylmico is a collaboration platform for filmmakers, production houses, editors,
photographers, agencies, creative teams, and social media management companies.
The goal is to replace disconnected tools with one seamless production
workspace, from client onboarding to final delivery.

## Current Phase

Phase 1: foundation and planning.

No application code should be written until the architecture, documentation,
database plan, permissions model, authentication model, deployment approach, and
coding standards are clear.

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

The intended architecture is a monorepo with:

- `apps/web` for the Next.js web app.
- `apps/api` for the NestJS API.
- `packages/*` for shared platform libraries.
- `docs/*` for durable project memory.

The intended stack is Next.js, React, TypeScript, TailwindCSS, shadcn/ui, Framer
Motion, NestJS, PostgreSQL, Prisma, Socket.IO, JWT, OAuth, Docker, Nginx, and
Hostinger VPS.

## Current Baseline Decisions

- Monorepo structure is accepted in [ADR 0001](docs/adr/0001-monorepo.md).
- PostgreSQL and Prisma are accepted in [ADR 0002](docs/adr/0002-database.md).
- JWT access tokens with rotated refresh tokens are accepted in
  [ADR 0003](docs/adr/0003-authentication.md).
- Hybrid RBAC and policy-based authorization is accepted in
  [ADR 0004](docs/adr/0004-permissions.md).
- Socket.IO realtime architecture is accepted in
  [ADR 0005](docs/adr/0005-realtime.md).
- Docker, Nginx, GitHub, and Hostinger VPS deployment is accepted in
  [ADR 0006](docs/adr/0006-deployment.md).

## Documentation Policy

Documentation is part of the product. Every completed task must update the
relevant documentation so another engineer or AI agent can continue from the
repository without relying on chat history.
