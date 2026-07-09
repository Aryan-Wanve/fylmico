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

Access tokens identify the user, session, and active organization
(`activeOrganizationId`, added per ADR 0020 — `null` until the user creates
or joins a house; only as fresh as the token's own issuance, see ADR 0020).
The API must load and enforce permissions server-side.

Implemented per ADR 0019/0020 (`apps/api/src/auth/*`):

### `POST /api/v1/auth/signup`

Authentication: public. Body:
`{ "email": string, "password": string (min 8), "name": string }`.
Response: `{ "data": { "user": { "id", "email", "name", "avatarLabel", "emailVerifiedAt", "createdAt" }, "accessToken", "refreshToken" } }`
(`avatarLabel` is derived from `name`, e.g. "Aryan Sharma" -> "AS" — not
stored).
Errors: `400 invalid_request`, `409 email_already_registered`.
Also creates an `email_verification_tokens` row and logs the plaintext token
server-side (no email provider is chosen yet).

### `POST /api/v1/auth/login`

Authentication: public. Body: `{ "email": string, "password": string }`.
Response: same shape as signup.
Errors: `400 invalid_request`, `401 invalid_credentials`.

### `POST /api/v1/auth/refresh`

Authentication: public (requires a valid refresh token). Body:
`{ "refreshToken": string }`. Response: `{ "data": { "accessToken", "refreshToken" } }`
— rotates the refresh token; the old one stops working immediately.
Errors: `401 invalid_refresh_token`.

### `POST /api/v1/auth/logout`

Authentication: required (Bearer access token). Revokes the current session
only. Response: `{ "data": { "success": true } }`. Errors: `401 unauthenticated`.

### `POST /api/v1/auth/logout-all`

Authentication: required. Revokes every session for the user. Response:
`{ "data": { "success": true } }`. Errors: `401 unauthenticated`.

### `POST /api/v1/auth/verify-email`

Authentication: public. Body: `{ "token": string }`. Response:
`{ "data": { "success": true } }`. Errors: `400 invalid_or_expired_token`.

### `POST /api/v1/auth/request-password-reset`

Authentication: public. Body: `{ "email": string }`. Always responds
`{ "data": { "success": true } }` regardless of whether the email is
registered, to avoid leaking account existence. Errors: `400 invalid_request`
(malformed email only).

### `POST /api/v1/auth/reset-password`

Authentication: public. Body: `{ "token": string, "newPassword": string (min 8) }`.
Response: `{ "data": { "success": true } }`. Also revokes every session for
the affected user. Errors: `400 invalid_or_expired_token`.

### `GET /api/v1/auth/me`

Authentication: required. Response:
`{ "data": { "id", "email", "name", "avatarLabel", "emailVerifiedAt", "createdAt" } }`.
Errors: `401 unauthenticated`.

## Planned Endpoint Areas

Organizations:

- ~~Create organization.~~ Implemented (`POST /api/v1/houses`, see above).
- ~~Join organization by invite code.~~ Implemented (`POST /api/v1/houses/join`).
- List current user's organizations as a standalone endpoint (currently only
  available bundled into `GET /api/v1/workspace`).
- Read organization (single house detail beyond the workspace list).
- Update organization.
- Invite members with a specific role (currently only the single
  house-wide `inviteCode` -> `"Member"` flow exists).
- Manage memberships (change role, remove member).

Projects:

- ~~Create, list, read, update, archive project.~~ Implemented (see
  "Projects and Clients" above).
- Manage project members (`project_memberships` - not implemented; every
  house member can see/manage every project for now, see ADR 0022).

Clients:

- ~~Create, list, read, update client; link clients to projects.~~
  Implemented (see "Projects and Clients" above). Unlinking a client from a
  project is not.

Collaboration:

- ~~Tasks (create).~~ Implemented (`POST /api/v1/tasks`, see above). Update/
  status-change and multi-assignee support are not.
- ~~Conversations, Messages (send).~~ Implemented
  (`POST /api/v1/chat/rooms/:roomId/messages`, see above). Custom room
  creation and private/DM conversations (`conversation_members`) are not.
- ~~Comments (task/project, create + list).~~ Implemented (see "Comments"
  above). No edit/delete; asset-version comments not yet (no assets
  module).
- ~~Notifications (list, mark read).~~ Implemented (see "Notifications"
  above). Only 2 triggers exist (task assignment, house join); no
  realtime delivery.
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

## Houses and Workspace (Implemented)

Implemented per ADR 0020 (`apps/api/src/organizations/*`,
`apps/api/src/workspace/*`). `POST /api/v1/auth/login`'s real response does
**not** include `activeHouseId`/`houses`/`tasks`/`chatRooms` (see the
Authentication section above) — that snapshot is `GET /api/v1/workspace`'s
job, a deliberate split from what this doc originally speculated before auth
was implemented.

### `POST /api/v1/houses`

Authentication: required. Body:
`{ "name": string, "handle": string (lowercase, url-safe, unique), "description"?: string }`.
Response:

