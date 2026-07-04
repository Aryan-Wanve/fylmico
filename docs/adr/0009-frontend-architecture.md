# 0009: Frontend Architecture

Date: 2026-07-04

Status: Accepted

## Problem

Fylmico needs a web frontend that feels premium and fast while supporting
complex authenticated workspaces, media review, collaboration, realtime updates,
client access, and future shared design system needs.

## Decision

Use Next.js App Router with React and TypeScript as the web application
architecture. Keep route composition in `apps/web`, shared reusable UI in
`packages/ui`, shared contracts in `packages/shared`, and typed client helpers
for API and realtime communication.

Use server components where they reduce client bundle size and client
components where interaction, realtime collaboration, editors, media review, or
local state require them.

## Alternatives

- Single-page React app without Next.js.
- Server-rendered templates.
- Native desktop-first application.
- Put all components directly inside route files.

## Tradeoffs

Benefits:

- Next.js supports routing, layouts, server rendering, and future optimization.
- Shared UI package can keep the product visually consistent.
- Typed API clients reduce frontend/backend drift.
- App Router maps well to organization and project workspaces.

Costs:

- Requires clear client/server component boundaries.
- Requires discipline to avoid route-level duplication.
- Some highly interactive tools may need careful performance work.

## Future Implications

Frontend state and contracts must remain compatible with future mobile clients.
Reusable design primitives should move into `packages/ui` only when they are
actually shared.
