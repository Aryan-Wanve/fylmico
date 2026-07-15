# 0039: OTP-Based Auth: Signup Verification and Password Reset

Date: 2026-07-14

Status: Accepted

## Problem

Signup verification and password reset both worked via single-use link-
tokens: a long opaque token (`generateOpaqueToken`, 32 random bytes hashed
with SHA-256 into `tokenHash`) embedded in an emailed link, which the user
had to click. Two problems with this in practice: many mail clients
(Outlook, some corporate gateways, Gmail's "link scanning") prefetch links
inside emails to scan them for safety before the user ever clicks - which
silently consumes a single-use token before the real user gets to it. And
clicking a link is awkward when the email is read on a different device
than the one doing the signup/reset (e.g. verifying on a phone while
signing up on a laptop) - the link opens the wrong device's session.
Separately, login had no hard gate on email verification at all - an
unverified account could still log in and use the app.

## Decision

Replace both link-tokens with 6-digit numeric OTP codes (`generateOtp`,
`node:crypto`'s `randomInt(0, 1_000_000)` zero-padded to 6 digits) typed
directly into the UI, and block login entirely until the account's email
is verified.

- **Same storage shape, new contents.** `EmailVerificationToken` and
  `PasswordResetToken` are unchanged in structure (`userId`, `tokenHash`,
  `expiresAt`, `consumedAt`) - only what gets hashed into `tokenHash`
  changed, from a 64-hex-char opaque token to a 6-digit code. The
  migration (`20260714120000_otp_codes`) drops each table's unique index
  on `tokenHash` (a 6-digit code space collides across users - two
  different users can legitimately be issued the same code) and adds an
  `attempts` integer column (default 0).
- **Attempts + expiry enforced together.** `verifyEmail` and
  `resetPassword` look up the most recent non-consumed record for the
  user (`orderBy: createdAt desc`) and reject with a generic
  `invalid_or_expired_code` if it doesn't exist, is expired, or
  `attempts >= MAX_OTP_ATTEMPTS` (5). If the record is still live but the
  submitted code doesn't match the stored hash, `attempts` is incremented
  and a distinct `"That code is incorrect."` error is returned - so a
  wrong guess doesn't burn the whole flow immediately, but a fifth wrong
  guess does, at which point the user must request a fresh code. Both
  token types share a 10-minute TTL (`OTP_TTL = "10m"`, via
  `token.util.ts`'s `addDuration`).
- **Login is blocked until `emailVerifiedAt` is set.** `authService.login`
  now checks `authAccount.user.emailVerifiedAt` after verifying the
  password and throws `403 email_not_verified` if it's null - previously
  there was no such check, so an account could sign in unverified.
  Google OAuth accounts still get `emailVerifiedAt` set immediately from
  Google's own `email_verified` claim, so this only actually gates the
  email/password flow.
- **`resendVerificationEmail` and `requestPasswordReset` behave
  identically whether or not the account exists** (email enumeration
  guard, unchanged from the link-token version) - both silently return
  for a missing or already-verified user rather than erroring.
- **Re-issuing a code revokes the previous one.** Both
  `issueEmailVerificationOtp` and `requestPasswordReset` mark any prior
  non-consumed record for that user as consumed before creating the new
  one, so only the latest code is ever valid - consistent with how the
  old link-tokens worked, just applied to a code instead of a link.
- **Successful `verifyEmail` and `resetPassword` still invalidate
  sessions/issue new ones the same way as before**: `verifyEmail` marks
  the OTP record consumed and sets `emailVerifiedAt` in one
  `$transaction`, then immediately issues session tokens (auto-login
  after verifying, unchanged behavior from the link flow).
  `resetPassword` marks the OTP record consumed, updates the password
  hash, and revokes every existing session for that user in one
  `$transaction` - unchanged from the link-token version.

## Alternatives

- **Keep link-tokens, just shorten the TTL or add a confirmation
  interstitial page to dodge email-client prefetching.** Rejected: an
  interstitial ("click again to confirm") just adds a second click
  without solving the cross-device problem, and doesn't help at all when
  the prefetch itself is what consumes a single-use token before any
  human interaction.
- **Keep both a link and a code (link auto-verifies, code as a
  fallback).** Rejected as unnecessary complexity for this pass - the
  code alone solves the cross-device case, and dropping the link entirely
  means only one flow to test and maintain in `templates.ts`.
- **A longer code (8+ digits) to shrink collision odds enough to keep a
  unique index.** Rejected: 6 digits is standard OTP length users already
  expect from other products, and the `attempts` lockout (5 tries) makes
  the collision/brute-force math irrelevant in practice - the previous
  unique constraint was solving a problem (guessability) that expiry +
  attempts already covers better.

## Tradeoffs

Benefits:

- No more prefetch-burned tokens - typing a code has no equivalent "the
  client did it before the user saw it" failure mode.
- Works identically across devices - the code is just short text, easy to
  read off one screen and type into another.
- Login can now assert a verified email as a real precondition instead of
  a soft, unenforced expectation.

Costs:

- A 6-digit code is guessable in principle (1 in 1,000,000 per attempt);
  mitigated by the 5-attempt cap and 10-minute expiry, but this is a
  weaker theoretical guarantee than an unguessable 256-bit token. Deemed
  acceptable given both are user-facing, time-boxed, single-use flows,
  not long-lived credentials.
- Users who don't check email promptly now have a tighter window (10
  minutes) than the old link-based flow's tokens, which had no separate
  enforced attempt limit on top of expiry - requesting a new code is one
  extra step if the window is missed.
- Two DTOs (`VerifyEmailDto`, `ResetPasswordDto`) both hard-code
  `@Length(6, 6)` for the code field - if the code length ever changes,
  both need updating in lockstep with `generateOtp`.

## Future Implications

- The `attempts` column and lockout pattern established here is the
  template for any future OTP-style flow (e.g. 2FA login) - reuse
  `token.util.ts`'s `generateOtp`/`hashOpaqueToken`/`addDuration` and the
  same attempts-then-lock structure rather than inventing a new one.
- If email deliverability becomes unreliable, a resend-cooldown (not just
  the existing revoke-on-reissue) would be worth adding - currently
  nothing stops rapid repeated `resendVerificationEmail` calls beyond the
  rate limiting added later in ADR 0043.
- Commit: `d132d90`.
