# Sessions

Append every development session to this file.

## Session 1

Date: 2026-06-29

Goal:

- Create the initial documentation-first foundation before application code.

Completed work:

- Created core project documentation.
- Added project specification.
- Added project memory, progress, roadmap, features, changelog, architecture,
  database, API, deployment, coding standards, decisions, and ADR directory.

Problems encountered:

- None.

Decisions made:

- No application code should be written until Phase 1 planning is complete.

Next session objective:

- Expand the bootstrap documentation, create baseline ADRs, and finalize the
  architecture, database, authentication, permissions, deployment, and coding
  standards planning baseline.

## Session 2

Date: 2026-06-29

Goal:

- Apply the master bootstrap prompt and complete the foundation planning
  documents.

Completed work:

- Added permanent master index, AI rules, product principles, tech stack,
  glossary, session, authentication, and permissions documents.
- Created initial ADRs for monorepo, database, authentication, permissions,
  realtime, and deployment decisions.
- Strengthened architecture, database, API, deployment, coding standards,
  roadmap, decisions, progress, and context documentation.

Problems encountered:

- None.

Decisions made:

- Establish a monorepo with `apps/web`, `apps/api`, and shared `packages`.
- Use PostgreSQL with Prisma.
- Use JWT access tokens with rotated refresh tokens.
- Use hybrid RBAC and policy-based permissions.
- Use Socket.IO for realtime collaboration.
- Use Docker, Nginx, GitHub, and Hostinger VPS for the initial deployment path.

Next session objective:

- Scaffold the monorepo only after confirming the Phase 1 baseline is approved.

## Session 3

Date: 2026-06-29

Goal:

- Execute Sprint 0 foundation and audit Hostinger Node.js deployment after a
  successful build returned HTTP 403.

Completed work:

- Created npm workspace foundation with root scripts and `apps/web` Next.js App
  Router app.
- Configured TypeScript, TailwindCSS, ESLint, Prettier, Husky, lint-staged,
  Docker, GitHub Actions CI, environment examples, and git ignores.
- Added root `server.js` as the Hostinger startup entry for the generated
  standalone Next.js server.
- Added postbuild standalone static asset sync.
- Added Hostinger deployment documentation and updated decisions.
- Added `npm run build:hostinger` static export for Hostinger Git deployments
  that use a publish directory.

Problems encountered:

- Latest `lint-staged` required a newer Node version than the local baseline.
- ESLint 10 was not compatible with the React plugin bundled by Next 16.2.9.
- Local sandbox blocked Next build worker spawning, but the same build passed
  outside the sandbox.
- Hostinger deployment returned HTTP 403 after a successful build, indicating a
  deployment routing/startup mismatch rather than a Next.js compile failure.
- The repeated 403 indicates Hostinger is likely serving a static directory
  without an `index.html` or using the wrong publish directory.

Decisions made:

- Use npm workspaces from the repository root.
- Deploy Hostinger from the repository root, not `apps/web`.
- Use root `server.js` as the production startup file.
- Use `dist/hostinger` as the publish directory when Hostinger is configured as
  a static Git deployment.
- Keep Docker files for container/VPS deployment; they do not control
  Hostinger Node.js Git deployment.

Next session objective:

- Redeploy using either static Git mode (`npm run build:hostinger`,
  `dist/hostinger`) or Node.js mode (`server.js`) and confirm HTTP 200 before
  beginning Sprint 1.

## Session 4

Date: 2026-07-04

Goal:

- Complete Sprint 1 system architecture documentation without implementing
  application features.

Completed work:

- Expanded `docs/architecture.md` into the complete technical architecture
  baseline.
- Documented system, frontend, backend, database, API, authentication,
  authorization, organization hierarchy, project hierarchy, file storage,
  realtime, AI integration, mobile compatibility, deployment, and scaling
  architecture.
- Added ADRs 0008 through 0016.
- Updated decisions, context, roadmap, progress, ADR index, and master index.

Problems encountered:

- None.

Decisions made:

- Keep Sprint 1 documentation-only.
- Do not implement feature code, migrations, API endpoints, or placeholder
  packages during Sprint 1.

Next session objective:

- Wait for explicit direction before beginning implementation.

## Session 5

Date: 2026-07-04

Goal:

- Record the new two-developer development direction and frontend-only
  workstream rules.

Completed work:

- Updated AI rules, architecture, API, context, roadmap, progress, decisions,
  ADR index, and master index.
- Added ADR 0017 for frontend/backend independence.
- Documented that this workstream focuses only on frontend development.
- Documented that the backend is treated as a black box owned by another
  developer.
- Documented the API-contract and mock-service workflow for frontend features.

Problems encountered:

- None.

Decisions made:

- Frontend must never depend on Prisma, SQL, database logic, backend business
  logic, backend validation implementations, NestJS internals, storage
  internals, queues, or backend infrastructure.
