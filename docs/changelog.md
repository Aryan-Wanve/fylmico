# Changelog

All meaningful changes to Fylmico should be documented in this file.

## 0.0.1 - 2026-06-29

Summary:

- Created the documentation-first project foundation.
- Added the project specification as the canonical product brief.
- Added project memory, roadmap, progress, features, architecture, database,
  API, deployment, coding standards, decisions, and ADR documentation files.
- Added master index, AI rules, product principles, tech stack, glossary,
  session, authentication, and permissions documentation.
- Added baseline ADRs for monorepo, database, authentication, permissions,
  realtime, and deployment.
- Added Sprint 0 npm workspace foundation with `apps/web` Next.js App Router
  app.
- Added root Hostinger startup entry for Next.js standalone output.
- Added postbuild static asset sync for standalone runtime.
- Added Hostinger deployment documentation and 403 checklist.
- Added `npm run build:hostinger` to generate a static publish directory at
  `dist/hostinger` for Hostinger Git deployments.

Breaking changes:

- None.

Migration notes:

- None.

## 0.2.0 - 2026-07-07

Summary:

- Adopted Tailwind v4 + shadcn/ui as the project's actual design system
  (previously specified in docs but not used in code).
- Rebuilt the login screen, app shell (sidebar/topbar), home dashboard, and
  no-house onboarding flow as real Next.js routes under an `(app)` route
  group, replacing the single-component `BaseWorkspace` view-switcher.
- Removed `base-workspace.tsx`, the old root `page.tsx`, and ~1900 lines of
  dead hand-written CSS.
- Removed accidentally-committed tool cache (`.codex-remote-attachments/`)
  and dead login icon assets.
- Merged `frontend` into `main`, which had not been updated since PR #1.

Note: intervening feature work between 0.0.1 and this entry (the initial
mock-backed login/dashboard/houses UI built directly on hand-written CSS)
was not logged here at the time; see `docs/session.md` sessions 6-9 for that
history.

Breaking changes:

- The frontend no longer uses the hand-written CSS classes from earlier
  sessions (`.login-*`, `.app-shell*`, `.dashboard-*`, etc.) or the
  `BaseWorkspace` component; any external references to them are stale.

Migration notes:

- None. Mock service contracts (`services/base-workspace.service.ts`,
  `types/base.ts`) are unchanged, so no data-shape migration is needed.

## 0.3.0 - 2026-07-07

Summary:

- Added the Calendar page (`/calendar`) as a real Next.js route,
  pixel-matched to a provided design reference: month grid with colored
  event pills and a legend, header with date navigation/month-year
  jump/Month-Week-Day tabs/category filters, and a right rail with a mini
  calendar, calendar-source checklist, and an upcoming-events panel.
- Week and Day tabs show a "coming soon" empty state; only Month is fully
  built out.
- Turned the sidebar's Calendar entry from a non-navigating placeholder
  into a real link.
- Added `lib/calendar-utils.ts` (month-grid and date helpers) and
  `components/calendar/calendar-data.ts` (mock events, categories, and
  calendar sources), following the existing colocated-mock-data convention.
- Made "New Event" a working create flow: a Popover form (title, date,
  time, location, event-type, and calendar) that appends to page-local
  event state, expands active filters so the new event is never hidden,
  and jumps the grid/mini calendar to the new event's date.

Breaking changes:

- None.

Migration notes:

- None.

## 0.4.0 - 2026-07-08

Summary:

- Added the Analytics page (`/analytics`) as a real Next.js route,
  pixel-matched to a provided design reference: 5 stat cards, a
  multi-series project-progress line/area chart, a task-status donut, a
  weekly time-logged mini chart, a time-distribution donut, an activity
  heatmap, top-active-projects/top-contributors/team-workload panels, and
  an insight banner.
- Added hand-rolled SVG chart primitives (`multi-line-chart.tsx`,
  `donut-chart.tsx`, `mini-area-chart.tsx`, `activity-heatmap.tsx`) under
  `components/analytics/` - no charting library was introduced.
