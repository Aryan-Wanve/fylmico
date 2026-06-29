# 0006: Deployment Architecture

Date: 2026-06-29

Status: Accepted

## Problem

Fylmico needs a practical initial deployment path that can run on Hostinger VPS
while preserving future scalability. The deployment model must support web,
API, database, Nginx, environment variables, migrations, backups, and rollback.

## Decision

Use Dockerized services behind Nginx on Hostinger VPS for the initial deployment
path. GitHub will host source control and future automation. PostgreSQL will run
as a managed or containerized service depending on operational constraints, with
backups required before production use.

## Alternatives

- Platform-as-a-service deployment.
- Kubernetes from day one.
- Bare Node.js processes without containers.
- Separate hosting providers for web and API from day one.

## Tradeoffs

Benefits:

- Docker gives repeatable builds and runtime environments.
- Nginx provides a clear reverse proxy and SSL termination layer.
- VPS deployment keeps early infrastructure understandable and cost conscious.

Costs:

- VPS operations require discipline around updates, backups, logs, and security.
- Manual operations can become risky if automation is delayed too long.
- Scaling will require future infrastructure evolution.

## Future Implications

Deployment scripts, environment variable documentation, backup procedures, and
rollback procedures must exist before production launch. The architecture should
not assume the VPS is the final hosting model.
