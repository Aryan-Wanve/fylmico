# Coding Standards

## Status

Accepted planning baseline. These standards must be kept current as code is
introduced.

## General Rules

- Use TypeScript throughout the application.
- Keep code modular and strongly typed.
- Prefer small files with clear responsibility.
- Do not create placeholder implementations.
- Do not rewrite unrelated files.
- Do not duplicate logic.
- Avoid unnecessary abstractions.
- Optimize for maintainability over speed of initial development.
- Documentation must change when code behavior, architecture, database, API, or
  deployment changes.

## Naming

- Use clear, domain-specific names.
- Avoid abbreviations unless they are common in the codebase.
- Use PascalCase for React components, classes, and types.
- Use camelCase for variables, functions, and object properties.
- Use kebab-case for route segments and file names unless framework conventions
  require otherwise.
- Use `resource.action` for permission names.

## Folder Conventions

- Application code lives under `apps`.
- Shared packages live under `packages`.
- Durable project memory lives under `docs`.
- Domain code is grouped by product responsibility.
- Cross-cutting utilities must not become dumping grounds.

## Import Conventions

- Prefer package-level imports over deep relative imports when package structure
  exists.
- Avoid circular dependencies.
- Keep shared contracts in shared packages.
- Do not import server-only code into client bundles.
- Do not import app code into packages.

## Backend Rules

- Keep controllers thin.
- Put use-case coordination in services.
- Validate request input at boundaries.
- Enforce authorization in the API.
- Emit audit logs for important mutations.
- Keep database access behind clear service or repository boundaries.

## Frontend Rules

- Build actual product workflows, not marketing shells.
- Use the design system consistently.
- Keep screens dense enough for professional repeated use.
- Avoid visual clutter and decorative UI that does not support the task.
- Keep UI state local unless it is genuinely shared.
- Treat loading, empty, error, and permission states as first-class.

## Component Rules

- Components should be reusable when reuse is real, not speculative.
- Keep presentation and domain behavior separated when it improves clarity.
- Use accessible primitives.
- Avoid nested cards and over-framed layouts.
- Use icons for compact tool actions when appropriate.

## State Management

- Keep local state local.
- Promote state only when multiple areas truly share it.
- Server state must use a consistent fetching and caching approach once
  selected.
- Realtime state must handle reconnects, stale data, and authorization changes.

## API Rules

- Validate all inputs at API boundaries.
- Return consistent error shapes.
- Never expose secrets or internal stack traces.
- Enforce organization and permission boundaries in the API, not only in the UI.
- Document every endpoint in `docs/api.md`.

## Database Rules

- Every table must document purpose, ownership, relationships, indexes,
  constraints, permissions, and reasoning.
- Organization-owned records must be tenant-scoped.
- Migrations must be reviewed and documented.
- Large media files must not be stored directly in PostgreSQL.

## Error Handling

- Prefer explicit error types and predictable handling.
- Log server errors with useful context.
- Show user-facing errors that are clear without leaking internals.
- Do not swallow errors silently.

## Testing Rules

- Add tests proportional to risk and blast radius.
- Shared permission and authentication logic requires focused test coverage.
- API mutations require authorization boundary tests.
- UI flows require tests for critical user journeys.
- Realtime events require authorization and payload tests.

## Performance Guidelines

- Avoid unnecessary client-side work.
- Keep bundle size in mind from the start.
- Index database queries based on real access patterns.
- Treat media-heavy workflows as a first-class performance concern.
- Avoid chatty API patterns for high-frequency collaboration workflows.

## Accessibility Rules

- Use semantic HTML where possible.
- Ensure keyboard navigation for interactive controls.
- Provide visible focus states.
- Maintain readable contrast.
- Do not rely on color alone to communicate state.
- Respect reduced-motion preferences.

## Animation Rules

- Animations should be subtle and purposeful.
- Motion should reinforce state changes, not distract from work.
- Respect reduced-motion preferences.
- Avoid flashy or childish motion patterns.
