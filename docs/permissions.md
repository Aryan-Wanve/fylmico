# Permissions

## Status

Accepted planning baseline. No permission code has been implemented.

## Goals

- Keep authorization organization-aware from the first implementation.
- Support roles for common workflows.
- Support fine-grained permissions for production workflows.
- Keep enforcement in the API, not only the UI.
- Make permissions auditable and testable.

## Model

Use a hybrid RBAC and policy model:

- RBAC defines common roles and their permissions.
- Policy checks evaluate resource ownership, organization membership, project
  membership, client access, and record state.

## Tenant Boundary

Organization is the primary tenant boundary. Every organization-owned record
must be scoped by `organization_id` directly or through a required parent.

Cross-organization access is denied by default.

## Planned Role Levels

Organization roles:

- Owner
- Admin
- Manager
- Member
- Client

Project roles:

- Project lead
- Producer
- Editor
- Reviewer
- Viewer

System roles:

- Platform admin

System roles must not be used for normal organization workflows.

## Permission Naming

Use `resource.action` naming:

- `organization.read`
- `organization.update`
- `member.invite`
- `project.create`
- `project.read`
- `project.update`
- `project.delete`
- `asset.upload`
- `asset.review`
- `comment.create`
- `approval.create`
- `billing.manage`
- `audit.read`

## Enforcement Rules

- Deny by default.
- Check authentication first.
- Check organization membership second.
- Check role permissions third.
- Check resource-specific policy last.
- Log important mutations and administrative actions.

## Client Access

Client users should only see explicitly shared projects, assets, reviews, and
approval requests. Client access must never expose internal team chat, budgets,
private notes, or unrelated organization data unless intentionally shared.

## Testing Requirements

Permission logic requires focused tests before production use:

- Organization isolation.
- Project access.
- Client access.
- Admin actions.
- Audit log visibility.
- Realtime event authorization.
