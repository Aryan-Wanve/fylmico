# 0023: Notifications Module

Date: 2026-07-08

Status: Accepted

## Problem

`docs/database.md`'s Collaboration group plans a `notifications` table, and
ADR 0005 plans an eventual `user:{userId}:notifications` Socket.IO room for
live delivery. No realtime transport exists yet — every module built so far
(chat messages, task creation) is REST/poll-based, not realtime-delivered.
Building notifications with no realtime layer to plug into risks either an
inert, never-populated table, or premature realtime infrastructure this
project doesn't need yet.

## Decision

Implement the REST half only (matching ADR 0021's precedent of shipping
chat messages before realtime delivery): create notifications server-side,
list them, mark them read. Rather than an inert table, wire creation into
two existing flows with an obvious recipient:

- **Task assignment** (`TasksService.createTask`) notifies the assignee,
  unless they assigned it to themselves.
- **House join** (`OrganizationsService.joinHouse`) notifies the house's
  `"Owner"` member(s).

No public "create notification" endpoint exists — creation is always
server-triggered, matching how nothing else in this API lets a client
fabricate another user's data.

Specific decisions:

- **`NotificationsModule` has no dependency on `OrganizationsModule`.**
  Listing/reading/marking notifications is scoped to `req.user` only, not a
  house, so it only needs `AuthModule`. `OrganizationsModule` and
  `TasksModule` import `NotificationsModule` (one-directional), keeping the
  module graph acyclic like every other cross-module dependency so far.
- **Flat, non-polymorphic shape**: `type`, `title`, `body`, `readAt` — no
  generic "related entity" reference. Same reasoning `docs/database.md`
  already gives for deferring `comments`' "target modeling strategy":
  nothing yet needs to deep-link a notification back to its source record,
  just show a message.
- **Newest-first ordering** (`createdAt desc`) — the one difference from
  the projects/clients list endpoints (`asc`); otherwise reuses
  `apps/api/src/common/pagination.ts` unchanged.
- **`POST /api/v1/notifications/read-all` is idempotent**, like
  `logout-all` — succeeds whether or not anything was unread.

## Alternatives

- Build Socket.IO delivery now so notifications actually arrive live.
  Rejected: no realtime infrastructure exists anywhere in this backend yet;
  adding it just for this one feature would be solving a bigger problem
  (ADR 0005) than this pass needs to.
- Add a polymorphic `relatedType`/`relatedId` pair now for deep-linking.
  Rejected for the same reason `comments`' target modeling is deferred —
  no consumer needs it yet, and guessing the shape risks a rework later.
- Trigger notifications from more flows (chat messages, project changes).
  Rejected for this pass — two well-defined, high-signal triggers are
  enough to prove the feature works end to end without guessing at every
  flow's notification-worthiness.

## Tradeoffs

Benefits:

- Gives the frontend something real to build a notification bell against.
- Proves the notification data model against two real triggers rather than
  shipping an empty, never-populated table.
- Keeps the module graph simple (one-directional imports only).

Costs:

- No realtime delivery — a client must poll `GET /api/v1/notifications` to
  see new ones.
- Only two triggers exist; most house/task/chat activity doesn't notify
  anyone yet.
- No per-notification-type preferences or muting.

## Future Implications

- When Socket.IO (ADR 0005) is implemented, `NotificationsService.create`
  is the natural place to also emit into the `user:{userId}:notifications`
  room — the REST/DB path doesn't need to change.
- More triggers (chat mentions, project archived, client linked) should be
  added incrementally as each becomes a real product need, following the
  same "call `notificationsService.create` after the mutation" pattern.
- A polymorphic target reference should be reconsidered together with
  `comments`' target modeling, if/when either needs deep-linking.
