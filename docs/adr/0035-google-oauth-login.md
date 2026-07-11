# 0035: Google OAuth Login

Date: 2026-07-11

Status: Accepted

## Problem

ADR 0019 deferred OAuth entirely, leaving `AuthAccount`'s
`provider`/`providerAccountId` columns unused for anything but the
`"email"` provider. The login/signup UI already rendered decorative
Google/Apple/Microsoft buttons with no `onClick` — visually present, not
functional. The request was to drop Apple/Microsoft and make Google sign-in
actually work end-to-end.

## Decision

Implement a server-side OAuth 2.0 authorization-code flow against Google's
endpoints directly via `fetch` — no `passport`/`passport-google-oauth20`/
`googleapis` dependency added, consistent with this codebase's general
minimalism and its existing use of Node's built-in `fetch` elsewhere.

- **New file `apps/api/src/auth/google-oauth.util.ts`**: pure functions to
  build the Google consent URL, exchange an auth code for tokens, and fetch
  the userinfo profile (`sub`, `email`, `email_verified`, `name`).
- **`AuthService.getGoogleAuthUrl(state)` / `handleGoogleCallback(code)`**:
  the callback looks up an existing `AuthAccount` by
  `(provider: "google", providerAccountId: sub)`; if none exists, it looks
  up a `User` by normalized email first (linking to a prior password
  signup with the same address rather than creating a duplicate user), then
  creates the `AuthAccount`. `emailVerifiedAt` is backfilled if Google
  reports the email verified and the existing user wasn't already. Reuses
  the same private `issueSessionTokens` as password login, so the returned
  shape (`{ user, accessToken, refreshToken }`) is identical either way.
- **`GET /auth/google`** redirects to Google's consent screen.
  **`GET /auth/google/callback`** exchanges the code and redirects to
  `${CORS_ORIGIN}/auth/callback?accessToken=...&refreshToken=...` on
  success, or `${CORS_ORIGIN}/login?error=google_oauth_failed` on any
  failure (missing config, denied consent, bad state, exchange failure).
  These two routes use `@Res()` for raw redirects, bypassing the app's
  usual `{ data }` envelope — there's no JSON response to envelope on a
  redirect.
- **CSRF protection via a short-lived `httpOnly` cookie**: `GET /auth/google`
  generates an opaque `state` token, passes it to Google, and also sets it
  as a 5-minute `httpOnly`/`sameSite=lax` cookie. The callback compares the
  query `state` against the cookie value and rejects on any mismatch or
  absence before exchanging the code. This needed `cookie-parser` (new
  dependency) and `app.use(cookieParser())` in `main.ts` — the only new
  runtime dependency this pass adds, and the only auth cookie the app
  sets; every other token stays in `sessionStorage`, delivered in the
  redirect URL for this one-time OAuth handoff and immediately persisted
  by the frontend.
- **Frontend**: `authSocialProviders` (`apps/web/src/components/login/auth-data.ts`)
  now lists only Google. `AuthSocialProviders` renders it as a single
  full-width `<a href="${NEXT_PUBLIC_API_URL}/auth/google">` (a real
  navigation, not a fetch, since the whole flow is redirect-based). A new
  `apps/web/src/app/auth/callback/page.tsx` reads `accessToken`/
  `refreshToken`/`error` from the query string, calls the existing
  `setSession()` and navigates to `/` on success, or back to
  `/login?error=...` on failure. No changes were needed to
  `(app)/layout.tsx` — it already detects any valid session on mount
  regardless of how it was created.

## Alternatives

- Use `passport` + `passport-google-oauth20`. Rejected: pulls in a session
  middleware model this app doesn't otherwise use, for what is a handful of
  `fetch` calls against two well-documented Google endpoints.
- Store the OAuth `state` server-side (a table or in-memory map) instead of
  a cookie. Rejected: a signed/httpOnly cookie gives the same CSRF
  guarantee (the browser that started the flow is the one completing it)
  without a new table or a cleanup job for expired entries.
- Keep Apple/Microsoft as decorative buttons. Rejected per explicit
  instruction — they were never wired to anything, and neither provider had
  a chosen client setup, so removing them is honest about what actually
  works today.

## Tradeoffs

Benefits:

- A user can sign in with a real Google account and land in a working
  session, reusing 100% of the existing session/JWT/refresh infrastructure.
- Account linking by email means someone who already signed up with a
  password and later clicks "Continue with Google" gets one account, not
  two.
- No new npm dependency for the OAuth protocol itself; only `cookie-parser`
  for the CSRF cookie, which is a 2-file, no-config addition.

Costs:

- Requires one-time manual setup in Google Cloud Console (OAuth client ID/
  secret, consent screen, authorized redirect URIs for both local dev and
  the live Render API) that only the account owner can perform — the
  feature is fully wired but inert (`google_oauth_not_configured`) until
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set.
- `access_type=online` means no Google refresh token is requested or
  stored — if Google's access token expired mid-flow that's fine (it's
  only used once, immediately, for the userinfo call), but this app could
  never re-call Google's API on the user's behalf later without asking them
  to sign in again. Acceptable since nothing else uses Google's API today.

## Future Implications

- If a "disconnect Google" or "link additional provider" account-settings
  feature is ever built, `AuthAccount` already supports it — a user can
  have both an `"email"` and a `"google"` row.
- If Apple or Microsoft sign-in is revisited, the same
  `google-oauth.util.ts` pattern (URL builder, code exchange, profile
  fetch, `AuthService` method, controller route pair) is the template to
  repeat.