```json
{
  "data": {
    "id": "house_123",
    "name": "North Star Films",
    "handle": "north-star",
    "description": "Commercial film and launch content studio.",
    "inviteCode": "NORT-2048",
    "members": [
      {
        "id": "user_123",
        "name": "Aryan Sharma",
        "role": "Owner",
        "status": "online"
      }
    ],
    "roles": [
      {
        "id": "role_1",
        "name": "Owner",
        "color": "#654cff",
        "description": "Controls house settings, roles, invites, and billing.",
        "memberCount": 1
      },
      {
        "id": "role_2",
        "name": "Producer",
        "color": "#16c784",
        "description": "Plans shoots, schedules tasks, and coordinates delivery.",
        "memberCount": 0
      }
    ]
  }
}
```

(5 default roles are seeded — Owner, Producer, Editor, Videographer,
Photographer — matching `apps/web/src/services/base-workspace.service.ts`'s
`defaultRoles` exactly; only Owner has a member until others join.)

Errors: `400 invalid_request`, `401 unauthenticated`, `409 handle_unavailable`.
Expected behavior: creates the organization, seeds default roles, makes the
creator an `"Owner"` member, and sets the creator's active house.

### `POST /api/v1/houses/join`

Authentication: required. Body: `{ "inviteCode": string }`. Response: same
`House` shape as create. New joiners get role `"Member"` (created lazily on
first join if the house doesn't have one yet — see ADR 0020 for why "Member"
rather than "Client" or a joiner-specified role).
Errors: `400 invalid_request`, `401 unauthenticated`, `404 invite_not_found`,
`409 already_member`.

### `GET /api/v1/workspace`

