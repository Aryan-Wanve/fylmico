# 0057: Task System Overhaul — Phase 1: Dynamic Task Cards

Date: 2026-07-17

Status: Accepted

## Problem

Every task, regardless of type, rendered through the same generic
`TaskDetailPanel` and (outside of a bespoke shoot-only branch in
`FocusTaskCard`) the same generic dashboard card. A Shoot task, an Edit
task, and an Admin task all showed identical sections and offered
identical actions - only a plain-text "Type" label and an undifferentiated
row of metadata badges (location, call time, equipment, storyboard link,
script link, etc.) hinted at what the task actually was. There was no
workflow-specific progress indicator, and Storyboarding/Scripting tasks
had no connection at all to the Storyboard/Scripts modules despite
`Task.boardId`/`Task.scriptId` already existing in the schema and DTOs.

The user asked for a full type-specific task-card system (Shoot/Edit/
Review/Storyboarding/Scripting/Client Approval, each with its own fields,
actions, and progress tracker), plus a much larger program of upload
infrastructure, video metadata extraction, offline mobile sync, AI
assistants, and workflow automation. Given the size, the work was scoped
into phases (see `progress.md`); this ADR covers only Phase 1.

## Decision

**Client Approval Task is deferred indefinitely** - it requires
client-facing access, and the app has no client auth today (an earlier
ADR explicitly ruled that out). Not part of this phase or any near-term
one.

**Reuse, don't rebuild, the state machines that already exist:**

- The `Shoot` model is already a full type-specific sub-entity with its
  own status machine (`scheduled → crew-reached → started → finished →
uploading → uploaded → ready-for-editing → archived/cancelled`).
  `FocusTaskCard` already had a complete "Videographer HUD" branch driven
  by it - Phase 1 extracts that branch verbatim into a standalone,
  reusable `ShootTaskCard` component instead of rebuilding it, so the
  dashboard widget and the task detail panel can never drift apart.
- The `Deliverable` model (Phase 4/ADR 0054, extended by ADR 0056) is
  already the Review workflow's state machine
  (`draft → review → revision → approved → final`), with a full Review
  page already built. Reviewing is **not duplicated into a task card** -
  `EditTaskCard` surfaces the linked deliverable's live status via a
  progress tracker and deep-links to the existing `/review` page instead
  of rebuilding approve/reassign/annotate UI a second time. There is no
  distinct "Review Task" type in the data model (Task.type has no
  `"review"` value; reviewing happens via the cross-project Review queue,
  not a personally-assigned task) - forcing one into existence would
  duplicate state without a real use case.
- `Task.boardId`/`Task.scriptId` already exist in the schema and DTOs but
  were never set or read by any Task UI. `StoryboardingTaskCard`/
  `ScriptingTaskCard` are the first things to actually use them - showing
  the linked `Board`'s shot count or `Script`'s live word count, with a
  graceful "no board/script linked yet → pick one" fallback (a `Select`
  populated from `listBoards()`/`listScripts()`) for tasks created before
  this phase or without a link set at creation time.

**A new shared `TaskProgressTracker` component** (`task-progress-tracker.tsx`)
renders a small horizontal stepper from a `{ label, state }[]` list. Each
card computes its own stage list from data that already exists - no new
state machine was added anywhere in this phase:

