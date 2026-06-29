# Decisions

This file tracks high-level decisions and links to ADRs. Major architectural
decisions must also be recorded as individual ADR files in `docs/adr`.

## Decision Log

### 2026-06-29: Documentation-first foundation

Status: Accepted

Context: Fylmico is intended to become a large, long-lived creative production
platform. The project specification requires durable project memory before
application code is written.

Decision: Create the documentation scaffold before writing application code.

Impact: Future work must keep documentation current and must read the project
memory files before implementation.

ADR: Not required; this directly follows the project specification.

## Pending ADRs

- Monorepo structure.
- Database and ORM.
- Authentication and session model.
- Permissions model.
- Realtime architecture.
- Deployment architecture.

## ADR Requirements

Every ADR must include:

- Problem
- Decision
- Alternatives
- Tradeoffs
- Future implications