Authentication: required. Response:

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
    "houses": [/* House[], same shape as POST /houses */],
    "tasks": [],
    "chatRooms": []
  }
}
```

`houses`/`activeHouseId` are real (every house the caller belongs to, via
`organization_memberships`). `tasks`/`chatRooms` are now also real per ADR
0021 (scoped to the caller's `activeHouseId` — `[]` only if the user has no
active house yet). Errors: `401 unauthenticated`.

## Tasks and Chat (Implemented)

Implemented per ADR 0021 (`apps/api/src/tasks/*`, `apps/api/src/chat/*`).

### `POST /api/v1/tasks`

Authentication: required. Body:
`{ "houseId": string, "title": string, "project": string, "assigneeId": string, "role": string, "dueDate": string }`.
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

Errors: `400 invalid_request` (missing fields, or `role` isn't one of the
house's role names), `401 unauthenticated`, `403 forbidden` (caller isn't a
member of `houseId`), `404 assignee_not_found` (`assigneeId` isn't a member
of `houseId`). Expected behavior: creates the task with
`status: "scheduled"`, `priority: "medium"`; no status-update endpoint
exists yet.

### `POST /api/v1/chat/rooms/:roomId/messages`

Authentication: required. Request param: `roomId`. Body:
`{ "body": string }`. Response is the **full updated room**, not just the
new message (the mock service's actual `sendChatMessage(...): Promise<ChatRoom>`
signature — the response shape below, not a bare message, is the real
contract to build against):

```json
{
  "data": {
    "id": "room_123",
    "name": "general",
    "topic": "Daily coordination and house-wide updates.",
    "unreadCount": 0,
    "messages": [
      {
        "id": "msg_123",
        "authorId": "user_123",
        "authorName": "Aryan Sharma",
        "sentAt": "2026-07-04T10:25:00.000Z",
        "body": "Version 03 is ready for producer review."
      }
    ]
  }
}
```

Errors: `400 invalid_request` (empty `body`), `401 unauthenticated`,
`403 forbidden` (caller isn't a member of the room's house),
`404 room_not_found`. Expected behavior: 3 rooms (`"general"`, `"edit-bay"`,
`"shoot-floor"`) are seeded automatically at house creation; there's no
endpoint to create additional rooms yet, and `unreadCount` is always `0`
(no read-tracking implemented).

## Projects and Clients (Implemented)

Implemented per ADR 0022 (`apps/api/src/projects/*`, `apps/api/src/clients/*`).
The first module with no pre-existing frontend mock/contract — designed
from scratch following the conventions above, including the first real use
of the cursor-pagination envelope from "Response Shape" below.

### `POST /api/v1/houses/:houseId/projects`

Authentication: required. Body: `{ "name": string, "description"?: string }`.
Response:

```json
{
  "data": {
    "id": "project_123",
    "name": "Cafe Noir Opening",
    "description": "Launch campaign film + stills.",
    "status": "active",
    "createdAt": "2026-07-08T10:00:00.000Z",
    "updatedAt": "2026-07-08T10:00:00.000Z",
    "clients": []
  }
}
```

Errors: `400 invalid_request`, `401 unauthenticated`, `403 forbidden`
(caller isn't a member of `houseId`).

### `GET /api/v1/houses/:houseId/projects`

Authentication: required. Query: `limit?` (1-100, default 25), `cursor?`.
Response: `{ "data": Project[], "page": { "limit", "cursor", "nextCursor" } }`
(see "Response Shape" below) — includes every project regardless of
`status` (no archived-filter yet). Errors: `401 unauthenticated`,
`403 forbidden`.

### `GET /api/v1/projects/:projectId`

Authentication: required. Response: single `Project` (same shape as
create). Errors: `401 unauthenticated`, `403 forbidden` (not a house
member), `404 project_not_found`.

### `PATCH /api/v1/projects/:projectId`

Authentication: required. Body: `{ "name"?: string, "description"?: string }`.
Response: updated `Project`. Errors: `400 invalid_request`,
`401 unauthenticated`, `403 forbidden`, `404 project_not_found`.

### `POST /api/v1/projects/:projectId/archive`

Authentication: required. No body. Response: updated `Project` with
`status: "archived"`. A dedicated action endpoint rather than a `PATCH`
status flag (matches `logout`/`logout-all`'s precedent). Errors:
`401 unauthenticated`, `403 forbidden`, `404 project_not_found`.

### `POST /api/v1/projects/:projectId/clients`

Authentication: required. Body: `{ "clientId": string }`. Response: updated
`Project` with the client now included in `clients`. Errors:
`400 invalid_request` (`clientId` belongs to a different house),
`401 unauthenticated`, `403 forbidden`, `404 project_not_found`,
`409 already_linked`. Link-only — no unlink endpoint yet.

### `POST /api/v1/houses/:houseId/clients`

Authentication: required. Body:
`{ "name": string, "contactName"?: string, "contactEmail"?: string }`.
Response:

```json
{
  "data": {
    "id": "client_123",
    "name": "North Star Films",
    "contactName": "Dev Anand",
    "contactEmail": "dev@northstarfilms.example",
    "createdAt": "2026-07-08T10:00:00.000Z",
    "updatedAt": "2026-07-08T10:00:00.000Z"
  }
}
```

Errors: `400 invalid_request` (missing `name`, or `contactEmail` isn't a
valid email), `401 unauthenticated`, `403 forbidden`.

### `GET /api/v1/houses/:houseId/clients`

Authentication: required. Query: `limit?`, `cursor?` (same as projects).
Response: `{ "data": Client[], "page": {...} }`. Errors:
`401 unauthenticated`, `403 forbidden`.

### `GET /api/v1/clients/:clientId` / `PATCH /api/v1/clients/:clientId`

Same shape/error pattern as the corresponding project endpoints, scoped to
a `Client` instead.

## Notifications (Implemented)

Implemented per ADR 0023 (`apps/api/src/notifications/*`). No public
create endpoint — notifications are always server-triggered (currently:
task assignment notifies the assignee; joining a house notifies its
`"Owner"` member(s)). No realtime delivery yet (ADR 0005 not implemented) —
poll `GET /api/v1/notifications`.

### `GET /api/v1/notifications`

Authentication: required. Query: `limit?` (1-100, default 25), `cursor?`.
Response: `{ "data": Notification[], "page": {...} }` (cursor-paginated,
newest-first — see "Response Shape" below):

```json
{
  "data": [
    {
      "id": "notif_123",
      "type": "task_assigned",
      "title": "New task: Prepare rough cut",
      "body": "You were assigned \"Prepare rough cut\" on Cafe Noir Opening, due 2026-07-07.",
      "readAt": null,
      "createdAt": "2026-07-08T10:00:00.000Z"
    }
  ],
  "page": { "limit": 25, "cursor": null, "nextCursor": null }
}
```

Errors: `401 unauthenticated`.

### `POST /api/v1/notifications/:notificationId/read`

Authentication: required. No body. Response: the updated `Notification`
with `readAt` set. Errors: `401 unauthenticated`,
`404 notification_not_found` (doesn't exist, or belongs to someone else).

### `POST /api/v1/notifications/read-all`

Authentication: required. No body. Response: `{ "data": { "success": true } }`.
Idempotent — succeeds whether or not anything was unread. Errors:
`401 unauthenticated`.

## Comments (Implemented)

Implemented per ADR 0024 (`apps/api/src/comments/*`). Resolves the
previously-deferred "comment target modeling strategy" — a comment
attaches to a task or a project via nested routes (not a generic
`/api/v1/comments`).

### `POST`/`GET /api/v1/tasks/:taskId/comments`

Authentication: required. `POST` body: `{ "body": string }`. Response
(both methods): `Comment` — `{ "id", "body", "authorId", "authorName", "createdAt", "updatedAt" }`
(list is cursor-paginated, `createdAt asc` — see "Response Shape" below).
Errors: `400 invalid_request` (empty `body`, `POST` only),
`401 unauthenticated`, `403 forbidden` (not a member of the task's house),
`404 task_not_found`.

### `POST`/`GET /api/v1/projects/:projectId/comments`

Same shape/error pattern as the task endpoints above, scoped to a
`Project` (`404 project_not_found` instead). No edit/delete endpoint
exists for either yet.

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

- Request ID implementation (the auth module's error envelope currently uses
  a per-response random UUID, not a request-scoped/traced one).
- Rate limiting strategy.
- Public API strategy.
- API documentation generation.

Resolved: validation library — `class-validator` + `class-transformer` with
Nest's `ValidationPipe`, per ADR 0019.
