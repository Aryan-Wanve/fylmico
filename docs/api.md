# API

## Status

Accepted planning baseline. No API endpoints have been implemented in this
frontend workstream. API contracts are documented so the frontend can build
against stable public expectations while the backend team implements the
backend separately.

## API Stack

- Next.js Route Handlers (`apps/web/src/app/api/v1/**`) — the backend
  used to be a separate NestJS app (`apps/api`) until ADR 0037 merged it
  into this same Next.js app; every endpoint contract documented below is
  unchanged by that move, only its implementation location moved (business
  logic lives in `apps/web/src/server/**`).
- TypeScript
- JWT authentication (signed via the `jsonwebtoken` package directly)
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

Implemented per ADR 0019/0020 (`apps/web/src/server/auth/*`). Signup
verification, resend, and password reset were rewritten from single-use
link-tokens to 6-digit OTP codes per ADR 0039 (login is now hard-blocked
until the email is verified); rate limiting on the auth endpoints below is
implemented per ADR 0043 (in-memory, per-process, resets on redeploy — not
a hard security boundary, just an abuse/cost guard).

### `POST /api/v1/auth/signup`

Rewritten per ADR 0039 as the first step of an OTP-verified flow (was
previously a single-use email-link token — see the endpoints below).
Authentication: public. Rate limited (5 / hour / IP). Body:
`{ "email": string, "password": string (min 8), "name": string }`.
Response: `{ "data": { "email": string } }` — no tokens are issued yet; the
account is created unverified and a 6-digit verification code is emailed
(`buildVerificationEmail`), consumed by `POST /api/v1/auth/verify-email`.
Errors: `400 invalid_request`, `409 email_already_registered`,
`429 rate_limited`.

### `POST /api/v1/auth/login`

Authentication: public. Rate limited (10 / 15 min / IP+email). Body:
`{ "email": string, "password": string }`.
Response: `{ "data": { "user": { "id", "email", "name", "username", "avatarUrl", "avatarLabel", "notificationPreferences", "emailVerifiedAt", "createdAt" }, "accessToken", "refreshToken" } }`.
Errors: `400 invalid_request`, `401 invalid_credentials`,
`403 email_not_verified` (login is blocked until the account's email is
verified), `429 rate_limited`.

### `POST /api/v1/auth/verify-email`

Rewritten as an email + 6-digit-code flow (no longer a token link).
Authentication: public. Rate limited (10 / 15 min / IP+email). Body:
`{ "email": string, "code": string (exactly 6 digits) }`. Response: same
shape as login (`{ "data": { "user", "accessToken", "refreshToken" } }`) —
verifying also logs the user in. Codes expire after 10 minutes and lock out
after 5 wrong attempts. Errors: `400 invalid_or_expired_code`,
`409 email_already_verified`.

### `POST /api/v1/auth/resend-verification`

Authentication: public. Rate limited (5 / 15 min / IP+email). Body:
`{ "email": string }`. Always responds `{ "data": { "success": true } }`
regardless of whether the account exists or is already verified, to avoid
leaking account state. Issues a fresh 6-digit code (invalidating any
previous one) when the account exists and isn't yet verified.
Errors: `400 invalid_request` (malformed email), `429 rate_limited`.

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

### `POST /api/v1/auth/request-password-reset`

Rewritten as an email + 6-digit-code flow (no longer a token link).
Authentication: public. Rate limited (5 / 15 min / IP+email). Body:
`{ "email": string }`. Always responds `{ "data": { "success": true } }`
regardless of whether the email is registered, to avoid leaking account
existence. Emails a 6-digit code (`buildPasswordResetEmail`, 10-minute
expiry) when the account exists. Errors: `400 invalid_request` (malformed
email only), `429 rate_limited`.

### `POST /api/v1/auth/reset-password`

Rewritten as an email + 6-digit-code flow (no longer a token link).
Authentication: public. Rate limited (10 / 15 min / IP+email). Body:
`{ "email": string, "code": string (exactly 6 digits), "newPassword": string (min 8) }`.
Response: `{ "data": { "success": true } }`. Also revokes every session for
the affected user. Codes expire after 10 minutes and lock out after 5 wrong
attempts. Errors: `400 invalid_or_expired_code`, `429 rate_limited`.

### `POST /api/v1/auth/change-password`

Authentication: required. Body:
`{ "currentPassword": string, "newPassword": string (min 8) }`. Revokes
every other session for the caller (the current session stays alive).
Response: `{ "data": { "success": true } }`. Errors: `400 invalid_request`,
`401 invalid_credentials` (`currentPassword` is wrong), `401 unauthenticated`.

### `GET /api/v1/auth/me`

Authentication: required. Response:
`{ "data": { "id", "email", "name", "username", "avatarUrl", "avatarLabel", "notificationPreferences", "emailVerifiedAt", "createdAt" } }`
(`username` and `avatarUrl` are `null` until set;
`notificationPreferences` is `null` until `PATCH .../notification-preferences`
is called at least once). Errors: `401 unauthenticated`.

### `PATCH /api/v1/auth/me`

Authentication: required. Body: any subset of
`{ "name": string, "username": string (3-24 chars, lowercase letters/digits/underscores) }`.
Response: updated user, same shape as `GET /api/v1/auth/me`. Errors:
`400 invalid_request`, `401 unauthenticated`, `409 username_taken`.

### `POST /api/v1/auth/me/avatar`

Authentication: required. Body: `multipart/form-data` with a `file` field.
Uploads the image to Supabase Storage and sets it as the caller's avatar.
Response: updated user, same shape as `GET /api/v1/auth/me`. Errors:
`400 invalid_request` (missing file), `401 unauthenticated`.

### `PATCH /api/v1/auth/me/notification-preferences`

Authentication: required. Body:
`{ "preferences": [{ "id": string, "email": boolean, "push": boolean }] }`
(`id` identifies a notification category — the whole array replaces the
caller's stored preferences). Response: updated user, same shape as
`GET /api/v1/auth/me`. Errors: `400 invalid_request`, `401 unauthenticated`.

### `POST /api/v1/auth/me/heartbeat`

Authentication: required. No body. Stamps the caller's `lastSeenAt` to
now. Called every 60s by `AppShellGate` while the app is open (not on
every request). Backs the "last seen" fallback shown once a user has no
live Realtime Presence connection (Messages page member list, ADR 0044) -
the static `members[].status` field on `POST /api/v1/houses` still doesn't
derive from this, see the Realtime API section's Presence note.
Response: `{ "data": { "success": true } }`. Errors: `401 unauthenticated`.

### `GET /api/v1/auth/sessions`

Authentication: required. Response: `{ "data": Session[] }` (not
paginated), newest first, only live (unrevoked, unexpired) sessions:

```json
{
  "data": [
    {
      "id": "session_123",
      "userAgent": "Mozilla/5.0 ...",
      "ipAddress": "203.0.113.10",
      "current": true,
      "createdAt": "2026-07-14T10:00:00.000Z"
    }
  ]
}
```

Errors: `401 unauthenticated`.

### `DELETE /api/v1/auth/sessions/:sessionId`

Authentication: required. Revokes one of the caller's own sessions (can be
used to revoke the current session too, unlike `logout-all` which revokes
every session). Response: `{ "data": { "success": true } }`. Errors:
`401 unauthenticated`, `404 session_not_found` (doesn't exist, or belongs to
someone else).

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
  A second, approval-gated path also exists now: `POST /api/v1/houses/join-requests`
  - `GET`/`PATCH /api/v1/houses/:houseId/join-requests(/:requestId)` (Owner
    approves/rejects a request made against the house's public `handle`).
- List current user's organizations as a standalone endpoint (currently only
  available bundled into `GET /api/v1/workspace`).
- Read organization (single house detail beyond the workspace list — a
  read-only `GET /api/v1/houses/:houseId` still doesn't exist, only
  `PATCH`).
- ~~Update organization.~~ Implemented (`PATCH /api/v1/houses/:houseId`).
- Invite members with a specific role (still only the single house-wide
  `inviteCode` -> `"Member"` flow, plus the join-request flow above, both
  of which hardcode the `"Member"` role).
- Manage memberships (change role — not implemented; remove member is,
  see `DELETE /api/v1/houses/:houseId/crew/:userId` in "Crews" below).

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

- ~~Tasks (create, update, status-change, multi-assignee, subtasks,
  checklists, dependencies, time tracking, activity history,
  attachments).~~ Fully implemented per ADR 0047 (see "Tasks and Chat"
  above). Calendar/Gantt views, task templates, custom fields, Pomodoro
  mode, and proactive due/overdue push notifications are not (no
  scheduled-job infra, ADR 0042).
- ~~Conversations, Messages (send).~~ Implemented
  (`POST /api/v1/chat/rooms/:roomId/messages`, see above). Custom room
  creation and private/DM conversations (`conversation_members`) are not.
- ~~Comments (task/project, create + list).~~ Implemented (see "Comments"
  above). No edit/delete; asset-version comments not yet (no assets
  module).
- ~~Notifications (list, mark read).~~ Implemented (see "Notifications"
  above). Triggers have grown well past 2 (task assignment, house join,
  join requests, announcements, bookings, ...); still no realtime
  delivery.
- Activity feed. Partially covered by
  `GET /api/v1/houses/:houseId/dashboard-summary`'s `recentActivity` (see
  "Dashboard Summary" above), but that's capped at 8 items and scoped to
  the dashboard, not a dedicated paginated feed endpoint.
- ~~Message reactions.~~ Implemented
  (`POST /api/v1/messages/:messageId/reactions`, see "Tasks and Chat"
  above). Threaded replies (`parentMessageId`) also implemented.
- ~~Message editing.~~ Implemented
  (`PATCH /api/v1/messages/:messageId`, see "Tasks and Chat" above) —
  author-only, within 10 minutes of sending. No delete endpoint yet.

Creative production:

- Assets.
- Asset versions.
- Reviews.
- Approvals.
- ~~Storyboards.~~ Implemented (see "Storyboards" above — boards, shots,
  characters, locations).
- Moodboards.
- ~~Scripts.~~ Implemented (see "Scripts" above).
- ~~Shot lists.~~ Implemented (a board's ordered `shots`, see
  "Storyboards" above).
- ~~Call sheets.~~ Implemented (see "Call Sheets" above).
- Equipment (as a standalone inventory/catalog — booking a named piece of
  equipment for a date range is implemented, see "Bookings" above; there's
  no equipment catalog/maintenance-tracking beyond that).
- ~~Crew.~~ Implemented (see "Crews" above).
- ~~Locations.~~ Implemented (see "Storyboards" above).

Administration:

- Roles.
- Permissions.
- Audit logs.
- Settings.

## Houses and Workspace (Implemented)

