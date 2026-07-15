# 0043: In-Memory Rate Limiting for Auth and Join-Request Endpoints

Date: 2026-07-15

Status: Accepted

## Problem

No rate limiting existed anywhere in the app. Login was open to brute-force
password guessing with no throttle. Signup, resend-verification, and
password-reset all trigger an outbound email (`sendMail`, ADR 0019/0039's
Resend integration) with no cap, so they could be used to email-bomb an
address or burn through the Resend sending quota. `verifyEmail`/
`resetPassword`'s OTP codes (ADR 0039) have an `attempts` lockout per
record, but nothing stopped an attacker from requesting fresh codes
indefinitely to reset that counter. House join-requests (ADR 0040) could be
spammed at a house's Owners with no limit either.

## Decision

Add `apps/web/src/server/rate-limit.ts`: a single in-memory, per-process
fixed-window counter, with no external store (no Redis, no database
table), wired directly into the affected route handlers.

- **`rateLimit(key, limit, windowMs)`** holds one module-level `Map<string,
{ count, resetAt }>`. A call with a key not yet in the map (or whose
  window has expired) seeds a fresh `{ count: 1, resetAt: now + windowMs
}`. A call within an active window increments `count` and throws `429
rate_limited` once `count >= limit`. A cheap sweep (delete every expired
  entry) runs whenever the map grows past 5,000 keys, instead of a
  separate timer - bounds memory without needing anything to remember to
  clear on shutdown.
- **Keys combine client IP with the specific identifier being protected**,
  e.g. `login:${ip}:${email}` (10 per 15 minutes), `signup:${ip}` (5 per
  hour), `join-request:${ip}:${userId}` (10 per hour) - scoping by both IP
  and identifier means one abusive IP can't lock out a legitimate user
  sharing that IP (e.g. same office/NAT) from attempts against a different
  account, while still throttling repeated attempts against the same
  target.
- **`getClientIp`** reads `x-forwarded-for`'s first entry, falling back to
  `"unknown"` if absent - correct behind Hostinger's own reverse proxy in
  production, but trusts that header at face value (see costs below).
- **Wired into**: `POST /auth/login`, `POST /auth/signup`, and
  `POST /houses/join-requests` directly in this pass (each route calls
  `rateLimit` right after DTO validation, before calling the service);
  the commit message also covers resend-verification/password-reset/OTP-
  verification endpoints under the same pattern.
- **`apps/web/src/server/http.ts`** gained the `TOO_MANY_REQUESTS: 429`
  entry in the shared `HttpStatus` map, so `rateLimit`'s thrown
  `AppException` renders through the existing `withRoute`/
  `toErrorResponse` machinery with no special-casing.
- **`apps/web/next.config.ts`** added a `headers()` function (only in the
  non-static-export build config) attaching four security headers to
  every route: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and
  `Strict-Transport-Security: max-age=63072000; includeSubDomains` -
  bundled into the same commit as the rate limiting since both are
  baseline abuse/security hardening with no functional dependency on each
  other.

## Alternatives

- **Redis-backed rate limiting.** Rejected for this pass: the app runs as
  a single Node process on a single Hostinger instance (no existing
  Redis dependency anywhere in the stack per ADR 0037/0042), and adding a
  new piece of infrastructure purely to solve "count requests per
  window" is disproportionate when an in-process `Map` does the same job
  today, shippable immediately with zero new infra or ops burden.
- **A database-backed counter (a Postgres table via Prisma).** Rejected:
  every rate-limit check would cost a database round-trip (likely a
  write) on hot paths like login, adding latency and DB load for a
  feature whose entire job is to be a cheap, fast pre-check - the in-
  memory approach is strictly faster and adds zero query volume.
- **A third-party rate-limiting middleware/service (e.g. Upstash, a CDN-
  level WAF rule).** Rejected as out of scope for this pass: introduces
  an external dependency and likely a paid tier for something the app can
  approximate today with a few dozen lines, revisit only if the limits of
  the in-memory approach (below) actually get hit in practice.

## Tradeoffs

Benefits:

- Zero new infrastructure or dependencies - ships immediately, same
  deploy as everything else in this Hostinger/Next.js app.
- Effectively free at runtime: a `Map` lookup/increment per guarded
  request, no network hop, no serialization.
- Scoping keys by IP+identifier avoids the crudest false-positive
  (one shared IP locking out unrelated accounts).

Costs - what this does **not** protect against:

- **Resets on every redeploy or process restart.** The counter lives only
  in this process's memory - an attacker who gets rate-limited can simply
  wait out (or, worse, isn't even limited by) the next deploy. Since
  deploys are relatively frequent in this project's current workflow,
  the effective throttle window is bounded by deploy frequency, not just
  `windowMs`.
- **Does not work across multiple instances/processes.** If the app is
  ever horizontally scaled (multiple Hostinger instances, or any
  multi-process deployment), each instance holds its own independent
  `Map` - a request landing on instance A and another on instance B never
  see each other's counts. The real effective limit becomes
  (configured limit) × (number of instances), silently, with no error or
  warning that this has happened.
- **No protection against distributed sources.** Keys are scoped by
  client IP; an attacker spreading requests across many different IPs
  (a botnet, a residential proxy pool, or simply a distributed abuse
  campaign) gets a fresh counter per IP and is not meaningfully
  throttled at all by this mechanism. This guards against a single
  naive attacker hammering from one IP/one account, not against
  distributed abuse.
- **`x-forwarded-for` is trusted as-is.** If a request ever reaches this
  app without passing through Hostinger's proxy in the expected way, or
  if the header can be spoofed by the caller, `getClientIp` returns
  whatever value is presented - this is a correctness assumption about
  the deployment topology, not a verified, tamper-proof identity.

## Future Implications

- If the app is ever horizontally scaled (a real possibility given ADR
  0016's scaling strategy notes), this rate limiter must move to a shared
  store (Redis, or the production Postgres) before scaling out - shipping
  more instances without addressing this would silently multiply the
  effective rate limits with no warning.
- If distributed/botnet-style abuse is observed in practice, this in-
  process IP-keyed approach won't be sufficient on its own - would need a
  CDN/WAF layer or a managed abuse-detection service in front of it.
- The `rateLimit(key, limit, windowMs)` helper's shape is reusable as-is
  for any new endpoint that needs throttling - the migration path to a
  shared store only requires swapping the `Map` internals, not the call
  sites, since callers only ever see the key/limit/window contract.
- Commit: `7f27ce6`.
