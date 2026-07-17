# 0056: Review & Approval System

Date: 2026-07-17

Status: Accepted

## Problem

Managers had no cross-project view of what needed reviewing: approving,
requesting changes, or reassigning a submission only happened one project
at a time from the Deliverables tab buried in that project's detail page.
There was no reassignment workflow, no bulk actions, no dashboard
visibility into the review backlog, and "Approve" (Phase 4, ADR 0054) just
bumped `Project.progress` by a flat `+10` and spawned an unrelated
"Deliver v{n}" task instead of actually completing the originating task
and filing the deliverable as delivered.

The user wanted a dedicated, Frame.io/Linear-style **Review** page: search/
filter/sort across every project, full version history, reassignment with
a preserved audit trail, and everything (task, Drive, project stats,
dashboard) updating automatically from one action.

## Decision

Reuse the Phase 4 `Deliverable`/`Comment`/`Task` pipeline end to end -
this is additive, not a parallel system:

- **Two small schema additions**, no new models: `Comment.timestampSeconds`
  (nullable `Float` - timestamp-specific feedback anywhere comments
  already render, not just deliverables) and
  `Deliverable.exportSettings` (nullable `Json` - freeform export
  metadata captured at submit time). Versioning itself needed **no
  change** - Phase 4 already made every submission a new `FileEntry` +
  new `Deliverable` row (`version = count + 1`), so "V1, V2, V3... never
  overwritten" was already true; this phase only had to surface it.
- **New `organizationsService.requireManagerRole`** (Owner **or** Admin),
  mirroring the existing `requireOwnerRole` exactly - gates
  Approve/Request Changes/Reassign/bulk actions. Matches the established
  precedent (ADR 0054's plan) that manager-only actions gate on role, not
  a new entry in the 19-key custom permission system.
- **`deliverablesService` rewritten in place** (not forked into a
  parallel service):
  - `approve` now sets `status` directly to `"final"` (one action, not
    Phase 4's two-step approve→mark-final - `markFinal` stays as a
    separate endpoint, unchanged, for anyone still using it manually),
    marks the linked task `completed` (reuses `tasksService.update`'s
    existing `task_completed` notification), best-effort copies the
    `FileEntry` into the project's `Deliveries` Drive folder (same
    copy-a-row pattern as `filesService.addToPortfolio`), and recomputes
    `Project.progress` as `completedTaskCount / taskCount` - replacing
    Phase 4's flat `+10` placeholder, which that ADR's own "Future
    Implications" flagged as something to revisit once real data was
    available. The old "auto-create a Delivery task" side effect is
    dropped - this spec asks to complete the _existing_ task, not spawn
    a new one.
  - `requestRevision` reverts the linked task to `"in-progress"` (per
    the user's explicit spec, not the separate `"changes-requested"`
    status, which stays available for direct ad-hoc use elsewhere),
    attaches the reviewer's comment to the **task** via
    `commentsService.createForTask`, and notifies the assigned editor(s).
    The superseded submission simply remains an older `Deliverable` row -
    already true, nothing to change.
  - `reassign` calls `tasksService.update(taskId, { assignees: [{
userId: newEditorId }] })`, reusing the assignee-diff logic that
    already logs `TaskActivity` and notifies the new assignee, then
    separately notifies the _removed_ editor from inside `reassign`
    itself (not a change to `update()`'s shared notify behavior, to avoid
    affecting unrelated assignee edits elsewhere in the app). No
    migration of `Deliverable`/`Comment` rows is needed - both key off
    `taskId`, never assignee, so history survives for free.
  - `listQueue`/`getMetrics` are new read methods - a cross-project join
    of `Deliverable` + `Task` + `Project` + `Client` + assignees, and the
    four dashboard counts, respectively.
  - `bulkAction` loops the single-item methods per id (matches the
    existing `bulkUpdateStatus`/`bulkUpdatePriority` precedent in
    `tasks-page.tsx` - no duplicated transition logic), continuing past
    per-id failures rather than aborting the batch.
- **New Review page** (`/review`, gated as a toggleable module like
  `crews`/`bookings` - on by default for `agency`/`custom` houses) with a
  toolbar (search/filter/sort/bulk-select), item cards, and a detail
  dialog (version history, compare, timestamped comments, actions,
  "Open in Drive" via the existing signed-download-URL endpoint).
- **"Editor's Work" and "Client's Work" are surfaced, not rebuilt**: the
  per-user Employee Work Drive folder (already auto-mirrored on every
  upload since ADR 0045) gets a "Submitted Work" panel on the existing
  crew profile page; the project's `Deliveries` folder (already a
  `PROJECT_SUBFOLDERS` entry) is where `approve` files the final, and the
  existing Deliverables tab's status label changed to "Delivered to
  Client" for `final`-status rows. Neither got a new top-level page -
  only Review was asked for as new/top-level.

## Alternatives

- **A new `ReviewItem`/`DeliverableReview` model** to represent the queue.
  Rejected - a `Deliverable` _is_ the review item; a parallel model would
  need to stay in lockstep with it for no benefit.
- **A new `"changes-requested"`-only revert target for Request Changes.**
  Rejected - the user's spec explicitly says "move the task back to In
  Progress," and the codebase already has a separate `"changes-requested"`
  task status used elsewhere (direct manager action on a task, independent
  of the Deliverable/Review flow); overloading it here would blur two
  different meanings into one status value.
- **A dedicated `approve_deliverables` permission** in the 19-key
  `permissions.ts` system. Rejected - the Phase 4 plan already established
  that this kind of manager gate should be role-based (Owner/Admin), not a
  new granular permission, and there was no reason to depart from that
  now.
- **Real thumbnail/frame-preview generation.** Rejected - no ffmpeg
  pipeline or Drive-thumbnail fetch exists anywhere in this codebase;
  "Preview/thumbnail" ships as a mime-type icon (matching `file-grid-
card.tsx`), flagged as a deliberate scope call rather than silently
  dropped.

## Tradeoffs

Benefits:

- Nearly the entire "hard" part (versioning, Drive foldering, task status
  vocabulary, notifications, bulk-action UI precedent) already existed
  from prior phases - this shipped as an extension of `deliverables.service.ts`
  and two new nullable columns, not a new subsystem.
- Reassignment needed zero data-migration logic because `Deliverable`/
  `Comment`/`TaskActivity` were already assignee-agnostic by construction.

Costs:

- The Review queue (`listQueue`) is unpaginated - acceptable while a
  house's open review backlog stays in the tens of items, but will need a
  cursor if that assumption stops holding.
- "Compare versions" is a metadata-only side-by-side (name/size/notes/
  export settings/download link per version), not a frame-accurate video
  diff - flagged as a deliberate scope call, same reasoning as the
  thumbnail decision above.
- Verification of the Drive-dependent parts of the pipeline (real file
  upload, the Deliveries-folder copy on approval) could only be exercised
  against a house with Google Drive actually connected; the local
  verification house had no Drive connection, so those specific steps
  were confirmed via their existing try/catch-and-log resilience (the
  same pattern already proven for `shootsService.markUploaded`) rather
  than a live Drive round-trip.

## Future Implications

A real `Task`/`Deliverable` status-history table (flagged as a gap back
in ADR 0055 for Timeline/Analytics) would let "Compare versions" and
review-cycle analytics (time-to-approval, revision count trends) become
exact instead of derived from current-state timestamps. Frame-accurate
video preview/diffing would need a real transcoding pipeline, which
doesn't exist yet anywhere in this codebase.
