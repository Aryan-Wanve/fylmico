# 0003: Authentication Model

Date: 2026-06-29

Status: Accepted

## Problem

Fylmico needs secure authentication for individuals, teams, organizations,
clients, and future enterprise users. The model must support email
authentication, OAuth, revocable sessions, and organization-aware access.

## Decision

Use email authentication and OAuth identities tied to a single `users` table.
Use short-lived JWT access tokens and rotated opaque refresh tokens stored
server-side as hashes.

Keep authentication separate from authorization. Tokens identify the user,
session, and active organization, but permission checks are enforced by the API.

## Alternatives

- Long-lived JWT-only sessions.
- Cookie-only server sessions.
- Third-party auth platform from the start.
- OAuth-only authentication.

## Tradeoffs

Benefits:

- Short-lived access tokens reduce token exposure risk.
- Rotated refresh tokens support revocation and device-level sessions.
- Separating authentication from authorization keeps permission changes
  effective without waiting for token expiry.

Costs:

- Requires refresh-token storage and rotation logic.
- Requires careful cookie and CSRF design for web clients.
- More complex than a basic JWT-only setup.

## Future Implications

This model can support SSO later. Session and auth events should be audit logged
from the beginning. Authentication implementation must include rate limiting,
token expiry, and revocation behavior.
