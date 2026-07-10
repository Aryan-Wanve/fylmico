# 0030: Calendar Page Extension

Date: 2026-07-11

Status: Accepted

## Problem

The Calendar page's mock had no matching backend model at all - not even
a partial one to extend, unlike Tasks/Projects/Crews. Its shape needed a
time-of-day (distinct from Task's date-only `dueDate`), an optional
location, one of six event categories, and an association with one of
several "calendars" (a "My Schedule" personal calendar plus one per
production the mock invented as `Beyond Frames`/`Ad Campaign`/`Wanderers
Documentary`). None of that exists on `Task` or `Project` today, so
Calendar couldn't be wired up by just fetching an existing resource the
way Tasks' `workspace.tasks` or Projects' `houses/:houseId/projects`
could.

## Decision

- **New `CalendarEvent` model**, scoped to a house
  (`organizationId`), optionally linked to a `Project`
  (`projectId String?`, `onDelete: SetNull` so deleting a project doesn't
  cascade-delete its calendar history), and recording who created it
  (`createdById`). Fields mirror the mock's shape exactly: `title`,
  `date` (string, `YYYY-MM-DD` - matching how the mock and `Task.dueDate`
  both already treat dates as opaque strings, not `DateTime`), `time`
  (freeform string like `"2:00 PM"` or `"EOD"` - matching the mock's
  loose non-24-hour input), `location` (optional), `category` (string,
  validated against the same six-value enum the frontend already had:
  `shoot` / `post-production` / `meeting` / `pre-production` / `delivery`
  / `other`).
- **"Calendars" become real Projects, not a separate table.** The mock's
  `calendarSources` was 4 hardcoded fake entries (one generic "My
  Schedule" plus three fake production names). Rather than building a
  parallel `Calendar` concept, a house's real calendar list is now: "My
  Schedule" (a fixed pseudo-source for events with no `projectId`) plus
  one real entry per `Project` in the house. Toggling a project's
  visibility in the Calendars panel filters events by `projectId` - a
  real, meaningful filter instead of a decorative one over fake data.
  This is the same "don't invent a fake parallel roster" call Crews made
  for its member list (ADR 0028).
- **Create + list only**, membership-gated like every other module
  (`GET`/`POST /api/v1/houses/:houseId/calendar-events`) - no update or
  delete endpoint yet, matching the minimal-first-slice precedent set by
  Comments and Messages (create + list, no edit).
- **List is sorted `date asc, time asc`** (chronological) rather than
  newest-first, since a calendar reads earliest-to-latest.
- **`projectId` is validated against the house** when provided (`404
project_not_found` if the project doesn't exist or belongs to a
  different house) - the same cross-house-leakage guard every other
  module's optional foreign key gets.

## Alternatives

- Derive calendar events from `Task.dueDate` instead of a new model.
  Rejected after actually comparing shapes: the mock needs time-of-day,
  location, and category, none of which exist on `Task`, and a task's due
  date is a deadline, not a scheduled event - conflating them would
  either force fake data onto `Task` or silently misrepresent task
  deadlines as calendar appointments.
- Keep `calendarSources` as a separate, purely cosmetic concept unrelated
  to `Project`. Rejected: the mock's fake calendar names
  (`Beyond Frames`, `Ad Campaign`, `Wanderers Documentary`) were
  transparently supposed to represent productions - mapping the concept
  onto real `Project` rows keeps the filter meaningful instead of
  decorative.
- Add update/delete now. Rejected as unnecessary scope for this pass -
  no other module this session shipped edit/delete on its first pass
  either (Comments, Messages); can be added later if a real need shows up.

## Tradeoffs

Benefits:

- The Calendar page's month grid, mini-calendar, upcoming-events panel,
  category filters, and calendar-source filters all now read/write real
  data - curl-verified (create with and without a `projectId`, list
  ordering, `404` on a foreign project id, `400` on a missing title,
  `401` unauthenticated) and live-browser-verified (logged in, saw two
  curl-seeded events render on the correct days, created a third event
  through the "New Event" popover with a real project selected, watched
  it appear immediately in both the month grid and the upcoming-events
  panel).
- No fabricated calendars: every entry in the Calendars panel is either
  "My Schedule" or a real house project.

Costs:

- No update/delete on calendar events yet - once created, an event is
  permanent until a future pass adds it (same current limitation
  Comments and Messages have).
- Week/Day tab views remain the pre-existing decorative empty state
  (`CalendarEmptyView`) - out of scope for this pass, which only wired
  the already-functional Month view.
- Real RBAC gap applies here too: any house member can create a calendar
  event, same as every other module.

## Future Implications

- The "calendars = My Schedule + real Projects" mapping means Calendar
  automatically stays in sync with Projects going forward with no extra
  wiring - a new project immediately becomes a filterable calendar.
- If per-event edit/delete or recurring events are ever needed, they
  follow the same membership-gated pattern already established.
