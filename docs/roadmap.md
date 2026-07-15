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

Status: Complete

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
- Dashboard, Projects, Crews, Settings, Bookings, Storyboard, Files, and
  Messages are now wired to the real backend - no mock data or mock
  services remain anywhere in the app, superseding the "add realistic mock
  data and mock services" scope item above. See Phase 8 for the matching
  backend domains.
- Loading/empty/error/success states have now been audited across every
  page as part of a real dark-mode pass covering the whole app (plus real
  Appearance settings: accent color, density, theme transition).
- Real global search, a working Create menu, and an honest sidebar nav
  replace the earlier placeholders; route transitions and dashboard
  entrance animations added; mobile/tablet responsive overflow fixed
  across every page; `window.prompt`/`window.confirm` replaced with
  styled, dark-mode-aware dialog/prompt components.

### Phase 3: Frontend Authentication and Organizations

Status: Complete

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
- Organization/house switcher (for users in multiple houses): complete -
  a multi-house `/dashboard` hub now lists every house a user belongs to
  and lets them switch between them, replacing the old single-house
  `/houses/new` onboarding flow entirely.
- Public API contracts for auth/houses beyond the base set already in
  `docs/api.md`: substantially built out alongside the OTP and
  join-request work below; see `docs/api.md`.
- Email verification reworked from link-tokens to 6-digit OTP codes,
  backed by real email delivery (a new mailer abstraction); login is now
  blocked until a signup is OTP-verified, and password reset also uses an
  OTP code. See ADR 0039.
- Shareable house join links, plus a tag-based join-request flow: a
  prospective member requests to join by tag and a house Owner approves
  or rejects the request (new `HouseJoinRequest` model, plus a
  house-switch "activate" endpoint). See ADR 0040.
- Session persistence fixed: sessions now persist in `localStorage`
  (survive 30 days) instead of `sessionStorage` (previously cleared per
  browser tab).

### Phase 4: Frontend Projects and Clients

Status: In progress

Priority: High

Estimated completion: TBD

Scope:

- Client management screens.
- Project management screens.
- Departments and teams UI.
- Basic project dashboard.
- Public API contracts and mock services for each area.

Progress:

- Project management screens: complete - added a project detail page
  (edit, tasks, calendar, and comments tabs) on top of the existing
  Projects list.
- Departments and teams UI: partially done - crew department is now
  editable per member, and a dedicated crew member profile page was
  added (see Phase 6 for the rest of the Crew UI work).
- Client management screens and a basic project dashboard beyond the
  existing Projects list: not started.

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
- Calendar UI: Week and Day tabs are no longer "coming soon" - real
  week and day views were built alongside Month.
- Chat UI: complete - Messages now has real threaded replies and emoji
  reactions, real per-channel Files/Tasks/Events tab wiring, and real
  channel rename.
- Notification UI: complete - notification preferences now persist and
  actually gate sending; notifications trigger on task/project comments,
  invite acceptance, and bookings; the notification bell was redesigned
  (per-type icons, unread count, polling).
- Task UI and Kanban UI: complete - added a drag-and-drop Kanban board
  view for Tasks.
- Realtime: chat is now real (Supabase Realtime Broadcast/Presence, not
  Socket.IO - see ADR 0044) - instant delivery, typing, presence, read
  receipts, live unread counts/sidebar reordering, offline send-queue.
  Notifications still remain poll-based (25s interval, ADR 0023) - not
  yet migrated onto the same Realtime channels.

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
  page's `DonutChart` primitives). "New Booking" is now a real multi-field
  form, and Bookings gained a real approve/reject workflow (see Phase 7).
  Storyboard and Crew already have real routes built outside this session
  - see their own docs.
- Script UI: complete - a new Scripts (screenplay) module was added with
  a formatting toolbar (and a mobile two-column-layout fix). See ADR 0041.
- Storyboard UI: further extended - real `Character`/`StoryLocation`
  models and a real drawing/editing canvas were added on top of the
  existing boards/shots wiring. See ADR 0041.
- Call sheet UI: complete - new Call Sheets module.
- Crew UI: further extended - role tags, task reassignment, a crew
  member profile page, and an editable department field.
- Location UI: backed by the new `StoryLocation` model above.
- Moodboard UI and Shot list UI: still not started.

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
  reporting page - no mutating interactions, unlike Calendar.
