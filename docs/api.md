# API

## Status

Draft. No API endpoints have been implemented.

## Planned API Stack

- NestJS
- TypeScript
- JWT authentication
- Organization-aware authorization

## API Design Principles

- Every endpoint must document request, response, authentication, permissions,
  and examples.
- API contracts should be strongly typed.
- Validation should happen at boundaries.
- Errors should be consistent and safe to expose.
- Endpoints must never leak data across organizations.
- Realtime events must follow the same authorization model as HTTP endpoints.

## Endpoint Documentation Template

Use this template for every endpoint once API work begins.

### `METHOD /path`

Purpose:

Authentication:

Permissions:

Request params:

Request body:

Response:

Errors:

Example request:

Example response:

Notes:

## Planned API Areas

- Authentication
- Users
- Organizations
- Memberships
- Teams
- Departments
- Clients
- Projects
- Tasks
- Chat
- Notifications
- Calendar
- Assets
- Comments
- Approvals
- Search
- Administration

## Open Questions

- What is the preferred API versioning strategy?
- Which validation library should be standardized?
- Should public API contracts be generated from shared schemas?
- What rate limiting is required for production?
- What audit events must be emitted by API mutations?
