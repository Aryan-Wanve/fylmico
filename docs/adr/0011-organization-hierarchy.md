# 0011: Organization Hierarchy

Date: 2026-07-04

Status: Accepted

## Problem

Fylmico must support multiple companies, production houses, agencies, teams,
clients, and reviewers while preventing data leaks across tenants.

## Decision

Use organization as the primary tenant boundary. Users join organizations
through memberships. Organization memberships carry role context, and
organization-owned resources must be scoped by `organization_id` directly or
through a required parent.

Organizations may contain teams, departments, clients, roles, settings, and
projects. Platform administration remains separate from normal organization
roles.

## Alternatives

- Single global workspace.
- Project as the only tenant boundary.
- Account-level tenancy without organizations.
- Separate database per organization from day one.

## Tradeoffs

Benefits:

- Matches how creative businesses and agencies operate.
- Provides clear data isolation rules.
- Supports users belonging to multiple companies or clients.
- Leaves room for enterprise settings and billing later.

Costs:

- Every domain model must account for organization scope.
- Cross-organization collaboration requires explicit product design.
- Permission checks are more complex than global roles.

## Future Implications

Billing, audit logs, custom roles, SSO, retention settings, and enterprise
controls should attach to organizations. Future sharding or enterprise isolation
can use organization boundaries if needed.