- Analytics UI: further extended - a real date-range filter and CSV
  export were added, and the page is no longer read-only-only in that
  sense.
- Approval UI: a real approve/reject workflow was added for Bookings -
  the first concrete instance of this scope item.
- Asset management UI: a file preview modal (images/PDF/video/audio) was
  added to Files.
- Comment UI: Messages gained real threaded replies and emoji reactions,
  alongside the existing task/project comments (ADR 0024).
- Video review UI, version-control UI, and publishing UI: still not
  started.

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
- **Tasks page wired to real data**: unified the task status vocabulary
  across the dashboard's task panel and the standalone `/tasks` page
  (previously two incompatible sets - `scheduled/review` vs `todo/on-hold`),
  auto-derived `role` from the assignee's house role instead of requiring it
  as an unpopulated form field, and added `PATCH`/`DELETE /api/v1/tasks/:id`
  (only create existed before). `/tasks` now creates, toggles status,
  duplicates, and deletes through the real API - verified live in-browser
  for all four operations. Projects, Messages, Crews, Files, Storyboard,
  Calendar, Bookings, and Analytics remain on local mock data; each needs
  backend schema work first since their designs are richer than any
  matching (or, in most cases, nonexistent) backend model. See ADR 0026.
- **Projects page wired to real data**: extended `Project` with `type`,
  `genre`, a 7-value `stage` enum, `progress`, cover art
  (`coverGradient`/`coverIcon`, no photo upload - no object storage
  exists), and `teamIds` (validated against real house membership, not
  foreign-keyed). The API's `status` field is computed server-side from
  `stage` rather than stored directly, keeping it separate from the DB's
  own archive-tracking `status` column. `GET .../projects` now excludes
  archived projects (an ADR 0022 gap this closes). `/projects` creates,
  duplicates, and archives through the real API - verified live in-browser
  for all three, plus curl verification of stage/teamIds validation and
  the stage-to-status derivation. See ADR 0027.
- **Crews page wired to real data**: a "crew member" is now always a real
  house member, not a fabricated roster entry - added `CrewProfile`
  (department, role category, availability status, current assignment,
  birthday), auto-seeded whenever someone creates or joins a house.
  "Invite Member" now reveals the house's real invite code instead of
  creating a fake person; "Remove" really deletes the member's house
  membership (`OrganizationsService.removeMember`, this codebase's first
  member-removal capability - blocked only from emptying a house
  entirely). `/crews` lists and removes through the real API - verified
  live in-browser, including the last-member guard correctly blocking
  removal. See ADR 0028.
- **Messages page's core chat wired to real data**: viewing house
  channels and sending messages already worked through the real
  `chatRooms`/`sendChatMessage` API (ADR 0021); added
  `POST /api/v1/houses/:houseId/conversations` so "New Chat" creates a
  real channel (curl-verified, including duplicate-name rejection).
  Dropped the DM concept entirely (every real conversation is a
  house-wide group channel) and file attachments (no object storage);
  kept the Files/Tasks/Events tabs but left them honestly always-empty
  rather than deleted or faked, since no per-channel backend exists for
  any of them. Live browser verification wasn't completed for this pass
  - the preview tooling was unavailable - so it's curl/typecheck/lint/
    build-verified only; still owed a live in-browser pass. See ADR 0029.
- **Calendar page wired to real data**: added a new `CalendarEvent` model
  (title, date, time, location, category, optional `projectId`) - no
  matching backend model existed at all before this pass, unlike Tasks/
  Projects/Crews. `GET`/`POST /api/v1/houses/:houseId/calendar-events`
  implemented, membership-gated, with `projectId` validated against the
  house when given. "Calendars" in the UI are no longer 4 hardcoded fake
  production names - they're "My Schedule" (events with no `projectId`)
  plus one real entry per house `Project`, so toggling a calendar's
  visibility is a real `projectId` filter. `/calendar` creates and lists
  through the real API - verified live in-browser (logged in, saw
  curl-seeded events render on the correct days, created a new event
  through the popover with a real project selected, watched it appear
  immediately in the month grid and upcoming-events panel) and
  curl-verified (create with/without a project, chronological ordering,
  `404` on a cross-house `projectId`, `400` on a missing title). See
  ADR 0030.
