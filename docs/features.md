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

Status: Complete

Priority: Critical

Dependencies: Monorepo scaffold, database package, authentication ADR,
permissions model

Description: User identity, email authentication, OAuth support, JWT sessions,
and secure account lifecycle.

Implementation notes: OTP-based email auth plus Google OAuth, short-lived JWT
access tokens and rotated opaque refresh tokens. See ADR 0003, 0019, 0035, 0039.

## Organizations

Status: Complete

Priority: Critical

Dependencies: Authentication, permissions model, database package

Description: Top-level workspaces ("Houses") that own users, teams, projects,
clients, and production data.

Implementation notes: Multi-house dashboard, house types with per-type default
modules, pending-member/role-assignment flow, favorites/pins/archive. See ADR
0020, 0040, 0046, 0048, 0049.

## Projects

Status: Complete

Priority: High

Dependencies: Organizations, clients, teams

Description: Central production workspaces for creative jobs, campaigns, shoots,
and deliverables.

Implementation notes: Connected to tasks, files, crew, scheduling, comments,
and clients. See ADR 0022, 0027.

## Collaboration

Status: Complete

Priority: High

Dependencies: Realtime architecture, permissions, notifications

Description: Chat, comments, notifications, tasks, and workflow coordination.

Implementation notes: Real-time chat/presence via Supabase Realtime (ADR 0044),
task @mention comments, cross-house notification deep-linking (ADR 0049).

## Creative Production

Status: Complete

Priority: High

Dependencies: Projects, assets, permissions

Description: Storyboards, moodboards, scripts, shot lists, call sheets,
equipment, crew, and locations.

Implementation notes: Storyboard canvas + shot lists, scripts, call sheets, and
crew all shipped (ADR 0028, 0041). Moodboards and a dedicated equipment
inventory are not built.

## Asset Review

Status: In progress

Priority: High

Dependencies: Assets, comments, approvals, version control

Description: Upload, organize, review, comment on, version, and approve creative
assets.

Implementation notes: Drive-backed file storage with sensitive/portfolio
flags (ADR 0038, 0045) and task-level draft uploads (ADR 0050) ship today;
timestamped video review and full version history are not built.

## Permissions

Status: In progress

Priority: Critical

Dependencies: Organizations, authentication, database package

Description: Organization-aware RBAC and policy checks for members, projects,
clients, assets, approvals, billing, and audit logs.

Implementation notes: Centralized 18-key permission system exists
(`apps/web/src/lib/permissions.ts`, ADR 0048); only `approve_members` is
enforced via `requirePermission` so far, other domain services still use
simpler Owner-only/any-member gates.

## Audit Logs

Status: In progress

Priority: High

Dependencies: Authentication, permissions, database package

Description: Immutable records of important organization, project, auth, and
administrative actions.

Implementation notes: Per-task `TaskActivity` log and a Recent Activity feed
exist; there is no house-wide/cross-domain audit log yet.

## Publishing and Analytics

Status: In progress

Priority: Medium

Dependencies: Projects, assets, integrations, permissions

Description: Publishing workflows, delivery tracking, reporting, and production
analytics.

Implementation notes: Analytics (time tracking, task status, estimate vs
actual, personal HUD stats) ships (ADR 0031, 0047, 0049, 0050); external
publishing/delivery-channel integrations do not exist.

## Full Module Register

| Module          | Status      | Priority |
| --------------- | ----------- | -------- |
| Authentication  | Complete    | Critical |
| Organizations   | Complete    | Critical |
| Teams           | Complete    | High     |
| Projects        | Complete    | High     |
| Clients         | Complete    | High     |
| Departments     | Complete    | Medium   |
| Permissions     | In progress | Critical |
| Chat            | Complete    | High     |
| Voice channels  | Planned     | Medium   |
| Video meetings  | Planned     | Medium   |
| Announcements   | Complete    | Medium   |
| Notifications   | Complete    | High     |
| Tasks           | Complete    | High     |
| Kanban          | Complete    | High     |
| Calendar        | Complete    | High     |
| Timeline        | Planned     | High     |
| Scheduling      | Complete    | High     |
| Storyboards     | Complete    | High     |
| Moodboards      | Planned     | High     |
| Scripts         | Complete    | High     |
| Shot lists      | Complete    | High     |
| Call sheets     | Complete    | High     |
| Equipment       | Planned     | Medium   |
| Crew            | Complete    | Medium   |
| Locations       | Complete    | Medium   |
| Budgets         | Planned     | Medium   |
| Invoices        | Planned     | Medium   |
| Contracts       | Planned     | Medium   |
| Assets          | Complete    | High     |
| Cloud storage   | Complete    | High     |
| Video review    | Planned     | High     |
| Comments        | Complete    | High     |
| Approvals       | Complete    | High     |
| Version control | In progress | High     |
| Publishing      | Planned     | Medium   |
| Analytics       | Complete    | Medium   |
| Dashboards      | Complete    | High     |
| Global search   | In progress | Medium   |
| Templates       | In progress | Medium   |
| AI assistant    | Planned     | Medium   |
| Administration  | In progress | High     |
| Settings        | Complete    | High     |
| Audit logs      | In progress | High     |
| Activity feed   | Complete    | High     |