Implemented per ADR 0020 (`apps/web/src/server/organizations/*`,
`apps/web/src/server/workspace/*`). Tag-based join-requests
(`POST /api/v1/houses/join-requests` and the `GET`/`PATCH
/api/v1/houses/:houseId/join-requests(/:requestId)` review endpoints) and
`POST /api/v1/houses/:houseId/activate` (switching a multi-house user's
active house) were added per ADR 0040, alongside invite-code joining which
they coexist with unchanged. `POST /api/v1/auth/login`'s real response does
**not** include `activeHouseId`/`houses`/`tasks`/`chatRooms` (see the
Authentication section above) — that snapshot is `GET /api/v1/workspace`'s
job, a deliberate split from what this doc originally speculated before auth
was implemented.

### `POST /api/v1/houses`

Authentication: required. Body:
`{ "name": string, "handle": string (lowercase letters + digits, 3-20 chars, unique), "description"?: string, "houseType": "freelancer" | "agency" | "college" | "hobbyist" | "custom" }`.
`houseType` (ADR 0046) sets `enabledModules` to that type's default set
(`HOUSE_TYPE_DEFAULT_MODULES` in `apps/web/src/lib/house-types.ts`) —
`"agency"`/`"custom"` enable every module, the others exclude a few (e.g.
`"freelancer"` excludes Crews/Messages/Call Sheets/Announcements).
`description` has a server-side fallback ("A new creative production
house.") if omitted - the creation UI no longer asks for it (ADR 0048).
Response:

```json
{
  "data": {
    "id": "house_123",
    "name": "North Star Films",
    "handle": "northstar",
    "description": "Commercial film and launch content studio.",
    "inviteCode": "NORT-2048",
    "type": "agency",
    "enabledModules": ["home", "projects", "calendar", "..."],
    "myRole": "Owner",
    "isFavorite": false,
    "isPinned": false,
    "isArchived": false,
    "order": 0,
    "storageBytes": 10485760,
    "lastActivityAt": "2026-07-15T18:00:00.000Z",
    "members": [
      {
        "id": "user_123",
        "name": "Aryan Sharma",
        "role": "Owner",
        "status": "online",
        "lastSeenAt": "2026-07-15T10:00:00.000Z"
      }
    ],
    "pendingMembers": [],
    "roles": [
      {
        "id": "role_1",
        "name": "Owner",
        "color": "#654cff",
        "description": "Controls house settings, roles, invites, and billing.",
        "permissions": ["view_projects", "edit_projects", "..."],
        "memberCount": 1
      }
    ]
  }
}
```

(5 default roles are seeded — Owner, Producer, Editor, Videographer,
Photographer — each with a starting `permissions` set (Owner gets all 18,
see `PERMISSION_PRESETS` in `apps/web/src/lib/permissions.ts`); only Owner
has a member until others are approved. `myRole` (ADR 0048) is the
_requesting_ caller's own role name in this house, or `null` if they're a
pending member awaiting approval — the client uses this to decide whether
to render the workspace or the waiting screen. `members` only ever
includes active (role-assigned) members; `pendingMembers` is populated
only when the requester holds `approve_members` (or is Owner) — see the
Pending Members endpoints below. A member's `status` is currently just
`"online"` for the requesting caller themselves and `"offline"` for
everyone else — not yet derived from `lastSeenAt`'s recency, see
`POST /api/v1/auth/me/heartbeat` below. `isFavorite`/`isPinned`/
`isArchived`/`order` (ADR 0049) reflect the requesting caller's own
membership flags, toggled via the favorite/pin/archive/reorder endpoints
below; `storageBytes` (sum of `file_entries.size`) and `lastActivityAt`
(max `tasks.updated_at`) are batched aggregates computed per house, shown
as Dashboard card badges.)

Errors: `400 invalid_request`, `401 unauthenticated`, `409 handle_unavailable`.
Expected behavior: creates the organization, seeds default roles, makes the
creator an `"Owner"` member, and sets the creator's active house.

### `GET /api/v1/houses/check-handle`

Added per ADR 0048 for the simplified 2-step creation flow's live
availability check. Authentication: required. Query: `handle` (string).
Response: `{ "data": { "available": boolean } }`. No error responses
beyond the standard `401 unauthenticated` - an empty/invalid handle just
resolves `available: false`.

### `PATCH /api/v1/houses/:houseId`

Authentication: required (caller must be an _active_ member of `houseId`
for `name`/`handle`/`description`; caller must additionally hold the
`"Owner"` role if `enabledModules` is included). Body: any subset of
`{ "name": string, "handle": string (lowercase, url-safe, unique), "description": string, "enabledModules": string[] }`
(ADR 0046 for `enabledModules`). Response: same `House` shape as create.
Errors: `400 invalid_request`, `401 unauthenticated`, `403 forbidden` (not
an active member, or not an Owner when setting `enabledModules`),
`409 handle_unavailable`.

### `POST /api/v1/houses/join`

Authentication: required. Body: `{ "inviteCode": string }`. Response: same
`House` shape as create, with `myRole: null` — as of ADR 0048, joining
creates a **pending** membership (`roleId: null`), not an immediately
active one. The joiner sees their house appear on the Dashboard right
away but is shown a waiting screen (no sidebar, no data access anywhere)
until an admin assigns them a role via the Pending Members endpoints
below. Errors: `400 invalid_request`, `401 unauthenticated`,
`403 banned_from_house` (this user was previously banned from this
house), `404 invite_not_found`, `409 already_member`.

### `GET /api/v1/houses/join/:code/preview`

Authentication: public (lets an unauthenticated visitor see what house an
invite code points to before signing up/logging in). Request param: `code`
(the house's permanent `inviteCode`). Response:
`{ "data": { "houseName", "houseDescription", "memberCount" } }`. Errors:
`404 invite_not_found`.

### `POST /api/v1/houses/join-requests`

A second, approval-gated way to join a house, alongside the instant
`inviteCode` flow above — the requester only needs the house's public
`handle`, and an Owner must approve. Authentication: required. Rate limited
(10 / hour / user+IP). Body: `{ "handle": string }`. Creates a `pending`
`HouseJoinRequest` (or revives a previously-rejected one back to `pending`)
and notifies + emails the house's Owner(s). Response:
`{ "data": { "status": "pending" } }`. Errors: `400 invalid_request`,
`401 unauthenticated`, `404 house_not_found` (no house with that handle),
`409 already_member`, `409 request_pending` (already has a pending request
for this house), `429 rate_limited`.

### `GET /api/v1/houses/:houseId/join-requests`

Authentication: required, caller must hold the `"Owner"` role in `houseId`.
Lists this house's `pending` join requests, newest first. Response:

```json
{
  "data": [
    {
      "id": "join_request_123",
      "userId": "user_456",
      "userName": "Priya Sharma",
      "userEmail": "priya@example.com",
      "userAvatarLabel": "PS",
      "createdAt": "2026-07-14T10:00:00.000Z"
    }
  ]
}
```

Errors: `401 unauthenticated`, `403 forbidden` (caller isn't an Owner).

### `PATCH /api/v1/houses/:houseId/join-requests/:requestId`

Authentication: required, caller must hold the `"Owner"` role in `houseId`.
Body: `{ "status": "approved" | "rejected" }`. Approving this _join
request_ (gating whether the person can join the house at all) creates
the same **pending** membership `POST /api/v1/houses/join` does (`roleId:
null`) and notifies them (`house_join_approved`) — they still land on the
waiting screen and need a role assigned via the Pending Members endpoints
below before they get any access. Rejecting just notifies them
(`house_join_rejected`) — the request stays reviewable again via a fresh
`POST /api/v1/houses/join-requests` later. Response:
`{ "data": { "success": true } }`. Errors: `400 invalid_request` (request
was already reviewed), `401 unauthenticated`, `403 forbidden` (caller isn't
an Owner), `404 join_request_not_found`.

### `POST /api/v1/houses/:houseId/pending-members/:membershipId/assign-role`

Added per ADR 0048. Authentication: required, caller must hold the
`approve_members` permission (or be Owner) in `houseId`. Body:
`{ "roleName": string, "team": string, "permissions": string[] }` — the
three steps of the Assign Role wizard (Position/Team/Permissions).
Finds-or-creates a `Role` named `roleName` in this house and **overwrites
its `permissions`** with the submitted array (affects everyone holding
that Position, not just this member); sets the target `role_id`; upserts
the member's `CrewProfile` (`jobTitle: roleName, department: team`);
notifies the member (`member_role_assigned`). Response: the updated
`House`. Errors: `401 unauthenticated`, `403 forbidden` (caller lacks
`approve_members`), `404 pending_member_not_found`.

### `POST /api/v1/houses/:houseId/pending-members/:membershipId/reject`

Authentication: required, caller must hold `approve_members`. Deletes the
pending membership outright (they can request/join again later). Response:
the updated `House`. Errors: `401 unauthenticated`, `403 forbidden`,
`404 pending_member_not_found`.

### `POST /api/v1/houses/:houseId/pending-members/:membershipId/ban`

Authentication: required, caller must hold `approve_members`. Deletes the
pending membership and appends the user's id to
`organization.bannedUserIds`, blocking any future join attempt by that
user into this house (`403 banned_from_house` on
`POST /api/v1/houses/join`). Response: the updated `House`. Errors:
`401 unauthenticated`, `403 forbidden`, `404 pending_member_not_found`.

### `POST /api/v1/houses/:houseId/favorite`

Added per ADR 0049. Authentication: required, caller must be an active
member of `houseId`. Toggles the caller's own `favoritedAt` on their
membership row (null↔`now()`). Response: `{ "data": { "success": true } }`.
Errors: `401 unauthenticated`, `403 forbidden`.

### `POST /api/v1/houses/:houseId/pin`

Same shape as `.../favorite`, toggling `pinnedAt` instead. Pinned houses
sort above favorited/regular houses on the Dashboard.

### `POST /api/v1/houses/:houseId/archive`

Same shape as `.../favorite`, toggling `archivedAt` instead. Archived
houses are hidden from the main Dashboard grid behind a collapsible
"Archived" section.

### `POST /api/v1/houses/reorder`

Added per ADR 0049. Authentication: required. Body:
`{ "organizationIds": string[] }` — the caller's houses in their new
display order. Sets each membership's `order` to its index in the array
(transaction). Response: `{ "data": { "success": true } }`. Errors:
`401 unauthenticated`.

### `POST /api/v1/houses/:houseId/activate`

Authentication: required (caller must have _any_ membership in `houseId` -
pending or active, ADR 0048, so a pending member can still switch their
active house to the one they're waiting in). Sets `houseId` as the
caller's active house (`activeOrganizationId`). Response:
`{ "data": { "success": true } }`. Errors: `401 unauthenticated`,
`403 forbidden` (no membership at all).

### `POST /api/v1/houses/:houseId/leave`

Implemented per ADR 0036. Authentication: required (caller must have any
membership, pending or active, in `houseId`). Removes the caller's
membership and crew profile (if any). If `houseId` was the caller's
active house, their active house switches to another house they belong
to, or `null` if none remain (the frontend then shows the "create or join
a house" onboarding). Response: `{ "data": { "success": true } }`.
Errors: `400 invalid_request` (caller is the house's only member — add
another member first), `401 unauthenticated`, `403 forbidden` (no
membership).

### `POST /api/v1/houses/:houseId/invitations`

Implemented per ADR 0036. Authentication: required (caller must be a member
of `houseId`). Body: `{ "email": string }`. Creates a targeted, revocable
invitation (7-day expiry) distinct from the house's permanent `inviteCode`.
Any existing pending invitation for the same email in this house is
silently revoked and replaced. Response:

```json
{
  "data": {
    "id": "invitation_123",
    "email": "someone@example.com",
    "status": "pending",
    "createdAt": "2026-07-11T10:00:00.000Z",
    "expiresAt": "2026-07-18T10:00:00.000Z",
    "inviteUrl": "http://localhost:3000/houses/invite/<token>"
  }
}
```

`inviteUrl` is only ever returned on this creation response — the plain
token is never stored, only its hash, so it can't be recovered later.
Errors: `400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`409 already_member` (the invited email already belongs to a member of
this house).

### `GET /api/v1/houses/:houseId/invitations`

Authentication: required (caller must be a member). Lists this house's
`pending` invitations (no `inviteUrl` — see above), newest first. Response:
`{ "data": HouseInvitation[] }` (each item omits `inviteUrl`).
Errors: `401 unauthenticated`, `403 forbidden`.

### `DELETE /api/v1/houses/:houseId/invitations/:invitationId`

Authentication: required (caller must be a member). Marks a pending
invitation `revoked`; the link stops working immediately. Response:
`{ "data": { "success": true } }`.
Errors: `400 invalid_request` (invitation isn't pending), `401
unauthenticated`, `403 forbidden`, `404 invitation_not_found`.

### `GET /api/v1/invitations/:token`

Authentication: public — this is the page a freshly-invited person lands
on before they've necessarily logged in. Response:
`{ "data": { "houseName", "houseDescription", "email", "invitedByName", "expiresAt" } }`.
Errors: `404 invitation_not_found`, `410 invitation_expired` (also returned
for a revoked or already-accepted invitation).

### `POST /api/v1/invitations/:token/accept`

Authentication: required. Joins the caller to the invitation's house
(same account-linking/role/notification behavior as `POST /houses/join`)
and marks the invitation `accepted`. Response: same `House` shape as
`POST /houses/join`.
Errors: `401 unauthenticated`, `404 invitation_not_found`,
`409 already_member`, `410 invitation_expired`.

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
active house yet). Each `chatRooms` item is a full room, same shape as
`PATCH /api/v1/chat/rooms/:roomId`'s response (last 50 messages, real
per-caller `unreadCount`). Errors: `401 unauthenticated`.

## Tasks and Chat (Implemented)

Implemented per ADR 0021, extended per ADR 0026, then fully reworked per
ADR 0047 into a production-workflow system (`apps/web/src/server/tasks/*`,
`apps/web/src/server/chat/*`): multi-assignee, subtasks, checklists,
dependencies, time tracking, activity history, and Drive-backed
attachments.

### `POST /api/v1/tasks`

Authentication: required. Body:
`{ "title": string, "description"?: string, "type"?: TaskType, "priority"?: TaskPriority, "status"?: TaskStatus, "assignees"?: { "userId": string, "responsibility"?: string }[], "dueDate"?: string (ISO), "startDate"?: string (ISO), "estimatedMinutes"?: number, "recurrenceRule"?: "daily"|"weekly"|"monthly", "recurrenceEndDate"?: string, "projectId"?: string, "boardId"?: string, "scriptId"?: string, "shootDayEventId"?: string, "parentTaskId"?: string, "equipment"?: string[], "location"?: string, "callTime"?: string, "deliverables"?: string[], "tags"?: string[] }`.
`houseId` is not in the body — the caller's active house is used, same
convention as other house-scoped create endpoints. `TaskType` is a
20-value vocab (shoot/edit/color-grade/sound-design/vfx/motion-graphics/
storyboarding/script-writing/thumbnail/photography/reels/social-media/
client-review/asset-collection/equipment/location-scouting/casting/
meeting/admin/custom); `TaskStatus` is todo/in-progress/review/
changes-requested/completed/archived; `TaskPriority` is low/medium/high/
urgent. Response — the full `Task` shape (also returned by every other
task endpoint below unless noted):

```json
{
  "data": {
    "id": "task_123",
    "title": "Color grade the interview scene",
    "description": "**Note:** match the reference LUT",
    "type": "color-grade",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-07-20T15:00:00.000Z",
    "startDate": null,
    "estimatedMinutes": 90,
    "recurrenceRule": null,
    "recurrenceEndDate": null,
    "equipment": [],
    "location": null,
    "callTime": null,
    "deliverables": [],
    "tags": ["urgent-fix", "client-a"],
    "progress": 0,
    "createdById": "user_123",
    "createdByName": "Rehan Patel",
    "projectId": null,
    "projectTitle": null,
    "clientId": null,
    "clientName": null,
    "boardId": null,
    "boardName": null,
    "scriptId": null,
    "scriptTitle": null,
    "shootDayEventId": null,
    "shootDayEventTitle": null,
    "parentTaskId": null,
    "assignees": [
      {
        "userId": "user_456",
        "name": "Mira Kapoor",
        "responsibility": "Lead Colorist"
      }
    ],
    "checklistItems": [],
    "subtasks": [],
    "blockedByTasks": [],
    "blockingTasks": [],
    "isBlocked": false,
    "attachmentIds": [],
    "createdAt": "2026-07-15T10:00:00.000Z",
    "updatedAt": "2026-07-15T10:00:00.000Z",
    "commentCount": 0
  }
}
```

`clientId`/`clientName` are derived from `project.clients[0].client` at
read time, not stored. Errors: `400 invalid_request` (missing `title`, or
an enum field isn't one of the accepted values), `401 unauthenticated`,
`403 forbidden` (caller isn't a member of the active house),
`404 member_not_found` (an `assignees[].userId` isn't a house member).
Defaults: `status: "todo"`, `priority: "medium"`, `type: "custom"`.

### `GET /api/v1/tasks/:taskId`

Authentication: required. Response: the full `Task` shape above. Errors:
`401 unauthenticated`, `403 forbidden`, `404 task_not_found`.

### `PATCH /api/v1/tasks/:taskId`

Authentication: required. Body: any subset of the `POST` body fields above,
plus `progress?: number` (0-100). Response: the updated task. Changing
`status`/`priority`/`dueDate` logs a `TaskActivity` entry
(`status_changed`/`priority_changed`/`due_date_changed`); moving `status`
to `"review"` fires `task_review_requested`, to `"completed"` fires
`task_completed` (and, if the task has a `recurrenceRule`, synchronously
creates the next occurrence — see ADR 0047); diffing `assignees` against
the current set fires `task_assigned`/logs `assigned`/`unassigned` per
changed member. Errors: `400 invalid_request`, `401 unauthenticated`,
`403 forbidden`, `404 task_not_found`, `404 member_not_found`.

### `DELETE /api/v1/tasks/:taskId`

Authentication: required. Response: `{ "data": { "success": true } }`.
Errors: `401 unauthenticated`, `403 forbidden`, `404 task_not_found`.

### `POST /api/v1/tasks/:taskId/duplicate`

Authentication: required. No body. Copies the task (title, type, priority,
assignees, production fields, links) but not its id, dates, checklist
completion state, time entries, or activity log. Response: the new `Task`.
Errors: `401 unauthenticated`, `403 forbidden`, `404 task_not_found`.

### `POST /api/v1/tasks/:taskId/save-as-template`

Added per ADR 0049. Authentication: required. No body. Clones the task
(same fields as `duplicate` above) into a new row with `isTemplate: true`;
templates are excluded from every normal task listing. Response: the new
`Task`. Errors: `401 unauthenticated`, `403 forbidden`, `404 task_not_found`.

### `POST /api/v1/tasks/:taskId/create-from-template`

Added per ADR 0049. Authentication: required. No body. Clones the
template (`:taskId` must have `isTemplate: true`) into a new real task
(`isTemplate: false`) and logs a `created` activity entry. Response: the
new `Task`. Errors: `401 unauthenticated`, `403 forbidden`,
`404 task_not_found`.

### `GET /api/v1/houses/:houseId/task-templates`

Added per ADR 0049. Authentication: required, caller must be an active
member of `houseId`. Lists this house's templates (`isTemplate: true`),
newest first. Response: `{ "data": Task[] }`.

### `POST /api/v1/tasks/:taskId/checklist`

Authentication: required. Body: `{ "text": string }`. Response: the new
`TaskChecklistItem` (`{ "id", "text", "done", "order" }`). Adding/toggling/
removing a checklist item recomputes `Task.progress` from the completion
ratio. Errors: `400 invalid_request`, `401 unauthenticated`,
`403 forbidden`, `404 task_not_found`.

### `PATCH`/`DELETE /api/v1/tasks/:taskId/checklist/:itemId`

Authentication: required. `PATCH` body: any subset of
`{ "text": string, "done": boolean, "order": number }`. `DELETE` response:
`{ "data": { "success": true } }`. Errors: `401 unauthenticated`,
`403 forbidden`, `404 task_not_found`/`404 checklist_item_not_found`.

### `POST /api/v1/tasks/:taskId/dependencies`

Authentication: required. Body: `{ "blockingTaskId": string }` — marks
`:taskId` as blocked by `blockingTaskId` (both tasks must be in the same
house; self-blocking is rejected). Response: the updated `Task` (with
`isBlocked`/`blockedByTasks` refreshed). Logs a `dependency_added` activity
entry. Errors: `400 invalid_request` (self-blocking, or duplicate pair),
`401 unauthenticated`, `403 forbidden`, `404 task_not_found`.

### `DELETE /api/v1/tasks/:taskId/dependencies/:blockingTaskId`

Authentication: required. Response: the updated `Task`. Errors:
`401 unauthenticated`, `403 forbidden`, `404 task_not_found`.

### `GET /api/v1/tasks/:taskId/time-entries`

Authentication: required. Response: `{ "data": TaskTimeEntry[] }` (not
paginated) — `{ "id", "userId", "userName", "startedAt", "endedAt", "durationMinutes", "note" }`;
`endedAt: null` means that entry is an actively-running timer. Errors:
`401 unauthenticated`, `403 forbidden`, `404 task_not_found`.

### `POST /api/v1/tasks/:taskId/time-entries/start`

Authentication: required. No body — starts a running timer for the caller
on this task (`endedAt: null`). Response: the new `TaskTimeEntry`. Errors:
`401 unauthenticated`, `403 forbidden`, `404 task_not_found`,
`409 timer_already_running` (caller already has a running timer on this
task).

### `POST /api/v1/tasks/:taskId/time-entries/stop`

Authentication: required. Body: `{ "note"?: string }`. Stops the caller's
running timer on this task, computing `durationMinutes` from
`startedAt`/`now`. Response: the updated `TaskTimeEntry`. Errors:
`401 unauthenticated`, `403 forbidden`, `404 task_not_found`,
`404 no_running_timer`.

### `GET /api/v1/tasks/:taskId/activity`

Authentication: required. Response: `{ "data": TaskActivity[] }` (not
paginated, `createdAt asc`) — `{ "id", "type", "fromValue", "toValue", "actorId", "actorName", "createdAt" }`.
Read-only; every entry is written internally by `tasks.service.ts`.
Errors: `401 unauthenticated`, `403 forbidden`, `404 task_not_found`.

### `GET /api/v1/tasks/:taskId/attachments`

Authentication: required. Response: `{ "data": FileEntry[] }` (not
paginated) — `file_entries` rows with this task's id set as `taskId`,
same shape as the Files endpoints. Errors: `401 unauthenticated`,
`403 forbidden`, `404 task_not_found`.

### `POST /api/v1/tasks/:taskId/attachments`

Authentication: required. Body: `{ "entryId": string }` — links an
existing Drive `FileEntry` to this task without moving it out of its
folder (sets `taskId`, leaves `parentId` untouched). To upload a new file
directly to a task, use `POST /api/v1/houses/:houseId/files/upload` with a
`taskId` field in the multipart form body instead. Response: the updated
`FileEntry`. Errors: `401 unauthenticated`, `403 forbidden`,
`404 task_not_found`/`404 file_not_found`.

### `DELETE /api/v1/tasks/:taskId/attachments/:entryId`

Authentication: required. Unlinks the file from the task (clears `taskId`;
does not delete the underlying `FileEntry`). Response:
`{ "data": { "success": true } }`. Errors: `401 unauthenticated`,
`403 forbidden`, `404 task_not_found`/`404 file_not_found`.

### `GET`/`POST /api/v1/chat/rooms/:roomId/messages`

Authentication: required. Request param: `roomId`.

`GET` is cursor-paginated (`limit?` 1-100 default 25, `cursor?` — see
"Response Shape" below) and returns the room's messages **oldest-first
within the page**, newest page first (i.e. call with no cursor to get the
most recent messages, each page still ascending by time). `POST` body:
`{ "body": string, "parentMessageId"?: string }` (`parentMessageId` makes
this message a threaded reply — must be an existing message in the same
room). Response for both — a single `Message`, not a room or a list, is
the unit of both endpoints now (`POST`'s response is one `Message`; `GET`'s
`data` is a `Message[]`):

```json
{
  "id": "msg_123",
  "conversationId": "room_123",
  "authorId": "user_123",
  "authorName": "Aryan Sharma",
  "sentAt": "2026-07-04T10:25:00.000Z",
  "body": "Version 03 is ready for producer review.",
  "editedAt": null,
  "pinned": false,
  "parentMessageId": null,
  "replyCount": 0,
  "reactions": [{ "emoji": "👍", "count": 2, "reactedByMe": true }]
}
```

Errors: `400 invalid_request` (empty `body`, or `parentMessageId` doesn't
exist in this room), `401 unauthenticated`, `403 forbidden` (caller isn't a
member of the room's house), `404 room_not_found`. Expected behavior: 3
rooms (`"general"`, `"edit-bay"`, `"shoot-floor"`) are seeded automatically
at house creation. Sending a message also broadcasts realtime events (see
"Realtime API" below): `message:new` on the room's own topic (full
`Message` payload) and a slimmer `message:new` on the house-wide chat
topic (for cross-room unread badges).

### `POST /api/v1/chat/rooms/:roomId/read`

Authentication: required (caller must be a member of the room's house).
No body. Marks every message in the room as read by the caller up to now
(upserts a `ConversationRead` row) — this is what a real `unreadCount` (see
`PATCH /api/v1/chat/rooms/:roomId` below) is computed from. Response:
`{ "data": { "success": true } }`. Broadcasts a `read` realtime event on
the room's topic. Errors: `401 unauthenticated`, `403 forbidden`,
`404 room_not_found`.

### `PATCH /api/v1/chat/rooms/:roomId`

Authentication: required (caller must be a member of the room's house).
Body: any subset of `{ "name": string, "topic": string }`. Renames a
conversation/channel. Response is the **full room**, including its most
recent 50 messages and a real per-caller `unreadCount` (unlike the
paginated `GET .../messages` above, this is the one place a room's
messages still come back as a nested array):

```json
{
  "data": {
    "id": "room_123",
    "name": "general",
    "topic": "Daily coordination and house-wide updates.",
    "unreadCount": 2,
    "messages": [
      {
        "id": "msg_123",
        "conversationId": "room_123",
        "authorId": "user_123",
        "authorName": "Aryan Sharma",
        "sentAt": "2026-07-04T10:25:00.000Z",
        "body": "Version 03 is ready for producer review.",
        "editedAt": null,
        "parentMessageId": null,
        "replyCount": 0,
        "reactions": [{ "emoji": "👍", "count": 2, "reactedByMe": true }]
      }
    ]
  }
}
```

`unreadCount` is the count of messages in this room authored by someone
else, created after the caller's last `POST .../read` call (or all of them
if the caller has never marked the room read). Errors:
`400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 room_not_found`, `409 channel_name_taken`.

### `POST /api/v1/messages/:messageId/reactions`

Authentication: required (caller must be a member of the message's room's
house). Request param: `messageId`. Body: `{ "emoji": string }` — must be
one of `"👍" | "❤️" | "😂" | "🎉" | "😮" | "👀"`. Toggles the reaction: if
the caller already reacted to this message with this emoji it's removed,
otherwise it's added (one reaction per user per emoji per message).
Response: the single updated `Message`, same shape as
`GET`/`POST /api/v1/chat/rooms/:roomId/messages` above. Broadcasts a
`reaction:update` realtime event (full `Message` payload) on the room's
topic. Errors: `400 invalid_request` (unsupported or missing emoji),
`401 unauthenticated`, `403 forbidden`, `404 message_not_found`.

### `PATCH /api/v1/messages/:messageId`

Authentication: required. Request param: `messageId`. Body:
`{ "body": string }`. Edits a message's text — author-only, and only
within 10 minutes of `sentAt`; sets `editedAt` to the current time.
Response: the single updated `Message` (with `editedAt` now populated),
same shape as the endpoints above. Broadcasts a `message:edit` realtime
event (full `Message` payload) on the room's topic (ADR 0044) so other
open clients update the bubble live. Errors: `400 invalid_request` (empty
`body`), `401 unauthenticated`, `403 not_author` (caller didn't author this
message), `403 edit_window_expired` (more than 10 minutes since
`sentAt`), `404 message_not_found`.

### `POST /api/v1/messages/:messageId/pin`

Authentication: required. Added per ADR 0055 (Phase 5, for project
chat's "Pinned Notes"). No body. Toggles `Message.pinned` and returns
the updated `Message` (same shape as the endpoints above). Broadcasts
the change as a `message:edit` realtime event on the room's topic - the
same event type message editing already uses, so no new client-side
handling was needed. Any house member can pin/unpin, not just the
author. Errors: `401 unauthenticated`, `403 forbidden`,
`404 message_not_found`.

### `GET`/`POST /api/v1/chat/rooms/:roomId/events`

Authentication: required (caller must be a member of the room's house).
`GET` response: `{ "data": CalendarEvent[] }` (not paginated), sorted
`date asc`, scoped to events created from this room:
`{ "id", "title", "date", "time", "location", "category", "projectId", "organizationId" }`.
`POST` body: `{ "title": string, "date": string, "time": string }` —
creates a room-scoped calendar event, then (like `sendMessage`) returns the
**full updated event list**, not just the created event, i.e. the `POST`
response shape matches the `GET` response shape. Errors:
`400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 room_not_found`.

### `GET /api/v1/chat/rooms/:roomId/files`

Authentication: required (caller must be a member of the room's house).
Response: `{ "data": FileEntry[] }` (not paginated), sorted
`createdAt desc` — files uploaded via `POST /api/v1/houses/:houseId/files/upload`
with this room's id passed as `conversationId`:
`{ "id", "parentId", "name", "type", "size", "mimeType", "sensitive", "uploadedById", "uploadedByName", "createdAt", "updatedAt" }`.
Errors: `401 unauthenticated`, `403 forbidden`, `404 room_not_found`.

### `GET`/`POST /api/v1/chat/rooms/:roomId/tasks`

Authentication: required (caller must be a member of the room's house).
`GET` response: `{ "data": ChannelTaskItem[] }` (not paginated) — tasks
tied to this room, a lighter shape than the full `Task` (just what the
channel's Tasks tab renders): `{ "id", "title", "assignees": [{ "userId", "name", "responsibility" }], "dueDate", "status", "priority" }`.
`POST` body: `{ "title": string }` — creates a task assigned to the caller
(`dueDate` defaulted to 7 days out), then (like `sendMessage`/room events)
returns the **full updated task list** as `ChannelTaskItem[]`, not just the
created task. Errors: `400 invalid_request`, `401 unauthenticated`,
`403 forbidden`/`403 not_a_member`, `404 room_not_found`.

### `POST /api/v1/houses/:houseId/conversations`

Added per ADR 0029. Authentication: required. Body:
`{ "name": string, "topic"?: string }`. Response: the new room, same
full-room shape as `PATCH /api/v1/chat/rooms/:roomId` above (with an
empty `messages` array and `unreadCount: 0`). Errors:
`400 invalid_request` (missing `name`),
`401 unauthenticated`, `403 forbidden` (caller isn't a member of
`houseId`), `409 channel_name_taken` (a conversation with this name
already exists in the house - names are unique per house). Every house
member can post in any conversation once created; there's no
channel-level membership restriction, and no way to create a private/DM
(1:1) conversation - every conversation is a house-wide group channel.

## Projects and Clients (Implemented)

Implemented per ADR 0022 (`apps/web/src/server/projects/*`, `apps/web/src/server/clients/*`),
extended per ADR 0027 (production type/genre/stage/progress/cover art/team,
matching the designed Projects page UI).

### `POST /api/v1/houses/:houseId/projects`

Authentication: required. Body:
`{ "name": string, "description"?: string, "type"?: string, "genre"?: string, "stage"?: string, "priority"?: string, "progress"?: number, "coverGradient"?: string, "coverIcon"?: string, "dueDate"?: string, "teamIds"?: string[], "clientId"?: string }`.
`type` must be one of a fixed production-type list (`"Short Film"`,
`"Documentary"`, `"Commercial"`, `"Music Video"`, `"Feature Film"`,
`"Corporate Video"`, `"Web Series"`, `"Wedding Film"`); `stage` one of
`"Development" | "Pre-Production" | "In Production" | "In Progress" |
"Post-Production" | "On Hold" | "Completed"` (default `"Development"`);
`priority` one of `"low" | "medium" | "high" | "urgent"` (default
`"medium"`, added per ADR 0051 — reuses `Task.priority`'s exact
vocabulary and `PRIORITY_META` styling, no new vocabulary); `coverIcon`
one of `"camera" | "clapperboard" | "heart" | "megaphone" | "mic" |
"music"`; `teamIds` must all be current members of `houseId`; `clientId`
(added per ADR 0045) links the client immediately and files the
project's Drive folder under it — omit to file under Clients/Misc instead.
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
    "priority": "medium",
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
`priority`/`coverIcon` value, or a `teamIds` entry that isn't a house
member), `401 unauthenticated`, `403 forbidden` (caller isn't a member of
`houseId`).

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

### `GET /api/v1/projects/:projectId/stats`

Authentication: required. Added per ADR 0051. Response:

```json
{
  "data": {
    "taskCount": 12,
    "completedTaskCount": 5,
    "teamMemberCount": 4,
    "fileCount": 23,
    "storageBytes": 104857600,
    "timeLoggedHours": 18.5,
    "completionPercent": 40
  }
}
```

Computed on read, not stored: task counts and `teamMemberCount` (union of
every task's assignees) come from the project's non-template `Task` rows;
`fileCount`/`storageBytes` come from `FileEntry` rows whose `driveKey`
starts with `project:{projectId}` (the existing Drive-folder-key scoping
from ADR 0045, not a new FK); `timeLoggedHours` sums `TimeEntry.hours`;
`completionPercent` echoes `Project.progress`. Errors: `401 unauthenticated`,
`403 forbidden`, `404 project_not_found`.

### `GET /api/v1/projects/:projectId/timeline`

Authentication: required. Added per ADR 0055 (Phase 5). Response:
`{ "data": ProjectTimelineEntry[] }` (not paginated), newest-first:

```json
{
  "data": [
    {
      "id": "shoot_123-uploaded",
      "actorName": "",
      "text": "Footage from \"Rooftop Interview\" was uploaded",
      "occurredAt": "2026-07-16T10:00:00.000Z"
    },
    {
      "id": "task-task_123",
      "actorName": "Rehan Patel",
      "text": "added a new task \"Edit Rooftop Interview\"",
      "occurredAt": "2026-07-15T09:00:00.000Z"
    }
  ]
}
```

Unions Project/Task creation, `TaskActivity` (status changes), Shoot
status-transition timestamps, and Deliverable submission/status
timestamps into one merge-and-sort feed - the same shape and pattern as
`dashboard.service.ts`'s house-wide `getSummary().recentActivity`, just
project-scoped with more sources (see ADR 0055 - there's no dedicated
status-history table, so this reads the timestamp columns and current
status that already exist on `Shoot`/`Deliverable`). `actorName` is
empty for entity-level events (e.g. a shoot status change) that have no
single acting user. Errors: `401 unauthenticated`, `403 forbidden`,
`404 project_not_found`.

### `GET /api/v1/projects/:projectId/analytics`

Authentication: required. Added per ADR 0055 (Phase 5). Response:

```json
{
  "data": {
    "shootsCompleted": 3,
    "shootsUpcoming": 1,
    "editingHours": 12.5,
    "teamHours": 40.2,
    "storageBytes": 2147483648,
    "filesUploaded": 87,
    "deliverableCount": 4,
    "avgReviewHours": 6.5,
    "revisionCount": 1,
    "completionPercent": 60
  }
}
```

Computed on read: `shootsCompleted`/`shootsUpcoming` count `Shoot` rows
by status (`archived` / `scheduled` with a future `scheduledDate`);
`editingHours` sums `TaskTimeEntry.durationMinutes` for the project's
`type: "edit"` tasks; `teamHours` sums every `TaskTimeEntry` plus
`TimeEntry.hours` for the project; `storageBytes`/`filesUploaded` reuse
the same `driveKey` prefix scoping as `getProjectStats`; `avgReviewHours`
averages `updatedAt - createdAt` across deliverables that have left
`review`; `revisionCount` counts deliverables _currently_ in `revision`
(not a full historical count - no status-history table exists yet, see
ADR 0055); `completionPercent` echoes `Project.progress`. Errors:
`401 unauthenticated`, `403 forbidden`, `404 project_not_found`.

### `GET /api/v1/projects/:projectId/conversation`

Authentication: required. Added per ADR 0055 (Phase 5). Resolves
(lazily creating if needed - for projects created before this phase)
the project's dedicated chat `Conversation` and returns its id:

```json
{ "data": { "roomId": "conversation_123" } }
```

The client then uses this `roomId` with the existing chat endpoints
(`POST`/`GET /api/v1/chat/rooms/:roomId/messages`,
`useConversationChannel`) exactly as any other room - no new messaging
endpoints were needed. This conversation is excluded from `GET
/api/v1/houses/:houseId/conversations` (the house-wide room list).
Errors: `401 unauthenticated`, `403 forbidden`, `404 project_not_found`.

### `POST /api/v1/projects/:projectId/clients`

Authentication: required. Body: `{ "clientId": string }`. Response: updated
`Project` with the client now included in `clients`. If this is the
project's first linked client, its Drive folder physically moves from
Clients/Misc to this client's folder (ADR 0045); later clients linked to
the same project don't move it again. Errors: `400 invalid_request`
(`clientId` belongs to a different house), `401 unauthenticated`,
`403 forbidden`, `404 project_not_found`, `409 already_linked`. Link-only
— no unlink endpoint yet.

### `POST /api/v1/houses/:houseId/clients`

Authentication: required. Body:
`{ "name": string, "logoUrl"?: string, "contactName"?: string, "contactEmail"?: string, "phone"?: string, "address"?: string, "gst"?: string, "notes"?: string }`.
The `logoUrl`/`phone`/`address`/`gst`/`notes` fields were added per ADR
0051 for a fuller company profile — all optional. Response:

```json
{
  "data": {
    "id": "client_123",
    "name": "North Star Films",
    "logoUrl": null,
    "contactName": "Dev Anand",
    "contactEmail": "dev@northstarfilms.example",
    "phone": null,
    "address": null,
    "gst": null,
    "notes": null,
    "status": "active",
    "createdAt": "2026-07-08T10:00:00.000Z",
    "updatedAt": "2026-07-08T10:00:00.000Z"
  }
}
```

Best-effort creates a matching Drive folder under Clients if the house's
Google Drive is connected (ADR 0045) - never fails client creation if
Drive isn't connected or the call fails. Errors: `400 invalid_request`
(missing `name`, or `contactEmail` isn't a valid email),
`401 unauthenticated`, `403 forbidden`.

### `GET /api/v1/houses/:houseId/clients`

Authentication: required. Query: `limit?`, `cursor?` (same as projects).
Response: `{ "data": Client[], "page": {...} }` — excludes archived
clients (`status: "archived"`, ADR 0051). Errors: `401 unauthenticated`,
`403 forbidden`.

### `GET /api/v1/clients/:clientId` / `PATCH /api/v1/clients/:clientId`

Same shape/error pattern as the corresponding project endpoints, scoped to
a `Client` instead. `PATCH` accepts any subset of the create body's
fields (all optional).

### `POST /api/v1/clients/:clientId/archive`

Authentication: required. Added per ADR 0051. No body. Response: updated
`Client` with `status: "archived"` (then excluded from the list
endpoint). Errors: `401 unauthenticated`, `403 forbidden`,
`404 client_not_found`.

### `DELETE /api/v1/clients/:clientId`

Authentication: required. Added per ADR 0051. No body. Response:
`{ "data": { "success": true } }`. Refuses to delete a client that still
has linked projects — archive or unlink them first — since deleting would
silently orphan project-client links. Errors: `401 unauthenticated`,
`403 forbidden`, `404 client_not_found`, `409 client_has_projects`.

### `GET /api/v1/clients/:clientId/stats`

Authentication: required. Added per ADR 0051. Response:

```json
{
  "data": {
    "activeProjects": 3,
    "completedProjects": 1,
    "totalShoots": 0,
    "videosDelivered": 0,
    "storageBytes": 52428800
  }
}
```

Computed on read: project counts come from `ProjectClient` links joined to
each project's `stage`/`status`; `storageBytes` sums `FileEntry.size`
under the client's own Drive folder plus every linked project's folder
(matched by `driveKey` prefix, same mechanism as the project stats
endpoint). `totalShoots`/`videosDelivered` are placeholders (`0`) until
Phases 2/4 of the Projects Overhaul add those entities. Errors:
`401 unauthenticated`, `403 forbidden`, `404 client_not_found`.

## Shoots (Implemented)

Implemented per ADR 0052 (`apps/web/src/server/shoots/*`) - Projects
Module Overhaul Phase 2. A `Shoot` is a scheduled production day, distinct
from Storyboard's `Board`/`Shot` (frame-level references). Creating one
also creates a `CalendarEvent` (`category: "shoot"`) and a `Task`
(`type: "shoot"`) in the same transaction, with the crew as that task's
assignees - the crew member's Home Focus Card automatically switches to a
shoot-mode HUD once that task becomes their focus task (`FocusTaskCard`,
`task.shootId` set).

### `POST /api/v1/houses/:houseId/projects/:projectId/shoots`

Authentication: required. Body:
`{ "name": string, "scheduledDate": string (ISO), "callTime"?: string, "location"?: string, "equipment"?: string[], "crewIds"?: string[], "notes"?: string }`.
`crewIds` must all be current members of `houseId`. Response: the created
`Shoot`:

```json
{
  "data": {
    "id": "shoot_123",
    "projectId": "project_123",
    "taskId": "task_123",
    "name": "Rooftop Interview Shoot",
    "scheduledDate": "2026-07-20T00:00:00.000Z",
    "callTime": "8:00 AM",
    "location": "Downtown Rooftop, City Center",
    "equipment": ["Camera", "Tripod", "Drone"],
    "notes": null,
    "status": "scheduled",
    "cancelReason": null,
    "cancelNotes": null,
    "reachedAt": null,
    "startedAt": null,
    "finishedAt": null,
    "uploadedAt": null,
    "cancelledAt": null,
    "crew": [{ "userId": "user_123", "name": "Rehan Patel" }],
    "createdAt": "2026-07-16T10:00:00.000Z",
    "updatedAt": "2026-07-16T10:00:00.000Z"
  }
}
```

Errors: `400 invalid_request` (missing `name`/`scheduledDate`, or a
`crewIds` entry that isn't a house member), `401 unauthenticated`,
`403 forbidden`, `404 project_not_found`.

### `GET /api/v1/projects/:projectId/shoots`

Authentication: required. Response: `{ "data": Shoot[] }` (not paginated -
a project's shoot list is expected to stay small), ordered by
`scheduledDate` ascending. Errors: `401 unauthenticated`,
`403 forbidden`, `404 project_not_found`.

### `GET /api/v1/shoots/:shootId`

Authentication: required. Response: single `Shoot`. Errors:
`401 unauthenticated`, `403 forbidden`, `404 shoot_not_found`.

### `GET /api/v1/shoots/:shootId/upload-folder`

Authentication: required. Added per ADR 0053 (Phase 3: Upload
Automation). Resolves (creating if needed) the shoot's Drive folder -
`project:{projectId}:shoot:{shootId}`, nested under the project's
`Shoots` subfolder, named `"{scheduledDate} - {shoot name}"`. Response:

```json
{ "data": { "parentId": "folder_123" } }
```

The client uploads each selected file with this `parentId` via the
existing `POST /api/v1/houses/:houseId/files/upload` endpoint, once per
file (multi-file upload is a client-side loop over the single-file
endpoint, not a new bulk endpoint). Errors: `401 unauthenticated`,
`403 forbidden`, `404 shoot_not_found`, and any Drive-related error if
the house has no Drive connection (ADR 0045).

### Shoot status transitions

Each is a dedicated action endpoint (matches the `archive`-endpoint
precedent elsewhere) rather than a generic `PATCH status`, since most of
them also stamp a specific timestamp column. All: authentication
required, no body (except `cancel`), response is the updated `Shoot`,
errors `401 unauthenticated` / `403 forbidden` / `404 shoot_not_found`.

- `POST /api/v1/shoots/:shootId/reached` → `status: "crew-reached"`,
  sets `reachedAt`.
- `POST /api/v1/shoots/:shootId/start` → `status: "started"`, sets
  `startedAt`.
- `POST /api/v1/shoots/:shootId/finish` → `status: "finished"`, sets
  `finishedAt`.
- `POST /api/v1/shoots/:shootId/finish-upload` → `status: "uploading"`,
  sets `finishedAt`. The client calls this right before uploading files
  into the shoot's folder (see `upload-folder` above).
- `POST /api/v1/shoots/:shootId/mark-uploaded` → `status: "uploaded"`,
  sets `uploadedAt`. Also best-effort auto-creates an Editing `Task`
  (`type: "edit"`, titled `"Edit {shoot name}"`) linked to the shoot's
  footage folder and the project's `Assets` folder (ADR 0053) - a
  failure in this Drive-dependent step (e.g. no Drive connection) is
  logged and swallowed, never fails the status transition itself.
- `POST /api/v1/shoots/:shootId/ready-for-editing` → `status:
"ready-for-editing"`.
- `POST /api/v1/shoots/:shootId/archive` → `status: "archived"`.
- `POST /api/v1/shoots/:shootId/cancel` - Body:
  `{ "reason": string, "notes"?: string }`. → `status: "cancelled"`,
  sets `cancelReason`/`cancelNotes`/`cancelledAt`. Errors additionally
  include `400 invalid_request` (missing `reason`).

## Notifications (Implemented)

Implemented per ADR 0023 (`apps/web/src/server/notifications/*`). No public
create endpoint — notifications are always server-triggered. Task-related
triggers (ADR 0021, expanded ADR 0047): `task_assigned`, `task_comment`,
`task_mentioned` (`@Name` in a task comment), `task_status_changed`,
`task_review_requested` (status → `review`), `task_completed`; plus
house-join notifies its `"Owner"` member(s), and others added since (house
join requests, announcements, bookings, ...). No realtime delivery yet
(ADR 0005 not implemented) — poll `GET /api/v1/notifications`.

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

Implemented per ADR 0024 (`apps/web/src/server/comments/*`). Resolves the
previously-deferred "comment target modeling strategy" — a comment
attaches to a task or a project via nested routes (not a generic
`/api/v1/comments`).

### `POST`/`GET /api/v1/tasks/:taskId/comments`

Authentication: required. `POST` body: `{ "body": string }`. Response
(both methods): `Comment` — `{ "id", "body", "authorId", "authorName", "createdAt", "updatedAt" }`
(list is cursor-paginated, `createdAt asc` — see "Response Shape" below).
Posting a comment notifies every current assignee (`task_comment`), and
additionally fires `task_mentioned` for each house member whose exact name
appears as `@Name` in `body` (regex-matched against house member names,
excluding the comment's own author — ADR 0047; no stored mention entity).
Errors: `400 invalid_request` (empty `body`, `POST` only),
`401 unauthenticated`, `403 forbidden` (not a member of the task's house),
`404 task_not_found`.

### `POST`/`GET /api/v1/projects/:projectId/comments`

Same shape/error pattern as the task endpoints above, scoped to a
`Project` (`404 project_not_found` instead). No edit/delete endpoint
exists for either yet.

### `POST`/`GET /api/v1/deliverables/:deliverableId/comments`

Same shape/error pattern as the endpoints above, scoped to a
`Deliverable` (`404 deliverable_not_found` instead) - notifies the
project's `teamIds`, same as project comments.

## Deliverables (Implemented)

Implemented per ADR 0054 (`apps/web/src/server/deliverables/*`) -
Projects Module Overhaul Phase 4. A `Deliverable` is a versioned
submission for a project - every draft submitted creates a new row
(never overwriting a previous version) moving through a
`draft | review | revision | approved | final` workflow.

### `POST /api/v1/projects/:projectId/deliverables`

Authentication: required. Body:
`{ "fileEntryId": string, "taskId"?: string, "notes"?: string }`.
`version` is computed server-side (current count for the project + 1) -
not client-supplied. New deliverables start at `status: "review"`
(submitting a draft already means "ready for review"). In practice
called by `SubmitDraftDialog` right after its existing file upload, not
directly by users. Response:

```json
{
  "data": {
    "id": "deliverable_123",
    "projectId": "project_123",
    "taskId": "task_123",
    "version": 2,
    "status": "review",
    "notes": null,
    "file": {
      "id": "file_123",
      "name": "sizzle_reel_v2.mp4",
      "size": 60000000,
      "mimeType": "video/mp4"
    },
    "createdById": "user_123",
    "createdByName": "Rehan Patel",
    "createdAt": "2026-07-16T10:00:00.000Z",
    "updatedAt": "2026-07-16T10:00:00.000Z"
  }
}
```

Errors: `400 invalid_request` (missing `fileEntryId`, or a `taskId` that
isn't in this house), `401 unauthenticated`, `403 forbidden`,
`404 project_not_found`.

### `GET /api/v1/projects/:projectId/deliverables`

Authentication: required. Response: `{ "data": Deliverable[] }` (not
paginated), ordered by `version` ascending. Errors:
`401 unauthenticated`, `403 forbidden`, `404 project_not_found`.

### Deliverable status transitions

Each is a dedicated action endpoint (matches the Shoot-status-transition
precedent, ADR 0052/0053) rather than a generic `PATCH status`. All:
authentication required, no body, response is the updated `Deliverable`,
errors `401 unauthenticated` / `403 forbidden` / `404 deliverable_not_found`.

- `POST /api/v1/deliverables/:deliverableId/approve` → `status:
"approved"`. Also best-effort auto-creates a Delivery `Task`
  (`type: "delivery"`, titled `"Deliver v{version} - {project name}"`)
  and bumps `Project.progress` by 10 (capped at 100) - a failure in this
  side effect is logged and swallowed, never undoes the approval itself.
- `POST /api/v1/deliverables/:deliverableId/request-revision` →
  `status: "revision"`.
- `POST /api/v1/deliverables/:deliverableId/mark-final` → `status:
"final"`.

## Crews (Implemented)

Implemented per ADR 0028 (`apps/web/src/server/crews/*`). A "crew member" is a
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

Implemented per ADR 0030 (`apps/web/src/server/calendar/*`). A house's
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

Implemented per ADR 0031 (`apps/web/src/server/time-entries/*`). A `TimeEntry`
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

Implemented per ADR 0031 (`apps/web/src/server/analytics/*`). A single endpoint
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
    "taskEstimateVsActual": { "estimatedMinutes": 90, "actualMinutes": 0 },
    "activityHeatmap": {
      "dayLabels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "timeLabels": ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"],
      "matrix": [[0, 1, 3, 4, 3, 1]]
    }
  }
}
```

### `GET /api/v1/houses/:houseId/analytics/me`

Added per ADR 0050 for the HUD's Personal Stats panel. Authentication:
required, caller must be an active member of `houseId`. Response:

```json
{
  "data": {
    "tasksCompleted": 4,
    "tasksPending": 2,
    "completionRate": 67,
    "onTimePercentage": 100,
    "workingHours": { "today": 1.5, "week": 6.2, "month": 14, "total": 40 },
    "workStreak": { "current": 3, "best": 12 }
  }
}
```

Scoped to the caller's own assigned tasks and own `TaskTimeEntry`/
`TimeEntry` rows in this house only (unlike `getAnalytics` above, which
is house-wide). `onTimePercentage` uses `task.updatedAt <= task.dueDate`
as an approximation (no dedicated `completedAt` column exists).
`workStreak` counts consecutive calendar days with at least one logged
time entry, anchored at today (or yesterday, if nothing is logged yet
today).

Metric definitions (see ADR 0031 for the full reasoning): `activeProjects`
excludes projects staged `Completed` or `On Hold`; `teamEfficiency` is
`tasksCompleted / tasksTotal * 100`; `teamWorkload.percentage` is hours
logged in the last 7 days divided by a flat 40-hour weekly capacity,
capped at 100; `activityHeatmap` buckets `Task`/`Message`/`Comment`/
`TimeEntry` timestamps by weekday and 4-hour window, normalized 0-4
relative to that house's busiest bucket; `taskEstimateVsActual` (ADR 0049)
sums `Task.estimatedMinutes` against `TaskTimeEntry.durationMinutes`
across the house's non-template tasks. All task queries feeding this
endpoint exclude `isTemplate: true` rows (ADR 0049).

## Dashboard Summary (Implemented)

Implemented (`apps/web/src/server/dashboard/*`). A single endpoint computes
every aggregate the house Dashboard page needs, server-side.

### `GET /api/v1/houses/:houseId/dashboard-summary`

Authentication: required. Response: `{ "data": DashboardSummary }`:

```json
{
  "data": {
    "activeProjects": 3,
    "activeProjectsSparkline": [2, 2, 2, 3, 3, 3, 3],
    "upcomingShootsCount": 1,
    "upcomingShootsSparkline": [0, 0, 1, 0, 0, 0, 0],
    "nextShoot": {
      "date": "2026-07-17",
      "time": "9:00 AM",
      "title": "Rooftop Scene"
    },
    "recentActivity": [
      {
        "id": "task-task_123",
        "actorName": "Mira Kapoor",
        "text": "added a new task \"Prepare rough cut\"",
        "occurredAt": "2026-07-14T10:00:00.000Z"
      }
    ]
  }
}
```

`activeProjects`/`activeProjectsSparkline` exclude projects staged
`Completed` or `On Hold` (sparkline is one count per day for the last 7
days). `upcomingShootsCount`/`upcomingShootsSparkline` count calendar
events with `category: "shoot"` (sparkline: events created per day, last 7
days; count: shoots falling in the next 7 days). `nextShoot` is the
soonest such shoot, or `null`. `recentActivity` merges the 8 most recent
`Task`/`Message`/`Comment`/`TimeEntry` records across the house,
newest first. Errors: `401 unauthenticated`, `403 forbidden`.

## Storyboards (Implemented)

Implemented (`apps/web/src/server/storyboard/*`). A `Board` groups an
ordered list of `Shot`s (each an optional camera-angle/notes/hand-drawn
`imageUrl`), optionally linked to a `Project` and/or a `Script`. `Character`
and `Location` are simpler standalone lists scoped to the house (optionally
to a `Project`).

### `GET`/`POST /api/v1/houses/:houseId/boards`

Authentication: required (member). `GET` response: `{ "data": Board[] }`
(not paginated), sorted `updatedAt desc`. `POST` body:
`{ "name": string, "description"?: string, "projectId"?: string, "scriptId"?: string, "shots"?: [{ "description": string, "cameraAngle"?: string, "notes"?: string, "order"?: number }] }`
(`shots` optionally seeds the board with initial shots at creation time).
Response (both): `Board`:

```json
{
  "id": "board_123",
  "projectId": "project_456",
  "scriptId": null,
  "name": "Opening sequence",
  "description": null,
  "updatedAt": "2026-07-14T10:00:00.000Z",
  "shots": [
    {
      "id": "shot_123",
      "boardId": "board_123",
      "order": 0,
      "description": "Wide shot of the cafe exterior",
      "cameraAngle": "Wide",
      "notes": null,
      "imageUrl": null
    }
  ]
}
```

Errors: `400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 project_not_found` / `404 script_not_found` (bad `projectId`/`scriptId`).

### `PATCH`/`DELETE /api/v1/houses/:houseId/boards/:boardId`

Authentication: required (member). `PATCH` body: any subset of
`{ "name": string, "description": string, "scriptId": string }` (an empty
string `scriptId` clears the link to a script). Response: updated `Board`.
`DELETE` response: `{ "data": { "success": true } }`. Errors:
`400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 board_not_found` / `404 script_not_found`.

### `POST /api/v1/houses/:houseId/boards/:boardId/shots`

Authentication: required (member). Body:
`{ "description": string, "cameraAngle"?: string, "notes"?: string, "order"?: number }`
(`order` defaults to appending at the end of the board). Response: created
`Shot` (same shape as in the `Board` response above). Errors:
`400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 board_not_found`.

### `PATCH /api/v1/houses/:houseId/shots/:shotId`

Authentication: required (member). Body: any subset of
`{ "description": string, "cameraAngle": string, "notes": string, "imageUrl": string }`
(`imageUrl` is a `data:` URL PNG from the shot's drawing canvas; `""`
clears it). Response: updated `Shot`. Errors: `400 invalid_request`,
`401 unauthenticated`, `403 forbidden`, `404 shot_not_found`.

### `GET`/`POST /api/v1/houses/:houseId/characters`

Authentication: required (member). `GET` response: `{ "data": Character[] }`
(not paginated), sorted `createdAt asc`. `POST` body:
`{ "name": string, "role": string, "description"?: string, "projectId"?: string }`.
Response (both): `{ "id", "projectId", "name", "role", "description" }`.
Errors: `400 invalid_request`, `401 unauthenticated`, `403 forbidden`.

### `DELETE /api/v1/houses/:houseId/characters/:characterId`

Authentication: required (member). Response:
`{ "data": { "success": true } }`. Errors: `401 unauthenticated`,
`403 forbidden`, `404 character_not_found`.

### `GET`/`POST /api/v1/houses/:houseId/locations`

Authentication: required (member). `GET` response: `{ "data": Location[] }`
(not paginated), sorted `createdAt asc`. `POST` body:
`{ "name": string, "type": string, "projectId"?: string }`. Response
(both): `{ "id", "projectId", "name", "type", "shotCount" }`. Errors:
`400 invalid_request`, `401 unauthenticated`, `403 forbidden`.

### `DELETE /api/v1/houses/:houseId/locations/:locationId`

Authentication: required (member). Response:
`{ "data": { "success": true } }`. Errors: `401 unauthenticated`,
`403 forbidden`, `404 location_not_found`.

## Scripts (Implemented)

Implemented (`apps/web/src/server/scripts/*`). A `Script` is a
house-scoped, optionally project-linked text document.

### `GET`/`POST /api/v1/houses/:houseId/scripts`

Authentication: required (member). `GET` response:
`{ "data": ScriptSummary[] }` (not paginated), sorted `updatedAt desc` —
each item omits `content`, exposing a derived `wordCount` instead (list
payloads stay small):
`{ "id", "projectId", "title", "wordCount", "createdById", "createdByName", "createdAt", "updatedAt" }`.
`POST` body:
`{ "title": string, "projectId"?: string, "content"?: string }`. Response:
full `Script` (includes `content` in place of `wordCount`):
`{ "id", "projectId", "title", "content", "createdById", "createdByName", "createdAt", "updatedAt" }`.
Errors: `400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 project_not_found`.

### `GET`/`PATCH`/`DELETE /api/v1/houses/:houseId/scripts/:scriptId`

Authentication: required (member). `GET` response: full `Script` (same
shape as `POST`'s response). `PATCH` body: any subset of
`{ "title": string, "projectId": string, "content": string }`. Response:
updated `Script`. `DELETE` response: `{ "data": { "success": true } }`.
Errors: `400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 script_not_found` / `404 project_not_found`.

## Call Sheets (Implemented)

Implemented (`apps/web/src/server/call-sheets/*`). A `CallSheet` is a
per-shoot-day schedule with per-crew-member call times.

### `GET`/`POST /api/v1/houses/:houseId/call-sheets`

Authentication: required (member). `GET` response: `{ "data": CallSheet[] }`
(not paginated), sorted `shootDate desc`. `POST` body:
`{ "title": string, "projectId"?: string, "shootDate": string, "generalCallTime": string, "location"?: string, "weather"?: string, "notes"?: string, "crewCallTimes"?: [{ "userId": string, "name": string, "jobTitle": string, "callTime": string }] }`.
Response (both): `CallSheet`:

```json
{
  "id": "call_sheet_123",
  "projectId": "project_456",
  "projectTitle": "Cafe Noir Opening",
  "title": "Day 1 - Exterior",
  "shootDate": "2026-07-17",
  "generalCallTime": "7:00 AM",
  "location": "123 Main St",
  "weather": "Sunny, 24°C",
  "notes": null,
  "crewCallTimes": [
    {
      "userId": "user_1",
      "name": "Priya Sharma",
      "jobTitle": "Gaffer",
      "callTime": "6:30 AM"
    }
  ],
  "createdById": "user_123",
  "createdByName": "Aryan Sharma",
  "createdAt": "2026-07-14T10:00:00.000Z",
  "updatedAt": "2026-07-14T10:00:00.000Z"
}
```

Errors: `400 invalid_request` (`projectId` doesn't belong to this house),
`401 unauthenticated`, `403 forbidden`.

### `GET`/`PATCH`/`DELETE /api/v1/call-sheets/:callSheetId`

Not house-scoped in the URL — membership is derived from the call sheet's
own house. Authentication: required (caller must be a member of the call
sheet's house). `GET` response: `CallSheet` (same shape as above). `PATCH`
body: any subset of the create body's fields. Response: updated
`CallSheet`. `DELETE` response: `{ "data": { "success": true } }`. Errors:
`400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 call_sheet_not_found`.

## Announcements (Implemented)

Implemented (`apps/web/src/server/announcements/*`). House-wide
announcements, postable only by the `"Owner"` role; every other member is
notified (`announcement_posted`) when one is posted.

### `GET`/`POST /api/v1/houses/:houseId/announcements`

Authentication: required (member) for `GET`; required + caller must hold
the `"Owner"` role for `POST`. `GET` response:
`{ "data": Announcement[] }` (not paginated), sorted `pinned desc, createdAt desc`.
`POST` body: `{ "title": string, "body": string, "pinned"?: boolean }`.
Response (both): `{ "id", "title", "body", "pinned", "authorId", "authorName", "createdAt", "updatedAt" }`.
Errors: `400 invalid_request`, `401 unauthenticated`, `403 forbidden` (not
an Owner, `POST` only).

### `PATCH`/`DELETE /api/v1/announcements/:announcementId`

Authentication: required, caller must hold the `"Owner"` role in the
announcement's house. `PATCH` body: any subset of
`{ "title": string, "body": string, "pinned": boolean }`. Response:
updated `Announcement`. `DELETE` response:
`{ "data": { "success": true } }`. Errors: `400 invalid_request`,
`401 unauthenticated`, `403 forbidden`, `404 announcement_not_found`.

## Google Drive (Implemented)

Implemented per ADR 0045 (`apps/web/src/server/drive/*`, supersedes ADR
0038's per-user design). One Google Drive connection per **house**,
authorized only by the Owner (OAuth, offline access) — Fylmico
automatically creates and maintains the whole folder structure inside it
(two roots: a visible "FYLMICO House" tree and an Owner-only "FYLMICO
House (Sensitive)" tree). See the Files section below for how uploads land
in the right folder automatically.

### `GET /api/v1/houses/:houseId/drive/connect-url`

Authentication: required, caller must hold the `"Owner"` role. Response:
`{ "data": { "url": string } }` — the Google OAuth consent URL to redirect
the browser to (`state` is a signed token binding the OAuth flow back to
the house and the connecting user). Errors: `401 unauthenticated`,
`403 forbidden` (not an Owner), `503 google_oauth_not_configured`.

### `GET /api/v1/drive/callback`

Authentication: public (Google redirects here with `code`/`state` query
params after consent) — stays a flat, unparameterized path since it's the
registered Google OAuth redirect URI; the house id travels inside the
signed `state` instead. Not a JSON endpoint — verifies `state`, exchanges
`code` for tokens, requires Google to have granted an offline refresh
token, creates the house's two root Drive folders, upserts the house's
`DriveConnection`, then builds the fixed folder skeleton (Clients,
Resources + subfolders, Portfolio + subfolders, Misc, the 6 Sensitive
folders) and an Employee Work folder for every existing house member.
302-redirects to `${APP_URL}/files?driveConnected=1` on success, or
`${APP_URL}/files?driveError=1` on any failure (missing `code`/`state`,
denied consent, no refresh token granted, exchange error).

### `GET /api/v1/houses/:houseId/drive/status`

Authentication: required (member). Response:
`{ "data": { "connected": boolean, "email": string | null } }`. Errors:
`401 unauthenticated`, `403 forbidden`.

### `DELETE /api/v1/houses/:houseId/drive/disconnect`

Authentication: required, caller must hold the `"Owner"` role. Deletes the
house's `DriveConnection` and every `FileEntry` row with a non-null
`driveKey` (wipes Fylmico's index of the managed folder tree; the actual
files/folders are untouched in Google Drive itself). Response:
`{ "data": { "success": true } }`. Errors: `401 unauthenticated`,
`403 forbidden`.

### `GET /api/v1/files/download/:token`

Authentication: public by design — the short-lived signed `token` (minted
only after a membership check inside `GET .../files/:entryId/download`
below) _is_ the credential, the same trust model a Supabase signed URL
used previously. Not a JSON success response — streams the file's bytes
from the house's connected Google Drive with `Content-Type`/
`Content-Disposition` headers set. Error responses are still JSON but use
a minimal `{ "error": { "code", "message" } }` envelope (no `requestId`):
`400 invalid_or_expired_token`, `404 file_not_found`,
`502 download_failed` (Drive download itself failed).

## Files (Implemented)

Implemented per ADR 0045 (`apps/web/src/server/files/*`, reworked from ADR
0038). A `FileEntry` is either a `"file"` or a `"folder"` in a house's
shared file tree; bytes live in the house's single connected Google
Drive. System-managed folders (Clients, a client's folder, a project and
its fixed subfolders, Resources/Portfolio subfolders, the Sensitive tree,
Employee Work folders) carry a non-null `driveKey` and can't be deleted
through the app.

### `GET`/`POST /api/v1/houses/:houseId/files`

Authentication: required (member for the visible tree; caller must hold
the `"Owner"` role when `sensitive=true`). `GET` query: `parentId?` (omit
for the tree's root), `sensitive?` (`"true"` switches to the Owner-only
Sensitive tree, default `false`). Response: `{ "data": FileEntry[] }` (not
paginated), sorted `type asc, name asc`:
`{ "id", "parentId", "name", "type", "size", "mimeType", "sensitive", "uploadedById", "uploadedByName", "createdAt", "updatedAt" }`
(`type` is `"file"` or `"folder"`; `size`/`mimeType` are `null` for
folders). `POST` body: `{ "name": string, "parentId"?: string }` — creates
an ad-hoc folder (inherits its parent's `sensitive` value). Response:
created `FileEntry` (`type: "folder"`). Errors: `400 invalid_request`,
`400 drive_not_connected` (`POST` only — house hasn't connected Google
Drive), `401 unauthenticated`, `403 forbidden` (not a member, or not an
Owner for the Sensitive tree), `404 file_not_found` (bad `parentId`).

### `POST /api/v1/houses/:houseId/files/resolve-destination`

Authentication: required (member). Body:
`{ "clientId": string (or "misc"), "projectId"?: string, "category"?: "raw" | "assets" | "deliverables" | "project-files" }`.
Resolves which folder an upload should land in — `"misc"` files flat under
Clients/Misc regardless of category; a project + `"raw"` lazily creates
today's dated Raw Data subfolder. Response: `{ "data": { "parentId": string } }`
(a `FileEntry` id, pass straight to the upload endpoint below). Errors:
`400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404` (unknown client/project - the underlying `FileEntry` lookup throws).

### `DELETE /api/v1/houses/:houseId/files/:entryId`

Authentication: required (member). Recursively deletes a file or folder
and its underlying Drive file(s). Refuses system-managed folders (non-null
`driveKey`). Response: `{ "data": { "success": true } }`. Errors:
`400 protected_folder`, `401 unauthenticated`, `403 forbidden`,
`404 file_not_found`.

### `GET /api/v1/houses/:houseId/files/:entryId/download`

Authentication: required (member). Response: `{ "data": { "url": string } }`
— a short-lived signed URL to `GET /api/v1/files/download/:token` (not the
file bytes directly). Errors: `400 invalid_request` (`entryId` is a
folder), `401 unauthenticated`, `403 forbidden`, `404 file_not_found`.

### `POST /api/v1/houses/:houseId/files/:entryId/add-to-portfolio`

Authentication: required (member). Body: `{ "category"?: string }`
(defaults `"Misc"` — one of Commercials/Reels/Films/Photography/Misc by
convention, not enforced). Creates a second `FileEntry` under the chosen
Portfolio category pointing at the same Drive file (no re-upload).
Response: the new `FileEntry` (`type: "file"`). Errors:
`400 invalid_request` (not a file), `401 unauthenticated`,
`403 forbidden`, `404 file_not_found`.

### `POST /api/v1/houses/:houseId/files/upload`

Authentication: required (member). Body: `multipart/form-data` with
`file` (required), `parentId?`, `conversationId?` (tags the upload as
belonging to a chat room, surfaced via `GET /api/v1/chat/rooms/:roomId/files`).
Uploads the file's bytes to the house's connected Google Drive, creates a
`FileEntry` row pointing at it, then best-effort mirrors it into the
uploader's Employee Work subfolder (Videos/Images/Documents by mime type)
under the Sensitive tree for management visibility. Response: created
`FileEntry` (`type: "file"`). Errors: `400 invalid_request` (missing
file), `400 drive_not_connected`, `401 unauthenticated`, `403 forbidden`,
`404 file_not_found` (bad `parentId`).

### `GET /api/v1/houses/:houseId/files/summary`

Authentication: required (member). Response:

```json
{
  "data": {
    "usedBytes": 104857600,
    "byCategory": [
      { "category": "video", "bytes": 94371840 },
      { "category": "document", "bytes": 10485760 }
    ],
    "recent": [
      {
        "id": "file_123",
        "name": "rough-cut-v3.mp4",
        "uploadedByName": "Mira Kapoor",
        "createdAt": "2026-07-14T10:00:00.000Z"
      }
    ]
  }
}
```

`byCategory` only lists `"video" | "audio" | "image" | "document" | "other"`
categories with at least one byte used; `recent` is the 5 most recently
uploaded files. Errors: `401 unauthenticated`, `403 forbidden`.

## Bookings (Implemented)

Implemented (`apps/web/src/server/bookings/*`). A `Booking` reserves a
`Resource` (a studio, piece of equipment, or venue — auto-created by name,
case-insensitively, the first time it's booked in a house) for a date/time
range, optionally tied to a `Project`.

### `GET`/`POST /api/v1/houses/:houseId/bookings`

Authentication: required (member). `GET` response: `{ "data": Booking[] }`
(not paginated), sorted `createdAt desc`. `POST` body:
`{ "resourceName": string, "resourceCategory"?: "studio" | "equipment" | "venue" (default "equipment"), "projectId"?: string, "startDate": string, "endDate": string, "startTime": string, "endTime": string, "status"?: "confirmed" | "pending" | "cancelled" (default "pending"), "notes"?: string }`.
Notifies the house's Owner(s) (`booking_created`). Response (both):

```json
{
  "id": "booking_123",
  "resourceId": "resource_456",
  "resourceName": "Studio A",
  "resourceCategory": "studio",
  "resourceSubtitle": null,
  "resourceTag": null,
  "projectId": "project_789",
  "projectName": "Cafe Noir Opening",
  "projectPhase": "Pre-Production",
  "startDate": "2026-07-17",
  "endDate": "2026-07-17",
  "startTime": "9:00 AM",
  "endTime": "5:00 PM",
  "status": "pending",
  "bookedById": "user_123",
  "bookedByName": "Aryan Sharma",
  "notes": null,
  "createdAt": "2026-07-14T10:00:00.000Z"
}
```

Errors: `400 invalid_request`, `401 unauthenticated`, `403 forbidden`,
`404 project_not_found`.

### `PATCH /api/v1/bookings/:bookingId`

Authentication: required, caller must hold the `"Owner"` role in the
booking's house. Body:
`{ "status": "confirmed" | "pending" | "cancelled" }`. Notifies the
original booker (`booking_status_changed`) unless they're the one making
the change, or the new status is `"pending"`. Response: updated `Booking`.
Errors: `400 invalid_request`, `401 unauthenticated`, `403 forbidden` (not
an Owner), `404 booking_not_found`.

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

### Implemented (chat)

`apps/web/src/server/realtime/broadcast.ts` pushes via Supabase Realtime's
broadcast REST endpoint (a plain server-side `POST`, no persistent
websocket held by the Next.js server itself) — silently a no-op if
`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` aren't configured, same
fallback pattern as the mailer/storage modules. Emitted by
`apps/web/src/server/chat/chat.service.ts`:

| Event             | Topic                         | Payload                                                                              | Emitted by                                          | Persistence                                                                                                                  |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `message:new`     | `conversation:<roomId>`       | full `Message` (same shape as `POST /api/v1/chat/rooms/:roomId/messages`'s response) | `sendMessage`                                       | The `Message` row is already committed before broadcasting; the event is a push notification of it, not the source of truth. |
| `message:new`     | `house:<organizationId>:chat` | `{ conversationId, messageId, authorId, body, sentAt }` (slimmer, house-wide)        | `sendMessage`                                       | Same as above — for cross-room unread badges without subscribing to every room.                                              |
| `reaction:update` | `conversation:<roomId>`       | full `Message` (updated `reactions`)                                                 | `toggleReaction`                                    | `MessageReaction` row already committed.                                                                                     |
| `message:edit`    | `conversation:<roomId>`       | full `Message` (updated `body`, `editedAt`)                                          | `editMessage` (`PATCH /api/v1/messages/:messageId`) | The `Message` row is already committed before broadcasting.                                                                  |
| `read`            | `conversation:<roomId>`       | `{ userId, lastReadAt }`                                                             | `markRead` (`POST /api/v1/chat/rooms/:roomId/read`) | `ConversationRead` row already committed.                                                                                    |

No client-side subscription code or permission check happens at the
broadcast layer itself — anyone who can derive/guess a topic name and has
a valid Supabase Realtime client could theoretically subscribe; the actual
authorization boundary is still the HTTP endpoints above (membership
checks happen there, before broadcasting).

### Client-to-client (ephemeral, no server round-trip)

These are sent directly browser-to-browser on the same
`conversation:<roomId>` channel via the Realtime client's own `.send()`,
bypassing `broadcast.ts`/the server entirely — inherently ephemeral, never
persisted, and simply unseen by anyone if no other client is connected to
the channel at that moment (the correct behavior for both):

| Event       | Payload                 | Sent by                                                                                          | Purpose                                                                                                                                                                                                                  |
| ----------- | ----------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `typing`    | `{ userId, name }`      | `notifyTyping()`, throttled to once per 2s while typing                                          | Renders "X is typing…"; the receiving client clears it after 3s of silence.                                                                                                                                              |
| `delivered` | `{ messageId, userId }` | Automatically, when a client's `message:new` handler receives a message authored by someone else | Lets the sender's client advance that message's own tick from `sent` to `delivered` without waiting for a full `read` — the "true delivered state" ADR 0044 scoped out is now covered this way, no schema change needed. |

Presence (`house:<organizationId>:presence`) is handled entirely
client-side and doesn't go through `broadcast.ts` at all: each connected
browser calls Supabase's native Presence `channel.track()`/
`.presenceState()` directly (`apps/web/src/lib/realtime/use-presence.ts`),
so online/offline is inherently ephemeral with no server round-trip. The
per-member `status` field returned by `POST /api/v1/houses`/
`GET /api/v1/workspace` is still just "is this the requesting caller" - a
static API value, not live - the Messages page overlays real presence on
top of that list client-side using this hook; other pages that render
member avatars don't.

## Deferred API Decisions

- Request ID implementation (the auth module's error envelope currently uses
  a per-response random UUID, not a request-scoped/traced one).
- ~~Rate limiting strategy.~~ Implemented per ADR 0043 (in-memory,
  per-process fixed-window counter — see the Authentication section
  above); no distributed/Redis-backed limiter yet.
- Public API strategy.
- API documentation generation.

Resolved: validation library — `class-validator` + `class-transformer` with
Nest's `ValidationPipe`, per ADR 0019.
