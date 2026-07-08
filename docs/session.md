# Sessions

Append every development session to this file.

## Session 1

Date: 2026-06-29

Goal:

- Create the initial documentation-first foundation before application code.

Completed work:

- Created core project documentation.
- Added project specification.
- Added project memory, progress, roadmap, features, changelog, architecture,
  database, API, deployment, coding standards, decisions, and ADR directory.

Problems encountered:

- None.

Decisions made:

- No application code should be written until Phase 1 planning is complete.

Next session objective:

- Expand the bootstrap documentation, create baseline ADRs, and finalize the
  architecture, database, authentication, permissions, deployment, and coding
  standards planning baseline.

## Session 2

Date: 2026-06-29

Goal:

- Apply the master bootstrap prompt and complete the foundation planning
  documents.

Completed work:

- Added permanent master index, AI rules, product principles, tech stack,
  glossary, session, authentication, and permissions documents.
- Created initial ADRs for monorepo, database, authentication, permissions,
  realtime, and deployment decisions.
- Strengthened architecture, database, API, deployment, coding standards,
  roadmap, decisions, progress, and context documentation.

Problems encountered:

- None.

Decisions made:

- Establish a monorepo with `apps/web`, `apps/api`, and shared `packages`.
- Use PostgreSQL with Prisma.
- Use JWT access tokens with rotated refresh tokens.
- Use hybrid RBAC and policy-based permissions.
- Use Socket.IO for realtime collaboration.
- Use Docker, Nginx, GitHub, and Hostinger VPS for the initial deployment path.

Next session objective:

- Scaffold the monorepo only after confirming the Phase 1 baseline is approved.

## Session 3

Date: 2026-06-29

Goal:

- Execute Sprint 0 foundation and audit Hostinger Node.js deployment after a
  successful build returned HTTP 403.

Completed work:

- Created npm workspace foundation with root scripts and `apps/web` Next.js App
  Router app.
- Configured TypeScript, TailwindCSS, ESLint, Prettier, Husky, lint-staged,
  Docker, GitHub Actions CI, environment examples, and git ignores.
- Added root `server.js` as the Hostinger startup entry for the generated
  standalone Next.js server.
- Added postbuild standalone static asset sync.
- Added Hostinger deployment documentation and updated decisions.
- Added `npm run build:hostinger` static export for Hostinger Git deployments
  that use a publish directory.

Problems encountered:

- Latest `lint-staged` required a newer Node version than the local baseline.
- ESLint 10 was not compatible with the React plugin bundled by Next 16.2.9.
- Local sandbox blocked Next build worker spawning, but the same build passed
  outside the sandbox.
- Hostinger deployment returned HTTP 403 after a successful build, indicating a
  deployment routing/startup mismatch rather than a Next.js compile failure.
- The repeated 403 indicates Hostinger is likely serving a static directory
  without an `index.html` or using the wrong publish directory.

Decisions made:

- Use npm workspaces from the repository root.
- Deploy Hostinger from the repository root, not `apps/web`.
- Use root `server.js` as the production startup file.
- Use `dist/hostinger` as the publish directory when Hostinger is configured as
  a static Git deployment.
- Keep Docker files for container/VPS deployment; they do not control
  Hostinger Node.js Git deployment.

Next session objective:

- Redeploy using either static Git mode (`npm run build:hostinger`,
  `dist/hostinger`) or Node.js mode (`server.js`) and confirm HTTP 200 before
  beginning Sprint 1.

## Session 4

Date: 2026-07-04

Goal:

- Complete Sprint 1 system architecture documentation without implementing
  application features.

Completed work:

- Expanded `docs/architecture.md` into the complete technical architecture
  baseline.
- Documented system, frontend, backend, database, API, authentication,
  authorization, organization hierarchy, project hierarchy, file storage,
  realtime, AI integration, mobile compatibility, deployment, and scaling
  architecture.
- Added ADRs 0008 through 0016.
- Updated decisions, context, roadmap, progress, ADR index, and master index.

Problems encountered:

- None.

Decisions made:

- Keep Sprint 1 documentation-only.
- Do not implement feature code, migrations, API endpoints, or placeholder
  packages during Sprint 1.

Next session objective:

- Wait for explicit direction before beginning implementation.

## Session 5

Date: 2026-07-04

Goal:

- Record the new two-developer development direction and frontend-only
  workstream rules.

Completed work:

- Updated AI rules, architecture, API, context, roadmap, progress, decisions,
  ADR index, and master index.
- Added ADR 0017 for frontend/backend independence.
- Documented that this workstream focuses only on frontend development.
- Documented that the backend is treated as a black box owned by another
  developer.
- Documented the API-contract and mock-service workflow for frontend features.

Problems encountered:

- None.

Decisions made:

- Frontend must never depend on Prisma, SQL, database logic, backend business
  logic, backend validation implementations, NestJS internals, storage
  internals, queues, or backend infrastructure.
- Frontend communicates only through documented public API contracts.
- Frontend features must use realistic mock services until backend APIs exist.
- Backend implementation must not be added in this workstream unless the user
  explicitly changes direction.

Next session objective:

- Continue with frontend-only implementation. For each backend dependency,
  define the API contract, create a mock service, and build the UI against that
  service abstraction.

## Session 6

Date: 2026-07-04

Goal:

- Build the first frontend base scope with login, houses, roles, task
  scheduling, task assignment, and chat rooms.

Completed work:

- Replaced the Sprint 0 landing shell with a mock-backed frontend workspace.
- Added a login page backed by a mock auth service.
- Added house creation, house joining, and house switching UI.
- Added house roles inspired by Discord-style creative production roles such as
  editor, videographer, and photographer.
- Added task scheduling and task assignment UI.
- Added chat rooms and mock message sending.
- Added frontend-safe types and a base workspace mock service.
- Documented public API contracts for login, workspace snapshot, houses, tasks,
  and chat messages.

Problems encountered:

- The sandboxed Next.js production build compiled successfully but failed when
  spawning a build worker with `spawn EPERM`.
- The same production build passed outside the sandbox with the approved
  PowerShell build command.

Decisions made:

- Keep all base data access behind frontend service abstractions.
- Use realistic mock data until the backend team implements the documented
  public API contracts.
- Do not implement backend logic, Prisma, SQL, migrations, or server endpoints.

Next session objective:

- Refine the frontend base UX, extract reusable design-system primitives when
  duplication appears, and choose the frontend state/server-state strategy.

## Session 7

Date: 2026-07-04

Goal:

- Redesign the login page to match the provided Fylmico visual reference.

Completed work:

- Rebuilt the logged-out screen as a light cinematic split login page.
- Added brand mark, left-side production headline, feature cards, quote panel,
  right-side auth card, login/signup tabs, forgot-password link, social login
  buttons, and security note.
- Generated and added a project-local cinematic production background image at
  `apps/web/public/images/login-production-set.png`.
- Preserved the existing mock login service behavior and workspace entry flow.

Problems encountered:

- The first pass was too tall for a 1280x720 viewport and had visual overlap
  between the security note and social buttons.
- Tightened spacing and adjusted supporting panels to remove visible overlap.

Decisions made:

- Use a generated project-local background asset instead of embedding the
  provided screenshot as a page background.
- Keep the login redesign frontend-only with no backend implementation changes.

Next session objective:

- Continue polishing the frontend base workspace and extract reusable auth/UI
  primitives when patterns settle.

## Session 8

Date: 2026-07-04

Goal:

- Apply the provided post-login page references to the next frontend states.

Completed work:

- Added a no-house onboarding screen after login.
- Added a light Fylmico app shell with sidebar navigation, search, create
  action, notification control, and user avatar.
- Added a production dashboard with stat cards, upcoming schedule, my tasks,
  recent projects, recent activity, house management, task scheduler, and chat.
- Updated mock login to start without a house.
- Updated mock create-house and join-house flows to activate a populated
  dashboard state.

Problems encountered:

- A form reset ran after an awaited mock service call when React had already
  released `event.currentTarget`, causing a runtime error.
