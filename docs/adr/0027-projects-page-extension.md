# 0027: Projects Page Extension

Date: 2026-07-10

Status: Accepted

## Problem

Following ADR 0026's precedent, wiring the standalone Projects page to
real data required extending the backend `Project` model - its mock
(`apps/web/src/components/projects/project-data.ts`) carried `type`,
`genre`, a 7-stage `stage` enum (driving a separately-displayed `status`),
`progress`, cover art (`image` or a `coverGradient`/`coverIcon` fallback
pair), `dueDate`, and a `teamIds` roster - none of which existed on the
minimal `Project` model built in ADR 0022 (`name`, `description`, an
active/archived `status`, and linked `clients`).

## Decision

- **Extend `Project` with the fields the UI needs**: `type` (validated
  against a fixed production-type list), `genre` (freeform), `stage`
  (validated 7-value enum, default `"Development"`), `progress` (`Int`,
  default `0`), `coverGradient`/`coverIcon` (freeform string /
  validated icon-key), `dueDate` (freeform string, matching
  `tasks.due_date`'s established non-real-date choice), and `teamIds`
  (`String[]`, Postgres native array - simpler than a join table for an
  unordered set of member ids with no per-member metadata needed).
- **Split "status" into two separate concepts** to avoid a naming
  collision: the DB `status` column keeps its ADR 0022 meaning
  (`active`/`archived`, archive tracking only) and is never returned in
  the API response. The response's `status` field (`active | in-progress
| on-hold | completed`, matching the frontend's designed vocabulary) is
  computed server-side from `stage` via a fixed mapping, mirroring exactly
  the `STAGE_TO_STATUS` table the frontend mock already had. This keeps
  both the archive feature and the display-status feature working without
  overloading one column with two meanings.
- **`teamIds` validated, not foreign-keyed.** Every id in a `teamIds`
  array is checked against the project's house's current membership at
  write time (reusing the same "does this org have a member with this
  user id" check tasks/comments already use for assignees), but the
  column itself has no DB-level referential integrity - a member removed
  from the house later can leave a stale id sitting in an old project's
  `teamIds` until that project is next updated. Acceptable for now; flagged
  in `docs/database.md` as a known gap rather than solved with a join
  table this pass.
- **No `image`/cover-photo upload.** No object storage exists anywhere in
  the backend yet (that's the not-yet-built `/files` page's domain).
  New/duplicated projects always use `coverGradient`/`coverIcon`; the
  frontend's `image` fallback path was removed from the two card
  components rather than left dangling on a field the API can never
  populate.
- **List excludes archived projects.** The original `GET
/api/v1/houses/:houseId/projects` returned every project regardless of
  status (an ADR 0022 gap, noted at the time as "no archived-filter yet").
  This pass closes it: the query now filters `status != "archived"`,
  matching what the frontend's old mock-based `handleArchive` did (removed
  the project from the visible list).
- **`teamOverflow` is computed, not stored.** The mock had a manually
  curated `teamOverflow` number with no real relationship to `teamIds`'
  length. `TeamAvatarStack` now genuinely computes it: shows up to 4 real
  member avatars from `teamIds`, and a `+N` badge for the rest.

## Alternatives

- Model `teamIds` as a join table (`ProjectMember`) instead of a plain
  array. Rejected for this pass: nothing about team membership needs
  per-row metadata (no per-project role, no joined-at timestamp) that
  would justify a table over a simple validated array; can migrate later
  if that changes.
- Keep `image` as a nullable URL field, accepting it will always be
  `null` until file upload exists. Rejected: a field that can never be
  populated is worse than not having it - the frontend's existing
  gradient/icon fallback already covers the same UI slot cleanly.
- Return the DB's raw `active`/`archived` status alongside a separately
  named `displayStatus` field instead of computing over `status`.
  Rejected: keeping the wire contract's `status` field name identical to
  what the frontend's pre-existing `Project` type already expected avoided
  touching every consuming component's prop access, same reasoning as
  ADR 0025's "keep the type contract" pattern.

## Tradeoffs

Benefits:

- The Projects page is now fully real: create, duplicate, and archive all
  round-trip through the real API - verified live in-browser, plus curl
  verification of validation (bad `stage`, bad `teamIds`) and the
  `stage -> status` derivation.
- `docs/database.md`'s `projects` table doc explicitly documents the
  `teamIds` referential-integrity gap and the `status` field split,
  rather than leaving either as a silent surprise for the next person
  reading the schema.

Costs:

- `teamIds` staleness (removed members lingering in old projects) is a
  known, accepted gap, not solved this pass.
- No cover-photo upload — every real project uses a gradient/icon,
  never a photo, until object storage exists.
- The Project Timeline and Recent Activity panels on the Projects page
  still show unrelated local mock data (unchanged from ADR 0025) - it
  would be easy to mistake the whole page for "fully real" when only the
  project list itself is.

## Future Implications

- Object storage (S3-compatible bucket, presigned uploads) is now a
  concrete, named prerequisite for two separate features: project cover
  photos here, and the entire `/files` page's domain. Worth solving once,
  not per-feature.
- If per-member project roles or join timestamps are ever needed,
  `teamIds` should become a real `ProjectMember` join table at that point
  - not before.
- Messages, Crews, Files, Storyboard, Calendar, Bookings, and Analytics
  all still need the same "extend backend to match UI" treatment Tasks
  and Projects just got.
