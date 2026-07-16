# 0053: Projects Module Overhaul — Phase 3 (Upload Automation + Editing Auto-Attach)

Date: 2026-07-16

Status: Accepted

## Problem

Phase 2 (ADR 0052) gave Shoots a full crew-facing status workflow, but
"Finish + Upload" only flipped a status flag - no real footage moved
anywhere, and no follow-on editing work was created. The overhaul's next
requirement is to make the "Data Uploaded" transition actually mean
something: real files land in a real per-shoot Drive folder, and an
Editing task is automatically created and pre-attached to that footage.

## Decision

- **Multi-file upload is a pure client-side change** - a new
  `uploadFilesToShoot(shootId, files)` in `base-workspace.service.ts`
  loops the existing single-file `uploadFileEntry()` call once per file.
  No backend route changes: the upload endpoint already accepted one
  file per request and that's still true - multiplicity is handled by
  calling it multiple times, per the approved plan ("extend the client
  to loop the existing single-file upload call").
- **New `driveStructureService.ensureShootFolder(organizationId,
projectId, shootId, name, dateISO)`**, mirroring
  `ensureRawDataDateFolder` exactly - a folder keyed
  `project:{projectId}:shoot:{shootId}` nested under the project's
  `Shoots` subfolder (added in Phase 1), named `"{date} - {shoot name}"`.
- **New `GET /api/v1/shoots/:shootId/upload-folder`** resolves (creating
  if needed) that folder and returns its id, which the client uses as
  `parentId` for each `uploadFileEntry()` call.
- **`FocusTaskCard`'s "Finish + Upload" now triggers a real (hidden,
  `multiple`) file input.** Selecting files runs the full sequence:
  `finishAndUploadShoot` (status → `uploading`) → upload every selected
  file into the shoot's folder → `markShootUploaded` (status →
  `uploaded`). The "started" and "finished" status buttons that
  previously called the old placeholder handler now both open this same
  file picker.
- **`markUploaded` auto-creates an Editing `Task`** (`type: "edit"`,
  title `"Edit {shoot name}"`) and links (`FileEntry.taskId`) the
  shoot's footage folder plus the project's `Assets` subfolder to it -
  the same `linkTaskAttachment` mechanism already used by the manager
  raw-footage picker. This is the `createNextRecurrence`-style inline
  pipeline pattern already established in `tasks.service.ts`, now reused
  for a cross-entity (Shoot → Task) transition instead of a same-entity
  one.
  - The plan's original wording listed "References/Assets/Music/
    Graphics" as the subfolders to attach. Only `Assets` exists in this
    codebase's actual `PROJECT_SUBFOLDERS` (Phase 1, ADR 0051 didn't
    introduce the other three, and inventing new subfolders now would be
    scope creep beyond what this phase needs) - so only `Assets` is
    attached; the others are skipped, not silently dropped without
    explanation.
- **The Drive-dependent half of `markUploaded` is best-effort**, wrapped
  in try/catch exactly like `ensureProjectFolder`/`ensureClientFolder`
  calls elsewhere in this codebase. The shoot's status transition to
  `uploaded` always persists even if the Editing-task Drive-folder
  linking fails (e.g. house has no Drive connection) - this was an
  actual bug caught during verification (see Errors below) and fixed
  before this phase shipped.
- **`task-create-dialog.tsx`'s existing Client → Project raw-footage
  picker gains a third cascading level: Shoot.** Selecting a project
  populates a Shoot dropdown filtered to `uploaded`/`ready-for-editing`
  shoots only (footage that's actually usable); choosing one calls the
  new `getShootUploadFolder` instead of the date-based
  `resolveFileDestination` raw-data lookup, so a manager can attach a
  specific shoot's footage instead of "whichever Raw Data folder
  matches today's date."

## Alternatives

- **A dedicated multi-file upload endpoint accepting a `FormData` array.**
  Rejected - the plan explicitly calls for looping the existing
  single-file endpoint client-side; a new endpoint would duplicate
  `uploadFile`'s logic for no real benefit at this data volume.
- **ZIP upload / `webkitdirectory` folder-select.** Explicitly deferred
  per the original plan - genuine new technology (ZIP parsing, tree
  reconstruction) with no precedent anywhere in this codebase, out of
  scope for "wire up what already exists."
- **Re-attaching every project subfolder (Scripts/Storyboards/Project
  Files/Deliveries) to the new Editing task.** Rejected - only footage
  and general assets are relevant to an editor; attaching unrelated
  folders would just be noise in the task's attachment list.

## Tradeoffs

Benefits:

- Zero backend changes needed for multi-file upload - proof that the
  existing single-file endpoint was already the right primitive.
- The manager-driven Shoot cascade needed no new backend endpoint either
  - it reuses `getShootUploadFolder`, the same one the crew-side upload
    flow uses.

Costs:

- `FileEntry.taskId` is a single-owner column - re-linking the shared
  `Assets` folder to each new Editing task means it only visibly
  "belongs" to whichever task attached it most recently. This is a
  pre-existing modeling limitation (see ADR 0051's task-create-dialog
  raw-footage attach, which has the same property), not something this
  phase introduces or could fix without a schema change out of scope
  here.
- Verified in an environment with **no Google Drive connection** on the
  test house (`drive_connections` table empty) - the actual file bytes
  could not be verified landing in a real Drive folder end-to-end. This
  matches this session's existing precedent (HUD Phase's Submit Draft
  upload test hit the identical constraint). What _was_ verified: the
  shoot status workflow through `uploaded`, the Editing task
  auto-creation (a DB-only operation, unaffected by Drive availability),
  and the manager-side Shoot cascade UI - all independent of whether
  Drive is connected.

## Future Implications

Phase 4 (Deliverables) will give the Editing task's submitted draft a
real versioned `Deliverable` row instead of a bare file upload. Phase 5's
per-project Timeline will include upload/auto-attach events.
