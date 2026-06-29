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

Problems encountered:

- Latest `lint-staged` required a newer Node version than the local baseline.
- ESLint 10 was not compatible with the React plugin bundled by Next 16.2.9.
- Local sandbox blocked Next build worker spawning, but the same build passed
  outside the sandbox.
- Hostinger deployment returned HTTP 403 after a successful build, indicating a
  deployment routing/startup mismatch rather than a Next.js compile failure.

Decisions made:

- Use npm workspaces from the repository root.
- Deploy Hostinger from the repository root, not `apps/web`.
- Use root `server.js` as the production startup file.
- Keep Docker files for container/VPS deployment; they do not control
  Hostinger Node.js Git deployment.

Next session objective:

- Confirm the Hostinger deployment returns HTTP 200, then request approval
  before beginning Sprint 1.
