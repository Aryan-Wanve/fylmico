# 0031: Time Tracking and Analytics

Date: 2026-07-11

Status: Accepted

## Problem

Unlike Tasks/Projects/Crews/Calendar, the Analytics page's mock didn't
just have missing fields on an otherwise-matching model - roughly half
of it depended on a feature that didn't exist anywhere in the backend at
all: **time tracking**. Hours logged, hours-per-production-phase, team
workload percentages, and a per-project progress-over-time trend all
assume someone somewhere recorded hours against a date - no `TimeEntry`
concept, no historical snapshots of anything, existed prior to this pass.
Asked how to proceed (extend with real counts only vs. build time
tracking as its own feature vs. skip Analytics for now), the explicit
choice was to build time tracking first, then wire Analytics to genuine
data from it.

## Decision

- **New `TimeEntry` model**: `organizationId`, optional `projectId`
  (`onDelete: SetNull`, matching `CalendarEvent`'s precedent), `userId`,
  `phase` (default `"Production"`; one of `Pre-Production` / `Production`
  / `Post-Production` / `Planning` - the same four phases the original
  mock's `timeDistributionSegments` already used), `hours` (`Float`, so
  `2.5h` entries are representable), `date` (string, `YYYY-MM-DD` -
  consistent with `Task.dueDate`/`CalendarEvent.date`), optional `note`.
- **`POST`/`GET /api/v1/houses/:houseId/time-entries`** - create + list
  only, membership-gated, `projectId` validated against the house when
  given, matching the minimal-first-slice precedent from Comments/
  Messages/Calendar.
- **A "Log Time" popover on the Analytics page itself**, not a separate
  page - there's no dedicated time-tracking page anywhere in the
  designed UI, and Analytics is where logged time is consumed, so
  logging it from the same page keeps the loop tight (log time, watch
  the dashboard update immediately).
- **A single `GET /api/v1/houses/:houseId/analytics` aggregation
  endpoint** computes every number the page needs server-side (stat
  totals, task-status breakdown, daily time-logged series, phase
  distribution, top active projects, per-project daily hours, top
  contributors, team workload, activity heatmap) rather than shipping
  raw rows and making the frontend recompute aggregates - the frontend
  has no business re-deriving "top 5 contributors by hours" from a raw
  `TimeEntry[]` when the backend can do it once, correctly, in SQL-
  adjacent Prisma queries.
- **Concrete, documented definitions for previously-vibes-only metrics**:
  - _Active projects_: non-archived projects whose `stage` isn't
    `Completed` or `On Hold`.
  - _Team efficiency_: `tasksCompleted / tasksTotal * 100`, rounded.
  - _Team workload %_: hours logged by that member in the last 7 days,
    divided by a fixed 40-hour weekly capacity, capped at 100%. This is
    a stated assumption (a flat 40h/week capacity for everyone), not a
    discovered fact - documented here so it's easy to revisit.
  - _Activity heatmap_: bucketed from real `createdAt` timestamps across
    `Task`, `Message`, `Comment`, and `TimeEntry` (every timestamped
    thing that indicates someone did something), grouped by weekday and
    six 4-hour windows, then normalized to a 0-4 intensity scale relative
    to that house's own busiest bucket. With only a few days of sample
    data a real house's heatmap will look sparse - that's honest, not a
    bug, and will fill in as the house accumulates real activity.
- **Dropped, not faked, the pieces with no real backing even after time
  tracking exists**: the stat cards' sparklines and "+12% this month"
  growth notes (no historical daily snapshots exist to compute a trend
  from - only current totals), the header's static "Jul 1 – Jul 7, 2026"
  date-range button and "Export" button (both were inert decoration over
  a currently-nonexistent date-filter/export feature), and the
  `TrendingUp`/"18% more completed tasks" line on the Task Status panel
  and the Insight Banner's canned "🚀" copy (both hardcoded, unrelated to
  any real number) - replaced with an insight sentence computed from the
  real `analytics` payload.
- **Repurposed, rather than duplicated, the "Project Progress" chart**:
  the mock's multi-line chart showed a fake progress-percentage trend
  per project over 7 days - no historical progress snapshots exist to
  back that. Rather than dropping the chart outright, it now shows real
  **hours logged per top-active-project per day** (the same real
  `TimeEntry` data, just charted per-project instead of company-wide).
  `MultiLineChart` gained a `valueSuffix`/`maxValue` prop pair so it's no
  longer hardcoded to a 0-100 percent scale - a small, honest
  generalization rather than a second near-duplicate chart component.
- **Project cover art reused, not fake photos**: `TopActiveProjectsPanel`
  previously rendered a hardcoded `/images/dashboard/project-*.jpg` path
  per mock project. Replaced with the same `coverGradient`/`coverIcon`
  rendering `ProjectGridCard` already uses (ADR 0027) - no object storage
  exists, so a fabricated image path would have been actively misleading
  now that the project is real.

## Alternatives

- Derive "hours logged" from Task activity instead of building real time
  tracking. Rejected: `Task` has no duration/effort field and no
  completion timestamp - there's nothing there to derive hours from
  without inventing a number.
- Skip Analytics until a "real" time-tracking product spec exists.
  Rejected per the explicit choice made when asked - the app is meant to
  be fully working, and Analytics is one of the last major pages left.
- Make the analytics endpoint return raw `TimeEntry`/`Task`/`Project`
  rows and let the frontend aggregate. Rejected: every other stat
  (efficiency %, workload %, heatmap bucketing) has a specific
  definition that should live in one place (the service), not be
  re-derived slightly differently by whichever component needs it.
- Build a full leave/capacity-planning system to make "team workload %"
  precise per-person. Rejected as far beyond this pass's scope; the flat
  40h/week assumption is stated plainly instead.

## Tradeoffs

Benefits:

- Every number on the Analytics page is now real or honestly empty -
  curl-verified (create a time entry with/without a project, list
  ordering, `404` on a cross-house project, `400` on non-positive hours,
  full `GET .../analytics` payload shape) and live-browser-verified
  (logged in, saw real stat cards/task-status/time-distribution/
  activity-heatmap/top-contributors/top-active-projects/team-workload
  render from curl-seeded data, then logged a new time entry through the
  "Log Time" popover and watched Hours Logged, Time Distribution, Team
  Workload, and the Insight Banner update immediately with the new
  numbers).
- Time tracking is itself a real, reusable feature now, not just an
  Analytics implementation detail - `TimeEntry` is a first-class model
  other pages could read from later (e.g. a per-project time log).

Costs:

- No edit/delete on time entries yet (same first-pass scope as
  Comments/Messages/Calendar) - a logged entry is permanent until a
  future pass adds correction/removal.
- The 40-hour weekly capacity behind "team workload %" is a flat
  assumption, not configurable per person or house yet.
- The activity heatmap will look sparse for any house without much
  history - an honest reflection of real (currently small) sample sizes,
  not a bug, but worth knowing before assuming the visualization is
  "broken" on a fresh house.
- Real RBAC gap applies here too: any house member can log time entries
  against any project in the house.

## Future Implications

- `TimeEntry` is now available for other pages to build on (e.g. a
  project detail page's time log, or a personal "my hours this week"
  widget) without new schema work.
- If per-person weekly capacity ever needs to be configurable, it likely
  belongs on `CrewProfile` (ADR 0028), which already models per-person
  production data separate from core identity/membership.
- `MultiLineChart`'s new `valueSuffix`/`maxValue` props make it reusable
  for any future percent-or-unit time series without another rewrite.
