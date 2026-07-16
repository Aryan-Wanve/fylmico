# 0051: Projects Module Overhaul — Phase 1 (Clients, Projects, Cards, Team, Drive)

Date: 2026-07-16

Status: Accepted

## Problem

The user asked for a complete Projects Module Overhaul making Project the
single source of truth for the app - every feature (Tasks, Drive, Calendar,
Analytics, Deliverables, Shoots, Reviews, Team) should connect to it
automatically instead of existing independently. This is a 5-phase effort
(see the approved plan). Phase 1 lays the foundation everything else
builds on: a real Client entity with stats, a richer Project (priority,
stats), redesigned Project cards, Team derived from Tasks instead of a
static list, and a Drive "Shoots" folder ready for Phase 2.

## Decision

- **`Client` gains company-profile fields** (`logoUrl`, `phone`,
  `address`, `gst`, `notes`) plus a `status` column matching `Project`'s
  existing active/archived convention - all optional, no breaking change.
  `name` stays as the company-name field (already what it meant).
- **`Project` gains `priority`**, reusing `Task`'s exact `low|medium|
high|urgent` vocabulary and `PRIORITY_META` styling (`task-data.ts`) -
  no new vocabulary invented.
- **Client/Project stats are computed on read, not stored** - a new
  `getClientStats`/`getProjectStats` per-entity endpoint, and a batched
  `getProjectListStats` merged into the project list response (same
  `groupBy`-then-merge pattern as `organizations.service.ts`'s
  `getStorageAndActivity`, avoiding N+1 queries across the grid).
  Per-project/client storage and file counts are computed by matching
  `FileEntry.driveKey` prefixes (`project:{id}`, `client:{id}`) rather
  than adding a `projectId`/`clientId` column to `FileEntry` - the Drive
  folder tree is already keyed this way (ADR 0045), so this reuses the
  existing scoping mechanism instead of duplicating it as a new FK.
- **Team is now the union of `Project.teamIds` and every user
  assigned via the project's tasks** (`Task.assignees`), computed
  entirely client-side from `workspace.tasks` (already loaded) - no new
  backend call. Manually-added team members aren't lost; anyone assigned
  through a task just also appears automatically, per the ask.
- **Project cards redesigned** (grid + list) to show client name,
  priority + stage badges, task/storage/online-member stats, and a
  "Due in N days" countdown - shoot/deliverable counts are intentionally
  left off until Phases 2/4 actually produce that data, rather than
  showing fake zeros.
- **New Clients management page** (`/projects/clients`) - list/create/
  edit/archive/delete, reusing `DashboardPanel`-adjacent card styling
  already established. Linked from a new "Clients" button in the
  Projects header.
- **`PROJECT_SUBFOLDERS` gains `"Shoots"`** (Drive auto-provisioning,
  `drive-structure.service.ts`) - ready for Phase 2's per-shoot footage
  folders, created for every project going forward (existing projects
  get it lazily the next time their folder structure is touched, same as
  every prior `PROJECT_SUBFOLDERS` addition in this codebase).

## Alternatives

- **A `projectId`/`clientId` column on `FileEntry`** for direct stats
  joins. Rejected - the Drive folder tree already encodes this via
  `driveKey` naming (`project:{id}:{subfolder}`); adding a redundant FK
  would need backfilling every historical file and duplicate the same
  information the driveKey prefix already carries.
- **A dedicated Project-level permission for Team membership.** Rejected
  - Team is a read-only derived view for now; no new write path needs
    gating beyond the existing task-assignment flow.
- **Storing computed stats on `Client`/`Project` rows** (denormalized
  counters). Rejected - would need invalidation logic on every task/file
  change across the whole app; computing on read with batched queries is
  simpler and correct by construction, matching this session's existing
  bias against denormalized counters (e.g. Dashboard's storage/activity
  badges, ADR 0049).

## Tradeoffs

Benefits:

- Every stat reuses the existing Drive-folder-key scoping and the
  `groupBy`-then-merge batching pattern already proven in this codebase
  - no new N+1 risk, no new denormalization to keep in sync.
- Team-from-Tasks needed zero backend work since `workspace.tasks` was
  already fully loaded client-side.

Costs:

- Per-client stats on the Clients page are fetched one card at a time
  (not batched like the project list) - acceptable given houses
  typically have a handful of clients, not hundreds; revisit if that
  assumption breaks.
- `getProjectListStats`'s storage/file aggregation assumes files sit
  directly under a project's named skeleton subfolders (matching how
  uploads are actually routed today via `resolveDestination`) rather than
  arbitrarily deep manual sub-folders - consistent with the rest of the
  app's Drive model.

## Future Implications

Phases 2-5 (Shoots + videographer HUD, upload automation + editing
auto-attach, Deliverables, Project Chat/Timeline/Analytics) build directly
on this foundation - the `priority` field, `getProjectStats`, and the
`Shoots` Drive folder are all consumed starting in Phase 2.
