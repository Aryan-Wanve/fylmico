# 0049: Dashboard Phase 2 (Favorites/Pins/Archive) and Tasks Phase 2 (Templates/Calendar/Analytics)

Date: 2026-07-16

Status: Accepted

## Problem

Two prior features shipped with an explicit Phase 2 deferred list: the
House Dashboard/onboarding redesign ([[0048]] — favorites, pins,
drag-reorder, archive, search, storage/activity badges, cross-house
notification deep-linking, per-house last-page memory) and the Tasks
production-workflow rebuild (0047 — Calendar integration, task
templates, productivity analytics, keyboard shortcuts, among others).
The user asked to complete both phases in one pass.

Given the combined scope, Custom Fields, Pomodoro Mode, Gantt/Timeline
view, and an advanced/saved filter builder were judged genuinely
open-ended and skipped (see Explicitly Skipped below); proactive
push/scheduled due-date notifications are a hard platform constraint,
not a scope choice — there is no scheduled-job infrastructure in this
app's Hostinger deployment (ADR 0042). Everything else from both lists
was implemented.

## Decision

### Dashboard Phase 2

- **Favorite/Pin/Archive reuse the existing membership row** —
  `OrganizationMembership` gains three nullable `DateTime` columns
  (`favoritedAt`, `pinnedAt`, `archivedAt`) plus an `order Int` for
  drag-reorder, rather than new join tables. A single private
  `toggleMembershipFlag(organizationId, userId, field)` flips each
  column null↔`now()`; `toggleFavorite`/`togglePin`/`toggleArchive` are
  thin wrappers. Sort order (`compareHouses`: pinned > favorite > order
  > name) is applied once in `getHousesForUser`/`getHouseDto`.
- **Storage/activity badges are batched aggregates, not N+1 queries** —
  `getStorageAndActivity(organizationIds)` runs one `fileEntry.groupBy`
  (sum of size) and one `task.groupBy` (max updatedAt) per call, merged
  into the House DTO. Existing `formatFileSize`/`formatRelativeTime`
  utilities render them — no new formatters.
- **Search and drag-reorder are client-only** — search filters the
  already-loaded house list by name/handle; reorder uses native HTML5
  drag-and-drop (`draggable`/`onDragStart`/`onDragOver`/`onDrop`),
  matching the no-library pattern already used by the Kanban board, and
  posts the new order to `POST /api/v1/houses/reorder`.
- **Cross-house notifications deep-link via a new nullable
  `Notification.organizationId`** (`onDelete: SetNull`). Clicking a
  notification whose house differs from the active one calls
  `activateHouse` first, then routes through a plain
  `Record<string, string>` map (`TYPE_DESTINATION`) — not a routing
  framework, just a lookup table next to the existing mark-read logic.
  All 13 `notificationsService.create(...)` call sites across
  announcements/bookings/comments/organizations/tasks were updated to
  pass the relevant `organizationId`.
- **Per-house last-page memory is `localStorage`, not server state** —
  `house-last-page.ts` exports `getLastPage`/`setLastPage` keyed by
  house id, written on every route change while a house is active (an
  effect in `app-shell-gate.tsx`) and read by the Dashboard's
  "Enter House" action instead of always routing to `/home`.

### Tasks Phase 2

- **Calendar integration reuses already-loaded task data** —
  `workspace.tasks` (already fetched client-side for the Tasks page) is
  mapped to calendar events via `toTaskCalendarEvent` and merged into
  the existing event list under a new `Task Deadlines` calendar source,
  rather than a new API call.
- **Templates reuse the `Task` model with a boolean flag** —
  `Task.isTemplate` (default `false`), not a new Template model/table.
  `duplicateTask`'s existing clone logic was refactored into a shared
  private `cloneTask` helper, reused by `duplicateTask`, `saveAsTemplate`
  (clones a task, marks the copy `isTemplate: true`), and
  `createFromTemplate` (clones a template, marks the copy `false` and
  logs a `created` activity entry). All task-listing queries
  (`getTasksForOrganization`, and the analytics queries below) filter
  `isTemplate: false` so templates never appear as real work.
