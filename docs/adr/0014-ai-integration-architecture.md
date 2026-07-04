# 0014: AI Integration Architecture

Date: 2026-07-04

Status: Accepted

## Problem

Fylmico should use AI to accelerate creative production workflows, but AI must
not bypass permissions, leak tenant data, or become the authoritative owner of
project state.

## Decision

Implement AI as backend application services behind `packages/ai` contracts.
AI requests must run through normal authentication and authorization, fetch only
the data the user may access, minimize prompt context, and return suggestions
that users can accept, edit, or discard.

Any AI-assisted mutation uses normal API authorization and audit behavior.

## Alternatives

- Put AI calls directly in frontend components.
- Give AI broad database access.
- Store AI output as authoritative state automatically.
- Defer all AI architecture until after feature implementation.

## Tradeoffs

Benefits:

- Keeps tenant data protected by the existing authorization model.
- Allows provider changes behind a stable abstraction.
- Makes AI assistance auditable and user-controlled.
- Supports both synchronous suggestions and future background jobs.

Costs:

- Requires prompt, context, and provider governance.
- Some workflows need asynchronous job handling.
- Data minimization can make prompt construction more complex.

## Future Implications

Provider selection, retention settings, embeddings, vector search, and AI usage
limits require separate decisions. AI-generated artifacts should be labeled and
traceable to the requesting user and source context.
