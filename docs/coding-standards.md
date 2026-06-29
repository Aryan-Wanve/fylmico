# Coding Standards

## Status

Draft. These standards must be finalized before application code is written.

## General Rules

- Use TypeScript throughout the application.
- Keep code modular and strongly typed.
- Prefer small files with clear responsibility.
- Do not create placeholder implementations.
- Do not rewrite unrelated files.
- Do not duplicate logic.
- Avoid unnecessary abstractions.
- Optimize for maintainability over speed of initial development.

## Naming

- Use clear, domain-specific names.
- Avoid abbreviations unless they are common in the codebase.
- Use PascalCase for React components and classes.
- Use camelCase for variables, functions, and object properties.
- Use kebab-case for route segments and file names unless framework conventions
  require otherwise.

## Folder Conventions

- Application code should live under `apps`.
- Shared packages should live under `packages`.
- Durable project memory should live under `docs`.
- Domain code should be grouped by product responsibility.
- Cross-cutting utilities should not become dumping grounds.

## Import Conventions

- Prefer package-level imports over deep relative imports when package structure
  exists.
- Avoid circular dependencies.
- Keep shared contracts in shared packages.
- Do not import server-only code into client bundles.

## Component Rules

- Components should be reusable when reuse is real, not speculative.
- Keep presentation and domain behavior separated where it improves clarity.
- Use accessible primitives.
- Keep UI consistent with the design system.
- Avoid visual clutter.

## State Management

- Keep local state local.
- Promote state only when multiple parts of the application truly share it.
- Server state should use a consistent fetching and caching approach once
  selected.
- Realtime state must handle reconnects, stale data, and authorization changes.

## API Rules

- Validate all inputs at API boundaries.
- Return consistent error shapes.
- Never expose secrets or internal stack traces.
- Enforce organization and permission boundaries in the API, not only in the UI.
- Document every endpoint in `docs/api.md`.

## Error Handling

- Prefer explicit error types and predictable handling.
- Log server errors with useful context.
- Show user-facing errors that are clear without leaking internals.
- Do not swallow errors silently.

## Testing Rules

- Add tests proportional to risk and blast radius.
- Shared permission and authentication logic requires focused test coverage.
- API mutations require tests for authorization boundaries.
- UI flows require tests for critical user journeys.

## Performance Guidelines

- Avoid unnecessary client-side work.
- Keep bundle size in mind from the start.
- Index database queries based on real access patterns.
- Treat media-heavy workflows as a first-class performance concern.

## Accessibility Rules

- Use semantic HTML where possible.
- Ensure keyboard navigation for interactive controls.
- Provide visible focus states.
- Maintain readable contrast.
- Do not rely on color alone to communicate state.

## Animation Rules

- Animations should be subtle and purposeful.
- Motion should reinforce state changes, not distract from work.
- Respect reduced-motion preferences.
