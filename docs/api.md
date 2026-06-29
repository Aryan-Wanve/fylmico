# API

## Status

Accepted planning baseline. No API endpoints have been implemented.

## API Stack

- NestJS
- TypeScript
- JWT authentication
- Organization-aware authorization

## API Design Principles

- Every endpoint must document request, response, authentication, permissions,
  errors, and examples.
- API contracts should be strongly typed.
- Validation must happen at boundaries.
- Errors must be consistent and safe to expose.
- Endpoints must never leak data across organizations.
- Realtime events must follow the same authorization model as HTTP endpoints.
- The API is the source of permission enforcement.

## URL Conventions

Use versioned API routes:

```text
/api/v1/...
```

Prefer organization-scoped routes when resources belong to an organization:

```text
/api/v1/organizations/:organizationId/projects
```

Prefer nested routes only when the parent context is required for authorization
or clarity.

## Authentication

Access tokens identify the user, session, and active organization. The API must
load and enforce permissions server-side.

Planned auth endpoints:

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/request-password-reset`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`

## Planned Endpoint Areas

Organizations:

- Create organization.
- List current user's organizations.
- Read organization.
- Update organization.
- Invite members.
- Manage memberships.

Projects:

- Create project.
- List organization projects.
- Read project.
- Update project.
- Archive project.
- Manage project members.

Clients:

- Create client.
- List clients.
- Read client.
- Update client.
- Link clients to projects.

Collaboration:

- Tasks.
- Conversations.
- Messages.
- Comments.
- Notifications.
- Activity feed.

Creative production:

- Assets.
- Asset versions.
- Reviews.
- Approvals.
- Storyboards.
- Moodboards.
- Scripts.
- Shot lists.
- Call sheets.
- Equipment.
- Crew.
- Locations.

Administration:

- Roles.
- Permissions.
- Audit logs.
- Settings.

## Response Shape

Successful single-resource response:

```json
{
  "data": {}
}
```

Successful list response:

```json
{
  "data": [],
  "page": {
    "limit": 25,
    "cursor": null,
    "nextCursor": null
  }
}
```

Error response:

```json
{
  "error": {
    "code": "forbidden",
    "message": "You do not have permission to perform this action.",
    "requestId": "req_example"
  }
}
```

## Endpoint Documentation Template

### `METHOD /api/v1/path`

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

## Realtime API

Realtime events must be documented with:

- Event name.
- Payload.
- Emitting service.
- Required room.
- Required permissions.
- Persistence behavior.

Realtime events must not be the source of truth. Persisted data belongs in
PostgreSQL.

## Deferred API Decisions

- Validation library.
- Request ID implementation.
- Rate limiting strategy.
- Public API strategy.
- API documentation generation.
