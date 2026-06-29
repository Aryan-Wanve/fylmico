# 0004: Permissions Model

Date: 2026-06-29

Status: Accepted

## Problem

Fylmico must support owners, admins, managers, members, clients, reviewers,
project leads, and future enterprise roles. Access rules differ by
organization, project, asset, comment, approval, billing, and audit log context.

## Decision

Use a hybrid RBAC and policy-based authorization model.

RBAC defines common roles and permission grants. Policy checks enforce
organization membership, project membership, client sharing, resource ownership,
record state, and tenant boundaries.

## Alternatives

- Simple global roles only.
- Attribute-based access control only.
- Hard-coded checks inside controllers.
- External permissions service from day one.

## Tradeoffs

Benefits:

- Common roles remain easy to reason about.
- Resource policies can handle real production workflows.
- Authorization remains testable and centralized.

Costs:

- More design work than global roles.
- Requires consistent policy helpers.
- Requires careful tests to prevent cross-tenant leaks.

## Future Implications

Permission checks should become a shared package used by the API and UI. The API
must always be the enforcement source. Realtime events must use the same
authorization model as HTTP endpoints.
