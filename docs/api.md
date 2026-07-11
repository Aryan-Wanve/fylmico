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

### `GET /api/v1/auth/google`

Implemented per ADR 0035. Authentication: public. Not a JSON endpoint — a
302 redirect to Google's OAuth consent screen, with a short-lived
`httpOnly` `state` cookie set for CSRF verification on callback. Errors:
`503 google_oauth_not_configured` if `GOOGLE_CLIENT_ID` is unset.

### `GET /api/v1/auth/google/callback`

Authentication: public (Google redirects here with `code`/`state` query
params after consent). Not a JSON endpoint — verifies `state` against the
cookie set by `/auth/google`, exchanges `code` for a Google profile,
creates or links a `User`/`AuthAccount` by email, then 302-redirects to
`${CORS_ORIGIN}/auth/callback?accessToken=...&refreshToken=...`. Any
failure (missing config, denied consent, state mismatch, exchange error)
redirects to `${CORS_ORIGIN}/login?error=google_oauth_failed` instead.

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

Implemented per ADR 0021 (`apps/api/src/tasks/*`, `apps/api/src/chat/*`),
extended per ADR 0026 (unified status vocabulary, update/delete, auto-derived
role).

### `POST /api/v1/tasks`

Authentication: required. Body:
`{ "houseId": string, "title": string, "project": string, "assigneeId": string, "dueDate": string, "priority"?: "low"|"medium"|"high", "status"?: "todo"|"in-progress"|"on-hold"|"done" }`.
`role` is **not** part of the request — it's derived automatically from the
assignee's current house role. Response:

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
    "status": "todo",
    "priority": "medium"
  }
}
```

Errors: `400 invalid_request` (missing required fields, or `priority`/`status`
isn't one of the accepted values), `401 unauthenticated`, `403 forbidden`
(caller isn't a member of `houseId`), `404 assignee_not_found` (`assigneeId`
isn't a member of `houseId`). Defaults: `status: "todo"`, `priority: "medium"`.

### `PATCH /api/v1/tasks/:taskId`

Authentication: required. Request param: `taskId`. Body: any subset of
`{ "title": string, "project": string, "assigneeId": string, "dueDate": string, "priority": "low"|"medium"|"high", "status": "todo"|"in-progress"|"on-hold"|"done" }`.
Response: the updated task, same shape as create. Reassigning `assigneeId`
re-derives `role` from the new assignee's current house role and notifies
them (`task_assigned`), same as create. Errors: `400 invalid_request`,
`401 unauthenticated`, `403 forbidden` (caller isn't a member of the task's
house), `404 task_not_found`, `404 assignee_not_found` (new `assigneeId`
isn't a member of the house).

### `DELETE /api/v1/tasks/:taskId`

Authentication: required. Request param: `taskId`. Response:
`{ "data": { "success": true } }`. Errors: `401 unauthenticated`,
`403 forbidden`, `404 task_not_found`.

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
`"shoot-floor"`) are seeded automatically at house creation; `unreadCount`
is always `0` (no read-tracking implemented).

### `POST /api/v1/houses/:houseId/conversations`

Added per ADR 0029. Authentication: required. Body:
`{ "name": string, "topic"?: string }`. Response: the new room, same
shape as the create-message response above (with an empty `messages`
array). Errors: `400 invalid_request` (missing `name`),
`401 unauthenticated`, `403 forbidden` (caller isn't a member of
`houseId`), `409 channel_name_taken` (a conversation with this name
already exists in the house - names are unique per house). Every house
member can post in any conversation once created; there's no
channel-level membership restriction, and no way to create a private/DM
(1:1) conversation - every conversation is a house-wide group channel.

## Projects and Clients (Implemented)

Implemented per ADR 0022 (`apps/api/src/projects/*`, `apps/api/src/clients/*`),
extended per ADR 0027 (production type/genre/stage/progress/cover art/team,
matching the designed Projects page UI).

### `POST /api/v1/houses/:houseId/projects`

Authentication: required. Body:
`{ "name": string, "description"?: string, "type"?: string, "genre"?: string, "stage"?: string, "progress"?: number, "coverGradient"?: string, "coverIcon"?: string, "dueDate"?: string, "teamIds"?: string[] }`.
`type` must be one of a fixed production-type list (`"Short Film"`,
`"Documentary"`, `"Commercial"`, `"Music Video"`, `"Feature Film"`,
`"Corporate Video"`, `"Web Series"`, `"Wedding Film"`); `stage` one of
`"Development" | "Pre-Production" | "In Production" | "In Progress" |
"Post-Production" | "On Hold" | "Completed"` (default `"Development"`);
`coverIcon` one of `"camera" | "clapperboard" | "heart" | "megaphone" |
"mic" | "music"`; `teamIds` must all be current members of `houseId`.
Response:

```json
{
  "data": {
    "id": "project_123",
    "title": "Cafe Noir Opening",
    "type": "Short Film",
    "genre": "Drama",
    "description": "Launch campaign film + stills.",
    "stage": "Development",
    "status": "active",
    "progress": 0,
    "coverGradient": "from-slate-400 via-slate-600 to-slate-800",
    "coverIcon": null,
    "dueDate": null,
    "teamIds": [],
    "createdAt": "2026-07-08T10:00:00.000Z",
    "updatedAt": "2026-07-08T10:00:00.000Z",
    "clients": []
  }
}
```

Note the response field is `title`, not `name` — it echoes back under the
name the frontend's designed `Project` type already used before this
endpoint existed (ADR 0027). `status` is **not** stored directly; it's
computed server-side from `stage` (see `docs/database.md`'s `projects`
table doc for the mapping) and is distinct from the DB's own
active/archived tracking column.

Errors: `400 invalid_request` (missing `name`, bad `type`/`stage`/
`coverIcon` value, or a `teamIds` entry that isn't a house member),
`401 unauthenticated`, `403 forbidden` (caller isn't a member of `houseId`).

### `GET /api/v1/houses/:houseId/projects`

Authentication: required. Query: `limit?` (1-100, default 25), `cursor?`.
Response: `{ "data": Project[], "page": { "limit", "cursor", "nextCursor" } }`
(see "Response Shape" below) — excludes archived projects as of ADR 0027
(previously returned every project regardless of status). Errors:
`401 unauthenticated`, `403 forbidden`.

### `GET /api/v1/projects/:projectId`

Authentication: required. Response: single `Project` (same shape as
create). Errors: `401 unauthenticated`, `403 forbidden` (not a house
member), `404 project_not_found`.

### `PATCH /api/v1/projects/:projectId`

Authentication: required. Body: any subset of the create body's fields
(all optional). Reassigning `teamIds` re-validates every id is a current
house member. Response: updated `Project`. Errors: `400 invalid_request`,
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

## Crews (Implemented)

Implemented per ADR 0028 (`apps/api/src/crews/*`). A "crew member" is a
real house member (`User` + `OrganizationMembership`) with an attached
`CrewProfile` - department, role category, availability status, and so
on. There is no separate/fake roster; every crew member is a real account.
A `CrewProfile` row is auto-seeded (with the joining member's house role
name as `jobTitle`) whenever someone creates or joins a house, so every
house member always has one.

### `GET /api/v1/houses/:houseId/crew`

Authentication: required. Response: `{ "data": CrewMember[] }` (not
paginated - matches the workspace snapshot's house member list, which is
also unpaginated). Errors: `401 unauthenticated`, `403 forbidden`.

```json
{
  "data": [
    {
      "id": "user_123",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "jobTitle": "Production Designer",
      "department": "Art",
      "roleCategory": "Other",
      "status": "available",
      "currentProject": "Beyond Frames",
      "projectStage": "Pre-Production",
      "availability": "Jul 7 - Jul 15",
      "birthday": "07-12"
    }
  ]
}
```

### `PATCH /api/v1/houses/:houseId/crew/:userId`

Authentication: required. Body: any subset of
`{ "jobTitle": string, "department": string, "roleCategory": string, "status": string, "currentProject": string, "projectStage": string, "availability": string, "birthday": string }`.
`department` must be one of the 7 fixed department names; `roleCategory`
one of 6 fixed categories; `status` one of `"available" | "on-set" |
"on-leave" | "unavailable"`. Response: updated `CrewMember`. Errors:
`400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 crew_profile_not_found`.

### `DELETE /api/v1/houses/:houseId/crew/:userId`

Removes a real member from the house - deletes their
`OrganizationMembership` and `CrewProfile` in one transaction. Not
reversible; the removed member loses access to the house immediately (any
member can remove any other member, including the Owner - no
finer-grained RBAC exists yet, same gap noted throughout ADR 0020's
lineage). Refuses to remove the house's last remaining member
(`400 invalid_request`) so a house can never end up with zero members.
Response: `{ "data": { "success": true } }`. Errors: `400 invalid_request`
(last member), `401 unauthenticated`, `403 forbidden` (caller or target
isn't a house member), `404`.

## Calendar (Implemented)

Implemented per ADR 0030 (`apps/api/src/calendar/*`). A house's
"calendars" are "My Schedule" (events with no `projectId`) plus one entry
per real `Project` in the house - no separate calendar table exists.

### `GET /api/v1/houses/:houseId/calendar-events`

Authentication: required. Response: `{ "data": CalendarEvent[] }`, sorted
`date asc, time asc` (not paginated). Errors: `401 unauthenticated`,
`403 forbidden`.

```json
{
  "data": [
    {
      "id": "event_123",
      "title": "Location Recce",
      "date": "2026-07-05",
      "time": "10:00 AM",
      "location": null,
      "category": "pre-production",
      "projectId": "project_456",
      "organizationId": "house_789"
    }
  ]
}
```

### `POST /api/v1/houses/:houseId/calendar-events`

Authentication: required. Body:
`{ "title": string, "date": string, "time": string, "location"?: string, "category"?: string, "projectId"?: string }`.
`category` must be one of `"shoot" | "post-production" | "meeting" |
"pre-production" | "delivery" | "other"` (defaults to `"other"`). If
`projectId` is given, it must belong to the same house. Response: created
`CalendarEvent`. Errors: `400 invalid_request`, `401 unauthenticated`,
`403 forbidden`, `404 project_not_found`.

## Time Entries (Implemented)

Implemented per ADR 0031 (`apps/api/src/time-entries/*`). A `TimeEntry`
is a logged block of hours a house member spent on work, optionally
tied to a project.

### `GET /api/v1/houses/:houseId/time-entries`

Authentication: required. Response: `{ "data": TimeEntry[] }`, sorted
`date desc` (not paginated). Errors: `401 unauthenticated`,
`403 forbidden`.

### `POST /api/v1/houses/:houseId/time-entries`

Authentication: required. Body:
`{ "date": string, "hours": number, "phase"?: string, "projectId"?: string, "note"?: string }`.
`hours` must be a positive number. `phase` must be one of
`"Pre-Production" | "Production" | "Post-Production" | "Planning"`
(defaults to `"Production"`). If `projectId` is given, it must belong to
the same house. Response: created `TimeEntry`. Errors:
`400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 project_not_found`.

## Analytics (Implemented)

Implemented per ADR 0031 (`apps/api/src/analytics/*`). A single endpoint
computes every aggregate the Analytics page needs, server-side, from
real `Project`/`Task`/`TimeEntry`/`Message`/`Comment` data - the frontend
does not re-derive any of these numbers itself.

### `GET /api/v1/houses/:houseId/analytics`

Authentication: required. Response: `{ "data": Analytics }`. Errors:
`401 unauthenticated`, `403 forbidden`.

```json
{
  "data": {
    "totalProjects": 4,
    "activeProjects": 2,
    "tasksTotal": 12,
    "tasksCompleted": 5,
    "hoursLoggedTotal": 38.5,
    "teamEfficiency": 42,
    "taskStatusBreakdown": [
      { "status": "done", "label": "Completed", "color": "#16c784", "count": 5 }
    ],
    "timeLoggedByDay": [{ "date": "2026-07-05", "label": "Sun", "hours": 3 }],
    "timeDistribution": [
      { "phase": "Production", "color": "#16c784", "hours": 20 }
    ],
    "topActiveProjects": [
      {
        "id": "project_1",
        "title": "Beyond Frames",
        "progress": 65,
        "coverGradient": null,
        "coverIcon": null
      }
    ],
    "projectHoursSeries": [
      {
        "id": "project_1",
        "label": "Beyond Frames",
        "color": "#654cff",
        "points": [0, 2, 0, 0, 4, 0, 0]
      }
    ],
    "topContributors": [
      { "userId": "user_1", "name": "Ana Lytics", "hours": 12.5 }
    ],
    "teamWorkload": [
      {
        "userId": "user_1",
        "name": "Ana Lytics",
        "jobTitle": "Owner",
        "percentage": 24
      }
    ],
    "activityHeatmap": {
      "dayLabels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "timeLabels": ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"],
      "matrix": [[0, 1, 3, 4, 3, 1]]
    }
  }
}
```

Metric definitions (see ADR 0031 for the full reasoning): `activeProjects`
excludes projects staged `Completed` or `On Hold`; `teamEfficiency` is
`tasksCompleted / tasksTotal * 100`; `teamWorkload.percentage` is hours
logged in the last 7 days divided by a flat 40-hour weekly capacity,
capped at 100; `activityHeatmap` buckets `Task`/`Message`/`Comment`/
`TimeEntry` timestamps by weekday and 4-hour window, normalized 0-4
relative to that house's busiest bucket.

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
