# Deployment

## Status

Accepted per ADR 0032 (frontend) and ADR 0033 (backend, superseding
ADR 0032's VPS plan - no VPS turned out to be available). The frontend
deploys to Hostinger's static Git hosting (auto-rebuilt on every push,
see `docs/hostinger-deployment.md`); the API deploys to Render (built
from `apps/api/Dockerfile` via `render.yaml`, auto-deployed on every push
through Render's own GitHub integration); Postgres is hosted on Supabase.

## Infrastructure Baseline

- Hostinger static hosting (frontend)
- Render (API)
- Supabase (Postgres)
- GitHub

Originally planned as a self-managed Hostinger VPS + Docker + Nginx +
PostgreSQL (ADR 0006, ADR 0032) - revised to managed services per
ADR 0033 once no VPS turned out to be available.

For current Hostinger static Git and Node.js deployment settings, see
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

Status: Implemented per ADR 0032 (frontend) + ADR 0033 (backend):

- **Frontend**: Hostinger static Git deployment. Rebuilt and republished
  automatically on every push to `main` - see
  `docs/hostinger-deployment.md`.
- **API**: Render web service built from `apps/api/Dockerfile`
  (`render.yaml` is the Blueprint). Render's own GitHub integration
  redeploys automatically on every push - no custom workflow needed.
  Database migrations (`prisma migrate deploy`) run automatically as
  part of the container's startup command.
- **Postgres**: Supabase, using its direct (non-pooled) connection
  string as `DATABASE_URL`.

Requirements still outstanding:

- SSL/custom domain for the API - Render provides HTTPS on its default
  `*.onrender.com` domain automatically; a custom domain is optional and
  not set up yet.
- Backups beyond whatever Supabase's free tier includes by default.
- Logging/monitoring beyond Render's and Supabase's own dashboards.
- A documented rollback procedure beyond Render's "redeploy a previous
  build" UI.

See `docs/adr/0033-supabase-render-backend.md` for the full one-time
setup runbook (Supabase project, Render Blueprint, env vars).

## Runtime Topology

```text
Internet
  -> Hostinger static hosting (frontend)
  -> Render (api container, built from apps/api/Dockerfile)
    -> Supabase (Postgres, direct connection)
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
- API URL.
- CORS origins.

## Migration Strategy

- Migrations must be generated through Prisma.
- Migrations must be reviewed before production.
- Production database backups must happen before migrations.
- Rollback notes must be included for risky migrations.
- Destructive migrations require explicit approval.

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
