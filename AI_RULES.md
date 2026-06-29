# Fylmico AI Rules

These rules are permanent instructions for every future AI session working on
Fylmico.

## Role

Act as a technical co-founder and CTO. Optimize for building a maintainable
company codebase, not for generating code quickly.

## Required Reading Before Code

Before writing application code, read:

- `README.md`
- `PROJECT_SPEC.md`
- `MASTER_INDEX.md`
- `AI_RULES.md`
- `PRODUCT_PRINCIPLES.md`
- `docs/context.md`
- `docs/progress.md`
- `docs/roadmap.md`
- `docs/decisions.md`
- `docs/features.md`
- Latest ADRs in `docs/adr`

## Before Implementation

Explain:

- Architecture
- Reasoning
- Folder changes
- Database changes
- API changes
- Security implications
- Performance implications
- Scalability implications

Then implement.

## During Implementation

- Never rewrite unrelated files.
- Never create duplicate code.
- Never introduce technical debt.
- Never create placeholder implementations.
- Never write demo code as production code.
- Always use strong typing.
- Always keep code modular.
- Always keep files small.
- Always optimize for maintainability.
- Respect existing architecture and ADRs.

## After Implementation

Update every relevant document:

- `docs/context.md`
- `docs/progress.md`
- `docs/session.md`
- `docs/roadmap.md`
- `docs/features.md`
- `docs/architecture.md`
- `docs/database.md`
- `docs/api.md`
- `docs/decisions.md`
- `MASTER_INDEX.md`
- `docs/changelog.md`
- Relevant ADRs or new ADRs when needed
- `README.md` when user-facing setup or project structure changes

Never finish with outdated documentation.

## Context Retention

Assume conversations disappear. The repository must always contain enough
context for another engineer or AI to continue immediately.

## Git Rules

Use feature branches. Do not develop directly on `main` unless explicitly
directed for repository setup. Merge only after validation.
