# 0050: HUD — Personal Workspace Redesign of the Home Page

Date: 2026-07-16

Status: Accepted

## Problem

The `/home` page was a generic house-wide dashboard (greeting, 4 stat
cards, upcoming schedule, my tasks, recent projects, recent activity).
The ask was a "HUD" centered on one question — "what do I need to do
right now" — dominated by a single Focus Card for the user's current
task (live timer, checklist, drafts, Drive link), personal task
groupings, personal productivity stats, and small always-on-me widgets
(notifications, team presence, today's schedule), modeled after
Linear's My Work / Notion Home / a personal productivity dashboard.

## Decision

Exploration found most of the required machinery already existed and
was simply unused by any UI:

- **Timer**: `TaskTimeEntry` (start/stop session log) plus
  `tasksService.startTimer`/`stopTimer` and their routes/client
  functions were fully built, only ever consumed inside
  `task-detail-panel.tsx`. The Focus Card reuses the exact same
  `startTaskTimer`/`stopTaskTimer`/`listTaskTimeEntries` functions,
  ticking a live "Current Session" clock via `setInterval` client-side.
- **Checklist, attachments, Drive**: all reused as-is
  (`listTaskAttachments`, `uploadTaskAttachment`,
  `listChecklistItem`/toggle/delete). No new backend for any of these.
- **"Continue Editing" opens the real `TaskDetailPanel`** (unchanged)
  rather than re-implementing checklist/attachment/comment editing a
  second time — the Focus Card itself is a new, lighter-weight summary
  component (task fields, timer, quick-link tiles), not a reskin of the
  existing detail modal.
- **"My Tasks" groups** (Active/Today/Upcoming/Review/Blocked/Done) are
  a pure client-side `.filter()` over the already-loaded
  `workspace.tasks`, scoped to the current user's assignments — no new
  endpoint.
- **Focus task selection** is client-side and deliberately simple:
  among the user's open (non-completed/archived) assigned tasks, prefer
  one already `in-progress`, else `todo`, sorted by priority then
  nearest due date. Checking for "has a running timer" across every
  task would require an extra per-task fetch; this status-based
  approximation avoids N+1 requests.
- **One new backend endpoint**: `analyticsService.getMyStats(userId,
houseId)` (`GET /api/v1/houses/:houseId/analytics/me`), added next to
  the existing house-wide `getAnalytics` in the same file/style: tasks
  completed/pending, completion rate, on-time completion % (using
  `task.updatedAt <= task.dueDate` as an approximation — there's no
  dedicated `completedAt` column, and adding one for a single metric
  wasn't worth a migration), working hours (today/week/month/total from
  `TaskTimeEntry` + `TimeEntry`), and a work streak (current/best
  consecutive days with logged time) — no new schema.
- **Cross-cutting reuse**: `usePresence` + `AvatarWithStatus` for Team
  Online; `listNotifications()` + the notification bell's existing
  `TYPE_DESTINATION` map (exported, not duplicated) for a Notifications
  preview; `listCalendarEvents()` filtered to today for Today's
  Schedule.
- **Weather**: browser Geolocation API (one-time permission prompt) +
  Open-Meteo for current temperature/condition (keyless) +
  BigDataCloud's reverse-geocode-client endpoint for a place name
  (keyless) — both plain client-side `fetch` calls, `sessionStorage`
  cached for 30 minutes, hidden silently on permission denial or any
  fetch error. No schema change, no server involvement.
- **Focus Mode** is a `localStorage`-backed toggle
  (`apps/web/src/lib/focus-mode.ts`) in the sidebar footer. Toggling it
  hides the sidebar/topbar entirely (reusing the same conditional-render
  pattern `AppShellGate` already used for the Dashboard's full-bleed
  view) and shows a small floating "Exit Focus Mode" pill, since hiding
  the sidebar removes the only control that could turn it back off.

## Alternatives

- **A per-task "has running timer" check server-side to pick the focus
  task.** Rejected for this pass — would need a new aggregate query or
  N+1 per-task fetches; the priority/due-date heuristic is a reasonable
  approximation without extra requests.
- **Reskinning `TaskDetailPanel` into an embeddable/non-modal mode** for
  the Focus Card. Rejected — the mockup's card is a compact summary, not
  a full editor; a new lightweight component that opens the existing
  modal for deep editing avoids duplicating checklist/attachment/comment
  UI while keeping the HUD's dominant card visually distinct.
- **A `completedAt` column on `Task`** for exact on-time-completion
  tracking. Rejected — a single approximate metric doesn't justify a
  migration; `updatedAt` at time of the status-to-`completed` transition
  is a close enough proxy.

## Explicitly Skipped (own future phase)

- **Attendance/Clock-In-Out, Leave management** — no schema, no policy
  model (approval flow, balances) specified.
- **Achievements/Badges, Personal Skills leveling, Assigned Equipment**
  — entirely new gamification/inventory schemas with no spec beyond a
  name list.
- **Voice Room** — this app has no WebRTC/voice infrastructure at all.
- **Automated "Productivity Insights" text generation and "End of Day
  Summary"** — need a text-generation strategy (rules vs LLM) not
  specified; the real numbers behind both are already visible elsewhere
  on the HUD (Personal Stats, My Tasks) in the meantime.
- **Private Notes (markdown)** — a genuinely separate feature (new
  model); a small, easy Phase 2 add-on, left out to keep this phase
  scoped to "what do I need to do right now."
- **Full draft version history** (replace-version, view-previous-
  versions UI) — Phase 1 ships upload-as-new-attachment with a computed
  "Draft Vn" label (attachment count + 1); a dedicated version-history
  view is a follow-up.
- **"Mark Blocked" button** — there's no manual blocked flag
  (`isBlocked` is derived only from task dependencies); blocking a task
  already happens by adding a dependency in the existing task panel.
- **Mini month-calendar widget** — kept as a "Today's Schedule" list
  (today's events only) plus a task-based "Upcoming Deadlines" list,
  instead of building a second month-grid renderer alongside the real
  `/calendar` page.

## Tradeoffs

Benefits:

- Nearly every HUD feature reuses an already-built, already-tested
  backend function or client function — the Focus Card's timer,
  checklist, attachments, and Drive-adjacent actions ride on exactly the
  same code paths `task-detail-panel.tsx` already exercises in
  production.
- The only new backend surface is one read-only aggregate endpoint
  (`getMyStats`), following the exact batched-query style already
  established in `analytics.service.ts`.

Costs:

- The focus-task heuristic (status + priority + due date) can pick a
  different task than "the one I was just actively timing" if a user
  has multiple `in-progress` tasks — acceptable for Phase 1, revisit if
  it proves confusing in practice.
- "Drive Folder" links to the in-app Files page rather than an external
  Google Drive URL — no client-facing Drive web link is exposed by the
  API today (only a server-side `driveKey`); wiring a real external link
  would need a new resolve-link endpoint, which wasn't in the original
  ask's list of reused infrastructure.
- Verified live in-browser with a real logged-in session (typecheck/
  lint/build clean beforehand): Focus Card renders and selects the
  correct task, timer start/stop persists correctly (`task_time_entries`
  row confirmed via direct DB query, then cleaned up), Today's/Total
  Time update after a stop, My Tasks group tabs filter correctly,
  Personal Stats render real numbers, Submit Draft's version-numbering
  and upload wiring were confirmed to fail identically to the existing
  `TaskDetailPanel` attachment upload (this test house has no Google
  Drive connected, per ADR 0045 — a pre-existing environment constraint,
  not a regression), and Focus Mode correctly hides/restores the
  sidebar and topbar.

## Future Implications

- Custom Fields, Pomodoro Mode, Gantt/Timeline, and an advanced filter
  builder remain open from ADR 0049, unaffected by this pass.
- Notes, achievements/skills/equipment, attendance/leave, and voice
  rooms remain candidates for a future phase, each likely needing its
  own schema and scoping pass.
- A real "Open in Google Drive" external link for the Drive Folder
  quick-link would need a new endpoint exposing the resolved Drive web
  view URL client-side.
