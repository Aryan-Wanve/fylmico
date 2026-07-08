# Progress

Update this file after every coding or documentation session.

## 2026-06-29

Current milestone: Phase 1 - foundation and planning

Completion percentage: 35%

Features completed:

- None.

Features started:

- None.

Files modified:

- `.gitignore`
- `README.md`
- `PROJECT_SPEC.md`
- `MASTER_INDEX.md`
- `package.json`
- `.prettierignore`
- `eslint.config.mjs`
- `apps/web/next-env.d.ts`
- `apps/web/tsconfig.json`
- `docs/context.md`
- `docs/progress.md`
- `docs/roadmap.md`
- `docs/features.md`
- `docs/changelog.md`
- `docs/architecture.md`
- `docs/database.md`
- `docs/api.md`
- `docs/deployment.md`
- `docs/coding-standards.md`
- `docs/decisions.md`
- `docs/adr/0007-sprint-0-foundation.md`

Files created:

- `README.md`
- `PROJECT_SPEC.md`
- `docs/context.md`
- `docs/progress.md`
- `docs/roadmap.md`
- `docs/features.md`
- `docs/changelog.md`
- `docs/architecture.md`
- `docs/database.md`
- `docs/api.md`
- `docs/deployment.md`
- `docs/coding-standards.md`
- `docs/decisions.md`
- `docs/adr/README.md`
- `MASTER_INDEX.md`
- `AI_RULES.md`
- `PRODUCT_PRINCIPLES.md`
- `docs/tech-stack.md`
- `docs/glossary.md`
- `docs/session.md`
- `docs/authentication.md`
- `docs/permissions.md`
- `docs/adr/0001-monorepo.md`
- `docs/adr/0002-database.md`
- `docs/adr/0003-authentication.md`
- `docs/adr/0004-permissions.md`
- `docs/adr/0005-realtime.md`
- `docs/adr/0006-deployment.md`
- `package.json`
- `package-lock.json`
- `.editorconfig`
- `.env.example`
- `.github/workflows/ci.yml`
- `.gitignore`
- `.npmrc`
- `.prettierignore`
- `.prettierrc.mjs`
- `.dockerignore`
- `Dockerfile`
- `docker-compose.yml`
- `eslint.config.mjs`
- `server.js`
- `scripts/sync-next-standalone-assets.mjs`
- `scripts/build-hostinger-static.mjs`
- `apps/web/package.json`
- `apps/web/.env.example`
- `apps/web/next-env.d.ts`
- `apps/web/next.config.ts`
- `apps/web/postcss.config.mjs`
- `apps/web/tsconfig.json`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/globals.css`
- `docs/adr/0007-sprint-0-foundation.md`
- `docs/hostinger-deployment.md`

Files removed:

- `apps/web/tsconfig.tsbuildinfo`

Database changes:

- None.

API changes:

- None.

Architecture changes:

- Established documentation-first project foundation.
- Documented intended monorepo direction from the project specification.
- Created ADR directory and decision-log structure.
- Accepted baseline architecture decisions for monorepo, database,
  authentication, permissions, realtime, and deployment.
- Implemented npm workspace foundation with `apps/web` as the first runnable
  app.
- Added root Hostinger startup entry that runs the generated Next.js standalone
  server.
- Added postbuild standalone static asset sync.
- Added Hostinger static export path for Git deployments that require a publish
  directory.

Performance improvements:

- None.

Bugs fixed:

- Fixed Hostinger deployment ambiguity where root `npm start` delegated to
  `next start` instead of the generated standalone server.
- Added `npm run build:hostinger` to prevent static Hostinger deployments from
  serving a directory without `index.html`.

Known bugs:

- Hostinger deployment must be redeployed with the correct mode and confirmed to
  return HTTP 200.

Technical debt:

- `apps/api` and `packages/*` are intentionally deferred until they contain real
  code.
- Object storage, email, background jobs, monitoring, and analytics providers
  remain deferred.

Next task:

- For static Git deployment, use build command `npm run build:hostinger` and
  publish directory `dist/hostinger`.
- For Node.js deployment, use startup file `server.js`.
- Confirm the deployed domain returns HTTP 200 before Sprint 1.

## 2026-07-04

Current milestone: Phase 1 - foundation and planning

Completion percentage: 55%

Features completed:

- None.

Features started:

- None.

Files modified:

- `docs/architecture.md`
- `docs/decisions.md`
- `docs/context.md`
- `docs/roadmap.md`
- `docs/progress.md`
- `docs/adr/README.md`
- `MASTER_INDEX.md`

Files created:

- `docs/adr/0008-modular-monolith-backend.md`
- `docs/adr/0009-frontend-architecture.md`
- `docs/adr/0010-api-architecture.md`
- `docs/adr/0011-organization-hierarchy.md`
- `docs/adr/0012-project-hierarchy.md`
- `docs/adr/0013-file-storage-architecture.md`
- `docs/adr/0014-ai-integration-architecture.md`
- `docs/adr/0015-future-mobile-compatibility.md`
- `docs/adr/0016-scaling-strategy.md`

Files removed:

- None.

Database changes:

- None.

API changes:

- None.

Architecture changes:

- Completed Sprint 1 system architecture documentation.
- Documented frontend, backend, database, API, authentication, authorization,
  organization hierarchy, project hierarchy, file storage, realtime, AI,
  future mobile compatibility, deployment, and scaling architecture.
- Added ADR coverage for Sprint 1 architectural decisions.
- Reaffirmed that no feature code, database schema, API endpoints, migrations,
  or placeholder package folders were created.

Performance improvements:

- None.

Bugs fixed:

- None.

Known bugs:

- Hostinger deployment confirmation may still be pending outside the repository.

Technical debt:

- `apps/api` and `packages/*` remain intentionally deferred until they contain
  real code or shared contracts.
- Provider choices for object storage, email, jobs, monitoring, search, AI, and
  mobile remain deferred decisions.

Next task:

- Wait for explicit user approval before Sprint 2.

## 2026-07-04 Development Direction Update

Current milestone: Phase 1 - foundation and planning

Completion percentage: 60%

Features completed:

- None.

Features started:

- None.

Files modified:

- `AI_RULES.md`
- `MASTER_INDEX.md`
- `docs/architecture.md`
- `docs/api.md`
- `docs/context.md`
- `docs/decisions.md`
- `docs/roadmap.md`
- `docs/session.md`
- `docs/progress.md`
- `docs/adr/README.md`

Files created:

- `docs/adr/0017-frontend-backend-independence.md`

Files removed:

- None.

Database changes:

- None. Database, Prisma, SQL, migrations, and backend persistence are owned by
  the backend developer and are outside this frontend workstream.

API changes:

- No backend endpoints were implemented.
- Documented the frontend API contract workflow.
- Documented that frontend features must define public API contracts and use
  mock services until backend APIs exist.

Architecture changes:

- Recorded the two-developer development model.
- Established frontend/backend independence as ADR 0017.
- Updated project rules so frontend work treats the backend as a black box.
- Documented that frontend code must not depend on Prisma, SQL, database
  logic, backend business logic, backend validation implementations, NestJS
  internals, storage internals, queues, or backend infrastructure.
- Documented the required frontend feature sequence: design UI, define API
  contract, create mock service, build components, connect components, handle
  loading, empty, error, and success states, then update documentation.

Performance improvements:

- None.

Bugs fixed:

- None.

Known bugs:

- Hostinger deployment confirmation may still be pending outside the repository.

Technical debt:

- Frontend state-management and server-state/query library choices remain
  deferred.
- Mock service organization and testing strategy remain deferred.

Next task:

- Continue with frontend-only development. For every backend dependency, define
  an API contract and mock service rather than implementing backend behavior.

## 2026-07-04 Base Frontend Scope

Current milestone: Phase 2 - frontend application scaffold

Completion percentage: 68%

Features completed:

- Mock-backed login page.
- House creation form.
- House join form.
- House management overview.
- Discord-style production role display.
- Task scheduler and task assigner.
- Chat room interface with mock message sending.

Features started:

- Frontend base workspace.

Files modified:

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/globals.css`
- `docs/api.md`
- `docs/progress.md`

Files created:

- `apps/web/src/components/base-workspace.tsx`
- `apps/web/src/services/base-workspace.service.ts`
- `apps/web/src/types/base.ts`

Files removed:

- None.

Database changes:

- None. No backend, Prisma, SQL, migrations, or database logic were added.

API changes:

- No backend endpoints were implemented.
- Documented public frontend contracts for login, workspace snapshot, house
  creation, house joining, task creation, and chat message sending.

Architecture changes:

- Added the first frontend service abstraction and realistic mock service.
- Kept UI components separate from backend implementation details.

Performance improvements:

- None.

Bugs fixed:

- None.

Known bugs:

- The interface uses mock data only.

Technical debt:

- State is local to the base workspace. A dedicated server-state and app-state
  strategy still needs a formal decision.
- Design system components are currently local CSS/classes and should be
  extracted when reuse grows.

Next task:

- Validate the frontend build and continue refining the base experience.

## 2026-07-04 Login Page Redesign

Current milestone: Phase 2 - frontend application scaffold

Completion percentage: 70%

Features completed:

- Redesigned the logged-out login page to match the provided cinematic Fylmico
  reference.

Files modified:

- `apps/web/src/components/base-workspace.tsx`
- `apps/web/src/app/globals.css`
- `docs/progress.md`
- `docs/session.md`

Files created:

- `apps/web/public/images/login-production-set.png`

Database changes:

- None.

API changes:

- None.

Architecture changes:

- Kept the login flow connected to the existing mock auth service.
- Kept backend as a black box; no backend implementation details were added.

Validation:

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed outside the sandbox.
- Browser-verified the redesigned login screen and mock login flow.

Next task:

- Continue polishing the frontend base workspace.

## 2026-07-04 Post-login Page Redesign

Current milestone: Phase 2 - frontend application scaffold

Completion percentage: 74%

Features completed:

- Redesigned the post-login empty state as a no-house onboarding page.
- Redesigned the post-house state as a light production dashboard.
- Added sidebar navigation, top search/action bar, dashboard stat cards,
  upcoming schedule, my tasks, recent projects, recent activity, house
  management, task scheduler, and house chat sections.
- Updated mock login to begin without a house so create/join house onboarding is
  visible first.
- Updated mock create/join flows to seed dashboard data after the house is
  created or joined.

Files modified:

- `apps/web/src/components/base-workspace.tsx`
- `apps/web/src/services/base-workspace.service.ts`
- `apps/web/src/app/globals.css`
- `docs/progress.md`
- `docs/session.md`

Database changes:

- None.

API changes:

- None. Existing mock service contracts continue to power the frontend.

Architecture changes:

- Split the base frontend into login, no-house onboarding, app shell, and
  dashboard component sections while keeping data behind mock services.
- Fixed async form reset handling by capturing the form element before awaiting
  mock service calls.

Validation:

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed outside the sandbox.
- Browser-verified login, no-house onboarding, create-house transition, and the
  dashboard state.

Next task:

- Continue matching individual dashboard modules to production workflows and
  extract reusable UI primitives as patterns stabilize.

## 2026-07-04 Frontend Interactivity Polish

Current milestone: Phase 2 - frontend application scaffold

Completion percentage: 80%

Features completed:

- Made the app shell interactive with local sidebar view state, search preview,
  create action menu, and notification popover.
- Added frontend-only dashboard interactions for schedule selection, task
  completion, recent project selection, chat room switching, and mock message
  sending.
- Added motion polish including entrance animations, popover animation, hover
  lift states, selected states, progress animation, and reduced-motion support.
- Kept all data mutations behind existing mock services or local UI state.

Files modified:

- `apps/web/src/components/base-workspace.tsx`
- `apps/web/src/app/globals.css`
- `docs/progress.md`
- `docs/session.md`

Database changes:

- None.

API changes:

- None. Backend-facing needs remain documented as frontend contracts and inline
  backend tasks.

Backend tasks left for Developer 2:

- Implement public APIs for authenticated workspace snapshots, house creation,
  house joining, tasks, schedules, project details, notifications, chat rooms,
  and message persistence.
- Persist schedule selection/calendar edits and task completion state through
  public APIs.
- Replace mock notification and chat data with real websocket/API delivery.

Architecture changes:

- Added local UI state for interaction polish without introducing backend
  implementation details.
- Preserved the rule that UI components communicate through frontend service
  abstractions and mock data until backend APIs exist.

Validation:

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed outside the sandbox.
- Browser-verified login, create-house, topbar menus, search preview, schedule
  selection, task completion, project selection, chat room switching, and mock
  chat send.

Next task:

- Extract repeated buttons, panels, fields, popovers, and dashboard cards into
  reusable design-system primitives while continuing frontend-only development.

## 2026-07-07 Design System Migration and Route-Based Rebuild

Current milestone: Phase 2/3 - frontend application scaffold and early
authentication UI

Completion percentage: 88%

Features completed:

- Migrated the design system from hand-written CSS to Tailwind v4 + shadcn/ui
  (`components/ui/*`, Base UI primitives, "base-nova" style).
- Rebuilt the login screen as a real route (`/login`), pixel-matched to a
  provided design reference, wired to the existing mock auth service.
- Replaced the single-component, state-switched `BaseWorkspace` with real
  Next.js routes under an `(app)` route group: a shared authenticated layout
  (auth gate, workspace bootstrap, house-presence redirect), a home dashboard
  (`/`), and a no-house onboarding screen (`/houses/new`).
- Built the app shell: sidebar (compact icon-rail on onboarding, full labelled
  nav elsewhere, upgrade card, user footer) and topbar (search, create menu,
  notification popover, avatar).
- Home dashboard: greeting header, stat cards with inline SVG sparklines,
  upcoming schedule, my tasks (working checkbox toggle), recent projects
  (real sourced photos), recent activity (real sourced avatar photos).
- Sourced and vetted free-license stock photos for project thumbnails and
  team avatars; rejected one candidate for a visible third-party brand logo.

Features started:

- None beyond the above; remaining sidebar nav items (Projects, Calendar,
  Tasks, Crews, Files, Storyboard, Messages, Bookings, Analytics, Settings)
  are intentionally left as non-navigating placeholders for future passes.

Files modified:

- `apps/web/src/app/globals.css` (stripped ~1900 lines of dead hand-written
  CSS, kept theme tokens/resets/shadcn layer)
- `apps/web/src/app/layout.tsx` (shadcn font wiring)
- `apps/web/package.json`, `package-lock.json` (new dependencies)
- `README.md`, `docs/roadmap.md` (phase/milestone status)

Files created:

- `apps/web/components.json` and `apps/web/src/components/ui/*` (shadcn
  primitives)
- `apps/web/src/components/login/login-page.tsx`,
  `apps/web/src/app/login/page.tsx`, `apps/web/src/lib/session.ts`
- `apps/web/src/app/(app)/layout.tsx`,
  `apps/web/src/lib/workspace-context.tsx`,
  `apps/web/src/components/layout/*`
- `apps/web/src/app/(app)/houses/new/page.tsx`,
  `apps/web/src/components/houses/*`
- `apps/web/src/app/(app)/page.tsx`, `apps/web/src/components/dashboard/*`
- `apps/web/public/images/login-hero.png`,
  `apps/web/public/images/dashboard/*`

Files removed:

- `apps/web/src/components/base-workspace.tsx` (superseded entirely)
- `apps/web/src/app/page.tsx` (redirect logic moved into `(app)/layout.tsx`)
- `apps/web/public/images/login/{mail,lock,eye}.png` (replaced by
  lucide-react icons)
- `.codex-remote-attachments/` (accidentally-committed cache from a
  different AI coding tool, unrelated to this project)

Database changes:

- None. `services/base-workspace.service.ts` and `types/base.ts` intentionally
  left as a single file each this pass; domain-splitting them is deferred
  until a feature actually needs it.

API changes:

- None. Existing mock service contracts continue to power the frontend.

Architecture changes:

- Adopted Tailwind v4 + shadcn/ui as the project's actual design system,
  matching what `docs/tech-stack.md` and `PROJECT_SPEC.md` already specified
  but the code had never used.
- Introduced a `WorkspaceContext` as the single source of truth for the
  authenticated workspace snapshot, replacing ad hoc re-fetching after every
  mutation.
- Confirmed (and fixed) that `main` had not been merged with the latest
  `frontend` work; this session's commits were merged into `main` and pushed.

Bugs fixed:

- A `useSyncExternalStore` hydration race in the auth gate could redirect an
  already-logged-in user to `/login` before the real session value settled;
  fixed with an explicit post-hydration guard.
- Flex/grid children without `min-w-0` were forcing horizontal overflow on
  the dashboard (stat cards, recent projects strip) at common viewport
  widths.

Known bugs:

- None currently tracked for the shipped screens.

Technical debt:

- Remaining sidebar destinations have no routes yet (by design, deferred).
- `base-workspace.service.ts` / `types/base.ts` still bundle all mock
  domains in one file each; splitting per `docs/api.md`'s recommended
  `lib/api/<domain>.ts` + `services/<domain>.service.ts` pattern is deferred
  until the next domain (tasks, chat, etc.) gets its own dedicated page.

Next task:

- Build the next dedicated page (Projects, Calendar, or Tasks) one at a time,
  using the previously-shared design mockups as ground truth, following the
  same route + Tailwind/shadcn + mock-service pattern established this
  session.

## 2026-07-07 Calendar Page

Current milestone: Phase 2/3 - frontend application scaffold and early
authentication UI

Completion percentage: 91%

Features completed:

- Built the Calendar page (`/calendar`) as a real route, pixel-matched to a
  provided design reference: header with prev/today/next controls, a
  month/year jump popover, Month/Week/Day tabs, and a category filters
  popover; a full month grid with colored event pills and a bottom legend; a
  right rail with a mini month calendar (synced to the same month cursor), a
  "Calendars" panel (checkbox source filters), and an "Upcoming (Next 7
  Days)" panel.
- Week and Day tabs render a "coming soon" empty state rather than fake
  grids, since only Month was designed/requested.
- Turned the Calendar sidebar entry from a non-navigating placeholder into a
  real link.
- Made "New Event" a working create flow: the button opens a `Popover` form
  (title, date, time, location, event-type pills, calendar pills) - the
  first "create" UI in the app (`createTask`/`createHouse` exist as mock
  services but had no UI wired to them). Validates title/time are present,
  appends the new event to page-local state (mirrors the `completedTaskIds`
  pattern in `home-dashboard.tsx`; no backend), expands the active filters so
  the new event's category/calendar can't be hidden by an existing filter,
  and jumps the month grid/mini calendar to the event's date so it's always
  immediately visible.

Features started:

- None beyond the above; remaining sidebar nav items (Projects, Tasks,
  Crews, Files, Storyboard, Messages, Bookings, Analytics, Settings) are
  still non-navigating placeholders.

Files modified:

- `apps/web/src/components/layout/nav-items.ts` (widened `NavItem.href` to
  include `"/calendar"`)
- `docs/features.md`, `docs/roadmap.md` (Calendar status)

Files created:

- `apps/web/src/app/(app)/calendar/page.tsx`
- `apps/web/src/components/calendar/*` (page, header, month/year dropdown,
  view tabs, filters popover, month grid, event pill, legend, empty view,
  mini calendar, calendars panel, upcoming panel, new-event popover form,
  mock data)
- `apps/web/src/lib/calendar-utils.ts` (Monday-start month grid, date
  formatting/comparison helpers shared by the main grid, mini calendar, and
  month/year jump)

Files removed:

- `apps/web/src/components/calendar/new-event-button.tsx` (superseded by
  `new-event-popover.tsx`, which renders the same trigger button plus the
  create-event form)

Database changes:

- None. Calendar events, sources, and categories are frontend mock data
  colocated in `components/calendar/calendar-data.ts`, matching the existing
  `components/dashboard/*-data.ts` convention.

API changes:

- None.

Architecture changes:

- None. Follows the existing route + Tailwind/shadcn + colocated-mock-data
  pattern used by the dashboard and houses screens.
- `CATEGORY_ORDER` was copy-pasted in `calendar-legend.tsx` and
  `calendar-filters-popover.tsx`; adding a third consumer (the new-event
  form) crossed the line from coincidental to real duplication, so it moved
  to a single export in `calendar-data.ts`.

Bugs fixed:

- `getMonthGrid` originally reconstructed padding days as
  `new Date(year, month, gridStart.getDate() + i)`, which reused the
  rolled-over previous month's day-of-month against the _current_ month
  index once the leading offset crossed a month boundary (e.g. rendering a
  nonexistent "June 31" instead of "July 1"). Fixed by computing every grid
  day as an offset from the 1st of the visible month directly.
- The Calendar page's `Tabs`/`TabsContent` (a flex column) had no
  `min-w-0`, so at narrow viewports its month-grid child refused to shrink
  and inflated the flex box past its allotted column width. Added `min-w-0`
  at the usage site (matching the fix already applied once for the
  dashboard, per the entry above) and gave the month grid its own
  `overflow-x-auto` with a `min-w-[42rem]` inner track so an unavoidably
  wide 7-column grid scrolls locally instead of widening the page.

Known bugs:

- None currently tracked for this page. Separately confirmed (not
  introduced by this change): the app shell's sidebar/topbar have no
  responsive breakpoint yet (`compact` is only tied to the `/houses/new`
  route, not viewport width), so every authenticated page overflows
  horizontally on narrow mobile widths; the existing home dashboard
  overflows more than this page at the same width. Fixing that is shared
  app-shell work, out of scope for this page.

Technical debt:

- Same as the entry above (remaining nav destinations, `base-workspace.service.ts`
  / `types/base.ts` single-file mock domains).
- Mobile-responsive sidebar/topbar (see "Known bugs" above) is unaddressed
  app-shell debt, pre-existing before this session.

Next task:

- Build the next dedicated page (Projects or Tasks), following the same
  route + Tailwind/shadcn + mock-service pattern.

## 2026-07-08 Analytics Page

Current milestone: Phase 2/3 - frontend application scaffold and early
authentication UI

Completion percentage: 92%

Features completed:

- Built the Analytics page (`/analytics`) as a real route, pixel-matched to
  a provided design reference: header (date-range/Filters/Export, all
  decorative labels - no working date picker/filtering, matching the
  "Add Calendar" decorative-button precedent), 5 stat cards (reusing
  `dashboard/stat-card.tsx` + `sparkline.tsx` as-is), a multi-series
  project-progress line/area chart, a task-status donut, a weekly
  time-logged mini chart with a peak callout, a time-distribution donut, an
  activity heatmap, and top-active-projects/top-contributors/team-workload
  list panels, plus a bottom insight banner.
- No charting library was added; every chart is hand-rolled inline SVG,
  extending the pattern `dashboard/sparkline.tsx` already established
  (multi-line chart and donut chart are new reusable primitives under
  `components/analytics/`).
- Turned the sidebar's Analytics entry from a non-navigating placeholder
  into a real link.
- Reused existing sourced assets instead of inventing new ones: project
  thumbnails from `public/images/dashboard/project-*.jpg` for Top Active
  Projects, and member avatars via the existing `AvatarWithStatus`
  component for Top Contributors/Team Workload.

Features started:

- None beyond the above. This page is read-only/reporting - no mutating
  interactions, unlike Calendar's event-creation flow.

Files modified:

- `apps/web/src/components/layout/nav-items.ts` (added `"/analytics"` to
  the `NavItem.href` union; pointed the analytics entry at it)
- `docs/features.md`, `docs/roadmap.md` (Analytics status)

Files created:

- `apps/web/src/app/(app)/analytics/page.tsx`
- `apps/web/src/components/analytics/*` (page, header, stat-cards-row,
  project-progress-panel, task-status-panel, time-logged-panel,
  time-distribution-panel, activity-heatmap-panel, top-active-projects-panel,
  top-contributors-panel, team-workload-panel, insight-banner, chart
  primitives `multi-line-chart.tsx`/`donut-chart.tsx`/`mini-area-chart.tsx`/
  `activity-heatmap.tsx`, mock data)

Database changes:

- None. Analytics data is frontend mock data colocated in
  `components/analytics/analytics-data.ts`, matching the existing
  `*-data.ts` convention.

API changes:

- None.

Architecture changes:

- None new. Extends the established route + Tailwind/shadcn +
  colocated-mock-data pattern; the only structural addition is the
  hand-rolled SVG chart primitives (`multi-line-chart.tsx`, `donut-chart.tsx`,
  `mini-area-chart.tsx`), reusable by any future reporting page.

Bugs fixed:

- `donut-chart.tsx` originally mutated a `cumulative` closure variable
  inside the `.map()` used directly in JSX (to compute each arc's
  `strokeDashoffset`), which the React Compiler's immutability rule
  correctly flags as unsafe (`react-hooks/immutability`). Fixed by
  precomputing all arc offsets in a plain `for` loop before the JSX return,
  so no mutation happens inside the render-time map callback.

Known bugs:

- Same pre-existing app-shell sidebar/topbar mobile-overflow issue noted
  under Calendar above; not introduced or worsened by this page.
- Unrelated to this page's own code: mid-session, `npm run lint` and
  `npm run typecheck` surfaced failures from other, already-committed work
  that landed in parallel on this branch during this session (Projects,
  Tasks, Crews, Files, Storyboard, Messages, Settings pages) -
  `crews-page.tsx` and `storage-overview-panel.tsx` have the same
  React-Compiler "reassign after render" issue this session's own
  `donut-chart.tsx` had (see Bugs fixed) but were left as-is since they
  belong to work this session didn't do; `profile-section.tsx` and
  `settings-data.ts` have a pre-existing `<img>` warning and an unused
  import. Also found: `node_modules` was missing the newly-added `motion`
  dependency and `.next/types/routes.d.ts` was stale for the new routes
  until a fresh `npm install` + `npm run build` resolved both.

Technical debt:

- Same as the entries above (remaining `Bookings` nav placeholder,
  `base-workspace.service.ts` / `types/base.ts` single-file mock domains,
  mobile-responsive sidebar/topbar).

Next task:

- Build the next dedicated page (Projects and several others already
  landed outside this session - confirm with the team what's actually
  left, e.g. Bookings), following the same route + Tailwind/shadcn +
  mock-service pattern.

## 2026-07-08 Bookings Page

Current milestone: Phase 2/3 - frontend application scaffold and early
authentication UI

Completion percentage: 93%

Features completed:

- Built the Bookings page (`/bookings`) as a real route, pixel-matched to
  a provided design reference: header, a status/scope tabs bar (All
  Bookings/My Bookings/Pending Approval/Confirmed/Cancelled - the first
  four filter the table client-side, Cancelled too) with "New Booking"
  and "Filters" as decorative buttons, 4 stat cards (reusing
  `dashboard/stat-card.tsx`), a bookings table (resource thumbnail/name,
  category tag, project + phase, dates, status pill, booked-by avatar),
  decorative pagination, and a right rail with a "Bookings by Type" donut
  (reusing `analytics/donut-chart.tsx`), an Upcoming Bookings list, and a
  mini "Booking Calendar" (reusing `calendar/mini-calendar.tsx`).
- Turned the sidebar's Bookings entry from a non-navigating placeholder
  into a real link - this was the last remaining placeholder nav item.
- Made `StatCard`'s `sparklinePoints` prop optional (was required) so the
  "Pending Approval" card can render without a sparkline, matching the
  design reference. Backward-compatible; existing callers unaffected.

Features started:

- None beyond the above.

Files modified:

- `apps/web/src/components/dashboard/stat-card.tsx` (`sparklinePoints`
  made optional)
- `apps/web/src/components/layout/nav-items.ts` (added `"/bookings"` to
  the `NavItem.href` union; pointed the bookings entry at it)
- `docs/roadmap.md` (Bookings/Calendar status)

Files created:

- `apps/web/src/app/(app)/bookings/page.tsx`
- `apps/web/src/components/bookings/*` (page, header, tabs-bar,
  stat-cards, table, pagination, bookings-by-type-panel,
  upcoming-bookings-panel, booking-calendar-panel, mock data)

Database changes:

- None. Booking data is frontend mock data colocated in
  `components/bookings/bookings-data.ts`, matching the existing
  `*-data.ts` convention. No real equipment/venue photo assets exist for
  this domain, so table/panel thumbnails use tinted category icon tiles
  (Building2/Camera/DoorOpen) instead of photos, rather than sourcing new
  stock images for a mock page.

API changes:

- None.

Architecture changes:

- None new. This page is the first to reuse UI primitives across feature
  folders (Calendar's `MiniCalendar`, Analytics's `DonutChart`), which
  worked cleanly since both were already generic/presentational with no
  domain coupling.

Bugs fixed:

- None new this session.

Known bugs:

- Same pre-existing app-shell sidebar/topbar mobile-overflow issue noted
  under Calendar/Analytics above; not introduced or worsened by this page.

Technical debt:

- Same as prior entries (`base-workspace.service.ts` / `types/base.ts`
  single-file mock domains, mobile-responsive sidebar/topbar). The
  sidebar now has no remaining non-navigating placeholder items.

Next task:

- Confirm with the team what's actually left to build given how much
  landed in parallel across sessions; consider backfilling
  progress/session/changelog documentation for the Projects/Tasks/Crews/
  Files/Storyboard/Messages/Settings work if that wasn't done elsewhere.
