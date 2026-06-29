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

Dependencies: Architecture ADR, authentication ADR, database design

Description: User identity, email authentication, OAuth support, JWT sessions,
and secure account lifecycle.

Implementation notes: Do not implement until session, token, organization, and
permission boundaries are documented.

## Organizations

Status: Planned

Priority: Critical

Dependencies: Authentication, permissions model, database design

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

## Publishing and Analytics

Status: Planned

Priority: Medium

Dependencies: Projects, assets, integrations, permissions

Description: Publishing workflows, delivery tracking, reporting, and production
analytics.

Implementation notes: Keep integration boundaries modular so channels can be
added without rewriting core production workflows.