- Fixed by capturing the form element before awaiting.

Decisions made:

- Keep these next pages frontend-only and mock-backed.
- Use the provided references as layout and visual direction while preserving
  the existing API-contract/mock-service boundary.

Next session objective:

- Refine responsive dashboard layouts and begin extracting repeated card,
  sidebar, form, and panel patterns into reusable UI primitives.

## Session 9

Date: 2026-07-04

Goal:

- Make the current frontend base interactive and polished without implementing
  backend functionality.

Completed work:

- Added local app-shell interaction state for active navigation, create menu,
  notifications, and search preview.
- Added local dashboard interactions for schedule selection, task completion,
  project selection, chat room switching, and mock message sending.
- Added polished motion and state styling for panels, controls, popovers,
  progress bars, schedule rows, task rows, and project cards.
- Preserved the mock-service boundary and did not add database, backend,
  Prisma, SQL, or server implementation work.

Problems encountered:

- The in-app browser tab lost its localhost connection after the production
  build, so the dev server had to be restarted.
- Some browser Playwright clicks timed out on visible controls, so verification
  used the visible DOM interaction path for those controls.

Decisions made:

- Keep interactivity in frontend-local state until public backend APIs exist.
- Leave backend work as explicit tasks for authenticated workspace snapshots,
  house APIs, schedule persistence, task persistence, project details,
  notifications, chat rooms, websocket delivery, and message persistence.
- Add reduced-motion support alongside the new animations.

Validation:

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed outside the sandbox.
- Browser-verified login, create-house transition, create menu, notification
  popover, search preview, schedule selection, task completion, project
  selection, room switching, and mock message sending.

Next session objective:

- Extract repeated UI into design-system primitives and continue building the
  frontend against API contracts/mock services only.

## Session 10

Date: 2026-07-07

Goal:

- Adopt the documented Tailwind v4 + shadcn/ui design system and rebuild the
  base frontend (login, app shell, dashboard, onboarding) on real Next.js
  routes, matching provided reference mockups.

Completed work:

- Bootstrapped shadcn/ui on Tailwind v4 and rebuilt the login screen
  pixel-matched to the design reference, replacing the hand-written CSS
  version.
- Introduced an `(app)` route group with a shared authenticated layout (auth
  gate, workspace bootstrap, house-presence redirect), replacing the
  single-component `BaseWorkspace` view-switcher entirely.
- Built the app shell (compact/full sidebar, topbar), a home dashboard
  (stat cards with sparklines, schedule, tasks, projects, activity), and a
  no-house onboarding screen, each pixel-matched to shared reference
  mockups.
- Sourced and vetted free-license stock photos for project thumbnails and
  team avatars.
- Deleted the superseded `base-workspace.tsx`, the old root `page.tsx`, and
  roughly 1900 lines of now-dead hand-written CSS.
- Audited the repository for residue: removed an accidentally-committed
  cache folder from a different AI coding tool, and three dead icon assets
  left over from the pre-rebuild login markup.
- Discovered `main` had not been updated with this branch's work since PR
  #1; merged `frontend` into `main` and pushed both.
