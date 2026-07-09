# 0025: Frontend/Backend Integration

Date: 2026-07-09

Status: Accepted

## Problem

ADR 0018-0024 built a complete, independently-verified backend (auth,
houses, tasks, chat, projects, clients, notifications, comments) — but
`apps/web` still ran entirely on `apps/web/src/services/base-workspace.service.ts`'s
in-memory mock. ADR 0017's frontend/backend independence model has already
been superseded (ADR 0018) for backend ownership; this pass closes the loop
by actually pointing the frontend at the real API for the flows both sides
already agree on: auth, houses, and the workspace snapshot.

## Decision

Replace `base-workspace.service.ts`'s mock implementation with real HTTP
calls, keeping every existing exported function's signature and return type
identical to the mock's, so no consuming component needed to change except
where the mock's _behavior_ (not just its shape) was being relied on.

Specific decisions:

- **A small fetch wrapper** (`apps/web/src/lib/api/client.ts`): reads
  `NEXT_PUBLIC_API_URL` (falls back to `http://localhost:4000/api/v1`),
  attaches `Authorization: Bearer <token>` when present, unwraps the
  `{ "data": ... }` / `{ "error": ... }` envelope from ADR 0010, and clears
  the stored session on any `401`.
- **Tokens live in `sessionStorage`**, not cookies. `apps/web/src/lib/session.ts`
  was already using `sessionStorage` for a mock "is logged in" flag; this
  pass extends it to hold the real access/refresh token pair
  (`getAccessToken`/`getRefreshToken`/`setSession`/`clearSession`/
  `hasSession`). Matches ADR 0019's own token-delivery decision (body, not
  cookies) — nothing here forecloses moving to httpOnly cookies later.
- **`login()`/`signup()` internally call `GET /workspace` after
  authenticating**, so they can keep returning a full `WorkspaceSnapshot`
  (their existing mock return type) even though the real
  `POST /auth/login`/`POST /auth/signup` only return
  `{ user, accessToken, refreshToken }`. Callers (the login and signup
  pages) didn't need to change.
- **Active house id is cached in a module-level variable** in
  `base-workspace.service.ts`, refreshed by every call that returns a
  `WorkspaceSnapshot` or `House`. `createTask` reads it to supply the
  `houseId` the real `POST /api/v1/tasks` contract requires (ADR 0021)
  but the mock's `CreateTaskRequest` type never had — avoids threading
  `houseId` through every task-creating call site for a value the UI
  already effectively treats as ambient/global (one active house at a
  time, no house-switcher yet).
- **Real signup UI, not just login.** `apps/web/src/components/signup/signup-page.tsx`
  already existed as a fully-built form (name/email/password/confirm) but
  only showed a "not open yet" placeholder notice on submit. Wired to the
  real `POST /api/v1/auth/signup` instead — without it, the real backend's
  "no account exists yet" reality would have made the login page a dead
  end for anyone without a pre-seeded row.
- **Real house-creation/join inputs, not hardcoded demo values.**
  `NoHouseOnboarding`/`HouseChoiceCard` previously called `createHouse`/
  `joinHouse` with hardcoded demo values (`"Nova Frame House"`, invite code
  `"NOVA-2048"`) — harmless against the mock (which accepted anything), but
  against the real backend this meant the handle could only ever be
  claimed once (`409 handle_unavailable` every time after) and the join
  code would essentially never match a real house's randomly-generated
  code. `HouseChoiceCard` now has real `name`/`handle`/`description` and
  `inviteCode` input forms.
