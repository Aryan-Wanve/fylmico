# 0012: Project Hierarchy

Date: 2026-07-04

Status: Accepted

## Problem

Creative production work needs a durable structure for clients, teams, tasks,
assets, versions, reviews, approvals, planning documents, and delivery without
turning the product into a generic board or chat tool.

## Decision

Use project as the primary production workspace inside an organization. A
project belongs to one organization, may link to one or more clients, and owns
most production artifacts: tasks, conversations, assets, versions, comments,
approvals, schedules, storyboards, scripts, shot lists, call sheets, crew,
locations, and delivery records.

Project memberships and policies refine access inside the organization.

## Alternatives

- Make clients the primary container.
- Make channels or conversations the primary container.
- Use generic folders as the main hierarchy.
- Store all production artifacts directly under organizations.

## Tradeoffs

Benefits:

- Matches how production teams plan, execute, review, and deliver work.
- Keeps client sharing and approvals scoped to concrete work.
- Gives realtime rooms and activity feeds a natural boundary.
- Supports project dashboards and archives.

Costs:

- Some resources may need organization-level templates outside projects.
- Cross-project assets and teams need careful linking.
- Project policies must account for client and internal visibility.

## Future Implications

Future modules should attach to projects by default unless they are templates,
organization libraries, billing records, or global settings. Cross-project
views should aggregate project-owned records without weakening access rules.
