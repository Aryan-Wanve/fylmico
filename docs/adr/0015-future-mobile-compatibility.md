# 0015: Future Mobile Compatibility

Date: 2026-07-04

Status: Accepted

## Problem

Fylmico is starting with web, but production teams and clients will eventually
need mobile access for review, notifications, approvals, chat, schedules, and
on-set workflows. Early architecture should not force a separate backend later.

## Decision

Design core API, auth, authorization, realtime, file access, and notification
contracts to be reusable by future mobile clients. Keep API contracts versioned,
avoid browser-only assumptions in backend workflows, use short-lived signed file
URLs, and keep realtime events resumable through API refetches.

## Alternatives

- Build a web-only backend now and redesign for mobile later.
- Create a separate mobile backend from day one.
- Use mobile-only backend-as-a-service primitives.

## Tradeoffs

Benefits:

- Reduces future mobile rewrite risk.
- Keeps security and authorization consistent across clients.
- Makes push notifications and offline-friendly lists easier to add later.
- Encourages clear API versioning.

Costs:

- Requires API discipline before mobile exists.
- Some web conveniences cannot become backend assumptions.
- Mobile-specific sync needs may still require later endpoints.

## Future Implications

The mobile technology choice remains deferred. Before mobile launch, the team
must define token storage, push notification provider, offline cache strategy,
and API compatibility policy.