- Brought README, MASTER_INDEX-adjacent docs, roadmap, context, and progress
  logs back in line with actual shipped state (they still said "Phase 1,
  no features implemented").

Problems encountered:

- A `useSyncExternalStore` hydration race let an already-logged-in user
  bounce to `/login` before the real session value settled; fixed with an
  explicit post-hydration mount guard.
- Flex/grid children without `min-w-0` caused horizontal overflow on the
  dashboard at common viewport widths; fixed by adding `min-w-0` to the
  affected grid items.
- Root-level Hostinger static-export artifacts and documentation had drifted
  significantly out of sync with the actual codebase state.

Decisions made:

- Keep `services/base-workspace.service.ts` and `types/base.ts` as single
  files for now; domain-splitting them is deferred until a feature actually
  needs the separation.
- Leave remaining sidebar nav items (Projects, Calendar, Tasks, Crews,
  Files, Storyboard, Messages, Bookings, Analytics, Settings) as
  non-navigating placeholders rather than scaffolding throwaway routes.

Validation:

- `npm run lint`, `npm run typecheck`, `npm run build`, and
  `npm run build:hostinger` all passed.
- Browser-verified the full flow: login, no-house onboarding, house
  creation, dashboard rendering, task checkbox toggle, non-navigating nav
  items.

Next session objective:

- Build the next dedicated page (Projects, Calendar, or Tasks) one at a
  time, using the shared reference mockups as ground truth.

## Session 11

Date: 2026-07-07

Goal:

- Build the Calendar page (`/calendar`) as a real Next.js route,
  pixel-matched to a provided design reference, following the established
  route + Tailwind/shadcn + colocated-mock-data pattern.

Completed work:

- Added `apps/web/src/lib/calendar-utils.ts` (Monday-start month grid,
  date formatting/comparison helpers) and
  `apps/web/src/components/calendar/calendar-data.ts` (event categories,
  calendar sources, mock events matching the reference).
- Built the Calendar page and its components: header (date navigation,
  month/year jump popover, Month/Week/Day tabs, category filters popover),
  month grid with colored event pills and a legend, a mini calendar
  synced to the same month cursor, a "Calendars" checklist panel, and an
  "Upcoming (Next 7 Days)" panel.
- Week and Day tabs intentionally render a "coming soon" empty state
  instead of fake grids, since only the Month view was designed.
- Turned the sidebar's Calendar entry from a non-navigating placeholder
  into a real link (`nav-items.ts`).
- Made "New Event" a working create flow (`new-event-popover.tsx`,
  replacing the decorative `new-event-button.tsx`): a `Popover` form
  (title, date, time, location, event-type pills, calendar pills) -
  the app's first "create" UI (`createTask`/`createHouse` exist as mock
  services with no UI wired to them yet). Lifted `calendarEvents` into
  page-local state in `calendar-page.tsx` (same pattern as
  `completedTaskIds` in `home-dashboard.tsx`) so created events can be
  appended without a backend; on create, the active filters expand to
  include the new event's category/calendar and the grid/mini calendar
  jump to its date so it's always immediately visible. Deduplicated
  `CATEGORY_ORDER` (previously copy-pasted in two files) into
  `calendar-data.ts` once a third consumer needed it.

Problems encountered:

- `getMonthGrid` had a date-construction bug: padding days were computed as
  `new Date(year, month, gridStart.getDate() + i)`, which reused the
  previous month's day-of-month against the current month index once the
  leading offset rolled back across a month boundary, rendering a
  nonexistent "June 31" instead of "July 1". Fixed by computing every grid
  day directly as an offset from the 1st of the visible month.
- The page's `Tabs`/`TabsContent` (a flex column) had no `min-w-0`, so its
  month-grid child refused to shrink at narrow viewports and inflated the
  flex box past its column. Fixed by adding `min-w-0` at the usage site and
  giving the month grid its own `overflow-x-auto` with a `min-w-[42rem]`
  inner track, so the inherently-wide 7-column grid scrolls locally instead
  of widening the page.
- Confirmed (not introduced by this change): the app shell's sidebar/topbar
  have no responsive breakpoint at all (`compact` is only tied to the
  `/houses/new` route), so every authenticated page overflows horizontally
  at narrow mobile widths; the existing home dashboard overflows more than
  the new Calendar page at the same width. Left as-is; fixing it is shared
  app-shell work outside this page's scope.

Decisions made:

- Kept Calendar mock data colocated in `components/calendar/calendar-data.ts`
  rather than adding to `types/base.ts`, matching the existing
  `components/dashboard/*-data.ts` convention.
- Scoped Week/Day views to an empty state rather than building fake grids,
  since only the Month view had a design reference.

Validation:

- `npm run lint`, `npm run typecheck`, `npm run build` all passed (both for
  the initial page and again after adding event creation).
