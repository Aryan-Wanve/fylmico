# Fylmico Master Index

This is the first document every engineer or AI agent should read before
working on Fylmico.

## Core Project Documents

- [README.md](README.md): Project overview and documentation entry point.
- [PROJECT_SPEC.md](PROJECT_SPEC.md): Canonical product and engineering brief.
- [AI_RULES.md](AI_RULES.md): Permanent instructions for future AI sessions.
- [PRODUCT_PRINCIPLES.md](PRODUCT_PRINCIPLES.md): Product philosophy and design
  principles.

## Project Memory

- [docs/context.md](docs/context.md): Permanent project memory.
- [docs/progress.md](docs/progress.md): Current progress and latest session
  summary.
- [docs/session.md](docs/session.md): Append-only development session log.
- [docs/roadmap.md](docs/roadmap.md): Milestones, backlog, and priorities.
- [docs/features.md](docs/features.md): Feature register and implementation
  notes.
- [docs/changelog.md](docs/changelog.md): Meaningful project changes.

## Engineering Documents

- [docs/architecture.md](docs/architecture.md): System architecture, services,
  dependencies, and scaling strategy.
- [docs/database.md](docs/database.md): Database model, relationships, indexes,
  constraints, and migration history.
- [docs/api.md](docs/api.md): API conventions, endpoint plan, authentication,
  permissions, and examples.
- [docs/authentication.md](docs/authentication.md): Authentication model and
  session strategy.
- [docs/permissions.md](docs/permissions.md): Authorization model, roles, and
  policy rules.
- [docs/deployment.md](docs/deployment.md): Deployment architecture and
  operational strategy.
- [docs/hostinger-deployment.md](docs/hostinger-deployment.md): Hostinger
  Node.js deployment settings and 403 checklist.
- [docs/coding-standards.md](docs/coding-standards.md): Coding standards and
  quality expectations.
- [docs/tech-stack.md](docs/tech-stack.md): Selected technologies and reasons.
- [docs/glossary.md](docs/glossary.md): Shared product and engineering language.

## Decisions

- [docs/decisions.md](docs/decisions.md): High-level decision log.
- [docs/adr](docs/adr): Architecture decision records.

Current ADRs:

