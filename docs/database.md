# Database

## Status

Draft. No database schema, migrations, or tables have been created.

## Planned Database Stack

- PostgreSQL
- Prisma ORM

## Database Design Principles

- Multi-tenant organization boundaries must be explicit.
- Relationships should reflect real creative production workflows.
- Every table should have documented ownership and access rules.
- Indexes should be intentional and tied to query patterns.
- Constraints should protect data integrity.
- Migration history must be documented.
- Avoid storing ambiguous JSON when relational structure is known.
- Use strongly typed application contracts around database entities.

## Initial Domain Areas To Model

- Users
- Accounts and authentication identities
- Organizations
- Organization memberships
- Roles and permissions
- Teams
- Departments
- Clients
- Projects
- Tasks
- Conversations and messages
- Notifications
- Calendar events
- Assets
- Comments
- Approvals
- Versions
- Crew
- Locations
- Equipment
- Budgets
- Invoices
- Contracts

## Table Documentation Template

Use this template for every table once schema work begins.

### Table: `table_name`

Purpose:

Ownership:

Columns:

Relationships:

Indexes:

Constraints:

Permissions:

Reasoning:

Migration history:

## Migration History

No migrations exist yet.

## Open Questions

- What is the exact organization membership and role model?
- Should permissions be role-based, attribute-based, or hybrid?
- What data should be globally unique versus organization-scoped?
- Which modules must be included in the first production schema?
- What audit logging is required from the start?