- Shoot: from `Shoot.status` (7 stages).
- Edit: from `Task.status` + the latest linked `Deliverable.status` (5
  stages, collapsing "review"/"revision" into "Under Review"/"Changes
  Requested").
- Storyboarding/Scripting: from plain `Task.status` (3 stages: To Do/In
  Progress/Completed, or Drafting/Submitted/Completed).

A bug was caught during live verification and fixed in all four stage
computations: the terminal stage (e.g. "Approved", "Ready for Editing")
was rendering as still-active (numbered) instead of done (✓) once
reached, since `index === activeIndex` was always `"active"` with no
terminal-state check. Fixed by tracking a `terminal` boolean per card and
marking the final stage `"done"` when the underlying status has actually
completed.

**Small, additive new actions**, following established conventions:

- Shoot: **Pause** reuses the existing `TaskTimeEntry` start/stop pattern
  (no new `Shoot` status value - pausing is just stopping the timer).
  **Report Issue** and **Request Extra Time** are new
  `shootsService` methods that post a task comment
  (`commentsService.createForTask`, which already notifies other
  assignees) and separately notify the shoot's creator if different from
  the actor - the same "best-effort comment + targeted notification"
  shape used throughout `shoots.service.ts`/`deliverables.service.ts`.
  Two new notification types (`shoot_issue_reported`,
  `shoot_extra_time_requested`) were added to `TYPE_TO_PREFERENCE_ID`.
- Shoot: an **embedded Google Maps preview** replaces the plain "open in
  Maps" link when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is configured
  (Maps Embed API iframe); it falls back to today's clickable link when
  the key is unset. This is the one new external dependency introduced in
  this phase, and it degrades gracefully without it. The existing
  dashboard `WeatherWidget` is embedded as-is for the "weather snapshot"
  requirement rather than building a location-scoped variant - it already
  shows the viewing device's local weather, which is what a crew member
  physically at or near the shoot location would want.
- Edit: **Request Missing Files** and **Ask Question** are thin wrappers
  around the existing `createTaskComment` client call (no new backend).
  **Upload Draft** is unchanged - it opens the existing
  `SubmitDraftDialog`, now owned by `EditTaskCard` itself rather than
  plumbed through two different parent components.
- Storyboarding: **Add Frame** calls the existing `createShot`. **Upload
  References** reuses the existing generic task-attachment upload - no
  new "references" concept was invented, since none exists in the
  Storyboard module either. **Mark Complete** is a plain status update.
- Scripting: **Draft** deep-links to `/scripts` (bumping `todo →
in-progress` on the way, mirroring the existing timer-start
  auto-transition pattern). **Submit** and **Request Feedback** are
  similarly thin.

**No Prisma migration in this phase.** Every new field needed
(`boardId`/`scriptId` on Task, `exportSettings` on Deliverable,
`timestampSeconds` on Comment) already existed from earlier phases.

## Alternatives Considered

**A dedicated "review task" entity/type**, so a reviewer would see a
personally-assigned task the way an editor sees an edit task. Rejected:
the Review queue already serves as the reviewer's cross-project work
list, built specifically because reviewing isn't naturally tied to one
task/one assignee the way shooting or editing is. Inventing a new
Task↔Deliverable-reviewer relationship to force a one-task-one-reviewer
model would contradict that design rather than extend it.

**Building the full upload/metadata/offline/AI program alongside the task
cards.** Rejected outright - each of those is an independently large,
architecturally distinct effort (a resumable-upload protocol, a video
metadata extraction pipeline, a service-worker-based offline cache, and
an AI provider integration that doesn't exist anywhere in this codebase
today). Bundling them into "Phase 1" would have meant shipping nothing
reviewable for weeks. They remain on the roadmap as their own future
phases.

## Tradeoffs

- Frame-accurate review tools (drawing on frame, voice notes, an in-card
  annotation experience) are explicitly out of scope for this phase - the
  Edit card links out to the existing Review page instead. This matches
  the existing Review page's own scope decisions (ADR 0056) rather than
  contradicting them.
- The embedded map and weather snapshot are both best-effort/optional -
  no Maps API key means a plain link; no geolocation permission means the
  weather widget renders nothing (already true before this phase).
- `StoryboardingTaskCard`/`ScriptingTaskCard`'s "no board/script linked
  yet" picker only offers _existing_ boards/scripts - there is no
  "create new" inline flow from inside a task card. A user without one
  yet creates it from `/storyboard` or `/scripts` first, then links it.
  This keeps the card's scope to linking, not duplicating those modules'
  own creation UI.

## Future Implications

Phases 2+ (their own future ADRs, to be scoped individually): a real
resumable/chunked upload engine with a background queue; post-upload
video metadata extraction (thumbnail/duration/resolution/FPS/codec);
frame-accurate review tooling; offline-capable mobile task access; and an
AI assistant for scripting/storyboarding once a provider is chosen. Client
Approval Task remains deferred pending a decision on client-facing access
(a scoped magic-link surface vs. staff-proxied approval vs. skipping it
permanently).
