# 0019: Auth Module Implementation

Date: 2026-07-08

Status: Accepted

## Problem

ADR 0018 stood up `apps/api`/`packages/database` as a scaffold with no domain
logic. Per ADR 0003 and `docs/authentication.md`, identity/auth is the first
real domain to implement — organizations/houses, projects, tasks, and chat
all require an authenticated user, and `docs/authentication.md` lists several
"Open Implementation Choices" (password hashing library, cookie strategy,
OAuth provider priority, email provider) that need resolving before any of
that code can be written.

## Decision

Implement email+password signup/login, JWT access tokens + rotated opaque
refresh tokens, logout/logout-all, email verification, and password reset,
per the endpoint list already documented in `docs/api.md`. OAuth and a real
email provider remain out of scope (email/password only; verification and
reset tokens are logged server-side rather than emailed).

This resolves two of `docs/authentication.md`'s open choices:

- **Password hashing**: `argon2id` via the `argon2` npm package. Confirmed to
  install and run without issue on this machine (native prebuilt binary, no
  Visual Studio Build Tools required) — no fallback to `bcrypt`/`bcryptjs`
  was needed.
- **Token delivery**: both access and refresh tokens are returned in the JSON
  response body (`data.accessToken`, `data.refreshToken`), not cookies. No
  frontend is wired to the real API yet, so there is no cookie/CORS/CSRF
  design to get right today; this can change to httpOnly cookies later
  without touching `auth.service.ts`, only `auth.controller.ts`.

Additional decisions:

- **Opaque tokens** (refresh, email-verification, password-reset) are
  `crypto.randomBytes(32)` hex strings, looked up by a `sha256` digest —
  distinct from password hashing because these values are already
  high-entropy random data, not low-entropy user secrets.
- **Refresh reuse detection is simplified**: a refresh token is overwritten
  in place on rotation (no tracked lineage/family). A replayed old token
  fails to match any session's current hash and gets a generic 401,
  indistinguishable from "expired" or "already logged out." The stronger
  requirement in `docs/authentication.md` ("suspicious reuse revokes the
  entire session family + logs an audit event") is deferred.
- **Audit logging is deferred entirely.** `audit_logs` is organization-scoped
  per `docs/database.md`, and organizations don't exist yet; audit logging
  lands with that module instead of being half-built against no tenant model.
- **Rate limiting is out of scope.** `docs/api.md` separately lists "rate
  limiting strategy" as a deferred decision; picking one is bigger than this
  pass.
- **Login does not require a verified email.** Signup returns tokens
  immediately; `emailVerifiedAt` is tracked for future features to check but
  nothing gates on it yet.
- **Validation**: `class-validator` + `class-transformer` with Nest's
  `ValidationPipe`, resolving `docs/api.md`'s "validation library" deferred
  decision.
- **Error shape**: a global `HttpExceptionFilter` normalizes all thrown
  `HttpException`s (including a new `AppException` used for domain-specific
  codes like `invalid_credentials`) into ADR 0010's
  `{ "error": { "code", "message", "requestId" } }` envelope.

Five Prisma models were added (`User`, `AuthAccount`, `Session`,
`EmailVerificationToken`, `PasswordResetToken`), matching
`docs/database.md`'s "Identity" table group. `AuthAccount` models login
_methods_ separately from `User` so OAuth providers can be added later
without a `User` schema change.

## Alternatives

- Include OAuth in this pass. Rejected: no provider has been chosen
  (`docs/authentication.md`'s "OAuth provider priority" is still open), and
  `AuthAccount`'s `provider`/`providerAccountId` columns already leave room
  for it later without rework.
- Send real verification/reset emails now. Rejected: no email provider is
  chosen; logging the token server-side is a documented, temporary stand-in.
- Track refresh-token lineage/families for proper reuse detection. Rejected
  for this pass to keep scope to "auth works," with the simplification
  called out explicitly above rather than silently accepted.
- Deliver tokens via httpOnly cookies from the start. Rejected for now since
  no frontend integration exists yet to make cookie/CORS/CSRF tradeoffs
  concrete; body delivery is simpler and doesn't foreclose switching later.

## Tradeoffs

Benefits:

- Unblocks every other domain that needs an authenticated user.
- Resolves the password-hashing and token-delivery open choices concretely,
  with reasoning captured instead of left ambiguous.
- Keeps the schema OAuth-ready without implementing OAuth now.

Costs:

- No audit logging or rate limiting yet, despite both being named security
  requirements in `docs/authentication.md` — explicitly deferred, not
  silently skipped.
- Refresh-token reuse is not distinguished from ordinary expiry; a
  compromised refresh token isn't specially flagged.
- Email verification/reset tokens are only ever visible in server logs in
  this pass — not usable in a real deployment until an email provider is
  chosen and wired in.

## Future Implications

- The organizations/houses module should add `activeOrganizationId` to the
  JWT access token claims (ADR 0003 already lists this claim; it's absent
  today only because no organization model exists yet).
- Audit logging should be added to every auth flow (signup, login, refresh,
  logout, password reset) once the organizations module lands, per
  `docs/authentication.md`'s security requirements.
- Refresh-token reuse detection should be revisited (session-family
  tracking) before this is exposed to real users outside local development.
- A real email provider decision unblocks actually sending verification/reset
  emails instead of logging tokens server-side.
