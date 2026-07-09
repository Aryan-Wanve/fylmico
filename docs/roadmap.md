# Roadmap

## Standing Development Rule

- Backend implementation is now in scope for this workstream (see ADR 0018,
  superseding the frontend-only rule that used to live here under ADR 0017).
- Frontend work still follows the API-contract-first, mock-service workflow
  from ADR 0017 — that process discipline stays even though the "someone
  else owns the backend" constraint is gone.
- Backend work follows the architecture already decided in ADRs 0001-0016
  (NestJS modular monolith, PostgreSQL + Prisma, JWT + rotated refresh
  tokens, RBAC + policy authorization, Socket.IO realtime, versioned REST).

## Current Milestone

### Phase 2: Frontend Application Scaffold / Sprint 2

Status: In progress

Priority: Critical

Estimated completion: TBD

Scope:

- Build the frontend application shell.
- Define frontend folder architecture under `apps/web/src`.
- Build design-system foundations.
- Add API client/service boundaries.
- Add realistic mock data and mock services.
- Add frontend state-management boundaries.
- Add loading, empty, error, and success state patterns.
- Add scaffold documentation updates and validation commands.

Progress:

- Design-system foundation (Tailwind v4 + shadcn/ui, `components/ui/*`):
  complete.
- Real Next.js routing under an `(app)` route group, replacing the earlier
  single-component view-switcher: complete.
- App shell (compact and full sidebar, topbar with search/create/
  notifications): complete.
- Workspace bootstrap and auth-gate context (`lib/workspace-context.tsx`):
  complete.
- Frontend state-management boundaries: local per-panel state, one shared
  workspace context for cross-page data. No server-state/query library
  chosen yet since only mock data exists.
- Loading/empty/error/success states: present on the login, onboarding, and
  calendar flows; not yet audited across every dashboard panel.
- Calendar is now a real route (`/calendar`); see Phase 5 below.
- Analytics is now a real route (`/analytics`); see Phase 7 below.
- Bookings is now a real route (`/bookings`); see Phase 6 below.
- Projects, Tasks, Crews, Files, Storyboard, Messages, and Settings also
  now have real routes (built outside this session; see their own
  commits/docs for details). No non-navigating sidebar placeholders remain.

### Phase 3: Frontend Authentication and Organizations

Status: In progress

Priority: Critical

Estimated completion: TBD

Scope:

- Authentication UI and auth state.
- Public authentication API contracts.
- Mock authentication service.
- Organization switcher and workspace UI.
- Organization/member API contracts.
- Mock organization and membership data.

Progress:

- Authentication UI and mock auth service: complete (`/login`, pixel-matched
  to design reference).
- House creation/join onboarding UI (this product's equivalent of an
  "organization" is a House): complete (`/houses/new`).
- Organization/house switcher (for users in multiple houses): not started.
- Public API contracts for auth/houses beyond the base set already in
  `docs/api.md`: not started.

### Phase 4: Frontend Projects and Clients

Status: Planned

Priority: High

Estimated completion: TBD

Scope:

- Client management screens.
- Project management screens.
- Departments and teams UI.
- Basic project dashboard.
- Public API contracts and mock services for each area.

### Phase 5: Frontend Collaboration Core

Status: In progress

Priority: High

Estimated completion: TBD

Scope:

- Chat UI.
- Notification UI.
- Task UI.
- Kanban UI.
- Calendar UI.
- Realtime public event contracts and mocked realtime behavior.

Progress:

- Calendar UI: complete for Month view (`/calendar`, pixel-matched to
  design reference) - header with date navigation, month/year jump,
  Month/Week/Day tabs, and event-type filters; a month grid with colored
  event pills and a legend; a mini calendar, calendar-source checklist,
  and upcoming-events panel in the right rail; a working "New Event"
  create flow. Week and Day tabs show a "coming soon" state; chat,
  notifications, and kanban have not started (Tasks got a real route
  outside this session - see its own docs).

### Phase 6: Frontend Creative Production Modules

Status: In progress

Priority: High

Estimated completion: TBD

Scope:

- Storyboard UI.
- Moodboard UI.
- Script UI.
- Shot list UI.
- Call sheet UI.
- Equipment UI.
- Crew UI.
- Location UI.
- Public API contracts and mock services.

Progress:

