# Architecture Decision Records

This directory stores architecture decision records for Fylmico.

Every major architectural decision must create an ADR before implementation.

## Filename Format

Use sequential numbers and a short slug:

```text
0001-monorepo.md
0002-database.md
0003-authentication.md
0004-permissions.md
0005-realtime.md
```

## Current ADRs

- `0001-monorepo.md`
- `0002-database.md`
- `0003-authentication.md`
- `0004-permissions.md`
- `0005-realtime.md`
- `0006-deployment.md`
- `0007-sprint-0-foundation.md`
- `0008-modular-monolith-backend.md`
- `0009-frontend-architecture.md`
- `0010-api-architecture.md`
- `0011-organization-hierarchy.md`
- `0012-project-hierarchy.md`
- `0013-file-storage-architecture.md`
- `0014-ai-integration-architecture.md`
- `0015-future-mobile-compatibility.md`
- `0016-scaling-strategy.md`
- `0017-frontend-backend-independence.md`
- `0018-backend-bootstrap.md`
- `0019-auth-module.md`
- `0020-organizations-houses-module.md`
- `0021-tasks-chat-module.md`
- `0022-projects-clients-module.md`
- `0023-notifications-module.md`
- `0024-comments-module.md`
- `0025-frontend-backend-integration.md`
- `0026-tasks-page-extension.md`
- `0027-projects-page-extension.md`
- `0028-crews-module.md`
- `0029-messages-page-extension.md`
- `0030-calendar-page-extension.md`
- `0031-time-tracking-and-analytics.md`
- `0032-continuous-deployment.md`
- `0033-supabase-render-backend.md`
- `0034-hostinger-native-web-app.md`
- `0039-otp-based-auth.md`
- `0040-multi-house-dashboard-and-join-requests.md`
- `0041-storyboard-canvas-and-scripts-module.md`
- `0042-migrate-on-push-ci.md`
- `0043-in-memory-rate-limiting.md`
- `0044-realtime-chat-supabase.md`

## Required Sections

Each ADR must include:

- Problem
- Decision
- Alternatives
- Tradeoffs
- Future implications

## Template

```markdown
# 0000: Decision Title

Date: YYYY-MM-DD

Status: Proposed

## Problem

Describe the problem and why the decision is needed.

## Decision

Describe the chosen direction.

## Alternatives

List the serious alternatives considered.

## Tradeoffs

Describe benefits, costs, risks, and constraints.

## Future Implications

Describe what this decision enables, limits, or requires later.
```
