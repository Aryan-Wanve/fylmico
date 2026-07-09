# 0021: Tasks + Chat Module

Date: 2026-07-08

Status: Accepted

## Problem

`GET /api/v1/workspace` (ADR 0020) returned `tasks: []` and `chatRooms: []`
as honest stubs — no tasks/chat domain existed. `POST /api/v1/tasks` and
`POST /api/v1/chat/rooms/:roomId/messages` were already documented in
`docs/api.md` and implemented against the mock service
(`apps/web/src/services/base-workspace.service.ts`), but not the real
backend.

## Decision

Implement `tasks`, `conversations`, and `messages` — the simpler shape the
product needs right now: single-assignee tasks and house-wide named
channels every member can see. `docs/database.md`'s Collaboration group
envisions a richer model (`task_assignees` many-to-many,
`conversation_members` for explicit per-conversation membership, enabling
private/DM threads later) — deliberately not built yet, deferred the same
way ADR 0020 deferred `permissions`/`role_permissions`: no concrete need for
multi-assignee tasks or private conversations exists yet.

Specific decisions:

- **Chat message endpoint returns the full room, not just the new
  message.** `docs/api.md`'s written example showed the response as a bare
  `Message`, but the mock's actual signature
  (`sendChatMessage(...): Promise<ChatRoom>`) returns the whole room. Same
  kind of doc-vs-mock mismatch ADR 0020 found with login's response shape —
  resolved the same way: follow the mock's real contract, fix the doc.
- **`POST /api/v1/tasks` requires `houseId`**, per `docs/api.md`'s already-
  documented body, even though the mock's local `CreateTaskRequest` type
  doesn't have one (the mock always operates on an implicit "active house").
  Not changing the frontend type/mock for this — `apps/web` isn't calling
  the real API yet.
- **Default conversations seeded at house creation** —
  `"general"`/`"edit-bay"`/`"shoot-floor"`, matching the mock's
  `defaultChatRooms` names/topics, added directly to
  `OrganizationsService.createHouse`'s existing nested-create (alongside
  the 5 default roles) rather than giving `ChatModule` a reason to depend
  on `OrganizationsModule` circularly. Seeded rooms start empty — the
  mock's canned demo messages belong to fictional users that don't exist in
  the real database, so they aren't replicated, matching the "no fake data"
  principle the empty `tasks`/`chatRooms` stubs already established.
- **No task-status-update or room-creation endpoints** — neither is
  documented yet. Task completion/status changes and custom room creation
  remain deferred.
- **`unreadCount` stays `0`.** Read-tracking is a real feature (or a
  realtime-adjacent one, ADR 0005), not something to fake here.
- **Membership is the only enforcement gate.** A new
  `OrganizationsService.requireMembership(organizationId, userId)` helper
  (403 `forbidden` if not a member) is reused by both new services — no
  finer-grained role check (e.g. "only Producer can create tasks"),
  consistent with ADR 0020 deferring granular RBAC.
- **`role` on `Task` and `Message`'s relation to `User` stay simple**:
  `Task.role` is a plain string validated against the house's `Role.name`
  values at the service layer (not a DB foreign key — a task shouldn't
  vanish if a role is ever renamed), and `project` stays a plain string
  since there's no `projects` module yet.

## Alternatives

- Build the full `task_assignees`/`conversation_members` join-table model
  now. Rejected: no multi-assignee task or private/DM conversation feature
  exists to justify it; the simpler shape matches every real requirement
  today.
- Have `POST /api/v1/chat/...` return just the new message, matching
  `docs/api.md`'s stale example instead of the mock's actual type. Rejected
  for the same reason ADR 0020 fixed the login-response mismatch: the
  mock's TypeScript signature is the real contract a frontend integration
  would need to satisfy.
- Enforce role-based restrictions on who can create tasks/send messages
  (e.g. only Owner/Producer). Rejected: not specified anywhere concretely
  yet, and ADR 0020 already established that granular RBAC waits for a
  concrete need.

## Tradeoffs

Benefits:

- Completes the workspace snapshot's last two stubbed fields.
- Matches the mock's actual contracts (including fixing the one doc/mock
  mismatch found), so a future real frontend integration has nothing to
  reconcile.
- Reuses `requireMembership` cleanly across two new services without a
  circular module dependency.

Costs:

- No task completion/status-update flow yet — tasks are effectively
  create-only from the API's perspective.
- No private conversations / per-room membership — every house member can
  see every room, which won't scale to sensitive DMs later without adding
  `conversation_members`.
- No multi-assignee tasks.

## Future Implications

- Multi-assignee tasks and private/DM conversations should introduce
  `task_assignees`/`conversation_members` when a real feature needs them,
  rather than retrofitting speculative schema now.
- Task status/completion updates (`PATCH /api/v1/tasks/:id`) and custom
  room creation are natural next additions once needed — matches the old
  roadmap's "persist task completion state" note that predates this ADR.
- Realtime delivery (ADR 0005) should eventually replace polling
  `GET /api/v1/workspace` for new messages/tasks, and should implement real
  `unreadCount` tracking.
