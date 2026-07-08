# Features

Every feature should include status, priority, dependencies, description, and
implementation notes.

Status values:

- Not started
- Planned
- In progress
- Blocked
- Complete

Priority values:

- Critical
- High
- Medium
- Low

## Authentication

Status: Planned

Priority: Critical

Dependencies: Monorepo scaffold, database package, authentication ADR,
permissions model

Description: User identity, email authentication, OAuth support, JWT sessions,
and secure account lifecycle.

Implementation notes: Use short-lived JWT access tokens and rotated opaque
refresh tokens. Keep authentication separate from authorization.

## Organizations

Status: Planned

Priority: Critical

Dependencies: Authentication, permissions model, database package

Description: Top-level workspaces that own users, teams, projects, clients, and
production data.

Implementation notes: Multi-tenant boundaries must be explicit from the first
schema design.

## Projects

Status: Planned

Priority: High

Dependencies: Organizations, clients, teams

Description: Central production workspaces for creative jobs, campaigns, shoots,
and deliverables.

Implementation notes: Project data should connect naturally to tasks, assets,
crew, scheduling, review, budgets, and approvals.

## Collaboration

Status: Planned

Priority: High

Dependencies: Realtime architecture, permissions, notifications

Description: Chat, comments, notifications, tasks, and workflow coordination.

Implementation notes: Realtime events should be typed, authorized, and scoped to
the relevant organization and project.

## Creative Production

Status: Planned

Priority: High

Dependencies: Projects, assets, permissions

Description: Storyboards, moodboards, scripts, shot lists, call sheets,
equipment, crew, and locations.

Implementation notes: These modules should share consistent project, approval,
commenting, attachment, and versioning patterns.

## Asset Review

Status: Planned

Priority: High

Dependencies: Assets, comments, approvals, version control

Description: Upload, organize, review, comment on, version, and approve creative
assets.

Implementation notes: Must be designed with large media files, client feedback,
and auditability in mind.

## Permissions

Status: Planned

Priority: Critical

Dependencies: Organizations, authentication, database package

Description: Organization-aware RBAC and policy checks for members, projects,
clients, assets, approvals, billing, and audit logs.

Implementation notes: API enforcement is mandatory. UI checks are only for
experience. Cross-organization access is denied by default.

## Audit Logs

Status: Planned

Priority: High

Dependencies: Authentication, permissions, database package

Description: Immutable records of important organization, project, auth, and
administrative actions.

Implementation notes: Audit logging should be included early for security and
enterprise readiness.

## Publishing and Analytics

Status: Planned

Priority: Medium

Dependencies: Projects, assets, integrations, permissions

Description: Publishing workflows, delivery tracking, reporting, and production
analytics.

Implementation notes: Keep integration boundaries modular so channels can be
added without rewriting core production workflows.

## Full Module Register

| Module          | Status      | Priority |
| --------------- | ----------- | -------- |
| Authentication  | Planned     | Critical |
| Organizations   | Planned     | Critical |
| Teams           | Planned     | High     |
| Projects        | Planned     | High     |
| Clients         | Planned     | High     |
| Departments     | Planned     | Medium   |
| Permissions     | Planned     | Critical |
| Chat            | Planned     | High     |
| Voice channels  | Planned     | Medium   |
| Video meetings  | Planned     | Medium   |
| Announcements   | Planned     | Medium   |
| Notifications   | Planned     | High     |
| Tasks           | Planned     | High     |
| Kanban          | Planned     | High     |
| Calendar        | In progress | High     |
| Timeline        | Planned     | High     |
| Scheduling      | Planned     | High     |
| Storyboards     | Planned     | High     |
| Moodboards      | Planned     | High     |
| Scripts         | Planned     | High     |
| Shot lists      | Planned     | High     |
| Call sheets     | Planned     | High     |
| Equipment       | Planned     | Medium   |
| Crew            | Planned     | Medium   |
| Locations       | Planned     | Medium   |
| Budgets         | Planned     | Medium   |
| Invoices        | Planned     | Medium   |
| Contracts       | Planned     | Medium   |
| Assets          | Planned     | High     |
| Cloud storage   | Planned     | High     |
| Video review    | Planned     | High     |
| Comments        | Planned     | High     |
| Approvals       | Planned     | High     |
| Version control | Planned     | High     |
| Publishing      | Planned     | Medium   |
| Analytics       | In progress | Medium   |
| Dashboards      | Planned     | High     |
| Global search   | Planned     | Medium   |
| Templates       | Planned     | Medium   |
| AI assistant    | Planned     | Medium   |
| Administration  | Planned     | High     |
| Settings        | Planned     | High     |
| Audit logs      | Planned     | High     |
| Activity feed   | Planned     | High     |
