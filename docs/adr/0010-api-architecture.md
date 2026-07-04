# 0010: API Architecture

Date: 2026-07-04

Status: Accepted

## Problem

Fylmico needs API contracts that are predictable, secure, versioned, typed, and
usable by the web application, future mobile applications, realtime workflows,
and external integrations later.

## Decision

Use a versioned JSON REST API under `/api/v1`. Keep endpoint handlers thin and
enforce authentication, validation, authorization, and safe error formatting at
the API boundary. Use typed request and response contracts shared through
packages where appropriate.

Mutations that affect collaborative state may emit realtime events after the
database transaction commits.

## Alternatives

- GraphQL as the primary API.
- tRPC as the primary API.
- Unversioned REST endpoints.
- Separate bespoke APIs for web and mobile from day one.

## Tradeoffs

Benefits:

- REST is simple to operate, document, cache, test, and consume from web/mobile.
- Versioning gives future mobile clients a stable compatibility path.
- Clear endpoint contracts help authorization review.
- REST works well with NestJS controllers and guards.

Costs:

- Some complex views may require aggregation endpoints.
- Strong typing needs shared contract discipline.
- Public API evolution must be managed carefully.

## Future Implications

GraphQL, tRPC, or a public integration API can be added later for specific use
cases, but core product workflows should start with versioned REST contracts.
