# 0047: Tasks Production Workflow (Phase 1)

Date: 2026-07-15

Status: Accepted

## Problem

Tasks was a to-do list, not a production tool: a single `assigneeId`, a
freeform `project` string with no real link, a plain-string `dueDate`, 4
statuses, 3 priorities, no subtasks/checklists/dependencies/attachments/
time-tracking/activity history, and creation was a single
`window.prompt()`. The ask was a Notion/Linear/ClickUp-caliber production
workflow tailored to filmmaking teams. That scope is too large for one
pass, so this is explicitly **Phase 1** of a phased rebuild (user
confirmed phasing): rich creation, multi-assign, subtasks/checklists/
dependencies, a full task detail panel, Drive-backed attachments, and
List/Kanban/Table/My-Tasks views with bulk edit and expanded filters.

## Decision

- **`Task` reworked**: dropped `assigneeId`/`role`/freeform `project`;
  added `description`, `type` (20-value vocab, validated in DTO only),
  `status` (todo/in-progress/review/changes-requested/completed/
  archived), `priority` (+`urgent`), `dueDate`/`startDate` as real
  `DateTime`, `estimatedMinutes`, `recurrenceRule`/`recurrenceEndDate`,
  `createdById` ("assigned by"), real FKs to `Project`/`Board`/`Script`/
  `CalendarEvent` (shoot day), `parentTaskId` (subtasks, self-relation),
  `equipment`/`deliverables`/`tags` as `String[]`, `location`/`callTime`,
  `progress`. "Linked Client" is derived from `task.project.clients` at
  read time, not a redundant direct column.
- **Five new models**, each covering one concern with no cross-table
  duplication: `TaskAssignee` (multi-assign + `responsibility` text,
  replaces single `assigneeId`), `TaskChecklistItem`, `TaskDependency`
  (blocking/blocked pair), `TaskActivity` (one append-only log powers
  activity timeline, status/assignment/due-date history together instead
  of four separate tables), `TaskTimeEntry` (`endedAt: null` = running
  timer; backs manual work-log and estimate-vs-actual).
- **`FileEntry` gained nullable `taskId`** (mirrors the existing
  `conversationId` pattern) - one mechanism covers both direct task
  uploads and linking an existing Drive file without moving it out of its
  folder.
- **`Comment` (existing, polymorphic) reused as-is** for task comments -
  no schema change. `@Name` mentions are regex-parsed from `body` against
  house member names at write time, not stored as a structured entity.
- **No rich-text editor library added.** Description uses a hand-rolled
  markdown-lite scheme (`**bold**`, `*italic*`, `- list`, `[text](url)`)
  with a toolbar that wraps the textarea selection at the cursor - the
  same insert-at-cursor pattern Scripts' formatting toolbar already
  established - plus a small hand-rolled `renderMarkdownLite()` renderer.
  No tiptap/slate/lexical/quill dependency.
- **No drag-and-drop library added.** The pre-existing Kanban board
  already used raw HTML5 `draggable`/`onDragStart`/`onDragOver`/`onDrop`;
  extended to 6 columns instead of 4.
- **Recurring tasks via synchronous auto-creation**: the next occurrence
  is created inline the moment a recurring task is marked completed
  (`tasks.service.ts#createNextRecurrence`), not a scheduled job -
  consistent with this app having no background-worker infrastructure
  (ADR 0042, Hostinger deployment).
- **Status/data migration**: existing `done` → `completed`; existing
  `on-hold` → `todo` (no `on-hold` in the new 6-status vocab).
  `assigneeId`/`role` backfilled into `TaskAssignee` before being
  dropped; freeform `project` string dropped (dev data only).
- **Detail panel is a slide-over `Dialog`, not a new route** - matches
  this app's existing modal-heavy patterns and avoids a full page nav for
  something opened constantly.

## Alternatives

- **A relational mention/notification entity** instead of regex-matching
  `@Name` against member names at comment-write time. Rejected: no
  stored mention entity is needed since notifications are fire-and-forget
  at write time; revisit only if mentions need to be editable/removable
  after the fact.
- **A per-concern history table** (separate status-history,
  assignment-history, due-date-history tables). Rejected in favor of one
  `TaskActivity` log with a `type` discriminator - explicit
  complexity-reduction call given the "minimize complexity" ask.
- **Grouping the List view by every assignee on a multi-assigned task**
  (one task appearing in multiple assignee groups). Rejected in favor of
  grouping by the task's first/primary assignee - keeps one row per task
  instead of duplicating rows across groups.

## Tradeoffs

Benefits:

- Multi-assignee with responsibilities, dependencies, checklists,
  subtasks, time tracking, and a merged activity/comment timeline are all
  in place without adding a single new npm dependency.
- The append-only `TaskActivity` log and the reused polymorphic `Comment`
  model mean adding "history" or "discussion" to any other domain object
  later can follow the exact same pattern.

Costs:

- Editing a task's linked project/board/script/shoot-day after creation
  isn't exposed in the detail panel (only at creation time) - deferred,
  not blocking for Phase 1.
- Equipment/location/call-time/deliverables/tags are read-only in the
  detail panel and only editable at creation - same rationale, revisit if
  users need to change production fields mid-task regularly.
- Grouping by assignee only reflects the first assignee on a
  multi-assigned task - acceptable for now, would need an explicit
  "show once per assignee" toggle if teams rely heavily on multi-assign.

## Future Implications (explicitly deferred phases)

- Calendar view, Timeline/Gantt view, task templates, custom fields,
  Pomodoro mode, daily/weekly productivity analytics, keyboard shortcuts,
  and a saved/advanced filter builder.
- Proactive due-soon/overdue push notifications - needs a scheduled job
  this app's Hostinger deployment has no infra for (ADR 0042); today,
  due/overdue state is only computed on-demand as UI indicator badges.
- Editing linked project/board/script/shoot-day and production fields
  (equipment/location/call-time/deliverables) after task creation.