- [0001-monorepo.md](docs/adr/0001-monorepo.md)
- [0002-database.md](docs/adr/0002-database.md)
- [0003-authentication.md](docs/adr/0003-authentication.md)
- [0004-permissions.md](docs/adr/0004-permissions.md)
- [0005-realtime.md](docs/adr/0005-realtime.md)
- [0006-deployment.md](docs/adr/0006-deployment.md)
- [0007-sprint-0-foundation.md](docs/adr/0007-sprint-0-foundation.md)
- [0008-modular-monolith-backend.md](docs/adr/0008-modular-monolith-backend.md)
- [0009-frontend-architecture.md](docs/adr/0009-frontend-architecture.md)
- [0010-api-architecture.md](docs/adr/0010-api-architecture.md)
- [0011-organization-hierarchy.md](docs/adr/0011-organization-hierarchy.md)
- [0012-project-hierarchy.md](docs/adr/0012-project-hierarchy.md)
- [0013-file-storage-architecture.md](docs/adr/0013-file-storage-architecture.md)
- [0014-ai-integration-architecture.md](docs/adr/0014-ai-integration-architecture.md)
- [0015-future-mobile-compatibility.md](docs/adr/0015-future-mobile-compatibility.md)
- [0016-scaling-strategy.md](docs/adr/0016-scaling-strategy.md)
- [0017-frontend-backend-independence.md](docs/adr/0017-frontend-backend-independence.md)
- [0018-backend-bootstrap.md](docs/adr/0018-backend-bootstrap.md)
- [0019-auth-module.md](docs/adr/0019-auth-module.md)
- [0020-organizations-houses-module.md](docs/adr/0020-organizations-houses-module.md)
- [0021-tasks-chat-module.md](docs/adr/0021-tasks-chat-module.md)
- [0022-projects-clients-module.md](docs/adr/0022-projects-clients-module.md)
- [0023-notifications-module.md](docs/adr/0023-notifications-module.md)
- [0024-comments-module.md](docs/adr/0024-comments-module.md)
- [0025-frontend-backend-integration.md](docs/adr/0025-frontend-backend-integration.md)
- [0026-tasks-page-extension.md](docs/adr/0026-tasks-page-extension.md)
- [0027-projects-page-extension.md](docs/adr/0027-projects-page-extension.md)
- [0028-crews-module.md](docs/adr/0028-crews-module.md)
- [0029-messages-page-extension.md](docs/adr/0029-messages-page-extension.md)
- [0030-calendar-page-extension.md](docs/adr/0030-calendar-page-extension.md)
- [0031-time-tracking-and-analytics.md](docs/adr/0031-time-tracking-and-analytics.md)
- [0032-continuous-deployment.md](docs/adr/0032-continuous-deployment.md)
- [0033-supabase-render-backend.md](docs/adr/0033-supabase-render-backend.md)
- [0034-hostinger-native-web-app.md](docs/adr/0034-hostinger-native-web-app.md)
- [0035-google-oauth-login.md](docs/adr/0035-google-oauth-login.md)
- [0036-house-invitations-and-leave.md](docs/adr/0036-house-invitations-and-leave.md)
- [0037-merge-backend-into-nextjs.md](docs/adr/0037-merge-backend-into-nextjs.md)
- [0038-drive-backed-file-storage.md](docs/adr/0038-drive-backed-file-storage.md)
- [0039-otp-based-auth.md](docs/adr/0039-otp-based-auth.md)
- [0040-multi-house-dashboard-and-join-requests.md](docs/adr/0040-multi-house-dashboard-and-join-requests.md)
- [0041-storyboard-canvas-and-scripts-module.md](docs/adr/0041-storyboard-canvas-and-scripts-module.md)
- [0042-migrate-on-push-ci.md](docs/adr/0042-migrate-on-push-ci.md)
- [0043-in-memory-rate-limiting.md](docs/adr/0043-in-memory-rate-limiting.md)
- [0044-realtime-chat-supabase.md](docs/adr/0044-realtime-chat-supabase.md)
- [0045-house-drive-connection.md](docs/adr/0045-house-drive-connection.md)
- [0046-house-type-and-modules.md](docs/adr/0046-house-type-and-modules.md)
- [0047-tasks-production-workflow.md](docs/adr/0047-tasks-production-workflow.md)
- [0048-pending-members-and-permissions.md](docs/adr/0048-pending-members-and-permissions.md)
- [0049-dashboard-and-tasks-phase-2.md](docs/adr/0049-dashboard-and-tasks-phase-2.md)
- [0050-hud-personal-workspace.md](docs/adr/0050-hud-personal-workspace.md)

## Current Sprint Gate

