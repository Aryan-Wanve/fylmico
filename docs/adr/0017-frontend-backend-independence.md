# 0017: Frontend and Backend Independence

Date: 2026-07-04

Status: Accepted

## Problem

Fylmico is now developed by two developers with separate ownership. Developer 1
owns the frontend, UI/UX, design system, frontend architecture, state
management, accessibility, animations, responsive design, performance, and
frontend API integration. Developer 2 owns backend engineering, including
authentication, database, Prisma, NestJS, business logic, REST APIs,
WebSockets, permissions, storage, notifications, AI services, infrastructure,
and backend deployment.

The frontend must be able to move quickly without waiting for backend
implementation, but it must not leak backend assumptions into UI code.

## Decision

Treat the backend as a black box owned by another engineering team. Frontend
code may communicate only through documented public API contracts.

Frontend work must not use or depend on:

- Prisma.
- SQL.
- Database logic.
- Backend business logic.
- Backend validation implementations.
- NestJS internals.
- Backend storage, queue, infrastructure, or deployment details.

When frontend work needs backend functionality, define the API contract, create
a realistic mock service, build against the service abstraction, and leave
backend implementation to the backend team.

Every frontend feature must follow this order:

1. Design UI.
2. Define API contract.
3. Create mock service.
4. Build components.
5. Connect components to the mock service.
6. Handle loading state.
7. Handle empty state.
8. Handle error state.
9. Handle success state.
10. Update documentation.

## Alternatives

- Continue developing frontend and backend as one tightly coupled codebase.
- Block frontend work until backend endpoints are implemented.
- Let UI components call fetch directly and adapt later.
- Share Prisma/database types with the frontend for speed.

## Tradeoffs

Benefits:

- Frontend development can proceed independently.
- Backend implementation can evolve without forcing UI rewrites.
- API contracts become explicit collaboration points between developers.
- Mock services allow realistic loading, empty, error, and success states.
- Components stay presentational and easier to test.

Costs:

- API contracts require discipline and maintenance.
- Mock data can drift if contracts are not reviewed.
- Some frontend assumptions may need contract correction after backend review.
- Service abstractions add structure before real HTTP integration exists.

## Future Implications

Frontend features should create or update `lib/api/*` and service files instead
of fetching directly inside components. When backend APIs become available, the
expected integration path is to replace mock service internals with real HTTP
requests while leaving pages, layouts, components, state boundaries, and design
system primitives mostly unchanged.
