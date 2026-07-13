# Deployment

## Status

Accepted per ADR 0037 (merged backend), superseding the two-service split
described in ADR 0034 (frontend) and ADR 0033 (backend). The backend
(`apps/api`, NestJS) was ported into Next.js Route Handlers inside
`apps/web` and deleted - there's now a single deployable app. It deploys
via Hostinger's own native GitHub-connected "Web App" hosting - no custom
CI/CD needed, Hostinger builds and runs `apps/web` directly on every push
(see `docs/hostinger-deployment.md`). Postgres remains hosted on Supabase;
Render is no longer part of this stack (decommissioned by the user as an
external account action once the merged app was verified live).

## Infrastructure Baseline

- Hostinger Web App hosting (frontend + backend, native GitHub integration)
- Supabase (Postgres)
- GitHub

Originally planned as a self-managed Hostinger VPS + Docker + Nginx +
PostgreSQL (ADR 0006, ADR 0032), then split across Hostinger (frontend) +
Render (API) + Supabase (Postgres) per ADR 0033 once no VPS turned out to
be available, then merged back into a single Hostinger-hosted app per
ADR 0037 once the backend was ported into Next.js.

For current Hostinger Web App hosting details, see
`docs/hostinger-deployment.md`.

## Deployment Goals

- Repeatable production deploys.
- Clear environment variable management.
- Safe database migrations.
- SSL termination through Nginx.
- Separation between web, API, database, and future worker processes.
- Clear backup and rollback path.
- Documentation another engineer can follow without chat history.

## Environments

### Local

Purpose: Development and testing.

Status: Not configured.

Expected services:

- Web app.
- API app.
- PostgreSQL.
- Optional local object storage later.

### Staging

Purpose: Pre-production validation.

Status: Planned.

Requirements:

- Separate environment variables from production.
- Separate database from production.
- Production-like build process.

### Production

Purpose: Live customer-facing environment.

Status: Implemented per ADR 0037 (merged backend), on top of the
Hostinger Web App hosting set up in ADR 0034:

- **Frontend + backend (one app)**: Hostinger's native GitHub-connected
  Web App hosting. Hostinger builds (`npm run build`, which builds
  `packages/database` then `apps/web`) and runs (`npm start`) `apps/web`
  directly on every push to `main` with no custom workflow - see
  `docs/hostinger-deployment.md`. The backend lives inside `apps/web` as
  Next.js Route Handlers under `src/app/api/v1/**` (ADR 0037), so this one
  build/run step covers both.
- **Postgres**: Supabase, using its session pooler connection string as
  `DATABASE_URL`.
- Migrations (`prisma migrate deploy`) are not wired into an automatic
  deploy step - run manually against the Supabase database when the
  schema changes (see "Migration Strategy" below for the exact command).
  An automatic boot-time attempt was tried and reverted: this project's
  Hostinger plan restricts/throttles spawning subprocesses from the
  running Node process, and Prisma's CLI internally spawns a native
  schema-engine binary to talk to the database - that spawn failed with
  `EAGAIN` here even though the app itself was healthy, and briefly
  blocking startup on that failure took the entire site down. Don't
  re-attempt boot-time migrations without solving the subprocess
  restriction first.

Known incident this documents: a migration adding
`users.username`/`users.avatar_url` sat committed but never applied to
Supabase, so signup, login, and Google OAuth all failed in production
with `PrismaClientKnownRequestError: The column "users.username" does not
exist` until it was manually run.

Requirements still outstanding:

- Backups beyond whatever Supabase's free tier includes by default.
- Logging/monitoring beyond Hostinger's and Supabase's own dashboards.
- A documented rollback procedure beyond Hostinger's own deploy history.

## Runtime Topology

```text
Internet
  -> Hostinger Web App hosting (frontend + backend, native GitHub integration)
    -> Supabase (Postgres, session pooler connection)
```

Future additions:

- Worker container.
- Redis for queues or realtime scaling.
- Object storage for assets.
- Search service.
- Monitoring agent.
- Automated Postgres backups.

## Environment Variables

Must be documented before deployment:

- Database URL.
- JWT signing secret or key references.
- Refresh token secret or hashing configuration.
- OAuth provider credentials.
- Email provider credentials.
- Object storage credentials.
- Public web URL.

`API URL`/`CORS origins` no longer apply post-ADR-0037 - the backend is
same-origin with the frontend now, so there's no separate API host to
point at or allow-list.

## Migration Strategy

- Migrations must be generated through Prisma.
- Migrations must be reviewed before production.
- Production database backups must happen before migrations.
- Rollback notes must be included for risky migrations.
- Destructive migrations require explicit approval.
- Run `prisma migrate deploy` manually against the production
  `DATABASE_URL` after any schema change, from a local machine (not from
  inside the Hostinger-hosted process - see "Production" above for why):
  `DATABASE_URL="<supabase connection string>" npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma`

## Backup Strategy

Before production launch, define:

- Backup frequency.
- Backup storage location.
- Restore test process.
- Retention period.
- Responsible operator.

## Rollback Strategy

Before production launch, define:

- How to redeploy the previous app version.
- How to handle database migration rollback or forward-fix.
- How to restore from backup.
- How to communicate downtime.

## Deferred Deployment Decisions

- Package manager and build runner.
- CI/CD provider configuration.
- Managed versus containerized PostgreSQL.
- Object storage provider.
- Monitoring and alerting provider.
- Log aggregation provider.
