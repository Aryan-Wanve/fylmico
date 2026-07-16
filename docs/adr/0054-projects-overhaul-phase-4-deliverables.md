# 0054: Projects Module Overhaul — Phase 4 (Deliverables)

Date: 2026-07-16

Status: Accepted

## Problem

Phases 1-3 built Clients/Projects/Shoots/Upload-Automation, but every draft
an editor submits still just overwrites the same attachment slot with no
version history and no review/approval workflow. The overhaul requires a
real `Deliverable` concept: every submission is a new, never-overwritten
version, moving through `draft → review → revision → ... → approved →
final`, with client/team feedback attached to each version and an approval
automatically creating the next pipeline task.

## Decision

- **New `Deliverable` model** (`organizationId`, `projectId`, `taskId?`,
  `fileEntryId`, `createdById`, `version: Int`, `status`, `notes?`,
  timestamps). `version` is auto-incremented **per project** (not per
  task) at create time via a simple `count + 1` - matching this
  session's existing bias against transactional/locking complexity for
  numbering (e.g. task-create-dialog's type-based auto-title counter).
  `(projectId, version)` is a unique DB constraint, so a version number
  is physically never reused even if the count-based computation ever
  raced.
- **`status` is a 5-value validated free string** (`draft | review |
revision | approved | final`), matching every other workflow
  vocabulary in this codebase (Task status/type/priority, Shoot status)
  - no DB enum. New deliverables are created directly at `review`
    (skipping a separate `draft` status) since submitting a draft via
    `SubmitDraftDialog` already means "ready for review," matching the
    pre-existing behavior where submitting a draft already flips the
    task to `status: "review"`.
- **`comments.service.ts` gains `createForDeliverable`/
  `listForDeliverable`**, mirroring `createForProject`/`listForProject`
  exactly (including notifying the project's `teamIds`) - the existing
  polymorphic `Comment` model needed zero schema changes, just two new
  thin wrapper methods, per the plan.
- **`SubmitDraftDialog` now also creates a `Deliverable` row** after its
  existing `uploadTaskAttachment` call, using the uploaded file's id.
  This is best-effort (wrapped in try/catch) exactly like every other
  "primary action succeeded, secondary side-effect is optional" pattern
  already established (e.g. Shoot Drive-folder auto-attach in ADR 0053)
  - a Deliverable-creation hiccup never blocks the submission itself.
    Needs a new `projectId` prop threaded through from `focusTask.projectId`
    (already loaded, no new query).
- **Three dedicated action endpoints** (`approve`, `request-revision`,
  `mark-final`) rather than a generic `PATCH status`, matching the
  `archive`-endpoint / Shoot-status-transition precedent from ADR
  0051-0053.
- **Approving a Deliverable auto-creates a Delivery `Task`**
  (`type: "delivery"` - a new value added to `TASK_TYPES`, no different
  in kind from the existing pipeline types `"shoot"`/`"edit"`) titled
  `"Deliver v{version} - {project name}"`, and bumps
  `Project.progress` by 10 (capped at 100) - the same
  `createNextRecurrence`-style inline pipeline pattern used throughout
  this overhaul (Shoot → Editing task in Phase 3), now for Deliverable →
  Delivery task. Wrapped in try/catch so a failure here can't undo the
  approval itself, which already persisted.
- **New Deliverables tab on the project detail page** (`DeliverableRow`
  component): version + status badge, file name/size/submitter,
  status-conditional action buttons, and an expandable inline comment
  thread (reusing the new `createForDeliverable`/`listForDeliverable`
  endpoints) - deliberately compact rather than a separate page, since a
  project's deliverable list is expected to stay short (a handful of
  versions per project, not hundreds).

## Alternatives

- **Per-task version numbering** (reset to 1 for every new editing
  task). Rejected - the plan explicitly calls for project-wide
  versioning ("Draft V1 → V2 → ... never reused/overwritten"), and a
  single incrementing counter is simpler to reason about than
  per-task counters that could collide in the UI's flat version list.
- **A `PATCH /deliverables/:id` generic status endpoint.** Rejected for
  the same reason as Shoots (ADR 0052/0053) - `approve` specifically
  needs to trigger the Delivery-task/progress side effect, which is
  clearer as its own named action than a conditional inside a generic
  update handler.
- **Reusing `TASK_TYPE` `"client-review"` instead of adding
  `"delivery"`.** Rejected - `client-review` already has an established
  meaning (a task where a client reviews something, not a task
  representing "the finished thing is being handed over"); conflating
  them would make existing `client-review` tasks in this codebase
  ambiguous.

## Tradeoffs

Benefits:

- Zero schema changes needed for deliverable comments - the polymorphic
  `Comment` model absorbed a fourth `commentableType` for free.
- The Delivery-task auto-creation reuses the exact inline-pipeline shape
  proven twice already this overhaul (Task's own `createNextRecurrence`,
  Shoot's `createEditingTask`), so there was no new pattern to invent or
  review.

Costs:

- `Project.progress` bump on approval is a flat `+10`, not tied to any
  actual completion formula (this codebase doesn't have one for
  Projects) - a simple, honest placeholder rather than a fabricated
  precise percentage. Revisit if a real completion-weighting scheme is
  ever introduced.
- `SubmitDraftDialog`'s file upload and the Deliverable version list are
  two separate calls (upload, then create) rather than one atomic
  operation - matches how this session already treats "primary action +
  best-effort secondary metadata," but means a client crash between the
  two calls would leave an uploaded file with no Deliverable version
  (rare, and no worse than any other best-effort side effect in this
  codebase).

## Future Implications

Phase 5 (Project Chat/Timeline/Analytics) will include Deliverable
status transitions in the per-project Timeline, and "Avg Review Time" /
"Revision Count" analytics can be computed directly from this table's
`status` history going forward.
