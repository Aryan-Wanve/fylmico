# 0007: Sprint 0 Foundation Scaffold

Date: 2026-06-29

Status: Accepted

## Problem

Fylmico needs a production-ready engineering foundation before any product
features are built. The foundation must support Next.js, TypeScript, TailwindCSS,
linting, formatting, Git hooks, CI, Docker, and Hostinger Node.js deployment
without creating unused placeholder folders.

## Decision

Use npm workspaces with `apps/web` as the first runnable application. Keep the
root repository as the command surface so `npm install`, `npm run dev`,
`npm run build`, and `npm start` work from the repository root.

Use the latest stable package versions that are compatible with the local and CI
Node baseline and the Next.js linting ecosystem. `lint-staged` 17.0.8 requires
Node >=22.22.1, while the current foundation baseline is Node 22.13.0, so Sprint
0 uses `lint-staged` 16.4.0. ESLint 10.6.0 currently breaks against the React
plugin bundled by `eslint-config-next` 16.2.9, so Sprint 0 uses the latest ESLint
9 release, 9.39.4.

Create only folders that are used in Sprint 0:

- `apps/web` for the Next.js App Router application shell.
- `docs` for durable project memory.
- `.github/workflows` for CI.
- `.husky` for Git hooks.

Do not create `apps/api` or `packages/*` until those folders contain real
implementation code or shared contracts.

## Alternatives

- Create a flat root-level Next.js application.
- Create the entire target monorepo folder tree immediately.
- Use a different package manager such as pnpm or yarn.

## Tradeoffs

Benefits:

- Root commands remain simple for local development and Hostinger deployment.
- The folder structure stays honest and avoids placeholder directories.
- npm satisfies the Sprint 0 package manager requirement.
- The repository remains compatible with the accepted monorepo direction.

Costs:

- `apps/api` and `packages/*` are deferred until later sprints.
- Some deployment tooling must account for the web app living below `apps/web`.

## Future Implications

When Sprint 1 introduces real shared contracts or backend work, add the relevant
workspace folders and update the architecture documentation, package scripts,
CI, Docker, and deployment notes in the same change.
