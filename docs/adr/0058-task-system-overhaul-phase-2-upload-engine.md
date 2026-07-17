# 0058: Task System Overhaul — Phase 2: Professional Upload Engine

Date: 2026-07-17

Status: Accepted

## Problem

`filesService.uploadFile` (and its one route) accepted exactly one file,
buffered the entire file into memory via `file.arrayBuffer()`, and sent it
as a single `uploadType=multipart` POST to Google Drive. There was no
chunking, no resumability, and no protection against a multi-GB raw-
footage upload tying up server memory or dying partway with no way to
continue except restarting from 0%. Only the Files page's own upload path
(`uploadFileEntryWithProgress`) showed real per-file progress; task
attachments, shoot footage, and draft submissions were spinner-or-nothing
and blocked their dialog/card for the whole upload. There was no queue, no
pause/resume, no multi-file drag-and-drop, no pre-upload validation, and
no video metadata (duration/resolution) anywhere.

Phase 1 (ADR 0057) shipped type-specific task cards but deliberately left
every upload call site unchanged, scoping the upload engine itself into
this phase.

**Decisions made with the user before implementation:**

- **Resumability**: implement Google Drive's real resumable-upload
  protocol so a dropped connection or in-app navigation resumes from the
  last acknowledged byte. A hard refresh/tab close still loses the
  in-memory `File` handle — recovering a picked file across a full reload
  needs the File System Access API, which is Chromium-only, and was
  explicitly declined in favor of identical behavior across every
  browser. This is a documented, known limitation, not a bug.
- **Metadata**: client-side video **duration + resolution** only
  (trivial via a `<video>` element, no new dependency). Thumbnails/FPS/
  codec need a heavier client-vs-server decision and stay a future phase.
- **Client Approval Task** access model remains deferred (ADR 0057) and
  is untouched by this phase.

## Decision

