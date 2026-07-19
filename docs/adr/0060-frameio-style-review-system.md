# 0060: Frame.io-style review system rework

Date: 2026-07-19

Status: Accepted

Supersedes: the basic review queue + modal detail panel introduced in
[0055](0055-project-phase5-timeline-analytics-chat.md)'s era (built out
across the Task System Overhaul phases) and referenced as "project-only
for now" in [0059](0059-projects-and-clients-as-independent-owners.md).

## Problem

The existing Review system was a plain queue with a modal detail panel:
metadata, a text-only version diff, and a flat comment list with a manual
"seconds" number input. There was no video player beyond a bare native
`<video controls>`, no way to draw on a paused frame, no comment threading/
resolve/reactions/mentions, and the approval action was a single button
with no control over where the approved file actually went. Three real
bugs also sat underneath it: `Deliverable.version` numbering raced
(count-then-create with no transaction or constraint), `approve()` wrote
status `"final"` while a separate, inconsistent `markFinal()` path also
existed, and the review queue's auth was weaker than the actions it
gated.

The user wants a professional, Frame.io-inspired review workspace: a real
video player (frame-stepping, speed control, keyboard shortcuts), a
timeline with clickable comment/annotation markers, draw-on-frame
annotation tools, threaded comments with mentions/reactions/resolve, and
a three-button approval workflow (Needs Changes / Reject / Approve) where
Approve automates moving the file into Deliverables and, optionally,
Portfolio - feeding a permanent editor edit-history record visible on the
crew profile.

## Decisions

1. **Fix the underlying bugs as part of this work, not around them.**
   `create()`'s version race is closed with a Serializable transaction
   plus a hard-backstop partial unique index
   (`deliverables_task_id_version_key` on `(task_id, version) WHERE
task_id IS NOT NULL` - task-less deliverables aren't part of a
   versioned review cycle). `approve()` now writes the real `"approved"`
   status; the separate `"final"`/`markFinal()` concept is removed
   entirely rather than reconciled. `listQueue()` (and the new
   single-item `getQueueItem()`) require `requireManagerRole` unless the
   caller is asking for their own submissions (`editorId === self`),
   matching what the mutating actions already required.
2. **Comment threading/reactions/mentions extend the existing polymorphic
   `Comment` model** (`parentId`, `resolvedAt`/`resolvedById`, `pinned`,
   `mentionedUserIds: String[]`, `reactions: Json?`) rather than
   introducing a `Thread` or `Reaction` table - consistent with this
   schema's existing convention of denormalized arrays/JSON for
   lightweight per-row data (e.g. `Task.equipment`, `Role.permissions`).
   Mentions are resolved by explicit `mentionedUserIds` picked from a
   `MentionTextarea` autocomplete, not the old task-comment path's
   substring-match-on-name hack (which stays as-is for task comments,
   out of scope here).
3. **Annotations are a new dedicated model**, not folded into `Comment`,
   because an annotation has geometry (`data: Json`, tool-specific:
   points/coords/text) and a type (`arrow | rectangle | circle | freehand
| line | highlight | text | blur`) that a text comment doesn't, and a
   comment can exist without ever having one. `commentId?` links them
   optionally when a reviewer draws while writing feedback.
4. **`DeliverableActivity` mirrors `TaskActivity` exactly** (same shape:
   `id, deliverableId, actorId, type, fromValue?, toValue?, createdAt`) -
   reusing an established pattern instead of building a generic
   polymorphic activity log for one new use.
5. **No new `Version` model.** Versions stay what they already were -
   `Deliverable` rows sharing an owner + `taskId`, distinguished by
   `version: Int` - now with real integrity (the partial unique index)
   instead of just a convention.
6. **Approval automation reuses the existing "duplicate FileEntry, same
   `storagePath`" pattern** that `addToPortfolio`/the old `onApproved()`
   already used for copying a file into another Drive folder, rather than
   performing literal Drive-API multi-parent operations. `approve()`
   takes `{ deliverToClient, addToPortfolio, portfolioCategory,
finalName, notes }`; the Portfolio copy is attributed to the editor
   (`uploadedById: deliverable.createdById`), not the approving reviewer,
   so it counts toward that editor's stats.
