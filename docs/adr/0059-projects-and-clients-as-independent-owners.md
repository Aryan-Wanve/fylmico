# 0059: Projects and Clients as independent, co-equal work owners

Date: 2026-07-18

Status: Accepted

Supersedes: the client-contains-project data model introduced in
[0045](0045-house-drive-connection.md) and carried forward by
[0051](0051-projects-overhaul-phase-1-foundation.md).

## Problem

The app assumed **Clients contain Projects, and Projects contain all
work.** `Client <-> Project` was many-to-many via a `ProjectClient` join
table; every work entity (Task, Deliverable, Shoot, CalendarEvent)
referenced only `projectId`; the Drive tree nested
`Clients/client:<id>/project:<id>/...` with a `client:misc` catch-all for
unlinked projects; and `ProductionTask` carried a derived `clientName`
pulled from the project's linked client. There was no way to attach work
directly to a Client - a client that hired the house for something that
wasn't a "project" (a one-off shoot, a retainer of ad-hoc edits) had
nowhere to live.

The user wants Projects and Clients to be **two fully independent
top-level entities**: neither exists inside the other. A piece of work
belongs to **either** a Project **or** a Client, never both. This is a
foundational data-model change, not a UI rename.

## Decisions

Four decisions were locked with the user before implementation:

1. **Ownership storage: dual nullable FKs.** Each owner-polymorphic model
   (Task, Deliverable, Shoot, CalendarEvent) gets both `project_id?` and
   `client_id?` columns, with a Postgres `CHECK` enforcing the invariant
   (`num_nonnulls(project_id, client_id) = 1` for Deliverable/Shoot, which
   always need an owner; `<= 1` for Task/CalendarEvent, which can be
   unowned). The API/UI never expose the raw dual FKs to callers - every
   create/reassign call takes a unified `{ ownerType: "project" | "client",
ownerId }`, and the server resolves which FK to set. This was chosen
   over a single polymorphic `ownerId` + `ownerType` column (which Prisma
   can't express as a typed relation) and over separate tables per owner
   type (which would duplicate every service).
2. **Project<->Client link removed entirely.** `ProjectClient` and all
   "this project's client" UI/data are dropped. A project's client, if any,
   is now just business context in the project description - not a
   relation the system tracks.
3. **Clients get Shoots too.** Shoot becomes owner-polymorphic like the
   rest, so the crew/videographer workflow (call time, crew assignment,
   status machine, footage upload -> auto-created editing task) is
   available for client-owned shoots, not just project ones.
4. **Drive: two parallel top-level trees.** `Projects/project:<id>/...`
   and `Clients/client:<id>/...`, each with the identical subfolder set
   (Scripts, Storyboards, Raw Data, Shoots, Project Files, Deliveries,
   Assets). The old `Clients/client:<id>/project:<id>/...` nesting and the
   `client:misc` catch-all are gone.

## Implementation

**Schema** (`packages/database/prisma/schema.prisma`): `clientId`/`client`
relation added to Task, Shoot, Deliverable, CalendarEvent;
`Deliverable.projectId`/`Shoot.projectId` made nullable;
`Deliverable`'s `@@unique([projectId, version])` dropped (can't express
"unique per polymorphic owner" as a Prisma composite unique) - version
numbering is now computed in application code
(`prisma.deliverable.count({ where: ownerWhere(owner) })` before create).
`model ProjectClient` and the `Project.clients`/`Client.projects` relations
are removed.

**Backend** (`apps/web/src/server/owners/owners.util.ts`, new): the single
shared owner abstraction every service imports rather than reimplementing
per-service.

- `resolveOwner(houseId, { ownerType, ownerId })` - validates the owner
  exists and belongs to the house, returns `{ type, id, name }`.
- `ownerWhere(owner)` - Prisma `{ projectId }` | `{ clientId }` for
  queries/writes.
- `toOwnerDto(row)` - derives `{ ownerType, ownerId, ownerName }` from
  whichever FK is set on a fetched row, for API responses.

Tasks, Deliverables, Shoots, and Calendar services all take
`{ ownerType, ownerId }` on create and emit `owner*` fields in their DTOs.
Client-scoped listing routes were added where none existed
(`GET /clients/:clientId/shoots`, `GET /clients/:clientId/deliverables`),
and generic house-level creation routes
(`POST /houses/:houseId/shoots`, `POST /houses/:houseId/deliverables`) so
a shoot or a deliverable can be created under a Client, not just reached
through a project-scoped route.

**Drive** (`drive-structure.service.ts`): `ensureClientFolder`/
`ensureProjectFolder` collapse into a single
`ensureOwnerFolder(orgId, ownerType, ownerId, name)`. The drive-key scheme
is `${ownerType}:${ownerId}` (e.g. `project:abc123`, `client:xyz789`) and
`${ownerType}:${ownerId}:${subfolderName}` for children.
`moveProjectFolderToClient` (used when a project's first client link was
added) is deleted - there's nothing to move a project's folder to anymore.

**Frontend**: a shared `<OwnerSelect>` (Project/Client toggle -> entity
picker) and `<OwnerBadge>` (icon + name, styled per type) live in
`components/owners/` and are reused everywhere a piece of work is created,
reassigned, or listed: task creation (shoot + raw-footage linking),
draft submission, calendar event creation, task row/table/kanban views,
the dashboard focus card, and the Tasks page's filter popover (which
gained an Owner: Project/Client/No Owner section). The Projects page is
now "Projects & Clients": two sections on one page (Projects, Clients)
with a unified New -> Project | Client action, replacing the old separate
`/projects/clients` route. A new Client detail workspace
(`client-detail-page.tsx`) mirrors the Project workspace's Tasks / Shoots /
Deliverables / Calendar tabs; Project keeps its extra tabs (Storyboard,
Scripts, Timeline, Analytics, Chat) since those remain project-specific
creative tools, not something every client engagement needs. Global search
and the Analytics stat cards both gained Client awareness (search matches
and deep-links to clients; stat cards show a Clients count alongside
Projects).

## Consequences

- Existing project-owned rows keep their project as owner; the dropped
  `project_clients` associations are discarded (dev data, low stakes).
- The Review page's "other versions" sidebar
  (`review-detail-panel.tsx`) stays project-only for now -
  `listDeliverables` is a project-scoped route and there's no
  `listForClient` equivalent wired into that specific view. Client-owned
  deliverables still get the full approve/reject/comment flow, just not
  that version-history sidebar. A conscious scope cut, not an oversight.
- Storyboard/Scripts (Board/Character/StoryLocation/Script) and
  Bookings/TimeEntries stay project-optional and were not made
  owner-polymorphic this pass - they're project-specific creative tools or
  inherit an owner from their task where one exists, and weren't worth
  their own polymorphic columns.
- Files stay folder-owned (no new FK) - a Client's Files tab is its Drive
  subtree, consistent with how Files already worked before this change.
