# 0022: Projects + Clients Module

Date: 2026-07-08

Status: Accepted

## Problem

Per ADR 0012, `project` is the primary production workspace inside a house,
owning most artifacts (tasks, assets, schedules) that later modules will
attach to; `client` links to one or more projects. Unlike auth (ADR 0019),
organizations/houses (ADR 0020), and tasks/chat (ADR 0021), no frontend mock
or documented contract existed for this domain — `docs/api.md`'s "Planned
Endpoint Areas" only listed bare feature names, not a real shape. This ADR
designs and implements that contract from scratch.

## Decision

Implement `projects`, `clients`, and a `project_clients` join table, with
routes and conventions following the precedent the last three modules
already established rather than inventing new ones:

- **Routes use `houses`, not `organizations`**, in the URL —
  `POST /api/v1/houses/:houseId/projects`,
  `POST /api/v1/houses/:houseId/clients` — even though
  `docs/architecture.md`'s original baseline route sample used
  `/api/v1/organizations/:organizationId/projects`. That sample predates
  ADR 0018's "House" product vocabulary; every route implemented so far
  already uses `houses`, so this pass follows that and the stale sample in
  `docs/architecture.md` is corrected to match.
- **Project fields**: `name`, `description` (nullable), `status`
  (`"active"` | `"archived"`, default `"active"`), linked `clients`
  (lightweight `{ id, name }[]` summary, via `project_clients`). No
  `teams`/`departments` — not in `docs/api.md`'s planned list.
- **Client fields**: `name`, `contactName` (nullable), `contactEmail`
  (nullable, validated as an email when present).
- **First real cursor-paginated list endpoints.** ADR 0010 documented the
  `{ "data": [], "page": { "limit", "cursor", "nextCursor" } }` envelope,
  but nothing implemented it yet (the workspace snapshot's `houses` array
  is unpaginated, bounded by the caller's own memberships — a small,
  naturally-bounded list). `GET .../projects` and `GET .../clients` are the
  first real usage: cursor on `id`, ordered by `created_at` ascending,
  fetching `limit + 1` rows to detect `nextCursor` — implemented in a
  shared `apps/api/src/common/pagination.ts` (`CursorPaginationDto`,
  `buildPage`) so future list endpoints reuse the same pattern.
- **List endpoints return every status by default**, including archived
  projects — no filter query param yet. Each project's `status` is visible
  so the frontend can filter/group client-side; adding a filter param is a
  bigger, separable decision than this pass needs to make.
- **Archive is a dedicated action endpoint**
  (`POST /api/v1/projects/:projectId/archive`), not a `PATCH` status flag —
  matches the existing precedent of modeling lifecycle actions as their own
  endpoints (`logout`/`logout-all` rather than a generic session-patch).
- **No project-level membership or visibility restriction.** Every house
  member can see/manage every project and client in their house — the same
  "membership is the only enforcement gate" choice ADR 0020/0021 already
  made. `project_memberships` (planned in `docs/database.md`, meant to
  "refine access inside the organization" per ADR 0012) is deferred until a
  concrete need (e.g. client-restricted project visibility) justifies it —
  "Manage project members" from `docs/api.md`'s planned list stays out of
  scope, the same treatment ADR 0020 gave "manage house memberships."
- **Linking is additive only.** `POST /api/v1/projects/:projectId/clients`
  links a client to a project; there's no unlink endpoint — `docs/api.md`'s
  planned list said "link," not "unlink."

## Alternatives

- Keep `/api/v1/organizations/:organizationId/projects` matching
  `docs/architecture.md`'s original sample literally. Rejected: every
  implemented route already uses `houses`; introducing `organizations` in
  the URL now would make the API inconsistent with itself.
- Add `project_memberships` and real per-project visibility now. Rejected:
  no concrete requirement exists yet (e.g. an actual client-facing project
  view), and ADR 0020/0021 already established the pattern of deferring
  granular RBAC until a real need appears.
- Add a `status` filter query param to the list endpoints now. Rejected as
  premature — nothing yet needs to hide archived projects from a view;
  simpler to add the param later than to guess its shape now.

## Tradeoffs

Benefits:

- Establishes real cursor pagination against a concrete resource, matching
  ADR 0010's already-documented (but previously unused) list envelope.
- Gives later modules (assets, schedules, storyboards — all "owned by a
  project" per ADR 0012) something real to attach to.
- Keeps the URL scheme internally consistent (`houses` everywhere, not a
  mix of `houses` and `organizations`).

Costs:

- No project-level access control — a house member with no formal
  "project role" can still see and edit every project.
- No unlink-client, no client search/filtering, no project search.
- Archived projects aren't hidden anywhere yet — purely a status label.

## Future Implications

- `project_memberships` and finer project-level policy checks should land
  once a real feature needs to restrict a project's visibility (e.g.
  client portals, per-project team assignment).
- Future list endpoints (assets, tasks-by-project, etc.) should reuse
  `apps/api/src/common/pagination.ts` rather than reinventing cursor
  pagination.
- A `status` filter (and possibly full-text search) on the list endpoints
  is a natural addition once the frontend actually needs to hide archived
  projects from a default view.
