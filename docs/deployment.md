# Deployment

## Status

Accepted planning baseline. No deployment infrastructure has been created.

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

Status: Planned.

Requirements:

- SSL.
- Backups.
- Logging.
- Monitoring.
- Rollback procedure.
- Migration procedure.

## Initial Runtime Topology

```text
Internet
  -> Nginx
    -> web container
    -> api container
  -> PostgreSQL
```

Future additions:

- Worker container.
- Redis for queues or realtime scaling.
- Object storage for assets.
- Search service.
- Monitoring agent.

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
