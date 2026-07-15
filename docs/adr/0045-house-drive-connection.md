# 0045: House-Owned Google Drive with Automatic Folder Structure

Date: 2026-07-15

Status: Accepted (supersedes ADR 0038's per-user decision)

## Problem

ADR 0038 made `DriveConnection` per-user: every uploader needed their own
Drive connected, and shared folders were mirrored lazily into each
uploader's Drive via `DriveFolderLink`. In practice this meant Files had no
real shared structure - a member who never connected Drive couldn't upload
at all, and there was no consistent place for Clients, Resources, or a
private "Sensitive" tree (finance, contracts, HR) that only Owners should
see. The product direction is now a single House Drive, connected once by
the Owner, with Fylmico automatically building and maintaining the entire
folder tree - members should never have to organize folders by hand.

## Decision

- **One `DriveConnection` per House, not per User.** `organizationId` is
  now the unique key (`connectedById` records who authorized it, for
  display only). Connecting/disconnecting is Owner-only
  (`requireOwnerRole`, the same guard `removeMember` and join-request
  review already use) - reused as-is rather than inventing a formal
  "Admin" tier, since this codebase's roles are free-form department tags
  with no permission hierarchy beyond Owner.
- **Two Drive-side root folders, tracked only on `DriveConnection`.**
  `visibleRootFolderId` ("FYLMICO House") and `sensitiveRootFolderId`
  ("FYLMICO House (Sensitive)") are plain Drive folder ids, not
  `FileEntry` rows - the wrapper folders are backend plumbing the UI never
  shows directly; Clients/Resources/Portfolio (and, Owner-only, the
  Sensitive folders) render as if they were the top level.
- **`FileEntry.driveKey`** (`@@unique([organizationId, driveKey])`) gives
  every system-managed folder a stable, race-safe lookup key instead of
  scanning by name - `drive-structure.service.ts`'s `ensureFolder` does a
  `findUnique`, creates on miss, and re-selects on a unique-constraint
  race. One flat namespace covers the whole tree: `clients`, `resources`,
  `portfolio`, `client:<id>`, `client:misc`, `project:<id>`,
  `project:<id>:<Scripts|Storyboards|Raw Data|Project Files|Deliveries|Assets>`,
  `project:<id>:rawdata:<date>` (lazy, per upload day), `resources:<name>`,
  `portfolio:<category>`, `sensitive:<finance|quotations|contracts|hr|internal|employeework>`,
  `employee:<userId>`, `employee:<userId>:<Videos|Scripts|Storyboards|Images|Designs|Documents>`.
  Ad-hoc user-created folders keep `driveKey: null` (many nulls are fine -
  Postgres unique indexes don't constrain NULLs against each other).
- **`FileEntry.sensitive`** gates visibility: `files.service.ts#list`
  requires Owner role when querying the sensitive tree, and
  `requireEntry` re-checks it per-entry (so a non-Owner can't reach a
  sensitive folder by guessing/reusing an id). Children inherit their
  parent's value at creation time.
- **A single Drive means `FileEntry.storagePath` maps 1:1 to one Drive
  object**, for both files and folders - `DriveFolderLink` (the
  per-uploader mirror cache ADR 0038 needed) is deleted outright, and
  `files.service.ts`'s `resolveDriveFolderId`/`collectDriveTargets`
  collapse to reading `storagePath` directly. This is the main
  simplification this ADR buys beyond the feature itself.
- **Automatic foldering hooks, all best-effort** (caught and logged, never
  failing the parent action - same graceful-degradation convention as the
  mailer/storage/realtime modules): `clients.service.ts#create` ->
  `ensureClientFolder`; `projects.service.ts#create` (given an optional
  new `clientId` field) -> `ensureProjectFolder` (creates the project
  folder + its 6 fixed subfolders in one call); `organizations.service.ts`'s
  shared `addMembership` (already the one hook `joinHouse`/
  `respondToJoinRequest`/`acceptInvitation` all call) -> `ensureEmployeeFolder`;
  the callback route, after connecting, backfills `ensureEmployeeFolder`
  for every existing member and runs `ensureHouseSkeleton` once.
- **Uploads get a destination picker, not automatic guessing.** A new
  `POST /files/resolve-destination` resolves `{clientId | "misc",
projectId?, category}` to a target folder (`raw` lazily creates today's
  dated Raw Data subfolder). The frontend only prompts this when uploading
  from a root-level view; uploading while already browsing inside a
  specific folder uploads there directly, unchanged from before.
- **`Project` -> `Client` foldering follows the existing many-to-many,
  additive-only `linkClient` relationship**, not a new required field: an
  optional `clientId` on `CreateProjectDto` files it under that client
  immediately, otherwise under `client:misc`. If a client is linked later
  via `linkClient` and it's the project's _first_ client, the Drive folder
  physically moves (`moveDriveFile`, Drive's `addParents`/`removeParents`)
  from Misc to that client. Additional clients linked after the first
  don't move it again - multi-client projects keep whichever client got
  there first as the folder parent.
- **Portfolio and Employee Work reuse the same file, not a copy-by-bytes.**
  `addToPortfolio` and the upload-time Employee Work mirror both create a
  second `FileEntry` pointing at the same `storagePath` (Drive file id) -
  no re-upload, and deleting one `FileEntry` row doesn't touch the file
  Drive-side (only `deleteEntry`'s Drive-removal path does that, and it
  refuses entries with a non-null `driveKey` outright - see Costs).
- **Employee Work mirroring is upload-only, mime-type-based** (video ->
  Videos, image -> Images, else -> Documents) - Scripts/Storyboards
  subfolders exist under Employee Work (matching the requested folder
  list) but are only ever populated if a file happens to be uploaded
  there directly, since Script/Board content itself has no Drive bytes
  (Postgres-only rows) to mirror.

## Alternatives

- **Keep per-user connections, just add a shared "team" folder concept.**
  Rejected: doesn't fix the core problem (a member who never connects
  can't upload) and still needs per-uploader folder mirroring
  (`DriveFolderLink`) for every shared folder, which is exactly the
  complexity this ADR removes.
- **Formal "Admin" permission tier for connect/disconnect**, matching the
  literal "Owners/Admins" wording of the request. Rejected for this pass:
  this codebase's `Role` model is free-form per-house department tags
  (Owner, Producer, Editor, ...), not a permission hierarchy - the only
  privileged check anywhere is exact-match `"Owner"`. Introducing a real
  Admin tier is a bigger, separate change; Owner-only reuses what already
  exists.
- **A separate `DriveFolder` cache table** (a generic `{organizationId,
key, driveFolderId}` row) instead of adding `driveKey`/`sensitive`
  directly to `FileEntry`. Rejected: every managed folder already needs a
  `FileEntry` row so it's browsable in the Files UI - a parallel cache
  table would just be a second source of truth for the same folder ids.

## Tradeoffs

Benefits:

- Every member can upload/browse immediately - no per-user Drive setup
  required, only the Owner ever authorizes anything.
- `DriveFolderLink` and the recursive per-uploader folder-resolution logic
  in `files.service.ts` are gone; the Drive integration is meaningfully
  simpler than it was.
- The Sensitive tree gives a real Owner-only storage area (Finance,
  Quotations, Contracts, HR, Internal, Employee Work) that didn't exist at
  all before.

Costs:

- **Breaking change**: existing per-user `DriveConnection` rows have no
  valid mapping to the new per-house shape and were truncated in the
  migration - every house must reconnect Drive fresh. Files uploaded
  under the old per-user model become unreachable through the app (their
  bytes still exist in whichever user's Drive they were uploaded to, just
  no longer indexed by a working connection).
- **Single point of failure returns**, deliberately accepted this time:
  ADR 0038 rejected a shared Owner connection specifically because one
  revoked/expired connection breaks uploads for the whole house. That
  risk is back by design, since a single shared Drive is the explicit
  product requirement.
- System-managed folders (`driveKey` non-null) can't be deleted through
  Fylmico (`deleteEntry` refuses them) - protects the tree from accidental
  deletion, but means a truly unwanted managed folder needs manual cleanup
  directly in Google Drive plus its `FileEntry` row.
- Multi-client projects only fold under whichever client was linked
  first; there's no UI concept of "this project's files are split across
  two client folders."

## Future Implications

- If Fylmico ever needs a real permission-tier system (not just Owner vs.
  everyone else), `requireOwnerRole`'s call sites (this ADR's
  connect/disconnect/Sensitive-view checks, plus `removeMember` and
  join-request review) are exactly what would need to generalize to
  `requireRole(["Owner", "Admin"])`.
- The `driveKey` namespace is a flat string convention, not enforced by
  types - fine at this scale, but if the folder tree grows meaningfully
  deeper it's the place to look at introducing a small typed builder
  instead of hand-written template strings at each call site.
