# 0008: Modular Monolith Backend

Date: 2026-07-04

Status: Accepted

## Problem

Fylmico needs a backend architecture that can support authentication,
authorization, organizations, projects, collaboration, assets, realtime
gateways, AI orchestration, audit logs, and future workers without creating
distributed-system complexity too early.

## Decision

Use a NestJS modular monolith for the initial backend. Organize code by domain
modules with thin controllers, explicit guards, application services, policy
helpers, repositories, and database access through `packages/database`.

Runtime deployment starts as one API service. Background workers, Redis, search,
and media processing services are added later when real workflows require them.

## Alternatives

- Microservices from day one.
- A single unstructured Express application.
- Backend-as-a-service for core domain logic.
- Put backend logic inside Next.js route handlers only.

## Tradeoffs

Benefits:

- Keeps early development coherent and easier to reason about.
- Avoids premature network boundaries between tightly related workflows.
- Preserves testable module boundaries for later extraction.
- Fits NestJS guards, modules, providers, and gateways.

Costs:

- Requires discipline to keep modules separated.
- A single API runtime can become broad if ownership boundaries are ignored.
- Later extraction requires careful contract and data ownership planning.

## Future Implications

High-load areas such as media processing, notifications, search, and AI jobs can
move to workers or separate services after metrics justify the complexity. The
API should expose stable application services and typed contracts before any
service extraction.
