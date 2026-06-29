# Deployment

## Status

Draft. No deployment infrastructure has been created.

## Planned Infrastructure

- Hostinger VPS
- Docker
- Nginx
- PostgreSQL
- GitHub

## Deployment Goals

- Repeatable production deploys.
- Clear environment variable management.
- Safe database migrations.
- SSL termination through Nginx.
- Separation between web, API, database, and background processes.
- Clear rollback path.
- Documentation that another engineer can follow without chat history.

## Environments

### Local

Purpose: Development and testing.

Status: Not configured.

### Staging

Purpose: Pre-production validation.

Status: Not configured.

### Production

Purpose: Live customer-facing environment.

Status: Not configured.

## Required Deployment Documentation

Before production deployment, document:

- VPS provisioning steps.
- Docker build and runtime strategy.
- Nginx configuration.
- SSL certificate setup.
- Environment variables.
- Database backup and restore process.
- Migration process.
- Logging strategy.
- Monitoring strategy.
- Rollback process.

## Open Questions

- Will staging and production use separate VPS instances?
- What backup frequency is required?
- Which process manager or orchestration approach will be used?
- How will secrets be stored and rotated?
- What uptime and recovery targets are expected?
