# 0024: Comments Module

Date: 2026-07-08

Status: Accepted

## Problem

`docs/database.md` has flagged "comment target modeling strategy" as an
explicitly deferred decision since ADR 0022. A `comment` is supposed to
"belong to a target such as an asset version, task, or project discussion"
(its Initial Relationship Model), but no polymorphic association design
existed, and there was nothing but tasks to comment on anyway. Now that
`projects` (ADR 0022) and `tasks` (ADR 0021) both exist, this pass resolves
that deferred decision and implements comments on both.

## Decision

Add a `comments` table with a polymorphic `commentableType`/`commentableId`
pair, and nested create/list endpoints per resource type:
`POST`/`GET /api/v1/tasks/:taskId/comments`,
`POST`/`GET /api/v1/projects/:projectId/comments`.

Specific decisions:

- **Type+id pair, not a join table per commentable type.** Simpler than a
  table-per-relationship, and adding a new commentable type later
  (`asset_version`) is a new string value plus a thin controller/service
  method pair, not a schema migration.
- **`organizationId` denormalized onto `Comment`** (matching `Task`/
  `Message`'s existing pattern) so membership checks don't need an extra
  join to find which house a comment's target belongs to.
- **Nested routes, not a generic `/api/v1/comments`.** Matches the existing
  convention of nesting under the parent resource.
- **Create + list only** — no edit/delete, matching the same minimal-first-
  slice choice already made for chat messages.
- **Chronological ordering** (`createdAt asc`) — a thread reads top-to-
  bottom, unlike notifications' newest-first list.
- **No dependency on `TasksService`/`ProjectsService`.** `CommentsService`
  queries `task`/`project` directly via Prisma to resolve the target's
  `organizationId` — the same pattern `ProjectsService.linkClient` already
  uses to check a `Client` without depending on `ClientsService`.

## Alternatives

- A single generic `POST /api/v1/comments` with `{ commentableType,
commentableId, body }` in the body. Rejected: every other resource in
  this API nests under its parent path when the parent context matters for
  authorization (ADR 0010); a flat endpoint would be the odd one out.
- A join table per commentable type (`task_comments`, `project_comments`).
  Rejected: doubles the schema/migration cost for every new commentable
  type, for no benefit over a type+id pair at this scale.

## Tradeoffs

Benefits:

- Resolves a two-ADR-old deferred decision with a design that scales to
  future commentable types without new tables.
- Matches the nested-route convention consistently.

Costs:

- No database-level foreign-key integrity on `commentableId` (it can point
  to a task or a project depending on `commentableType`, so no single FK
  constraint covers it) — validity is enforced at the service layer only
  (the 404 checks before creating/listing).
- No edit/delete yet.

## Future Implications

- Adding `asset_version` (or any future type) as a commentable target is a
  new `commentableType` value plus a new thin controller, not a migration.
- Edit/delete, @mentions, and realtime delivery are natural next additions
  once needed.