- Frontend communicates only through documented public API contracts.
- Frontend features must use realistic mock services until backend APIs exist.
- Backend implementation must not be added in this workstream unless the user
  explicitly changes direction.

Next session objective:

- Continue with frontend-only implementation. For each backend dependency,
  define the API contract, create a mock service, and build the UI against that
  service abstraction.

## Session 6

Date: 2026-07-04

Goal:

- Build the first frontend base scope with login, houses, roles, task
  scheduling, task assignment, and chat rooms.

Completed work:

- Replaced the Sprint 0 landing shell with a mock-backed frontend workspace.
- Added a login page backed by a mock auth service.
- Added house creation, house joining, and house switching UI.
- Added house roles inspired by Discord-style creative production roles such as
  editor, videographer, and photographer.
- Added task scheduling and task assignment UI.
- Added chat rooms and mock message sending.
- Added frontend-safe types and a base workspace mock service.
- Documented public API contracts for login, workspace snapshot, houses, tasks,
  and chat messages.

Problems encountered:

- The sandboxed Next.js production build compiled successfully but failed when
  spawning a build worker with `spawn EPERM`.
- The same production build passed outside the sandbox with the approved
  PowerShell build command.

Decisions made:

- Keep all base data access behind frontend service abstractions.
- Use realistic mock data until the backend team implements the documented
  public API contracts.
- Do not implement backend logic, Prisma, SQL, migrations, or server endpoints.

Next session objective:

- Refine the frontend base UX, extract reusable design-system primitives when
  duplication appears, and choose the frontend state/server-state strategy.

## Session 7

Date: 2026-07-04

Goal:

- Redesign the login page to match the provided Fylmico visual reference.

Completed work:

- Rebuilt the logged-out screen as a light cinematic split login page.
- Added brand mark, left-side production headline, feature cards, quote panel,
  right-side auth card, login/signup tabs, forgot-password link, social login
  buttons, and security note.
- Generated and added a project-local cinematic production background image at
  `apps/web/public/images/login-production-set.png`.
- Preserved the existing mock login service behavior and workspace entry flow.

Problems encountered:

- The first pass was too tall for a 1280x720 viewport and had visual overlap
  between the security note and social buttons.
- Tightened spacing and adjusted supporting panels to remove visible overlap.

Decisions made:

- Use a generated project-local background asset instead of embedding the
  provided screenshot as a page background.
- Keep the login redesign frontend-only with no backend implementation changes.

Next session objective:

- Continue polishing the frontend base workspace and extract reusable auth/UI
  primitives when patterns settle.

## Session 8

Date: 2026-07-04

Goal:

- Apply the provided post-login page references to the next frontend states.

Completed work:

- Added a no-house onboarding screen after login.
- Added a light Fylmico app shell with sidebar navigation, search, create
  action, notification control, and user avatar.
- Added a production dashboard with stat cards, upcoming schedule, my tasks,
  recent projects, recent activity, house management, task scheduler, and chat.
- Updated mock login to start without a house.
- Updated mock create-house and join-house flows to activate a populated
  dashboard state.

Problems encountered:

- A form reset ran after an awaited mock service call when React had already
  released `event.currentTarget`, causing a runtime error.
- Fixed by capturing the form element before awaiting.

Decisions made:

- Keep these next pages frontend-only and mock-backed.
- Use the provided references as layout and visual direction while preserving
  the existing API-contract/mock-service boundary.

Next session objective:

- Refine responsive dashboard layouts and begin extracting repeated card,
  sidebar, form, and panel patterns into reusable UI primitives.

## Session 9

Date: 2026-07-04

Goal:

- Make the current frontend base interactive and polished without implementing
  backend functionality.

Completed work:

- Added local app-shell interaction state for active navigation, create menu,
  notifications, and search preview.
- Added local dashboard interactions for schedule selection, task completion,
  project selection, chat room switching, and mock message sending.
- Added polished motion and state styling for panels, controls, popovers,
  progress bars, schedule rows, task rows, and project cards.
- Preserved the mock-service boundary and did not add database, backend,
  Prisma, SQL, or server implementation work.

Problems encountered:

- The in-app browser tab lost its localhost connection after the production
  build, so the dev server had to be restarted.
- Some browser Playwright clicks timed out on visible controls, so verification
  used the visible DOM interaction path for those controls.

Decisions made:

- Keep interactivity in frontend-local state until public backend APIs exist.
- Leave backend work as explicit tasks for authenticated workspace snapshots,
  house APIs, schedule persistence, task persistence, project details,
  notifications, chat rooms, websocket delivery, and message persistence.
- Add reduced-motion support alongside the new animations.

Validation:

- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed outside the sandbox.
- Browser-verified login, create-house transition, create menu, notification
  popover, search preview, schedule selection, task completion, project
  selection, room switching, and mock message sending.

Next session objective:

- Extract repeated UI into design-system primitives and continue building the
  frontend against API contracts/mock services only.
