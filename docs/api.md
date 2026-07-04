# API

## Status

Accepted planning baseline. No API endpoints have been implemented in this
frontend workstream. API contracts are documented so the frontend can build
against stable public expectations while the backend team implements the
backend separately.

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
- Frontend code must treat the backend as a black box.
- Frontend code must never depend on Prisma, SQL, NestJS internals, database
  schema details, backend validation code, storage internals, queues, or other
  backend implementation details.
- Frontend code may define expected validation requirements in API contracts,
  but must not implement backend validation as a source of truth.
- Components must not fetch directly; they consume data through API clients,
  services, hooks, or state adapters.

## Frontend API Contract Workflow

When a frontend feature needs backend capability:

1. Document the public API contract in this file or a linked API contract doc.
2. Include method, route, request body, response body, error responses,
   authorization requirements, validation requirements, and expected behavior.
3. Create or update a mock API service with realistic responses.
4. Build UI components against the service abstraction.
5. Keep backend implementation out of the frontend codebase.
6. Replace mock service internals with real HTTP requests only when the backend
   contract is available.

Recommended frontend structure:

```text
apps/web/src/lib/api/
  auth.ts
  projects.ts
  users.ts
  teams.ts
  chat.ts
  notifications.ts

apps/web/src/services/
  auth.service.ts
  project.service.ts
  user.service.ts
  team.service.ts
  chat.service.ts
  notification.service.ts
```

The UI should not change when a mock service is replaced with a real API
request.

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

## Base Frontend API Contracts

These contracts support the initial frontend base scope: login, house creation,
house joining, house management, production roles, task scheduling/assignment,
and chat rooms. They are frontend contracts only; no backend implementation
exists in this workstream.

### `POST /api/v1/auth/login`

Purpose:

Authenticate a user and return the initial workspace snapshot needed by the
frontend shell.

Authentication:

Public.

Permissions:

None before login.

Request body:

```json
{
  "email": "aryan@example.com",
  "password": "example-password"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "user_123",
      "name": "Aryan Sharma",
      "email": "aryan@example.com",
      "avatarLabel": "AS"
    },
    "activeHouseId": "house_123",
    "houses": [],
    "tasks": [],
    "chatRooms": []
  }
}
```

Errors:

- `400 invalid_request`
- `401 invalid_credentials`
- `429 rate_limited`

Authorization requirements:

None before login. Returned workspace data must include only houses the user may
access.

Validation requirements:

- `email` must be a valid email address.
- `password` is required.

Expected behavior:

The backend creates or refreshes the session according to the backend auth
model. The frontend treats session storage as an API concern.

### `GET /api/v1/workspace`

Purpose:

Return the current user's active frontend workspace snapshot.

Authentication:

Required.

Permissions:

Authenticated user.

Response:

```json
{
  "data": {
    "user": {},
    "activeHouseId": "house_123",
    "houses": [],
    "tasks": [],
    "chatRooms": []
  }
}
```

Errors:

- `401 unauthenticated`
- `403 forbidden`

Authorization requirements:

Only return houses, tasks, rooms, and members visible to the current user.

Validation requirements:

None.

Expected behavior:

This endpoint is the frontend recovery/refetch endpoint after refresh,
optimistic updates, or realtime events.

### `POST /api/v1/houses`

Purpose:

Create a new creative production house.

Authentication:

Required.

Permissions:

Authenticated user may create a house unless account-level limits prevent it.

Request body:

```json
{
  "name": "North Star Films",
  "handle": "north-star",
  "description": "Commercial film and launch content studio."
}
```

Response:

```json
{
  "data": {
    "id": "house_123",
    "name": "North Star Films",
    "handle": "north-star",
    "description": "Commercial film and launch content studio.",
    "inviteCode": "NORT-2048",
    "members": [],
    "roles": []
  }
}
```

Errors:

- `400 invalid_request`
- `401 unauthenticated`
- `409 handle_unavailable`

Authorization requirements:

The creator becomes the first owner unless backend policy says otherwise.

Validation requirements:

- `name` is required.
- `handle` is required, unique, lowercase URL-safe text.
- `description` is optional.

Expected behavior:

Create the house, assign the creator an owner role, create default production
roles, and return the created house.

### `POST /api/v1/houses/join`

Purpose:

Join an existing house using an invite code.

Authentication:

Required.

Permissions:

Valid invite holder.

Request body:

```json
{
  "inviteCode": "NOVA-2048"
}
```

Response:

```json
{
  "data": {
    "id": "house_123",
    "name": "Nova Frame House",
    "handle": "nova-frame",
    "description": "Commercial films, reels, launch videos, and event edits.",
    "inviteCode": "NOVA-2048",
    "members": [],
    "roles": []
  }
}
```

Errors:

- `400 invalid_request`
- `401 unauthenticated`
- `404 invite_not_found`
- `409 already_member`

Authorization requirements:

The invite controls which role or starting access the joining user receives.

Validation requirements:

- `inviteCode` is required.

Expected behavior:

Add the user to the house and return the joined house.

### `POST /api/v1/tasks`

Purpose:

Schedule and assign a production task.

Authentication:

Required.

Permissions:

User must be allowed to create tasks in the target house or project.

Request body:

```json
{
  "houseId": "house_123",
  "title": "Prepare rough cut",
  "project": "Cafe Noir Opening",
  "assigneeId": "user_456",
  "role": "Editor",
  "dueDate": "2026-07-07"
}
```

Response:

```json
{
  "data": {
    "id": "task_123",
    "title": "Prepare rough cut",
    "project": "Cafe Noir Opening",
    "assigneeId": "user_456",
    "assigneeName": "Mira Kapoor",
    "role": "Editor",
    "dueDate": "2026-07-07",
    "status": "scheduled",
    "priority": "medium"
  }
}
```

Errors:

- `400 invalid_request`
- `401 unauthenticated`
- `403 forbidden`
- `404 assignee_not_found`

Authorization requirements:

Assignee must belong to the house or be visible in the target project context.

Validation requirements:

- `houseId`, `title`, `project`, `assigneeId`, `role`, and `dueDate` are
  required.
- `role` must be a public role name or id supported by the house.

Expected behavior:

Create a scheduled task and return it. Realtime task events may be emitted by
the backend later.

### `POST /api/v1/chat/rooms/:roomId/messages`

Purpose:

Send a message to a house chat room.

Authentication:

Required.

Permissions:

User must be a member of the house and have access to the room.

Request params:

- `roomId`

Request body:

```json
{
  "body": "Version 03 is ready for producer review."
}
```

Response:

```json
{
  "data": {
    "id": "msg_123",
    "authorId": "user_123",
    "authorName": "Aryan Sharma",
    "sentAt": "2026-07-04T10:25:00.000Z",
    "body": "Version 03 is ready for producer review."
  }
}
```

Errors:

- `400 invalid_request`
- `401 unauthenticated`
- `403 forbidden`
- `404 room_not_found`

Authorization requirements:

Room access is enforced by the backend. Frontend room visibility is only a user
experience hint.

Validation requirements:

- `body` is required and must not be empty.

Expected behavior:

Persist the message and return it. Realtime delivery may be emitted by the
backend later.

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

Authorization requirements:

Validation requirements:

Expected behavior:

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
