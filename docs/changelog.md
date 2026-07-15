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
