# 0002: Database and ORM

Date: 2026-06-29

Status: Accepted

## Problem

Fylmico needs reliable storage for multi-tenant organizations, members,
projects, clients, creative production workflows, assets, comments, approvals,
audit logs, and future billing data. The database layer must protect data
integrity and remain understandable as the product grows.

## Decision

Use PostgreSQL as the primary database and Prisma ORM for schema, migrations,
and type-safe database access.

Organization is the primary tenant boundary. Organization-owned records must be
scoped by `organization_id` directly or through a required parent relationship.

## Alternatives

- MySQL with an ORM.
- MongoDB or another document database.
- Direct SQL without an ORM.
- A backend-as-a-service database layer.

## Tradeoffs

Benefits:

- PostgreSQL provides strong relational integrity and mature indexing.
- Prisma improves type safety and developer ergonomics.
- Relational modeling fits organizations, projects, memberships, approvals, and
  audit logs.

Costs:

- Prisma abstractions must not hide important query behavior.
- Some advanced PostgreSQL features may require raw SQL.
- Schema design must be disciplined to avoid migration churn.

## Future Implications

Database migrations must be reviewed carefully. Indexes must follow real query
patterns. Large media files should not be stored directly in PostgreSQL; the
database should store metadata and object references.