- **Added a working logout.** `SidebarUserFooter` was a purely decorative
  button with no dropdown at all. Since a real session now exists to log
  out _of_, it gained a real dropdown (Settings link + destructive "Log
  out" item) that calls the service's `logout()` (clears the session) and
  redirects to `/login`.
- **Silent refresh-on-401 in the fetch wrapper itself**, not per-caller.
  `apiRequest` retries a `401` exactly once: it calls
  `POST /api/v1/auth/refresh` with the stored refresh token, stores the
  new token pair on success, and retries the original request; concurrent
  401s dedupe onto a single in-flight refresh (a module-level promise) so
  several widgets fetching in parallel don't each fire their own refresh
  call. Only clears the session and surfaces the error if refresh itself
  fails (no refresh token, or the refresh token is also invalid/expired/
  revoked). Verified live: corrupting a stored access token and reloading
  produced `GET /workspace` `401` -> `POST /auth/refresh` `200` -> retried
  `GET /workspace` `200`, with the user staying on the dashboard.
- **Built real forgot/reset-password screens**, not just left the login
  page's "Forgot password?" link dead. `apps/web/src/app/forgot-password`
  and `apps/web/src/app/reset-password` call the already-live
  `POST /api/v1/auth/request-password-reset` /
  `POST /api/v1/auth/reset-password` endpoints (ADR 0019). The forgot-
  password screen shows a deliberately non-committal success message
  ("If an account exists...") matching the backend's no-enumeration design,
  and links to the reset screen for pasting a code. The reset screen reads
  an optional `?token=` query param (so a real emailed link would work once
  email delivery exists) with a manual-paste fallback for now, since ADR
  0019 only logs the token server-side. Verified live end-to-end: requested
  a reset, pulled the real token from the API server log, submitted it with
  a new password, got redirected to `/login`, and logged in with the new
  password successfully.
- **Everything else stays on local/mock data.** Pages built independently
  of `base-workspace.service.ts` (`/tasks`, `/crews`, `/files`,
  `/storyboard`, `/calendar`, `/bookings`, `/analytics`, `/settings`, the
  dashboard's "Recent Projects"/"Recent Activity" panels) were never wired
  to the shared workspace context to begin with — each owns its own
  colocated `*-data.ts` mock file. Connecting them would mean designing and
  building entirely new backend modules (crews, files, storyboards,
  bookings, analytics) that don't exist yet — out of scope for "wire up
  what already agrees on a contract." The home dashboard's "My Tasks"
  panel is the one exception that already read `workspace.tasks` from the
  shared context, so it now shows real tasks automatically.

## Alternatives

- Keep the mock and add a feature flag to switch to the real API.
  Rejected: no third environment (staging, etc.) exists yet to make a flag
  meaningful; a clean swap is simpler and the mock's code is preserved in
  git history if ever needed as a reference.
- Store tokens in httpOnly cookies from the start. Rejected: requires
  either a Next.js API route/middleware layer to proxy requests (since the
  browser can't attach an httpOnly cookie's value to an `Authorization`
  header itself) or same-site cookie configuration between two dev ports
  (3000/4000) — meaningfully more infrastructure than this pass needs,
  and ADR 0019 already deferred this exact choice for the same reason.
- Thread `houseId` explicitly through `CreateTaskRequest` instead of an
  ambient cached value. Rejected: every current call site has exactly one
  active house in scope; adding a required field the UI would just fill in
  from the same context anyway is complexity without benefit until a
  house-switcher makes "which house" a real per-call question.

## Tradeoffs

Benefits:

- The app is now a real, working full-stack product for its core loop:
  signup, login, logout, house creation, house joining — not a UI shell
  over fake data.
- Zero consuming-component changes needed for `getWorkspace`, `createHouse`,
  `joinHouse`, `sendChatMessage` — the mock's type contract discipline
  (ADR 0017) paid for itself here.
- Error messages surfaced by the real backend (`"Invalid email or
password."`, `"This handle is already taken."`) now reach the UI
  unchanged, verified live in-browser.

Costs:

- Most of the app's other pages (tasks, crews, files, storyboard, calendar,
  bookings, analytics, settings) still run on independent local mock data
  and are NOT talking to the real backend — this pass does not change
  that, and it would be a mistake to assume the whole app is "real" now.
- No email-verification UI wired up yet (`POST /api/v1/auth/verify-email`
  is live per ADR 0019, but no frontend screen calls it - lower priority
  since nothing currently gates on `emailVerifiedAt`).
- Refresh happens reactively (on a `401`), not proactively before expiry —
  the request that triggers refresh still fails its first attempt and
  waits for the retry, an extra round trip rather than a seamless renewal
  a background timer would give. Acceptable for a 15-minute access-token
  TTL; would need revisiting if the TTL were much shorter or latency-
  sensitive.

## Future Implications

- Wiring any other page to real data requires two things in order: a real
  backend module for that domain (most don't exist yet), then swapping
  that page's local mock data source the same way this pass swapped
  `base-workspace.service.ts` - the pattern established here (keep the
  type contract, swap the implementation) is the template to repeat.
- An email-verification screen should call the already-live
  `POST /api/v1/auth/verify-email` whenever it gets built, following the
  same pattern as forgot/reset-password.
- Once a real email provider is chosen (ADR 0019's remaining open choice),
  the forgot/reset-password screens don't need to change - the reset
  screen already supports a `?token=` deep link, it's just unused until
  emails actually go out.
