# Authentication

## Status

Accepted planning baseline. No authentication code has been implemented.

## Goals

- Support secure email authentication.
- Support OAuth providers when product needs require them.
- Use short-lived JWT access tokens.
- Use rotated refresh tokens stored server-side as hashed values.
- Support organization-aware sessions.
- Keep authentication separate from authorization.

## Identity Model

Planned tables:

- `users`
- `auth_accounts`
- `sessions`
- `email_verification_tokens`
- `password_reset_tokens`
- `organization_memberships`

`users` represent people. `auth_accounts` represent login methods, such as
email credentials or OAuth accounts. `sessions` represent active authenticated
devices or browsers.

## Token Strategy

Access tokens:

- JWT.
- Short lived.
- Contain only stable identity and session claims.
- Do not contain full permission state.

Refresh tokens:

- Opaque random tokens.
- Stored in the database as hashes.
- Rotated on use.
- Revocable per session.

## Session Claims

Access tokens may include:

- User ID.
- Session ID.
- Active organization ID.
- Issued-at timestamp.
- Expiration timestamp.

Permissions must be loaded and checked by the API against the database or a
server-side cache. The UI may use permissions for display, but the API remains
the source of enforcement.

## Authentication Flows

Initial supported flows:

- Email and password sign up.
- Email verification.
- Email and password sign in.
- Refresh session.
- Sign out current session.
- Sign out all sessions.
- Password reset.

Future flows:

- OAuth sign in.
- Magic link sign in.
- SSO for larger organizations.

## Security Requirements

- Passwords must be hashed with a modern adaptive password hashing algorithm.
- Refresh tokens must never be stored in plaintext.
- Email verification and password reset tokens must expire.
- Authentication events should create audit log entries.
- Suspicious activity should be rate limited.
- Session revocation must take effect server-side.

## Open Implementation Choices

- Final password hashing library.
- Cookie strategy for web sessions.
- OAuth provider priority.
- Email provider.
