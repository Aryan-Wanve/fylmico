# Tech Stack

## Status

Accepted planning baseline. See ADRs for decision rationale.

## Frontend

- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Framer Motion

Reasoning:

- Next.js gives Fylmico a strong foundation for routing, server rendering,
  metadata, and future product surfaces.
- React and TypeScript are mature choices for a large frontend team.
- TailwindCSS and shadcn/ui support a premium custom interface without locking
  the product into a heavy visual framework.
- Framer Motion supports subtle, high-quality interaction design.

## Backend

- NestJS
- Node.js
- TypeScript

Reasoning:

- NestJS provides modular backend structure, dependency injection, guards,
  interceptors, and conventions that fit a large codebase.
- Node.js keeps the platform aligned with the TypeScript ecosystem.

## Database

- PostgreSQL
- Prisma ORM

Reasoning:

- PostgreSQL is reliable for relational multi-tenant product data.
- Prisma gives type-safe database access, migrations, and developer ergonomics.

## Realtime

- Socket.IO

Reasoning:

- Socket.IO provides room-based realtime collaboration, reconnect behavior, and
  a mature ecosystem for chat, activity, comments, and notifications.

## Authentication

- Email authentication
- OAuth
- JWT access tokens
- Rotated refresh tokens

Reasoning:

- Fylmico needs secure first-party authentication plus future integrations with
  identity providers.

## Infrastructure

- Docker
- Nginx
- GitHub
- Hostinger VPS

Reasoning:

- This stack supports a practical early deployment path while preserving a path
  to more advanced infrastructure later.

## Deferred Choices

The following are intentionally deferred until implementation needs are clearer:

- Background job runner.
- Object storage provider.
- Email provider.
- Monitoring provider.
- Analytics provider.
- Search engine.
- Video processing pipeline.