**Drive tokens stay server-side.** Every other Drive interaction in this
codebase keeps the per-house OAuth token on the server (ADR 0045); giving
the browser a short-lived Drive access token for direct upload would be a
real security-boundary change. Instead, **chunks are relayed through the
server**: the client slices the file into 8 MiB chunks (a multiple of
Drive's required 256 KiB granularity) and `PUT`s each one to our own API,
which forwards it to Drive's resumable-session URL.

**No new database table for upload sessions.** Google's resumable-upload
session URI already _is_ the session — Drive keeps it live server-side for
up to a week. The server wraps that raw URI in a short-lived signed JWT
(`signUploadSessionToken`/`verifyUploadSessionToken` in
`drive-token.util.ts`), the exact same pattern as the pre-existing
`signDownloadToken`/`verifyDownloadToken`. The token encodes
`{ organizationId, userId, driveSessionUrl, parentId, name, mimeType,
size, conversationId, taskId }` and is itself the bearer credential for
the chunk/status routes — deliberately unauthenticated (no `requireUser`),
matching `files/download/[token]/route.ts`'s existing trust model.

**Flow**: `POST .../files/upload-sessions` (authenticated) opens the Drive
session and returns `{ uploadToken }` → client `PUT`s chunks to
`/api/v1/files/upload-sessions/:token/chunk` with a `Content-Range: bytes
{start}-{end}/{total}` header, getting back `{ status: "incomplete",
receivedBytes }` (Drive's `308`) until the final chunk returns
`{ status: "complete", file }` → on completion the server runs the same
finalization `uploadFile` already used (`createFileEntryRow`, extracted
into a shared private method rather than duplicated). `GET .../status`
asks Drive how many bytes it has (an empty-body `PUT` with `Content-
Range: bytes */{total}`) to resume after a drop or a re-selected file.

**Client engine and queue** (`apps/web/src/lib/uploads/`):

- `upload-engine.ts` — `startResumableUpload` slices, `XMLHttpRequest`-PUTs
  each chunk (for real `upload.onprogress`, `fetch` has no equivalent),
  retries a failed chunk up to 5 times with backoff, and calls
  `getUploadStatus` between retries so a flaky connection re-sends only
  the bytes Drive is missing, never the whole file.
- `upload-queue-store.ts` — a plain module-level array + `Set<listener>`
  (`useSyncExternalStore` pattern), not a new state-management dependency.
  Max 2 concurrent uploads. Enqueueing works from any component
  (`enqueueUpload(file, destination, onComplete)`); the queue survives
  in-app navigation because it lives outside any one page's React tree.
  On reload, `localStorage` (`fylmico:upload-queue`) surfaces any upload
  that was still in flight as `"needs-reselect"` — the metadata (token,
  bytes sent) survives even though the `File` handle doesn't; re-picking
  the same file calls the status endpoint and resumes from the reported
  offset instead of restarting at 0%. This is the app's answer to
  "preserve the queue after refresh" given the browser constraint above.
- `use-upload-queue.ts` — the `"use client"` hook every call site uses.

**UI**: `upload-queue-panel.tsx` is a floating bottom-right panel mounted
once in `app-shell-gate.tsx` (replacing the old page-local
`upload-progress-toast.tsx`, now deleted), showing every queued/uploading/
paused/error/needs-reselect file with pause/resume/cancel/retry/re-select
actions, live speed and ETA. `upload-validation-dialog.tsx` warns (not
blocks) on a duplicate filename in the destination folder, a large file,
or an unrecognized extension before enqueueing, with an inline rename for
duplicates.

**Every upload call site now enqueues instead of blocking**:
`files-page.tsx` (multi-file input, real drag-and-drop, `webkitdirectory`
folder picks that recreate the subfolder tree via the existing
`createFolder`), `submit-draft-dialog.tsx` (closes immediately; the
Deliverable/timer/status-update chain runs in the `onComplete` callback
once the upload actually finishes — true background upload), task
attachment upload (`task-detail-panel.tsx`, `storyboarding-task-card.tsx`),
and shoot footage upload (`shoot-task-card.tsx` — the motivating "multi-GB
raw footage" case; it resolves the shoot's Drive folder via the existing
`getShootUploadFolder` and only calls `markShootUploaded` once every
enqueued file has finished).

A bug was caught during live verification that crashed the entire app
shell, not just Files: `getUploadQueueSnapshot` returned a freshly-mapped
array on every call, and `useSyncExternalStore` requires a stable
reference between real store changes - React kept re-rendering trying to
reach one until it gave up with "Maximum update depth exceeded." Fixed by
caching the mapped snapshot and invalidating it only inside `notify()`.

**Video metadata**: `upload-queue-store.ts` reads `duration`/
`videoWidth`/`videoHeight` from a hidden `<video>` element pointed at the
local `File` via `URL.createObjectURL` once the upload completes, then
`PATCH`es `FileEntry.durationSeconds/width/height` (all nullable,
additive — no new model). Best-effort: a failure here doesn't affect the
already-successful upload.

## Alternatives Considered

**Direct browser-to-Drive upload** using a short-lived Drive access token
handed to the client. Rejected — every other Drive interaction in this
codebase keeps the OAuth token server-side; this would be the first
exception and a real security-boundary change, for a problem (server-
relay bandwidth) that an 8 MiB chunk doesn't meaningfully create.

**A dedicated `UploadSession` database table.** Rejected — Drive's own
resumable-session URI already persists server-side for up to a week; a
signed token wrapping it (mirroring `signDownloadToken`) needs no schema
change and no cleanup job.

**Recovering the picked `File` across a hard refresh via the File System
Access API.** Rejected per the user's explicit decision — Chromium-only,
and inconsistent behavior across browsers was judged worse than a
uniform "re-select to resume" prompt.

## Tradeoffs

- A hard refresh or tab close during an upload always requires re-picking
  the file (documented limitation, not a bug) — only network drops and
  in-app navigation truly "just resume."
- Chunks still transit our server (not a direct browser→Drive path), so
  server bandwidth scales with upload volume — judged acceptable given
  the security-boundary reasoning above.
- Thumbnail generation, FPS/codec extraction, and proxy previews remain
  out of scope, per the metadata decision made before this phase.
- Drag-and-drop recreates folder structure for `webkitdirectory` picks
  and drops, but does not attempt full directory-entry traversal for a
  drag-and-drop of a folder itself (only individual dropped files) —
  `DataTransferItem.webkitGetAsEntry` directory recursion was judged out
  of scope for this pass; the folder-picker button covers the same need.

## Future Implications

Thumbnail/FPS/codec extraction, proxy previews, frame-accurate review
tools, offline mobile sync, and an AI assistant remain on the roadmap
(ADR 0057) as their own future phases, none of which this phase blocks.
