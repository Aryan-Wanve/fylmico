# Roadmap

## Standing Development Rule

- Build frontend only.
- Define API contracts and mock services whenever backend functionality is
  needed.
- Never implement backend functionality in this workstream.

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
- Remaining nav destinations (Projects, Tasks, Crews, Files, Storyboard,
  Messages, Bookings, Analytics, Settings) are scaffolded as non-navigating
  sidebar entries only; no routes exist for them yet.

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
  and upcoming-events panel in the right rail. Week and Day tabs show a
  "coming soon" state; no other collaboration-core UI (chat, notifications,
  tasks, kanban) has started.

### Phase 6: Frontend Creative Production Modules

Status: Planned

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

### Phase 7: Frontend Review, Delivery, and Analytics

Status: Planned

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
