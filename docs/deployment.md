# Deployment

## Status

Accepted per ADR 0032. The frontend deploys to Hostinger's static Git
hosting (auto-rebuilt on every push, see `docs/hostinger-deployment.md`);
the API + Postgres deploy to a Hostinger VPS via Docker Compose, kept in
sync by `.github/workflows/deploy-vps.yml` over SSH.

## Infrastructure Baseline

- Hostinger VPS
- Docker
- Nginx
- PostgreSQL
- GitHub

See ADR 0006.

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

Status: Implemented per ADR 0032, split across two Hostinger resources:

- **Frontend**: static Git deployment (a Hostinger website/hosting plan
  resource, not the VPS). Rebuilt and republished automatically on every
  push to `main` - see `docs/hostinger-deployment.md`.
- **API + Postgres**: a Hostinger VPS running `docker-compose.prod.yml`
  (the `api` and `postgres` services only - the frontend is not
  containerized on the VPS). Deployed automatically on every push to
  `main` via `.github/workflows/deploy-vps.yml`, which SSHs in and runs
  `deploy/deploy.sh` (git pull, `docker compose up -d --build`,
  `prisma migrate deploy`).

Requirements still outstanding:

- SSL for the API subdomain (`certbot --nginx`, see
  `deploy/nginx-api.conf.example`) - a one-time manual step on the VPS.
- Backups (Postgres data lives in a named Docker volume on the VPS with
  no automated backup yet).
- Logging/monitoring beyond `docker compose logs`.
- A documented rollback procedure beyond `git reset --hard` to a prior
  commit and re-running the deploy script.

See `docs/adr/0032-continuous-deployment.md` for the full one-time VPS
setup runbook (SSH key, GitHub secrets, DNS, Docker install).

## Runtime Topology

```text
Internet
  -> Hostinger static hosting (frontend, api.example.com CORS_ORIGIN target)
  -> Hostinger VPS
    -> system Nginx (SSL termination, reverse proxy)
      -> api container (127.0.0.1:4000, not publicly exposed directly)
        -> postgres container (docker-network-only, no exposed port)
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
