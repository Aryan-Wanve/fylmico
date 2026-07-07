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