- Browser-verified `/calendar`: month grid dates and events, prev/next/
  Today navigation, month/year jump popover (kept the mini calendar in
  sync), Month/Week/Day tab switching, category filters and calendar-source
  checkboxes hiding/showing events on both the grid and the Upcoming panel.
- Browser-verified New Event: submitting with an empty title/time showed
  the inline "Title and time are required." error and kept the popover
  open; a valid submit for today closed the popover and the event appeared
  on the month grid, the Upcoming panel, and the mini calendar's dot; a
  valid submit for a different month (August) auto-jumped the grid and
  mini calendar to that month and showed the event on the correct day.

Next session objective:

- Build the next dedicated page (Projects or Tasks), following the same
  route + Tailwind/shadcn + mock-service pattern.

## Session 12

Date: 2026-07-08

Goal:

- Build the Analytics page (`/analytics`) as a real Next.js route,
  pixel-matched to a provided design reference.

Completed work:

- Added `components/analytics/analytics-data.ts` (stat cards, project
  progress series, task status, weekly time-logged series, time
  distribution, activity heatmap matrix, top projects, contributors, and
  workload - all colocated mock data, no backend).
- Added reusable hand-rolled SVG chart primitives: `multi-line-chart.tsx`
  (multi-series line/area chart with end-of-line value badges),
  `donut-chart.tsx` (segment-based donut, reused by both Task Status and
  Time Distribution panels), `mini-area-chart.tsx` (small weekly area chart
  with a peak callout), and `activity-heatmap.tsx` (day x time-of-day
  intensity grid). No charting library was added; this extends the pattern
  already established by `dashboard/sparkline.tsx`.
- Built the Analytics page and its panels: header, 5 stat cards (reusing
  `dashboard/stat-card.tsx`/`sparkline.tsx` unmodified), Project Progress,
  Task Status, Time Logged, Time Distribution, Activity Heatmap, Top Active
  Projects, Top Contributors, Team Workload, and a bottom insight banner.
- Reused existing sourced assets (project thumbnails, member avatars via
  `AvatarWithStatus`) instead of inventing new ones.
- Turned the sidebar's Analytics entry from a non-navigating placeholder
  into a real link.

Problems encountered:

- `donut-chart.tsx` initially mutated a `cumulative` variable inside the
  `.map()` used in JSX to compute each arc's `strokeDashoffset`, which
  violates the React Compiler's immutability rule
  (`react-hooks/immutability`, "Cannot reassign variable after render
  completes"). Fixed by precomputing all arc offsets in a plain `for` loop
  before the JSX return.
- Substantial other work landed on this branch in parallel during this
  session (Projects, Tasks, Crews, Files, Storyboard, Messages, Settings
  pages all got real routes) without corresponding `docs/progress.md`/
  `docs/session.md`/`docs/changelog.md` entries. Left that work's own
  documentation as-is rather than guessing at decisions this session
  wasn't part of; only updated the `Analytics` row in `docs/features.md`
  and corrected the now-stale "non-navigating placeholder" list in
  `docs/roadmap.md` Phase 2 to reflect which routes actually exist now.
  `node_modules` was also missing the `motion` dependency those commits
  added, and `.next/types/routes.d.ts` was stale for the new routes;
  `npm install` + `npm run build` fixed both before `npm run lint`/
  `npm run typecheck` could pass cleanly for this session's own files
  (unrelated pre-existing errors remain in `crews-page.tsx`,
  `storage-overview-panel.tsx`, `profile-section.tsx`, and
  `settings-data.ts` - not this session's files, left untouched).
- The local browser-preview tooling got stuck mid-session (an orphaned
  `next dev` process from earlier in the session was holding Next.js's
  single-instance lock, so new preview servers silently failed to start).
  Diagnosed via the dev server's own error output and stopped that specific
  process (not a broad process kill) to unblock it.

Decisions made:

- No charting library - hand-rolled SVG only, consistent with
  `sparkline.tsx` and to avoid a new dependency for a page that's still
  frontend-mock-only.
- Analytics is read-only/reporting; the header's date-range, Filters, and
  Export controls are decorative labels only (no working date picker or
  export), matching the existing "Add Calendar" decorative-button
  precedent from Calendar - explicitly scoped out rather than half-built.

Validation:

- `npm install`, `npm run lint`, `npm run typecheck`, `npm run build` all
  passed for this session's files (pre-existing errors in other sessions'
  files, listed above, are unrelated and unchanged).
- Browser-verified `/analytics`: all 5 stat cards render with sparklines;
  the multi-line chart renders 4 distinct series with a legend and correct
  end-of-line percentage badges; both donut charts render correct-looking
  arcs with matching legends; the heatmap grid renders with its legend;
  Top Active Projects/Top Contributors/Team Workload render with the reused
  avatar/project images and progress bars; sidebar "Analytics" now
  navigates and shows the active state.

Next session objective:

- Confirm with the team what's actually left to build given how much
  landed in parallel this session (Bookings appears to be the only
  remaining non-navigating sidebar placeholder); backfill
  progress/session/changelog documentation for the Projects/Tasks/Crews/
  Files/Storyboard/Messages/Settings work if that wasn't done elsewhere.

## Session 13

Date: 2026-07-08

Goal:

- Build the Bookings page (`/bookings`) as a real Next.js route,
  pixel-matched to a provided design reference.

Completed work:

- Added `components/bookings/bookings-data.ts` (booking rows, stat
  cards, bookings-by-type segments, upcoming bookings, tab counts - all
  colocated mock data, no backend).
- Built the Bookings page and its components: header, a status/scope
  tabs bar (`Tabs`/`TabsList variant="line"`) that filters the table by
  All/My Bookings (current-user match)/Pending/Confirmed/Cancelled, 4
  stat cards, a bookings table (category icon tile, resource, project +
  phase, dates, status pill, booked-by avatar, row menu), decorative
  pagination, and a right rail (Bookings by Type donut, Upcoming
  Bookings, Booking Calendar).
- Reused generic UI across feature folders instead of rebuilding: the
  Calendar page's `MiniCalendar` for the Booking Calendar panel, and the
  Analytics page's `DonutChart` for Bookings by Type - both worked
  directly since neither had domain coupling.
- Made `dashboard/stat-card.tsx`'s `sparklinePoints` prop optional
  (backward-compatible) so the "Pending Approval" stat card can render
  without a sparkline, matching the reference.
- Turned the sidebar's Bookings entry from a non-navigating placeholder
  into a real link - the last remaining placeholder nav item.
- Since there are no sourced equipment/venue photos in this app (unlike
  projects/avatars), booking thumbnails use tinted category icon tiles
  (Building2/Camera/DoorOpen) rather than sourcing new stock photos for a
  mock page.

Problems encountered:

- Reusing `MiniCalendar` directly inside a `DashboardPanel` would have
  nested two bordered cards (it already renders its own card chrome),
  violating the "avoid nested cards" coding standard. Fixed by dropping
  the `DashboardPanel` wrapper for that one panel and using a plain
  title/link row above the calendar instead.
- The local preview tooling got stuck again (same root cause as Session
  12: orphaned `next dev` processes from earlier in the session holding
  ports 3001 and 3002). Diagnosed via `curl` against those ports and
  stopped the two specific PIDs (not a broad process kill) to unblock it.

Decisions made:

- Tab filtering is real (client-side, against the mock row array); "New
  Booking," "Filters," and pagination remain decorative, matching the
  established precedent for secondary controls not central to the page's
  core ask.

Validation:

- `npm run lint`, `npm run typecheck`, `npm run build` all passed for
  this session's files (same unrelated pre-existing errors in other
  sessions' files noted in Session 12 remain, untouched).
- Browser-verified `/bookings`: stat cards, table rows, status pill
  colors, and right-rail panels all render correctly; clicking
  "Cancelled" filtered the table to the 1 matching row; clicking "My
  Bookings" filtered to the 2 rows booked by the current user; resetting
  to "All Bookings" restored all 10 rows.

Next session objective:

- Same as Session 12: confirm with the team what's left, and consider
  backfilling documentation for the parallel work.