- **Keyboard shortcut (`n` → open Create Task) is a single
  `window.addEventListener("keydown", ...)` effect** in `tasks-page.tsx`
  guarded against firing while typing in an input/textarea/
  contenteditable — no shortcut library.
- **Estimate-vs-actual analytics adds one query** —
  `taskTimeEntry.findMany` (selecting `durationMinutes`) summed against
  the existing `estimatedMinutes` field on `Task`, rendered as two
  progress bars in a new `TaskEstimatePanel`.
- **Fixed a pre-existing analytics bug found while doing this work**:
  `analytics.service.ts`'s `TASK_STATUS_DISPLAY` map and the
  `tasksCompleted` filter still used the old 4-status vocabulary
  (`done`/`in-progress`/`todo`/`on-hold`) from before this session's
  earlier Task rework (0047), which introduced a 6-status vocabulary
  (`todo`/`in-progress`/`review`/`changes-requested`/`completed`/
  `archived`). This meant `tasksCompleted` was silently always `0` in
  production, since no task can have `status === "done"` anymore. Fixed
  to match the current vocabulary as part of this pass since it directly
  touched the same file.

## Explicitly Skipped

- **Custom Fields** — open-ended schema design (arbitrary field types
  per house/project) with no spec beyond the name; needs its own
  scoping pass.
- **Pomodoro Mode** — a focus-timer UI with no persistence/analytics tie
  specified; deferred pending a decision on whether it needs to record
  sessions anywhere.
- **Gantt/Timeline view** — a materially different rendering engine
  (dependency-aware date-range bars) from the existing List/Board/Table
  views; large enough to warrant its own phase.
- **Advanced/saved filter builder** — today's filter popover is a fixed
  set of dropdowns; a saved/composable filter builder is a distinct
  feature (persistence model, UI for building boolean conditions) not
  bundled into this pass.
- **Proactive due/overdue push notifications** — not a scope choice: this
  app has no scheduled-job/cron infrastructure in its Hostinger
  deployment (ADR 0042). Would need either an external cron trigger or a
  polling mechanism client-side; out of scope until that constraint
  changes.

## Alternatives

- **A dedicated `Favorite`/`Pin` join table** instead of columns on
  `OrganizationMembership`. Rejected — favorite/pin/archive are
  inherently one-per-membership flags, not many-to-many relations; extra
  columns on the row that already represents "this user in this house"
  is simpler and needs no joins.
- **A separate `TaskTemplate` model.** Rejected — a template is
  structurally identical to a task (same fields, same assignee/checklist
  shape); a boolean flag with a shared clone helper avoids duplicating
  the entire `Task` schema and its DTOs.
- **A new notifications aggregation feed/inbox page.** Rejected as
  unnecessary — the existing notification bell dropdown already lists
  all notifications across houses; the only gap was that clicking one
  from a non-active house did nothing useful, which the
  `organizationId` + `TYPE_DESTINATION` deep-link fixes directly.

## Tradeoffs

Benefits:

- Every Dashboard Phase 2 feature reuses an existing model, field, or
  already-loaded client data set — no new tables beyond four columns and
  one nullable foreign key.
- Task templates share 100% of the validation, assignee, and checklist
  logic real tasks already have, since they're the same model.
- The stale-status analytics bug is fixed as a side effect of touching
  the same file for the new estimate-vs-actual panel, rather than
  lingering until a future pass.

Costs:

- `TYPE_DESTINATION` is a flat lookup table; a notification type added
  in the future without a corresponding entry silently falls back to
  `/home` rather than erroring — acceptable since it fails safe, but
  worth remembering when adding new notification types.
- Per-house last-page memory is `localStorage`-only (not synced across
  devices/browsers) — acceptable given this is a convenience feature,
  not correctness-critical state.

## Future Implications

- Custom Fields, Pomodoro Mode, Gantt/Timeline, and the advanced filter
  builder remain open for a future phase, each likely warranting its own
  ADR given their independent scope.
- Proactive notifications are blocked on this app gaining any scheduled-
  job capability — revisit if the Hostinger deployment constraint
  changes (see ADR 0042).
- The permission-system retrofit deferred in [[0048]] (17 of 18
  permissions stored but not yet enforced outside `approve_members`)
  is still outstanding and unaffected by this pass.