- Turned the sidebar's Analytics entry from a non-navigating placeholder
  into a real link.
- Note: Projects, Tasks, Crews, Files, Storyboard, Messages, and Settings
  also gained real routes during this same period via work done outside
  this changelog entry's session; see their own commits for details.

Breaking changes:

- None.

Migration notes:

- None.

## 0.5.0 - 2026-07-08

Summary:

- Added the Bookings page (`/bookings`) as a real Next.js route,
  pixel-matched to a provided design reference: 4 stat cards, a
  status/scope tabs bar filtering a bookings table, and a right rail with
  a Bookings-by-Type donut, an Upcoming Bookings list, and a mini Booking
  Calendar.
- Reused generic UI across feature folders for the first time:
  Calendar's `MiniCalendar` and Analytics's `DonutChart`, both directly,
  with no changes needed.
- Made `dashboard/stat-card.tsx`'s `sparklinePoints` prop optional
  (backward-compatible).
- Turned the sidebar's Bookings entry from a non-navigating placeholder
  into a real link - the last remaining placeholder nav item.

Breaking changes:

- None.

Migration notes:

- None.

## 0.6.0 - 2026-07-12

Summary:

- Added new backend domains and wired Dashboard, Projects, Crews,
  Settings, Bookings, Storyboard, and Files to the real API, replacing
  the last remaining local mock data in the app: new `Resource`/
  `Booking`, `Board`/`Shot`, and `FileEntry` Prisma models, plus
  profile/password/session/workspace endpoints and a dashboard-summary
  endpoint.
- Files was first wired to Supabase Storage, then replaced later the
  same day with per-user Google Drive-backed storage (see ADR 0038).
- Added a real dark mode toggle for the whole app, following a
  visual-audit pass across every page.
- Added real global search, a working Create menu, and an honest
  sidebar nav (no more decorative links).
- Added real email delivery (a new mailer abstraction) wired to signup
  verification and password reset.
- Added shareable house join links, user profile username + avatar
  upload, crew role tags + task reassignment, and persisted notification
  preferences + an editable crew department.
- Storyboard gained `Character`/`StoryLocation` models and, later the
  same day, a real drawing/editing canvas plus a new Scripts
  (screenplay) module (see ADR 0041).
- Added real Files/Tasks/Events tab wiring for Messages channels; a real
  multi-field New Booking form; route transitions and dashboard entrance
  animations; a styled, dark-mode-aware dialog component replacing
  `window.prompt`.
- Fixed: Google login callback redirecting to a bogus host in
  production; house lookups batched instead of one query per house;
  friendly device labels for Account Sessions.

Breaking changes:

- Files now store on Google Drive per-user instead of Supabase Storage;
  files uploaded earlier the same day under Supabase Storage were not
  migrated.

Migration notes:

- New Prisma models/tables: `Resource`, `Booking`, `Board`, `Shot`,
  `FileEntry`, `Character`, `StoryLocation`, `Script`, `DriveConnection`
  - run `prisma migrate deploy`.

## 0.7.0 - 2026-07-13

Summary:

- Fixed mobile/tablet responsive overflow across every page.
- Fixed Drive folder mirroring so app folders (not just individual
  files) mirror into Google Drive.
- Added upload progress UI with transfer speed and a bottom-right toast.
- Added automatic Prisma migration on server boot, then patched a crash-
  on-failure bug, then fully reverted the whole approach the same day
  after confirming it couldn't work on this Hostinger plan (see ADR 0042
  and the CI-based fix in 0.8.0 below).

Breaking changes:

- None.

Migration notes:

- None.

## 0.8.0 - 2026-07-14

Summary:

- Added `.github/workflows/migrate.yml`, a CI workflow that runs
  `prisma migrate deploy` against production automatically on every push
  to `main`, replacing the reverted migrate-on-boot approach (see ADR
  0042).
- Reworked email verification from link-tokens to 6-digit OTP codes;
  login is now blocked until a signup is OTP-verified; password reset
  also uses an OTP code (see ADR 0039).