- **Time tracking + Analytics page wired to real data**: unlike every
  other page wired up this session, Analytics needed a genuinely new
  feature first, not just a schema extension - added a `TimeEntry` model
  (date, hours, phase, optional project) and
  `GET`/`POST /api/v1/houses/:houseId/time-entries`, logged via a new
  "Log Time" popover on the Analytics page itself (no separate
  time-tracking page exists in the design). Added a single
  `GET /api/v1/houses/:houseId/analytics` endpoint that computes every
  number the page needs server-side: project/task totals, task-status
  breakdown, daily hours logged, phase distribution, top active
  projects, per-project daily hours (replacing the mock's fake
  progress-over-time chart with real hours-logged-per-project), top
  contributors, team workload (hours vs. a flat 40h/week capacity), and
  an activity heatmap derived from real `Task`/`Message`/`Comment`/
  `TimeEntry` timestamps. Sparklines, canned "+12%" growth notes, a
  static date-range button, and an "Export" button were dropped rather
  than faked - none had real data or function behind them. Curl-verified
  (time-entry create/list/validation, full analytics payload) and
  live-browser-verified (seeded data rendered correctly across every
  panel; logging time through the popover updated Hours Logged, Time
  Distribution, Team Workload, and the insight banner immediately). See
  ADR 0031.
- **Continuous deployment set up**: the live Hostinger site had been
  silently stuck ~2 weeks behind GitHub because its static export was
  only ever rebuilt and committed by hand. Added
  `.github/workflows/deploy-hostinger.yml` to rebuild and republish that
  export automatically on every push to `main`. Separately, no backend
  had ever been deployed anywhere - added `docker-compose.prod.yml` and
  `.github/workflows/deploy-vps.yml` to deploy the API + Postgres to a
  Hostinger VPS over SSH on every push, running `prisma migrate deploy`
  automatically. Both need a one-time manual setup (SSH key, GitHub
  secrets, DNS, certbot) documented step-by-step in ADR 0032 before
  they'll actually do anything. See ADR 0032.
- **Google OAuth login wired up**: dropped the decorative (non-functional)
  Apple/Microsoft buttons per explicit request, keeping only Google, and
  implemented a real server-side OAuth 2.0 flow for it - `GET /api/v1/auth/
google` and `GET /api/v1/auth/google/callback`, a new
  `google-oauth.util.ts` (plain `fetch` against Google's endpoints, no
  `passport` dependency), account creation/linking by email in
  `AuthService.handleGoogleCallback`, a CSRF-safe `state` cookie
  (`cookie-parser` added), and a new `/auth/callback` frontend page that
  reads the tokens from the redirect and calls the existing `setSession()`.
  Live-verified end-to-end short of a real Google account (redirect URL,
  cookie, and CSRF state-mismatch rejection all confirmed against the
  running local API; the actual Google consent screen requires Cloud
  Console credentials the user still needs to create). See ADR 0035.
- **Google Cloud Console OAuth client created and verified live**: the
  user created a real client ID/secret, and a full end-to-end Google
  login was completed in-browser (real account, real consent screen,
  landed logged-in on the dashboard).
- **House invitations + leave-house built**: targeted, revocable
  email invitations (`HouseInvitation` model, 7-day expiry, invite link
  returned directly in the API response and copied to the clipboard by
  the frontend rather than only logged) alongside the existing house-wide
  invite code, plus a self-service `POST /houses/:houseId/leave` (blocked
  if the caller is the house's only member, same floor `removeMember`
  already enforced). Settings -> Members now has a real invite form,
  pending-invitations list with revoke, and a "Danger Zone" leave-house
  card; a new public `/houses/invite/[token]` page previews the
  invitation and accepts it once logged in. Live-verified end-to-end
  against the real API and Postgres: invite created and copied, accept
  correctly rejected as `already_member` for the inviter's own account,
  a second real user joined via the existing invite code and successfully
  left (membership/crew-profile rows and `active_organization_id` all
  confirmed cleaned up in the database), and leaving as the sole member
  was correctly blocked. See ADR 0036.
