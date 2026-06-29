# 0005: Realtime Architecture

Date: 2026-06-29

Status: Accepted

## Problem

Fylmico needs realtime collaboration for chat, comments, notifications, activity
feeds, approvals, project updates, and future meetings. Events must be scoped,
typed, and permission-aware.

## Decision

Use Socket.IO for realtime transport. Realtime events must be defined as typed
contracts in a shared package and authorized server-side before clients join
rooms or receive events.

Room scopes should be explicit:

- Organization rooms.
- Project rooms.
- Conversation rooms.
- Asset review rooms.
- User notification rooms.

## Alternatives

- Raw WebSockets.
- Server-sent events.
- Polling only.
- Hosted realtime provider.

## Tradeoffs

Benefits:

- Socket.IO handles reconnects and room-based delivery.
- Shared event contracts reduce frontend/backend drift.
- Room scopes map naturally to organizations, projects, and reviews.

Costs:

- Requires adapter planning for multi-instance scaling.
- Requires strict authorization on room joins.
- Event naming and versioning must be disciplined.

## Future Implications

When the API scales beyond one instance, Socket.IO will need a shared adapter
such as Redis. Realtime events should not become the source of truth; the
database remains authoritative.