- Added real Appearance settings (accent color, density, theme
  transition).
- Added a project detail page (edit, tasks, calendar, comments tabs).
- Added a real approval workflow for Bookings; a real date-range filter
  and CSV export for Analytics.
- Added a crew member profile page; a drag-and-drop Kanban board view
  for Tasks; real Calendar week and day views (previously "coming
  soon").
- Added real threaded replies and emoji reactions for Messages; a
  screenplay formatting toolbar for Scripts; a file preview modal for
  images/PDFs/video/audio.
- Added new Call Sheets and Announcements modules.
- Added notification triggers on task/project comments, invite
  acceptance, and bookings; notification preferences now actually gate
  sending; redesigned the notification bell (per-type icons, unread
  count, polling).
- Added a public marketing landing page at `/` (two passes: a dark
  theme + scroll animations redesign, then a hero rebuild as a real app
  mockup with a trusted-by row and multi-column footer); moved the
  authenticated dashboard from `/` to `/home`.
- Restricted removing a house member to Owners; invite links now
  redirect back to the invite/join page after login or signup; Crews'
  invite button generates a real per-invite link.
- Removed the fake "Upgrade to Pro" sidebar card (was never functional).
- Fixed: Scripts page two-column layout not fitting mobile widths.
- Added Hostinger env var docs for `RESEND_API_KEY`/`MAIL_FROM`.

Breaking changes:

- Email verification links (tokens) no longer work; verification and
  password reset now use 6-digit OTP codes instead. Unverified users can
  no longer log in.

Migration notes:

- New `otp_codes`-related columns on the verification/reset token tables
  (migration `20260714120000_otp_codes`), plus new Call Sheets/
  Announcements tables - run `prisma migrate deploy` (now automatic via
  `.github/workflows/migrate.yml`).

## 0.9.0 - 2026-07-15

Summary:

- Added a tag-based house join-request flow: a new `HouseJoinRequest`
  model, owner approve/reject endpoints, and a house-switch activate
  endpoint (see ADR 0040).
- Added a multi-house `/dashboard` hub, replacing the old `/houses/new`
  onboarding flow.
- Fixed session persistence: sessions now persist in `localStorage`
  (survive 30 days) instead of `sessionStorage` (previously cleared per
  browser tab).
- Added in-memory rate limiting (no Redis - single-process Hostinger
  deployment) and security headers to auth and join-request endpoints
  (see ADR 0043).

Breaking changes:

- The `/houses/new` onboarding route was removed; users with no active
  house now land on `/dashboard` instead.

Migration notes:

- New `house_join_requests` table (migration
  `20260714150000_house_join_requests`) - run `prisma migrate deploy`.

## 0.10.0 - 2026-07-15

Summary:

- Rebuilt Messages/chat on Supabase Realtime (Broadcast + Presence):
  instant message delivery, typing indicators, online/offline presence
  with a "last seen" fallback, live read receipts and unread counts, a
  live-reordering sidebar, message-list pagination, and an offline
  send-queue with auto-retry (see ADR 0044).
- New `ConversationRead` model and `User.lastSeenAt` column back real
  unread counts and presence (both were previously hardcoded/absent).
- `POST /api/v1/chat/rooms/:roomId/messages` now returns just the sent
  message, not the whole room; added a paginated `GET` on the same path,
  `POST /api/v1/chat/rooms/:roomId/read`, and `POST
/api/v1/auth/me/heartbeat`.

Breaking changes:

- None to existing endpoints beyond the send-message response shape
  change noted above (frontend updated to match in the same change).

Migration notes:

- New `conversation_reads` table + `users.last_seen_at` column
  (migration `20260714200000_conversation_reads_and_presence`) - run
  `prisma migrate deploy`.
- Requires new env vars to actually enable live delivery:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser-
  side, safe to expose - see `docs/hostinger-deployment.md`). Without
  them the feature degrades gracefully (a "Reconnecting…" badge, no
  live push) rather than breaking.

