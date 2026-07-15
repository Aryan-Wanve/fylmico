# 0042: Automatic Prisma Migration Deploy on Push to Main

Date: 2026-07-14

Status: Accepted

## Problem

There was no automated migration step for production at all: schema
changes had to be applied to the Supabase database manually, running
`prisma migrate deploy` by hand against the production `DATABASE_URL` from
a local machine. This already bit the project once - a migration adding
`users.username`/`users.avatar_url` was committed but never applied, and
signup/login/Google OAuth all failed in production with
`PrismaClientKnownRequestError: The column "users.username" does not
exist"` until someone noticed and ran it manually.

## Decision

Add `.github/workflows/migrate.yml`, a GitHub Actions workflow that runs
`prisma migrate deploy` against production on every push to `main`,
decoupled entirely from the app's own boot process.

This landed after a same-day saga (2026-07-13) that tried the opposite
approach first - running the migration at application boot inside
`server.js` - and reverted it:

- **`2452c1c`** added `prisma migrate deploy` as a step `server.js` ran
  before `require`-ing the standalone Next.js server, on every boot (not
  just fresh deploys, since Hostinger can restart the process without a
  new push). A failed migration called `process.exit(1)`, so a bad
  migration would show up as a crashed deploy in Hostinger's Runtime Logs
  rather than silently serving broken auth.
- **`65e26ae`** found the `npx prisma migrate deploy` shell-out failed
  unconditionally on the live Hostinger deploy and took the entire site
  down (since a failed migration exited the process by design). Replaced
  `npx` with a direct `node <resolved-prisma-cli-entry>` invocation via
  `require.resolve`, avoiding any shell/PATH/npx-network step.
- **`f020455`** discovered the real cause: this Hostinger plan restricts/
  throttles spawning subprocesses from the running Node process, and
  Prisma's CLI internally spawns a native schema-engine binary to talk to
  the database - that spawn failed with `EAGAIN` in this environment
  regardless of invocation method. Made migration failures non-fatal
  (log loudly, start the server anyway) instead of `process.exit(1)`,
  since crashing the whole site over an unrelated environment restriction
  was strictly worse than the original missing-column bug (which only
  broke auth-specific routes, not the entire app).
- **`80fdf78`** reverted the boot-time migration step entirely, per user
  request, since npx, a resolved binary path, and Node's own module
  resolution all hit the same `EAGAIN` wall - there was no invocation
  strategy left to try within that boot path, and a best-effort attempt
  that reliably fails adds pure failure surface for no benefit. `server.js`
  is back to only requiring the standalone Next.js server (confirmed:
  current `server.js` just resolves and `require`s
  `.next/standalone/apps/web/server.js`, nothing migration-related).
  `prisma` moved back to a devDependency of `packages/database`.

Given boot-time migration was a dead end specific to this Hostinger plan's
subprocess restrictions, the fix moved to a separate CI job
(`4761683`, same day as the OTP auth work in ADR 0039) that runs on GitHub
Actions' own runner - no subprocess-spawning restriction there - triggered
by `on: push: branches: [main]`, with `concurrency: group:
migrate-${{ github.ref }}, cancel-in-progress: false` so overlapping
pushes queue rather than racing or cancelling an in-flight migration. The
job checks out the repo, installs dependencies, and runs `npx prisma
migrate deploy --schema=packages/database/prisma/schema.prisma` against
`DATABASE_URL` from a GitHub Actions secret.

## Alternatives

- **Keep trying boot-time migration with a different invocation
  strategy** (some other way of shelling out to Prisma's schema-engine
  binary, or a pure-JS migration runner with no subprocess at all).
  Rejected: `f020455`/`80fdf78` already spent a full pass confirming the
  restriction wasn't invocation-specific (npx, a resolved direct binary
  path, and Node's own module resolution all failed identically with
  `EAGAIN`) - the restriction is at the OS/process level on this hosting
  plan, not something fixable from inside the Node process itself.
- **Keep migrations fully manual**, just document the incident better.
  Rejected: manual steps are exactly what caused the original incident -
  a committed migration is only as good as someone remembering to run it
  against production before/alongside the code that depends on it
  landing.
- **Run migrations from the Hostinger deploy step itself** (a custom
  Hostinger build/start hook) rather than a separate GitHub Actions
  workflow. Rejected: Hostinger's native Web App hosting deploy path
  (ADR 0034/0037) is deliberately kept as the stock `npm run build`/
  `npm start` with no custom workflow; adding a migration hook there would
  reintroduce the same subprocess-spawning environment this whole saga
  was fighting. A GitHub Actions runner has no such restriction and is
  already the natural place for a CI-triggered, non-app-process step.

## Tradeoffs

Benefits:

- Migrations now apply automatically on every push to `main`, with no
  reliance on a person remembering to run a manual command - directly
  closes the gap that caused the `users.username` incident.
- Fully decoupled from app boot: a slow or even a hypothetically failing
  migration job no longer has any path to crash or block the running
  application process, unlike every variant of the boot-time approach.
- `concurrency: cancel-in-progress: false` means rapid successive pushes
  queue their migration runs rather than one cancelling mid-flight,
  avoiding a half-applied migration state.

Costs:

- There's a window between a push landing (and Hostinger's own deploy
  applying the new app code) and the separate CI migration job
  completing, during which the running app and the database schema could
  be briefly out of sync if a migration is pending - this workflow and
  the Hostinger deploy are two independent triggers on the same push,
  not one atomic step.
- `docs/deployment.md`'s "Migration Strategy" section (written during the
  `f020455`/`80fdf78` revert, one day before this workflow was added)
  still describes migrations as "not wired into an automatic deploy step
  - run manually" - it was not updated when `migrate.yml` landed and is
    now stale; anyone reading it there wouldn't know the CI workflow exists
    unless they also read `.github/workflows/migrate.yml` directly.
- A GitHub Actions secret (`DATABASE_URL`, presumably a direct/non-pooled
  or pooled Supabase connection string) now needs to exist and stay
  correct in the repo's Actions secrets, a second place (beyond
  Hostinger's own env vars) where the production connection string is
  configured.

## Future Implications

- `docs/deployment.md` should be updated to reflect that migrations are
  now automatic via `migrate.yml`, replacing the still-current "run
  manually" guidance left over from the boot-time revert.
- If multiple concurrent app instances are ever introduced (ADR 0043
  flags this as a related open question for rate limiting), this
  workflow's `concurrency` group already prevents overlapping migration
  runs regardless of how many app instances are deployed against the same
  database.
- Any future need to run something else against production on every
  main-branch push (seed data, cache warmup) has a working template to
  copy in this workflow.
- Commits: `2452c1c`, `65e26ae`, `f020455`, `80fdf78` (boot-time saga,
  reverted), `4761683` (final CI-based fix).