- **Backend merged into `apps/web`, `apps/api` deleted**: user asked why a
  separate API service was needed at all, suspecting Render's free-tier
  cold start was a real speed bottleneck, and independently wanted one
  unified app. Ported the entire NestJS backend (~4,400 lines, 14
  domains - auth incl. Google OAuth, houses/invitations, tasks, chat,
  projects, clients, comments, crews, calendar, time-entries, analytics,
  notifications, workspace, health) into Next.js Route Handlers
  (`apps/web/src/app/api/v1/**`) backed by plain-class services
  (`apps/web/src/server/**`) - no `@nestjs/*` dependency remains. Chose
  this over a lighter "redeploy apps/api unchanged on Hostinger too"
  option (leaves two codebases, explicitly not wanted) and over a
  custom-server NestJS-as-Express-middleware option (non-standard entry
  point, the same category of fragile setup that already caused a real
  Hostinger incident per ADR 0034). Full local verification (every domain
  re-tested via curl, one real in-browser walkthrough, and a real
  production standalone-server run against the real database) passed
  before deleting `apps/api` and updating root `package.json`/
  `Dockerfile`/`docker-compose.yml`/`.claude/launch.json`/both
  `.env.example` files. See ADR 0037.
- **Bookings, Storyboard, Files, and profile/session/workspace backend
  domains added**: new `Resource`/`Booking`, `Board`/`Shot`, and
  `FileEntry` Prisma models; bookings and storyboard boards/shots
  services and routes; profile/password/session/workspace endpoints and
  a dashboard-summary endpoint. `/bookings`, `/storyboard`, `/files`, and
  Settings all now call the real API instead of local mock data, closing
  out the last pages still on mocks from the note above.
- **File storage**: Files was first wired to Supabase Storage, then
  replaced the same day with per-user Google Drive-backed storage (ADR 0038) - object storage is no longer a named prerequisite blocking
  project cover photos, message attachments, or `/files`. A later fix
  made app folders (not just files) mirror into Drive, and an
  upload-progress UI (speed + toast) was added. Storyboard was further
  extended with `Character`/`StoryLocation` models and a real
  drawing/editing canvas; Scripts (screenplay module, formatting
  toolbar) shipped alongside it. See ADR 0041.
- **Auth reworked to OTP** (ADR 0039): email verification moved from
  link-tokens to 6-digit OTP codes, real email delivery (mailer
  abstraction) backs signup verification and password reset, and login
  is now blocked until a signup is OTP-verified.
- **Tag-based house join requests** (ADR 0040): a new
  `HouseJoinRequest` model, owner approve/reject endpoints, and a
  house-switch activate endpoint, alongside the existing invite-code/
  invite-link flows; a new multi-house `/dashboard` hub replaces the old
  `/houses/new` onboarding.
- **Migrate-on-boot saga, then a dedicated CI workflow** (ADR 0042):
  automatic `prisma migrate deploy` on server boot was added, crashed
  the server on a failed migration, was patched to not crash, and was
  then fully reverted the same day in favor of
  `.github/workflows/migrate.yml`, which now runs `prisma migrate
deploy` automatically on every push to `main`.
- **Rate limiting + security headers** (ADR 0043): in-memory rate
  limiting (no Redis - single-process Hostinger deployment) and
  security headers added to auth and join-request endpoints.
- Also shipped in this period, layered on the above: dark mode across
  the whole app, real global search/Create menu/honest nav, route
  transitions and dashboard entrance animations, custom dialog/prompt
  components (replacing `window.prompt`/`window.confirm`), mobile/
  tablet responsive fixes across every page, new Call Sheets and
  Announcements modules, a public marketing landing page at `/` (two
  redesign passes) with the authenticated dashboard moved to `/home`, a
  project detail page, a Kanban board for Tasks, real Calendar week/day
  views, a notification bell redesign, crew role tags/reassignment, and
  session persistence moved to `localStorage`. See Phases 2-7 above for
  the frontend-facing detail on each.
- Next: real RBAC (who can remove/edit what) is still a concretely
  scoped gap across every module - only member-removal is Owner-gated
  so far. A house ownership-transfer/role-editing flow still hasn't been
  built (the "solo owner leaving a multi-member house" gap from ADR 0036
  remains open). Client management screens (Phase 4), Moodboard/Shot
  list UI (Phase 6), and video review/version-control/publishing UI
  (Phase 7) are the largest unstarted frontend areas. The Google Cloud
  Console OAuth client's authorized redirect URI still needs updating
  for the merged-app deployment, and Render decommissioning is still
  owed - both are external account actions outside this repo.

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
