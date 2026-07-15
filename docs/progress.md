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

## 2026-07-08 Backend Bootstrap

Current milestone: Phase 8 - backend bootstrap

Completion percentage: N/A (new workstream; frontend tracked separately above)

Features completed:

- Scaffolded `apps/api` (NestJS): global `/api/v1` prefix, `{ "data": ... }`
  response envelope applied to a `GET /api/v1/health` endpoint, CORS
  configured from `CORS_ORIGIN`.
- Scaffolded `packages/database` (Prisma): empty `schema.prisma`
  (datasource/generator only, no models), `PrismaService` (Nest
  lifecycle-managed `PrismaClient`), and a `DatabaseModule` consumed by
  `apps/api`.
- Wired both into the monorepo: root `package.json` workspaces
  (`apps/api`, `packages/database`) and new scripts (`dev:api`,
  `build:api`, `db:generate`, `db:migrate`); `docker-compose.yml` gained
  `postgres` (with healthcheck) and `api` services alongside the existing
  `web` service; root `.env.example` gained `API_PORT`, `CORS_ORIGIN`,
  `DATABASE_URL`, and placeholder `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`.
- Recorded the development-model change (backend is no longer a separate
  developer's black box) as ADR 0018, and updated `docs/roadmap.md`'s
  Standing Development Rule, `MASTER_INDEX.md`'s Current Sprint Gate, and
  the ADR indexes accordingly.

Features started:

- None beyond the scaffold above; no domain models, authentication, or
  business logic were added.

Files modified:

- `package.json` (workspaces, new scripts)
- `docker-compose.yml` (new `postgres`/`api` services)
- `.env.example` (new backend env vars)
- `docs/adr/README.md`, `MASTER_INDEX.md`, `docs/roadmap.md` (ADR 0018
  references, Standing Development Rule, new Phase 8 entry)

Files created:

- `apps/api/*` (`package.json`, `tsconfig.json`, `nest-cli.json`,
  `eslint.config.mjs`, `.env.example`, `Dockerfile`,
  `src/main.ts`, `src/app.module.ts`, `src/health/*`)
- `packages/database/*` (`package.json`, `tsconfig.json`,
  `prisma/schema.prisma`, `src/prisma.service.ts`,
  `src/database.module.ts`, `src/index.ts`)
- `docs/adr/0018-backend-bootstrap.md`

Files removed:

- None.

Database changes:

- Added an empty Prisma schema (datasource + generator only). No tables/
  models exist yet; the first real models (`users`, `auth_accounts`,
  `sessions`) are the next pass, per ADR 0003.

API changes:

- Added `GET /api/v1/health` -> `{ "data": { "status": "ok" } }`. No other
  endpoints exist yet. `docs/api.md`'s documented contracts (auth, houses,
  tasks, chat) remain unimplemented targets for future passes.

Architecture changes:

- Began implementing the NestJS modular monolith layering documented in
  `docs/architecture.md` (controllers -> guards/interceptors -> application
  services -> repositories/Prisma) and ADR 0008's rule that database access
  goes through `packages/database`.
- Superseded ADR 0017's "backend is a separate developer's black box"
  framing with ADR 0018, since the same developer now owns both frontend
  and backend.

Performance improvements:

- None.

Bugs fixed:

- None.

Known bugs:

- None currently tracked for this scaffold.

Validation:

- `npm install`, `npm run db:generate`, `npm run build --workspace=@fylmico/database`,
  `npm --workspace @fylmico/api run typecheck`, `npm run build:api`, and
  `npm --workspace @fylmico/api run lint` all passed.
- Ran the built app directly (`node apps/api/dist/main.js`) with no
  Postgres available: Nest booted, initialized every module in order
  (`AppModule` -> `DatabaseModule` -> `ConfigModule` -> `HealthModule`),
  and mapped `GET /api/v1/health`, then failed only at
  `PrismaService.onModuleInit`'s `$connect()` with Prisma's expected
  `P1001 Can't reach database server at localhost:5432` - confirms all
  wiring is correct end-to-end short of an actual running database.
- Root `npm run lint` / `npm run typecheck` (scoped to `@fylmico/web`)
  still only surface the same pre-existing, already-documented issues from
  the Analytics Page session above (`crews-page.tsx`/
  `storage-overview-panel.tsx` React-Compiler immutability,
  `profile-section.tsx` `<img>` warning, `settings-data.ts` unused
  import) plus one new pre-existing `app-sidebar.tsx` typed-route error
  unrelated to this session's changes - confirms the backend scaffold
  didn't affect the frontend.
- Docker is not installed in this development environment, so
  `docker compose build api` / `docker compose up -d postgres` could not
  be run here. `apps/api/Dockerfile` and `docker-compose.yml` are
  untested beyond manual review; verifying them is the first thing to do
  in an environment with Docker available.

Technical debt:

- No authentication, authorization, or domain schema yet - every backend
  domain in `docs/database.md`/`docs/architecture.md` remains to be built.
- `apps/web` still runs entirely on mock services; no real endpoint has
  been pointed at from the frontend yet.
- `apps/api/Dockerfile` and the `docker-compose.yml` `postgres`/`api`
  services are unverified (no Docker in this session's environment - see
  Validation above).

Next task:

- Add identity/auth models (`User`, `AuthAccount`, `Session`) to
  `packages/database/prisma/schema.prisma` and implement the auth module
  (`apps/api/src/auth/*`) matching ADR 0003's rotated-refresh-token flow
  and the endpoints already documented in `docs/api.md`.

## 2026-07-08 Auth Module

Current milestone: Phase 8 - backend bootstrap

Completion percentage: N/A (new workstream; frontend tracked separately above)

Features completed:

- Added the identity Prisma models (`User`, `AuthAccount`, `Session`,
  `EmailVerificationToken`, `PasswordResetToken`) per ADR 0019/`docs/database.md`.
- Implemented the auth module (`apps/api/src/auth/*`): signup, login,
  refresh, logout, logout-all, verify-email, request-password-reset,
  reset-password, and `GET /me` - all 9 endpoints already documented in
  `docs/api.md`.
- `argon2id` password hashing (confirmed working natively on this machine,
  no fallback needed), opaque sha256-hashed refresh/verification/reset
  tokens, in-place refresh-token rotation, and full session revocation on
  logout-all and password reset.
- Added a global `ValidationPipe` (`class-validator`/`class-transformer`)
  and `HttpExceptionFilter` (plus a new `AppException` helper) so every
  auth error response matches ADR 0010's `{ "error": {...} }` envelope.
- Added `JwtAuthGuard` + `@CurrentUser()` decorator under
  `apps/api/src/common/` for reuse by future authenticated endpoints.

Features started:

- None beyond the above; OAuth, real email delivery, audit logging, rate
  limiting, and session-family reuse detection are explicitly deferred
  (see ADR 0019).

Files modified:

- `packages/database/prisma/schema.prisma` (5 new models)
- `apps/api/src/app.module.ts` (registered `AuthModule`)
- `apps/api/src/main.ts` (global `ValidationPipe` + `HttpExceptionFilter`)
- `apps/api/package.json` (added `@nestjs/jwt`, `argon2`, `class-validator`,
  `class-transformer`)
- `apps/api/.env.example`, root `.env.example` (`JWT_ACCESS_SECRET`,
  `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`; dropped the unused
  `JWT_REFRESH_SECRET` placeholder - refresh tokens are opaque, not JWTs)
- `docs/adr/README.md`, `MASTER_INDEX.md`, `docs/roadmap.md` (ADR 0019
  references, Phase 8 progress)
- `docs/authentication.md`, `docs/api.md`, `docs/database.md` (moved from
  "planned" to documented/implemented)

Files created:

- `apps/api/src/auth/*` (`auth.module.ts`, `auth.controller.ts`,
  `auth.service.ts`, `password.util.ts`, `token.util.ts`, `dto/*`)
- `apps/api/src/common/filters/http-exception.filter.ts`
- `apps/api/src/common/guards/jwt-auth.guard.ts`
- `apps/api/src/common/decorators/current-user.decorator.ts`
- `apps/api/src/common/exceptions/app.exception.ts`
- `docs/adr/0019-auth-module.md`

Files removed:

- None.

Database changes:

- Added the 5-table identity group. No migration has been run yet in this
  session (see Validation below) - the first `npm run db:migrate` will
  create it.

API changes:

- Added all 9 documented auth endpoints under `/api/v1/auth/*` (see
  `docs/api.md` for full request/response/error detail per endpoint).

Architecture changes:

- First real domain logic in `apps/api`, following the layering from
  `docs/architecture.md` (thin controller -> service -> Prisma).
- Resolved `docs/authentication.md`'s password-hashing and (partially)
  token-delivery open choices; see ADR 0019 for the full reasoning,
  including what's still simplified/deferred (refresh reuse detection,
  audit logging, rate limiting).

Performance improvements:

- None.

Bugs fixed:

- None (new code).

Known bugs:

- None currently tracked for this module, within its documented scope
  limitations (see ADR 0019's Costs section).

Validation:

- `npm run db:generate`, `npm run build --workspace=@fylmico/database`,
  `npm --workspace @fylmico/api run typecheck`, `npm run build:api`, and
  `npm --workspace @fylmico/api run lint` all passed.
- Smoke-tested `argon2` directly (`hash` + `verify` round trip) to confirm
  it installs and runs natively on this machine before committing to it
  over the planned `bcrypt`/`bcryptjs` fallback.
- Docker became available partway through this session. Ran the full plan
  end-to-end against a real database: `docker compose up -d postgres`
  (healthy), `npm run db:migrate` (created and applied migration
  `20260708161817_init_identity`), started `apps/api` against it, and
  exercised every endpoint by hand with `curl`: signup (201, tokens
  returned, verification token logged), duplicate signup (409
  `email_already_registered`), login with wrong/right password (401/200),
  `GET /me` without/with a Bearer token (401/200), refresh (rotates the
  pair; replaying the old refresh token correctly 401s),
  `logout-all` (revokes all sessions; a still-unexpired access token
  correctly continues to authenticate until its own TTL, matching the
  documented "auth tokens are stateless within their short TTL" design),
  `verify-email` (marks `emailVerifiedAt`, replay correctly 400s),
  `request-password-reset` for both an existing and a non-existent email
  (identical 200 response either way, per the no-enumeration design), and
  `reset-password` (old password correctly stops working, new password
  correctly logs in). All behavior matched the plan exactly.
- Found and fixed one real bug while doing this: a stale
  `apps/api/tsconfig.tsbuildinfo` left over from the ADR 0018 bootstrap
  build caused `nest build` to silently produce an empty `dist/` (tsc's
  incremental cache thought the (deleted) output was already up to date).
  Fixed by adding `"tsBuildInfoFile": "./dist/tsconfig.tsbuildinfo"` to
  `apps/api/tsconfig.json` so the build-info cache lives inside `dist/`
  and gets removed together with it by `deleteOutDir`, instead of
  surviving next to `dist` and going stale.

Technical debt:

- Refresh-token reuse detection is simplified (no session-family tracking).
- No audit logging (deferred to the organizations module) or rate limiting.
- Email verification/password-reset tokens are only logged server-side; no
  real email provider is wired in.
- `apps/web` still runs entirely on mock services; no real endpoint has
  been pointed at from the frontend yet.

Next task:

- Start the organizations/houses module (`organizations`,
  `organization_memberships`, `roles` per `docs/database.md`), matching the
  "House" contracts already documented in `docs/api.md`, and add
  `activeOrganizationId` to the JWT access token claims once it exists.

## 2026-07-08 Organizations/Houses Module

Current milestone: Phase 8 - backend bootstrap

Completion percentage: N/A (new workstream; frontend tracked separately above)

Features completed:

- Added `Organization`/`Role`/`OrganizationMembership` Prisma models, and
  extended `User` with a required `name` and a nullable
  `activeOrganizationId`.
- Implemented `apps/api/src/organizations/*`: `POST /api/v1/houses` (seeds
  the 5 default roles matching the mock's `defaultRoles` exactly, makes the
  creator an `"Owner"` member, generates a unique invite code) and
  `POST /api/v1/houses/join` (looks up by invite code, adds the joiner with
  a lazily-created `"Member"` role, rejects duplicates/bad codes).
- Implemented `apps/api/src/workspace/*`: `GET /api/v1/workspace` returning
  the real user profile and every house the caller belongs to;
  `tasks`/`chatRooms` are honest `[]` stubs until their own modules exist.
- Auth module touch-ups: `SignupDto` now collects `name`; `toPublicUser`
  (shared by signup/login/me) returns `name` and a derived `avatarLabel`;
  access tokens now carry an `activeOrganizationId` claim (resolves the gap
  ADR 0019 flagged).
- Extracted a shared `avatar-label.util.ts` (was about to be duplicated
  between the auth and workspace modules).
- Added `"Member"` to the frontend's `RoleName` union
  (`apps/web/src/types/base.ts`) - the one frontend change in this pass.

Features started:

- None beyond the above. Granular `resource.action` permission enforcement,
  house-management endpoints (update house, remove/reassign members,
  per-role invites), and real presence for `HouseMember.status` are all
  explicitly deferred (see ADR 0020).

Files modified:

- `packages/database/prisma/schema.prisma` (3 new models, 2 new `User` fields)
- `apps/api/src/auth/auth.service.ts`, `dto/signup.dto.ts`,
  `auth.controller.ts`, `auth.module.ts` (name/avatarLabel/
  activeOrganizationId; exports `JwtModule` for reuse)
- `apps/api/src/app.module.ts` (registered `OrganizationsModule`,
  `WorkspaceModule`)
- `apps/web/src/types/base.ts` (`RoleName` gains `"Member"`)
- `docs/adr/README.md`, `MASTER_INDEX.md`, `docs/roadmap.md`,
  `docs/database.md`, `docs/api.md` (ADR 0020 references, implemented
  endpoint docs, filled-in table docs, fixed several stale "pending first
  migration" notes left over from the ADR 0019 pass)

Files created:

- `apps/api/src/organizations/*` (`organizations.module.ts`,
  `organizations.controller.ts`, `organizations.service.ts`, `dto/*`)
- `apps/api/src/workspace/*` (`workspace.module.ts`,
  `workspace.controller.ts`, `workspace.service.ts`)
- `apps/api/src/common/avatar-label.util.ts`
- `docs/adr/0020-organizations-houses-module.md`

Files removed:

- None.

Database changes:

- Added `organizations`, `roles`, `organization_memberships`; added
  `users.name` (`NOT NULL`) and `users.active_organization_id`. The `NOT
NULL` addition to an existing table required resetting the local dev
  Postgres volume (the only row was this session's own ADR 0019
  verification test account) rather than writing a backfill migration.

API changes:

- Added `POST /api/v1/houses`, `POST /api/v1/houses/join`,
  `GET /api/v1/workspace`. Changed `POST /api/v1/auth/signup`'s request
  (added `name`) and every auth response's `user` shape (added `name`,
  `avatarLabel`).

Architecture changes:

- First cross-module dependency: `OrganizationsModule` and `WorkspaceModule`
  both import `AuthModule` for its exported `JwtModule` (so `JwtAuthGuard`
  can resolve `JwtService` outside the auth module); `WorkspaceModule`
  imports `OrganizationsModule` for `getHousesForUser`.
- Deliberately did not implement `permissions`/`role_permissions` — no
  protected resource beyond the house itself exists yet to check a grant
  against (see ADR 0020's Alternatives).

Performance improvements:

- None.

Bugs fixed:

- None (new code).

Known bugs:

- None currently tracked, within this pass's documented scope limitations
  (see ADR 0020's Costs section).

Validation:

- Reset the local dev Postgres volume (`docker compose down -v`) to apply
  the new `NOT NULL users.name` column cleanly, then
  `npm run db:migrate --name organizations_houses` created and applied
  migration `20260708164132_organizations_houses` against a fresh database.
- `npm run build:api`, `npm --workspace @fylmico/api run typecheck`, and
  `npm --workspace @fylmico/api run lint` all passed.
- Started `apps/api` and ran the full flow with `curl`: signed up two users
  (with `name`, confirming `avatarLabel` derivation - "Aryan Sharma" -> "AS",
  "Priya Shah" -> "PS"); created a house as user 1 (got back exactly the 5
  seeded default roles matching the mock's colors/descriptions, creator
  listed as `"Owner"`/`"online"`); duplicate handle correctly 409
  `handle_unavailable`; user 2 joined via invite code (added as `"Member"`,
  a `"Member"` role row was lazily created with `memberCount: 1`, house now
  shows 6 roles); repeat join correctly 409 `already_member`; bad invite
  code correctly 404 `invite_not_found`; `GET /api/v1/workspace` for both
  users returned the correct `activeHouseId`, the shared house with both
  members, and `tasks`/`chatRooms` as `[]`; a fresh login's JWT payload
  (decoded) carried `activeOrganizationId` matching the created house.
  Every behavior matched the plan exactly.
- Root `npm run typecheck` (apps/web) - the `RoleName` addition introduced
  no new errors; only the same pre-existing `app-sidebar.tsx` typed-route
  error from prior sessions.

Technical debt:

- No granular permission enforcement (deny/allow by role) yet - any
  authenticated user can create/join any house.
- `HouseMember.status` is a placeholder (`"online"` for self, `"offline"`
  for everyone else), not real presence.
- `activeOrganizationId` in an issued access token can go stale within a
  session (see ADR 0020).
- No house-management endpoints yet (update house, list/remove members,
  per-role invites) or house-switcher support beyond "most recent wins."
- `GET /api/v1/workspace`'s `tasks`/`chatRooms` remain `[]` stubs.

Next task:

- Fill in the workspace snapshot's `tasks`/`chatRooms` stubs with real
  tasks and chat modules, or start projects/clients - both are now
  unblocked by having an organization/tenant boundary.

## 2026-07-08 Tasks + Chat Module

Current milestone: Phase 8 - backend bootstrap

Completion percentage: N/A (new workstream; frontend tracked separately above)

Features completed:

- Added `Task`/`Conversation`/`Message` Prisma models: single-assignee
  tasks and house-wide named chat channels (simpler than the originally
  planned `task_assignees`/`conversation_members` join tables - deferred
  until multi-assignee tasks or private conversations are actually needed).
- Implemented `apps/api/src/tasks/*`: `POST /api/v1/tasks` (validates the
  caller is a house member, the assignee is too, and `role` matches one of
  the house's role names; creates with `status: "scheduled"`,
  `priority: "medium"`).
- Implemented `apps/api/src/chat/*`: `POST /api/v1/chat/rooms/:roomId/messages`
  (validates room exists and caller is a house member; returns the **full
  updated room**, not just the new message - matches the mock's actual
  `sendChatMessage(...): Promise<ChatRoom>` signature, fixing a stale
  message-only example in `docs/api.md`).
- `OrganizationsService.createHouse` now also seeds 3 default conversations
  (general/edit-bay/shoot-floor, matching the mock's `defaultChatRooms`
  exactly) alongside the existing 5 default roles.
- Added `OrganizationsService.requireMembership` - a small reusable
  403-`forbidden` guard, used by both new services instead of duplicating
  the same membership lookup.
- `GET /api/v1/workspace`'s `tasks`/`chatRooms` are no longer hardcoded
  `[]` - they're now real, scoped to the caller's `activeOrganizationId`.

Features started:

- None beyond the above. Task status/completion updates, custom room
  creation, multi-assignee tasks, and private/DM conversations are all
  explicitly deferred (see ADR 0021).

Files modified:

- `packages/database/prisma/schema.prisma` (3 new models; back-relations on
  `Organization`/`User`)
- `apps/api/src/organizations/organizations.service.ts` (`DEFAULT_CONVERSATIONS`,
  `requireMembership`)
- `apps/api/src/workspace/workspace.service.ts`,
  `apps/api/src/workspace/workspace.module.ts` (real `tasks`/`chatRooms`)
- `apps/api/src/app.module.ts` (registered `TasksModule`, `ChatModule`)
- `docs/adr/README.md`, `MASTER_INDEX.md`, `docs/roadmap.md`,
  `docs/database.md`, `docs/api.md` (ADR 0021 references, implemented
  endpoint docs, fixed the chat response example, filled-in table docs)

Files created:

- `apps/api/src/tasks/*` (`tasks.module.ts`, `tasks.controller.ts`,
  `tasks.service.ts`, `dto/create-task.dto.ts`)
- `apps/api/src/chat/*` (`chat.module.ts`, `chat.controller.ts`,
  `chat.service.ts`, `dto/send-message.dto.ts`)
- `docs/adr/0021-tasks-chat-module.md`

Files removed:

- None.

Database changes:

- Added `tasks`, `conversations`, `messages`. No existing-table column
  changes this time - no dev database reset needed, just a new migration
  applied on top.

API changes:

- Added `POST /api/v1/tasks` and `POST /api/v1/chat/rooms/:roomId/messages`.
  `GET /api/v1/workspace`'s `tasks`/`chatRooms` fields are populated for
  real now instead of always `[]`.

Architecture changes:

- `TasksModule`/`ChatModule` both import `AuthModule` (for `JwtAuthGuard`'s
  `JwtService` dependency, same pattern as `OrganizationsModule`) and
  `OrganizationsModule` (for `requireMembership`). `WorkspaceModule` now
  also imports both.
- Deliberately kept `tasks`/`conversations`/`messages` simpler than
  `docs/database.md`'s original ERD (no `task_assignees`/
  `conversation_members` join tables) - see ADR 0021's Alternatives.

Performance improvements:

- None.

Bugs fixed:

- Fixed a stale `docs/api.md` example: the chat-message endpoint's
  documented response showed a bare `Message`, but the mock service's real
  TypeScript signature returns the whole `ChatRoom` - implemented to match
  the mock (the real contract), corrected the doc.

Known bugs:

- None currently tracked, within this pass's documented scope limitations
  (see ADR 0021's Costs section).

Validation:

- `npm run db:migrate --name tasks_chat` applied cleanly against the
  already-running local Postgres (no reset needed - new tables only, no
  existing-column changes). `npm run build:api`,
  `npm --workspace @fylmico/api run typecheck`, and
  `npm --workspace @fylmico/api run lint` all passed.
- Started `apps/api`; confirmed a house created _before_ this pass (from
  the ADR 0020 session) correctly has no seeded conversations (rooms are
  only seeded at creation time, not retroactively) - then created a fresh
  house and confirmed all 3 default rooms (general/edit-bay/shoot-floor)
  appear immediately with empty `messages`, and `tasks: []`.
- `POST /api/v1/tasks`: valid request succeeded with `status: "scheduled"`,
  `priority: "medium"`, correct `assigneeName`; bad `assigneeId` correctly
  404 `assignee_not_found`; bad `role` correctly 400 `invalid_request`; a
  non-member correctly 403 `forbidden`.
- `POST /api/v1/chat/rooms/:roomId/messages`: valid request returned the
  **full room** with the new message appended (not just the message,
  confirming the fixed contract); bad `roomId` correctly 404
  `room_not_found`; a non-member correctly 403 `forbidden`.
- `GET /api/v1/workspace` afterward showed the created task and sent
  message. Every behavior matched the plan exactly.
- Root `npm run typecheck` (apps/web) - unaffected, only the same
  pre-existing `app-sidebar.tsx` error from prior sessions (no frontend
  files were touched this pass).

Technical debt:

- No task status/completion update endpoint - tasks are create-only from
  the API's perspective.
- No custom room creation, multi-assignee tasks, or private/DM
  conversations.
- `unreadCount` is always `0` - no real read-tracking.
- Same pre-existing gaps carried over from ADR 0020 (no granular
  permission enforcement beyond membership, `HouseMember.status`
  placeholder, `activeOrganizationId` staleness within a session).

Next task:

- Start projects/clients - the production-structure group most creative-
  production features will eventually hang off of. Unlike the last three
  modules, no frontend mock/contract exists for this yet, so it needs a
  contract design pass first.

## 2026-07-08 Projects + Clients Module

Current milestone: Phase 8 - backend bootstrap

Completion percentage: N/A (new workstream; frontend tracked separately above)

Features completed:

- Added `Project`/`Client`/`ProjectClient` Prisma models: single-project-
  per-house workspace (`name`, `description`, `status`), external clients
  (`name`, `contactName`, `contactEmail`), and a plain many-to-many join
  table linking them - no `teams`/`departments`, no `project_memberships`
  (deferred, matching the ADR 0020/0021 pattern of not building granular
  access control until a concrete need exists).
- **Designed the API contract from scratch** - the first module in this
  backend effort with no pre-existing frontend mock/contract to match.
  Followed the conventions the last three modules already established
  (`houses`-prefixed routes, `{ "data": ... }` envelope, membership-only
  authorization, dedicated action endpoints for lifecycle changes) rather
  than inventing new ones.
- Implemented `apps/api/src/projects/*`:
  `POST`/`GET /api/v1/houses/:houseId/projects` (create/list),
  `GET`/`PATCH /api/v1/projects/:projectId` (read/update),
  `POST /api/v1/projects/:projectId/archive` (dedicated archive action,
  not a `PATCH` status flag), `POST /api/v1/projects/:projectId/clients`
  (link a client).
- Implemented `apps/api/src/clients/*`:
  `POST`/`GET /api/v1/houses/:houseId/clients` (create/list),
  `GET`/`PATCH /api/v1/clients/:clientId` (read/update).
- Added `apps/api/src/common/pagination.ts` (`CursorPaginationDto`,
  `buildPage`) - the **first real implementation** of ADR 0010's
  cursor-pagination envelope (previously documented but unused; the
  workspace snapshot's `houses` array didn't need it, being bounded by the
  caller's own memberships). Both new list endpoints use it.
- Fixed a stale `docs/architecture.md` baseline route sample that still
  used `/api/v1/organizations/...` instead of `/api/v1/houses/...` (predates
  ADR 0018's House vocabulary decision) - updated to match every route
  actually implemented so far.

Features started:

- None beyond the above. Project-level membership/visibility restriction,
  unlink-client, and archived-project filtering are all explicitly
  deferred (see ADR 0022).

Files modified:

- `packages/database/prisma/schema.prisma` (3 new models; `Organization`
  back-relations)
- `apps/api/src/app.module.ts` (registered `ProjectsModule`, `ClientsModule`)
- `docs/adr/README.md`, `MASTER_INDEX.md`, `docs/roadmap.md`,
  `docs/database.md`, `docs/api.md`, `docs/architecture.md` (ADR 0022
  references, new implemented-endpoint docs, replaced the bare "Planned
  Endpoint Areas" bullets, filled-in table docs, fixed the stale route
  sample)

Files created:

- `apps/api/src/common/pagination.ts`
- `apps/api/src/projects/*` (`projects.module.ts`,
  `house-projects.controller.ts`, `projects.controller.ts`,
  `projects.service.ts`, `dto/*`)
- `apps/api/src/clients/*` (`clients.module.ts`,
  `house-clients.controller.ts`, `clients.controller.ts`,
  `clients.service.ts`, `dto/*`)
- `docs/adr/0022-projects-clients-module.md`

Files removed:

- None.

Database changes:

- Added `projects`, `clients`, `project_clients`. No existing-table column
  changes - no dev database reset needed.

API changes:

- Added `POST`/`GET /api/v1/houses/:houseId/projects`,
  `GET`/`PATCH /api/v1/projects/:projectId`,
  `POST /api/v1/projects/:projectId/archive`,
  `POST /api/v1/projects/:projectId/clients`,
  `POST`/`GET /api/v1/houses/:houseId/clients`,
  `GET`/`PATCH /api/v1/clients/:clientId` - none of this existed as a
  frontend contract before this pass.

Architecture changes:

- `ProjectsModule`/`ClientsModule` follow the same
  `AuthModule`+`OrganizationsModule` import pattern as `TasksModule`/
  `ChatModule`.
- Each resource gets two controllers - one nested under `houses/:houseId/...`
  for create/list, one under the bare resource path (`projects/:projectId`,
  `clients/:clientId`) for read/update/actions - since Nest controllers
  can't have multiple route prefixes on one class.
- Established `apps/api/src/common/pagination.ts` as the shared cursor-
  pagination pattern for future list endpoints to reuse.

Performance improvements:

- None.

Bugs fixed:

- None (new code). Fixed one stale doc (see Features completed).

Known bugs:

- None currently tracked, within this pass's documented scope limitations
  (see ADR 0022's Costs section).

Validation:

- `npm run db:migrate --name projects_clients` applied cleanly against the
  already-running local Postgres (no reset needed - new tables only).
  `npm run build:api`, `npm --workspace @fylmico/api run typecheck`, and
  `npm --workspace @fylmico/api run lint` all passed on the first try.
- Started `apps/api`; created a client and a project in an existing house;
  confirmed `GET`/`PATCH` on both, a non-member correctly 403 `forbidden`,
  a bad id correctly 404 `project_not_found`.
- `POST .../archive` correctly set `status: "archived"` and the project
  still appeared in the (unfiltered) list endpoint afterward.
- Linking: the client appeared in the project's `clients` array after
  linking; relinking the same pair correctly 409 `already_linked`; linking
  a client from a different house correctly 400 `invalid_request`.
- Pagination: created a second project, requested `?limit=1` twice
  (following `nextCursor` across pages) and got exactly one project per
  page with a correct `nextCursor`/`null` progression - confirming the
  first real implementation of ADR 0010's cursor envelope actually works.
- Root `npm run typecheck` (apps/web) - unaffected, only the same
  pre-existing `app-sidebar.tsx` error (no frontend files were touched
  this pass). Every behavior matched the plan exactly.

Technical debt:

- No project-level membership/visibility restriction - any house member
  can see/manage every project and client.
- No unlink-client endpoint, no archived-project filtering on the list
  endpoint, no project/client search.
- Same pre-existing gaps carried over from ADR 0020/0021 (no granular
  permission enforcement beyond membership, `HouseMember.status`
  placeholder, `activeOrganizationId` staleness, no task status updates,
  no custom chat rooms).

Next task:

- Comments, notifications, and activity feed (remaining Collaboration-group
  items), or start on creative-production modules (storyboards, shot
  lists, call sheets, assets) now that projects exist for them to attach
  to, per ADR 0012.

## 2026-07-08 Notifications Module

Current milestone: Phase 8 - backend bootstrap

Completion percentage: N/A (new workstream; frontend tracked separately above)

Features completed:

- Added the `Notification` Prisma model: `type`, `title`, `body`, `readAt` -
  flat and non-polymorphic, no "related entity" reference (same reasoning
  already used to defer `comments`' target modeling).
- Implemented `apps/api/src/notifications/*`:
  `GET /api/v1/notifications` (cursor-paginated, newest-first, reusing
  `apps/api/src/common/pagination.ts`), `POST /api/v1/notifications/:id/read`,
  `POST /api/v1/notifications/read-all` (idempotent, like `logout-all`).
  No public create endpoint - notifications are always server-triggered.
- Wired two real triggers: `TasksService.createTask` notifies the assignee
  (unless self-assigned); `OrganizationsService.joinHouse` notifies the
  house's `"Owner"` member(s)) that someone joined.
- Kept the module graph acyclic: `NotificationsModule` only depends on
  `AuthModule` (notifications are scoped to the caller, not a house, so no
  `OrganizationsModule` dependency needed); `TasksModule` and
  `OrganizationsModule` import `NotificationsModule`, not the other way.

Features started:

- None beyond the above. No realtime delivery (Socket.IO, ADR 0005 isn't
  implemented anywhere yet), and only 2 triggers exist - most house/task/
  chat activity doesn't notify anyone yet.

Files modified:

- `packages/database/prisma/schema.prisma` (`Notification` model, `User`
  back-relation)
- `apps/api/src/tasks/tasks.service.ts`, `tasks.module.ts` (assignee
  notification trigger)
- `apps/api/src/organizations/organizations.service.ts`,
  `organizations.module.ts` (owner notification trigger)
- `apps/api/src/app.module.ts` (registered `NotificationsModule`)
- `docs/adr/README.md`, `MASTER_INDEX.md`, `docs/roadmap.md`,
  `docs/database.md`, `docs/api.md` (ADR 0023 references, new
  "Notifications" endpoint docs, filled-in table doc)

Files created:

- `apps/api/src/notifications/*` (`notifications.module.ts`,
  `notifications.controller.ts`, `notifications.service.ts`)
- `docs/adr/0023-notifications-module.md`

Files removed:

- None.

Database changes:

- Added `notifications`. No existing-table column changes - no dev
  database reset needed.

API changes:

- Added `GET /api/v1/notifications`, `POST /api/v1/notifications/:id/read`,
  `POST /api/v1/notifications/read-all`. `POST /api/v1/tasks` and
  `POST /api/v1/houses/join` now have a side effect (notification
  creation) beyond their existing documented response - no response shape
  changed.

Architecture changes:

- First module built specifically to be a one-directional dependency of
  two existing services (`TasksService`, `OrganizationsService`) rather
  than existing behind its own primary user-facing flow.

Performance improvements:

- None.

Bugs fixed:

- None (new code).

Known bugs:

- None currently tracked, within this pass's documented scope limitations
  (see ADR 0023's Costs section).

Validation:

- `npm run db:migrate --name notifications` applied cleanly against the
  already-running local Postgres (no reset needed). `npm run build:api`,
  `npm --workspace @fylmico/api run typecheck`, and
  `npm --workspace @fylmico/api run lint` all passed on the first try.
- Started `apps/api`; confirmed baseline `GET /api/v1/notifications` was
  empty; assigned a task to a different house member and confirmed exactly
  one `task_assigned` notification appeared for them; assigned a second
  task to self and confirmed no notification was created.
- Signed up a third user, joined them into the same house, and confirmed
  the house's Owner received a `house_joined` notification.
- Marked one notification read (`readAt` set), then called `read-all`
  twice in a row (both succeeded identically, confirming idempotency), and
  confirmed every notification had `readAt` set afterward.
- Marking a nonexistent notification read correctly 404'd
  `notification_not_found`.
- Root `npm run typecheck` (apps/web) - unaffected, only the same
  pre-existing `app-sidebar.tsx` error (no frontend files touched this
  pass). Every behavior matched the plan exactly.

Technical debt:

- No realtime delivery - clients must poll.
- Only 2 triggers exist (task assignment, house join) - most activity
  (chat messages, project changes, membership changes) doesn't notify
  anyone yet.
- No per-type notification preferences or muting.
- Same pre-existing gaps carried over from prior ADRs (no granular
  permission enforcement beyond membership, `HouseMember.status`
  placeholder, `activeOrganizationId` staleness, no task status updates,
  no custom chat rooms, no project-level visibility restriction).

Next task:

- Comments and activity feed (remaining Collaboration-group items), or
  start on creative-production modules (storyboards, shot lists, call
  sheets, assets) now that projects exist for them to attach to, per ADR 0012.

## 2026-07-08 Comments Module

Current milestone: Phase 8 - backend bootstrap

Completion percentage: N/A (new workstream; frontend tracked separately above)

Features completed:

- Added the `Comment` Prisma model, resolving the "comment target modeling
  strategy" decision that had been deferred since ADR 0022: a polymorphic
  `commentableType` (`"task"` | `"project"`) + `commentableId` pair, with
  `organizationId` denormalized on the row (matching `tasks`/`messages`'
  existing pattern) so membership checks don't need an extra join.
- Implemented `apps/api/src/comments/*`:
  `POST`/`GET /api/v1/tasks/:taskId/comments` and
  `POST`/`GET /api/v1/projects/:projectId/comments` - create + list only,
  chronological order, cursor-paginated via the existing
  `apps/api/src/common/pagination.ts`.
- `CommentsService` resolves each target's `organizationId` by querying
  `task`/`project` directly (no dependency on `TasksService`/
  `ProjectsService` - same pattern `ProjectsService.linkClient` already
  established for checking a `Client` without depending on
  `ClientsService`).

Features started:

- None beyond the above. Edit/delete, `asset_version` as a third
  commentable type, and realtime delivery are all explicitly deferred (see
  ADR 0024).

Files modified:

- `packages/database/prisma/schema.prisma` (`Comment` model; `Organization`/
  `User` back-relations)
- `apps/api/src/app.module.ts` (registered `CommentsModule`)
- `docs/adr/README.md`, `MASTER_INDEX.md`, `docs/roadmap.md`,
  `docs/database.md`, `docs/api.md` (ADR 0024 references, new "Comments"
  endpoint docs, filled-in table doc, removed "comment target modeling
  strategy" from the deferred-decisions list now that it's resolved)

Files created:

- `apps/api/src/comments/*` (`comments.module.ts`,
  `task-comments.controller.ts`, `project-comments.controller.ts`,
  `comments.service.ts`, `dto/create-comment.dto.ts`)
- `docs/adr/0024-comments-module.md`

Files removed:

- None.

Database changes:

- Added `comments`. No existing-table column changes - no dev database
  reset needed.

API changes:

- Added `POST`/`GET /api/v1/tasks/:taskId/comments` and
  `POST`/`GET /api/v1/projects/:projectId/comments`.

Architecture changes:

- First table with a polymorphic association in this backend - resolved
  via a type+id string pair rather than per-type join tables, deliberately
  trading DB-level foreign-key integrity on `commentable_id` for schema
  simplicity (validity enforced at the service layer instead).

Performance improvements:

- None.

Bugs fixed:

- None (new code).

Known bugs:

- None currently tracked, within this pass's documented scope limitations
  (see ADR 0024's Costs section).

Validation:

- Docker Desktop had stopped during this session (background service was
  down); restarted it, waited for the daemon, then
  `docker compose up -d postgres` brought the _existing_ container back
  (data intact, no reset needed). `npm run db:migrate --name comments`
  applied cleanly. `npm run build:api`, `typecheck`, and `lint` all passed.
- Started `apps/api`; created 2 comments on an existing task from 2
  different users, confirmed chronological ordering and correct
  `authorName` per comment.
- Created a comment on an existing project and confirmed it does **not**
  appear in the task's comment list (target isolation holds).
- Bad `taskId`/`projectId` correctly 404 `task_not_found`/
  `project_not_found`; empty `body` correctly 400 `invalid_request`; a
  non-member correctly 403 `forbidden`.
- Root `npm run typecheck` (apps/web) - unaffected, only the same
  pre-existing `app-sidebar.tsx` error (no frontend files touched this
  pass). Every behavior matched the plan exactly.

Technical debt:

- No edit/delete endpoint for comments.
- No DB-level integrity on `commentable_id` (service-layer 404 checks
  only).
- Same pre-existing gaps carried over from prior ADRs (no granular
  permission enforcement beyond membership, no realtime delivery, no
  activity feed yet).

Next task:

- Activity feed (last remaining Collaboration-group item), or start on
  creative-production modules (storyboards, shot lists, call sheets,
  assets) now that projects exist for them to attach to, per ADR 0012.

## 2026-07-09 Frontend/Backend Integration

Current milestone: Phase 8 - backend bootstrap (this session's addition:
`apps/web` now actually calls `apps/api` for its core loop)

Completion percentage: N/A (new workstream; frontend tracked separately
above)

Features completed:

- Rewrote `apps/web/src/services/base-workspace.service.ts` to call the
  real backend instead of its in-memory mock, keeping every exported
  function's signature/return type identical so consuming components
  mostly didn't need to change: `login`/`signup` call the real auth
  endpoints then `GET /workspace`; `createHouse`/`joinHouse` call the real
  house endpoints; `createTask` supplies `houseId` from a module-level
  cached "active house" (refreshed by every workspace/house-returning
  call) since the real `POST /api/v1/tasks` contract needs it but the
  mock's `CreateTaskRequest` never had it; `sendChatMessage` calls the real
  chat endpoint; added a new `logout()`.
- Added `apps/web/src/lib/api/client.ts` (fetch wrapper: base URL from
  `NEXT_PUBLIC_API_URL`, attaches the bearer token, unwraps the
  `{data}`/`{error}` envelope, clears the session on `401`).
- Rewrote `apps/web/src/lib/session.ts` from a mock boolean flag
  (`hasMockSession`/`setMockSession`) to real token storage
  (`getAccessToken`/`getRefreshToken`/`setSession`/`clearSession`/
  `hasSession`), updating both call sites
  (`app/(app)/layout.tsx`, `app/login/page.tsx`).
- Wired the real signup flow: `components/signup/signup-page.tsx` (already
  fully built with name/email/password/confirm-password fields) previously
  only showed a "not open yet" notice on submit - now calls the real
  `signup()`, with client-side password-match/length validation and
  routing to `/` on success.
- Gave house creation/joining real inputs instead of hardcoded demo
  values: `HouseChoiceCard` now has a 3-state UI (choice / create form /
  join form) with real `name`/`handle`/`description` and `inviteCode`
  fields; `NoHouseOnboarding` forwards the real form data instead of
  always calling `createHouse({name: "Nova Frame House", ...})` and
  `joinHouse({inviteCode: "NOVA-2048"})` unconditionally.
- Added a working logout: `SidebarUserFooter` was a purely decorative
  button with no dropdown at all - now a real dropdown menu (Settings
  link + destructive "Log out" item).
- Added `NEXT_PUBLIC_API_URL` to `apps/web/.env.example` and an `api`
  entry to `.claude/launch.json` so both dev servers can be started via
  the preview tooling.
- Fixed every remaining pre-existing lint/type issue carried across many
  prior sessions - `apps/web` now passes `lint` and `typecheck` with zero
  errors or warnings for the first time in this project's history:
  - `crews-page.tsx`: removed an ineffective `useMemo` (its dependency,
    `searched`, was already recomputed fresh every render, so the
    memoization was never actually stable - React Compiler correctly
    flagged this; replaced with a plain computation, consistent with the
    rest of the component's derived values).
  - `storage-overview-panel.tsx`: same "mutate a variable inside a render-
    time `.map()`" issue `analytics/donut-chart.tsx` had before (per the
    2026-07-08 Analytics session) - precomputed arc offsets in a plain
    loop before JSX, same fix pattern.
  - `profile-section.tsx`: replaced `<img>` with `next/image`'s `<Image>`
    (local `/public` path, no config changes needed).
  - `settings-data.ts`: removed an unused `Shield` icon import.
  - `app-sidebar.tsx`'s long-standing typed-route error turned out to be
    Next's generated `.next/types/routes.d.ts` being stale, not a real
    code issue (matches a "known bug" already noted in the 2026-07-08
    Analytics session) - a fresh `npm run build` regenerated it correctly
    and the error is gone.

Features started:

- None beyond the above. Refresh-token rotation isn't wired into the
  frontend yet (a session just stops working after the 15-minute access
  token expires); no password-reset/email-verification screens exist yet
  despite the backend endpoints being live.

Files modified:

- `apps/web/src/services/base-workspace.service.ts` (full rewrite)
- `apps/web/src/lib/session.ts` (full rewrite)
- `apps/web/src/app/(app)/layout.tsx`, `apps/web/src/app/login/page.tsx`
  (updated session-helper usage; layout also now redirects to `/login` on
  a failed/expired-token workspace fetch instead of hanging)
- `apps/web/src/components/signup/signup-page.tsx` (real signup call)
- `apps/web/src/components/houses/house-choice-card.tsx`,
  `apps/web/src/components/houses/no-house-onboarding.tsx` (real
  create/join forms)
- `apps/web/src/components/layout/sidebar-user-footer.tsx` (working
  logout dropdown)
- `apps/web/src/types/base.ts` (added `SignupRequest`)
- `apps/web/.env.example`, `.claude/launch.json`
- `apps/web/src/components/crews/crews-page.tsx`,
  `apps/web/src/components/files/storage-overview-panel.tsx`,
  `apps/web/src/components/settings/profile-section.tsx`,
  `apps/web/src/components/settings/settings-data.ts` (pre-existing
  lint-issue fixes, unrelated to the integration itself)
- `docs/adr/README.md`, `MASTER_INDEX.md`, `docs/roadmap.md` (ADR 0025
  references and integration status)

Files created:

- `apps/web/src/lib/api/client.ts`
- `docs/adr/0025-frontend-backend-integration.md`

Files removed:

- None.

Database changes:

- None (consumes existing endpoints only).

API changes:

- None (consumes existing endpoints only).

Architecture changes:

- First pass where `apps/web` and `apps/api` run together against the same
  real data. Confirms the "keep the mock's type contract, swap the
  implementation" approach (ADR 0017's original intent) works in practice:
  most consuming components needed zero changes.
- `docker-compose.yml`'s `postgres` service and `.claude/launch.json`'s
  `web`/`api` entries are now the standard local dev setup: `docker
compose up -d postgres`, then start both dev servers.

Performance improvements:

- None.

Bugs fixed:

- Fixed the last 5 pre-existing lint/type issues (see Features completed) -
  `apps/web` is fully lint/typecheck-clean for the first time.

Known bugs:

- None currently tracked. Docker Desktop's background service had
  independently stopped mid-session (unrelated to any code change);
  restarting it and running `docker compose up -d postgres` brought the
  existing container back with data intact.

Validation:

- `npm run lint` and `npm run typecheck` (root, covering both workspaces)
  both pass with zero errors/warnings.
- `npm run build` (apps/web) succeeds, all 17 routes compile.
- Started both dev servers via `.claude/launch.json` (`web` on :3000,
  `api` on :4000) with Postgres running, and drove the full flow live in
  a real browser:
  - Signed up a real account (name/email/password) - `POST /auth/signup`
    -> `201`, `GET /workspace` -> `200`, correct redirect to
    `/houses/new`, real avatar initials ("NV") rendered in the topbar.
  - Created a real house via the new form (name/handle/description) -
    `POST /houses` -> `201`, redirect to the dashboard, "Team Online: 1/1".
  - Signed up a second real account, joined the first house via its real
    (server-generated) invite code through the new join form - `POST
/houses/join` -> `201` (implicitly via the network log's 200/201
    sequence), redirect to the dashboard, "Team Online: 1/2" with both
    members' avatar initials shown, "Good morning, Vikram" greeting
    confirming per-user identity.
  - Reloaded the page mid-session - session persisted (no bounce to
    `/login`), zero console errors.
  - Logged out via the new dropdown - session cleared
    (`sessionStorage` token removed), redirected to `/login`.
  - Logged back in with the same real account - succeeded, landed back
    on the dashboard.
  - Attempted login with a wrong password - real backend
    `401 invalid_credentials` surfaced as "Invalid email or password." in
    the UI, matching the exact error-message pass-through pattern already
    used everywhere else in the mock-to-real transition.
  - Added silent refresh-on-401 to `apiRequest` (retries once via
    `POST /auth/refresh`, deduped across concurrent 401s) and verified it
    live: corrupted the stored access token in `sessionStorage`, reloaded,
    and confirmed the network log showed `GET /workspace` `401` ->
    `POST /auth/refresh` `200` -> retried `GET /workspace` `200`, staying
    on the dashboard with no bounce to `/login`.

Technical debt:

- No password-reset/email-verification UI, despite the backend endpoints
  being live (ADR 0019).
- Every page outside the core loop (`/tasks`, `/crews`, `/files`,
  `/storyboard`, `/calendar`, `/bookings`, `/analytics`, `/settings`, and
  the dashboard's "Recent Projects"/"Recent Activity" panels) still runs
  on independent local mock data - not touched by this pass, and each
  would need its own backend module before it could be wired up the same
  way.
- Refresh is reactive (on a `401`), not proactive before expiry - the
  triggering request still pays for one failed attempt before the retry.
- Same pre-existing backend gaps carried over from prior ADRs (no granular
  permission enforcement beyond membership, no realtime delivery, no
  activity feed yet).

Next task:

- Wire up an email-verification screen against the already-live
  `POST /api/v1/auth/verify-email` endpoint.
- Activity feed, or creative-production modules (storyboards, shot lists,
  call sheets, assets), continuing the backend build-out per ADR 0012 -
  each new backend module is also a candidate to wire an existing mock
  page up to real data, following this session's pattern.

## 2026-07-09 Forgot/Reset Password Screens

Current milestone: Phase 8 - backend bootstrap (frontend polish continuing
from the integration pass above)

Completion percentage: N/A

Features completed:

- Built real forgot-password (`apps/web/src/app/forgot-password`) and
  reset-password (`apps/web/src/app/reset-password`) screens, replacing
  the login page's previously-dead `#forgot-password` anchor. Both call
  the already-live backend endpoints from ADR 0019
  (`POST /api/v1/auth/request-password-reset`,
  `POST /api/v1/auth/reset-password`) via two new
  `base-workspace.service.ts` functions (`requestPasswordReset`,
  `resetPassword`).
- Forgot-password screen shows a deliberately non-committal success
  message ("If an account exists...") matching the backend's no-
  enumeration design (never reveals whether the email is registered), and
  links to the reset screen.
- Reset-password screen accepts an optional `?token=` query param
  (pre-fills the reset-code field, ready for a real emailed link once an
  email provider is chosen) with a manual-paste fallback for now, since
  the backend currently only logs the token server-side; validates
  password match/length client-side; auto-redirects to `/login` on
  success.

Features started:

- None beyond the above. Email verification (`POST /api/v1/auth/verify-email`
  is live but has no frontend screen yet) is the one auth endpoint still
  without a UI.

Files modified:

- `apps/web/src/services/base-workspace.service.ts` (`requestPasswordReset`,
  `resetPassword`)
- `apps/web/src/types/base.ts` (`RequestPasswordResetRequest`,
  `ResetPasswordRequest`)
- `apps/web/src/components/login/login-page.tsx` ("Forgot password?" now a
  real `Link` to `/forgot-password` instead of a `#` anchor)
- `docs/adr/0025-frontend-backend-integration.md` (documented in place
  rather than a new ADR, since it's a direct continuation of the same
  integration effort)

Files created:

- `apps/web/src/components/login/forgot-password-page.tsx`,
  `apps/web/src/app/forgot-password/page.tsx`
- `apps/web/src/components/login/reset-password-page.tsx`,
  `apps/web/src/app/reset-password/page.tsx`

Files removed:

- None.

Database changes:

- None (consumes existing endpoints only).

API changes:

- None (consumes existing endpoints only).

Architecture changes:

- None new - follows the exact pattern ADR 0025 already established
  (real form, real service call, real error surfacing).

Performance improvements:

- None.

Bugs fixed:

- Fixed the dead `#forgot-password` anchor that led nowhere.
- Hit the same stale-typed-routes issue noted in prior sessions when
  adding new top-level routes (`tsc` failed on `Link href="/forgot-password"`/
  `href="/reset-password"` until a fresh `npm run build` regenerated
  `.next/types/routes.d.ts`) - now a recognized/expected step after adding
  any new route, not a real bug each time.

Known bugs:

- None.

Validation:

- `npm run build`, `npm run typecheck`, and `npm run lint` (apps/web) all
  pass cleanly with the two new routes included.
- Verified live end-to-end in the browser: submitted the forgot-password
  form for a real account, confirmed the non-committal success message,
  pulled the real reset token from the API server log
  (`AuthService` log line), submitted it on the reset-password screen with
  a new password, confirmed the success message and auto-redirect to
  `/login`, then logged in with the new password and landed back on the
  dashboard. Zero console errors throughout.

Technical debt:

- No email-verification screen yet.
- Reset-password's `?token=` deep link is unexercised until a real email
  provider sends an actual link containing it.

Next task:

- Email-verification screen, following the same pattern.
- Continue backend build-out (activity feed, creative-production modules)
  per ADR 0012, or wire more existing frontend pages to real data as their
  backend modules get built.

## 2026-07-10 Tasks Page Extension

Current milestone: Phase 8 - backend bootstrap (wiring more existing
frontend pages to real data, continuing from the integration pass above)

Completion percentage: N/A

Features completed:

- Investigated wiring Projects, Tasks, and Messages to real data and found
  every one of them has a frontend mock shape materially richer than its
  matching backend model (Projects: genre/stage/progress/cover art/team;
  Tasks: an incompatible status vocabulary and no update endpoint;
  Messages: embedded per-channel files/tasks/events widgets). Decided (with
  explicit user confirmation) to extend each backend model to match its
  designed UI rather than trim the UI down, starting with Tasks since it
  was closest to already matching.
- Unified the task status vocabulary: the dashboard's task panel
  (`ProductionTask`, wired since ADR 0025) used
  `scheduled/in-progress/review/done`, while the standalone `/tasks` page's
  mock used `todo/in-progress/on-hold/done` - two silently incompatible
  sets backing the same underlying `Task` rows. Standardized on the Tasks
  page's vocabulary (the purpose-built surface), changed `Task.status`'s DB
  default from `"scheduled"` to `"todo"`, and backfilled existing rows via
  migration (`scheduled -> todo`, `review -> in-progress`).
- Auto-derived `Task.role` from the assignee's current house role instead
  of requiring it as a `CreateTaskDto` field - the Tasks page's create flow
  never actually had a role picker, so the field was previously either
  wrong or unpopulated.
- Added `PATCH /api/v1/tasks/:taskId` (title/project/assigneeId/dueDate/
  priority/status, any subset; reassigning re-derives `role` and notifies
  the new assignee) and `DELETE /api/v1/tasks/:taskId`. Only create existed
  before.
- Rewired `apps/web/src/components/tasks/tasks-page.tsx` off its 24-item
  hardcoded mock array onto `workspace.tasks` from `useWorkspace()`;
  create/duplicate/delete/status-toggle now call the real API and
  `refreshWorkspace()` instead of mutating local state. Replaced two
  hardcoded `user-id -> name/initials` lookup tables
  (`MEMBER_NAMES`/`MEMBER_LABELS`) with the real `assigneeName` already on
  each task DTO. Dropped `attachmentCount` from the UI entirely (no backend
  concept exists for it) rather than faking it; kept `commentCount` as an
  always-`undefined` optional field for now.
- See ADR 0026.

Validation:

- `npm run typecheck`, `npm run lint`, and `npm run build:api` all pass
  cleanly. `prisma migrate status` confirms the new migration applied
  cleanly against the dev database.
- curl-verified: created a task (confirmed `role` auto-derived, `status`
  defaulted to `"todo"`), `PATCH`ed its status to `"done"` and separately
  its `priority`/`title`, `DELETE`d it and confirmed it no longer appears
  in `GET /workspace`. Confirmed `400 invalid_request` for a bogus `status`
  value and `404 task_not_found` for a nonexistent task id.
- Verified live in-browser end-to-end: logged in as a real account,
  created a task via the "New Task" button (real `POST`, visible
  immediately in the list and every side panel), toggled its status via
  the row checkbox (real `PATCH`, task moved from "To Do" to "Completed"
  group, tab counts and stat panels all recomputed), and deleted it via
  the row's menu (real `DELETE`, list returned to its empty state). Zero
  console errors throughout.

Technical debt:

- `commentCount` has no backing computation yet - always `undefined`.
- `Task.project` remains freeform text, not a `Project` foreign key.
- Projects and Messages still need the same "extend backend schema first"
  treatment before they can be wired up; both are bigger lifts than Tasks
  was.

Next task:

- Extend the `Project` model to match its designed UI (genre, type, stage,
  progress, cover art, team) and wire up `/projects`, or continue with
  Messages, or pick up the activity feed / creative-production modules.

## 2026-07-10 Projects Page Extension

Current milestone: Phase 8 - backend bootstrap (wiring more existing
frontend pages to real data, continuing from the Tasks extension above)

Completion percentage: N/A

Features completed:

- Extended `Project` (ADR 0022's minimal `name`/`description`/`status`)
  with `type`, `genre`, `stage` (7-value enum, default `"Development"`),
  `progress` (0-100), `coverGradient`/`coverIcon`, `dueDate`, and `teamIds`
  (`String[]`, validated against real house membership at write time, not
  foreign-keyed) - matching every field the Projects page's designed UI
  actually renders.
- Resolved a naming collision between the DB's archive-tracking `status`
  column (`active`/`archived`, from ADR 0022) and the frontend's
  display-status field (`active | in-progress | on-hold | completed`,
  from the mock): the API response's `status` is now computed
  server-side from `stage` via the same mapping the frontend mock already
  had, while the DB column keeps tracking archive state privately -
  never returned in any response.
- `GET /api/v1/houses/:houseId/projects` now excludes archived projects
  (previously returned everything regardless of status - a gap noted but
  left open in ADR 0022).
- Dropped the mock's `image`/cover-photo field entirely rather than
  leaving it as a permanently-`null` placeholder - no object storage
  exists anywhere in the backend, so every real project now falls back to
  `coverGradient`/`coverIcon`. `teamOverflow` is no longer a stored,
  arbitrary number; `TeamAvatarStack` now genuinely computes it (shows up
  to 4 real member avatars, `+N` for the rest).
- Rewired `apps/web/src/components/projects/projects-page.tsx` off its
  12-item hardcoded mock array onto a real `listProjects()` fetch on
  mount; create/duplicate/archive now call the real API. Retired two
  hardcoded lookup tables (`MEMBER_LABELS`/`MEMBER_AVATARS`) in favor of
  real `HouseMember` data passed down to `TeamAvatarStack`.
- See ADR 0027.

Validation:

- `npm run typecheck`, `npm run lint`, and `npm run build:api` all pass
  cleanly. Migration applied cleanly against the dev database.
- curl-verified: created a project with every new field populated
  (confirmed `status` correctly derived from `stage`), confirmed
  `400 invalid_request` for a bad `stage` value and for a `teamIds` entry
  that isn't a real house member, `PATCH`ed `stage` to `"Completed"`
  (confirmed `status` flips to `"completed"`), archived it, and confirmed
  the archived project no longer appears in the list endpoint.
- Verified live in-browser end-to-end: created a project via the "New
  Project" button (real `POST`, visible immediately with the correct
  Development-stage badge, gradient cover, 0% progress, "TBD" due date),
  and archived it via the card menu (real `POST .../archive`, the project
  disappeared from the list and every tab count returned to 0). Zero
  console errors throughout.

Technical debt:

- `teamIds` has no DB-level referential integrity - a member removed from
  a house can leave a stale id in an old project's `teamIds` until that
  project is next updated.
- No cover-photo upload exists; every real project uses a gradient/icon.
- The Project Timeline and Recent Activity panels on the Projects page
  are still unrelated local mock data (unchanged since ADR 0025) - easy to
  mistake the whole page for "fully real" when only the project list
  itself is.

Next task:

- Object storage is now a concrete, named prerequisite for two separate
  features (project cover photos, the entire `/files` page) - worth
  solving once. Otherwise: extend Messages' backend to match its
  embedded-widget UI, or Crews (needs a department/status/availability
  model distinct from the existing house Role system), or pick up the
  activity feed / creative-production modules.

## 2026-07-10 Crews Module

Current milestone: Phase 8 - backend bootstrap (wiring more existing
frontend pages to real data, continuing from the Projects extension above)

Completion percentage: N/A

Features completed:

- Resolved a real product/backend mismatch before writing any code: the
  Crews page's mock modeled crew members as a roster independent of real
  house membership (fabricated ids/emails, an "Invite" flow that created
  a fake person from a typed name with no real account). Decided a crew
  member must always be a real house member - no shadow roster.
- Added `CrewProfile` (department, role category, availability status,
  current assignment, birthday), a 1:1 extension of a house membership
  auto-seeded whenever someone creates or joins a house
  (`OrganizationsService.createHouse`/`joinHouse`), with `jobTitle`
  defaulted from the member's house role name. Every house member always
  has a crew profile - there's no separate "create a crew member" step.
- Built the `crews` module: `GET`/`PATCH /api/v1/houses/:houseId/crew(/:userId)`
  for listing and editing crew profiles.
- Added this codebase's first member-removal capability
  (`OrganizationsService.removeMember` + `DELETE .../crew/:userId`):
  deletes the target's `OrganizationMembership` and `CrewProfile` in one
  transaction. Refuses to empty a house entirely (blocks removing the
  last remaining member); no finer-grained "only Owners can remove
  people" check exists yet - flagged explicitly as a real gap, not
  silently shipped.
- Reinterpreted "Invite Member" to reveal the house's real invite code
  (`activeHouse.inviteCode`, already returned by the workspace snapshot)
  instead of fabricating a member - the mock's version never created
  anything a real person could actually use to join.
- Rewired `apps/web/src/components/crews/crews-page.tsx` off its 24-item
  hardcoded mock array onto a real `listCrew()` fetch on mount; remove
  now calls the real API with a confirmation dialog first. Dropped a
  hardcoded `userId -> avatar image` lookup table (no object storage
  exists) in favor of initials-only avatars, matching Tasks/Projects.
- See ADR 0028.

Validation:

- `npm run typecheck`, `npm run lint`, and `npm run build:api` all pass
  cleanly. Migration applied cleanly against the dev database.
- curl-verified with two real accounts: house creation auto-seeded the
  owner's crew profile with `jobTitle: "Owner"`; the second account
  joining via a real invite code auto-seeded theirs with
  `jobTitle: "Member"`; `PATCH`ed the member's profile (department,
  status, current project, birthday) and confirmed every field updated;
  confirmed `400 invalid_request` for a bad `department` value; removed
  the member and confirmed they no longer appear in the list; confirmed
  `400 invalid_request` when attempting to remove the house's last
  remaining member.
- Verified live in-browser end-to-end: logged in as a real account, saw
  the real crew member (department, status, job title all correct),
  triggered "Invite Member" and confirmed it revealed the real invite
  code, and triggered "Remove" on the only member - confirmed the real
  `DELETE` request fired, got rejected with the last-member guard, and
  the UI handled the error gracefully (no crash, member still listed).
  Zero console errors throughout.

Technical debt:

- No RBAC on member removal - any member can remove any other member,
  including the Owner. A real gap now that real users could be affected
  by it, not just a theoretical one.
- `PATCH .../crew/:userId` exists but the Crews page UI has no edit form
  wired to it yet - the endpoint is ahead of the UI for it.
- Removing a member has no undo and only a browser `confirm()` dialog as
  a safety check.

Next task:

- Real RBAC (who can remove/edit what) is now a concretely scoped gap
  across every module - worth solving once, broadly. Otherwise: extend
  Messages' backend to match its embedded-widget UI, wire up an edit-crew-
  profile form now that the endpoint exists, or pick up Files/Storyboard/
  Bookings/Analytics/Calendar (all still local mock data).

## 2026-07-10 Messages Page Extension

Current milestone: Phase 8 - backend bootstrap (wiring more existing
frontend pages to real data, continuing from the Crews module above)

Completion percentage: N/A

Features completed:

- Recognized the Messages page's mock was structurally bigger than real
  chat (ADR 0021) supports at all - not just missing fields, but entire
  concepts with no backend counterpart: per-message file attachments,
  per-channel embedded Files/Tasks/Events sub-resources, a DM (`kind:
"dm"`) distinction with no 1:1 messaging model, and a realtime "typing…"
  indicator with no websocket transport. Scoped this pass to what's real
  and reasonably extendable, not a full rebuild of every mock concept.
- Wired the core "Messages" tab to real `Conversation`/`Message` data -
  this was already fully available via `workspace.chatRooms` and the
  existing `sendChatMessage` API, same pattern as Tasks' `workspace.tasks`.
  No new fetch needed.
- Added `POST /api/v1/houses/:houseId/conversations` so "New Chat"
  creates a real channel instead of a fabricated local-only one -
  rejects duplicate names within a house (`409 channel_name_taken`).
- Dropped the DM concept entirely (`Channel.kind` is now a literal
  `"group"`, not a union) since every real `Conversation` is a
  house-wide group channel - let `ChannelAvatar`/`ChannelInfoPanel` drop
  their now-dead DM branches. Dropped file attachments from messages and
  the composer (no object storage, same reasoning as Tasks/Projects).
- Kept the Files/Tasks/Events tabs rather than removing them (would have
  meant a bigger UI refactor across `chat-tabs.tsx` and three list
  components) but they now render truthfully empty - no fabricated
  content, no per-channel backend exists for any of the three yet.
- `unreadCount` stays exactly what the backend already returns (always
  `0` - no read-cursor tracking exists) rather than inventing a
  client-only approximation that would reset on reload and misrepresent
  itself as a real feature. Dropped `pinned` entirely (nothing in the UI
  ever actually toggled it, even in the mock).
- Member list now uses real house members (every house member can see/
  post in every conversation - no per-channel membership table exists).
- See ADR 0029.

Validation:

- `npm run typecheck`, `npm run lint`, and `npm run build:api` all pass
  cleanly.
- curl-verified: created a new conversation with a topic, confirmed the
  response shape; attempted to create a duplicate-named conversation and
  confirmed `409 channel_name_taken`.
- **Live browser verification was not completed this pass** - both the
  standard preview browser tooling and the Chrome extension reported
  "not connected" partway through this work and remained unavailable.
  Unlike ADR 0026/0027/0028 (all verified live in-browser), this pass is
  curl- and typecheck/lint/build-verified only. Flagged explicitly as
  owed follow-up rather than silently skipped.

Technical debt:

- Live browser verification for the Messages page is still owed.
- Files/Tasks/Events tabs are permanently empty until their own backend
  domains exist - present in the UI but currently dead weight.
- No DMs, no attachments, no realtime typing indicator, no working
  unread tracking.

Next task:

- Live-verify the Messages page in-browser once preview tooling is back.
- Object storage is now a named prerequisite for three separate features
  (project cover photos, message attachments, the entire `/files` page)
  - worth solving once. Otherwise: pick up Files/Storyboard/Calendar/
    Bookings/Analytics (all local mock data, each needing its own backend
    domain), wire up the Crews edit-profile form, or address real RBAC.

## 2026-07-11 Calendar Page Extension

Current milestone: Phase 8 - backend bootstrap (wiring more existing
frontend pages to real data, continuing from the Messages module above)

Completion percentage: N/A

Features completed:

- Recognized that, unlike Tasks/Projects/Crews, Calendar had no matching
  backend model at all to extend - not even a partial one. Its mock
  needed time-of-day, an optional location, a 6-value category, and an
  association with one of several "calendars," none of which exist on
  `Task` or `Project`. Ruled out deriving events from `Task.dueDate`
  after comparing shapes directly.
- Added a new `CalendarEvent` Prisma model (`organizationId`, optional
  `projectId` with `onDelete: SetNull`, `createdById`, `title`, `date`,
  `time`, `location`, `category` default `"other"`) and migration
  `20260710221800_calendar_events`.
- Built `apps/api/src/calendar/*` (module/service/controller/DTO):
  `GET`/`POST /api/v1/houses/:houseId/calendar-events`,
  membership-gated, validating `category` against the frontend's
  existing 6-value enum and `projectId` against the same house when
  given (`404 project_not_found` otherwise). List sorted `date asc, time
asc`.
- Decided "calendars" are not a separate table: a house's calendar list
  is "My Schedule" (events with no `projectId`) plus one real entry per
  house `Project` - replacing the mock's 4 hardcoded fake production
  names with the house's actual projects. Toggling a calendar in the UI
  now filters by real `projectId`, not a decorative id.
- Rewired `calendar-data.ts` (kept the static category label/style maps,
  replaced the mock `calendarEvents`/`calendarSources` arrays with
  `buildCalendarSources(projects)` and `toCalendarEvent(apiEvent)`),
  `calendar-page.tsx` (fetches real projects + events on mount via
  `Promise.all`, tracks calendar visibility as an inactive-id set to
  avoid a setState-in-effect lint violation when new projects arrive),
  `new-event-popover.tsx` (now takes `calendarSources` as a prop and an
  async `onCreateEvent`, shows inline errors on API failure), and
  `calendars-panel.tsx` (takes `calendarSources` as a prop instead of a
  static import).
- See ADR 0030.

Validation:

- `npm run typecheck`, `npm run lint`, and `npm run build:api`/
  `build:web` all pass cleanly (root workspaces).
- curl-verified: created an event with a real `projectId` and one with
  none (lands under "My Schedule"), confirmed chronological list
  ordering, confirmed `404 project_not_found` for a nonexistent/
  cross-house project id, `400 invalid_request` for a missing title, and
  `401 unauthenticated` with no token.
- **Live browser verification completed** - the preview tooling that was
  unavailable during the Messages pass (ADR 0029) was back for this one.
  Logged in as a real test account, saw two curl-seeded events render on
  the correct calendar days, opened "New Event," selected a real project
  as the calendar, submitted, and watched the new event appear
  immediately in both the month grid and the upcoming-events panel.

Technical debt:

- No update/delete endpoint for calendar events yet (create + list only,
  matching Comments/Messages' first-pass scope).
- Week/Day tab views remain the pre-existing decorative empty state -
  out of scope for this pass.
- Live browser verification for the Messages page (ADR 0029) is still
  owed as a separate follow-up.

Next task:

- Live-verify the Messages page in-browser (still owed from ADR 0029).
- Object storage remains a named prerequisite for project cover photos,
  message attachments, and the entire `/files` page. Otherwise: pick up
  Files/Storyboard/Bookings/Analytics (all local mock data, each needing
  its own backend domain), or address real RBAC.

## 2026-07-11 Time Tracking and Analytics

Current milestone: Phase 8 - backend bootstrap (wiring more existing
frontend pages to real data, continuing from the Calendar module above)

Completion percentage: N/A

Features completed:

- Asked how to handle Analytics, since roughly half its mock (hours
  logged, time-per-phase, team workload %, a per-project progress-over-
  time trend) depended on time tracking, a feature that didn't exist
  anywhere in the backend - unlike every prior page this session, this
  wasn't just a schema extension. Chose to build time tracking as its
  own feature first, then wire Analytics to genuine data from it.
- Added a new `TimeEntry` Prisma model (`organizationId`, optional
  `projectId` with `onDelete: SetNull`, `userId`, `phase` default
  `"Production"`, `hours` as `Float`, `date`, optional `note`) and
  migration `20260710223849_time_entries`.
- Built `apps/api/src/time-entries/*`:
  `GET`/`POST /api/v1/houses/:houseId/time-entries`, membership-gated,
  validating `phase` against the same 4 values the mock's time-
  distribution chart already used and `projectId` against the house.
- Built `apps/api/src/analytics/*`: a single
  `GET /api/v1/houses/:houseId/analytics` endpoint computing every
  number the page needs server-side rather than shipping raw rows -
  project/task totals, task-status breakdown (mapped from the real
  `todo`/`in-progress`/`on-hold`/`done` vocabulary to the mock's
  Completed/In Progress/To Do/Blocked labels), daily time-logged series,
  phase distribution, top active projects, per-project daily hours,
  top contributors, team workload, and an activity heatmap derived from
  real `Task`/`Message`/`Comment`/`TimeEntry` timestamps. Defined
  concretely what had previously been vibes-only numbers: active
  projects (stage not Completed/On Hold), team efficiency (tasks
  completed / total), team workload % (hours logged in the last 7 days
  vs. a flat 40h/week capacity, capped at 100).
- Caught and fixed a real timezone bug during curl verification: the
  initial `toDateKey` helper mixed local-time day arithmetic
  (`getDate`/`setDate`) with UTC serialization (`toISOString`), which
  silently dropped "today"'s time entries from the last-7-days window
  whenever the server's local date and UTC date diverged. Fixed to
  format the date key entirely from local components.
- Added a "Log Time" popover directly on the Analytics page (no separate
  time-tracking page exists in the design) so logging hours and seeing
  them reflected in the dashboard is one tight loop.
- Rewired every Analytics panel component from static mock-array imports
  to props sourced from the real `analytics` payload. Dropped rather
  than faked the pieces with no real backing even after time tracking
  exists: stat-card sparklines and "+12% this month" notes (no
  historical daily snapshots exist), the header's static
  "Jul 1 – Jul 7, 2026" button and "Export" button (both inert), and the
  hardcoded "18% more completed tasks" line and Insight Banner copy
  (replaced with a sentence computed from real totals).
- Repurposed the "Project Progress" multi-line chart into "Hours Logged
  by Project" (real per-project daily hours) rather than dropping it,
  since the underlying chart component just needed a `valueSuffix`/
  `maxValue` prop pair to stop being hardcoded to a 0-100% scale.
- Replaced `TopActiveProjectsPanel`'s hardcoded fake image paths with
  the same `coverGradient`/`coverIcon` rendering `ProjectGridCard`
  already uses (ADR 0027) - no object storage exists, so a fake photo
  path would now be actively misleading for a real project.
- See ADR 0031.

Validation:

- `npm run typecheck`, `npm run lint`, and `npm run build:api`/
  `build:web` all pass cleanly.
- curl-verified: created time entries with and without a project,
  confirmed list ordering, `404 project_not_found` for a cross-house
  project, `400 invalid_request` for non-positive hours, and the full
  `GET .../analytics` payload shape and values against manually-seeded
  data (including catching and fixing the timezone bug above).
- **Live browser verification completed**: logged in as a real test
  account, confirmed every panel (stat cards, hours-by-project chart,
  task status, time logged, time distribution, activity heatmap, top
  contributors, top active projects, insight banner, team workload)
  rendered correctly from curl-seeded data, then logged a new time entry
  through the "Log Time" popover and watched Hours Logged, Time
  Distribution, Team Workload, and the insight banner update
  immediately with the new numbers.

Technical debt:

- No update/delete endpoint for time entries yet (create + list only,
  matching every other module's first-pass scope this session).
- Team workload's 40h/week capacity is a flat, stated assumption, not
  configurable per person or house.
- The activity heatmap will look sparse on a house with little history
  - honest given real (small) sample sizes, not a bug.

Next task:

- Live-verify the Messages page in-browser (still owed from ADR 0029).
- Object storage remains a named prerequisite for project cover photos,
  message attachments, and the entire `/files` page. Otherwise: pick up
  Files/Storyboard/Bookings (both local mock data, each needing its own
  backend domain), or address real RBAC.

## 2026-07-11 Continuous Deployment

Current milestone: Phase 8 - backend bootstrap / deployment

Completion percentage: N/A

Features completed:

- User reported the live Hostinger site was showing an old version of
  the app despite GitHub being current. Investigated and found the root
  cause: Hostinger's static Git deployment serves whatever
  `index.html`/`_next/*` files are committed at the repository root
  (mirrored from `npm run build:hostinger`'s output per
  `docs/hostinger-deployment.md`), and that rebuild had only ever been
  run and committed by hand - last done 2026-07-07, silently falling
  ~2 weeks behind as feature work (Tasks through Analytics) continued.
- Also discovered no backend had ever been deployed anywhere - the live
  site's login/signup/every real page would fail for actual users
  regardless of how fresh the static export was, since there was nothing
  for it to call. Asked the user how to proceed; chose to fix the stale
  build automatically AND deploy a real backend, using an available
  Hostinger VPS.
- Added `.github/workflows/deploy-hostinger.yml`: rebuilds
  `npm run build:hostinger` on every push to `main` and, only if the
  output differs from what's committed, pushes a
  `chore(deploy): ... [skip deploy]` commit updating the root static
  files - closing the gap between GitHub and the live frontend
  automatically going forward.
- Added `docker-compose.prod.yml` (API + Postgres only - the frontend
  stays on Hostinger's existing static hosting rather than moving onto
  the VPS), `deploy/api.env.example` (the untracked secrets template for
  the VPS), `deploy/nginx-api.conf.example` (reverse-proxy template for
  the API subdomain), and `deploy/deploy.sh` (git pull, `docker compose
up -d --build`, `prisma migrate deploy`, image prune - the script the
  deploy workflow runs on the server).
- Added `.github/workflows/deploy-vps.yml`: SSHs into the VPS
  (`appleboy/ssh-action`) on every push to `main` and runs
  `deploy/deploy.sh`, so backend code and schema changes ship
  automatically alongside the code that needs them.
- Documented a full one-time VPS setup runbook in ADR 0032 (install
  Docker, clone the repo, create the `.env` secrets file, generate an
  SSH deploy key, add GitHub secrets, point DNS, configure Nginx +
  certbot) - these are credentialed, account-level steps that can't be
  automated from here and must be done once by the user before either
  pipeline can do anything.
- Updated `docs/hostinger-deployment.md` and `docs/deployment.md` to
  describe the new automatic pipelines and the still-outstanding
  one-time setup.
- See ADR 0032.

Validation:

- Could not run either deploy workflow end-to-end (no VPS SSH access or
  Hostinger account access from this environment) - this pass is
  design/implementation only. The Hostinger rebuild workflow's logic
  (rebuild, diff, conditionally commit) mirrors the exact manual steps
  already proven to work by the prior manual rebuilds in git history.

Technical debt:

- Both new workflows will fail (or no-op unhelpfully) until the ADR 0032
  one-time setup is completed - no `VPS_HOST`/`VPS_USER`/`VPS_SSH_KEY`
  secrets or `NEXT_PUBLIC_API_URL` variable exist yet.
- No automated Postgres backups on the VPS yet.
- No staging environment - every push to `main` deploys straight to
  production on both halves.
- No zero-downtime deploy for the API container (brief restart on every
  deploy).

Next task:

- Complete the ADR 0032 one-time VPS setup, then confirm both workflows
  succeed on a real push.
- Live-verify the Messages page in-browser (still owed from ADR 0029).
- Object storage remains a named prerequisite for project cover photos,
  message attachments, and the entire `/files` page. Otherwise: pick up
  Files/Storyboard/Bookings, or address real RBAC.

## 2026-07-11 Google OAuth Login

Current milestone: Phase 8 - backend bootstrap / auth

Completion percentage: N/A

Features completed:

- User asked to drop the decorative Apple/Microsoft login buttons (never
  wired to anything) and make the Google button a real, working sign-in.
- Backend: new `apps/api/src/auth/google-oauth.util.ts` (plain `fetch`
  against Google's OAuth endpoints - no `passport` dependency), new
  `AuthService.getGoogleAuthUrl(state)`/`handleGoogleCallback(code)`
  methods, and `GET /api/v1/auth/google` /
  `GET /api/v1/auth/google/callback` controller routes using `@Res()` for
  raw redirects. The callback creates a new `User`/`AuthAccount` or links
  to an existing `User` found by email (avoiding duplicate accounts for
  someone who previously signed up with a password), then reuses the
  existing `issueSessionTokens` helper unchanged.
- Added CSRF protection for the OAuth handshake: `GET /auth/google`
  generates a `state` token, passes it to Google, and also sets it as a
  5-minute `httpOnly`/`sameSite=lax` cookie; the callback rejects any
  request where the query `state` doesn't match the cookie. Added
  `cookie-parser` (+ `@types/cookie-parser`) and wired
  `app.use(cookieParser())` in `main.ts` - the only new dependency this
  pass needed.
- Frontend: removed Apple/Microsoft from `authSocialProviders`
  (`apps/web/src/components/login/auth-data.ts`), changed
  `AuthSocialProviders` to render Google as a single full-width `<a>`
  linking to `${NEXT_PUBLIC_API_URL}/auth/google` (a real navigation, not
  a fetch), and added `apps/web/src/app/auth/callback/page.tsx`, which
  reads `accessToken`/`refreshToken`/`error` from the redirect's query
  string, calls the existing `setSession()`, and navigates to `/` (or back
  to `/login?error=...` on failure). No changes were needed to
  `(app)/layout.tsx` - it already detects any valid session on mount.
- Added `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_CALLBACK_URL` to
  both `.env.example` files.
- See ADR 0035.

Validation:

- `npm run build:api`, `typecheck` (both workspaces), `lint` (both
  workspaces), and `format:check` all pass clean.
- Live-verified against the running local API and web dev servers:
  `GET /auth/google` (with temporary fake credentials) correctly builds
  the Google consent URL and sets the `state` cookie; the callback
  correctly rejects a mismatched/missing `state` before ever attempting
  the code exchange; clicking "Continue with Google" in the browser
  navigates to the real endpoint end-to-end; `/auth/callback?error=...`
  correctly bounces back to `/login`. Could not complete a real Google
  login - no Google Cloud Console OAuth client exists yet, so the
  live-with-real-account path is unverified pending that one-time setup.

Technical debt:

- The feature is fully wired but inert (`google_oauth_not_configured`)
  until real `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` values exist, which
  requires the user to create an OAuth client in Google Cloud Console
  (consent screen + authorized redirect URIs for local dev and the live
  Render API) and set the resulting values locally and in Render.
- `access_type=online` means no Google refresh token is requested; if a
  future feature needs to call Google's API on the user's behalf later
  (not just at sign-in), this would need revisiting.

Next task:

- Create the Google Cloud Console OAuth client and set
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_CALLBACK_URL` locally
  and on Render, then do a real end-to-end login to confirm the full
  flow works with an actual Google account.
- Otherwise, the same backlog as before: object storage, real RBAC,
  Files/Storyboard/Bookings.

## 2026-07-11 Google OAuth Live Verification

Current milestone: Phase 8 - backend bootstrap / auth

Completion percentage: N/A

Features completed:

- User created a real Google Cloud Console OAuth client (Web application
  type, redirect URIs registered for both `http://localhost:4000/api/v1/
auth/google/callback` and the live Render API's equivalent) and added
  the resulting `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` to local
  `apps/api/.env` (gitignored, confirmed via `git check-ignore`).
- Completed a full real Google login in-browser: clicked "Continue with
  Google" on `/login`, signed in with a real Google account through
  Google's actual consent screen, and landed authenticated on the
  dashboard as that user - confirming the ADR 0035 flow end-to-end with
  live credentials, not just the earlier structural verification.

Validation:

- Live-browser-verified only; no code changed in this pass.

Next task:

- Add the same `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/
  `GOOGLE_CALLBACK_URL` to Render's environment variables so Google login
  also works on the live deployment, not just locally.

## 2026-07-11 House Invitations and Leave-House

Current milestone: Phase 8 - backend bootstrap / organizations

Completion percentage: N/A

Features completed:

- User asked to build out "joining and invitation to a house" plus an
  option to leave a house. Joining by invite code already worked (ADR
  0020); "invite" was previously decorative (Settings' button was a
  `window.prompt` that called no API), and there was no way to leave a
  house at all - only `removeMember` (another member removing someone
  else, ADR 0028).
- Backend: new `HouseInvitation` Prisma model + migration
  (`20260711100000_house_invitations`, written by hand and applied via
  `prisma migrate deploy` rather than `migrate dev`, because the shadow
  database `migrate dev` normally uses failed against the existing
  `20260711090257_enable_row_level_security` migration - RLS with no
  policies on `_prisma_migrations` itself broke the shadow db's own
  bookkeeping. `migrate deploy` against the real dev database sidesteps
  the shadow db entirely and matches how migrations already apply in
  production per ADR 0032/0033, so this wasn't a workaround so much as
  using the already-established production path locally too).
- `OrganizationsService` gained `inviteMember`/`listInvitations`/
  `revokeInvitation`/`getInvitationPreview`/`acceptInvitation`/
  `leaveHouse`, plus a private `addMembership` extracted from `joinHouse`'s
  body and now shared by both `joinHouse` and `acceptInvitation`. New
  `POST/GET/DELETE /houses/:houseId/invitations` routes (guarded, member-
  only) and a separate public `GET /invitations/:token` /
  `POST /invitations/:token/accept` controller (preview needs no auth so
  an invited person can see who's inviting them before logging in).
  `leaveHouse` reuses the same "can't remove the house's last member"
  floor `removeMember` already enforced, and clears/reassigns
  `activeOrganizationId` on success.
- Frontend: Settings -> Members now has a real invite-by-email form
  (copies the returned link to the clipboard, since there's still no
  email provider - same "return it directly, don't just log it"
  reasoning ADR 0036 documents), a pending-invitations list with revoke,
  and a new "Danger Zone" leave-house card. New public page
  `apps/web/src/app/houses/invite/[token]/page.tsx` previews the invite
  and shows "Accept & Join" if logged in, or login/signup links if not.
- See ADR 0036.

Validation:

- `npm run build:api`, `typecheck`/`lint` (both workspaces), and
  `format:check` all pass clean.
- Live-verified against the running local API, web dev server, and real
  Postgres: sent a real invite from Settings, confirmed the link was
  returned and the "copied to clipboard" toast + pending-invitations row
  appeared; opened the real invite-accept page and confirmed it correctly
  rendered the house preview and then correctly rejected acceptance as
  `already_member` (the inviter accepting their own house's invite);
  revoked the invitation and confirmed the pending list cleared; clicked
  "Leave House" as the sole member and got the expected
  `400 invalid_request` "only member" error rendered in the UI; created a
  second real user via signup, joined Aryan's house with its real invite
  code (confirming no regression in `joinHouse` after the `addMembership`
  refactor), then had that user leave successfully and confirmed directly
  in Postgres that their `organization_memberships` row, `crew_profiles`
  row, and `users.active_organization_id` were all correctly removed/
  cleared.

Technical debt:

- No ownership-transfer or role-editing UI, so a solo "Owner" in a
  multi-member house can't currently promote someone else before leaving
  - flagged explicitly in ADR 0036 rather than silently left unhandled.
- Invitations still aren't emailed (no provider chosen) - the invite link
  only reaches its recipient if the inviter manually copies and sends it.

Next task:

- Object storage, real RBAC, Files/Storyboard/Bookings remain the
  standing backlog. A future role-editing/ownership-transfer pass should
  resolve the solo-owner-leaving gap noted above.

## 2026-07-11 Merge Backend into Next.js (Retire apps/api)

Current milestone: Phase 8 - backend bootstrap / architecture

Completion percentage: N/A

Features completed:

- User asked why the app even needed a separate backend service,
  suspecting Render's free-tier cold start (spin-down after ~15 minutes
  idle) was the real cause of reported slowness, and independently wanted
  everything in "one big thing" rather than two services - partly with an
  eye toward eventually packaging this as a single app.
- Planned this as a full architectural migration (used plan mode given
  the scope) and confirmed with the user to execute it as one continuous
  pass rather than checkpointed module-by-module.
- Ported the entire NestJS backend (`apps/api`, ~4,400 lines across 14
  domains: auth incl. Google OAuth, houses/invitations, tasks, chat,
  projects, clients, comments, crews, calendar, time-entries, analytics,
  notifications, workspace, health) into Next.js Route Handlers under
  `apps/web/src/app/api/v1/**`, backed by a new shared server-side
  library at `apps/web/src/server/**`: `prisma.ts` (dev-safe singleton
  replacing Nest's `PrismaService`), `http.ts` (`AppException`,
  `withRoute`/`withParamsRoute` replacing the global exception filter +
  per-controller envelope, `withPaginatedRoute`/`withPaginatedParamsRoute`
  for the list endpoints that return `{ data, page }` unwrapped,
  `validateDto` replacing `ValidationPipe`), `env.ts` replacing
  `ConfigService`, and one folder per domain holding a ported service
  (plain class, module-level singleton instance, `@Injectable()`/
  constructor-DI dropped) plus its DTOs (`class-validator`/
  `class-transformer` classes copied unchanged - they work standalone).
  JWT signing switched from `@nestjs/jwt` to the plain `jsonwebtoken`
  package; Google OAuth's cookie handling switched from `cookie-parser` to
  `NextResponse`/`NextRequest`'s built-in cookie APIs, and its redirect
  targets switched from building an absolute URL out of `CORS_ORIGIN` to
  `new URL(path, request.url)` (no longer needed once same-origin).
- Repointed `apps/web/src/lib/api/client.ts` and the Google login link
  from `NEXT_PUBLIC_API_URL` to a hardcoded relative `/api/v1` base.
- Added `@fylmico/database`, `argon2`, `class-validator`,
  `class-transformer`, `jsonwebtoken`, `reflect-metadata` to
  `apps/web/package.json`; added `experimentalDecorators`/
  `emitDecoratorMetadata` to `apps/web/tsconfig.json`. No `@nestjs/*`
  packages, `cookie-parser`, or `rxjs` anywhere in the repo anymore.
- Deleted `apps/api` entirely. Updated root `package.json` (workspaces,
  `dev`/`build` scripts now build `@fylmico/database` first since
  `apps/web` depends on it directly), root `Dockerfile` (now copies and
  builds `packages/database` before `apps/web`, which it previously never
  needed to since only `apps/api` consumed it), `docker-compose.yml`
  (removed the `api` service, added `DATABASE_URL` to `web`),
  `.claude/launch.json` (removed the `api` launch config), and both
  `.env.example` files (merged variables, dropped `CORS_ORIGIN`/
  `API_PORT`, fixed `GOOGLE_CALLBACK_URL`'s port from 4000 to 3000).
- See ADR 0037.

Validation:

- `npm run build`, `typecheck`, `lint`, `format:check` (single workspace
  now) all pass clean, including after a full `npm install` from scratch
  (workspace list changed) and a clean `npm run build` simulating a fresh
  clone.
- Live-verified every domain end-to-end via curl against the merged app
  and real Postgres: signup, workspace snapshot, house creation, tasks,
  chat (conversations + messages), projects, clients, comments (both task
  and project), crew list, calendar events, time entries, analytics,
  notifications, house invitations (create/list/preview), and the
  leave-house last-member guard. Confirmed the Google OAuth redirect and
  CSRF state cookie build correctly with the new same-origin callback
  URL. Did one real in-browser walkthrough (login, dashboard, Settings ->
  Members showing a pending invitation created moments earlier via curl)
  to confirm the frontend's relative-path requests actually work end to
  end, not just the API in isolation. Additionally ran the actual
  production entrypoint (`node server.js` -> the built standalone
  server) and confirmed it correctly reads environment variables and
  queries the real database - the same path Hostinger's deployment uses.

Technical debt:

- The Google Cloud Console OAuth client's authorized redirect URI is
  still registered for the old `:4000` local port and the old Render
  live URL - needs updating to the merged app's actual URLs before Google
  login works again outside this local `:3000` testing.
- The root `Dockerfile`/`docker-compose.yml` full-stack path was updated
  but not verified against a real Docker build in this pass (Hostinger's
  actual deploy doesn't use this Dockerfile at all - only the plain
  `npm run build` path, which was verified, including via the real
  standalone server).
- No automatic `prisma migrate deploy` step exists yet for the merged
  Hostinger deployment (the old Render container ran it automatically on
  every start; this equivalent hasn't been re-created).

Next task:

- User needs to add the merged environment variables
  (`DATABASE_URL`/`JWT_ACCESS_SECRET`/`JWT_ACCESS_TTL`/`JWT_REFRESH_TTL`/
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_CALLBACK_URL`) to
  Hostinger's Environment Variables UI and update the Google Cloud
  Console OAuth client's redirect URI to the live Hostinger URL, then
  push to deploy the merged app and confirm it live. Decommission the
  Render service once the merged app is confirmed live (external account
  action). Otherwise: the same backlog as before - object storage, real
  RBAC, Files/Storyboard/Bookings, and a migration-on-deploy step for the
  new hosting shape.

## 2026-07-12 New Domain Backends: Bookings, Storyboard, Files, Profile/Session/Workspace

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 95%

Features completed:

- Added `Resource`/`Booking`, `Board`/`Shot`, and `FileEntry` Prisma
  models plus their migrations (`20260711224500_bookings`,
  `20260711231500_storyboard`, `20260711234500_file_entries`).
- Built `apps/web/src/server/bookings/bookings.service.ts` and
  `POST/GET /api/v1/houses/:houseId/bookings`.
- Built `apps/web/src/server/storyboard/storyboard.service.ts` and its
  routes: `GET/POST /api/v1/houses/:houseId/boards`,
  `GET/PATCH /api/v1/houses/:houseId/boards/:boardId`,
  `GET/POST /api/v1/houses/:houseId/boards/:boardId/shots`,
  `PATCH /api/v1/houses/:houseId/shots/:shotId`.
- Added Supabase Storage integration (`server/storage/supabase-storage.ts`)
  and `server/files/files.service.ts` backing
  `GET/POST /api/v1/houses/:houseId/files`,
  `GET/DELETE /api/v1/houses/:houseId/files/:entryId`,
  `GET .../files/:entryId/download`, `GET .../files/summary`,
  `POST .../files/upload`.
- Added profile/password/session/workspace endpoints: `POST
/api/v1/auth/change-password`, `GET /api/v1/auth/sessions`,
  `DELETE /api/v1/auth/sessions/:sessionId`, `PATCH /api/v1/houses/:houseId`
  (update house), and `GET /api/v1/houses/:houseId/dashboard-summary`
  backed by a new `server/dashboard/dashboard.service.ts`. `auth.service.ts`
  gained the matching methods and `auth/me` gained an update path.
- Added shared frontend plumbing for all of the above:
  `services/base-workspace.service.ts` and `types/base.ts` grew ~400 lines
  of new methods/types, `lib/relative-time.ts` helper, and a
  `components/settings/coming-soon-notice.tsx` for the settings sections
  that still have no real backend.

Files created:

- `apps/web/src/server/bookings/*`, `apps/web/src/server/storyboard/*`,
  `apps/web/src/server/files/*`, `apps/web/src/server/storage/supabase-storage.ts`,
  `apps/web/src/server/dashboard/dashboard.service.ts`
- `apps/web/src/app/api/v1/houses/[houseId]/bookings/route.ts`,
  `.../boards/route.ts`, `.../boards/[boardId]/route.ts`,
  `.../boards/[boardId]/shots/route.ts`, `.../shots/[shotId]/route.ts`,
  `.../files/route.ts`, `.../files/[entryId]/route.ts`,
  `.../files/[entryId]/download/route.ts`, `.../files/summary/route.ts`,
  `.../files/upload/route.ts`, `.../dashboard-summary/route.ts`,
  `apps/web/src/app/api/v1/auth/change-password/route.ts`,
  `apps/web/src/app/api/v1/auth/sessions/route.ts`,
  `apps/web/src/app/api/v1/auth/sessions/[sessionId]/route.ts`
- `apps/web/src/lib/relative-time.ts`,
  `apps/web/src/components/settings/coming-soon-notice.tsx`

Database changes:

- Added `resources`, `bookings`, `boards`, `shots`, `file_entries` tables
  via the three migrations listed above.

API changes:

- Added all the endpoints listed under Features completed. `auth/login`,
  `auth/signup`, `auth/me`, and the Google callback route were also
  touched to keep response shapes consistent with the new profile fields.

Technical debt:

- Files still uses Supabase Storage at this point (replaced by Drive-backed
  storage two commits later, same day - see the Drive-backed storage entry
  below and ADR 0038).
- Settings sections beyond profile/workspace/sessions still show
  "coming soon" - no real backend yet for billing/integrations/advanced.

Next task:

- Rewire the actual page components (Dashboard, Projects, Crews, Settings,
  Bookings, Storyboard, Files, Messages) off their mock data onto these new
  endpoints - see the next entry.

## 2026-07-12 Real Backend Wiring: Dashboard, Projects, Crews, Settings, Bookings, Storyboard, Files, Messages

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 95%

Features completed:

- Rewired Dashboard's stat cards, recent-activity panel, recent-projects
  panel, and upcoming-schedule panel off hardcoded `*-data.ts` mock files
  onto the new `dashboard-summary` endpoint and existing task/project
  endpoints; deleted the now-dead `activity-data.ts`, `project-data.ts`,
  `schedule-data.ts`.
- Rewired Settings' profile/workspace/security/appearance/billing/
  integrations/advanced sections onto real data where a backend exists,
  and an honest "coming soon" notice where it doesn't (billing,
  integrations, advanced) - deleted the 114-line `settings-data.ts` mock.
- Rewired Bookings (calendar panel, by-type panel, stat cards, table,
  upcoming panel) onto the real `bookings` endpoint, dropping the
  289-line `bookings-data.ts` mock and a client-side pagination component
  that's no longer needed against a real paginated API.
- Rewired Storyboard (board toolbar, boards panel, shot card/list/detail,
  toolbar) onto the real `boards`/`shots` endpoints, dropping the 537-line
  `storyboard-data.ts` mock.
- Rewired Files (card menu, grid/list rows, page, toolbar) onto the real
  `files` endpoints and Supabase Storage, dropping the 380-line
  `file-data.ts` mock, the folder-tree/folders-panel/quick-access-panel
  components (no real folder hierarchy backend yet at this point), and
  wiring storage-overview/storage-used panels to real usage numbers.
- Persisted Dashboard's task checkbox toggles to the real tasks API
  instead of only updating local component state.
- Real channel rename (`PATCH /api/v1/chat/rooms/:roomId`) and an honest
  Messages composer/toolbar (removed buttons that didn't do anything).
- Wired Crews' "Message" action to actually create/open a real
  conversation instead of being a no-op button.
- Removed dead action buttons across analytics/calendar/crews panels that
  called nothing.

Files modified:

- `apps/web/src/components/dashboard/*`, `apps/web/src/components/settings/*`,
  `apps/web/src/components/bookings/*`, `apps/web/src/components/storyboard/*`,
  `apps/web/src/components/files/*`, `apps/web/src/components/messages/*`,
  `apps/web/src/components/crews/crews-page.tsx`,
  `apps/web/src/components/crews/crew-card-menu.tsx`,
  `apps/web/src/components/crews/crew-member-row.tsx`
- `apps/web/src/server/chat/chat.service.ts`,
  `apps/web/src/server/chat/dto/update-conversation.dto.ts`
- `apps/web/src/app/api/v1/chat/rooms/[roomId]/route.ts` (created)

Files removed:

- `apps/web/src/components/dashboard/activity-data.ts`,
  `project-data.ts`, `schedule-data.ts`
- `apps/web/src/components/settings/settings-data.ts`
- `apps/web/src/components/bookings/bookings-data.ts`,
  `bookings-pagination.tsx`
- `apps/web/src/components/storyboard/storyboard-data.ts`,
  `shot-type-meta.ts`
- `apps/web/src/components/files/file-data.ts`,
  `folder-tree-item.tsx`, `folders-panel.tsx`, `quick-access-panel.tsx`
- `apps/web/src/components/projects/timeline-schedule-data.ts`

Bugs fixed:

- Dashboard task checkboxes previously reset on refresh (local state
  only, never persisted).
- Crews "Message" button and several analytics/calendar/crews buttons did
  nothing when clicked.

Next task:

- Continue rounding out honest UI: global search/Create menu/nav (next
  entry), then dark mode and the remaining feature passes below.

## 2026-07-12 Global Search, Create Menu, and Honest Navigation

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 95%

Features completed:

- Added a real global search (`components/layout/global-search.tsx`)
  searching across the workspace's real data instead of being decorative.
- Expanded the Create menu (`components/layout/create-menu.tsx`) to
  actually create tasks/projects/bookings/etc. from one place rather than
  being a static dropdown.
- Cleaned up the sidebar nav (`nav-items.ts`) and topbar
  (`app-topbar.tsx`) to only link to real, working destinations.

Files created:

- `apps/web/src/components/layout/global-search.tsx`

Files modified:

- `apps/web/src/components/layout/create-menu.tsx`,
  `apps/web/src/components/layout/app-topbar.tsx`,
  `apps/web/src/components/layout/nav-items.ts`,
  `apps/web/src/components/layout/upgrade-card.tsx`,
  `apps/web/src/components/layout/avatar-with-status.tsx`

Next task:

- Dark mode toggle for the whole app.

## 2026-07-12 Dark Mode Toggle for the Whole App

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 95%

Features completed:

- Added a real dark mode toggle (`components/layout/theme-toggle.tsx`,
  `lib/theme-context.tsx`) wired into root layout, replacing the
  previously light-only app shell.
- Touched essentially every page and panel component (156 files in this
  commit alone) to use theme-aware Tailwind classes instead of
  hardcoded light-mode colors - analytics, bookings, calendar, crews,
  dashboard, files, houses, layout, login/signup, messages, projects,
  settings, storyboard, tasks all got a pass.

Files modified:

- 156 files across nearly every `apps/web/src/components/**` and several
  `apps/web/src/app/**` pages - see commit `32e7a89` for the full list;
  too broad to enumerate individually here.

Files created:

- `apps/web/src/components/layout/theme-toggle.tsx`,
  `apps/web/src/lib/theme-context.tsx`

Architecture changes:

- Established a `ThemeProvider`/`theme-context` pattern that later
  Appearance-settings work (accent color, density, transition) built on
  top of, on 2026-07-14.

Next task:

- Real email delivery for verification/password reset (next entry).

## 2026-07-12 Real Email Delivery for Verification and Password Reset

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Added `server/mail/mailer.ts` (a thin `sendMail` wrapper around the
  Resend HTTP API) and `server/mail/templates.ts` (HTML/text templates).
  Without a `RESEND_API_KEY` configured, `sendMail` logs the email to the
  console instead of failing - the same env-optional fallback pattern
  already used for Google OAuth and Supabase Storage.
  `MAIL_FROM` defaults to `Fylmico <onboarding@resend.dev>`.
  Added `POST /api/v1/auth/resend-verification`.
- Added a dismissible `components/layout/verify-email-banner.tsx` shown
  in the app shell for unverified accounts.
- `.env.example` gained `RESEND_API_KEY`/`MAIL_FROM`.

Files created:

- `apps/web/src/server/mail/mailer.ts`, `templates.ts`
- `apps/web/src/components/layout/verify-email-banner.tsx`
- `apps/web/src/app/api/v1/auth/resend-verification/route.ts`

Files modified:

- `apps/web/src/server/auth/auth.service.ts`, `.env.example`,
  `apps/web/src/app/layout.tsx`,
  `apps/web/src/components/layout/app-shell-gate.tsx`,
  `apps/web/src/server/workspace/workspace.service.ts`

API changes:

- Added `POST /api/v1/auth/resend-verification`.

Technical debt:

- At this point verification is still link-token based (reworked to
  6-digit OTP codes two days later on 2026-07-14 - see that entry and
  ADR 0039).

Next task:

- Shareable house join links.

## 2026-07-12 Shareable House Join Links

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Added `GET /api/v1/houses/join/:code/preview` and a public
  `apps/web/src/app/houses/join/[code]/page.tsx` so a house's invite code
  can be shared as a link (preview the house before joining) rather than
  only usable by manually typing the code in.
- `organizations.service.ts` gained the preview method; Settings'
  workspace section reworked its invite UI around the new shareable-link
  flow.

Files created:

- `apps/web/src/app/api/v1/houses/join/[code]/preview/route.ts`,
  `apps/web/src/app/houses/join/[code]/page.tsx`

Files modified:

- `apps/web/src/server/organizations/organizations.service.ts`,
  `apps/web/src/components/settings/workspace-section.tsx`,
  `apps/web/src/components/crews/crews-page.tsx`

API changes:

- Added `GET /api/v1/houses/join/:code/preview`.

Next task:

- User profile username + avatar upload.

## 2026-07-12 User Profile Username + Avatar Upload

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Added `POST /api/v1/auth/me/avatar` (uploads to Supabase Storage at
  this point) and extended `auth/me` PATCH to accept a username.
  `auth.service.ts` gained matching upload/update logic;
  `update-me.dto.ts` grew a username field.
- Profile section, topbar, and sidebar footer now show the real uploaded
  avatar and username instead of initials-only placeholders.
- New migration adding the underlying username/avatar columns to `users`.

Files created:

- `apps/web/src/app/api/v1/auth/me/avatar/route.ts`

Files modified:

- `apps/web/src/server/auth/auth.service.ts`,
  `apps/web/src/server/auth/dto/update-me.dto.ts`,
  `apps/web/src/server/storage/supabase-storage.ts`,
  `apps/web/src/components/settings/profile-section.tsx`,
  `apps/web/src/components/layout/app-topbar.tsx`,
  `apps/web/src/components/layout/sidebar-user-footer.tsx`

Database changes:

- Added username/avatar columns to `users` via a new migration.

API changes:

- Added `POST /api/v1/auth/me/avatar`; extended `PATCH /api/v1/auth/me`.

Next task:

- Crew role tags + task reassignment.

## 2026-07-12 Crew Role Tags + Task Reassignment

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Crews page gained real role-tag editing per member and a real
  task-reassignment action from both the Crews and Tasks pages (task
  card menu, task row item).

Files modified:

- `apps/web/src/components/crews/crew-card-menu.tsx`,
  `crew-data.ts`, `crew-member-row.tsx`, `crews-page.tsx`
- `apps/web/src/components/tasks/task-card-menu.tsx`,
  `task-row-item.tsx`, `tasks-page.tsx`

Next task:

- Route transitions + dashboard entrance animations.

## 2026-07-12 Route Transitions + Dashboard Entrance Animations

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Added `components/layout/page-transition.tsx` and
  `fade-in-section.tsx` for route-change transitions and staggered
  dashboard entrance animations.

Files created:

- `apps/web/src/components/layout/page-transition.tsx`,
  `apps/web/src/components/layout/fade-in-section.tsx`

Files modified:

- `apps/web/src/app/globals.css`,
  `apps/web/src/components/dashboard/home-dashboard.tsx`,
  `apps/web/src/components/layout/app-shell-gate.tsx`

Next task:

- Real Character/StoryLocation models for Storyboard.

## 2026-07-12 Storyboard Character/StoryLocation Models

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Added `Character` and `StoryLocation` Prisma models + migration, and
  their CRUD routes: `GET/POST /api/v1/houses/:houseId/characters`,
  `PATCH/DELETE .../characters/:characterId`,
  `GET/POST /api/v1/houses/:houseId/locations`,
  `PATCH/DELETE .../locations/:locationId`.
- `storyboard.service.ts` gained character/location methods; Storyboard's
  characters-grid and locations-grid components now read/write real data
  instead of the leftover mock arrays in `storyboard-data.ts` (which
  shrank from 537 to 56 lines, keeping only shot-type metadata).

Files created:

- `apps/web/src/app/api/v1/houses/[houseId]/characters/route.ts`,
  `.../characters/[characterId]/route.ts`,
  `.../locations/route.ts`, `.../locations/[locationId]/route.ts`
- `apps/web/src/server/storyboard/dto/create-character.dto.ts`,
  `create-location.dto.ts`

Files modified:

- `apps/web/src/server/storyboard/storyboard.service.ts`,
  `apps/web/src/components/storyboard/characters-grid.tsx`,
  `locations-grid.tsx`, `storyboard-data.ts`, `storyboard-page.tsx`,
  `storyboard-toolbar.tsx`
- `packages/database/prisma/schema.prisma`

Database changes:

- Added `characters`, `story_locations` tables.

API changes:

- Added the character/location CRUD routes listed above.

Next task:

- Real Files/Tasks/Events wiring for Messages channels.

## 2026-07-12 Messages Files/Tasks/Events Tabs Real Wiring

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Messages channels gained real Files/Tasks/Events tabs:
  `GET /api/v1/chat/rooms/:roomId/files`,
  `GET/POST /api/v1/chat/rooms/:roomId/tasks`,
  `GET/POST /api/v1/chat/rooms/:roomId/events` - previously these tabs
  showed hardcoded mock content unrelated to the channel.
- `chat.service.ts` grew the matching room-scoped file/task/event
  queries; `messages-page.tsx` grew substantially (+182 lines) to wire
  the three tabs to real data and loading/empty states.
- Room-scoped file uploads reuse the existing files-upload endpoint with
  a room association.

Files created:

- `apps/web/src/app/api/v1/chat/rooms/[roomId]/files/route.ts`,
  `.../tasks/route.ts`, `.../events/route.ts`
- `apps/web/src/server/chat/dto/create-room-event.dto.ts`,
  `create-room-task.dto.ts`

Files modified:

- `apps/web/src/server/chat/chat.service.ts`,
  `apps/web/src/server/files/files.service.ts`,
  `apps/web/src/components/messages/channel-events-list.tsx`,
  `channel-files-list.tsx`, `channel-info-panel.tsx`,
  `channel-tasks-list.tsx`, `chat-tabs.tsx`, `message-composer.tsx`,
  `message-data.ts`, `messages-page.tsx`
- `packages/database/prisma/schema.prisma` (room association columns)

Database changes:

- Extended chat-related tables with room/file/task/event associations
  via a new migration.

API changes:

- Added the three room-scoped routes listed above.

Next task:

- Persist notification preferences + editable crew department.

## 2026-07-12 Notification Preferences Persistence + Editable Crew Department

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Added `PATCH /api/v1/auth/me/notification-preferences`, a new DTO, and
  a `notificationPreferences` column/relation persisted on the user
  (previously the notifications-settings UI didn't save anything).
- Crews page gained an editable department field per member, backed by
  the existing crew-profile update path.

Files created:

- `apps/web/src/app/api/v1/auth/me/notification-preferences/route.ts`,
  `apps/web/src/server/auth/dto/update-notification-preferences.dto.ts`

Files modified:

- `apps/web/src/server/auth/auth.service.ts`,
  `apps/web/src/server/workspace/workspace.service.ts`,
  `apps/web/src/components/crews/crews-page.tsx`,
  `apps/web/src/components/settings/notifications-section.tsx`
- `packages/database/prisma/schema.prisma`

Database changes:

- Added notification-preferences storage via a new migration.

API changes:

- Added `PATCH /api/v1/auth/me/notification-preferences`.

Technical debt:

- Preferences were persisted but not yet enforced anywhere that actually
  sends a notification - see the 2026-07-14 "notification preferences
  actually gate sending" entry below for when that gap closed.

Next task:

- Drive-backed file storage (next entry, replaces Supabase Storage the
  same day).

## 2026-07-12 Drive-Backed File Storage (Per-User Google Drive)

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Replaced Supabase Storage with per-user Google Drive as the Files
  backend: `server/drive/drive.service.ts`, `google-drive.util.ts`,
  `drive-token.util.ts`, new routes `drive/connect-url`, `drive/callback`,
  `drive/disconnect`, `drive/status`, and a token-gated public download
  proxy `files/download/[token]`.
- Files page gained a `drive-connection-banner.tsx` prompting the user to
  connect their Google Drive if not yet connected.
- `files.service.ts` reworked to read/write through Drive instead of
  Supabase Storage.
- New `DriveConnection` Prisma model + migration
  (`20260712150000_drive_connections`).
- See ADR 0038 (already written same day this shipped).

Files created:

- `apps/web/src/app/api/v1/drive/callback/route.ts`, `connect-url/route.ts`,
  `disconnect/route.ts`, `status/route.ts`
- `apps/web/src/app/api/v1/files/download/[token]/route.ts`
- `apps/web/src/server/drive/drive.service.ts`, `drive-token.util.ts`,
  `google-drive.util.ts`
- `apps/web/src/services/drive.service.ts`
- `apps/web/src/components/files/drive-connection-banner.tsx`
- `docs/adr/0038-drive-backed-file-storage.md`

Files modified:

- `apps/web/src/server/files/files.service.ts`,
  `apps/web/src/components/files/files-page.tsx`

Database changes:

- Added `drive_connections` table.

API changes:

- Added the four `drive/*` routes and the token-gated download proxy.

Architecture changes:

- Files storage moved from a shared Supabase bucket to per-user Google
  Drive (see ADR 0038 for the full rationale and alternatives considered).

Next task:

- Custom dialog components, a real New Booking form, and misc polish
  (next entry).

## 2026-07-12 Custom Dialogs, Real New Booking Form, and Misc Fixes

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Added `components/ui/dialog.tsx` and `prompt-dialog.tsx` - a styled,
  dark-mode-aware replacement for `window.prompt`/`window.confirm`, wired
  into Crews, Files, the Create menu, Messages, Projects, Settings'
  workspace section, Storyboard, and Tasks wherever they previously used
  the browser's native prompt.
- Replaced Bookings' placeholder "New Booking" action with a real
  multi-field dialog (`new-booking-dialog.tsx`, ~232 lines) posting to
  the real bookings endpoint.
- Friendlier device labels for Account Sessions (parses user-agent into
  something like "Chrome on Windows" instead of a raw UA string).
- Performance: batched house-membership lookups in
  `organizations.service.ts` instead of issuing one query per house.
- Fixed the Google OAuth callback redirecting to a bogus host in
  production (was building the redirect off the wrong base URL).

Files created:

- `apps/web/src/components/ui/dialog.tsx`, `prompt-dialog.tsx`
- `apps/web/src/components/bookings/new-booking-dialog.tsx`

Files modified:

- `apps/web/src/app/(app)/layout.tsx`,
  `apps/web/src/components/crews/crews-page.tsx`,
  `apps/web/src/components/files/files-page.tsx`,
  `apps/web/src/components/layout/create-menu.tsx`,
  `apps/web/src/components/messages/messages-page.tsx`,
  `apps/web/src/components/projects/projects-page.tsx`,
  `apps/web/src/components/settings/workspace-section.tsx`,
  `apps/web/src/components/storyboard/storyboard-page.tsx`,
  `apps/web/src/components/tasks/tasks-page.tsx`,
  `apps/web/src/components/bookings/bookings-page.tsx`,
  `apps/web/src/components/settings/profile-section.tsx`,
  `apps/web/src/server/organizations/organizations.service.ts`,
  `apps/web/src/app/api/v1/auth/google/callback/route.ts`

Bugs fixed:

- Google OAuth callback redirect building an absolute URL from the wrong
  host in production.

Performance improvements:

- House lookups batched instead of one query per house in
  `organizations.service.ts`.

Next task:

- Mobile/tablet responsive overflow fixes (2026-07-13).

## 2026-07-13 Mobile/Tablet Responsive Overflow Fixes

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Fixed horizontal-overflow and cramped-layout issues across essentially
  every page at mobile/tablet widths: analytics, bookings, calendar,
  crews, dashboard, files, layout (sidebar/topbar), messages, projects,
  scripts, settings, storyboard, tasks (41 files total).
- Sidebar (`app-sidebar.tsx`) and topbar (`app-topbar.tsx`) got the
  heaviest changes - collapsing/scrolling behavior at narrow widths.

Files modified:

- 41 files across `apps/web/src/components/**` - see commit `ebd8bea`
  for the full list.

Bugs fixed:

- Multiple pages overflowed horizontally or clipped content on
  mobile/tablet viewports.

Next task:

- Investigate an automatic-migration step for Hostinger deploys (next
  entry - this attempt was reverted the same day).

## 2026-07-13 Migrate-on-Boot: Attempt and Revert

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 96%

Features completed:

- Attempted to close the "no automatic migration step in production"
  gap (flagged as technical debt in the 2026-07-11 merge-backend entry)
  by running `prisma migrate deploy` automatically from `server.js` on
  boot.
- Found this crashed the whole server process when the migration step
  itself failed (any migration error took the entire app down, not just
  the request that needed the new schema), patched it to catch the
  failure and continue booting instead of crashing.
- Ultimately reverted the boot-time migration entirely (`server.js` no
  longer runs migrations) in favor of a dedicated CI workflow that runs
  migrations on every push to main instead of on every server start -
  see the 2026-07-14 "migrate-CI-on-push" entry and ADR 0042.

Files modified:

- `server.js`, `docs/deployment.md`, `docs/hostinger-deployment.md`,
  `packages/database/package.json`, `package-lock.json`
  (across commits `2452c1c`, `65e26ae`, `f020455`, `80fdf78`)

Known bugs:

- None remaining - the boot-time approach was fully reverted rather than
  left half-working.

Technical debt:

- Automatic production migrations were still an open gap after this
  revert; closed the next day by the CI-based approach (ADR 0042).

Next task:

- Fix Drive folder mirroring and add upload-progress UI.

## 2026-07-13 Drive Folder Mirroring Fix + Upload Progress UI

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Fixed Drive-backed storage to mirror app-created folders into Google
  Drive too, not just individual files (previously only file uploads were
  mirrored, so folder structure created in-app didn't show up in Drive).
  New migration for the underlying folder-mapping columns.
- Added upload progress with live speed and a bottom-right toast
  (`upload-progress-toast.tsx`) instead of uploads being silent until
  they finished or failed.

Files created:

- `apps/web/src/components/files/upload-progress-toast.tsx`

Files modified:

- `apps/web/src/server/drive/drive.service.ts`, `google-drive.util.ts`,
  `apps/web/src/server/files/files.service.ts`,
  `apps/web/src/components/files/files-page.tsx`,
  `apps/web/src/lib/api/client.ts`,
  `apps/web/src/services/base-workspace.service.ts`
- `packages/database/prisma/schema.prisma`

Database changes:

- Added folder-mapping columns for Drive mirroring via a new migration.

Bugs fixed:

- App-created folders weren't mirrored into Google Drive, only files
  uploaded into them were.

Next task:

- Real Appearance settings (accent color, density, theme transition).

## 2026-07-14 Real Appearance Settings

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Appearance settings section became real: accent color picker, density
  toggle (comfortable/compact), and an animated theme transition when
  switching light/dark - previously this section was decorative
  (`coming-soon-notice`).
- `lib/theme-context.tsx` grew from a plain light/dark toggle into a
  fuller theme provider carrying accent/density state, persisted and
  applied via CSS custom properties in `globals.css`.
- Fixed the Scripts page's two-column layout not fitting mobile widths
  (same-day follow-up fix).

Files modified:

- `apps/web/src/app/(app)/layout.tsx`, `apps/web/src/app/globals.css`,
  `apps/web/src/app/layout.tsx`,
  `apps/web/src/components/settings/appearance-section.tsx`,
  `apps/web/src/lib/theme-context.tsx`,
  `apps/web/src/components/scripts/scripts-page.tsx`

Next task:

- House-membership polish: owner-only member removal, invite/join
  redirect persistence, real Crews invite link.

## 2026-07-14 House Membership Polish

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Restricted removing a house member to Owners only (previously any
  member could remove any other member, including the Owner - flagged as
  a known gap back in the 2026-07-10 Crews Module entry).
- Login/signup now redirect back to whatever invite/join link the user
  arrived from, instead of always landing on `/home` regardless of
  entry point (`lib/redirect.ts` gained the redirect-target logic).
- Crews' "Invite" button now generates a real per-invite link instead of
  just revealing the house's static invite code.

Files modified:

- `apps/web/src/server/organizations/organizations.service.ts`
- `apps/web/src/app/houses/invite/[token]/page.tsx`,
  `apps/web/src/app/houses/join/[code]/page.tsx`,
  `apps/web/src/app/login/page.tsx`, `apps/web/src/app/signup/page.tsx`,
  `apps/web/src/components/signup/signup-page.tsx`,
  `apps/web/src/lib/redirect.ts`
- `apps/web/src/components/crews/crews-page.tsx`,
  `apps/web/src/components/settings/workspace-section.tsx`
  (removed the now-redundant invite-link UI from Settings once Crews had
  its own)

Bugs fixed:

- Any member (not just Owners) could remove any other house member.
- Login/signup always redirected to `/home`, dropping the original
  invite/join link the user had followed.

Next task:

- Notification triggers + bell redesign.

## 2026-07-14 Notification Triggers + Bell Redesign

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Notification preferences now actually gate sending
  (`notifications.service.ts` checks the recipient's preferences before
  sending, closing the gap flagged on 2026-07-12).
- Added real notification triggers for task/project comments, house
  invite acceptance, and booking status changes
  (`comments.service.ts`, `bookings.service.ts`,
  `organizations.service.ts` all gained notification-send calls).
- Redesigned the notification bell
  (`components/layout/notification-bell.tsx`, +135 lines): per-type
  icons, an unread count badge, and polling for new notifications instead
  of only refreshing on page load.

Files modified:

- `apps/web/src/server/notifications/notifications.service.ts`,
  `apps/web/src/server/comments/comments.service.ts`,
  `apps/web/src/server/bookings/bookings.service.ts`,
  `apps/web/src/server/organizations/organizations.service.ts`,
  `apps/web/src/components/layout/notification-bell.tsx`

Bugs fixed:

- Notification preferences were persisted (2026-07-12) but ignored -
  every notification sent regardless of the recipient's settings.

Next task:

- Move the authenticated dashboard from `/` to `/home` and add a public
  marketing landing page at `/`.

## 2026-07-14 Dashboard Moved to /home

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Moved the authenticated dashboard from `/` to `/home` to make room for
  a public marketing page at the root path. Updated every internal
  redirect target that assumed the dashboard lived at `/`
  (auth callback, invite/join pages, app-shell-gate, sidebar nav,
  verify-email page, `lib/redirect.ts`).

Files modified:

- `apps/web/src/app/(app)/{ => home}/page.tsx` (moved),
  `apps/web/src/app/auth/callback/page.tsx`,
  `apps/web/src/app/houses/invite/[token]/page.tsx`,
  `apps/web/src/app/houses/join/[code]/page.tsx`,
  `apps/web/src/components/layout/app-shell-gate.tsx`,
  `apps/web/src/components/layout/app-sidebar.tsx`,
  `apps/web/src/components/layout/nav-items.ts`,
  `apps/web/src/components/login/verify-email-page.tsx`,
  `apps/web/src/lib/redirect.ts`

Architecture changes:

- The authenticated app now lives under `/home` (and the rest of the
  `(app)` route group), freeing up `/` for public marketing content.

Next task:

- Build the public marketing landing page at `/`.

## 2026-07-14 Public Marketing Landing Page

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Added a public marketing landing page at `/` (`apps/web/src/app/page.tsx`),
  unauthenticated and separate from the app the dashboard move just
  vacated.
- Redesigned it same-day with a dark theme and scroll animations
  (+428/-122 lines).
- Rebuilt the hero as a real app mockup, added a "trusted by" logo row
  and a multi-column footer (+318/-37 lines) - the largest single-file
  commit of this pass.

Files created:

- `apps/web/src/app/page.tsx` (created, then two same-domain redesign
  passes across commits `0de77a8`, `d6d7e2d`, `fe71a09`)

Next task:

- Project detail page.

## 2026-07-14 Project Detail Page

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Added a project detail page (`apps/web/src/app/(app)/projects/[projectId]/page.tsx`,
  `components/projects/project-detail-page.tsx`, ~428 lines) with edit,
  tasks, calendar, and comments - previously projects had no dedicated
  detail view, only the grid/list card.
- Added `project-edit-dialog.tsx` (~224 lines) for editing a project's
  fields in place.

Files created:

- `apps/web/src/app/(app)/projects/[projectId]/page.tsx`,
  `apps/web/src/components/projects/project-detail-page.tsx`,
  `apps/web/src/components/projects/project-edit-dialog.tsx`

Files modified:

- `apps/web/src/components/projects/project-grid-card.tsx`,
  `project-list-row.tsx`, `apps/web/src/services/base-workspace.service.ts`,
  `apps/web/src/types/base.ts`

Next task:

- Real approval workflow for bookings.

## 2026-07-14 Bookings Approval Workflow

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Added `PATCH /api/v1/bookings/:bookingId` and a status-update DTO so
  bookings can be approved/rejected, not just created - previously there
  was no way to change a booking's status after creation.
- Bookings table/page gained approve/reject actions; approving/rejecting
  now also triggers a notification (see the Notification Triggers entry
  above, same day).

Files created:

- `apps/web/src/app/api/v1/bookings/[bookingId]/route.ts`,
  `apps/web/src/server/bookings/dto/update-booking-status.dto.ts`

Files modified:

- `apps/web/src/server/bookings/bookings.service.ts`,
  `apps/web/src/components/bookings/bookings-page.tsx`,
  `bookings-table.tsx`,
  `apps/web/src/server/organizations/organizations.service.ts`,
  `apps/web/src/services/base-workspace.service.ts`

API changes:

- Added `PATCH /api/v1/bookings/:bookingId`.

Next task:

- Real date-range filter and CSV export for analytics.

## 2026-07-14 Analytics Date-Range Filter + CSV Export

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Analytics gained a real date-range filter (the analytics endpoint now
  accepts a range) and a CSV export button - previously analytics only
  showed a fixed, non-exportable window of data.

Files modified:

- `apps/web/src/app/api/v1/houses/[houseId]/analytics/route.ts`,
  `apps/web/src/server/analytics/analytics.service.ts`,
  `apps/web/src/components/analytics/analytics-header.tsx`,
  `analytics-page.tsx`, `apps/web/src/services/base-workspace.service.ts`

API changes:

- Extended `GET /api/v1/houses/:houseId/analytics` to accept a date range.

Next task:

- Crew member profile page.

## 2026-07-14 Crew Member Profile Page

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Added a crew member profile page
  (`apps/web/src/app/(app)/crews/[userId]/page.tsx`,
  `components/crews/crew-profile-page.tsx`, ~383 lines) - clicking a crew
  member previously did nothing beyond the row's inline menu.

Files created:

- `apps/web/src/app/(app)/crews/[userId]/page.tsx`,
  `apps/web/src/components/crews/crew-profile-page.tsx`

Files modified:

- `apps/web/src/components/crews/crew-member-row.tsx`

Next task:

- Drag-and-drop Kanban board view for tasks.

## 2026-07-14 Tasks Kanban Board

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Added a drag-and-drop Kanban board view for Tasks
  (`components/tasks/task-kanban-board.tsx`, ~141 lines), toggleable from
  the tasks toolbar alongside the existing list view. Dragging a card
  between columns persists the new status to the real tasks API.

Files created:

- `apps/web/src/components/tasks/task-kanban-board.tsx`

Files modified:

- `apps/web/src/components/tasks/tasks-page.tsx`, `tasks-toolbar.tsx`

Next task:

- Real Calendar week and day views.

## 2026-07-14 Calendar Week and Day Views

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 97%

Features completed:

- Added real week (`calendar-week-grid.tsx`) and day
  (`calendar-day-grid.tsx`) calendar views, backed by the same real
  events data as the existing month view - previously Calendar only had a
  month grid and an "empty view" placeholder for week/day.
  `lib/calendar-utils.ts` added for the shared date-bucketing logic.

Files created:

- `apps/web/src/components/calendar/calendar-day-grid.tsx`,
  `calendar-week-grid.tsx`, `apps/web/src/lib/calendar-utils.ts`

Files removed:

- `apps/web/src/components/calendar/calendar-empty-view.tsx`

Files modified:

- `apps/web/src/components/calendar/calendar-page.tsx`

Next task:

- Real threaded replies and emoji reactions for Messages.

## 2026-07-14 Messages Threaded Replies and Emoji Reactions

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 98%

Features completed:

- Added threaded replies to chat messages via a new `parent_message_id`
  self-relation on `Message`, and emoji reactions via a new
  `MessageReaction` model - `POST /api/v1/messages/:messageId/reactions`
  (toggle) and an extended send-message DTO accepting a parent message
  id for replies.
- `message-bubble.tsx` (+92 lines) renders reaction chips and a
  reply-thread affordance; `message-composer.tsx` and `messages-page.tsx`
  wired up the reply-target and reaction-toggle UI.

Files created:

- `apps/web/src/app/api/v1/messages/[messageId]/reactions/route.ts`,
  `apps/web/src/server/chat/dto/toggle-reaction.dto.ts`

Files modified:

- `apps/web/src/server/chat/chat.service.ts`,
  `apps/web/src/server/chat/dto/send-message.dto.ts`,
  `apps/web/src/server/workspace/workspace.service.ts`,
  `apps/web/src/components/messages/message-bubble.tsx`,
  `message-composer.tsx`, `messages-page.tsx`
- `packages/database/prisma/schema.prisma`

Database changes:

- Added `message_reactions` table and a `parent_message_id` self-relation
  on `messages`.

API changes:

- Added `POST /api/v1/messages/:messageId/reactions`; extended
  `POST /api/v1/chat/rooms/:roomId/messages` to accept a parent message id.

Next task:

- Scripts formatting toolbar and a Files preview modal.

## 2026-07-14 Scripts Formatting Toolbar + Files Preview Modal

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 98%

Features completed:

- Added a screenplay formatting toolbar to the Scripts editor
  (`script-format-toolbar.tsx`) - scene heading/action/character/
  dialogue/parenthetical/transition formatting shortcuts.
- Added a file preview modal (`file-preview-modal.tsx`) supporting
  images, PDFs, video, and audio directly from the Files page instead of
  only offering a download link.

Files created:

- `apps/web/src/components/scripts/script-format-toolbar.tsx`,
  `apps/web/src/components/files/file-preview-modal.tsx`

Files modified:

- `apps/web/src/components/scripts/script-editor.tsx`,
  `apps/web/src/components/files/files-page.tsx`

Next task:

- Call Sheets module (new).

## 2026-07-14 Call Sheets Module (New)

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 98%

Features completed:

- Added an entirely new Call Sheets module: `CallSheet` Prisma model +
  migration (`20260713221000_call_sheets`), a
  `server/call-sheets/call-sheets.service.ts`,
  `GET/POST /api/v1/houses/:houseId/call-sheets` and
  `GET/PATCH/DELETE /api/v1/call-sheets/:callSheetId`.
- New page at `apps/web/src/app/(app)/call-sheets/page.tsx` with an
  editor (`call-sheet-editor.tsx`, ~316 lines), a list page
  (`call-sheets-page.tsx`, ~195 lines), and a creation dialog
  (`new-call-sheet-dialog.tsx`, ~194 lines). Added to the sidebar nav.

Files created:

- `apps/web/src/app/(app)/call-sheets/page.tsx`
- `apps/web/src/app/api/v1/call-sheets/[callSheetId]/route.ts`,
  `apps/web/src/app/api/v1/houses/[houseId]/call-sheets/route.ts`
- `apps/web/src/components/call-sheets/call-sheet-editor.tsx`,
  `call-sheets-page.tsx`, `new-call-sheet-dialog.tsx`
- `apps/web/src/server/call-sheets/call-sheets.service.ts`,
  `dto/create-call-sheet.dto.ts`, `dto/update-call-sheet.dto.ts`

Files modified:

- `apps/web/src/components/layout/nav-items.ts`,
  `apps/web/src/services/base-workspace.service.ts`,
  `apps/web/src/types/base.ts`

Database changes:

- Added `call_sheets` table.

API changes:

- Added `GET/POST /api/v1/houses/:houseId/call-sheets` and
  `GET/PATCH/DELETE /api/v1/call-sheets/:callSheetId`.

Next task:

- Announcements module (new).

## 2026-07-14 Announcements Module (New)

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 98%

Features completed:

- Added an entirely new Announcements module: `Announcement` Prisma
  model + migration (`20260713222000_announcements`), a
  `server/announcements/announcements.service.ts`,
  `GET/POST /api/v1/houses/:houseId/announcements` and
  `GET/PATCH/DELETE /api/v1/announcements/:announcementId`.
- New page at `apps/web/src/app/(app)/announcements/page.tsx` with
  `announcements-page.tsx` (~232 lines) and a creation dialog
  (`new-announcement-dialog.tsx`, ~142 lines).

Files created:

- `apps/web/src/app/(app)/announcements/page.tsx`
- `apps/web/src/app/api/v1/announcements/[announcementId]/route.ts`,
  `apps/web/src/app/api/v1/houses/[houseId]/announcements/route.ts`
- `apps/web/src/components/announcements/announcements-page.tsx`,
  `new-announcement-dialog.tsx`
- `apps/web/src/server/announcements/announcements.service.ts`,
  `dto/create-announcement.dto.ts`, `dto/update-announcement.dto.ts`

Database changes:

- Added `announcements` table.

API changes:

- Added `GET/POST /api/v1/houses/:houseId/announcements` and
  `GET/PATCH/DELETE /api/v1/announcements/:announcementId`.

Next task:

- Remove the fake Upgrade to Pro sidebar card; add a migrate-on-push CI
  workflow.

## 2026-07-14 Upgrade Card Removal + Migrate-CI-on-Push Workflow

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 98%

Features completed:

- Removed the fake "Upgrade to Pro" sidebar card - it never linked
  anywhere real and there's no billing/plans backend, so it was
  dishonest UI.
- Added `.github/workflows/migrate.yml`, a CI workflow that runs
  `prisma migrate deploy` against production automatically on every push
  to main - the actual fix for the automatic-migration gap the
  migrate-on-boot attempt (2026-07-13) tried and reverted. See ADR 0042.

Files removed:

- `apps/web/src/components/layout/upgrade-card.tsx`

Files modified:

- `apps/web/src/components/layout/app-sidebar.tsx`

Files created:

- `.github/workflows/migrate.yml`

Architecture changes:

- Production schema migrations are now applied by CI on push to main,
  not by the app process on boot or by hand. See ADR 0042.

Next task:

- OTP-based auth rework: signup verification and password reset move
  from link-tokens to 6-digit codes, login blocked until verified.

## 2026-07-14 OTP-Based Auth Rework

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 98%

Features completed:

- Reworked email verification and password reset from single-use
  link-tokens to 6-digit OTP codes typed directly into the UI. Login is
  now blocked entirely until the account's email is verified (previously
  an unverified account could still log in).
- `EmailVerificationToken`/`PasswordResetToken` gained an `attempts`
  column (`20260714120000_otp_codes` migration); `auth.service.ts`
  enforces a 10-minute TTL and a 5-attempt cap per code
  (`MAX_OTP_ATTEMPTS`) before requiring a fresh code, and still hashes
  the code at rest (`tokenHash`) rather than storing it in plaintext.
- `verify-email-page.tsx` reworked into a 6-digit code input
  (+211/-... lines); `forgot-password-page.tsx`/`reset-password-page.tsx`
  similarly reworked around entering a code instead of following a link.
- `docs/hostinger-deployment.md` updated same day to document the
  `RESEND_API_KEY`/`MAIL_FROM` env vars required for OTP emails to
  actually send in production (commit `e204214`).
- See ADR 0039.

Files modified:

- `apps/web/src/server/auth/auth.service.ts`, `token.util.ts`,
  `dto/resend-verification.dto.ts`, `dto/reset-password.dto.ts`,
  `dto/verify-email.dto.ts`
- `apps/web/src/app/api/v1/auth/resend-verification/route.ts`,
  `reset-password/route.ts`, `signup/route.ts`, `verify-email/route.ts`
- `apps/web/src/app/login/page.tsx`,
  `apps/web/src/components/layout/app-shell-gate.tsx`,
  `verify-email-banner.tsx`,
  `apps/web/src/components/login/forgot-password-page.tsx`,
  `reset-password-page.tsx`, `verify-email-page.tsx`,
  `apps/web/src/components/signup/signup-page.tsx`,
  `apps/web/src/server/mail/templates.ts`,
  `apps/web/src/services/base-workspace.service.ts`,
  `apps/web/src/types/base.ts`
- `docs/hostinger-deployment.md`

Database changes:

- Added `attempts` column to `email_verification_tokens` and
  `password_reset_tokens` via `20260714120000_otp_codes`.

API changes:

- `verify-email`, `resend-verification`, `request-password-reset`,
  `reset-password` all now work in terms of a 6-digit code rather than an
  opaque link token; `login` now rejects unverified accounts.

Architecture changes:

- See ADR 0039 for the full rationale (mobile UX, avoiding email-client
  link-prefetch burning single-use tokens, blocking login pre-verification).

Next task:

- Session persistence fix; multi-house dashboard + join-request system
  (2026-07-15).

## 2026-07-15 Session Persistence Fix

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 98%

Features completed:

- Fixed session storage to persist in `localStorage` instead of
  `sessionStorage`, so logging in survives a browser restart for the
  full 30-day token lifetime instead of being cleared as soon as the tab
  closed.

Files modified:

- `apps/web/src/lib/session.ts`, `apps/web/src/app/(app)/layout.tsx`

Bugs fixed:

- Login state was lost every time the tab/browser closed, even though
  the issued token was valid for 30 days.

Next task:

- Multi-house dashboard + tag-based join-request system.

## 2026-07-15 Multi-House Dashboard + Tag-Based Join-Request System

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 99%

Features completed:

- Added a new `HouseJoinRequest` Prisma model (`organizationId`,
  `userId`, `status` defaulting to `"pending"`, `respondedById`/
  `respondedAt`, unique on `[organizationId, userId]`) plus migration
  (`20260714150000_house_join_requests`), letting someone request to
  join a house by tag/handle instead of only via an exact invite code or
  link - an Owner must approve or reject the request before membership is
  granted.
- `organizations.service.ts` gained `requestToJoinHouse`,
  `respondToJoinRequest` (approve/reject), and `activateHouse` (switch a
  user's active house among the ones they belong to), plus new DTOs
  `request-join-house.dto.ts` and `update-join-request-status.dto.ts`.
- New routes: `POST /api/v1/houses/join-requests` (create a request),
  `GET /api/v1/houses/:houseId/join-requests` (Owner lists pending
  requests for their house), `PATCH .../join-requests/:requestId`
  (approve/reject), `POST /api/v1/houses/:houseId/activate` (switch
  active house).
- Added a multi-house `/dashboard` hub
  (`components/houses/houses-dashboard-page.tsx`, ~193 lines) for
  browsing/switching between houses and a
  `join-requests-dialog.tsx` (~137 lines) for Owners to review pending
  requests - this replaces the old single-path `houses/new` onboarding
  page, which was deleted along with the now-redundant
  `no-house-onboarding.tsx`.
- Notification bell and mail templates gained a join-request
  notification (approving/rejecting/receiving a request all notify).
- See ADR 0040.

Files created:

- `apps/web/src/app/(app)/dashboard/page.tsx`
- `apps/web/src/app/api/v1/houses/[houseId]/activate/route.ts`,
  `.../join-requests/route.ts`, `.../join-requests/[requestId]/route.ts`
- `apps/web/src/app/api/v1/houses/join-requests/route.ts`
- `apps/web/src/components/houses/houses-dashboard-page.tsx`,
  `join-requests-dialog.tsx`
- `apps/web/src/server/organizations/dto/request-join-house.dto.ts`,
  `dto/update-join-request-status.dto.ts`
- `packages/database/prisma/migrations/20260714150000_house_join_requests/`

Files modified:

- `apps/web/src/server/organizations/organizations.service.ts`,
  `apps/web/src/server/mail/templates.ts`,
  `apps/web/src/components/houses/house-choice-card.tsx`,
  `apps/web/src/components/houses/learn/houses-guide-cta.tsx`,
  `houses-guide-header.tsx`,
  `apps/web/src/components/layout/app-shell-gate.tsx`,
  `notification-bell.tsx`, `sidebar-user-footer.tsx`,
  `apps/web/src/lib/redirect.ts`,
  `apps/web/src/services/base-workspace.service.ts`,
  `apps/web/src/types/base.ts`
- `packages/database/prisma/schema.prisma`

Files removed:

- `apps/web/src/app/(app)/houses/new/page.tsx`,
  `apps/web/src/components/houses/no-house-onboarding.tsx`

Database changes:

- Added `house_join_requests` table
  (`20260714150000_house_join_requests`).

API changes:

- Added `POST /api/v1/houses/join-requests`,
  `GET /api/v1/houses/:houseId/join-requests`,
  `PATCH /api/v1/houses/:houseId/join-requests/:requestId`,
  `POST /api/v1/houses/:houseId/activate`.

Architecture changes:

- Joining a house by tag now goes through an owner-approval gate rather
  than granting membership immediately; invite-code/link joining (ADR
  0020, and the 2026-07-12 shareable-links entry) still works unchanged
  alongside it. See ADR 0040.

Next task:

- In-memory rate limiting + security headers.

## 2026-07-15 In-Memory Rate Limiting + Security Headers

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 99%

Features completed:

- Added `server/rate-limit.ts`: an in-memory fixed-window request
  counter (no Redis - single Node process on Hostinger) applied to
  `auth/login`, `auth/signup`, `auth/verify-email`,
  `auth/resend-verification`, `auth/request-password-reset`,
  `auth/reset-password`, and `houses/join-requests`. Throws a
  `429 rate_limited` `AppException` once a caller's IP exceeds the
  configured limit within the window; sweeps expired entries once the
  in-memory map exceeds 5,000 keys instead of running a cleanup timer.
- Added security headers in `next.config.ts` (21 lines).
- See ADR 0043 for why in-memory was chosen over Redis and what it
  doesn't protect against (resets on redeploy, doesn't hold across
  multiple instances, no defense against distributed/many-IP abuse).

Files created:

- `apps/web/src/server/rate-limit.ts`

Files modified:

- `apps/web/next.config.ts`, `apps/web/src/server/http.ts`
- `apps/web/src/app/api/v1/auth/login/route.ts`,
  `auth/request-password-reset/route.ts`,
  `auth/resend-verification/route.ts`, `auth/reset-password/route.ts`,
  `auth/signup/route.ts`, `auth/verify-email/route.ts`
- `apps/web/src/app/api/v1/houses/join-requests/route.ts`

Architecture changes:

- First rate-limiting layer in the app; see ADR 0043 for the tradeoffs
  of the in-memory, single-process approach.

Technical debt:

- Rate-limit state resets on every redeploy/restart and is per-process,
  so it does not hold a real limit if the app is ever run as more than
  one instance (each instance enforces the configured limit
  independently) - not a security boundary on its own, just a cost/spam
  guard, per ADR 0043.

Next task:

- Real RBAC beyond Owner-only member removal remains the standing
  backlog item across modules. A distributed rate-limit store (e.g.
  Redis) would be needed before horizontally scaling beyond one
  Hostinger instance.

## 2026-07-15 Real-Time Chat (Supabase Realtime)

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 99%

Features completed:

- Rebuilt chat's realtime story on Supabase Realtime (Broadcast +
  Presence) instead of a custom WebSocket server - the browser connects
  directly to Supabase, sidestepping the unverified question of whether
  Hostinger's managed reverse proxy passes through WebSocket upgrades at
  all. See ADR 0044 for the full reasoning and alternatives considered.
- Instant message delivery: sending/reacting/marking-read now broadcasts
  a Realtime event instead of every client refetching the whole
  workspace snapshot. `chat.service.ts`'s message include is capped to
  the last 50 per conversation (was unbounded) and a new cursor-paginated
  `GET /api/v1/chat/rooms/:roomId/messages` backs a "load earlier
  messages" control - chat's first pagination.
- Typing indicators: client-to-client ephemeral broadcast, no server
  round trip, 3s auto-clear, throttled to one send per 2s per typist.
- Presence: Supabase Presence per house (`use-presence.ts`) gives
  instant, correct online/offline for connected clients; a new
  `User.lastSeenAt` column + `POST /api/v1/auth/me/heartbeat` (polled
  every 60s while the app is open, `AppShellGate`) backs the "last seen"
  fallback for offline members, shown in the Messages page's member
  list.
- Real unread counts and live read receipts: new `ConversationRead`
  model (was hardcoded `unreadCount: 0`); `POST
/api/v1/chat/rooms/:roomId/read` upserts it and broadcasts a `read`
  event so the sender's own client can show a read tick without
  polling.
- Message states: sending (optimistic, client-generated temp id) -> sent
  (POST resolved) -> read (derived from the latest `read` event from any
  other conversation member). A true `delivered` tick was scoped out -
  documented as a Phase 2/future item in ADR 0044.
- Live sidebar: a house-wide `house:<id>:chat` digest channel updates
  conversation previews/unread counts/list ordering without subscribing
  to every conversation, only the one currently open.
- UX polish: consecutive-same-sender message grouping (5 min window),
  auto-updating relative timestamps ("2 min ago", one shared 30s ticker
  instead of one interval per message), scroll-to-bottom only when
  already near the bottom with a "New messages" pill otherwise, a
  reconnecting/connecting status badge.
- Offline send-queue: messages that fail to send due to a genuine
  network error (not a server rejection) are queued to `localStorage`
  and auto-retried on the browser's `online` event and on next mount -
  verified end-to-end with a simulated `fetch` failure.
- Multi-tab/multi-device sync comes for free from the Broadcast
  architecture - every open tab independently subscribes to the same
  channels, no extra code needed.

Features started:

- None beyond the above within this pass; a true `delivered` state,
  message-list virtualization, and Realtime "private channels" (RLS-
  gated channel access, currently unguessable-cuid-topic trust only) are
  explicitly deferred - see ADR 0044's Costs/Future Implications.

Files created:

- `apps/web/src/server/realtime/broadcast.ts`
- `apps/web/src/lib/realtime/supabase-client.ts`,
  `use-conversation-channel.ts`, `use-house-chat-digest.ts`,
  `use-presence.ts`, `offline-queue.ts`
- `apps/web/src/lib/use-ticker.ts`
- `apps/web/src/app/api/v1/chat/rooms/[roomId]/read/route.ts`
- `apps/web/src/app/api/v1/auth/me/heartbeat/route.ts`
- `packages/database/prisma/migrations/20260714200000_conversation_reads_and_presence/`
- `docs/adr/0044-realtime-chat-supabase.md`

Files modified:

- `packages/database/prisma/schema.prisma` (`ConversationRead` model,
  `User.lastSeenAt`)
- `apps/web/src/server/chat/chat.service.ts` (capped includes, delta
  returns, pagination, `markRead`, broadcasts)
- `apps/web/src/server/auth/auth.service.ts` (`heartbeat`)
- `apps/web/src/server/organizations/organizations.service.ts`
  (`lastSeenAt` on house member DTOs)
- `apps/web/src/app/api/v1/chat/rooms/[roomId]/messages/route.ts` (added
  paginated `GET`)
- `apps/web/src/lib/api/client.ts` (`apiRequestPage` - paginated routes
  return `{data, page}` at the top level, which `apiRequest`'s
  single-level unwrap would otherwise silently drop `page` from)
- `apps/web/src/services/base-workspace.service.ts`,
  `apps/web/src/types/base.ts` (new chat/heartbeat client functions and
  types)
- `apps/web/src/components/messages/messages-page.tsx` (full realtime
  rewire - this is most of the feature's frontend surface),
  `message-bubble.tsx`, `message-composer.tsx`, `message-data.ts`,
  `channel-info-panel.tsx`
- `apps/web/src/components/layout/app-shell-gate.tsx` (heartbeat
  interval)
- `.env.example`, `docs/hostinger-deployment.md` (new
  `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` vars)

Database changes:

- New `conversation_reads` table; `users.last_seen_at` column. Migration
  `20260714200000_conversation_reads_and_presence`, applied to the local
  dev database directly (see the same hand-migration pattern used since
  the RLS-hardening migration broke `prisma migrate dev`'s shadow
  database) - production picks it up via the `migrate.yml` CI workflow
  (ADR 0042) on next push.

API changes:

- `POST /api/v1/chat/rooms/:roomId/messages` now returns a single
  `Message`, not the whole room. New `GET` on the same path (paginated).
  New `POST /api/v1/chat/rooms/:roomId/read`, `POST
/api/v1/auth/me/heartbeat`. See `docs/api.md`'s "Realtime API" section
  for the full Broadcast/Presence event catalog.

Architecture changes:

- First realtime layer in the app (ADR 0044) - Supabase Realtime chosen
  over a custom WebSocket server specifically because this app runs as a
  single managed Node process behind Hostinger's own reverse proxy,
  whose WebSocket-upgrade passthrough behavior is undocumented and
  unverified; connecting the browser directly to Supabase sidesteps that
  risk entirely.

Bugs fixed (caught during this session's own verification, not
pre-existing):

- Sidebar conversation previews only updated via the house digest
  channel (i.e. only for peers, only when Realtime is configured) -
  the sender's own client never updated its own preview text on send.
  Fixed by recomputing `lastMessagePreview`/`lastMessageTime` from the
  message list itself inside `patchChannelMessages`, so it's correct
  regardless of which code path appended the message.

Known bugs:

- None currently tracked for this feature within its documented scope.

Technical debt:

- No local Supabase Realtime credentials were available during this
  session, so true cross-client delivery (a second browser/tab actually
  receiving a broadcast) could not be verified end-to-end locally -
  everything reachable without those credentials was verified instead:
  optimistic send/confirm, pagination, reactions, mark-read, the offline
  queue (via a simulated `fetch` failure), and graceful degradation (a
  "Reconnecting…" badge, not a crash) when Realtime is unconfigured. The
  user needs to add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase project
  dashboard -> Settings -> API) locally and in Hostinger to light up
  live cross-client delivery for real; this could not be done in this
  session since it requires the user's actual Supabase project
  credentials.
- Real presence is only wired into the Messages page's member list, not
  app-wide (Crews, task assignees, bookings, etc. still show whatever
  static status their own page already had) - flagged as a natural but
  separate follow-up, out of scope for "the chat system."
- Message-list virtualization was deliberately not added (judged
  disproportionate given the 50-message cap + pagination already bounds
  DOM size); revisit if that cap is ever raised significantly.
- Channel names are unguessable-cuid capability tokens, not
  access-controlled (no Realtime "private channels"/RLS) - see ADR
  0044's Costs section for the upgrade path if stricter access control
  is ever needed.

Next task:

- Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and confirm `NEXT_PUBLIC_SUPABASE_URL`)
  in both local `.env` and Hostinger, then verify live cross-client
  delivery with two real browser sessions. Beyond that: real presence
  app-wide, a true `delivered` tick, and the standing RBAC/distributed-
  rate-limit backlog from the previous entry.

## 2026-07-15 Chat: Live-Delivery Diagnostics, Message Editing, Delivered Ticks

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 99%

Features completed:

- Diagnosed a live user report that new messages required a manual
  refresh to appear even though typing indicators worked live: typing is
  pure client-to-client and never touches server env vars, while actual
  message delivery depends on the server's `broadcast()` call succeeding,
  which requires `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` server-side
  (separate from the two `NEXT_PUBLIC_` client vars). `broadcast.ts`
  previously no-op'd on missing config with zero log output, making this
  undiagnosable from Hostinger Runtime Logs. It now logs a one-time
  warning the first time this happens; also added an explicit
  `"private": false` field to the broadcast payload defensively.
- Message editing: author-only, within 10 minutes of sending
  (`editMessage` in `chat.service.ts`, new `PATCH
/api/v1/messages/:messageId`, enforced server-side not just hidden in
  the UI). New nullable `Message.editedAt` column. Broadcasts a
  `message:edit` realtime event so other open clients update the bubble
  live. Frontend: an inline edit affordance (textarea + Save/Cancel) on
  the sender's own recent messages, an "(edited)" label once saved.
- The `delivered` tick ADR 0044 originally scoped out is now
  implemented, exactly as that ADR predicted: an ephemeral
  client-to-client broadcast (no schema change). A recipient's client
  acks receipt of `message:new` back to the sender on the same
  conversation channel; the sender's client advances that message's
  local status from `sent` to `delivered` (never downgrading from
  `read`). See ADR 0044's Amendment section for the full writeup.

Features started:

- None beyond the above.

Files created:

- `apps/web/src/server/chat/dto/edit-message.dto.ts`
- `apps/web/src/app/api/v1/messages/[messageId]/route.ts`
- `packages/database/prisma/migrations/20260715120000_message_edited_at/`

Files modified:

- `apps/web/src/server/realtime/broadcast.ts` (one-time unconfigured
  warning, `private: false`)
- `apps/web/src/lib/realtime/use-conversation-channel.ts` (`onEdit`,
  `onDelivered` handlers; ephemeral `delivered` ack send/receive;
  `message:edit` broadcast listener)
- `apps/web/src/server/chat/chat.service.ts` (`editMessage`,
  `editedAt` in `toMessageDto`)
- `apps/web/src/components/messages/messages-page.tsx` (`handleEditMessage`,
  `onEdit`/`onDelivered` wiring)
- `apps/web/src/components/messages/message-bubble.tsx` (inline edit UI,
  "(edited)" label, edit-window check)
- `apps/web/src/types/base.ts` (`ChatMessage.editedAt`,
  `EditChatMessageRequest`)
- `apps/web/src/services/base-workspace.service.ts` (`editChatMessage`)
- `packages/database/prisma/schema.prisma` (`Message.editedAt`)
- `docs/adr/0044-realtime-chat-supabase.md` (Amendment section)

Known limitations / tradeoffs:

- The live-delivery root cause (missing server-side Supabase env vars in
  Hostinger) could not be directly confirmed or fixed from this session -
  only made diagnosable. The user needs to check Hostinger Runtime Logs
  for the new warning, or confirm the two server-side env vars are set.
- The `delivered` ack could not be live-tested end-to-end in this session
  (requires two concurrently connected Realtime clients, and local dev
  has no Supabase credentials configured) - verified by code review and
  the same graceful-degradation pattern used elsewhere, not a live
  two-browser test.
- No message delete endpoint yet - editing only.

Next task:

- Confirm in production that the new `broadcast.ts` warning (or its
  absence) resolves the live-delivery question, then live-test the
  `delivered` tick and message editing with two real accounts once
  Supabase is fully configured.

## 2026-07-15 House-Owned Google Drive with Automatic Folder Structure

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 99%

Features completed:

- Redesigned Google Drive from a per-user connection (ADR 0038) to one
  shared connection per house, connected only by the Owner
  (`requireOwnerRole`, the same guard `removeMember`/join-request review
  already use). See ADR 0045 for the full reasoning and the explicit scope
  cuts (Owner-only rather than a new "Admin" tier; multi-client projects
  fold under whichever client was linked first; Scripts/Storyboards get no
  new prompt since they have no Drive bytes of their own).
- Fylmico now automatically creates and maintains the entire folder tree
  on connect: two Drive-side roots ("FYLMICO House" /
  "FYLMICO House (Sensitive)"), Clients/Resources/Portfolio + their fixed
  subfolders, Misc, and an Owner-only Sensitive tree (Finance, Quotations,
  Contracts, HR, Internal, Employee Work) - no manual folder management
  required.
- Creating a Client or a Project (optionally with a `clientId`)
  auto-creates its Drive folder (a project also gets its 6 fixed
  subfolders: Scripts, Storyboards, Raw Data, Project Files, Deliveries,
  Assets); linking a client later moves the project's folder out of Misc
  the first time one is linked.
- File uploads get a "which client/project?" destination picker (new
  `POST .../files/resolve-destination`) with a Raw Footage/Asset/
  Deliverable/Project File category - Raw Footage lazily creates a dated
  subfolder per upload day. Uploading while already browsing inside a
  folder skips the prompt, unchanged from before.
- A "Deliverable" upload offers "Add this to the House Portfolio?" (new
  `POST .../files/:entryId/add-to-portfolio`) - copies a reference into
  the chosen Portfolio category, reusing the same Drive file id rather
  than re-uploading.
- Every house member gets an Employee Work folder automatically (on join,
  and backfilled for existing members when Drive connects); every upload
  best-effort mirrors into the uploader's own Employee Work subfolder
  (Videos/Images/Documents by mime type) for management visibility.
- `FileEntry` gained `driveKey` (a stable, race-safe identifier for
  system-managed folders - `@@unique([organizationId, driveKey])`) and
  `sensitive` (gates the Owner-only tree, checked both on `list()` and
  per-entry in `requireEntry`). Since there's now one Drive per house,
  every entry maps to exactly one Drive object - `DriveFolderLink` (ADR
  0038's per-uploader mirror cache) and its recursive resolution logic in
  `files.service.ts` are deleted outright.
- System-managed folders (`driveKey` non-null) can't be deleted through
  the app - `deleteEntry` refuses them, protecting the tree from
  accidental deletion.

Features started:

- None beyond the above; a formal Admin permission tier and a "which
  client/project" prompt for Script/Storyboard creation (they carry no
  Drive bytes today, only an existing optional `projectId`) are explicitly
  out of scope this pass - see ADR 0045's Alternatives.

Files created:

- `apps/web/src/server/drive/drive-structure.service.ts`
- `apps/web/src/server/files/dto/resolve-destination.dto.ts`,
  `add-to-portfolio.dto.ts`
- `apps/web/src/app/api/v1/houses/[houseId]/drive/{connect-url,disconnect,status}/route.ts`
- `apps/web/src/app/api/v1/houses/[houseId]/files/resolve-destination/route.ts`,
  `[entryId]/add-to-portfolio/route.ts`
- `apps/web/src/components/files/upload-destination-dialog.tsx`
- `packages/database/prisma/migrations/20260715150000_house_drive_connection/`
- `docs/adr/0045-house-drive-connection.md`

Files modified:

- `packages/database/prisma/schema.prisma` (`DriveConnection` per-house
  reshape, `FileEntry.driveKey`/`sensitive`, `DriveFolderLink` dropped)
- `apps/web/src/server/drive/{drive.service,drive-token.util,google-drive.util}.ts`
  (org-scoped, `moveDriveFile` added, `createFylmicoFolder` removed)
- `apps/web/src/server/files/files.service.ts` (dropped per-uploader
  mirroring, added destination/portfolio/sensitive-gating)
- `apps/web/src/server/clients/clients.service.ts`,
  `apps/web/src/server/projects/projects.service.ts` (Drive folder hooks)
- `apps/web/src/server/organizations/organizations.service.ts`
  (Employee Work folder on `addMembership`)
- `apps/web/src/components/files/{files-page,files-header,drive-connection-banner}.tsx`
  (Sensitive toggle, Owner-gating, destination dialog wiring, updated copy)
- `apps/web/src/services/{drive.service,base-workspace.service}.ts`,
  `apps/web/src/types/base.ts` (house-scoped Drive client, new
  `resolveFileDestination`/`addFileToPortfolio`/`listClients`)
- Deleted the old flat `apps/web/src/app/api/v1/drive/{connect-url,disconnect,status}`
  routes (moved under `houses/:houseId/drive/*`); `callback` stays flat
  (registered Google redirect URI).

Known limitations / tradeoffs:

- **Breaking change**: existing per-user `DriveConnection` rows had no
  valid mapping to the new per-house shape and were truncated in the
  migration - every house must reconnect Drive fresh; files uploaded
  under the old model become unreachable through the app.
- Full end-to-end verification (an actual Google OAuth consent + real
  folders appearing in Drive) needs a real Google account to click through
  - not something this session could do on the user's behalf. Verified
    instead via: a live request confirming `connect-url` builds the correct
    OAuth URL/signed state for the Owner; client/project creation gracefully
    degrading (caught, logged, no crash) with Drive disconnected; the
    Sensitive toggle and its server-side gating; and a full
    typecheck/lint/clean-build pass.
- A single shared Drive connection reintroduces the single-point-of-failure
  risk ADR 0038 originally rejected - accepted here as the explicit
  product requirement (see ADR 0045's Costs).

Next task:

- Have a house Owner click "Connect Drive" with a real Google account to
  verify the full flow end-to-end: root folders + skeleton appearing in
  Drive, Client/Project folder creation, the upload destination picker,
  the Portfolio prompt, and Employee Work mirroring for a second member.

## 2026-07-15 House Type Step + Per-Type Default Modules

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 99%

Features completed:

- Added a "Choose House Type" step to house creation, before the existing
  House Information step: Freelancer/Solo, Agency/Production House,
  College Club/Group, Hobbyists, or Custom (All Features). See ADR 0046.
- The selected type sets that house's default enabled modules
  (`Organization.enabledModules`, a new column) - e.g. Freelancer excludes
  Crews/Messages/Call Sheets/Announcements, Agency/Custom enable
  everything - editable anytime afterward from House Settings, never
  locked in.
- Sidebar (`AppSidebar`) now filters `navItems` by the active house's
  `enabledModules`, with Home and Settings always visible and never
  toggleable (a house can't disable its own way back into Settings).
- New Owner-only "Modules" card in House Settings (`workspace-section.tsx`)
  reusing the existing `Switch` + row pattern from
  `notifications-section.tsx` - hidden entirely for non-Owner members.
- One shared, plain data file (`apps/web/src/lib/house-types.ts`) is the
  single source of truth for the type list, labels/descriptions, and
  default-module sets - imported by both the server (`createHouse`) and
  the client (the type-picker step and the Settings toggle list), so the
  three can never drift from each other.

Features started:

- None beyond the above; actually blocking a disabled module's route/API
  (not just hiding its sidebar entry) is explicitly deferred - see ADR
  0046's Future Implications.

Files created:

- `apps/web/src/lib/house-types.ts`
- `docs/adr/0046-house-type-and-modules.md`
- `packages/database/prisma/migrations/20260715180000_house_type_modules/`

Files modified:

- `packages/database/prisma/schema.prisma` (`Organization.type`,
  `Organization.enabledModules`)
- `apps/web/src/server/organizations/dto/create-house.dto.ts`
  (`houseType`), `update-house.dto.ts` (`enabledModules`)
- `apps/web/src/server/organizations/organizations.service.ts`
  (`createHouse` seeds default modules, `updateHouse` Owner-gates
  `enabledModules`, `toHouseDto` returns `type`/`enabledModules`)
- `apps/web/src/components/houses/house-choice-card.tsx` (new
  `"create-type"` mode), `houses-dashboard-page.tsx` (payload type)
- `apps/web/src/components/layout/app-sidebar.tsx`,
  `apps/web/src/components/layout/app-shell-gate.tsx` (module-filtered nav)
- `apps/web/src/components/settings/workspace-section.tsx` (Modules card)
- `apps/web/src/types/base.ts` (`House.type`/`enabledModules`,
  `CreateHouseRequest.houseType`, `UpdateHouseRequest.enabledModules`)

Known limitations / tradeoffs:

- Default module sets per type are a product judgment call (not
  individually specified in the request) - easy to retune later since
  `HOUSE_TYPE_DEFAULT_MODULES` is one object literal, no migration needed.
- A disabled module only hides its sidebar link today; the underlying
  route and API endpoints stay reachable directly - acceptable for this
  pass since the ask was a tailored workspace feel, not access control.
- Found and fixed a real race during manual testing: toggling two modules
  in quick succession from Settings could stomp each other, since each
  toggle computed its "next" list from the same stale `activeHouse`
  snapshot before the first request's `refreshWorkspace()` resolved.
  Fixed by disabling all module switches while any toggle request is in
  flight.

Next task:

- Revisit per-type default module sets once real usage patterns emerge
  across the 5 house types.

## 2026-07-15 Tasks: Production Workflow Rebuild (Phase 1)

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 99%

Features completed:

- Full `Task` schema rework (ADR 0047): multi-assignee with
  responsibilities (`TaskAssignee`, replacing single `assigneeId`),
  subtasks (`parentTaskId` self-relation), checklists
  (`TaskChecklistItem`, auto-computed `progress`), dependencies
  (`TaskDependency`, `isBlocked`), an append-only activity log
  (`TaskActivity` powering status/assignment/due-date history and the
  timeline together), and time tracking (`TaskTimeEntry`, start/stop
  timer + manual work log + estimate-vs-actual). 20 task types, 6
  statuses, 4 priorities, real `dueDate`/`startDate` timestamps,
  recurrence (auto-creates the next occurrence on completion, no cron),
  and real FK links to Project/Board/Script/shoot-day `CalendarEvent`.
- `FileEntry` gained a nullable `taskId` (mirrors `conversationId`) -
  attachments can be uploaded straight to a task or linked from the
  existing House Drive without moving the file.
- Rich creation flow (`task-create-dialog.tsx`): sectioned dialog covering
  every new field, a hand-rolled markdown-lite description editor
  (`**bold**`, `*italic*`, `- list`, `[link](url)` - no new dependency),
  and an assignee picker showing each member's live active-task count.
- Full task detail panel (`task-detail-panel.tsx`, a slide-over dialog):
  inline-editable header, description, assignees, subtasks, checklist,
  dependencies with a task picker, links/tags/production-field chips,
  time tracking, attachments, and a merged activity+comment timeline with
  `@mention` support (regex-matched against house member names, fires
  `task_mentioned`).
- List/Kanban (6 columns)/Table/My-Tasks views, indicator badges
  (overdue/due-today/due-tomorrow/blocked/high-priority/urgent/waiting-
  for-review), bulk multi-select with a floating bulk-action bar
  (status/priority/delete), and expanded filters (status/type/assignee
  alongside the existing priority filter) plus group-by (added
  type/client to status/priority/project/assignee).
- New notification triggers: `task_status_changed`, `task_mentioned`,
  `task_review_requested`, `task_completed`.

Features started:

- None beyond the above; Calendar/Gantt views, task templates, custom
  fields, Pomodoro mode, productivity analytics, keyboard shortcuts, a
  saved/advanced filter builder, and proactive due/overdue push
  notifications are explicitly deferred to a later phase (no
  scheduled-job infra on this app's Hostinger deployment, ADR 0042) - see
  ADR 0047's Future Implications.

Files created:

- `docs/adr/0047-tasks-production-workflow.md`
- `packages/database/prisma/migrations/20260715200000_tasks_production_workflow/`
- `apps/web/src/server/tasks/dto/add-checklist-item.dto.ts`,
  `update-checklist-item.dto.ts`, `add-dependency.dto.ts`,
  `add-work-log.dto.ts`, `stop-timer.dto.ts`
- `apps/web/src/app/api/v1/tasks/[taskId]/{activity,attachments,checklist,dependencies,duplicate,time-entries}/` route files
- `apps/web/src/components/tasks/task-description-editor.tsx`,
  `task-assignee-picker.tsx`, `task-create-dialog.tsx`,
  `task-detail-panel.tsx`, `task-indicator-badges.tsx`,
  `task-table-view.tsx`

Files modified:

- `packages/database/prisma/schema.prisma` (`Task` rework, 5 new models,
  `FileEntry.taskId`)
- `apps/web/src/server/tasks/dto/create-task.dto.ts`,
  `update-task.dto.ts`, `tasks.service.ts` (full rework)
- `apps/web/src/server/files/files.service.ts` (task attachments),
  `apps/web/src/server/comments/comments.service.ts` (@mentions),
  `apps/web/src/server/notifications/notifications.service.ts` (new
  trigger types), `apps/web/src/server/chat/chat.service.ts`
  (`ChannelTaskItem` shape)
- `apps/web/src/types/base.ts`, `apps/web/src/services/base-workspace.service.ts`
  (full new Task types + client functions)
- `apps/web/src/components/tasks/*` (task-data.ts, task-row-item.tsx,
  task-kanban-board.tsx, tasks-page.tsx, tasks-toolbar.tsx,
  tasks-filters-popover.tsx, tasks-group-by-menu.tsx,
  task-list-column-header.tsx, task-card-menu.tsx)
- `apps/web/src/components/dashboard/{my-tasks-panel,stat-cards-row,task-row}.tsx`,
  `apps/web/src/components/crews/crew-profile-page.tsx`,
  `apps/web/src/components/layout/create-menu.tsx`,
  `apps/web/src/components/messages/{messages-page,channel-tasks-list}.tsx`,
  `apps/web/src/components/projects/project-detail-page.tsx` (all
  updated for the new `Task` shape)

Known limitations / tradeoffs:

- Linked project/board/script/shoot-day and production fields
  (equipment/location/call-time/deliverables) are only editable at
  creation time, not from the detail panel - deferred, not blocking.
- List-view "Group by assignee" reflects only a task's first/primary
  assignee, not every assignee on a multi-assigned task.
- No proactive due-soon/overdue notifications - this remains a
  UI-computed indicator badge, not a push notification, per ADR 0042's
  no-scheduled-job constraint.

Next task:

- Phase 2: Calendar/Gantt views, task templates, custom fields, and
  productivity analytics (time-estimate-vs-actual reporting, Pomodoro
  mode) once Phase 1 usage surfaces real priorities.

## 2026-07-16 Dashboard + Onboarding Redesign: Pending Members & Permissions (Phase 1)

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 99%

Features completed:

- Joining a house (invite code, invite link, or an approved join-request)
  now creates an immediately-visible but **pending** membership
  (`roleId: null`) instead of instant "Member" access - the joiner sees
  their house on the Dashboard right away but gets a full-screen Waiting
  Screen (no sidebar, no data access on any route) until an admin assigns
  a role (ADR 0048).
- `organizationsService.requireMembership` - the single method all 18
  domain services already call - now requires an active role, so every
  existing route is correctly gated against pending members with zero
  changes to those services.
- New Crews "Pending Members" panel + a 3-step Assign Role wizard
  (Position → Team → Permissions, with Owner/Admin/Producer/Editor/
  Client/Custom presets covering 18 modular permissions) plus
  Reject/Ban actions (Ban blocks future re-joins via a new
  `Organization.bannedUserIds` list).
- New centralized `apps/web/src/lib/permissions.ts` (permission keys,
  labels, presets, suggested Position list) - the single source of truth
  future modules extend by adding keys, with no gating-mechanism changes
  needed.
- "Team" reuses the existing `CrewProfile.department` field (extended
  with Creative/Marketing/Management) rather than a new column/model.
- Simplified house creation to 2 steps (Name → Tag), dropping Description
  entirely; the Tag step live-checks handle availability via a new
  `GET /api/v1/houses/check-handle` endpoint.
- Dashboard route (`/dashboard`) now always hides the full sidebar/topbar
  (previously showed a "compact" sidebar) and stays reachable as the
  house-switcher even for a pending member, showing a "Waiting for
  Approval" badge on their pending house's card instead of the normal
  role/member-count line.
- Waiting screen self-polls every 5s and the app auto-transitions into
  the normal workspace (with a one-time welcome toast) the moment a role
  is assigned - no manual refresh, no new realtime channel.

Features started:

- None beyond the above; retrofitting the new `requirePermission` check
  into the other 17 domain services (today's Owner-only/any-member gates
  are unchanged) and every Dashboard visual extra (favorites, pins,
  drag-reorder, archive, search, storage/activity badges, cross-house
  notification feed, per-house last-page memory) are explicitly deferred
  to a later phase - see ADR 0048.

Files created:

- `docs/adr/0048-pending-members-and-permissions.md`
- `packages/database/prisma/migrations/20260716090000_pending_members_permissions/`
- `apps/web/src/lib/permissions.ts`
- `apps/web/src/server/organizations/dto/assign-role.dto.ts`
- `apps/web/src/app/api/v1/houses/check-handle/route.ts`
- `apps/web/src/app/api/v1/houses/[houseId]/pending-members/[membershipId]/{assign-role,reject,ban}/route.ts`
- `apps/web/src/components/houses/waiting-for-approval-page.tsx`
- `apps/web/src/components/crews/pending-members-panel.tsx`,
  `assign-role-dialog.tsx`

Files modified:

- `packages/database/prisma/schema.prisma` (`OrganizationMembership.roleId`
  nullable, `Role.permissions`, `Organization.bannedUserIds`)
- `apps/web/src/server/organizations/organizations.service.ts` (full
  rework: `requireMembership` gates on active role, new
  `requireAnyMembership`/`requirePermission`/`assignRole`/
  `rejectPendingMember`/`banPendingMember`/`checkHandleAvailability`,
  `addMembership` creates pending rows, `toHouseDto` adds
  `myRole`/`pendingMembers`)
- `apps/web/src/server/organizations/dto/create-house.dto.ts` (tightened
  handle validation)
- `apps/web/src/server/chat/chat.service.ts` (optional-chain the now-
  nullable `membership.role`)
- `apps/web/src/types/base.ts` (`RoleName` relaxed to `string`,
  `House.myRole`/`pendingMembers`, `HouseRole.permissions`,
  `PendingMember`, `AssignRoleRequest`, `CrewDepartment` gained
  Creative/Marketing/Management)
- `apps/web/src/services/base-workspace.service.ts` (new client
  functions)
- `apps/web/src/components/houses/house-choice-card.tsx` (2-step
  creation flow), `houses-dashboard-page.tsx` (pending badge, `myRole`)
- `apps/web/src/components/layout/app-shell-gate.tsx` (dashboard sidebar
  hiding, waiting-screen short-circuit, welcome toast), `app-sidebar.tsx`
  (logo → `/dashboard`)
- `apps/web/src/components/crews/crews-page.tsx`, `crew-data.ts`
  (extended department list)

Known limitations / tradeoffs:

- Only `approve_members` is enforced via the new `requirePermission`
  helper this pass; the other 17 permissions are stored/toggleable but
  not yet wired into any existing endpoint's authorization.
- Editing a shared Position's permissions from the Assign Role wizard
  changes access for everyone holding that Position, not just the member
  being assigned - intentional, but a different mental model than
  per-person permissions.
- Verified end-to-end using a synthetic pending-membership row (direct
  DB insert) for the second account rather than two live concurrent
  logins, since driving a second real login wasn't available in this
  pass - confirmed correct via the resulting DB state and the same
  polling/gating mechanism already proven live for the waiting screen.

Next task:

- Phase 2: Dashboard visual layer (favorites, pins, drag-reorder,
  archive, search, storage/activity badges), cross-house notification
  aggregation, instant per-house last-page memory, and retrofitting
  `requirePermission` into the remaining domain services.

## 2026-07-16 Dashboard Phase 2 + Tasks Phase 2

Current milestone: Phase 9 - real backend for every remaining domain

Completion percentage: 99%

Features completed:

- Dashboard: Favorite/Pin/Archive toggles per house (new
  `favoritedAt`/`pinnedAt`/`archivedAt` columns on
  `OrganizationMembership`), drag-reorder (native HTML5 DnD, new `order`
  column), a client-side search box, and Storage/Last Activity badges
  (batched `groupBy` aggregates, no per-house N+1 queries). Houses sort
  pinned > favorite > custom order > name.
- Dashboard: notifications gained a nullable `organizationId` -
  clicking one from a non-active house now switches houses
  (`activateHouse`) before routing to a type-derived destination page
  (a flat `TYPE_DESTINATION` lookup, not a routing framework). All 13
  `notificationsService.create` call sites updated to pass it.
- Dashboard: per-house "last page" is remembered in `localStorage`
  (`house-last-page.ts`) and used when entering a house instead of
  always landing on `/home`.
- Tasks: Calendar page now shows a "Task Deadlines" source built from
  already-loaded `workspace.tasks` (no new API call).
- Tasks: Save as Template / Create from Template, via a new
  `Task.isTemplate` flag and a shared `cloneTask` helper (refactored out
  of the existing `duplicateTask`); new Templates popover on the Tasks
  page.
- Tasks: `n` keyboard shortcut opens the New Task dialog (ignored while
  typing in a field).
- Analytics: new "Estimate vs Actual" panel (`estimatedMinutes` vs
  summed `TaskTimeEntry.durationMinutes`).
- Fixed a real bug found while touching `analytics.service.ts`: the
  `TASK_STATUS_DISPLAY` map and `tasksCompleted` filter still used the
  pre-ADR-0047 4-status vocabulary (`done`/`on-hold`), so
  `tasksCompleted` was silently always 0 in production. Corrected to the
  current 6-status vocabulary; also added `isTemplate: false` filters to
  every analytics task query.

Features started:

- None beyond the above.

Explicitly skipped this pass (see ADR 0049 for why):

- Custom Fields, Pomodoro Mode, Gantt/Timeline view, advanced/saved
  filter builder - all judged genuinely open-ended, need their own
  scoping.
- Proactive due/overdue push notifications - hard platform constraint
  (no scheduled-job infra on Hostinger, ADR 0042), not a scope choice.
- Retrofitting `requirePermission` into the remaining domain services
  (still deferred from ADR 0048).

Files created:

- `docs/adr/0049-dashboard-and-tasks-phase-2.md`
- `packages/database/prisma/migrations/20260716120000_dashboard_favorites_notifications_org/`
- `packages/database/prisma/migrations/20260716140000_task_templates/`
- `apps/web/src/lib/house-last-page.ts`
- `apps/web/src/app/api/v1/houses/[houseId]/{favorite,pin,archive}/route.ts`
- `apps/web/src/app/api/v1/houses/reorder/route.ts`
- `apps/web/src/app/api/v1/houses/[houseId]/task-templates/route.ts`
- `apps/web/src/app/api/v1/tasks/[taskId]/{save-as-template,create-from-template}/route.ts`
- `apps/web/src/components/tasks/task-templates-popover.tsx`
- `apps/web/src/components/analytics/task-estimate-panel.tsx`

Files modified:

- `packages/database/prisma/schema.prisma` (`OrganizationMembership`
  order/favoritedAt/pinnedAt/archivedAt, `Notification.organizationId`,
  `Task.isTemplate`)
- `apps/web/src/server/organizations/organizations.service.ts`
  (toggle/reorder methods, batched storage/activity aggregation,
  `compareHouses` sort)
- `apps/web/src/server/notifications/notifications.service.ts`
  (`organizationId` param/column)
- `apps/web/src/server/announcements/announcements.service.ts`,
  `bookings/bookings.service.ts`, `comments/comments.service.ts`
  (pass `organizationId` into `notificationsService.create`)
- `apps/web/src/server/tasks/tasks.service.ts` (`cloneTask` helper,
  `listTemplates`/`saveAsTemplate`/`createFromTemplate`, `isTemplate`
  filters, notification call sites)
- `apps/web/src/server/analytics/analytics.service.ts` (status
  vocabulary fix, `isTemplate` filters, `taskEstimateVsActual`)
- `apps/web/src/types/base.ts` (`House` favorite/pin/archive/order/
  storage/activity fields, `NotificationItem.organizationId`,
  `Analytics.taskEstimateVsActual`)
- `apps/web/src/services/base-workspace.service.ts` (new client
  functions for all of the above)
- `apps/web/src/components/houses/houses-dashboard-page.tsx` (full
  rewrite: search, pinned/archived sections, `HouseCard` drag-and-drop
  and favorite/pin/archive buttons)
- `apps/web/src/components/layout/app-shell-gate.tsx` (writes last-page
  on route change), `notification-bell.tsx` (deep-link handling)
- `apps/web/src/components/calendar/calendar-data.ts`,
  `calendar-page.tsx` (Task Deadlines source)
- `apps/web/src/components/tasks/task-card-menu.tsx`,
  `task-row-item.tsx` (Save as Template action), `tasks-page.tsx` (`n`
  shortcut, Templates popover wiring)
- `apps/web/src/components/analytics/analytics-page.tsx`
  (`TaskEstimatePanel` row)

Known limitations / tradeoffs:

- `TYPE_DESTINATION` falls back to `/home` for any notification type not
  in the lookup table, rather than erroring - fails safe, but a newly
  added notification type needs an entry added here too.
- Per-house last-page memory is `localStorage`-only, not synced across
  devices/browsers.
- Verified live in-browser: Dashboard search/favorite (network + DB
  query), Calendar Task Deadlines event render, full Save-as-Template ->
  Templates popover -> Create-from-Template flow (network requests
  confirmed 200, test rows cleaned up after), the `n` shortcut, and the
  Analytics Estimate vs Actual panel rendering real data.

Next task:

- Custom Fields, Pomodoro Mode, Gantt/Timeline view, and an
  advanced/saved filter builder remain open for a future phase.
- Retrofit `requirePermission` into the remaining domain services
  (ADR 0048's deferred item, still outstanding).