7. **Editor edit-history stats are computed on demand**, not written to a
   new ledger table - `getEditorStats()` aggregates directly over
   `Deliverable`/`Task`/`FileEntry` (total edits, total delivered,
   approval rate, avg review iterations = avg of max version per task,
   total runtime edited = sum of approved `FileEntry.durationSeconds`,
   portfolio pieces = count of `FileEntry` rows under `portfolio:*` owned
   by the editor). This avoids a redundant, driftable copy of data that's
   already queryable.
8. **Frame-stepping fps is read from `exportSettings.frameRate`**
   (fallback 24), the free-text field editors already fill in on submit -
   no new video-metadata probing pipeline. **Quality selector** is a UI
   stub (single "Source" option) since there's no multi-bitrate
   transcoding. **Timeline hover-preview thumbnails** are generated
   client-side (a hidden `<video>` seeked on hover + `<canvas>` snapshot),
   not a pre-generated sprite sheet. **"Version markers"** from the
   original request are rendered as version-switcher chips next to the
   timeline, not plotted on it - each version is a separate video with
   its own duration, so a single scrub bar can't sensibly host another
   version's markers.
9. **Deferred to schema-readiness only**, per the request's own framing of
   them as future work: side-by-side visual version compare, AI review
   suggestions, silence/cut detection, waveform, color-approval
   workflows, client review mode, watermarked links, guest reviewers,
   multi-reviewer approval, review analytics, batch approval templates,
   review templates, shot-level metadata, automatic change summaries.
   `Annotation.data` (Json), `Comment` threading, `DeliverableActivity`,
   and versioned `Deliverable` rows are shaped so these can plug in later
   without restructuring.

## Implementation

**Schema** (`packages/database/prisma/schema.prisma`): `Comment` gains
threading/resolve/pin/mentions/reactions/frame number; new `Annotation`
and `DeliverableActivity` models; `Deliverable` gains `rejectionReason`,
`firstReviewedAt`; `DeliverableStatus` becomes
`draft | review | revision | approved | rejected`. Migration
`20260719120000_review_frameio_rework` adds the columns/tables plus the
partial unique index closing the version race.

**Backend**: `comments.service.ts` rebuilt around the new schema
(resolve/reopen/pin/react/edit/delete, threaded `listForDeliverable`,
explicit-id mention notifications fixing a real gap - client-owned
deliverables previously got zero comment notifications since they have no
`teamIds`). New `annotations.service.ts`. `deliverables.service.ts`:
transactional `create()`, `reject()`, reworked `approve()`,
`markFirstReviewed()` (fires a one-time `deliverable_review_started`
notification + activity entry), `getEditorStats()`, `getActivity()`, plus
the auth/version-race fixes above. New notification types:
`deliverable_mentioned`, `deliverable_comment`, `deliverable_rejected`,
`deliverable_review_started`.

**Frontend**: `components/review/player/` (`PlayerProvider` context,
`ReviewVideoPlayer`, `PlayerControlsBar`, `ReviewTimeline`) plus
`AnnotationToolProvider`/`AnnotationToolbar`/`AnnotationCanvas` (SVG
overlay for stroke shapes, HTML overlay for text/blur) and
`CommentThreadPanel`. A new dedicated route,
`/review/[deliverableId]` (`review-workspace-page.tsx`), replaces the old
modal `ReviewDetailPanel` (deleted): player + timeline + annotation tools
in the main area, a tabbed Comments/Info/Activity side panel, version
chips, and the three approval actions as full dialogs
(`ApproveDialog`/`RejectDialog`/`RequestChangesDialog`). Because the
workspace fetches by deliverable ID directly rather than only from an
already-loaded queue list, a `GET /deliverables/:id` endpoint
(`getQueueItem`) was added - the queue-opening flow that
[0059](0059-projects-and-clients-as-independent-owners.md) noted as
project-only is resolved here too, since `listDeliverablesForOwner`
handles both owner types for the version-switcher.

## Consequences

- The Review queue and workspace page now show a clear "Reviewers and
  Admins only" state instead of relying solely on the API's 403 -
  self-view (an editor's own submissions, e.g. from their crew profile)
  is still allowed without manager role, matching what `listQueue`
  already permitted.
- Annotation rendering is SVG/HTML-based, not literal `<canvas>` pixel
  drawing, despite the component being named `annotation-canvas.tsx` -
  vector overlays scale correctly with player size/fullscreen without
  redraw logic, and "blur" is a visual review-markup overlay
  (`backdrop-filter`), not a permanent edit to the video file.
- `crew-profile-page.tsx` gained an "Editing History" stats section fed
  by `getEditorStats()`, sitting above the existing "Submitted Work" list.
