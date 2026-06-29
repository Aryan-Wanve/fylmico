# Architecture

## Status

Draft. No application code has been created.

## Architecture Goals

- Support a long-lived creative production platform.
- Keep frontend, backend, shared packages, and documentation organized in a
  scalable monorepo.
- Make multi-tenant organization boundaries explicit.
- Keep domain modules reusable and strongly typed.
- Avoid placeholder implementations and avoid duplicated logic.
- Make major decisions traceable through ADRs.

## Planned Monorepo Structure

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

## Planned Applications

### `apps/web`

Next.js application for the Fylmico web product.

Expected responsibilities:

- User interface.
- Routing.
- Server-rendered and client-rendered views.
- Design system consumption.
- Authentication flows.
- Organization and project workflows.

### `apps/api`

NestJS application for the platform API.

Expected responsibilities:

- HTTP API.
- Authentication.
- Authorization.
- Domain services.
- Realtime gateway integration.
- Background job entry points.

## Planned Packages

### `packages/ui`

Shared UI components, design tokens, and frontend primitives.

### `packages/auth`

Shared authentication helpers, token contracts, and identity types.

### `packages/database`

Prisma schema, migrations, database client, and database-related types.

### `packages/shared`

Shared TypeScript types, constants, validation schemas, and domain contracts.

### `packages/realtime`

Typed realtime event contracts and Socket.IO helpers.

### `packages/permissions`

Role, permission, and policy logic shared by API and frontend.

### Domain Packages

The following packages are planned but should only be created when there is a
clear need:

- `packages/calendar`
- `packages/storyboard`
- `packages/editor`
- `packages/ai`
- `packages/notifications`
- `packages/search`

## Cross-Cutting Concerns

Authentication:

- Must be designed before implementation.
- Must support email authentication, OAuth, and JWT.

Authorization:

- Must be organization-aware.
- Must support team, project, client, and role-based access.

Realtime:

- Must be typed and permission-aware.
- Must not leak organization or project data across tenants.

Observability:

- Logging, error handling, and future monitoring must be planned before
  production deployment.

## Required ADRs Before Implementation

- Monorepo structure.
- Database and ORM.
- Authentication and session model.
- Permissions model.
- Realtime architecture.
- Deployment architecture.
