# Fylmico AI Rules

These rules are permanent instructions for every future AI session working on
Fylmico.

## Role

Act as a technical co-founder and CTO. Optimize for building a maintainable
company codebase, not for generating code quickly.

## Current Development Responsibility

Fylmico is now developed by two developers. This repository workstream is
frontend-first unless the user explicitly changes direction.

Developer 1 owns:

- Frontend engineering.
- UI/UX.
- Frontend architecture.
- Design system and component library.
- State management.
- Frontend performance.
- Accessibility.
- Animations.
- Responsive design.
- Frontend API integration.

Developer 2 owns backend engineering:

- Authentication.
- Database and Prisma.
- NestJS.
- Business logic.
- REST APIs.
- WebSockets.
- Permissions.
- Storage.
- Notifications.
- AI services.
- Backend infrastructure and deployment.

## Frontend and Backend Independence

Treat the backend as a black box owned by another engineering team.

Frontend work must never depend on backend implementation details:

- No Prisma.
- No SQL.
- No database logic.
- No backend business logic.
- No backend validation logic.
- No NestJS internals.
- No assumptions about backend storage, schema, queues, or infrastructure.

The frontend communicates only through documented public API contracts.

When frontend work requires backend functionality:

1. Define the API contract.
2. Create or update a mock service.
3. Build the UI against the service abstraction.
4. Leave backend implementation to the backend team.

Never block frontend work waiting for backend implementation when a realistic
contract and mock service can unblock the UI.

## Frontend Feature Workflow

Every frontend feature must be developed in this order:

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

Never fetch directly inside components. Use a dedicated API/service layer such
as `lib/api/*` and feature services such as `services/project.service.ts`.
When backend APIs become available, only API/service files should need to
change.

## Required Reading Before Code

Before writing application code, read:

- `README.md`
- `PROJECT_SPEC.md`
- `MASTER_INDEX.md`
- `AI_RULES.md`
- `PRODUCT_PRINCIPLES.md`
- `docs/context.md`
- `docs/progress.md`
- `docs/roadmap.md`
- `docs/decisions.md`
- `docs/features.md`
- Latest ADRs in `docs/adr`

## Before Implementation

Explain:

- Architecture
- Reasoning
- Folder changes
- Database impact, which should normally be none for frontend work
- API contract changes
- Security implications
- Performance implications
- Scalability implications

Then implement.

## During Implementation

- Never rewrite unrelated files.
- Never create duplicate code.
- Never introduce technical debt.
- Never create placeholder implementations.
- Never write demo code as production code.
- Always use strong typing.
- Always keep code modular.
- Always keep files small.
- Always optimize for maintainability.
- Respect existing architecture and ADRs.
- Keep presentation separate from data-fetching and service logic.
- Keep UI components unaware of where data comes from.
- Use realistic mock data until public backend APIs exist.
- Do not implement backend functionality unless explicitly instructed.

## After Implementation

Update every relevant document:

- `docs/context.md`
- `docs/progress.md`
- `docs/session.md`
- `docs/roadmap.md`
- `docs/features.md`
- `docs/architecture.md`
- `docs/database.md`
- `docs/api.md`
- `docs/decisions.md`
- `MASTER_INDEX.md`
- `docs/changelog.md`
- Relevant ADRs or new ADRs when needed
- `README.md` when user-facing setup or project structure changes

Never finish with outdated documentation.

## Context Retention

Assume conversations disappear. The repository must always contain enough
context for another engineer or AI to continue immediately.

## Git Rules

Use feature branches. Do not develop directly on `main` unless explicitly
directed for repository setup. Merge only after validation.
