# 0026: Tasks Page Extension

Date: 2026-07-10

Status: Accepted

## Problem

Wiring the frontend's remaining local-mock pages (Tasks, Projects, Messages,
and others) to the real backend surfaced a mismatch this pass resolves for
Tasks specifically: `apps/web/src/components/tasks/task-data.ts` (the
standalone `/tasks` page) used a `status: "todo" | "in-progress" | "on-hold" | "done"`
vocabulary, while `apps/web/src/types/base.ts`'s `ProductionTask` (used by
the dashboard's "My Tasks"/"Upcoming Deadlines" panels, already wired to
real data since ADR 0025) used `"scheduled" | "in-progress" | "review" | "done"`

- and the actual `Task.status` column defaulted to `"scheduled"`, matching
  neither page's UI labels ("To Do", "On Hold") cleanly. The standalone Tasks
  page also had no way to update or delete a task server-side (only
  `POST /api/v1/tasks` existed), and its `CreateTaskDto` required a `role`
  field the UI never actually collected from the user.

## Decision

- **Unify on one status vocabulary**: `todo | in-progress | on-hold | done`,
  matching the standalone Tasks page's UI (the richer, purpose-built surface)
  rather than the dashboard panel's incidental `ProductionTask` shape. The
  dashboard's `TaskRow`/`MyTasksPanel` never actually branched on `status`
  values (completion is tracked as a separate local `completedTaskIds` set),
  so retargeting the vocabulary there was a type-only change with no
  behavioral risk. `Task.status`'s DB default moves from `"scheduled"` to
  `"todo"`, with a data migration backfilling existing rows
  (`scheduled -> todo`, `review -> in-progress`).
- **Auto-derive `role` from the assignee's current house role** instead of
  requiring it as a client-supplied field. The Tasks page's create/duplicate
  flows never had a role picker - `role` was previously a required
  `CreateTaskDto` field that nothing in the UI populated correctly. Removing
  it and deriving `task.role = assigneeMembership.role.name` at both create
  and reassign time keeps the stored value meaningful (matches who's
  actually assigned) without adding a form field nobody asked for.
- **Add `PATCH /api/v1/tasks/:taskId` and `DELETE /api/v1/tasks/:taskId`**,
  mirroring the update/archive pattern already established for projects
  (ADR 0022). Reassigning `assigneeId` via `PATCH` re-derives `role` and
  fires the same `task_assigned` notification `POST` already does.
- **No pagination or dedicated list endpoint.** The Tasks page loads
  `workspace.tasks` from the existing `GET /workspace` snapshot (unpaginated,
  same as before) and calls `refreshWorkspace()` after every
  create/update/delete instead of maintaining separate local state - this
  was already the established pattern for houses/chat, and the Tasks page's
  UI has no pagination controls to begin with (client-side grouping/
  filtering over the full list). Adding a second, paginated task-list
  endpoint would duplicate data-fetching without a UI that needs it.
- **`commentCount` added as an optional field, `attachmentCount` dropped
  entirely.** `commentCount` has no backing computation yet (would need an
  aggregate query against the polymorphic `comments` table) and always
  reads `undefined` for now - kept as a field so `TaskRowItem` doesn't need
  another type fork once that aggregate exists. `attachmentCount` had no
  backend concept to source it from at all (no file/attachment system
  exists - that's the separate, not-yet-built `/files` page's domain) and
  was removed from the UI rather than faked.
- **`project` stays a freeform string, not a `Project` foreign key.** Tasks
  can be created ad hoc with a typed project label; requiring a real
  `Project` row first would be a bigger UX change (a project picker) than
  this pass's scope. Documented as a deferred decision in `docs/database.md`.

## Alternatives

- Keep the dashboard's `scheduled/review` vocabulary and retrofit the
  standalone Tasks page to match it instead. Rejected: the Tasks page is
  the purpose-built, fully-designed surface for this domain; its vocabulary
  reads better in the UI ("On Hold" vs "Review" means something different)
  and was already the target the backend's original DEFAULT_ROLES-adjacent
  build was informally aiming for.
- Thread `role` through the create form as a real picker. Rejected for this
  pass: scope creep beyond "wire the existing UI to real data" - the
  existing form is a single `window.prompt()` for the title; adding a role
  selector means redesigning task creation, not just wiring it up.
- Build a paginated `GET /houses/:houseId/tasks` endpoint now, anticipating
  future scale. Rejected per YAGNI - the UI has no pagination affordance and
  the workspace snapshot already returns the full list; add it when a page
  actually needs partial loading.

## Tradeoffs

Benefits:

- The standalone Tasks page is now fully real: create, status toggle
  (via the row checkbox), duplicate, and delete all round-trip through the
  real API and are reflected instantly via `refreshWorkspace()` - verified
  live in-browser for all four operations.
- One task status vocabulary everywhere (backend, dashboard, Tasks page)
  instead of two silently-incompatible ones.
- `role` is no longer a foot-gun field a caller could get wrong or that the
  UI silently never sent correctly.

Costs:

- `commentCount` is present in the type but never populated - a
  half-finished field until the comments aggregate is built. Flagged
  explicitly rather than silently faked.
- The status-vocabulary migration is a live backfill (`UPDATE ... WHERE
status = 'scheduled'`), not just a default change - anyone with existing
  seeded/tested data got their task statuses silently remapped. Acceptable
  for a pre-launch dev database; would need a more careful rollout plan
  (dual-read, gradual cutover) against real user data.

## Future Implications

- The same "extend backend to match UI" pattern applies to Projects
  (needs `genre`/`type`/`stage`/`progress`/cover-art fields) and Messages
  (needs attachments/embedded channel widgets) - both materially bigger
  schema extensions than this pass, tracked as separate future work.
- `commentCount` should be computed once task comments (ADR 0024's
  `commentableType: "task"`) are aggregated per task - likely a `groupBy`
  query alongside the existing task list query in `TasksService`.
- Linking `Task.project` to a real `Project` row is worth revisiting once
  task creation gets a project picker instead of free text.
