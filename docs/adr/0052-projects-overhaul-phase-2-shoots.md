# 0052: Projects Module Overhaul — Phase 2 (Shoots + Videographer Workflow HUD)

Date: 2026-07-16

Status: Accepted

## Problem

Phase 1 (ADR 0051) gave Projects real Clients, stats, and priority. The
overhaul's next requirement is a genuinely new entity: a scheduled
production day ("Shoot") with a 9-state status workflow, plus a
"videographer HUD" so the crew member assigned to a shoot can drive that
workflow from their Home Focus Card exactly like they already drive
editing tasks.

## Decision

- **New `Shoot` model** (`organizationId`, `projectId`, `calendarEventId?`,
  `name`, `scheduledDate`, `callTime?`, `location?`, `equipment: String[]`,
  `notes?`, `status`, `cancelReason?`, `cancelNotes?`, `reachedAt?`,
  `startedAt?`, `finishedAt?`, `uploadedAt?`, `cancelledAt?`,
  `createdById`). `status` is a validated free string (9 values:
  `scheduled | crew-reached | started | finished | uploading | uploaded |
ready-for-editing | archived | cancelled`), matching this codebase's
  existing convention of no DB enums for workflow vocabularies (Task
  status/type/priority all work the same way).
- **`Task.shootId`** links a `Task` to its `Shoot` (nullable FK, mirrors
  the existing `Task.shootDayEventId` → `CalendarEvent` pattern). Creating
  a Shoot creates a `CalendarEvent` (`category: "shoot"`) and a `Task`
  (`type: "shoot"`, already a valid type since ADR 0047) in the same
  transaction, with the crew as `TaskAssignee` rows - no separate crew
  join table, reusing the existing assignment mechanism.
- **`FocusTaskCard` gains a shoot-mode branch**: when the current focus
  task has `shootId` set, the card fetches the `Shoot` and renders
  Location (as a Google Maps link), Call Time, Equipment, Crew, and
  Notes, plus status-specific action buttons (Reached Location / Start
  Shoot / Pause-Resume + Finish + Finish & Upload / Mark Data Uploaded /
  Mark Ready For Editing / Archive Shoot / Cancel) instead of the
  generic "Start Editing" button - same card shell, same
  `startTaskTimer`/`stopTaskTimer` machinery already built for editing
  tasks.
- **Cancel requires a reason** (dialog with required reason + optional
  notes, `ShootCancelDialog`) and stores `cancelReason`/`cancelNotes`/
  `cancelledAt` - matches the spec's explicit requirement.
- **Dedicated action endpoints per transition** (`/shoots/:id/reached`,
  `/start`, `/finish`, `/finish-upload`, `/mark-uploaded`,
  `/ready-for-editing`, `/archive`, `/cancel`), not a generic `PATCH
status` - matches this codebase's established precedent (`archive`
  endpoints on Project/Client) for status-transition actions that also
  need to stamp a specific timestamp column.
- **New Shoots tab + "Schedule Shoot" dialog on the project detail
  page** - lists a project's shoots and lets any house member schedule
  one (name, date, call time, location, equipment, crew via the existing
  `TaskAssigneePicker`, notes).
- **"Finish + Upload" only transitions status to `uploading`** in this
  phase - it does not yet perform a real multi-file upload or
  auto-attach footage to a follow-on editing task. That is explicitly
  Phase 3's job ("Upload Automation + Editing Auto-Attach" per the
  approved plan); Phase 2's scope is the entity and the crew-facing
  status workflow, not the upload pipeline. A manual "Mark Data
  Uploaded" button closes the loop for now.

## Alternatives

- **Reusing `Board`/`Shot` (ADR 0041 storyboard models) as the Shoot
  entity.** Rejected during the original research pass - those are
  frame-level visual references, not a scheduled production day with
  crew/timestamps/a status workflow. Genuinely different data.
- **A separate `ShootCrew` join table.** Rejected - `Task.assignees`
  (via `TaskAssignee`) already is the crew list once the Shoot's linked
  Task exists; a second join table would just duplicate it.
- **One generic `PATCH /shoots/:id` for all status transitions.**
  Rejected - several transitions need to stamp a specific timestamp
  column (`reachedAt`, `startedAt`, ...) atomically with the status
  change; dedicated endpoints keep each transition's side effects
  explicit and match the `archive`-endpoint precedent already in the
  codebase.

## Tradeoffs

Benefits:

- The videographer HUD needed zero new timer infrastructure - it
  reuses `TaskTimeEntry`/`startTaskTimer`/`stopTaskTimer` exactly as the
  editing-task Focus Card already does.
- `Task.type: "shoot"` already existed (ADR 0047) with `equipment`/
  `location`/`callTime` columns ready to use - no schema surprises there.

Costs:

- "Finish + Upload" is a two-click illusion in this phase (button sets
  `uploading`, a second button sets `uploaded`) rather than an actual
  upload - acceptable since Phase 3 is scoped specifically to build the
  real upload/auto-attach pipeline; documented here so it isn't mistaken
  for a bug.
- No calendar-event cleanup on Shoot deletion - Shoots have no delete
  endpoint yet (only `archive`/`cancel`), so this wasn't needed this
  phase.

## Future Implications

Phase 3 (Upload Automation + Editing Auto-Attach) hooks into the
`uploading` → `uploaded` transition to perform a real multi-file upload
into a per-shoot Drive folder and auto-create/attach a follow-on editing
`Task`. Phase 5's per-project Timeline will include Shoot status
transitions as timeline entries.