**The backend now lives inside `apps/web` as Next.js Route Handlers, not a
separate app** (ADR 0037) - `apps/api` (the original NestJS backend
described throughout the rest of this section's history) was ported into
`apps/web/src/app/api/v1/**` + `apps/web/src/server/**` and deleted
entirely. Every endpoint contract and every domain narrated below is
unchanged in behavior; only where the code lives moved. Read ADR 0037
first if anything below references `apps/api` - that path no longer
exists, and the equivalent logic is now under `apps/web/src/server/<domain
name>/`.

Backend implementation has started (ADR 0018), superseding ADR 0017's
"backend is a black box" framing for this workstream. `packages/database`
(Prisma) has working identity/auth (ADR 0019), organizations/houses
(ADR 0020), tasks/chat (ADR 0021), projects/clients (ADR 0022),
notifications (ADR 0023), and comments (ADR 0024) domains, all backed by
real tables and curl-verified end to end.

**`apps/web` is now wired to the real backend for its core loop** (ADR
0025): signup, login, logout, house creation, and house joining all call
the real API — verified live in-browser with two real accounts creating and
joining a real house. **The standalone `/tasks` page is now real too** (ADR
0026): create, status toggle, duplicate, and delete all round-trip through
`POST`/`PATCH`/`DELETE /api/v1/tasks`, verified live in-browser. Wiring it up
required unifying the task status vocabulary (the dashboard's task panel and
the standalone Tasks page previously used two different, incompatible sets)
and adding update/delete endpoints that didn't exist before. **The
standalone `/projects` page is real too** (ADR 0027): create, duplicate,
and archive round-trip through `POST`/`PATCH`/`POST .../archive
/api/v1/houses/:houseId/projects` and `/api/v1/projects/:projectId`,
verified live in-browser. `Project` gained `type`/`genre`/`stage`/
`progress`/cover-art/`teamIds` fields to match its designed UI, with the
API's `status` field computed server-side from `stage` rather than stored
directly (the DB `status` column keeps its original archive-tracking
meaning). **The standalone `/crews` page is real too** (ADR 0028): a
"crew member" is now always a real house member (`User` +
`OrganizationMembership`), extended with a new `CrewProfile` (department,
role category, availability status, current assignment), auto-seeded
whenever someone creates or joins a house. "Invite Member" reveals the
house's real invite code instead of fabricating a fake person; "Remove"
really removes the member (`DELETE /api/v1/houses/:houseId/crew/:userId`,
this codebase's first member-removal capability - blocked only from
emptying a house entirely, with no finer-grained "only Owners can do
this" check yet). Verified live in-browser, including the last-member
guard correctly blocking removal. **The standalone `/messages` page's
core chat is real too** (ADR 0029): viewing house channels and sending
messages already flowed through the real `chatRooms`/`sendChatMessage`
API built in ADR 0021; this pass adds
`POST /api/v1/houses/:houseId/conversations` so "New Chat" creates a real
channel too (curl-verified, including duplicate-name rejection). The DM
concept is dropped entirely (every real conversation is a house-wide
group channel); the Files/Tasks/Events tabs and file attachments remain
in the UI but are honestly always-empty (no object storage, no per-
channel task/event backend exists) rather than deleted or faked.
**Live browser verification for Messages specifically was not completed**

- the browser preview tooling was unavailable during that pass; it's
  curl- and typecheck/lint/build-verified only, and should get the same
  live in-browser pass the other pages received once tooling is back.
  **The standalone `/calendar` page is real too** (ADR 0030): a new
  `CalendarEvent` model (title, date, time, location, category, optional
  `projectId`) backs `GET`/`POST /api/v1/houses/:houseId/calendar-events`;
  the Calendars panel's filter list is "My Schedule" plus one real entry
  per house `Project` rather than fake hardcoded production names,
  curl-verified (including cross-house `projectId` rejection) and
  live-browser-verified (created an event through the popover with a real
  project selected, watched it render immediately in the month grid and
  upcoming-events panel). Everything else (`/files`, `/storyboard`,
  `/bookings`, `/analytics`, `/settings`, and the dashboard's "Recent
  Projects"/"Recent Activity" panels) still runs on independent local mock
  data colocated per page — those pages' designs are materially richer
  than their matching (or, for files/storyboard/bookings, nonexistent)
  backend models, so wiring each one up means extending its Prisma schema
  first, not just swapping a mock for a fetch call. **The standalone
  `/analytics` page is real too** (ADR 0031), and needed a genuinely new
  feature first: a `TimeEntry` model (date, hours, phase, optional
  project) backing `GET`/`POST /api/v1/houses/:houseId/time-entries`,
  logged from a "Log Time" popover right on the Analytics page (no
  separate time-tracking page exists in the design). A single
  `GET /api/v1/houses/:houseId/analytics` endpoint computes every number
  the page shows - project/task totals, task-status breakdown, daily
  hours, phase distribution, top active projects, top contributors, team
  workload (hours vs. a flat 40h/week capacity), and an activity heatmap
  derived from real `Task`/`Message`/`Comment`/`TimeEntry` timestamps -
  server-side, so the frontend never re-derives these numbers itself.
  Sparklines, canned growth percentages, a static date-range button, and
  an "Export" button were dropped rather than faked, since none of them
  had real data or functionality behind them. Curl-verified (time-entry
  create/list/validation, full analytics payload shape) and
  live-browser-verified (seeded data rendered correctly across every
  panel; logging a new time entry through the popover updated Hours
  Logged, Time Distribution, Team Workload, and the insight banner
  immediately). No object storage exists anywhere in the backend yet - a
  concrete, named prerequisite for project cover photos, message
  attachments, and the entire `/files` page. Real RBAC (who can
  remove/edit what) is now a concretely scoped gap across every module,
  not just one. The frontend silently refreshes an expired access token
  on a `401` (verified live). No realtime delivery (Socket.IO, ADR 0005)
  exists anywhere yet — notifications and chat are both REST/poll-based
  for now.

**Continuous deployment is now real and confirmed live end-to-end**
(ADR 0033, ADR 0034). The live Hostinger site had silently drifted ~2
weeks behind GitHub because its static export was only ever rebuilt and
committed by hand. The first fix attempt built a GitHub Actions workflow
to automate that rebuild - but it turned out this Hostinger account
actually uses Hostinger's own native GitHub-connected "Web App" hosting,
which builds and runs `apps/web` directly on every push with **no help
needed at all** (`docs/hostinger-deployment.md`). That custom workflow
was not just unnecessary but actively harmful: leftover static files it
committed partially masked (and were mistaken for the cause of) a routing
403, and, separately, an incomplete cleanup allowlist deleted
`packages/database`'s entire source straight to `main` in one automated
run. Both the workflow and the underlying script have been removed,
every stale static-export artifact purged from the repository root, and
`packages/database` restored. The 403 turned out to have a third,
unrelated cause underneath the static-file noise: the Web App's **Entry
file** setting (`server.js`) had simply never been configured, so
Hostinger built the app but never actually ran it - fixed via Hostinger's
own dashboard, along with adding `NEXT_PUBLIC_API_URL` to its Environment
Variables section (a setting scoped to the Hostinger deployment itself,
distinct from any GitHub Actions variable). See ADR 0034 for the full
incident writeup. Live-verified: `/login` and `/signup` now return real
Next.js responses instead of Apache 403s.
Separately, no backend had ever been deployed anywhere - the original
plan (ADR 0032) was a Hostinger VPS, but no VPS turned out to be
available, so the backend deploys instead to **Render** (the API, built
from `apps/api/Dockerfile` via `render.yaml`, redeployed automatically by
Render's own GitHub integration on every push, running
`prisma migrate deploy` on every container start) with **Supabase**
hosting Postgres (ADR 0033) - confirmed live end-to-end. Set
`NEXT_PUBLIC_API_URL` directly in Hostinger's own Environment Variables
UI to point the frontend at the live Render API.

**Google sign-in is fully working, confirmed live with a real account**
(ADR 0035): the login page's Apple/Microsoft buttons (never functional)
were removed, leaving one real "Continue with Google" button that drives
a server-side OAuth 2.0 flow (`GET /api/v1/auth/google` /
`GET /api/v1/auth/google/callback`, CSRF-protected via a short-lived
`state` cookie, account creation/linking by email). The user created a
real OAuth client in Google Cloud Console and completed a real login
in-browser end to end. Render's environment still needs the same
`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_CALLBACK_URL` added for
the live deployment (currently local-only).

**House invitations and leave-house are real** (ADR 0036): alongside the
existing house-wide invite code (ADR 0020), a member can now invite a
specific email — a new `HouseInvitation` model backs
`POST`/`GET`/`DELETE /api/v1/houses/:houseId/invitations` and a public
`GET`/`POST /api/v1/invitations/:token[/accept]` pair. The invite link is
returned directly in the API response (and copied to the clipboard by
Settings' new invite form) rather than only logged, since there's still
no email provider. A member can also now leave a house themself via
`POST /api/v1/houses/:houseId/leave`, blocked only if they're the house's
last remaining member — the same floor `removeMember` (ADR 0028) already
enforced. Live-verified against the real API and Postgres: invite
created and copied, self-accept correctly rejected as `already_member`,
revoke cleared the pending list, a second real user joined via invite
code and successfully left with membership/crew-profile rows and
`active_organization_id` all confirmed cleaned up in the database, and
leaving as the sole member was correctly blocked.

**The backend was merged into `apps/web` and `apps/api` deleted** (ADR
0037): ~4,400 lines across all 14 domains above (auth incl. Google OAuth,
houses/invitations, tasks, chat, projects, clients, comments, crews,
calendar, time-entries, analytics, notifications, workspace, health) were
ported from NestJS controllers/services into Next.js Route Handlers
(`apps/web/src/app/api/v1/**`) backed by plain-class services under
`apps/web/src/server/**` - no `@nestjs/*` dependency remains anywhere in
the repo. This was driven by two things together: a suspicion that
Render's free-tier cold start was a real speed bottleneck, and an
explicit preference for one unified app over two services. Full local
live-verification (every domain re-tested via curl, one real in-browser
walkthrough of login/settings/invitations, and a real production
standalone-server run hitting the real database) passed before cutover.
Render is no longer part of this stack; the user decommissions it
separately (an external account action, not a repo change).

**Files stores bytes in one Google Drive per house, not Supabase Storage**
(ADR 0038, redesigned per-house by ADR 0045): a `DriveConnection` model
holds one Google Drive OAuth grant per house (`drive.file` scope - only
files/folders the app itself creates, never the whole Drive), authorized
only by the Owner, via a second, separate OAuth flow from login. Fylmico
automatically creates and maintains the entire folder structure inside it

- Clients/Resources/Portfolio, an Owner-only Sensitive tree, per-client and
  per-project folders, and a per-member Employee Work folder - no manual
  folder management required. `FileEntry` stays the shared, house-scoped
  index; its `storagePath` holds a Drive object id (one per entry now that
  there's a single house Drive), and downloads proxy through a short-lived
  signed server token rather than a Drive share link, keeping access control
  inside Fylmico's own house-membership checks instead of Drive's sharing
  model. Fylmico's own storage bill still only ever covers small profile
  avatars (Supabase Storage), not production files.

**Email verification and password reset moved from link-tokens to 6-digit
OTP codes, and login is now blocked until verified** (ADR 0039): typed
codes avoid the failure mode where mail-client link-prefetching silently
burned single-use verification tokens before a real user ever clicked, and
work identically across devices (verify on your phone while signing up on
a laptop). Codes share the same `EmailVerificationToken`/
`PasswordResetToken` tables (shape unchanged) with a new `attempts` column
(5-try lockout) and a 10-minute expiry; `login` now hard-fails with
`403 email_not_verified` for any unverified email/password account (Google
OAuth accounts are unaffected, since Google's own `email_verified` claim
sets it immediately).

**Tag-based join requests with Owner approval, plus a multi-house
`/dashboard` hub** (ADR 0040): a new `HouseJoinRequest` model lets a user
request to join a house by its public handle (rather than needing the
exact invite code), notifying the house's Owners; membership is only
granted once an Owner approves via a new `activateHouse`-adjacent
`respondToJoinRequest` endpoint - invite-code joining and targeted
`HouseInvitation` links (ADR 0036) are untouched and coexist as separate
paths onto the same `addMembership` helper. The old one-shot
`houses/new` onboarding page was deleted outright in favor of
`/dashboard`, which lists every house a user belongs to as a switchable
card and gives Owners a "Join requests" inbox to approve/reject pending
requests inline.

**Storyboard gained a real drawing/editing canvas, and a new standalone
Scripts module shipped alongside it** (ADR 0041): a plain HTML5
`<canvas>` freehand-drawing dialog flattens strokes to a base64 PNG on
save (no vector/undo history, matching how a shot's static reference
image already worked) - no new drawing dependency was pulled in. A new
`Script` model (house-scoped, optional `projectId`, one plain-text
`content` field) backs an entirely separate Scripts module with its own
list/detail pages and nav entry, cross-linked one-directionally and
read-only from a Storyboard board via an optional `Board.scriptId`. A
follow-up commit added a client-side screenplay formatting toolbar (Scene
Heading/Action/Character/Dialogue/Parenthetical/Transition) that applies
plain-text indentation/case conventions to the current line - the stored
content stays a plain string, not a structured document.

**Automatic Prisma migration on every push to `main`, after a same-day
reverted attempt at migrating on server boot** (ADR 0042): a missed
manual migration once broke production auth entirely
(`users.username does not exist`), so boot-time `prisma migrate deploy`
was tried first inside `server.js` - but this Hostinger plan restricts
subprocess spawning, and Prisma's CLI internally spawns a native
schema-engine binary that failed with `EAGAIN` no matter how it was
invoked (`npx`, a resolved binary path, or otherwise). After confirming
that dead end, the boot-time step was fully reverted the same day in
favor of `.github/workflows/migrate.yml`, a GitHub Actions job (no
subprocess restriction on its own runner) that runs `prisma migrate
deploy` against production on every push to `main`, decoupled entirely
from the running app process.

**In-memory rate limiting and security headers added to auth and
join-request endpoints** (ADR 0043): a single-process, in-memory
fixed-window counter (`apps/web/src/server/rate-limit.ts`, no Redis, no
database table - this app runs as one Node process on one Hostinger
instance) keyed by client IP plus the specific identifier being protected
(e.g. `login:${ip}:${email}`), now guards login, signup, and
join-requests against brute-force/spam abuse. It does not protect against
distributed sources or survive a process restart/redeploy - a future
horizontal-scaling move would need a shared store instead. Four baseline
security response headers (`X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Strict-Transport-Security`) were added in the same
pass.

**Chat rebuilt on Supabase Realtime** (ADR 0044): instant message
delivery, typing indicators, presence with a "last seen" fallback, live
read receipts/unread counts, a live-reordering sidebar, message
pagination, and an offline send-queue with auto-retry. Chosen over a
custom WebSocket server specifically because this app runs as one managed
Node process behind Hostinger's own reverse proxy, whose WebSocket-
upgrade passthrough is undocumented and unverified - connecting the
browser directly to Supabase (already hosting Postgres/file storage)
sidesteps that risk entirely. New `ConversationRead` model and
`User.lastSeenAt` column (migration
`20260714200000_conversation_reads_and_presence`) back real unread counts
and presence, both previously hardcoded/absent. Requires
`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` to actually go
live - degrades to a "Reconnecting…" badge (no crash) without them.

To run locally now: `docker compose up -d postgres`, then start the
single `web` dev server (`.claude/launch.json` has just the one
configuration now). `apps/web/.env` and root `.env.example` document the
required variables (merged - database, JWT, and Google OAuth vars all
live in `apps/web`'s own env now, no separate `apps/api/.env`).
For production, see `docs/deployment.md` and ADR 0037.

## Required Startup Flow

Before writing application code:

1. Read this file.
2. Read `PROJECT_SPEC.md`.
3. Read `AI_RULES.md`.
4. Read `PRODUCT_PRINCIPLES.md`.
5. Read `docs/context.md`.
6. Read `docs/progress.md`.
7. Read `docs/roadmap.md`.
8. Read `docs/decisions.md`.
9. Read `docs/features.md`.
10. Read the latest ADRs in `docs/adr`.

Then summarize the current architecture, affected files, database impact, API
impact, security impact, performance impact, and scalability impact before
implementation.

For frontend features, also define the API contract, mock service, loading
state, empty state, error state, and success state before completion.
