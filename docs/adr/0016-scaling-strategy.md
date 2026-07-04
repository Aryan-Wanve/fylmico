# 0016: Scaling Strategy

Date: 2026-07-04

Status: Accepted

## Problem

Fylmico needs a credible path from an early VPS deployment to larger production
usage without prematurely adopting infrastructure that slows product
development.

## Decision

Scale in phases. Start with a single-node modular monolith behind Nginx. Add
workers, Redis, object storage, CDN, monitoring, and search when real product
needs require them. Scale API instances horizontally only after shared realtime,
cache, rate limit, and job infrastructure are ready. Extract services only when
metrics justify operational complexity.

## Alternatives

- Kubernetes and microservices from day one.
- Keep everything on one process indefinitely.
- Use only managed serverless services.
- Split every domain package into a separate service.

## Tradeoffs

Benefits:

- Keeps early operations understandable.
- Provides clear upgrade points.
- Avoids distributed-system costs before product-market learning.
- Protects future scale through boundaries and typed contracts.

Costs:

- Requires monitoring to know when to scale.
- Requires later migration work for workers, Redis, and search.
- A single VPS can become a bottleneck if operational upgrades are delayed.

## Future Implications

Observability, backups, load testing, and database tuning must mature before
large customer workloads. Service extraction should follow measured pressure in
media processing, search, notifications, realtime, or AI workloads.