- Equipment/venue booking UI: complete (`/bookings`, pixel-matched to
  design reference) - 4 stat cards, status/scope tabs (All/My Bookings/
  Pending Approval/Confirmed/Cancelled) filtering a bookings table
  (resource, project, dates, status, booked-by), and a right rail with a
  "Bookings by Type" donut, an upcoming-bookings list, and a mini booking
  calendar (reusing the Calendar page's `MiniCalendar` and the Analytics
  page's `DonutChart` primitives). "New Booking" and "Filters" are
  decorative for now, matching the same not-yet-wired precedent as other
  pages' secondary controls. Storyboard and Crew already have real routes
  built outside this session - see their own docs. Moodboard, Script,
  Shot list, and Call sheet UI have not started.

### Phase 7: Frontend Review, Delivery, and Analytics

Status: In progress

Priority: High

Estimated completion: TBD

Scope:

- Asset management UI.
- Video review UI.
- Comment UI.
- Approval UI.
- Version-control UI.
- Publishing UI.
- Analytics UI.
- Public API contracts and mock services.

Progress:

- Analytics UI: complete (`/analytics`, pixel-matched to design reference) -
  5 stat cards with sparklines, a multi-series project-progress line/area
  chart, task-status and time-distribution donut charts, a weekly
  time-logged mini chart, an activity heatmap, and top-projects/top-
  contributors/team-workload list panels. All hand-rolled inline SVG (no
  charting library), following the `sparkline.tsx` precedent. Read-only
  reporting page - no mutating interactions, unlike Calendar. No other
  review/delivery UI (asset management, video review, approvals, version
  control, publishing) has started.

### Phase 8: Backend Bootstrap

Status: In progress

Priority: Critical

Estimated completion: TBD

Scope:

- Scaffold `apps/api` (NestJS) and `packages/database` (Prisma), wired into
  the npm workspaces monorepo and docker-compose.
- Health-check endpoint only; no domain models, auth, or business logic.
- Add PostgreSQL as a docker-compose service.
- Identity/auth module: signup, login, refresh, logout, logout-all, email
  verification, password reset.
- Organizations/houses module: create house, join house, workspace snapshot.
- Tasks/chat module: create task, send chat message, fill in workspace's
  tasks/chatRooms.
- Projects/clients module: create/list/read/update/archive project,
  create/list/read/update client, link clients to projects.
- Notifications module: list/mark-read, triggered by task assignment and
  house join.
- Comments module: create/list comments on tasks and projects.

Progress:

- Backend scaffold complete: `apps/api` boots, applies the `/api/v1` global
  prefix and `{ "data": ... }` response envelope (ADR 0010) to
  `GET /api/v1/health`, and connects to PostgreSQL via `packages/database`'s
  `PrismaService`/`DatabaseModule` (ADR 0008). See ADR 0018.
- Auth module complete: `users`/`auth_accounts`/`sessions`/
  `email_verification_tokens`/`password_reset_tokens` Prisma models; all 9
  endpoints from `docs/api.md` implemented (signup, login, refresh, logout,
  logout-all, verify-email, request-password-reset, reset-password, me);
  argon2id password hashing, rotated opaque refresh tokens, a global
  `ValidationPipe` + `HttpExceptionFilter` matching ADR 0010's response
  envelope. See ADR 0019.
- Organizations/houses module complete: `organizations`/`roles`/
  `organization_memberships` Prisma models; `POST /api/v1/houses`,
  `POST /api/v1/houses/join`, and `GET /api/v1/workspace` implemented,
  matching the mock service's `House`/`HouseRole`/`HouseMember` shapes
  exactly. `users` gained `name` (now required at signup) and
  `activeOrganizationId` (now included in the JWT access token claims). See
  ADR 0020.
- Tasks/chat module complete: `tasks`/`conversations`/`messages` Prisma
  models (single-assignee tasks, house-wide named channels - simpler than
  the originally planned `task_assignees`/`conversation_members` join
  tables, deferred until multi-assignee/private-conversation features are
  actually needed); `POST /api/v1/tasks` and
  `POST /api/v1/chat/rooms/:roomId/messages` implemented; 3 default
  conversations (general/edit-bay/shoot-floor) now seeded at house
  creation; `GET /api/v1/workspace`'s `tasks`/`chatRooms` are fully real
  now (scoped to the caller's active house). See ADR 0021.
- Projects/clients module complete: `projects`/`clients`/`project_clients`
  Prisma models; the first module with no pre-existing frontend mock, so
  its API contract (routes, fields, error codes) was designed from scratch
  following established conventions (`houses`-prefixed routes, membership-
  only authorization, action endpoints for lifecycle changes). Also the
  first real use of ADR 0010's cursor-pagination envelope
  (`apps/api/src/common/pagination.ts`), on the new project/client list
  endpoints. See ADR 0022.
- Notifications module complete: `notifications` Prisma model;
  `GET /api/v1/notifications`, `POST /api/v1/notifications/:id/read`,
  `POST /api/v1/notifications/read-all` implemented. No public create
  endpoint - wired into two existing flows instead (task assignment
  notifies the assignee; house join notifies the house's Owner(s)). No
  realtime delivery yet (ADR 0005 not implemented) - poll-only. See ADR 0023.
- Comments module complete: `comments` Prisma model, resolving the
  previously-deferred "comment target modeling strategy" via a
  `commentableType`/`commentableId` pair;
  `POST`/`GET /api/v1/tasks/:taskId/comments` and
  `POST`/`GET /api/v1/projects/:projectId/comments` implemented. Create +
  list only, no edit/delete yet. See ADR 0024.
- **Frontend/backend integration**: `apps/web` now calls the real API for
  its core loop instead of the in-memory mock -
  `base-workspace.service.ts` rewritten to call `apps/api` directly (same
  exported function signatures, so consuming components were largely
  unaffected); real signup UI wired up (was a "not open yet" placeholder);
  house creation/join forms now take real input instead of hardcoded demo
  values; added a working logout (previously didn't exist at all). Verified
  live in-browser: two real accounts signing up, one creating a house, the
  other joining it via a real invite code, session persisting across
  reload, logout, and re-login, with real backend error messages (wrong
  password, duplicate handle) surfacing correctly in the UI. See ADR 0025.
  Everything outside this core loop (`/tasks`, `/crews`, `/files`,
  `/storyboard`, `/calendar`, `/bookings`, `/analytics`, `/settings`) still
  runs on independent local mock data - those pages were never wired to
  the shared service and have no backend module yet.
- Next: activity feed (last remaining Collaboration-group item), creative-
  production modules (storyboards, shot lists, call sheets, assets) now
  that projects exist for them to attach to, or wiring more frontend pages
  to real data as their backend modules get built.

## Completed Milestones

### Phase 1: Foundation and Planning

Baseline architecture, ADR coverage (0001-0017), frontend/backend
independence model, and permanent AI/product principle documents are all in
place. See [docs/adr](docs/adr) for the full decision record.

## Backlog

- Templates.
- AI assistant.
- Advanced search.
- Budgeting.
- Invoices.
- Contracts.
- Voice channels.
- Video meetings.
- Administration.
- Advanced settings.