## 0.10.1 - 2026-07-15

Summary:

- Fixed: server-side realtime broadcasts (new messages, reactions, read
  receipts) silently no-op'd with zero log output when
  `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` weren't configured -
  undiagnosable from Hostinger Runtime Logs. Now logs a one-time warning.
- Added message editing: author-only, within 10 minutes of sending
  (`PATCH /api/v1/messages/:messageId`), enforced server-side. New
  `Message.editedAt` column; broadcasts a `message:edit` event so other
  open clients see the edit live; "(edited)" label in the UI.
- Added a real `delivered` read-receipt tick (sending -> sent ->
  delivered -> read), via an ephemeral client-to-client acknowledgment -
  no schema change, see ADR 0044's Amendment section.

Breaking changes:

- None.

Migration notes:

- New nullable `messages.edited_at` column (migration
  `20260715120000_message_edited_at`) - run `prisma migrate deploy`.

## 0.11.0 - 2026-07-15

Summary:

- Redesigned Google Drive integration for Houses (ADR 0045, supersedes
  ADR 0038): one shared Drive connection per house, connected only by the
  Owner, instead of one connection per uploader.
- Fylmico now automatically creates and maintains the entire folder
  structure: Clients/Resources/Portfolio (+ fixed subfolders), an
  Owner-only Sensitive tree (Finance, Quotations, Contracts, HR, Internal,
  Employee Work), per-client and per-project folders (with the project's
  6 fixed subfolders), and a per-member Employee Work folder.
- Uploads get a "which client/project?" destination picker with a Raw
  Footage/Asset/Deliverable/Project File category; Raw Footage lazily
  creates a dated subfolder per upload day.
- A Deliverable upload can be added to the House Portfolio in one step
  (copies a reference, not a re-upload).
- Every upload best-effort mirrors into the uploader's Employee Work
  subfolder for management visibility.
- `DriveFolderLink` (the old per-uploader folder-mirroring cache) is
  removed - a single house Drive means every `FileEntry` maps to exactly
  one Drive object.

Breaking changes:

- Existing per-user `DriveConnection` rows were truncated in the
  migration (no valid mapping to the new per-house shape) - every house
  must reconnect Google Drive. Files uploaded under the old per-user model
  become unreachable through the app (bytes still exist in whichever
  user's Drive they were uploaded to).
- `GET /api/v1/drive/connect-url`, `GET /api/v1/drive/status`,
  `DELETE /api/v1/drive/disconnect` moved to
  `/api/v1/houses/:houseId/drive/*` and are now Owner-only for
  connect/disconnect. `GET /api/v1/drive/callback` is unchanged (the
  registered Google OAuth redirect URI).

Migration notes:

- `drive_connections` reshaped from per-user to per-house;
  `drive_folder_links` dropped; new nullable `file_entries.drive_key`
  (unique per house) and `file_entries.sensitive` columns (migration
  `20260715150000_house_drive_connection`) - run `prisma migrate deploy`.

## 0.12.0 - 2026-07-15

Summary:

- Added a "Choose House Type" step to house creation, before House
  Information: Freelancer/Solo, Agency/Production House, College Club/
  Group, Hobbyists, or Custom (ADR 0046).
- The selected type sets default enabled modules for the house (e.g.
  Freelancer excludes Crews/Messages/Call Sheets/Announcements) -
  editable anytime afterward from House Settings.
- Sidebar navigation now reflects a house's enabled modules; Home and
  Settings are always visible and can't be turned off.
- Added an Owner-only "Modules" toggle list to House Settings.

Breaking changes:

- None to existing endpoints; `POST /api/v1/houses` now requires a new
  `houseType` field in the request body.

Migration notes:

- New `organizations.type` (default `"custom"`) and
  `organizations.enabled_modules` (`String[]`, backfilled to every module
  for existing houses) columns (migration
  `20260715180000_house_type_modules`) - run `prisma migrate deploy`.

## 0.13.0 - 2026-07-15

Summary:

- Rebuilt Tasks from a to-do list into a full production workflow
  (Phase 1, ADR 0047): multi-assignee with responsibilities, subtasks,
  checklists with auto-computed progress, dependencies ("blocked by"),
  time tracking (start/stop timer + work log + estimate-vs-actual), and
  an activity log powering a merged activity/comment timeline with
  `@mention` support.
- 20 task types, 6 statuses (added Review/Changes Requested/Archived), 4
  priorities (added Urgent), real due/start date-times, estimated
  duration, and recurrence (auto-creates the next occurrence on
  completion).
- New rich creation dialog and a full slide-over task detail panel,
  replacing the old single `window.prompt()` flow.
- Task attachments now go through the existing House Drive (a task can
  have files uploaded directly or linked from elsewhere in Drive).
- List/Kanban (6 columns)/Table/My-Tasks views, bulk multi-select with a
  status/priority/delete action bar, indicator badges (overdue/blocked/
  high-priority/waiting-for-review/etc.), and expanded filters
  (status/type/assignee) and group-by (type/client) options.
- New notification triggers: task status changes, `@mentions`, review
  requests, and completion.

Breaking changes:

- `Task.assigneeId`/`Task.role`/`Task.project` (freeform string) removed.
  `POST`/`PATCH /api/v1/tasks` no longer accept `assigneeId`/`project`;
  use `assignees: [{ userId, responsibility? }]` and `projectId` instead.
  `Task.status` no longer accepts `"done"`/`"on-hold"` - use `"completed"`/
  `"todo"`. `Task.dueDate`/`startDate` are now ISO datetimes, not
  date-only strings.
- `GET`/`POST /api/v1/chat/rooms/:roomId/tasks` now return the lighter
  `ChannelTaskItem` shape instead of the full `Task` shape.

Migration notes:

- Migration `20260715200000_tasks_production_workflow` - adds every new
  `tasks` column and 5 new tables (`task_assignees`,
  `task_checklist_items`, `task_dependencies`, `task_activity`,
  `task_time_entries`), adds `file_entries.task_id`, backfills
  `task_assignees` from the dropped `assignee_id`/`role` columns, and
  remaps existing `status` values (`done`→`completed`, `on-hold`→`todo`)
  before dropping the old columns - run `prisma migrate deploy`.

## 0.14.0 - 2026-07-16

Summary:

- Joining a house (invite code, invite link, or an approved join
  request) now creates a **pending** membership instead of instant
  access - the joiner sees their house on the Dashboard immediately but
  is shown a full-screen Waiting Screen (no sidebar, no data access
  anywhere) until an admin assigns them a role (ADR 0048).
- New Crews "Pending Members" panel with a 3-step Assign Role wizard
  (Position → Team → Permissions, with Owner/Admin/Producer/Editor/
  Client/Custom presets) plus Reject and Ban actions.
- New centralized, modular permission system (18 permission keys) -
  `Role.permissions`, shared by everyone holding that Position in a
  house - the foundation future modules (Invoices, CRM, etc.) will
  extend.
- Simplified house creation to 2 steps (Name → Tag), dropped the
  Description field, and added a live handle-availability check.
- The Dashboard route now always hides the app sidebar (previously
  showed a "compact" version) and shows a "Waiting for Approval" badge
  on a pending house's card; the waiting screen auto-transitions into
  the workspace (with a welcome toast) within seconds of a role being
  assigned, no manual refresh needed.

Breaking changes:

- `OrganizationMembership.roleId` is nullable - `POST /api/v1/houses/join`
  and an approved `PATCH /api/v1/houses/:houseId/join-requests/:requestId`
  no longer grant an active "Member" role; the new membership is pending
  until an admin calls the new Assign Role endpoint. `House.members` now
  only lists active (role-assigned) members; a new `House.myRole` field
  (nullable) and `House.pendingMembers` array were added to the response.
- `POST /api/v1/houses` handle validation tightened to lowercase letters
  and digits only, 3-20 characters (previously also allowed hyphens);
  existing hyphenated handles are unaffected.

Migration notes:

- Migration `20260716090000_pending_members_permissions` - adds
  `roles.permissions` (`text[]`, backfilled per existing role name) and
  `organizations.banned_user_ids` (`text[]`), and drops the `NOT NULL`
  constraint on `organization_memberships.role_id` - run
  `prisma migrate deploy`.

## 0.15.0 - 2026-07-16

Summary:

- Dashboard: Favorite/Pin/Archive toggles on each house card, drag-reorder,
  a live search box, and Storage/Last Activity badges (batched aggregates,
  no new per-house queries). Pinned houses sort first, then favorites,
  then custom order (ADR 0049).
- Dashboard: clicking a notification from a house other than the active
  one now switches houses automatically before navigating to the relevant
  page (`Notification.organizationId` + a type→destination lookup table).
- Dashboard: each house now remembers the last page you were on and
  returns you there instead of always landing on Home.
- Tasks: Calendar now shows a "Task Deadlines" source with every task's
  due date as an event.
- Tasks: Save any task as a reusable Template and create new tasks from
  it via a new "Templates" popover on the Tasks page.
- Tasks: press `n` anywhere on the Tasks page to open the New Task dialog.
- Analytics: new "Estimate vs Actual" panel comparing `estimatedMinutes`
  against logged `TaskTimeEntry` duration.
- Fixed a bug where Analytics' "Tasks Completed" stat was always 0 -
  it still checked the old `status === "done"` value from before the
  Tasks rework (ADR 0047) instead of `"completed"`.

Breaking changes:

- None.

Migration notes:

- Migration `20260716120000_dashboard_favorites_notifications_org` - adds
  `organization_memberships.order`/`favorited_at`/`pinned_at`/
  `archived_at` and `notifications.organization_id` (FK, `SetNull`).
- Migration `20260716140000_task_templates` - adds `tasks.is_template`
  (default `false`).

## 0.16.0 - 2026-07-16

Summary:

- Home page rebuilt as a "HUD": a dominant Focus Card for your current
  task with a live start/pause timer, checklist and attachment counts,
  and a Submit Draft upload - all reusing task-timer/attachment/checklist
  code that already existed but wasn't wired into any UI before now.
- New "My Tasks" tabs (Active/Today/Upcoming/Review/Blocked/Done),
  Today's Schedule, Upcoming Deadlines, a Notifications preview, and a
  Team Online panel.
- New Personal Stats (Work Streak, Working Hours, Completed Tasks,
  On-Time Rate) from a new personal analytics endpoint.
- New live clock + weather (browser location, no account data used) in
  the greeting header.
- New Focus Mode toggle in the sidebar that hides distractions
  (sidebar/topbar) with a one-click exit.

Breaking changes:

- None.

Migration notes:

- None - this release adds one new read-only endpoint
  (`GET /api/v1/houses/:houseId/analytics/me`) and reuses existing
  tables only.
- Run `prisma migrate deploy` for both.

## 0.17.0 - 2026-07-16

Summary:

- Projects Module Overhaul, Phase 1 of 5: lays the foundation for making
  Project the app's single source of truth.
- `Client` gains a real company profile (logo, phone, address, GST,
  notes) plus archive/delete and a stats endpoint (active/completed
  projects, storage used).
- `Project` gains a `priority` field (reusing Tasks' own vocabulary) and
  a stats endpoint (task counts, team size, files, storage, time logged,
  completion %).
- New Clients management page (`/projects/clients`).
- Redesigned project cards: client name, priority/stage badges, task/
  storage/online-member stats, "Due in N days".
- Project detail page's Team section now also includes everyone assigned
  through the project's tasks, not just the manually-added list.

Breaking changes:

- None.

Migration notes:

- Adds six columns to `clients` (`logo_url`, `phone`, `address`, `gst`,
  `notes`, `status`) and one to `projects` (`priority`) - all with
  defaults, no backfill required. Run `prisma migrate deploy`.

## 0.18.0 - 2026-07-16

Summary:

- Projects Module Overhaul, Phase 2 of 5: new `Shoot` entity (a
  scheduled production day, distinct from Storyboard's frame-level
  `Board`/`Shot`) with a 9-status crew workflow.
- Scheduling a shoot auto-creates a calendar event and a task, with the
  crew as its assignees.
- Home's Focus Card now switches into a "videographer HUD" for shoot
  tasks: Location (map link), Call Time, Equipment, Crew, Notes, and
  status buttons (Reached Location, Start Shoot, Finish, Finish +
  Upload, Mark Data Uploaded, Mark Ready For Editing, Archive, Cancel).
- New "Shoots" tab + "Schedule Shoot" dialog on the project detail page.

Breaking changes:

- None.

Migration notes:

- Adds a new `shoots` table and a `shoot_id` column on `tasks`. Run
  `prisma migrate deploy`.

## 0.19.0 - 2026-07-16

Summary:

- Projects Module Overhaul, Phase 3 of 5: real multi-file upload into a
  per-shoot Drive folder, replacing Phase 2's status-only placeholder.
- Finishing and uploading a shoot's footage now automatically creates an
  Editing task pre-attached to that footage and the project's Assets
  folder.
- The New Task dialog's raw-footage picker can now target a specific
  shoot's footage instead of just a date-based Raw Data folder.

Breaking changes:

- None.

Migration notes:

- None - no schema changes this release.

## 0.20.0 - 2026-07-16

Summary:

- Projects Module Overhaul, Phase 4 of 5: versioned Deliverables -
  submitting a draft now creates a new version row instead of
  overwriting the previous one, moving through
  draft/review/revision/approved/final.
- Approving a deliverable auto-creates a Delivery task and bumps the
  project's progress.
- New Deliverables tab on the project detail page with version history,
  approve/request-revision/mark-final actions, and inline comments.

Breaking changes:

- None.

Migration notes:

- Adds a new `deliverables` table. Run `prisma migrate deploy`.

## 0.21.0 - 2026-07-16

Summary:

- Projects Module Overhaul, Phase 5 of 5 (**final phase**): every
  project now gets its own dedicated chat, a chronological activity
  Timeline, and a per-project Analytics dashboard.
- Project chat supports Pinned Notes and reuses the existing realtime
  chat infrastructure end-to-end.
- Timeline unions project/task/shoot/deliverable events into one feed;
  Analytics surfaces shoots, editing/team hours, storage, deliverables,
  review time, revisions, and completion % at a glance.
- This completes the 5-phase Projects Module Overhaul - Project is now
  the connective layer every major feature (Tasks, Drive, Shoots,
  Deliverables, Chat, Analytics) automatically ties back to.

Breaking changes:

- None.

Migration notes:

- Adds a nullable, unique `project_id` column to `conversations` and a
  `pinned` column to `messages`. Run `prisma migrate deploy`.

## 0.22.0 - 2026-07-17

Summary:

- New cross-project **Review** page: search/filter/sort every submitted
  draft across all projects, with bulk Approve/Request Changes/Reassign.
- Approving now completes the linked task, files the deliverable into
  the project's Deliveries folder, and recomputes real project progress
  (replacing the earlier flat +10 bump).
- Requesting changes moves the task back to In Progress, attaches the
  reviewer's comment to it, and notifies the editor; the previous
  version stays as history.
- Reassigning a submission transfers the task to a new editor while
  preserving every version, comment, and activity entry.
- New dashboard metrics: Waiting for Review, Changes Requested, Approved
  Today, Overdue Reviews.
- Comments can now carry an optional video timestamp; draft submissions
  can include notes and export settings (resolution/codec/frame rate).
- Editor's Work and Client's Work are now surfaced on the crew profile
  page and project Deliverables tab respectively.

Breaking changes:

- None.

Migration notes:

- Adds nullable `timestamp_seconds` to `comments` and nullable
  `export_settings` to `deliverables`. Run `prisma migrate deploy`.
