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
